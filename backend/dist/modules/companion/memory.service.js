"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryService = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
exports.memoryService = {
    async getMemories(patientId) {
        const { data, error } = await supabase_1.supabase.from('patient_memories').select('*').eq('patient_id', patientId).order('memory_key');
        if (error)
            throw apiError_1.ApiError.internal('Failed to load memories');
        return data ?? [];
    },
    async upsertMemory(patientId, key, value) {
        const { error } = await supabase_1.supabase.from('patient_memories').upsert({ patient_id: patientId, memory_key: key, memory_value: value }, { onConflict: 'patient_id,memory_key' });
        if (error)
            throw apiError_1.ApiError.internal('Failed to save memory');
    },
    async extractAndSaveMemories(patientId, companionReply) {
        const matches = Array.from(companionReply.matchAll(/\[MEMORY:([^=\]]+)=([^\]]+)\]/g));
        for (const match of matches)
            await this.upsertMemory(patientId, match[1].trim(), match[2].trim());
        return matches.length > 0;
    },
    stripControlTags(reply) {
        return reply.replace(/\[MEMORY:[^\]]+\]/g, '').replace(/\[ACTION:contact_family:[^\]]+\]/g, '').trim();
    },
    extractFamilyActionRequest(companionReply) {
        const match = /\[ACTION:contact_family:([^\]]+)\]/.exec(companionReply);
        return { hasAction: Boolean(match), message: match?.[1].trim() ?? null };
    }
};
//# sourceMappingURL=memory.service.js.map