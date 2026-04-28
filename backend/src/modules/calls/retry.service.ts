import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import { formatIST, isoNow } from '../../utils/dateTime';
import { patientRepository } from '../patients/patient.repository';
import { medicationRepository } from '../medications/medication.repository';
import { alertService } from '../alerts/alert.service';
import { smsService } from './sms.service';
import type { CallRetryJob } from '../../types/database';

export const retryService = {
  async scheduleRetry(scheduleId: string, _callLogId: string, attemptNumber: number): Promise<void> {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    const occurrenceDate = formatIST(new Date(), 'yyyy-MM-dd');
    if (attemptNumber >= env.MAX_CALL_RETRIES) {
      if (await medicationRepository.hasFinalAlertBeenSent(scheduleId, occurrenceDate)) return;
      const patient = await patientRepository.findById(schedule.patient_id);
      if (!patient) throw ApiError.notFound('Patient');
      const contacts = await patientRepository.findEscalationContacts(patient.id);
      await smsService.sendMedicationMissedSms(patient.full_name, schedule.medicine_name, contacts, 'Saya.ai');
      await alertService.createAlert({ patient_id: patient.id, caregiver_id: schedule.caregiver_id, alert_type: 'missed_medication', message: `${patient.full_name} missed ${schedule.medicine_name} after ${attemptNumber} attempts` });
      await medicationRepository.createRetryJob({ schedule_id: schedule.id, call_log_id: _callLogId, patient_id: patient.id, attempt_number: attemptNumber, occurrence_date: occurrenceDate, run_at: isoNow(), status: 'completed', final_alert_sent: true });
      return;
    }
    const nextAttempt = attemptNumber + 1;
    const existing = await medicationRepository.findPendingRetryJob(scheduleId, nextAttempt, occurrenceDate);
    if (existing) return;
    const runAt = new Date(Date.now() + env.RETRY_INTERVAL_MINUTES * 60 * 1000).toISOString();
    await medicationRepository.createRetryJob({ schedule_id: schedule.id, call_log_id: _callLogId, patient_id: schedule.patient_id, attempt_number: nextAttempt, occurrence_date: occurrenceDate, run_at: runAt, status: 'pending', final_alert_sent: false });
    logger.info('[CALL] Retry scheduled', { scheduleId, nextAttempt: attemptNumber + 1 });
  },
  async cancelRetries(scheduleId: string): Promise<void> {
    await medicationRepository.cancelRetryJobs(scheduleId);
  },
  async processDueRetryJob(job: CallRetryJob): Promise<void> {
    const processing = await medicationRepository.updateRetryJob(job.id, { status: 'processing' });
    try {
      const { callService } = await import('./call.service');
      await callService.initiateCall(processing.schedule_id, processing.attempt_number);
      await medicationRepository.updateRetryJob(processing.id, { status: 'completed' });
    } catch (error) {
      await medicationRepository.updateRetryJob(processing.id, { status: 'failed' });
      logger.error('[CALL] Persistent retry failed', { retryJobId: processing.id, scheduleId: processing.schedule_id, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
};
