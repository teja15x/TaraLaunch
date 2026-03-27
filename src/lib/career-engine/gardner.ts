/**
 * Gardner's Multiple Intelligences Scoring Engine
 * Maps user trait scores and game performance to 8 intelligence types
 */
import type { GardnerScores, TraitScores } from '@/types';

// Mapping weights: how each legacy trait contributes to Gardner intelligences
const TRAIT_TO_GARDNER_MAP: Record<keyof TraitScores, Partial<Record<keyof GardnerScores, number>>> = {
  analytical:      { logical_mathematical: 0.9, spatial: 0.2, intrapersonal: 0.1 },
  creative:        { spatial: 0.6, linguistic: 0.3, musical: 0.3, intrapersonal: 0.2 },
  leadership:      { interpersonal: 0.8, linguistic: 0.3, intrapersonal: 0.2 },
  empathy:         { interpersonal: 0.9, intrapersonal: 0.4, linguistic: 0.1 },
  technical:       { logical_mathematical: 0.6, spatial: 0.4, bodily_kinesthetic: 0.3 },
  communication:   { linguistic: 0.9, interpersonal: 0.4, musical: 0.1 },
  adaptability:    { intrapersonal: 0.5, interpersonal: 0.3, bodily_kinesthetic: 0.3, naturalistic: 0.2 },
  detail_oriented: { logical_mathematical: 0.5, spatial: 0.3, naturalistic: 0.2, bodily_kinesthetic: 0.2 },
};

/**
 * Convert legacy TraitScores to Gardner Multiple Intelligences profile
 */
export function calculateGardner(traits: TraitScores): GardnerScores {
  const raw: GardnerScores = {
    linguistic: 0,
    logical_mathematical: 0,
    spatial: 0,
    musical: 0,
    bodily_kinesthetic: 0,
    interpersonal: 0,
    intrapersonal: 0,
    naturalistic: 0,
  };

  const weights: Record<keyof GardnerScores, number> = {
    linguistic: 0,
    logical_mathematical: 0,
    spatial: 0,
    musical: 0,
    bodily_kinesthetic: 0,
    interpersonal: 0,
    intrapersonal: 0,
    naturalistic: 0,
  };

  for (const [trait, value] of Object.entries(traits) as [keyof TraitScores, number][]) {
    const mapping = TRAIT_TO_GARDNER_MAP[trait];
    if (!mapping) continue;
    for (const [gardnerKey, weight] of Object.entries(mapping) as [keyof GardnerScores, number][]) {
      raw[gardnerKey] += value * weight;
      weights[gardnerKey] += weight;
    }
  }

  const result: GardnerScores = {
    linguistic: 0, logical_mathematical: 0, spatial: 0, musical: 0,
    bodily_kinesthetic: 0, interpersonal: 0, intrapersonal: 0, naturalistic: 0,
  };

  for (const key of Object.keys(raw) as (keyof GardnerScores)[]) {
    result[key] = weights[key] > 0 ? Math.round(Math.min(100, raw[key] / weights[key])) : 0;
  }

  return result;
}

/**
 * Boost Gardner scores with game-specific results
 * Games directly measure certain intelligences
 */
export function boostFromGameScores(
  base: GardnerScores,
  gameScores: Record<string, number>
): GardnerScores {
  const boosted = { ...base };

  // Game-to-intelligence mapping
  const gameBoosts: Record<string, { key: keyof GardnerScores; weight: number }[]> = {
    'pattern-master':    [{ key: 'logical_mathematical', weight: 0.4 }, { key: 'spatial', weight: 0.3 }],
    'story-weaver':      [{ key: 'linguistic', weight: 0.5 }, { key: 'intrapersonal', weight: 0.2 }],
    'scenario-quest':    [{ key: 'interpersonal', weight: 0.3 }, { key: 'intrapersonal', weight: 0.3 }],
    'rhythm-match':      [{ key: 'musical', weight: 0.6 }, { key: 'bodily_kinesthetic', weight: 0.3 }],
    'nature-detective':  [{ key: 'naturalistic', weight: 0.6 }, { key: 'spatial', weight: 0.2 }],
    'the-organizer':     [{ key: 'logical_mathematical', weight: 0.4 }, { key: 'bodily_kinesthetic', weight: 0.2 }],
    'debate-club':       [{ key: 'linguistic', weight: 0.4 }, { key: 'interpersonal', weight: 0.3 }],
  };

  for (const [gameId, score] of Object.entries(gameScores)) {
    const boosts = gameBoosts[gameId];
    if (!boosts) continue;
    for (const { key, weight } of boosts) {
      boosted[key] = Math.round(Math.min(100, boosted[key] * (1 - weight) + score * weight));
    }
  }

  return boosted;
}

/**
 * Get the top 3 intelligences
 */
export function getTopIntelligences(gardner: GardnerScores): { key: keyof GardnerScores; label: string; score: number }[] {
  return (Object.entries(gardner) as [keyof GardnerScores, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, score]) => ({
      key,
      label: GARDNER_LABELS[key].label,
      score,
    }));
}

/**
 * Labels and descriptions for Gardner intelligences
 */
export const GARDNER_LABELS: Record<keyof GardnerScores, { label: string; emoji: string; description: string }> = {
  linguistic:          { label: 'Linguistic',          emoji: '📝', description: 'Strong with words, reading, writing, and storytelling' },
  logical_mathematical:{ label: 'Logical-Mathematical',emoji: '🧮', description: 'Excels at reasoning, patterns, logic, and numbers' },
  spatial:             { label: 'Spatial',             emoji: '🗺️', description: 'Good with visualizing, maps, images, and design' },
  musical:             { label: 'Musical',             emoji: '🎵', description: 'Sensitive to rhythm, melody, and sound patterns' },
  bodily_kinesthetic:  { label: 'Bodily-Kinesthetic',  emoji: '🏃', description: 'Learns through movement, touch, and physical activity' },
  interpersonal:       { label: 'Interpersonal',       emoji: '👥', description: 'Understands others well, works great in teams' },
  intrapersonal:       { label: 'Intrapersonal',       emoji: '🧘', description: 'Self-aware, reflective, understands own feelings' },
  naturalistic:        { label: 'Naturalistic',        emoji: '🌿', description: 'Connects with nature, animals, and the environment' },
};

/**
 * Calculate Gardner similarity between user profile and career profile
 */
export function gardnerSimilarity(user: GardnerScores, career: Record<keyof GardnerScores, number>): number {
  let sumProduct = 0;
  let sumUserSq = 0;
  let sumCareerSq = 0;

  for (const key of Object.keys(user) as (keyof GardnerScores)[]) {
    const careerVal = career[key] || 0;
    sumProduct += user[key] * careerVal;
    sumUserSq += user[key] * user[key];
    sumCareerSq += careerVal * careerVal;
  }

  const denom = Math.sqrt(sumUserSq) * Math.sqrt(sumCareerSq);
  return denom > 0 ? Math.round((sumProduct / denom) * 100) : 0;
}
