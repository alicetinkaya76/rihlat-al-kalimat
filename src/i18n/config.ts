import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import tr from './locales/tr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

import type { Lang } from '@/types/entities';

export const SUPPORTED_LANGS: Lang[] = ['tr', 'en', 'ar'];
export const DEFAULT_LANG: Lang = 'tr';

/** UI chrome çevirisi — *içerik* burada değil, MDX/data'da yaşar. */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS,
    interpolation: {
      escapeValue: false, // React zaten escape ediyor.
    },
    detection: {
      // Önce kullanıcının kayıtlı tercihi, sonra tarayıcı.
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'rihla-lang',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

/** Bir dilin RTL olup olmadığını söyler. */
export function isRtl(lang: string): boolean {
  return lang === 'ar';
}

/** Tarayıcıda algılanan dilin desteklenenler içinde olup olmadığını kontrol et. */
export function normalizeLang(lang: string | undefined | null): Lang {
  if (!lang) return DEFAULT_LANG;
  const base = lang.toLowerCase().split('-')[0] as Lang;
  return SUPPORTED_LANGS.includes(base) ? base : DEFAULT_LANG;
}

export default i18n;
