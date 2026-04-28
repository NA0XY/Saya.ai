import type { CallLog } from '../../types/database';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './call.types';
export declare const callService: {
    initiateCall(scheduleId: string, attemptNumber: number): Promise<CallLog>;
    handleIvrResponse(payload: IvrWebhookPayload): Promise<void>;
    handleCallStatusUpdate(payload: CallStatusWebhookPayload): Promise<void>;
};
//# sourceMappingURL=call.service.d.ts.map