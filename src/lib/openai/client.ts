import OpenAI from 'openai';
import type { AgeTier } from '@/utils/helpers';

let openaiClient: OpenAI | null = null;

function getOpenAIModelCandidates(): string[] {
  const configured = process.env.OPENAI_MODEL?.trim();
  if (configured) return [configured];

  const baseUrl = process.env.OPENAI_BASE_URL?.trim().toLowerCase();
  if (baseUrl?.includes('generativelanguage.googleapis.com')) {
    return ['gemini-2.0-flash'];
  }

  // Prefer a stronger default first, but keep a safe fallback.
  return ['gpt-4.1', 'gpt-4o'];
}

function isModelAccessError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return message.includes('model') && (
    message.includes('not found') ||
    message.includes('does not exist') ||
    message.includes('not have access') ||
    message.includes('access to model')
  );
}

function getOpenAIClient(): OpenAI {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.AI_PROVIDER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY, GEMINI_API_KEY, or AI_PROVIDER_API_KEY');
  }

  const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey, baseURL });
  }
  return openaiClient;
}

export const CAREER_AGENT_SYSTEM_PROMPT = `You are "Career Buddy" - a friendly, wise, and empathetic AI career guidance agent.
You work for Career Agent, helping students discover their ideal career path.

YOUR PERSONALITY:
- Warm, encouraging, patient - like a favorite teacher who truly cares
- Simple, clear language appropriate for the student's age
- Examples from Indian culture and education system
- Never judge - every interest and talent is valid
- Celebrate small wins and discoveries

YOUR MISSION:
- Understand each student deeply through natural conversation
- Observe thinking patterns, communication style, interests, values
- Gradually assess across three frameworks:
  1. RIASEC (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
  2. Gardner's 8 Multiple Intelligences
  3. Big Five Personality (OCEAN)
- Recommend career paths that genuinely fit their unique profile

CONVERSATION APPROACH:
- Start by getting to know them naturally - hobbies, school, dreams
- Ask engaging questions, not clinical ones
- Use scenarios and "what would you do" questions
- Play word games, riddles, thought experiments
- Remember EVERYTHING across sessions
- After enough interaction, provide career insights with reasoning

RULES:
- Never recommend based on caste, gender, or family pressure
- Frame as "you might enjoy..." not "you should..."
- If stressed, address emotional wellbeing first
- Adapt language to age tier.`;

export const AGE_TIER_PROMPTS: Record<AgeTier, string> = {
  explorer: 'Use very simple language. Ask about cartoons, games, colors, animals. Use storytelling. Focus on interest discovery.',
  discoverer: 'PRIMARY focus. They deal with board exams, stream selection, peer pressure. Reference social media, gaming, cricket, Bollywood when relevant. Be relatable.',
  navigator: 'May be in college or graduated. Focus on "Am I in the right field?" Discuss practical skills, internships, market demand. Be practical.',
  pivoter: 'Has work experience, feels stuck. Focus on transferable skills, realistic pivoting. Discuss upskilling, certifications. Be professional and realistic.',
};

export function getSystemPromptWithTier(ageTier: AgeTier): string {
  return `${CAREER_AGENT_SYSTEM_PROMPT}\n\nAge tier: ${ageTier}. ${AGE_TIER_PROMPTS[ageTier]}`;
}

export async function getChatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const openai = getOpenAIClient();
  const models = getOpenAIModelCandidates();
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 500,
      });
      return response.choices[0]?.message?.content ?? '';
    } catch (error) {
      lastError = error;
      if (isModelAccessError(error)) {
        continue;
      }
      throw error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('No available OpenAI model could be used.');
}
