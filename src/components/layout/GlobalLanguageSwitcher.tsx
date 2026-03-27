'use client';

import { useEffect, useState } from 'react';
import {
  SUPPORTED_COUNSELING_LANGUAGES,
  getResolvedConversationStyleForLanguage,
  getDefaultScriptPreference,
  type SupportedCounselingLanguage,
  type SupportedConversationStyle,
} from '@/lib/career-agent/prompt';
import {
  CHAT_PREFERENCES_UPDATED_EVENT,
  LOCAL_CHAT_PREFERENCES_KEY,
} from '@/lib/career-agent/storage';

interface ChatPreferences {
  preferredLanguage: SupportedCounselingLanguage;
  conversationStyle: string;
  scriptPreference: string;
  selectedRole: string;
}

export function GlobalLanguageSwitcher() {
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedCounselingLanguage>('en-IN');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(LOCAL_CHAT_PREFERENCES_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<ChatPreferences>;
      if (parsed.preferredLanguage) {
        setPreferredLanguage(parsed.preferredLanguage === 'auto' ? 'en-IN' : parsed.preferredLanguage);
      }
    } catch {
      // Ignore malformed preferences and keep default UI state.
    }
  }, []);

  const handleLanguageChange = (nextLanguage: SupportedCounselingLanguage) => {
    if (typeof window === 'undefined') return;

    setPreferredLanguage(nextLanguage);

    const raw = window.localStorage.getItem(LOCAL_CHAT_PREFERENCES_KEY);
    let existing: Partial<ChatPreferences> = {};

    try {
      existing = raw ? (JSON.parse(raw) as Partial<ChatPreferences>) : {};
    } catch {
      existing = {};
    }

    const nextScriptPreference =
      !existing.scriptPreference || existing.scriptPreference === 'auto'
        ? getDefaultScriptPreference(nextLanguage)
        : existing.scriptPreference;

    const nextConversationStyle =
      getResolvedConversationStyleForLanguage(
        nextLanguage,
        existing.conversationStyle as SupportedConversationStyle | undefined
      );

    const nextPreferences: ChatPreferences = {
      preferredLanguage: nextLanguage,
      conversationStyle: nextConversationStyle,
      scriptPreference: nextScriptPreference,
      selectedRole: existing.selectedRole ?? '',
    };

    window.localStorage.setItem(LOCAL_CHAT_PREFERENCES_KEY, JSON.stringify(nextPreferences));
    window.dispatchEvent(new CustomEvent(CHAT_PREFERENCES_UPDATED_EVENT));
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/80 backdrop-blur">
      <span className="text-white/55">Language</span>
      <select
        value={preferredLanguage}
        onChange={(event) => handleLanguageChange(event.target.value as SupportedCounselingLanguage)}
        className="rounded-lg border border-white/20 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-300/45"
        aria-label="Global preferred language"
      >
        {SUPPORTED_COUNSELING_LANGUAGES.filter((language) => language.code !== 'auto').map((language) => (
          <option key={language.code} value={language.code} className="text-black">
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}
