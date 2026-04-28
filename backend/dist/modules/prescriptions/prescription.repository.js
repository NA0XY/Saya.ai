"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionRepository = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const dateTime_1 = require("../../utils/dateTime");
exports.prescriptionRepository = {
    async create(data) {
        const result = await supabase_1.supabase.from('prescriptions').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create prescription');
        return result.data;
    },
    async findById(id) {
        const { data, error } = await supabase_1.supabase.from('prescriptions').select('*').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load prescription');
        return data;
    },
    async findByIdWithMedicines(id) {
        const { data, error } = await supabase_1.supabase.from('prescriptions').select('*, medicines(*)').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load prescription medicines');
        return data;
    },
    async findByPatientId(patientId) {
        const { data, error } = await supabase_1.supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        if (error)
            throw apiError_1.ApiError.internal('Failed to list prescriptions');
        return data ?? [];
    },
    async update(id, data) {
        const result = await supabase_1.supabase.from('prescriptions').update(data).eq('id', id).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to update prescription');
        return result.data;
    },
    async delete(id) {
        const { error } = await supabase_1.supabase.from('prescriptions').delete().eq('id', id);
        if (error)
            throw apiError_1.ApiError.internal('Failed to delete prescription');
    },
    async createMedicines(medicines) {
        if (medicines.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase.from('medicines').insert(medicines).select('*');
        if (error || !data)
            throw apiError_1.ApiError.internal('Failed to create medicines');
        return data;
    },
    async markVerified(id, verifiedBy, medicines) {
        await supabase_1.supabase.from('medicines').delete().eq('prescription_id', id);
        const savedMedicines = await this.createMedicines(medicines);
        try {
            const prescription = await this.update(id, { verified: true, verified_at: (0, dateTime_1.isoNow)(), verified_by: verifiedBy });
            return { ...prescription, medicines: savedMedicines };
        }
        catch (error) {
            await supabase_1.supabase.from('medicines').delete().eq('prescription_id', id);
            throw error;
        }
    }
};
//# sourceMappingURL=prescription.repository.js.map