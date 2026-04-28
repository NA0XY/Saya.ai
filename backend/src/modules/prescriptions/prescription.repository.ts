import { supabase } from '../../config/supabase';
import type { Medicine, Prescription } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { isoNow } from '../../utils/dateTime';
import type { PrescriptionWithMedicines } from './prescription.types';

type PrescriptionCreate = Omit<Prescription, 'id' | 'created_at'>;

export const prescriptionRepository = {
  async create(data: PrescriptionCreate): Promise<Prescription> {
    const result = await supabase.from('prescriptions').insert(data).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to create prescription');
    return result.data;
  },
  async findById(id: string): Promise<Prescription | null> {
    const { data, error } = await supabase.from('prescriptions').select('*').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load prescription');
    return data;
  },
  async findByIdWithMedicines(id: string): Promise<PrescriptionWithMedicines | null> {
    const { data, error } = await supabase.from('prescriptions').select('*, medicines(*)').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load prescription medicines');
    return data as PrescriptionWithMedicines | null;
  },
  async findByPatientId(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    if (error) throw ApiError.internal('Failed to list prescriptions');
    return data ?? [];
  },
  async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    const result = await supabase.from('prescriptions').update(data).eq('id', id).select('*').single();
    if (result.error || !result.data) throw ApiError.internal('Failed to update prescription');
    return result.data;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('prescriptions').delete().eq('id', id);
    if (error) throw ApiError.internal('Failed to delete prescription');
  },
  async createMedicines(medicines: Omit<Medicine, 'id' | 'created_at'>[]): Promise<Medicine[]> {
    if (medicines.length === 0) return [];
    const { data, error } = await supabase.from('medicines').insert(medicines).select('*');
    if (error || !data) throw ApiError.internal('Failed to create medicines');
    return data;
  },
  async markVerified(id: string, verifiedBy: string, medicines: Omit<Medicine, 'id' | 'created_at'>[]): Promise<PrescriptionWithMedicines> {
    await supabase.from('medicines').delete().eq('prescription_id', id);
    const savedMedicines = await this.createMedicines(medicines);
    try {
      const prescription = await this.update(id, { verified: true, verified_at: isoNow(), verified_by: verifiedBy });
      return { ...prescription, medicines: savedMedicines };
    } catch (error) {
      await supabase.from('medicines').delete().eq('prescription_id', id);
      throw error;
    }
  }
};
