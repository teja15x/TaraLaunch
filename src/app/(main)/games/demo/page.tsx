'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- PSYCHOMETRIC EVALUATION ENGINE ---
// This runs invisibly in the background while they play.
interface Evaluation {
  spatialReasoning: number; // Based on max level reached
  impulsivity: number;      // Based on how fast they click vs wait
  attentionToDetail: number; // Based on accuracy before failing
}

export default function PatternMaster2DDemo() {
  const [gameState, setGameState] = useState<'START' | 'OBSERVE' | 'PLAY' | 'GAME_OVER'>('START');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  
  // Stealth Metrics Tracking
  const [metrics, setMetrics] = useState({
    clickTimes: [] as number[],
    startTime: 0,
    errors: 0,
  });

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const GRID_SIZE = 9; // 3x3 grid

  // Generate a new level
  useEffect(() => {
    if (gameState === 'OBSERVE') {
      const newSequence = [...sequence, Math.floor(Math.random() * GRID_SIZE)];
      setSequence(newSequence);
      setPlayerSequence([]);
      
      // Play sequence animation
      let i = 0;
      const interval = setInterval(() => {
        setActiveTile(newSequence[i]);
        setTimeout(() => setActiveTile(null), 400); // 400ms flash
        
        i++;
        if (i >= newSequence.length) {
          clearInterval(interval);
          setTimeout(() => {
            setGameState('PLAY');
            setMetrics(m => ({ ...m, startTime: Date.now() }));
          }, 800);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [gameState, level]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'PLAY') return;

    // Log stealth metrics (reaction time)
    const reactionTime = Date.now() - metrics.startTime;
    setMetrics(m => ({ ...m, clickTimes: [...m.clickTimes, reactionTime], startTime: Date.now() }));

    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    // Visual feedback
    setActiveTile(index);
    setTimeout(() => setActiveTile(null), 200);

    // Check correctness
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // FAILED
      finishGame(false);
      return;
    }

    // Passed the level
    if (newPlayerSeq.length === sequence.length) {
      setGameState('START'); // Temporary waiting state
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setGameState('OBSERVE');
      }, 1000);
    }
  };

  const finishGame = (completedAll: boolean) => {
    setGameState('GAME_OVER');
    
    // --- RUN PSYCHOMETRIC EVALUATION ---
    const avgReactionTime = metrics.clickTimes.reduce((a, b) => a + b, 0) / (metrics.clickTimes.length || 1);
    
    // 1. Spatial Reasoning: Based on how many patterns they remembered (Max level)
    const spatialScore = Math.min((level / 10) * 100, 100);

    // 2. Impulsivity: Fast clicks (< 400ms) mean impulsive. Slower means calculated.
    const impulsivityScore = Math.max(100 - (avgReactionTime / 10), 0);

    // 3. Attention to Detail: Did they rush and click wrong, or get far?
    const detailScore = Math.min((level * 10) + (avgReactionTime > 800 ? 20 : 0), 100);

    setEvaluation({
      spatialReasoning: Math.round(spatialScore),
      impulsivity: Math.round(impulsivityScore),
      attentionToDetail: Math.round(detailScore),
    });
  };

  const startGame = () => {
    setLevel(1);
    setSequence([]);
    setPlayerSequence([]);
    setMetrics({ clickTimes: [], startTime: 0, errors: 0 });
    setEvaluation(null);
    setGameState('OBSERVE');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 font-sans text-neutral-100">
      <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Pattern Master Demo
          </h1>
          <p className="text-neutral-400 mt-2 max-w-sm">
            Watch the grid. Reproduce the pattern. We are quietly analyzing your brain.
          </p>
        </div>

        {/* Game Area */}
        {gameState !== 'GAME_OVER' ? (
          <div className="flex flex-col items-center">
            <div className="flex justify-between w-full max-w-[320px] mb-4 text-sm font-semibold text-neutral-400 tracking-wider">
              <span>LEVEL: <span className="text-white">{level}</span></span>
              <span>STATE: <span className={gameState === 'PLAY' ? 'text-emerald-400' : 'text-blue-400'}>{gameState}</span></span>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-neutral-800 p-3 rounded-lg shadow-inner">
              {Array.from({ length: GRID_SIZE }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  className={`w-24 h-24 rounded-md transition-all duration-150 transform ${
                    activeTile === idx 
                      ? 'bg-blue-500 scale-95 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                      : 'bg-neutral-700 hover:bg-neutral-600 shadow-md'
                  } ${gameState === 'PLAY' ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                />
              ))}
            </div>

            {gameState === 'START' && (
              <button 
                onClick={startGame}
                className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition transform hover:scale-105"
              >
                START CALIBRATION
              </button>
            )}
          </div>
        ) : (
          /* GAME OVER & EVALUATION REVEAL */
          <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-500 mb-6">Sequence Broken!</h2>
            
            <div className="bg-neutral-950 border border-neutral-800 w-full rounded-lg p-6 relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-xs font-bold px-2 py-1 rounded text-white tracking-widest">
                HIDDEN EVALUATION ENGINE
              </div>
              
              <p className="text-sm text-neutral-400 mb-6 italic text-center">
                While you played a simple memory game, our algorithms tracked your response times, failure thresholds, and hesitation patterns. Here is your psychometric result:
              </p>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-blue-300">Spatial/Logical Memory</span>
                    <span>{evaluation?.spatialReasoning}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${evaluation?.spatialReasoning}%` }}></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Dictates aptitude for Engineering, Coding, & Architecture.</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-emerald-300">Calculated vs Impulsive (Reaction)</span>
                    <span>{evaluation?.impulsivity}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${evaluation?.impulsivity}%` }}></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">High impulsivity = Fast-paced roles (Sales, Day Trading). Low = Deep work (Research, Law).</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-purple-300">Attention to Detail</span>
                    <span>{evaluation?.attentionToDetail}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${evaluation?.attentionToDetail}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="mt-8 px-8 py-3 bg-neutral-800 text-white font-bold rounded-full hover:bg-neutral-700 transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}