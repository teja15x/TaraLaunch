'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { careerDatabase } from '@/data/careers';
import {
  CAREER_REALITY_ENGINE,
  COLLEGE_EMPLOYER_KNOWLEDGE,
  JOURNEY_TRACKS,
  PARENT_TRANSLATOR_LIBRARY,
  RISK_RESCUE_MODES,
  STATE_CAREER_ROADMAPS,
} from '@/data/guidance';
import {
  GUIDANCE_FEEDBACK_STORAGE_KEY,
  GUIDANCE_PLANS_STORAGE_KEY,
  buildCareerFitReasons,
  buildWeeklyMission,
  bumpGuidanceMetric,
  getDefaultGuidanceMetrics,
  normalizeRoleForKnowledge,
} from '@/lib/guidance';
import { useAppStore } from '@/store';
import type {
  GuidanceMetrics,
  JourneyAudience,
  RiskLevel,
  WeeklyMission,
} from '@/types/guidance';
import type { TraitScores } from '@/types';

const audienceLabels: Record<JourneyAudience, string> = {
  'school-student': 'School student',
  'college-student': 'College student',
  graduate: 'Graduate',
  parent: 'Parent',
};

const riskLabels: Record<RiskLevel, string> = {
  low: 'Low pressure',
  medium: 'Moderate pressure',
  high: 'High pressure',
};

function savePlan(plan: WeeklyMission) {
  if (typeof window === 'undefined') return;
  const existing = JSON.parse(window.localStorage.getItem(GUIDANCE_PLANS_STORAGE_KEY) ?? '[]') as WeeklyMission[];
  window.localStorage.setItem(GUIDANCE_PLANS_STORAGE_KEY, JSON.stringify([plan, ...existing].slice(0, 8)));
}

function saveFeedback(entry: { rating: number; note: string; timestamp: string }) {
  if (typeof window === 'undefined') return;
  const existing = JSON.parse(window.localStorage.getItem(GUIDANCE_FEEDBACK_STORAGE_KEY) ?? '[]') as Array<{ rating: number; note: string; timestamp: string }>;
  window.localStorage.setItem(GUIDANCE_FEEDBACK_STORAGE_KEY, JSON.stringify([entry, ...existing].slice(0, 20)));
}

export function GuidanceHub() {
  const { traitScores } = useAppStore();
  const [audience, setAudience] = useState<JourneyAudience>('school-student');
  const [selectedRealityId, setSelectedRealityId] = useState(CAREER_REALITY_ENGINE[0].id);
  const [selectedState, setSelectedState] = useState(STATE_CAREER_ROADMAPS[0].state);
  const [selectedStream, setSelectedStream] = useState(STATE_CAREER_ROADMAPS[0].stream);
  const [selectedRoadmapRole, setSelectedRoadmapRole] = useState(STATE_CAREER_ROADMAPS[0].targetRole);
  const [selectedKnowledgeRole, setSelectedKnowledgeRole] = useState(COLLEGE_EMPLOYER_KNOWLEDGE[0].role);
  const [selectedRiskId, setSelectedRiskId] = useState(RISK_RESCUE_MODES[0].id);
  const [planGoal, setPlanGoal] = useState('Get clear on a realistic target role and next 30 days');
  const [planRisk, setPlanRisk] = useState<RiskLevel>('medium');
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyMission | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [metrics, setMetrics] = useState<GuidanceMetrics>(getDefaultGuidanceMetrics());
  const [savedPlansCount, setSavedPlansCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    setMetrics(bumpGuidanceMetric('hubVisits'));

    if (typeof window !== 'undefined') {
      const plans = JSON.parse(window.localStorage.getItem(GUIDANCE_PLANS_STORAGE_KEY) ?? '[]') as WeeklyMission[];
      const feedbackEntries = JSON.parse(window.localStorage.getItem(GUIDANCE_FEEDBACK_STORAGE_KEY) ?? '[]') as Array<{ rating: number }>;
      setSavedPlansCount(plans.length);
      setFeedbackCount(feedbackEntries.length);
    }
  }, []);

  const roleOptions = useMemo(() => {
    const knowledgeRoles = COLLEGE_EMPLOYER_KNOWLEDGE.map((item) => item.role);
    const databaseRoles = careerDatabase.slice(0, 12).map((item) => item.title);
    return Array.from(new Set([...knowledgeRoles, ...databaseRoles]));
  }, []);

  const realityOptions = useMemo(
    () => CAREER_REALITY_ENGINE.filter((item) => item.audience === 'all' || item.audience === audience),
    [audience]
  );

  useEffect(() => {
    if (!realityOptions.find((item) => item.id === selectedRealityId)) {
      setSelectedRealityId(realityOptions[0]?.id ?? CAREER_REALITY_ENGINE[0].id);
    }
  }, [realityOptions, selectedRealityId]);

  const selectedReality = realityOptions.find((item) => item.id === selectedRealityId) ?? realityOptions[0];

  const roadmapStates = Array.from(new Set(STATE_CAREER_ROADMAPS.map((item) => item.state)));
  const streamOptions = Array.from(
    new Set(STATE_CAREER_ROADMAPS.filter((item) => item.state === selectedState).map((item) => item.stream))
  );

  useEffect(() => {
    if (!streamOptions.includes(selectedStream)) {
      setSelectedStream(streamOptions[0] ?? selectedStream);
    }
  }, [selectedState, selectedStream, streamOptions]);

  const roadmapRoleOptions = Array.from(
    new Set(
      STATE_CAREER_ROADMAPS
        .filter((item) => item.state === selectedState && item.stream === selectedStream)
        .map((item) => item.targetRole)
    )
  );

  useEffect(() => {
    if (!roadmapRoleOptions.includes(selectedRoadmapRole)) {
      setSelectedRoadmapRole(roadmapRoleOptions[0] ?? selectedRoadmapRole);
    }
  }, [roadmapRoleOptions, selectedRoadmapRole]);

  const selectedRoadmap =
    STATE_CAREER_ROADMAPS.find(
      (item) => item.state === selectedState && item.stream === selectedStream && item.targetRole === selectedRoadmapRole
    ) ?? STATE_CAREER_ROADMAPS[0];

  const normalizedKnowledgeRole = normalizeRoleForKnowledge(selectedKnowledgeRole, COLLEGE_EMPLOYER_KNOWLEDGE);
  const selectedKnowledge = COLLEGE_EMPLOYER_KNOWLEDGE.find((item) => item.role === normalizedKnowledgeRole) ?? COLLEGE_EMPLOYER_KNOWLEDGE[0];
  const selectedRisk = RISK_RESCUE_MODES.find((item) => item.id === selectedRiskId) ?? RISK_RESCUE_MODES[0];

  const explainabilityTarget = useMemo(() => {
    const title = normalizeRoleForKnowledge(selectedKnowledgeRole, COLLEGE_EMPLOYER_KNOWLEDGE);
    return careerDatabase.find((item) => item.title.toLowerCase() === title.toLowerCase()) ?? careerDatabase[0];
  }, [selectedKnowledgeRole]);

  const explainabilityReasons = useMemo(() => {
    if (!traitScores) return [];

    return buildCareerFitReasons(
      explainabilityTarget.title,
      explainabilityTarget.required_traits,
      traitScores,
      explainabilityTarget.education_path[0],
      explainabilityTarget.required_skills
    );
  }, [explainabilityTarget, traitScores]);

  const topTraits = useMemo(() => {
    if (!traitScores) return [];
    return (Object.entries(traitScores) as [keyof TraitScores, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [traitScores]);

  const handleRoadmapView = () => {
    setMetrics(bumpGuidanceMetric('roadmapViews'));
  };

  const handleKnowledgeView = () => {
    setMetrics(bumpGuidanceMetric('knowledgeViews'));
  };

  const handleRiskView = () => {
    setMetrics(bumpGuidanceMetric('rescueChecks'));
  };

  const handleParentView = () => {
    setMetrics(bumpGuidanceMetric('parentTranslationsViewed'));
  };

  const handleExplainabilityView = () => {
    setMetrics(bumpGuidanceMetric('explainabilityViews'));
  };

  const createPlan = () => {
    const nextPlan = buildWeeklyMission(planGoal, audience, planRisk);
    setGeneratedPlan(nextPlan);
    setMetrics(bumpGuidanceMetric('plansCreated'));
  };

  const persistPlan = () => {
    if (!generatedPlan) return;
    savePlan(generatedPlan);
    setSavedPlansCount((current) => current + 1);
    setMetrics(bumpGuidanceMetric('savedPlans'));
  };

  const submitFeedback = () => {
    const entry = {
      rating: feedbackRating,
      note: feedbackNote.trim(),
      timestamp: new Date().toISOString(),
    };

    saveFeedback(entry);
    const positiveIncrement = feedbackRating >= 4 ? 1 : 0;
    let nextMetrics = bumpGuidanceMetric('feedbackSubmissions');
    if (positiveIncrement > 0) {
      nextMetrics = bumpGuidanceMetric('positiveFeedback');
    }
    setMetrics(nextMetrics);
    setFeedbackCount((current) => current + 1);
    setFeedbackNote('');
    setFeedbackRating(5);
  };

  const successRate = metrics.feedbackSubmissions > 0
    ? Math.round((metrics.positiveFeedback / metrics.feedbackSubmissions) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_35%),rgba(15,23,42,0.9)] p-8">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Startup guidance layer</span>
          <h1 className="text-3xl font-bold text-white md:text-4xl">Build the support system around the agent, not on top of it.</h1>
          <p className="text-white/70">
            This hub adds the product pieces you asked for: career reality, state roadmaps, college and employer knowledge, parent support, risk rescue, weekly accountability, explainability, evaluation capture, and outcome metrics.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/chat" className="inline-flex">
              <Button>Go to Agent</Button>
            </Link>
            <Link href="/results" className="inline-flex">
              <Button variant="secondary">See Results</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {JOURNEY_TRACKS.map((track) => (
          <Card
            key={track.id}
            hover
            onClick={() => setAudience(track.audience)}
            className={audience === track.audience ? 'border-primary-500/50 bg-primary-600/10' : ''}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">{track.stage}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{track.title}</h2>
              </div>
              <p className="text-sm text-white/65">{track.focus}</p>
              <div className="space-y-1">
                {track.outcomes.map((outcome) => (
                  <div key={outcome} className="text-xs text-white/55">• {outcome}</div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Career reality engine</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">What students actually need to hear</h2>
            </div>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-300">Audience: {audienceLabels[audience]}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {realityOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedRealityId(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${selectedReality?.id === item.id ? 'border-primary-400 bg-primary-600/20 text-white' : 'border-white/10 bg-white/5 text-white/55 hover:text-white/75'}`}
              >
                {item.title}
              </button>
            ))}
          </div>
          {selectedReality && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-primary-300">{selectedReality.theme}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{selectedReality.title}</h3>
              <p className="mt-3 text-white/70">{selectedReality.reality}</p>
              <p className="mt-3 text-sm text-white/55">{selectedReality.whyItMatters}</p>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {selectedReality.actionSteps.map((step) => (
                  <div key={step} className="rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm text-white/70">{step}</div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-600/10 p-3 text-sm text-emerald-200">
                {selectedReality.hopefulTruth}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Risk and rescue</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Catch trouble before it becomes dropout energy</h2>
          <div className="mt-5 space-y-2">
            {RISK_RESCUE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedRiskId(mode.id);
                  handleRiskView();
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedRisk.id === mode.id ? 'border-rose-400/40 bg-rose-600/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{mode.label}</span>
                  <span className="text-xs text-white/45">mode</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{mode.signals[0]}</p>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-5">
            <h3 className="text-lg font-semibold text-white">{selectedRisk.label}</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Signals</p>
                <div className="mt-2 space-y-2 text-sm text-white/65">
                  {selectedRisk.signals.map((signal) => <div key={signal}>• {signal}</div>)}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Rescue plan</p>
                <div className="mt-2 space-y-2 text-sm text-white/65">
                  {selectedRisk.rescuePlan.map((step) => <div key={step}>• {step}</div>)}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-600/10 p-3 text-sm text-rose-200">
              Check-in question: {selectedRisk.checkInQuestion}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">State roadmaps</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Stream to role roadmaps by state context</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={handleRoadmapView}>Track view</Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <select value={selectedState} onChange={(event) => setSelectedState(event.target.value)} className="rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {roadmapStates.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            <select value={selectedStream} onChange={(event) => setSelectedStream(event.target.value)} className="rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {streamOptions.map((stream) => <option key={stream} value={stream}>{stream}</option>)}
            </select>
            <select value={selectedRoadmapRole} onChange={(event) => setSelectedRoadmapRole(event.target.value)} className="rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {roadmapRoleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Entrance and route</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                {selectedRoadmap.entrances.map((entry) => <div key={entry}>• {entry}</div>)}
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/65">
                {selectedRoadmap.courseRoutes.map((route) => <div key={route}>• {route}</div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Timeline</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                {selectedRoadmap.timeline.map((step) => <div key={step}>• {step}</div>)}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">College strategy</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                {selectedRoadmap.collegeStrategy.map((step) => <div key={step}>• {step}</div>)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Reality checks and backups</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">
                {selectedRoadmap.realityChecks.map((check) => <div key={check}>• {check}</div>)}
                {selectedRoadmap.backupPaths.map((path) => <div key={path}>• Backup: {path}</div>)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href={`/chat?role=${encodeURIComponent(selectedRoadmap.targetRole)}`} className="inline-flex">
              <Button>Open Agent With This Role</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">College and employer knowledge</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Role reality beyond course names</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={handleKnowledgeView}>Track view</Button>
          </div>
          <div className="mt-5">
            <select value={selectedKnowledgeRole} onChange={(event) => setSelectedKnowledgeRole(event.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold text-white">{selectedKnowledge.role}</h3>
            <div className="mt-3 space-y-3 text-sm text-white/65">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Degree paths</p>
                <div className="mt-2 space-y-1">{selectedKnowledge.degreePaths.map((path) => <div key={path}>• {path}</div>)}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Employer types</p>
                <div className="mt-2 flex flex-wrap gap-2">{selectedKnowledge.employerTypes.map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{item}</span>)}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {selectedKnowledge.tierBreakdown.map((tier) => (
              <div key={tier.tier} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{tier.tier}</span>
                  <span className="text-xs text-white/45">{tier.label}</span>
                </div>
                <p className="mt-2 text-sm text-white/65">{tier.outcomes}</p>
                <p className="mt-2 text-sm text-amber-200">Watchout: {tier.watchouts}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Common salary bands</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">{selectedKnowledge.salaryBands.map((band) => <div key={band.label}>• {band.label}: {band.range}</div>)}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">First job reality</p>
              <div className="mt-3 space-y-2 text-sm text-white/65">{selectedKnowledge.firstJobReality.map((line) => <div key={line}>• {line}</div>)}</div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Parent pressure translator</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Turn pressure into useful support</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={handleParentView}>Track view</Button>
          </div>
          <div className="mt-5 space-y-3">
            {PARENT_TRANSLATOR_LIBRARY.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{item.situation}</p>
                <p className="mt-2 text-sm text-rose-200">Student hears: {item.studentInterpretation}</p>
                <p className="mt-2 text-sm text-white/65">Better move: {item.betterMessage}</p>
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-600/10 p-3 text-sm text-emerald-100">&ldquo;{item.starterScript}&rdquo;</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Weekly accountability</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Create a plan that survives real life</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <select value={audience} onChange={(event) => setAudience(event.target.value as JourneyAudience)} className="rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {Object.entries(audienceLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <select value={planRisk} onChange={(event) => setPlanRisk(event.target.value as RiskLevel)} className="rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none">
              {Object.entries(riskLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <textarea
            value={planGoal}
            onChange={(event) => setPlanGoal(event.target.value)}
            rows={3}
            className="mt-3 w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            placeholder="What should this plan help the student achieve?"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={createPlan}>Generate 4-week plan</Button>
            <Button variant="secondary" onClick={persistPlan} disabled={!generatedPlan}>Save plan locally</Button>
          </div>
          {generatedPlan && (
            <div className="mt-5 space-y-3">
              {generatedPlan.weeks.map((week) => (
                <div key={week.week} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">Week {week.week}: {week.theme}</h3>
                    <span className="text-xs text-white/45">{riskLabels[generatedPlan.riskLevel]}</span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/65">
                    {week.actions.map((action) => <div key={action}>• {action}</div>)}
                  </div>
                  <div className="mt-3 rounded-xl border border-primary-500/20 bg-primary-600/10 p-3 text-sm text-primary-100">
                    Success signal: {week.successSignal}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Trust and explainability</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Why a role fits, in plain language</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExplainabilityView}>Track view</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {roleOptions.slice(0, 8).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedKnowledgeRole(role)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${selectedKnowledgeRole === role ? 'border-primary-400 bg-primary-600/20 text-white' : 'border-white/10 bg-white/5 text-white/55 hover:text-white/75'}`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl font-semibold text-white">{explainabilityTarget.title}</h3>
            {traitScores ? (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topTraits.map(([trait, score]) => (
                    <span key={trait} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                      {trait.replace('_', ' ')}: {score}%
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  {explainabilityReasons.map((reason) => <div key={reason}>• {reason}</div>)}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/60">Play the assessment games to unlock trait-based explainability here.</p>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Evaluation and startup metrics</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Capture feedback and measure real help</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Guidance hub visits</p>
              <p className="mt-2 text-3xl font-bold text-white">{metrics.hubVisits}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Plans saved</p>
              <p className="mt-2 text-3xl font-bold text-white">{savedPlansCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Feedback entries</p>
              <p className="mt-2 text-3xl font-bold text-white">{feedbackCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Positive feedback rate</p>
              <p className="mt-2 text-3xl font-bold text-white">{successRate}%</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-white/65">
              <p className="font-medium text-white">Operational signals</p>
              <div className="mt-3 space-y-2">
                <div>• Roadmap views: {metrics.roadmapViews}</div>
                <div>• Knowledge views: {metrics.knowledgeViews}</div>
                <div>• Rescue checks: {metrics.rescueChecks}</div>
                <div>• Parent translator views: {metrics.parentTranslationsViewed}</div>
                <div>• Explainability views: {metrics.explainabilityViews}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-white/65">
              <p className="font-medium text-white">Outcome mindset</p>
              <div className="mt-3 space-y-2">
                <div>• Are students clearer after one session?</div>
                <div>• Are they saving plans and coming back?</div>
                <div>• Are parents moving from pressure to support?</div>
                <div>• Are confused users entering a rescue flow instead of dropping off?</div>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">How useful was this guidance hub?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setFeedbackRating(value)}
                  className={`h-11 w-11 rounded-full border text-sm font-semibold transition ${feedbackRating === value ? 'border-primary-400 bg-primary-600/20 text-white' : 'border-white/10 bg-slate-950/40 text-white/65'}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackNote}
              onChange={(event) => setFeedbackNote(event.target.value)}
              rows={3}
              placeholder="What helped, what confused you, or what the startup should add next"
              className="mt-3 w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            />
            <div className="mt-3">
              <Button onClick={submitFeedback}>Save feedback</Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}