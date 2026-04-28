import twilio from 'twilio';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import type { TelephonyProvider, GenerateTwiMLParams } from './telephony.types';

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
};

function getClient() {
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

function twilioError(error: unknown): ApiError {
  if (error instanceof Error) {
    const twilioErr = error as { status?: number; code?: number; moreInfo?: string };
    logger.error('[TWILIO] API error', {
      status: twilioErr.status,
      code: twilioErr.code,
      message: error.message,
    });
    return ApiError.badGateway(
      'Twilio request failed',
      { status: twilioErr.status, code: twilioErr.code },
      'TWILIO_API_ERROR',
    );
  }
  if (error instanceof ApiError) return error;
  return ApiError.badGateway('Twilio request failed', undefined, 'TWILIO_CLIENT_ERROR');
}

export const twilioClient: TelephonyProvider = {
  async makeCall(params) {
    try {
      const client = getClient();
      const url = params.twimlUrl ?? `${env.BACKEND_URL}/webhooks/twilio/voice?drugName=${encodeURIComponent(params.drugName)}${params.scheduleId ? `&scheduleId=${encodeURIComponent(params.scheduleId)}` : ''}`;
      const statusCallback = params.statusCallback ?? `${env.BACKEND_URL}/webhooks/twilio/status`;

      const call = await client.calls.create({
        url,
        to: params.to,
        from: env.TWILIO_PHONE_NUMBER,
        statusCallback,
        statusCallbackEvent: ['completed', 'no-answer', 'busy', 'failed'],
        statusCallbackMethod: 'POST',
      });

      logger.info('[TWILIO] Call initiated', {
        callSid: call.sid,
        to: params.to,
        scheduleId: params.scheduleId,
      });

      return { callSid: call.sid };
    } catch (error) {
      throw twilioError(error);
    }
  },

  async sendSms(params) {
    try {
      const client = getClient();
      await client.messages.create({
        to: params.to,
        from: env.TWILIO_PHONE_NUMBER,
        body: params.body,
      });

      logger.info('[TWILIO] SMS sent', { to: params.to });
    } catch (error) {
      throw twilioError(error);
    }
  },

  generateTwiML(params: GenerateTwiMLParams): string {
    const voiceLanguage = LANGUAGE_MAP[params.language] ?? 'en-IN';
    const { VoiceResponse } = twilio.twiml;

    const response = new VoiceResponse();

    if (params.gather) {
      const gather = response.gather({
        numDigits: 1,
        timeout: 5,
        action: params.actionUrl,
        method: 'POST',
        actionOnEmptyResult: true,
      });

      // @ts-expect-error -- hi-IN/en-IN are valid Twilio Polly voices at runtime
      gather.say({ voice: 'Polly.Aditi', language: voiceLanguage }, params.message);

      response.redirect({ method: 'POST' }, params.actionUrl);
    } else {
      // @ts-expect-error -- hi-IN/en-IN are valid Twilio Polly voices at runtime
      response.say({ voice: 'Polly.Aditi', language: voiceLanguage }, params.message);
    }

    const twimlString = response.toString();
    logger.debug('[TWILIO] TwiML generated', {
      gather: params.gather,
      language: params.language,
      messageLength: params.message.length,
    });

    return twimlString;
  },
};