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

function getPiperHttpEndpoint(language: Language): string | null {
  const langSpecific = language === 'hi' ? process.env.PIPER_TTS_URL_HI : process.env.PIPER_TTS_URL_EN;
  const fallback = process.env.PIPER_TTS_URL;
  const endpoint = (langSpecific ?? fallback ?? '').trim();
  return endpoint || null;
}

function prependWavSilence(audio: Buffer, silenceMs = 120): Buffer {
  if (audio.length < 44 || audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE') {
    return audio;
  }

  let offset = 12;
  let fmtOffset = -1;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= audio.length) {
    const chunkId = audio.toString('ascii', offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;
    if (chunkId === 'fmt ') fmtOffset = chunkDataStart;
    if (chunkId === 'data') {
      dataOffset = chunkDataStart;
      dataSize = chunkSize;
      break;
    }
    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (fmtOffset < 0 || dataOffset < 0 || fmtOffset + 16 > audio.length) return audio;
  const channels = audio.readUInt16LE(fmtOffset + 2);
  const sampleRate = audio.readUInt32LE(fmtOffset + 4);
  const bitsPerSample = audio.readUInt16LE(fmtOffset + 14);
  const bytesPerSample = Math.max(1, bitsPerSample / 8);
  const silenceBytes = Math.max(0, Math.round((sampleRate * channels * bytesPerSample * silenceMs) / 1000));
  if (silenceBytes <= 0) return audio;

  const silenceBuffer = Buffer.alloc(silenceBytes, 0);
  const dataStart = dataOffset;
  const dataEnd = Math.min(dataStart + dataSize, audio.length);
  const beforeData = audio.subarray(0, dataStart);
  const afterData = audio.subarray(dataStart, dataEnd);
  const tail = audio.subarray(dataEnd);
  const combined = Buffer.concat([beforeData, silenceBuffer, afterData, tail]);

  // Update RIFF chunk size and data chunk size headers.
  combined.writeUInt32LE(combined.length - 8, 4);
  const dataSizeOffset = dataOffset - 4;
  combined.writeUInt32LE(dataSize + silenceBytes, dataSizeOffset);
  return combined;
}

function splitIntoSentenceChunks(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const chunks = normalized
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  if (chunks.length > 0) return chunks;
  return [normalized];
}

type WavPcmMeta = {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  audioFormat: number;
  data: Buffer;
};

function parsePcmWav(audio: Buffer): WavPcmMeta {
  if (audio.length < 44 || audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE') {
    throw ApiError.badGateway('Piper CLI returned a non-WAV audio payload', undefined, 'PIPER_CLI_INVALID_WAV');
  }

  let offset = 12;
  let fmtOffset = -1;
  let fmtSize = 0;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= audio.length) {
    const chunkId = audio.toString('ascii', offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkId === 'fmt ') {
      fmtOffset = chunkDataStart;
      fmtSize = chunkSize;
    } else if (chunkId === 'data') {
      dataOffset = chunkDataStart;
      dataSize = chunkSize;
      break;
    }

    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (fmtOffset < 0 || fmtSize < 16 || dataOffset < 0) {
    throw ApiError.badGateway('Piper CLI WAV payload is missing required chunks', undefined, 'PIPER_CLI_INVALID_WAV');
  }

  const audioFormat = audio.readUInt16LE(fmtOffset);
  const channels = audio.readUInt16LE(fmtOffset + 2);
  const sampleRate = audio.readUInt32LE(fmtOffset + 4);
  const bitsPerSample = audio.readUInt16LE(fmtOffset + 14);
  const dataEnd = Math.min(dataOffset + dataSize, audio.length);
  const data = audio.subarray(dataOffset, dataEnd);

  return { channels, sampleRate, bitsPerSample, audioFormat, data };
}

function buildPcmWavBuffer(chunks: WavPcmMeta[]): Buffer {
  if (!chunks.length) {
    throw ApiError.badGateway('No Piper CLI audio chunks to stitch', undefined, 'PIPER_CLI_EMPTY_AUDIO');
  }
  const base = chunks[0];
  if (base.audioFormat !== 1) {
    throw ApiError.badGateway('Piper CLI output is not PCM WAV', undefined, 'PIPER_CLI_UNSUPPORTED_WAV');
  }

  for (let i = 1; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    if (
      chunk.audioFormat !== base.audioFormat ||
      chunk.channels !== base.channels ||
      chunk.sampleRate !== base.sampleRate ||
      chunk.bitsPerSample !== base.bitsPerSample
    ) {
      throw ApiError.badGateway(
        'Piper CLI audio chunks have incompatible WAV formats',
        undefined,
        'PIPER_CLI_WAV_MISMATCH'
      );
    }
  }

  const bytesPerSample = base.bitsPerSample / 8;
  const blockAlign = base.channels * bytesPerSample;
  const byteRate = base.sampleRate * blockAlign;
  const totalDataSize = chunks.reduce((sum, chunk) => sum + chunk.data.length, 0);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + totalDataSize, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(base.audioFormat, 20);
  header.writeUInt16LE(base.channels, 22);
  header.writeUInt32LE(base.sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(base.bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(totalDataSize, 40);

  return Buffer.concat([header, ...chunks.map((chunk) => chunk.data)], 44 + totalDataSize);
}

async function synthesizeWithPiperHttp(request: TtsStreamRequest): Promise<TtsStreamResult> {
  const language = request.language ?? 'en';
  const endpoint = getPiperHttpEndpoint(language);
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

  const rawAudio = Buffer.from(response.data);
  const audio = contentType === 'audio/wav' ? prependWavSilence(rawAudio, 120) : rawAudio;

  return {
    audio,
    contentType,
    provider: 'piper-http',
  };
}

async function synthesizePiperCliChunk(
  request: TtsStreamRequest,
  textChunk: string,
  outputPath: string
): Promise<Buffer> {
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

    proc.stdin.write(`${textChunk}\n`);
    proc.stdin.end();
  });

  const audio = fs.readFileSync(outputPath);
  fs.unlinkSync(outputPath);
  return audio;
}

async function synthesizeWithPiperCli(request: TtsStreamRequest): Promise<TtsStreamResult> {
  const chunks = splitIntoSentenceChunks(request.text);
  if (chunks.length === 0) throw ApiError.badRequest('TTS text cannot be empty');

  const wavChunks: WavPcmMeta[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const chunkText = chunks[index];
    const outputPath = path.join(
      os.tmpdir(),
      `saya-piper-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}.wav`
    );
    const wav = await synthesizePiperCliChunk(request, chunkText, outputPath);
    wavChunks.push(parsePcmWav(wav));
  }

  const stitched = buildPcmWavBuffer(wavChunks);
  const audio = prependWavSilence(stitched, 120);
  return {
    audio,
    contentType: 'audio/wav',
    provider: 'piper-cli',
  };
}

export const companionTtsService = {
  checkProviderHealth(): void {
    if ((env.COMPANION_TTS_PROVIDER ?? '').toLowerCase() !== 'piper') return;

    const binaryPath = resolveOptionalPath(env.PIPER_BINARY_PATH);
    const modelPath = resolveOptionalPath(env.PIPER_MODEL_EN_PATH || process.env.PIPER_MODEL_PATH);
    const configPath = resolveOptionalPath(env.PIPER_CONFIG_EN_PATH || process.env.PIPER_CONFIG_PATH);
    const missing: string[] = [];
    if (!binaryPath) missing.push('PIPER_BINARY_PATH is not configured');
    if (!modelPath) missing.push('PIPER_MODEL_EN_PATH is not configured');
    if (binaryPath && !fs.existsSync(binaryPath)) missing.push(`Piper binary not found at ${binaryPath}`);
    if (modelPath && !fs.existsSync(modelPath)) missing.push(`Piper model not found at ${modelPath}`);
    if (configPath && !fs.existsSync(configPath)) missing.push(`Piper config not found at ${configPath}`);
    if (missing.length > 0) {
      logger.warn('[COMPANION_TTS] Piper CLI health check warnings', { missing });
    }
  },

  async synthesizeSpeech(request: TtsStreamRequest): Promise<TtsStreamResult> {
    const trimmedText = request.text.trim();
    if (!trimmedText) throw ApiError.badRequest('TTS text cannot be empty');
    const effectiveRequest = { ...request, text: trimmedText };

    const ttsProvider = (env.COMPANION_TTS_PROVIDER ?? '').trim().toLowerCase();
    const prefersPiper = ttsProvider === 'piper' || Boolean(process.env.PIPER_TTS_URL || process.env.PIPER_BINARY_PATH);

    if (prefersPiper) {
      const language = effectiveRequest.language ?? 'en';
      const canUsePiperCli = Boolean(env.PIPER_BINARY_PATH?.trim());
      const piperHttpDebugEnabled = env.PIPER_HTTP_DEBUG_ENABLED.toLowerCase() === 'true';
      const canUsePiperHttp = piperHttpDebugEnabled && Boolean(getPiperHttpEndpoint(language));
      let lastPiperError: unknown = null;

      if (canUsePiperCli) {
        try {
          const result = await synthesizeWithPiperCli(effectiveRequest);
          logger.info('[COMPANION_TTS] Piper CLI synthesized speech', {
            provider: result.provider,
            contentType: result.contentType,
            bytes: result.audio.length,
          });
          return result;
        } catch (error) {
          lastPiperError = error;
          logger.warn('[COMPANION_TTS] Piper CLI failed', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

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
          lastPiperError = error;
          logger.warn('[COMPANION_TTS] Piper CLI failed', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Enforce fallback order:
      // Piper CLI -> Browser TTS (frontend fallback) -> Google TTS.
      // Piper HTTP is debug-only and never required in production flow.
      // Throw here so frontend can trigger browser speech before Google is attempted.
      throw ApiError.badGateway(
        `Piper TTS unavailable: ${
          lastPiperError instanceof Error ? lastPiperError.message : 'No Piper backend reachable'
        }`,
        undefined,
        'PIPER_TTS_UNAVAILABLE'
      );
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
