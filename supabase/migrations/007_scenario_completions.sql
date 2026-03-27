-- Create scenario_completions table for tracking branching decisions
CREATE TABLE IF NOT EXISTS scenario_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  scenario_id VARCHAR(255) NOT NULL,
  path_taken TEXT[], -- Array of choice IDs
  traits_detected JSONB DEFAULT '{}', -- JSON object of detected traits
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user and scenario lookups
CREATE INDEX IF NOT EXISTS idx_scenario_compl_user ON scenario_completions (user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_compl_scenario ON scenario_completions (scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_compl_user_scenario ON scenario_completions (user_id, scenario_id);

-- Enable RLS
ALTER TABLE scenario_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own scenario completions"
ON scenario_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenario completions"
ON scenario_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenario completions"
ON scenario_completions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_scenario_compl_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scenario_compl_timestamp_trigger
BEFORE UPDATE ON scenario_completions
FOR EACH ROW
EXECUTE FUNCTION update_scenario_compl_timestamp();
