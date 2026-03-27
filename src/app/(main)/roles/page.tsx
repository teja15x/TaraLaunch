'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CAREER_ROLE_OPTIONS } from '@/data/careerRoles';
import { Button } from '@/components/ui/Button';

export default function RolesPage() {
  const [customRole, setCustomRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const goToAgent = (role: string) => {
    const trimmed = role.trim();
    const next = trimmed ? `/chat?role=${encodeURIComponent(trimmed)}` : '/chat';
    router.push(next);
  };

  const filteredRoles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return CAREER_ROLE_OPTIONS;

    return CAREER_ROLE_OPTIONS.filter((role) => {
      return role.title.toLowerCase().includes(normalizedQuery) || role.pathHint.toLowerCase().includes(normalizedQuery);
    });
  }, [searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Choose a Role to Start</h1>
        <p className="text-white/70 mt-2">
          Pick a dream role and the Career Deciding Agent will guide the student from confusion to a realistic path. Search across many roles, or type your own if it is not listed yet.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
        <label className="block text-xs text-white/60">
          Search roles
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, ui ux, finance, psychology, defense, design..."
            className="mt-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </label>
        <p className="mt-3 text-xs text-white/45">Showing {filteredRoles.length} roles. If you still do not find the exact one, use the custom role box below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {filteredRoles.map((role) => (
          <button
            key={role.title}
            onClick={() => goToAgent(role.title)}
            className="text-left p-5 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition"
          >
            <h2 className="text-white font-semibold text-lg">{role.title}</h2>
            <p className="text-white/65 text-sm mt-2">{role.pathHint}</p>
          </button>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="mb-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm text-white/65">
          No close match found in the preset list. Use the custom role box below and the agent will still consider it seriously.
        </div>
      )}

      <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.04]">
        <h2 className="text-white font-semibold">Or enter a custom role</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="For example: AI Researcher, Pilot, Fashion Entrepreneur"
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={() => goToAgent(customRole)} disabled={!customRole.trim()}>
            Start With This Role
          </Button>
        </div>
      </div>
    </div>
  );
}
