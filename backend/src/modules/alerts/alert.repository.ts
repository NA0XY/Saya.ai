import { supabase } from '../../config/supabase';
import type { Alert } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { isoNow } from '../../utils/dateTime';
import type { AlertWithPatient, CreateAlertInput } from './alert.types';

export const alertRepository = {
  async create(data: CreateAlertInput): Promise<Alert> {
    const result = await supabase.from('alerts').insert({ ...data, sms_sent: false, sms_sent_at: null, resolved: false }).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create alert');
    return result.data;
  },
  async findByPatientId(patientId: string, includeResolved = false): Promise<Alert[]> {
    let query = supabase.from('alerts').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    if (!includeResolved) query = query.eq('resolved', false);
    const { data, error } = await query;
    if (error) throw ApiError.internal('Failed to list alerts');
    return data ?? [];
  },
  async findByCaregiverId(caregiverId: string, limit = 20): Promise<AlertWithPatient[]> {
    const { data, error } = await supabase.from('alerts').select('*, patient:patients(full_name, phone)').eq('caregiver_id', caregiverId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw ApiError.internal('Failed to list caregiver alerts');
    return (data ?? []) as AlertWithPatient[];
  },
  async resolve(id: string): Promise<void> {
    const { error } = await supabase.from('alerts').update({ resolved: true }).eq('id', id);
    if (error) throw ApiError.internal('Failed to resolve alert');
  },
  async markSmsSent(id: string): Promise<void> {
    const { error } = await supabase.from('alerts').update({ sms_sent: true, sms_sent_at: isoNow() }).eq('id', id);
    if (error) throw ApiError.internal('Failed to mark SMS sent');
  }
};
