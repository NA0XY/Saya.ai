import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';
import type { ApprovedContact } from '../../types/database';
import type { Language, SentimentTag } from '../../types/common';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import { alertService } from '../alerts/alert.service';
import { patientRepository } from '../patients/patient.repository';
import { smsService } from '../calls/sms.service';
import { buildSentimentPrompt, SENTIMENT_JSON_SCHEMA } from './companion.prompts';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const allowed: SentimentTag[] = ['joy', 'neutral', 'anxiety', 'sadness'];
const negativeSentiments = new Set<SentimentTag>(['anxiety', 'sadness']);

export function shouldEscalateForConsecutiveNegativeSentiments(
  currentSentiment: SentimentTag,
  previousUserSentiment: SentimentTag | null
): boolean {
  return negativeSentiments.has(currentSentiment) && previousUserSentiment !== null && negativeSentiments.has(previousUserSentiment);
}

export const sentimentService = {
  async analyzeSentiment(message: string, _language: Language): Promise<SentimentTag> {
    const completion = await withTimeout(
      groq.chat.completions.create({ model: 'llama3-70b-8192', temperature: 0, max_tokens: 80, messages: [{ role: 'system', content: `${buildSentimentPrompt()} Schema: ${SENTIMENT_JSON_SCHEMA}` }, { role: 'user', content: message }] }).catch((error: unknown) => {
        throw ApiError.badGateway('Groq sentiment analysis failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_SENTIMENT_PROVIDER_ERROR');
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_SENTIMENT_TIMEOUT',
      'Groq sentiment analysis timed out'
    );
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw ApiError.badGateway('Groq returned an empty sentiment result', undefined, 'GROQ_EMPTY_SENTIMENT');
    try {
      const parsed = JSON.parse(raw) as { sentiment?: string };
      return allowed.includes(parsed.sentiment as SentimentTag) ? parsed.sentiment as SentimentTag : 'neutral';
    } catch {
      const tag = allowed.find((candidate) => raw.toLowerCase().includes(candidate));
      if (!tag) throw ApiError.badGateway('Groq returned malformed sentiment JSON', { raw }, 'GROQ_MALFORMED_SENTIMENT');
      return tag;
    }
  },
  async checkAndEscalate(patientId: string, currentSentiment: SentimentTag, contacts: ApprovedContact[], patientName: string): Promise<boolean> {
    if (!negativeSentiments.has(currentSentiment)) return false;
    if (contacts.length === 0) return false;
    const { data, error } = await supabase.from('companion_messages').select('*').eq('patient_id', patientId).eq('role', 'user').order('created_at', { ascending: false }).limit(2);
    if (error) return false;
    const previousSentiment = ((data ?? [])[1]?.sentiment ?? null) as SentimentTag | null;
    if (!shouldEscalateForConsecutiveNegativeSentiments(currentSentiment, previousSentiment)) return false;
    if (await alertService.hasRecentEmotionalEscalation(patientId)) return false;
    await smsService.sendEmotionalEscalationSms(patientName, contacts);
    const patient = await patientRepository.findById(patientId);
    if (patient) await alertService.createAlert({ patient_id: patientId, caregiver_id: patient.caregiver_id, alert_type: 'emotional_escalation', message: `${patientName} sounded sad or anxious in two consecutive messages` });
    return true;
  }
};
