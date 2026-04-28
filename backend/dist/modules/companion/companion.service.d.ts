import type { ChatRequest, ChatResponse } from './companion.types';
export declare const companionService: {
    chat(request: ChatRequest, caregiverId: string): Promise<ChatResponse>;
    getHistory(patientId: string, limit?: number): Promise<any[]>;
};
//# sourceMappingURL=companion.service.d.ts.map