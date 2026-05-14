import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import type { Lang } from '@/types/entities';

import styles from './LangSwitch.module.css';

/**
 * 3-konum dil seçici. Aktif dil aria-pressed ile işaretlenir; dil değişimi
 * useLang hook'u üzerinden i18next.changeLanguage'a yönlenir, hook ayrıca
 * <html lang> ve <html dir> atributlarını senkronlar.
 */
export default function LangSwitch() {
  const { t } = useTranslation();
  const { lang, setLang, supportedLangs } = useLang();

  return (
    <div
      className={styles.langSwitch}
      role="group"
      aria-label={t('nav.languageSwitch.label')}
    >
      {supportedLangs.map((code: Lang) => {
        const isActive = lang === code;
        const isArabic = code === 'ar';
        const label = t(`nav.languageSwitch.${code}`);
        return (
          <button
            key={code}
            type="button"
            className={`${styles.button}${isArabic ? ` ${styles.arabicButton}` : ''}`}
            aria-pressed={isActive}
            onClick={() => setLang(code)}
            // Arapça butonu her zaman LTR-bağımsız metin gibi göster (kelime: العربية).
            lang={isArabic ? 'ar' : code}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
