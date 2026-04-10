'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// ----------------------------------------------------
// Psychometric Engine Definition (Gardner's Focus)
// ----------------------------------------------------
type Impact = {
  gardner?: Record<string, number>;
};

type Option = {
  id: string;
  word: string;
  impact: Impact;
};

type Prompt = {
  id: string;
  setup: string;
  options: Option[];
};

const PROMPTS: Prompt[] = [
  {
    id: 'p1',
    setup: "The high-speed rail to Mumbai halts abruptly. The lights flicker, and a low hum echoes. The first thing I focus on is...",
    options: [
      { id: 'o1', word: "The sound frequencies of the engine.", impact: { gardner: { musical: +15, logical_mathematical: +5 } }},
      { id: 'o2', word: "The panic in the passengers' eyes.", impact: { gardner: { interpersonal: +15, intrapersonal: +5 } }},
      { id: 'o3', word: "How to pry open the emergency door.", impact: { gardner: { bodily_kinesthetic: +15, spatial: +10 } }},
      { id: 'o4', word: "Calculating the exact stopping distance.", impact: { gardner: { logical_mathematical: +20 } }},
      { id: 'o5', word: "Writing a mental draft of what happened.", impact: { gardner: { linguistic: +20 } }}
    ]
  },
  {
    id: 'p2',
    setup: "In the sprawling markets of Delhi 2050, a vendor offers me a device that translates thoughts into...",
    options: [
      { id: 'o1', word: "3D architectural holograms.", impact: { gardner: { spatial: +20, logical_mathematical: +5 } }},
      { id: 'o2', word: "Complex rhythmic symphonies.", impact: { gardner: { musical: +20 } }},
      { id: 'o3', word: "A deep map of my own subconscious.", impact: { gardner: { intrapersonal: +15, linguistic: +5 } }},
      { id: 'o4', word: "Perfectly structured poetry.", impact: { gardner: { linguistic: +15, intrapersonal: +5 } }},
      { id: 'o5', word: "Biological growth patterns of a banyan tree.", impact: { gardner: { naturalistic: +20, spatial: +5 } }}
    ]
  },
  {
    id: 'p3',
    setup: "If I were to build a utopia, the very foundation of the city would be centered around...",
    options: [
      { id: 'o1', word: "Interconnected communal gathering spaces.", impact: { gardner: { interpersonal: +15, spatial: +5 } }},
      { id: 'o2', word: "An algorithmic, infinitely scaling grid.", impact: { gardner: { logical_mathematical: +15, spatial: +10 } }},
      { id: 'o3', word: "Massive urban forests and bio-domes.", impact: { gardner: { naturalistic: +20 } }},
      { id: 'o4', word: "Theaters of movement and athletic arenas.", impact: { gardner: { bodily_kinesthetic: +20 } }},
      { id: 'o5', word: "Libraries of collective memory and law.", impact: { gardner: { linguistic: +15, intrapersonal: +10 } }}
    ]
  }
];

export default function StoryWeaverGame() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [psychometricState, setPsychometricState] = useState({
    linguistic: 0,
    logical_mathematical: 0,
    spatial: 0,
    musical: 0,
    bodily_kinesthetic: 0,
    interpersonal: 0,
    intrapersonal: 0,
    naturalistic: 0
  });
  const [isFinished, setIsFinished] = useState(false);
  const [isHoveringOption, setIsHoveringOption] = useState<string | null>(null);

  const currentPrompt = PROMPTS[currentIndex];

  const handleSelection = (option: Option) => {
    // Add Gardners Impact
    const newState = { ...psychometricState };
    if (option.impact.gardner) {
      Object.keys(option.impact.gardner).forEach(key => {
        newState[key as keyof typeof newState] += option.impact.gardner![key];
      });
    }
    setPsychometricState(newState);

    if (currentIndex < PROMPTS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-white font-serif">
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(20px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-2xl w-full bg-[#1a1235]/40 backdrop-blur-3xl border border-[#3b2a6b]/50 rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 via-transparent to-fuchsia-900/10 pointer-events-none" />
          
          <h2 className="text-4xl font-black mb-2 tracking-widest text-[#e8d5ff]">
            THE WEAF IS SPUN.
          </h2>
          
          <p className="text-indigo-200/70 text-lg mb-10 leading-relaxed font-light italic">
            "Your narrative choices reveal the architecture of your multiple intelligences."
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            {Object.entries(psychometricState)
              .filter(([_, val]) => val > 0)
              .sort((a,b) => b[1] - a[1])
              .map(([key, val]) => (
              <div key={key} className="bg-black/30 p-4 rounded-xl border border-[#3b2a6b]/30 flex flex-col">
                 <span className="capitalize text-indigo-300 font-medium tracking-wide text-xs mb-1">
                   {key.replace('_', ' ')}
                 </span>
                 <div className="w-full bg-[#1a1235] h-1.5 rounded-full overflow-hidden mt-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(val * 2, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-400"
                    />
                 </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => router.push('/games')}
            className="w-full bg-[#3b2a6b] hover:bg-[#4b358a] text-indigo-50 py-7 text-lg rounded-2xl font-bold tracking-[0.2em] transition-all shadow-[0_0_40px_-10px_rgba(100,50,200,0.5)]"
          >
            RETURN TO HUB
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0715] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden font-serif">
      
      {/* Dynamic Background */}
      <motion.div 
        animate={{ 
          background: isHoveringOption 
            ? 'radial-gradient(circle at 50% 50%, rgba(60, 20, 100, 0.15) 0%, rgba(10, 7, 21, 1) 100%)' 
            : 'radial-gradient(circle at 50% 50%, rgba(30, 20, 60, 0.1) 0%, rgba(10, 7, 21, 1) 100%)' 
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`prompt-${currentPrompt.id}`}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl w-full z-10 flex flex-col items-center text-center"
        >
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-12">
            {PROMPTS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-fuchsia-400' : idx < currentIndex ? 'w-4 bg-indigo-800' : 'w-4 bg-slate-800'}`}
              />
            ))}
          </div>

          {/* Narrative Setup */}
          <h1 className="text-3xl md:text-5xl font-light text-indigo-100 mb-16 tracking-wide leading-relaxed">
            {currentPrompt.setup}
          </h1>
          
          {/* Words of Power (Options) */}
          <div className="flex flex-wrap justify-center gap-4">
            {currentPrompt.options.map((option) => (
              <motion.button
                key={option.id}
                onHoverStart={() => setIsHoveringOption(option.id)}
                onHoverEnd={() => setIsHoveringOption(null)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelection(option)}
                className="bg-[#1a1235]/40 hover:bg-[#3b2a6b]/60 border border-[#3b2a6b]/40 hover:border-fuchsia-500/50 transition-all px-6 py-4 rounded-xl backdrop-blur-md"
              >
                <span className="text-lg md:text-xl text-indigo-200 font-medium tracking-wider">
                  {option.word}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}