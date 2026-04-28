import cron, { ScheduledTask } from 'node-cron';
import { logger } from '../config/logger';
import { newsService } from '../modules/news/news.service';

export function dailyNewsRefreshJob(): ScheduledTask {
  return cron.schedule('30 0 * * *', async () => {
    try {
      await newsService.refreshNews();
      logger.info('[JOB] Daily news refreshed');
    } catch (error) {
      logger.error('[JOB] Daily news refresh failed', { error: error instanceof Error ? error.message : String(error) });
    }
  });
}
