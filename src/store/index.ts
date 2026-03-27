import { create } from 'zustand';
import type { ChatMessage, GameState, TraitScores, CareerMatch, User } from '@/types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  streakMilestones: number[];
  frozenUntil: string | null;
}

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  traitScores: TraitScores | null;
  setTraitScores: (scores: TraitScores | null) => void;
  careerMatches: CareerMatch[];
  setCareerMatches: (matches: CareerMatch[]) => void;
  assessmentComplete: boolean;
  setAssessmentComplete: (complete: boolean) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  streakData: StreakData;
  setStreakData: (data: StreakData) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),
  gameState: null,
  setGameState: (gameState) => set({ gameState }),
  traitScores: null,
  setTraitScores: (traitScores) => set({ traitScores }),
  careerMatches: [],
  setCareerMatches: (careerMatches) => set({ careerMatches }),
  assessmentComplete: false,
  setAssessmentComplete: (assessmentComplete) => set({ assessmentComplete }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    streakMilestones: [7, 30, 90],
    frozenUntil: null,
  },
  setStreakData: (streakData) => set({ streakData }),
  incrementStreak: () =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = state.streakData.lastLoginDate;
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0];

      // If already logged in today, don't increment
      if (lastLogin === today) {
        return state;
      }

      // If logged in yesterday, increment streak
      if (lastLogin === yesterday) {
        const newStreakData = {
          ...state.streakData,
          currentStreak: state.streakData.currentStreak + 1,
          longestStreak: Math.max(
            state.streakData.currentStreak + 1,
            state.streakData.longestStreak
          ),
          lastLoginDate: today,
        };
        return { streakData: newStreakData };
      }

      // Otherwise, reset streak to 1
      return {
        streakData: {
          ...state.streakData,
          currentStreak: 1,
          lastLoginDate: today,
        },
      };
    }),
  resetStreak: () =>
    set({
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
        streakMilestones: [7, 30, 90],
        frozenUntil: null,
      },
    }),
}));
