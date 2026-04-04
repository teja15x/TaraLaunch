/**
 * ═══════════════════════════════════════════════════════════════
 * EVIDENCE PERSISTENCE HELPERS (Phase 2)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Supabase operations for:
 * - Logging evidence from assessments, games, chat, constraints
 * - Tracking contradictions and resolutions
 * - Managing constraint profiles
 * - Querying evidence for explainability
 * 
 * See: src/types/index.ts (EvidenceItem, Contradiction, ConstraintProfile)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  EvidenceItem,
  Contradiction,
  ConstraintProfile,
  CounselingState,
} from '@/types';

/**
 * Log a single piece of evidence to the database
 * @param supabase Supabase client
 * @param userId User ID
 * @param sessionId Counseling session ID
 * @param evidence Evidence item to log
 * @returns Created evidence item with ID
 */
export async function logEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  evidence: Omit<EvidenceItem, 'id' | 'user_id' | 'created_at' | 'timestamp'>
): Promise<EvidenceItem | null> {
  const { data, error } = await supabase
    .from('evidence_log')
    .insert({
      user_id: userId,
      session_id: sessionId,
      source: evidence.source,
      source_id: evidence.source_id,
      signal: evidence.signal,
      career_dimension: evidence.career_dimension,
      signal_value: evidence.signal_value,
      weight: evidence.weight,
      resolved_contradiction_id: evidence.resolved_contradiction,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to log evidence:', error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    source: data.source,
    source_id: data.source_id,
    signal: data.signal,
    career_dimension: data.career_dimension,
    signal_value: data.signal_value,
    weight: data.weight,
    timestamp: data.created_at,
    resolved_contradiction: data.resolved_contradiction_id,
    created_at: data.created_at,
  };
}

/**
 * Log a game result as evidence
 * @param supabase Supabase client
 * @param userId User ID
 * @param sessionId Session ID
 * @param gameId Game ID
 * @param score Game score (0-100)
 * @param careerDimension Primary dimension tested (e.g., "investigative")
 * @param maxWeight Maximum weight this game can contribute (default 0.15)
 */
export async function logGameEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  gameId: string,
  score: number,
  careerDimension: string,
  maxWeight: number = 0.15
): Promise<EvidenceItem | null> {
  // Game evidence contribution: scale by score quality
  const normalizedScore = Math.min(100, Math.max(0, score));
  const weight = (normalizedScore / 100) * maxWeight;

  const gameTitle = getGameTitleById(gameId) || gameId;

  return logEvidence(supabase, userId, sessionId, {
    source: 'game',
    source_id: gameId,
    signal: `${gameTitle} ${score}%: Assessment of ${careerDimension} dimension`,
    career_dimension: careerDimension,
    signal_value: normalizedScore,
    weight,
  });
}

/**
 * Log assessment result as evidence
 * @param supabase Supabase client
 * @param userId User ID
 * @param sessionId Session ID
 * @param assessmentType e.g., 'riasec', 'gardner', 'big_five'
 * @param dimension e.g., 'investigative', 'linguistic'
 * @param score Dimension score (0-100)
 */
export async function logAssessmentEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  assessmentType: string,
  dimension: string,
  score: number
): Promise<EvidenceItem | null> {
  const normalizedScore = Math.min(100, Math.max(0, score));
  // Assessments have higher weight (0.20-0.30 depending on completeness)
  const weight = (normalizedScore / 100) * 0.25;

  return logEvidence(supabase, userId, sessionId, {
    source: 'assessment',
    source_id: `${assessmentType}_${dimension}`,
    signal: `${assessmentType.toUpperCase()} ${dimension}: ${score}%`,
    career_dimension: dimension,
    signal_value: normalizedScore,
    weight,
  });
}

/**
 * Log constraint as evidence
 * @param supabase Supabase client
 * @param userId User ID
 * @param sessionId Session ID
 * @param constraintType Type of constraint (e.g., 'affordability', 'location')
 * @param constraintValue The constraint value (e.g., 'tight', 'within_state')
 */
export async function logConstraintEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  constraintType: string,
  constraintValue: string
): Promise<EvidenceItem | null> {
  return logEvidence(supabase, userId, sessionId, {
    source: 'constraint',
    source_id: constraintType,
    signal: `Student constraint: ${constraintType} = ${constraintValue}`,
    career_dimension: 'constraint',
    signal_value: 50,  // Neutral value for constraints
    weight: 0.05,  // Constraints have low individual weight but gate recommendations
  });
}

/**
 * Log role-depth test result as evidence
 * @param supabase Supabase client
 * @param userId User ID
 * @param sessionId Session ID
 * @param roleId Career role tested (e.g., 'software-engineer')
 * @param depthLevel Result depth level ('surface', 'intermediate', 'advanced')
 * @param misconceptionCalibration Misconception calibration score (-50 to +50)
 */
export async function logRoleDepthTestEvidence(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  roleId: string,
  depthLevel: string,
  misconceptionCalibration: number
): Promise<EvidenceItem | null> {
  // Role depth tests have moderate weight
  const depthScore = depthLevelToScore(depthLevel);
  const weight = 0.15;

  return logEvidence(supabase, userId, sessionId, {
    source: 'roleDepthTest',
    source_id: roleId,
    signal: `Role understanding for ${roleId}: ${depthLevel} level (misconception calibration: ${misconceptionCalibration > 0 ? '+' : ''}${misconceptionCalibration})`,
    career_dimension: 'role_understanding',
    signal_value: depthScore,
    weight,
  });
}

/**
 * Record a detected contradiction
 */
export async function logContradiction(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  contradiction: Omit<Contradiction, 'id' | 'user_id' | 'created_at'>
): Promise<Contradiction | null> {
  const { data, error } = await supabase
    .from('contradictions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      signal_1: contradiction.signal_1,
      signal_2: contradiction.signal_2,
      career_dimension: contradiction.career_dimension,
      severity: contradiction.severity,
      is_resolved: contradiction.is_resolved,
      resolution_move: contradiction.resolution_move,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to log contradiction:', error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    signal_1: data.signal_1,
    signal_2: data.signal_2,
    career_dimension: data.career_dimension,
    severity: data.severity,
    is_resolved: data.is_resolved,
    resolution_move: data.resolution_move,
    created_at: data.created_at,
  };
}

/**
 * Mark a contradiction as resolved
 */
export async function resolveContradiction(
  supabase: SupabaseClient,
  contradictionId: string,
  resolutionMove: string
): Promise<Contradiction | null> {
  const { data, error } = await supabase
    .from('contradictions')
    .update({
      is_resolved: true,
      resolution_move: resolutionMove,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', contradictionId)
    .select()
    .single();

  if (error) {
    console.error('Failed to resolve contradiction:', error);
    return null;
  }

  return data;
}

/**
 * Get all unresolved contradictions for a session
 */
export async function getUnresolvedContradictions(
  supabase: SupabaseClient,
  sessionId: string
): Promise<Contradiction[]> {
  const { data, error } = await supabase
    .from('contradictions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_resolved', false)
    .order('severity', { ascending: false });

  if (error) {
    console.error('Failed to fetch contradictions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    user_id: row.user_id,
    signal_1: row.signal_1,
    signal_2: row.signal_2,
    career_dimension: row.career_dimension,
    severity: row.severity,
    is_resolved: row.is_resolved,
    resolution_move: row.resolution_move,
    created_at: row.created_at,
  }));
}

/**
 * Save or update constraint profile
 */
export async function saveConstraintProfile(
  supabase: SupabaseClient,
  userId: string,
  constraints: ConstraintProfile
): Promise<ConstraintProfile | null> {
  // Calculate completion score
  const completionFields = [
    constraints.location_flexibility,
    constraints.affordability_level,
    constraints.family_aspiration,
    constraints.parent_risk_tolerance,
    constraints.family_pressure_level,
  ].filter(Boolean).length;

  const completionScore = completionFields / 5;
  const isComplete = completionScore >= 0.8;

  const { data, error } = await supabase
    .from('constraint_profiles')
    .upsert({
      user_id: userId,
      location_flexibility: constraints.location_flexibility,
      affordability_level: constraints.affordability_level,
      language_preferences: constraints.language_preferences,
      family_aspiration: constraints.family_aspiration,
      parent_risk_tolerance: constraints.parent_risk_tolerance,
      family_pressure_level: constraints.family_pressure_level,
      time_to_decision: constraints.time_to_decision,
      is_complete: isComplete,
      completion_score: completionScore,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save constraint profile:', error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    location_flexibility: data.location_flexibility,
    affordability_level: data.affordability_level,
    language_preferences: data.language_preferences ?? [],
    family_aspiration: data.family_aspiration,
    parent_risk_tolerance: data.parent_risk_tolerance,
    family_pressure_level: data.family_pressure_level,
    time_to_decision: data.time_to_decision,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Get or create counseling session for user
 */
export async function getOrCreateCounselingSession(
  supabase: SupabaseClient,
  userId: string,
  ageTier: string = 'discoverer',
  language: string = 'en-IN'
): Promise<CounselingState | null> {
  // Check if session exists
  const { data: existing } = await supabase
    .from('counseling_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return rowToCounselingState(existing);
  }

  // Create new session
  const { data, error } = await supabase
    .from('counseling_sessions')
    .insert({
      user_id: userId,
      age_tier: ageTier,
      language,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create counseling session:', error);
    return null;
  }

  return rowToCounselingState(data);
}

/**
 * Get evidence summary for explainability
 */
export async function getEvidenceSummary(
  supabase: SupabaseClient,
  sessionId: string
): Promise<{
  totalEvidence: number;
  chatCount: number;
  gameCount: number;
  assessmentCount: number;
  constraintCount: number;
  roleTestCount: number;
  unresolvedContradictions: number;
} | null> {
  const { data, error } = await supabase
    .rpc('get_evidence_summary', { session_id: sessionId });

  if (error) {
    console.error('Failed to get evidence summary:', error);
    return null;
  }

  return {
    totalEvidence: data[0]?.total_evidence || 0,
    chatCount: data[0]?.chat_count || 0,
    gameCount: data[0]?.game_count || 0,
    assessmentCount: data[0]?.assessment_count || 0,
    constraintCount: data[0]?.constraint_count || 0,
    roleTestCount: data[0]?.role_test_count || 0,
    unresolvedContradictions: data[0]?.unresolved_contradictions || 0,
  };
}

/**
 * Helper: Convert depth level to score
 */
function depthLevelToScore(depthLevel: string): number {
  switch (depthLevel.toLowerCase()) {
    case 'surface':
      return 33;
    case 'intermediate':
      return 66;
    case 'advanced':
      return 100;
    default:
      return 50;
  }
}

/**
 * Helper: Get game title by ID
 */
function getGameTitleById(gameId: string): string | null {
  const titleMap: Record<string, string> = {
    'scenario-quest': 'ScenarioQuest',
    'pattern-master': 'PatternMaster',
    'story-weaver': 'StoryWeaver',
    'rhythm-match': 'RhythmMatch',
    'nature-detective': 'NatureDetective',
    'the-organizer': 'TheOrganizer',
    'debate-club': 'DebateClub',
    'team-leader': 'TeamLeader',
    'creative-canvas': 'CreativeCanvas',
    'decision-maze': 'DecisionMaze',
    'budget-tradeoff-lab': 'BudgetTradeoffLab',
  };
  return titleMap[gameId] || null;
}

/**
 * Helper: Convert Supabase row to CounselingState
 */
function rowToCounselingState(row: any): CounselingState {
  return {
    id: row.id,
    user_id: row.user_id,
    session_id: row.id,  // In this case, session ID is same as state ID
    current_stage: row.current_stage ?? 'discovery',
    stage_gates: {
      stage: row.current_stage ?? 'discovery',
      is_unlocked: false,
      progress_percent: 0,
      blocking_gates: [],
      next_action: '',
    },
    turns_in_stage: row.turns_in_stage ?? 0,
    evidence_log: [],
    contradictions_log: [],
    constraints: undefined,
    hypotheses: [],
    riasec_progress: row.riasec_progress ?? 0,
    gardner_progress: row.gardner_progress ?? 0,
    big_five_progress: row.big_five_progress ?? 0,
    games_completed: row.games_completed ?? [],
    roleDepthTests_completed: row.role_depth_tests_completed ?? [],
    created_at: row.created_at,
    last_updated_at: row.last_active,
    total_turns: row.total_turns ?? 0,
    language: row.language ?? 'en-IN',
    age_tier: row.age_tier ?? 'discoverer',
  };
}
