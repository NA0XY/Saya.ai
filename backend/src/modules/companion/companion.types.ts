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
  latency_ms?: {
    chat_total_ms?: number;
    chat_first_token_ms?: number;
  };
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

export interface SttTranscriptionRequest {
  language?: Language;
}

export interface SttTranscriptionResponse {
  transcript: string;
  language: Language;
  engine: 'groq-whisper' | 'local-faster-whisper';
  stt_ms: number;
  audio_ms?: number;
  confidence_proxy: number;
  quality_score: number;
}

export interface MemoryEntry {
  key: string;
  value: string;
}
