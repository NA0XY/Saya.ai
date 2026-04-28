"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentimentService = void 0;
exports.shouldEscalateForConsecutiveNegativeSentiments = shouldEscalateForConsecutiveNegativeSentiments;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../../config/env");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const alert_service_1 = require("../alerts/alert.service");
const patient_repository_1 = require("../patients/patient.repository");
const sms_service_1 = require("../calls/sms.service");
const companion_prompts_1 = require("./companion.prompts");
const groq = new groq_sdk_1.default({ apiKey: env_1.env.GROQ_API_KEY });
const allowed = ['joy', 'neutral', 'anxiety', 'sadness'];
const negativeSentiments = new Set(['anxiety', 'sadness']);
function shouldEscalateForConsecutiveNegativeSentiments(currentSentiment, previousUserSentiment) {
    return negativeSentiments.has(currentSentiment) && previousUserSentiment !== null && negativeSentiments.has(previousUserSentiment);
}
exports.sentimentService = {
    async analyzeSentiment(message, _language) {
        const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', temperature: 0, max_tokens: 80, messages: [{ role: 'system', content: `${(0, companion_prompts_1.buildSentimentPrompt)()} Schema: ${companion_prompts_1.SENTIMENT_JSON_SCHEMA}` }, { role: 'user', content: message }] }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq sentiment analysis failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_SENTIMENT_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_SENTIMENT_TIMEOUT', 'Groq sentiment analysis timed out');
        const raw = completion.choices[0]?.message?.content;
        if (!raw)
            throw apiError_1.ApiError.badGateway('Groq returned an empty sentiment result', undefined, 'GROQ_EMPTY_SENTIMENT');
        try {
            const parsed = JSON.parse(raw);
            return allowed.includes(parsed.sentiment) ? parsed.sentiment : 'neutral';
        }
        catch {
            const tag = allowed.find((candidate) => raw.toLowerCase().includes(candidate));
            if (!tag)
                throw apiError_1.ApiError.badGateway('Groq returned malformed sentiment JSON', { raw }, 'GROQ_MALFORMED_SENTIMENT');
            return tag;
        }
    },
    async checkAndEscalate(patientId, currentSentiment, contacts, patientName) {
        if (!negativeSentiments.has(currentSentiment))
            return false;
        if (contacts.length === 0)
            return false;
        const { data, error } = await supabase_1.supabase.from('companion_messages').select('*').eq('patient_id', patientId).eq('role', 'user').order('created_at', { ascending: false }).limit(2);
        if (error)
            return false;
        const previousSentiment = ((data ?? [])[1]?.sentiment ?? null);
        if (!shouldEscalateForConsecutiveNegativeSentiments(currentSentiment, previousSentiment))
            return false;
        if (await alert_service_1.alertService.hasRecentEmotionalEscalation(patientId))
            return false;
        await sms_service_1.smsService.sendEmotionalEscalationSms(patientName, contacts);
        const patient = await patient_repository_1.patientRepository.findById(patientId);
        if (patient)
            await alert_service_1.alertService.createAlert({ patient_id: patientId, caregiver_id: patient.caregiver_id, alert_type: 'emotional_escalation', message: `${patientName} sounded sad or anxious in two consecutive messages` });
        return true;
    }
};
//# sourceMappingURL=sentiment.service.js.map