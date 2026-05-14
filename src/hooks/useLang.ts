import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  isRtl,
  normalizeLang,
  SUPPORTED_LANGS,
} from '@/i18n/config';
import { swapLangInPath } from '@/router/paths';
import type { Lang } from '@/types/entities';

/**
 * Aktif dili okur ve değiştirme fonksiyonu döner.
 *
 * Önemli: URL = source of truth. setLang(next) mevcut URL'in :lang
 * segment'ini değiştirip oraya navigate eder. URL değiştiğinde LangScope
 * wrapper'ı i18n'i otomatik senkronlar (tek yön: URL → i18n).
 *
 * Bu hook bir <Router> alt-ağacında olmak ZORUNDA — useLocation ve
 * useNavigate buna ihtiyaç duyar. main.tsx'te BrowserRouter en üstte.
 */
export function useLang(): {
  lang: Lang;
  isRtl: boolean;
  setLang: (next: Lang) => void;
  supportedLangs: readonly Lang[];
} {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const lang: Lang = normalizeLang(i18n.resolvedLanguage ?? i18n.language);

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      const targetPath = swapLangInPath(location.pathname, next);
      navigate(targetPath + location.search + location.hash);
    },
    [lang, location, navigate]
  );

  return {
    lang,
    isRtl: isRtl(lang),
    setLang,
    supportedLangs: SUPPORTED_LANGS,
  };
}
