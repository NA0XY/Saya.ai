import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../config/logger';
import { formatIST } from '../utils/dateTime';
import { medicationRepository } from '../modules/medications/medication.repository';
import { callService } from '../modules/calls/call.service';

export function medicationReminderJob(): ScheduledTask {
  return cron.schedule('* * * * *', async () => {
    const currentTime = formatIST(new Date(), 'HH:mm');
    try {
      const schedules = (await medicationRepository.findActiveSchedules()).filter((schedule) => schedule.scheduled_time === currentTime);
      for (const schedule of schedules) {
        try {
          const attempts = await medicationRepository.countAttemptsToday(schedule.id);
          const logs = await medicationRepository.findCallLogsBySchedule(schedule.id);
          const calledToday = logs.some((log) => log.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
          if (!calledToday && attempts === 0) await callService.initiateCall(schedule.id, 1);
        } catch (error) {
          logger.error('[JOB] Medication reminder schedule failed', { scheduleId: schedule.id, error: error instanceof Error ? error.message : String(error) });
        }
      }
    } catch (error) {
      logger.error('[JOB] Medication reminder job failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
