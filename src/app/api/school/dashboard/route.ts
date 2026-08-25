import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type StudentSummary = {
  id: string;
  full_name: string;
  email: string;
  assessment_progress: number;
  completed_games: string[];
  top_holland_code: string;
  top_career: string;
  top_career_score: number;
};

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch school's students (where school_id matches)
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!school) {
      return NextResponse.json({ students: [], stats: null });
    }

    // Get all students in this school
    const { data: enrollments } = await supabase
      .from('school_enrollments')
      .select('user_id')
      .eq('school_id', school.id);

    const studentIds = (enrollments || []).map(e => e.user_id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        students: [],
        stats: {
          total_students: 0,
          assessed_students: 0,
          avg_progress: 0,
          avg_clarity: 0,
          games_played: 0,
          high_risk_count: 0,
          high_risk_students: [],
          top_paths: [],
          top_career_categories: [],
          riasec_distribution: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
        },
      });
    }

    // Fetch profiles and assessment data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    const { data: assessments } = await supabase
      .from('assessment_profiles')
      .select('user_id, riasec, gardner, completed_games, assessment_progress')
      .in('user_id', studentIds);

    const { data: careerRecs } = await supabase
      .from('career_recommendations')
      .select('user_id, career_title, career_category, match_score')
      .in('user_id', studentIds);

    const { data: gameResults } = await supabase
      .from('game_results')
      .select('user_id')
      .in('user_id', studentIds);

    // Build student summaries
    const students: StudentSummary[] = (profiles || []).map(p => {
      const assessment = (assessments || []).find(a => a.user_id === p.id);
      const topCareer = (careerRecs || [])
        .filter(c => c.user_id === p.id)
        .sort((a, b) => b.match_score - a.match_score)[0];

      const riasec = assessment?.riasec as Record<string, number> | null;
      let hollandCode = '—';
      if (riasec) {
        hollandCode = Object.entries(riasec)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([k]) => k.charAt(0).toUpperCase())
          .join('');
      }

      return {
        id: p.id,
        full_name: p.full_name || 'Unknown',
        email: p.email || '',
        assessment_progress: assessment?.assessment_progress || 0,
        completed_games: assessment?.completed_games || [],
        top_holland_code: hollandCode,
        top_career: topCareer?.career_title || '',
        top_career_score: topCareer?.match_score || 0,
      };
    });

    // Compute stats
    const totalProgress = students.reduce((sum, s) => sum + s.assessment_progress, 0);
    const assessedStudents = students.filter((s) => s.assessment_progress > 0).length;
    const avgProgress = students.length > 0 ? Math.round(totalProgress / students.length) : 0;

    // RIASEC distribution — count dominant type per student
    const riasecDist: Record<string, number> = { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 };
    (assessments || []).forEach(a => {
      const r = a.riasec as Record<string, number> | null;
      if (r) {
        const top = Object.entries(r).sort(([, x], [, y]) => y - x)[0]?.[0];
        if (top && top in riasecDist) riasecDist[top]++;
      }
    });

    // Career category counts
    const catCounts: Record<string, number> = {};
    (careerRecs || []).forEach(c => {
      if (c.career_category) catCounts[c.career_category] = (catCounts[c.career_category] || 0) + 1;
    });
    const topCategories = Object.entries(catCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));

    const topPaths = topCategories.slice(0, 4).map((entry) => ({
      label: entry.category,
      percentage: Math.max(1, Math.round((entry.count / Math.max(1, students.length)) * 100)),
    }));

    const highRiskStudents = students
      .filter((student) => student.assessment_progress < 40)
      .slice(0, 8)
      .map((student) => ({
        id: student.id,
        name: student.full_name,
        stream: student.top_holland_code === '—' ? 'Unknown' : student.top_holland_code,
        issue:
          student.assessment_progress === 0
            ? 'No evidence collected yet'
            : `Low evidence progress (${student.assessment_progress}%)`,
        lastActive: 'Recent activity unavailable',
        severity: student.assessment_progress < 20 ? 'critical' : student.assessment_progress < 30 ? 'high' : 'medium',
      }));

    return NextResponse.json({
      students,
      stats: {
        total_students: students.length,
        assessed_students: assessedStudents,
        avg_progress: avgProgress,
        avg_clarity: avgProgress,
        games_played: (gameResults || []).length,
        high_risk_count: highRiskStudents.length,
        high_risk_students: highRiskStudents,
        top_paths: topPaths,
        top_career_categories: topCategories,
        riasec_distribution: riasecDist,
      },
    });
  } catch (err) {
    console.error('School dashboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
