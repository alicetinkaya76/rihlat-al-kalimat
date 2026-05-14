import { useEffect } from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { isLang } from './paths';
import { isRtl } from '@/i18n/config';

/**
 * Lang-prefixed rotaların üstünde duran wrapper.
 *
 * Görev:
 *  • URL'deki `:lang` param'ını oku
 *  • Geçersizse (`tr|en|ar` değilse) `/` → LangAwareRedirect'e gönder
 *  • i18n'i URL ile senkronla (URL = source of truth)
 *  • <html lang> ve <html dir> atributlarını URL paramından set et
 *
 * Burada useLang KULLANILMIYOR — useLang i18n okur, biz tam tersi yönde
 * (URL → i18n) gidiyoruz. Aksi halde döngü riski var.
 */
export default function LangScope() {
  const { lang: urlLang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isLang(urlLang)) return;
    if (i18n.language !== urlLang) {
      void i18n.changeLanguage(urlLang);
    }
    document.documentElement.setAttribute('lang', urlLang);
    document.documentElement.setAttribute('dir', isRtl(urlLang) ? 'rtl' : 'ltr');
  }, [urlLang, i18n]);

  if (!isLang(urlLang)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
