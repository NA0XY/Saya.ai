import type { Language } from '../../types/common';

// Re-export telephony provider types
export type {
  MakeCallParams,
  SendSmsParams,
  GenerateTwiMLParams,
  TelephonyProvider,
} from './telephony.types';

// === Webhook payload types ===
// These are compatible with both Exotel (legacy) and Twilio.
// Twilio sends CallSid + Digits + CallStatus with the same semantics.

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

// === Legacy types (retained for backward compat with old exotel client files) ===

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