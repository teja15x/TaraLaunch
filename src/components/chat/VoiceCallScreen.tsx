'use client';

import { VoiceAgentAvatar, type VoiceAvatarStyle } from '@/components/chat/VoiceAgentAvatar';
import { Button } from '@/components/ui/Button';

interface VoiceCallScreenProps {
  style: VoiceAvatarStyle;
  isListening: boolean;
  isSpeaking: boolean;
  elapsedSeconds: number;
  voiceSupported: boolean;
  loading: boolean;
  preferredLanguageLabel: string;
  selectedRole?: string;
  currentTranscript: string;
  typedInput: string;
  onToggleListening: () => void;
  onTypedInputChange: (value: string) => void;
  onTypedSubmit: () => void;
  onMinimize: () => void;
  onEndCall: () => void;
}

interface VoiceCallDockProps {
  style: VoiceAvatarStyle;
  isListening: boolean;
  isSpeaking: boolean;
  elapsedSeconds: number;
  voiceSupported: boolean;
  loading: boolean;
  onRestore: () => void;
  onToggleListening: () => void;
  onEndCall: () => void;
}

export function VoiceCallScreen({
  style,
  isListening,
  isSpeaking,
  elapsedSeconds,
  voiceSupported,
  loading,
  preferredLanguageLabel,
  selectedRole,
  currentTranscript,
  typedInput,
  onToggleListening,
  onTypedInputChange,
  onTypedSubmit,
  onMinimize,
  onEndCall,
}: VoiceCallScreenProps) {
  const liveCaption = currentTranscript.trim() || (isListening
    ? 'Listening for your next line...'
    : isSpeaking
      ? 'Agent is replying...'
      : 'Voice conversation is ready. Start speaking.');

  return (
    <div className="voice-call-screen-enter fixed inset-0 z-50 overflow-y-auto bg-[#040411]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(86,77,189,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(160deg,#03030b_0%,#090916_48%,#04040d_100%)]" />
      <div className="voice-call-grid absolute inset-0 opacity-25" />
      <div className="voice-call-spotlight absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="voice-call-spotlight-delayed absolute right-[8%] top-[18%] h-64 w-64 rounded-full bg-fuchsia-400/12 blur-3xl" />
      <div className="voice-call-float absolute left-[12%] bottom-[18%] h-20 w-20 rounded-full border border-white/8 bg-white/[0.02]" />
      <div className="voice-call-float-delayed absolute right-[14%] bottom-[28%] h-28 w-28 rounded-full border border-white/8 bg-white/[0.02]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Career Agent Voice Call</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/75">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">Language: {preferredLanguageLabel}</span>
              {selectedRole?.trim() && <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">Target: {selectedRole.trim()}</span>}
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">Mode: {voiceSupported ? 'Live voice' : 'Voice unsupported'}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">Conversation: Real-time</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onMinimize}>
              Minimize
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={onEndCall}>
              End Voice Mode
            </Button>
          </div>
        </div>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="flex h-full flex-col justify-center rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-7">
              <div className="rounded-[1.7rem] border border-white/10 bg-black/20 p-5 sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">Live voice state</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                    {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                    {voiceSupported ? 'Mic available' : 'Mic unavailable'}
                  </span>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-5 sm:px-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/38">Live caption</p>
                  <p className="mt-3 min-h-[72px] text-lg leading-8 text-white/88 sm:text-xl">
                    {liveCaption}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onToggleListening}
                    disabled={!voiceSupported || loading}
                    className="group relative inline-flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className={isListening ? 'voice-call-mic-pulse absolute inset-0 rounded-full border border-red-300/35' : 'absolute inset-2 rounded-full border border-white/10'} />
                    <span className={isListening ? 'voice-call-mic-pulse absolute inset-[-10px] rounded-full border border-red-300/20' : 'hidden'} />
                    <span className="relative text-sm font-semibold">
                      {isListening ? 'Pause' : 'Talk'}
                    </span>
                  </button>
                </div>

                <p className="mt-4 text-center text-sm text-white/55">
                  {isListening
                    ? 'Speak normally. The conversation will continue automatically.'
                    : 'Tap once to jump back into the live conversation.'}
                </p>

                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Optional typed message</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <textarea
                      value={typedInput}
                      onChange={(event) => onTypedInputChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          onTypedSubmit();
                        }
                      }}
                      rows={2}
                      placeholder="Type here if you want to send instead of speaking..."
                      className="min-h-[72px] flex-1 resize-none rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      type="button"
                      size="lg"
                      onClick={onTypedSubmit}
                      disabled={!typedInput.trim() || loading}
                      className="sm:self-stretch"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="rounded-[2.2rem] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl sm:p-4">
              <VoiceAgentAvatar
                style={style}
                isListening={isListening}
                isSpeaking={isSpeaking}
                elapsedSeconds={elapsedSeconds}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VoiceCallDock({
  style,
  isListening,
  isSpeaking,
  elapsedSeconds,
  voiceSupported,
  loading,
  onRestore,
  onToggleListening,
  onEndCall,
}: VoiceCallDockProps) {
  return (
    <div className="voice-call-dock-enter fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-[1.8rem] border border-white/10 bg-[#090913]/92 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Voice call minimized</p>
          <p className="mt-1 text-sm font-semibold text-white">{style === 'neutral' ? 'Guide' : style === 'male' ? 'Man voice' : 'Woman voice'} active</p>
          <p className="mt-1 text-xs text-white/60">{isListening ? 'Listening now' : isSpeaking ? 'Agent speaking' : 'Ready for your next prompt'} • {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}</p>
        </div>
        <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onRestore} className="flex-1">
          Open Call
        </Button>
        <Button type="button" variant={isListening ? 'danger' : 'ghost'} size="sm" onClick={onToggleListening} disabled={!voiceSupported || loading}>
          {isListening ? 'Stop' : 'Mic'}
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={onEndCall}>
          End
        </Button>
      </div>
    </div>
  );
}