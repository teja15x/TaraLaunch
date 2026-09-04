import type { ChatInput, ChatOutput, TaraAIProvider } from '@/lib/tara/ai/types';
import type { TaraLanguage } from '@/lib/tara/types';

function detectMemoryOps(message: string): ChatOutput['memoryOperations'] {
  const lower = message.toLowerCase();
  const ops: ChatOutput['memoryOperations'] = [];

  if (lower.includes("don't") || lower.includes('do not') || lower.includes('not interested')) {
    ops.push({
      action: 'upsert',
      category: 'preference',
      key: 'corrected_preference',
      value: message,
      confidence: 'building',
    });
  }

  if (lower.includes('want') || lower.includes('goal')) {
    ops.push({
      action: 'upsert',
      category: 'goal',
      key: 'stated_goal',
      value: message,
      confidence: 'early-signal',
    });
  }

  if (lower.includes('family') || lower.includes('money') || lower.includes('financial')) {
    ops.push({
      action: 'upsert',
      category: 'constraint',
      key: 'active_constraint',
      value: message,
      confidence: 'building',
    });
  }

  return ops;
}

function baseReply(message: string, language: TaraLanguage) {
  const lower = message.toLowerCase();

  if (lower.includes('career') && lower.includes("don't know")) {
    return "That's a useful place to start. Before we name a career, I want to understand what feels heavier right now — not knowing what you want, or being afraid of choosing the wrong thing?";
  }

  if (lower.includes('wrong choice') || lower.includes('afraid')) {
    return 'Makes sense. Fear of a wrong decision usually means the decision feels permanent. In Tara, we treat choices as experiments. Tell me one decision you delayed recently and why.';
  }

  if (lower.includes('product') || lower.includes('build') || lower.includes('feature')) {
    return "I hear a pattern around ownership and building. Instead of guessing, let's test it. I can launch a Product Management simulation where every choice changes consequences. Want to run it?";
  }

  if (language === 'hi') {
    return 'ठीक है। मैं जल्दी निष्कर्ष नहीं निकालूंगी। एक हाल की स्थिति बताइए जहां आपको दो विकल्पों में से चुनना पड़ा।';
  }

  if (language === 'te') {
    return 'సరే. వెంటనే లేబుల్ వేయను. ఇటీవల మీరు కఠినంగా తీసుకున్న ఒక నిర్ణయం ఏమిటో చెప్పండి.';
  }

  return "Got it. I won't rush to label you. Tell me about one recent decision where you had to trade one good thing for another.";
}

export class DemoAIProvider implements TaraAIProvider {
  async generateReply(input: ChatInput): Promise<ChatOutput> {
    const reply = baseReply(input.message, input.language);
    const memoryOperations = detectMemoryOps(input.message);
    const suggestedNextStep = input.message.toLowerCase().includes('career')
      ? 'Try the Product Management experience to generate evidence.'
      : undefined;

    return {
      reply,
      suggestedNextStep,
      memoryOperations,
    };
  }

  async generateInsight(): Promise<{ taraMoment: string }> {
    return {
      taraMoment:
        "You keep choosing ownership when certainty is low. That might be an early signal that autonomy matters more to you than comfort. Let's test that in one real-world decision this week.",
    };
  }
}
