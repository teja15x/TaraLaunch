'use client';

import { Card } from '@/components/ui/Card';
import type { RiasecScores } from '@/types';
import { RIASEC_LABELS } from '@/lib/career-engine/riasec';

interface RIASECChartProps {
  riasec: RiasecScores;
  hollandCode?: string;
}

export function RIASECChart({ riasec, hollandCode }: RIASECChartProps) {
  return (
    <>
      <Card>
        <h2 className="text-xl font-semibold text-white mb-2">RIASEC Interest Profile</h2>
        <p className="text-white/50 text-sm mb-6">Holland&apos;s 6 occupational interest types — your career personality</p>
        <div className="space-y-4">
          {(Object.keys(riasec) as (keyof RiasecScores)[]).map((key) => {
            const info = RIASEC_LABELS[key];
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{info.emoji}</span>
                  <span className="text-white font-medium text-sm">{info.label}</span>
                  <span className="text-white/40 text-xs ml-auto">{riasec[key]}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                    style={{ width: `${riasec[key]}%` }}
                  />
                </div>
                <p className="text-white/40 text-xs mt-1">{info.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {hollandCode && (
        <Card className="bg-gradient-to-r from-primary-600/10 to-accent-600/10">
          <h3 className="text-white font-semibold mb-2">
            Your Holland Code: <span className="text-primary-400 text-xl">{hollandCode}</span>
          </h3>
          <p className="text-white/60 text-sm">
            This 3-letter code represents your dominant interest areas. People with similar codes
            tend to thrive in similar career environments. Use this as a guide, not a limitation!
          </p>
        </Card>
      )}
    </>
  );
}
