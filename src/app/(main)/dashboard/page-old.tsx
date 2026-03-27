'use client';

import { Card } from '@/components/ui/Card';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { AdaptiveMissionBoard } from '@/components/dashboard/AdaptiveMissionBoard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAgeTier, type AgeTier } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import { getCoreGames, getAdvancedGames } from '@/data/games';

const TIER_LABELS: Record<AgeTier, string> = {
  explorer: 'Explorer',
  discoverer: 'Discoverer',
  navigator: 'Navigator',
  pivoter: 'Pivoter',
};

const SECTION_STATUS = [
  { label: 'Dashboard', href: '/dashboard', status: 'Live' },
  { label: 'Roles', href: '/roles', status: 'Growing' },
  { label: 'Games Lab', href: '/games', status: 'Live' },
  { label: 'Results', href: '/results', status: 'Live' },
  { label: 'Guidance', href: '/guidance', status: 'Live' },
  { label: 'Parent Zone', href: '/parent', status: 'Growing' },
  { label: 'School Hub', href: '/school', status: 'Growing' },
  { label: 'Plans', href: '/pricing', status: 'Live' },
] as const;

const LIVE_UPDATES = [
  'Counseling and cutoffs can shift across rounds. Recheck official state and college notices before locking options.',
  'High-demand clusters this month in India: AI-enabled services, healthcare operations, EV support, and digital commerce roles.',
  'Students who finish 3 core games and one action plan usually reduce decision confusion within the first 2 guidance sessions.',
];

const CONTINUE_JOURNEY_LINKS = [
  { label: 'Chat', href: '/chat' },
  { label: 'Games', href: '/games' },
  { label: 'Results', href: '/results' },
  { label: 'Guidance', href: '/guidance' },
] as const;

const EXPLORE_MORE_LINKS = [
  { label: 'Parent Zone', href: '/parent' },
  { label: 'School Hub', href: '/school' },
  { label: 'Plans', href: '/pricing' },
  { label: 'Roles', href: '/roles' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const ageTier = profile?.date_of_birth ? getAgeTier(profile.date_of_birth) : null;
  const coreGames = getCoreGames();
  const advancedGames = getAdvancedGames();
  const totalGames = coreGames.length + advancedGames.length;
  const completedCoreGames = 0;
  const completedAdvancedGames = 0;
  const coreCompletionPct = Math.round((completedCoreGames / Math.max(coreGames.length, 1)) * 100);

  const readinessState = coreCompletionPct >= 80 ? 'Ready' : coreCompletionPct >= 40 ? 'Improving' : 'Early';
  const readinessBlockers =
    coreCompletionPct >= 80
      ? ['Finalize top role shortlist and compare fee, fit, and internship reality.']
      : [
          'Complete all 3 core game starters.',
          'Review result patterns before locking stream, degree, or entrance route.',
          'Lock one weekly action plan with deadlines (mock test, portfolio, or application).',
        ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {profile?.full_name ?? 'there'}!
        </h1>
        <p className="text-primary-100">
          Your decision cockpit: track clarity, build skills, and move from confusion to action.
        </p>
        {ageTier && (
          <span className={cn(
            "inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold",
            "bg-accent-600/30 text-accent-300 border border-accent-500/30"
          )}>
            {TIER_LABELS[ageTier]}
          </span>
        )}
      </div>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Today</p>
        <Card className="bg-gradient-to-br from-primary-600/20 to-accent-600/20 border-primary-500/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Finish Core Assessment Loop</h2>
              <p className="mt-2 text-sm text-white/70 max-w-2xl">
                Complete the 3 core games, review your first result pattern, and lock one India-focused weekly action in Guidance.
              </p>
            </div>
            <button
              onClick={() => router.push('/games/scenario-quest')}
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Continue Journey
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Core loop progress</span>
              <span>{completedCoreGames} of {coreGames.length} completed</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-400 transition-all"
                style={{ width: `${coreCompletionPct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {coreGames.slice(0, 3).map((game, index) => (
              <button
                key={game.id}
                onClick={() => router.push(`/games/${game.id}`)}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/10"
              >
                {index + 1}. {game.title}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Your Momentum</p>
        <StreakWidget />
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Next Mission</p>
        <AdaptiveMissionBoard
          performance={{
            reliabilityScore: coreCompletionPct, // Use core completion as proxy for reliability
            completedGames: completedCoreGames + completedAdvancedGames,
            lastGameScore: 75,
            successRate: 70,
          }}
        />
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Your Progress</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
            <h3 className="text-lg font-semibold text-white">My Progress</h3>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <div className="flex justify-between"><span>Core games</span><span>{completedCoreGames} / {coreGames.length}</span></div>
              <div className="flex justify-between"><span>Advanced games</span><span>{completedAdvancedGames} / {advancedGames.length}</span></div>
              <div className="flex justify-between"><span>Total game map</span><span>{totalGames}</span></div>
              <div className="flex justify-between"><span>Current tier</span><span>{ageTier ? TIER_LABELS[ageTier] : 'Not set'}</span></div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
            <h3 className="text-lg font-semibold text-white">Decision Readiness</h3>
            <div className="mt-3 flex items-center justify-between text-sm text-white/80">
              <span>Status</span>
              <span className="font-semibold text-white">{readinessState}</span>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-white/50">Current blockers</p>
              <ul className="mt-2 space-y-2 text-sm text-white/75">
                {readinessBlockers.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => router.push('/results')}
              className="mt-4 w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open Results Studio
            </button>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">What Changed</p>
          <button
            onClick={() => router.push('/guidance')}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10"
          >
            View All Updates
          </button>
        </div>
        <Card className="bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-400/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LIVE_UPDATES.slice(0, 2).map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Explore Platform</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-white/10">
            <h2 className="text-lg font-semibold text-white mb-3">Continue Journey</h2>
            <div className="grid grid-cols-2 gap-3">
              {CONTINUE_JOURNEY_LINKS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-white/10">
            <h2 className="text-lg font-semibold text-white mb-3">Explore More</h2>
            <div className="grid grid-cols-2 gap-3">
              {EXPLORE_MORE_LINKS.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-white/55">
                    {SECTION_STATUS.find((section) => section.href === item.href)?.status ?? 'Live'}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
