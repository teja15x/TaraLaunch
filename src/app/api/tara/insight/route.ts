import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getTaraAIProvider } from '@/lib/tara/ai/provider';

const insightSchema = z.object({
  evidenceSummary: z.string().min(1),
  hypothesisSummary: z.string().min(1),
  language: z.enum(['en', 'hi', 'te']).default('en'),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = insightSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
    }

    const provider = getTaraAIProvider();
    const insight = await provider.generateInsight(parsed.data);

    return NextResponse.json({
      mode: process.env.OPENAI_API_KEY?.trim() ? 'openai' : 'demo',
      ...insight,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to generate Tara moment',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
