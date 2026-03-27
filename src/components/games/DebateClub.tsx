'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface DebateTopic {
  id: string;
  topic: string;
  emoji: string;
  context: string;
  sideA: string;
  sideB: string;
  followUp: string;
}

const topics: DebateTopic[] = [
  {
    id: 'db1',
    topic: 'Should AI replace teachers in classrooms?',
    emoji: '🤖',
    context: 'Schools are experimenting with AI tutors that adapt to each student\'s pace. Some argue this personalizes learning; others say it removes the human connection.',
    sideA: 'Yes — AI can personalize education and reach more students',
    sideB: 'No — Teachers provide mentorship and emotional support AI can\'t',
    followUp: 'What compromise would you propose?',
  },
  {
    id: 'db2',
    topic: 'Should students choose their own curriculum?',
    emoji: '📚',
    context: 'Finland lets students choose many of their subjects. India follows a more structured approach. Both produce successful graduates.',
    sideA: 'Yes — Students learn better when they follow their interests',
    sideB: 'No — A structured curriculum ensures well-rounded education',
    followUp: 'How would you redesign your school curriculum?',
  },
  {
    id: 'db3',
    topic: 'Should social media be banned for under-16s?',
    emoji: '📱',
    context: 'Australia has proposed banning social media for children under 16. Mental health concerns vs. digital literacy and connection.',
    sideA: 'Yes — It harms mental health and focus during critical years',
    sideB: 'No — Banning it removes a tool for learning and community',
    followUp: 'What rules would you put in place instead?',
  },
  {
    id: 'db4',
    topic: 'Is failure more valuable than success for learning?',
    emoji: '💡',
    context: 'Many successful entrepreneurs credit their failures for their growth. But repeated failure can also be discouraging.',
    sideA: 'Yes — Failure teaches resilience and creativity',
    sideB: 'No — Success builds confidence and momentum',
    followUp: 'Describe a time failure (or success) taught you something important.',
  },
  {
    id: 'db5',
    topic: 'Should India prioritize STEM over arts and humanities?',
    emoji: '🇮🇳',
    context: 'India\'s NEP 2020 encourages multidisciplinary education. Yet engineering and medical remain the most sought-after paths.',
    sideA: 'Yes — STEM drives economic growth and innovation',
    sideB: 'No — Arts and humanities build critical thinking and culture',
    followUp: 'How would you design a school that balances both?',
  },
];

type Phase = 'intro' | 'choose_side' | 'argument' | 'followup' | 'feedback' | 'complete';

interface RoundResult {
  sideChosen: 'A' | 'B';
  argumentLength: number;
  followUpLength: number;
  traits: Partial<TraitScores>;
}

export default function DebateClub() {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [chosenSide, setChosenSide] = useState<'A' | 'B' | null>(null);
  const [argument, setArgument] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const topic = topics[currentTopic];

  const handleChooseSide = (side: 'A' | 'B') => {
    setChosenSide(side);
    setPhase('argument');
  };

  const handleSubmitArgument = () => {
    if (argument.trim().length < 10) return;
    setPhase('followup');
  };

  const handleSubmitFollowUp = () => {
    // Score this round
    const argWords = argument.trim().split(/\s+/).length;
    const fuWords = followUpAnswer.trim().split(/\s+/).length;
    const roundTraits: Partial<TraitScores> = {
      communication: Math.min(25, Math.round(argWords * 0.5) + Math.round(fuWords * 0.3)),
      leadership: chosenSide === 'A' ? 15 : 10, // taking a pro stance shows initiative
      empathy: chosenSide === 'B' ? 15 : 10, // opposing side often shows consideration
      analytical: Math.min(20, Math.round((argWords + fuWords) * 0.2)),
      creative: Math.min(20, Math.round(fuWords * 0.4)),
      adaptability: Math.min(15, Math.round(fuWords * 0.3)),
    };

    const newResults = [
      ...results,
      { sideChosen: chosenSide!, argumentLength: argWords, followUpLength: fuWords, traits: roundTraits },
    ];
    setResults(newResults);

    if (currentTopic + 1 >= topics.length) {
      // Calculate final
      const totals: Record<string, number> = {};
      newResults.forEach((r) => {
        Object.entries(r.traits).forEach(([key, val]) => {
          totals[key] = (totals[key] || 0) + (val as number);
        });
      });
      const maxPossible = topics.length * 25;
      const calculated: TraitScores = {
        analytical: Math.min(100, Math.round(((totals.analytical || 0) / maxPossible) * 100)),
        creative: Math.min(100, Math.round(((totals.creative || 0) / maxPossible) * 100)),
        leadership: Math.min(100, Math.round(((totals.leadership || 0) / maxPossible) * 100)),
        empathy: Math.min(100, Math.round(((totals.empathy || 0) / maxPossible) * 100)),
        technical: Math.min(100, Math.round(((totals.technical || 0) / maxPossible) * 20)),
        communication: Math.min(100, Math.round(((totals.communication || 0) / maxPossible) * 100)),
        adaptability: Math.min(100, Math.round(((totals.adaptability || 0) / maxPossible) * 100)),
        detail_oriented: Math.min(100, Math.round(((totals.analytical || 0) / maxPossible) * 50)),
      };
      const merged = traitScores
        ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
            acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
            return acc;
          }, { ...traitScores })
        : calculated;
      setTraitScores(merged);
      setTraits(merged);
      setPhase('complete');
    } else {
      setPhase('feedback');
    }
  };

  const nextTopic = () => {
    setCurrentTopic((c) => c + 1);
    setChosenSide(null);
    setArgument('');
    setFollowUpAnswer('');
    setPhase('choose_side');
  };

  if (phase === 'complete' && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-white mb-2">Debate Club Complete!</h2>
          <p className="text-primary-200 mb-4">You debated {topics.length} topics! Great critical thinking.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar
                key={trait}
                label={trait.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={val}
                color={val >= 60 ? 'bg-emerald-500' : 'bg-white/30'}
              />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/results')}>View Results →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold text-white mb-3">Debate Club</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Pick a side on thought-provoking topics, write your argument, and propose a compromise.
          </p>
          <p className="text-white/50 text-sm mb-6">
            Measures: Linguistic (Gardner) + Enterprising (RIASEC) + Extraversion (Big Five)
          </p>
          <p className="text-white/40 text-xs mb-6">~7 minutes · {topics.length} debates</p>
          <Button size="lg" onClick={() => setPhase('choose_side')}>Start Debating 🎤</Button>
        </Card>
      </div>
    );
  }

  if (phase === 'feedback') {
    const last = results[results.length - 1];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ProgressBar value={currentTopic + 1} max={topics.length} label={`Topic ${currentTopic + 1} of ${topics.length}`} />
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-white mb-2">Great Debate!</h2>
          <p className="text-primary-200 mb-1">Argument: {last.argumentLength} words</p>
          <p className="text-primary-200 mb-6">Follow-up: {last.followUpLength} words</p>
          <Button onClick={nextTopic}>Next Topic →</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🎤 Debate Club</h1>
        <p className="text-primary-200 text-sm">Express your views on real-world topics</p>
      </div>
      <ProgressBar value={currentTopic + 1} max={topics.length} label={`Topic ${currentTopic + 1} of ${topics.length}`} />

      <Card>
        <div className="text-center mb-4">
          <span className="text-4xl">{topic.emoji}</span>
        </div>
        <h2 className="text-white text-lg font-bold mb-2 text-center">{topic.topic}</h2>
        <p className="text-white/60 text-sm mb-6 text-center">{topic.context}</p>

        {phase === 'choose_side' && (
          <div className="space-y-3">
            <p className="text-white/70 text-sm text-center mb-4">Choose your stance:</p>
            <button
              onClick={() => handleChooseSide('A')}
              className="w-full text-left px-4 py-4 rounded-xl border bg-blue-600/10 border-blue-500/30 text-blue-200 hover:bg-blue-600/20 transition-all text-sm"
            >
              👍 {topic.sideA}
            </button>
            <button
              onClick={() => handleChooseSide('B')}
              className="w-full text-left px-4 py-4 rounded-xl border bg-orange-600/10 border-orange-500/30 text-orange-200 hover:bg-orange-600/20 transition-all text-sm"
            >
              👎 {topic.sideB}
            </button>
          </div>
        )}

        {phase === 'argument' && (
          <div className="space-y-4">
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/50 text-xs">Your stance:</p>
              <p className="text-white/80 text-sm">{chosenSide === 'A' ? topic.sideA : topic.sideB}</p>
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">Write your argument (at least 2-3 sentences):</label>
              <textarea
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-white/30"
                placeholder="I believe this because..."
              />
              <p className="text-white/40 text-xs mt-1">{argument.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmitArgument} disabled={argument.trim().split(/\s+/).filter(Boolean).length < 5}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {phase === 'followup' && (
          <div className="space-y-4">
            <div className="px-3 py-2 rounded-lg bg-purple-600/10 border border-purple-500/20">
              <p className="text-purple-300 text-sm font-medium">{topic.followUp}</p>
            </div>
            <textarea
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-white/30"
              placeholder="I would suggest..."
            />
            <p className="text-white/40 text-xs">{followUpAnswer.trim().split(/\s+/).filter(Boolean).length} words</p>
            <div className="flex justify-end">
              <Button onClick={handleSubmitFollowUp} disabled={followUpAnswer.trim().split(/\s+/).filter(Boolean).length < 3}>
                {currentTopic + 1 >= topics.length ? 'Complete' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
