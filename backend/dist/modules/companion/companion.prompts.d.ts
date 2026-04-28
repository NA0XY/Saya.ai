import type { NewsCache, Patient, PatientMemory } from '../../types/database';
export declare function buildCompanionSystemPrompt(patient: Patient, memories: PatientMemory[], recentNews: NewsCache[], tone: string): string;
export declare function buildSentimentPrompt(): string;
export declare const SENTIMENT_JSON_SCHEMA = "{\"sentiment\":\"joy|neutral|anxiety|sadness\"}";
//# sourceMappingURL=companion.prompts.d.ts.map