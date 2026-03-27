import { NextRequest, NextResponse } from 'next/server';
import { matchCareersAdvanced } from '@/lib/career-engine';
import { careerDatabase } from '@/data/careers';
import { matchCareers } from '@/lib/careers';
import { adaptiveMatch, compareMatches } from '@/lib/career-engine/adaptiveMatching';
import type { TraitScores } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const { traitScores, useAdvanced, mode, completedGames = [], allGames = [], beforeTraits, afterTraits } = await request.json() as {
      traitScores?: TraitScores;
      useAdvanced?: boolean;
      mode?: 'adaptive' | 'rematch' | 'legacy';
      completedGames?: string[];
      allGames?: any[];
      beforeTraits?: TraitScores;
      afterTraits?: TraitScores;
    };

    // ---- MODE 1: ADAPTIVE MATCHING (Interactive with games) ----
    if (mode === 'adaptive' || url.searchParams.get('mode') === 'adaptive') {
      if (!traitScores) {
        return NextResponse.json({ error: 'Trait scores required' }, { status: 400 });
      }

      const insight = adaptiveMatch(
        traitScores,
        careerDatabase,
        allGames,
        completedGames
      );

      return NextResponse.json({
        mode: 'adaptive',
        ...insight,
        message: insight.nextAction,
      });
    }

    // ---- MODE 2: RE-MATCHING (After game play) ----
    if (mode === 'rematch' || url.searchParams.get('mode') === 'rematch') {
      if (!beforeTraits || !afterTraits) {
        return NextResponse.json(
          { error: 'Before and after trait scores required' },
          { status: 400 }
        );
      }

      const comparison = compareMatches(beforeTraits, afterTraits, careerDatabase);

      return NextResponse.json({
        mode: 'rematch',
        before: comparison.before.slice(0, 5).map(m => ({
          title: m.career.title,
          score: m.overallScore,
        })),
        after: comparison.after.slice(0, 5).map(m => ({
          title: m.career.title,
          score: m.overallScore,
        })),
        improvements: comparison.changed
          .filter(c => c.improvement > 0)
          .slice(0, 3)
          .map(c => ({
            career: c.career.title,
            before: c.beforeScore,
            after: c.afterScore,
            improvement: c.improvement,
          })),
        message:
          comparison.changed.length > 0
            ? `🚀 Wow! That game revealed some amazing things about you. Check how your best matches evolved!`
            : `✨ Your matches stayed strong - you already knew yourself well!`,
      });
    }

    // ---- MODE 3: ADVANCED MATCHING (Multi-dimensional) ----
    if (useAdvanced || mode === 'advanced') {
      if (!traitScores) {
        return NextResponse.json({ error: 'Trait scores required' }, { status: 400 });
      }

      const advancedMatches = matchCareersAdvanced(traitScores, careerDatabase).slice(0, 10);
      return NextResponse.json({
        mode: 'advanced',
        matches: advancedMatches.map(m => ({
          career: {
            title: m.career.title,
            category: m.career.category,
            description: m.career.description,
            salary_range: m.career.salary_range_inr,
            growth_outlook: m.career.growth_outlook,
            required_skills: m.career.required_skills,
            education: m.career.education_path[0],
            education_path: m.career.education_path,
            required_traits: m.career.required_traits,
          },
          score: m.overallScore,
          riasecScore: m.riasecScore,
          gardnerScore: m.gardnerScore,
          traitScore: m.traitScore,
          topAlignedTraits: m.topAlignedTraits,
          topAlignedIntelligences: m.topAlignedIntelligences,
          alignment: Object.fromEntries(
            m.topAlignedTraits.map(t => [t, traitScores[t as keyof TraitScores] || 0])
          ),
        })),
      });
    }

    // ---- MODE 4: LEGACY (Default backward compatible) ----
    if (!traitScores) {
      return NextResponse.json({ error: 'Trait scores required' }, { status: 400 });
    }

    const matches = matchCareers(traitScores).slice(0, 5);
    return NextResponse.json({ mode: 'legacy', matches });
  } catch (error) {
    console.error('Career match error:', error);
    return NextResponse.json({ error: 'Failed to match careers' }, { status: 500 });
  }
}
