/**
 * Unified Career Matching Engine
 * Combines RIASEC, Gardner MI, and trait-based scoring
 * for comprehensive career recommendations
 */
import type { GardnerScores, TraitScores } from '@/types';
import type { CareerData } from '@/data/careers';
import { calculateRiasec, riasecSimilarity } from './riasec';
import { calculateGardner, gardnerSimilarity } from './gardner';

export interface CareerMatchResult {
  career: CareerData;
  overallScore: number;
  riasecScore: number;
  gardnerScore: number;
  traitScore: number;
  topAlignedTraits: string[];
  topAlignedIntelligences: string[];
}

// Weights for combining different scoring dimensions
const SCORING_WEIGHTS = {
  riasec: 0.35,
  gardner: 0.35,
  traits: 0.30,
};

/**
 * Match user against the full career database using multi-dimensional scoring
 */
export function matchCareersAdvanced(
  traits: TraitScores,
  careers: CareerData[]
): CareerMatchResult[] {
  const userRiasec = calculateRiasec(traits);
  const userGardner = calculateGardner(traits);

  return careers
    .map((career) => {
      // 1. RIASEC similarity
      const rScore = riasecSimilarity(userRiasec, career.riasec_profile);

      // 2. Gardner similarity
      const gScore = gardnerSimilarity(userGardner, career.gardner_profile);

      // 3. Legacy trait similarity
      const tScore = traitSimilarity(traits, career.required_traits);

      // Weighted combination
      const overallScore = Math.round(
        rScore * SCORING_WEIGHTS.riasec +
        gScore * SCORING_WEIGHTS.gardner +
        tScore * SCORING_WEIGHTS.traits
      );

      // Find top aligned traits
      const topAlignedTraits = getTopAligned(traits, career.required_traits, 3);

      // Find top aligned intelligences
      const topAlignedIntelligences = getTopAlignedGardner(userGardner, career.gardner_profile, 3);

      return {
        career,
        overallScore,
        riasecScore: rScore,
        gardnerScore: gScore,
        traitScore: tScore,
        topAlignedTraits,
        topAlignedIntelligences,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Simple trait-based similarity score
 */
function traitSimilarity(user: TraitScores, required: Partial<TraitScores>): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const [trait, required_val] of Object.entries(required) as [keyof TraitScores, number][]) {
    const userScore = user[trait] || 0;
    const diff = Math.abs(userScore - required_val);
    const similarity = Math.max(0, 100 - diff * 1.5);
    const weight = required_val / 100;
    weightedScore += similarity * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

/**
 * Get top N aligned traits between user and career
 */
function getTopAligned(user: TraitScores, required: Partial<TraitScores>, n: number): string[] {
  return (Object.entries(required) as [keyof TraitScores, number][])
    .map(([trait, req]) => ({
      trait,
      alignment: Math.max(0, 100 - Math.abs((user[trait] || 0) - req) * 1.5),
    }))
    .sort((a, b) => b.alignment - a.alignment)
    .slice(0, n)
    .map(({ trait }) => trait);
}

/**
 * Get top N aligned Gardner intelligences
 */
function getTopAlignedGardner(
  user: GardnerScores,
  career: Record<keyof GardnerScores, number>,
  n: number
): string[] {
  return (Object.keys(user) as (keyof GardnerScores)[])
    .map((key) => ({
      key,
      alignment: Math.min(user[key], career[key] || 0),
    }))
    .sort((a, b) => b.alignment - a.alignment)
    .slice(0, n)
    .map(({ key }) => key);
}

/**
 * Re-export for convenience
 */
export { calculateRiasec, getHollandCode, RIASEC_LABELS } from './riasec';
export { calculateGardner, getTopIntelligences, GARDNER_LABELS, boostFromGameScores } from './gardner';
