-- Add stage detection persistence to profiles
-- This allows the system to remember a student's detected life stage across conversations

-- Add columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS detected_stage TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stage_confidence INTEGER DEFAULT 0 CHECK (stage_confidence >= 0 AND stage_confidence <= 100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stage_last_updated TIMESTAMPTZ;

-- Valid detected stages: pre-12th, post-12th, in-college, post-college
-- This helps the system:
-- 1. Remember which life stage a student is in
-- 2. Detect when they contradict previous statements
-- 3. Route them to the correct counseling track
-- 4. Provide stage-appropriate guidance

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_detected_stage ON public.profiles (detected_stage);

-- Create a chat_stage_overrides table to track when students correct/clarify their stage
CREATE TABLE IF NOT EXISTS public.chat_stage_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  previous_stage TEXT,
  new_stage TEXT,
  message_number INTEGER,
  reason TEXT, -- why the override happened (e.g., 'student_contradiction', 'clarification', 'manual_correction')
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_stage_overrides ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stage_overrides_user ON public.chat_stage_overrides (user_id);

-- Enable RLS on profiles update for stage columns
CREATE POLICY "Users can update own detected_stage"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

COMMENT ON COLUMN public.profiles.detected_stage IS 'Auto-detected life stage: pre-12th, post-12th, in-college, or post-college';
COMMENT ON COLUMN public.profiles.stage_confidence IS 'Confidence level (0-100) of stage detection';
COMMENT ON COLUMN public.profiles.stage_last_updated IS 'Timestamp when stage was last detected/updated';
