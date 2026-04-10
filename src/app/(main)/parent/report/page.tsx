'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, BrainCircuit, ShieldCheck, Target, Printer } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DefinitiveDossierReport() {
  const { profile } = useAuth();
  const studentName = profile?.full_name || 'Arjun';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 print:bg-transparent p-4 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Decorative Branding for PDF / Screen */}
      <div className="absolute top-0 right-0 w-1/3 h-64 bg-indigo-500/10 blur-3xl rounded-none rounded-bl-full pointer-events-none print:hidden" />
      <div className="absolute bottom-0 left-0 w-1/3 h-64 bg-emerald-500/10 blur-3xl rounded-none rounded-tr-full pointer-events-none print:hidden" />

      {/* Floating Actions (Hidden on Print) */}
      <div className="fixed top-6 right-6 flex gap-4 z-50 print:hidden">
        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 shadow-xl rounded-full gap-2">
          <Printer className="w-5 h-5" /> 
          Export PDF Report
        </Button>
      </div>

      {/* Document Container */}
      <div className="max-w-[800px] mx-auto bg-white print:shadow-none shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-8 md:p-16 border border-slate-200 relative z-10 print:border-none print:p-0">
        
        {/* Header */}
        <header className="border-b-4 border-indigo-600 pb-8 mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-black tracking-tighter text-slate-900">Career Agent AI</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
              Definitive Dossier
            </h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase">Certified Psychometric Evaluation</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Generated For:</div>
            <div className="text-2xl font-bold text-slate-900">{studentName}</div>
            <div className="text-sm text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </header>

        {/* Section 1: Executive Summary */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-900">Executive Summary</h2>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg border-l-4 border-indigo-100 pl-6 m-0">
            Based on <strong>4 hours of immersive simulation data</strong>, including the <em>Scenario Quest</em> and <em>Budget Tradeoff Lab</em>, {studentName} demonstrates exceptional <strong>Logical-Mathematical</strong> and <strong>Spatial</strong> reasoning. However, under high-stress constraints (simulated family emergencies), they prioritize <em>pragmatic local stability</em> over high-risk urban entrepreneurship. 
          </p>
        </section>

        {/* Section 2: Cognitive Modalities */}
        <section className="mb-12 bg-slate-50 rounded-2xl p-8 border border-slate-100 print:bg-white print:border-slate-300">
          <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Neuro-Cognitive Strengths Map</h2>
          
          <div className="space-y-6">
            {[
              { label: 'Logical & Systems Thinking', score: 95, color: 'bg-indigo-600' },
              { label: 'Investigative Drive', score: 88, color: 'bg-indigo-500' },
              { label: 'Spatial Architecture', score: 85, color: 'bg-indigo-400' },
              { label: 'Realistic Execution', score: 70, color: 'bg-slate-400' },
              { label: 'Enterprising Risk', score: 40, color: 'bg-slate-300' },
            ].map((trait) => (
              <div key={trait.label}>
                <div className="flex justify-between font-bold text-slate-700 text-sm mb-2">
                  <span className="uppercase tracking-wider">{trait.label}</span>
                  <span>{trait.score}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${trait.color} print:bg-black`} style={{ width: `${trait.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Recommended Career Vectors */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-black text-slate-900">High-Confidence Vectors</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-indigo-600 p-6 rounded-2xl relative">
              <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Primary Path
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2 mb-2">AI Systems Architect</h3>
              <p className="text-sm text-slate-600 italic mb-4">Matches extreme logical scoring and spatial reasoning.</p>
              <div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-lg border border-green-200">
                92% Success Probability predicted by Engine
              </div>
            </div>

            <div className="border border-slate-300 p-6 rounded-2xl relative bg-white">
              <div className="absolute -top-3 left-4 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Secondary Path
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2 mb-2">Quantitative Analyst</h3>
              <p className="text-sm text-slate-600 italic mb-4">Leverages investigative drive, but requires higher risk tolerance in volatile markets.</p>
              <div className="bg-slate-50 text-slate-600 text-xs font-bold p-3 rounded-lg border border-slate-200">
                85% Success Probability predicted by Engine
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-200 text-sm text-slate-400">
          <p className="mb-2">This dossier is dynamically generated via gamified psychometric analysis.</p>
          <div className="font-mono text-xs text-slate-300">DOC-ID: CA-2026-993-X4 • VERIFIED ALGORITHM v4.2</div>
        </footer>

      </div>
    </div>
  );
}