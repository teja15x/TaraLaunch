-- Career Agent Phase 1 - Roadmap Schema (Complete)
-- Run this in Supabase SQL Editor: Project > SQL Editor > New Query
-- If you have existing tables with the same names, drop them first or run on a fresh project.

-- =============================================================================
-- 1. PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_email TEXT,
  parent_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. ASSESSMENT PROFILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  riasec JSONB DEFAULT '{"realistic":0,"investigative":0,"artistic":0,"social":0,"enterprising":0,"conventional":0}'::jsonb,
  gardner JSONB DEFAULT '{"linguistic":0,"logical_mathematical":0,"spatial":0,"musical":0,"bodily_kinesthetic":0,"interpersonal":0,"intrapersonal":0,"naturalistic":0}'::jsonb,
  big_five JSONB DEFAULT '{"openness":0,"conscientiousness":0,"extraversion":0,"agreeableness":0,"neuroticism":0}'::jsonb,
  completed_games TEXT[] DEFAULT '{}',
  assessment_progress INTEGER DEFAULT 0 CHECK (assessment_progress >= 0 AND assessment_progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.assessment_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own assessment" ON public.assessment_profiles;
DROP POLICY IF EXISTS "Users can update own assessment" ON public.assessment_profiles;
DROP POLICY IF EXISTS "Users can insert own assessment" ON public.assessment_profiles;

CREATE POLICY "Users can view own assessment" ON public.assessment_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own assessment" ON public.assessment_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessment" ON public.assessment_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_profiles_user_id ON public.assessment_profiles(user_id);

-- =============================================================================
-- 3. CHAT MESSAGES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- =============================================================================
-- 4. GAME RESULTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  assessment_scores JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own results" ON public.game_results;
DROP POLICY IF EXISTS "Users can insert own results" ON public.game_results;

CREATE POLICY "Users can view own results" ON public.game_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON public.game_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON public.game_results(user_id);

-- =============================================================================
-- 5. CAREER RECOMMENDATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.career_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  career_description TEXT,
  career_category TEXT,
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[] DEFAULT '{}',
  education_path TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recs" ON public.career_recommendations;
DROP POLICY IF EXISTS "Users can insert own recs" ON public.career_recommendations;

CREATE POLICY "Users can view own recs" ON public.career_recommendations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recs" ON public.career_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_career_recommendations_user_id ON public.career_recommendations(user_id);

-- =============================================================================
-- 6. AUTO-UPDATE updated_at TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_ts ON public.profiles;
CREATE TRIGGER update_profiles_ts
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessment_ts ON public.assessment_profiles;
CREATE TRIGGER update_assessment_ts
  BEFORE UPDATE ON public.assessment_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- =============================================================================
-- 7. CREATE PROFILE + ASSESSMENT_PROFILE ON SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, date_of_birth, parent_email, parent_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '2000-01-01'::date),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'parent_email'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'parent_name'), '')
  );
  INSERT INTO public.assessment_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile or assessment already exists (e.g. retry), ignore
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
