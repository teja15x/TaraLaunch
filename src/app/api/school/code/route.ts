import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get or create school
    let { data: school } = await supabase
      .from('schools')
      .select('id, join_code')
      .eq('admin_user_id', user.id)
      .single();

    if (!school) {
      // Create school for this admin
      const code = generateCode();
      const { data: newSchool, error } = await supabase
        .from('schools')
        .insert({
          admin_user_id: user.id,
          join_code: code,
          name: 'My School',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
      school = newSchool;
    }

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Generate new code if needed
    if (!school.join_code) {
      const code = generateCode();
      await supabase
        .from('schools')
        .update({ join_code: code })
        .eq('id', school.id);
      return NextResponse.json({ code });
    }

    return NextResponse.json({ code: school.join_code });
  } catch (err) {
    console.error('Code generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
