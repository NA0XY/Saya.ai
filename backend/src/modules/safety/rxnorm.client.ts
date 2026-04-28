import axios, { AxiosError } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/apiError';

interface RxNormRxcuiResponse {
  idGroup?: {
    rxnormId?: string[];
  };
}

interface RxNormConceptProperty {
  name?: string;
}

interface RxNormConceptGroup {
  tty?: string;
  conceptProperties?: RxNormConceptProperty[];
}

interface RxNormRelatedResponse {
  allRelatedGroup?: {
    conceptGroup?: RxNormConceptGroup[];
  };
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())));
}

export function extractRxNormNames(response: RxNormRelatedResponse): string[] {
  const preferredTypes = new Set(['BN', 'IN', 'MIN', 'PIN', 'SCD', 'SBD', 'GPCK', 'BPCK']);
  const names = response.allRelatedGroup?.conceptGroup
    ?.filter((group) => !group.tty || preferredTypes.has(group.tty))
    .flatMap((group) => group.conceptProperties?.map((property) => property.name) ?? []) ?? [];
  return unique(names);
}

export const rxNormClient = {
  async resolveRxCui(drugName: string): Promise<string | null> {
    try {
      const { data } = await axios.get<RxNormRxcuiResponse>(`${env.RXNORM_BASE_URL}/rxcui.json`, {
        params: { name: drugName },
        timeout: env.RXNORM_TIMEOUT_MS
      });
      return data.idGroup?.rxnormId?.[0] ?? null;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return null;
      logger.warn('[RXNORM] RxCUI lookup failed', {
        drugName,
        error: error instanceof Error ? error.message : String(error)
      });
      throw ApiError.badGateway('RxNorm RxCUI lookup failed', { drugName }, 'RXNORM_PROVIDER_ERROR');
    }
  },

  async fetchNormalizedNames(drugName: string): Promise<string[]> {
    const rxcui = await this.resolveRxCui(drugName);
    if (!rxcui) return [];

    try {
      const { data } = await axios.get<RxNormRelatedResponse>(`${env.RXNORM_BASE_URL}/rxcui/${rxcui}/allrelated.json`, {
        timeout: env.RXNORM_TIMEOUT_MS
      });
      return extractRxNormNames(data);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return [];
      logger.warn('[RXNORM] Related names lookup failed', {
        drugName,
        rxcui,
        error: error instanceof Error ? error.message : String(error)
      });
      throw ApiError.badGateway('RxNorm related names lookup failed', { drugName, rxcui }, 'RXNORM_PROVIDER_ERROR');
    }
  }
};
