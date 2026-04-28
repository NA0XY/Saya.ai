import type { ApprovedContact, Patient } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { patientRepository } from './patient.repository';
import type { PatientWithContacts } from './patient.types';

export const patientService = {
  async assertCaregiverOwnsPatient(patientId: string, caregiverId: string): Promise<void> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) throw ApiError.notFound('Patient');
    if (patient.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this patient');
  },
  async getPatient(patientId: string, caregiverId: string): Promise<PatientWithContacts> {
    await this.assertCaregiverOwnsPatient(patientId, caregiverId);
    const patient = await patientRepository.findByIdWithContacts(patientId);
    if (!patient) throw ApiError.notFound('Patient');
    return patient;
  },
  async listPatients(caregiverId: string): Promise<Patient[]> {
    return patientRepository.findByCaregiverId(caregiverId);
  },
  async getContacts(patientId: string, caregiverId: string): Promise<ApprovedContact[]> {
    await this.assertCaregiverOwnsPatient(patientId, caregiverId);
    return patientRepository.findContactsByPatientId(patientId);
  }
};
