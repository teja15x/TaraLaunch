'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface TeamMember {
  name: string;
  emoji: string;
  strength: string;
  weakness: string;
}

interface Challenge {
  id: string;
  scenario: string;
  emoji: string;
  team: TeamMember[];
  tasks: {
    label: string;
    /** Which team member index is the best assignment */
    bestFit: number;
    traits: Partial<TraitScores>;
  }[];
  followUp: {
    question: string;
    options: { label: string; traits: Partial<TraitScores> }[];
  };
}

const challenges: Challenge[] = [
  {
    id: 'tl1',
    scenario: 'Your team has 48 hours to build a school event app. Assign each task to the right person.',
    emoji: '💻',
    team: [
      { name: 'Priya', emoji: '👩‍💻', strength: 'Coding & logic', weakness: 'Public speaking' },
      { name: 'Arjun', emoji: '🎨', strength: 'UI design & creativity', weakness: 'Deadlines' },
      { name: 'Meera', emoji: '📊', strength: 'Planning & organization', weakness: 'Technical skills' },
      { name: 'Rahul', emoji: '🗣️', strength: 'Communication & presenting', weakness: 'Detail work' },
    ],
    tasks: [
      { label: 'Build the backend API', bestFit: 0, traits: { analytical: 15, technical: 20, leadership: 10 } },
      { label: 'Design the user interface', bestFit: 1, traits: { creative: 20, detail_oriented: 10, empathy: 10 } },
      { label: 'Create the project timeline', bestFit: 2, traits: { detail_oriented: 20, analytical: 10, leadership: 10 } },
      { label: 'Present to the school committee', bestFit: 3, traits: { communication: 20, leadership: 10, empathy: 10 } },
    ],
    followUp: {
      question: 'Arjun says he can\'t meet the design deadline. What do you do?',
      options: [
        { label: 'Reassign part of his work to someone with bandwidth', traits: { leadership: 20, analytical: 10, adaptability: 15 } },
        { label: 'Talk to him privately to understand the issue and help prioritize', traits: { empathy: 25, communication: 15, leadership: 10 } },
        { label: 'Extend the deadline and adjust the project timeline', traits: { adaptability: 20, detail_oriented: 15, empathy: 10 } },
        { label: 'Pair him with Priya so they can collaborate and speed up', traits: { creative: 15, leadership: 20, communication: 10 } },
      ],
    },
  },
  {
    id: 'tl2',
    scenario: 'Your team must organize a fundraiser for a local NGO. Who handles what?',
    emoji: '🎪',
    team: [
      { name: 'Kavya', emoji: '📱', strength: 'Social media & marketing', weakness: 'Budget tracking' },
      { name: 'Dev', emoji: '🧮', strength: 'Numbers & budgeting', weakness: 'Creativity' },
      { name: 'Ananya', emoji: '🤝', strength: 'Networking & persuasion', weakness: 'Patience with data' },
      { name: 'Vikram', emoji: '🎭', strength: 'Entertainment & stage management', weakness: 'Organization' },
    ],
    tasks: [
      { label: 'Handle social media promotions', bestFit: 0, traits: { communication: 20, creative: 10, technical: 10 } },
      { label: 'Manage the budget and sponsorships', bestFit: 1, traits: { analytical: 20, detail_oriented: 15, leadership: 5 } },
      { label: 'Reach out to local businesses for support', bestFit: 2, traits: { communication: 15, empathy: 15, leadership: 10 } },
      { label: 'Plan the entertainment and activities', bestFit: 3, traits: { creative: 20, adaptability: 10, empathy: 10 } },
    ],
    followUp: {
      question: 'Two team members disagree on how to spend the budget. How do you handle it?',
      options: [
        { label: 'Listen to both sides and make a final call based on the NGO\'s mission', traits: { leadership: 25, empathy: 15, analytical: 10 } },
        { label: 'Create a spreadsheet comparing both proposals with pros and cons', traits: { analytical: 25, detail_oriented: 15, technical: 5 } },
        { label: 'Split the budget so both ideas get partial funding', traits: { adaptability: 20, empathy: 15, leadership: 10 } },
        { label: 'Ask the NGO what they need most and let that decide', traits: { communication: 20, empathy: 20, adaptability: 10 } },
      ],
    },
  },
  {
    id: 'tl3',
    scenario: 'You\'re leading a science fair project. Your team needs to research, build, and present. Delegate wisely!',
    emoji: '🔬',
    team: [
      { name: 'Sneha', emoji: '📚', strength: 'Research & writing', weakness: 'Hands-on building' },
      { name: 'Aditya', emoji: '🔧', strength: 'Building & prototyping', weakness: 'Writing reports' },
      { name: 'Riya', emoji: '🎤', strength: 'Public speaking & storytelling', weakness: 'Technical details' },
      { name: 'Karthik', emoji: '📐', strength: 'Data analysis & testing', weakness: 'Team coordination' },
    ],
    tasks: [
      { label: 'Research background literature', bestFit: 0, traits: { analytical: 15, detail_oriented: 20, technical: 10 } },
      { label: 'Build the working prototype', bestFit: 1, traits: { technical: 20, creative: 10, adaptability: 10 } },
      { label: 'Prepare and deliver the presentation', bestFit: 2, traits: { communication: 25, leadership: 10, creative: 10 } },
      { label: 'Run experiments and analyze data', bestFit: 3, traits: { analytical: 25, technical: 10, detail_oriented: 10 } },
    ],
    followUp: {
      question: 'The prototype breaks during testing, 2 days before the fair. What\'s your plan?',
      options: [
        { label: 'Call an emergency meeting, redistribute tasks to fix it fast', traits: { leadership: 25, adaptability: 15, communication: 10 } },
        { label: 'Diagnose the failure methodically and fix root cause', traits: { analytical: 25, technical: 15, detail_oriented: 10 } },
        { label: 'Pivot the presentation to focus on the research and learnings', traits: { adaptability: 25, creative: 15, communication: 10 } },
        { label: 'Encourage the team, split into shifts, and work around the clock', traits: { leadership: 15, empathy: 20, adaptability: 15 } },
      ],
    },
  },
  {
    id: 'tl4',
    scenario: 'Your startup team is launching a product next week. Crunch time! Assign the final sprint tasks.',
    emoji: '🚀',
    team: [
      { name: 'Zara', emoji: '✍️', strength: 'Copywriting & content', weakness: 'Technical debugging' },
      { name: 'Nikhil', emoji: '🛠️', strength: 'Full-stack development', weakness: 'Design sense' },
      { name: 'Ishaan', emoji: '📈', strength: 'Marketing & growth', weakness: 'Patience with code' },
      { name: 'Tanvi', emoji: '🧪', strength: 'QA & testing', weakness: 'Creative tasks' },
    ],
    tasks: [
      { label: 'Write the launch announcement and landing page copy', bestFit: 0, traits: { communication: 20, creative: 15, empathy: 5 } },
      { label: 'Fix the remaining bugs and deploy', bestFit: 1, traits: { technical: 25, analytical: 10, detail_oriented: 10 } },
      { label: 'Set up marketing campaigns and outreach', bestFit: 2, traits: { communication: 15, creative: 10, leadership: 15 } },
      { label: 'Run final QA tests on all features', bestFit: 3, traits: { detail_oriented: 25, analytical: 10, technical: 10 } },
    ],
    followUp: {
      question: 'A critical security vulnerability is found 24 hours before launch. What do you decide?',
      options: [
        { label: 'Delay the launch — user safety comes first', traits: { leadership: 20, empathy: 15, detail_oriented: 15 } },
        { label: 'Patch it overnight with the dev team and launch on time', traits: { adaptability: 20, technical: 15, leadership: 15 } },
        { label: 'Launch with a temporary fix and patch fully in week 1', traits: { analytical: 15, adaptability: 20, creative: 10 } },
        { label: 'Communicate transparently to early users about the delay', traits: { communication: 25, empathy: 15, leadership: 10 } },
      ],
    },
  },
  {
    id: 'tl5',
    scenario: 'You\'re a camp counselor leading a team-building day. Plan the activities by assigning roles.',
    emoji: '🏕️',
    team: [
      { name: 'Aarav', emoji: '🏃', strength: 'Sports & physical activities', weakness: 'Quiet activities' },
      { name: 'Diya', emoji: '🎨', strength: 'Arts & crafts', weakness: 'Competitive games' },
      { name: 'Rohan', emoji: '🧭', strength: 'Navigation & strategy', weakness: 'Artistic tasks' },
      { name: 'Sia', emoji: '🎶', strength: 'Music & bonfire songs', weakness: 'Physical challenges' },
    ],
    tasks: [
      { label: 'Lead the morning obstacle course', bestFit: 0, traits: { leadership: 15, adaptability: 15, empathy: 10 } },
      { label: 'Run the craft workshop', bestFit: 1, traits: { creative: 25, empathy: 10, communication: 5 } },
      { label: 'Organize the treasure hunt with map', bestFit: 2, traits: { analytical: 20, leadership: 10, creative: 10 } },
      { label: 'Plan the evening bonfire program', bestFit: 3, traits: { creative: 15, communication: 15, empathy: 15 } },
    ],
    followUp: {
      question: 'Rain forces all outdoor activities indoors. How do you adapt?',
      options: [
        { label: 'Quickly brainstorm indoor alternatives with the whole team', traits: { adaptability: 25, creative: 15, leadership: 10 } },
        { label: 'Have backup plans ready — you always prepare for this', traits: { detail_oriented: 25, analytical: 15, leadership: 10 } },
        { label: 'Turn it into an improv storytelling session instead', traits: { creative: 25, communication: 15, adaptability: 10 } },
        { label: 'Let each team member lead their own indoor mini-activity', traits: { empathy: 20, leadership: 20, adaptability: 10 } },
      ],
    },
  },
];

type Phase = 'intro' | 'delegate' | 'followup' | 'round_result' | 'complete';

interface RoundScore {
  delegationScore: number;
  followUpTraits: Partial<TraitScores>;
  delegationTraits: Partial<TraitScores>;
}

export default function TeamLeader() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [assignments, setAssignments] = useState<Record<number, number>>({}); // taskIdx → memberIdx
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();

  const challenge = challenges[currentChallenge];

  const handleAssign = (taskIdx: number, memberIdx: number) => {
    setAssignments((prev) => ({ ...prev, [taskIdx]: memberIdx }));
  };

  const handleSubmitDelegation = () => {
    if (Object.keys(assignments).length < challenge.tasks.length) return;
    setPhase('followup');
  };

  const handleFollowUp = (optionIdx: number) => {
    const opt = challenge.followUp.options[optionIdx];
    // Score delegation
    const delegationTraits: Record<string, number> = {};
    let correctAssignments = 0;
    challenge.tasks.forEach((task, tIdx) => {
      const assignedMember = assignments[tIdx];
      if (assignedMember === task.bestFit) {
        correctAssignments++;
        Object.entries(task.traits).forEach(([k, v]) => {
          delegationTraits[k] = (delegationTraits[k] || 0) + (v as number);
        });
      } else {
        // Partial credit
        Object.entries(task.traits).forEach(([k, v]) => {
          delegationTraits[k] = (delegationTraits[k] || 0) + Math.round((v as number) * 0.4);
        });
      }
    });
    // Bonus for perfect delegation
    if (correctAssignments === challenge.tasks.length) {
      delegationTraits['leadership'] = (delegationTraits['leadership'] || 0) + 15;
      delegationTraits['analytical'] = (delegationTraits['analytical'] || 0) + 10;
    }

    const score: RoundScore = {
      delegationScore: correctAssignments,
      followUpTraits: opt.traits,
      delegationTraits: delegationTraits as Partial<TraitScores>,
    };
    const newScores = [...roundScores, score];
    setRoundScores(newScores);

    if (currentChallenge + 1 >= challenges.length) {
      // Calculate final traits
      const totals: Record<string, number> = {};
      newScores.forEach((s) => {
        Object.entries(s.delegationTraits).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + (v as number); });
        Object.entries(s.followUpTraits).forEach(([k, v]) => { totals[k] = (totals[k] || 0) + (v as number); });
      });
      const maxPossible = challenges.length * 45;
      const calculated: TraitScores = {
        analytical: Math.min(100, Math.round(((totals.analytical || 0) / maxPossible) * 100)),
        creative: Math.min(100, Math.round(((totals.creative || 0) / maxPossible) * 100)),
        leadership: Math.min(100, Math.round(((totals.leadership || 0) / maxPossible) * 100)),
        empathy: Math.min(100, Math.round(((totals.empathy || 0) / maxPossible) * 100)),
        technical: Math.min(100, Math.round(((totals.technical || 0) / maxPossible) * 100)),
        communication: Math.min(100, Math.round(((totals.communication || 0) / maxPossible) * 100)),
        adaptability: Math.min(100, Math.round(((totals.adaptability || 0) / maxPossible) * 100)),
        detail_oriented: Math.min(100, Math.round(((totals.detail_oriented || 0) / maxPossible) * 100)),
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
      setPhase('round_result');
    }
  };

  const nextChallenge = () => {
    setCurrentChallenge((c) => c + 1);
    setAssignments({});
    setPhase('delegate');
  };

  if (phase === 'complete' && traits) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">👑</div>
          <h2 className="text-2xl font-bold text-white mb-2">Team Leader Complete!</h2>
          <p className="text-primary-200 mb-1">You led {challenges.length} teams through challenges.</p>
          <p className="text-white/50 text-sm mb-4">
            Perfect delegations: {roundScores.filter((s) => s.delegationScore === 4).length}/{challenges.length}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar
                key={trait}
                label={trait.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={val}
                color={val >= 60 ? 'bg-amber-500' : 'bg-white/30'}
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
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-white mb-3">Team Leader</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Lead teams through challenges by delegating tasks to the right people and handling conflicts.
          </p>
          <p className="text-white/50 text-sm mb-6">
            Measures: Interpersonal (Gardner) + Social/Enterprising (RIASEC) + Leadership traits
          </p>
          <p className="text-white/40 text-xs mb-6">~8 minutes · {challenges.length} challenges</p>
          <Button size="lg" onClick={() => setPhase('delegate')}>Start Leading 👑</Button>
        </Card>
      </div>
    );
  }

  if (phase === 'round_result') {
    const last = roundScores[roundScores.length - 1];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ProgressBar value={currentChallenge + 1} max={challenges.length} label={`Challenge ${currentChallenge + 1} of ${challenges.length}`} />
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">{last.delegationScore === 4 ? '🌟' : '💪'}</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {last.delegationScore === 4 ? 'Perfect Delegation!' : 'Challenge Complete!'}
          </h2>
          <p className="text-primary-200 mb-1">
            Correct assignments: {last.delegationScore}/{challenge.tasks.length}
          </p>
          <p className="text-white/50 text-sm mb-6">Each wrong assignment reveals something about your thinking too.</p>
          <Button onClick={nextChallenge}>Next Challenge →</Button>
        </Card>
      </div>
    );
  }

  // Delegation & followup phases
  const usedMembers = new Set(Object.values(assignments));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">👑 Team Leader</h1>
        <p className="text-primary-200 text-sm">Delegate tasks and handle team dynamics</p>
      </div>
      <ProgressBar value={currentChallenge + 1} max={challenges.length} label={`Challenge ${currentChallenge + 1} of ${challenges.length}`} />

      <Card>
        <div className="text-center mb-4">
          <span className="text-4xl">{challenge.emoji}</span>
        </div>
        <p className="text-white text-lg font-medium mb-4 text-center">{challenge.scenario}</p>

        {/* Team members */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {challenge.team.map((m, idx) => (
            <div key={idx} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white text-sm font-medium">{m.emoji} {m.name}</p>
              <p className="text-green-300/70 text-xs">✓ {m.strength}</p>
              <p className="text-red-300/50 text-xs">✗ {m.weakness}</p>
            </div>
          ))}
        </div>

        {phase === 'delegate' && (
          <div className="space-y-4">
            <p className="text-white/70 text-sm font-medium">Assign each task to a team member:</p>
            {challenge.tasks.map((task, tIdx) => (
              <div key={tIdx} className="flex items-center gap-3">
                <p className="text-white/80 text-sm flex-1">{task.label}</p>
                <div className="flex gap-1">
                  {challenge.team.map((m, mIdx) => {
                    const isAssigned = assignments[tIdx] === mIdx;
                    const isUsedElsewhere = usedMembers.has(mIdx) && !isAssigned;
                    return (
                      <button
                        key={mIdx}
                        onClick={() => handleAssign(tIdx, mIdx)}
                        disabled={isUsedElsewhere}
                        className={`w-10 h-10 rounded-lg text-lg transition-all ${
                          isAssigned
                            ? 'bg-primary-600/40 border-2 border-primary-500 scale-110'
                            : isUsedElsewhere
                            ? 'bg-white/5 border border-white/5 opacity-30 cursor-not-allowed'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        title={m.name}
                      >
                        {m.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button onClick={handleSubmitDelegation} disabled={Object.keys(assignments).length < challenge.tasks.length}>
                Confirm Assignments →
              </Button>
            </div>
          </div>
        )}

        {phase === 'followup' && (
          <div className="space-y-4">
            <div className="px-3 py-2 rounded-lg bg-amber-600/10 border border-amber-500/20">
              <p className="text-amber-300 text-sm font-medium">{challenge.followUp.question}</p>
            </div>
            <div className="space-y-3">
              {challenge.followUp.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFollowUp(idx)}
                  className="w-full text-left px-4 py-4 rounded-xl border bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
