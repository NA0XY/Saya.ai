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
