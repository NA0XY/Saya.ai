import type { Request, Response } from 'express';
import { logger } from '../config/logger';
import { callService } from '../modules/calls/call.service';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './webhook.types';

/**
 * Twilio IVR entrypoint — returns TwiML instructions when a call connects.
 * Twilio fetches this URL (the `url` param from call creation) to get instructions.
 */
export async function handleTwilioIvr(req: Request, res: Response): Promise<void> {
  const { scheduleId, language } = req.query;

  if (!scheduleId || typeof scheduleId !== 'string') {
    logger.warn('[WEBHOOK] Twilio IVR request missing scheduleId');
    res.status(400).send('Missing scheduleId');
    return;
  }

  const lang = language === 'hi' || language === 'en' ? language : 'en';
  logger.info('[WEBHOOK] Twilio IVR — generating TwiML', { scheduleId, language: lang });

  const twiml = callService.generateCallTwiML(scheduleId, lang);
  res.type('text/xml').send(twiml);
}

/**
 * Twilio IVR response — receives DTMF gather results and maps to business logic.
 * Called when the user presses a digit (or the gather times out).
 */
export async function handleTwilioIvrResponse(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, string>;

  // Twilio sends CallSid and optionally Digits (empty string if timeout)
  const mapped: IvrWebhookPayload = {
    CallSid: payload.CallSid ?? '',
    DialCallStatus: payload.DialCallStatus ?? '',
    Digits: payload.Digits ?? '',
    To: payload.To ?? '',
    From: payload.From ?? '',
  };

  logger.info('[WEBHOOK] Twilio IVR response received', {
    callSid: mapped.CallSid,
    digits: mapped.Digits || '(timeout/no input)',
  });

  await callService.handleIvrResponse(mapped);

  // Twilio expects TwiML in response to the gather action.
  // Return a short confirmation message, which Twilio will play before hanging up.
  const message =
    mapped.Digits === '1'
      ? 'Dhanyawaad. Humne aapke parivaar ko suchit kar diya. Thank you. Your family has been notified.'
      : 'Theek hai. Kripya jaldi apni dawai lein. Okay. Please take your medicine soon.';

  res.type('text/xml').send(`<Response><Say>${message}</Say></Response>`);
}

/**
 * Twilio call status webhook — receives call lifecycle events and maps to retry/status logic.
 */
export async function handleTwilioStatus(req: Request, res: Response): Promise<void> {
  const payload = req.body as Record<string, string>;

  // Twilio sends CallStatus (not Status), CallSid, etc.
  const mapped: CallStatusWebhookPayload = {
    CallSid: payload.CallSid ?? '',
    Status: payload.CallStatus ?? payload.Status ?? 'unknown',
    To: payload.To ?? '',
    From: payload.From ?? '',
    Duration: payload.CallDuration ?? payload.Duration,
  };

  logger.info('[WEBHOOK] Twilio status received', {
    callSid: mapped.CallSid,
    status: mapped.Status,
  });

  await callService.handleCallStatusUpdate(mapped);
  res.status(200).end();
}