/**
 * Big Five (OCEAN) Personality Scoring Engine
 * Maps user trait scores to the 5 personality dimensions:
 * Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
 */
import type { BigFiveScores, TraitScores } from '@/types';

// Mapping weights: how each legacy trait contributes to Big Five
const TRAIT_TO_BIGFIVE_MAP: Record<keyof TraitScores, Partial<Record<keyof BigFiveScores, number>>> = {
  analytical:      { openness: 0.5, conscientiousness: 0.4 },
  creative:        { openness: 0.9, extraversion: 0.2 },
  leadership:      { extraversion: 0.7, conscientiousness: 0.3, openness: 0.1 },
  empathy:         { agreeableness: 0.9, extraversion: 0.2, neuroticism: -0.2 },
  technical:       { conscientiousness: 0.5, openness: 0.3 },
  communication:   { extraversion: 0.7, agreeableness: 0.3, openness: 0.2 },
  adaptability:    { openness: 0.6, extraversion: 0.2, neuroticism: -0.3 },
  detail_oriented: { conscientiousness: 0.9, neuroticism: 0.1 },
};

/**
 * Convert legacy TraitScores to Big Five personality profile
 */
export function calculateBigFive(traits: TraitScores): BigFiveScores {
  const raw: BigFiveScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 50, // Start neutral — lower is better adjusted
  };

  const weights: Record<keyof BigFiveScores, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 1,
  };

  for (const [trait, value] of Object.entries(traits) as [keyof TraitScores, number][]) {
    const mapping = TRAIT_TO_BIGFIVE_MAP[trait];
    if (!mapping) continue;
    for (const [bfKey, weight] of Object.entries(mapping) as [keyof BigFiveScores, number][]) {
      if (bfKey === 'neuroticism') {
        // Negative weights for neuroticism mean stronger traits = less neurotic
        raw[bfKey] += value * weight;
        weights[bfKey] += Math.abs(weight);
      } else {
        raw[bfKey] += value * weight;
        weights[bfKey] += weight;
      }
    }
  }

  const result: BigFiveScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  for (const key of Object.keys(raw) as (keyof BigFiveScores)[]) {
    if (key === 'neuroticism') {
      // Invert: high empathy/adaptability → LOW neuroticism
      result[key] = Math.round(Math.max(0, Math.min(100, 50 + raw[key] / Math.max(1, weights[key]))));
    } else {
      result[key] = weights[key] > 0 ? Math.round(Math.min(100, raw[key] / weights[key])) : 0;
    }
  }

  return result;
}

/**
 * Labels and descriptions for Big Five dimensions
 */
export const BIGFIVE_LABELS: Record<keyof BigFiveScores, { label: string; emoji: string; highDesc: string; lowDesc: string }> = {
  openness:          { label: 'Openness',          emoji: '🌟', highDesc: 'Curious, creative, open to new experiences', lowDesc: 'Practical, conventional, prefers routine' },
  conscientiousness: { label: 'Conscientiousness', emoji: '📋', highDesc: 'Organized, dependable, self-disciplined', lowDesc: 'Flexible, spontaneous, easygoing' },
  extraversion:      { label: 'Extraversion',      emoji: '🗣️', highDesc: 'Outgoing, energetic, seeks social interaction', lowDesc: 'Reflective, reserved, prefers solitude' },
  agreeableness:     { label: 'Agreeableness',     emoji: '🤗', highDesc: 'Cooperative, trusting, helpful', lowDesc: 'Competitive, skeptical, challenging' },
  neuroticism:       { label: 'Emotional Stability',emoji: '⚖️', highDesc: 'Sensitive, may experience stress easily', lowDesc: 'Calm, resilient, emotionally stable' },
};

/**
 * Get a personality summary based on Big Five scores
 */
export function getPersonalitySummary(scores: BigFiveScores): string {
  const parts: string[] = [];

  if (scores.openness >= 70) parts.push('highly creative and curious');
  else if (scores.openness >= 50) parts.push('moderately open to new ideas');
  else parts.push('practical and grounded');

  if (scores.conscientiousness >= 70) parts.push('very organized and dependable');
  else if (scores.conscientiousness >= 50) parts.push('fairly structured');

  if (scores.extraversion >= 70) parts.push('outgoing and energetic');
  else if (scores.extraversion < 40) parts.push('reflective and independent');

  if (scores.agreeableness >= 70) parts.push('naturally cooperative and empathetic');

  if (scores.neuroticism < 40) parts.push('emotionally resilient');

  return `You appear to be ${parts.join(', ')}.`;
}
