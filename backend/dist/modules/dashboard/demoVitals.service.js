"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoVitalsService = void 0;
const supabase_1 = require("../../config/supabase");
const demoVitals_1 = require("../../data/demoVitals");
const apiError_1 = require("../../utils/apiError");
exports.demoVitalsService = {
    async getDemoVitals(patientId, metric) {
        let query = supabase_1.supabase.from('demo_vitals').select('*').eq('patient_id', patientId).order('recorded_at');
        if (metric)
            query = query.eq('metric', metric);
        const { data, error } = await query;
        if (error)
            throw apiError_1.ApiError.internal('Failed to load vitals');
        const rows = data ?? [];
        if (rows.length > 0)
            return rows;
        return demoVitals_1.DEMO_VITALS.filter((vital) => vital.patient_id === patientId && (!metric || vital.metric === metric));
    },
    async seedDemoVitals(patientId) {
        const rows = demoVitals_1.DEMO_VITALS.map((vital) => ({ ...vital, patient_id: patientId }));
        const { error } = await supabase_1.supabase.from('demo_vitals').upsert(rows);
        if (error)
            throw apiError_1.ApiError.internal('Failed to seed demo vitals');
    }
};
//# sourceMappingURL=demoVitals.service.js.map