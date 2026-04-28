import axios, { AxiosError } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { DrugInteraction } from '../../types/database';
import { ApiError } from '../../utils/apiError';

interface OpenFdaLabel {
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    substance_name?: string[];
  };
  drug_interactions?: string[];
  warnings?: string[];
}

interface OpenFdaResponse {
  results?: OpenFdaLabel[];
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())));
}

function severityFromText(text: string): DrugInteraction['severity'] {
  const lower = text.toLowerCase();
  if (/(contraindicat|life-threatening|fatal|severe|serious|avoid)/.test(lower)) return 'high';
  if (/(caution|monitor|may|increase|decrease|risk|interaction)/.test(lower)) return 'moderate';
  return 'low';
}

function stableId(source: string, drugName: string, description: string): string {
  const normalized = `${source}-${drugName}-${description}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.slice(0, 120);
}

export function mapOpenFdaLabelToInteractions(drugName: string, label: OpenFdaLabel): DrugInteraction[] {
  const interactionTexts = unique(label.drug_interactions ?? []);
  const aliases = unique([
    ...(label.openfda?.brand_name ?? []),
    ...(label.openfda?.generic_name ?? []),
    ...(label.openfda?.substance_name ?? [])
  ]);

  return interactionTexts.map((description) => ({
    id: stableId('openfda', drugName, description),
    drug_name: drugName,
    drug_aliases: aliases.length > 0 ? aliases : [drugName],
    interaction_type: 'drug',
    interacting_substance: 'OpenFDA labeled interaction',
    severity: severityFromText(description),
    description_en: description,
    description_hi: null,
    source: 'openfda',
    created_at: new Date().toISOString()
  }));
}

export const openFdaClient = {
  async fetchInteractions(drugName: string): Promise<DrugInteraction[]> {
    const params = new URLSearchParams({
      search: `openfda.brand_name:"${drugName}" OR openfda.generic_name:"${drugName}" OR openfda.substance_name:"${drugName}"`,
      limit: '3'
    });
    if (env.OPENFDA_API_KEY) params.set('api_key', env.OPENFDA_API_KEY);

    try {
      const { data } = await axios.get<OpenFdaResponse>(`${env.OPENFDA_LABEL_URL}?${params.toString()}`, {
        timeout: env.OPENFDA_TIMEOUT_MS
      });
      return (data.results ?? []).flatMap((label) => mapOpenFdaLabelToInteractions(drugName, label));
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return [];
      logger.warn('[OPENFDA] Fallback lookup failed', {
        drugName,
        error: error instanceof Error ? error.message : String(error)
      });
      throw ApiError.badGateway('openFDA lookup failed', { drugName }, 'OPENFDA_PROVIDER_ERROR');
    }
  }
};
