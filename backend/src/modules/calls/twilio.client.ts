import twilio from 'twilio';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import type { TelephonyProvider, GenerateTwiMLParams } from './telephony.types';

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
};

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
      const call = await client.calls.create({
        url: params.twimlUrl,
        to: params.to,
        from: env.TWILIO_PHONE_NUMBER,
        statusCallback: params.statusCallback,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
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
      });

      // @ts-expect-error -- hi-IN/en-IN are valid Twilio Polly voices at runtime
      gather.say({ voice: 'Polly.Aditi', language: voiceLanguage }, params.message);

      // If no input (timeout), redirect to same action URL so the handler
      // receives empty Digits and can mark as missed
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