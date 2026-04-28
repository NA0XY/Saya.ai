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
exports.companionService = {
    async chat(request, caregiverId) {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(request.patient_id, caregiverId);
        const patient = await patient_repository_1.patientRepository.findById(request.patient_id);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        const [memories, recentNews, history, contacts] = await Promise.all([
            memory_service_1.memoryService.getMemories(patient.id),
            news_service_1.newsService.getLatestNews(5),
            this.getHistory(patient.id, 20),
            patient_repository_1.patientRepository.findEscalationContacts(patient.id)
        ]);
        const system = (0, companion_prompts_1.buildCompanionSystemPrompt)(patient, memories, recentNews, patient.companion_tone);
        const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
            model: 'llama3-70b-8192',
            temperature: 0.6,
            max_tokens: 500,
            messages: [{ role: 'system', content: system }, ...history.map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: request.message }]
        }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq companion response failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_COMPANION_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_COMPANION_TIMEOUT', 'Groq companion response timed out');
        const rawReply = completion.choices[0]?.message?.content;
        if (!rawReply)
            throw apiError_1.ApiError.badGateway('Groq returned an empty companion reply', undefined, 'GROQ_EMPTY_COMPANION_REPLY');
        const familyAction = memory_service_1.memoryService.extractFamilyActionRequest(rawReply);
        const memoriesUpdated = await memory_service_1.memoryService.extractAndSaveMemories(patient.id, rawReply);
        const cleanReply = memory_service_1.memoryService.stripControlTags(rawReply);
        const sentiment = await sentiment_service_1.sentimentService.analyzeSentiment(request.message, request.language);
        await supabase_1.supabase.from('companion_messages').insert([{ patient_id: patient.id, role: 'user', content: request.message, sentiment }, { patient_id: patient.id, role: 'assistant', content: cleanReply, sentiment: null }]);
        if (familyAction.hasAction && familyAction.message) {
            const target = contacts[0];
            if (target) {
                await sms_service_1.smsService.sendCompanionRequestSms(patient.full_name, familyAction.message, target);
                await alert_service_1.alertService.createAlert({ patient_id: patient.id, caregiver_id: caregiverId, alert_type: 'companion_request', message: familyAction.message });
            }
        }
        await sentiment_service_1.sentimentService.checkAndEscalate(patient.id, sentiment, contacts, patient.full_name);
        return { reply: cleanReply, sentiment, memories_updated: memoriesUpdated };
    },
    async getHistory(patientId, limit = 50) {
        const { data, error } = await supabase_1.supabase.from('companion_messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(limit);
        if (error)
            throw apiError_1.ApiError.internal('Failed to load companion history');
        return (data ?? []).reverse();
    }
};
//# sourceMappingURL=companion.service.js.map