import type { Language } from '../../types/common';

export interface MakeCallParams {
  to: string;
  twimlUrl: string;
  statusCallback: string;
  scheduleId: string;
}

export interface SendSmsParams {
  to: string;
  from: string;
  body: string;
}

export interface GenerateTwiMLParams {
  message: string;
  gather: boolean;
  language: Language;
  actionUrl: string;
}

export interface TelephonyProvider {
  makeCall(params: MakeCallParams): Promise<{ callSid: string }>;
  sendSms(params: SendSmsParams): Promise<void>;
  generateTwiML(params: GenerateTwiMLParams): string;
}