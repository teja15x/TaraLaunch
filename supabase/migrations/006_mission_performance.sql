-- Create mission_performance table to track game scores and mission recommendations
CREATE TABLE IF NOT EXISTS mission_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  game_id VARCHAR(255) NOT NULL,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  difficulty_recommended INTEGER,
  reason_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_mission_perf_user ON mission_performance (user_id);
CREATE INDEX IF NOT EXISTS idx_mission_perf_user_game ON mission_performance (user_id, game_id);

-- Enable RLS
ALTER TABLE mission_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own mission performance"
ON mission_performance FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission performance"
ON mission_performance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission performance"
ON mission_performance FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mission_perf_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mission_perf_timestamp_trigger
BEFORE UPDATE ON mission_performance
FOR EACH ROW
EXECUTE FUNCTION update_mission_perf_timestamp();
