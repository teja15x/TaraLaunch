'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import type { TraitScores } from '@/types';

type TradeoffOption = {
  id: string;
  label: string;
  traits: Partial<TraitScores>;
};

type TradeoffRound = {
  id: string;
  title: string;
  context: string;
  options: TradeoffOption[];
};

const rounds: TradeoffRound[] = [
  {
    id: 'btl-1',
    title: 'Class 12 Resource Allocation',
    context:
      'You have 10 weekly hours and limited budget. Pick exactly 2 priorities that you will commit to for the next 4 weeks.',
    options: [
      {
        id: 'coaching',
        label: 'Targeted coaching for weak topics',
        traits: { analytical: 20, detail_oriented: 15 },
      },
      {
        id: 'self-practice',
        label: 'Self-practice with mock tests and error log',
        traits: { analytical: 15, technical: 10, detail_oriented: 20 },
      },
      {
        id: 'mentorship',
        label: 'Weekly mentor call for strategy and consistency',
        traits: { communication: 15, adaptability: 15, leadership: 10 },
      },
      {
        id: 'rest-routine',
        label: 'Sleep and recovery routine to avoid burnout',
        traits: { adaptability: 20, empathy: 15 },
      },
    ],
  },
  {
    id: 'btl-2',
    title: 'College Decision Tradeoff',
    context:
      'You must choose 2 strongest decision anchors while selecting between a higher-fee metro college and a lower-fee local option.',
    options: [
      {
        id: 'fees',
        label: 'Total cost and family financial safety',
        traits: { analytical: 20, empathy: 15 },
      },
      {
        id: 'placements',
        label: 'Internship and placement ecosystem quality',
        traits: { analytical: 20, leadership: 10 },
      },
      {
        id: 'fit',
        label: 'Branch-role fit and long-term motivation',
        traits: { adaptability: 15, creative: 15, empathy: 10 },
      },
      {
        id: 'city-network',
        label: 'City exposure and alumni network access',
        traits: { communication: 20, leadership: 10, adaptability: 10 },
      },
    ],
  },
  {
    id: 'btl-3',
    title: 'Skill Stack vs Certificate Stack',
    context:
      'You can only focus deeply on 2 tracks this semester. Choose what you will optimize for.',
    options: [
      {
        id: 'projects',
        label: 'Portfolio projects with real proof of work',
        traits: { technical: 20, creative: 15, leadership: 10 },
      },
      {
        id: 'certs',
        label: 'Certification-heavy profile build',
        traits: { detail_oriented: 20, analytical: 15 },
      },
      {
        id: 'internships',
        label: 'Internship applications and interview preparation',
        traits: { communication: 20, adaptability: 15, leadership: 10 },
      },
      {
        id: 'fundamentals',
        label: 'Core fundamentals revision (math/stats/cs/accounting)',
        traits: { analytical: 20, technical: 15, detail_oriented: 10 },
      },
    ],
  },
  {
    id: 'btl-4',
    title: 'Family Pressure vs Career Clarity',
    context:
      'A relative pushes you toward a prestige path. Pick 2 response actions you will actually take this week.',
    options: [
      {
        id: 'conversation',
        label: 'Structured family conversation with roadmap evidence',
        traits: { communication: 20, leadership: 15, empathy: 10 },
      },
      {
        id: 'mentor-proof',
        label: 'Bring mentor/teacher feedback into the discussion',
        traits: { communication: 15, analytical: 15, adaptability: 10 },
      },
      {
        id: 'pilot-month',
        label: 'Run a 30-day pilot on your preferred path and measure outcomes',
        traits: { analytical: 20, leadership: 10, adaptability: 15 },
      },
      {
        id: 'avoidance',
        label: 'Avoid conflict and postpone decision',
        traits: { empathy: 5 },
      },
    ],
  },
  {
    id: 'btl-5',
    title: 'First Job Strategy',
    context:
      'You can invest effort in only 2 channels for the next 6 weeks. What gets priority?',
    options: [
      {
        id: 'campus',
        label: 'Campus placement preparation sprint',
        traits: { detail_oriented: 15, analytical: 15, communication: 10 },
      },
      {
        id: 'off-campus',
        label: 'Off-campus applications + referral outreach',
        traits: { communication: 20, leadership: 15, adaptability: 10 },
      },
      {
        id: 'freelance-proof',
        label: 'Freelance/contract proof to build credibility',
        traits: { creative: 15, technical: 15, adaptability: 15 },
      },
      {
        id: 'exam-fallback',
        label: 'Government/competitive exam fallback plan',
        traits: { detail_oriented: 20, analytical: 15 },
      },
    ],
  },
];

export default function BudgetTradeoffLab() {
  const [currentRound, setCurrentRound] = useState(0);
  const [pickedByRound, setPickedByRound] = useState<Record<string, string[]>>({});
  const [complete, setComplete] = useState(false);
  const [resultTraits, setResultTraits] = useState<TraitScores | null>(null);
  const router = useRouter();
  const { traitScores, setTraitScores } = useAppStore();

  const round = rounds[currentRound];
  const selected = pickedByRound[round.id] ?? [];

  const toggleOption = (optionId: string) => {
    const current = pickedByRound[round.id] ?? [];
    const exists = current.includes(optionId);

    let next: string[];
    if (exists) {
      next = current.filter((id) => id !== optionId);
    } else if (current.length < 2) {
      next = [...current, optionId];
    } else {
      next = [current[1], optionId];
    }

    setPickedByRound((prev) => ({ ...prev, [round.id]: next }));
  };

  const finalize = () => {
    const totals: Record<keyof TraitScores, number> = {
      analytical: 0,
      creative: 0,
      leadership: 0,
      empathy: 0,
      technical: 0,
      communication: 0,
      adaptability: 0,
      detail_oriented: 0,
    };

    rounds.forEach((r) => {
      const chosen = pickedByRound[r.id] ?? [];
      chosen.forEach((chosenId) => {
        const option = r.options.find((o) => o.id === chosenId);
        if (!option) return;
        (Object.keys(option.traits) as (keyof TraitScores)[]).forEach((key) => {
          totals[key] += option.traits[key] ?? 0;
        });
      });
    });

    const maxPossible = rounds.length * 40;
    const calculated: TraitScores = {
      analytical: Math.min(100, Math.round((totals.analytical / maxPossible) * 100)),
      creative: Math.min(100, Math.round((totals.creative / maxPossible) * 100)),
      leadership: Math.min(100, Math.round((totals.leadership / maxPossible) * 100)),
      empathy: Math.min(100, Math.round((totals.empathy / maxPossible) * 100)),
      technical: Math.min(100, Math.round((totals.technical / maxPossible) * 100)),
      communication: Math.min(100, Math.round((totals.communication / maxPossible) * 100)),
      adaptability: Math.min(100, Math.round((totals.adaptability / maxPossible) * 100)),
      detail_oriented: Math.min(100, Math.round((totals.detail_oriented / maxPossible) * 100)),
    };

    const merged = traitScores
      ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
          acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
          return acc;
        }, { ...traitScores })
      : calculated;

    setTraitScores(merged);
    setResultTraits(merged);
    setComplete(true);
  };

  const onNext = () => {
    if (selected.length !== 2) return;

    if (currentRound + 1 >= rounds.length) {
      finalize();
      return;
    }

    setCurrentRound((prev) => prev + 1);
  };

  if (complete && resultTraits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-3">💸</div>
          <h2 className="text-2xl font-bold text-white mb-2">Budget & Tradeoff Lab Complete</h2>
          <p className="text-white/75 mb-4">
            Your choices show how you balance pressure, opportunity, and long-term growth in real Indian student scenarios.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {(Object.keys(resultTraits) as (keyof TraitScores)[]).map((key) => (
              <ProgressBar
                key={key}
                label={key.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
                value={resultTraits[key]}
                color={resultTraits[key] >= 60 ? 'bg-amber-500' : 'bg-white/30'}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/results')}>View Results</Button>
            <Button variant="secondary" onClick={() => router.push('/games')}>Back to Games</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">💸 Budget & Tradeoff Lab</h1>
        <p className="text-white/75 text-sm">Non-MCQ strategy game built for Indian student decisions.</p>
      </div>

      <ProgressBar
        value={currentRound + 1}
        max={rounds.length}
        label={`Round ${currentRound + 1} of ${rounds.length}`}
      />

      <Card>
        <p className="text-xs uppercase tracking-[0.14em] text-white/45">{round.title}</p>
        <p className="mt-3 text-white/85 leading-relaxed">{round.context}</p>
        <p className="mt-2 text-xs text-white/50">Pick exactly 2 priorities.</p>

        <div className="mt-5 space-y-3">
          {round.options.map((option) => {
            const active = selected.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active
                    ? 'border-amber-400/50 bg-amber-500/20 text-white'
                    : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-white/55">Selected: {selected.length}/2</p>
          <Button onClick={onNext} disabled={selected.length !== 2}>
            {currentRound + 1 >= rounds.length ? 'Finish' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
