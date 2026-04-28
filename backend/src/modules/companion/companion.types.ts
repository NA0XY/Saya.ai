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

export type CompanionTone = 'warm' | 'formal' | 'playful';
export type VoiceSpeed = 'slow' | 'medium' | 'fast';

export interface TtsStreamRequest {
  text: string;
  language?: Language;
  sentiment?: SentimentTag;
  tone?: CompanionTone;
  voiceSpeed?: VoiceSpeed;
}

export interface TtsStreamResult {
  audio: Buffer;
  contentType: 'audio/mpeg' | 'audio/wav';
  provider: 'google' | 'piper-http' | 'piper-cli';
}

export interface MemoryEntry {
  key: string;
  value: string;
}
