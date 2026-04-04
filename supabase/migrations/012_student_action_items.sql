-- Create an enum for action item status
CREATE TYPE action_item_status AS ENUM ('pending', 'completed', 'missed');

-- Create student_action_items table to store AI-assigned tasks/goals
CREATE TABLE IF NOT EXISTS student_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status action_item_status DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups by user and status
CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON student_action_items (user_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON student_action_items (status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON student_action_items (due_date);

-- Trigger to auto-update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_action_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_action_items_timestamp
BEFORE UPDATE ON student_action_items
FOR EACH ROW
EXECUTE FUNCTION update_action_items_timestamp();

-- Grant permissions to authenticated users via Row Level Security (RLS)
ALTER TABLE student_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own action items"
ON student_action_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own action items"
ON student_action_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own action items"
ON student_action_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Parent/View policies can be added here later so parents can see 'missed' tasks.
