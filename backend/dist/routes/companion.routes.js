"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const companion_controller_1 = require("../modules/companion/companion.controller");
const ChatSchema = zod_1.z.object({ patient_id: zod_1.z.string().uuid(), message: zod_1.z.string().min(1), language: zod_1.z.enum(['hi', 'en']).default('hi') });
const PatientParamsSchema = zod_1.z.object({ patientId: zod_1.z.string().uuid() });
const MemoryParamsSchema = zod_1.z.object({ patientId: zod_1.z.string().uuid(), memoryKey: zod_1.z.string().min(1) });
const VaultSearchSchema = zod_1.z.object({ q: zod_1.z.string().min(2), limit: zod_1.z.coerce.number().int().positive().max(20).optional() });
const TtsBodySchema = zod_1.z.object({
    text: zod_1.z.string().min(1).max(1500),
    language: zod_1.z.enum(['hi', 'en']).optional(),
    sentiment: zod_1.z.enum(['joy', 'neutral', 'anxiety', 'sadness']).optional(),
    tone: zod_1.z.enum(['warm', 'formal', 'playful']).optional(),
    voiceSpeed: zod_1.z.enum(['slow', 'medium', 'fast']).optional()
});
const PreferenceSchema = zod_1.z.object({
    tone: zod_1.z.enum(['warm', 'formal', 'playful']),
    language: zod_1.z.enum(['hi', 'en'])
});
const companionAudioUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});
exports.companionRouter = (0, express_1.Router)();
exports.companionRouter.post('/chat', auth_middleware_1.authMiddleware, rateLimit_middleware_1.companionLimiter, (0, validate_middleware_1.validateBody)(ChatSchema), companion_controller_1.companionController.chat);
exports.companionRouter.post('/chat/stream', auth_middleware_1.authMiddleware, rateLimit_middleware_1.companionLimiter, (0, validate_middleware_1.validateBody)(ChatSchema), companion_controller_1.companionController.streamChat);
exports.companionRouter.get('/patient', auth_middleware_1.authMiddleware, companion_controller_1.companionController.getPatientContext);
exports.companionRouter.post('/tts/:patientId/stream', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), (0, validate_middleware_1.validateBody)(TtsBodySchema), companion_controller_1.companionController.streamTts);
exports.companionRouter.post('/stt/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companionAudioUpload.single('audio'), companion_controller_1.companionController.transcribeSpeech);
exports.companionRouter.get('/history/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getHistory);
exports.companionRouter.get('/memories/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getMemories);
exports.companionRouter.delete('/memories/:patientId/:memoryKey', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(MemoryParamsSchema), companion_controller_1.companionController.deleteMemory);
exports.companionRouter.get('/memories/:patientId/search', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), (0, validate_middleware_1.validateQuery)(VaultSearchSchema), companion_controller_1.companionController.searchMemories);
exports.companionRouter.get('/news', auth_middleware_1.authMiddleware, companion_controller_1.companionController.getNews);
exports.companionRouter.get('/preferences/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getPreferences);
exports.companionRouter.patch('/preferences/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), (0, validate_middleware_1.validateBody)(PreferenceSchema), companion_controller_1.companionController.updatePreferences);
//# sourceMappingURL=companion.routes.js.map