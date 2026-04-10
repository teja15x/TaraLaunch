'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, AlertTriangle, TrendingUp, Filter, Search, Download, GraduationCap, ShieldAlert, CheckCircle2, ChevronRight, Activity, Focus } from 'lucide-react';

const MOCK_STATS = {
  totalStudents: 450,
  assessedStudents: 312,
  highRiskCount: 28,
  avgClarity: 64,
  topPaths: ['Computer Science (Tier-2)', 'Commerce / BBA', 'Design / Media', 'Mechanical / Civil'],
};

const HIGH_RISK_STUDENTS = [
  { id: '1', name: 'Rohan Sharma', stream: 'PCM', issue: 'High Stress + Low Clarity', lastActive: '2 hrs ago', severity: 'critical' },
  { id: '2', name: 'Aditi Verma', stream: 'PCB', issue: 'Contradictory Traits (Risk vs Goal)', lastActive: '1 day ago', severity: 'high' },
  { id: '3', name: 'Kabir Singh', stream: 'Commerce', issue: 'Missed 3 Guidance Deadlines', lastActive: '4 days ago', severity: 'medium' },
  { id: '4', name: 'Priya Patel', stream: 'Humanities', issue: 'Unrealistic Budget Tradeoffs', lastActive: '5 hours ago', severity: 'high' }
];

export default function B2BSchoolHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'intervention' | 'cohort'>('overview');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-4 relative">
      
      {/* Background Corporate Glow */}
      <div className="absolute top-0 right-1/4 w-1/3 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldAlert className="w-4 h-4" /> Counselor & Principal Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Cohort <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Intelligence</span>.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Real-time psychometric telemetry for the Class of 2026. Spot at-risk students before the board exams.
          </p>
        </div>

        <div className="flex gap-4">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2 rounded-xl transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => router.push('/school/invite')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            <Users className="w-4 h-4" /> Add Students
          </Button>
        </div>
      </motion.div>

      {/* Macro Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: MOCK_STATS.totalStudents, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Assessed (Active)', value: MOCK_STATS.assessedStudents, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Avg Cohort Clarity', value: `${MOCK_STATS.avgClarity}%`, icon: Focus, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
          { label: 'Flagged / High Risk', value: MOCK_STATS.highRiskCount, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className={`p-6 border ${stat.border} bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 p-12 ${stat.bg} blur-3xl group-hover:scale-125 transition-transform duration-500`} />
              <div className="relative z-10 flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10 text-4xl font-black text-white">{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area (Intervention Queue) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <AlertTriangle className="text-rose-500" /> Intervention Trigger Queue
                </h2>
                <p className="text-slate-400 mt-2 text-sm">Automatically flagged students requiring immediate counselor attention based on Engine constraints.</p>
              </div>
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                <div className="px-3 py-1.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-md uppercase tracking-wider">Critical First</div>
              </div>
            </div>

            <div className="space-y-4">
              {HIGH_RISK_STUDENTS.map((student, idx) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${student.severity === 'critical' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : student.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'}`} />
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">{student.stream}</span>
                        <span className="text-sm text-slate-400">{student.issue}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto">
                    <div className="text-xs text-slate-500 font-medium hidden md:block border-r border-slate-800 pr-4">
                      Active: {student.lastActive}
                    </div>
                    <Button className="w-full md:w-auto bg-slate-800 hover:bg-blue-600 text-white font-bold transition-colors">
                      Review Dossier <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button className="w-full mt-6 bg-transparent border-2 border-dashed border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-400 font-bold py-4">
              View All 28 Flagged Students
            </Button>
          </Card>
        </div>

        {/* Right Area (Distribution Analytics) */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-8">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" /> Cohort Vectors
            </h3>
            <p className="text-sm text-slate-400 mb-6">Top predicted pathways computed from active student psychometric data.</p>
            
            <div className="space-y-5">
              {MOCK_STATS.topPaths.map((path, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-300">{path}</span>
                    <span className="text-blue-400">{Math.floor(Math.random() * 40 + 10)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full" 
                      style={{ width: `${Math.floor(Math.random() * 40 + 10)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/30 p-8 relative overflow-hidden group cursor-pointer hover:border-indigo-400/50 transition-colors">
             <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 blur-[50px] group-hover:bg-indigo-500/20 transition-colors" />
             <div className="relative z-10">
               <GraduationCap className="w-10 h-10 text-indigo-400 mb-4" />
               <h3 className="text-xl font-black text-white mb-2">Generate Parent Reports</h3>
               <p className="text-sm text-indigo-200/80 mb-6 line-clamp-2">
                 Batch export the 'Definitive Dossier' PDFs for the upcoming Parent-Teacher Meeting (PTM).
               </p>
               <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                 Initiate Batch Export <ChevronRight className="w-4 h-4" />
               </span>
             </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
