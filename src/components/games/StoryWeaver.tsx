'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

const prompts: { id: string; text: string; traitMapping: Record<string, string> }[] = [
  { id: 'sw1', text: 'You walk into a room with a broken machine and a crying child. In 2-3 sentences, what do you do first and why?', traitMapping: { empathy: 'child|comfort|help|feel|cry', technical: 'machine|fix|repair|build|broken', leadership: 'take charge|organize|decide|lead', analytical: 'assess|examine|figure|understand|analyze' } },
  { id: 'sw2', text: 'Describe your perfect workday from morning to evening. What does it look like?', traitMapping: { creative: 'create|design|imagine|art|invent|brainstorm', analytical: 'analyze|data|research|study|plan|solve', communication: 'meet|talk|present|discuss|collaborate|team', detail_oriented: 'organize|list|check|review|thorough|careful' } },
  { id: 'sw3', text: 'You are given unlimited resources to solve ONE world problem. What do you tackle and how?', traitMapping: { empathy: 'people|poverty|hunger|health|education|help', technical: 'technology|build|system|automate|engineer', leadership: 'lead|organize|movement|inspire|change', creative: 'new|innovative|unique|different|reimagine' } },
  { id: 'sw4', text: 'Tell a short story about a conflict between two colleagues. How does it resolve?', traitMapping: { empathy: 'understand|listen|feel|perspective|compassion', communication: 'talk|discuss|express|communicate|share', leadership: 'mediate|resolve|guide|mentor|decide', adaptability: 'compromise|flexible|adapt|adjust|middle ground' } },
  { id: 'sw5', text: 'You discover you have a hidden talent nobody knew about. What is it and what do you do with it?', traitMapping: { creative: 'art|music|write|design|perform|create|imagine', technical: 'code|build|engineer|science|invent|program', leadership: 'teach|share|lead|inspire|mentor|help others', adaptability: 'explore|try|new|change|evolve|grow' } },
];

function analyzeText(text: string, traitMapping: Record<string, string>): Record<string, number> {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  Object.entries(traitMapping).forEach(([trait, keywords]) => {
    const words = keywords.split('|');
    let matches = 0;
    words.forEach((w) => { if (lower.includes(w)) matches++; });
    scores[trait] = Math.min(25, matches * 8 + (text.length > 100 ? 5 : 0));
  });
  return scores;
}

export default function StoryWeaver() {
  const [current, setCurrent] = useState(0);
  const [text, setText] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { traitScores, setTraitScores, setAssessmentComplete } = useAppStore();
  const router = useRouter();

  const handleNext = async () => {
    if (text.trim().length < 10) return;
    const newResponses = [...responses, text.trim()];
    setResponses(newResponses);
    setText('');

    if (current + 1 >= prompts.length) {
      setAnalyzing(true);
      const traitTotals: Record<string, number> = {};
      newResponses.forEach((resp, i) => {
        const scores = analyzeText(resp, prompts[i].traitMapping);
        Object.entries(scores).forEach(([k, v]) => { traitTotals[k] = (traitTotals[k] || 0) + v; });
      });
      const avgLength = newResponses.reduce((s, r) => s + r.length, 0) / newResponses.length;
      if (avgLength > 150) {
        traitTotals.communication = (traitTotals.communication || 0) + 15;
        traitTotals.creative = (traitTotals.creative || 0) + 10;
      }
      const maxPossible = prompts.length * 25;
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
        acc[key] = Math.round((traitScores[key] * 2 + calculated[key]) / 3);
        return acc;
      }, { ...traitScores }) : calculated;
      setTraitScores(merged);
      setTraits(merged);
      setAssessmentComplete(true);
      setIsComplete(true);
      setAnalyzing(false);
    } else setCurrent(current + 1);
  };

  if (analyzing) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="text-center py-12 px-8">
          <div className="text-5xl mb-4 animate-bounce">📖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Stories...</h2>
          <p className="text-primary-200">Extracting personality insights from your narratives</p>
        </Card>
      </div>
    );
  }

  if (isComplete && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">All Assessments Complete!</h2>
          <p className="text-primary-200 mb-6">Your comprehensive trait profile is ready. View your career matches!</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar key={trait} label={trait.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} value={val} color={val >= 60 ? 'bg-amber-500' : 'bg-white/30'} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/results')}>View Career Matches →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const prompt = prompts[current];
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">📖 Story Weaver</h1>
        <p className="text-primary-200 text-sm">Express yourself through stories to reveal your creativity and values</p>
      </div>
      <ProgressBar value={current + 1} max={prompts.length} label={`Prompt ${current + 1} of ${prompts.length}`} />
      <Card>
        <p className="text-white text-lg font-medium mb-6">{prompt.text}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your response here..."
          className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
        />
        <div className="flex justify-between items-center mt-4">
          <span className={`text-xs ${text.length < 10 ? 'text-white/30' : 'text-primary-300'}`}>{text.length} characters {text.length < 10 ? '(min 10)' : ''}</span>
          <Button onClick={handleNext} disabled={text.trim().length < 10}>{current + 1 >= prompts.length ? 'Complete Assessment' : 'Next →'}</Button>
        </div>
      </Card>
    </div>
  );
}
