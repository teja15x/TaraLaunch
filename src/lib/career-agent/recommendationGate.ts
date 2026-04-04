type CounselingStage = 'discovery' | 'narrowing' | 'recommendation';
type ClarityBand = 'low' | 'medium' | 'high';

interface RecommendationGateInput {
  currentTurnNumber: number;
  detectedStage?: string;
  assessmentProgress: number;
  completedGamesCount: number;
  hasConstraintProfile: boolean;
  hasFamilyContext: boolean;
  unresolvedContradictionsCount: number;
  unresolvedHighContradictionsCount: number;
  hasRoleFocus: boolean;
  retrievalConfidence?: number;
}

interface RecommendationGateDetail {
  name: string;
  requirement: string;
  currentStatus: string;
  isMet: boolean;
}

interface RecommendationEvidenceDossier {
  confidenceBand: ClarityBand;
  summary: string;
  supportingEvidence: string[];
  contradictions: string[];
  rejectedAlternatives: string[];
  nextValidationAction: string;
}

export interface RecommendationGateDecision {
  stage: CounselingStage;
  isUnlocked: boolean;
  progressPercent: number;
  blockingGates: RecommendationGateDetail[];
  nextBestQuestion: string;
  dossier: RecommendationEvidenceDossier;
}

function normalizeDetectedStage(stage?: string): string {
  return (stage ?? '').trim().toLowerCase();
}

function inferStageFromSignals(input: RecommendationGateInput): CounselingStage {
  const normalizedStage = normalizeDetectedStage(input.detectedStage);
  if (normalizedStage.includes('class') || normalizedStage.includes('intermediate') || normalizedStage.includes('12')) {
    return 'discovery';
  }

  if (normalizedStage.includes('college') || normalizedStage.includes('btech') || normalizedStage.includes('degree')) {
    return 'narrowing';
  }

  if (normalizedStage.includes('graduat') || normalizedStage.includes('job')) {
    return 'recommendation';
  }

  if (input.currentTurnNumber <= 25) return 'discovery';
  if (input.currentTurnNumber < 40 || input.assessmentProgress < 80 || input.completedGamesCount < 2) {
    return 'narrowing';
  }
  return 'recommendation';
}

function buildGateDetails(input: RecommendationGateInput): RecommendationGateDetail[] {
  const details: RecommendationGateDetail[] = [
    {
      name: 'meaningful_turns',
      requirement: 'At least 40 meaningful turns before final ranking',
      currentStatus: `${input.currentTurnNumber} turns captured`,
      isMet: input.currentTurnNumber >= 40,
    },
    {
      name: 'assessment_completion',
      requirement: 'At least one assessment is 80%+ complete',
      currentStatus: `Assessment progress is ${input.assessmentProgress}%`,
      isMet: input.assessmentProgress >= 80,
    },
    {
      name: 'game_evidence',
      requirement: 'At least two game signals collected',
      currentStatus: `${input.completedGamesCount} game(s) completed`,
      isMet: input.completedGamesCount >= 2,
    },
    {
      name: 'constraint_profile',
      requirement: 'Student constraints are captured (location, budget, pressure)',
      currentStatus: input.hasConstraintProfile ? 'Constraint profile captured' : 'Constraint profile missing',
      isMet: input.hasConstraintProfile,
    },
    {
      name: 'family_context',
      requirement: 'Family context is explicitly discussed before final recommendation',
      currentStatus: input.hasFamilyContext ? 'Family context discussed' : 'Family context not yet discussed',
      isMet: input.hasFamilyContext,
    },
    {
      name: 'contradictions',
      requirement: 'No unresolved contradictions remain',
      currentStatus: `${input.unresolvedContradictionsCount} unresolved contradiction(s)`,
      isMet: input.unresolvedContradictionsCount === 0,
    },
    {
      name: 'high_severity_contradictions',
      requirement: 'No unresolved high-severity contradictions remain',
      currentStatus: `${input.unresolvedHighContradictionsCount} unresolved high-severity contradiction(s)`,
      isMet: input.unresolvedHighContradictionsCount === 0,
    },
    {
      name: 'role_focus',
      requirement: 'At least one role focus or high-confidence role cluster exists',
      currentStatus: input.hasRoleFocus
        ? 'Role focus present'
        : `No stable role focus (retrieval confidence ${input.retrievalConfidence ?? 0}/100)`,
      isMet: input.hasRoleFocus || (input.retrievalConfidence ?? 0) >= 75,
    },
  ];

  return details;
}

function buildNextBestQuestion(gate: RecommendationGateDetail | undefined): string {
  if (!gate) {
    return 'Would you like me to provide a ranked shortlist with clear reasons and next-step plan?';
  }

  switch (gate.name) {
    case 'meaningful_turns':
      return 'Before I rank careers, what are the top two roles you keep returning to and why?';
    case 'assessment_completion':
      return 'Can we complete one assessment to at least 80% so your shortlist is evidence-backed?';
    case 'game_evidence':
      return 'Let us run one more short game challenge so your fit signals are stronger. Is that okay?';
    case 'constraint_profile':
      return 'What is your realistic budget and location flexibility for college or training?';
    case 'family_context':
      return 'What does your family strongly prefer, and where are you willing to negotiate?';
    case 'contradictions':
    case 'high_severity_contradictions':
      return 'I see mixed signals. Which path feels more natural when you imagine doing it daily for 3 years?';
    case 'role_focus':
      return 'Which one role do you want to stress-test first, so we can avoid generic advice?';
    default:
      return 'What is the most important factor you want me to prioritize before final recommendations?';
  }
}

function getClarityBand(progressPercent: number): ClarityBand {
  if (progressPercent >= 85) return 'high';
  if (progressPercent >= 55) return 'medium';
  return 'low';
}

export function buildRecommendationGateDecision(input: RecommendationGateInput): RecommendationGateDecision {
  const stage = inferStageFromSignals(input);
  const details = buildGateDetails(input);
  const blockingGates = details.filter((item) => !item.isMet);
  const metCount = details.length - blockingGates.length;
  const progressPercent = Math.round((metCount / details.length) * 100);
  const isUnlocked = stage === 'recommendation' && blockingGates.length === 0;
  const clarityBand = getClarityBand(progressPercent);
  const nextBestQuestion = buildNextBestQuestion(blockingGates[0]);

  const supportingEvidence = details
    .filter((item) => item.isMet)
    .slice(0, 4)
    .map((item) => `${item.name}: ${item.currentStatus}`);

  const contradictions = input.unresolvedContradictionsCount > 0
    ? [`${input.unresolvedContradictionsCount} unresolved contradiction(s) need counselor reprobe before ranking.`]
    : ['No unresolved contradiction is currently blocking recommendation.'];

  const rejectedAlternatives = isUnlocked
    ? ['No hard rejection yet. Keep 1-2 fallback options during recommendation output.']
    : ['Hard ranking path is deferred until blocking gates are resolved.'];

  const summary = isUnlocked
    ? 'Recommendation gate unlocked. You can provide ranked options with confidence rationale and fallback plan.'
    : `Recommendation gate locked (${blockingGates.length} blocker(s)). Continue evidence collection before final ranking.`;

  return {
    stage,
    isUnlocked,
    progressPercent,
    blockingGates,
    nextBestQuestion,
    dossier: {
      confidenceBand: clarityBand,
      summary,
      supportingEvidence,
      contradictions,
      rejectedAlternatives,
      nextValidationAction: nextBestQuestion,
    },
  };
}