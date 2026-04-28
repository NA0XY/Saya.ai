import type { ChatRequest, ChatResponse } from './companion.types';
export declare const companionService: {
    chat(request: ChatRequest, caregiverId: string): Promise<ChatResponse>;
    chatStream(request: ChatRequest, caregiverId: string, emit: (event: "assistant_token" | "assistant_done" | "assistant_error", payload: unknown) => void): Promise<ChatResponse>;
    getHistory(patientId: string, limit?: number): Promise<any[]>;
};
//# sourceMappingURL=companion.service.d.ts.map