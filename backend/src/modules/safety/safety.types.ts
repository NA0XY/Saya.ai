import type { InteractionType, Severity } from '../../types/common';

export interface InteractionWarning {
  source_record_id: string;
  drug_name: string;
  interaction_type: InteractionType;
  interacting_substance: string;
  severity: Severity;
  description_en: string;
  description_hi: string | null;
  source: string;
}

export interface SafetyReport {
  prescription_id: string;
  warnings: InteractionWarning[];
  source_summary: { indian_db: number; openfda: number; rxnorm: number };
  formatted_summary: string;
}

export interface SafetyQuery {
  drug_names: string[];
}
