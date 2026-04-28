import axios, { AxiosError } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';
import type { ExotelCallRequest, ExotelCallResponse, SmsRequest } from './call.types';

const baseURL = `https://${env.EXOTEL_API_KEY}:${env.EXOTEL_API_TOKEN}@${env.EXOTEL_SUBDOMAIN}/v1/Accounts/${env.EXOTEL_SID}/`;
const client = axios.create({ baseURL, timeout: env.EXOTEL_TIMEOUT_MS });

function form(data: Record<string, string | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) if (value !== undefined) params.append(key, value);
  return params;
}

function exotelError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    logger.error('[EXOTEL] HTTP error', { status: error.response?.status, data: error.response?.data });
    return ApiError.badGateway('Exotel request failed', { status: error.response?.status }, 'EXOTEL_HTTP_ERROR');
  }
  if (error instanceof ApiError) return error;
  return ApiError.badGateway('Exotel request failed', undefined, 'EXOTEL_CLIENT_ERROR');
}

function extractXmlTag(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i').exec(xml);
  return match?.[1] ?? null;
}

export function parseExotelCallResponse(data: unknown): ExotelCallResponse {
  if (typeof data === 'string') {
    const sid = extractXmlTag(data, 'Sid');
    const status = extractXmlTag(data, 'Status') ?? 'unknown';
    const direction = extractXmlTag(data, 'Direction') ?? 'outbound-api';
    if (!sid) throw ApiError.badGateway('Malformed Exotel call response', { responseType: 'xml' }, 'EXOTEL_MALFORMED_RESPONSE');
    return { sid, status, direction };
  }

  const call = (data as { Call?: { Sid?: string; Status?: string; Direction?: string } } | null)?.Call;
  if (!call?.Sid) throw ApiError.badGateway('Malformed Exotel call response', { responseType: typeof data }, 'EXOTEL_MALFORMED_RESPONSE');
  return { sid: call.Sid, status: call.Status ?? 'unknown', direction: call.Direction ?? 'outbound-api' };
}

export const exotelClient = {
  async initiateCall(request: ExotelCallRequest): Promise<ExotelCallResponse> {
    try {
      const { data } = await client.post('Calls/connect.json', form({
        From: request.to,
        To: request.callerId,
        CallerId: request.callerId,
        StatusCallback: request.statusCallback,
        CustomField: request.customField,
        Url: request.audioUrl
      }));
      return parseExotelCallResponse(data);
    } catch (error) {
      throw exotelError(error);
    }
  },
  async sendSms(request: SmsRequest): Promise<void> {
    try {
      await client.post('Sms/send.json', form({ From: request.from, To: request.to, Body: request.body }));
      logger.info('[EXOTEL] SMS sent', { to: request.to });
    } catch (error) {
      throw exotelError(error);
    }
  }
};
