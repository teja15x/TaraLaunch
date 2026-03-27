'use client';

import { cn } from '@/utils/helpers';

export type VoiceAvatarStyle = 'neutral' | 'male' | 'female';

interface VoiceAgentAvatarProps {
  style: VoiceAvatarStyle;
  isListening: boolean;
  isSpeaking: boolean;
  elapsedSeconds: number;
}

const styleMap: Record<VoiceAvatarStyle, {
  label: string;
  persona: string;
  traits: string;
  aura: string;
  panel: string;
  accent: string;
  accentSoft: string;
  hair: string;
  body: string;
}> = {
  neutral: {
    label: 'Guide Mode',
    persona: 'Balanced career mentor',
    traits: 'Warm, clear, practical',
    aura: 'from-violet-500/35 to-cyan-400/25',
    panel: 'from-violet-600/15 to-cyan-500/10 border-violet-400/20',
    accent: 'bg-cyan-300 shadow-cyan-300/60',
    accentSoft: 'bg-cyan-300/20',
    hair: 'bg-slate-800',
    body: 'bg-gradient-to-b from-violet-500 to-cyan-500',
  },
  male: {
    label: 'Man Voice Mode',
    persona: 'Steady male mentor',
    traits: 'Direct, grounded, confident',
    aura: 'from-blue-500/35 to-emerald-400/25',
    panel: 'from-blue-600/15 to-emerald-500/10 border-blue-400/20',
    accent: 'bg-emerald-300 shadow-emerald-300/60',
    accentSoft: 'bg-emerald-300/20',
    hair: 'bg-slate-900',
    body: 'bg-gradient-to-b from-blue-500 to-emerald-500',
  },
  female: {
    label: 'Woman Voice Mode',
    persona: 'Strong female mentor',
    traits: 'Calm, sharp, reassuring',
    aura: 'from-fuchsia-500/35 to-rose-400/25',
    panel: 'from-fuchsia-600/15 to-rose-500/10 border-fuchsia-400/20',
    accent: 'bg-rose-300 shadow-rose-300/60',
    accentSoft: 'bg-rose-300/20',
    hair: 'bg-rose-950',
    body: 'bg-gradient-to-b from-fuchsia-500 to-rose-500',
  },
};

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function VoiceAgentAvatar({ style, isListening, isSpeaking, elapsedSeconds }: VoiceAgentAvatarProps) {
  const theme = styleMap[style];
  const isActive = isListening || isSpeaking;
  const status = isListening ? 'Listening live' : isSpeaking ? 'Agent speaking live' : 'Voice call ready';
  const waveformHeights = Array.from({ length: 9 }, (_, index) => {
    const speakingPattern = [22, 38, 30, 46, 34, 42, 28, 36, 24];
    const listeningPattern = [18, 28, 22, 34, 26, 30, 20, 27, 19];
    const idlePattern = [10, 14, 12, 18, 14, 16, 12, 13, 10];
    const pattern = isSpeaking ? speakingPattern : isListening ? listeningPattern : idlePattern;
    return pattern[(elapsedSeconds + index) % pattern.length];
  });

  return (
    <div className={cn('rounded-[2rem] border bg-gradient-to-br p-6', theme.panel)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white/65">
              Voice call mode
            </span>
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-sm font-semibold text-white">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{theme.label}</p>
          <p className="mt-1 text-sm text-white/70">{theme.persona}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{theme.traits}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-end justify-center gap-1.5 lg:justify-start">
              {waveformHeights.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    'w-2 rounded-full bg-white/75 transition-all duration-500',
                    isActive ? 'opacity-100' : 'opacity-45'
                  )}
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 lg:justify-start">
              <span className={cn('h-2.5 w-2.5 rounded-full', isListening ? 'bg-emerald-400 animate-pulse' : isSpeaking ? 'bg-violet-400 animate-pulse' : 'bg-white/25')} />
              <span className="text-xs text-white/60">{status}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative h-52 w-52">
            <div className={cn('absolute inset-4 rounded-full bg-gradient-to-br blur-3xl voice-aura-breathe', theme.aura)} />
            <div className="absolute inset-2 rounded-full border border-white/10" />
            <div className="absolute inset-5 rounded-full border border-dashed border-white/10" />
            <div className={cn('absolute inset-8 rounded-full border', theme.accentSoft)} />

            {style === 'neutral' && (
              <>
                <div className="absolute inset-0 voice-signal-orbit" style={{ animationDuration: '12s' }}>
                  <span className={cn('absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow-lg', theme.accent)} />
                </div>
                <div className="absolute inset-6 voice-signal-orbit-reverse" style={{ animationDuration: '9s' }}>
                  <span className={cn('absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow-lg', theme.accent)} />
                </div>
              </>
            )}

            {style === 'male' && (
              <>
                <div className="absolute inset-3 rounded-full border border-emerald-300/20" />
                <div className="absolute inset-0 voice-radar-spin opacity-70" style={{ background: 'conic-gradient(from 120deg, transparent 0deg, transparent 308deg, rgba(16,185,129,0.55) 346deg, transparent 360deg)' }} />
                <div className="absolute inset-[18%] rounded-full border border-emerald-200/12" />
                <div className="absolute left-1/2 top-1/2 h-px w-[74%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
                <div className="absolute left-1/2 top-[22%] h-[56%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-300/30 to-transparent" />
              </>
            )}

            {style === 'female' && (
              <>
                <div className="absolute inset-0 voice-petal-spin">
                  {[0, 1, 2, 3, 4, 5].map((petal) => (
                    <span
                      key={petal}
                      className="absolute left-1/2 top-1/2 h-20 w-8 -translate-x-1/2 -translate-y-[122px] rounded-full border border-rose-200/12 bg-gradient-to-b from-rose-300/18 to-transparent blur-[1px]"
                      style={{ transform: `translate(-50%, -122px) rotate(${petal * 60}deg)` }}
                    />
                  ))}
                </div>
                <div className="absolute inset-6 rounded-full border border-rose-200/12 voice-soft-shimmer" />
                <div className="absolute inset-0 voice-signal-orbit-reverse" style={{ animationDuration: '11s' }}>
                  <span className={cn('absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full shadow-lg', theme.accent)} />
                </div>
              </>
            )}

            <div
              className={cn('absolute inset-4 rounded-full opacity-35 transition-opacity duration-500', isActive ? 'opacity-80' : 'opacity-25')}
              style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(255,255,255,0.7) 336deg, transparent 360deg)' }}
            />

            {[0, 1, 2].map((ring) => (
              <div
                key={ring}
                className={cn(
                  'absolute rounded-full border border-white/10 transition-opacity duration-300',
                  isActive ? 'opacity-100 voice-ring-pulse' : 'opacity-0'
                )}
                style={{
                  inset: `${ring * 10}px`,
                  animationDelay: `${ring * 240}ms`,
                  animationDuration: '2.4s',
                }}
              />
            ))}

            <div className="absolute inset-[1.35rem] rounded-full border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 voice-avatar-float">
              <div className="absolute inset-x-6 top-5 h-16 rounded-full bg-white/5 blur-xl" />
              <div className="absolute left-1/2 top-6 h-20 w-20 -translate-x-1/2 rounded-full bg-[#f5c9a8]">
                <div className={cn('absolute left-1/2 top-0 h-8 w-[92px] -translate-x-1/2 rounded-t-full', theme.hair)} />
                {style === 'female' && (
                  <>
                    <div className={cn('absolute -left-1 top-4 h-12 w-5 rounded-full', theme.hair)} />
                    <div className={cn('absolute -right-1 top-4 h-12 w-5 rounded-full', theme.hair)} />
                  </>
                )}
                {style === 'male' && (
                  <div className={cn('absolute left-1/2 top-1 h-4 w-16 -translate-x-1/2 rounded-full', theme.hair)} />
                )}
                <div className="absolute left-5 top-10 h-2 w-2 rounded-full bg-slate-900" />
                <div className="absolute right-5 top-10 h-2 w-2 rounded-full bg-slate-900" />
                <div
                  className={cn(
                    'absolute left-1/2 top-[3.35rem] -translate-x-1/2 rounded-full transition-all duration-200',
                    isSpeaking ? 'h-2.5 w-6 animate-pulse bg-rose-600' : 'h-1.5 w-4 bg-rose-700',
                    isListening && 'h-2 w-5 bg-emerald-500'
                  )}
                />
              </div>

              <div className={cn('absolute bottom-7 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-[2.2rem]', theme.body)} />
              <div className="absolute bottom-4 left-1/2 h-8 w-28 -translate-x-1/2 rounded-full bg-white/10 blur-sm" />
            </div>

            <div className="absolute -bottom-1 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-black/30 blur-md" />
          </div>

          <p className="mt-4 text-sm font-semibold text-white">{isListening ? 'Mic active' : isSpeaking ? 'Agent voice active' : 'Waiting for your next line'}</p>
          <p className="mt-1 text-xs text-white/55">{isListening ? 'Speak naturally. The agent will pick it up.' : isSpeaking ? 'Listen to the answer, then continue the conversation.' : 'Turn on voice reply and use the mic for a call-like flow.'}</p>
        </div>
      </div>
    </div>
  );
}