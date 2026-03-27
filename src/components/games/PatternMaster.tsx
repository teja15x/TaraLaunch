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
  type: string;
  text: string;
  options: string[];
  correctAnswer: number;
  traits: Partial<TraitScores>;
  difficulty: number;
}

const questions: PatternQuestion[] = [
  // ── NUMBER SEQUENCES (5) ─────────────────────────
  { id: 'pm1', type: 'number', text: 'What comes next? 2, 6, 18, 54, ___', options: ['108', '162', '148', '126'], correctAnswer: 1, traits: { analytical: 20, technical: 10 }, difficulty: 1 },
  { id: 'pm2', type: 'number', text: 'Find the pattern: 1, 1, 2, 3, 5, 8, ___', options: ['11', '13', '10', '12'], correctAnswer: 1, traits: { analytical: 20, detail_oriented: 10 }, difficulty: 1 },
  { id: 'pm3', type: 'number', text: 'What comes next? 3, 7, 15, 31, ___', options: ['47', '63', '55', '59'], correctAnswer: 1, traits: { analytical: 25, technical: 15 }, difficulty: 2 },
  { id: 'pm4', type: 'number', text: 'Find the missing number: 2, 5, 11, 23, ___, 95', options: ['47', '45', '46', '48'], correctAnswer: 0, traits: { analytical: 25, detail_oriented: 15 }, difficulty: 2 },
  { id: 'pm5', type: 'number', text: 'What completes the series? 1, 4, 9, 16, 25, ___', options: ['30', '36', '49', '32'], correctAnswer: 1, traits: { analytical: 20, technical: 10, detail_oriented: 10 }, difficulty: 1 },

  // ── SHAPE / VISUAL PATTERNS (5) ─────────────────────────
  { id: 'pm6', type: 'shape', text: 'What completes the pattern? 🔴🔵🔴🔵🔵🔴🔵🔵🔵🔴___', options: ['🔵🔵🔵🔵', '🔴🔵🔵🔵', '🔵🔵🔴🔵', '🔵🔴🔵🔵'], correctAnswer: 0, traits: { analytical: 25, detail_oriented: 20 }, difficulty: 3 },
  { id: 'pm7', type: 'shape', text: 'Pattern: ⬛⬜⬛ / ⬜⬛⬜ / ⬛⬜⬛ — Next row?', options: ['⬜⬛⬜', '⬛⬛⬛', '⬜⬜⬜', '⬛⬜⬛'], correctAnswer: 0, traits: { analytical: 20, detail_oriented: 15, creative: 5 }, difficulty: 2 },
  { id: 'pm8', type: 'shape', text: 'Which shape comes next? △ ▢ ⬠ △ ▢ ⬠ △ ___', options: ['△', '⬠', '▢', '○'], correctAnswer: 2, traits: { analytical: 15, detail_oriented: 15, adaptability: 10 }, difficulty: 1 },
  { id: 'pm9', type: 'shape', text: 'Mirror pattern: 🟢🔵🔴 | 🔴🔵🟢 — Apply to: 🟡🟠🔴 | ___', options: ['🔴🟠🟡', '🟡🟠🔴', '🔴🟡🟠', '🟠🔴🟡'], correctAnswer: 0, traits: { analytical: 20, detail_oriented: 20, creative: 5 }, difficulty: 2 },
  { id: 'pm10', type: 'shape', text: 'Rotation: ⬆️ ➡️ ⬇️ ⬅️ ⬆️ ➡️ ⬇️ — Next?', options: ['⬆️', '⬅️', '➡️', '⬇️'], correctAnswer: 1, traits: { analytical: 15, detail_oriented: 20, technical: 5 }, difficulty: 1 },

  // ── MATRIX / LOGIC PUZZLES (5) ─────────────────────────
  { id: 'pm11', type: 'matrix', text: 'If RED = 27, GREEN = 49, then BLUE = ___', options: ['40', '36', '38', '42'], correctAnswer: 2, traits: { analytical: 20, technical: 15, detail_oriented: 10 }, difficulty: 2 },
  { id: 'pm12', type: 'matrix', text: 'If CAT = 24, DOG = 26, then FOX = ___', options: ['42', '45', '39', '47'], correctAnswer: 1, traits: { analytical: 25, technical: 10, detail_oriented: 10 }, difficulty: 2 },
  { id: 'pm13', type: 'matrix', text: 'Doctor is to Patient as Teacher is to ___', options: ['School', 'Student', 'Book', 'Classroom'], correctAnswer: 1, traits: { analytical: 15, empathy: 10, communication: 10 }, difficulty: 1 },
  { id: 'pm14', type: 'matrix', text: 'Innovation is to Stagnation as Collaboration is to ___', options: ['Teamwork', 'Isolation', 'Communication', 'Partnership'], correctAnswer: 1, traits: { analytical: 15, creative: 10, communication: 10 }, difficulty: 2 },
  { id: 'pm15', type: 'matrix', text: 'If A=1, B=2... then INDIA = ___', options: ['45', '38', '41', '52'], correctAnswer: 0, traits: { analytical: 20, detail_oriented: 15, technical: 10 }, difficulty: 3 },
];

export default function PatternMaster() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  useEffect(() => { setStartTime(Date.now()); }, [current]);

  const handleSelect = (idx: number) => { if (selected === null) setSelected(idx); };
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
      const traitTotals: Record<string, number> = {};
      newAnswers.forEach((a, i) => {
        if (a.correct) {
          Object.entries(questions[i].traits).forEach(([key, val]) => {
            traitTotals[key] = (traitTotals[key] || 0) + (val as number);
          });
        }
        if (a.correct && a.time < 10000) traitTotals.analytical = (traitTotals.analytical || 0) + 5;
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
      const merged = traitScores ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
        acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
        return acc;
      }, { ...traitScores }) : calculated;
      setTraitScores(merged);
      setTraits(merged);
      setIsComplete(true);
    } else setCurrent(current + 1);
  };

  if (isComplete && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pattern Master Complete!</h2>
          <p className="text-primary-200 mb-2">You scored {score} out of {questions.length}!</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar key={trait} label={trait.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} value={val} color={val >= 60 ? 'bg-emerald-500' : 'bg-white/30'} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/games/story-weaver')}>Next: Story Weaver →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const q = questions[current];
  const showFeedback = selected !== null;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🧩 Pattern Master</h1>
        <p className="text-primary-200 text-sm">Test your logical thinking and pattern recognition</p>
      </div>
      <div className="flex items-center gap-4">
        <ProgressBar value={current + 1} max={questions.length} label={`Question ${current + 1} of ${questions.length}`} />
        <span className="text-white/70 text-sm">Score: {score}/{current}</span>
      </div>
      <Card>
        <p className="text-white text-lg font-medium mb-6">{q.text}</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showFeedback}
              className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                showFeedback
                  ? idx === q.correctAnswer ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
                    : idx === selected ? 'bg-red-600/30 border-red-500/50 text-red-200' : 'bg-white/5 border-white/10 text-white/40'
                  : selected === idx ? 'bg-primary-600/30 border-primary-500/50 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
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
          <Button onClick={handleNext} disabled={selected === null}>{current + 1 >= questions.length ? 'Complete' : 'Next →'}</Button>
        </div>
      </Card>
    </div>
  );
}
