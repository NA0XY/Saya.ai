"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../../config/env");
const apiError_1 = require("../../utils/apiError");
const timeout_1 = require("../../utils/timeout");
const demoPrescriptions_1 = require("../../data/demoPrescriptions");
const indianDrugSeed_1 = require("../../data/indianDrugSeed");
const prescription_repository_1 = require("../prescriptions/prescription.repository");
const interaction_repository_1 = require("./interaction.repository");
const openfda_client_1 = require("./openfda.client");
const ragSafety_prompts_1 = require("./ragSafety.prompts");
const rxnorm_client_1 = require("./rxnorm.client");
const groq = new groq_sdk_1.default({ apiKey: env_1.env.GROQ_API_KEY });
function toWarnings(interactions) {
    return interactions.map((item) => ({ source_record_id: item.id, drug_name: item.drug_name, interaction_type: item.interaction_type, interacting_substance: item.interacting_substance, severity: item.severity, description_en: item.description_en, description_hi: item.description_hi, source: item.source }));
}
function summarizeSources(interactions) {
    return interactions.reduce((summary, interaction) => {
        summary[interaction.source] += 1;
        return summary;
    }, { indian_db: 0, openfda: 0, rxnorm: 0 });
}
function interactionKey(interaction) {
    return [
        interaction.source,
        interaction.drug_name.toLowerCase(),
        interaction.interaction_type,
        interaction.interacting_substance.toLowerCase(),
        interaction.description_en.toLowerCase()
    ].join('|');
}
function interactionMatchesDrug(interaction, drugName) {
    const lower = drugName.toLowerCase();
    return interaction.drug_name.toLowerCase() === lower || interaction.drug_aliases.some((alias) => alias.toLowerCase() === lower);
}
async function resolveInteractionsWithFallbacks(drugNames) {
    const resolved = new Map();
    const curated = await interaction_repository_1.interactionRepository.findInteractionsByDrugNames(drugNames);
    curated.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));
    for (const drugName of drugNames) {
        const hasCuratedMatch = curated.some((interaction) => interactionMatchesDrug(interaction, drugName));
        if (hasCuratedMatch)
            continue;
        const rxNormNames = await rxnorm_client_1.rxNormClient.fetchNormalizedNames(drugName);
        const normalizedCurated = rxNormNames.length > 0
            ? await interaction_repository_1.interactionRepository.findInteractionsByDrugNames(rxNormNames)
            : [];
        normalizedCurated.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));
        if (normalizedCurated.length > 0)
            continue;
        const openFdaNames = [drugName, ...rxNormNames].filter((value, index, array) => array.indexOf(value) === index);
        for (const openFdaName of openFdaNames) {
            const fallbackInteractions = await openfda_client_1.openFdaClient.fetchInteractions(openFdaName);
            fallbackInteractions.forEach((interaction) => resolved.set(interactionKey(interaction), interaction));
            if (fallbackInteractions.length > 0)
                break;
        }
    }
    return Array.from(resolved.values());
}
exports.safetyService = {
    async generateSafetyReport(prescriptionId) {
        const prescription = await prescription_repository_1.prescriptionRepository.findByIdWithMedicines(prescriptionId);
        if (!prescription)
            throw apiError_1.ApiError.notFound('Prescription');
        if (!prescription.verified)
            throw apiError_1.ApiError.forbidden('Caregiver verification is required before safety warnings can be generated');
        const drugNames = prescription.medicines.map((medicine) => medicine.drug_name);
        const interactions = await resolveInteractionsWithFallbacks(drugNames);
        const formatted = await this.formatInteractionWarnings(interactions, drugNames);
        return { prescription_id: prescriptionId, warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: formatted };
    },
    async formatInteractionWarnings(interactions, _drugNames) {
        if (interactions.length === 0)
            return 'No known food or drug interactions found for this prescription in our database.';
        const prompt = ragSafety_prompts_1.RAG_SAFETY_PROMPT.replace('{{INTERACTION_RECORDS}}', JSON.stringify(interactions, null, 2));
        const completion = await (0, timeout_1.withTimeout)(groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', temperature: 0, max_tokens: 1200, messages: [{ role: 'system', content: prompt }, { role: 'user', content: 'Format these database warnings for the caregiver.' }] }).catch((error) => {
            throw apiError_1.ApiError.badGateway('Groq safety formatting failed', { error: error instanceof Error ? error.message : String(error) }, 'GROQ_SAFETY_PROVIDER_ERROR');
        }), env_1.env.GROQ_TIMEOUT_MS, 'GROQ_SAFETY_TIMEOUT', 'Groq safety formatting timed out');
        const content = completion.choices[0]?.message?.content;
        if (!content)
            throw apiError_1.ApiError.badGateway('Groq returned an empty safety summary', undefined, 'GROQ_EMPTY_SAFETY_SUMMARY');
        return content;
    },
    async getSafetyReportForPrescription(prescriptionId, caregiverId) {
        const prescription = await prescription_repository_1.prescriptionRepository.findById(prescriptionId);
        if (!prescription)
            throw apiError_1.ApiError.notFound('Prescription');
        if (prescription.caregiver_id !== caregiverId)
            throw apiError_1.ApiError.forbidden('You do not have access to this prescription');
        return this.generateSafetyReport(prescriptionId);
    },
    async checkDrugs(drugNames) {
        const interactions = await resolveInteractionsWithFallbacks(drugNames);
        return { prescription_id: 'adhoc', warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: await this.formatInteractionWarnings(interactions, drugNames) };
    },
    async demoReport(prescriptionId) {
        const demo = demoPrescriptions_1.DEMO_PRESCRIPTIONS.find((item) => item.id === prescriptionId);
        const drugNames = demo ? [demo.drug_name] : demoPrescriptions_1.DEMO_PRESCRIPTIONS.map((item) => item.drug_name);
        const rows = indianDrugSeed_1.INDIAN_DRUG_INTERACTIONS.filter((row) => drugNames.some((name) => row.drug_name.toLowerCase() === name.toLowerCase() || row.drug_aliases.some((alias) => alias.toLowerCase() === name.toLowerCase())));
        const interactions = rows.map((row, index) => ({ id: `demo-${index}`, created_at: new Date().toISOString(), ...row }));
        return { prescription_id: prescriptionId, warnings: toWarnings(interactions), source_summary: summarizeSources(interactions), formatted_summary: await this.formatInteractionWarnings(interactions, drugNames) };
    }
};
//# sourceMappingURL=safety.service.js.map