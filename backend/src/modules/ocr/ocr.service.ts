import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/apiError';
import { groqNerService } from '../ner/groqNer.service';
import type { NerResult } from '../ner/ner.types';
import { extractTextFromImage } from './googleVision.client';
import type { OcrResult } from './ocr.types';

export const ocrService = {
  async processPrescritionImage(filePath: string, _mimeType: string): Promise<{ ocrResult: OcrResult; nerResult: NerResult }> {
    const ocrResult = await extractTextFromImage(filePath);
    if (!ocrResult.rawText.trim()) throw ApiError.badRequest('Could not read text from image. Please upload a clearer photo.');
    const nerResult = await groqNerService.extractMedicines(ocrResult.rawText);
    return { ocrResult, nerResult };
  },
  async saveOcrResult(prescriptionId: string, rawText: string): Promise<void> {
    const { error } = await supabase.from('prescriptions').update({ raw_ocr_text: rawText }).eq('id', prescriptionId);
    if (error) throw ApiError.internal('Failed to save OCR result');
  }
};
