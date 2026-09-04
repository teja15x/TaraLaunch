import OpenAI from 'openai';
import {
  chatResponseSchema,
  insightResponseSchema,
  type ChatInput,
  type ChatOutput,
  type TaraAIProvider,
} from '@/lib/tara/ai/types';

const SYSTEM_PROMPT = `You are Tara: personal navigation intelligence.\n\nRules:\n- Not a generic chatbot\n- Avoid empty praise and generic fillers\n- Ask precise reflective questions\n- Use evidence-before-advice\n- Keep tone calm, human, thoughtful\n- Never assign destiny labels\n- Use early-signal language, uncertainty, and next experiment framing\n- If user corrects prior assumptions, acknowledge and update\n\nReturn strict JSON only with keys: reply, suggestedNextStep, memoryOperations.\nMemory operations should capture durable facts/goals/constraints/preferences and corrections.`;

function parseJsonObject<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export class OpenAIProvider implements TaraAIProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAIProvider');
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
  }

  async generateReply(input: ChatInput): Promise<ChatOutput> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.6,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            language: input.language,
            lifeStage: input.lifeStage,
            latestMessage: input.message,
            recentConversation: input.conversation.slice(-8),
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = parseJsonObject<unknown>(raw);
    const validated = chatResponseSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data;
    }

    return {
      reply:
        "I'm tracking this with you. Before we jump to a role name, tell me what feels most costly right now: waiting, choosing wrong, or disappointing someone?",
      memoryOperations: [],
    };
  }

  async generateInsight(input: {
    evidenceSummary: string;
    hypothesisSummary: string;
  }): Promise<{ taraMoment: string }> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content:
            'Generate one Tara Moment insight. Keep it grounded, non-deterministic, and explicitly framed as early signal. Return strict JSON: {"taraMoment":"..."}.',
        },
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    const parsed = parseJsonObject<unknown>(raw);
    const validated = insightResponseSchema.safeParse(parsed);

    if (validated.success) {
      return { taraMoment: validated.data.taraMoment };
    }

    return {
      taraMoment:
        "There is an early pattern worth testing: you repeatedly choose ownership over certainty when stakes rise. Let's validate it with one real-world experiment.",
    };
  }
}
