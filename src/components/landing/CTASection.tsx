'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background with deep contrast for Scarcity/Urgency */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-[100%] blur-[100px] -translate-x-1/2 translate-y-1/2 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* SCARCITY PRINCIPLE: Beta Access Limits */}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase tracking-widest text-xs mb-8 mx-auto">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Visionary Beta: Only 140 Spots Remaining
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Stop Filtering Through <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Other People's Expectations.
            </span>
          </h2>
          
          {/* LIKING & COMMITMENT: Addressing the core cultural pain and asking for a small step */}
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The era of choosing careers based on neighbor's advice is over. Join the waitlist for India's first gamified mapping engine before the price triples. 
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-slate-950 font-black text-lg hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3">
                <Zap className="w-5 h-5 fill-current" />
                Claim Your Free Assessment
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            
            <p className="text-slate-500 text-sm mt-4 sm:mt-0 font-medium flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
              <Lock className="w-4 h-4 text-emerald-400" />
              256-bit Secure Encryption
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}