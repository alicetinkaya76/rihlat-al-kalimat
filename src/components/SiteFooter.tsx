import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useLang } from '@/hooks/useLang';
import { aboutUrl } from '@/router/paths';

import styles from './SiteFooter.module.css';

/**
 * Site-wide alt-chrome (dilim 7/18.ε.A — launch hazırlığı).
 *
 * Üst chrome (TopBar) marka + dil + tema; alt chrome bu site-imzası +
 * "Hakkında" linkidir. Bütün sayfalarda görünür, App.tsx'in kökünde
 * AppRoutes'un altına yerleştirilir. SiteFooter HomePage atlasından
 * sonra, WordPage colophon'undan sonra, NotFound'un altında — her zaman
 * sayfa sonunu mühürler.
 *
 * Dilim 7/15.γ favicon, dilim 7/18.ε alt-imza — chrome'un manuscript
 * disiplini iki ucundan da kapanır.
 *
 * Tasarım: minimal. Tek hat: marka mührü · brand · About link · edition.
 * Renkler --fg-faint düzeyinde — sayfayla rekabet etmez. RTL'de
 * doğal akışla ters yöne dizilir (flex-direction değişmez, dir="rtl"
 * yeter).
 */

const EDITION = '7/18.ε'; // dilim numarası — sayfa altında nazik bir versiyon mührü

export default function SiteFooter() {
  const { t } = useTranslation();
  const { lang } = useLang();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>{t('nav.brand')}</span>
        </span>

        <span className={styles.sep} aria-hidden="true">
          {t('footer.colophonMark')}
        </span>

        <Link to={aboutUrl(lang)} className={styles.link}>
          {t('footer.about')}
        </Link>

        <span className={styles.sep} aria-hidden="true">
          {t('footer.colophonMark')}
        </span>

        <span className={styles.edition}>
          {t('footer.edition')} {EDITION}
        </span>
      </div>
    </footer>
  );
}
