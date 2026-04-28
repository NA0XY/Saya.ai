"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyNewsRefreshJob = dailyNewsRefreshJob;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../config/logger");
const news_service_1 = require("../modules/news/news.service");
function dailyNewsRefreshJob() {
    return node_cron_1.default.schedule('30 0 * * *', async () => {
        try {
            await news_service_1.newsService.refreshNews();
            logger_1.logger.info('[JOB] Daily news refreshed');
        }
        catch (error) {
            logger_1.logger.error('[JOB] Daily news refresh failed', { error: error instanceof Error ? error.message : String(error) });
        }
    });
}
//# sourceMappingURL=dailyNewsRefresh.job.js.map