import { z } from 'zod';
import type { TaraLanguage } from '@/lib/tara/types';

export const memoryOperationSchema = z.object({
  action: z.enum(['upsert', 'delete']).default('upsert'),
  category: z.enum([
    'fact',
    'goal',
    'value',
    'preference',
    'constraint',
    'experience',
    'decision',
    'observation',
    'evidence',
    'reflection',
    'hypothesis',
    'outcome',
  ]),
  key: z.string().min(2),
  value: z.string().min(2),
  confidence: z.enum(['early-signal', 'building', 'strong']).default('early-signal'),
});

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
  suggestedNextStep: z.string().optional(),
  memoryOperations: z.array(memoryOperationSchema).default([]),
});

export const insightResponseSchema = z.object({
  taraMoment: z.string().min(1),
});

export type MemoryOperation = z.infer<typeof memoryOperationSchema>;

export interface ChatInput {
  message: string;
  conversation: { role: 'user' | 'assistant'; content: string }[];
  language: TaraLanguage;
  lifeStage?: string;
}

export interface ChatOutput {
  reply: string;
  suggestedNextStep?: string;
  memoryOperations: MemoryOperation[];
}

export interface TaraAIProvider {
  generateReply(input: ChatInput): Promise<ChatOutput>;
  generateInsight(input: {
    evidenceSummary: string;
    hypothesisSummary: string;
    language: TaraLanguage;
  }): Promise<{ taraMoment: string }>;
}
