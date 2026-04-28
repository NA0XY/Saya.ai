import type { CallRetryJob } from '../../types/database';
export declare const retryService: {
    scheduleRetry(scheduleId: string, _callLogId: string, attemptNumber: number): Promise<void>;
    cancelRetries(scheduleId: string): Promise<void>;
    processDueRetryJob(job: CallRetryJob): Promise<void>;
};
//# sourceMappingURL=retry.service.d.ts.map