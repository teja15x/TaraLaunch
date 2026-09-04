import type { TaraAIProvider } from '@/lib/tara/ai/types';
import { DemoAIProvider } from '@/lib/tara/ai/demoProvider';
import { OpenAIProvider } from '@/lib/tara/ai/openaiProvider';

let providerCache: TaraAIProvider | null = null;

export function getTaraAIProvider(): TaraAIProvider {
  if (providerCache) return providerCache;

  if (process.env.OPENAI_API_KEY?.trim()) {
    providerCache = new OpenAIProvider();
    return providerCache;
  }

  providerCache = new DemoAIProvider();
  return providerCache;
}
