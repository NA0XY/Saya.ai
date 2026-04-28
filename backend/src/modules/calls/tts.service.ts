import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import type { Language } from '../../types/common';
import type { TtsRequest } from './call.types';

const polly = new AWS.Polly({ accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY, region: env.AWS_REGION });

export const ttsService = {
  async synthesizeSpeech(request: TtsRequest): Promise<Buffer> {
    try {
      const voice = request.voice ?? (request.language === 'hi' ? 'Aditi' : 'Raveena');
      const safeText = request.text.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char);
      const response = await withTimeout(
        polly.synthesizeSpeech({ OutputFormat: 'mp3', Text: `<speak>${safeText}</speak>`, TextType: 'ssml', VoiceId: voice }).promise(),
        env.POLLY_TIMEOUT_MS,
        'POLLY_TIMEOUT',
        'Amazon Polly request timed out'
      );
      if (!response.AudioStream) throw ApiError.badGateway('Amazon Polly returned no audio', undefined, 'POLLY_EMPTY_AUDIO');
      return Buffer.isBuffer(response.AudioStream) ? response.AudioStream : Buffer.from(response.AudioStream as Uint8Array);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.badGateway('Amazon Polly request failed', { error: error instanceof Error ? error.message : String(error) }, 'POLLY_PROVIDER_ERROR');
    }
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
