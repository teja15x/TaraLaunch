'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, AlertOctagon, Heart, Brain, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

type Trait = 'empathy' | 'logic' | 'assertiveness';

interface Option {
  text: string;
  trait: Trait;
  response: string;
}

interface Scene {
  id: number;
  character: string;
  role: string;
  avatar: string;
  dialogue: string;
  options: Option[];
}

const SCENES: Scene[] = [
  {
    id: 1,
    character: 'Aman',
    role: 'Senior Developer',
    avatar: '👨🏽‍💻',
    dialogue: "You pushed code to production that broke the payment gateway. We are losing lakhs every hour! Why didn't you run the staging tests?",
    options: [
      { text: "I'm so sorry! Let me revert the commit right now. It's entirely my fault.", trait: 'empathy', response: "Aman calms down slightly but questions your technical rigor." },
      { text: "The staging server was down, and the PM forced a deadline. Let's fix the bug first, then do a post-mortem.", trait: 'logic', response: "Aman groans, but agrees that fixing it is the priority." },
      { text: "I ran the tests I had access to. If the CI/CD pipeline is fragile, that's an infrastructure issue, not just me.", trait: 'assertiveness', response: "Aman gets defensive. The argument escalates before you both fix the issue." }
    ]
  },
  {
    id: 2,
    character: 'Sneha',
    role: 'Product Manager',
    avatar: '👩🏽‍💼',
    dialogue: "We promised the client the new dashboard by tomorrow morning. You're saying it'll take 3 more days? They are going to cancel the contract!",
    options: [
      { text: "We can't rush quality. If we ship a broken dashboard, they'll leave anyway. We need 3 days.", trait: 'assertiveness', response: "Sneha is stressed but respects your firm boundary." },
      { text: "What if we strip down the heavy animations and just ship a 'V1' static dashboard by tomorrow?", trait: 'logic', response: "Sneha loves the compromise. You saved the contract." },
      { text: "I know how stressful this is for you. Let me pull an all-nighter and I'll try to get it done.", trait: 'empathy', response: "Sneha is relieved, but you just burned yourself out severely." }
    ]
  },
  {
    id: 3,
    character: 'Rahul',
    role: 'Startup Founder',
    avatar: '👨🏽‍🚀',
    dialogue: "We have 3 months of runway left. I need everyone taking 20% pay cuts to survive. If you don't agree, I might have to do layoffs.",
    options: [
      { text: "If we take the cut, we need equity compensation in return. That's only fair.", trait: 'logic', response: "Rahul respects the negotiation. You secure stock options." },
      { text: "That's unacceptable. We signed a contract. I cannot accept a pay cut given my family responsibilities.", trait: 'assertiveness', response: "Rahul is disappointed but removes you from the pay-cut pool (for now)." },
      { text: "I believe in the vision. I will take the cut. We are in this together to survive.", trait: 'empathy', response: "Rahul is deeply moved. You gain massive trust, though your wallet hurts." }
    ]
  }
];

export default function TeamConflictArena() {
  const router = useRouter();
  const [currentScene, setCurrentScene] = useState(0);
  const [scores, setScores] = useState<{ [key in Trait]: number }>({ empathy: 0, logic: 0, assertiveness: 0 });
  const [sceneState, setSceneState] = useState<'dialogue' | 'feedback'>('dialogue');
  const [lastFeedback, setLastFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleOptionClick = (option: Option) => {
    setScores(prev => ({ ...prev, [option.trait]: prev[option.trait] + 10 }));
    setLastFeedback(option.response);
    setSceneState('feedback');
  };

  const handleNext = () => {
    if (currentScene < SCENES.length - 1) {
      setCurrentScene(prev => prev + 1);
      setSceneState('dialogue');
    } else {
      setIsComplete(true);
    }
  };

  const scene = SCENES[currentScene];

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-slate-900 border-indigo-500/30 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900" />
            <ShieldCheck className="w-24 h-24 text-emerald-400 mx-auto mb-6 relative z-10" />
            <h1 className="text-4xl font-black text-white relative z-10 mb-4">Conflict Simulation Complete</h1>
            <p className="text-slate-400 text-lg relative z-10 mb-12 max-w-xl mx-auto">
              Your behavioral metrics under pressure have been recorded by the Psychometric Engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                <div className="text-3xl font-black text-white">{scores.empathy}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Empathy</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
                <Brain className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
                <div className="text-3xl font-black text-white">{scores.logic}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Logic / Pragmatism</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-xl">
                <Zap className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-3xl font-black text-white">{scores.assertiveness}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">Assertiveness</div>
              </div>
            </div>

            <Button onClick={() => router.push('/dashboard')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 font-bold text-lg rounded-xl relative z-10">
              Return to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <AlertOctagon className="text-rose-500 w-8 h-8" />
            Team Conflict Arena
          </h1>
          <p className="text-slate-400 mt-2">Simulating high-pressure Indian workplace environments.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Scenario</div>
          <div className="text-2xl font-black text-indigo-400">{currentScene + 1} / {SCENES.length}</div>
        </div>
      </div>

      {/* Main Game Stage */}
      <AnimatePresence mode="wait">
        {sceneState === 'dialogue' ? (
          <motion.div
            key={`dialogue-${currentScene}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Character Spotlight */}
            <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-500/5 blur-2xl" />
              <div className="text-8xl mb-4 relative z-10">{scene.avatar}</div>
              <h2 className="text-2xl font-bold text-white relative z-10">{scene.character}</h2>
              <div className="text-sm text-rose-400 font-bold uppercase tracking-widest relative z-10">{scene.role}</div>
            </div>

            {/* Stakeholder Dialogue & Choices */}
            <div className="md:col-span-8 space-y-6">
              <Card className="bg-slate-800/80 border-slate-700 p-8 relative isolate">
                <MessageSquare className="absolute top-6 left-6 text-slate-700 w-12 h-12 -z-10 opacity-50" />
                <p className="text-2xl text-white font-medium leading-relaxed mt-2">
                  "{scene.dialogue}"
                </p>
              </Card>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2">Choose your response vector</h3>
                {scene.options.map((opt, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => handleOptionClick(opt)}
                      className="bg-slate-900 border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/30 p-5 cursor-pointer transition-colors shadow-lg"
                    >
                      <p className="text-slate-200 text-lg">{opt.text}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`feedback-${currentScene}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-indigo-950/40 border-indigo-500/50 p-12 text-center backdrop-blur-xl max-w-2xl mx-auto shadow-[0_0_50px_rgba(99,102,241,0.15)]">
              <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 rounded-full mb-6">
                <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Outcome Recorded</h3>
              <p className="text-xl text-indigo-200 mb-10 leading-relaxed max-w-lg mx-auto">
                {lastFeedback}
              </p>
              <Button onClick={handleNext} className="bg-white text-indigo-950 hover:bg-slate-200 font-bold px-8 py-6 rounded-xl text-lg flex items-center gap-3">
                Proceed to next Stakeholder <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
