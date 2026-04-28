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
