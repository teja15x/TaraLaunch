import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, hasSupabaseServerConfig } from '@/lib/supabase/server';
import { getChatCompletion } from '@/lib/openai/client';
import {
  buildCareerAgentSystemPrompt,
  getResolvedConversationStyleForLanguage,
  getDefaultScriptPreference,
  normalizeCounselingLanguage,
  normalizeConversationStyle,
  normalizeScriptPreference,
} from '@/lib/career-agent/prompt';
import { deriveCounselingTrack, detectStageOverride, detectStudentStage, StudentStage } from '@/lib/career-agent/stageDetection';
import { buildKnowledgeBasePromptBlock, buildKnowledgeDecision } from '@/lib/career-agent/knowledgeBase';
import { detectRoleMentionFromText } from '@/lib/career-agent/roleKnowledge';
import { buildRecommendationGateDecision } from '@/lib/career-agent/recommendationGate';
import { applyMarketRealities } from '@/lib/career-engine/marketReality';
import { diagnoseConfusion } from '@/lib/career-engine/confusionMatrix';
import { careerDatabase } from '@/data/careers';
import { detectContradictions, getCounselorReprobeForContradiction } from '@/lib/career-engine/stageGates';
import { extractActionItems } from '@/lib/career-engine/actionExtraction';
import { getAgeTier, type AgeTier } from '@/utils/helpers';

const MAX_HISTORY = 30;

function resolveKnowledgeRetrievalMode(): 'core' | 'expanded' {
  const raw = (process.env.KNOWLEDGE_RETRIEVAL_MODE ?? 'expanded').trim().toLowerCase();
  return raw === 'core' ? 'core' : 'expanded';
}

interface ChatRequestBody {
  message?: string;
  messages?: Array<{ role?: string; content?: string }>;
  preferredLanguage?: string;
  conversationStyle?: string;
  scriptPreference?: string;
  selectedRole?: string;
  voiceMode?: boolean;
  voiceSessionStart?: boolean;
  detectedStage?: string;
  studentIntake?: {
    studentName?: string;
    currentStage?: string;
    stateOrCity?: string;
    collegeRecommendationScope?: 'state-first' | 'india-wide';
    comparisonFocus?: string;
    currentSituation?: string;
    interests?: string;
    confusion?: string;
    stressors?: string;
    familyPressure?: string;
    targetRole?: string;
  };
}

interface StudentIntakePayload {
  studentName?: string;
  currentStage?: string;
  stateOrCity?: string;
  collegeRecommendationScope?: 'state-first' | 'india-wide';
  comparisonFocus?: string;
  currentSituation?: string;
  interests?: string;
  confusion?: string;
  stressors?: string;
  familyPressure?: string;
  targetRole?: string;
}

function sanitizeSelectedRole(role?: string): string | null {
  if (!role || typeof role !== 'string') return null;
  const trimmed = role.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 100);
}

function sanitizeFreeText(value?: string, maxLength = 240): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function sanitizeStudentIntake(input?: StudentIntakePayload | null): StudentIntakePayload | null {
  if (!input) return null;

  const scope: 'state-first' | 'india-wide' | undefined =
    input.collegeRecommendationScope === 'india-wide'
      ? 'india-wide'
      : input.collegeRecommendationScope === 'state-first'
        ? 'state-first'
        : undefined;

  const sanitized: StudentIntakePayload = {
    studentName: sanitizeFreeText(input.studentName, 80),
    currentStage: sanitizeFreeText(input.currentStage, 80),
    stateOrCity: sanitizeFreeText(input.stateOrCity, 80),
    collegeRecommendationScope: scope,
    comparisonFocus: sanitizeFreeText(input.comparisonFocus, 160),
    currentSituation: sanitizeFreeText(input.currentSituation, 220),
    interests: sanitizeFreeText(input.interests, 220),
    confusion: sanitizeFreeText(input.confusion, 220),
    stressors: sanitizeFreeText(input.stressors, 220),
    familyPressure: sanitizeFreeText(input.familyPressure, 220),
    targetRole: sanitizeFreeText(input.targetRole, 100),
  };

  if (!Object.values(sanitized).some(Boolean)) {
    return null;
  }

  return sanitized;
}

function buildStudentIntakeContext(studentIntake: StudentIntakePayload | null): string {
  if (!studentIntake) return '';

  const lines = ['STARTING STUDENT INTAKE FORM:'];

  if (studentIntake.studentName) lines.push(`- Name: ${studentIntake.studentName}`);
  if (studentIntake.currentStage) lines.push(`- Current stage: ${studentIntake.currentStage}`);
  if (studentIntake.stateOrCity) lines.push(`- State or city context: ${studentIntake.stateOrCity}`);
  if (studentIntake.collegeRecommendationScope) lines.push(`- College recommendation scope: ${studentIntake.collegeRecommendationScope === 'india-wide' ? 'All India comparison' : 'State/region first'}`);
  if (studentIntake.comparisonFocus) lines.push(`- Comparison focus requested: ${studentIntake.comparisonFocus}`);
  if (studentIntake.currentSituation) lines.push(`- Current situation: ${studentIntake.currentSituation}`);
  if (studentIntake.interests) lines.push(`- Interests or strengths they already mentioned: ${studentIntake.interests}`);
  if (studentIntake.confusion) lines.push(`- Main confusion right now: ${studentIntake.confusion}`);
  if (studentIntake.stressors) lines.push(`- Stress or pressure: ${studentIntake.stressors}`);
  if (studentIntake.familyPressure) lines.push(`- Family expectations or pressure: ${studentIntake.familyPressure}`);
  if (studentIntake.targetRole) lines.push(`- Current target role: ${studentIntake.targetRole}`);

  lines.push('Treat these as already known facts. Do not ask all of them again immediately. Start from them and ask only the next most useful question.');

  return lines.join('\n');
}

function sanitizeDetectedStage(stage?: string): string | undefined {
  return sanitizeFreeText(stage, 80);
}

function normalizeClientMessages(messages?: Array<{ role?: string; content?: string }>) {
  return (messages ?? [])
    .filter((item): item is { role: 'user' | 'assistant'; content: string } => {
      return (
        typeof item?.content === 'string' &&
        (item.role === 'user' || item.role === 'assistant')
      );
    })
    .map((item) => ({ role: item.role, content: item.content.trim() }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY);
}

function buildVoiceSessionStartMessage(
  preferredLanguage: string,
  hasStudentIntake: boolean,
  selectedRole: string | null
): string {
  const parts = ['We are starting a live voice career-counseling session for an Indian student.'];

  if (hasStudentIntake) {
    parts.push('Begin from the known intake details instead of a generic greeting, and make the opening feel warm, strong, and premium.');
  }

  if (selectedRole) {
    parts.push(`The student is currently thinking about ${selectedRole}.`);
  }

  if (preferredLanguage === 'auto') {
    parts.push('Speak first and ask one short language-comfort question before anything else, but make the opening line feel inviting and emotionally strong.');
  } else {
    parts.push('Speak first in the chosen language with a compelling, human opening and then ask one short, useful first question.');
  }

  parts.push('Follow a clear voice opening structure: one trust-building intro line, one clarity line, one direction line, then one focused question.');
  parts.push('Do not ask vague generic questions like "what is your problem" without context.');
  parts.push('Do not use generic helper phrases, assistant-introduction filler, or bland chatbot greetings.');
  parts.push('The opening should feel like a real career mentor call: hopeful, sharp, human, and clearly rooted in the student\'s future.');
  return parts.join(' ');
}

function resolveChatApiError(error: unknown): { status: number; error: string } {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
      ? ((error as { status: number }).status)
      : null;

  const rawMessage = error instanceof Error ? error.message : '';
  const message = rawMessage.toLowerCase();

  if (status === 429 || message.includes('quota') || message.includes('rate limit')) {
    return {
      status: 429,
      error: 'Gemini quota is exhausted for this API key. Please enable billing or wait for quota reset, then try again.',
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: status,
      error: 'Model API key is not authorized. Please verify the key and Gemini API access.',
    };
  }

  if (status === 400) {
    return {
      status: 400,
      error: 'Model request was rejected (400). Please verify Gemini API key and model settings in .env.local.',
    };
  }

  if (message.includes('missing openai_api_key') || message.includes('missing openai_api_key, gemini_api_key')) {
    return {
      status: 500,
      error: 'Missing model API key configuration. Please set a valid key in .env.local.',
    };
  }

  return { status: 500, error: 'Failed to get response' };
}

// ============================================================================
// HELPER: Load and persist detected stage
// ============================================================================

async function loadAndPersistStage(
  supabase: ReturnType<typeof createServerSupabaseClient> | null,
  userId: string | null,
  newMessage: string,
  requestedStage?: string,
): Promise<{
  detectedStage: string;
  stageConfidence: number;
  stageOverrideNote: string;
  stageConfirmation: string;
}> {
  let detectedStage = requestedStage ?? '';
  let stageConfidence = 0;
  let stageOverrideNote = '';
  let stageConfirmation = '';

  if (!supabase || !userId) {
    // Fallback: Run detection on message only
    const result = detectStudentStage({ currentStage: newMessage });
    return {
      detectedStage: result.stage,
      stageConfidence: result.confidence,
      stageOverrideNote: '',
      stageConfirmation: `[INTERNAL: Detected stage ${result.stage} with ${result.confidence}% confidence]`,
    };
  }

  try {
    // Load previous stage from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('detected_stage, stage_confidence')
      .eq('id', userId)
      .single();

    const previousStage = profile?.detected_stage as StudentStage | undefined;

    // Detect stage from current message
    const currentDetection = detectStudentStage({ currentStage: newMessage });
    const currentStage = currentDetection.stage;
    const currentConfidence = currentDetection.confidence;

    // Check for override
    const override = detectStageOverride(previousStage, newMessage);

    if (override.hasOverride && override.shouldUpdate && override.newStage && userId) {
      // Update to new stage
      await supabase
        .from('profiles')
        .update({
          detected_stage: override.newStage,
          stage_confidence: currentConfidence,
          stage_last_updated: new Date().toISOString(),
        })
        .eq('id', userId);

      // Log the override
      await supabase.from('chat_stage_overrides').insert({
        user_id: userId,
        previous_stage: previousStage,
        new_stage: override.newStage,
        message_number: 1, // This would be computed from history length in real impl
        reason: 'student_contradiction',
      });

      stageOverrideNote = `[INTERNAL: Stage override - ${override.reason}]`;
      detectedStage = override.newStage;
      stageConfidence = currentConfidence;
      stageConfirmation = `[INTERNAL: Updated stage to ${override.newStage}. Previous: ${previousStage}]`;
    } else {
      // Use current detection (consistent or insufficient confidence)
      await supabase
        .from('profiles')
        .update({
          detected_stage: currentStage !== StudentStage.UNKNOWN ? currentStage : previousStage,
          stage_confidence: currentConfidence,
          stage_last_updated: new Date().toISOString(),
        })
        .eq('id', userId);

      detectedStage = currentStage !== StudentStage.UNKNOWN ? currentStage : (previousStage ?? 'unknown');
      stageConfidence = currentConfidence;
      stageConfirmation = `[INTERNAL: Confirmed stage ${detectedStage} with ${stageConfidence}% confidence]`;
    }
  } catch (error) {
    console.warn('Failed to load/persist stage:', error);
    // Fallback to current detection
    const result = detectStudentStage({ currentStage: newMessage });
    detectedStage = result.stage;
    stageConfidence = result.confidence;
  }

  return {
    detectedStage,
    stageConfidence,
    stageOverrideNote,
    stageConfirmation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message;
    const voiceSessionStart = Boolean(body.voiceSessionStart);
    if ((!message || typeof message !== 'string') && !voiceSessionStart) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const clientHistory = normalizeClientMessages(body.messages);
    const preferredLanguage = normalizeCounselingLanguage(body.preferredLanguage);
    const requestedConversationStyle = normalizeConversationStyle(body.conversationStyle);
    const conversationStyle = getResolvedConversationStyleForLanguage(preferredLanguage, requestedConversationStyle);
    const scriptPreference = normalizeScriptPreference(body.scriptPreference) === 'auto'
      ? getDefaultScriptPreference(preferredLanguage)
      : normalizeScriptPreference(body.scriptPreference);
    const voiceMode = Boolean(body.voiceMode);
    const requestedStageFromBody = sanitizeDetectedStage(body.detectedStage);
    const historyLimit = voiceMode ? 12 : MAX_HISTORY;
    const studentIntake = sanitizeStudentIntake(body.studentIntake);
    const explicitSelectedRole = sanitizeSelectedRole(body.selectedRole) ?? sanitizeSelectedRole(studentIntake?.targetRole);
    const inferredSelectedRole = detectRoleMentionFromText(message);
    const selectedRole = explicitSelectedRole ?? sanitizeSelectedRole(inferredSelectedRole ?? undefined);
    const studentIntakeContext = buildStudentIntakeContext(studentIntake);

    let supabase = null;
    let userId: string | null = null;
    let studentName: string | null = studentIntake?.studentName ?? null;
    let ageTier: AgeTier = 'discoverer';
    let recentMessages: Array<{ role: string; content: string }> = clientHistory.slice(-historyLimit);
    let assessmentContext = '';
    let assessmentProgress = 0;
    let completedGamesCount = 0;
    let stageConsiderations = {
      detectedStage: requestedStageFromBody,
      stageConfidence: 0,
      stageOverrideNote: '',
      stageConfirmation: '',
    };

    if (hasSupabaseServerConfig()) {
      try {
        supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          userId = user.id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('date_of_birth, full_name, detected_stage, stage_confidence')
            .eq('id', user.id)
            .single();

          studentName = profile?.full_name ?? null;
          ageTier = profile?.date_of_birth ? getAgeTier(profile.date_of_birth) : 'discoverer';

          const { data: storedMessages } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(historyLimit);

          recentMessages = (storedMessages ?? []).map((item) => ({ role: item.role, content: item.content }));

          const { data: assessmentProfile } = await supabase
            .from('assessment_profiles')
            .select('riasec, gardner, big_five, completed_games, assessment_progress')
            .eq('user_id', user.id)
            .single();

          assessmentProgress = Number(assessmentProfile?.assessment_progress ?? 0);
          completedGamesCount = Array.isArray(assessmentProfile?.completed_games)
            ? assessmentProfile.completed_games.length
            : 0;

          if (assessmentProfile && assessmentProfile.assessment_progress > 0) {
            assessmentContext = buildProfileContext(assessmentProfile, studentName ?? undefined);
          }

          // Load and persist stage
          if (!voiceSessionStart && message) {
            stageConsiderations = await loadAndPersistStage(supabase, userId, message, requestedStageFromBody);
          }
        }
      } catch (error) {
        console.warn('Supabase unavailable for chat route, falling back to session mode:', error);
      }
    }

    // Fallback stage detection if no Supabase
    if (!stageConsiderations.detectedStage && !voiceSessionStart && message) {
      const result = detectStudentStage({ currentStage: message });
      stageConsiderations = {
        detectedStage: result.stage,
        stageConfidence: result.confidence,
        stageOverrideNote: '',
        stageConfirmation: `[INTERNAL: Detected stage ${result.stage} with ${result.confidence}% confidence]`,
      };
    }

    const detectedStage = stageConsiderations.detectedStage;
    const stageContext = detectedStage ? `\nDetected guidance stage: ${detectedStage}` : '';
    const counselingTrack = deriveCounselingTrack({
      currentStage: studentIntake?.currentStage,
      currentSituation: studentIntake?.currentSituation,
      detectedStage,
    });

    const userTurns = (recentMessages ?? []).filter((item) => item.role === 'user').length;
    const journeyDay = Math.min(7, Math.floor(userTurns / 4) + 1);
    const currentTurnNumber = userTurns + 1;
    const effectiveMessage = voiceSessionStart
      ? buildVoiceSessionStartMessage(preferredLanguage, Boolean(studentIntakeContext), selectedRole)
      : (message as string);

    const systemPrompt = buildCareerAgentSystemPrompt({
      ageTier,
      preferredLanguage,
      conversationStyle,
      scriptPreference,
      currentTurnNumber,
      studentName,
      selectedRole,
      journeyDay,
      assessmentContext,
      detectedStageHint: detectedStage ?? studentIntake?.currentStage,
      counselingTrack,
      studentIntakeContext: `${studentIntakeContext}${stageContext}`,
    });

    const knowledgeRetrievalMode = resolveKnowledgeRetrievalMode();
    const knowledgeDecision = buildKnowledgeDecision({
      selectedRole,
      latestMessage: message,
      detectedStage,
      counselingTrack,
      studentIntake,
      maxResults: 3,
      retrievalMode: knowledgeRetrievalMode,
    });
    const knowledgeBaseTopRoles = knowledgeDecision.rankedRoles;
    const knowledgeBaseContext = buildKnowledgeBasePromptBlock({
      selectedRole,
      latestMessage: message,
      detectedStage,
      counselingTrack,
      studentIntake,
      maxResults: 3,
      retrievalMode: knowledgeRetrievalMode,
      currentTurnNumber,
    });

    // Phase 1: Detect contradictions in recent message history
    let contradictionContext = '';
    let unresolvedContradictionsCount = 0;
    let unresolvedHighContradictionsCount = 0;
    if (!voiceSessionStart && message && (recentMessages ?? []).length > 2) {
      const recentUserMessages = (recentMessages ?? [])
        .filter(m => m.role === 'user')
        .slice(-3)  // Last 3 user messages
        .map(m => ({ source: 'chat', value: m.content, dimension: 'career_exploration' }));

      if (recentUserMessages.length > 1) {
        const currentSignal = { source: 'chat', value: message, dimension: 'career_exploration' };
        const detectedContradictions = detectContradictions(currentSignal, recentUserMessages);
        unresolvedContradictionsCount = detectedContradictions.length;
        unresolvedHighContradictionsCount = detectedContradictions.filter((item) => item.severity === 'high').length;

        if (detectedContradictions.length > 0) {
          const reprobe = getCounselorReprobeForContradiction(detectedContradictions[0]);
          contradictionContext = `\n\n[INTERNAL: Contradiction detected in student responses. Reprobe gently: "${reprobe}"]`;
          // Note: This context helps the AI naturally reprobe without disrupting conversation flow
        }
      }
    }

    // Add stage confirmation to internal context
    let stageConfirmationContext = stageConsiderations.stageConfirmation ? `\n${stageConsiderations.stageConfirmation}` : '';
    if (stageConsiderations.stageOverrideNote) {
      stageConfirmationContext += `\n${stageConsiderations.stageOverrideNote}`;
    }

    const hasConstraintProfile = Boolean(
      studentIntake?.stateOrCity ||
      studentIntake?.comparisonFocus ||
      studentIntake?.currentSituation ||
      studentIntake?.stressors ||
      studentIntake?.confusion
    );
    const hasFamilyContext = Boolean(studentIntake?.familyPressure);
    const recommendationGate = buildRecommendationGateDecision({
      currentTurnNumber,
      detectedStage,
      assessmentProgress,
      completedGamesCount,
      hasConstraintProfile,
      hasFamilyContext,
      unresolvedContradictionsCount,
      unresolvedHighContradictionsCount,
      hasRoleFocus: Boolean(selectedRole),
      retrievalConfidence: knowledgeDecision.confidence,
    });
    const recommendationGateContext = recommendationGate.isUnlocked
      ? `\n[INTERNAL: Recommendation gate UNLOCKED (${recommendationGate.progressPercent}% progress). You may provide a ranked shortlist only with explicit confidence rationale, alternatives, and next validation action.]`
      : `\n[INTERNAL: Recommendation gate LOCKED (${recommendationGate.progressPercent}% progress). Do NOT provide final ranked recommendations yet. Focus on evidence gathering and ask this exact next question: "${recommendationGate.nextBestQuestion}". Top blockers: ${recommendationGate.blockingGates.slice(0, 3).map((item) => item.name).join(', ') || 'none'}]`;

    const history = (recentMessages ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    
    // Apply Market Reality Engine
    const affordability = studentIntake?.stressors?.toLowerCase().includes('finan') ? 'tight' : 'accessible'; // Map 'financial' to tight Budget
    const resolvedRoles = knowledgeDecision.rankedRoles.map(r => careerDatabase.find(c => c.id === r.id)).filter(Boolean) as typeof careerDatabase;
    const marketRealityContext = `\n[MARKET REALITY ENGINE LOGS]:\n` + applyMarketRealities(resolvedRoles, {
      affordability_level: affordability as 'tight' | 'accessible' | 'aspirational',
      tier: 'tier3'
    }).map(r => `Role ID: ${r.careerId}\nChecks: ${r.reality_check_notes.join(', ') || 'OK'}\nAdjusted Salary: ${r.adjusted_salary_inr}`)
      .join('\n\n');

    const knowledgeClarificationContext = knowledgeDecision.clarifyingQuestion  
      ? `\n[INTERNAL: Retrieval confidence is low (${knowledgeDecision.confidence}/100). Ask exactly this one clarifying question before hard narrowing: "${knowledgeDecision.clarifyingQuestion}"]`
      : '';
      
    // Apply Confusion Diagnosis Engine
    const confusionDiagnosis = diagnoseConfusion(studentIntake?.confusion, studentIntake?.stressors, studentIntake?.familyPressure);
    const confusionDiagnosisContext = confusionDiagnosis.counselingProtocol ? `\n\n${confusionDiagnosis.counselingProtocol}` : '';

    const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: `${systemPrompt}${contradictionContext}${stageConfirmationContext}${knowledgeClarificationContext}${recommendationGateContext}${marketRealityContext}${confusionDiagnosisContext}\n\n${knowledgeBaseContext}` },
      ...(voiceMode
        ? [{
            role: 'system' as const,
            content: 'This reply will be spoken in a live voice conversation. Keep the same ideology, intelligence, cultural grounding, Telangana/Indian sensitivity, emotional warmth, and practical career depth as the main Career Deciding Agent. Do not sound like a generic assistant. Voice replies should feel human, premium, hopeful, and confident. Usually respond in medium-length spoken form: around 3 to 6 natural sentences, enough to feel substantial but still easy to hear on a call. The first line should attract attention and feel meaningful, not flat.',
          }]
        : []),
      ...history,
      { role: 'user', content: effectiveMessage },
    ];

    const rawReply = await getChatCompletion(apiMessages, {
      temperature: 0.78,
      max_tokens: voiceMode ? 320 : 200,
    });

    const { cleanedResponse: reply, actionItems } = extractActionItems(rawReply);

    if (supabase && userId) {
      if (actionItems.length > 0) {
        const actionRows = actionItems.map((item) => ({
          user_id: userId,
          title: item.description,
          description: null,
          status: 'pending',
          due_date: new Date(Date.now() + item.dueDays * 24 * 60 * 60 * 1000).toISOString(),
        }));
        await supabase.from('student_action_items').insert(actionRows);
      }
      const rows = voiceSessionStart
        ? [
            {
              user_id: userId,
              role: 'assistant',
              content: reply,
              metadata: {
                preferred_language: preferredLanguage,
                conversation_style: conversationStyle,
                script_preference: scriptPreference,
                selected_role: selectedRole,
                counseling_track: counselingTrack,
                detected_stage: detectedStage,
                intake_snapshot: studentIntake,
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
                voice_session_start: true,
                recommendation_gate_unlocked: recommendationGate.isUnlocked,
                recommendation_gate_progress: recommendationGate.progressPercent,
              },
            },
          ]
        : [
            {
              user_id: userId,
              role: 'user',
              content: message,
              metadata: {
                preferred_language: preferredLanguage,
                conversation_style: conversationStyle,
                script_preference: scriptPreference,
                selected_role: selectedRole,
                counseling_track: counselingTrack,
                detected_stage: detectedStage,
                intake_snapshot: studentIntake,
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
                recommendation_gate_unlocked: recommendationGate.isUnlocked,
                recommendation_gate_progress: recommendationGate.progressPercent,
              },
            },
            {
              user_id: userId,
              role: 'assistant',
              content: reply,
              metadata: {
                preferred_language: preferredLanguage,
                conversation_style: conversationStyle,
                script_preference: scriptPreference,
                selected_role: selectedRole,
                counseling_track: counselingTrack,
                detected_stage: detectedStage,
                intake_snapshot: studentIntake,
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
                recommendation_gate_unlocked: recommendationGate.isUnlocked,
                recommendation_gate_progress: recommendationGate.progressPercent,
              },
            },
          ];

      await supabase.from('chat_messages').insert(rows);

      await supabase.from('knowledge_retrieval_events').insert({
        user_id: userId,
        retrieval_mode: knowledgeDecision.retrievalMode,
        detected_stage: detectedStage,
        counseling_track: counselingTrack,
        city_context: knowledgeDecision.city ?? studentIntake?.stateOrCity ?? null,
        tier_context: knowledgeDecision.tier,
        confidence_score: knowledgeDecision.confidence,
        clarifying_question: knowledgeDecision.clarifyingQuestion ?? null,
        top_role_1: knowledgeBaseTopRoles[0]?.title ?? null,
        top_role_2: knowledgeBaseTopRoles[1]?.title ?? null,
        top_role_3: knowledgeBaseTopRoles[2]?.title ?? null,
        selected_role: selectedRole ?? null,
        latest_message_excerpt: (message ?? '').slice(0, 240),
      });

      const messageCount = (recentMessages?.length ?? 0) + 2;
      if (messageCount % 10 === 0 && messageCount > 0) {
        extractAssessmentFromChat(userId, recentMessages ?? []).catch(console.error);
      }
    }

    return NextResponse.json({
      message: reply,
      meta: {
        preferredLanguage,
        conversationStyle,
        scriptPreference,
        selectedRole,
        counselingTrack,
        journeyDay,
        hasStartingIntake: Boolean(studentIntakeContext),
        voiceMode,
        voiceSessionStart,
        knowledgeBaseTopRoles: knowledgeBaseTopRoles.map((item) => item.title),
        knowledgeBaseConfidence: knowledgeDecision.confidence,
        knowledgeBaseTier: knowledgeDecision.tier,
        knowledgeBaseCity: knowledgeDecision.city,
        knowledgeBaseMode: knowledgeDecision.retrievalMode,
        knowledgeBaseClarifyingQuestion: knowledgeDecision.clarifyingQuestion,
        recommendationGate: {
          stage: recommendationGate.stage,
          isUnlocked: recommendationGate.isUnlocked,
          progressPercent: recommendationGate.progressPercent,
          nextBestQuestion: recommendationGate.nextBestQuestion,
          blockers: recommendationGate.blockingGates.map((item) => ({
            name: item.name,
            requirement: item.requirement,
            currentStatus: item.currentStatus,
          })),
          dossier: recommendationGate.dossier,
        },
        persistenceMode: userId ? 'supabase' : 'session',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const resolved = resolveChatApiError(error);
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
}

/**
 * Build profile context string for the system prompt
 */
function buildProfileContext(
  assessment: { riasec: Record<string, number>; gardner: Record<string, number>; big_five: Record<string, number>; completed_games: string[]; assessment_progress: number },
  name?: string
): string {
  const parts: string[] = [
    `STUDENT ASSESSMENT PROFILE${name ? ` (${name})` : ''}:`,
    `Progress: ${assessment.assessment_progress}% complete (${assessment.completed_games?.length || 0} games played)`,
  ];

  if (assessment.riasec) {
    const topRiasec = Object.entries(assessment.riasec)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`);
    if (topRiasec.length > 0) parts.push(`Top RIASEC: ${topRiasec.join(', ')}`);
  }

  if (assessment.gardner) {
    const topGardner = Object.entries(assessment.gardner)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`);
    if (topGardner.length > 0) parts.push(`Top Intelligences: ${topGardner.join(', ')}`);
  }

  parts.push('Use this profile to personalize your guidance. Reference their strengths naturally in conversation.');

  return parts.join('\n');
}

/**
 * Background: extract RIASEC/Gardner signals from chat history
 */
async function extractAssessmentFromChat(userId: string, messages: { role: string; content: string }[]) {
  try {
    const userMessages = messages
      .filter(m => m.role === 'user')
      .slice(-20);

    const recentUserMessages = userMessages
      .map(m => m.content)
      .join('\n');

    // Guardrail: do not infer profile from very shallow conversations.
    if (userMessages.length < 8 || recentUserMessages.length < 600) return;

    const extractionPrompt = `Based on this student's chat messages, estimate their psychological profile scores (0-100).
Return ONLY valid JSON with these exact keys:

{
  "riasec": { "realistic": N, "investigative": N, "artistic": N, "social": N, "enterprising": N, "conventional": N },
  "gardner": { "linguistic": N, "logical_mathematical": N, "spatial": N, "musical": N, "bodily_kinesthetic": N, "interpersonal": N, "intrapersonal": N, "naturalistic": N },
  "big_five": { "openness": N, "conscientiousness": N, "extraversion": N, "agreeableness": N, "neuroticism": N }
}

Student messages:
${recentUserMessages}`;

    const result = await getChatCompletion(
      [{ role: 'system', content: 'You are a psychometric assessment AI. Return ONLY valid JSON.' }, { role: 'user', content: extractionPrompt }],
      { temperature: 0.3, max_tokens: 400 }
    );

    const parsed = JSON.parse(result);

    const supabase = createServerSupabaseClient();

    const { data: existingProfile } = await supabase
      .from('assessment_profiles')
      .select('riasec, gardner, big_five, assessment_progress, completed_games')
      .eq('user_id', userId)
      .single();

    const completedGamesCount = existingProfile?.completed_games?.length ?? 0;
    const progress = Number(existingProfile?.assessment_progress ?? 0);
    const useConservativeBlend = progress >= 50 || completedGamesCount >= 3;
    const extractionWeight = useConservativeBlend ? 0.35 : 0.7;

    const blendObject = <T extends Record<string, number>>(base: T | null | undefined, incoming: T): T => {
      const result = { ...(incoming as Record<string, number>) } as Record<string, number>;
      for (const [key, value] of Object.entries(incoming)) {
        const baseVal = Number(base?.[key] ?? value);
        result[key] = Math.round(baseVal * (1 - extractionWeight) + Number(value) * extractionWeight);
      }
      return result as T;
    };

    const blendedRiasec = blendObject(existingProfile?.riasec as Record<string, number> | null, parsed.riasec);
    const blendedGardner = blendObject(existingProfile?.gardner as Record<string, number> | null, parsed.gardner);
    const blendedBigFive = blendObject(existingProfile?.big_five as Record<string, number> | null, parsed.big_five);

    await supabase
      .from('assessment_profiles')
      .update({
        riasec: blendedRiasec,
        gardner: blendedGardner,
        big_five: blendedBigFive,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch {
    // Silent fail â€” extraction is best-effort
  }
}

