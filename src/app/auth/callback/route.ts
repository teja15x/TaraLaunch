import { createServerSupabaseClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
      // Successfully confirmed and logged in
      return NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }
  
  // No code or invalid code
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Invalid or expired confirmation link')}`);
}
