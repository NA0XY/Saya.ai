import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../config/logger';
import { convertLocalTimeToIst } from '../utils/dateTime';
import { patientRepository } from '../modules/patients/patient.repository';
import { medicationRepository } from '../modules/medications/medication.repository';
import { callService } from '../modules/calls/call.service';

export function medicationReminderJob(): ScheduledTask {
  return cron.schedule('* * * * *', async () => {
    const now = new Date();
    const localTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentTime = convertLocalTimeToIst(localTime);
    try {
      const schedules = (await medicationRepository.findActiveSchedules()).filter((schedule) => schedule.scheduled_time === currentTime);
      if (schedules.length > 0) {
        logger.info('[JOB] Medication reminder job matching schedules', { currentTime, scheduleCount: schedules.length });
      }
      for (const schedule of schedules) {
        try {
          const patient = await patientRepository.findById(schedule.patient_id);
          if (!patient) {
            logger.warn('[JOB] Medication reminder skipped; patient missing', { scheduleId: schedule.id, patientId: schedule.patient_id });
            continue;
          }

          logger.debug('[JOB] Patient loaded for reminder', { scheduleId: schedule.id, patientId: patient.id, patientPhone: patient.phone });

          const attempts = await medicationRepository.countAttemptsToday(schedule.id);
          const logs = await medicationRepository.findCallLogsBySchedule(schedule.id);
          const calledToday = logs.some((log) => log.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
          if (!calledToday && attempts === 0) {
            logger.info('[JOB] Initiating medication call', { scheduleId: schedule.id, to: patient.phone, drugName: schedule.medicine_name });
            await callService.initiateMedicationCall({
              scheduleId: schedule.id,
              to: patient.phone,
              drugName: schedule.medicine_name,
              attemptNumber: 1,
            });
          }
        } catch (error) {
          logger.error('[JOB] Medication reminder schedule failed', { scheduleId: schedule.id, error: error instanceof Error ? error.message : String(error) });
        }
      }
    } catch (error) {
      logger.error('[JOB] Medication reminder job failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
