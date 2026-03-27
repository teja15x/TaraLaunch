/**
 * RIASEC (Holland Code) Scoring Engine
 * Maps user trait scores to the 6 Holland occupational themes:
 * Realistic, Investigative, Artistic, Social, Enterprising, Conventional
 */
import type { RiasecScores, TraitScores } from '@/types';

// Mapping weights: how each legacy trait contributes to RIASEC dimensions
const TRAIT_TO_RIASEC_MAP: Record<keyof TraitScores, Partial<Record<keyof RiasecScores, number>>> = {
  analytical:      { investigative: 0.8, realistic: 0.3, conventional: 0.2 },
  creative:        { artistic: 0.9, investigative: 0.2, enterprising: 0.1 },
  leadership:      { enterprising: 0.8, social: 0.3, conventional: 0.1 },
  empathy:         { social: 0.9, artistic: 0.2, enterprising: 0.1 },
  technical:       { realistic: 0.8, investigative: 0.4, conventional: 0.2 },
  communication:   { social: 0.5, enterprising: 0.5, artistic: 0.2 },
  adaptability:    { enterprising: 0.4, artistic: 0.3, social: 0.2, realistic: 0.1 },
  detail_oriented: { conventional: 0.8, realistic: 0.3, investigative: 0.2 },
};

/**
 * Convert legacy TraitScores to RIASEC profile
 */
export function calculateRiasec(traits: TraitScores): RiasecScores {
  const raw: RiasecScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  const weights: Record<keyof RiasecScores, number> = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  for (const [trait, value] of Object.entries(traits) as [keyof TraitScores, number][]) {
    const mapping = TRAIT_TO_RIASEC_MAP[trait];
    if (!mapping) continue;
    for (const [riasecKey, weight] of Object.entries(mapping) as [keyof RiasecScores, number][]) {
      raw[riasecKey] += value * weight;
      weights[riasecKey] += weight;
    }
  }

  // Normalize to 0-100
  const result: RiasecScores = { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 };
  for (const key of Object.keys(raw) as (keyof RiasecScores)[]) {
    result[key] = weights[key] > 0 ? Math.round(Math.min(100, raw[key] / weights[key])) : 0;
  }

  return result;
}

/**
 * Get the top 3 Holland codes (e.g., "RIA", "SEC")
 */
export function getHollandCode(riasec: RiasecScores): string {
  const sorted = (Object.entries(riasec) as [keyof RiasecScores, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const codeMap: Record<keyof RiasecScores, string> = {
    realistic: 'R',
    investigative: 'I',
    artistic: 'A',
    social: 'S',
    enterprising: 'E',
    conventional: 'C',
  };

  return sorted.map(([key]) => codeMap[key]).join('');
}

/**
 * Get descriptive labels for RIASEC dimensions
 */
export const RIASEC_LABELS: Record<keyof RiasecScores, { label: string; emoji: string; description: string }> = {
  realistic:      { label: 'Realistic',      emoji: '🔧', description: 'Hands-on, practical, likes working with tools & machines' },
  investigative:  { label: 'Investigative',  emoji: '🔬', description: 'Analytical, curious, enjoys research & problem-solving' },
  artistic:       { label: 'Artistic',       emoji: '🎨', description: 'Creative, expressive, values originality & imagination' },
  social:         { label: 'Social',         emoji: '🤝', description: 'Helpful, cooperative, enjoys working with people' },
  enterprising:   { label: 'Enterprising',   emoji: '💼', description: 'Ambitious, persuasive, enjoys leading & influencing' },
  conventional:   { label: 'Conventional',   emoji: '📊', description: 'Organized, detail-oriented, likes structure & data' },
};

/**
 * Calculate RIASEC similarity between user profile and career profile
 */
export function riasecSimilarity(user: RiasecScores, career: RiasecScores): number {
  let sumProduct = 0;
  let sumUserSq = 0;
  let sumCareerSq = 0;

  for (const key of Object.keys(user) as (keyof RiasecScores)[]) {
    sumProduct += user[key] * career[key];
    sumUserSq += user[key] * user[key];
    sumCareerSq += career[key] * career[key];
  }

  const denom = Math.sqrt(sumUserSq) * Math.sqrt(sumCareerSq);
  return denom > 0 ? Math.round((sumProduct / denom) * 100) : 0;
}
