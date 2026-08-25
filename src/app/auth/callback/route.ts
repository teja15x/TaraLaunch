import { createServerSupabaseClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!hasSupabaseServerConfig()) {
    return NextResponse.redirect(`${origin}/roles`);
  }

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const schoolJoinCode = (data.user?.user_metadata?.school_join_code as string | undefined)?.trim().toUpperCase();
      if (schoolJoinCode) {
        const adminClient = createSupabaseAdminClient();
        if (adminClient) {
          const { data: school } = await adminClient
            .from('schools')
            .select('id')
            .eq('join_code', schoolJoinCode)
            .single();

          if (school?.id) {
            await adminClient
              .from('school_enrollments')
              .upsert(
                {
                  school_id: school.id,
                  user_id: data.session.user.id,
                  status: 'active',
                },
                { onConflict: 'school_id,user_id' }
              );
          }
        }
      }

      // Successfully confirmed and logged in
      return NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }
  
  // No code or invalid code
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Invalid or expired confirmation link')}`);
}
