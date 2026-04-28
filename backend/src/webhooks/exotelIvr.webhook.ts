import type { Request, Response } from 'express';
import { logger } from '../config/logger';
import { callService } from '../modules/calls/call.service';
import type { IvrWebhookPayload } from './webhook.types';

export async function handleExotelIvr(req: Request, res: Response): Promise<void> {
  const payload = req.body as IvrWebhookPayload;
  logger.info('[WEBHOOK] Exotel IVR received', { body: payload });
  await callService.handleIvrResponse(payload);
  const message = payload.Digits === '1'
    ? 'Dhanyawaad. Humne aapke parivaar ko suchit kar diya. Thank you. Your family has been notified.'
    : 'Theek hai. Kripya jaldi apni dawai lein. Okay. Please take your medicine soon.';
  res.type('text/xml').send(`<Response><Say>${message}</Say></Response>`);
}
