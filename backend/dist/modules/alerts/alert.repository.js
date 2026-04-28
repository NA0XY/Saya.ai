"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertRepository = void 0;
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const dateTime_1 = require("../../utils/dateTime");
exports.alertRepository = {
    async create(data) {
        const result = await supabase_1.supabase.from('alerts').insert({ ...data, sms_sent: false, sms_sent_at: null, resolved: false }).select('*').single();
        if (result.error || !result.data)
            throw apiError_1.ApiError.internal('Failed to create alert');
        return result.data;
    },
    async findByPatientId(patientId, includeResolved = false) {
        let query = supabase_1.supabase.from('alerts').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
        if (!includeResolved)
            query = query.eq('resolved', false);
        const { data, error } = await query;
        if (error)
            throw apiError_1.ApiError.internal('Failed to list alerts');
        return data ?? [];
    },
    async findByCaregiverId(caregiverId, limit = 20) {
        const { data, error } = await supabase_1.supabase.from('alerts').select('*, patient:patients(full_name, phone)').eq('caregiver_id', caregiverId).order('created_at', { ascending: false }).limit(limit);
        if (error)
            throw apiError_1.ApiError.internal('Failed to list caregiver alerts');
        return (data ?? []);
    },
    async resolve(id) {
        const { error } = await supabase_1.supabase.from('alerts').update({ resolved: true }).eq('id', id);
        if (error)
            throw apiError_1.ApiError.internal('Failed to resolve alert');
    },
    async markSmsSent(id) {
        const { error } = await supabase_1.supabase.from('alerts').update({ sms_sent: true, sms_sent_at: (0, dateTime_1.isoNow)() }).eq('id', id);
        if (error)
            throw apiError_1.ApiError.internal('Failed to mark SMS sent');
    }
};
//# sourceMappingURL=alert.repository.js.map