'use client';

import { Card } from '@/components/ui/Card';
import type { BigFiveScores } from '@/types';
import { BIGFIVE_LABELS } from '@/lib/career-engine/bigfive';

interface BigFiveScaleProps {
  bigFive: BigFiveScores;
}

export function BigFiveScale({ bigFive }: BigFiveScaleProps) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-white mb-2">Big Five Personality Profile</h2>
      <p className="text-white/50 text-sm mb-6">The OCEAN model — five broad dimensions of personality</p>
      <div className="space-y-5">
        {(Object.keys(bigFive) as (keyof BigFiveScores)[]).map((key) => {
          const info = BIGFIVE_LABELS[key];
          const value = bigFive[key];
          const isHigh = value >= 60;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium text-sm">{info.emoji} {info.label}</span>
                <span className="text-white/40 text-xs">{value}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="text-white/40 text-xs">{isHigh ? info.highDesc : info.lowDesc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
