"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_middleware_1 = require("../middleware/validate.middleware");
const exotelIvr_webhook_1 = require("../webhooks/exotelIvr.webhook");
const exotelStatus_webhook_1 = require("../webhooks/exotelStatus.webhook");
const twilio_webhook_1 = require("../webhooks/twilio.webhook");
const IvrWebhookSchema = zod_1.z.object({ CallSid: zod_1.z.string().min(1), DialCallStatus: zod_1.z.string().optional().default(''), Digits: zod_1.z.string().optional().default(''), To: zod_1.z.string().optional().default(''), From: zod_1.z.string().optional().default('') }).passthrough();
const StatusWebhookSchema = zod_1.z.object({ CallSid: zod_1.z.string().min(1), Status: zod_1.z.string().min(1), To: zod_1.z.string().optional().default(''), From: zod_1.z.string().optional().default(''), Duration: zod_1.z.string().optional() }).passthrough();
const TwilioStatusSchema = zod_1.z.object({ CallSid: zod_1.z.string().min(1), CallStatus: zod_1.z.string().min(1), To: zod_1.z.string().optional().default(''), From: zod_1.z.string().optional().default(''), CallDuration: zod_1.z.string().optional() }).passthrough();
exports.webhookRouter = (0, express_1.Router)();
// Twilio webhooks (primary)
exports.webhookRouter.get('/twilio/ivr', (0, asyncHandler_1.asyncHandler)(twilio_webhook_1.handleTwilioIvr));
exports.webhookRouter.post('/twilio/ivr', (0, asyncHandler_1.asyncHandler)(twilio_webhook_1.handleTwilioIvr));
exports.webhookRouter.post('/twilio/ivr-response', (0, validate_middleware_1.validateBody)(IvrWebhookSchema), (0, asyncHandler_1.asyncHandler)(twilio_webhook_1.handleTwilioIvrResponse));
exports.webhookRouter.post('/twilio/status', (0, validate_middleware_1.validateBody)(TwilioStatusSchema), (0, asyncHandler_1.asyncHandler)(twilio_webhook_1.handleTwilioStatus));
// Legacy Exotel webhooks (fallback during transition)
exports.webhookRouter.post('/exotel/ivr', (0, validate_middleware_1.validateBody)(IvrWebhookSchema), (0, asyncHandler_1.asyncHandler)(exotelIvr_webhook_1.handleExotelIvr));
exports.webhookRouter.post('/exotel/status', (0, validate_middleware_1.validateBody)(StatusWebhookSchema), (0, asyncHandler_1.asyncHandler)(exotelStatus_webhook_1.handleExotelStatus));
//# sourceMappingURL=webhook.routes.js.map