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
