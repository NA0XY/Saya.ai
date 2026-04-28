import type { Request, Response } from 'express';
import { logger } from '../config/logger';
import { callService } from '../modules/calls/call.service';
import type { CallStatusWebhookPayload } from './webhook.types';

export async function handleExotelStatus(req: Request, res: Response): Promise<void> {
  const payload = req.body as CallStatusWebhookPayload;
  logger.info('[WEBHOOK] Exotel status received', { body: payload });
  await callService.handleCallStatusUpdate(payload);
  res.status(200).end();
}
