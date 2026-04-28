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
const exotel_client_1 = require("./exotel.client");
const retry_service_1 = require("./retry.service");
const sms_service_1 = require("./sms.service");
const tts_service_1 = require("./tts.service");
function mapStatus(status) {
    const normalized = status.toLowerCase().replace('-', '_');
    if (['completed', 'answered', 'in_progress'].includes(normalized))
        return 'answered';
    if (['no_answer', 'busy', 'canceled'].includes(normalized))
        return 'no_answer';
    if (['failed'].includes(normalized))
        return 'failed';
    return 'initiated';
}
exports.callService = {
    async initiateCall(scheduleId, attemptNumber) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        const patient = await patient_repository_1.patientRepository.findById(schedule.patient_id);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        const script = (0, language_1.buildMedicationReminderScript)(schedule.medicine_name, schedule.custom_message, schedule.language);
        const audioUrl = await tts_service_1.ttsService.synthesizeToUrl(script, schedule.language, schedule.id);
        const call = await exotel_client_1.exotelClient.initiateCall({ to: patient.phone, from: env_1.env.EXOTEL_CALLER_ID, callerId: env_1.env.EXOTEL_CALLER_ID, statusCallback: `${env_1.env.BACKEND_URL}/webhooks/exotel/status`, customField: schedule.id, audioUrl });
        const log = await medication_repository_1.medicationRepository.createCallLog({ schedule_id: schedule.id, patient_id: patient.id, exotel_call_sid: call.sid, status: 'initiated', attempt_number: attemptNumber, initiated_at: (0, dateTime_1.isoNow)(), answered_at: null, ivr_response: null });
        logger_1.logger.info('[CALL] Medication reminder initiated', { scheduleId, callSid: call.sid, attemptNumber });
        return log;
    },
    async handleIvrResponse(payload) {
        const log = await medication_repository_1.medicationRepository.findCallLogBySid(payload.CallSid);
        if (!log)
            throw apiError_1.ApiError.notFound('Call log');
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(log.schedule_id);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        const patient = await patient_repository_1.patientRepository.findById(log.patient_id);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        const contacts = await patient_repository_1.patientRepository.findEscalationContacts(patient.id);
        if (payload.Digits === '1') {
            await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'confirmed', ivr_response: '1', answered_at: (0, dateTime_1.isoNow)() });
            await retry_service_1.retryService.cancelRetries(schedule.id);
            await sms_service_1.smsService.sendMedicationConfirmedSms(patient.full_name, schedule.medicine_name, contacts, schedule.language);
        }
        else {
            await medication_repository_1.medicationRepository.updateCallLog(log.id, { status: 'rejected', ivr_response: payload.Digits === '2' ? '2' : null, answered_at: (0, dateTime_1.isoNow)() });
        }
    },
    async handleCallStatusUpdate(payload) {
        const log = await medication_repository_1.medicationRepository.findCallLogBySid(payload.CallSid);
        if (!log)
            return;
        const status = mapStatus(payload.Status);
        const updated = await medication_repository_1.medicationRepository.updateCallLog(log.id, { status, answered_at: status === 'answered' ? (0, dateTime_1.isoNow)() : log.answered_at });
        if (status === 'no_answer' || status === 'failed')
            await retry_service_1.retryService.scheduleRetry(updated.schedule_id, updated.id, updated.attempt_number);
    }
};
//# sourceMappingURL=call.service.js.map