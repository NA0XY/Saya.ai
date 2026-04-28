"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
const logger_1 = require("../config/logger");
const dailyNewsRefresh_job_1 = require("./dailyNewsRefresh.job");
const emotionalEscalation_job_1 = require("./emotionalEscalation.job");
const medicationReminder_job_1 = require("./medicationReminder.job");
const retryMissedCalls_job_1 = require("./retryMissedCalls.job");
function startScheduler() {
    (0, medicationReminder_job_1.medicationReminderJob)();
    logger_1.logger.info('[SCHEDULER] Registered medication reminder job');
    (0, retryMissedCalls_job_1.retryMissedCallsJob)();
    logger_1.logger.info('[SCHEDULER] Registered retry missed calls job');
    (0, emotionalEscalation_job_1.emotionalEscalationJob)();
    logger_1.logger.info('[SCHEDULER] Registered emotional escalation job');
    (0, dailyNewsRefresh_job_1.dailyNewsRefreshJob)();
    logger_1.logger.info('[SCHEDULER] Registered daily news refresh job');
}
//# sourceMappingURL=scheduler.js.map