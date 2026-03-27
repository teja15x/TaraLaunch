'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import type { TraitScores } from '@/types';

interface RhythmRound {
  id: string;
  pattern: number[]; // indices 0-3 for 4 pads
  bpm: number;
  label: string;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
const PAD_LABELS = ['🥁', '🎹', '🎸', '🎺'];

const rounds: RhythmRound[] = [
  { id: 'r1', pattern: [0, 1, 0, 1], bpm: 80, label: 'Simple Beat' },
  { id: 'r2', pattern: [0, 2, 1, 3], bpm: 90, label: 'Four Corners' },
  { id: 'r3', pattern: [0, 0, 2, 2, 1, 1], bpm: 100, label: 'Double Tap' },
  { id: 'r4', pattern: [3, 1, 0, 2, 3, 1], bpm: 100, label: 'Mixed Rhythm' },
  { id: 'r5', pattern: [0, 1, 2, 3, 2, 1, 0], bpm: 110, label: 'Wave Pattern' },
  { id: 'r6', pattern: [0, 2, 0, 3, 1, 3, 1, 2], bpm: 120, label: 'Complex Groove' },
];

type Phase = 'intro' | 'listen' | 'play' | 'feedback' | 'complete';

export default function RhythmMatch() {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [scores, setScores] = useState<{ accuracy: number; timing: number }[]>([]);
  const [traits, setTraits] = useState<TraitScores | null>(null);
  const { traitScores, setTraitScores } = useAppStore();
  const router = useRouter();
  const playerTimestamps = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((padIdx: number, duration = 0.15) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      osc.frequency.value = freqs[padIdx];
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }, [getAudioCtx]);

  const playPattern = useCallback(() => {
    const round = rounds[currentRound];
    const interval = 60000 / round.bpm;
    setPhase('listen');
    round.pattern.forEach((pad, i) => {
      setTimeout(() => {
        setActiveIdx(pad);
        playTone(pad);
        setTimeout(() => setActiveIdx(null), interval * 0.6);
      }, i * interval);
    });
    setTimeout(() => {
      setPhase('play');
      setPlayerInput([]);
      playerTimestamps.current = [];
    }, round.pattern.length * interval + 300);
  }, [currentRound, playTone]);

  const handlePadClick = (padIdx: number) => {
    if (phase !== 'play') return;
    const round = rounds[currentRound];
    playTone(padIdx);
    setActiveIdx(padIdx);
    setTimeout(() => setActiveIdx(null), 100);

    const newInput = [...playerInput, padIdx];
    playerTimestamps.current.push(Date.now());
    setPlayerInput(newInput);

    if (newInput.length >= round.pattern.length) {
      // Score it
      let correct = 0;
      round.pattern.forEach((expected, i) => {
        if (newInput[i] === expected) correct++;
      });
      const accuracy = Math.round((correct / round.pattern.length) * 100);

      // Timing score: how evenly spaced the taps were
      let timingScore = 80;
      if (playerTimestamps.current.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < playerTimestamps.current.length; i++) {
          intervals.push(playerTimestamps.current[i] - playerTimestamps.current[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, v) => sum + Math.pow(v - avgInterval, 2), 0) / intervals.length;
        const cv = Math.sqrt(variance) / avgInterval;
        timingScore = Math.max(0, Math.min(100, Math.round(100 - cv * 100)));
      }

      const newScores = [...scores, { accuracy, timing: timingScore }];
      setScores(newScores);

      if (currentRound + 1 >= rounds.length) {
        // Calculate final traits
        const avgAccuracy = newScores.reduce((s, r) => s + r.accuracy, 0) / newScores.length;
        const avgTiming = newScores.reduce((s, r) => s + r.timing, 0) / newScores.length;
        const calculated: TraitScores = {
          analytical: Math.min(100, Math.round(avgAccuracy * 0.5 + avgTiming * 0.3)),
          creative: Math.min(100, Math.round(avgTiming * 0.7 + avgAccuracy * 0.2)),
          leadership: Math.min(100, Math.round(avgAccuracy * 0.2)),
          empathy: Math.min(100, Math.round(avgTiming * 0.3 + avgAccuracy * 0.2)),
          technical: Math.min(100, Math.round(avgAccuracy * 0.4 + avgTiming * 0.4)),
          communication: Math.min(100, Math.round(avgTiming * 0.5 + avgAccuracy * 0.2)),
          adaptability: Math.min(100, Math.round(avgTiming * 0.4 + avgAccuracy * 0.3)),
          detail_oriented: Math.min(100, Math.round(avgAccuracy * 0.6 + avgTiming * 0.3)),
        };
        const merged = traitScores
          ? (Object.keys(calculated) as (keyof TraitScores)[]).reduce((acc, key) => {
              acc[key] = Math.round((traitScores[key] + calculated[key]) / 2);
              return acc;
            }, { ...traitScores })
          : calculated;
        setTraitScores(merged);
        setTraits(merged);
        setPhase('complete');
      } else {
        setPhase('feedback');
      }
    }
  };

  if (phase === 'complete' && traits) {
    const avgAccuracy = scores.reduce((s, r) => s + r.accuracy, 0) / scores.length;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="text-2xl font-bold text-white mb-2">Rhythm Match Complete!</h2>
          <p className="text-primary-200 mb-4">Average Accuracy: {Math.round(avgAccuracy)}%</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(traits).map(([trait, val]) => (
              <ProgressBar
                key={trait}
                label={trait.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={val}
                color={val >= 60 ? 'bg-emerald-500' : 'bg-white/30'}
              />
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/games/nature-detective')}>Next: Nature Detective →</Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-white mb-3">Rhythm Match</h1>
          <p className="text-primary-200 mb-2 max-w-md mx-auto">
            Watch and listen to the pattern, then repeat it by tapping the pads in the same order.
          </p>
          <p className="text-white/50 text-sm mb-6">Measures: Musical Intelligence (Gardner)</p>
          <p className="text-white/40 text-xs mb-6">~3 minutes · {rounds.length} rounds</p>
          <Button size="lg" onClick={playPattern}>Start Playing 🎶</Button>
        </Card>
      </div>
    );
  }

  const round = rounds[currentRound];

  if (phase === 'feedback') {
    const lastScore = scores[scores.length - 1];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ProgressBar value={currentRound + 1} max={rounds.length} label={`Round ${currentRound + 1} of ${rounds.length}`} />
        <Card className="text-center py-8">
          <div className="text-4xl mb-3">{lastScore.accuracy >= 80 ? '🎉' : lastScore.accuracy >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {lastScore.accuracy >= 80 ? 'Excellent!' : lastScore.accuracy >= 50 ? 'Good effort!' : 'Keep trying!'}
          </h2>
          <p className="text-primary-200 mb-1">Accuracy: {lastScore.accuracy}%</p>
          <p className="text-primary-200 mb-6">Timing: {lastScore.timing}%</p>
          <Button onClick={() => { setCurrentRound((c) => c + 1); setTimeout(playPattern, 300); }}>
            Next Round →
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">🎵 Rhythm Match</h1>
        <p className="text-primary-200 text-sm">Round: {round.label}</p>
      </div>
      <ProgressBar value={currentRound + 1} max={rounds.length} label={`Round ${currentRound + 1} of ${rounds.length}`} />

      <Card className="text-center">
        <p className="text-white/70 mb-6 text-lg font-medium">
          {phase === 'listen' ? '👀 Watch the pattern...' : `🎹 Your turn! Tap ${round.pattern.length} pads`}
        </p>

        {phase === 'play' && (
          <div className="mb-4">
            <ProgressBar
              value={playerInput.length}
              max={round.pattern.length}
              label={`${playerInput.length} / ${round.pattern.length} taps`}
              color="bg-purple-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {[0, 1, 2, 3].map((padIdx) => (
            <button
              key={padIdx}
              onClick={() => handlePadClick(padIdx)}
              disabled={phase !== 'play'}
              className={`aspect-square rounded-2xl text-4xl font-bold transition-all duration-100 border-2 ${
                activeIdx === padIdx
                  ? 'scale-95 brightness-150 shadow-lg shadow-white/20'
                  : phase === 'play'
                  ? 'hover:scale-105 cursor-pointer'
                  : 'opacity-60'
              }`}
              style={{
                backgroundColor: activeIdx === padIdx ? COLORS[padIdx] : `${COLORS[padIdx]}44`,
                borderColor: activeIdx === padIdx ? COLORS[padIdx] : `${COLORS[padIdx]}66`,
              }}
            >
              {PAD_LABELS[padIdx]}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
