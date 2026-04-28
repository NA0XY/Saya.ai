import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate.middleware';
import { handleExotelIvr } from '../webhooks/exotelIvr.webhook';
import { handleExotelStatus } from '../webhooks/exotelStatus.webhook';

const IvrWebhookSchema = z.object({ CallSid: z.string().min(1), DialCallStatus: z.string().optional().default(''), Digits: z.string().optional().default(''), To: z.string().optional().default(''), From: z.string().optional().default('') }).passthrough();
const StatusWebhookSchema = z.object({ CallSid: z.string().min(1), Status: z.string().min(1), To: z.string().optional().default(''), From: z.string().optional().default(''), Duration: z.string().optional() }).passthrough();

export const webhookRouter = Router();
webhookRouter.post('/exotel/ivr', validateBody(IvrWebhookSchema), asyncHandler(handleExotelIvr));
webhookRouter.post('/exotel/status', validateBody(StatusWebhookSchema), asyncHandler(handleExotelStatus));
