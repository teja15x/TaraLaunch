import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

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

export async function getChatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; max_tokens?: number }
) {
  const openai = getOpenAIClient();
  const configuredModel = process.env.OPENAI_MODEL?.trim();
  const baseUrl = process.env.OPENAI_BASE_URL?.trim().toLowerCase();
  const model = configuredModel ||
    (baseUrl?.includes('generativelanguage.googleapis.com') ? 'gemini-2.0-flash' : 'gpt-4o-mini');

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1000,
  });
  return response.choices[0]?.message?.content || '';
}
