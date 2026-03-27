/**
 * Adaptive Career Matching with Game Integration
 * Makes evaluation interactive by suggesting games to fill assessment gaps
 */
import type { RiasecScores, GardnerScores, TraitScores } from '@/types';
import type { CareerData } from '@/data/careers';
import type { GameDefinition } from '@/data/games';
import { matchCareersAdvanced } from './matcher';
import { calculateRiasec, calculateGardner } from './index';

export interface AssessmentGap {
  dimension: string;
  type: 'riasec' | 'gardner';
  confidence: number; // 0-100, how sure we are about this trait
  gap: number; // 0-100, how far from max possible
  targetGames: GameDefinition[]; // Games that can boost this
}

export interface MatchingInsight {
  matches: Array<{
    career: CareerData;
    score: number;
    confidence: number; // How sure we are about this match
  }>;
  gaps: AssessmentGap[];
  suggestedGames: GameDefinition[];
  nextAction: string;
  recoveryPlan: string;
}

/**
 * Adaptive matching that identifies confidence gaps
 * and recommends games to strengthen the assessment profile
 */
export function adaptiveMatch(
  traits: TraitScores,
  careers: CareerData[],
  allGames: GameDefinition[],
  completedGames: string[] = []
): MatchingInsight {
  // 1. Get initial matches
  const matches = matchCareersAdvanced(traits, careers).slice(0, 10);

  // 2. Calculate confidence in each dimension
  const gaps = identifyAssessmentGaps(
    traits,
    careers,
    allGames,
    completedGames
  );

  // 3. Identify top 3 low-confidence gaps
  const topGaps = gaps
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 3);

  // 4. Suggest games to fill those gaps
  const suggestedGames = recommendGames(topGaps, allGames, completedGames);

  // 5. Calculate confidence for each match
  const matchesWithConfidence = matches.map(m => ({
    career: m.career,
    score: m.overallScore,
    confidence: calculateMatchConfidence(
      m,
      gaps,
      m.career
    ),
  }));

  // 6. Craft narrative
  const { nextAction, recoveryPlan } = craftNarrative(topGaps, suggestedGames);

  return {
    matches: matchesWithConfidence,
    gaps: topGaps,
    suggestedGames,
    nextAction,
    recoveryPlan,
  };
}

/**
 * Identify which assessment dimensions have low coverage
 * (e.g., "We haven't seen much of your artistic side yet")
 */
function identifyAssessmentGaps(
  traits: TraitScores,
  careers: CareerData[],
  allGames: GameDefinition[],
  completedGames: string[]
): AssessmentGap[] {
  const riasec = calculateRiasec(traits);
  const gardner = calculateGardner(traits);

  const gaps: AssessmentGap[] = [];

  // RIASEC gaps
  (Object.entries(riasec) as [keyof RiasecScores, number][]).forEach(
    ([dimension, score]) => {
      const confidence = calculateDimensionConfidence(dimension, score, traits);
      const gap = 100 - score;

      if (confidence < 60) {
        // Low confidence threshold
        const targetGames = allGames.filter(
          g =>
            g.riasec_targets.includes(dimension as keyof RiasecScores) &&
            !completedGames.includes(g.id)
        );

        gaps.push({
          dimension,
          type: 'riasec',
          confidence,
          gap,
          targetGames,
        });
      }
    }
  );

  // Gardner gaps
  (Object.entries(gardner) as [keyof GardnerScores, number][]).forEach(
    ([dimension, score]) => {
      const confidence = calculateDimensionConfidence(dimension, score, traits);
      const gap = 100 - score;

      if (confidence < 60) {
        const targetGames = allGames.filter(
          g =>
            g.gardner_targets.includes(dimension as keyof GardnerScores) &&
            !completedGames.includes(g.id)
        );

        gaps.push({
          dimension,
          type: 'gardner',
          confidence,
          gap,
          targetGames,
        });
      }
    }
  );

  return gaps;
}

/**
 * Calculate confidence in a dimension based on:
 * - How recently we received signals about it
 * - How many games/chats have reinforced it
 * - Consistency of signals
 */
function calculateDimensionConfidence(
  dimension: string,
  score: number,
  traits: TraitScores
): number {
  // Simple heuristic: high scores with consistency = high confidence
  // Low scores or mid-range = lower confidence (need more signals)
  const traitValue = traits[dimension as keyof TraitScores] || 0;

  if (score < 20 || score > 80) {
    // Clear signal (very high or very low)
    return Math.max(70, Math.abs(score - 50) * 0.5);
  }

  // Mid-range is always less confident
  return Math.max(30, 100 - Math.abs(score - 50));
}

/**
 * Recommend specific games to fill gaps
 * Prioritize: games not played yet, lower difficulty, shorter duration
 */
function recommendGames(
  gaps: AssessmentGap[],
  allGames: GameDefinition[],
  completedGames: string[]
): GameDefinition[] {
  const recommended = new Set<string>();

  gaps.forEach(gap => {
    // For each gap, pick the best unplayed game
    const bestGame = gap.targetGames
      .filter(g => !completedGames.includes(g.id))
      .sort((a, b) => {
        // Sort by: difficulty asc, duration asc
        const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        }
        return parseInt(a.duration) - parseInt(b.duration);
      })[0];

    if (bestGame) {
      recommended.add(bestGame.id);
    }
  });

  return Array.from(recommended)
    .map(id => allGames.find(g => g.id === id))
    .filter(Boolean) as GameDefinition[];
}

/**
 * Calculate how confident we are about a specific career match
 * based on how well our traits align with career requirements
 */
function calculateMatchConfidence(
  matchResult: any,
  gaps: AssessmentGap[],
  career: CareerData
): number {
  const baseConfidence = matchResult.overallScore;

  // Reduce confidence if we have gaps in dimensions this career requires
  const careerGapPenalty = gaps.reduce((penalty, gap) => {
    const isRelevant =
      (gap.type === 'riasec' && career.riasec_profile[gap.dimension as keyof RiasecScores]) ||
      (gap.type === 'gardner' && career.gardner_profile[gap.dimension as keyof GardnerScores]);

    if (isRelevant) {
      return penalty + (50 - gap.confidence) * 0.1;
    }
    return penalty;
  }, 0);

  return Math.max(20, Math.min(100, baseConfidence - careerGapPenalty));
}

/**
 * Generate human-friendly narrative for the evaluation
 */
function craftNarrative(gaps: AssessmentGap[], suggestedGames: GameDefinition[]): {
  nextAction: string;
  recoveryPlan: string;
} {
  if (gaps.length === 0) {
    return {
      nextAction: '✨ We have a clear picture of your strengths! Here are your best career matches.',
      recoveryPlan: '',
    };
  }

  const topGap = gaps[0];
  const dimensionLabel = topGap.dimension.replace(/_/g, ' ');

  let nextAction = `We're less certain about your ${dimensionLabel} strengths.`;
  let recoveryPlan = '';

  if (suggestedGames.length > 0) {
    nextAction += ` Let's do a quick ${suggestedGames[0].title} (${suggestedGames[0].duration}) to clarify!`;
    recoveryPlan = `Playing ${suggestedGames
      .map(g => g.title)
      .join(' + ')} will give us a stronger signal about your ${dimensionLabel} abilities.
Then we can show you careers that are even better aligned with who you really are.`;
  } else {
    recoveryPlan = `We need more signals about your ${dimensionLabel} to give you confident recommendations.
Keep chatting with me, and I'll pick up more insights as we go!`;
  }

  return { nextAction, recoveryPlan };
}

/**
 * After a game is played, recalculate matches
 * Show the impact of the game on career recommendations
 */
export function compareMatches(
  beforeTraits: TraitScores,
  afterTraits: TraitScores,
  careers: CareerData[]
): {
  before: ReturnType<typeof matchCareersAdvanced>;
  after: ReturnType<typeof matchCareersAdvanced>;
  changed: Array<{
    career: CareerData;
    beforeScore: number;
    afterScore: number;
    improvement: number;
  }>;
} {
  const before = matchCareersAdvanced(beforeTraits, careers).slice(0, 10);
  const after = matchCareersAdvanced(afterTraits, careers).slice(0, 10);

  const changed = before
    .map((b, idx) => {
      const afterMatch = after.find(a => a.career.id === b.career.id);
      if (!afterMatch || b.overallScore === afterMatch.overallScore) return null;

      return {
        career: b.career,
        beforeScore: b.overallScore,
        afterScore: afterMatch.overallScore,
        improvement: afterMatch.overallScore - b.overallScore,
      };
    })
    .filter(Boolean) as Array<{
      career: CareerData;
      beforeScore: number;
      afterScore: number;
      improvement: number;
    }>;

  return {
    before,
    after,
    changed: changed.sort((a, b) => b.improvement - a.improvement),
  };
}
