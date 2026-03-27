'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();

  // Mock data - replace with real scores
  const confidenceScore = 62;

  const getConfidenceState = (score: number) => {
    if (score >= 75) return { label: 'Confident Path', emoji: '✅', color: 'from-emerald-600 to-emerald-700', status: 'Full Access' };
    if (score >= 50) return { label: 'Building Clarity', emoji: '⚡', color: 'from-amber-600 to-amber-700', status: 'Basic Access' };
    return { label: 'Early Stage', emoji: '🎮', color: 'from-yellow-600 to-orange-700', status: 'Limited Access' };
  };

  const state = getConfidenceState(confidenceScore);
  const gamesNeeded = Math.ceil((50 - confidenceScore) / 10);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Results Studio</h1>
        <p className="text-white/70">
          Your career insights unlock based on confidence. Play more games to refine your predictions.
        </p>
      </div>

      {/* Confidence Gate Explanation */}
      <Card className={`bg-gradient-to-br ${state.color} border-white/30 p-6 space-y-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{state.emoji}</span>
              <div>
                <p className="text-sm text-white/80 uppercase tracking-wider">Your Prediction Status</p>
                <h2 className="text-3xl font-bold text-white">{state.label}</h2>
              </div>
            </div>
            <p className="text-white/90 mt-2">
              Your confidence score is {confidenceScore}%. Based on your game performance and choices, we show you:
            </p>
          </div>
          <div className="text-right min-w-fit">
            <p className="text-5xl font-bold text-white/80">{confidenceScore}%</p>
            <p className="text-sm text-white/70 mt-1">Confidence</p>
          </div>
        </div>

        {/* Access Level */}
        <div className="rounded-lg bg-white/10 border border-white/20 p-4">
          <p className="text-xs uppercase tracking-wider text-white/70 mb-2">Your Current Access</p>
          <p className="text-lg font-bold text-white">{state.status}</p>
          <p className="text-sm text-white/80 mt-2">
            {confidenceScore >= 75
              ? '🎉 You can now explore all career matches, college pathways, and personalized action plans.'
              : confidenceScore >= 50
                ? '📊 You can see basic career matches. Play 1-2 more games to unlock premium insights.'
                : '🎮 Keep playing games! Each one unlocks more career matches and personalized pathways.'}
          </p>
        </div>
      </Card>

      {/* Confidence Unlock Roadmap */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-white">🗺️ Your Path to Full Unlock</h2>
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="space-y-4">
            {[
              {
                score: 0,
                label: 'Early Stage',
                access: ['Profile setup'],
                status: 'completed',
              },
              {
                score: 50,
                label: 'Basic Insights',
                access: ['3-5 top career matches', 'RIASEC summary', 'Basic action plan'],
                status: confidenceScore >= 50 ? 'completed' : 'in-progress',
                needed: confidenceScore < 50 ? `Play ${gamesNeeded} more game${gamesNeeded > 1 ? 's' : ''}` : null,
              },
              {
                score: 75,
                label: 'Confident Path',
                access: ['All career matches', 'Detailed college pathways', 'Entrance exam prep', 'Premium guidance'],
                status: confidenceScore >= 75 ? 'completed' : 'locked',
                needed: confidenceScore < 75 ? `Play ${Math.ceil((75 - confidenceScore) / 10)} more games` : null,
              },
            ].map((milestone) => (
              <div
                key={milestone.score}
                className="rounded-lg border border-white/20 p-4 flex items-start gap-4"
              >
                <div className="min-w-fit">
                  {milestone.status === 'completed' && <span className="text-3xl">✅</span>}
                  {milestone.status === 'in-progress' && <span className="text-3xl">⚡</span>}
                  {milestone.status === 'locked' && <span className="text-3xl">🔒</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">{milestone.label}</h4>
                    <span className="text-sm text-white/60">{milestone.score}% confidence</span>
                  </div>
                  <ul className="space-y-1 text-sm text-white/80">
                    {milestone.access.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-emerald-400">→</span> {item}
                      </li>
                    ))}
                  </ul>
                  {milestone.needed && (
                    <p className="text-xs text-white/60 mt-3 font-medium">{milestone.needed}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* What to Do Next */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-white">📍 What to Do Next</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary-600/20 to-accent-600/20 border-primary-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-3">🎮 Recommended Next Game</h3>
            <p className="text-white/80 mb-4">Story Weaver builds verbal reasoning—critical for law and communication roles.</p>
            <div className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20">
              <p className="text-sm text-white/70"><strong>Impact:</strong> +10-15% confidence boost</p>
              <p className="text-sm text-white/70"><strong>Time:</strong> 9-12 minutes</p>
            </div>
            <Button onClick={() => router.push('/games/story-weaver')} className="w-full">
              Play Story Weaver →
            </Button>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-3">💡 Get Personalized Guidance</h3>
            <p className="text-white/80 mb-4">Chat with an AI counselor who understands Indian career paths and entrance exam realities.</p>
            <div className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20">
              <p className="text-sm text-white/70"><strong>Topics:</strong> Parent pressure, stream choice, plan B's</p>
              <p className="text-sm text-white/70"><strong>Time:</strong> 5-10 minutes</p>
            </div>
            <Button onClick={() => router.push('/chat')} variant="secondary" className="w-full">
              Open Chat →
            </Button>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <Card className="bg-white/5 border-white/10 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">❓ FAQ</h3>
        <div className="space-y-4 text-sm text-white/80">
          <div>
            <h4 className="text-white font-semibold mb-1">Why are some matches locked?</h4>
            <p>At low confidence (&lt;50%), we show only&apos;s safest matches. As you play games and explore scenarios, your confidence increases&mdash;unlocking more options. This keeps you&apos;s being overwhelmed early on.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Do my friends see these scores?</h4>
            <p>No. All scores are private. Only you and your parents (if you share) can see them. You&apos;re in control.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Can I retake games to improve my score?</h4>
            <p>Absolutely. We average your top 2 scores per game. Replay anytime. Better performance &equals; higher confidence.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">What if I disagree with my matches?</h4>
            <p>You're in control. Ignore matches that don't fit. Use the Chat feature to discuss alternatives with a counselor.</p>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-primary-600/20 to-accent-600/20 border border-primary-500/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-2">🚀 Ready to unlock more insights?</h3>
          <p className="text-white/70 mb-4">
            {confidenceScore < 50
              ? `You're ${gamesNeeded} game${gamesNeeded > 1 ? 's' : ''} away from unlocking all basic career matches.`
              : confidenceScore < 75
                ? `You're ${Math.ceil((75 - confidenceScore) / 10)} more game${Math.ceil((75 - confidenceScore) / 10) > 1 ? 's' : ''} away from premium insights.`
                : 'You have access to all insights! Explore your matches and build your action plan.'}
          </p>
          <Button onClick={() => router.push('/games')} className="px-8 py-3">
            Play More Games →
          </Button>
        </div>
      </div>
    </div>
  );
}
