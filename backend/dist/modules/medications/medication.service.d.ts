import type { CallLog, MedicationSchedule } from '../../types/database';
import type { CreateScheduleInput } from './medication.types';
export declare const medicationService: {
    createSchedule(input: CreateScheduleInput, caregiverId: string): Promise<MedicationSchedule>;
    triggerImmediateCall(scheduleId: string, caregiverId: string): Promise<CallLog>;
    listSchedules(patientId: string, caregiverId: string): Promise<MedicationSchedule[]>;
    deleteSchedule(scheduleId: string, caregiverId: string): Promise<void>;
};
//# sourceMappingURL=medication.service.d.ts.map