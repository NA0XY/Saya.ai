"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqNerService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const zod_1 = require("zod");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const ner_prompts_1 = require("./ner.prompts");
const groq = new groq_sdk_1.default({ apiKey: env_1.env.GROQ_API_KEY });
const MedicineSchema = zod_1.z.object({
    drug_name: zod_1.z.string().min(1),
    dosage: zod_1.z.string().nullable().default(null),
    frequency: zod_1.z.string().nullable().default(null),
    route: zod_1.z.string().nullable().default(null),
    low_confidence: zod_1.z.boolean().default(false)
});
exports.groqNerService = {
    async extractMedicines(ocrText) {
        const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            max_tokens: 2000,
            messages: [
                { role: 'system', content: ner_prompts_1.NER_EXTRACTION_PROMPT },
                { role: 'user', content: `OCR Text:\n${ocrText}` }
            ]
        }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq medicine extraction failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_NER_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_NER_TIMEOUT', 'Groq medicine extraction timed out');
        const raw = completion.choices[0]?.message?.content;
        if (!raw)
            throw apiError_1.ApiError.badGateway('Groq returned an empty medicine extraction result', undefined, 'GROQ_EMPTY_NER');
        try {
            const parsed = JSON.parse(raw);
            const medicines = zod_1.z.array(MedicineSchema).parse(parsed);
            return { medicines, raw_response: raw };
        }
        catch (error) {
            logger_1.logger.error('[NER] Failed to parse Groq response', { raw, error: error instanceof Error ? error.message : String(error) });
            throw apiError_1.ApiError.internal('Failed to parse medicine extraction result');
        }
    }
};
//# sourceMappingURL=groqNer.service.js.map