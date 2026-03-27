'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { PrimaryActionCard } from '@/components/dashboard/PrimaryActionCard';
import { MechanicsOverview } from '@/components/dashboard/MechanicsOverview';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const NEXT_GAME = {
  title: 'Pattern Master',
  id: 'pattern-master',
  description: 'Unlock logical thinking and spot connections others miss. Powers analytical careers.',
  skillsBuilt: ['Pattern Recognition', 'Logical Thinking', 'Problem Solving'],
  careerRelevance: 'Foundation for tech, engineering, and research roles',
  estimatedTime: '8-10 mins',
};

const QUICK_LINKS = [
  { label: 'Play Games', href: '/games', icon: '🎮' },
  { label: 'Check Results', href: '/results', icon: '📊' },
  { label: 'Guidance Hub', href: '/guidance', icon: '💡' },
  { label: 'Chat with Counselor', href: '/chat', icon: '💬' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/60">Loading your dashboard...</p>
      </div>
    );
  }

  // Mock data - replace with real state
  const streakData = {
    currentStreak: 5,
    longestStreak: 5,
    confidenceScore: 62,
    gamesUntilUnlock: 1,
    scenariosCompleted: 0,
    missionsAttempted: 2,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-white/70">
          Your decision cockpit: track clarity, build skills, move closer to action.
        </p>
      </div>

      {/* Status Bar */}
      <StatusBar
        currentStreak={streakData.currentStreak}
        reliabilityScore={streakData.confidenceScore}
        gamesUntilUnlock={streakData.gamesUntilUnlock}
        nextGameTitle={NEXT_GAME.title}
      />

      {/* Primary Action */}
      <PrimaryActionCard {...NEXT_GAME} />

      {/* Mechanics Overview */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎯 Your Mechanics Progress</span>
        </h2>
        <MechanicsOverview
          currentStreak={streakData.currentStreak}
          confidenceScore={streakData.confidenceScore}
          scenariosCompleted={streakData.scenariosCompleted}
          missionsAttempted={streakData.missionsAttempted}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:bg-white/10 transition cursor-pointer text-center py-6">
              <div className="text-3xl mb-2">{link.icon}</div>
              <p className="text-sm font-semibold text-white">{link.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Parent Dashboard Teaser */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">👨‍👩‍👧 Parent Zone</h3>
          <p className="text-white/70 text-sm mb-3">
            Your parents want to help, but don't know how. Share your journey with them.
          </p>
          <p className="text-xs text-white/60">Unlocks after 7-day streak</p>
        </div>
        <Button
          onClick={() => router.push('/parent')}
          disabled={streakData.currentStreak < 7}
          className="whitespace-nowrap"
        >
          Open Parent Zone →
        </Button>
      </Card>

      {/* India-First Guidance Tips */}
      <Card className="bg-white/5 border-white/10 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">📍 India-First Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
          <div className="rounded-lg bg-white/5 border border-white/10 p-4">
            <h4 className="text-white font-semibold mb-2">🎓 Entrance Exam Reality</h4>
            <p>JEE/NEET are gates, not destinies. ₹2-4L private colleges often place better than mediocre IITS/AIMS. Plan for both.</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4">
            <h4 className="text-white font-semibold mb-2">👨‍👩‍👧 Parent Pressure Translation</h4>
            <p>When parents say "complete IIT," they mean "be secure." Help them see alternate pathways to stability.</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4">
            <h4 className="text-white font-semibold mb-2">💼 Internship &gt; Grades</h4>
            <p>Cohort of 2026: companies hire from portfolios, not transcripts. Start your projects NOW—grades matter later.</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4">
            <h4 className="text-white font-semibold mb-2">🔄 Flexibility Mindset</h4>
            <p>Tech shifts every 3 years. Build "Learn to Learn" skills (curiosity, debugging, collaboration). Pick a path but stay adaptable.</p>
          </div>
        </div>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-xs text-white/50 pt-4">
        <p>✨ All data is private and encrypted. You control what your parents see.</p>
      </div>
    </div>
  );
}
