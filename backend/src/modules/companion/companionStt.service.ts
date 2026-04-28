import fs from 'fs';
import os from 'os';
import path from 'path';
import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import type { Language } from '../../types/common';
import type { SttTranscriptionResponse } from './companion.types';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

function fileExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) return 'm4a';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export const companionSttService = {
  async transcribeAudio(audioBuffer: Buffer, mimeType: string, language: Language = 'en'): Promise<SttTranscriptionResponse> {
    const startedAt = Date.now();
    const extension = fileExtensionFromMimeType(mimeType.toLowerCase());
    const tempPath = path.join(os.tmpdir(), `saya-stt-${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`);

    try {
      fs.writeFileSync(tempPath, audioBuffer);

      const transcription = await (groq.audio.transcriptions.create as any)({
        file: fs.createReadStream(tempPath),
        model: 'whisper-large-v3',
        language: language === 'hi' ? 'hi' : 'en',
        response_format: 'json'
      }).catch((error: unknown) => {
        throw ApiError.badGateway(
          `Groq transcription failed: ${error instanceof Error ? error.message : String(error)}`,
          undefined,
          'GROQ_STT_PROVIDER_ERROR'
        );
      });

      const transcript = typeof transcription?.text === 'string' ? transcription.text.trim() : '';
      if (!transcript) {
        throw ApiError.badGateway('Groq STT returned empty transcript', undefined, 'GROQ_STT_EMPTY_TRANSCRIPT');
      }

      return {
        transcript,
        language,
        provider: 'groq-whisper',
        duration_ms: Date.now() - startedAt
      };
    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
};

