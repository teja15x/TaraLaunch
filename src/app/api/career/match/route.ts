import { NextRequest, NextResponse } from 'next/server';
import { matchCareersAdvanced } from '@/lib/career-engine';
import { careerDatabase } from '@/data/careers';
import { matchCareers } from '@/lib/careers';
import { validateStageTransitionGates, shouldHoldStageTransitionForContradictions } from '@/lib/career-engine/stageGates';
import type { TraitScores, CounselingState } from '@/types';

type ClarityBand = 'low' | 'medium' | 'high';
type CounselingStage = 'discovery' | 'narrowing' | 'recommendation';

interface CounselingContext {
  sessionNumber?: number;
  meaningfulTurns?: number;
  completedAssessments?: number;
  completedGames?: number;
  contradictionsResolved?: boolean;
  constraintsCaptured?: boolean;
}

function getClarityBand(context: CounselingContext): ClarityBand {
  let evidence = 0;
  if ((context.meaningfulTurns ?? 0) >= 25) evidence += 1;
  if ((context.sessionNumber ?? 1) >= 2) evidence += 1;
  if ((context.completedAssessments ?? 0) >= 1) evidence += 1;
  if ((context.completedAssessments ?? 0) >= 2) evidence += 1;
  if ((context.completedGames ?? 0) >= 1) evidence += 1;
  if (context.constraintsCaptured) evidence += 1;
  if (context.contradictionsResolved) evidence += 1;

  if (evidence <= 2) return 'low';
  if (evidence <= 5) return 'medium';
  return 'high';
}

function getCounselingStage(context: CounselingContext): CounselingStage {
  const sessionNumber = context.sessionNumber ?? 1;
  const meaningfulTurns = context.meaningfulTurns ?? 0;
  const completedAssessments = context.completedAssessments ?? 0;
  const completedGames = context.completedGames ?? 0;
  const constraintsCaptured = context.constraintsCaptured ?? false;
  const contradictionsResolved = context.contradictionsResolved ?? false;

  if (sessionNumber <= 1 || meaningfulTurns < 25) {
    return 'discovery';
  }

  if (
    completedAssessments < 2 ||
    completedGames < 1 ||
    !constraintsCaptured ||
    !contradictionsResolved
  ) {
    return 'narrowing';
  }

  return 'recommendation';
}

function getCareerClusters(traitScores: TraitScores) {
  const preliminary = matchCareersAdvanced(traitScores, careerDatabase).slice(0, 20);
  const grouped = new Map<string, { total: number; count: number; samples: string[] }>();

  for (const item of preliminary) {
    const key = item.career.category;
    const current = grouped.get(key) ?? { total: 0, count: 0, samples: [] };
    current.total += item.overallScore;
    current.count += 1;
    if (current.samples.length < 3) {
      current.samples.push(item.career.title);
    }
    grouped.set(key, current);
  }

  return Array.from(grouped.entries())
    .map(([category, data]) => ({
      category,
      averageAlignment: Math.round(data.total / data.count),
      sampleRoles: data.samples,
    }))
    .sort((a, b) => b.averageAlignment - a.averageAlignment)
    .slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const { traitScores, useAdvanced, counselingContext, counselingState } = await request.json() as {
      traitScores: TraitScores;
      useAdvanced?: boolean;
      counselingContext?: CounselingContext;
      counselingState?: Partial<CounselingState>;
    };

    if (!traitScores) {
      return NextResponse.json({ error: 'Trait scores required' }, { status: 400 });
    }

    const stage = getCounselingStage(counselingContext ?? {});
    const clarityBand = getClarityBand(counselingContext ?? {});

    // Phase 1: Rigorous stage gate validation
    // If state provided, use new validators; otherwise fall back to legacy logic
    let stageGateStatus = null;
    let shouldBlockRecommendation = false;

    if (counselingState && stage !== 'discovery') {
      const fullState: CounselingState = {
        id: counselingState.id ?? 'guest',
        user_id: counselingState.user_id ?? 'guest',
        session_id: counselingState.session_id ?? 'session_1',
        current_stage: stage as any,
        stage_gates: counselingState.stage_gates ?? { stage: stage as any, is_unlocked: false, progress_percent: 0, blocking_gates: [], next_action: '' },
        turns_in_stage: counselingState.turns_in_stage ?? counselingContext?.meaningfulTurns ?? 0,
        evidence_log: counselingState.evidence_log ?? [],
        contradictions_log: counselingState.contradictions_log ?? [],
        constraints: counselingState.constraints ?? undefined,
        hypotheses: counselingState.hypotheses ?? [],
        riasec_progress: counselingState.riasec_progress ?? 0,
        gardner_progress: counselingState.gardner_progress ?? 0,
        big_five_progress: counselingState.big_five_progress ?? 0,
        games_completed: counselingState.games_completed ?? [],
        roleDepthTests_completed: counselingState.roleDepthTests_completed ?? [],
        created_at: counselingState.created_at ?? new Date().toISOString(),
        last_updated_at: counselingState.last_updated_at ?? new Date().toISOString(),
        total_turns: counselingState.total_turns ?? 0,
        language: counselingState.language ?? 'en-IN',
        age_tier: counselingState.age_tier ?? 'discoverer',
      };

      // Validate recommendation stage gates
      if (stage === 'recommendation') {
        stageGateStatus = validateStageTransitionGates(fullState, 'recommendation');
        
        // Check for blocking contradictions
        const contradictionHold = shouldHoldStageTransitionForContradictions(fullState.contradictions_log);
        
        if (!stageGateStatus.is_unlocked || contradictionHold.shouldHold) {
          shouldBlockRecommendation = true;
        }
      }
    }

    if (stage !== 'recommendation' || shouldBlockRecommendation) {
      const clusters = getCareerClusters(traitScores);
      const stageMessage =
        stage === 'discovery'
          ? 'We are in exploration phase. We will first understand your strengths, constraints, and motivation before showing ranked careers.'
          : 'We have enough signals to narrow your path. Let us validate one more assessment/game before showing final ranked recommendations.';

      const blockingGatesInfo = stageGateStatus
        ? ` Blocking gates: ${stageGateStatus.blocking_gates.map(g => `${g.gate_name} (${g.current_status})`).join(', ')}`
        : '';

      return NextResponse.json({
        stage,
        clarityBand,
        shouldShowRanking: false,
        shouldShowNumericConfidence: false,
        counselorMessage: stageMessage + (blockingGatesInfo ? ` [${blockingGatesInfo}]` : ''),
        clusters,
        stageGateStatus: stageGateStatus ?? undefined,
        phase1_gated: true,  // Indicates that Phase 1 stage gating is active
      });
    }

    // Stage = recommendation AND all gates passed
    if (useAdvanced) {
      // New multi-dimensional matching (RIASEC + Gardner + Traits)
      const advancedMatches = matchCareersAdvanced(traitScores, careerDatabase).slice(0, 10);
      return NextResponse.json({
        stage,
        clarityBand,
        shouldShowRanking: true,
        shouldShowNumericConfidence: true,
        matches: advancedMatches.map(m => ({
          career: {
            title: m.career.title,
            category: m.career.category,
            description: m.career.description,
            salary_range: m.career.salary_range_inr,
            growth_outlook: m.career.growth_outlook,
            required_skills: m.career.required_skills,
            education: m.career.education_path[0],
            education_path: m.career.education_path,
            required_traits: m.career.required_traits,
          },
          score: m.overallScore,
          riasecScore: m.riasecScore,
          gardnerScore: m.gardnerScore,
          traitScore: m.traitScore,
          confidence: m.overallScore,
          topAlignedTraits: m.topAlignedTraits,
          topAlignedIntelligences: m.topAlignedIntelligences,
          alignment: Object.fromEntries(
            m.topAlignedTraits.map(t => [t, traitScores[t as keyof TraitScores] || 0])
          ),
        })),
        phase1_gated: true,
      });
    }

    // Legacy matching (backward compatible)
    const matches = matchCareers(traitScores).slice(0, 5);
    return NextResponse.json({
      stage,
      clarityBand,
      shouldShowRanking: true,
      shouldShowNumericConfidence: true,
      matches,
      phase1_gated: true,
    });
  } catch (error) {
    console.error('Career match error:', error);
    return NextResponse.json({ error: 'Failed to match careers' }, { status: 500 });
  }
}
