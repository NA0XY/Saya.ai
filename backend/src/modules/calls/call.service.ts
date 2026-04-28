import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import { isoNow } from '../../utils/dateTime';
import { buildMedicationReminderScript } from '../../utils/language';
import { patientRepository } from '../patients/patient.repository';
import { medicationRepository } from '../medications/medication.repository';
import type { CallLog } from '../../types/database';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './call.types';
import { exotelClient } from './exotel.client';
import { retryService } from './retry.service';
import { smsService } from './sms.service';
import { ttsService } from './tts.service';

function mapStatus(status: string): CallLog['status'] {
  const normalized = status.toLowerCase().replace('-', '_');
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
    const script = buildMedicationReminderScript(schedule.medicine_name, schedule.custom_message, schedule.language);
    const audioUrl = await ttsService.synthesizeToUrl(script, schedule.language, schedule.id);
    const call = await exotelClient.initiateCall({ to: patient.phone, from: env.EXOTEL_CALLER_ID, callerId: env.EXOTEL_CALLER_ID, statusCallback: `${env.BACKEND_URL}/webhooks/exotel/status`, customField: schedule.id, audioUrl });
    const log = await medicationRepository.createCallLog({ schedule_id: schedule.id, patient_id: patient.id, exotel_call_sid: call.sid, status: 'initiated', attempt_number: attemptNumber, initiated_at: isoNow(), answered_at: null, ivr_response: null });
    logger.info('[CALL] Medication reminder initiated', { scheduleId, callSid: call.sid, attemptNumber });
    return log;
  },
  async handleIvrResponse(payload: IvrWebhookPayload): Promise<void> {
    const log = await medicationRepository.findCallLogBySid(payload.CallSid);
    if (!log) throw ApiError.notFound('Call log');
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
    const log = await medicationRepository.findCallLogBySid(payload.CallSid);
    if (!log) return;
    const status = mapStatus(payload.Status);
    const updated = await medicationRepository.updateCallLog(log.id, { status, answered_at: status === 'answered' ? isoNow() : log.answered_at });
    if (status === 'no_answer' || status === 'failed') await retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
  }
};
