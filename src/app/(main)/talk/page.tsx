'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTaraStore } from '@/store/tara';

export default function TalkPage() {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    profile,
    messages,
    addMessage,
    upsertMemory,
    ensureStarterMessage,
    addJourneyEvents,
    markOnboardingComplete,
  } = useTaraStore((state) => ({
    profile: state.profile,
    messages: state.messages,
    addMessage: state.addMessage,
    upsertMemory: state.upsertMemory,
    ensureStarterMessage: state.ensureStarterMessage,
    addJourneyEvents: state.addJourneyEvents,
    markOnboardingComplete: state.markOnboardingComplete,
  }));

  useEffect(() => {
    ensureStarterMessage();
  }, [ensureStarterMessage]);

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message || loading) return;

    addMessage('user', message);
    setDraft('');
    setLoading(true);

    try {
      const response = await fetch('/api/tara/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language: profile.language,
          lifeStage: profile.lifeStage,
          conversation: messages.slice(-10).map((item) => ({ role: item.role, content: item.content })),
        }),
      });

      const data = await response.json();
      const assistantReply = data.reply || 'I lost context for a moment. Tell me that again in one line.';
      addMessage('assistant', assistantReply);
      markOnboardingComplete();

      if (Array.isArray(data.memoryOperations)) {
        data.memoryOperations.forEach((operation: { action: string; category: string; key: string; value: string; confidence?: string }) => {
          if (operation.action === 'upsert') {
            upsertMemory({
              category: operation.category,
              key: operation.key,
              value: operation.value,
              confidence: operation.confidence,
              source: 'conversation',
            });
          }
        });
      }

      addJourneyEvents([
        {
          id: `journey-chat-${Date.now()}`,
          type: 'conversation',
          title: 'Conversation updated',
          description: `Discussed: ${message.slice(0, 100)}`,
          date: new Date().toISOString(),
        },
      ]);
    } catch {
      addMessage('assistant', 'I hit a system issue. Demo mode is still available — tell me your situation again and I will continue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaraPageShell
      title="Talk"
      subtitle="USER → TALK → UNDERSTAND. Start natural conversation. Tara listens, remembers, and asks better questions before advice."
    >
      <Card className="space-y-4 p-4">
        <p className="text-xs uppercase tracking-wider text-white/55">Meet Tara</p>
        <p className="text-white/90">Hey. I&apos;m Tara. What brought you here?</p>
      </Card>

      <Card className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-2xl border p-3 text-sm ${
              message.role === 'assistant'
                ? 'border-primary-300/20 bg-primary-500/10 text-white'
                : 'border-white/15 bg-white/5 text-white/90'
            }`}
          >
            <p className="mb-1 text-[10px] uppercase tracking-wider text-white/50">{message.role === 'assistant' ? 'Tara' : 'You'}</p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-4">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tell Tara what's going on..."
          className="min-h-28 w-full rounded-2xl border border-white/20 bg-slate-950/60 p-3 text-sm text-white outline-none focus:border-primary-300/60"
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={sendMessage} loading={loading}>Send</Button>
          <Link href="/experience">
            <Button variant="secondary">Move to experience</Button>
          </Link>
        </div>
      </Card>
    </TaraPageShell>
  );
}
