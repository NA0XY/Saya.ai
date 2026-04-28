import type { CallLog } from '../../types/database';
import type { CallStatusWebhookPayload, IvrWebhookPayload } from './call.types';
export declare const callService: {
    initiateCall(scheduleId: string, attemptNumber: number): Promise<CallLog>;
    handleIvrResponse(payload: IvrWebhookPayload): Promise<void>;
    handleCallStatusUpdate(payload: CallStatusWebhookPayload): Promise<void>;
    /**
     * Generate TwiML for the IVR call flow.
     * Called by the webhook handler when Twilio requests instructions for a connected call.
     */
    generateCallTwiML(scheduleId: string, language: "hi" | "en"): string;
};
//# sourceMappingURL=call.service.d.ts.map