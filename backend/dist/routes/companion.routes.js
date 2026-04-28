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
exports.companionRouter = (0, express_1.Router)();
exports.companionRouter.post('/chat', auth_middleware_1.authMiddleware, rateLimit_middleware_1.companionLimiter, (0, validate_middleware_1.validateBody)(ChatSchema), companion_controller_1.companionController.chat);
exports.companionRouter.get('/history/:patientId', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validateParams)(PatientParamsSchema), companion_controller_1.companionController.getHistory);
//# sourceMappingURL=companion.routes.js.map