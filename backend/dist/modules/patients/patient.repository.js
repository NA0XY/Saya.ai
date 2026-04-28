"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientRepository = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
exports.patientRepository = {
    async findById(id) {
        const { data, error } = await supabase_1.supabase.from('patients').select('*').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load patient');
        return data;
    },
    async findByIdWithContacts(id) {
        const { data, error } = await supabase_1.supabase.from('patients').select('*, approved_contacts(*)').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load patient contacts');
        return data;
    },
    async findByCaregiverId(caregiverId) {
        const { data, error } = await supabase_1.supabase.from('patients').select('*').eq('caregiver_id', caregiverId).order('created_at', { ascending: false });
        if (error)
            throw apiError_1.ApiError.internal('Failed to list patients');
        return data ?? [];
    },
    async create(data) {
        const result = await supabase_1.supabase.from('patients').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create patient');
        return result.data;
    },
    async update(id, data) {
        const result = await supabase_1.supabase.from('patients').update(data).eq('id', id).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to update patient');
        return result.data;
    },
    async delete(id) {
        const { error } = await supabase_1.supabase.from('patients').delete().eq('id', id);
        if (error)
            throw apiError_1.ApiError.internal('Failed to delete patient');
    },
    async createContact(data) {
        const result = await supabase_1.supabase.from('approved_contacts').insert(data).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create approved contact');
        return result.data;
    },
    async findContactsByPatientId(patientId) {
        const { data, error } = await supabase_1.supabase.from('approved_contacts').select('*').eq('patient_id', patientId).order('created_at');
        if (error)
            throw apiError_1.ApiError.internal('Failed to list approved contacts');
        return data ?? [];
    },
    async findEscalationContacts(patientId) {
        const { data, error } = await supabase_1.supabase.from('approved_contacts').select('*').eq('patient_id', patientId).eq('can_receive_escalation_sms', true);
        if (error)
            throw apiError_1.ApiError.internal('Failed to list escalation contacts');
        return data ?? [];
    }
};
//# sourceMappingURL=patient.repository.js.map