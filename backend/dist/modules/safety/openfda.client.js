"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFdaClient = void 0;
exports.mapOpenFdaLabelToInteractions = mapOpenFdaLabelToInteractions;
const axios_1 = __importStar(require("axios"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
function unique(values) {
    return Array.from(new Set(values.filter((value) => Boolean(value?.trim())).map((value) => value.trim())));
}
function severityFromText(text) {
    const lower = text.toLowerCase();
    if (/(contraindicat|life-threatening|fatal|severe|serious|avoid)/.test(lower))
        return 'high';
    if (/(caution|monitor|may|increase|decrease|risk|interaction)/.test(lower))
        return 'moderate';
    return 'low';
}
function stableId(source, drugName, description) {
    const normalized = `${source}-${drugName}-${description}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return normalized.slice(0, 120);
}
function mapOpenFdaLabelToInteractions(drugName, label) {
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
exports.openFdaClient = {
    async fetchInteractions(drugName) {
        const params = new URLSearchParams({
            search: `openfda.brand_name:"${drugName}" OR openfda.generic_name:"${drugName}" OR openfda.substance_name:"${drugName}"`,
            limit: '3'
        });
        if (env_1.env.OPENFDA_API_KEY)
            params.set('api_key', env_1.env.OPENFDA_API_KEY);
        try {
            const { data } = await axios_1.default.get(`${env_1.env.OPENFDA_LABEL_URL}?${params.toString()}`, {
                timeout: env_1.env.OPENFDA_TIMEOUT_MS
            });
            return (data.results ?? []).flatMap((label) => mapOpenFdaLabelToInteractions(drugName, label));
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError && error.response?.status === 404)
                return [];
            logger_1.logger.warn('[OPENFDA] Fallback lookup failed', {
                drugName,
                error: error instanceof Error ? error.message : String(error)
            });
            throw apiError_1.ApiError.badGateway('openFDA lookup failed', { drugName }, 'OPENFDA_PROVIDER_ERROR');
        }
    }
};
//# sourceMappingURL=openfda.client.js.map