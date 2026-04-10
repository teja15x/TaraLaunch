'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Flame, Target, TrendingUp, Sparkles, BrainCircuit, ChevronRight, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';

export default function EnhancedDashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Future Leader';

  // Mock Engine Data based on Blueprint
  const streakDays = [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: true },
    { day: 'Fri', active: true },
    { day: 'Sat', active: false, isToday: true },
    { day: 'Sun', active: false },
  ];

  const currentStreak = 5;
  const clarityScore = 68; // Out of 100
  const xpPoints = 2450;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-4 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
      >
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3 h-3" /> System Calibrated
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{firstName}</span>.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Your clarity engine is running. Complete today's mission to strengthen your psychometric profile.
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="flex gap-4">
          <Card className="bg-slate-900/50 border-slate-800 p-4 backdrop-blur-xl flex flex-col items-center justify-center min-w-[100px]">
            <Flame className="w-8 h-8 text-orange-500 mb-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <div className="text-2xl font-black text-white">{currentStreak}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Day Streak</div>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800 p-4 backdrop-blur-xl flex flex-col items-center justify-center min-w-[100px]">
            <BrainCircuit className="w-8 h-8 text-cyan-500 mb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <div className="text-2xl font-black text-white">{xpPoints}</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">XP Earned</div>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Daily Mission & Action (Takes up 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Action Card: Daily Mission */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900/80 to-slate-900 border-indigo-500/30 p-8 backdrop-blur-2xl shadow-2xl shadow-indigo-900/20 group">
              <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Priority Mission</h2>
                  </div>
                  <h3 className="text-3xl font-black text-white leading-tight mb-3">
                    The Budget & Tradeoff Lab
                  </h3>
                  <p className="text-slate-300 text-lg mb-6 max-w-md">
                    We need to measure your pragmatic constraints. Navigate simulated 12th-grade financial and geographical hurdles.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => router.push('/games/budget-tradeoff')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      Initialize Simulation
                    </Button>
                    <span className="text-sm font-medium text-slate-400">+500 Engine XP</span>
                  </div>
                </div>
                
                {/* Visual Mission Graphic */}
                <div className="w-full md:w-48 aspect-square relative flex items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800 shrink-0 mt-6 md:mt-0">
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-2xl" />
                   <Target className="w-20 h-20 text-indigo-400/50" />
                   {/* Ring animation */}
                   <motion.div 
                     animate={{ rotate: 360 }} 
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 border-2 border-dashed border-indigo-500/20 rounded-full"
                   />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Activity Streak Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Momentum Engine
                </h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-full bg-slate-950">7-Day Orbit</span>
              </div>
              
              <div className="flex justify-between items-center px-1 sm:px-4">
                {streakDays.map((day, idx) => (
                  <div key={day.day} className="flex flex-col items-center gap-3">
                    <div className={`text-[10px] sm:text-xs font-bold uppercase ${day.isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {day.day}
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + (idx * 0.05) }}
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-crosshair
                        ${day.active 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : day.isToday 
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-500 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-600'
                        }
                      `}
                    >
                      {day.active ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" /> : <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current opacity-50" />}
                    </motion.div>
                  </div>
                ))}
              </div>
              
              {/* Daily Context Message */}
              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative z-10">
                <p className="text-sm border-l-2 border-emerald-500 pl-3 text-emerald-200/90 font-medium">
                  You are tracking perfectly. Completing today's mission will secure your longest streak and unlock the Tier-2 Data Module.
                </p>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Right Column: Readiness Trend & Quick Links */}
        <div className="space-y-6">
          
          {/* Readiness Trend Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-sm">Profile Calibrator</h3>
              </div>
              
              <div className="relative w-48 h-48 flex items-center justify-center mb-2">
                {/* Circular Progress Gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="96" cy="96" r="80" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    className="text-slate-800"
                  />
                  <motion.circle 
                    cx="96" cy="96" r="80" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    initial={{ strokeDasharray: '0 502' }}
                    animate={{ strokeDasharray: `${(clarityScore / 100) * 502} 502` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{clarityScore}<span className="text-xl text-slate-500">%</span></span>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">Clarity</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400 mt-4 leading-relaxed">
                Your career vectors are stabilizing. We need more data on your risk-tolerance to reach <strong className="text-white">85% confidence</strong>.
              </p>
            </Card>
          </motion.div>

          {/* Parent Report Teaser / Dossier Access */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              onClick={() => router.push('/parent/report')}
              className="bg-gradient-to-br from-emerald-900/60 to-slate-900 border-emerald-500/30 p-6 cursor-pointer hover:border-emerald-400/50 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative flex items-start justify-between z-10">
                <div>
                  <h3 className="font-bold text-emerald-300 flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5" /> The Dossier
                  </h3>
                  <p className="text-sm text-slate-300 mb-4 pr-4">
                    Your dynamic psychometric report is ready for export.
                  </p>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View PDF Access <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-400 shrink-0">
                  <Lock className="w-5 h-5 group-hover:hidden" />
                  <Sparkles className="w-5 h-5 hidden group-hover:block" />
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
