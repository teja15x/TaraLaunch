import type {
  ConfidenceLevel,
  DecisionRecord,
  EvidenceRecord,
  ExperienceAttempt,
  ExperienceDefinition,
  HypothesisRecord,
  JourneyEvent,
  NextAction,
  ReflectionRecord,
  TaraMemory,
  TaraMessage,
  TaraMoment,
} from '@/lib/tara/types';

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

export function createInitialAssistantMessage(): TaraMessage {
  return {
    id: createId('msg'),
    role: 'assistant',
    content: "Hey. I'm Tara.\n\nWhat brought you here?",
    createdAt: nowIso(),
  };
}

function inferConfidence(decisions: DecisionRecord[], reflectionDepth: number): ConfidenceLevel {
  if (decisions.length >= 2 && reflectionDepth > 120) return 'building';
  if (decisions.length >= 3 && reflectionDepth > 220) return 'strong';
  return 'early-signal';
}

export function generateEvidenceFromAttempt(
  experience: ExperienceDefinition,
  attempt: ExperienceAttempt,
  reflection: ReflectionRecord
): EvidenceRecord {
  const observations = attempt.decisions.flatMap((decision) => {
    const step = experience.steps.find((candidate) => candidate.id === decision.stepId);
    const choice = step?.choices.find((candidate) => candidate.id === decision.choiceId);
    return choice?.observations ?? [];
  });

  const reflectionJoined = Object.values(reflection.answers).join(' ').trim();
  const confidence = inferConfidence(attempt.decisions, reflectionJoined.length);
  const uniqueObservations = Array.from(new Set(observations));

  const interpretation = uniqueObservations.includes('balanced trade-off handling')
    ? 'You showed potential product-style trade-off judgment by adapting decisions as constraints changed.'
    : uniqueObservations.includes('quality orientation')
      ? 'You leaned toward quality and long-term trust over short-term release pressure.'
      : uniqueObservations.includes('bias for action')
        ? 'You leaned toward speed and momentum even when uncertainty remained high.'
        : 'Your decisions reveal an early pattern in how you handle ambiguity and responsibility.';

  return {
    id: createId('evidence'),
    experienceId: experience.id,
    observation: uniqueObservations.length
      ? uniqueObservations.join(', ')
      : 'Decision behavior captured during simulation.',
    evidence: attempt.decisions
      .map((decision) => `${decision.choiceLabel} -> ${decision.consequence}`)
      .join(' | '),
    interpretation,
    confidence,
    unknown: 'Needs validation in real work context with external stakeholders.',
    nextExperiment:
      'Run a real-world informational interview with a Product Manager and compare your simulation choices with their process.',
    createdAt: nowIso(),
  };
}

export function createHypothesisFromEvidence(evidence: EvidenceRecord): HypothesisRecord {
  return {
    id: createId('hypothesis'),
    title: 'User may enjoy product/strategy environments',
    evidenceIds: [evidence.id],
    confidence: evidence.confidence,
    unknown: 'Has not yet validated this pattern in a real product team setting.',
    nextTest: evidence.nextExperiment,
    updatedAt: nowIso(),
  };
}

export function createTaraMomentFromEvidence(evidence: EvidenceRecord): TaraMoment {
  const hint = evidence.interpretation.toLowerCase().includes('quality')
    ? 'quality and trust'
    : evidence.interpretation.toLowerCase().includes('speed')
      ? 'speed and momentum'
      : 'ownership under uncertainty';

  return {
    id: createId('moment'),
    createdAt: nowIso(),
    text:
      `You said you value stability, but in pressure moments you leaned toward ${hint}. ` +
      `That could be an early signal that independent decision-making matters more to you than predictable structure. ` +
      `It's not a label yet. Want to test this with one real-world conversation?`,
  };
}

export function createNextActionFromEvidence(evidence: EvidenceRecord): NextAction {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  return {
    id: createId('action'),
    title: 'Talk to one Product Manager',
    reason: evidence.nextExperiment,
    status: 'todo',
    deadline: deadline.toISOString().slice(0, 10),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function createJourneyEventsFromExperience(
  experience: ExperienceDefinition,
  evidence: EvidenceRecord,
  action: NextAction
): JourneyEvent[] {
  return [
    {
      id: createId('journey'),
      type: 'experience',
      title: `Completed ${experience.title}`,
      description: `Finished a choice-consequence simulation in ${experience.domain}.`,
      date: nowIso(),
    },
    {
      id: createId('journey'),
      type: 'insight',
      title: 'New evidence signal created',
      description: evidence.interpretation,
      date: nowIso(),
    },
    {
      id: createId('journey'),
      type: 'action',
      title: 'Real-world experiment added',
      description: `${action.title} — ${action.reason}`,
      date: nowIso(),
    },
  ];
}

export function buildExploreSignals(evidence: EvidenceRecord[], hypotheses: HypothesisRecord[]) {
  const hasProductSignal = hypotheses.some((hypothesis) =>
    hypothesis.title.toLowerCase().includes('product')
  );

  return {
    strongSignals: hasProductSignal
      ? [
          {
            title: 'Product Management',
            why: 'Repeated trade-off handling and ownership behavior surfaced in simulation evidence.',
            unknown: 'Need validation through real practitioner conversation and practical mini-project.',
            testNext: 'Shadow one PM workflow and document decision criteria.',
          },
        ]
      : [],
    worthTesting: [
      {
        title: 'UX Research',
        why: 'Reflection responses suggest curiosity about user impact and decision rationale.',
        unknown: 'No real interview/research synthesis evidence yet.',
        testNext: 'Run one user interview and summarize insights.',
      },
      {
        title: 'Product Analytics',
        why: 'Decision patterns show interest in outcome measurement under uncertainty.',
        unknown: 'No hands-on metrics analysis evidence yet.',
        testNext: 'Analyze one public product funnel and propose 3 hypotheses.',
      },
    ],
    unexplored: [
      {
        title: 'Computational Chemistry',
        why: 'No evidence yet — included to widen discovery beyond obvious roles.',
        unknown: 'Interest and aptitude signals not collected.',
        testNext: 'Try a beginner computational science task and reflect on energy level.',
      },
    ],
    evidenceCount: evidence.length,
  };
}

export function memoryToExport(memories: TaraMemory[]) {
  return {
    exportedAt: nowIso(),
    memoryCount: memories.length,
    memories,
  };
}
