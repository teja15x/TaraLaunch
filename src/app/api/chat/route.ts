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
import { detectRoleMentionFromText } from '@/lib/career-agent/roleKnowledge';
import { detectContradictions, getCounselorReprobeForContradiction } from '@/lib/career-engine/stageGates';
import { getAgeTier, type AgeTier } from '@/utils/helpers';

const MAX_HISTORY = 30;

interface ChatRequestBody {
  message?: string;
  messages?: Array<{ role?: string; content?: string }>;
  preferredLanguage?: string;
  conversationStyle?: string;
  scriptPreference?: string;
  selectedRole?: string;
  voiceMode?: boolean;
  voiceSessionStart?: boolean;
  studentIntake?: {
    studentName?: string;
    currentStage?: string;
    stateOrCity?: string;
    collegeRecommendationScope?: 'state-first' | 'india-wide';
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
  if (studentIntake.currentSituation) lines.push(`- Current situation: ${studentIntake.currentSituation}`);
  if (studentIntake.interests) lines.push(`- Interests or strengths they already mentioned: ${studentIntake.interests}`);
  if (studentIntake.confusion) lines.push(`- Main confusion right now: ${studentIntake.confusion}`);
  if (studentIntake.stressors) lines.push(`- Stress or pressure: ${studentIntake.stressors}`);
  if (studentIntake.familyPressure) lines.push(`- Family expectations or pressure: ${studentIntake.familyPressure}`);
  if (studentIntake.targetRole) lines.push(`- Current target role: ${studentIntake.targetRole}`);

  lines.push('Treat these as already known facts. Do not ask all of them again immediately. Start from them and ask only the next most useful question.');

  return lines.join('\n');
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

    if (hasSupabaseServerConfig()) {
      try {
        supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          userId = user.id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('date_of_birth, full_name')
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

          if (assessmentProfile && assessmentProfile.assessment_progress > 0) {
            assessmentContext = buildProfileContext(assessmentProfile, studentName ?? undefined);
          }
        }
      } catch (error) {
        console.warn('Supabase unavailable for chat route, falling back to session mode:', error);
      }
    }

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
      studentIntakeContext,
    });

    // Phase 1: Detect contradictions in recent message history
    let contradictionContext = '';
    if (!voiceSessionStart && message && (recentMessages ?? []).length > 2) {
      const recentUserMessages = (recentMessages ?? [])
        .filter(m => m.role === 'user')
        .slice(-3)  // Last 3 user messages
        .map(m => ({ source: 'chat', value: m.content, dimension: 'career_exploration' }));

      if (recentUserMessages.length > 1) {
        const currentSignal = { source: 'chat', value: message, dimension: 'career_exploration' };
        const detectedContradictions = detectContradictions(currentSignal, recentUserMessages);

        if (detectedContradictions.length > 0) {
          const reprobe = getCounselorReprobeForContradiction(detectedContradictions[0]);
          contradictionContext = `\n\n[INTERNAL: Contradiction detected in student responses. Reprobe gently: "${reprobe}"]`;
          // Note: This context helps the AI naturally reprobe without disrupting conversation flow
        }
      }
    }

    const history = (recentMessages ?? []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt + contradictionContext },
      ...(voiceMode
        ? [{
            role: 'system' as const,
            content: 'This reply will be spoken in a live voice conversation. Keep the same ideology, intelligence, cultural grounding, Telangana/Indian sensitivity, emotional warmth, and practical career depth as the main Career Deciding Agent. Do not sound like a generic assistant. Voice replies should feel human, premium, hopeful, and confident. Usually respond in medium-length spoken form: around 3 to 6 natural sentences, enough to feel substantial but still easy to hear on a call. The first line should attract attention and feel meaningful, not flat.',
          }]
        : []),
      ...history,
      { role: 'user', content: effectiveMessage },
    ];

    const reply = await getChatCompletion(apiMessages, {
      temperature: 0.78,
      max_tokens: voiceMode ? 320 : 200,
    });

    if (supabase && userId) {
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
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
                voice_session_start: true,
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
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
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
                journey_day: journeyDay,
                has_starting_intake: Boolean(studentIntakeContext),
                voice_mode: voiceMode,
              },
            },
          ];

      await supabase.from('chat_messages').insert(rows);

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
        journeyDay,
        hasStartingIntake: Boolean(studentIntakeContext),
        voiceMode,
        voiceSessionStart,
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
    // Silent fail — extraction is best-effort
  }
}
