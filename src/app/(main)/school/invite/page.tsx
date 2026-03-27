'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function InviteStudents() {
  const [emails, setEmails] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const router = useRouter();

  const handleBulkInvite = async () => {
    const emailList = emails
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    if (emailList.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/school/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });
      const data = await res.json();
      setResult({ success: data.invited || 0, failed: data.failed || 0 });
    } catch {
      setResult({ success: 0, failed: emailList.length });
    } finally {
      setLoading(false);
    }
  };

  const generateSchoolCode = async () => {
    try {
      const res = await fetch('/api/school/code', { method: 'POST' });
      const data = await res.json();
      setSchoolCode(data.code || 'ERROR');
    } catch {
      setSchoolCode('ERROR');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">📩 Invite Students</h1>
        <p className="text-primary-200 text-sm">Add students to your school&apos;s Career Agent program</p>
      </div>

      {/* Method 1: Bulk Email */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-3">Method 1: Bulk Email Invite</h2>
        <p className="text-white/50 text-sm mb-4">
          Paste student email addresses below (one per line, or comma-separated).
        </p>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={6}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-white/30 mb-3"
          placeholder="student1@school.edu&#10;student2@school.edu&#10;student3@school.edu"
        />
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-xs">
            {emails.split(/[\n,;]+/).filter(e => e.trim().includes('@')).length} valid emails detected
          </p>
          <Button onClick={handleBulkInvite} loading={loading}>
            Send Invites
          </Button>
        </div>
        {result && (
          <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-emerald-300 text-sm">{result.success} invites sent successfully</p>
            {result.failed > 0 && <p className="text-red-300 text-sm">{result.failed} failed</p>}
          </div>
        )}
      </Card>

      {/* Method 2: School Code */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-3">Method 2: School Join Code</h2>
        <p className="text-white/50 text-sm mb-4">
          Generate a code that students can enter during signup to auto-join your school.
        </p>
        {schoolCode ? (
          <div className="text-center py-4">
            <div className="text-4xl font-mono font-bold text-primary-400 tracking-widest mb-2">{schoolCode}</div>
            <p className="text-white/50 text-sm">Share this code with your students</p>
            <Button variant="secondary" className="mt-3" onClick={() => navigator.clipboard.writeText(schoolCode)}>
              Copy Code
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={generateSchoolCode}>Generate Join Code</Button>
        )}
      </Card>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => router.push('/school')}>← Back to School Dashboard</Button>
      </div>
    </div>
  );
}
