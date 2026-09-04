'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ConfidenceLevel,
  EvidenceRecord,
  ExperienceAttempt,
  HypothesisRecord,
  JourneyEvent,
  NextAction,
  ReflectionRecord,
  TaraMemory,
  TaraMessage,
  TaraMoment,
  TaraProfile,
} from '@/lib/tara/types';
import { createId, createInitialAssistantMessage, nowIso } from '@/lib/tara/model';

interface TaraState {
  profile: TaraProfile;
  messages: TaraMessage[];
  memories: TaraMemory[];
  evidence: EvidenceRecord[];
  hypotheses: HypothesisRecord[];
  reflections: ReflectionRecord[];
  journey: JourneyEvent[];
  nextActions: NextAction[];
  activeAttempt: ExperienceAttempt | null;
  taraMoments: TaraMoment[];
  hasCompletedOnboarding: boolean;
  setProfile: (patch: Partial<TaraProfile>) => void;
  markOnboardingComplete: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => TaraMessage;
  ensureStarterMessage: () => void;
  upsertMemory: (input: {
    category: TaraMemory['category'];
    key: string;
    value: string;
    confidence?: ConfidenceLevel;
    source?: TaraMemory['source'];
  }) => void;
  updateMemory: (memoryId: string, value: string) => void;
  deleteMemory: (memoryId: string) => void;
  addEvidence: (record: EvidenceRecord) => void;
  addHypothesis: (record: HypothesisRecord) => void;
  addReflection: (record: ReflectionRecord) => void;
  addJourneyEvents: (records: JourneyEvent[]) => void;
  addNextAction: (record: NextAction) => void;
  updateNextAction: (actionId: string, patch: Partial<NextAction>) => void;
  setActiveAttempt: (attempt: ExperienceAttempt | null) => void;
  addTaraMoment: (moment: TaraMoment) => void;
  resetDemo: () => void;
}

const defaultProfile: TaraProfile = {
  name: 'Friend',
  lifeStage: 'unspecified',
  language: 'en',
};

function createStarterJourney(): JourneyEvent[] {
  return [
    {
      id: createId('journey'),
      type: 'conversation',
      title: 'Started Tara journey',
      description: 'Opened Tara and entered the first conversation cycle.',
      date: nowIso(),
    },
  ];
}

export const useTaraStore = create<TaraState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      messages: [createInitialAssistantMessage()],
      memories: [
        {
          id: createId('memory'),
          category: 'goal',
          key: 'clarity_goal',
          value: 'Find a direction through evidence, not pressure.',
          confidence: 'early-signal',
          source: 'conversation',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      ],
      evidence: [],
      hypotheses: [],
      reflections: [],
      journey: createStarterJourney(),
      nextActions: [],
      activeAttempt: null,
      taraMoments: [],
      hasCompletedOnboarding: false,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      markOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      addMessage: (role, content) => {
        const message: TaraMessage = {
          id: createId('msg'),
          role,
          content,
          createdAt: nowIso(),
        };
        set((state) => ({ messages: [...state.messages, message] }));
        return message;
      },
      ensureStarterMessage: () => {
        if (get().messages.length) return;
        set({ messages: [createInitialAssistantMessage()] });
      },
      upsertMemory: ({ category, key, value, confidence = 'early-signal', source = 'manual' }) => {
        set((state) => {
          const existing = state.memories.find((memory) => memory.key === key && memory.category === category);
          if (existing) {
            return {
              memories: state.memories.map((memory) =>
                memory.id === existing.id
                  ? { ...memory, value, confidence, source, updatedAt: nowIso() }
                  : memory
              ),
            };
          }

          return {
            memories: [
              ...state.memories,
              {
                id: createId('memory'),
                category,
                key,
                value,
                confidence,
                source,
                createdAt: nowIso(),
                updatedAt: nowIso(),
              },
            ],
          };
        });
      },
      updateMemory: (memoryId, value) => {
        set((state) => ({
          memories: state.memories.map((memory) =>
            memory.id === memoryId ? { ...memory, value, updatedAt: nowIso(), source: 'manual' } : memory
          ),
        }));
      },
      deleteMemory: (memoryId) =>
        set((state) => ({ memories: state.memories.filter((memory) => memory.id !== memoryId) })),
      addEvidence: (record) => set((state) => ({ evidence: [record, ...state.evidence] })),
      addHypothesis: (record) =>
        set((state) => {
          const existing = state.hypotheses.find((hypothesis) =>
            hypothesis.title.toLowerCase() === record.title.toLowerCase()
          );

          if (existing) {
            return {
              hypotheses: state.hypotheses.map((hypothesis) =>
                hypothesis.id === existing.id
                  ? {
                      ...hypothesis,
                      evidenceIds: Array.from(new Set([...hypothesis.evidenceIds, ...record.evidenceIds])),
                      confidence: record.confidence,
                      unknown: record.unknown,
                      nextTest: record.nextTest,
                      updatedAt: nowIso(),
                    }
                  : hypothesis
              ),
            };
          }

          return { hypotheses: [record, ...state.hypotheses] };
        }),
      addReflection: (record) => set((state) => ({ reflections: [record, ...state.reflections] })),
      addJourneyEvents: (records) => set((state) => ({ journey: [...records, ...state.journey] })),
      addNextAction: (record) => set((state) => ({ nextActions: [record, ...state.nextActions] })),
      updateNextAction: (actionId, patch) =>
        set((state) => ({
          nextActions: state.nextActions.map((action) =>
            action.id === actionId ? { ...action, ...patch, updatedAt: nowIso() } : action
          ),
        })),
      setActiveAttempt: (attempt) => set({ activeAttempt: attempt }),
      addTaraMoment: (moment) => set((state) => ({ taraMoments: [moment, ...state.taraMoments] })),
      resetDemo: () =>
        set({
          profile: defaultProfile,
          messages: [createInitialAssistantMessage()],
          memories: [],
          evidence: [],
          hypotheses: [],
          reflections: [],
          journey: createStarterJourney(),
          nextActions: [],
          activeAttempt: null,
          taraMoments: [],
          hasCompletedOnboarding: false,
        }),
    }),
    {
      name: 'tara-core-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        messages: state.messages,
        memories: state.memories,
        evidence: state.evidence,
        hypotheses: state.hypotheses,
        reflections: state.reflections,
        journey: state.journey,
        nextActions: state.nextActions,
        activeAttempt: state.activeAttempt,
        taraMoments: state.taraMoments,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
