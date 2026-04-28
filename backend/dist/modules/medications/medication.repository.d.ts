import type { CallLog, CallRetryJob, MedicationSchedule } from '../../types/database';
type ScheduleCreate = Omit<MedicationSchedule, 'id' | 'created_at' | 'updated_at'>;
type CallLogCreate = Omit<CallLog, 'id' | 'created_at'>;
type RetryJobCreate = Omit<CallRetryJob, 'id' | 'created_at' | 'updated_at'>;
export declare const medicationRepository: {
    createSchedule(data: ScheduleCreate): Promise<MedicationSchedule>;
    findScheduleById(id: string): Promise<MedicationSchedule | null>;
    findActiveSchedules(): Promise<MedicationSchedule[]>;
    findSchedulesByPatient(patientId: string): Promise<MedicationSchedule[]>;
    deactivateSchedule(id: string): Promise<void>;
    createCallLog(data: CallLogCreate): Promise<CallLog>;
    updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog>;
    findCallLogBySid(sid: string): Promise<CallLog | null>;
    findCallLogsBySchedule(scheduleId: string): Promise<CallLog[]>;
    countAttemptsToday(scheduleId: string): Promise<number>;
    createRetryJob(data: RetryJobCreate): Promise<CallRetryJob>;
    findPendingRetryJob(scheduleId: string, attemptNumber: number, occurrenceDate: string): Promise<CallRetryJob | null>;
    findRetryJobsBySchedule(scheduleId: string): Promise<CallRetryJob[]>;
    findDueRetryJobs(nowIso: string): Promise<CallRetryJob[]>;
    updateRetryJob(id: string, updates: Partial<CallRetryJob>): Promise<CallRetryJob>;
    cancelRetryJobs(scheduleId: string): Promise<void>;
    hasFinalAlertBeenSent(scheduleId: string, occurrenceDate: string): Promise<boolean>;
};
export {};
//# sourceMappingURL=medication.repository.d.ts.map