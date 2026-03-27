'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Flame, Star, Trophy } from 'lucide-react';

interface MilestoneInfo {
  days: number;
  icon: React.ReactNode;
  label: string;
  reward: string;
}

const MILESTONES: MilestoneInfo[] = [
  { days: 7, icon: <Flame className="w-5 h-5" />, label: '7-Day Warrior', reward: 'First counselor session eligible' },
  { days: 30, icon: <Star className="w-5 h-5" />, label: '30-Day Master', reward: 'Career path unlock bonus' },
  { days: 90, icon: <Trophy className="w-5 h-5" />, label: '90-Day Legend', reward: '1-on-1 counselor session access' },
];

export function StreakWidget() {
  const { streakData, incrementStreak } = useAppStore();
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [nextMilestone, setNextMilestone] = useState<MilestoneInfo | null>(null);

  // Trigger streak check on mount and daily
  useEffect(() => {
    incrementStreak();

    // Set up daily check at midnight
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - today.getTime();
    const timer = setTimeout(() => {
      incrementStreak();
      window.location.reload(); // Refresh to show new streak UI
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [incrementStreak]);

  // Calculate unlocked milestones and next milestone
  useEffect(() => {
    const unlocked = MILESTONES.filter(m => streakData.currentStreak >= m.days).map(m => m.days);
    setUnlockedMilestones(unlocked);

    const nextMile = MILESTONES.find(m => streakData.currentStreak < m.days);
    setNextMilestone(nextMile || null);
  }, [streakData.currentStreak]);

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Streak</h3>
        <Flame className="w-6 h-6 text-orange-500" />
      </div>

      {/* Main Streak Display */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-orange-600 mb-2">{streakData.currentStreak}</div>
        <p className="text-sm text-gray-600">
          {streakData.currentStreak === 1
            ? 'Day — Keep the fire going! 🔥'
            : `Days — Longest: ${streakData.longestStreak}`}
        </p>
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Next Milestone</span>
            <span className="text-xs text-gray-500">
              {streakData.currentStreak} / {nextMilestone.days} days
            </span>
          </div>
          <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{
                width: `${(streakData.currentStreak / nextMilestone.days) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {nextMilestone.days - streakData.currentStreak} more days to unlock: {nextMilestone.label}
          </p>
          <p className="text-xs text-amber-700 font-medium mt-1">💡 Reward: {nextMilestone.reward}</p>
        </div>
      )}

      {/* Unlocked Milestones */}
      {unlockedMilestones.length > 0 && (
        <div className="border-t border-orange-200 pt-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">Achievements Unlocked</p>
          <div className="space-y-2">
            {MILESTONES.filter(m => unlockedMilestones.includes(m.days)).map(milestone => (
              <div
                key={milestone.days}
                className="flex items-start gap-3 bg-white rounded-lg p-3 border border-orange-100"
              >
                <div className="text-orange-600 flex-shrink-0">{milestone.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{milestone.label}</p>
                  <p className="text-xs text-gray-600">{milestone.reward}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-4 pt-4 border-t border-orange-200">
        <p className="text-xs text-gray-600 text-center">
          {streakData.currentStreak > 0
            ? 'Come back tomorrow to keep your streak alive! 🎯'
            : 'Start your streak today by playing a game or chatting with our counselor.'}
        </p>
      </div>
    </Card>
  );
}
