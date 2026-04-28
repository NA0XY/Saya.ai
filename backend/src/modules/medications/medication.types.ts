import { z } from 'zod';
import type { CallLog, MedicationSchedule } from '../../types/database';

export const CreateScheduleSchema = z.object({
  patient_id: z.string().uuid(),
  medicine_name: z.string().min(2),
  scheduled_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  custom_message: z.string().max(200).optional(),
  language: z.enum(['hi', 'en']).default('hi')
});

export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
export type ScheduleWithCallLogs = MedicationSchedule & { call_logs: CallLog[] };
