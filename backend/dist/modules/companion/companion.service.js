"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../../config/env");
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
async function prepareChatContext(request, caregiverId) {
    await patient_service_1.patientService.assertCaregiverOwnsPatient(request.patient_id, caregiverId);
    const patient = await patient_repository_1.patientRepository.findById(request.patient_id);
    if (!patient)
        throw apiError_1.ApiError.notFound('Patient');
    const [memories, recentNews, history, contacts] = await Promise.all([
        memory_service_1.memoryService.getMemories(patient.id),
        news_service_1.newsService.getLatestNews(5),
        exports.companionService.getHistory(patient.id, 20),
        patient_repository_1.patientRepository.findEscalationContacts(patient.id)
    ]);
    const semanticMatches = await memory_service_1.memoryService.semanticSearch(patient.id, request.message, 6).catch(() => []);
    const semanticPromptMemories = semanticMatches.map((match, index) => ({
        id: `vault-${index + 1}`,
        patient_id: patient.id,
        memory_key: `vault_match_${index + 1}`,
        memory_value: match.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
    const system = (0, companion_prompts_1.buildCompanionSystemPrompt)(patient, [...memories, ...semanticPromptMemories], recentNews, patient.companion_tone);
    return { patient, contacts, history, system };
}
async function persistChatOutcome(request, caregiverId, context, rawReply) {
    const familyAction = memory_service_1.memoryService.extractFamilyActionRequest(rawReply);
    const memoriesUpdated = await memory_service_1.memoryService.extractAndSaveMemories(context.patient.id, rawReply);
    const cleanReply = memory_service_1.memoryService.stripControlTags(rawReply);
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
        const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 500,
            messages: [
                { role: 'system', content: context.system },
                ...context.history.map((message) => ({ role: message.role, content: message.content })),
                { role: 'user', content: request.message }
            ]
        }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq companion response failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_COMPANION_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_COMPANION_TIMEOUT', 'Groq companion response timed out');
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
        let firstTokenTimestamp = null;
        const stream = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.6,
            max_tokens: 500,
            stream: true,
            messages: [
                { role: 'system', content: context.system },
                ...context.history.map((message) => ({ role: message.role, content: message.content })),
                { role: 'user', content: request.message }
            ]
        }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq companion stream failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_COMPANION_STREAM_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_COMPANION_STREAM_TIMEOUT', 'Groq companion stream timed out');
        const tokenStream = stream;
        let rawReply = '';
        for await (const chunk of tokenStream) {
            const token = chunk?.choices?.[0]?.delta?.content ?? '';
            if (!token)
                continue;
            rawReply += token;
            if (!firstTokenTimestamp) {
                firstTokenTimestamp = Date.now();
            }
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