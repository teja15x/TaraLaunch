-- Knowledge retrieval telemetry for confidence and role-ranking analysis
CREATE TABLE IF NOT EXISTS public.knowledge_retrieval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  retrieval_mode TEXT NOT NULL DEFAULT 'expanded', -- core | expanded
  detected_stage TEXT,
  counseling_track TEXT,
  city_context TEXT,
  tier_context TEXT,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  clarifying_question TEXT,
  top_role_1 TEXT,
  top_role_2 TEXT,
  top_role_3 TEXT,
  selected_role TEXT,
  latest_message_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_retrieval_events_user ON public.knowledge_retrieval_events (user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_retrieval_events_created ON public.knowledge_retrieval_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_retrieval_events_track ON public.knowledge_retrieval_events (counseling_track);

ALTER TABLE public.knowledge_retrieval_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own knowledge retrieval events"
  ON public.knowledge_retrieval_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert knowledge retrieval events"
  ON public.knowledge_retrieval_events FOR INSERT
  WITH CHECK (true);
