'use client';

import { Card } from '@/components/ui/Card';

interface StatusBarProps {
  currentStreak: number;
  reliabilityScore: number;
  gamesUntilUnlock: number;
  nextGameTitle?: string;
}

export function StatusBar({
  currentStreak,
  reliabilityScore,
  gamesUntilUnlock,
  nextGameTitle,
}: StatusBarProps) {
  return (
    <Card className="bg-gradient-to-r from-primary-600/30 to-accent-600/30 border-primary-500/40 py-4 px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider">Streak</p>
            <p className="text-lg font-bold text-white">{currentStreak} days</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">📊</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider">Confidence</p>
            <p className="text-lg font-bold text-white">{reliabilityScore}%</p>
            <p className="text-xs text-white/50 mt-1">
              {reliabilityScore >= 75
                ? '✅ Ready to explore'
                : reliabilityScore >= 50
                  ? '⚡ Building clarity'
                  : '🎮 Keep playing'}
            </p>
          </div>
        </div>

        {/* Progress to Unlock */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider">To Unlock</p>
            <p className="text-lg font-bold text-white">{Math.max(0, gamesUntilUnlock)} game{gamesUntilUnlock !== 1 ? 's' : ''}</p>
            {nextGameTitle && (
              <p className="text-xs text-white/50 mt-1 truncate">Play: {nextGameTitle}</p>
            )}
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center justify-center rounded-lg bg-white/10 border border-white/20 p-4">
          <div className="text-center">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Next Move</p>
            <p className="text-sm font-bold text-primary-300">
              {gamesUntilUnlock > 0 ? 'Play a Game' : 'Check Results'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
