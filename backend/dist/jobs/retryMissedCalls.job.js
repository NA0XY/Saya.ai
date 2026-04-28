"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryMissedCallsJob = retryMissedCallsJob;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../config/logger");
const dateTime_1 = require("../utils/dateTime");
const medication_repository_1 = require("../modules/medications/medication.repository");
const retry_service_1 = require("../modules/calls/retry.service");
function retryMissedCallsJob() {
    return node_cron_1.default.schedule('*/3 * * * *', async () => {
        try {
            const jobs = await medication_repository_1.medicationRepository.findDueRetryJobs((0, dateTime_1.isoNow)());
            for (const job of jobs) {
                try {
                    await retry_service_1.retryService.processDueRetryJob(job);
                }
                catch {
                    continue;
                }
            }
        }
        catch (error) {
            logger_1.logger.error('[JOB] Retry missed calls failed', { error: error instanceof Error ? error.message : String(error) });
        }
    });
}
//# sourceMappingURL=retryMissedCalls.job.js.map