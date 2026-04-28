-- Expanded schema generated on 2026-04-28T21:08:11.5896362+05:30

-- >>> BEGIN supabase\migrations\001_users_patients_contacts.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'caregiver' CHECK (role IN ('caregiver','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  language_preference TEXT NOT NULL DEFAULT 'hi' CHECK (language_preference IN ('hi','en')),
  companion_tone TEXT NOT NULL DEFAULT 'warm' CHECK (companion_tone IN ('warm','formal','playful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approved_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  can_receive_escalation_sms BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS patients_set_updated_at ON patients;
CREATE TRIGGER patients_set_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- <<< END supabase\migrations\001_users_patients_contacts.sql


-- >>> BEGIN supabase\migrations\002_prescriptions_medicines.sql

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  raw_ocr_text TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);

CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  drug_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  route TEXT,
  low_confidence BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medicines_prescription_id ON medicines(prescription_id);

-- <<< END supabase\migrations\002_prescriptions_medicines.sql


-- >>> BEGIN supabase\migrations\003_drug_interactions.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  drug_aliases TEXT[] NOT NULL DEFAULT '{}',
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('food','drug')),
  interacting_substance TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high','moderate','low')),
  description_en TEXT NOT NULL,
  description_hi TEXT,
  source TEXT NOT NULL DEFAULT 'indian_db' CHECK (source IN ('indian_db','openfda','rxnorm')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT drug_interactions_unique UNIQUE (drug_name, interaction_type, interacting_substance)
);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_aliases ON drug_interactions USING GIN (drug_aliases);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_name_trgm ON drug_interactions USING GIN (drug_name gin_trgm_ops);

-- <<< END supabase\migrations\003_drug_interactions.sql


-- >>> BEGIN supabase\migrations\004_medication_schedules_calls.sql

CREATE TABLE IF NOT EXISTS medication_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  scheduled_time TEXT NOT NULL CHECK (scheduled_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  custom_message TEXT,
  language TEXT NOT NULL DEFAULT 'hi' CHECK (language IN ('hi','en')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_due ON medication_schedules(active, scheduled_time);
DROP TRIGGER IF EXISTS medication_schedules_set_updated_at ON medication_schedules;
CREATE TRIGGER medication_schedules_set_updated_at BEFORE UPDATE ON medication_schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exotel_call_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','initiated','answered','confirmed','rejected','no_answer','failed')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  initiated_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ivr_response TEXT CHECK (ivr_response IN ('1','2')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_call_logs_schedule_attempt ON call_logs(schedule_id, attempt_number);
CREATE INDEX IF NOT EXISTS idx_call_logs_sid ON call_logs(exotel_call_sid);

-- <<< END supabase\migrations\004_medication_schedules_calls.sql


-- >>> BEGIN supabase\migrations\005_companion_memory_messages.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS companion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('joy','neutral','anxiety','sadness')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_messages_patient_created ON companion_messages(patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS patient_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT patient_memories_unique UNIQUE (patient_id, memory_key)
);
DROP TRIGGER IF EXISTS patient_memories_set_updated_at ON patient_memories;
CREATE TRIGGER patient_memories_set_updated_at BEFORE UPDATE ON patient_memories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- <<< END supabase\migrations\005_companion_memory_messages.sql


-- >>> BEGIN supabase\migrations\006_alerts_news_vitals.sql

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('missed_medication','emotional_escalation','companion_request')),
  message TEXT NOT NULL,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_patient_resolved_created ON alerts(patient_id, resolved, created_at DESC);

CREATE TABLE IF NOT EXISTS news_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_news_cache_fetched_at ON news_cache(fetched_at DESC);

CREATE TABLE IF NOT EXISTS demo_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_demo_vitals_patient_metric_recorded ON demo_vitals(patient_id, metric, recorded_at DESC);

-- <<< END supabase\migrations\006_alerts_news_vitals.sql


-- >>> BEGIN supabase\migrations\007_call_retry_jobs.sql

CREATE TABLE IF NOT EXISTS call_retry_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  call_log_id UUID REFERENCES call_logs(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
  occurrence_date DATE NOT NULL DEFAULT CURRENT_DATE,
  run_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','cancelled','failed')),
  final_alert_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_retry_jobs_due ON call_retry_jobs(status, run_at);
CREATE INDEX IF NOT EXISTS idx_call_retry_jobs_schedule_status ON call_retry_jobs(schedule_id, occurrence_date, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_call_retry_jobs_unique_pending_attempt
  ON call_retry_jobs(schedule_id, occurrence_date, attempt_number)
  WHERE status IN ('pending','processing');

DROP TRIGGER IF EXISTS call_retry_jobs_set_updated_at ON call_retry_jobs;
CREATE TRIGGER call_retry_jobs_set_updated_at BEFORE UPDATE ON call_retry_jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- <<< END supabase\migrations\007_call_retry_jobs.sql


-- >>> BEGIN supabase\migrations\008_hackathon_indexes.sql

CREATE INDEX IF NOT EXISTS idx_alerts_caregiver_resolved_created ON alerts(caregiver_id, resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_caregiver_created ON prescriptions(caregiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_caregiver_active ON medication_schedules(caregiver_id, active);
CREATE INDEX IF NOT EXISTS idx_call_logs_patient_created ON call_logs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status_created ON call_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approved_contacts_patient_escalation ON approved_contacts(patient_id, can_receive_escalation_sms);
CREATE INDEX IF NOT EXISTS idx_patient_memories_patient_key ON patient_memories(patient_id, memory_key);

-- <<< END supabase\migrations\008_hackathon_indexes.sql

