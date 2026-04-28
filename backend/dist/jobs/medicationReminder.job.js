"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationReminderJob = medicationReminderJob;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../config/logger");
const dateTime_1 = require("../utils/dateTime");
const medication_repository_1 = require("../modules/medications/medication.repository");
const call_service_1 = require("../modules/calls/call.service");
function medicationReminderJob() {
    return node_cron_1.default.schedule('* * * * *', async () => {
        const currentTime = (0, dateTime_1.formatIST)(new Date(), 'HH:mm');
        try {
            const schedules = (await medication_repository_1.medicationRepository.findActiveSchedules()).filter((schedule) => schedule.scheduled_time === currentTime);
            for (const schedule of schedules) {
                try {
                    const attempts = await medication_repository_1.medicationRepository.countAttemptsToday(schedule.id);
                    const logs = await medication_repository_1.medicationRepository.findCallLogsBySchedule(schedule.id);
                    const calledToday = logs.some((log) => log.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
                    if (!calledToday && attempts === 0)
                        await call_service_1.callService.initiateCall(schedule.id, 1);
                }
                catch (error) {
                    logger_1.logger.error('[JOB] Medication reminder schedule failed', { scheduleId: schedule.id, error: error instanceof Error ? error.message : String(error) });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('[JOB] Medication reminder job failed', { error: error instanceof Error ? error.message : String(error) });
        }
    });
}
//# sourceMappingURL=medicationReminder.job.js.map