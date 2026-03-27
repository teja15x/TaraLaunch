'use client';

import { Card } from '@/components/ui/Card';
import type { GardnerScores } from '@/types';
import { getTopIntelligences, GARDNER_LABELS } from '@/lib/career-engine/gardner';

interface GardnerChartProps {
  gardner: GardnerScores;
}

export function GardnerChart({ gardner }: GardnerChartProps) {
  return (
    <>
      <Card>
        <h2 className="text-xl font-semibold text-white mb-2">Multiple Intelligences Profile</h2>
        <p className="text-white/50 text-sm mb-6">Gardner&apos;s 8 types of intelligence — everyone is smart in different ways</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(gardner) as (keyof GardnerScores)[]).map((key) => {
            const info = GARDNER_LABELS[key];
            return (
              <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <span className="text-2xl">{info.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{info.label}</span>
                    <span className="text-primary-400 font-bold text-sm">{gardner[key]}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{ width: `${gardner[key]}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-xs">{info.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-primary-600/10 to-accent-600/10">
        <h3 className="text-white font-semibold mb-3">Your Top Intelligences</h3>
        <div className="flex flex-wrap gap-3">
          {getTopIntelligences(gardner).map(({ key, label, score }) => (
            <div key={key} className="px-4 py-2 bg-primary-600/20 rounded-lg border border-primary-500/20">
              <span className="text-lg mr-2">{GARDNER_LABELS[key].emoji}</span>
              <span className="text-white font-medium">{label}</span>
              <span className="text-primary-400 ml-2 font-bold">{score}%</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
