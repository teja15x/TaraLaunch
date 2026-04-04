

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
interface ChildProgress {
  gamesCompleted: number;
  currentStreak: number;
  reliabilityScore: number;
  lastActivityAt: string;
  topCareerPath: string;
  confidence: 'low' | 'moderate' | 'high';
}

export default function ParentDashboard() {
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);

  useEffect(() => {
    setChildProgress({
      gamesCompleted: 2,
      currentStreak: 5,
      reliabilityScore: 62,
      lastActivityAt: 'Today, 2:30 PM',
      topCareerPath: 'Engineering (AI/ML Track)',
      confidence: 'moderate',
    });
  }, []);

  if (!childProgress) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-white/60">Loading your child&apos;s profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">👨‍👩‍👧 Parent Progress Hub</h1>
        <p className="text-white/60 text-lg">School-linked progress, exam readiness, and guidance updates for your child.</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-white mb-2">Comprehensive Parent Dashboard</h2>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            This section is focused on school students: test progress, syllabus support status, career guidance milestones, and practical parent actions.
          </p>
          <Card className="mt-6 bg-white/5 p-4">
            <div className="space-y-3 text-left max-w-2xl mx-auto">
              <div className="flex gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <p className="text-white/80 text-sm"><strong>Career Matches:</strong> Personalized list of 5 best-fit careers based on traits and interests</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <p className="text-white/80 text-sm"><strong>Holland Code & RIASEC:</strong> Career interest areas breakdown</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <p className="text-white/80 text-sm"><strong>Big Five Personality:</strong> Emotional stability, openness, conscientiousness, and more</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <p className="text-white/80 text-sm"><strong>Gardner Multiple Intelligences:</strong> Top cognitive strengths</p>
              </div>
              <div className="flex gap-3">
                <span className="text-emerald-400 flex-shrink-0">✓</span>
                <p className="text-white/80 text-sm"><strong>Parent report summaries:</strong> Clear weekly updates from tests, guidance sessions, and next-step actions</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <Card className="text-center py-12">
        <div className="space-y-4">
          <div className="text-4xl">🎮</div>
          <h3 className="text-xl font-bold text-white">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-400">{childProgress.gamesCompleted}</div>
              <p className="text-white/60 text-sm mt-1">Games Played</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-400">{childProgress.currentStreak}</div>
              <p className="text-white/60 text-sm mt-1">Day Streak</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary-400">{childProgress.reliabilityScore}%</div>
              <p className="text-white/60 text-sm mt-1">Confidence</p>
            </div>
          </div>
          <div className="text-white/60 text-sm mt-6">
            Last activity: {childProgress.lastActivityAt}
          </div>
          <div className="text-white/60 text-sm">
            Top path: <strong className="text-white">{childProgress.topCareerPath}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}
