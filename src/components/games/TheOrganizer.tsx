'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface TaskItem {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'sort' | 'schedule' | 'categorize';
  items: TaskItem[];
  correctOrder?: string[]; // correct item ids in priority order
  categories?: string[];
  correctCategories?: Record<string, string>; // item id -> category
  timeLimit: number; // seconds
}

const challenges: Challenge[] = [
  {
    id: 'org1',
    title: 'Priority Sort',
    description: 'A student has these tasks due this week. Arrange them by urgency (most urgent first).',
    emoji: '📋',
    type: 'sort',
    items: [
      { id: 'a', text: 'Math exam tomorrow morning', category: 'academic', priority: 'high' },
      { id: 'b', text: 'Science project due in 3 days', category: 'academic', priority: 'medium' },
      { id: 'c', text: 'Buy birthday gift for friend (party in 5 days)', category: 'personal', priority: 'low' },
      { id: 'd', text: 'Submit scholarship form (deadline tonight)', category: 'academic', priority: 'high' },
      { id: 'e', text: 'Clean room (parents asked by weekend)', category: 'personal', priority: 'low' },
    ],
    correctOrder: ['d', 'a', 'b', 'e', 'c'],
    timeLimit: 60,
  },
  {
    id: 'org2',
    title: 'Category Sort',
    description: 'Sort these school activities into the right categories.',
    emoji: '🗂️',
    type: 'categorize',
    items: [
      { id: 'f', text: 'Basketball practice', category: 'Sports', priority: 'medium' },
      { id: 'g', text: 'Debate club meeting', category: 'Academics', priority: 'medium' },
      { id: 'h', text: 'Painting class', category: 'Arts', priority: 'medium' },
      { id: 'i', text: 'Science olympiad prep', category: 'Academics', priority: 'high' },
      { id: 'j', text: 'Dance rehearsal', category: 'Arts', priority: 'medium' },
      { id: 'k', text: 'Football tryouts', category: 'Sports', priority: 'high' },
    ],
    categories: ['Sports', 'Academics', 'Arts'],
    correctCategories: { f: 'Sports', g: 'Academics', h: 'Arts', i: 'Academics', j: 'Arts', k: 'Sports' },
    timeLimit: 45,
  },
  {
    id: 'org3',
    title: 'Schedule Builder',
    description: 'You have 4 hours after school. Arrange these tasks in the most logical order.',
    emoji: '⏰',
    type: 'sort',
    items: [
      { id: 'l', text: 'Eat a snack and rest (15 min)', category: 'break', priority: 'high' },
      { id: 'm', text: 'Complete hardest homework first (1.5 hr)', category: 'academic', priority: 'high' },
      { id: 'n', text: 'Quick exercise / walk (30 min)', category: 'health', priority: 'medium' },
      { id: 'o', text: 'Review notes for tomorrow (30 min)', category: 'academic', priority: 'medium' },
      { id: 'p', text: 'Free time / hobby (1 hr)', category: 'personal', priority: 'low' },
    ],
    correctOrder: ['l', 'm', 'n', 'o', 'p'],
    timeLimit: 60,
  },
  {
    id: 'org4',
    title: 'Event Planner',
    description: 'You\'re organizing a school science fair. Sort tasks by when they need to happen.',
    emoji: '🎪',
    type: 'sort',
    items: [
      { id: 'q', text: 'Book the hall (2 months before)', category: 'logistics', priority: 'high' },
      { id: 'r', text: 'Send invitations (3 weeks before)', category: 'communication', priority: 'medium' },
      { id: 's', text: 'Set up display boards (1 day before)', category: 'logistics', priority: 'high' },
      { id: 't', text: 'Collect project submissions (1 week before)', category: 'academic', priority: 'high' },
      { id: 'u', text: 'Thank-you notes to judges (1 day after)', category: 'communication', priority: 'low' },
      { id: 'v', text: 'Recruit volunteer judges (1 month before)', category: 'communication', priority: 'medium' },
    ],
    correctOrder: ['q', 'v', 'r', 't', 's', 'u'],
    timeLimit: 60,
  },
  {
    id: 'org5',
    title: 'Resource Allocator',
    description: 'Your team has ₹5000 for a college fest booth. Categorize these expenses.',
    emoji: '💰',
    type: 'categorize',
    items: [
      { id: 'w', text: 'Poster printing ₹800', category: 'Marketing', priority: 'medium' },
      { id: 'x', text: 'Snacks for volunteers ₹500', category: 'Operations', priority: 'low' },
      { id: 'y', text: 'Decoration materials ₹1200', category: 'Setup', priority: 'medium' },
      { id: 'z', text: 'Sound system rental ₹1500', category: 'Setup', priority: 'high' },
      { id: 'aa', text: 'Social media ads ₹600', category: 'Marketing', priority: 'medium' },
      { id: 'bb', text: 'First aid kit ₹400', category: 'Operations', priority: 'high' },
    ],
    categories: ['Marketing', 'Setup', 'Operations'],
    correctCategories: { w: 'Marketing', x: 'Operations', y: 'Setup', z: 'Setup', aa: 'Marketing', bb: 'Operations' },
    timeLimit: 45,
  },
];

export default function TheOrganizer() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'feedback' | 'complete'>('intro');
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [userCategories, setUserCategories] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const challenge = challenges[currentChallenge];

  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startChallenge = useCallback(() => {
    setPhase('playing');
    setTimeLeft(challenge.timeLimit);
    setUserOrder([]);
    setUserCategories({});
  }, [challenge.timeLimit]);

  const handleAddToOrder = (itemId: string) => {
    if (userOrder.includes(itemId)) {
      setUserOrder(userOrder.filter((id) => id !== itemId));
    } else {
      setUserOrder([...userOrder, itemId]);
    }
  };

  const handleCategorize = (itemId: string, cat: string) => {
    setUserCategories({ ...userCategories, [itemId]: cat });
  };

  const submitAnswer = () => {
    let score = 0;
    if (challenge.type === 'sort' && challenge.correctOrder) {
      const correct = challenge.correctOrder;
      let correctCount = 0;
      userOrder.forEach((id, idx) => {
        if (id === correct[idx]) correctCount++;
      });
      score = Math.round((correctCount / correct.length) * 100);
    } else if (challenge.type === 'categorize' && challenge.correctCategories) {
      const correct = challenge.correctCategories;
      let correctCount = 0;
      Object.entries(userCategories).forEach(([itemId, cat]) => {
        if (correct[itemId] === cat) correctCount++;
      });
      score = Math.round((correctCount / Object.keys(correct).length) * 100);
    }

    // Time bonus
    const timeBonus = timeLeft > 0 ? Math.round((timeLeft / challenge.timeLimit) * 10) : 0;
    score = Math.min(100, score + timeBonus);

    const newScores = [...scores, score];
    setScores(newScores);
    setLastScore(score);

    if (currentChallenge + 1 >= challenges.length) {
      const avg = newScores.reduce((a, b) => a + b, 0) / newScores.length;
      const calculated: TraitScores = {
        analytical: Math.min(100, Math.round(avg * 0.6)),
        creative: Math.min(100, Math.round(avg * 0.3)),
        leadership: Math.min(100, Math.round(avg * 0.4)),
        empathy: Math.min(100, Math.round(avg * 0.2)),
        technical: Math.min(100, Math.round(avg * 0.3)),
        communication: Math.min(100, Math.round(avg * 0.3)),
        adaptability: Math.min(100, Math.round(avg * 0.4)),
        detail_oriented: Math.min(100, Math.round(avg * 0.8)),
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

  if (phase === 'complete' && traits) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white mb-2">The Organizer Complete!</h2>
          <p className="text-primary-200 mb-4">Average Score: {Math.round(avg)}%</p>
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
            <Button onClick={() => router.push('/games/debate-club')}>Next: Debate Club →</Button>
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
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-3xl font-bold text-white mb-3">The Organizer</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Sort, categorize, and schedule tasks. Shows how well you plan, prioritize, and think systematically.
          </p>
          <p className="text-white/50 text-sm mb-6">Measures: Conventional (RIASEC) + Conscientiousness (Big Five)</p>
          <p className="text-white/40 text-xs mb-6">~5 minutes · {challenges.length} challenges · Timed</p>
          <Button size="lg" onClick={startChallenge}>Start Organizing 📋</Button>
        </Card>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ProgressBar value={currentChallenge + 1} max={challenges.length} label={`Challenge ${currentChallenge + 1} of ${challenges.length}`} />
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">{lastScore >= 80 ? '🌟' : lastScore >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-xl font-bold text-white mb-2">Score: {lastScore}%</h2>
          <p className="text-primary-200 mb-6">
            {lastScore >= 80 ? 'Excellent organization!' : lastScore >= 50 ? 'Good work!' : 'Keep practicing!'}
          </p>
          <Button onClick={() => { setCurrentChallenge((c) => c + 1); startChallenge(); }}>
            Next Challenge →
          </Button>
        </Card>
      </div>
    );
  }

  // Playing phase
  const allItemsPlaced = challenge.type === 'sort'
    ? userOrder.length === challenge.items.length
    : Object.keys(userCategories).length === challenge.items.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">📋 The Organizer</h1>
        <p className="text-primary-200 text-sm">{challenge.title}</p>
      </div>
      <div className="flex items-center gap-4">
        <ProgressBar value={currentChallenge + 1} max={challenges.length} label={`Challenge ${currentChallenge + 1} of ${challenges.length}`} />
        <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white/70'}`}>
          ⏱ {timeLeft}s
        </span>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{challenge.emoji}</span>
          <p className="text-white font-medium">{challenge.description}</p>
        </div>

        {challenge.type === 'sort' && (
          <>
            <p className="text-white/50 text-xs mb-3">Tap items in order (tap again to remove):</p>
            <div className="space-y-2 mb-4">
              {challenge.items.map((item) => {
                const orderIdx = userOrder.indexOf(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddToOrder(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      orderIdx >= 0
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {orderIdx >= 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/40 text-white text-xs mr-2 font-bold">
                        {orderIdx + 1}
                      </span>
                    )}
                    {item.text}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {challenge.type === 'categorize' && challenge.categories && (
          <>
            <p className="text-white/50 text-xs mb-3">Assign each item to a category:</p>
            <div className="space-y-3 mb-4">
              {challenge.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80 text-sm flex-1">{item.text}</span>
                  <div className="flex gap-1">
                    {challenge.categories!.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorize(item.id, cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          userCategories[item.id] === cat
                            ? 'bg-purple-600/40 border border-purple-500/50 text-purple-200'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={submitAnswer} disabled={!allItemsPlaced && timeLeft > 0}>
            {timeLeft === 0 ? 'Time\'s up — Submit' : 'Submit'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
