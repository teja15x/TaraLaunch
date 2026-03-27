import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { emails } = await req.json();
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
    }

    // Get admin's school
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('admin_user_id', user.id)
      .single();

    if (!school) {
      return NextResponse.json({ error: 'No school found for this admin' }, { status: 403 });
    }

    let invited = 0;
    let failed = 0;

    for (const email of emails.slice(0, 100)) { // Max 100 at a time
      try {
        // Create invitation record
        const { error } = await supabase
          .from('school_invitations')
          .insert({
            school_id: school.id,
            email: email.trim().toLowerCase(),
            invited_by: user.id,
            status: 'pending',
          });

        if (!error) invited++;
        else failed++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ invited, failed });
  } catch (err) {
    console.error('Invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
