'use client';

import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/helpers';
import { useMemo, useState } from 'react';
import { gameDefinitions, type GameDefinition } from '@/data/games';

const FILTERS = ['All', 'Core', 'Advanced', 'Logic', 'Creativity', 'Leadership'] as const;
type FilterOption = (typeof FILTERS)[number];

function gameMatchesFilter(game: GameDefinition, filter: FilterOption): boolean {
  if (filter === 'All') return true;
  if (filter === 'Core') return game.phase === 1;
  if (filter === 'Advanced') return game.phase === 3;
  if (filter === 'Logic') {
    return game.trait_targets.includes('analytical') || game.trait_targets.includes('technical') || game.trait_targets.includes('detail_oriented');
  }
  if (filter === 'Creativity') {
    return game.trait_targets.includes('creative') || game.gardner_targets.includes('linguistic') || game.gardner_targets.includes('spatial');
  }
  if (filter === 'Leadership') {
    return game.trait_targets.includes('leadership') || game.trait_targets.includes('communication') || game.riasec_targets.includes('enterprising');
  }
  return true;
}

export default function GamesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const visibleGames = useMemo(
    () => gameDefinitions.filter((game) => gameMatchesFilter(game, activeFilter)),
    [activeFilter]
  );
  const phase1Games = visibleGames.filter((g) => g.phase === 1);
  const phase3Games = visibleGames.filter((g) => g.phase === 3);

  const colorById: Record<string, string> = {
    'scenario-quest': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'pattern-master': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    'story-weaver': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    'rhythm-match': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    'nature-detective': 'from-green-500/20 to-lime-500/20 border-green-500/30',
    'the-organizer': 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
    'debate-club': 'from-red-500/20 to-orange-500/20 border-red-500/30',
    'team-leader': 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    'creative-canvas': 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
    'decision-maze': 'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
    'budget-tradeoff-lab': 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="surface-panel glow-top animate-rise rounded-[1.7rem] p-6 sm:p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Game Studio</p>
        <h1 className="font-display mt-2 text-4xl text-white">Assessment Games</h1>
        <p className="mt-2 text-white/75">Play targeted experiences to reveal strengths, decision style, and role-fit patterns.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                activeFilter === filter
                  ? 'border-primary-300/50 bg-primary-500/25 text-primary-100'
                  : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-rise stagger-1">
        <h2 className="mb-3 text-lg font-semibold text-white/85">Core Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phase1Games.map((game, index) => (
            <Card
              key={game.id}
              hover
              onClick={() => router.push(`/games/${game.id}`)}
              className={cn(
                'interactive-card bg-gradient-to-br rounded-3xl animate-rise',
                index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : 'stagger-3',
                colorById[game.id] ?? 'from-primary-500/20 to-accent-500/20 border-white/20'
              )}
            >
              <div className="mb-3 text-4xl">{game.emoji}</div>
              <h3 className="mb-2 font-display text-2xl text-white">{game.title}</h3>
              <p className="text-sm leading-relaxed text-white/78">{game.description}</p>
              <p className="mt-2 text-xs text-white/45">{game.duration} • {game.difficulty}</p>
              <p className="mt-2 text-xs text-white/55">{game.insight}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="animate-rise stagger-2">
        <h2 className="mb-3 text-lg font-semibold text-white/85">Advanced Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phase3Games.map((game, index) => (
            <Card
              key={game.id}
              hover
              onClick={() => router.push(`/games/${game.id}`)}
              className={cn(
                'interactive-card bg-gradient-to-br rounded-3xl animate-rise',
                index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3',
                colorById[game.id] ?? 'from-primary-500/20 to-accent-500/20 border-white/20'
              )}
            >
              <div className="mb-3 text-4xl">{game.emoji}</div>
              <h3 className="mb-2 font-display text-2xl text-white">{game.title}</h3>
              <p className="text-sm leading-relaxed text-white/78">{game.description}</p>
              <p className="mt-2 text-xs text-white/45">{game.duration} • {game.difficulty}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
