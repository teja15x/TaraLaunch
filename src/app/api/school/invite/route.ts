import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function parseEmailsFromCsvContent(csvContent: string): string[] {
  const lines = csvContent.split(/\r?\n/);
  const parsed: string[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));
    for (const value of columns) {
      if (value.includes('@')) parsed.push(value);
    }
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const rawEmails = Array.isArray(body?.emails) ? body.emails : [];
    const csvEmails = typeof body?.csvContent === 'string' ? parseEmailsFromCsvContent(body.csvContent) : [];
    const emails = [...rawEmails, ...csvEmails]
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean);

    if (emails.length === 0) {
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

    const uniqueEmails = Array.from(new Set(emails)).slice(0, 100);

    for (const email of uniqueEmails) {
      try {
        // Create invitation record
        const { error } = await supabase
          .from('school_invitations')
          .insert({
            school_id: school.id,
            email,
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
