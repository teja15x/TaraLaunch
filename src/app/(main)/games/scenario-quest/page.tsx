'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ----------------------------------------------------
// Psychometric Engine Definition 
// ----------------------------------------------------
type TraitImpact = {
  riasec?: Record<string, number>;
  bigFive?: Record<string, number>;
};

type Option = {
  id: string;
  text: string;
  impact: TraitImpact;
  consequenceText: string;
};

type Scene = {
  id: string;
  title: string;
  imageOverlay?: string; // CSS Gradients to set the mood
  narrative: string;
  options: Option[];
};

const SCENARIOS: Scene[] = [
  {
    id: 's1',
    title: 'The Kitchen Table',
    imageOverlay: 'from-orange-950 via-slate-900 to-black',
    narrative: `The tea is hot, but the tension is hotter. Your father taps his newspaper. "Sharmaji's son just enrolled in that premier coaching institute. You'll need to lock in your PCM stream this week to keep up." \n\nYou've been secretly spending nights building a portfolio for a completely different path. He doesn't know yet.`,
    options: [
      {
        id: 'o1',
        text: '"Actually, Dad, I want to pursue Design. I have a portfolio ready to show you."',
        consequenceText: 'He looks shocked, but the fact that you prepared a portfolio makes him pause and listen.',
        impact: { riasec: { artistic: +10, enterprising: +5 }, bigFive: { extraversion: +5, openness: +10 } }
      },
      {
        id: 'o2',
        text: 'Nod quietly. You can always study PCM and pursue your passion on the side.',
        consequenceText: 'You avoid the conflict now, but a heavy weight sinks into your stomach as you finish your tea.',
        impact: { riasec: { conventional: +10 }, bigFive: { agreeableness: +10, neuroticism: +5 } }
      },
      {
        id: 'o3',
        text: '"What if I take Commerce but keep Tech as an elective? It\'s a safer fallback."',
        consequenceText: 'He considers it. "Practical," he mutters. A compromise is struck, though nobody is fully happy.',
        impact: { riasec: { investigative: +5, conventional: +5 }, bigFive: { conscientiousness: +10 } }
      }
    ]
  },
  {
    id: 's2',
    title: 'The Coaching Institute',
    imageOverlay: 'from-blue-900 via-slate-900 to-black',
    narrative: `You're standing outside a massive 6-story building. Thousands of students are streaming in. Your best friend elbows you. "Dude, if we don't get into the top batch, our careers are over." \n\nYou look at the curriculum. It's grueling, entirely rote-based, and leaves 0 hours for independent project work.`,
    options: [
      {
        id: 'o1',
        text: 'Form a study group. We can crack this if we collaborate and share notes.',
        consequenceText: 'You immediately start organizing the group. Your friend breathes a sigh of relief.',
        impact: { riasec: { social: +15, enterprising: +5 }, bigFive: { extraversion: +10, agreeableness: +5 } }
      },
      {
        id: 'o2',
        text: 'Skip the institute. You\'ll self-study at home and use the saved time to build real projects.',
        consequenceText: 'It\'s a massive risk, but as you walk away from the building, you feel completely free.',
        impact: { riasec: { investigative: +10, realistic: +10 }, bigFive: { openness: +15, conscientiousness: +5 } }
      },
      {
        id: 'o3',
        text: 'Sign up, but quietly figure out how to optimize the system to do the bare minimum to pass.',
        consequenceText: 'You begin analyzing the past 10 years of question papers to find the optimal shortcuts.',
        impact: { riasec: { enterprising: +10, conventional: +5 }, bigFive: { conscientiousness: -5, openness: +5 } }
      }
    ]
  },
  {
    id: 's3',
    title: 'The College Fest Crisis',
    imageOverlay: 'from-purple-900 via-slate-900 to-black',
    narrative: `It's the annual Inter-School Fest. The main event's speaker just pulled out. Chaos is erupting backstage. The faculty coordinator is panicking and looking for someone to step up or fix the situation immediately.`,
    options: [
      {
        id: 'o1',
        text: 'Grab the mic. You\'ll improvise a presentation yourself to keep the crowd engaged.',
        consequenceText: 'You step onto the stage, heart pounding, but your charisma quickly wins the crowd over.',
        impact: { riasec: { artistic: +10, enterprising: +15 }, bigFive: { extraversion: +15, neuroticism: -5 } }
      },
      {
        id: 'o2',
        text: 'Dive into the tech booth. You can quickly re-wire the A/V system to play a stunning visual show instead.',
        consequenceText: 'You bypass the social chaos and focus purely on the technical fix, saving the atmosphere.',
        impact: { riasec: { realistic: +15, investigative: +10 }, bigFive: { conscientiousness: +10, openness: +5 } }
      },
      {
        id: 'o3',
        text: 'Quickly organize the backstage crew to restructure the timeline and push the next performance up.',
        consequenceText: 'Your calm, commanding logic cuts through the panic. The schedule is saved.',
        impact: { riasec: { social: +10, conventional: +10 }, bigFive: { conscientiousness: +15, agreeableness: +5 } }
      }
    ]
  }
];

export default function ScenarioQuestGame() {
  const router = useRouter();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [consequenceMode, setConsequenceMode] = useState<string | null>(null);
  const [psychometricState, setPsychometricState] = useState({
    riasec: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    bigFive: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 }
  });
  const [isFinished, setIsFinished] = useState(false);
  const [loadingExtract, setLoadingExtract] = useState(false);

  const currentScene = SCENARIOS[currentSceneIndex];

  const handleChoice = (option: Option) => {
    // Apply Psychometrics
    const newState = { ...psychometricState };
    
    if (option.impact.riasec) {
      Object.keys(option.impact.riasec).forEach(key => {
        newState.riasec[key as keyof typeof newState.riasec] += option.impact.riasec![key];
      });
    }
    if (option.impact.bigFive) {
      Object.keys(option.impact.bigFive).forEach(key => {
        newState.bigFive[key as keyof typeof newState.bigFive] += option.impact.bigFive![key];
      });
    }
    setPsychometricState(newState);
    
    // Show Consequence
    setConsequenceMode(option.consequenceText);
  };

  const handleNext = () => {
    if (currentSceneIndex < SCENARIOS.length - 1) {
      setConsequenceMode(null);
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setConsequenceMode(null);
      setIsFinished(true);
      submitResults();
    }
  };

  const submitResults = async () => {
    setLoadingExtract(true);
    // In a real app we'd dispatch to our Zustand store or directly to Supabase
    // Simulating the delay for "extraction"
    setTimeout(() => {
      setLoadingExtract(false);
    }, 2000);
  };

  // ----------------------------------------------------
  // Rendering
  // ----------------------------------------------------

  if (isFinished) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 via-transparent to-blue-900/20 pointer-events-none" />
          
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Evaluation Complete
          </h2>
          
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            You successfully navigated the crossroads. While you were playing, our engine analyzed your decision vectors.
          </p>

          {!loadingExtract ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-black/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xl text-emerald-400 font-semibold mb-4 tracking-wider text-xs uppercase">RIASEC Core</h3>
                {Object.entries(psychometricState.riasec)
                  .filter(([_, val]) => val > 0)
                  .sort((a,b) => b[1] - a[1])
                  .slice(0,3)
                  .map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="capitalize text-slate-200">{key}</span>
                    <span className="font-mono text-emerald-500">+{val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-black/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xl text-cyan-400 font-semibold mb-4 tracking-wider text-xs uppercase">Personality Vector</h3>
                {Object.entries(psychometricState.bigFive)
                  .filter(([_, val]) => val > 0)
                  .sort((a,b) => b[1] - a[1])
                  .slice(0,3)
                  .map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="capitalize text-slate-200">{key}</span>
                    <span className="font-mono text-cyan-500">+{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 animate-pulse text-emerald-500 font-mono">
              [ EXTRACTING PSYCHOMETIC SIGNALS ... ]
            </div>
          )}

          <Button 
            onClick={() => router.push('/games')}
            className="w-full bg-white text-black hover:bg-slate-200 py-6 text-lg rounded-xl font-medium tracking-wide transition-all"
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black relative flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${currentScene?.imageOverlay || 'from-slate-900 to-black'}`}>
      
      {/* Background ambient effects */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <AnimatePresence mode="wait">
        {!consequenceMode ? (
          <motion.div
            key={`scene-${currentScene.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl w-full z-10"
          >
            {/* Header */}
            <div className="mb-4 text-emerald-400 font-mono text-sm tracking-[0.2em] uppercase">
              Scenario 0{currentSceneIndex + 1} // 0{SCENARIOS.length}
            </div>

            {/* Narrative Box */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              {currentScene.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 font-light">
              {currentScene.narrative.split('\n\n').map((para, i) => (
                <React.Fragment key={i}>
                  {para}
                  <br /><br />
                </React.Fragment>
              ))}
            </p>

            {/* Choices */}
            <div className="grid gap-4">
              {currentScene.options.map((option, idx) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.01, x: 5 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleChoice(option)}
                  className="text-left w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all p-6 md:p-8 rounded-2xl flex items-center gap-6 group"
                >
                  <span className="text-slate-500 font-mono text-lg group-hover:text-emerald-400 transition-colors">
                    0{idx + 1}
                  </span>
                  <span className="text-lg md:text-xl text-slate-200 font-medium tracking-wide">
                    {option.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`conseq-${currentScene.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl w-full z-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-8">
              <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            
            <h2 className="text-3xl md:text-4xl text-white font-light leading-relaxed tracking-wide mb-12">
              &quot;{consequenceMode}&quot;
            </h2>

            <Button 
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-600 text-black py-6 px-12 text-lg rounded-full font-bold tracking-widest uppercase transition-all hover:scale-105"
            >
              Continue Timeline
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}