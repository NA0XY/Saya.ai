import vision from '@google-cloud/vision';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import type { OcrResult } from './ocr.types';

const client = new vision.ImageAnnotatorClient();

export async function extractTextFromImage(filePath: string): Promise<OcrResult> {
  try {
    const [result] = await withTimeout(
      client.textDetection(filePath),
      env.GOOGLE_VISION_TIMEOUT_MS,
      'GOOGLE_VISION_TIMEOUT',
      'Google Vision request timed out'
    );
    const annotation = result.fullTextAnnotation;
    const rawText = annotation?.text ?? result.textAnnotations?.[0]?.description ?? '';
    const confidences = annotation?.pages?.flatMap((page) => page.blocks?.map((block) => block.confidence ?? 0).filter((confidence) => confidence > 0) ?? []) ?? [];
    const confidence = confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : null;
    return { rawText, confidence };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('[OCR] Google Vision failed', { filePath, error: message });
    throw ApiError.badGateway('Google Vision OCR failed', { error: message }, 'GOOGLE_VISION_ERROR');
  }
}
