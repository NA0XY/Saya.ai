import type { Language } from '../../types/common';

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

export interface IvrWebhookPayload {
  CallSid: string;
  DialCallStatus: string;
  Digits: string;
  To: string;
  From: string;
}

export interface CallStatusWebhookPayload {
  CallSid: string;
  Status: string;
  To: string;
  From: string;
  Duration?: string;
}
