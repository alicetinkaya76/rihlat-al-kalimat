import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

import styles from './ThemeToggle.module.css';

/** Güneş ikonu (light tema aktifken görünür — "tıklarsan dark olur") */
function SunIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
      <circle cx={12} cy={12} r={4} />
    </svg>
  );
}

/** Ay ikonu (dark tema aktifken görünür — "tıklarsan light olur") */
function MoonIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/**
 * Light/dark tema değiştirici. Görünen ikon, BİR SONRAKİ duruma değil ŞU
 * ANKİ duruma karşılık gelir — sun = light, moon = dark. Buton tıklandıkça
 * tema flip eder (useTheme hook'u DOM ve storage'ı senkronlar).
 */
export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const ariaLabel =
    theme === 'dark'
      ? t('nav.toggleThemeToLight')
      : t('nav.toggleThemeToDark');

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
