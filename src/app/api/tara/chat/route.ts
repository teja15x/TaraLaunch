import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTaraAIProvider } from '@/lib/tara/ai/provider';

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  conversation: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .default([]),
  language: z.enum(['en', 'hi', 'te']).default('en'),
  lifeStage: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = chatRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
    }

    const provider = getTaraAIProvider();
    const output = await provider.generateReply(parsed.data);

    return NextResponse.json({
      mode: process.env.OPENAI_API_KEY?.trim() ? 'openai' : 'demo',
      ...output,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to generate Tara response',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
