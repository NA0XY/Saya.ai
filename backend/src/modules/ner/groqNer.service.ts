import Groq from 'groq-sdk';
import { z } from 'zod';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import { NER_EXTRACTION_PROMPT } from './ner.prompts';
import type { NerResult } from './ner.types';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const MedicineSchema = z.object({
  drug_name: z.string().min(1),
  dosage: z.string().nullable().default(null),
  frequency: z.string().nullable().default(null),
  route: z.string().nullable().default(null),
  low_confidence: z.boolean().default(false)
});

export const groqNerService = {
  async extractMedicines(ocrText: string): Promise<NerResult> {
    const completion = await withTimeout(
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: NER_EXTRACTION_PROMPT },
          { role: 'user', content: `OCR Text:\n${ocrText}` }
        ]
      }).catch((error: unknown) => {
        throw ApiError.badGateway('Groq medicine extraction failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_NER_PROVIDER_ERROR');
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_NER_TIMEOUT',
      'Groq medicine extraction timed out'
    );
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw ApiError.badGateway('Groq returned an empty medicine extraction result', undefined, 'GROQ_EMPTY_NER');
    try {
      const parsed = JSON.parse(raw) as unknown;
      const medicines = z.array(MedicineSchema).parse(parsed);
      return { medicines, raw_response: raw };
    } catch (error) {
      logger.error('[NER] Failed to parse Groq response', { raw, error: error instanceof Error ? error.message : String(error) });
      throw ApiError.internal('Failed to parse medicine extraction result');
    }
  }
};
