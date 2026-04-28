"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationReminderJob = medicationReminderJob;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../config/logger");
const dateTime_1 = require("../utils/dateTime");
const patient_repository_1 = require("../modules/patients/patient.repository");
const medication_repository_1 = require("../modules/medications/medication.repository");
const call_service_1 = require("../modules/calls/call.service");
function medicationReminderJob() {
    return node_cron_1.default.schedule('* * * * *', async () => {
        const now = new Date();
        const localTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentTime = (0, dateTime_1.convertLocalTimeToIst)(localTime);
        try {
            const schedules = (await medication_repository_1.medicationRepository.findActiveSchedules()).filter((schedule) => schedule.scheduled_time === currentTime);
            if (schedules.length > 0) {
                logger_1.logger.info('[JOB] Medication reminder job matching schedules', { currentTime, scheduleCount: schedules.length });
            }
            for (const schedule of schedules) {
                try {
                    const patient = await patient_repository_1.patientRepository.findById(schedule.patient_id);
                    if (!patient) {
                        logger_1.logger.warn('[JOB] Medication reminder skipped; patient missing', { scheduleId: schedule.id, patientId: schedule.patient_id });
                        continue;
                    }
                    logger_1.logger.debug('[JOB] Patient loaded for reminder', { scheduleId: schedule.id, patientId: patient.id, patientPhone: patient.phone });
                    const attempts = await medication_repository_1.medicationRepository.countAttemptsToday(schedule.id);
                    const logs = await medication_repository_1.medicationRepository.findCallLogsBySchedule(schedule.id);
                    const calledToday = logs.some((log) => log.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10));
                    if (!calledToday && attempts === 0) {
                        logger_1.logger.info('[JOB] Initiating medication call', { scheduleId: schedule.id, to: patient.phone, drugName: schedule.medicine_name });
                        await call_service_1.callService.initiateMedicationCall({
                            scheduleId: schedule.id,
                            to: patient.phone,
                            drugName: schedule.medicine_name,
                            attemptNumber: 1,
                        });
                    }
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