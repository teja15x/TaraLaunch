'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';

interface RadarData {
  category: string;
  score: number;
  fullMark: number;
}

export default function PremiumParentDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const isPremium = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'starter';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'psychometrics' | 'action_plan'>('overview');

  // Mocked data for the premium experience
  const studentData = {
    name: 'Arjun',
    assessmentCompletion: 85,
    dominantTrait: 'Investigative (I)',
    secondaryTrait: 'Enterprising (E)',
    careerAlignments: [
      { role: 'Machine Learning Engineer', confidence: 92, trending: 'up' },
      { role: 'Quantitative Analyst', confidence: 88, trending: 'up' },
      { role: 'Product Manager (Tech)', confidence: 76, trending: 'neutral' }
    ],
    recentContradiction: "Stated preference for 'Creative Arts' but all game mechanics show intense preference for 'Structured Logic'. AI Counselor is gently probing this.",
    stressFlag: "Low"
  };

  if (!isPremium && false) { // Removing hard block to let user see the awesome UI
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto px-4">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">ðŸ”’</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Parent Portal Locked</h1>
        <p className="text-slate-400 mb-8 text-lg">
          Get transparent, data-driven insights into your child's true cognitive strengths and career alignments. Unbiased by peer pressure.
        </p>
        <Button onClick={() => router.push('/pricing')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold tracking-wide">
          Upgrade to Unlock Insights
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-8 font-sans">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            {studentData.name}'s <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Trajectory</span>
          </h1>
          <p className="text-lg text-slate-400">
            Real-time psychometric analysis & career alignment matrix.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-400">Engine Confidence</div>
            <div className="text-2xl font-bold text-white">High (85%)</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-indigo-500/10">
            <span className="text-xl font-bold text-indigo-400">85</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 border-b border-white/5 pb-4">
        {['overview', 'psychometrics', 'action_plan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-all duration-300",
              activeTab === tab 
                ? "bg-white text-black shadow-lg" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Career Alignments */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl">
                  <h2 className="text-xl font-bold text-white mb-6">Top Career Alignments</h2>
                  <div className="space-y-4">
                    {studentData.careerAlignments.map((career, idx) => (
                      <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                        <div>
                          <div className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">{career.role}</div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <span>Alignment Match:</span>
                            {career.trending === 'up' ? <span className="text-emerald-400">â†‘ Rising</span> : <span className="text-slate-400">â†’ Stable</span>}
                          </div>
                        </div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400">
                          {career.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 text-sm text-slate-400">
                    *Alignments are dynamically adjusted based on gameplay mechanics and direct AI counseling inputs.
                  </div>
                </Card>

                {/* AI Counselor Private Note */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">ðŸ¤–</div>
                  <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    AI Counselor's Private Note
                  </h3>
                  <p className="text-amber-100/80 leading-relaxed">
                    {studentData.recentContradiction}
                  </p>
                </div>
              </div>

              {/* Right Sidebar Stats */}
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                  <h3 className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-xs">Primary Modality</h3>
                  <div className="text-3xl font-black text-white mb-2">{studentData.dominantTrait}</div>
                  <p className="text-sm text-slate-500">Highly analytical, prefers structured problem solving over abstract conceptualization.</p>
                </Card>
                
                <Card className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                  <h3 className="text-slate-400 font-medium mb-4 uppercase tracking-wider text-xs">Stress & Pressure</h3>
                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-3xl font-black text-emerald-400">{studentData.stressFlag}</div>
                    <div className="text-sm text-slate-500 mb-1">Indicators detected</div>
                  </div>
                  <p className="text-sm text-slate-500">Language sentiment in counseling sessions shows healthy exploration without significant tier-1 college anxiety.</p>
                </Card>

              </div>
            </div>
          )}

          {/* TAB: PSYCHOMETRICS */}
          {activeTab === 'psychometrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl h-full">
                <h2 className="text-2xl font-bold text-white mb-6">Gardner's Intelligences</h2>
                <div className="space-y-5">
                  {[
                    { label: 'Logical-Mathematical', score: 90, color: 'bg-indigo-500' },
                    { label: 'Spatial', score: 75, color: 'bg-cyan-500' },
                    { label: 'Intrapersonal', score: 60, color: 'bg-emerald-500' },
                    { label: 'Linguistic', score: 45, color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-white font-bold">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-black rounded-full h-2.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-2.5 rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl h-full">
                <h2 className="text-2xl font-bold text-white mb-6">Big Five Personality</h2>
                <div className="space-y-5">
                  {[
                    { label: 'Openness', score: 82, color: 'bg-fuchsia-500' },
                    { label: 'Conscientiousness', score: 88, color: 'bg-blue-500' },
                    { label: 'Extraversion', score: 35, color: 'bg-orange-500' },
                    { label: 'Agreeableness', score: 65, color: 'bg-teal-500' },
                    { label: 'Neuroticism (Low)', score: 20, color: 'bg-rose-500' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className="text-white font-bold">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-black rounded-full h-2.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-2.5 rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB: ACTION PLAN */}
          {activeTab === 'action_plan' && (
            <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl max-w-4xl mx-auto h-full">
              <h2 className="text-2xl font-bold text-white mb-8">Guided Strategy (Next 30 Days)</h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-500/30 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black/50 p-6 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
                    <h3 className="font-bold text-white text-lg mb-1">Extracurricular Shift</h3>
                    <p className="text-slate-400 text-sm">Shift focus from generic debates to joining the school Robotics club to validate the high Logical-Mathematical psychometric score.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black/30 p-6 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-slate-300 text-lg mb-1">Play "Market Realities"</h3>
                    <p className="text-slate-500 text-sm">Prompt Arjun to complete the Market Reality game module to test resilience against shifting industry trends.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black/30 p-6 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-slate-300 text-lg mb-1">Final Stream Selection</h3>
                    <p className="text-slate-500 text-sm">AI Counselor will compile the definitive dossier recommending PCM + Computer Science based on 30 days of behavioral evidence.</p>
                  </div>
                </div>
                
              </div>
            </Card>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
