import type { Language } from '../../types/common';
export type { MakeCallParams, SendSmsParams, GenerateTwiMLParams, TelephonyProvider, } from './telephony.types';
export interface IvrWebhookPayload {
    CallSid: string;
    DialCallStatus: string;
    Digits: string;
    To: string;
    From: string;
}
export interface CallStatusWebhookPayload {
    CallSid: string;
    /** Twilio sends CallStatus; Exotel sends Status. Normalize before passing here. */
    Status: string;
    To: string;
    From: string;
    Duration?: string;
}
export interface ExotelCallRequest {
    to: string;
    from: string;
    callerId: string;
    statusCallback?: string;
    customField?: string;
    audioUrl?: string;
}
export interface ExotelCallResponse {
    sid: string;
    status: string;
    direction: string;
}
export interface SmsRequest {
    to: string;
    from: string;
    body: string;
}
export interface TtsRequest {
    text: string;
    language: Language;
    voice?: string;
}
//# sourceMappingURL=call.types.d.ts.map