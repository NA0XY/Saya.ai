import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { spawn } from 'child_process';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import type { Language, SentimentTag } from '../../types/common';
import type { CompanionTone, VoiceSpeed, TtsStreamRequest, TtsStreamResult } from './companion.types';

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleSynthesizeResponse {
  audioContent?: string;
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

let cachedToken: { token: string; expiresAtMs: number } | null = null;
let cachedCredentials: GoogleServiceAccount | null = null;

function resolveOptionalPath(rawPath?: string): string | null {
  if (!rawPath) return null;
  const trimmed = rawPath.trim();
  if (!trimmed) return null;
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
}

function resolveCredentialsPath(): string {
  const configuredPath = env.GOOGLE_APPLICATION_CREDENTIALS;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);
}

function readServiceAccount(): GoogleServiceAccount {
  if (cachedCredentials) return cachedCredentials;

  const credentialsPath = resolveCredentialsPath();
  if (!fs.existsSync(credentialsPath)) {
    throw ApiError.internal(`Google credentials file not found at ${credentialsPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8')) as Partial<GoogleServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) {
    throw ApiError.internal('Invalid Google service account credentials: missing client_email/private_key');
  }

  cachedCredentials = {
    client_email: parsed.client_email,
    private_key: parsed.private_key,
    token_uri: parsed.token_uri,
  };
  return cachedCredentials;
}

async function getGoogleAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 30_000) {
    return cachedToken.token;
  }

  const credentials = readServiceAccount();
  const iat = Math.floor(now / 1000);
  const exp = iat + 3600;

  const assertion = jwt.sign(
    {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: credentials.token_uri ?? GOOGLE_TOKEN_URL,
      iat,
      exp,
    },
    credentials.private_key,
    { algorithm: 'RS256' }
  );

  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await axios.post<GoogleTokenResponse>(GOOGLE_TOKEN_URL, form.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: env.POLLY_TIMEOUT_MS,
  }).catch((error: unknown) => {
    throw ApiError.badGateway(
      `Failed to get Google TTS access token: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      'GOOGLE_TTS_TOKEN_ERROR'
    );
  });

  cachedToken = {
    token: response.data.access_token,
    expiresAtMs: now + response.data.expires_in * 1000,
  };

  return cachedToken.token;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveVoiceConfig(
  language: Language,
  sentiment: SentimentTag,
  tone: CompanionTone,
  voiceSpeed: VoiceSpeed
): { languageCode: string; speakingRate: number; pitch: number } {
  const languageCode = language === 'hi' ? 'hi-IN' : 'en-IN';

  const speedMap: Record<VoiceSpeed, number> = {
    slow: 0.88,
    medium: 1.0,
    fast: 1.12,
  };

  const toneRateAdjust: Record<CompanionTone, number> = {
    warm: 0,
    formal: -0.04,
    playful: 0.03,
  };

  const sentimentPitch: Record<SentimentTag, number> = {
    joy: 2.2,
    neutral: 0,
    anxiety: 1.2,
    sadness: -2.4,
  };

  const sentimentRateAdjust: Record<SentimentTag, number> = {
    joy: 0.06,
    neutral: 0,
    anxiety: 0.03,
    sadness: -0.06,
  };

  const speakingRate = clamp(
    speedMap[voiceSpeed] + toneRateAdjust[tone] + sentimentRateAdjust[sentiment],
    0.75,
    1.25
  );

  const pitch = clamp(sentimentPitch[sentiment], -8, 8);
  return { languageCode, speakingRate, pitch };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolvePiperLengthScale(
  sentiment: SentimentTag,
  tone: CompanionTone,
  voiceSpeed: VoiceSpeed
): number {
  const speedMap: Record<VoiceSpeed, number> = {
    slow: 1.18,
    medium: 1.0,
    fast: 0.86,
  };
  const toneAdjust: Record<CompanionTone, number> = {
    warm: 0.02,
    formal: 0.08,
    playful: -0.06,
  };
  const sentimentAdjust: Record<SentimentTag, number> = {
    joy: -0.04,
    neutral: 0,
    anxiety: -0.02,
    sadness: 0.12,
  };
  return clamp(speedMap[voiceSpeed] + toneAdjust[tone] + sentimentAdjust[sentiment], 0.72, 1.4);
}

function getPiperModelPath(language: Language): string | null {
  const envByLanguage = language === 'hi' ? process.env.PIPER_MODEL_HI_PATH : process.env.PIPER_MODEL_EN_PATH;
  const fallback = process.env.PIPER_MODEL_PATH;
  return resolveOptionalPath(envByLanguage ?? fallback);
}

async function synthesizeWithPiperHttp(request: TtsStreamRequest): Promise<TtsStreamResult> {
  const endpoint = process.env.PIPER_TTS_URL?.trim();
  if (!endpoint) throw ApiError.badRequest('PIPER_TTS_URL is not configured');

  const response = await axios.post<ArrayBuffer>(
    endpoint,
    {
      text: request.text,
      language: request.language ?? 'en',
      sentiment: request.sentiment ?? 'neutral',
      tone: request.tone ?? 'warm',
      voiceSpeed: request.voiceSpeed ?? 'medium',
    },
    {
      responseType: 'arraybuffer',
      timeout: env.POLLY_TIMEOUT_MS,
      headers: {
        Accept: 'audio/wav,audio/mpeg,audio/*,*/*',
      },
    }
  ).catch((error: unknown) => {
    throw ApiError.badGateway(
      `Piper HTTP synthesis failed: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      'PIPER_HTTP_SYNTHESIS_ERROR'
    );
  });

  const contentType = (response.headers['content-type'] ?? 'audio/wav').toString().toLowerCase().includes('mpeg')
    ? 'audio/mpeg'
    : 'audio/wav';

  return {
    audio: Buffer.from(response.data),
    contentType,
    provider: 'piper-http',
  };
}

async function synthesizeWithPiperCli(request: TtsStreamRequest): Promise<TtsStreamResult> {
  const binaryPath = resolveOptionalPath(process.env.PIPER_BINARY_PATH);
  if (!binaryPath) throw ApiError.badRequest('PIPER_BINARY_PATH is not configured');
  if (!fs.existsSync(binaryPath)) {
    throw ApiError.internal(`Piper binary not found at ${binaryPath}`);
  }

  const language = request.language ?? 'en';
  const modelPath = getPiperModelPath(language);
  if (!modelPath) {
    throw ApiError.badRequest(`Piper model path not configured for language ${language}`);
  }
  if (!fs.existsSync(modelPath)) {
    throw ApiError.internal(`Piper model file not found at ${modelPath}`);
  }

  const configPath = resolveOptionalPath(
    language === 'hi' ? process.env.PIPER_CONFIG_HI_PATH : process.env.PIPER_CONFIG_EN_PATH
  ) ?? resolveOptionalPath(process.env.PIPER_CONFIG_PATH);

  if (configPath && !fs.existsSync(configPath)) {
    throw ApiError.internal(`Piper config file not found at ${configPath}`);
  }

  const outputPath = path.join(os.tmpdir(), `saya-piper-${Date.now()}-${Math.random().toString(16).slice(2)}.wav`);
  const sentiment = request.sentiment ?? 'neutral';
  const tone = request.tone ?? 'warm';
  const voiceSpeed = request.voiceSpeed ?? 'medium';
  const lengthScale = resolvePiperLengthScale(sentiment, tone, voiceSpeed);

  const args = [
    '--model', modelPath,
    '--output_file', outputPath,
    '--length_scale', lengthScale.toFixed(2),
  ];
  if (configPath) {
    args.push('--config', configPath);
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(binaryPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', (error) => {
      reject(ApiError.badGateway(`Failed to launch Piper binary: ${error.message}`, undefined, 'PIPER_LAUNCH_ERROR'));
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          ApiError.badGateway(
            `Piper synthesis failed with exit code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
            undefined,
            'PIPER_CLI_SYNTHESIS_ERROR'
          )
        );
      }
    });

    proc.stdin.write(`${request.text.trim()}\n`);
    proc.stdin.end();
  });

  const audio = fs.readFileSync(outputPath);
  fs.unlinkSync(outputPath);
  return {
    audio,
    contentType: 'audio/wav',
    provider: 'piper-cli',
  };
}

export const companionTtsService = {
  async synthesizeSpeech(request: TtsStreamRequest): Promise<TtsStreamResult> {
    const trimmedText = request.text.trim();
    if (!trimmedText) throw ApiError.badRequest('TTS text cannot be empty');
    const effectiveRequest = { ...request, text: trimmedText };

    const ttsProvider = (process.env.COMPANION_TTS_PROVIDER ?? '').trim().toLowerCase();
    const prefersPiper = ttsProvider === 'piper' || Boolean(process.env.PIPER_TTS_URL || process.env.PIPER_BINARY_PATH);

    if (prefersPiper) {
      const canUsePiperHttp = Boolean(process.env.PIPER_TTS_URL?.trim());
      const canUsePiperCli = Boolean(process.env.PIPER_BINARY_PATH?.trim());

      if (canUsePiperHttp) {
        try {
          const result = await synthesizeWithPiperHttp(effectiveRequest);
          logger.info('[COMPANION_TTS] Piper HTTP synthesized speech', {
            provider: result.provider,
            contentType: result.contentType,
            bytes: result.audio.length,
          });
          return result;
        } catch (error) {
          if (!canUsePiperCli) throw error;
          logger.warn('[COMPANION_TTS] Piper HTTP failed, trying Piper CLI fallback', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (canUsePiperCli) {
        const result = await synthesizeWithPiperCli(effectiveRequest);
        logger.info('[COMPANION_TTS] Piper CLI synthesized speech', {
          provider: result.provider,
          contentType: result.contentType,
          bytes: result.audio.length,
        });
        return result;
      }
    }

    const language = effectiveRequest.language ?? 'en';
    const sentiment = effectiveRequest.sentiment ?? 'neutral';
    const tone = effectiveRequest.tone ?? 'warm';
    const voiceSpeed = effectiveRequest.voiceSpeed ?? 'medium';
    const voiceConfig = resolveVoiceConfig(language, sentiment, tone, voiceSpeed);
    const token = await getGoogleAccessToken();
    const safeText = escapeXml(trimmedText.slice(0, 1500));
    const ssml = `<speak><prosody rate="${Math.round(voiceConfig.speakingRate * 100)}%" pitch="${voiceConfig.pitch.toFixed(1)}st">${safeText}</prosody></speak>`;

    const response = await axios.post<GoogleSynthesizeResponse>(
      GOOGLE_TTS_URL,
      {
        input: { ssml },
        voice: {
          languageCode: voiceConfig.languageCode,
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: voiceConfig.speakingRate,
          pitch: voiceConfig.pitch,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: env.POLLY_TIMEOUT_MS,
      }
    ).catch((error: unknown) => {
      throw ApiError.badGateway(
        `Google TTS synthesis failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'GOOGLE_TTS_SYNTHESIS_ERROR'
      );
    });

    const audioContent = response.data.audioContent;
    if (!audioContent) {
      throw ApiError.badGateway('Google TTS returned empty audio payload', undefined, 'GOOGLE_TTS_EMPTY_AUDIO');
    }

    const audioBuffer = Buffer.from(audioContent, 'base64');
    logger.info('[COMPANION_TTS] Synthesized speech', {
      provider: 'google',
      language,
      sentiment,
      tone,
      voiceSpeed,
      textLength: trimmedText.length,
      audioBytes: audioBuffer.length,
    });
    return {
      audio: audioBuffer,
      contentType: 'audio/mpeg',
      provider: 'google',
    };
  },
};
