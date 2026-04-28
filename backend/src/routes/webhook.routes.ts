import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate.middleware';
import { handleExotelIvr } from '../webhooks/exotelIvr.webhook';
import { handleExotelStatus } from '../webhooks/exotelStatus.webhook';
import { handleTwilioIvr, handleTwilioIvrResponse, handleTwilioStatus } from '../webhooks/twilio.webhook';

const IvrWebhookSchema = z.object({ CallSid: z.string().min(1), DialCallStatus: z.string().optional().default(''), Digits: z.string().optional().default(''), To: z.string().optional().default(''), From: z.string().optional().default('') }).passthrough();
const StatusWebhookSchema = z.object({ CallSid: z.string().min(1), Status: z.string().min(1), To: z.string().optional().default(''), From: z.string().optional().default(''), Duration: z.string().optional() }).passthrough();
const TwilioStatusSchema = z.object({ CallSid: z.string().min(1), CallStatus: z.string().min(1), To: z.string().optional().default(''), From: z.string().optional().default(''), CallDuration: z.string().optional() }).passthrough();

export const webhookRouter = Router();

// Twilio webhooks (primary)
webhookRouter.get('/twilio/ivr', asyncHandler(handleTwilioIvr));
webhookRouter.post('/twilio/ivr', asyncHandler(handleTwilioIvr));
webhookRouter.post('/twilio/ivr-response', validateBody(IvrWebhookSchema), asyncHandler(handleTwilioIvrResponse));
webhookRouter.post('/twilio/status', validateBody(TwilioStatusSchema), asyncHandler(handleTwilioStatus));

// Legacy Exotel webhooks (fallback during transition)
webhookRouter.post('/exotel/ivr', validateBody(IvrWebhookSchema), asyncHandler(handleExotelIvr));
webhookRouter.post('/exotel/status', validateBody(StatusWebhookSchema), asyncHandler(handleExotelStatus));
