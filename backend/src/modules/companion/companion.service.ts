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
import type { ApprovedContact, Patient, PatientMemory } from '../../types/database';
import { buildCompanionSystemPrompt } from './companion.prompts';
import type { ChatRequest, ChatResponse } from './companion.types';
import { memoryService } from './memory.service';
import { sentimentService } from './sentiment.service';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

type ChatContext = {
  patient: Patient;
  contacts: ApprovedContact[];
  history: Array<{ role: string; content: string }>;
  system: string;
};

async function prepareChatContext(request: ChatRequest, caregiverId: string): Promise<ChatContext> {
  await patientService.assertCaregiverOwnsPatient(request.patient_id, caregiverId);
  const patient = await patientRepository.findById(request.patient_id);
  if (!patient) throw ApiError.notFound('Patient');

  const [memories, recentNews, history, contacts] = await Promise.all([
    memoryService.getMemories(patient.id),
    newsService.getLatestNews(5),
    companionService.getHistory(patient.id, 20),
    patientRepository.findEscalationContacts(patient.id)
  ]);

  const semanticMatches = await memoryService.semanticSearch(patient.id, request.message, 6).catch(() => []);
  const semanticPromptMemories: PatientMemory[] = semanticMatches.map((match, index) => ({
    id: `vault-${index + 1}`,
    patient_id: patient.id,
    memory_key: `vault_match_${index + 1}`,
    memory_value: match.content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const system = buildCompanionSystemPrompt(
    patient,
    [...memories, ...semanticPromptMemories],
    recentNews,
    patient.companion_tone
  );

  return { patient, contacts, history, system };
}

async function persistChatOutcome(
  request: ChatRequest,
  caregiverId: string,
  context: ChatContext,
  rawReply: string
): Promise<ChatResponse> {
  const familyAction = memoryService.extractFamilyActionRequest(rawReply);
  const memoriesUpdated = await memoryService.extractAndSaveMemories(context.patient.id, rawReply);
  const cleanReply = memoryService.stripControlTags(rawReply);

  const sentiment = await sentimentService.analyzeSentiment(request.message, request.language);
  const { error: messageInsertError } = await supabase
    .from('companion_messages')
    .insert([
      { patient_id: context.patient.id, role: 'user', content: request.message, sentiment },
      { patient_id: context.patient.id, role: 'assistant', content: cleanReply, sentiment: null }
    ]);
  if (messageInsertError) throw ApiError.internal('Failed to store companion messages');

  void Promise.allSettled([
    memoryService.appendConversationNote(context.patient.id, request.message, 'user'),
    memoryService.appendConversationNote(context.patient.id, cleanReply, 'assistant')
  ]);

  if (familyAction.hasAction && familyAction.message) {
    const target = context.contacts[0];
    if (target) {
      await smsService.sendCompanionRequestSms(context.patient.full_name, familyAction.message, target);
      await alertService.createAlert({
        patient_id: context.patient.id,
        caregiver_id: caregiverId,
        alert_type: 'companion_request',
        message: familyAction.message
      });
    }
  }

  const escalated = await sentimentService.checkAndEscalate(
    context.patient.id,
    sentiment,
    context.contacts,
    context.patient.full_name
  );

  return { reply: cleanReply, sentiment, memories_updated: memoriesUpdated, escalated };
}

export const companionService = {
  async chat(request: ChatRequest, caregiverId: string): Promise<ChatResponse> {
    const chatStartedAt = Date.now();
    const context = await prepareChatContext(request, caregiverId);

    const completion = await withTimeout(
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 500,
        messages: [
          { role: 'system', content: context.system },
          ...context.history.map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content })),
          { role: 'user', content: request.message }
        ]
      }).catch((error: unknown) => {
        throw ApiError.badGateway(
          'Groq companion response failed',
          { error: error instanceof Error ? error.message : String(error) },
          'GROQ_COMPANION_PROVIDER_ERROR'
        );
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_COMPANION_TIMEOUT',
      'Groq companion response timed out'
    );

    const rawReply = completion.choices[0]?.message?.content;
    if (!rawReply) throw ApiError.badGateway('Groq returned an empty companion reply', undefined, 'GROQ_EMPTY_COMPANION_REPLY');

    const response = await persistChatOutcome(request, caregiverId, context, rawReply);
    return {
      ...response,
      latency_ms: {
        chat_total_ms: Date.now() - chatStartedAt
      }
    };
  },

  async chatStream(
    request: ChatRequest,
    caregiverId: string,
    emit: (event: 'assistant_token' | 'assistant_done' | 'assistant_error', payload: unknown) => void
  ): Promise<ChatResponse> {
    const chatStartedAt = Date.now();
    const context = await prepareChatContext(request, caregiverId);
    let firstTokenTimestamp: number | null = null;

    const stream = await withTimeout(
      (groq.chat.completions.create as any)({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 500,
        stream: true,
        messages: [
          { role: 'system', content: context.system },
          ...context.history.map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content })),
          { role: 'user', content: request.message }
        ]
      }).catch((error: unknown) => {
        throw ApiError.badGateway(
          'Groq companion stream failed',
          { error: error instanceof Error ? error.message : String(error) },
          'GROQ_COMPANION_STREAM_PROVIDER_ERROR'
        );
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_COMPANION_STREAM_TIMEOUT',
      'Groq companion stream timed out'
    );

    const tokenStream = stream as AsyncIterable<any>;
    let rawReply = '';
    for await (const chunk of tokenStream) {
      const token = chunk?.choices?.[0]?.delta?.content ?? '';
      if (!token) continue;
      rawReply += token;
      if (!firstTokenTimestamp) {
        firstTokenTimestamp = Date.now();
      }
      emit('assistant_token', { token });
    }

    if (!rawReply.trim()) {
      throw ApiError.badGateway('Groq returned an empty companion stream', undefined, 'GROQ_EMPTY_COMPANION_STREAM');
    }

    const response = await persistChatOutcome(request, caregiverId, context, rawReply);
    const fullResponse: ChatResponse = {
      ...response,
      latency_ms: {
        chat_first_token_ms: firstTokenTimestamp ? firstTokenTimestamp - chatStartedAt : undefined,
        chat_total_ms: Date.now() - chatStartedAt
      }
    };
    emit('assistant_done', fullResponse);
    return fullResponse;
  },

  async getHistory(patientId: string, limit = 50) {
    const { data, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw ApiError.internal('Failed to load companion history');
    return (data ?? []).reverse();
  }
};
