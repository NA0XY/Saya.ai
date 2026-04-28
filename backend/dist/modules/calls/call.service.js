"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callService = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
const dateTime_1 = require("../../utils/dateTime");
const language_1 = require("../../utils/language");
const patient_repository_1 = require("../patients/patient.repository");
const medication_repository_1 = require("../medications/medication.repository");
const twilio_client_1 = require("./twilio.client");
const retry_service_1 = require("./retry.service");
const sms_service_1 = require("./sms.service");
function mapStatus(status) {
    const normalized = status.toLowerCase().replace(/-/g, '_');
    if (['completed', 'answered', 'in_progress'].includes(normalized))
        return 'answered';
    if (['no_answer', 'busy', 'canceled'].includes(normalized))
        return 'no_answer';
    if (['failed'].includes(normalized))
        return 'failed';
    return 'initiated';
}
exports.callService = {
    async initiateMedicationCall(params) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(params.scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        // Avoid extra attempts by cancelling any pending retry jobs before starting a call.
        await retry_service_1.retryService.cancelRetries(schedule.id);
        const call = await twilio_client_1.twilioClient.makeCall({
            to: params.to,
            drugName: params.drugName,
            scheduleId: params.scheduleId,
        });
        const log = await medication_repository_1.medicationRepository.createCallLog({
            schedule_id: schedule.id,
            patient_id: schedule.patient_id,
            exotel_call_sid: call.callSid,
            status: 'initiated',
            attempt_number: params.attemptNumber ?? 1,
            initiated_at: (0, dateTime_1.isoNow)(),
            answered_at: null,
            ivr_response: null,
        });
        logger_1.logger.info('[CALL] Medication reminder initiated', {
            scheduleId: schedule.id,
            callSid: call.callSid,
            attemptNumber: params.attemptNumber ?? 1,
            drugName: params.drugName,
        });
        return log;
    },
    async initiateCall(scheduleId, attemptNumber) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        const patient = await patient_repository_1.patientRepository.findById(schedule.patient_id);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        return exports.callService.initiateMedicationCall({
            scheduleId: schedule.id,
            to: patient.phone,
            drugName: schedule.medicine_name,
            attemptNumber,
        });
    },
    async handleIvrResponse(payload) {
        const log = await medication_repository_1.medicationRepository.findCallLogBySid(payload.CallSid);
        if (!log) {
            logger_1.logger.warn('[CALL] Unknown CallSid in IVR response, ignoring', { callSid: payload.CallSid });
            return;
        }
        const digit = payload.Digits === '1' || payload.Digits === '2' ? payload.Digits : null;
        if (log.ivr_response === digit && ['confirmed', 'rejected'].includes(log.status)) {
            logger_1.logger.debug('[CALL] Duplicate IVR webhook ignored', { callSid: payload.CallSid, digit: digit ?? '(empty)' });
            return;
        }
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(log.schedule_id);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        const patient = await patient_repository_1.patientRepository.findById(log.patient_id);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        const contacts = await patient_repository_1.patientRepository.findEscalationContacts(patient.id);
        if (digit === '1') {
            await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'confirmed', ivr_response: '1', answered_at: (0, dateTime_1.isoNow)() });
            await retry_service_1.retryService.cancelRetries(schedule.id);
            await sms_service_1.smsService.sendMedicationConfirmedSms(patient.full_name, schedule.medicine_name, contacts, schedule.language);
        }
        else if (digit === '2') {
            const updated = await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: '2', answered_at: (0, dateTime_1.isoNow)() });
            if (contacts.length > 0) {
                logger_1.logger.info('[CALL] Sending intentional-refusal SMS to guardians', { scheduleId: log.schedule_id, contactCount: contacts.length });
                await sms_service_1.smsService.sendIntentionalRefusalSms(patient.full_name, schedule.medicine_name, contacts, 'Saya.ai');
            }
            // Do not retry when user explicitly rejected via IVR
        }
        else if (digit === null) {
            const updated = await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'no_answer', ivr_response: null, answered_at: null });
            // Immediate retry if attempts remain
            if (updated.attempt_number < env_1.env.MAX_CALL_RETRIES) {
                await retry_service_1.retryService.cancelRetries(updated.schedule_id);
                logger_1.logger.info('[CALL] No input — initiating immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
                await exports.callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
            }
            else {
                // Final attempt exhausted — send final missed SMS/alert
                await retry_service_1.retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
            }
            return;
        }
        else {
            const updated = await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: digit, answered_at: (0, dateTime_1.isoNow)() });
            if (updated.attempt_number < env_1.env.MAX_CALL_RETRIES) {
                logger_1.logger.info('[CALL] IVR response not recognized — scheduling immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
                await exports.callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
            }
            else {
                await retry_service_1.retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
            }
        }
    },
    async handleCallStatusUpdate(payload) {
        // Idempotency: skip if we've already processed this exact status for this call
        const log = await medication_repository_1.medicationRepository.findCallLogBySid(payload.CallSid);
        if (!log) {
            logger_1.logger.warn('[CALL] Unknown CallSid in status update, ignoring', { callSid: payload.CallSid });
            return;
        }
        const status = mapStatus(payload.Status);
        // Skip if status hasn't changed (idempotency guard against duplicate webhooks)
        if (log.status === status) {
            logger_1.logger.debug('[CALL] Status unchanged, skipping duplicate webhook', { callSid: payload.CallSid, status });
            return;
        }
        if ((log.status === 'confirmed' || log.status === 'rejected') && status === 'answered') {
            logger_1.logger.debug('[CALL] Terminal IVR state preserved', { callSid: payload.CallSid, status: log.status });
            return;
        }
        const updated = await medication_repository_1.medicationRepository.updateCallLog(log.id, {
            status,
            answered_at: status === 'answered' ? (0, dateTime_1.isoNow)() : log.answered_at,
        });
        if (status === 'no_answer' || status === 'failed') {
            const schedule = await medication_repository_1.medicationRepository.findScheduleById(log.schedule_id);
            const patient = await patient_repository_1.patientRepository.findById(log.patient_id);
            if (schedule && patient) {
                const contacts = await patient_repository_1.patientRepository.findEscalationContacts(patient.id);
                if (updated.attempt_number < env_1.env.MAX_CALL_RETRIES) {
                    await retry_service_1.retryService.cancelRetries(updated.schedule_id);
                    logger_1.logger.info('[CALL] Call not received — initiating immediate retry', { scheduleId: updated.schedule_id, nextAttempt: updated.attempt_number + 1 });
                    await exports.callService.initiateCall(updated.schedule_id, updated.attempt_number + 1);
                }
                else {
                    // Exhausted attempts; final SMS/alert
                    await retry_service_1.retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
                }
            }
            return;
        }
    },
    /**
     * Generate TwiML for the IVR call flow.
     * Called by the webhook handler when Twilio requests instructions for a connected call.
     */
    generateCallTwiML(scheduleId, language) {
        const script = (0, language_1.buildIvrPrompt)(language);
        const actionUrl = `${env_1.env.BACKEND_URL}/webhooks/twilio/ivr-response`;
        return twilio_client_1.twilioClient.generateTwiML({
            message: script,
            gather: true,
            language,
            actionUrl,
        });
    },
};
//# sourceMappingURL=call.service.js.map