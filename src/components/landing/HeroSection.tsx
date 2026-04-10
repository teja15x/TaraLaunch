'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Users, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-1/4 left-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy & Cialdini Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* AUTHORITY & SOCIAL PROOF: "Backed by EdTech Psychometrics." */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm w-fit group hover:border-indigo-500/50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-slate-300 font-medium tracking-wide">
                Backed by Clinical Psychologists & EdTech Leaders
              </span>
            </div>

            {/* LIKING: Addressing culturally relatable pain point ("No more guessing. No more peer pressure.") */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                Discover Your True Path. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Game Your Way to Clarity.
                </span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
                Stop guessing your future based on marks or peer pressure. Our AI uses stealth psychometrics hidden inside high-end video games to map your true cognitive strengths and career fit.
              </p>
            </div>

            {/* RECIPROCITY & COMMITMENT: Start with a small, free task -> "Play 3-Min Assessment Free" */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] group">
                  <Play className="w-5 h-5 fill-current" />
                  Play Free Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <p className="text-sm text-slate-500 font-medium px-4">
                Takes 5 mins â€¢ No credit card required.
              </p>
            </div>

            {/* SOCIAL PROOF: "10,000+ Students Analyzed" */}
            <div className="pt-8 border-t border-slate-800/50 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-400">
                  12k+
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Join <span className="text-white font-bold">12,450+ students</span> who <br /> mapped their careers this month.
              </div>
            </div>
          </motion.div>

          {/* Right: Visual App Showcase (UI/UX Trust indicator) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Abstract gamified dashboard projection */}
            <div className="relative w-full max-w-lg aspect-square">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 border border-slate-800 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-4 border border-dashed border-indigo-500/30 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Core visual */}
              <div className="absolute inset-12 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <BrainCircuit className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Neural Mapping</div>
                      <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Active Analysis</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">92%</div>
                    <div className="text-slate-500 text-xs">Confidence Score</div>
                  </div>
                </div>

                {/* Radar Mock */}
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  {[
                    { label: 'Logical-Mathematical', w: '85%' },
                    { label: 'Spatial-Visual', w: '70%' },
                    { label: 'Investigative Drive', w: '95%' }
                  ].map((bar, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{bar.label}</div>
                      <div className="w-full bg-slate-950 rounded-full h-2 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: bar.w }}
                          transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                  <div className="text-sm text-slate-400 mb-1">Recommended Vector:</div>
                  <div className="text-lg font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI Systems Architecture</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}