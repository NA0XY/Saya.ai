import type { MedicationSchedule } from '../../types/database';
import type { CreateScheduleInput } from './medication.types';
export declare const scheduleService: {
    createSchedule(input: CreateScheduleInput, caregiverId: string): Promise<MedicationSchedule>;
    deleteSchedule(scheduleId: string, caregiverId: string): Promise<void>;
    getSchedulesForPatient(patientId: string, caregiverId: string): Promise<MedicationSchedule[]>;
};
//# sourceMappingURL=schedule.service.d.ts.map