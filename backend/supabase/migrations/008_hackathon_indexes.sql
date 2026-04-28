CREATE INDEX IF NOT EXISTS idx_alerts_caregiver_resolved_created ON alerts(caregiver_id, resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prescriptions_caregiver_created ON prescriptions(caregiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_caregiver_active ON medication_schedules(caregiver_id, active);
CREATE INDEX IF NOT EXISTS idx_call_logs_patient_created ON call_logs(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status_created ON call_logs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approved_contacts_patient_escalation ON approved_contacts(patient_id, can_receive_escalation_sms);
CREATE INDEX IF NOT EXISTS idx_patient_memories_patient_key ON patient_memories(patient_id, memory_key);
