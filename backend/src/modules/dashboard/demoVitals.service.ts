import { supabase } from '../../config/supabase';
import { DEMO_VITALS } from '../../data/demoVitals';
import type { DemoVital } from '../../types/database';
import { ApiError } from '../../utils/apiError';

export const demoVitalsService = {
  async getDemoVitals(patientId: string, metric?: string): Promise<DemoVital[]> {
    let query = supabase.from('demo_vitals').select('*').eq('patient_id', patientId).order('recorded_at');
    if (metric) query = query.eq('metric', metric as DemoVital['metric']);
    const { data, error } = await query;
    if (error) throw ApiError.internal('Failed to load vitals');
    const rows = data ?? [];
    if (rows.length > 0) return rows;
    return DEMO_VITALS.filter((vital) => vital.patient_id === patientId && (!metric || vital.metric === metric));
  },
  async seedDemoVitals(patientId: string): Promise<void> {
    const rows = DEMO_VITALS.map((vital) => ({ ...vital, patient_id: patientId }));
    const { error } = await supabase.from('demo_vitals').upsert(rows);
    if (error) throw ApiError.internal('Failed to seed demo vitals');
  }
};
