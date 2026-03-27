-- ============================================
-- Phase 3: School B2B Module
-- ============================================

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My School',
  join_code TEXT UNIQUE,
  logo_url TEXT,
  city TEXT,
  state TEXT,
  board TEXT, -- CBSE, ICSE, State Board, IB, etc.
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School enrollments (student ↔ school mapping)
CREATE TABLE IF NOT EXISTS school_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  UNIQUE(school_id, user_id)
);

-- School invitations
CREATE TABLE IF NOT EXISTS school_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schools_admin ON schools(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_school ON school_enrollments(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON school_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON school_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_school ON school_invitations(school_id);

-- RLS Policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_invitations ENABLE ROW LEVEL SECURITY;

-- Schools: admin can manage their own school
CREATE POLICY "School admins can view own school" ON schools
  FOR SELECT USING (admin_user_id = auth.uid());
CREATE POLICY "School admins can update own school" ON schools
  FOR UPDATE USING (admin_user_id = auth.uid());
CREATE POLICY "Users can create schools" ON schools
  FOR INSERT WITH CHECK (admin_user_id = auth.uid());

-- Enrollments: school admin can view, students can view own
CREATE POLICY "School admins can view enrollments" ON school_enrollments
  FOR SELECT USING (school_id IN (SELECT id FROM schools WHERE admin_user_id = auth.uid()));
CREATE POLICY "Students can view own enrollment" ON school_enrollments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "School admins can manage enrollments" ON school_enrollments
  FOR ALL USING (school_id IN (SELECT id FROM schools WHERE admin_user_id = auth.uid()));

-- Invitations: school admin can manage
CREATE POLICY "School admins can manage invitations" ON school_invitations
  FOR ALL USING (school_id IN (SELECT id FROM schools WHERE admin_user_id = auth.uid()));

-- Updated_at trigger for schools
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
