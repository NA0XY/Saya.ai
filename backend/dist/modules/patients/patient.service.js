"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientService = void 0;
const apiError_1 = require("../../utils/apiError");
const patient_repository_1 = require("./patient.repository");
exports.patientService = {
    async assertCaregiverOwnsPatient(patientId, caregiverId) {
        const patient = await patient_repository_1.patientRepository.findById(patientId);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        if (patient.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this patient');
    },
    async getPatient(patientId, caregiverId) {
        await this.assertCaregiverOwnsPatient(patientId, caregiverId);
        const patient = await patient_repository_1.patientRepository.findByIdWithContacts(patientId);
        if (!patient)
            throw apiError_1.ApiError.notFound('Patient');
        return patient;
    },
    async listPatients(caregiverId) {
        return patient_repository_1.patientRepository.findByCaregiverId(caregiverId);
    },
    async getContacts(patientId, caregiverId) {
        await this.assertCaregiverOwnsPatient(patientId, caregiverId);
        return patient_repository_1.patientRepository.findContactsByPatientId(patientId);
    }
};
//# sourceMappingURL=patient.service.js.map