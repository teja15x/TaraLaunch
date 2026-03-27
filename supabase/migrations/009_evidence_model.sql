/**
 * ═══════════════════════════════════════════════════════════════
 * MIGRATION 009: Evidence Model & Counseling State Persistence
 * ═══════════════════════════════════════════════════════════════
 * 
 * Phase 2 Database Schema for:
 * - Evidence tracking (games, assessments, chat, constraints, role tests)
 * - Contradiction detection & resolution history
 * - Student constraint profiles (location, affordability, family context)
 * - Counseling session state tracking for stage gates
 * 
 * See: src/docs/COUNSELING_OS_GUARDRAILS.md
 * See: src/lib/career-engine/stageGates.ts
 */

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "plpgsql";

-- ═══════════════════════════════════════════════════════════════
-- Table: evidence_log
-- Purpose: Track all evidence sources contributing to recommendations
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.evidence_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.counseling_sessions (id) ON DELETE CASCADE,
  
  -- Evidence identification
  source VARCHAR(50) NOT NULL CHECK (source IN ('chat', 'game', 'assessment', 'constraint', 'roleDepthTest')),
  source_id VARCHAR(255),  -- e.g., game_id, assessment_type, test_id
  
  -- Evidence signal (human-readable)
  signal TEXT NOT NULL,  -- e.g., "ScenarioQuest 89%: Strong leadership decision-making"
  career_dimension VARCHAR(100),  -- e.g., "investigative", "linguistic", "leadership"
  signal_value NUMERIC(5,2),  -- Numeric score for this dimension (0-100)
  weight NUMERIC(5,3),  -- Contribution weight to final ranking (0.000-1.000)
  
  -- Resolution tracking
  resolved_contradiction_id UUID REFERENCES public.contradictions (id) ON DELETE SET NULL,
  
  -- Temporal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_log_user ON public.evidence_log (user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_log_session ON public.evidence_log (session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_log_source ON public.evidence_log (source);
CREATE INDEX IF NOT EXISTS idx_evidence_log_created ON public.evidence_log (created_at DESC);

ALTER TABLE public.evidence_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own evidence"
ON public.evidence_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert evidence (via API)"
ON public.evidence_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Table: contradictions
-- Purpose: Track detected contradictions & resolutions
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.contradictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.counseling_sessions (id) ON DELETE CASCADE,
  
  -- Contradiction identification
  signal_1 TEXT NOT NULL,  -- e.g., "Chat: 'I want to code'"
  signal_2 TEXT NOT NULL,  -- e.g., "Games: 8 creative, 0 logic"
  career_dimension VARCHAR(100),  -- e.g., "coding_vs_creative"
  
  -- Severity & state
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  is_resolved BOOLEAN DEFAULT FALSE,
  
  -- Resolution details
  resolution_move TEXT,  -- e.g., "Counselor reprobe: Tell me about solving technical problems..."
  resolution_context JSONB,  -- Full context of how it was resolved
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Temporal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contradictions_user ON public.contradictions (user_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_session ON public.contradictions (session_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_severity ON public.contradictions (severity);
CREATE INDEX IF NOT EXISTS idx_contradictions_resolved ON public.contradictions (is_resolved);
CREATE INDEX IF NOT EXISTS idx_contradictions_created ON public.contradictions (created_at DESC);

ALTER TABLE public.contradictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own contradictions"
ON public.contradictions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert contradictions"
ON public.contradictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update contradictions"
ON public.contradictions FOR UPDATE
USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Table: constraint_profiles
-- Purpose: Track student-specific constraints (family, affordability, location)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.constraint_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE UNIQUE,
  
  -- Geographic constraints
  location_flexibility VARCHAR(50) CHECK (location_flexibility IN ('within_state', 'metro_cities', 'anywhere')),
  
  -- Financial constraints
  affordability_level VARCHAR(50) CHECK (affordability_level IN ('aspirational', 'accessible', 'tight')),
  
  -- Language preferences
  language_preferences TEXT[],  -- e.g., ["hi", "en", "te"]
  
  -- Family context
  family_aspiration TEXT,  -- e.g., "IIT engineer", "stable government job"
  parent_risk_tolerance VARCHAR(20) CHECK (parent_risk_tolerance IN ('low', 'medium', 'high')),
  family_pressure_level VARCHAR(20) CHECK (family_pressure_level IN ('low', 'moderate', 'high')),
  
  -- Timeline
  time_to_decision VARCHAR(50),  -- e.g., "immediate", "1-2 years", "exploratory"
  
  -- Completeness tracking
  is_complete BOOLEAN DEFAULT FALSE,  -- All key fields filled
  completion_score NUMERIC(3,2),  -- Percentage of fields filled (0.00-1.00)
  
  -- Temporal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_constraint_profiles_user ON public.constraint_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_constraint_profiles_complete ON public.constraint_profiles (is_complete);

ALTER TABLE public.constraint_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own constraint profile"
ON public.constraint_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert constraint profile"
ON public.constraint_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update constraint profile"
ON public.constraint_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Table: counseling_sessions
-- Purpose: Track overall counseling session state (stage gates, progress)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.counseling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Stage tracking
  current_stage VARCHAR(50) NOT NULL DEFAULT 'discovery' CHECK (current_stage IN ('discovery', 'narrowing', 'recommendation', 'execution')),
  
  -- Assessment progress
  riasec_progress NUMERIC(3,1) DEFAULT 0,  -- % complete (0-100)
  gardner_progress NUMERIC(3,1) DEFAULT 0,
  big_five_progress NUMERIC(3,1) DEFAULT 0,
  
  -- Completion tracking
  games_completed TEXT[],  -- Array of game IDs completed
  role_depth_tests_completed TEXT[],  -- Array of role IDs tested
  
  -- Turn/session tracking
  turns_in_stage INTEGER DEFAULT 0,  -- Turns at current stage
  total_turns INTEGER DEFAULT 0,  -- Total turns across all stages
  
  -- Language & context
  language VARCHAR(10) DEFAULT 'en-IN',  -- e.g., "te", "hi", "en-IN"
  age_tier VARCHAR(50) CHECK (age_tier IN ('explorer', 'discoverer', 'navigator', 'pivoter')),
  
  -- Temporal tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counseling_sessions_user ON public.counseling_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_stage ON public.counseling_sessions (current_stage);
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_last_active ON public.counseling_sessions (last_active DESC);

ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own counseling session"
ON public.counseling_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert counseling session"
ON public.counseling_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update counseling session"
ON public.counseling_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Helper Functions
-- ═══════════════════════════════════════════════════════════════

-- Function: Calculate evidence quality for a session
CREATE OR REPLACE FUNCTION public.calculate_evidence_quality_score(session_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_evidence INT;
  chat_evidence INT;
  assessment_evidence INT;
  game_evidence INT;
  quality_score NUMERIC;
BEGIN
  -- Count evidence by source
  SELECT COUNT(*) INTO total_evidence FROM evidence_log WHERE counseling_sessions.id = session_id;
  SELECT COUNT(*) INTO chat_evidence FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'chat';
  SELECT COUNT(*) INTO assessment_evidence FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'assessment';
  SELECT COUNT(*) INTO game_evidence FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'game';
  
  -- Simple quality score: higher is better, requires diverse sources
  quality_score := CASE
    WHEN total_evidence = 0 THEN 0
    WHEN chat_evidence > 0 AND assessment_evidence > 0 AND game_evidence > 0 THEN 1.0
    WHEN chat_evidence > 0 AND assessment_evidence > 0 THEN 0.7
    WHEN assessment_evidence > 0 THEN 0.5
    ELSE 0.3
  END;
  
  RETURN quality_score;
END;
$$ LANGUAGE plpgsql;

-- Function: Get evidence summary for a session
CREATE OR REPLACE FUNCTION public.get_evidence_summary(session_id UUID)
RETURNS TABLE(
  total_evidence INT,
  chat_count INT,
  game_count INT,
  assessment_count INT,
  constraint_count INT,
  role_test_count INT,
  unresolved_contradictions INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_evidence,
    (SELECT COUNT(*) FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'chat')::INT,
    (SELECT COUNT(*) FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'game')::INT,
    (SELECT COUNT(*) FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'assessment')::INT,
    (SELECT COUNT(*) FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'constraint')::INT,
    (SELECT COUNT(*) FROM evidence_log WHERE counseling_sessions.id = session_id AND source = 'roleDepthTest')::INT,
    (SELECT COUNT(*) FROM contradictions WHERE counseling_sessions.id = session_id AND is_resolved = FALSE)::INT
  FROM evidence_log
  WHERE counseling_sessions.id = session_id;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- Triggers for updated_at timestamps
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_evidence_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evidence_log_timestamp_trigger
BEFORE UPDATE ON public.evidence_log
FOR EACH ROW
EXECUTE FUNCTION public.update_evidence_log_timestamp();

CREATE OR REPLACE FUNCTION public.update_contradictions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contradictions_timestamp_trigger
BEFORE UPDATE ON public.contradictions
FOR EACH ROW
EXECUTE FUNCTION public.update_contradictions_timestamp();

CREATE OR REPLACE FUNCTION public.update_constraint_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_constraint_profiles_timestamp_trigger
BEFORE UPDATE ON public.constraint_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_constraint_profiles_timestamp();

CREATE OR REPLACE FUNCTION public.update_counseling_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_counseling_sessions_timestamp_trigger
BEFORE UPDATE ON public.counseling_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_counseling_sessions_timestamp();
