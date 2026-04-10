'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PuzzleNode {
  id: string;
  label: string;
  value: number;
  corrupted: boolean;
}

interface Scene {
  id: string;
  title: string;
  narrative: string[];
  nodes?: PuzzleNode[];
  challenge?: string;
  options?: {
    id: string;
    text: string;
    traitDelta: Record<string, number>; // Maps to Gardner's Logical-Math / Spatial
    nextScene: string;
  }[];
}

const patternScenes: Record<string, Scene> = {
  intro: {
    id: 'intro',
    title: 'The Architect Protocol',
    narrative: [
      'SYSTEM ALERT: Core stabilization failure detected.',
      'You are the Architect assigned to Sector 4. The orbital cooling arrays are failing one by one. The automated diagnostics are locked in an infinite recursion loop.',
      'You have exactly 3 minutes before thermal runaway. You must bypass the diagnostics and find the pattern causing the cascade.'
    ],
    options: [
      { id: 'opt1', text: 'I need to check the event logs for synchronization errors.', traitDelta: { logical: 10, investigative: 10 }, nextScene: 'log_analysis' },
      { id: 'opt2', text: 'Let me look at the physical grid layout to spot the failure origin.', traitDelta: { spatial: 15, realistic: 5 }, nextScene: 'grid_analysis' },
      { id: 'opt3', text: 'I will manually overload the fail-safes to force a hard reset.', traitDelta: { enterprising: 10, risk: 15 }, nextScene: 'brute_force' }
    ]
  },
  log_analysis: {
    id: 'log_analysis',
    title: 'Log Analysis',
    narrative: [
      'You pull up the raw telemetry. The node failures are happening at specific millisecond intervals:',
      'Failure 1: 002ms',
      'Failure 2: 005ms',
      'Failure 3: 010ms',
      'Failure 4: 017ms',
      'If the pattern holds, the thermal core will breach on the next interval. When will that happen?'
    ],
    options: [
      { id: 'ans1', text: 'At 024ms. The interval increases by consecutive odd numbers (+3, +5, +7).', traitDelta: { logical: 25 }, nextScene: 'success_node' },
      { id: 'ans2', text: 'At 026ms. The interval increases by primes (+3, +5, +7, +9).', traitDelta: { logical: 20 }, nextScene: 'success_node' }, // The sequence is actually n^2 + 1 (+3, +5, +7, so next is +9 = 26)
      { id: 'ans3', text: 'At 025ms. The system is doubling the rate minus 1.', traitDelta: { logical: 5, error: 5 }, nextScene: 'partial_fail' }
    ]
  },
  grid_analysis: {
    id: 'grid_analysis',
    title: 'Grid Architecture',
    narrative: [
      'You map the physical nodes. The failing nodes form a distinct shape across the hexagonal cooling grid.',
      'They trace out a recursive fractal - a Sierpinski triangle.',
      'To stop the cascade, you need to isolate the node at the center of the next iteration.'
    ],
    options: [
      { id: 'ans1', text: 'Target Sector X-12. The fractal expands outward symmetrically.', traitDelta: { spatial: 25, logical: 10 }, nextScene: 'success_node' },
      { id: 'ans2', text: 'Target Sector Alpha-Core. The center of mass remains static.', traitDelta: { spatial: 15 }, nextScene: 'success_node' },
      { id: 'ans3', text: 'Cut power to the entire outer ring. It\'s faster.', traitDelta: { enterprising: 10, spatial: 0 }, nextScene: 'partial_fail' }
    ]
  },
  brute_force: {
    id: 'brute_force',
    title: 'System Override',
    narrative: [
      'You bypass the algorithms and route all power into a localized EMP. It\'s risky.',
      'System: "MANUAL OVERRIDE DETECTED. PLEASE INPUT ADMINISTRATIVE PRIME CODE."',
      'You must deduce the prime code from the core ID: 8A-12B-16C'
    ],
    options: [
      { id: 'ans1', text: 'Submit 20D. The pattern is +4 and alphabetical progression.', traitDelta: { logical: 15 }, nextScene: 'success_node' },
      { id: 'ans2', text: 'Submit 24D. Doubling the first digit increment.', traitDelta: { logical: 5 }, nextScene: 'partial_fail' },
      { id: 'ans3', text: 'Ignore code, pry the console open and manually short the circuit.', traitDelta: { realistic: 20, methodical: -10 }, nextScene: 'partial_fail' }
    ]
  },
  success_node: {
    id: 'success_node',
    title: 'Cascade Halted',
    narrative: [
      'The command is accepted. The cascade halts perfectly. The station AI chimes in:',
      '"Exceptional deduction, Architect. Predictive models stabilized."',
      'Your logical and spatial reasoning vectors have been recorded in the central database.'
    ],
    options: [
      { id: 'end', text: 'Sync Data & Return to Hub', traitDelta: {}, nextScene: 'END' }
    ]
  },
  partial_fail: {
    id: 'partial_fail',
    title: 'Stabilization Achieved... Barely',
    narrative: [
      'The command forces a massive hardware reboot. Sparks fly from the secondary array.',
      'The cascade stops, but sector 4 is entirely off-grid. The station AI evaluates the action:',
      '"Stabilization achieved through unorthodox action. Resource damage high. Logical models updating."'
    ],
    options: [
      { id: 'end', text: 'Sync Data & Return to Hub', traitDelta: {}, nextScene: 'END' }
    ]
  }
};

export default function PatternMasterGame() {
  const router = useRouter();
  const [currentSceneId, setCurrentSceneId] = useState<string>('intro');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [psychometricState, setPsychometricState] = useState<Record<string, number>>({
    logical: 0,
    spatial: 0,
    investigative: 0,
    realistic: 0,
    enterprising: 0
  });

  const scene = patternScenes[currentSceneId];

  const handleOptionSelect = (option: any) => {
    setIsTransitioning(true);

    // Apply trait deltas
    setPsychometricState((prev) => {
      const newState = { ...prev };
      for (const [trait, value] of Object.entries(option.traitDelta)) {
        newState[trait] = (newState[trait] || 0) + (value as number);
      }
      return newState;
    });

    setTimeout(() => {
      if (option.nextScene === 'END') {
        const queryParams = new URLSearchParams();
        Object.entries(psychometricState).forEach(([k, v]) => {
          if (v > 0) queryParams.append(`trait_${k}`, v.toString());
        });
        router.push(`/dashboard?${queryParams.toString()}`);
      } else {
        setCurrentSceneId(option.nextScene);
        setIsTransitioning(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        {/* Hexagonal overlay for Pattern Master theme */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-3xl"
          >
            <Card className="bg-black/40 border border-blue-500/20 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-blue-500/10">
              <div className="flex items-center gap-4 mb-8 border-b border-blue-500/20 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <span className="text-2xl">ðŸ›¡ï¸</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">
                    Logical & Spatial Analysis Matrix
                  </h2>
                  <h1 className="text-3xl md:text-4xl font-black text-white">
                    {scene.title}
                  </h1>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {scene.narrative.map((paragraph, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className={`text-lg md:text-xl leading-relaxed ${idx === 0 && paragraph.includes('SYSTEM ALERT') ? 'text-rose-400 font-mono font-bold uppercase track-wide' : 'text-slate-300 font-sans'}`}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">Execute Command:</h3>
                {scene.options?.map((option, idx) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (scene.narrative.length * 0.1) + (idx * 0.1) }}
                  >
                    <Button
                      onClick={() => handleOptionSelect(option)}
                      className="w-full justify-start text-left p-6 h-auto bg-slate-900/50 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white rounded-2xl group transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-black border border-slate-700 group-hover:border-blue-400 group-hover:bg-blue-500/20 flex items-center justify-center shrink-0 transition-colors">
                          <span className="text-sm font-mono text-slate-500 group-hover:text-blue-300">{idx + 1}</span>
                        </div>
                        <span className="text-lg pt-0.5">{option.text}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}