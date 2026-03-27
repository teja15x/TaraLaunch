'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { TrendingUp, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChildProgress {
  gamesCompleted: number;
  currentStreak: number;
  reliabilityScore: number;
  lastActivityAt: string;
  topCareerPath: string;
  confidence: 'low' | 'moderate' | 'high';
}

export default function ParentCopilorDashboard() {
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [emailFrequency, setEmailFrequency] = useState<'weekly' | 'biweekly'>('weekly');

  useEffect(() => {
    // Mock child progress data (MVP - would fetch from Supabase in production)
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
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const confidenceColors = {
    low: 'from-red-500/20 to-orange-500/20 border-red-400/30',
    moderate: 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30',
    high: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Child&apos;s Career Journey</h1>
        <p className="text-white/60 text-lg">Track progress, celebrate milestones, and stay accountable together.</p>
      </div>

      {/* Child Progress Summary */}
      <Card className={`bg-gradient-to-br ${confidenceColors[childProgress.confidence]} p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-white/60 text-sm mb-2">Current Path Clarity</p>
            <h2 className="text-2xl font-bold text-white mb-3">{childProgress.topCareerPath}</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-full bg-white/20 rounded-full h-3 flex-1">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                  style={{ width: `${childProgress.reliabilityScore}%` }}
                />
              </div>
              <span className="text-white font-semibold">{childProgress.reliabilityScore}%</span>
            </div>
            <p className="text-white/70 text-sm">Confidence Level: Still Building</p>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">
              <p className="text-white/60 text-xs mb-1">Games Completed</p>
              <p className="text-2xl font-bold text-white">{childProgress.gamesCompleted} / 5</p>
            </div>
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">
              <p className="text-white/60 text-xs mb-1">Current Streak</p>
              <p className="text-2xl font-bold text-white">{childProgress.currentStreak} days 🔥</p>
            </div>
            <div className="rounded-lg bg-white/10 border border-white/20 p-3">
              <p className="text-white/60 text-xs mb-1">Last Activity</p>
              <p className="text-sm font-medium text-white">{childProgress.lastActivityAt}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Items */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          What Your Child Should Do Next
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/15 border border-emerald-400/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Complete 3 more games to reach 75% confidence</p>
              <p className="text-white/60 text-sm">Then they can unlock detailed role guidance and college/entrance exam mapping.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/15 border border-blue-400/30">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Chat with the AI counselor this week</p>
              <p className="text-white/60 text-sm">5-10 minutes of conversation about their interests will refine their path significantly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/15 border border-amber-400/30">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Lock one weekly action plan</p>
              <p className="text-white/60 text-sm">A 1-hour mock test or a portfolio task. Small, consistent actions build clarity faster.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Parent Communication */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Weekly Parent Updates
        </h2>
        <div className="space-y-4">
          <p className="text-white/70">
            We&apos;ll send you a short (2-min read) summary every week with:
          </p>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">✓</span>
              <span>Games completed and confidence improvement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">✓</span>
              <span>New career insights discovered this week</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">✓</span>
              <span>Actionable suggestions for you (as parent)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">✓</span>
              <span>India-specific entrance exam + college advice</span>
            </li>
          </ul>

          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/60 mb-3">Frequency: {emailFrequency === 'weekly' ? 'Every Tuesday' : 'Every other Tuesday'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setEmailFrequency('weekly')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  emailFrequency === 'weekly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setEmailFrequency('biweekly')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  emailFrequency === 'biweekly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Bi-weekly
              </button>
            </div>
          </div>

          <Button className="w-full mt-4 bg-white text-slate-950 hover:bg-white/90">
            ✓ Save Settings
          </Button>
        </div>
      </Card>

      {/* Parent Tips */}
      <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
        <h2 className="text-xl font-semibold text-white mb-4">💡 Tips for Parents</h2>
        <div className="space-y-3 text-white/80 text-sm">
          <p>
            <strong>Don&apos;t ask &quot;What do you want to do?&quot;</strong> Ask instead: &quot;Of the 3 careers that came up, which one did something click with?&quot; Narrowing is easier than brainstorming.
          </p>
          <p>
            <strong>This isn&apos;t just grades.</strong> Career readiness is 30% academic strength, 40% self-awareness (what they discovered here), 30% real-world exposure (internships, conversations with professionals).
          </p>
          <p>
            <strong>Entrance exams are a filter, not destiny.</strong> JEE/NEET cutoffs change, college rankings shift, companies hire from unexpected backgrounds. Help them pick a path NOW, but stay flexible on the details.
          </p>
          <p>
            <strong>Your tone matters.</strong> If you sound stressed about their choice, they&apos;ll feel pressure. If you sound curious (&quot;Tell me why you picked this&quot;), they&apos;ll open up.
          </p>
        </div>
      </Card>

      {/* Data Privacy */}
      <div className="text-center text-white/50 text-xs">
        <p>🔒 All data is private and encrypted. We never share your child&apos;s career interests.</p>
        <p>Your child controls what you can see — they can always adjust privacy settings.</p>
      </div>
    </div>
  );
}
