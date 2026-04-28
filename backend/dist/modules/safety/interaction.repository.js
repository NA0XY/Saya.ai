"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionRepository = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const drugSuggestions_1 = require("../../data/drugSuggestions");
function variants(name) {
    const trimmed = name.trim();
    const lower = trimmed.toLowerCase();
    const mapped = drugSuggestions_1.INDIAN_DRUG_SUGGESTIONS.find((suggestion) => suggestion.toLowerCase() === lower);
    const stripped = trimmed.replace(/\s+(tablet|tab|capsule|cap|syrup)$/i, '');
    return Array.from(new Set([trimmed, stripped, mapped].filter((value) => Boolean(value))));
}
exports.interactionRepository = {
    async findInteractionsByDrugNames(drugNames) {
        if (drugNames.length === 0)
            return [];
        const searchNames = Array.from(new Set(drugNames.flatMap(variants)));
        const { data, error } = await supabase_1.supabase.from('drug_interactions').select('*');
        if (error)
            throw apiError_1.ApiError.internal('Failed to lookup drug interactions');
        const lowerNames = searchNames.map((name) => name.toLowerCase());
        return (data ?? []).filter((row) => {
            const canonical = row.drug_name.toLowerCase();
            const aliases = row.drug_aliases.map((alias) => alias.toLowerCase());
            return lowerNames.some((name) => canonical.includes(name) || name.includes(canonical) || aliases.some((alias) => alias.includes(name) || name.includes(alias)));
        });
    },
    async findAllDrugs() {
        const { data, error } = await supabase_1.supabase.from('drug_interactions').select('*').order('drug_name');
        if (error)
            throw apiError_1.ApiError.internal('Failed to load drug interactions');
        return data ?? [];
    },
    async upsertInteraction(data) {
        const result = await supabase_1.supabase.from('drug_interactions').upsert(data, { onConflict: 'drug_name,interaction_type,interacting_substance' }).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to upsert drug interaction');
        return result.data;
    }
};
//# sourceMappingURL=interaction.repository.js.map