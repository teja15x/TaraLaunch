'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {  IndianRupee, Brain, HeartPulse, GraduationCap } from 'lucide-react';

interface TradeoffOption {
  id: string;
  text: string;
  cost: number;
  stressCost: number;
  skillGain: number;
  traitImpact: Record<string, number>; // realistic, enterprising, conventional, stress_resilience
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  options: TradeoffOption[];
}

const BUDGET_GAME_SCENARIOS: Scenario[] = [
  {
    id: 's1_after_12th',
    title: 'Crossroads: After 12th',
    description: 'You just finished 12th. Your family has saved ₹15 Lakhs for your entire education. What is your next move?',
    options: [
      { id: 'opt1_tier3', text: 'Tier-3 Private Engg College (Near home). Safe, average placements.', cost: 800000, stressCost: 10, skillGain: 20, traitImpact: { conventional: 20, realistic: 10 } },
      { id: 'opt2_kota', text: 'Drop a year. Move to Kota for JEE prep. Highly competitive.', cost: 300000, stressCost: 40, skillGain: 35, traitImpact: { enterprising: 10, stress_resilience: 20 } },
      { id: 'opt3_online', text: 'Local BCA + heavy online certifications & open source. Very raw, self-driven.', cost: 200000, stressCost: 15, skillGain: 60, traitImpact: { realistic: 30, enterprising: 25 } }
    ]
  },
  {
    id: 's2_family_emergency',
    title: 'The Unforeseen Crisis',
    description: 'During your 2nd year, a medical emergency at home requires an immediate ₹2 Lakhs. Your family is stressed but tells you to focus on studies.',
    options: [
      { id: 'opt1_loan', text: 'Take an education loan to cover your remaining fees so family can use savings.', cost: 0, stressCost: 25, skillGain: 5, traitImpact: { realistic: 30, stress_resilience: 20 } },
      { id: 'opt2_freelance', text: 'Start intense freelancing/tutoring alongside study to earn the ₹2L yourself.', cost: -200000, stressCost: 45, skillGain: 30, traitImpact: { enterprising: 40, conventional: -15 } },
      { id: 'opt3_ignore', text: 'Trust the family to handle it and double down on maintaining a 9.5 CGPA.', cost: 200000, stressCost: 5, skillGain: 20, traitImpact: { conventional: 25, stress_resilience: -10 } }
    ]
  },
  {
    id: 's3_placement',
    title: 'Placement Season',
    description: 'You are graduating. You have exactly ₹3 Lakhs left in savings to start your adult life. Two offers are on the table.',
    options: [
      { id: 'opt1_mass', text: 'Mass Recruiter (TCS/Wipro) at 3.5 LPA. Safe, unglamorous, close to home.', cost: 0, stressCost: 5, skillGain: 10, traitImpact: { conventional: 30, realistic: 20 } },
      { id: 'opt2_startup', text: 'Early Stage AI Startup in Bengaluru at 12 LPA. Extreme hours, risk of firing. Relocation costs ₹1.5L.', cost: 150000, stressCost: 50, skillGain: 50, traitImpact: { enterprising: 40, stress_resilience: 30 } },
      { id: 'opt3_masters', text: 'Reject both. Spend remaining ₹3L on GATE/CAT prep for a Govt job or IIT Masters.', cost: 300000, stressCost: 30, skillGain: 25, traitImpact: { conventional: 15, risk_tolerance: -10 } }
    ]
  }
];

export default function BudgetTradeoffGame() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [budget, setBudget] = useState(1500000);
  const [stress, setStress] = useState(10); // Max 100
  const [skills, setSkills] = useState(10); // Max 100
  
  const [traits, setTraits] = useState<Record<string, number>>({});
  const [gameComplete, setGameComplete] = useState(false);

  const scenario = BUDGET_GAME_SCENARIOS[currentStep];

  const formatRupees = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  const handleChoice = (option: TradeoffOption) => {
    const newBudget = budget - option.cost;
    const newStress = Math.min(100, Math.max(0, stress + option.stressCost));
    const newSkills = Math.min(100, skills + option.skillGain);

    setBudget(newBudget);
    setStress(newStress);
    setSkills(newSkills);

    // Accumulate Traits
    setTraits(prev => {
      const next = { ...prev };
      Object.entries(option.traitImpact).forEach(([trait, val]) => {
        next[trait] = (next[trait] || 0) + val;
      });
      return next;
    });

    if (currentStep < BUDGET_GAME_SCENARIOS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setGameComplete(true);
      setTimeout(() => {
        router.push('/dashboard?module=budget-completed');
      }, 4000);
    }
  };

  if (gameComplete) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Simulation Complete</h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
            Your pragmatic vs. idealistic ratio has been mapped. Generating your actionable career dossier...
          </p>
          <div className="flex gap-6 justify-center">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-sm text-slate-500 uppercase">Final Budget</div>
              <div className="text-2xl font-bold text-emerald-400">{formatRupees(budget)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-sm text-slate-500 uppercase">Stress Score</div>
              <div className="text-2xl font-bold text-rose-400">{stress}%</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resource HUD */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Family Savings</div>
              <motion.div key={budget} initial={{ scale: 1.2, color: '#10b981' }} animate={{ scale: 1, color: '#f8fafc' }} className="text-2xl font-black text-white">
                {formatRupees(budget)}
              </motion.div>
            </div>
          </Card>
          
          <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                <span>Burnout Risk</span>
                <span>{stress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden">
                <motion.div animate={{ width: `${stress}%` }} className={`h-full ${stress > 70 ? 'bg-rose-500' : 'bg-amber-500'}`} />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                <span>Marketable Skills</span>
                <span>{skills}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden">
                <motion.div animate={{ width: `${skills}%` }} className="h-full bg-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Narrative Board */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-slate-900/90 border-slate-800 p-8 md:p-10 rounded-3xl shadow-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                  Year {currentStep + 1}
                </div>
                <h2 className="text-3xl font-black text-white mb-4">{scenario.title}</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-10">
                  {scenario.description}
                </p>

                <div className="space-y-4">
                  {scenario.options.map((opt, i) => (
                    <Button
                      key={opt.id}
                      onClick={() => handleChoice(opt)}
                      variant="secondary"
                      className="w-full text-left justify-start h-auto p-5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all group rounded-2xl flex-col items-start gap-2"
                    >
                      <span className="text-lg font-medium text-slate-200 group-hover:text-white block whitespace-normal">{opt.text}</span>
                      <div className="flex items-center gap-4 text-xs font-bold mt-2">
                        {opt.cost > 0 ? (
                          <span className="text-rose-400 flex items-center">- {formatRupees(opt.cost)}</span>
                        ) : opt.cost < 0 ? (
                          <span className="text-emerald-400 flex items-center">+ {formatRupees(Math.abs(opt.cost))}</span>
                        ) : (
                          <span className="text-slate-500 flex items-center">₹0 Cost</span>
                        )}
                        <span className="text-amber-500 border-l border-slate-800 pl-4">{opt.stressCost > 20 ? 'High' : 'Low'} Stress</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}