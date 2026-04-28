import type { PatientMemory } from '../../types/database';
export declare const memoryService: {
    getMemories(patientId: string): Promise<PatientMemory[]>;
    upsertMemory(patientId: string, key: string, value: string): Promise<void>;
    extractAndSaveMemories(patientId: string, companionReply: string): Promise<boolean>;
    stripControlTags(reply: string): string;
    extractFamilyActionRequest(companionReply: string): {
        hasAction: boolean;
        message: string | null;
    };
};
//# sourceMappingURL=memory.service.d.ts.map