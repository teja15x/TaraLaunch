'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { GameResponse, TraitScores } from '@/types';

const scenarios = [
  {
    id: 'sq1',
    text: 'Your team is behind on a critical project deadline. The client is getting anxious. What do you do?',
    options: [
      { label: 'Call an emergency meeting and redistribute tasks based on each person\'s strengths', value: 'redistribute', traits: { leadership: 25, analytical: 15, communication: 10 } },
      { label: 'Stay late yourself to pick up the slack and lead by example', value: 'grind', traits: { detail_oriented: 20, leadership: 15, adaptability: 10 } },
      { label: 'Contact the client, honestly explain the situation, and negotiate a new timeline', value: 'negotiate', traits: { communication: 25, empathy: 15, leadership: 10 } },
      { label: 'Analyze what went wrong to find shortcuts without sacrificing quality', value: 'analyze', traits: { analytical: 25, technical: 15, adaptability: 10 } },
      { label: 'Break the project into micro-milestones and ship the most critical features first', value: 'prioritize', traits: { analytical: 20, leadership: 15, detail_oriented: 15 } },
      { label: 'Motivate the team with a pep talk about the bigger mission, then work alongside them', value: 'inspire', traits: { empathy: 20, leadership: 20, communication: 10 } },
    ],
  },
  {
    id: 'sq2',
    text: 'A colleague presents an idea you think is flawed. How do you respond?',
    options: [
      { label: 'Ask probing questions to help them discover the flaw themselves', value: 'question', traits: { empathy: 20, communication: 20, leadership: 10 } },
      { label: 'Directly point out the issues and propose a better approach', value: 'direct', traits: { analytical: 20, communication: 15, leadership: 15 } },
      { label: 'Offer to help improve the idea by combining it with your suggestions', value: 'collaborate', traits: { creative: 20, empathy: 15, communication: 15 } },
      { label: 'Research similar ideas to present data-backed feedback', value: 'research', traits: { analytical: 25, technical: 15, detail_oriented: 10 } },
      { label: 'Privately share your concerns after the meeting to avoid embarrassing them', value: 'private', traits: { empathy: 25, communication: 15, adaptability: 10 } },
      { label: 'Build a quick prototype of a better approach to show, not just tell', value: 'prototype', traits: { technical: 20, creative: 20, analytical: 10 } },
    ],
  },
  {
    id: 'sq3',
    text: 'You receive two job offers. One is higher paying at a large company; the other is a startup with equity. You:',
    options: [
      { label: 'Take the stable, higher-paying role — financial security comes first', value: 'stable', traits: { analytical: 20, detail_oriented: 20, technical: 10 } },
      { label: 'Join the startup — the potential upside and learning excite you', value: 'startup', traits: { creative: 20, adaptability: 20, leadership: 10 } },
      { label: 'Create a pros/cons spreadsheet and ask mentors for advice', value: 'analyze', traits: { analytical: 25, communication: 10, detail_oriented: 15 } },
      { label: 'Try to negotiate the startup offer to get a bit more base salary', value: 'negotiate', traits: { communication: 20, leadership: 15, adaptability: 15 } },
      { label: 'Ask both companies for a trial period or project to test the culture first', value: 'trial', traits: { adaptability: 20, empathy: 15, analytical: 15 } },
      { label: 'Research both companies\' growth trajectory, Glassdoor reviews, and talk to current employees', value: 'deep_research', traits: { analytical: 20, technical: 15, detail_oriented: 15 } },
    ],
  },
  {
    id: 'sq4',
    text: 'Your manager asks you to lead a project in an area you know very little about. What\'s your move?',
    options: [
      { label: 'Accept eagerly — you love learning new things on the fly', value: 'dive_in', traits: { adaptability: 25, leadership: 15, creative: 10 } },
      { label: 'Accept but immediately start studying the domain intensively', value: 'study', traits: { analytical: 20, technical: 20, detail_oriented: 10 } },
      { label: 'Accept and recruit team members who have the domain expertise', value: 'delegate', traits: { leadership: 25, communication: 15, empathy: 10 } },
      { label: 'Honestly share your concerns but express willingness to learn', value: 'honest', traits: { communication: 20, empathy: 20, adaptability: 10 } },
      { label: 'Ask your manager for a mentor or buddy who knows the domain', value: 'mentorship', traits: { communication: 15, empathy: 15, adaptability: 20 } },
      { label: 'Set up a structured learning plan with weekly milestones to ramp up', value: 'structured', traits: { detail_oriented: 25, analytical: 15, leadership: 10 } },
    ],
  },
  {
    id: 'sq5',
    text: 'A new technology could revolutionize your industry but requires significant investment. Your recommendation?',
    options: [
      { label: 'Propose a small pilot program to test it with minimal risk', value: 'pilot', traits: { analytical: 20, leadership: 15, adaptability: 15 } },
      { label: 'Go all in — early adopters gain the biggest advantage', value: 'all_in', traits: { creative: 20, leadership: 20, adaptability: 10 } },
      { label: 'Write a detailed cost-benefit analysis before deciding', value: 'analyze', traits: { analytical: 25, detail_oriented: 20, technical: 5 } },
      { label: 'Talk to companies who\'ve adopted it to learn from their experience', value: 'network', traits: { communication: 20, empathy: 15, analytical: 15 } },
      { label: 'Form a cross-functional committee to evaluate from all angles', value: 'committee', traits: { leadership: 15, communication: 15, empathy: 15 } },
      { label: 'Build an internal prototype to test feasibility before committing budget', value: 'build_test', traits: { technical: 25, creative: 15, analytical: 10 } },
    ],
  },
  {
    id: 'sq6',
    text: 'You discover a significant error in a report that your team already submitted. What do you do?',
    options: [
      { label: 'Immediately notify stakeholders and provide the corrected data', value: 'transparent', traits: { communication: 25, leadership: 15, detail_oriented: 10 } },
      { label: 'Fix it quickly, send an updated version, and add checks to prevent it happening again', value: 'fix_prevent', traits: { analytical: 15, detail_oriented: 25, technical: 10 } },
      { label: 'Gather the team to understand how it happened and correct it together', value: 'team', traits: { leadership: 20, empathy: 15, communication: 15 } },
      { label: 'Do a root cause analysis of the process that led to the error', value: 'rca', traits: { analytical: 25, technical: 15, detail_oriented: 10 } },
      { label: 'Set up automated validation scripts so this type of error gets caught early', value: 'automate', traits: { technical: 25, analytical: 15, detail_oriented: 10 } },
      { label: 'Take personal responsibility publicly and share what you\'ve learned', value: 'own_it', traits: { leadership: 20, communication: 15, empathy: 15 } },
    ],
  },
  {
    id: 'sq7',
    text: 'You have a free afternoon at work. No urgent tasks. How do you spend it?',
    options: [
      { label: 'Learn a new skill or tool that could help the team', value: 'learn', traits: { technical: 20, analytical: 15, adaptability: 15 } },
      { label: 'Reach out to colleagues to build relationships and catch up', value: 'network', traits: { empathy: 20, communication: 25, leadership: 5 } },
      { label: 'Brainstorm ideas for improving current processes', value: 'innovate', traits: { creative: 25, analytical: 15, leadership: 10 } },
      { label: 'Organize your workspace and plan for the upcoming week', value: 'organize', traits: { detail_oriented: 25, analytical: 15, adaptability: 10 } },
      { label: 'Mentor a junior team member or help someone who\'s stuck', value: 'mentor', traits: { empathy: 25, leadership: 15, communication: 10 } },
      { label: 'Work on a passion project or side idea that could benefit the company', value: 'passion', traits: { creative: 20, technical: 15, adaptability: 15 } },
    ],
  },
  {
    id: 'sq8',
    text: 'During a presentation, someone aggressively challenges your data. How do you handle it?',
    options: [
      { label: 'Stay calm, acknowledge their point, and present supporting evidence', value: 'composed', traits: { communication: 25, analytical: 15, adaptability: 10 } },
      { label: 'Invite them to discuss it after the meeting one-on-one', value: 'defer', traits: { empathy: 20, leadership: 15, communication: 15 } },
      { label: 'Walk through your methodology step by step to show rigor', value: 'methodical', traits: { analytical: 20, detail_oriented: 20, technical: 10 } },
      { label: 'Turn it into a collaborative discussion and ask for their perspective', value: 'collaborate', traits: { creative: 15, empathy: 20, communication: 15 } },
      { label: 'Show the raw data sources and let the evidence speak for itself', value: 'data_driven', traits: { analytical: 25, technical: 15, detail_oriented: 10 } },
      { label: 'Thank them for the pushback — it makes the final decision stronger', value: 'grateful', traits: { empathy: 20, adaptability: 15, leadership: 15 } },
    ],
  },
  {
    id: 'sq9',
    text: 'Your company is downsizing and you need to recommend which team member to let go. All are good. How do you approach this?',
    options: [
      { label: 'Analyze performance metrics objectively and let the data decide', value: 'data', traits: { analytical: 25, detail_oriented: 15, technical: 10 } },
      { label: 'Consider who has the most transferable skills to find another job quickly', value: 'empathetic', traits: { empathy: 25, analytical: 10, communication: 15 } },
      { label: 'Push back on management and propose budget cuts elsewhere instead', value: 'advocate', traits: { leadership: 25, communication: 15, creative: 10 } },
      { label: 'Look at team composition — who is most critical for upcoming projects?', value: 'strategic', traits: { analytical: 20, leadership: 15, detail_oriented: 15 } },
      { label: 'Talk to each person privately about their career goals before deciding', value: 'personal', traits: { empathy: 20, communication: 20, leadership: 10 } },
      { label: 'Propose a reduced-hours arrangement so nobody has to be fully let go', value: 'creative_sol', traits: { creative: 25, empathy: 15, adaptability: 10 } },
    ],
  },
  {
    id: 'sq10',
    text: 'You\'re offered a role abroad with great pay but it means leaving family and friends in India. What\'s your thought process?',
    options: [
      { label: 'Take it — personal growth requires stepping out of your comfort zone', value: 'go', traits: { adaptability: 25, leadership: 15, creative: 10 } },
      { label: 'Decline — relationships and roots matter more than money', value: 'stay', traits: { empathy: 25, communication: 10, detail_oriented: 15 } },
      { label: 'Negotiate a remote-first arrangement so you can do both', value: 'negotiate', traits: { communication: 20, creative: 15, adaptability: 15 } },
      { label: 'Create a spreadsheet weighing career growth, salary, family impact, and lifestyle', value: 'analyze', traits: { analytical: 25, detail_oriented: 15, technical: 10 } },
      { label: 'Accept for 2 years as a learning experience, then plan to return', value: 'compromise', traits: { adaptability: 20, analytical: 15, leadership: 15 } },
      { label: 'Talk to people who\'ve made the same move and learn from their experience', value: 'research', traits: { communication: 20, empathy: 15, analytical: 15 } },
    ],
  },
];

export default function ScenarioQuest() {
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<GameResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedTraits, setExtractedTraits] = useState<TraitScores | null>(null);
  const [extracting, setExtracting] = useState(false);
  const { setTraitScores } = useAppStore();
  const router = useRouter();

  const handleSelect = (optionIndex: number) => setSelectedOption(optionIndex);

  const handleNext = async () => {
    if (selectedOption === null) return;
    const scenario = scenarios[current];
    const option = scenario.options[selectedOption];
    const newResponses = [...responses, {
      question_id: scenario.id,
      question: scenario.text,
      answer: option.value,
      timestamp: Date.now(),
    }];
    setResponses(newResponses);
    setSelectedOption(null);

    if (current + 1 >= scenarios.length) {
      setExtracting(true);
      const traitTotals: Record<string, number> = {};
      newResponses.forEach((r, i) => {
        const s = scenarios[i];
        const opt = s.options.find((o) => o.value === r.answer);
        if (opt) {
          Object.entries(opt.traits).forEach(([key, val]) => {
            traitTotals[key] = (traitTotals[key] || 0) + (val as number);
          });
        }
      });
      const maxPossible = scenarios.length * 25;
      const traits: TraitScores = {
        analytical: Math.round(((traitTotals.analytical || 0) / maxPossible) * 100),
        creative: Math.round(((traitTotals.creative || 0) / maxPossible) * 100),
        leadership: Math.round(((traitTotals.leadership || 0) / maxPossible) * 100),
        empathy: Math.round(((traitTotals.empathy || 0) / maxPossible) * 100),
        technical: Math.round(((traitTotals.technical || 0) / maxPossible) * 100),
        communication: Math.round(((traitTotals.communication || 0) / maxPossible) * 100),
        adaptability: Math.round(((traitTotals.adaptability || 0) / maxPossible) * 100),
        detail_oriented: Math.round(((traitTotals.detail_oriented || 0) / maxPossible) * 100),
      };
      setExtractedTraits(traits);
      setTraitScores(traits);
      setIsComplete(true);
      setExtracting(false);
    } else {
      setCurrent(current + 1);
    }
  };

  if (extracting) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="text-center py-12 px-8">
          <div className="text-5xl mb-4 animate-bounce">🧠</div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Responses...</h2>
          <p className="text-primary-200">Our AI is extracting your personality traits</p>
        </Card>
      </div>
    );
  }

  if (isComplete && extractedTraits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Scenario Quest Complete!</h2>
          <p className="text-primary-200 mb-6">Here are the traits we detected from your decisions:</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(extractedTraits).map(([trait, score]) => (
              <ProgressBar key={trait} label={trait.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} value={score} color={score >= 60 ? 'bg-primary-500' : 'bg-white/30'} />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/games/pattern-master')}>Next: Pattern Master →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const scenario = scenarios[current];
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🎯 Scenario Quest</h1>
        <p className="text-primary-200 text-sm">Navigate workplace scenarios to reveal your decision-making style</p>
      </div>
      <ProgressBar value={current + 1} max={scenarios.length} label={`Question ${current + 1} of ${scenarios.length}`} />
      <Card>
        <p className="text-white text-lg font-medium mb-6">{scenario.text}</p>
        <div className="space-y-3">
          {scenario.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-all text-sm ${
                selectedOption === idx ? 'bg-primary-600/30 border-primary-500/50 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} disabled={selectedOption === null}>
            {current + 1 >= scenarios.length ? 'Complete' : 'Next →'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
