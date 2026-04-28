"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationService = void 0;
const apiError_1 = require("../../utils/apiError");
const call_service_1 = require("../calls/call.service");
const medication_repository_1 = require("./medication.repository");
const schedule_service_1 = require("./schedule.service");
exports.medicationService = {
    createSchedule(input, caregiverId) {
        return schedule_service_1.scheduleService.createSchedule(input, caregiverId);
    },
    async triggerImmediateCall(scheduleId, caregiverId) {
        const schedule = await medication_repository_1.medicationRepository.findScheduleById(scheduleId);
        if (!schedule)
            throw apiError_1.ApiError.notFound('Medication schedule');
        if (schedule.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this schedule');
        return call_service_1.callService.initiateCall(scheduleId, 1);
    },
    listSchedules(patientId, caregiverId) {
        return schedule_service_1.scheduleService.getSchedulesForPatient(patientId, caregiverId);
    },
    deleteSchedule(scheduleId, caregiverId) {
        return schedule_service_1.scheduleService.deleteSchedule(scheduleId, caregiverId);
    }
};
//# sourceMappingURL=medication.service.js.map