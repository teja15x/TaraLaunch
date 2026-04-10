'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

// --- PSYCHOMETRIC EVALUATION ENGINE ---
interface Evaluation {
  spatialTracking: number; // Based on successful clicks while rotating
  reactionTime: number;    // Based on how fast they realize the active face
  focusUnderMotion: number; // Penalty for misclicking moving objects
}

export default function FocusHunter3DDemo() {
  const [gameState, setGameState] = useState<'START' | 'PLAY' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);
  const [activeFace, setActiveFace] = useState<number | null>(null);
  const [clickStats, setClickStats] = useState<{ hits: number, misses: number, reactionTimes: number[] }>({ hits: 0, misses: 0, reactionTimes: [] });
  const [lastFlashTime, setLastFlashTime] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  // 3D Rotation Controls
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setScore(0);
    setClickStats({ hits: 0, misses: 0, reactionTimes: [] });
    setGameState('PLAY');
    setEvaluation(null);
    flashNextFace();
    
    // Start continuous 3D rotation of the cube environment
    controls.start({
      rotateX: [30, 360, 180, 0],
      rotateY: [45, -180, 360, 45],
      rotateZ: [0, 90, -45, 0],
      transition: {
        duration: 25, // Getting faster/erratic as time goes on
        ease: "linear",
        repeat: Infinity
      }
    });

    // 30 seconds game timer
    setTimeout(() => {
      endGame();
    }, 20000);
  };

  const flashNextFace = () => {
    if (gameState === 'GAME_OVER') return;
    const randomFace = Math.floor(Math.random() * 6);
    setActiveFace(randomFace);
    setLastFlashTime(Date.now());

    // Flash moves faster as score gets higher
    const delay = Math.max(800, 2000 - (score * 100));
    setTimeout(() => {
      setActiveFace(null);
      // Wait a tiny bit and flash next
      setTimeout(flashNextFace, 500);
    }, delay);
  };

  const handleFaceClick = (faceIndex: number) => {
    if (gameState !== 'PLAY') return;

    if (faceIndex === activeFace) {
      const reactionTime = Date.now() - lastFlashTime;
      setClickStats(prev => ({
        ...prev,
        hits: prev.hits + 1,
        reactionTimes: [...prev.reactionTimes, reactionTime]
      }));
      setScore(s => s + 10);
      setActiveFace(null);
    } else {
      setClickStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      setScore(s => Math.max(0, s - 5));
    }
  };

  const endGame = () => {
    setGameState('GAME_OVER');
    controls.stop();

    // -- RUN PSYCHOMETRICS --
    setClickStats(stats => {
      const avgReaction = stats.reactionTimes.length > 0 
        ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length 
        : 3000;
      
      const spatialScore = Math.min((stats.hits * 10) - (stats.misses * 5), 100);
      const focusScore = Math.max(100 - (stats.misses * 15), 0);
      const reactionScore = Math.max(100 - (avgReaction / 15), 0);

      setEvaluation({
        spatialTracking: Math.max(0, Math.round(spatialScore)),
        reactionTime: Math.round(reactionScore),
        focusUnderMotion: Math.round(focusScore)
      });
      return stats;
    });
  };

  // Cube Faces Setup (CSS 3D Transforms)
  const cubeSize = 160;
  const faces = [
    { id: 0, label: 'FRONT', transform: `translateZ(${cubeSize/2}px)` },
    { id: 1, label: 'BACK', transform: `rotateY(180deg) translateZ(${cubeSize/2}px)` },
    { id: 2, label: 'RIGHT', transform: `rotateY(90deg) translateZ(${cubeSize/2}px)` },
    { id: 3, label: 'LEFT', transform: `rotateY(-90deg) translateZ(${cubeSize/2}px)` },
    { id: 4, label: 'TOP', transform: `rotateX(90deg) translateZ(${cubeSize/2}px)` },
    { id: 5, label: 'BOTTOM', transform: `rotateX(-90deg) translateZ(${cubeSize/2}px)` },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 font-sans text-neutral-100 overflow-hidden relative perspective-[1200px]">
      
      <div className="text-center mb-12 z-10 w-full max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
          3D Spatial Hunter
        </h1>
        <p className="text-neutral-400 mt-2 text-sm">
          Track the glowing panels as the object spins in 3D space. Tests spatial awareness and motion prediction.
        </p>
      </div>

      <div className="flex justify-between w-full max-w-lg z-10 mb-8 font-mono text-sm bg-neutral-900/50 p-4 border border-neutral-800 rounded-lg">
        <span>SCORE: <span className="text-indigo-400 font-bold">{score}</span></span>
        <span>HITS: <span className="text-emerald-400">{clickStats.hits}</span></span>
        <span>MISSES: <span className="text-red-400">{clickStats.misses}</span></span>
      </div>

      {/* 3D SCENE CONTAINER */}
      <div className="relative w-full h-[400px] flex items-center justify-center pointer-events-none perspective-[1200px]" style={{ perspective: '1200px' }}>
        
        {/* THE 3D CUBE */}
        <motion.div 
          animate={controls}
          style={{ width: cubeSize, height: cubeSize, transformStyle: 'preserve-3d' }}
          className="relative pointer-events-auto"
        >
          {faces.map((face) => (
            <button
              key={face.id}
              onMouseDown={() => handleFaceClick(face.id)}
              style={{ 
                transform: face.transform, 
                width: cubeSize, 
                height: cubeSize,
                backfaceVisibility: 'hidden'
              }}
              className={`absolute inset-0 flex flex-col items-center justify-center text-xl font-black border-2 transition-colors duration-100 uppercase tracking-widest cursor-crosshair
                ${activeFace === face.id 
                  ? 'bg-indigo-500/90 border-white text-white shadow-[0_0_40px_rgba(99,102,241,1)] scale-105' 
                  : 'bg-neutral-900/80 border-indigo-500/30 text-indigo-800 hover:bg-neutral-800'
                }
              `}
            >
              {activeFace === face.id ? 'CLICK!' : face.label}
              {activeFace === face.id && (
                <span className="absolute animate-ping h-full w-full bg-indigo-400/30 -z-10 rounded-md"></span>
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {/* OVERLAYS */}
      {gameState === 'START' && (
        <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center z-20 backdrop-blur-sm">
          <button 
            onClick={startGame}
            className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold tracking-widest hover:bg-indigo-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-3"
          >
            INITIALIZE 3D ENGINE
          </button>
        </div>
      )}

      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center z-20 p-6 overflow-y-auto">
          <h2 className="text-3xl font-black text-indigo-400 mb-2">SEQUENCE COMPLETE</h2>
          <p className="text-neutral-400 mb-8 font-mono">CALCULATING PSYCHOMETRICS...</p>
          
          <div className="w-full max-w-md space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl relative">
            
            <div className="absolute -top-3 right-4 bg-emerald-600 text-xs font-bold px-2 py-1 rounded text-emerald-100 tracking-widest shadow-md">
              MAPPED TO: SURGEON / AVIATION / 3D DESIGN
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-blue-300">3D Spatial Tracking (Orientation)</span>
                <span>{evaluation?.spatialTracking}%</span>
              </div>
              <div className="w-full bg-neutral-950 rounded-full h-3 border border-neutral-800">
                <div className="bg-gradient-to-r from-blue-700 to-blue-400 h-2.5 rounded-full mt-[1px] ml-[1px]" style={{ width: `calc(${Math.min(evaluation?.spatialTracking || 0, 100)}% - 2px)` }}></div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">Measures ability to mentally track objects through rotation and perspective shifts.</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-emerald-300">Focus Under Motion</span>
                <span>{evaluation?.focusUnderMotion}%</span>
              </div>
              <div className="w-full bg-neutral-950 rounded-full h-3 border border-neutral-800">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-400 h-2.5 rounded-full mt-[1px] ml-[1px]" style={{ width: `calc(${evaluation?.focusUnderMotion || 0}% - 2px)` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-purple-300">Twitch Reaction Speed</span>
                <span>{evaluation?.reactionTime}%</span>
              </div>
              <div className="w-full bg-neutral-950 rounded-full h-3 border border-neutral-800">
                <div className="bg-gradient-to-r from-purple-700 to-purple-400 h-2.5 rounded-full mt-[1px] ml-[1px]" style={{ width: `calc(${evaluation?.reactionTime || 0}% - 2px)` }}></div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full mt-6 px-4 py-3 bg-neutral-800 text-white font-bold rounded-lg border border-neutral-700 hover:bg-neutral-700 transition"
            >
              RUN SIMULATION AGAIN
            </button>

          </div>
        </div>
      )}

    </div>
  );
}