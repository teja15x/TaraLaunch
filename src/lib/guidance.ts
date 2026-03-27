import type { TraitScores } from '@/types';
import type {
  CollegeEmployerInsight,
  GuidanceMetrics,
  JourneyAudience,
  RiskLevel,
  WeeklyMission,
} from '@/types/guidance';

export const GUIDANCE_METRICS_STORAGE_KEY = 'career-agent-guidance-metrics';
export const GUIDANCE_PLANS_STORAGE_KEY = 'career-agent-guidance-plans';
export const GUIDANCE_FEEDBACK_STORAGE_KEY = 'career-agent-guidance-feedback';

export function getDefaultGuidanceMetrics(): GuidanceMetrics {
  return {
    hubVisits: 0,
    roadmapViews: 0,
    knowledgeViews: 0,
    rescueChecks: 0,
    parentTranslationsViewed: 0,
    plansCreated: 0,
    savedPlans: 0,
    explainabilityViews: 0,
    feedbackSubmissions: 0,
    positiveFeedback: 0,
  };
}

export function readGuidanceMetrics(): GuidanceMetrics {
  if (typeof window === 'undefined') return getDefaultGuidanceMetrics();

  try {
    const raw = window.localStorage.getItem(GUIDANCE_METRICS_STORAGE_KEY);
    if (!raw) return getDefaultGuidanceMetrics();
    return { ...getDefaultGuidanceMetrics(), ...(JSON.parse(raw) as Partial<GuidanceMetrics>) };
  } catch {
    return getDefaultGuidanceMetrics();
  }
}

export function bumpGuidanceMetric(metric: keyof GuidanceMetrics, amount = 1): GuidanceMetrics {
  const next = readGuidanceMetrics();
  next[metric] += amount;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUIDANCE_METRICS_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function buildWeeklyMission(goal: string, audience: JourneyAudience, riskLevel: RiskLevel): WeeklyMission {
  const cleanGoal = goal.trim() || 'Create clarity and visible progress';
  const weeklyIntensity = riskLevel === 'high' ? 'lighter but consistent' : riskLevel === 'medium' ? 'steady' : 'stretch';
  const audienceFocus = {
    'school-student': 'streams, entrances, and role exposure',
    'college-student': 'skills, internships, and role proof',
    graduate: 'pivot proof, applications, and confidence rebuilding',
    parent: 'communication, support, and expectation alignment',
  } satisfies Record<JourneyAudience, string>;

  return {
    audience,
    goal: cleanGoal,
    riskLevel,
    weeks: [
      {
        week: 1,
        theme: 'Reduce confusion',
        actions: [
          `Write one clear goal: ${cleanGoal}.`,
          `Spend 45 minutes understanding ${audienceFocus[audience]}.`,
          `Choose a ${weeklyIntensity} rhythm you can repeat for seven days.`,
        ],
        successSignal: 'The student can explain the target and why it matters in simple language.',
      },
      {
        week: 2,
        theme: 'Build proof',
        actions: [
          'Create one visible proof item: notes, project, mentor summary, or roadmap document.',
          'Log progress on three separate days.',
          'Ask one mentor, teacher, senior, or parent for specific feedback.',
        ],
        successSignal: 'A real output exists instead of only intention.',
      },
      {
        week: 3,
        theme: 'Reality-check the path',
        actions: [
          'Compare best-case and common-case outcomes.',
          'Identify one backup path that still respects the long-term goal.',
          'Fix one weak spot: communication, consistency, or technical foundation.',
        ],
        successSignal: 'The plan includes risk, not only hope.',
      },
      {
        week: 4,
        theme: 'Lock the next 30 days',
        actions: [
          'Turn the best habits into next-month non-negotiables.',
          'Set one measurable target for applications, study hours, or project output.',
          'Hold a review conversation focused on facts, not blame.',
        ],
        successSignal: 'There is a practical next-month plan with one measurable target.',
      },
    ],
  };
}

export function buildCareerFitReasons(
  careerTitle: string,
  requiredTraits: Partial<TraitScores>,
  traitScores: TraitScores,
  educationPath?: string,
  skills?: string[]
): string[] {
  const strongestMatches = Object.entries(requiredTraits)
    .map(([trait, required]) => {
      const userScore = traitScores[trait as keyof TraitScores] || 0;
      const gap = Math.abs(userScore - (required as number));
      return {
        trait,
        gap,
        userScore,
      };
    })
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 3);

  const reasons = strongestMatches.map(({ trait, userScore }) => {
    const label = trait.replace('_', ' ');
    return `${careerTitle} fits because your ${label} score is already showing up strongly at ${userScore}%.`;
  });

  if (skills?.length) {
    reasons.push(`This path rewards concrete skills like ${skills.slice(0, 3).join(', ')} rather than vague interest alone.`);
  }

  if (educationPath) {
    reasons.push(`There is also a visible entry route through ${educationPath}, which keeps the path practical instead of abstract.`);
  }

  return reasons.slice(0, 4);
}

export function normalizeRoleForKnowledge(role: string, insights: CollegeEmployerInsight[]): string {
  const normalized = role.trim().toLowerCase();
  const exact = insights.find((item) => item.role.toLowerCase() === normalized);

  if (exact) return exact.role;

  const fuzzy = insights.find((item) => normalized.includes(item.role.toLowerCase()) || item.role.toLowerCase().includes(normalized));
  return fuzzy?.role ?? insights[0]?.role ?? role;
}