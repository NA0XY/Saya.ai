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
