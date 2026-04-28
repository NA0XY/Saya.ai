"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exotelClient = void 0;
exports.parseExotelCallResponse = parseExotelCallResponse;
const axios_1 = __importStar(require("axios"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
const baseURL = `https://${env_1.env.EXOTEL_API_KEY}:${env_1.env.EXOTEL_API_TOKEN}@${env_1.env.EXOTEL_SUBDOMAIN}/v1/Accounts/${env_1.env.EXOTEL_SID}/`;
const client = axios_1.default.create({ baseURL, timeout: env_1.env.EXOTEL_TIMEOUT_MS });
function form(data) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data))
        if (value !== undefined)
            params.append(key, value);
    return params;
}
function exotelError(error) {
    if (error instanceof axios_1.AxiosError) {
        logger_1.logger.error('[EXOTEL] HTTP error', { status: error.response?.status, data: error.response?.data });
        return apiError_1.ApiError.badGateway('Exotel request failed', { status: error.response?.status }, 'EXOTEL_HTTP_ERROR');
    }
    if (error instanceof apiError_1.ApiError)
        return error;
    return apiError_1.ApiError.badGateway('Exotel request failed', undefined, 'EXOTEL_CLIENT_ERROR');
}
function extractXmlTag(xml, tag) {
    const match = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i').exec(xml);
    return match?.[1] ?? null;
}
function parseExotelCallResponse(data) {
    if (typeof data === 'string') {
        const sid = extractXmlTag(data, 'Sid');
        const status = extractXmlTag(data, 'Status') ?? 'unknown';
        const direction = extractXmlTag(data, 'Direction') ?? 'outbound-api';
        if (!sid)
            throw apiError_1.ApiError.badGateway('Malformed Exotel call response', { responseType: 'xml' }, 'EXOTEL_MALFORMED_RESPONSE');
        return { sid, status, direction };
    }
    const call = data?.Call;
    if (!call?.Sid)
        throw apiError_1.ApiError.badGateway('Malformed Exotel call response', { responseType: typeof data }, 'EXOTEL_MALFORMED_RESPONSE');
    return { sid: call.Sid, status: call.Status ?? 'unknown', direction: call.Direction ?? 'outbound-api' };
}
exports.exotelClient = {
    async initiateCall(request) {
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
        }
        catch (error) {
            throw exotelError(error);
        }
    },
    async sendSms(request) {
        try {
            await client.post('Sms/send.json', form({ From: request.from, To: request.to, Body: request.body }));
            logger_1.logger.info('[EXOTEL] SMS sent', { to: request.to });
        }
        catch (error) {
            throw exotelError(error);
        }
    }
};
//# sourceMappingURL=exotel.client.js.map