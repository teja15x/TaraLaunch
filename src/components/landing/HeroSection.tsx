'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-white/70">India's AI Career Counselor</span>
            </div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white">
                Your Future,
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
                  Figured Out
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg lg:text-xl text-white/70 max-w-lg leading-relaxed"
            >
              Stop guessing. Start playing. Get personalized career pathways built for Indian students—entrance exams, internships, and the real world.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-3 gap-4 pt-4"
            >
              <div>
                <p className="text-3xl font-bold text-white">500K+</p>
                <p className="text-sm text-white/60">Students Guided</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">98%</p>
                <p className="text-sm text-white/60">Confidence Match</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">7 Days</p>
                <p className="text-sm text-white/60">To Clarity</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/chat" className="block">
                <Button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold text-lg rounded-lg flex items-center justify-center gap-2 transition-all">
                  Start Your Journey
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white/5">
                <Play size={20} />
                Watch Demo (2 min)
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-72 h-48 bg-gradient-to-br from-primary-600/20 to-accent-600/10 rounded-2xl border border-white/10 backdrop-blur-sm p-6"
              >
                <div className="text-white/80 text-sm font-medium mb-3">Your Quick Win</div>
                <div className="space-y-2 text-white/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    JEE/NEET aren't destinations
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Internships matter more than grades
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Your skills, not your board
                  </div>
                </div>
              </motion.div>

              {/* Center card */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="relative z-10 w-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/10 backdrop-blur-sm p-8 shadow-2xl"
              >
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-600/20 border border-primary-500/50">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  <span className="text-xs font-medium text-primary-300">Live Now</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">Pattern Master Game</h3>
                <p className="text-white/60 text-sm mb-6">
                  Unlock logical thinking. 8 mins. No pressure.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Progress</span>
                    <span>1,247 playing now</span>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all backdrop-blur-sm border border-white/20">
                  Play Now →
                </button>
              </motion.div>

              {/* Bottom right card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-16 -left-20 w-64 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 rounded-2xl border border-white/10 backdrop-blur-sm p-6"
              >
                <div className="text-white/80 text-sm font-medium mb-3">🎓 India Reality Check</div>
                <div className="space-y-2 text-white/60 text-xs">
                  <p>Private colleges often beat IITS in placements</p>
                  <p>Build your portfolio while in college</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
