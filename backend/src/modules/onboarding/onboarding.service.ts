import { supabase } from '../../config/supabase';
import type { Patient } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { toE164India } from '../../utils/phone';
import { patientRepository } from '../patients/patient.repository';
import { patientService } from '../patients/patient.service';
import type { OnboardingInput } from './onboarding.types';

export const onboardingService = {
  async createPatientWithContacts(caregiverId: string, input: OnboardingInput): Promise<Patient> {
    const patient = await patientRepository.create({
      caregiver_id: caregiverId,
      full_name: input.full_name,
      phone: toE164India(input.phone),
      date_of_birth: input.date_of_birth ?? null,
      language_preference: input.language_preference,
      companion_tone: input.companion_tone
    });
    try {
      for (const contact of input.contacts) {
        await patientRepository.createContact({
          patient_id: patient.id,
          name: contact.name,
          phone: toE164India(contact.phone),
          relationship: contact.relationship,
          can_receive_escalation_sms: contact.can_receive_escalation_sms ?? true
        });
      }
      return patient;
    } catch (error) {
      await supabase.from('patients').delete().eq('id', patient.id);
      throw error;
    }
  },
  getPatient(patientId: string, caregiverId: string) {
    return patientService.getPatient(patientId, caregiverId);
  },
  listPatients(caregiverId: string) {
    return patientRepository.findByCaregiverId(caregiverId);
  },
  async updatePatient(patientId: string, caregiverId: string, updates: Partial<OnboardingInput>): Promise<Patient> {
    await patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
    const allowed: Partial<Patient> = {};
    if (updates.full_name !== undefined) allowed.full_name = updates.full_name;
    if (updates.phone !== undefined) allowed.phone = toE164India(updates.phone);
    if (updates.date_of_birth !== undefined) allowed.date_of_birth = updates.date_of_birth;
    if (updates.language_preference !== undefined) allowed.language_preference = updates.language_preference;
    if (updates.companion_tone !== undefined) allowed.companion_tone = updates.companion_tone;
    if (Object.keys(allowed).length === 0) throw ApiError.badRequest('No patient fields supplied');
    return patientRepository.update(patientId, allowed);
  }
};
