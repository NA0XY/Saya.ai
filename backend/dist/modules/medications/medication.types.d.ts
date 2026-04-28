import { z } from 'zod';
import type { CallLog, MedicationSchedule } from '../../types/database';
export declare const CreateScheduleSchema: z.ZodObject<{
    patient_id: z.ZodString;
    medicine_name: z.ZodString;
    scheduled_time: z.ZodString;
    custom_message: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodEnum<["hi", "en"]>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    medicine_name: string;
    scheduled_time: string;
    language: "hi" | "en";
    custom_message?: string | undefined;
}, {
    patient_id: string;
    medicine_name: string;
    scheduled_time: string;
    custom_message?: string | undefined;
    language?: "hi" | "en" | undefined;
}>;
export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
export type ScheduleWithCallLogs = MedicationSchedule & {
    call_logs: CallLog[];
};
//# sourceMappingURL=medication.types.d.ts.map