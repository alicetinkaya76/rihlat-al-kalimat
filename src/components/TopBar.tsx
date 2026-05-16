import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import LangSwitch from './LangSwitch';
import ShareButton from './ShareButton';
import ThemeToggle from './ThemeToggle';
import styles from './TopBar.module.css';

interface TopBarProps {
  /**
   * Brand-link hedefi override edilebilir (test/preview için). Atlanırsa
   * mevcut dil-prefix'i kullanılır: kullanıcı `/tr/words/kiosk`'taysa
   * `/tr`'ye, `/en/...`'taysa `/en`'e döner. Vite `BASE_URL` prefix'i
   * (production'da `/rihlat-al-kalimat/`) BrowserRouter'ın `basename`'i
   * üzerinden otomatik eklenir.
   */
  homeHref?: string;
}

/**
 * Sticky chrome — projedeki tüm sayfaların başında yer alır.
 * Brand-link React Router `<Link>` ile SPA-navigation yapar; tam-sayfa
 * reload tetiklemez ve `BASE_URL` prefix'ini doğru ekler.
 */
export default function TopBar({ homeHref }: TopBarProps) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const target = homeHref ?? `/${lang}`;

  return (
    <header className={styles.topbar}>
      <Link
        to={target}
        className={styles.brand}
        aria-label={`${t('nav.brand')} — ${t('nav.home')}`}
      >
        <span className={styles.brandMark} aria-hidden="true" />
        <span>{t('nav.brand')}</span>
        <span className={styles.brandSeparator} aria-hidden="true">
          ·
        </span>
        <span className={styles.brandArabic} lang="ar" dir="rtl">
          {t('nav.brandArabic')}
        </span>
      </Link>

      <div className={styles.controls}>
        <LangSwitch />
        <ShareButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
