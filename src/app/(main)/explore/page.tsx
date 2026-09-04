'use client';

import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { buildExploreSignals } from '@/lib/tara/model';
import { useTaraStore } from '@/store/tara';

function ExploreBlock({
  title,
  items,
}: {
  title: string;
  items: { title: string; why: string; unknown: string; testNext: string }[];
}) {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.length === 0 && <p className="text-white/60">No signal yet. Run an experience to generate evidence.</p>}
        {items.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-white/75"><strong>Why:</strong> {item.why}</p>
            <p className="mt-1 text-sm text-white/75"><strong>Unknown:</strong> {item.unknown}</p>
            <p className="mt-1 text-sm text-primary-100"><strong>What to test next:</strong> {item.testNext}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ExplorePage() {
  const { evidence, hypotheses } = useTaraStore((state) => ({ evidence: state.evidence, hypotheses: state.hypotheses }));
  const signals = buildExploreSignals(evidence, hypotheses);

  return (
    <TaraPageShell
      title="Explore"
      subtitle="Not a static career list. Signals are grouped by evidence quality: strong signal, worth testing, and unexplored paths."
    >
      <ExploreBlock title="Strong Signal" items={signals.strongSignals} />
      <ExploreBlock title="Worth Testing" items={signals.worthTesting} />
      <ExploreBlock title="Unexplored" items={signals.unexplored} />
    </TaraPageShell>
  );
}
