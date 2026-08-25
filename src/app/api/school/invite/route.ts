import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SchoolInviteRequest, SchoolInviteResponse, SchoolInviteFailure } from '@/lib/domain/contracts';

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

    const body = (await req.json()) as SchoolInviteRequest;
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
    const failures: SchoolInviteFailure[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmails = Array.from(new Set(emails)).slice(0, 500);

    const { data: existingInvites } = await supabase
      .from('school_invitations')
      .select('email')
      .eq('school_id', school.id)
      .in('email', uniqueEmails);

    const existingInviteSet = new Set((existingInvites || []).map((entry) => entry.email.toLowerCase()));

    const { data: enrollments } = await supabase
      .from('school_enrollments')
      .select('user_id')
      .eq('school_id', school.id);

    const enrolledUserIds = (enrollments || []).map((entry) => entry.user_id);
    let enrolledEmailSet = new Set<string>();
    if (enrolledUserIds.length > 0) {
      const { data: enrolledProfiles } = await supabase
        .from('profiles')
        .select('email')
        .in('id', enrolledUserIds)
        .in('email', uniqueEmails);
      enrolledEmailSet = new Set((enrolledProfiles || []).map((entry) => entry.email.toLowerCase()));
    }

    for (const email of uniqueEmails) {
      if (!emailRegex.test(email)) {
        failed++;
        failures.push({ email, reason: 'invalid_email' });
        continue;
      }

      if (existingInviteSet.has(email)) {
        failed++;
        failures.push({ email, reason: 'already_invited' });
        continue;
      }

      if (enrolledEmailSet.has(email)) {
        failed++;
        failures.push({ email, reason: 'already_enrolled' });
        continue;
      }

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
        else {
          failed++;
          failures.push({ email, reason: 'insert_failed' });
        }
      } catch {
        failed++;
        failures.push({ email, reason: 'insert_failed' });
      }
    }

    const response: SchoolInviteResponse = { invited, failed, failures };
    return NextResponse.json(response);
  } catch (err) {
    console.error('Invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
