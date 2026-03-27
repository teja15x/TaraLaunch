-- Create parent_profiles table for parent account mapping
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  child_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  relation VARCHAR(50), -- "parent", "guardian", "educator"
  email_frequency VARCHAR(20) DEFAULT 'weekly', -- "weekly", "biweekly", "off"
  last_weekly_email_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parent_notifications table for alert tracking
CREATE TABLE IF NOT EXISTS parent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parent_profiles (id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- "weekly_report", "milestone_unlock", "concern_alert"
  child_achievement TEXT,
  notification_data JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_profiles_user ON parent_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_child ON parent_profiles (child_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent ON parent_notifications (parent_id);

-- Enable RLS
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can read their own profiles"
ON parent_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Parents can update their own profiles"
ON parent_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can insert profiles"
ON parent_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can read their notifications"
ON parent_notifications FOR SELECT
USING (parent_id IN (SELECT id FROM parent_profiles WHERE user_id = auth.uid()));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_parent_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_profile_timestamp_trigger
BEFORE UPDATE ON parent_profiles
FOR EACH ROW
EXECUTE FUNCTION update_parent_profile_timestamp();
