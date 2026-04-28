import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import type { Language } from '../../types/common';

type LocalSttResponse = {
  transcript: string;
  language?: string;
  stt_ms?: number;
  audio_ms?: number;
  confidence_proxy?: number;
  quality_score?: number;
  engine?: string;
};

async function parseErrorMessage(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  if (!body) return `Local STT request failed with ${response.status}`;
  try {
    const parsed = JSON.parse(body) as { error?: string; message?: string };
    return parsed.error ?? parsed.message ?? body;
  } catch {
    return body;
  }
}

export const localSttClientService = {
  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    language: Language = 'en',
    captureMs?: number
  ): Promise<LocalSttResponse> {
    const form = new FormData();
    form.append('audio', new Blob([audioBuffer], { type: mimeType }), 'utterance.webm');
    form.append('language', language);
    if (typeof captureMs === 'number' && Number.isFinite(captureMs)) {
      form.append('capture_ms', String(Math.max(0, Math.round(captureMs))));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.LOCAL_STT_TIMEOUT_MS);
    try {
      const response = await fetch(`${env.LOCAL_STT_URL.replace(/\/$/, '')}/transcribe`, {
        method: 'POST',
        body: form,
        signal: controller.signal
      });
      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw ApiError.badGateway(
          `Local STT request failed: ${message}`,
          undefined,
          'LOCAL_STT_PROVIDER_ERROR'
        );
      }
      const parsed = (await response.json()) as LocalSttResponse;
      if (!parsed?.transcript?.trim()) {
        throw ApiError.badGateway(
          'Local STT returned empty transcript',
          undefined,
          'LOCAL_STT_EMPTY_TRANSCRIPT'
        );
      }
      return parsed;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.badGateway(
        `Local STT request failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        'LOCAL_STT_PROVIDER_ERROR'
      );
    } finally {
      clearTimeout(timeout);
    }
  },

  async pingHealth(): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(env.LOCAL_STT_TIMEOUT_MS, 3000));
    try {
      const response = await fetch(`${env.LOCAL_STT_URL.replace(/\/$/, '')}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      if (!response.ok) {
        logger.warn('[COMPANION_STT] Local STT health check failed', { status: response.status });
      }
    } catch (error) {
      logger.warn('[COMPANION_STT] Local STT health check unreachable', {
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      clearTimeout(timeout);
    }
  }
};

