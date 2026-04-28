"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryService = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
const dateTime_1 = require("../../utils/dateTime");
const patient_repository_1 = require("../patients/patient.repository");
const medication_repository_1 = require("../medications/medication.repository");
const alert_service_1 = require("../alerts/alert.service");
const sms_service_1 = require("./sms.service");
exports.retryService = {
    async scheduleRetry(scheduleId, _callLogId, attemptNumber) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        const occurrenceDate = (0, dateTime_1.formatIST)(new Date(), 'yyyy-MM-dd');
        if (attemptNumber >= env_1.env.MAX_CALL_RETRIES) {
            if (await medication_repository_1.medicationRepository.hasFinalAlertBeenSent(scheduleId, occurrenceDate))
                return;
            const patient = await patient_repository_1.patientRepository.findById(schedule.patient_id);
            if (!patient)
                throw apiError_1.ApiError.notFound('Patient');
            const contacts = await patient_repository_1.patientRepository.findEscalationContacts(patient.id);
            await sms_service_1.smsService.sendMedicationMissedSms(patient.full_name, schedule.medicine_name, contacts, 'Saya.ai');
            await alert_service_1.alertService.createAlert({ patient_id: patient.id, caregiver_id: schedule.caregiver_id, alert_type: 'missed_medication', message: `${patient.full_name} missed ${schedule.medicine_name} after ${attemptNumber} attempts` });
            await medication_repository_1.medicationRepository.createRetryJob({ schedule_id: schedule.id, call_log_id: _callLogId, patient_id: patient.id, attempt_number: attemptNumber, occurrence_date: occurrenceDate, run_at: (0, dateTime_1.isoNow)(), status: 'completed', final_alert_sent: true });
            return;
        }
        const nextAttempt = attemptNumber + 1;
        const existing = await medication_repository_1.medicationRepository.findPendingRetryJob(scheduleId, nextAttempt, occurrenceDate);
        if (existing)
            return;
        const runAt = new Date(Date.now() + env_1.env.RETRY_INTERVAL_MINUTES * 60 * 1000).toISOString();
        await medication_repository_1.medicationRepository.createRetryJob({ schedule_id: schedule.id, call_log_id: _callLogId, patient_id: schedule.patient_id, attempt_number: nextAttempt, occurrence_date: occurrenceDate, run_at: runAt, status: 'pending', final_alert_sent: false });
        logger_1.logger.info('[CALL] Retry scheduled', { scheduleId, nextAttempt: attemptNumber + 1 });
    },
    async cancelRetries(scheduleId) {
        await medication_repository_1.medicationRepository.cancelRetryJobs(scheduleId);
    },
    async processDueRetryJob(job) {
        const processing = await medication_repository_1.medicationRepository.updateRetryJob(job.id, { status: 'processing' });
        try {
            const { callService } = await Promise.resolve().then(() => __importStar(require('./call.service')));
            await callService.initiateCall(processing.schedule_id, processing.attempt_number);
            await medication_repository_1.medicationRepository.updateRetryJob(processing.id, { status: 'completed' });
        }
        catch (error) {
            await medication_repository_1.medicationRepository.updateRetryJob(processing.id, { status: 'failed' });
            logger_1.logger.error('[CALL] Persistent retry failed', { retryJobId: processing.id, scheduleId: processing.schedule_id, error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
};
//# sourceMappingURL=retry.service.js.map