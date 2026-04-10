'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PSYCHOMETRIC EVALUATION ENGINE ---
interface Evaluation {
  systemicForethought: number;
  informationRetention: number;
  resilience: number;
}

type Knowledge = 'KNOWS_PORT_ERROR' | 'KNOWS_PRIYA_QUITS';

export default function EchoProject4DDemo() {
  const [currentDay, setCurrentDay] = useState<number>(0); // 0 = Monday, 4 = Friday
  const [currentNode, setCurrentNode] = useState<string>('mon_start');
  const [knowledgeTracker, setKnowledgeTracker] = useState<Set<Knowledge>>(new Set());
  const [rewindCount, setRewindCount] = useState(0);
  const [gameState, setGameState] = useState<'PLAY' | 'EVALUATION'>('PLAY');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY \u26A0\uFE0F'];

  // --- THE 4D STORY ENGINE ---
  const storyData: Record<string, {
    speaker: string;
    text: string;
    options: {
      text: string;
      nextNode: string;
      requiresKnowledge?: Knowledge;
      grantsKnowledge?: Knowledge;
      advanceDay?: number;
    }[]
  }> = {
    'mon_start': {
      speaker: 'SYSTEM',
      text: 'Subject 84. You have been placed in charge of the "Aura Launch" this Friday. The company\'s survival depends on it. Who will you check on first?',
      options: [
        { text: 'Check on Dev Team (Backend)', nextNode: 'mon_dev', advanceDay: 1 },
        { text: 'Check on Marketing Team', nextNode: 'mon_marketing', advanceDay: 1 },
        { 
          text: '[4D: TIME ECHO] "DevOps, I saw the future. Open Database Port 5043 immediately!"', 
          nextNode: 'mon_dev_saved', 
          requiresKnowledge: 'KNOWS_PORT_ERROR',
          advanceDay: 4 
        }
      ]
    },
    'mon_dev': {
      speaker: 'DevOps Lead (Rahul)',
      text: 'Everything is fine on the backend. Servers are spinning up. We just need to wait for Friday.',
      options: [
        { text: 'Great. Let\'s fast forward to launch.', nextNode: 'fri_crash', advanceDay: 3 }
      ]
    },
    'mon_marketing': {
      speaker: 'Marketing Lead (Priya)',
      text: 'Ads are ready to go. The hype is massive. I hope the servers can handle it.',
      options: [
        { text: 'They will. Take me to Friday.', nextNode: 'fri_crash', advanceDay: 3 }
      ]
    },
    'fri_crash': {
      speaker: 'CRITICAL FAILURE',
      text: '*** FRIDAY LAUNCH FAILED ***. The app crashed globally. Investors pulled out. Error Logs say: "FATAL: Database Port 5043 Blocked". You are fired.',
      options: [
        { text: '[INITIATE 4D TIME REWIND TO MONDAY]', nextNode: 'mon_start', grantsKnowledge: 'KNOWS_PORT_ERROR' }
      ]
    },
    'mon_dev_saved': {
      speaker: 'DevOps Lead (Rahul)',
      text: 'Wait... how did you know that port was blocked? It was buried deep in our AWS config. I just fixed it. You saved the company!',
      options: [
        { text: 'Proceed to successful Friday.', nextNode: 'fri_success' }
      ]
    },
    'fri_success': {
      speaker: 'SYSTEM',
      text: 'Timeline stabilized. Launch successful. You altered the fabric of cause and effect using retained knowledge.',
      options: [
        { text: 'Extract Psychometric Evaluation.', nextNode: 'eval' }
      ]
    }
  };

  const handleOptionClick = (option: typeof storyData[string]['options'][0]) => {
    // Standard Node Navigation
    if (option.nextNode === 'eval') {
      calculateEvaluation();
      return;
    }

    if (option.grantsKnowledge) {
      setKnowledgeTracker(prev => new Set(prev).add(option.grantsKnowledge!));
    }

    // Rewind mechanic
    if (option.text.includes('REWIND')) {
      setCurrentDay(0);
      setRewindCount(prev => prev + 1);
    } 
    // Forward mechanic
    else if (option.advanceDay) {
      setCurrentDay(prev => Math.min(prev + option.advanceDay!, 4));
    }

    setCurrentNode(option.nextNode);
  };

  const calculateEvaluation = () => {
    // Did they read the error log and fix it immediately on the first rewind?
    const systemicScore = rewindCount === 1 ? 95 : Math.max(10, 95 - (rewindCount * 20));
    
    // Extracted directly from how quickly they utilized their newly gained knowledge flag
    const retentionScore = knowledgeTracker.has('KNOWS_PORT_ERROR') ? 100 : 20;

    // Resilience indicates how many loops they were willing to endure
    const resilienceScore = Math.min(100, 50 + (rewindCount * 15));

    setEvaluation({
      systemicForethought: systemicScore,
      informationRetention: retentionScore,
      resilience: resilienceScore
    });

    setGameState('EVALUATION');
  };

  const restartLoop = () => {
    setCurrentDay(0);
    setCurrentNode('mon_start');
    setKnowledgeTracker(new Set());
    setRewindCount(0);
    setGameState('PLAY');
    setEvaluation(null);
  };

  const currentNodeData = storyData[currentNode];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 font-sans text-neutral-100">
      <div className="max-w-3xl w-full bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* HEADER: 4D TIMELINE HUD */}
        <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xs font-black text-purple-500 tracking-widest bg-purple-500/10 px-3 py-1 rounded">
              PROJECT: ECHO (4D ENGINE)
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              LOOPS: {rewindCount}
            </div>
          </div>
          
          <div className="flex gap-2">
            {DAYS.map((day, idx) => (
              <div 
                key={day} 
                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                  idx === currentDay ? 'bg-white text-black' : idx < currentDay ? 'bg-neutral-800 text-neutral-500' : 'text-neutral-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* KNOWLEDGE INVENTORY */}
        <div className="px-6 py-2 bg-neutral-900/80 border-b border-neutral-800/50 flex gap-4 min-h-[40px] items-center">
          <span className="text-xs text-neutral-500 font-mono">RETAINED MEMORIES:</span>
          {Array.from(knowledgeTracker).map(knowledge => (
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={knowledge} 
              className="text-[10px] font-bold text-cyan-300 bg-cyan-900/30 border border-cyan-800/50 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              {knowledge.replace('KNOWS_', '')}
            </motion.span>
          ))}
          {knowledgeTracker.size === 0 && <span className="text-xs text-neutral-700 italic">None. Timeline is virgin.</span>}
        </div>

        {/* GAME CONTENT */}
        <div className="p-8 min-h-[400px] flex flex-col justify-between">
          
          {gameState === 'PLAY' && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentNode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1"
              >
                <div className={`text-sm font-black mb-4 uppercase tracking-widest ${currentNodeData.speaker === 'CRITICAL FAILURE' ? 'text-red-500' : 'text-purple-400'}`}>
                  {currentNodeData.speaker}
                </div>
                <div className="text-xl leading-relaxed text-neutral-300 font-serif">
                  {currentNodeData.text}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {gameState === 'EVALUATION' && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    PSYCHOMETRIC PROFILE
                  </h2>
                  <p className="text-neutral-500 mt-2 font-mono text-sm">Extracted from 4D temporal decisions</p>
                </div>

                <div className="w-full max-w-md space-y-6 bg-neutral-950 p-6 rounded-xl border border-neutral-800 relative shadow-2xl">
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-cyan-300">Systemic Forethought</span>
                      <span>{evaluation?.systemicForethought}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${evaluation?.systemicForethought || 0}%` }}></div>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">Ability to map complex variables to prevent future failure. High score maps to Enterprise Architecture / CEO.</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-purple-300">Information Retention</span>
                      <span>{evaluation?.informationRetention}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${evaluation?.informationRetention || 0}%` }}></div>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">Did you read the error logs before rewinding, or panic-rewind?</p>
                  </div>

                </div>
             </motion.div>
          )}

          {/* CHOICES DIALOG */}
          {gameState === 'PLAY' && (
            <div className="flex flex-col gap-3 mt-12">
              {currentNodeData.options.map((option, idx) => {
                // Hide options if they require knowledge the user doesn't have
                if (option.requiresKnowledge && !knowledgeTracker.has(option.requiresKnowledge)) return null;

                const isRewind = option.text.includes('REWIND');
                const is4D = option.text.includes('4D: TIME ECHO');

                return (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.1 } }}
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    className={`text-left p-4 rounded-lg border transition-all duration-200 group flex items-center justify-between
                      ${isRewind ? 'bg-red-950/30 border-red-900/50 hover:bg-red-900/50 text-red-200' : 
                        is4D ? 'bg-cyan-950/30 border-cyan-800/50 hover:bg-cyan-900/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 
                        'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700'}
                    `}
                  >
                    <span className={`font-medium ${is4D && 'font-bold'}`}>{option.text}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                      {isRewind ? 'â†ºïFE0F' : is4D ? 'âœ¨' : 'â†’'}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}

          {gameState === 'EVALUATION' && (
            <button 
              onClick={restartLoop}
              className="mt-8 w-full p-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-bold text-neutral-300 transition-colors"
            >
              WIPE MEMORY & RESTART
            </button>
          )}

        </div>
      </div>
    </div>
  );
}