import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import { alertService } from '../alerts/alert.service';
import { smsService } from '../calls/sms.service';
import { newsService } from '../news/news.service';
import { patientRepository } from '../patients/patient.repository';
import { patientService } from '../patients/patient.service';
import { buildCompanionSystemPrompt } from './companion.prompts';
import type { ChatRequest, ChatResponse } from './companion.types';
import { memoryService } from './memory.service';
import { sentimentService } from './sentiment.service';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const companionService = {
  async chat(request: ChatRequest, caregiverId: string): Promise<ChatResponse> {
    await patientService.assertCaregiverOwnsPatient(request.patient_id, caregiverId);
    const patient = await patientRepository.findById(request.patient_id);
    if (!patient) throw ApiError.notFound('Patient');
    const [memories, recentNews, history, contacts] = await Promise.all([
      memoryService.getMemories(patient.id),
      newsService.getLatestNews(5),
      this.getHistory(patient.id, 20),
      patientRepository.findEscalationContacts(patient.id)
    ]);
    const system = buildCompanionSystemPrompt(patient, memories, recentNews, patient.companion_tone);
    const completion = await withTimeout(
      groq.chat.completions.create({
        model: 'llama3-70b-8192',
        temperature: 0.6,
        max_tokens: 500,
        messages: [{ role: 'system', content: system }, ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })), { role: 'user', content: request.message }]
      }).catch((error: unknown) => {
        throw ApiError.badGateway('Groq companion response failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_COMPANION_PROVIDER_ERROR');
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_COMPANION_TIMEOUT',
      'Groq companion response timed out'
    );
    const rawReply = completion.choices[0]?.message?.content;
    if (!rawReply) throw ApiError.badGateway('Groq returned an empty companion reply', undefined, 'GROQ_EMPTY_COMPANION_REPLY');
    const familyAction = memoryService.extractFamilyActionRequest(rawReply);
    const memoriesUpdated = await memoryService.extractAndSaveMemories(patient.id, rawReply);
    const cleanReply = memoryService.stripControlTags(rawReply);
    const sentiment = await sentimentService.analyzeSentiment(request.message, request.language);
    const { error: messageInsertError } = await supabase
      .from('companion_messages')
      .insert([
        { patient_id: patient.id, role: 'user', content: request.message, sentiment },
        { patient_id: patient.id, role: 'assistant', content: cleanReply, sentiment: null }
      ]);
    if (messageInsertError) throw ApiError.internal('Failed to store companion messages');
    if (familyAction.hasAction && familyAction.message) {
      const target = contacts[0];
      if (target) {
        await smsService.sendCompanionRequestSms(patient.full_name, familyAction.message, target);
        await alertService.createAlert({ patient_id: patient.id, caregiver_id: caregiverId, alert_type: 'companion_request', message: familyAction.message });
      }
    }
    const escalated = await sentimentService.checkAndEscalate(patient.id, sentiment, contacts, patient.full_name);
    return { reply: cleanReply, sentiment, memories_updated: memoriesUpdated, escalated };
  },
  async getHistory(patientId: string, limit = 50) {
    const { data, error } = await supabase.from('companion_messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw ApiError.internal('Failed to load companion history');
    return (data ?? []).reverse();
  }
};
