import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
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
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const ENGLISH_ONLY_FALLBACK =
  "I am here with you. I will continue in English so I can support you clearly. How are you feeling right now?";
const COMPANION_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 3800;
const MAX_MEMORY_ITEMS = 18;
const MAX_MEMORY_VALUE_CHARS = 160;

type PromptMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type ChatContext = {
  patient: Patient;
  contacts: ApprovedContact[];
  history: Array<{ role: string; content: string }>;
  system: string;
};

function clampText(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

function compactPromptHistory(history: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
  const cleaned = history
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: clampText(memoryService.stripControlTags(message.content ?? ''), 320)
    }))
    .filter((message) => Boolean(message.content))
    .slice(-MAX_HISTORY_MESSAGES);

  let totalChars = cleaned.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars <= MAX_HISTORY_CHARS) return cleaned;

  const compacted: Array<{ role: string; content: string }> = [];
  for (let index = cleaned.length - 1; index >= 0; index -= 1) {
    const entry = cleaned[index];
    if (totalChars <= MAX_HISTORY_CHARS) {
      compacted.unshift(entry);
      continue;
    }
    const remaining = Math.max(80, entry.content.length - (totalChars - MAX_HISTORY_CHARS));
    compacted.unshift({ ...entry, content: clampText(entry.content, remaining) });
    totalChars = compacted.reduce((sum, message) => sum + message.content.length, 0);
  }
  return compacted;
}

function compactPromptMemories(memories: PatientMemory[]): PatientMemory[] {
  return memories
    .filter((memory) => !memory.memory_key.startsWith('conversation_note'))
    .slice(-MAX_MEMORY_ITEMS)
    .map((memory) => ({
      ...memory,
      memory_value: clampText(memory.memory_value ?? '', MAX_MEMORY_VALUE_CHARS)
    }));
}

function buildPromptMessages(context: ChatContext, userMessage: string): PromptMessage[] {
  return [
    { role: 'system', content: context.system },
    ...context.history.map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content })),
    { role: 'user', content: clampText(userMessage, 500) }
  ];
}

async function createGroqCompletion(messages: PromptMessage[]): Promise<any> {
  let lastError: unknown = null;
  for (const model of COMPANION_MODELS) {
    try {
      const completion = await withTimeout(
        groq.chat.completions.create({
          model,
          temperature: 0.45,
          max_tokens: 180,
          messages
        }),
        env.GROQ_TIMEOUT_MS,
        'GROQ_COMPANION_TIMEOUT',
        'Groq companion response timed out'
      );
      return completion;
    } catch (error) {
      lastError = error;
      logger.warn('[COMPANION] Groq completion attempt failed', {
        model,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  throw ApiError.badGateway(
    'Groq companion response failed',
    { error: lastError instanceof Error ? lastError.message : String(lastError) },
    'GROQ_COMPANION_PROVIDER_ERROR'
  );
}

async function createGroqStream(messages: PromptMessage[]): Promise<AsyncIterable<any>> {
  let lastError: unknown = null;
  for (const model of COMPANION_MODELS) {
    try {
      const stream = await withTimeout(
        (groq.chat.completions.create as any)({
          model,
          temperature: 0.45,
          max_tokens: 180,
          stream: true,
          messages
        }),
        env.GROQ_TIMEOUT_MS,
        'GROQ_COMPANION_STREAM_TIMEOUT',
        'Groq companion stream timed out'
      );
      return stream as AsyncIterable<any>;
    } catch (error) {
      lastError = error;
      logger.warn('[COMPANION] Groq stream attempt failed', {
        model,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  throw ApiError.badGateway(
    'Groq companion stream failed',
    { error: lastError instanceof Error ? lastError.message : String(lastError) },
    'GROQ_COMPANION_STREAM_PROVIDER_ERROR'
  );
}

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
    memory_value: clampText(match.content, 180),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const promptMemories = compactPromptMemories([...memories, ...semanticPromptMemories]);
  const system = buildCompanionSystemPrompt(
    patient,
    promptMemories,
    recentNews.slice(0, 3),
    patient.companion_tone
  );

  return { patient, contacts, history: compactPromptHistory(history), system };
}

async function persistChatOutcome(
  request: ChatRequest,
  caregiverId: string,
  context: ChatContext,
  rawReply: string
): Promise<ChatResponse> {
  const familyAction = memoryService.extractFamilyActionRequest(rawReply);
  const memoriesUpdated = await memoryService.extractAndSaveMemories(context.patient.id, rawReply);
  const cleanReplyRaw = memoryService.stripControlTags(rawReply);
  const cleanReply = DEVANAGARI_REGEX.test(cleanReplyRaw) ? ENGLISH_ONLY_FALLBACK : cleanReplyRaw;

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
    const promptMessages = buildPromptMessages(context, request.message);

    const completion = await createGroqCompletion(promptMessages);

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
    const promptMessages = buildPromptMessages(context, request.message);
    let firstTokenTimestamp: number | null = null;

    const tokenStream = await createGroqStream(promptMessages);
    let rawReply = '';
    let languageGuardTriggered = false;
    for await (const chunk of tokenStream) {
      const token = chunk?.choices?.[0]?.delta?.content ?? '';
      if (!token) continue;
      rawReply += token;
      if (!firstTokenTimestamp) {
        firstTokenTimestamp = Date.now();
      }
      if (DEVANAGARI_REGEX.test(token)) {
        if (!languageGuardTriggered) {
          languageGuardTriggered = true;
          emit('assistant_token', { token: ENGLISH_ONLY_FALLBACK });
        }
        continue;
      }
      if (!languageGuardTriggered) emit('assistant_token', { token });
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
