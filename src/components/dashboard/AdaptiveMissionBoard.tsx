'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { recommendNextMission, type PlayerPerformance } from '@/lib/career-engine/adaptiveMissioner';
import { ArrowRight, Star, Zap } from 'lucide-react';

interface AdaptiveMissionBoardProps {
  performance: PlayerPerformance;
}

export function AdaptiveMissionBoard({ performance }: AdaptiveMissionBoardProps) {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState(recommendNextMission(performance));

  useEffect(() => {
    const rec = recommendNextMission(performance);
    setRecommendation(rec);
  }, [performance]);

  if (!recommendation) {
    return (
      <Card className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 border-gray-500/30 text-center py-8">
        <p className="text-gray-300">No games available at the moment. Check back soon!</p>
      </Card>
    );
  }

  const difficultyColor = {
    1: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
    2: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    3: 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30',
    4: 'from-orange-500/20 to-red-500/20 border-orange-400/30',
    5: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
  };

  const difficultyLabel = {
    1: 'Quick Win',
    2: 'Building Skills',
    3: 'Intermediate',
    4: 'Advanced Challenge',
    5: 'Master Level',
  };

  const bgColor = difficultyColor[recommendation.difficulty as keyof typeof difficultyColor] || difficultyColor[3];
  const label = difficultyLabel[recommendation.difficulty as keyof typeof difficultyLabel] || 'Challenge';

  return (
    <Card className={`bg-gradient-to-br ${bgColor} p-6 border transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{recommendation.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{recommendation.title}</h3>
            <p className="text-xs text-white/70 mt-1">Recommended Next Mission</p>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < recommendation.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <p className="text-sm text-white/85">{recommendation.reason}</p>
        <p className="text-xs text-white/60 mt-2 flex items-center gap-2">
          <Zap className="w-3 h-3" />
          {recommendation.estimatedDuration}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-white/60">Difficulty</p>
          <p className="text-sm font-semibold text-white mt-1">{label}</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-white/60">Estimated Impact</p>
          <p className="text-sm font-semibold text-white mt-1">+15-20% confidence</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-white/70">{recommendation.nextAction}</p>
        <Button
          onClick={() => router.push(`/games/${recommendation.gameId}`)}
          className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
        >
          Start Mission
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
