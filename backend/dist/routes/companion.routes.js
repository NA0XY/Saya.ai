"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const companion_controller_1 = require("../modules/companion/companion.controller");
const ChatSchema = zod_1.z.object({ patient_id: zod_1.z.string().uuid(), message: zod_1.z.string().min(1), language: zod_1.z.enum(['hi', 'en']).default('hi') });
const PatientParamsSchema = zod_1.z.object({ patientId: zod_1.z.string().uuid() });
const MemoryParamsSchema = zod_1.z.object({ patientId: zod_1.z.string().uuid(), memoryKey: zod_1.z.string().min(1) });
const PreferenceSchema = zod_1.z.object({
    tone: zod_1.z.enum(['warm', 'formal', 'playful']),
    language: zod_1.z.enum(['hi', 'en'])
});
exports.companionRouter = (0, express_1.Router)();
exports.companionRouter.post('/chat', auth_middleware_1.authMiddleware, rateLimit_middleware_1.companionLimiter, (0, validate_middleware_1.validateBody)(ChatSchema), companion_controller_1.companionController.chat);
exports.companionRouter.get('/history/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getHistory);
exports.companionRouter.get('/memories/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getMemories);
exports.companionRouter.delete('/memories/:patientId/:memoryKey', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(MemoryParamsSchema), companion_controller_1.companionController.deleteMemory);
exports.companionRouter.get('/news', auth_middleware_1.authMiddleware, companion_controller_1.companionController.getNews);
exports.companionRouter.get('/preferences/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getPreferences);
exports.companionRouter.patch('/preferences/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), (0, validate_middleware_1.validateBody)(PreferenceSchema), companion_controller_1.companionController.updatePreferences);
//# sourceMappingURL=companion.routes.js.map