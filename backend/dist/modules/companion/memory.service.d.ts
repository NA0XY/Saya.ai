import type { PatientMemory } from '../../types/database';
type VaultDocument = {
    content: string;
    embedding?: number[];
    role?: 'user' | 'assistant' | 'fact';
    created_at: string;
    updated_at?: string;
    note_id?: string;
    title?: string;
    tags?: string[];
    links?: string[];
};
export type SemanticMemoryMatch = {
    key: string;
    content: string;
    score: number;
    reason?: string;
};
export declare const memoryService: {
    getMemories(patientId: string): Promise<PatientMemory[]>;
    getVaultMemories(patientId: string): Promise<PatientMemory[]>;
    createEmbedding(input: string): Promise<number[]>;
    upsertVaultEntry(patientId: string, key: string, content: string, role?: VaultDocument["role"]): Promise<void>;
    upsertObsidianNote(patientId: string, note: {
        title: string;
        content: string;
        role?: VaultDocument["role"];
        noteId?: string;
    }): Promise<{
        noteId: string;
        links: string[];
        title: string;
        tags: string[];
    }>;
    upsertRelation(patientId: string, fromNoteId: string, fromTitle: string, toTitle: string, incrementWeight?: number): Promise<void>;
    upsertMemory(patientId: string, key: string, value: string): Promise<void>;
    appendConversationNote(patientId: string, text: string, role: "user" | "assistant"): Promise<void>;
    semanticSearch(patientId: string, query: string, limit?: number): Promise<SemanticMemoryMatch[]>;
    extractAndSaveMemories(patientId: string, companionReply: string): Promise<boolean>;
    stripControlTags(reply: string): string;
    extractFamilyActionRequest(companionReply: string): {
        hasAction: boolean;
        message: string | null;
    };
};
export {};
//# sourceMappingURL=memory.service.d.ts.map