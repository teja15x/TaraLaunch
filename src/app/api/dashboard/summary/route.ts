import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardSummaryResponse } from '@/lib/domain/contracts';

const DEFAULT_SUMMARY: DashboardSummaryResponse = {
  greetingName: 'Future Leader',
  currentStreak: 0,
  xpPoints: 0,
  clarityScore: 0,
};

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [{ data: profile }, { data: streak }, { data: assessment }, { data: missionPerformance }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
      supabase.from('assessment_profiles').select('assessment_progress').eq('user_id', user.id).single(),
      supabase.from('mission_performance').select('score').eq('user_id', user.id),
    ]);

    const xpPoints = (missionPerformance || []).reduce((sum, row) => sum + Math.max(0, row.score || 0), 0);
    const summary: DashboardSummaryResponse = {
      greetingName: profile?.full_name?.split(' ')[0] || DEFAULT_SUMMARY.greetingName,
      currentStreak: Math.max(0, streak?.current_streak || 0),
      xpPoints,
      clarityScore: Math.max(0, Math.min(100, assessment?.assessment_progress || 0)),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(DEFAULT_SUMMARY);
  }
}
