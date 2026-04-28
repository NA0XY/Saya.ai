import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../config/logger';
import { isoNow } from '../utils/dateTime';
import { medicationRepository } from '../modules/medications/medication.repository';
import { retryService } from '../modules/calls/retry.service';

export function retryMissedCallsJob(): ScheduledTask {
  return cron.schedule('*/3 * * * *', async () => {
    try {
      const jobs = await medicationRepository.findDueRetryJobs(isoNow());
      for (const job of jobs) {
        try {
          await retryService.processDueRetryJob(job);
        } catch {
          continue;
        }
      }
    } catch (error) {
      logger.error('[JOB] Retry missed calls failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
