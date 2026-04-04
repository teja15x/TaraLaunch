'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import {
  CONVERSATION_STYLE_OPTIONS,
  SCRIPT_PREFERENCE_OPTIONS,
  SUPPORTED_COUNSELING_LANGUAGES,
  getResolvedConversationStyleForLanguage,
  type SupportedCounselingLanguage,
  type SupportedConversationStyle,
  type SupportedScriptPreference,
} from '@/lib/career-agent/prompt';
import {
  CHAT_PREFERENCES_UPDATED_EVENT,
  LOCAL_CHAT_PREFERENCES_KEY,
  LOCAL_CHAT_STORAGE_KEY,
  LOCAL_CHAT_VERSION,
  LOCAL_CHAT_VERSION_KEY,
  LOCAL_STUDENT_INTAKE_KEY,
} from '@/lib/career-agent/storage';
import { detectStudentStage, type StageDetectionResult } from '@/lib/career-agent/stageDetection';
import { VoiceCallDock, VoiceCallScreen } from '@/components/chat/VoiceCallScreen';
import { VoiceAgentAvatar, type VoiceAvatarStyle } from '@/components/chat/VoiceAgentAvatar';
import { MarkdownMessage } from '@/components/chat/MarkdownMessage';
import type { ChatMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';

interface StudentIntake {
  studentName: string;
  currentStage: string;
  stateOrCity: string;
  collegeRecommendationScope: 'state-first' | 'india-wide';
  comparisonFocus: string;
  currentSituation: string;
  interests: string;
  confusion: string;
  stressors: string;
  familyPressure: string;
  targetRole: string;
}

interface ChatPreferences {
  preferredLanguage: SupportedCounselingLanguage;
  conversationStyle: SupportedConversationStyle;
  scriptPreference: SupportedScriptPreference;
  selectedRole: string;
}

const EMPTY_STUDENT_INTAKE: StudentIntake = {
  studentName: '',
  currentStage: '',
  stateOrCity: '',
  collegeRecommendationScope: 'state-first',
  comparisonFocus: '',
  currentSituation: '',
  interests: '',
  confusion: '',
  stressors: '',
  familyPressure: '',
  targetRole: '',
};

function hasRequiredIntakeDetails(intake: StudentIntake, submitted: boolean): boolean {
  if (!submitted) return false;

  return Boolean(
    intake.studentName.trim() &&
    intake.currentStage.trim() &&
    intake.stateOrCity.trim() &&
    intake.currentSituation.trim()
  );
}

interface DbChatMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  length: number;
  isFinal?: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

interface BrowserWindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  if (typeof window === 'undefined') return null;
  const browserWindow = window as BrowserWindowWithSpeech;
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
}

function getSpeakableText(content: string): string {
  // Strip [OPTIONS: ...] tags and markdown syntax so TTS reads clean text.
  const stripped = content
    .replace(/\[OPTIONS:[^\]]*\]/gi, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim();
  const compact = stripped.replace(/\s+/g, ' ').trim();
  const sentences = compact.match(/[^.!?]+[.!?]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  const genericLeadPattern = /^(sure|okay|ok|alright|sare|saree|alane|acha|accha|if anything you want|how can i help|tell me|cheppu|please tell me)/i;
  const cleanedSentences =
    sentences.length > 1 && genericLeadPattern.test(sentences[0])
      ? sentences.slice(1)
      : sentences;
  const firstFourSentences = cleanedSentences.slice(0, 4).join(' ').trim();
  const preferred = firstFourSentences && firstFourSentences.length >= 36 ? firstFourSentences : compact;
  const maxChars = 620;

  if (preferred.length <= maxChars) {
    return preferred;
  }

  const limited = preferred.slice(0, maxChars);
  const sentenceBoundary = Math.max(limited.lastIndexOf('.'), limited.lastIndexOf('!'), limited.lastIndexOf('?'));
  if (sentenceBoundary > Math.floor(maxChars * 0.55)) {
    return limited.slice(0, sentenceBoundary + 1).trim();
  }

  const wordBoundary = limited.lastIndexOf(' ');
  const safeCut = wordBoundary > 0 ? limited.slice(0, wordBoundary).trim() : limited.trim();
  return safeCut.endsWith('.') || safeCut.endsWith('!') || safeCut.endsWith('?') ? safeCut : `${safeCut}.`;
}

function splitLongTextByWords(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const parts: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      parts.push(current);
      current = word;
      continue;
    }

    parts.push(word.slice(0, maxChars));
    current = word.slice(maxChars);
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function splitSpeechChunks(content: string, maxChars = 220): string[] {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentenceLikePieces = normalized.match(/[^.!?]+[.!?]?/g)?.map((piece) => piece.trim()).filter(Boolean) ?? [normalized];
  const normalizedPieces: string[] = [];

  for (const piece of sentenceLikePieces) {
    if (piece.length <= maxChars) {
      normalizedPieces.push(piece);
      continue;
    }

    const commaParts = piece.split(/,\s+/).map((part) => part.trim()).filter(Boolean);
    for (const commaPart of commaParts) {
      if (commaPart.length <= maxChars) {
        normalizedPieces.push(commaPart);
      } else {
        normalizedPieces.push(...splitLongTextByWords(commaPart, maxChars));
      }
    }
  }

  const chunks: string[] = [];
  let current = '';

  for (const piece of normalizedPieces) {
    const candidate = current ? `${current} ${piece}` : piece;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (piece.length <= maxChars) {
      current = piece;
    } else {
      const splitParts = splitLongTextByWords(piece, maxChars);
      chunks.push(...splitParts.slice(0, -1));
      current = splitParts[splitParts.length - 1] ?? '';
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function getEffectiveSpeechLanguage(language: SupportedCounselingLanguage): string {
  return language === 'auto' ? 'en-IN' : language;
}

// Parse [OPTIONS: opt1 | opt2 | opt3] tags embedded in AI replies.
function parseMessageContent(content: string): { text: string; options: string[] } {
  const match = content.match(/\[OPTIONS:\s*([^\]]+)\]/i);
  if (!match) return { text: content, options: [] };
  const options = match[1].split('|').map((o) => o.trim()).filter(Boolean);
  const text = content.replace(/\[OPTIONS:\s*[^\]]+\]/i, '').trim();
  return { text, options };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedCounselingLanguage>('en-IN');
  const [conversationStyle, setConversationStyle] = useState<SupportedConversationStyle>('auto');
  const [scriptPreference, setScriptPreference] = useState<SupportedScriptPreference>('auto');
  const [studentIntake, setStudentIntake] = useState<StudentIntake>(EMPTY_STUDENT_INTAKE);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [intakeChecked, setIntakeChecked] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);
  
  // Layer 1: Stage Detection
  const [detectedStage, setDetectedStage] = useState<StageDetectionResult | null>(null);
  
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const [voiceCallMinimized, setVoiceCallMinimized] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const voiceAvatarStyle: VoiceAvatarStyle = 'neutral';
  const [voiceSessionStartedAt, setVoiceSessionStartedAt] = useState<number | null>(null);
  const [voiceSessionElapsed, setVoiceSessionElapsed] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingVoiceTranscript, setPendingVoiceTranscript] = useState('');
  const [isVoiceStarting, setIsVoiceStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const speechSessionIdRef = useRef(0);
  const capturedVoiceTranscriptRef = useRef('');
  const finalVoiceTranscriptHandledRef = useRef(false);
  const manualVoicePauseRef = useRef(false);
  const autoListenTimeoutRef = useRef<number | null>(null);
  const voiceSessionOpenedRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const supabaseConfigured = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured]);
  const apiHistoryWindow = voiceReplyEnabled ? 8 : 12;
  const hasConversationStarted = messages.length > 0;
  const router = useRouter();

  const getPersistedSubmittedIntake = useCallback((): StudentIntake | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
      const raw = window.localStorage.getItem(LOCAL_STUDENT_INTAKE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw) as { intake?: Partial<StudentIntake>; submitted?: boolean };
      if (!parsed?.submitted || !parsed.intake) return undefined;
      const merged = { ...EMPTY_STUDENT_INTAKE, ...parsed.intake };
      return hasRequiredIntakeDetails(merged, true) ? merged : undefined;
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedVersion = window.localStorage.getItem(LOCAL_CHAT_VERSION_KEY);
    if (storedVersion !== LOCAL_CHAT_VERSION) {
      // Only clear chat message history when version changes.
      // Never clear intake or preferences — they belong to the user, not a session version.
      window.localStorage.removeItem(LOCAL_CHAT_STORAGE_KEY);
      window.localStorage.setItem(LOCAL_CHAT_VERSION_KEY, LOCAL_CHAT_VERSION);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyStoredPreferences = () => {
      const raw = window.localStorage.getItem(LOCAL_CHAT_PREFERENCES_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as Partial<ChatPreferences>;

        const resolvedLanguage: SupportedCounselingLanguage =
          parsed.preferredLanguage && parsed.preferredLanguage !== 'auto'
            ? parsed.preferredLanguage
            : 'en-IN';

        if (parsed.preferredLanguage) {
          setPreferredLanguage(resolvedLanguage);
        }

        if (parsed.conversationStyle) {
          setConversationStyle(getResolvedConversationStyleForLanguage(resolvedLanguage, parsed.conversationStyle));
        } else {
          setConversationStyle(getResolvedConversationStyleForLanguage(resolvedLanguage, 'auto'));
        }

        if (parsed.scriptPreference) {
          setScriptPreference(parsed.scriptPreference);
        }

        if (typeof parsed.selectedRole === 'string' && parsed.selectedRole.trim()) {
          setSelectedRole(parsed.selectedRole.trim());
        }
      } catch {
        window.localStorage.removeItem(LOCAL_CHAT_PREFERENCES_KEY);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === LOCAL_CHAT_PREFERENCES_KEY) {
        applyStoredPreferences();
      }
    };

    const handlePreferencesUpdate = () => applyStoredPreferences();

    applyStoredPreferences();
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(CHAT_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(CHAT_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdate);
    };
  }, []);

  const clearAutoListenTimeout = useCallback(() => {
    if (autoListenTimeoutRef.current === null || typeof window === 'undefined') return;
    window.clearTimeout(autoListenTimeoutRef.current);
    autoListenTimeoutRef.current = null;
  }, []);

  const startVoiceListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || loading || isVoiceStarting || isAssistantSpeaking || isListening) return;

    try {
      recognition.lang = getEffectiveSpeechLanguage(preferredLanguage);
      capturedVoiceTranscriptRef.current = '';
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isAssistantSpeaking, isListening, isVoiceStarting, loading, preferredLanguage]);

  const scheduleAutoListen = useCallback((delayMs = 120) => {
    if (typeof window === 'undefined') return;
    clearAutoListenTimeout();

    autoListenTimeoutRef.current = window.setTimeout(() => {
      autoListenTimeoutRef.current = null;
      if (!voiceReplyEnabled || manualVoicePauseRef.current) return;
      startVoiceListening();
    }, delayMs);
  }, [clearAutoListenTimeout, startVoiceListening, voiceReplyEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedIntake = window.localStorage.getItem(LOCAL_STUDENT_INTAKE_KEY);
    if (!savedIntake) {
      setIntakeChecked(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedIntake) as { intake?: StudentIntake; submitted?: boolean };
      const mergedIntake = { ...EMPTY_STUDENT_INTAKE, ...(parsed.intake ?? {}) };
      const validSubmitted = hasRequiredIntakeDetails(mergedIntake, Boolean(parsed.submitted));

      setStudentIntake(mergedIntake);
      if (mergedIntake.targetRole?.trim()) {
        setSelectedRole((currentValue) => currentValue || mergedIntake.targetRole.trim());
      }
      setIntakeSubmitted(validSubmitted);
    } catch {
      window.localStorage.removeItem(LOCAL_STUDENT_INTAKE_KEY);
      setIntakeSubmitted(false);
    } finally {
      setIntakeChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!intakeChecked) return;
    if (!hasRequiredIntakeDetails(studentIntake, intakeSubmitted)) {
      router.replace('/chat/start');
    }
  }, [intakeChecked, intakeSubmitted, router, studentIntake]);

  // Layer 1: Detect student stage on intake submission
  useEffect(() => {
    if (!intakeSubmitted || !studentIntake.studentName.trim()) {
      return;
    }

    const result = detectStudentStage({
      studentName: studentIntake.studentName,
      currentStage: studentIntake.currentStage,
      stateOrCity: studentIntake.stateOrCity,
      currentSituation: studentIntake.currentSituation,
      interests: studentIntake.interests,
      confusion: studentIntake.confusion,
      stressors: studentIntake.stressors,
      familyPressure: studentIntake.familyPressure,
      targetRole: studentIntake.targetRole,
    });

    setDetectedStage(result);

  }, [intakeSubmitted, studentIntake]);

  useEffect(() => {
    // Guard: only write back after intake has been loaded from localStorage.
    // Without this guard the effect runs on first mount with empty default state
    // and immediately overwrites the data the intake page just saved.
    if (typeof window === 'undefined' || !intakeChecked) return;
    window.localStorage.setItem(
      LOCAL_STUDENT_INTAKE_KEY,
      JSON.stringify({ intake: studentIntake, submitted: intakeSubmitted })
    );
  }, [studentIntake, intakeSubmitted, intakeChecked]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preferences: ChatPreferences = {
      preferredLanguage,
      conversationStyle,
      scriptPreference,
      selectedRole,
    };

    window.localStorage.setItem(LOCAL_CHAT_PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferredLanguage, conversationStyle, scriptPreference, selectedRole]);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      if (typeof window !== 'undefined') {
        const savedHistory = window.localStorage.getItem(LOCAL_CHAT_STORAGE_KEY);
        if (savedHistory) {
          try {
            const parsed = JSON.parse(savedHistory) as ChatMessage[];
            setMessages(parsed);
          } catch {
            window.localStorage.removeItem(LOCAL_CHAT_STORAGE_KEY);
          }
        }
      }
      setLoaded(true);
      return;
    }

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages((data as DbChatMessageRow[]).map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          created_at: m.created_at,
        })));
      }
      setLoaded(true);
    };
    load();
  }, [supabase, supabaseConfigured]);

  useEffect(() => {
    if (supabaseConfigured || typeof window === 'undefined') return;
    window.localStorage.setItem(LOCAL_CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages, supabaseConfigured]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    if (role?.trim()) {
      setSelectedRole(role.trim());
      setStudentIntake((currentValue) => ({
        ...currentValue,
        targetRole: currentValue.targetRole || role.trim(),
      }));
    }
  }, []);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setVoiceSupported(false);
      recognitionRef.current = null;
      return;
    }

    const recognition = new Recognition();
    recognition.lang = getEffectiveSpeechLanguage(preferredLanguage);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      capturedVoiceTranscriptRef.current = '';
      finalVoiceTranscriptHandledRef.current = false;
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      const transcript = capturedVoiceTranscriptRef.current.trim();
      if (transcript && !finalVoiceTranscriptHandledRef.current) {
        setPendingVoiceTranscript(transcript);
        finalVoiceTranscriptHandledRef.current = true;
        capturedVoiceTranscriptRef.current = '';
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript?.trim();
      if (!transcript) return;

      capturedVoiceTranscriptRef.current = transcript;
      setInput(transcript);

      if (result?.isFinal && !finalVoiceTranscriptHandledRef.current) {
        finalVoiceTranscriptHandledRef.current = true;
        setPendingVoiceTranscript(transcript);
        recognition.stop();
      }
    };

    recognitionRef.current = recognition;
    setVoiceSupported(true);

    return () => {
      clearAutoListenTimeout();
      recognition.stop();
      recognitionRef.current = null;
      setIsListening(false);
    };
  }, [clearAutoListenTimeout, preferredLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!voiceReplyEnabled) {
      clearAutoListenTimeout();
      setIsVoiceStarting(false);
      voiceSessionOpenedRef.current = false;
      setVoiceSessionStartedAt(null);
      setVoiceSessionElapsed(0);
      return;
    }

    setVoiceSessionStartedAt((currentValue) => currentValue ?? Date.now());
    manualVoicePauseRef.current = false;
    if (!voiceSessionOpenedRef.current) {
      voiceSessionOpenedRef.current = true;
      setIsVoiceStarting(true);
      return;
    }

    if (!isVoiceStarting && !isAssistantSpeaking && !loading) {
      scheduleAutoListen(80);
    }
  }, [clearAutoListenTimeout, isAssistantSpeaking, isVoiceStarting, loading, scheduleAutoListen, voiceReplyEnabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    if (voiceReplyEnabled) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [voiceReplyEnabled]);

  useEffect(() => {
    if (voiceSessionStartedAt === null || typeof window === 'undefined') return;

    const updateElapsed = () => {
      setVoiceSessionElapsed(Math.max(0, Math.floor((Date.now() - voiceSessionStartedAt) / 1000)));
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);

    return () => window.clearInterval(intervalId);
  }, [voiceSessionStartedAt]);

  const speakAssistantMessage = useCallback(
    (message: ChatMessage) => {
      if (!voiceReplyEnabled || typeof window === 'undefined' || !(window as Window).speechSynthesis) return;

      const speakableText = getSpeakableText(message.content);
      if (!speakableText) return;

      clearAutoListenTimeout();
      const synth = window.speechSynthesis;
      speechSessionIdRef.current += 1;
      const activeSpeechSessionId = speechSessionIdRef.current;
      synth.cancel();

      const chunks = splitSpeechChunks(speakableText, 220);
      if (!chunks.length) {
        setIsAssistantSpeaking(false);
        if (voiceReplyEnabled) {
          scheduleAutoListen(80);
        }
        return;
      }

      const speakChunk = (index: number) => {
        if (speechSessionIdRef.current !== activeSpeechSessionId) return;

        const chunk = chunks[index];
        if (!chunk) {
          setIsAssistantSpeaking(false);
          if (voiceReplyEnabled) {
            scheduleAutoListen(90);
          }
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = getEffectiveSpeechLanguage(preferredLanguage);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsAssistantSpeaking(true);
        utterance.onend = () => {
          if (index >= chunks.length - 1) {
            setIsAssistantSpeaking(false);
            if (voiceReplyEnabled) {
              scheduleAutoListen(90);
            }
            return;
          }
          speakChunk(index + 1);
        };
        utterance.onerror = () => {
          if (index >= chunks.length - 1) {
            setIsAssistantSpeaking(false);
            if (voiceReplyEnabled) {
              scheduleAutoListen(90);
            }
            return;
          }
          speakChunk(index + 1);
        };
        synth.speak(utterance);
      };

      speakChunk(0);
    },
    [clearAutoListenTimeout, preferredLanguage, scheduleAutoListen, voiceReplyEnabled]
  );

  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1];
    if (latest.role !== 'assistant') return;
    if (latest.id === lastSpokenMessageIdRef.current) return;

    speakAssistantMessage(latest);
    lastSpokenMessageIdRef.current = latest.id;
  }, [messages, speakAssistantMessage]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || loading) return;

    if (isListening) {
      manualVoicePauseRef.current = true;
      clearAutoListenTimeout();
      recognition.stop();
      return;
    }

    manualVoicePauseRef.current = false;
    startVoiceListening();
  };

  const toggleVoiceReply = () => {
    setVoiceReplyEnabled((currentValue) => {
      const nextValue = !currentValue;

      setVoiceCallMinimized(false);
      setIsVoiceStarting(nextValue);
      manualVoicePauseRef.current = !nextValue;
      clearAutoListenTimeout();

      if (!nextValue && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSessionIdRef.current += 1;
        window.speechSynthesis.cancel();
        setIsAssistantSpeaking(false);
      }

      if (!nextValue && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }

      return nextValue;
    });
  };

  const resetChatSession = () => {
    if (recognitionRef.current) {
      clearAutoListenTimeout();
      recognitionRef.current.stop();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSessionIdRef.current += 1;
      window.speechSynthesis.cancel();
      setIsAssistantSpeaking(false);
      window.localStorage.removeItem(LOCAL_CHAT_STORAGE_KEY);
      window.localStorage.removeItem(LOCAL_STUDENT_INTAKE_KEY);
      window.localStorage.removeItem(LOCAL_CHAT_PREFERENCES_KEY);
    }

    lastSpokenMessageIdRef.current = null;
    setMessages([]);
    setInput('');
    setLoading(false);
    setSelectedRole('');
    setPreferredLanguage('en-IN');
    setConversationStyle('auto');
    setScriptPreference('auto');
    setStudentIntake(EMPTY_STUDENT_INTAKE);
    setIntakeSubmitted(false);
    setIsVoiceStarting(false);
    setIsListening(false);
    setPendingVoiceTranscript('');
    capturedVoiceTranscriptRef.current = '';
    manualVoicePauseRef.current = false;
    setVoiceSessionElapsed(0);
    setVoiceSessionStartedAt(voiceReplyEnabled ? Date.now() : null);
  };

  const requestVoiceSessionStart = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const persistedSubmittedIntake = getPersistedSubmittedIntake();
      const intakeForRequest = intakeSubmitted ? studentIntake : persistedSubmittedIntake;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredLanguage,
          conversationStyle,
          scriptPreference,
          selectedRole: selectedRole.trim() || undefined,
          voiceMode: true,
          voiceSessionStart: true,
          detectedStage: detectedStage?.stage,
          studentIntake: intakeForRequest,
          messages: messagesRef.current.slice(-apiHistoryWindow).map((messageItem) => ({
            role: messageItem.role,
            content: messageItem.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message ?? 'Let us start. Tell me what feels most confusing right now.',
        timestamp: Date.now(),
      };

      lastSpokenMessageIdRef.current = assistantMessage.id;
      setMessages((prev) => [...prev, assistantMessage]);
      speakAssistantMessage(assistantMessage);
    } catch {
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: preferredLanguage === 'auto'
          ? 'Which language feels most natural for you here? English, Hindi, Telugu, or the one you are most comfortable with.'
          : 'Sare, mana voice session start chesedham. Nee situation lo ippudu most confusing part enti?',
        timestamp: Date.now(),
      };

      lastSpokenMessageIdRef.current = fallbackMessage.id;
      setMessages((prev) => [...prev, fallbackMessage]);
      speakAssistantMessage(fallbackMessage);
    } finally {
      setLoading(false);
      setIsVoiceStarting(false);
    }
  }, [apiHistoryWindow, conversationStyle, detectedStage?.stage, getPersistedSubmittedIntake, intakeSubmitted, loading, preferredLanguage, scriptPreference, selectedRole, speakAssistantMessage, studentIntake]);

  const sendMessage = useCallback(
    async (
      text?: string,
      overrides?: {
        preferredLanguage?: SupportedCounselingLanguage;
        conversationStyle?: SupportedConversationStyle;
        scriptPreference?: SupportedScriptPreference;
        selectedRole?: string;
        studentIntake?: StudentIntake;
        useStudentIntake?: boolean;
      }
    ) => {
      const toSend = (text ?? input).trim();
      if (!toSend || loading) return;
      setInput('');
      setLoading(true);

      const effectiveLanguage = overrides?.preferredLanguage ?? preferredLanguage;
      const effectiveConversationStyle = overrides?.conversationStyle ?? conversationStyle;
      const effectiveScriptPreference = overrides?.scriptPreference ?? scriptPreference;
      const effectiveSelectedRole = overrides?.selectedRole ?? (selectedRole.trim() || undefined);
      const persistedSubmittedIntake = getPersistedSubmittedIntake();
      const effectiveStudentIntake = overrides?.useStudentIntake
        ? (overrides?.studentIntake ?? studentIntake)
        : intakeSubmitted
          ? studentIntake
          : persistedSubmittedIntake;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: toSend,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: toSend,
            messages: messagesRef.current.slice(-apiHistoryWindow).map((messageItem) => ({
              role: messageItem.role,
              content: messageItem.content,
            })),
            preferredLanguage: effectiveLanguage,
            conversationStyle: effectiveConversationStyle,
            scriptPreference: effectiveScriptPreference,
            selectedRole: effectiveSelectedRole,
            detectedStage: detectedStage?.stage,
            voiceMode: voiceReplyEnabled,
            studentIntake: effectiveStudentIntake,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.message ?? 'Sorry, I couldn’t respond.',
            timestamp: Date.now(),
          },
        ]);
      } catch (error) {
        const fallback = 'Something went wrong. Please try again.';
        const errorMessage = error instanceof Error ? error.message.trim() : fallback;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: errorMessage || fallback,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      apiHistoryWindow,
      conversationStyle,
      detectedStage?.stage,
      getPersistedSubmittedIntake,
      input,
      intakeSubmitted,
      loading,
      preferredLanguage,
      scriptPreference,
      selectedRole,
      studentIntake,
      voiceReplyEnabled,
    ]
  );

  useEffect(() => {
    if (!voiceReplyEnabled || !pendingVoiceTranscript.trim() || loading) return;

    const transcript = pendingVoiceTranscript.trim();
    setPendingVoiceTranscript('');
    void sendMessage(transcript);
  }, [pendingVoiceTranscript, voiceReplyEnabled, loading, sendMessage]);

  useEffect(() => {
    if (!voiceReplyEnabled || !isVoiceStarting) return;
    void requestVoiceSessionStart();
  }, [isVoiceStarting, requestVoiceSessionStart, voiceReplyEnabled]);

  if (!loaded) {
    return (
      <div className="surface-panel mx-auto flex min-h-[42vh] max-w-2xl items-center justify-center rounded-3xl">
        <p className="text-white/70">Loading chat...</p>
      </div>
    );
  }

  return (
    <>
      {voiceReplyEnabled && !voiceCallMinimized && (
        <VoiceCallScreen
          style={voiceAvatarStyle}
          isListening={isListening}
          isSpeaking={isAssistantSpeaking}
          elapsedSeconds={voiceSessionElapsed}
          voiceSupported={voiceSupported}
          loading={loading}
          preferredLanguageLabel={SUPPORTED_COUNSELING_LANGUAGES.find((language) => language.code === preferredLanguage)?.label ?? 'Ask me first'}
          selectedRole={selectedRole}
          currentTranscript={input}
          typedInput={input}
          onToggleListening={toggleListening}
          onTypedInputChange={setInput}
          onTypedSubmit={() => sendMessage()}
          onMinimize={() => setVoiceCallMinimized(true)}
          onEndCall={toggleVoiceReply}
        />
      )}
      {voiceReplyEnabled && voiceCallMinimized && (
        <VoiceCallDock
          style={voiceAvatarStyle}
          isListening={isListening}
          isSpeaking={isAssistantSpeaking}
          elapsedSeconds={voiceSessionElapsed}
          voiceSupported={voiceSupported}
          loading={loading}
          onRestore={() => setVoiceCallMinimized(false)}
          onToggleListening={toggleListening}
          onEndCall={toggleVoiceReply}
        />
      )}
      <div className="surface-panel glow-top animate-rise mx-auto flex h-[calc(100vh-8rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.85rem]">
      <div className="animate-rise-delayed border-b border-white/10 bg-white/[0.03] px-4 pb-4 pt-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/45">Counseling Console</p>
            <h1 className="font-display text-2xl text-white">Career Mentor Chat</h1>
          </div>
          {!hasConversationStarted && <p className="text-xs text-white/60">Clear guidance, one step at a time</p>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={toggleVoiceReply}>
            {voiceReplyEnabled ? 'End voice call' : 'Start voice call'}
          </Button>
          <Link href="/chat/start" className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10">
            Intake and rules
          </Link>
          {!hasConversationStarted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings((currentValue) => !currentValue)}
            >
              {showAdvancedSettings ? 'Hide settings' : 'Show settings'}
            </Button>
          )}
          <div className="relative ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowUtilityMenu((currentValue) => !currentValue)}
            >
              More
            </Button>
            {showUtilityMenu && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-white/15 bg-slate-950/95 p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    resetChatSession();
                    setShowUtilityMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/85 hover:bg-white/10"
                >
                  Start fresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedSettings((currentValue) => !currentValue);
                    setShowUtilityMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-white/85 hover:bg-white/10"
                >
                  {showAdvancedSettings ? 'Hide settings' : 'Show settings'}
                </button>
              </div>
            )}
          </div>
        </div>

        {!hasConversationStarted && showAdvancedSettings && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-xs text-white/60">
              Writing style
              <select
                value={scriptPreference}
                onChange={(e) => setScriptPreference(e.target.value as SupportedScriptPreference)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {SCRIPT_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code} className="text-black">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-xs text-white/60">
              Conversation style
              <select
                value={conversationStyle}
                onChange={(e) => setConversationStyle(e.target.value as SupportedConversationStyle)}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                {CONVERSATION_STYLE_OPTIONS.map((style) => (
                  <option key={style.code} value={style.code} className="text-black">
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-xs text-white/60">
              Dream role or target career
              <input
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="Doctor, IAS, Product Designer, Data Analyst..."
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              />
            </label>
          </div>
        )}

        {!hasConversationStarted && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/65">
          <span className="rounded-full border border-white/15 px-2.5 py-1">
            {voiceSupported ? 'Mic ready' : 'Mic unavailable'}
          </span>
          {preferredLanguage === 'auto' && (
            <span className="rounded-full border border-white/15 px-2.5 py-1">
              Language will be confirmed in chat
            </span>
          )}
          {!supabaseConfigured && (
            <span className="rounded-full border border-white/15 px-2.5 py-1">
              Local-only chat mode
            </span>
          )}
          {intakeSubmitted && (
            <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-emerald-100">
              Intake loaded
            </span>
          )}
        </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 sm:px-6">
        {(isListening || isAssistantSpeaking) && !voiceReplyEnabled && (
          <VoiceAgentAvatar
            style={voiceAvatarStyle}
            isListening={isListening}
            isSpeaking={isAssistantSpeaking}
            elapsedSeconds={voiceSessionElapsed}
          />
        )}
        {messages.length === 0 && (
          <div className="space-y-4 py-8">
            <div className="surface-panel-soft interactive-card rounded-2xl p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Structured Counseling Journey</p>
              <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">Clear decisions. Clear next action.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Start with intake, then get a focused recommendation and one practical next step in this session.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/chat/start" className="inline-flex items-center rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-primary-400">
                  Open structured intake
                </Link>
                {intakeSubmitted ? (
                  <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-100">
                    Intake profile loaded
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                    Intake recommended before first session
                  </span>
                )}
              </div>
            </div>

            {intakeSubmitted && (
              <div className="surface-panel-soft interactive-card rounded-2xl p-5">
                <p className="text-sm font-semibold text-white">Start from your loaded profile</p>
                <p className="mt-2 text-sm text-white/70">
                  {studentIntake.studentName?.trim() ? `${studentIntake.studentName.trim()}, ` : ''}
                  your context is loaded{studentIntake.currentStage?.trim() ? ` (${studentIntake.currentStage.trim()})` : ''}. Continue in sequence.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => sendMessage('Please start with a clear introduction and give me a structured first 5-minute guidance plan based on my profile.')}>Start structured session</Button>
                  <Link href="/chat/start" className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10">
                    Refine intake
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        {messages.map((msg) => {
          const { text: msgText, options: msgOptions } = parseMessageContent(msg.content);
          const showOptions =
            msg.id === messages[messages.length - 1]?.id &&
            msg.role === 'assistant' &&
            !loading &&
            msgOptions.length > 0;
          return (
            <div
              key={msg.id}
              className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'interactive-card max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary-500 to-orange-400 text-slate-950 rounded-br-md'
                    : 'surface-panel-soft text-white rounded-bl-md'
                )}
              >
                {msg.role === 'assistant'
                  ? <MarkdownMessage content={msgText} />
                  : msgText}
              </div>
              {showOptions && (
                <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                  {msgOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => sendMessage(option)}
                      className="rounded-full border border-primary-400/50 bg-primary-500/10 px-3 py-1.5 text-xs text-primary-200 hover:bg-primary-500/25 hover:border-primary-400 transition-colors cursor-pointer"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="surface-panel-soft rounded-2xl rounded-bl-md px-4 py-2 text-sm text-white/60 animate-pulse">
              Career Buddy is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-white/10 bg-white/[0.03] p-4 sm:px-6 animate-rise stagger-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300/45 resize-none"
          />
          <Button type="button" variant={isListening ? 'danger' : 'secondary'} size="sm" onClick={toggleListening} disabled={!voiceSupported || loading}>
            {isListening ? 'Stop Mic' : 'Mic'}
          </Button>
          <Button size="sm" onClick={() => sendMessage()} loading={loading}>
            Send
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
