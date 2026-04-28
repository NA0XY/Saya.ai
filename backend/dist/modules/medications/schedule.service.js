"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleService = void 0;
const apiError_1 = require("../../utils/apiError");
const dateTime_1 = require("../../utils/dateTime");
const patient_service_1 = require("../patients/patient.service");
const medication_repository_1 = require("./medication.repository");
exports.scheduleService = {
    async createSchedule(input, caregiverId) {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(input.patient_id, caregiverId);
        (0, dateTime_1.parseScheduleTime)(input.scheduled_time);
        return medication_repository_1.medicationRepository.createSchedule({ patient_id: input.patient_id, caregiver_id: caregiverId, medicine_name: input.medicine_name, scheduled_time: input.scheduled_time, custom_message: input.custom_message ?? null, language: input.language, active: true });
    },
    async deleteSchedule(scheduleId, caregiverId) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        if (schedule.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this schedule');
        await medication_repository_1.medicationRepository.deactivateSchedule(scheduleId);
    },
    async getSchedulesForPatient(patientId, caregiverId) {
        await patient_service_1.patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
        return medication_repository_1.medicationRepository.findSchedulesByPatient(patientId);
    }
};
//# sourceMappingURL=schedule.service.js.map