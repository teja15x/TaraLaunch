/**
 * ═══════════════════════════════════════════════════════════════
 * EVIDENCE AGGREGATION FOR EXPLAINABILITY (Phase 2+4)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Query and aggregate evidence by career dimension to build
 * explainability fields for ranking responses.
 * 
 * Used by Phase 4 (API contract) to populate:
 * - supporting_evidence[]
 * - contradictions_resolved[]
 * - rejected_alternatives[]
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { EvidenceItem, Contradiction } from '@/types';

/**
 * Evidence aggregation for a specific career
 */
export interface CareerEvidenceAggregate {
  careerId: string;
  supportingEvidence: Array<{
    source: string;
    signal: string;
    weight: number;
    timestamp: string;
  }>;
  contradictionsResolved: Array<{
    conflict: string;
    resolution: string;
    counselorMove: string;
  }>;
  totalWeight: number;
  confidenceBand: 'low' | 'medium' | 'high';
  evidenceQuality: 'weak' | 'moderate' | 'strong';
}

/**
 * Aggregate all evidence supporting a career recommendation
 * @param supabase Supabase client
 * @param sessionId Counseling session ID
 * @param careerId Career ID (e.g., "software-engineer")
 * @param excludeSources Skip certain evidence sources (e.g., ['game'] to exclude games)
 * @returns Aggregated evidence for explainability
 */
export async function aggregateCareerEvidence(
  supabase: SupabaseClient,
  sessionId: string,
  careerId: string,
  excludeSources: string[] = []
): Promise<CareerEvidenceAggregate> {
  // Fetch all evidence for session
  const { data: allEvidence, error: evidenceError } = await supabase
    .from('evidence_log')
    .select('*')
    .eq('session_id', sessionId);

  if (evidenceError) {
    console.error('Failed to fetch evidence:', evidenceError);
    return {
      careerId,
      supportingEvidence: [],
      contradictionsResolved: [],
      totalWeight: 0,
      confidenceBand: 'low',
      evidenceQuality: 'weak',
    };
  }

  // Fetch contradictions
  const { data: allContradictions, error: contraError } = await supabase
    .from('contradictions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_resolved', true);

  if (contraError) {
    console.error('Failed to fetch contradictions:', contraError);
  }

  // Filter and score evidence for this career
  const relevantEvidence = (allEvidence || [])
    .filter(e => !excludeSources.includes(e.source))
    .filter(e => isEvidenceRelevantToCareer(e, careerId))
    .map(e => ({
      source: e.source,
      signal: e.signal,
      weight: e.weight,
      timestamp: e.created_at,
    }))
    .sort((a, b) => b.weight - a.weight);

  const totalWeight = relevantEvidence.reduce((sum, e) => sum + (e.weight || 0), 0);

  // Aggregate contradictions (if any were about this career)
  const relevantContradictions = (allContradictions || [])
    .filter(c => isContradictionRelevantToCareer(c, careerId))
    .map(c => ({
      conflict: c.signal_1,
      resolution: c.resolution_move || 'Acknowledged and addressed',
      counselorMove: `Counselor reprobe: ${c.resolution_move || 'Discussed with student'}`,
    }));

  // Determine confidence band based on evidence quality
  const confidenceBand = getConfidenceBand(relevantEvidence, totalWeight);
  const evidenceQuality = getEvidenceQuality(relevantEvidence);

  return {
    careerId,
    supportingEvidence: relevantEvidence.slice(0, 5),  // Top 5 evidence items
    contradictionsResolved: relevantContradictions,
    totalWeight,
    confidenceBand,
    evidenceQuality,
  };
}

/**
 * Get top evidence across ALL careers for session-level quality assessment
 */
export async function getSessionEvidenceQuality(
  supabase: SupabaseClient,
  sessionId: string
): Promise<{
  overallQuality: 'weak' | 'moderate' | 'strong';
  primarySources: string[];
  evidenceCount: number;
  sourceBreakdown: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from('evidence_log')
    .select('source')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Failed to assess evidence quality:', error);
    return {
      overallQuality: 'weak',
      primarySources: [],
      evidenceCount: 0,
      sourceBreakdown: {},
    };
  }

  const sourceBreakdown: Record<string, number> = {};
  (data || []).forEach(e => {
    sourceBreakdown[e.source] = (sourceBreakdown[e.source] || 0) + 1;
  });

  const sources = Object.keys(sourceBreakdown);
  const primarySources = sources.sort((a, b) => (sourceBreakdown[b] || 0) - (sourceBreakdown[a] || 0));

  // Quality determination
  const totalEvidence = data?.length || 0;
  const hasChat = sourceBreakdown['chat'] || 0;
  const hasAssessment = sourceBreakdown['assessment'] || 0;
  const hasGame = sourceBreakdown['game'] || 0;
  const hasConstraint = sourceBreakdown['constraint'] || 0;

  let overallQuality: 'weak' | 'moderate' | 'strong' = 'weak';
  if (hasAssessment > 0 && hasChat > 5 && hasGame > 1) {
    overallQuality = 'strong';
  } else if ((hasAssessment > 0 || hasGame > 0) && hasChat > 3) {
    overallQuality = 'moderate';
  }

  return {
    overallQuality,
    primarySources: primarySources.slice(0, 3),
    evidenceCount: totalEvidence,
    sourceBreakdown,
  };
}

/**
 * Build narrative description of why a career matches
 * Used for explainability summaries
 */
export function buildCareerExplanationNarrative(
  careerId: string,
  aggregate: CareerEvidenceAggregate,
  studentName?: string
): string {
  if (aggregate.supportingEvidence.length === 0) {
    return `Not enough evidence to explain this recommendation.`;
  }

  const topEvidence = aggregate.supportingEvidence[0];
  const studentRef = studentName ? `${studentName},` : 'You';
  const sourceLabel = mapSourceToLabel(topEvidence.source);

  let narrative = `${studentRef} your ${sourceLabel} -- ${topEvidence.signal} -- suggests this career path aligns with your strengths.`;

  if (aggregate.supportingEvidence.length > 1) {
    const secondEvidence = aggregate.supportingEvidence[1];
    narrative += ` Additionally, ${mapSourceToLabel(secondEvidence.source)} indicates ${secondEvidence.signal.toLowerCase()}.`;
  }

  if (aggregate.contradictionsResolved.length > 0) {
    narrative += ` We addressed a tension in your profile and confirmed this path is still right for you.`;
  }

  narrative += ` This recommendation has ${aggregate.confidenceBand} confidence based on ${aggregate.supportingEvidence.length} evidence sources.`;

  return narrative;
}

/**
 * Helper: Determine if evidence is relevant to a career
 */
function isEvidenceRelevantToCareer(evidence: any, careerId: string): boolean {
  // For now, assume all evidence is system-wide relevant
  // In Phase 4+, we'll refine this to filter by career-specific dimensions
  return true;
}

/**
 * Helper: Determine if contradiction is relevant to a career
 */
function isContradictionRelevantToCareer(contradiction: any, careerId: string): boolean {
  // For now, include all contradictions that were resolved
  // In Phase 4+, filter by career-specific contradictions
  return contradiction.is_resolved === true;
}

/**
 * Helper: Map evidence source to human-readable label
 */
function mapSourceToLabel(source: string): string {
  const labels: Record<string, string> = {
    chat: 'conversation with our counselor',
    game: 'assessment game',
    assessment: 'formal assessment',
    constraint: 'your stated constraints',
    roleDepthTest: 'role understanding test',
  };
  return labels[source] || source;
}

/**
 * Helper: Determine confidence band based on evidence
 */
function getConfidenceBand(
  evidence: Array<{ weight: number }>,
  totalWeight: number
): 'low' | 'medium' | 'high' {
  if (totalWeight >= 0.60) return 'high';
  if (totalWeight >= 0.35) return 'medium';
  return 'low';
}

/**
 * Helper: Assess evidence quality
 */
function getEvidenceQuality(evidence: Array<{ source: string }>): 'weak' | 'moderate' | 'strong' {
  const uniqueSources = new Set(evidence.map(e => e.source));

  if (uniqueSources.size >= 3 && evidence.length >= 4) {
    return 'strong';
  } else if (uniqueSources.size >= 2 && evidence.length >= 2) {
    return 'moderate';
  }

  return 'weak';
}

/**
 * Get recommended next actions for student based on evidence gaps
 */
export function getNextValidationActions(
  allEvidence: Array<{ source: string }>,
  constraints?: any
): string[] {
  const actions: string[] = [];
  const sources = new Set(allEvidence.map(e => e.source));

  if (!sources.has('assessment')) {
    actions.push('Complete RIASEC assessment to validate academic strengths');
  }

  if (!sources.has('game') || allEvidence.filter(e => e.source === 'game').length < 2) {
    actions.push('Play 1-2 more games to stress-test your career fit');
  }

  if (!sources.has('roleDepthTest')) {
    actions.push('Take role understanding test to confirm career awareness');
  }

  if (!constraints || !constraints.family_aspiration) {
    actions.push('Discuss family expectations to align recommendations with home context');
  }

  return actions;
}
