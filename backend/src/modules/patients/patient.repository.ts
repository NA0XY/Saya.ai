import { supabase } from '../../config/supabase';
import type { ApprovedContact, Patient } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import type { PatientWithContacts } from './patient.types';

export const patientRepository = {
  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load patient');
    return data;
  },
  async findByIdWithContacts(id: string): Promise<PatientWithContacts | null> {
    const { data, error } = await supabase.from('patients').select('*, approved_contacts(*)').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load patient contacts');
    return data as PatientWithContacts | null;
  },
  async findByCaregiverId(caregiverId: string): Promise<Patient[]> {
    const { data, error } = await supabase.from('patients').select('*').eq('caregiver_id', caregiverId).order('created_at', { ascending: false });
    if (error) throw ApiError.internal('Failed to list patients');
    return data ?? [];
  },
  async create(data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const result = await supabase.from('patients').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create patient');
    return result.data;
  },
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    const result = await supabase.from('patients').update(data).eq('id', id).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to update patient');
    return result.data;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw ApiError.internal('Failed to delete patient');
  },
  async createContact(data: Omit<ApprovedContact, 'id' | 'created_at'>): Promise<ApprovedContact> {
    const result = await supabase.from('approved_contacts').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create approved contact');
    return result.data;
  },
  async findContactsByPatientId(patientId: string): Promise<ApprovedContact[]> {
    const { data, error } = await supabase.from('approved_contacts').select('*').eq('patient_id', patientId).order('created_at');
    if (error) throw ApiError.internal('Failed to list approved contacts');
    return data ?? [];
  },
  async findEscalationContacts(patientId: string): Promise<ApprovedContact[]> {
    const { data, error } = await supabase.from('approved_contacts').select('*').eq('patient_id', patientId).eq('can_receive_escalation_sms', true);
    if (error) throw ApiError.internal('Failed to list escalation contacts');
    return data ?? [];
  }
};
