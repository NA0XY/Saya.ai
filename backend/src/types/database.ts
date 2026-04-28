export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: 'caregiver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  caregiver_id: string;
  full_name: string;
  phone: string;
  date_of_birth: string | null;
  language_preference: 'hi' | 'en';
  companion_tone: 'warm' | 'formal' | 'playful';
  created_at: string;
  updated_at: string;
}

export interface ApprovedContact {
  id: string;
  patient_id: string;
  name: string;
  phone: string;
  relationship: string;
  can_receive_escalation_sms: boolean;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  caregiver_id: string;
  image_url: string;
  raw_ocr_text: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface Medicine {
  id: string;
  prescription_id: string;
  drug_name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  low_confidence: boolean;
  created_at: string;
}

export interface DrugInteraction {
  id: string;
  drug_name: string;
  drug_aliases: string[];
  interaction_type: 'food' | 'drug';
  interacting_substance: string;
  severity: 'high' | 'moderate' | 'low';
  description_en: string;
  description_hi: string | null;
  source: 'indian_db' | 'openfda' | 'rxnorm';
  created_at: string;
}

export interface MedicationSchedule {
  id: string;
  patient_id: string;
  caregiver_id: string;
  medicine_name: string;
  scheduled_time: string;
  custom_message: string | null;
  language: 'hi' | 'en';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  schedule_id: string;
  patient_id: string;
  exotel_call_sid: string | null;
  status: 'pending' | 'initiated' | 'answered' | 'confirmed' | 'rejected' | 'no_answer' | 'failed';
  attempt_number: number;
  initiated_at: string | null;
  answered_at: string | null;
  ivr_response: '1' | '2' | null;
  created_at: string;
}

export interface CallRetryJob {
  id: string;
  schedule_id: string;
  call_log_id: string | null;
  patient_id: string;
  attempt_number: number;
  occurrence_date: string;
  run_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  final_alert_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanionMessage {
  id: string;
  patient_id: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment: 'joy' | 'neutral' | 'anxiety' | 'sadness' | null;
  created_at: string;
}

export interface PatientMemory {
  id: string;
  patient_id: string;
  memory_key: string;
  memory_value: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  caregiver_id: string;
  alert_type: 'missed_medication' | 'emotional_escalation' | 'companion_request';
  message: string;
  sms_sent: boolean;
  sms_sent_at: string | null;
  resolved: boolean;
  created_at: string;
}

export interface NewsCache {
  id: string;
  headline: string;
  summary: string | null;
  source: string | null;
  fetched_at: string;
}

export interface DemoVital {
  id: string;
  patient_id: string;
  metric: 'blood_pressure_systolic' | 'blood_pressure_diastolic' | 'heart_rate' | 'blood_sugar' | 'spo2';
  value: number;
  unit: string;
  recorded_at: string;
}

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: Table<User>;
      patients: Table<Patient>;
      approved_contacts: Table<ApprovedContact>;
      prescriptions: Table<Prescription>;
      medicines: Table<Medicine>;
      drug_interactions: Table<DrugInteraction>;
      medication_schedules: Table<MedicationSchedule>;
      call_logs: Table<CallLog>;
      call_retry_jobs: Table<CallRetryJob>;
      companion_messages: Table<CompanionMessage>;
      patient_memories: Table<PatientMemory>;
      alerts: Table<Alert>;
      news_cache: Table<NewsCache>;
      demo_vitals: Table<DemoVital>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
