import type { ExotelCallRequest, ExotelCallResponse, SmsRequest } from './call.types';
export declare function parseExotelCallResponse(data: unknown): ExotelCallResponse;
export declare const exotelClient: {
    initiateCall(request: ExotelCallRequest): Promise<ExotelCallResponse>;
    sendSms(request: SmsRequest): Promise<void>;
};
//# sourceMappingURL=exotel.client.d.ts.map