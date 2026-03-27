'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Zap, BookOpen, Target, Lightbulb, Sparkles } from 'lucide-react';
import React from 'react';

interface EnhancedChatStartFormProps {
  children: React.ReactNode;
}

export function EnhancedChatStartForm({ children }: EnhancedChatStartFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-12 pb-8 text-center border-b border-white/5"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 hover:border-white/40 transition-all"
          >
            <Lightbulb size={16} className="text-emerald-400 animate-pulse" />
            <span className="text-sm text-white/80 font-medium">AI-Powered Career Counseling</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Let's Find Your{' '}
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-emerald-400 bg-clip-text text-transparent">
              Perfect Path
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Answer a few quick questions and get personalized guidance from our AI counselor. Takes just 5 minutes.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Benefits & Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/[0.03] rounded-2xl p-5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
                <h3 className="font-semibold text-white">What You Get</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  'AI-powered matching',
                  'Personalized roadmap',
                  'Real market insights',
                  'Action steps',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.08 }}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white/90 transition-colors"
                  >
                    <span className="text-emerald-400/80">→</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Stage Quick Reference */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">Your Stage</p>
              <div className="space-y-2">
                {[
                  { icon: BookOpen, label: 'Class 10-12', color: 'from-blue-500/20 to-cyan-500/10', accent: 'text-blue-400' },
                  { icon: Zap, label: 'Intermediate', color: 'from-purple-500/20 to-pink-500/10', accent: 'text-purple-400' },
                  { icon: GraduationCap, label: 'Degree/BTech', color: 'from-emerald-500/20 to-teal-500/10', accent: 'text-emerald-400' },
                  { icon: Target, label: 'Final/Job Hunt', color: 'from-orange-500/20 to-red-500/10', accent: 'text-orange-400' },
                ].map((stage, i) => {
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.06 }}
                      className={`p-3 rounded-lg bg-gradient-to-r ${stage.color} border border-white/10 hover:border-white/20 transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={`${stage.accent} flex-shrink-0`} />
                        <span className="text-xs text-white/80 group-hover:text-white/100 transition-colors font-medium">{stage.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-gradient-to-br from-white/8 to-white/[0.02] rounded-3xl p-8 border border-white/10 backdrop-blur-xl shadow-2xl">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
