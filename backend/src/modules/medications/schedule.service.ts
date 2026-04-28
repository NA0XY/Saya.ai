import type { MedicationSchedule } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { parseScheduleTime } from '../../utils/dateTime';
import { patientService } from '../patients/patient.service';
import { medicationRepository } from './medication.repository';
import type { CreateScheduleInput } from './medication.types';

export const scheduleService = {
  async createSchedule(input: CreateScheduleInput, caregiverId: string): Promise<MedicationSchedule> {
    await patientService.assertCaregiverOwnsPatient(input.patient_id, caregiverId);
    parseScheduleTime(input.scheduled_time);
    return medicationRepository.createSchedule({ patient_id: input.patient_id, caregiver_id: caregiverId, medicine_name: input.medicine_name, scheduled_time: input.scheduled_time, custom_message: input.custom_message ?? null, language: input.language, active: true });
  },
  async deleteSchedule(scheduleId: string, caregiverId: string): Promise<void> {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    if (schedule.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this schedule');
    await medicationRepository.deactivateSchedule(scheduleId);
  },
  async getSchedulesForPatient(patientId: string, caregiverId: string): Promise<MedicationSchedule[]> {
    await patientService.assertCaregiverOwnsPatient(patientId, caregiverId);
    return medicationRepository.findSchedulesByPatient(patientId);
  }
};
