import { supabase } from '../../config/supabase';
import type { DrugInteraction } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { INDIAN_DRUG_SUGGESTIONS } from '../../data/drugSuggestions';

type InteractionInsert = Omit<DrugInteraction, 'id' | 'created_at'>;

function variants(name: string): string[] {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  const mapped = INDIAN_DRUG_SUGGESTIONS.find((suggestion) => suggestion.toLowerCase() === lower);
  const stripped = trimmed.replace(/\s+(tablet|tab|capsule|cap|syrup)$/i, '');
  return Array.from(new Set([trimmed, stripped, mapped].filter((value): value is string => Boolean(value))));
}

export const interactionRepository = {
  async findInteractionsByDrugNames(drugNames: string[]): Promise<DrugInteraction[]> {
    if (drugNames.length === 0) return [];
    const searchNames = Array.from(new Set(drugNames.flatMap(variants)));
    const { data, error } = await supabase.from('drug_interactions').select('*');
    if (error) throw ApiError.internal('Failed to lookup drug interactions');
    const lowerNames = searchNames.map((name) => name.toLowerCase());
    return (data ?? []).filter((row) => {
      const canonical = row.drug_name.toLowerCase();
      const aliases = row.drug_aliases.map((alias: string) => alias.toLowerCase());
      return lowerNames.some((name) => canonical.includes(name) || name.includes(canonical) || aliases.some((alias: string) => alias.includes(name) || name.includes(alias)));
    });
  },
  async findAllDrugs(): Promise<DrugInteraction[]> {
    const { data, error } = await supabase.from('drug_interactions').select('*').order('drug_name');
    if (error) throw ApiError.internal('Failed to load drug interactions');
    return data ?? [];
  },
  async upsertInteraction(data: InteractionInsert): Promise<DrugInteraction> {
    const result = await supabase.from('drug_interactions').upsert(data, { onConflict: 'drug_name,interaction_type,interacting_substance' }).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to upsert drug interaction');
    return result.data;
  }
};
