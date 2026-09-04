import type { TaraLanguage } from '@/lib/tara/types';

type TranslationKey =
  | 'home'
  | 'talk'
  | 'explore'
  | 'experience'
  | 'journey'
  | 'next'
  | 'meet_tara'
  | 'demo_mode';

const dictionary: Record<TaraLanguage, Record<TranslationKey, string>> = {
  en: {
    home: 'Home',
    talk: 'Talk',
    explore: 'Explore',
    experience: 'Experience',
    journey: 'Journey',
    next: 'Next',
    meet_tara: 'Meet Tara',
    demo_mode: 'Demo Mode',
  },
  hi: {
    home: 'होम',
    talk: 'बात',
    explore: 'खोज',
    experience: 'अनुभव',
    journey: 'यात्रा',
    next: 'अगला',
    meet_tara: 'तारा से मिलें',
    demo_mode: 'डेमो मोड',
  },
  te: {
    home: 'హోమ్',
    talk: 'మాట్లాడు',
    explore: 'ఎక్స్ప్లోర్',
    experience: 'అనుభవం',
    journey: 'ప్రయాణం',
    next: 'తర్వాత',
    meet_tara: 'తారను కలవండి',
    demo_mode: 'డెమో మోడ్',
  },
};

export function t(language: TaraLanguage, key: TranslationKey) {
  return dictionary[language]?.[key] ?? dictionary.en[key];
}
