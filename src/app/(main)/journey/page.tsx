'use client';

import { useMemo, useState } from 'react';
import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { memoryToExport } from '@/lib/tara/model';
import { useTaraStore } from '@/store/tara';

export default function JourneyPage() {
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const { journey, memories, updateMemory, deleteMemory } = useTaraStore((state) => ({
    journey: state.journey,
    memories: state.memories,
    updateMemory: state.updateMemory,
    deleteMemory: state.deleteMemory,
  }));

  const sortedJourney = useMemo(
    () => [...journey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [journey]
  );

  const exportMemories = () => {
    const blob = new Blob([JSON.stringify(memoryToExport(memories), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'tara-memory-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TaraPageShell
      title="Journey"
      subtitle="Journey is your development story: conversations, experiences, insights, actions, and outcomes over time."
    >
      <Card>
        <h2 className="text-xl font-semibold text-white">Timeline</h2>
        <div className="mt-4 space-y-3">
          {sortedJourney.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wider text-primary-100">{event.type}</p>
              <p className="mt-1 font-semibold text-white">{event.title}</p>
              <p className="text-sm text-white/70">{event.description}</p>
              <p className="mt-1 text-xs text-white/45">{new Date(event.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Memory (view / update / delete / export)</h2>
          <Button variant="secondary" onClick={exportMemories}>Export</Button>
        </div>
        <div className="mt-4 space-y-3">
          {memories.map((memory) => (
            <div key={memory.id} className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wider text-white/55">{memory.category} · {memory.confidence}</p>
              <p className="mt-1 text-sm text-white/65">{memory.key}</p>
              {editingMemoryId === memory.id ? (
                <>
                  <textarea
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-xl border border-white/20 bg-slate-950/60 p-2 text-sm text-white"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateMemory(memory.id, editingValue);
                        setEditingMemoryId(null);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingMemoryId(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-white/90">{memory.value}</p>
              )}
              {editingMemoryId !== memory.id && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {
                    setEditingMemoryId(memory.id);
                    setEditingValue(memory.value);
                  }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteMemory(memory.id)}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </TaraPageShell>
  );
}
