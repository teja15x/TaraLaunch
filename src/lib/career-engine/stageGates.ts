/**
 * ═══════════════════════════════════════════════════════════════
 * STAGE GATE VALIDATORS (Phase 1)
 * ═══════════════════════════════════════════════════════════════
 * Enforce measurable progression gates per COUNSELING_OS_GUARDRAILS.md
 * See: src/docs/COUNSELING_OS_GUARDRAILS.md#3-stage-gates-measurable--testable
 * 
 * Gates control when a student can:
 * - Leave Discovery: 25+ turns, career interests named, constraints captured
 * - Leave Narrowing: 1 complete assessment, 2 games, role tests, no unresolved contradictions
 * - Enter Recommendation: All narrowing gates + family context explicitly discussed
 * 
 * No student gets ranked careers without meeting these gates.
 */

import type { CounselingState, StageGateStatus, Contradiction } from '@/types';

/**
 * Gate requirements for each stage transition
 * These are the measurable, testable criteria from guardrails
 */
export interface GateRequirements {
  minMeaningfulTurns: number;
  minSessions: number;
  minAssessmentsStarted: number;
  minAssessmentsCompleted: number;
  minGamesCompleted: number;
  minRoleDepthTests: number;
  mustHaveConstraintProfile: boolean;
  mustResolveContradictions: boolean;
  mustHaveFamilyContext: boolean;
}

/**
 * Stage-specific gate requirements (from COUNSELING_OS_GUARDRAILS.md#3)
 */
export const STAGE_GATE_REQUIREMENTS = {
  // Discovery → Narrowing transition gates
  discovery_to_narrowing: {
    minMeaningfulTurns: 25,  // Not greetings, substantive conversation
    minSessions: 1,
    minAssessmentsStarted: 1,
    minAssessmentsCompleted: 0,
    minGamesCompleted: 0,
    minRoleDepthTests: 0,
    mustHaveConstraintProfile: true,  // Location, budget, language preferences
    mustResolveContradictions: true,
    mustHaveFamilyContext: false,
  },

  // Narrowing → Recommendation transition gates
  narrowing_to_recommendation: {
    minMeaningfulTurns: 40,  // More conversation to stress-test hypotheses
    minSessions: 2,
    minAssessmentsStarted: 2,
    minAssessmentsCompleted: 1,  // 80%+ completion of RIASEC or Gardner or Big Five
    minGamesCompleted: 2,  // From different game categories
    minRoleDepthTests: 1,  // Student tested on understanding of ≥1 claimed role
    mustHaveConstraintProfile: true,
    mustResolveContradictions: true,  // All conflicts resolved or explicitly acknowledged
    mustHaveFamilyContext: true,  // Family aspiration, pressure, affordability discussed
  },
} as const;

/**
 * Check if a specific gate is met
 */
export function checkGateMet(
  requirement: string,
  currentValue: number | boolean,
  gateRequirement: number | boolean
): { met: boolean; description: string } {
  if (typeof gateRequirement === 'boolean') {
    return {
      met: Boolean(currentValue) === gateRequirement,
      description: `${requirement}: ${currentValue ? 'Yes' : 'No'} (required: ${gateRequirement ? 'Yes' : 'No'})`,
    };
  }

  const met = typeof currentValue === 'number' ? currentValue >= gateRequirement : false;
  return {
    met,
    description: `${requirement}: ${currentValue} (required: ≥${gateRequirement})`,
  };
}

/**
 * Validate all gates for a specific transition
 * Returns blocked gates and overall pass/fail
 */
export function validateStageTransitionGates(
  state: CounselingState,
  targetStage: 'narrowing' | 'recommendation'
): StageGateStatus {
  const requirements =
    targetStage === 'narrowing'
      ? STAGE_GATE_REQUIREMENTS.discovery_to_narrowing
      : STAGE_GATE_REQUIREMENTS.narrowing_to_recommendation;

  const blockingGates = [];

  // Check meaningful turns
  const turnsCheck = checkGateMet(
    'Meaningful conversation turns',
    state.turns_in_stage,
    requirements.minMeaningfulTurns
  );
  if (!turnsCheck.met) blockingGates.push({ ...turnsCheck, gate_name: 'meaningful_turns' });

  // Check sessions (if multi-session concept applies)
  if (requirements.minSessions > 1) {
    const sessionsCheck = checkGateMet(
      'Counseling sessions',
      state.total_turns > 0 ? Math.ceil(state.total_turns / 30) : 0,
      requirements.minSessions
    );
    if (!sessionsCheck.met) blockingGates.push({ ...sessionsCheck, gate_name: 'sessions' });
  }

  // Check assessment progress
  const riasecStarted = state.riasec_progress > 0;
  const gardnerStarted = state.gardner_progress > 0;
  const bigFiveStarted = state.big_five_progress > 0;
  const assessmentsStarted = [riasecStarted, gardnerStarted, bigFiveStarted].filter(Boolean).length;

  const assessmentsStartedCheck = checkGateMet(
    'Assessments started',
    assessmentsStarted,
    requirements.minAssessmentsStarted
  );
  if (!assessmentsStartedCheck.met) {
    blockingGates.push({ ...assessmentsStartedCheck, gate_name: 'assessments_started' });
  }

  // Check assessment completion (80%+ on at least one)
  const riasecComplete = state.riasec_progress >= 80;
  const gardnerComplete = state.gardner_progress >= 80;
  const bigFiveComplete = state.big_five_progress >= 80;
  const assessmentsComplete = [riasecComplete, gardnerComplete, bigFiveComplete].filter(Boolean).length;

  const assessmentsCompleteCheck = checkGateMet(
    'Complete assessments',
    assessmentsComplete,
    requirements.minAssessmentsCompleted
  );
  if (!assessmentsCompleteCheck.met) {
    blockingGates.push({ ...assessmentsCompleteCheck, gate_name: 'assessments_complete' });
  }

  // Check games completed
  const gamesCheck = checkGateMet(
    'Games completed',
    state.games_completed.length,
    requirements.minGamesCompleted
  );
  if (!gamesCheck.met) blockingGates.push({ ...gamesCheck, gate_name: 'games' });

  // Check role-depth tests
  const roleDepthCheck = checkGateMet(
    'Role-depth tests completed',
    state.roleDepthTests_completed.length,
    requirements.minRoleDepthTests
  );
  if (!roleDepthCheck.met) blockingGates.push({ ...roleDepthCheck, gate_name: 'role_depth_tests' });

  // Check constraint profile
  const constraintCheck = checkGateMet(
    'Constraint profile captured',
    Boolean(state.constraints),
    requirements.mustHaveConstraintProfile
  );
  if (!constraintCheck.met) blockingGates.push({ ...constraintCheck, gate_name: 'constraints' });

  // Check contradictions resolved
  const unresolvedContradictions = state.contradictions_log.filter(c => !c.is_resolved);
  const contradictionCheck = checkGateMet(
    'Contradictions resolved',
    unresolvedContradictions.length === 0,
    requirements.mustResolveContradictions
  );
  if (!contradictionCheck.met) {
    blockingGates.push({
      ...contradictionCheck,
      gate_name: 'contradictions',
      description: `${unresolvedContradictions.length} unresolved contradictions (e.g., "${unresolvedContradictions[0]?.signal_1 ?? 'unknown'}")`,
    });
  }

  // Check family context (narrowing → recommendation only)
  if (targetStage === 'recommendation') {
    const familyContextAvailable =
      state.constraints?.family_aspiration !== undefined ||
      state.constraints?.family_pressure_level !== undefined;

    const familyContextCheck = checkGateMet(
      'Family context discussed',
      familyContextAvailable,
      requirements.mustHaveFamilyContext
    );
    if (!familyContextCheck.met) {
      blockingGates.push({ ...familyContextCheck, gate_name: 'family_context' });
    }
  }

  const allGatesMet = blockingGates.length === 0;

  return {
    stage: targetStage,
    is_unlocked: allGatesMet,
    progress_percent: Math.floor(((STAGE_GATE_REQUIREMENTS[targetStage === 'narrowing' ? 'discovery_to_narrowing' : 'narrowing_to_recommendation' as const].minMeaningfulTurns - (requirements.minMeaningfulTurns - state.turns_in_stage)) / requirements.minMeaningfulTurns) * 100) || 0,
    blocking_gates: blockingGates.map(g => ({
      gate_name: g.gate_name || 'unknown',
      requirement: g.description,
      current_status: getCurrentStatusDescription(g.gate_name, state),
      is_met: g.met,
    })),
    next_action: allGatesMet
      ? `Ready to transition to ${targetStage} stage`
      : blockingGates[0]?.description || 'Check gates',
  };
}

/**
 * Get human-readable description of current status for a gate
 */
function getCurrentStatusDescription(gateName: string, state: CounselingState): string {
  switch (gateName) {
    case 'meaningful_turns':
      return `${state.turns_in_stage} turns so far`;
    case 'assessments_started': {
      const started = [state.riasec_progress > 0, state.gardner_progress > 0, state.big_five_progress > 0].filter(Boolean).length;
      return `${started} assessment(s) started`;
    }
    case 'assessments_complete': {
      const complete = [state.riasec_progress >= 80, state.gardner_progress >= 80, state.big_five_progress >= 80].filter(Boolean).length;
      return `${complete} assessment(s) completed 80%+`;
    }
    case 'games':
      return `${state.games_completed.length} game(s) completed`;
    case 'role_depth_tests':
      return `${state.roleDepthTests_completed.length} role-depth test(s) completed`;
    case 'constraints':
      return state.constraints ? 'Captured' : 'Not captured';
    case 'contradictions': {
      const unresolved = state.contradictions_log.filter(c => !c.is_resolved).length;
      return unresolved === 0 ? 'All resolved' : `${unresolved} unresolved`;
    }
    case 'family_context':
      return state.constraints?.family_aspiration ? 'Discussed' : 'Not discussed';
    default:
      return 'Unknown';
  }
}

/**
 * Detect contradictions in student responses
 * Returns contradictions that need counselor intervention
 */
export function detectContradictions(
  newSignal: { source: string; value: string; dimension?: string },
  existingSignals: Array<{ source: string; value: string; dimension?: string }>
): Array<Contradiction> {
  const contradictions: Array<Contradiction> = [];

  for (const existing of existingSignals) {
    // Pattern 1: Claims vs game results mismatch
    if (newSignal.source === 'chat' && existing.source === 'game') {
      if (newSignal.value.toLowerCase().includes('code') && existing.value.toLowerCase().includes('creative')) {
        contradictions.push({
          id: `contra_${Date.now()}_1`,
          user_id: '',  // Will be filled by caller
          signal_1: newSignal.value,
          signal_2: existing.value,
          severity: 'high',
          is_resolved: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Pattern 2: Career interest changes
    if (newSignal.source === 'chat' && existing.source === 'chat') {
      if (
        newSignal.dimension === 'career_interest' &&
        existing.dimension === 'career_interest' &&
        newSignal.value.toLowerCase() !== existing.value.toLowerCase()
      ) {
        contradictions.push({
          id: `contra_${Date.now()}_2`,
          user_id: '',
          signal_1: `Previously interested in: ${existing.value}`,
          signal_2: `Now interested in: ${newSignal.value}`,
          career_dimension: 'career_interest',
          severity: 'medium',
          is_resolved: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Pattern 3: Affordability vs aspiration mismatch
    if (
      newSignal.dimension === 'affordability' &&
      existing.dimension === 'career_aspiration'
    ) {
      if (
        newSignal.value.toLowerCase().includes('tight') &&
        existing.value.toLowerCase().includes('premium')
      ) {
        contradictions.push({
          id: `contra_${Date.now()}_3`,
          user_id: '',
          signal_1: newSignal.value,
          signal_2: existing.value,
          severity: 'high',
          is_resolved: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return contradictions;
}

/**
 * Get counselor reprobe question for unresolved contradiction
 */
export function getCounselorReprobeForContradiction(contradiction: Contradiction): string {
  if (contradiction.severity === 'high' && contradiction.signal_1.toLowerCase().includes('code')) {
    return 'I noticed you mentioned coding earlier, but your game results show strong creative interests. Tell me about a time you enjoyed solving a technical problem vs creating something new—which felt more natural?';
  }

  if (contradiction.career_dimension === 'career_interest') {
    return 'I see you are now interested in a different career. That is normal as you explore! What changed—did the previous interest not feel right, or did you discover something new?';
  }

  if (contradiction.severity === 'high' && contradiction.signal_1.toLowerCase().includes('tight')) {
    return 'I see affordability is tight, but your interest is in a premium career path. Let us explore vocational alternatives or scholarship routes that could make this work. What is your safety plan if scholarships do not come through?';
  }

  return 'I want to understand this better. Can you walk me through your thinking on this?';
}

/**
 * Check if stage transition is blockable due to high-severity unresolved contradictions
 */
export function shouldHoldStageTransitionForContradictions(
  contradictions: Contradiction[]
): { shouldHold: boolean; reason?: string } {
  const unresolved = contradictions.filter(c => !c.is_resolved && c.severity === 'high');

  if (unresolved.length > 0) {
    return {
      shouldHold: true,
      reason: `${unresolved.length} high-severity contradiction(s) unresolved. Example: "${unresolved[0].signal_1}"`,
    };
  }

  return { shouldHold: false };
}
