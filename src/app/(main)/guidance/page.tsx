'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Compass, GraduationCap, MapPin, Clock, ArrowRight, BellRing, Sparkles, Building2, Calculator } from 'lucide-react';

const EXAM_TIMELINES = [
  { id: 1, date: 'Nov 1 - Dec 15', title: 'JEE Main (Session 1) Registration', type: 'Exam', status: 'upcoming', urgency: 'high' },
  { id: 2, date: 'Jan 24 - Feb 1', title: 'JEE Main (Session 1) Exams', type: 'Exam', status: 'future', urgency: 'normal' },
  { id: 3, date: 'Feb 15 - Mar 10', title: 'CUET (UG) Application Window', type: 'Exam', status: 'future', urgency: 'normal' },
  { id: 4, date: 'April 10', title: 'MHT-CET / State CET Applications Close', type: 'State Exam', status: 'future', urgency: 'normal' },
];

const SCHOLARSHIPS = [
  { id: 1, name: 'Reliance Foundation Scholarship', amount: '₹2 Lakhs/yr', eligibility: 'Household income < 15L, JEE Rank', type: 'Merit + Means' },
  { id: 2, name: 'Tata College Scholarship', amount: 'Up to 50% Tuition', eligibility: 'Class 12th > 85%', type: 'Merit' },
  { id: 3, name: 'State Government E-Kalyan', amount: 'Full Tuition Waiver', eligibility: 'Reserved Category, Income criteria', type: 'Govt Aid' },
];

export default function DynamicGuidanceHub() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'timeline' | 'opportunities' | 'fallback'>('timeline');

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-4 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-20 right-0 w-1/2 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Compass className="w-4 h-4" /> Strategic Mapping
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Data-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Action Plan</span>.
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          The AI has calibrated your psychological traits against the Indian education reality. Here is your precise 12-month execution timeline.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 block p-2 rounded-2xl w-fit backdrop-blur-xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'timeline' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Exam Timeline</div>
        </button>
        <button 
          onClick={() => setActiveTab('opportunities')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'opportunities' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Radar & Scholarships</div>
        </button>
        <button 
          onClick={() => setActiveTab('fallback')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'fallback' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Fallback Matrix</div>
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black text-white mb-6">Upcoming Milestones</h2>
            <div className="relative border-l-2 border-slate-800 ml-4 space-y-12">
              {EXAM_TIMELINES.map((item, idx) => (
                <div key={item.id} className="relative pl-8 md:pl-12">
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-slate-950 ${item.urgency === 'high' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-slate-700'}`} />
                  <Card className="bg-slate-900 border-slate-800 p-6 md:p-8 hover:border-purple-500/50 transition-colors group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {item.date}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                        <div className="inline-block px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-300 font-medium">
                          {item.type}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {item.urgency === 'high' ? (
                          <Button className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30">
                            Apply Now
                          </Button>
                        ) : (
                          <Button className="bg-slate-800 text-white hover:bg-slate-700">
                            <BellRing className="w-4 h-4 mr-2" /> Set Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'opportunities' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="bg-gradient-to-r from-pink-900/40 to-rose-900/20 border border-pink-500/30 p-8 rounded-3xl backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                <GraduationCap className="text-pink-400" /> Capital & College Radar
              </h2>
              <p className="text-pink-200/80 mb-8 max-w-2xl">
                Based on your Budget Tradeoff Lab results, the engine has matched these high-probability financial aids to your profile.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SCHOLARSHIPS.map(sch => (
                  <Card key={sch.id} className="bg-slate-950/50 border-pink-500/20 p-6 flex flex-col h-full">
                    <div className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-3">{sch.type}</div>
                    <h3 className="text-xl font-bold text-white mb-4 flex-1">{sch.name}</h3>
                    <div className="space-y-4">
                      <div className="bg-pink-950/30 p-3 rounded-lg border border-pink-900/50">
                        <div className="text-slate-400 text-xs uppercase mb-1">Value</div>
                        <div className="text-pink-300 font-bold">{sch.amount}</div>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <div className="text-slate-400 text-xs uppercase mb-1">Criteria</div>
                        <div className="text-slate-200 text-sm leading-tight">{sch.eligibility}</div>
                      </div>
                    </div>
                    <Button className="w-full mt-6 bg-pink-600 hover:bg-pink-500 font-bold text-white">
                      Check Eligibility
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fallback' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="bg-slate-900 border-indigo-500/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px]" />
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                  <Calculator className="text-indigo-400" /> The Pragmatism Matrix
                </h2>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl">
                  In India, depending solely on Tier-1 exams is mathematically risky. Here is your dynamically generated fallback tree.
                </p>

                <div className="space-y-6">
                  <div className="flex items-stretch gap-6">
                    <div className="w-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 font-black text-xl shrink-0">
                      Plan A
                    </div>
                    <div className="bg-slate-800 border.slate-700 p-6 rounded-2xl flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">CS at NIT / Top State Govt. College</h3>
                      <p className="text-slate-400 text-sm">Requires 98.5+ Percentile in JEE Main or Top 500 in State CET.</p>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2"><ArrowRight className="text-slate-600 w-8 h-8 rotate-90" /></div>

                  <div className="flex items-stretch gap-6">
                    <div className="w-16 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl shrink-0">
                      Plan B
                    </div>
                    <div className="bg-slate-800 border.slate-700 p-6 rounded-2xl flex-1 border border-amber-500/20">
                      <h3 className="text-xl font-bold text-white mb-2">ECE / IT at Tier-2 Private (e.g. VIT, Manipal, Thapar)</h3>
                      <p className="text-slate-400 text-sm mb-4">Requires clearing their specific entrance exams. Forms open January.</p>
                      <div className="bg-amber-950/30 text-amber-200 text-xs p-3 rounded-lg border border-amber-900/50">
                        <strong>Budget Warning:</strong> Costs ~15-20L. Your simulation showed a preference for lower loans. Discuss this with parents now.
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-2"><ArrowRight className="text-slate-600 w-8 h-8 rotate-90" /></div>

                  <div className="flex items-stretch gap-6">
                    <div className="w-16 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 font-black text-xl shrink-0">
                      Plan C
                    </div>
                    <div className="bg-slate-800 border.slate-700 p-6 rounded-2xl flex-1 border border-rose-500/20">
                      <h3 className="text-xl font-bold text-white mb-2">B.Sc. IT (Local) + Massive Self-Skilling</h3>
                      <p className="text-slate-400 text-sm mb-4">Negligible college tuition. Focus entirely on LeetCode, GitHub open source, and remote internships.</p>
                      <div className="bg-rose-950/30 text-rose-200 text-xs p-3 rounded-lg border border-rose-900/50">
                        <strong>Risk:</strong> Requires extremely high self-discipline (your score: 72/100). Might need an accountability peer group to succeed.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

    </div>
  );
}
