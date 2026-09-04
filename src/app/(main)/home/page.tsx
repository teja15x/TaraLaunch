'use client';

import Link from 'next/link';
import { TaraPageShell } from '@/components/tara/TaraPageShell';
import { TaraStatusStrip } from '@/components/tara/TaraStatusStrip';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTaraStore } from '@/store/tara';

export default function TaraHomePage() {
  const { taraMoments, nextActions, journey, messages } = useTaraStore((state) => ({
    taraMoments: state.taraMoments,
    nextActions: state.nextActions,
    journey: state.journey,
    messages: state.messages,
  }));

  const latestMoment = taraMoments[0];
  const latestAction = nextActions[0];
  const latestJourney = journey[0];

  return (
    <TaraPageShell
      title="Home"
      subtitle="What matters right now: continue your cycle, test one signal in the real world, and update your journey with evidence."
    >
      <TaraStatusStrip />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-primary-200/80">Current Chapter</p>
          <h2 className="text-2xl font-bold text-white">{messages.length <= 1 ? 'Meet Tara' : 'From talk to tested evidence'}</h2>
          <p className="text-white/70">
            {messages.length <= 1
              ? 'Start naturally. No long questionnaire. Tell Tara what brought you here.'
              : 'You have active context. Continue the conversation or run an experience to generate stronger evidence.'}
          </p>
          <Link href="/talk">
            <Button>Continue with Tara</Button>
          </Link>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-white/60">Something Tara noticed</p>
          <p className="text-white/90">
            {latestMoment?.text ||
              'No Tara Moment yet. Complete one experience and reflection to unlock deeper insight.'}
          </p>
          <Link href="/experience">
            <Button variant="secondary">Start first experience</Button>
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/60">Next experiment</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{latestAction?.title || 'No action yet'}</h3>
          <p className="mt-2 text-sm text-white/70">
            {latestAction?.reason ||
              'Complete reflection after the Product Management world to generate a real-world action.'}
          </p>
          {latestAction && (
            <p className="mt-3 text-xs text-white/50">Deadline: {latestAction.deadline || 'Not set'}</p>
          )}
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wider text-white/60">Latest journey event</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{latestJourney?.title || 'Journey not started'}</h3>
          <p className="mt-2 text-sm text-white/70">{latestJourney?.description || 'Start with one conversation.'}</p>
        </Card>
      </div>
    </TaraPageShell>
  );
}
