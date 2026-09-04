'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getExperienceById } from '@/data/tara/experiences';
import {
  createHypothesisFromEvidence,
  createId,
  createJourneyEventsFromExperience,
  createNextActionFromEvidence,
  createTaraMomentFromEvidence,
  generateEvidenceFromAttempt,
  nowIso,
} from '@/lib/tara/model';
import type { ExperienceAttempt, ReflectionRecord } from '@/lib/tara/types';
import { useTaraStore } from '@/store/tara';

export default function ExperienceDetailPage() {
  const params = useParams<{ experienceId: string }>();
  const router = useRouter();
  const [reflection, setReflection] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const {
    activeAttempt,
    setActiveAttempt,
    addEvidence,
    addHypothesis,
    addJourneyEvents,
    addNextAction,
    addReflection,
    addTaraMoment,
    upsertMemory,
  } = useTaraStore((state) => ({
    activeAttempt: state.activeAttempt,
    setActiveAttempt: state.setActiveAttempt,
    addEvidence: state.addEvidence,
    addHypothesis: state.addHypothesis,
    addJourneyEvents: state.addJourneyEvents,
    addNextAction: state.addNextAction,
    addReflection: state.addReflection,
    addTaraMoment: state.addTaraMoment,
    upsertMemory: state.upsertMemory,
  }));

  const experience = useMemo(() => getExperienceById(params.experienceId), [params.experienceId]);

  const attempt = useMemo(() => {
    if (!experience) return null;
    if (activeAttempt?.experienceId === experience.id) return activeAttempt;

    const freshAttempt: ExperienceAttempt = {
      id: createId('attempt'),
      experienceId: experience.id,
      startedAt: nowIso(),
      updatedAt: nowIso(),
      currentStepId: experience.steps[0]?.id || '',
      worldState: {},
      decisions: [],
    };

    setActiveAttempt(freshAttempt);
    return freshAttempt;
  }, [activeAttempt, experience, setActiveAttempt]);

  if (!experience || !attempt) {
    return (
      <TaraPageShell title="Experience" subtitle="Experience not found.">
        <Link href="/experience"><Button>Back</Button></Link>
      </TaraPageShell>
    );
  }

  const currentStep = experience.steps.find((step) => step.id === attempt.currentStepId) || experience.steps[0];
  const reachedReflection = !currentStep || currentStep.choices.length === 0;

  const handleChoice = (choiceId: string) => {
    if (!currentStep) return;
    const choice = currentStep.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const nextAttempt: ExperienceAttempt = {
      ...attempt,
      updatedAt: nowIso(),
      currentStepId: choice.nextStepId || attempt.currentStepId,
      worldState: { ...attempt.worldState, ...(choice.worldStatePatch || {}) },
      decisions: [
        ...attempt.decisions,
        {
          stepId: currentStep.id,
          prompt: currentStep.prompt,
          choiceId: choice.id,
          choiceLabel: choice.label,
          consequence: choice.consequence,
          knownAtDecision: currentStep.knownContext,
        },
      ],
    };

    setActiveAttempt(nextAttempt);
  };

  const handleCompleteReflection = async () => {
    if (completed) return;

    const reflectionRecord: ReflectionRecord = {
      id: createId('reflection'),
      experienceId: experience.id,
      answers: reflection,
      createdAt: nowIso(),
    };

    addReflection(reflectionRecord);

    const finalizedAttempt: ExperienceAttempt = {
      ...attempt,
      completedAt: nowIso(),
      updatedAt: nowIso(),
    };

    const evidence = generateEvidenceFromAttempt(experience, finalizedAttempt, reflectionRecord);
    const hypothesis = createHypothesisFromEvidence(evidence);
    const fallbackMoment = createTaraMomentFromEvidence(evidence);
    const action = createNextActionFromEvidence(evidence);

    addEvidence(evidence);
    addHypothesis(hypothesis);
    addNextAction(action);
    addJourneyEvents(createJourneyEventsFromExperience(experience, evidence, action));

    upsertMemory({
      category: 'evidence',
      key: `${experience.id}_signal`,
      value: evidence.interpretation,
      confidence: evidence.confidence,
      source: 'experience',
    });

    try {
      const response = await fetch('/api/tara/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceSummary: evidence.evidence,
          hypothesisSummary: `${hypothesis.title} | ${hypothesis.unknown}`,
          language: 'en',
        }),
      });

      const data = await response.json();
      if (data.taraMoment) {
        addTaraMoment({ id: createId('moment'), text: data.taraMoment, createdAt: nowIso() });
      } else {
        addTaraMoment(fallbackMoment);
      }
    } catch {
      addTaraMoment(fallbackMoment);
    }

    setActiveAttempt(null);
    setCompleted(true);
  };

  return (
    <TaraPageShell
      title={experience.title}
      subtitle="CHOICE → CONSEQUENCE → REFLECTION → EVIDENCE"
    >
      <Card className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-white/60">Scenario</p>
        <p className="text-white/85">{experience.scenario}</p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">Decision Replay</h2>
        {attempt.decisions.length === 0 && <p className="text-white/60">No decisions yet.</p>}
        {attempt.decisions.map((decision, index) => (
          <div key={`${decision.stepId}-${decision.choiceId}-${index}`} className="rounded-2xl border border-white/15 bg-white/5 p-3 text-sm">
            <p className="text-white/70"><strong>What you knew:</strong> {decision.knownAtDecision}</p>
            <p className="mt-1 text-white/90"><strong>What you chose:</strong> {decision.choiceLabel}</p>
            <p className="mt-1 text-primary-100"><strong>What happened:</strong> {decision.consequence}</p>
          </div>
        ))}
      </Card>

      {!reachedReflection && currentStep && (
        <Card className="space-y-4">
          <p className="text-xs uppercase tracking-wider text-white/60">Current decision</p>
          <h3 className="text-xl font-semibold text-white">{currentStep.prompt}</h3>
          <p className="text-sm text-white/70">{currentStep.knownContext}</p>
          <div className="space-y-3">
            {currentStep.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="w-full rounded-2xl border border-white/20 bg-slate-950/50 p-4 text-left transition hover:border-primary-300/60"
              >
                <p className="text-white">{choice.label}</p>
                <p className="mt-2 text-sm text-white/70">Consequence preview: {choice.consequence}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {reachedReflection && !completed && (
        <Card className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Reflection</h3>
          {experience.reflectionQuestions.map((question) => (
            <div key={question} className="space-y-2">
              <p className="text-sm text-white/85">{question}</p>
              <textarea
                value={reflection[question] || ''}
                onChange={(event) =>
                  setReflection((previous) => ({
                    ...previous,
                    [question]: event.target.value,
                  }))
                }
                className="min-h-20 w-full rounded-xl border border-white/20 bg-slate-950/60 p-3 text-sm text-white outline-none"
              />
            </div>
          ))}
          <Button onClick={handleCompleteReflection}>Generate evidence and Tara Moment</Button>
        </Card>
      )}

      {completed && (
        <Card className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Cycle completed</h3>
          <p className="text-white/80">Evidence, Tara Moment, and a real-world next action were added to your journey.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/journey')}>Open Journey</Button>
            <Button variant="secondary" onClick={() => router.push('/next')}>Open Next Actions</Button>
          </div>
        </Card>
      )}
    </TaraPageShell>
  );
}
