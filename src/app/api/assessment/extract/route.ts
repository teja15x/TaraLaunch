import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/openai';
import type { TraitScores } from '@/types';

const EXTRACTION_PROMPT = `You are a psychometric assessment AI. Given a user's game responses, extract scores (0-100) for multiple frameworks.

Return ONLY a valid JSON object with these exact keys:

{
  "traits": {
    "analytical": N, "creative": N, "leadership": N, "empathy": N,
    "technical": N, "communication": N, "adaptability": N, "detail_oriented": N
  },
  "riasec": {
    "realistic": N, "investigative": N, "artistic": N,
    "social": N, "enterprising": N, "conventional": N
  },
  "gardner": {
    "linguistic": N, "logical_mathematical": N, "spatial": N, "musical": N,
    "bodily_kinesthetic": N, "interpersonal": N, "intrapersonal": N, "naturalistic": N
  },
  "big_five": {
    "openness": N, "conscientiousness": N, "extraversion": N,
    "agreeableness": N, "neuroticism": N
  }
}

All values should be integers 0-100. No other text.`;

export async function POST(request: NextRequest) {
  try {
    const { responses, gameType } = await request.json();
    const responseSummary = responses.map((r: { question: string; answer: string }) =>
      `Q: ${r.question}\nA: ${r.answer}`
    ).join('\n\n');

    const result = await getChatCompletion([
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: `Game: ${gameType}\n\nResponses:\n${responseSummary}` },
    ], { temperature: 0.3, max_tokens: 500 });

    const parsed = JSON.parse(result);

    // Backward compatibility: if only traits requested, return legacy format
    if (!parsed.traits && !parsed.riasec) {
      const traits: TraitScores = parsed as TraitScores;
      return NextResponse.json({ traits });
    }

    return NextResponse.json({
      traits: parsed.traits,
      riasec: parsed.riasec,
      gardner: parsed.gardner,
      big_five: parsed.big_five,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract traits' }, { status: 500 });
  }
}
