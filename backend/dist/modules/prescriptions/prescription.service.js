"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionService = void 0;
const fs_1 = __importDefault(require("fs"));
const apiError_1 = require("../../utils/apiError");
const ocr_service_1 = require("../ocr/ocr.service");
const patient_service_1 = require("../patients/patient.service");
const demoPrescriptions_1 = require("../../data/demoPrescriptions");
const prescription_repository_1 = require("./prescription.repository");
exports.prescriptionService = {
    async uploadAndProcess(file, patientId, caregiverId) {
        if (!file)
            throw apiError_1.ApiError.badRequest('Prescription file is required');
        await patient_service_1.patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
        const prescription = await prescription_repository_1.prescriptionRepository.create({ patient_id: patientId, caregiver_id: caregiverId, image_url: file.publicPath, raw_ocr_text: null, verified: false, verified_at: null, verified_by: null });
        try {
            const { ocrResult, nerResult } = await ocr_service_1.ocrService.processPrescritionImage(file.path, file.mimetype);
            await ocr_service_1.ocrService.saveOcrResult(prescription.id, ocrResult.rawText);
            return { prescription: { ...prescription, raw_ocr_text: ocrResult.rawText }, nerResult, ocrText: ocrResult.rawText };
        }
        catch (error) {
            await prescription_repository_1.prescriptionRepository.delete(prescription.id);
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            throw error;
        }
    },
    async verifyPrescription(prescriptionId, input, caregiverId) {
        const prescription = await prescription_repository_1.prescriptionRepository.findById(prescriptionId);
        if (!prescription)
            throw apiError_1.ApiError.notFound('Prescription');
        if (prescription.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this prescription');
        if (prescription.verified)
            throw apiError_1.ApiError.conflict('Prescription is already verified');
        const medicines = input.medicines.map((medicine) => ({ prescription_id: prescriptionId, drug_name: medicine.drug_name, dosage: medicine.dosage ?? null, frequency: medicine.frequency ?? null, route: medicine.route ?? null, low_confidence: false }));
        return prescription_repository_1.prescriptionRepository.markVerified(prescriptionId, caregiverId, medicines);
    },
    async getPrescription(id, caregiverId) {
        const prescription = await prescription_repository_1.prescriptionRepository.findByIdWithMedicines(id);
        if (!prescription)
            throw apiError_1.ApiError.notFound('Prescription');
        if (prescription.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this prescription');
        return prescription;
    },
    async listPrescriptions(patientId, caregiverId, demo = false) {
        if (demo || patientId === 'demo-patient-uuid')
            return demoPrescriptions_1.DEMO_PRESCRIPTIONS;
        await patient_service_1.patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
        return prescription_repository_1.prescriptionRepository.findByPatientId(patientId);
    }
};
//# sourceMappingURL=prescription.service.js.map