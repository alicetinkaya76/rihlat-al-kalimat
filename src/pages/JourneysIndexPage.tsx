import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { listJourneyCounts } from '@/content/registry';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { homeUrl, journeyTypeUrl } from '@/router/paths';
import type { JourneyType } from '@/types/entities';

import './JourneysIndexPage.css';

/**
 * /:lang/yolculuk — 7 yolculuk arketipinin (§4.5 GRAND_PLAN) dizin sayfası.
 *
 * Dilim 7/7.A'da tanıtıldı. Her arketip için:
 *  - i18n adı (journeys.<type>)
 *  - i18n alt-açıklaması (journeys.subtitle.<type>) — kısa tanımlama
 *  - bu arketibe ait Word sayısı (manifest'ten reverse-index)
 *  - JourneyPage'e link
 *
 * Tasarım kararı: bu sayfa **dizin**, **mini-essay değil**. Her arketip
 * kendi içinde detayını JourneyPage'e bırakır. Tam essay (§4.5'teki
 * "mini-essay") sonraki editöryel dilim için açıkta — i18n bundle
 * yerine `content/journeys/{type}.mdx` formatına geçecek; o zaman
 * parseJourney + manifest entry + reverse-index gerekir. Şu an
 * sınırlı: subtitle düz string, body yok. Schema-hafif.
 *
 * Görsel sicil: ThemePage'in tier-grid'iyle benzer kompozisyon — 7
 * arketip kartı, her biri arketip rengi (şu an hepsi moss; JourneyBadge
 * paterni). Sayı boş olan arketipler (henüz Word'ü olmayan: crusader,
 * astronomer, diplomatic) "henüz örneksiz" notuyla görünür — sayfayı
 * "tamamlanmamış" değil "büyümekte olan" gösterir.
 */
export default function JourneysIndexPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const journeys = listJourneyCounts();
  // Dilim 7/11.C: sekme — "Yolculuk arketipleri · Riḥlat al-Kalimāt"
  usePageTitle(t('journeys.indexTitle'));

  return (
    <main className="journeys-index">
      <header className="journeys-index-head">
        <nav className="journeys-index-nav" aria-label="breadcrumb">
          <Link to={homeUrl(lang)} className="journeys-index-back">
            ← {t('common.back')}
          </Link>
        </nav>
        <h1 className="journeys-index-title">{t('journeys.indexTitle')}</h1>
        <p className="journeys-index-subtitle">{t('journeys.indexSubtitle')}</p>
      </header>

      <ul className="journeys-index-list">
        {journeys.map(({ type, count }) => {
          const label = t(`journeys.${type}`);
          const subtitle = t(`journeys.subtitle.${type}`);
          const isEmpty = count === 0;
          return (
            <li key={type} className="journeys-index-item">
              <Link
                to={journeyTypeUrl(lang, type)}
                className={`journeys-index-card${isEmpty ? ' journeys-index-card--empty' : ''}`}
                aria-label={`${label} (${count})`}
              >
                <header className="journeys-index-card-head">
                  <span className="journeys-index-card-mark" aria-hidden="true">
                    ◆
                  </span>
                  <h2 className="journeys-index-card-title">{label}</h2>
                  <span className="journeys-index-card-count">
                    {isEmpty ? t('journeys.empty') : t('journeys.wordCount', { count })}
                  </span>
                </header>
                <p className="journeys-index-card-subtitle">{subtitle}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="journeys-index-foot">
        <p className="journeys-index-note">{t('journeys.editorialNote')}</p>
      </footer>
    </main>
  );
}

// type re-export so AppRoutes doesn't need to know the union — kept
// for future when JourneyType becomes part of the URL param validation.
export type { JourneyType };
