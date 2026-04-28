import fs from 'fs';
import os from 'os';
import path from 'path';
import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import type { Language } from '../../types/common';
import type { SttTranscriptionResponse } from './companion.types';
import { localSttClientService } from './localSttClient.service';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const FILLER_WORDS = new Set(['uh', 'um', 'hmm', 'huh', 'ah', 'er']);

function fileExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

function normalizeTranscript(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/([,.!?])\1+/g, '$1')
    .replace(/\b(\w+)(\s+\1\b){1,}/gi, '$1')
    .trim();
}

function estimateAudioDurationMs(audioBufferSizeBytes: number): number {
  const estimatedBytesPerSecond = 4000;
  return Math.max(0, Math.round((audioBufferSizeBytes / estimatedBytesPerSecond) * 1000));
}

function transcriptQualityScore(transcript: string, audioMs?: number): number {
  if (!transcript) return 0;
  const words = transcript.split(/\s+/).filter(Boolean);

  let score = 0.5;
  if (words.length >= 2) score += 0.1;
  if (words.length >= 5) score += 0.08;
  if (/[.?!,]/.test(transcript)) score += 0.05;
  if (/\b(\w+)\s+\1\s+\1\b/i.test(transcript)) score -= 0.3;
  if (words.length < 3 && words.every((word) => FILLER_WORDS.has(word.toLowerCase()))) score -= 0.35;
  if (/thanks for watching|subscribe|captions by|amara\.org/i.test(transcript)) score -= 0.4;
  if (audioMs && audioMs > 4500 && words.length <= 2) score -= 0.2;

  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

function normalizeOutput(
  transcript: string,
  language: Language,
  sttMs: number,
  audioMs: number | undefined,
  engine: 'groq-whisper' | 'local-faster-whisper',
  confidenceOverride?: number,
  qualityOverride?: number
): SttTranscriptionResponse {
  const normalizedTranscript = normalizeTranscript(transcript);
  const qualityScore =
    typeof qualityOverride === 'number' && Number.isFinite(qualityOverride)
      ? Math.max(0, Math.min(1, qualityOverride))
      : transcriptQualityScore(normalizedTranscript, audioMs);
  const confidenceProxy =
    typeof confidenceOverride === 'number' && Number.isFinite(confidenceOverride)
      ? Math.max(0, Math.min(1, confidenceOverride))
      : Math.max(0, Math.min(1, Number((qualityScore * 0.88 + 0.12).toFixed(3))));
  return {
    transcript: normalizedTranscript,
    language,
    engine,
    stt_ms: sttMs,
    audio_ms: audioMs,
    confidence_proxy: confidenceProxy,
    quality_score: qualityScore
  };
}

async function transcribeWithGroq(
  audioBuffer: Buffer,
  mimeType: string,
  language: Language,
  captureDurationMs?: number
): Promise<SttTranscriptionResponse> {
  const startedAt = Date.now();
  const extension = fileExtensionFromMimeType(mimeType.toLowerCase());
  const tempPath = path.join(os.tmpdir(), `saya-stt-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`);
  try {
    fs.writeFileSync(tempPath, audioBuffer);
    const transcription = await (groq.audio.transcriptions.create as any)({
      file: fs.createReadStream(tempPath),
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'json',
      temperature: 0,
      prompt:
        'Transcribe exact spoken words in Indian English. Domain terms may include medicine names, family member names, food items, and routine details. Do not add words not spoken.'
    }).catch((error: unknown) => {
      throw ApiError.badGateway(
        `Groq transcription failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'GROQ_STT_PROVIDER_ERROR'
      );
    });

    const transcript = typeof transcription?.text === 'string' ? transcription.text : '';
    if (!normalizeTranscript(transcript)) {
      throw ApiError.badGateway('Groq STT returned empty transcript', undefined, 'GROQ_STT_EMPTY_TRANSCRIPT');
    }

    const audioMs = captureDurationMs ?? estimateAudioDurationMs(audioBuffer.length);
    return normalizeOutput(transcript, language, Date.now() - startedAt, audioMs, 'groq-whisper');
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

async function transcribeWithLocalService(
  audioBuffer: Buffer,
  mimeType: string,
  language: Language,
  captureDurationMs?: number
): Promise<SttTranscriptionResponse> {
  const startedAt = Date.now();
  const local = await localSttClientService.transcribe(audioBuffer, mimeType, language, captureDurationMs);
  const audioMs = local.audio_ms ?? captureDurationMs ?? estimateAudioDurationMs(audioBuffer.length);
  return normalizeOutput(
    local.transcript,
    language,
    local.stt_ms ?? Date.now() - startedAt,
    audioMs,
    'local-faster-whisper',
    local.confidence_proxy,
    local.quality_score
  );
}

export const companionSttService = {
  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    language: Language = 'en',
    captureDurationMs?: number
  ): Promise<SttTranscriptionResponse> {
    const provider = env.COMPANION_STT_PROVIDER;
    if (provider === 'local_faster_whisper') {
      return transcribeWithLocalService(audioBuffer, mimeType, language, captureDurationMs);
    }
    return transcribeWithGroq(audioBuffer, mimeType, language, captureDurationMs);
  },

  async checkProviderHealth(): Promise<void> {
    if (env.COMPANION_STT_PROVIDER === 'local_faster_whisper') {
      await localSttClientService.pingHealth();
    }
  }
};

