import fs from 'fs';
import type { Prescription } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import type { UploadedFile } from '../../middleware/upload.middleware';
import { ocrService } from '../ocr/ocr.service';
import { patientService } from '../patients/patient.service';
import type { NerResult } from '../ner/ner.types';
import { DEMO_PRESCRIPTIONS } from '../../data/demoPrescriptions';
import { prescriptionRepository } from './prescription.repository';
import type { PrescriptionWithMedicines, VerifyPrescriptionInput } from './prescription.types';

export const prescriptionService = {
  async uploadAndProcess(file: UploadedFile, patientId: string, caregiverId: string): Promise<{ prescription: Prescription; nerResult: NerResult; ocrText: string }> {
    if (!file) throw ApiError.badRequest('Prescription file is required');
    await patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
    const prescription = await prescriptionRepository.create({ patient_id: patientId, caregiver_id: caregiverId, image_url: file.publicPath, raw_ocr_text: null, verified: false, verified_at: null, verified_by: null });
    try {
      const { ocrResult, nerResult } = await ocrService.processPrescritionImage(file.path, file.mimetype);
      await ocrService.saveOcrResult(prescription.id, ocrResult.rawText);
      return { prescription: { ...prescription, raw_ocr_text: ocrResult.rawText }, nerResult, ocrText: ocrResult.rawText };
    } catch (error) {
      await prescriptionRepository.delete(prescription.id);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw error;
    }
  },
  async verifyPrescription(prescriptionId: string, input: VerifyPrescriptionInput, caregiverId: string): Promise<PrescriptionWithMedicines> {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) throw ApiError.notFound('Prescription');
    if (prescription.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this prescription');
    if (prescription.verified) throw ApiError.conflict('Prescription is already verified');
    const medicines = input.medicines.map((medicine) => ({ prescription_id: prescriptionId, drug_name: medicine.drug_name, dosage: medicine.dosage ?? null, frequency: medicine.frequency ?? null, route: medicine.route ?? null, low_confidence: false }));
    return prescriptionRepository.markVerified(prescriptionId, caregiverId, medicines);
  },
  async getPrescription(id: string, caregiverId: string): Promise<PrescriptionWithMedicines> {
    const prescription = await prescriptionRepository.findByIdWithMedicines(id);
    if (!prescription) throw ApiError.notFound('Prescription');
    if (prescription.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this prescription');
    return prescription;
  },
  async listPrescriptions(patientId: string, caregiverId: string, demo = false): Promise<Prescription[] | typeof DEMO_PRESCRIPTIONS> {
    if (demo || patientId === 'demo-patient-uuid') return DEMO_PRESCRIPTIONS;
    await patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
    return prescriptionRepository.findByPatientId(patientId);
  }
};
