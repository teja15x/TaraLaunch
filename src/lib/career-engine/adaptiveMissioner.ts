import { getCoreGames, getAdvancedGames } from '@/data/games';

export interface MissionRecommendation {
  gameId: string;
  title: string;
  emoji: string;
  difficulty: number; // 1-5 stars
  reason: string;
  nextAction: string;
  estimatedDuration: string;
}

export interface PlayerPerformance {
  reliabilityScore: number; // 0-100
  completedGames: number;
  lastGameScore: number;
  successRate: number; // percentage of games with score > 70
}

/**
 * Adaptive mission routing based on evidence-quality and game performance.
 * Routes students to appropriately-challenging next game based on current state.
 */
export function recommendNextMission(performance: PlayerPerformance): MissionRecommendation | null {
  const allGames = [...getCoreGames(), ...getAdvancedGames()];

  if (!allGames.length) return null;

  // TIER 1: Evidence is weak (< 40) → Recommend "Quick Win" (easiest game)
  if (performance.reliabilityScore < 40) {
    const easyGame = getCoreGames()[0]; // Assume first core game is easiest (DecisionMaze)
    if (easyGame) {
      return {
        gameId: easyGame.id,
        title: easyGame.title,
        emoji: easyGame.emoji,
        difficulty: 1,
        reason: 'Start light: Build confidence with a quick win.',
        nextAction: `Play "${easyGame.title}" to unlock deeper insights.`,
        estimatedDuration: easyGame.duration,
      };
    }
  }

  // TIER 2: Evidence is moderate (40-65) but few games completed → Mid-tier games
  if (performance.reliabilityScore < 65 && performance.completedGames < 2) {
    const midTierGames = getCoreGames().slice(1, 3); // 2nd and 3rd core games
    const nextGame = midTierGames.find(g => g.difficulty === 'intermediate') || midTierGames[0];

    if (nextGame) {
      return {
        gameId: nextGame.id,
        title: nextGame.title,
        emoji: nextGame.emoji,
        difficulty: 2,
        reason: 'Build breadth: Explore different decision types.',
        nextAction: `Complete "${nextGame.title}" to strengthen your profile.`,
        estimatedDuration: nextGame.duration,
      };
    }
  }

  // TIER 3: Evidence is strong (65-80) OR enough games completed (≥2) → Advanced games
  if (
    (performance.reliabilityScore >= 65 && performance.completedGames >= 2) ||
    performance.completedGames >= 3
  ) {
    const advancedOptions = getAdvancedGames();
    let selectedGame = advancedOptions[0];

    // If last game score was high (>80), recommend hardest advanced game
    if (performance.lastGameScore > 80 && advancedOptions.length > 1) {
      selectedGame = advancedOptions[advancedOptions.length - 1];
    }

    if (selectedGame) {
      return {
        gameId: selectedGame.id,
        title: selectedGame.title,
        emoji: selectedGame.emoji,
        difficulty: 4,
        reason: 'You are ready for strategic depth: Explore complex decision scenarios.',
        nextAction: `Challenge yourself with "${selectedGame.title}".`,
        estimatedDuration: selectedGame.duration,
      };
    }
  }

  // TIER 4: High confidence (>80) + multiple games completed → Deep specialization
  if (performance.reliabilityScore > 80 && performance.completedGames >= 4) {
    const specialtyGames = getAdvancedGames().filter(g => g.difficulty === 'advanced');

    if (specialtyGames.length > 0) {
      const specialtyGame = specialtyGames[Math.floor(Math.random() * specialtyGames.length)];

      return {
        gameId: specialtyGame.id,
        title: specialtyGame.title,
        emoji: specialtyGame.emoji,
        difficulty: 5,
        reason: 'Master tier: Dive into specialized career scenarios.',
        nextAction: `Explore "${specialtyGame.title}" to refine your path.`,
        estimatedDuration: specialtyGame.duration,
      };
    }
  }

  // Fallback: Return any available game
  return allGames.length > 0
    ? {
        gameId: allGames[0].id,
        title: allGames[0].title,
        emoji: allGames[0].emoji,
        difficulty: 2,
        reason: 'Ready to explore? Pick any game that interests you.',
        nextAction: `Start with "${allGames[0].title}".`,
        estimatedDuration: allGames[0].duration,
      }
    : null;
}

/**
 * Compute success rate from game history.
 * Scores > 70 are considered "success".
 */
export function computeSuccessRate(gameScores: number[]): number {
  if (!gameScores.length) return 0;
  const successes = gameScores.filter(score => score > 70).length;
  return Math.round((successes / gameScores.length) * 100);
}

/**
 * Compute player performance metrics from available data
 */
export function calculatePlayerPerformance(
  reliabilityScore: number,
  completedGames: number,
  gameScores: number[] = []
): PlayerPerformance {
  const lastGameScore = gameScores.length > 0 ? gameScores[gameScores.length - 1] : 0;
  const successRate = computeSuccessRate(gameScores);

  return {
    reliabilityScore,
    completedGames,
    lastGameScore,
    successRate,
  };
}
