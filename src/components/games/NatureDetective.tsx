'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface Scenario {
  id: string;
  scene: string;
  emoji: string;
  question: string;
  options: { text: string; traits: Partial<TraitScores>; naturalistic: number }[];
}

const scenarios: Scenario[] = [
  {
    id: 'nd1',
    scene: 'You find an unusual mushroom growing at the base of a tree.',
    emoji: '🍄',
    question: 'What do you do first?',
    options: [
      { text: 'Photograph it and research the species later', traits: { analytical: 15, detail_oriented: 15 }, naturalistic: 20 },
      { text: 'Carefully observe its color, gills, and surroundings', traits: { detail_oriented: 20, analytical: 10 }, naturalistic: 25 },
      { text: 'Sketch it in a notebook with notes', traits: { creative: 20, detail_oriented: 10 }, naturalistic: 15 },
      { text: 'Ask a friend if they know what it is', traits: { communication: 15, empathy: 10 }, naturalistic: 5 },
    ],
  },
  {
    id: 'nd2',
    scene: 'A bird you\'ve never seen before lands on your window.',
    emoji: '🐦',
    question: 'How do you react?',
    options: [
      { text: 'Stay still and watch its behavior closely', traits: { detail_oriented: 20, empathy: 10 }, naturalistic: 25 },
      { text: 'Look up birds native to your area online', traits: { analytical: 15, technical: 10 }, naturalistic: 15 },
      { text: 'Try to attract it with food to observe it longer', traits: { creative: 10, empathy: 15 }, naturalistic: 20 },
      { text: 'Call someone to share the excitement', traits: { communication: 20, leadership: 5 }, naturalistic: 5 },
    ],
  },
  {
    id: 'nd3',
    scene: 'You\'re planning a garden for your school.',
    emoji: '🌻',
    question: 'What\'s your approach?',
    options: [
      { text: 'Research which plants grow best in your soil and climate', traits: { analytical: 20, technical: 10 }, naturalistic: 25 },
      { text: 'Design a beautiful layout with a mix of colors', traits: { creative: 20, detail_oriented: 10 }, naturalistic: 15 },
      { text: 'Organize classmates into planting teams', traits: { leadership: 20, communication: 15 }, naturalistic: 10 },
      { text: 'Focus on plants that attract butterflies and bees', traits: { empathy: 15, creative: 10 }, naturalistic: 20 },
    ],
  },
  {
    id: 'nd4',
    scene: 'After heavy rain, you notice the river near your town has changed color.',
    emoji: '🌊',
    question: 'What\'s your first thought?',
    options: [
      { text: 'The soil upstream must have eroded — natural sediment runoff', traits: { analytical: 20, detail_oriented: 10 }, naturalistic: 25 },
      { text: 'Could be pollution — I should report it to authorities', traits: { leadership: 15, empathy: 15 }, naturalistic: 15 },
      { text: 'I want to collect water samples and test them', traits: { analytical: 15, technical: 20 }, naturalistic: 20 },
      { text: 'It looks interesting — I\'ll take photos for my blog', traits: { creative: 15, communication: 10 }, naturalistic: 5 },
    ],
  },
  {
    id: 'nd5',
    scene: 'You\'re hiking and find animal tracks you don\'t recognize.',
    emoji: '🐾',
    question: 'What do you do?',
    options: [
      { text: 'Measure the tracks and compare them to a field guide', traits: { analytical: 20, detail_oriented: 15 }, naturalistic: 25 },
      { text: 'Follow the tracks cautiously to learn more', traits: { adaptability: 15, creative: 10 }, naturalistic: 20 },
      { text: 'Take a photo and ask the group what they think', traits: { communication: 15, leadership: 10 }, naturalistic: 10 },
      { text: 'Note the location on a map for later research', traits: { technical: 15, detail_oriented: 15 }, naturalistic: 15 },
    ],
  },
  {
    id: 'nd6',
    scene: 'Your neighborhood plans to cut down a 100-year-old tree for road expansion.',
    emoji: '🌳',
    question: 'How do you respond?',
    options: [
      { text: 'Research the tree\'s ecological role and present data to officials', traits: { analytical: 15, communication: 15 }, naturalistic: 25 },
      { text: 'Organize a petition and rally the community to save it', traits: { leadership: 25, communication: 15 }, naturalistic: 15 },
      { text: 'Propose alternative road designs that preserve the tree', traits: { creative: 20, technical: 10 }, naturalistic: 20 },
      { text: 'Document the tree\'s history for a school project', traits: { creative: 15, detail_oriented: 10 }, naturalistic: 10 },
    ],
  },
  {
    id: 'nd7',
    scene: 'You get to design a field trip for your class.',
    emoji: '🏕️',
    question: 'Where do you go?',
    options: [
      { text: 'A national park with guided ecology walks', traits: { empathy: 10, analytical: 10 }, naturalistic: 25 },
      { text: 'A science museum with hands-on exhibits', traits: { technical: 20, analytical: 15 }, naturalistic: 10 },
      { text: 'A wildlife sanctuary to observe rescue animals', traits: { empathy: 20, detail_oriented: 10 }, naturalistic: 20 },
      { text: 'An adventure park with zip-lining and rock climbing', traits: { adaptability: 20, leadership: 10 }, naturalistic: 5 },
    ],
  },
  {
    id: 'nd8',
    scene: 'You discover a tide pool at the beach filled with creatures.',
    emoji: '🦀',
    question: 'What catches your attention most?',
    options: [
      { text: 'How each creature has adapted to survive in the pool', traits: { analytical: 20, detail_oriented: 15 }, naturalistic: 25 },
      { text: 'The beautiful colors and patterns on the shells', traits: { creative: 20, detail_oriented: 10 }, naturalistic: 15 },
      { text: 'Teaching younger kids to gently observe without disturbing', traits: { empathy: 15, leadership: 15, communication: 10 }, naturalistic: 15 },
      { text: 'Wondering if climate change is affecting this ecosystem', traits: { analytical: 15, empathy: 10 }, naturalistic: 20 },
    ],
  },
];

export default function NatureDetective() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [totalNaturalistic, setTotalNaturalistic] = useState(0);
  const [traitTotals, setTraitTotals] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const scenario = scenarios[current];
    const option = scenario.options[selected];

    const newTotals = { ...traitTotals };
    Object.entries(option.traits).forEach(([key, val]) => {
      newTotals[key] = (newTotals[key] || 0) + (val as number);
    });
    const newNaturalistic = totalNaturalistic + option.naturalistic;
    setTraitTotals(newTotals);
    setTotalNaturalistic(newNaturalistic);
    setSelected(null);

    if (current + 1 >= scenarios.length) {
      const maxPossible = scenarios.length * 25;
      const natScore = Math.min(100, Math.round((newNaturalistic / maxPossible) * 100));
      const calculated: TraitScores = {
        analytical: Math.min(100, Math.round(((newTotals.analytical || 0) / maxPossible) * 100)),
        creative: Math.min(100, Math.round(((newTotals.creative || 0) / maxPossible) * 100)),
        leadership: Math.min(100, Math.round(((newTotals.leadership || 0) / maxPossible) * 100)),
        empathy: Math.min(100, Math.round(((newTotals.empathy || 0) / maxPossible) * 100)),
        technical: Math.min(100, Math.round(((newTotals.technical || 0) / maxPossible) * 100)),
        communication: Math.min(100, Math.round(((newTotals.communication || 0) / maxPossible) * 100)),
        adaptability: Math.min(100, Math.round(((newTotals.adaptability || 0) / maxPossible) * 100 + natScore * 0.2)),
        detail_oriented: Math.min(100, Math.round(((newTotals.detail_oriented || 0) / maxPossible) * 100 + natScore * 0.15)),
      };
      const merged = traitScores
        ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
            acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
            return acc;
          }, { ...traitScores })
        : calculated;
      setTraitScores(merged);
      setTraits(merged);
      setIsComplete(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (isComplete && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-white mb-2">Nature Detective Complete!</h2>
          <p className="text-primary-200 mb-1">Naturalistic Intelligence Score: {Math.min(100, Math.round((totalNaturalistic / (scenarios.length * 25)) * 100))}%</p>
          <p className="text-white/50 text-sm mb-4">Your connection to the natural world</p>
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
            <Button onClick={() => router.push('/games/the-organizer')}>Next: The Organizer →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const scenario = scenarios[current];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🌿 Nature Detective</h1>
        <p className="text-primary-200 text-sm">Explore nature scenarios to reveal your naturalistic intelligence</p>
      </div>
      <ProgressBar value={current + 1} max={scenarios.length} label={`Scenario ${current + 1} of ${scenarios.length}`} />

      <Card>
        <div className="text-center mb-4">
          <span className="text-5xl">{scenario.emoji}</span>
        </div>
        <p className="text-white text-lg font-medium mb-2">{scenario.scene}</p>
        <p className="text-primary-200 mb-6">{scenario.question}</p>

        <div className="space-y-3">
          {scenario.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-4 rounded-xl border text-sm font-medium transition-all ${
                selected === idx
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200'
                  : selected !== null
                  ? 'bg-white/5 border-white/10 text-white/40'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} disabled={selected === null}>
            {current + 1 >= scenarios.length ? 'Complete' : 'Next →'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
