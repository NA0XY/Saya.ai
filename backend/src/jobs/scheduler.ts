import { logger } from '../config/logger';
import { dailyNewsRefreshJob } from './dailyNewsRefresh.job';
import { emotionalEscalationJob } from './emotionalEscalation.job';
import { medicationReminderJob } from './medicationReminder.job';
import { retryMissedCallsJob } from './retryMissedCalls.job';

export function startScheduler(): void {
  medicationReminderJob();
  logger.info('[SCHEDULER] Registered medication reminder job');
  retryMissedCallsJob();
  logger.info('[SCHEDULER] Registered retry missed calls job');
  emotionalEscalationJob();
  logger.info('[SCHEDULER] Registered emotional escalation job');
  dailyNewsRefreshJob();
  logger.info('[SCHEDULER] Registered daily news refresh job');
}
