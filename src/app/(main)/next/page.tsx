'use client';

import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTaraStore } from '@/store/tara';

export default function NextPage() {
  const { nextActions, updateNextAction } = useTaraStore((state) => ({
    nextActions: state.nextActions,
    updateNextAction: state.updateNextAction,
  }));

  return (
    <TaraPageShell
      title="Next"
      subtitle="Turn insight into real-world action. Actions carry reason, status, result, and reflection."
    >
      <div className="space-y-4">
        {nextActions.length === 0 && (
          <Card>
            <p className="text-white/70">No actions yet. Complete the Product Management experience to generate your first real-world experiment.</p>
          </Card>
        )}
        {nextActions.map((action) => (
          <Card key={action.id} className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-white/55">{action.status.replace('_', ' ')}</p>
            <h2 className="text-2xl font-semibold text-white">{action.title}</h2>
            <p className="text-white/75">{action.reason}</p>
            {action.deadline && <p className="text-sm text-white/60">Deadline: {action.deadline}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => updateNextAction(action.id, { status: 'in_progress' })}>Mark in progress</Button>
              <Button size="sm" onClick={() => updateNextAction(action.id, { status: 'done' })}>Mark done</Button>
            </div>
          </Card>
        ))}
      </div>
    </TaraPageShell>
  );
}
