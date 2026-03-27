'use client';

import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface MechanicsOverviewProps {
  currentStreak: number;
  confidenceScore: number;
  scenariosCompleted: number;
  missionsAttempted: number;
}

export function MechanicsOverview({
  currentStreak,
  confidenceScore,
  scenariosCompleted,
  missionsAttempted,
}: MechanicsOverviewProps) {
  const mechanics = [
    {
      name: 'Streak System 🔥',
      status: currentStreak > 0 ? `${currentStreak} day streak active` : 'Start your first game today',
      progress: currentStreak,
      maxProgress: 90,
      nextMilestone: currentStreak >= 90 ? 'Mastery!' : currentStreak >= 30 ? '90-day master' : currentStreak >= 7 ? '30-day champion' : '7-day starter',
      color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    },
    {
      name: 'Confidence Gates 📊',
      status: `${confidenceScore}% confidence level`,
      progress: confidenceScore,
      maxProgress: 100,
      nextMilestone: confidenceScore >= 75 ? 'Unlocked All' : confidenceScore >= 50 ? 'Basic Unlock' : 'Keep Playing',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    },
    {
      name: 'Branching Scenarios 🌳',
      status: `${scenariosCompleted} scenarios completed`,
      progress: scenariosCompleted * 33, // 3 scenarios total
      maxProgress: 100,
      nextMilestone: scenariosCompleted >= 3 ? 'All Explored' : scenariosCompleted >= 1 ? 'Explore More' : 'Start First',
      color: 'from-teal-500/20 to-green-500/20 border-teal-500/30',
    },
    {
      name: 'Adaptive Routing 🎮',
      status: `${missionsAttempted} games attempted`,
      progress: Math.min(missionsAttempted * 20, 100),
      maxProgress: 100,
      nextMilestone: missionsAttempted >= 5 ? 'Expert' : missionsAttempted >= 3 ? 'Advanced' : 'Getting Started',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs uppercase tracking-wider text-white/60 mb-3">Your Mechanics Progress</h3>
        <p className="text-sm text-white/70 mb-4">
          Track how you're unlocking each mechanic. Complete games to boost streak, confidence, and scenario exploration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mechanics.map((mechanic) => (
          <Card key={mechanic.name} className={`bg-gradient-to-br ${mechanic.color} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">{mechanic.name}</h4>
              <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-1 rounded">
                {mechanic.nextMilestone}
              </span>
            </div>

            <p className="text-sm text-white/80 mb-3">{mechanic.status}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Progress</span>
                <span>{Math.round((mechanic.progress / mechanic.maxProgress) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-400 transition-all"
                  style={{ width: `${Math.min((mechanic.progress / mechanic.maxProgress) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-white/5 border-white/10 p-4">
        <p className="text-xs uppercase tracking-wider text-white/60 mb-2">💡 How It Works</p>
        <ul className="space-y-2 text-sm text-white/75">
          <li>
            <strong className="text-white">🔥 Streak:</strong> Play daily to build consistency (7 &equals; eligible for counselor, 30 &equals; unlock advanced games)
          </li>
          <li>
            <strong className="text-white">📊 Confidence:</strong> Higher confidence = more career matches revealed (50% to unlock basics, 75%+ to unlock premium insights)
          </li>
          <li>
            <strong className="text-white">🌳 Scenarios:</strong> Explore India-first branching decisions (board vs stream, parent pressure, competition vs profile)
          </li>
          <li>
            <strong className="text-white">🎮 Missions:</strong> AI adapts difficulty based on your performance (quick-wins → advanced → mastery)
          </li>
        </ul>
      </Card>

      <div className="text-center pt-2">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-primary-300 hover:text-primary-200 text-sm font-medium transition"
        >
          Explore All Games →
        </Link>
      </div>
    </div>
  );
}
