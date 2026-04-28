import type { Request, Response } from 'express';
import twilio from 'twilio';
import { logger } from '../config/logger';
import { callService } from '../modules/calls/call.service';
import { medicationRepository } from '../modules/medications/medication.repository';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './webhook.types';

/**
 * Twilio voice entrypoint — returns TwiML instructions when a call connects.
 * Twilio fetches this URL (the `url` param from call creation) to get instructions.
 */
export async function handleTwilioVoice(req: Request, res: Response): Promise<void> {
  const { drugName, scheduleId } = req.query;

  let resolvedDrugName = typeof drugName === 'string' && drugName.trim().length > 0 ? drugName.trim() : '';
  let customMessage: string | null = null;
  let language: 'hi' | 'en' = 'en';

  if (typeof scheduleId === 'string' && scheduleId.trim().length > 0) {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (schedule) {
      if (!resolvedDrugName) {
        resolvedDrugName = schedule.medicine_name;
      }
      customMessage = schedule.custom_message;
      language = schedule.language;
      logger.info('[WEBHOOK] Fetched schedule for voice', { scheduleId, medicineName: resolvedDrugName, hasCustomMessage: !!customMessage, language });
    } else {
      logger.warn('[WEBHOOK] Schedule not found in DB', { scheduleId });
    }
  }

  if (!resolvedDrugName) {
    logger.warn('[WEBHOOK] Twilio voice request missing drug name', { scheduleId: typeof scheduleId === 'string' ? scheduleId : undefined });
  }

  const { VoiceResponse } = twilio.twiml;
  const twiml = new VoiceResponse();
  const promptDrug = resolvedDrugName || 'your medicine';
  const voiceLanguage = language === 'hi' ? 'hi-IN' : 'en-IN';
  const voiceName = 'Polly.Aditi';

  const medicineLine = language === 'hi'
    ? `Kripya abhi apni ${promptDrug} ki dawai lijiye.`
    : `Please take your ${promptDrug} medicine now.`;

  logger.info('[WEBHOOK] Generated reminder script', { promptDrug, customMessage, language });

  twiml.say({ voice: voiceName, language: voiceLanguage }, medicineLine);
  twiml.pause({ length: 2 });
  if (customMessage) {
    twiml.pause({ length: 2 });
    twiml.say({ voice: voiceName, language: voiceLanguage }, customMessage);
  }

  twiml.pause({ length: 2 });
  twiml.say({ voice: voiceName, language: voiceLanguage }, language === 'hi'
    ? 'Ab beep ke baad ek dabaiye agar dawai le li hai. Do dabaiye agar nahi li hai.'
    : 'After the beep, press 1 if you have taken the medicine. Press 2 if you have not taken it.');
  twiml.pause({ length: 1 });

  const gather = twiml.gather({
    numDigits: 1,
    action: '/webhooks/twilio/ivr-response',
    method: 'POST',
    timeout: 15,
    actionOnEmptyResult: true,
  });

  res.type('text/xml').send(twiml.toString());
}

export const handleTwilioIvr = handleTwilioVoice;

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