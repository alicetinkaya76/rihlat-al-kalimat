import { useTranslation } from 'react-i18next';

import LangSwitch from './LangSwitch';
import ShareButton from './ShareButton';
import ThemeToggle from './ThemeToggle';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** İleride router takılınca brand link hedefi değişebilir. */
  homeHref?: string;
}

/**
 * Sticky chrome — projedeki tüm sayfaların başında yer alır.
 * İçerik kararı sade tutuldu: marka + dil + tema. Routing'e bağlı menü
 * (kelimeler/kişiler/kitaplar/temalar) sonraki oturumda eklenecek.
 */
export default function TopBar({ homeHref = '/' }: TopBarProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.topbar}>
      <a
        href={homeHref}
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
      </a>

      <div className={styles.controls}>
        <LangSwitch />
        <ShareButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
