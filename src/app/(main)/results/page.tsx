'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/helpers';

export default function StudentResultsPage() {
  const router = useRouter();

  // Mock data for the premium student experience
  const confidenceScore = 92;
  const traits = {
    logical: 95,
    spatial: 85,
    investigative: 88,
    enterprising: 70,
    realistic: 60
  };

  const getConfidenceState = (score: number) => {
    if (score >= 80) return { label: 'Crystal Clear', emoji: '💎', color: 'from-cyan-500 to-blue-600', status: 'Full Unlock' };
    if (score >= 50) return { label: 'Taking Shape', emoji: '⚡', color: 'from-purple-500 to-indigo-600', status: 'Core Modes' };
    return { label: 'Scanning...', emoji: '🔍', color: 'from-slate-600 to-slate-800', status: 'Basic Access' };
  };

  const state = getConfidenceState(confidenceScore);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-8 font-sans">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            AI Engine Syncing
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Career Genesis</span>
          </h1>
          <p className="text-lg text-slate-400">
            Here are the traits we've discovered while you were gaming.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-400">AI Confidence Map</div>
            <div className="text-xl font-bold text-white flex items-center justify-end gap-2">
              {state.label} {state.emoji}
            </div>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b ${state.color} shadow-lg shadow-blue-500/20`}>
            <span className="text-xl font-bold text-white">{confidenceScore}%</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trait Modalities */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl">
              <h2 className="text-2xl font-bold text-white mb-8">Neuro-Cognitive Strengths</h2>
              <div className="space-y-6">
                {[
                  { label: 'Logical & Systems Thinking', score: traits.logical, color: 'bg-blue-500' },
                  { label: 'Spatial Architecture', score: traits.spatial, color: 'bg-cyan-500' },
                  { label: 'Investigative Drive', score: traits.investigative, color: 'bg-emerald-500' },
                  { label: 'Enterprising Leadership', score: traits.enterprising, color: 'bg-purple-500' },
                  { label: 'Realistic Execution', score: traits.realistic, color: 'bg-amber-500' },
                ].map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="text-white font-bold">{item.score}/100</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-3 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1.5, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                        className={`h-full rounded-full ${item.color} relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-white/20 w-8 blur-md transform -skew-x-12 animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6">Top Recommended Vectors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl hover:border-indigo-500/40 transition-colors">
                  <div className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">Primary Match</div>
                  <div className="text-xl font-bold text-white mb-1">AI Systems Architect</div>
                  <p className="text-sm text-slate-400">Fits your extreme logical scoring and spatial reasoning from Pattern Master.</p>
                </div>
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl hover:border-purple-500/40 transition-colors">
                  <div className="text-purple-400 text-sm font-bold uppercase tracking-wider mb-2">Secondary Match</div>
                  <div className="text-xl font-bold text-white mb-1">Quantitative Analyst</div>
                  <p className="text-sm text-slate-400">Leverages your high investigative and numbers-driven decision making.</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Next Steps */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center text-4xl mb-6 relative z-10">
                🚀
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Deploy Next Simulator</h3>
              <p className="text-sm text-slate-400 mb-6 relative z-10">
                Your profile needs more data on spontaneous creativity. Play <strong>Story Weaver</strong> to unlock the remaining career pathways.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 relative z-10"
                onClick={() => router.push('/games/story-weaver')}
              >
                Launch Story Weaver
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-transparent border border-slate-800 p-8 rounded-3xl">
              <h3 className="font-bold text-white mb-4">Discovery Metrics</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Playtime</span>
                  <span className="text-white font-mono">1h 42m</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Decisions Logged</span>
                  <span className="text-white font-mono">148</span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Contradictions Found</span>
                  <span className="text-amber-400 font-mono">2</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}