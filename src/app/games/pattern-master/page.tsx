'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface PatternQuestion {
  id: string;
  type: 'sequence' | 'matrix' | 'odd_one_out' | 'analogy';
  text: string;
  options: string[];
  correctAnswer: number;
  traits: Partial<TraitScores>;
  difficulty: number;
}

const questions: PatternQuestion[] = [
  {
    id: 'pm1', type: 'sequence',
    text: 'What comes next in the pattern? 2, 6, 18, 54, ___',
    options: ['108', '162', '148', '126'],
    correctAnswer: 1,
    traits: { analytical: 20, technical: 10 },
    difficulty: 1,
  },
  {
    id: 'pm2', type: 'odd_one_out',
    text: 'Which one does NOT belong in this group? Strategy, Vision, Planning, Spreadsheet, Execution',
    options: ['Strategy', 'Vision', 'Spreadsheet', 'Execution'],
    correctAnswer: 2,
    traits: { analytical: 15, creative: 10, detail_oriented: 10 },
    difficulty: 1,
  },
  {
    id: 'pm3', type: 'analogy',
    text: 'Doctor is to Patient as Teacher is to ___',
    options: ['School', 'Student', 'Book', 'Classroom'],
    correctAnswer: 1,
    traits: { analytical: 15, empathy: 10, communication: 10 },
    difficulty: 1,
  },
  {
    id: 'pm4', type: 'sequence',
    text: 'Find the pattern: A1, B2, D4, G7, ___',
    options: ['K11', 'J10', 'I9', 'H8'],
    correctAnswer: 0,
    traits: { analytical: 25, technical: 15 },
    difficulty: 2,
  },
  {
    id: 'pm5', type: 'matrix',
    text: 'If RED = 27, GREEN = 49, then BLUE = ___',
    options: ['40', '36', '38', '42'],
    correctAnswer: 2,
    traits: { analytical: 20, technical: 15, detail_oriented: 10 },
    difficulty: 2,
  },
  {
    id: 'pm6', type: 'odd_one_out',
    text: 'Which approach differs from the rest? A) Brainstorm first B) Research data C) Ask stakeholders D) Prototype quickly',
    options: ['Brainstorm first', 'Research data', 'Ask stakeholders', 'Prototype quickly'],
    correctAnswer: 1,
    traits: { creative: 15, analytical: 15, adaptability: 10 },
    difficulty: 2,
  },
  {
    id: 'pm7', type: 'sequence',
    text: 'What completes the pattern? 🔴🔵🔴🔵🔵🔴🔵🔵🔵🔴___',
    options: ['🔵🔵🔵🔵', '🔴🔵🔵🔵', '🔵🔵🔴🔵', '🔵🔴🔵🔵'],
    correctAnswer: 0,
    traits: { analytical: 25, detail_oriented: 20 },
    difficulty: 3,
  },
  {
    id: 'pm8', type: 'analogy',
    text: 'Innovation is to Stagnation as Collaboration is to ___',
    options: ['Teamwork', 'Isolation', 'Communication', 'Partnership'],
    correctAnswer: 1,
    traits: { analytical: 15, creative: 10, communication: 10 },
    difficulty: 2,
  },
];

export default function PatternMasterPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    setStartTime(Date.now());
  }, [current]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const q = questions[current];
    const isCorrect = selected === q.correctAnswer;
    const timeTaken = Date.now() - startTime;
    const newAnswers = [...answers, { correct: isCorrect, time: timeTaken }];
    setAnswers(newAnswers);
    if (isCorrect) setScore(score + 1);
    setSelected(null);

    if (current + 1 >= questions.length) {
      // Calculate traits
      const traitTotals: Record<string, number> = {};
      newAnswers.forEach((a, i) => {
        if (a.correct) {
          const q = questions[i];
          Object.entries(q.traits).forEach(([key, val]) => {
            traitTotals[key] = (traitTotals[key] || 0) + (val as number);
          });
        }
        // Speed bonus for analytical
        if (a.correct && a.time < 10000) {
          traitTotals.analytical = (traitTotals.analytical || 0) + 5;
        }
      });
      const maxPossible = questions.length * 25;
      const calculated: TraitScores = {
        analytical: Math.min(100, Math.round(((traitTotals.analytical || 0) / maxPossible) * 100)),
        creative: Math.min(100, Math.round(((traitTotals.creative || 0) / maxPossible) * 100)),
        leadership: Math.min(100, Math.round(((traitTotals.leadership || 0) / maxPossible) * 100)),
        empathy: Math.min(100, Math.round(((traitTotals.empathy || 0) / maxPossible) * 100)),
        technical: Math.min(100, Math.round(((traitTotals.technical || 0) / maxPossible) * 100)),
        communication: Math.min(100, Math.round(((traitTotals.communication || 0) / maxPossible) * 100)),
        adaptability: Math.min(100, Math.round(((traitTotals.adaptability || 0) / maxPossible) * 100)),
        detail_oriented: Math.min(100, Math.round(((traitTotals.detail_oriented || 0) / maxPossible) * 100)),
      };
      // Merge with previous scores if exist
      if (traitScores) {
        const merged: TraitScores = { ...traitScores };
        (Object.keys(calculated) as (keyof TraitScores)[]).forEach((key) => {
          merged[key] = Math.round((traitScores[key] + calculated[key]) / 2);
        });
        setTraitScores(merged);
        setTraits(merged);
      } else {
        setTraitScores(calculated);
        setTraits(calculated);
      }
      setIsComplete(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (isComplete && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="font-display mb-2 text-3xl text-white">Pattern Master Complete!</h2>
          <p className="mb-2 text-white/78">You scored {score} out of {questions.length}!</p>
          <p className="text-white/50 text-sm mb-6">
            {score >= 6 ? 'Excellent analytical mind!' : score >= 4 ? 'Good pattern recognition skills!' : 'Creative thinker with unique perspectives!'}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar key={trait} label={trait.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} value={val} color={val >= 60 ? 'bg-emerald-500' : 'bg-white/30'} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/games/story-weaver')}>Next: Story Weaver -&gt;</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const q = questions[current];
  const showFeedback = selected !== null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="surface-panel rounded-[1.6rem] p-6">
        <h1 className="font-display mb-1 text-3xl text-white">🧩 Pattern Master</h1>
        <p className="text-sm text-white/78">Test your logical thinking and pattern recognition</p>
      </div>
      <div className="flex items-center gap-4">
        <ProgressBar value={current + 1} max={questions.length} label={`Question ${current + 1} of ${questions.length}`} />
        <span className="text-white/70 text-sm whitespace-nowrap">Score: {score}/{current}</span>
      </div>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-lg bg-primary-500/25 px-2 py-1 text-xs font-medium text-primary-100">{q.type.replace('_', ' ')}</span>
          <span className="px-2 py-1 bg-white/10 rounded-lg text-white/50 text-xs">Difficulty: {'★'.repeat(q.difficulty)}</span>
        </div>
        <p className="text-white text-lg font-medium mb-6">{q.text}</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showFeedback}
              className={`rounded-xl border px-4 py-4 text-sm font-medium transition-all ${
                showFeedback
                  ? idx === q.correctAnswer
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
                    : idx === selected
                    ? 'bg-red-600/30 border-red-500/50 text-red-200'
                    : 'bg-white/5 border-white/10 text-white/40'
                  : selected === idx
                  ? 'bg-primary-500/25 border-primary-300/60 text-white'
                  : 'bg-white/5 border-white/15 text-white/82 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {showFeedback && (
          <div className={`mt-4 px-4 py-2 rounded-lg text-sm ${selected === q.correctAnswer ? 'bg-emerald-600/20 text-emerald-200' : 'bg-red-600/20 text-red-200'}`}>
            {selected === q.correctAnswer ? '✓ Correct!' : `✗ The answer was: ${q.options[q.correctAnswer]}`}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} disabled={selected === null}>
            {current + 1 >= questions.length ? 'Complete' : 'Next -&gt;'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
