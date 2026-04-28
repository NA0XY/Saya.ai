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
  async initiateMedicationCall(params: { scheduleId: string; to: string; drugName: string; attemptNumber?: number }): Promise<CallLog> {
    const schedule = await medicationRepository.findScheduleById(params.scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');

    // Avoid extra attempts by cancelling any pending retry jobs before starting a call.
    await retryService.cancelRetries(schedule.id);

    const call = await twilioClient.makeCall({
      to: params.to,
      drugName: params.drugName,
      scheduleId: params.scheduleId,
    });

    const log = await medicationRepository.createCallLog({
      schedule_id: schedule.id,
      patient_id: schedule.patient_id,
      exotel_call_sid: call.callSid,
      status: 'initiated',
      attempt_number: params.attemptNumber ?? 1,
      initiated_at: isoNow(),
      answered_at: null,
      ivr_response: null,
    });

    logger.info('[CALL] Medication reminder initiated', {
      scheduleId: schedule.id,
      callSid: call.callSid,
      attemptNumber: params.attemptNumber ?? 1,
      drugName: params.drugName,
    });

    return log;
  },

  async initiateCall(scheduleId: string, attemptNumber: number): Promise<CallLog> {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    const patient = await patientRepository.findById(schedule.patient_id);
    if (!patient) throw ApiError.notFound('Patient');
    return callService.initiateMedicationCall({
      scheduleId: schedule.id,
      to: patient.phone,
      drugName: schedule.medicine_name,
      attemptNumber,
    });
  },

  async handleIvrResponse(payload: IvrWebhookPayload): Promise<void> {
    const log = await medicationRepository.findCallLogBySid(payload.CallSid);
    if (!log) {
      logger.warn('[CALL] Unknown CallSid in IVR response, ignoring', { callSid: payload.CallSid });
      return;
    }

    const digit = payload.Digits === '1' || payload.Digits === '2' ? payload.Digits : null;

    if (log.ivr_response === digit && ['confirmed', 'rejected'].includes(log.status)) {
      logger.debug('[CALL] Duplicate IVR webhook ignored', { callSid: payload.CallSid, digit: digit ?? '(empty)' });
      return;
    }

    const schedule = await medicationRepository.findScheduleById(log.schedule_id);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    const patient = await patientRepository.findById(log.patient_id);
    if (!patient) throw ApiError.notFound('Patient');
    const contacts = await patientRepository.findEscalationContacts(patient.id);

    if (digit === '1') {
      await medicationRepository.updateCallLog(log.id, { status: 'confirmed', ivr_response: '1', answered_at: isoNow() });
      await retryService.cancelRetries(schedule.id);
      await smsService.sendMedicationConfirmedSms(patient.full_name, schedule.medicine_name, contacts, schedule.language);
    } else if (digit === '2') {
      const updated = await medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: '2', answered_at: isoNow() });
      if (contacts.length > 0) {
        logger.info('[CALL] Sending intentional-refusal SMS to guardians', { scheduleId: log.schedule_id, contactCount: contacts.length });
        await smsService.sendIntentionalRefusalSms(patient.full_name, schedule.medicine_name, contacts, 'Saya.ai');
      }
      // Do not retry when user explicitly rejected via IVR
    } else if (digit === null) {
      const updated = await medicationRepository.updateCallLog(log.id, { status: 'no_answer', ivr_response: null, answered_at: null });
      // Immediate retry if attempts remain
      if (updated.attempt_number < env.MAX_CALL_RETRIES) {
        await retryService.cancelRetries(updated.schedule_id);
        logger.info('[CALL] No input — initiating immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
        await callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
      } else {
        // Final attempt exhausted — send final missed SMS/alert
        await retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
      }
      return;
    } else {
      const updated = await medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: digit, answered_at: isoNow() });
      if (updated.attempt_number < env.MAX_CALL_RETRIES) {
        logger.info('[CALL] IVR response not recognized — scheduling immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
        await callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
      } else {
        await retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
      }
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

    if ((log.status === 'confirmed' || log.status === 'rejected') && status === 'answered') {
      logger.debug('[CALL] Terminal IVR state preserved', { callSid: payload.CallSid, status: log.status });
      return;
    }

    const updated = await medicationRepository.updateCallLog(log.id, {
      status,
      answered_at: status === 'answered' ? isoNow() : log.answered_at,
    });

    if (status === 'no_answer' || status === 'failed') {
      const schedule = await medicationRepository.findScheduleById(log.schedule_id);
      const patient = await patientRepository.findById(log.patient_id);
      if (schedule && patient) {
        const contacts = await patientRepository.findEscalationContacts(patient.id);
        if (updated.attempt_number < env.MAX_CALL_RETRIES) {
          await retryService.cancelRetries(updated.schedule_id);
          logger.info('[CALL] Call not received — initiating immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
          await callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
        } else {
          // Exhausted attempts; final SMS/alert
          await retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
        }
      }
      return;
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
