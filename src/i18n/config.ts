import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storage } from '@/lib/storage';

import en from './locales/en.json';
import es from './locales/es.json';

const LANGUAGE_KEY = 'bookswap_language';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function getStoredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const stored = await storage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // storage may fail
  }
  return null;
}

export async function setStoredLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    await storage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore
  }
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
