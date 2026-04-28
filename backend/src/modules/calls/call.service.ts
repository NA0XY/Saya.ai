import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import { isoNow } from '../../utils/dateTime';
import { buildIvrPrompt, buildMedicationReminderScript } from '../../utils/language';
import { patientRepository } from '../patients/patient.repository';
import { medicationRepository } from '../medications/medication.repository';
import type { CallLog } from '../../types/database';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './call.types';
import { twilioClient } from './twilio.client';
import { retryService } from './retry.service';
import { smsService } from './sms.service';

function mapStatus(status: string): CallLog['status'] {
  const normalized = status.toLowerCase().replace(/-/g, '_');
  if (['completed', 'answered', 'in_progress'].includes(normalized)) return 'answered';
  if (['no_answer', 'busy', 'canceled'].includes(normalized)) return 'no_answer';
  if (['failed'].includes(normalized)) return 'failed';
  return 'initiated';
}

export const callService = {
  async initiateCall(scheduleId: string, attemptNumber: number): Promise<CallLog> {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    const patient = await patientRepository.findById(schedule.patient_id);
    if (!patient) throw ApiError.notFound('Patient');

    const twimlUrl = `${env.BACKEND_URL}/webhooks/twilio/ivr?scheduleId=${encodeURIComponent(schedule.id)}&language=${encodeURIComponent(schedule.language)}`;
    const statusCallback = `${env.BACKEND_URL}/webhooks/twilio/status`;

    const call = await twilioClient.makeCall({
      to: patient.phone,
      twimlUrl,
      statusCallback,
      scheduleId: schedule.id,
    });

    const log = await medicationRepository.createCallLog({
      schedule_id: schedule.id,
      patient_id: patient.id,
      exotel_call_sid: call.callSid,
      status: 'initiated',
      attempt_number: attemptNumber,
      initiated_at: isoNow(),
      answered_at: null,
      ivr_response: null,
    });

    logger.info('[CALL] Medication reminder initiated', { scheduleId, callSid: call.callSid, attemptNumber });
    return log;
  },

  async handleIvrResponse(payload: IvrWebhookPayload): Promise<void> {
    const log = await medicationRepository.findCallLogBySid(payload.CallSid);
    if (!log) {
      logger.warn('[CALL] Unknown CallSid in IVR response, ignoring', { callSid: payload.CallSid });
      return;
    }

    const schedule = await medicationRepository.findScheduleById(log.schedule_id);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    const patient = await patientRepository.findById(log.patient_id);
    if (!patient) throw ApiError.notFound('Patient');
    const contacts = await patientRepository.findEscalationContacts(patient.id);

    if (payload.Digits === '1') {
      await medicationRepository.updateCallLog(log.id, { status: 'confirmed', ivr_response: '1', answered_at: isoNow() });
      await retryService.cancelRetries(schedule.id);
      await smsService.sendMedicationConfirmedSms(patient.full_name, schedule.medicine_name, contacts, schedule.language);
    } else {
      await medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: payload.Digits === '2' ? '2' : null, answered_at: isoNow() });
    }
  },

  async handleCallStatusUpdate(payload: CallStatusWebhookPayload): Promise<void> {
    // Idempotency: skip if we've already processed this exact status for this call
    const log = await medicationRepository.findCallLogBySid(payload.CallSid);
    if (!log) {
      logger.warn('[CALL] Unknown CallSid in status update, ignoring', { callSid: payload.CallSid });
      return;
    }

    const status = mapStatus(payload.Status);

    // Skip if status hasn't changed (idempotency guard against duplicate webhooks)
    if (log.status === status) {
      logger.debug('[CALL] Status unchanged, skipping duplicate webhook', { callSid: payload.CallSid, status });
      return;
    }

    const updated = await medicationRepository.updateCallLog(log.id, {
      status,
      answered_at: status === 'answered' ? isoNow() : log.answered_at,
    });

    if (status === 'no_answer' || status === 'failed') {
      await retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
    }
  },

  /**
   * Generate TwiML for the IVR call flow.
   * Called by the webhook handler when Twilio requests instructions for a connected call.
   */
  generateCallTwiML(scheduleId: string, language: 'hi' | 'en'): string {
    const script = buildIvrPrompt(language);
    const actionUrl = `${env.BACKEND_URL}/webhooks/twilio/ivr-response`;

    return twilioClient.generateTwiML({
      message: script,
      gather: true,
      language,
      actionUrl,
    });
  },
};
