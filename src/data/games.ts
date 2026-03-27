/**
 * Centralized Game Definitions
 * Maps each game to its psychometric purpose and scoring framework
 */
import type { GardnerScores, RiasecScores } from '@/types';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  phase: 1 | 3;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  /** Which RIASEC dimensions this game primarily measures */
  riasec_targets: (keyof RiasecScores)[];
  /** Which Gardner intelligences this game primarily measures */
  gardner_targets: (keyof GardnerScores)[];
  /** Legacy trait targets for backward compat */
  trait_targets: string[];
  /** Brief explanation of what this game reveals */
  insight: string;
  /**
   * Max evidence contribution weight for this game (0.0-0.20)
   * Enforces guardrail: No single game drives career recommendation
   * Phase 0 default: 0.15 (games contribute max 15% to ranking)
   * See: src/docs/COUNSELING_OS_GUARDRAILS.md#2-evidence-governance
   */
  max_evidence_weight: number;
}

export const gameDefinitions: GameDefinition[] = [
  // ── PHASE 1: CORE GAMES ─────────────────────────────
  {
    id: 'scenario-quest',
    title: 'Scenario Quest',
    description: 'Face real-world workplace scenarios and make decisions that reveal your natural strengths.',
    emoji: '🎯',
    phase: 1,
    difficulty: 'beginner',
    duration: '5-8 min',
    riasec_targets: ['social', 'enterprising', 'investigative'],
    gardner_targets: ['interpersonal', 'intrapersonal', 'linguistic'],
    trait_targets: ['leadership', 'empathy', 'communication', 'analytical'],
    insight: 'Reveals your decision-making style, leadership approach, and interpersonal strengths',
    max_evidence_weight: 0.15,
  },
  {
    id: 'pattern-master',
    title: 'Pattern Master',
    description: 'Solve puzzles, sequences, and logic challenges to test your analytical thinking.',
    emoji: '🧩',
    phase: 1,
    difficulty: 'beginner',
    duration: '5-7 min',
    riasec_targets: ['investigative', 'realistic', 'conventional'],
    gardner_targets: ['logical_mathematical', 'spatial'],
    trait_targets: ['analytical', 'technical', 'detail_oriented'],
    insight: 'Measures logical reasoning, pattern recognition, and spatial intelligence',
    max_evidence_weight: 0.15,
  },
  {
    id: 'story-weaver',
    title: 'Story Weaver',
    description: 'Write creative responses to story prompts that reveal your imagination and expression.',
    emoji: '📝',
    phase: 1,
    difficulty: 'beginner',
    duration: '8-12 min',
    riasec_targets: ['artistic', 'social', 'investigative'],
    gardner_targets: ['linguistic', 'intrapersonal', 'interpersonal'],
    trait_targets: ['creative', 'communication', 'empathy'],
    insight: 'Reveals your creativity, written expression, and emotional intelligence',
    max_evidence_weight: 0.15,
  },

  // ── PHASE 3: ADVANCED GAMES ─────────────────────────
  {
    id: 'rhythm-match',
    title: 'Rhythm Match',
    description: 'Listen and repeat rhythm patterns to test your musical and auditory intelligence.',
    emoji: '🎵',
    phase: 3,
    difficulty: 'intermediate',
    duration: '4-6 min',
    riasec_targets: ['artistic', 'realistic'],
    gardner_targets: ['musical', 'bodily_kinesthetic'],
    trait_targets: ['creative', 'detail_oriented', 'adaptability'],
    insight: 'Measures musical intelligence, timing, and auditory processing',
    max_evidence_weight: 0.15,
  },
  {
    id: 'nature-detective',
    title: 'Nature Detective',
    description: 'Explore nature scenarios and demonstrate your environmental awareness.',
    emoji: '🌿',
    phase: 3,
    difficulty: 'intermediate',
    duration: '5-7 min',
    riasec_targets: ['investigative', 'realistic'],
    gardner_targets: ['naturalistic', 'spatial'],
    trait_targets: ['analytical', 'empathy', 'detail_oriented'],
    insight: 'Reveals naturalistic intelligence and environmental thinking',
    max_evidence_weight: 0.15,
  },
  {
    id: 'the-organizer',
    title: 'The Organizer',
    description: 'Sort, categorize, and organize items under time pressure to test your systematic thinking.',
    emoji: '📋',
    phase: 3,
    difficulty: 'intermediate',
    duration: '5-7 min',
    riasec_targets: ['conventional', 'realistic', 'investigative'],
    gardner_targets: ['logical_mathematical', 'bodily_kinesthetic'],
    trait_targets: ['detail_oriented', 'analytical', 'technical'],
    insight: 'Measures organizational skills, speed, and systematic thinking',
    max_evidence_weight: 0.15,
  },
  {
    id: 'debate-club',
    title: 'Debate Club',
    description: 'Pick a side on thought-provoking topics and argue your position persuasively.',
    emoji: '🗣️',
    phase: 3,
    difficulty: 'advanced',
    duration: '8-10 min',
    riasec_targets: ['enterprising', 'social', 'artistic'],
    gardner_targets: ['linguistic', 'interpersonal'],
    trait_targets: ['communication', 'leadership', 'analytical', 'creative'],
    insight: 'Reveals persuasion skills, critical thinking, and verbal intelligence',
    max_evidence_weight: 0.15,
  },

  // ── PHASE 2: ADDITIONAL GAMES ─────────────────────────
  {
    id: 'team-leader',
    title: 'Team Leader',
    description: 'Lead teams through challenges by delegating tasks to the right people and handling conflicts.',
    emoji: '👑',
    phase: 1,
    difficulty: 'intermediate',
    duration: '8-10 min',
    riasec_targets: ['social', 'enterprising', 'conventional'],
    gardner_targets: ['interpersonal', 'intrapersonal', 'logical_mathematical'],
    trait_targets: ['leadership', 'empathy', 'communication', 'analytical'],
    insight: 'Reveals leadership style, delegation ability, and conflict resolution approach',
    max_evidence_weight: 0.15,
  },
  {
    id: 'creative-canvas',
    title: 'Creative Canvas',
    description: 'Unleash your imagination through inventions, mashups, and design challenges.',
    emoji: '🎨',
    phase: 1,
    difficulty: 'intermediate',
    duration: '8-10 min',
    riasec_targets: ['artistic', 'investigative', 'social'],
    gardner_targets: ['spatial', 'linguistic', 'intrapersonal'],
    trait_targets: ['creative', 'communication', 'adaptability', 'analytical'],
    insight: 'Measures creative thinking, innovation, and ability to combine ideas',
    max_evidence_weight: 0.15,
  },
  {
    id: 'decision-maze',
    title: 'Decision Maze',
    description: 'Navigate branching paths where every choice leads to a different outcome.',
    emoji: '🌀',
    phase: 1,
    difficulty: 'advanced',
    duration: '10-12 min',
    riasec_targets: ['investigative', 'enterprising', 'social'],
    gardner_targets: ['intrapersonal', 'logical_mathematical', 'interpersonal'],
    trait_targets: ['analytical', 'leadership', 'adaptability', 'empathy'],
    insight: 'Reveals decision-making patterns, risk tolerance, and strategic thinking',
    max_evidence_weight: 0.15,
  },
  {
    id: 'budget-tradeoff-lab',
    title: 'Budget & Tradeoff Lab',
    description: 'Make hard resource decisions from real Indian student contexts like fees, coaching, internships, and family pressure.',
    emoji: '💸',
    phase: 1,
    difficulty: 'advanced',
    duration: '8-10 min',
    riasec_targets: ['conventional', 'enterprising', 'investigative'],
    gardner_targets: ['logical_mathematical', 'intrapersonal', 'interpersonal'],
    trait_targets: ['analytical', 'leadership', 'adaptability', 'detail_oriented'],
    insight: 'Measures tradeoff intelligence, planning maturity, and decision quality under realistic constraints',
    max_evidence_weight: 0.15,
  },
];

/**
 * Get game definition by ID
 */
export function getGameById(id: string): GameDefinition | undefined {
  return gameDefinitions.find(g => g.id === id);
}

/**
 * Get all Phase 1 (core) games
 */
export function getCoreGames(): GameDefinition[] {
  return gameDefinitions.filter(g => g.phase === 1);
}

/**
 * Get all Phase 3 (advanced) games
 */
export function getAdvancedGames(): GameDefinition[] {
  return gameDefinitions.filter(g => g.phase === 3);
}

/**
 * Calculate assessment progress based on completed games
 */
export function calculateProgress(completedGameIds: string[]): number {
  const total = gameDefinitions.length;
  const completed = completedGameIds.filter(id => gameDefinitions.some(g => g.id === id)).length;
  return Math.round((completed / total) * 100);
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EVIDENCE WEIGHT GUARDRAILS (Phase 0)
 * ═══════════════════════════════════════════════════════════════
 * Enforce caps on game influence per counseling OS guardrails
 * See: src/docs/COUNSELING_OS_GUARDRAILS.md#2-evidence-governance
 */

/** Constant: Maximum evidence contribution from games in final ranking */
export const GAMES_MAX_EVIDENCE_WEIGHT = 0.20;  // Games cap at 20% total

/** Constant: Maximum single game contribution */
export const SINGLE_GAME_MAX_WEIGHT = 0.15;  // No single game > 15%

/**
 * Validate that a game's evidence weight doesn't exceed cap
 * @throws Error if weight violates guardrails
 */
export function validateGameEvidenceWeight(gameId: string, proposedWeight: number): boolean {
  const game = getGameById(gameId);
  if (!game) {
    throw new Error(`Game ${gameId} not found`);
  }
  
  if (proposedWeight > game.max_evidence_weight) {
    throw new Error(
      `Game "${game.title}" evidence weight ${proposedWeight} exceeds cap ${game.max_evidence_weight}. ` +
      `Violates guardrail: Single-game influence must not exceed ${SINGLE_GAME_MAX_WEIGHT * 100}%`
    );
  }
  
  return true;
}

/**
 * Check if total game evidence weights exceed the global cap
 * Used during recommendation phase to ensure games don't collectively drive decision
 * @param gamesContributions Map of gameId -> evidenceWeight
 * @throws Error if total exceeds GAMES_MAX_EVIDENCE_WEIGHT
 */
export function validateTotalGameEvidence(gamesContributions: Record<string, number>): boolean {
  const totalGameWeight = Object.values(gamesContributions).reduce((sum, w) => sum + w, 0);
  
  if (totalGameWeight > GAMES_MAX_EVIDENCE_WEIGHT) {
    throw new Error(
      `Total games evidence weight (${totalGameWeight}) exceeds cap (${GAMES_MAX_EVIDENCE_WEIGHT}). ` +
      `Violates guardrail: Games must contribute ≤ ${GAMES_MAX_EVIDENCE_WEIGHT * 100}% to recommendations. ` +
      `Add more evidence from assessments, role-depth tests, or conversation analysis.`
    );
  }
  
  return true;
}

/**
 * Get all evidence sources in proper weighting hierarchy
 * Enforces: Primary 40%, Secondary 30%, Tertiary 20%, Supporting 10%
 */
export function getEvidenceHierarchy() {
  return {
    PRIMARY: {
      name: 'Primary Evidence (Conversation + Constraints)',
      weight: 0.40,
      sources: ['chat', 'constraint'],
      description: 'Multi-turn conversation analysis + family/location/affordability context',
    },
    SECONDARY: {
      name: 'Secondary Evidence (Assessments)',
      weight: 0.30,
      sources: ['assessment'],
      description: 'RIASEC + Gardner + Big Five triangulated scores',
    },
    TERTIARY: {
      name: 'Tertiary Evidence (Role Knowledge)',
      weight: 0.20,
      sources: ['roleDepthTest'],
      description: 'Role-specific understanding validation (misconception calibration)',
    },
    SUPPORTING: {
      name: 'Supporting Evidence (Games)',
      weight: 0.10,
      sources: ['game'],
      description: 'Game performance (max 15% from any single game)',
      cap: GAMES_MAX_EVIDENCE_WEIGHT,
    },
  };
}
