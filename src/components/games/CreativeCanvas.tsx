'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface CreativePrompt {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  type: 'choice' | 'freeform' | 'combine';
  options?: { label: string; traits: Partial<TraitScores> }[];
  /** For 'combine' type — two ideas to merge */
  ideaA?: string;
  ideaB?: string;
  /** Traits awarded for freeform/combine based on word count */
  baseTraits?: Partial<TraitScores>;
}

const prompts: CreativePrompt[] = [
  {
    id: 'cc1',
    emoji: '🏗️',
    title: 'Dream Invention',
    prompt: 'You have unlimited resources. Describe an invention that would solve a real problem in India.',
    type: 'freeform',
    baseTraits: { creative: 15, analytical: 10, technical: 10, communication: 5 },
  },
  {
    id: 'cc2',
    emoji: '🎨',
    title: 'Color of Emotion',
    prompt: 'If you could paint the feeling of "hope" — what would it look like?',
    type: 'choice',
    options: [
      { label: 'A sunrise breaking through dark storm clouds over a village', traits: { creative: 20, empathy: 15, communication: 10 } },
      { label: 'Abstract swirls of gold and green flowing upward like growing roots', traits: { creative: 25, adaptability: 10, empathy: 10 } },
      { label: 'Children planting saplings in a barren field, with one tree already blooming', traits: { empathy: 20, creative: 15, leadership: 10 } },
      { label: 'A graph line steadily climbing from dark red to bright gold', traits: { analytical: 15, creative: 15, technical: 10, detail_oriented: 5 } },
    ],
  },
  {
    id: 'cc3',
    emoji: '🔀',
    title: 'Idea Mashup',
    prompt: 'Combine these two ideas into one innovative concept. Describe your creation:',
    type: 'combine',
    ideaA: 'A library',
    ideaB: 'A fitness gym',
    baseTraits: { creative: 15, analytical: 5, adaptability: 15, communication: 5 },
  },
  {
    id: 'cc4',
    emoji: '🏠',
    title: 'Redesign Challenge',
    prompt: 'How would you redesign a typical Indian classroom to maximize learning?',
    type: 'choice',
    options: [
      { label: 'Flexible seating pods with whiteboards on every wall, natural light, and a "thinking corner"', traits: { creative: 25, empathy: 10, detail_oriented: 10 } },
      { label: 'Tech-equipped stations with tablets, AR headsets, and an AI tutor screen', traits: { technical: 20, creative: 15, analytical: 10 } },
      { label: 'Open-air classroom with garden, multiple activity zones, and no fixed desks', traits: { creative: 20, adaptability: 15, empathy: 10 } },
      { label: 'Data-driven layout: cameras track engagement, AI adjusts lighting and breaks', traits: { analytical: 20, technical: 15, detail_oriented: 10 } },
    ],
  },
  {
    id: 'cc5',
    emoji: '🔀',
    title: 'Idea Mashup 2',
    prompt: 'Combine these two ideas into one innovative concept:',
    type: 'combine',
    ideaA: 'A hospital',
    ideaB: 'A video game',
    baseTraits: { creative: 15, technical: 10, empathy: 10, adaptability: 5 },
  },
  {
    id: 'cc6',
    emoji: '📖',
    title: 'Story Spark',
    prompt: 'Write the opening paragraph of a story that starts with: "The last train to Delhi was always empty. Until today."',
    type: 'freeform',
    baseTraits: { creative: 15, communication: 15, empathy: 5, adaptability: 5 },
  },
  {
    id: 'cc7',
    emoji: '🌍',
    title: 'Brand Creator',
    prompt: 'Create a brand name and 1-line tagline for an app that helps students discover careers through games.',
    type: 'freeform',
    baseTraits: { creative: 20, communication: 10, leadership: 5, analytical: 5 },
  },
  {
    id: 'cc8',
    emoji: '💡',
    title: 'Problem Solver',
    prompt: 'Traffic in Bangalore is terrible. Propose one creative, unusual solution nobody has tried.',
    type: 'choice',
    options: [
      { label: 'Underground autonomous pod networks connecting tech parks to residential zones', traits: { technical: 20, creative: 15, analytical: 10 } },
      { label: 'Gamify commuting: reward points for carpooling, cycling, and off-peak travel', traits: { creative: 20, empathy: 15, communication: 10 } },
      { label: 'Convert abandoned buildings into micro-offices so people don\'t need to commute', traits: { creative: 20, analytical: 15, adaptability: 10 } },
      { label: 'AI-powered dynamic traffic lights that learn from real-time patterns', traits: { technical: 20, analytical: 20, detail_oriented: 5 } },
    ],
  },
];

export default function CreativeCanvas() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'play' | 'complete'>('intro');
  const [freeformInput, setFreeformInput] = useState('');
  const [allTraits, setAllTraits] = useState<Record<string, number>>({});
  const [traits, setFinalTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const prompt = prompts[current];

  const addTraits = (newTraits: Partial<TraitScores>) => {
    const updated = { ...allTraits };
    Object.entries(newTraits).forEach(([k, v]) => {
      updated[k] = (updated[k] || 0) + (v as number);
    });
    setAllTraits(updated);
    return updated;
  };

  const finalize = (finalTotals: Record<string, number>) => {
    const maxPossible = prompts.length * 25;
    const calculated: TraitScores = {
      analytical: Math.min(100, Math.round(((finalTotals.analytical || 0) / maxPossible) * 100)),
      creative: Math.min(100, Math.round(((finalTotals.creative || 0) / maxPossible) * 100)),
      leadership: Math.min(100, Math.round(((finalTotals.leadership || 0) / maxPossible) * 100)),
      empathy: Math.min(100, Math.round(((finalTotals.empathy || 0) / maxPossible) * 100)),
      technical: Math.min(100, Math.round(((finalTotals.technical || 0) / maxPossible) * 100)),
      communication: Math.min(100, Math.round(((finalTotals.communication || 0) / maxPossible) * 100)),
      adaptability: Math.min(100, Math.round(((finalTotals.adaptability || 0) / maxPossible) * 100)),
      detail_oriented: Math.min(100, Math.round(((finalTotals.detail_oriented || 0) / maxPossible) * 100)),
    };
    const merged = traitScores
      ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
          acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
          return acc;
        }, { ...traitScores })
      : calculated;
    setTraitScores(merged);
    setFinalTraits(merged);
    setPhase('complete');
  };

  const handleChoice = (optIdx: number) => {
    if (!prompt.options) return;
    const updated = addTraits(prompt.options[optIdx].traits);
    if (current + 1 >= prompts.length) {
      finalize(updated);
    } else {
      setCurrent((c) => c + 1);
      setFreeformInput('');
    }
  };

  const handleFreeformSubmit = () => {
    const words = freeformInput.trim().split(/\s+/).filter(Boolean).length;
    if (words < 5) return;
    // Scale base traits by word count
    const multiplier = Math.min(2, words / 20);
    const scaled: Record<string, number> = {};
    if (prompt.baseTraits) {
      Object.entries(prompt.baseTraits).forEach(([k, v]) => {
        scaled[k] = Math.round((v as number) * multiplier);
      });
    }
    // Bonus for longer, more thoughtful responses
    if (words > 30) scaled['detail_oriented'] = (scaled['detail_oriented'] || 0) + 5;
    if (words > 50) scaled['communication'] = (scaled['communication'] || 0) + 5;

    const updated = addTraits(scaled as Partial<TraitScores>);
    if (current + 1 >= prompts.length) {
      finalize(updated);
    } else {
      setCurrent((c) => c + 1);
      setFreeformInput('');
    }
  };

  if (phase === 'complete' && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-white mb-2">Creative Canvas Complete!</h2>
          <p className="text-primary-200 mb-4">You tackled {prompts.length} creative challenges!</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar
                key={trait}
                label={trait.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={val}
                color={val >= 60 ? 'bg-pink-500' : 'bg-white/30'}
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
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-3xl font-bold text-white mb-3">Creative Canvas</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Unleash your imagination through inventions, mashups, and design challenges.
          </p>
          <p className="text-white/50 text-sm mb-6">
            Measures: Spatial (Gardner) + Artistic (RIASEC) + Openness (Big Five)
          </p>
          <p className="text-white/40 text-xs mb-6">~8 minutes · {prompts.length} prompts</p>
          <Button size="lg" onClick={() => setPhase('play')}>Start Creating 🎨</Button>
        </Card>
      </div>
    );
  }

  const wordCount = freeformInput.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🎨 Creative Canvas</h1>
        <p className="text-primary-200 text-sm">Express your creativity and imagination</p>
      </div>
      <ProgressBar value={current + 1} max={prompts.length} label={`Prompt ${current + 1} of ${prompts.length}`} />

      <Card>
        <div className="text-center mb-4">
          <span className="text-4xl">{prompt.emoji}</span>
          <h2 className="text-white font-bold text-lg mt-2">{prompt.title}</h2>
        </div>
        <p className="text-white/80 text-sm mb-6 text-center">{prompt.prompt}</p>

        {prompt.type === 'combine' && (
          <div className="flex gap-3 items-center justify-center mb-6">
            <span className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-200 text-sm">{prompt.ideaA}</span>
            <span className="text-white/40 text-xl">+</span>
            <span className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-200 text-sm">{prompt.ideaB}</span>
          </div>
        )}

        {prompt.type === 'choice' && prompt.options && (
          <div className="space-y-3">
            {prompt.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(idx)}
                className="w-full text-left px-4 py-4 rounded-xl border bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {(prompt.type === 'freeform' || prompt.type === 'combine') && (
          <div className="space-y-4">
            <textarea
              value={freeformInput}
              onChange={(e) => setFreeformInput(e.target.value)}
              rows={5}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder-white/30"
              placeholder={prompt.type === 'combine' ? 'Describe your combined concept...' : 'Let your creativity flow...'}
            />
            <div className="flex justify-between items-center">
              <p className="text-white/40 text-xs">{wordCount} words {wordCount < 5 ? '(min 5)' : ''}</p>
              <Button onClick={handleFreeformSubmit} disabled={wordCount < 5}>
                {current + 1 >= prompts.length ? 'Complete' : 'Next →'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
