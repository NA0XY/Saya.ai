import { supabase } from '../../config/supabase';
import type { PatientMemory } from '../../types/database';
import { ApiError } from '../../utils/apiError';

export const memoryService = {
  async getMemories(patientId: string): Promise<PatientMemory[]> {
    const { data, error } = await supabase.from('patient_memories').select('*').eq('patient_id', patientId).order('memory_key');
    if (error) throw ApiError.internal('Failed to load memories');
    return data ?? [];
  },
  async upsertMemory(patientId: string, key: string, value: string): Promise<void> {
    const { error } = await supabase.from('patient_memories').upsert({ patient_id: patientId, memory_key: key, memory_value: value }, { onConflict: 'patient_id,memory_key' });
    if (error) throw ApiError.internal('Failed to save memory');
  },
  async extractAndSaveMemories(patientId: string, companionReply: string): Promise<boolean> {
    const matches = Array.from(companionReply.matchAll(/\[MEMORY:([^=\]]+)=([^\]]+)\]/g));
    for (const match of matches) await this.upsertMemory(patientId, match[1].trim(), match[2].trim());
    return matches.length > 0;
  },
  stripControlTags(reply: string): string {
    return reply.replace(/\[MEMORY:[^\]]+\]/g, '').replace(/\[ACTION:contact_family:[^\]]+\]/g, '').trim();
  },
  extractFamilyActionRequest(companionReply: string): { hasAction: boolean; message: string | null } {
    const match = /\[ACTION:contact_family:([^\]]+)\]/.exec(companionReply);
    return { hasAction: Boolean(match), message: match?.[1].trim() ?? null };
  }
};
