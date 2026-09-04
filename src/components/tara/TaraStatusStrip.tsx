'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useTaraStore } from '@/store/tara';

export function TaraStatusStrip() {
  const { memories, evidence, hypotheses, nextActions } = useTaraStore((state) => ({
    memories: state.memories,
    evidence: state.evidence,
    hypotheses: state.hypotheses,
    nextActions: state.nextActions,
  }));

  const pendingActions = useMemo(
    () => nextActions.filter((action) => action.status !== 'done').length,
    [nextActions]
  );

  const stats = [
    { label: 'Memories', value: memories.length },
    { label: 'Evidence Signals', value: evidence.length },
    { label: 'Active Hypotheses', value: hypotheses.length },
    { label: 'Next Actions', value: pendingActions },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <p className="text-xs uppercase tracking-wider text-white/55">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
