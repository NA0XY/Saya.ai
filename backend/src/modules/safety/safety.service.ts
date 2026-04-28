import Groq from 'groq-sdk';
import { env } from '../../config/env';
import type { DrugInteraction } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { withTimeout } from '../../utils/timeout';
import { DEMO_PRESCRIPTIONS } from '../../data/demoPrescriptions';
import { INDIAN_DRUG_INTERACTIONS } from '../../data/indianDrugSeed';
import { prescriptionRepository } from '../prescriptions/prescription.repository';
import { interactionRepository } from './interaction.repository';
import { openFdaClient } from './openfda.client';
import { RAG_SAFETY_PROMPT } from './ragSafety.prompts';
import { rxNormClient } from './rxnorm.client';
import type { InteractionWarning, SafetyReport } from './safety.types';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

function toWarnings(interactions: DrugInteraction[]): InteractionWarning[] {
  return interactions.map((item) => ({ source_record_id: item.id, drug_name: item.drug_name, interaction_type: item.interaction_type, interacting_substance: item.interacting_substance, severity: item.severity, description_en: item.description_en, description_hi: item.description_hi, source: item.source }));
}

function summarizeSources(interactions: DrugInteraction[]): SafetyReport['source_summary'] {
  return interactions.reduce<SafetyReport['source_summary']>((summary, interaction) => {
    summary[interaction.source] += 1;
    return summary;
  }, { indian_db: 0, openfda: 0, rxnorm: 0 });
}

function interactionKey(interaction: DrugInteraction): string {
  return [
    interaction.source,
    interaction.drug_name.toLowerCase(),
    interaction.interaction_type,
    interaction.interacting_substance.toLowerCase(),
    interaction.description_en.toLowerCase()
  ].join('|');
}

function interactionMatchesDrug(interaction: DrugInteraction, drugName: string): boolean {
  const lower = drugName.toLowerCase();
  return interaction.drug_name.toLowerCase() === lower || interaction.drug_aliases.some((alias) => alias.toLowerCase() === lower);
}

async function resolveInteractionsWithFallbacks(drugNames: string[]): Promise<DrugInteraction[]> {
  const resolved = new Map<string, DrugInteraction>();
  const curated = await interactionRepository.findInteractionsByDrugNames(drugNames);
  curated.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));

  for (const drugName of drugNames) {
    const hasCuratedMatch = curated.some((interaction) => interactionMatchesDrug(interaction, drugName));
    if (hasCuratedMatch) continue;

    const rxNormNames = await rxNormClient.fetchNormalizedNames(drugName);
    const normalizedCurated = rxNormNames.length > 0
      ? await interactionRepository.findInteractionsByDrugNames(rxNormNames)
      : [];
    normalizedCurated.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));

    if (normalizedCurated.length > 0) continue;

    const openFdaNames = [drugName, ...rxNormNames].filter((value, index, array) => array.indexOf(value) === index);
    for (const openFdaName of openFdaNames) {
      const fallbackInteractions = await openFdaClient.fetchInteractions(openFdaName);
      fallbackInteractions.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));
      if (fallbackInteractions.length > 0) break;
    }
  }

  return Array.from(resolved.values());
}

export const safetyService = {
  async generateSafetyReport(prescriptionId: string): Promise<SafetyReport> {
    const prescription = await prescriptionRepository.findByIdWithMedicines(prescriptionId);
    if (!prescription) throw ApiError.notFound('Prescription');
    if (!prescription.verified) throw ApiError.forbidden('Caregiver verification is required before safety warnings can be generated');
    const drugNames = prescription.medicines.map((medicine) => medicine.drug_name);
    const interactions = await resolveInteractionsWithFallbacks(drugNames);
    const formatted = await this.formatInteractionWarnings(interactions, drugNames);
    return { prescription_id: prescriptionId, warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: formatted };
  },
  async formatInteractionWarnings(interactions: DrugInteraction[], _drugNames: string[]): Promise<string> {
    if (interactions.length === 0) return 'No known food or drug interactions found for this prescription in our database.';
    const prompt = RAG_SAFETY_PROMPT.replace('{{INTERACTION_RECORDS}}', JSON.stringify(interactions, null, 2));
    const completion = await withTimeout(
      groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', temperature: 0, max_tokens: 1200, messages: [{ role: 'system', content: prompt }, { role: 'user', content: 'Format these database warnings for the caregiver.' }] }).catch((error: unknown) => {
        throw ApiError.badGateway('Groq safety formatting failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_SAFETY_PROVIDER_ERROR');
      }),
      env.GROQ_TIMEOUT_MS,
      'GROQ_SAFETY_TIMEOUT',
      'Groq safety formatting timed out'
    );
    const content = completion.choices[0]?.message?.content;
    if (!content) throw ApiError.badGateway('Groq returned an empty safety summary', undefined, 'GROQ_EMPTY_SAFETY_SUMMARY');
    return content;
  },
  async getSafetyReportForPrescription(prescriptionId: string, caregiverId: string): Promise<SafetyReport> {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) throw ApiError.notFound('Prescription');
    if (prescription.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this prescription');
    return this.generateSafetyReport(prescriptionId);
  },
  async checkDrugs(drugNames: string[]): Promise<SafetyReport> {
    const interactions = await resolveInteractionsWithFallbacks(drugNames);
    return { prescription_id: 'adhoc', warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: await this.formatInteractionWarnings(interactions, drugNames) };
  },
  async demoReport(prescriptionId: string): Promise<SafetyReport> {
    const demo = DEMO_PRESCRIPTIONS.find((item) => item.id === prescriptionId);
    const drugNames = demo ? [demo.drug_name] : DEMO_PRESCRIPTIONS.map((item) => item.drug_name);
    const rows = INDIAN_DRUG_INTERACTIONS.filter((row) => drugNames.some((name) => row.drug_name.toLowerCase() === name.toLowerCase() || row.drug_aliases.some((alias) => alias.toLowerCase() === name.toLowerCase())));
    const interactions = rows.map((row, index) => ({ id: `demo-${index}`, created_at: new Date().toISOString(), ...row }));
    return { prescription_id: prescriptionId, warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: await this.formatInteractionWarnings(interactions, drugNames) };
  }
};
