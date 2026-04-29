"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const alert_service_1 = require("../alerts/alert.service");
const sms_service_1 = require("../calls/sms.service");
const news_service_1 = require("../news/news.service");
const patient_repository_1 = require("../patients/patient.repository");
const patient_service_1 = require("../patients/patient.service");
const companion_prompts_1 = require("./companion.prompts");
const memory_service_1 = require("./memory.service");
const sentiment_service_1 = require("./sentiment.service");
const groq = new groq_sdk_1.default({ apiKey: env_1.env.GROQ_API_KEY });
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const ENGLISH_ONLY_FALLBACK = "I am here with you. I will continue in English so I can support you clearly. How are you feeling right now?";
const COMPANION_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 3800;
const MAX_MEMORY_ITEMS = 18;
const MAX_MEMORY_VALUE_CHARS = 160;
function shouldIncludeNewsContext(message) {
    const normalized = message.toLowerCase();
    return /(^|\b)(news|headline|headlines|current affairs|latest update|latest updates|what(?:'| i)?s happening)(\b|$)/i.test(normalized);
}
function clampText(value, maxChars) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars)
        return normalized;
    return `${normalized.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}
function compactPromptHistory(history) {
    const cleaned = history
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
        role: message.role,
        content: clampText(memory_service_1.memoryService.stripControlTags(message.content ?? ''), 320)
    }))
        .filter((message) => Boolean(message.content))
        .slice(-MAX_HISTORY_MESSAGES);
    let totalChars = cleaned.reduce((sum, message) => sum + message.content.length, 0);
    if (totalChars <= MAX_HISTORY_CHARS)
        return cleaned;
    const compacted = [];
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
function compactPromptMemories(memories) {
    return memories
        .filter((memory) => !memory.memory_key.startsWith('conversation_note'))
        .slice(-MAX_MEMORY_ITEMS)
        .map((memory) => ({
        ...memory,
        memory_value: clampText(memory.memory_value ?? '', MAX_MEMORY_VALUE_CHARS)
    }));
}
function buildPromptMessages(context, userMessage) {
    return [
        { role: 'system', content: context.system },
        ...context.history.map((message) => ({ role: message.role, content: message.content })),
        { role: 'user', content: clampText(userMessage, 500) }
    ];
}
async function createGroqCompletion(messages) {
    let lastError = null;
    for (const model of COMPANION_MODELS) {
        try {
            const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
                model,
                temperature: 0.45,
                max_tokens: 180,
                messages
            }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_COMPANION_TIMEOUT', 'Groq companion response timed out');
            return completion;
        }
        catch (error) {
            lastError = error;
            logger_1.logger.warn('[COMPANION] Groq completion attempt failed', {
                model,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    throw apiError_1.ApiError.badGateway('Groq companion response failed', { error: lastError instanceof Error ? lastError.message : String(lastError) }, 'GROQ_COMPANION_PROVIDER_ERROR');
}
async function createGroqStream(messages) {
    let lastError = null;
    for (const model of COMPANION_MODELS) {
        try {
            const stream = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
                model,
                temperature: 0.45,
                max_tokens: 180,
                stream: true,
                messages
            }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_COMPANION_STREAM_TIMEOUT', 'Groq companion stream timed out');
            return stream;
        }
        catch (error) {
            lastError = error;
            logger_1.logger.warn('[COMPANION] Groq stream attempt failed', {
                model,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    throw apiError_1.ApiError.badGateway('Groq companion stream failed', { error: lastError instanceof Error ? lastError.message : String(lastError) }, 'GROQ_COMPANION_STREAM_PROVIDER_ERROR');
}
async function prepareChatContext(request, caregiverId) {
    await patient_service_1.patientService.assertCaregiverOwnsPatient(request.patient_id, caregiverId);
    const patient = await patient_repository_1.patientRepository.findById(request.patient_id);
    if (!patient)
        throw apiError_1.ApiError.notFound('Patient');
    const includeNewsContext = shouldIncludeNewsContext(request.message);
    const [memories, history, contacts, recentNews] = await Promise.all([
        memory_service_1.memoryService.getMemories(patient.id),
        exports.companionService.getHistory(patient.id, 20),
        patient_repository_1.patientRepository.findEscalationContacts(patient.id),
        includeNewsContext ? news_service_1.newsService.getLatestNews(5) : Promise.resolve([])
    ]);
    const semanticMatches = await memory_service_1.memoryService.semanticSearch(patient.id, request.message, 6).catch(() => []);
    const semanticPromptMemories = semanticMatches.map((match, index) => ({
        id: `vault-${index + 1}`,
        patient_id: patient.id,
        memory_key: `vault_match_${index + 1}`,
        memory_value: clampText(match.content, 180),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
    const promptMemories = compactPromptMemories([...memories, ...semanticPromptMemories]);
    const system = (0, companion_prompts_1.buildCompanionSystemPrompt)(patient, promptMemories, recentNews.slice(0, 3), patient.companion_tone);
    return { patient, contacts, history: compactPromptHistory(history), system };
}
async function persistChatOutcome(request, caregiverId, context, rawReply) {
    const familyAction = memory_service_1.memoryService.extractFamilyActionRequest(rawReply);
    const memoriesUpdated = await memory_service_1.memoryService.extractAndSaveMemories(context.patient.id, rawReply);
    const cleanReplyRaw = memory_service_1.memoryService.stripControlTags(rawReply);
    const cleanReply = DEVANAGARI_REGEX.test(cleanReplyRaw) ? ENGLISH_ONLY_FALLBACK : cleanReplyRaw;
    const sentiment = await sentiment_service_1.sentimentService.analyzeSentiment(request.message, request.language);
    const { error: messageInsertError } = await supabase_1.supabase
        .from('companion_messages')
        .insert([
        { patient_id: context.patient.id, role: 'user', content: request.message, sentiment },
        { patient_id: context.patient.id, role: 'assistant', content: cleanReply, sentiment: null }
    ]);
    if (messageInsertError)
        throw apiError_1.ApiError.internal('Failed to store companion messages');
    void Promise.allSettled([
        memory_service_1.memoryService.appendConversationNote(context.patient.id, request.message, 'user'),
        memory_service_1.memoryService.appendConversationNote(context.patient.id, cleanReply, 'assistant')
    ]);
    if (familyAction.hasAction && familyAction.message) {
        const target = context.contacts[0];
        if (target) {
            await sms_service_1.smsService.sendCompanionRequestSms(context.patient.full_name, familyAction.message, target);
            await alert_service_1.alertService.createAlert({
                patient_id: context.patient.id,
                caregiver_id: caregiverId,
                alert_type: 'companion_request',
                message: familyAction.message
            });
        }
    }
    const escalated = await sentiment_service_1.sentimentService.checkAndEscalate(context.patient.id, sentiment, context.contacts, context.patient.full_name);
    return { reply: cleanReply, sentiment, memories_updated: memoriesUpdated, escalated };
}
exports.companionService = {
    async chat(request, caregiverId) {
        const chatStartedAt = Date.now();
        const context = await prepareChatContext(request, caregiverId);
        const promptMessages = buildPromptMessages(context, request.message);
        const completion = await createGroqCompletion(promptMessages);
        const rawReply = completion.choices[0]?.message?.content;
        if (!rawReply)
            throw apiError_1.ApiError.badGateway('Groq returned an empty companion reply', undefined, 'GROQ_EMPTY_COMPANION_REPLY');
        const response = await persistChatOutcome(request, caregiverId, context, rawReply);
        return {
            ...response,
            latency_ms: {
                chat_total_ms: Date.now() - chatStartedAt
            }
        };
    },
    async chatStream(request, caregiverId, emit) {
        const chatStartedAt = Date.now();
        const context = await prepareChatContext(request, caregiverId);
        const promptMessages = buildPromptMessages(context, request.message);
        let firstTokenTimestamp = null;
        const tokenStream = await createGroqStream(promptMessages);
        let rawReply = '';
        let languageGuardTriggered = false;
        for await (const chunk of tokenStream) {
            const token = chunk?.choices?.[0]?.delta?.content ?? '';
            if (!token)
                continue;
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
            if (!languageGuardTriggered)
                emit('assistant_token', { token });
        }
        if (!rawReply.trim()) {
            throw apiError_1.ApiError.badGateway('Groq returned an empty companion stream', undefined, 'GROQ_EMPTY_COMPANION_STREAM');
        }
        const response = await persistChatOutcome(request, caregiverId, context, rawReply);
        const fullResponse = {
            ...response,
            latency_ms: {
                chat_first_token_ms: firstTokenTimestamp ? firstTokenTimestamp - chatStartedAt : undefined,
                chat_total_ms: Date.now() - chatStartedAt
            }
        };
        emit('assistant_done', fullResponse);
        return fullResponse;
    },
    async getHistory(patientId, limit = 50) {
        const { data, error } = await supabase_1.supabase
            .from('companion_messages')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw apiError_1.ApiError.internal('Failed to load companion history');
        return (data ?? []).reverse();
    }
};
//# sourceMappingURL=companion.service.js.map