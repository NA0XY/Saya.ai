import type { Language, SentimentTag } from '../../types/common';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  patient_id: string;
  message: string;
  language: Language;
}

export interface ChatResponse {
  reply: string;
  sentiment: SentimentTag;
  memories_updated: boolean;
  escalated?: boolean;
}

export interface MemoryEntry {
  key: string;
  value: string;
}
