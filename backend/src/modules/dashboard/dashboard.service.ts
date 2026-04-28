import { supabase } from '../../config/supabase';
import { DEMO_PRESCRIPTIONS } from '../../data/demoPrescriptions';
import type { Alert, CallLog, MedicationSchedule, Patient } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { alertRepository } from '../alerts/alert.repository';
import { medicationRepository } from '../medications/medication.repository';
import { patientRepository } from '../patients/patient.repository';
import type { PatientSummary } from '../patients/patient.types';
import { prescriptionRepository } from '../prescriptions/prescription.repository';
import { demoVitalsService } from './demoVitals.service';

export interface DashboardData {
  patients: PatientSummary[];
  recentAlerts: Alert[];
  activeSchedules: MedicationSchedule[];
  recentCallLogs: CallLog[];
}

export interface PatientDashboardData {
  patient: Patient;
  prescriptions: unknown[];
  schedules: MedicationSchedule[];
  callLogs: CallLog[];
  companionMessageCount: number;
  vitals: unknown[];
}

const demoPatient: Patient = { id: 'demo-patient-uuid', caregiver_id: 'demo-caregiver-uuid', full_name: 'Ramesh Kumar', phone: '+919876543210', date_of_birth: '1948-01-01', language_preference: 'hi', companion_tone: 'warm', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

export const dashboardService = {
  async getDashboardData(caregiverId: string, demo = false): Promise<DashboardData> {
    if (demo) return { patients: [demoPatient], recentAlerts: [], activeSchedules: [], recentCallLogs: [] };
    const patients = await patientRepository.findByCaregiverId(caregiverId);
    const recentAlerts = await alertRepository.findByCaregiverId(caregiverId, 5) as Alert[];
    const activeSchedules = (await Promise.all(patients.map((patient) => medicationRepository.findSchedulesByPatient(patient.id)))).flat();
    const { data, error } = await supabase.from('call_logs').select('*').in('patient_id', patients.map((p) => p.id)).order('created_at', { ascending: false }).limit(10);
    if (error) throw ApiError.internal('Failed to load call logs');
    return { patients, recentAlerts, activeSchedules, recentCallLogs: data ?? [] };
  },
  async getPatientDashboard(patientId: string, caregiverId: string, demo = false): Promise<PatientDashboardData> {
    if (demo || patientId === 'demo-patient-uuid') return { patient: demoPatient, prescriptions: DEMO_PRESCRIPTIONS, schedules: [], callLogs: [], companionMessageCount: 0, vitals: await demoVitalsService.getDemoVitals(patientId) };
    const patient = await patientRepository.findById(patientId);
    if (!patient) throw ApiError.notFound('Patient');
    if (patient.caregiver_id !== caregiverId) throw ApiError.forbidden('You do not have access to this patient');
    const [prescriptions, schedules, vitals, countResult] = await Promise.all([
      prescriptionRepository.findByPatientId(patientId),
      medicationRepository.findSchedulesByPatient(patientId),
      demoVitalsService.getDemoVitals(patientId),
      supabase.from('companion_messages').select('*', { count: 'exact', head: true }).eq('patient_id', patientId)
    ]);
    const logs = (await Promise.all(schedules.map((schedule) => medicationRepository.findCallLogsBySchedule(schedule.id)))).flat();
    return { patient, prescriptions, schedules, callLogs: logs, companionMessageCount: countResult.count ?? 0, vitals };
  }
};
