import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import { logger } from '../../config/logger';
import type { Language } from '../../types/common';
import type { TtsRequest } from './call.types';

export const ttsService = {
  async synthesizeSpeech(request: TtsRequest): Promise<Buffer> {
    if (!env.AWS_ACCESS_KEY_ID) {
      logger.warn('[TTS] AWS credentials not configured, returning silence stub');
      return Buffer.alloc(0);
    }
    throw ApiError.badGateway('AWS Polly integration has been removed. TTS service is unavailable.', undefined, 'TTS_UNAVAILABLE');
  },
  async synthesizeToUrl(text: string, language: Language, scheduleId: string): Promise<string> {
    const dir = path.resolve(process.cwd(), env.UPLOAD_DIR, 'tts');
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${scheduleId}.mp3`;
    const audio = await this.synthesizeSpeech({ text, language });
    fs.writeFileSync(path.join(dir, filename), audio);
    return `${env.BACKEND_URL}/uploads/tts/${filename}`;
  }
};
