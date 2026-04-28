import type { CallLog, MedicationSchedule } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { callService } from '../calls/call.service';
import { medicationRepository } from './medication.repository';
import { scheduleService } from './schedule.service';
import type { CreateScheduleInput } from './medication.types';

export const medicationService = {
  createSchedule(input: CreateScheduleInput, caregiverId: string): Promise<MedicationSchedule> {
    return scheduleService.createSchedule(input, caregiverId);
  },
  async triggerImmediateCall(scheduleId: string, caregiverId: string): Promise<CallLog> {
    const schedule = await medicationRepository.findScheduleById(scheduleId);
    if (!schedule) throw ApiError.notFound('Medication schedule');
    if (schedule.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this schedule');
    return callService.initiateCall(scheduleId, 1);
  },
  listSchedules(patientId: string, caregiverId: string): Promise<MedicationSchedule[]> {
    return scheduleService.getSchedulesForPatient(patientId, caregiverId);
  },
  deleteSchedule(scheduleId: string, caregiverId: string): Promise<void> {
    return scheduleService.deleteSchedule(scheduleId, caregiverId);
  }
};
