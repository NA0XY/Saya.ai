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
exports.rxNormClient = void 0;
exports.extractRxNormNames = extractRxNormNames;
const axios_1 = __importStar(require("axios"));
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const apiError_1 = require("../../utils/apiError");
function unique(values) {
    return Array.from(new Set(values.filter((value) => Boolean(value?.trim())).map((value) => value.trim())));
}
function extractRxNormNames(response) {
    const preferredTypes = new Set(['BN', 'IN', 'MIN', 'PIN', 'SCD', 'SBD', 'GPCK', 'BPCK']);
    const names = response.allRelatedGroup?.conceptGroup
        ?.filter((group) => !group.tty || preferredTypes.has(group.tty))
        .flatMap((group) => group.conceptProperties?.map((property) => property.name) ?? []) ?? [];
    return unique(names);
}
exports.rxNormClient = {
    async resolveRxCui(drugName) {
        try {
            const { data } = await axios_1.default.get(`${env_1.env.RXNORM_BASE_URL}/rxcui.json`, {
                params: { name: drugName },
                timeout: env_1.env.RXNORM_TIMEOUT_MS
            });
            return data.idGroup?.rxnormId?.[0] ?? null;
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError && error.response?.status === 404)
                return null;
            logger_1.logger.warn('[RXNORM] RxCUI lookup failed', {
                drugName,
                error: error instanceof Error ? error.message : String(error)
            });
            throw apiError_1.ApiError.badGateway('RxNorm RxCUI lookup failed', { drugName }, 'RXNORM_PROVIDER_ERROR');
        }
    },
    async fetchNormalizedNames(drugName) {
        const rxcui = await this.resolveRxCui(drugName);
        if (!rxcui)
            return [];
        try {
            const { data } = await axios_1.default.get(`${env_1.env.RXNORM_BASE_URL}/rxcui/${rxcui}/allrelated.json`, {
                timeout: env_1.env.RXNORM_TIMEOUT_MS
            });
            return extractRxNormNames(data);
        }
        catch (error) {
            if (error instanceof axios_1.AxiosError && error.response?.status === 404)
                return [];
            logger_1.logger.warn('[RXNORM] Related names lookup failed', {
                drugName,
                rxcui,
                error: error instanceof Error ? error.message : String(error)
            });
            throw apiError_1.ApiError.badGateway('RxNorm related names lookup failed', { drugName, rxcui }, 'RXNORM_PROVIDER_ERROR');
        }
    }
};
//# sourceMappingURL=rxnorm.client.js.map