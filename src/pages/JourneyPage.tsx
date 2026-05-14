import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getJourney, getWordsByJourney } from '@/content/registry';
import { JOURNEY_TYPES } from '@/types/entities';
import type { JourneyType } from '@/types/entities';
import { useEntity } from '@/hooks/useEntity';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { homeUrl, journeysUrl, entityUrl } from '@/router/paths';
import { pickLang, pickLangArray } from '@/utils/localized';
import { EntityLoading, EntityNotFound } from '@/components/EntityPageStates';

import './JourneyPage.css';

/**
 * /:lang/yolculuk/:type — tek bir yolculuk arketipi sayfası.
 *
 * DİLİM 7/35 (Shape ο): MDX-tabanlı yapıya geçildi. Önce sadece
 * i18n bundle'da subtitle stub'u vardı (dilim 7/7.A'da kondu,
 * editorialNote "bu sayfa MDX-tabanlı bir yapıya geçer" vaadiyle).
 * Şimdi her arketip /content/journeys/<slug>.mdx dosyasından gelen
 * tam essay + sources + subtitle taşır; i18n yalnız navigasyon
 * label'ı (`journeys.<type>`) verir.
 *
 * Kompozisyon:
 *  - Breadcrumb (← Bütün yolculuklar)
 *  - Header: tier mark ◆ + başlık (MDX) + subtitle (MDX)
 *  - Essay body — prose, drop-cap, ThemePage estetiğiyle simetrik
 *  - Words listesi — manifest reverse-index'ten
 *  - Sources — dile göre
 *  - Footer colophon
 */
export default function JourneyPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const { type } = useParams<{ type: string }>();

  // URL param güvenliği: enum'a uymayan değer → /:lang. JOURNEY_TYPES
  // tuple'ı `as const` — `includes` için `readonly string[]` cast'i gerek.
  const isValidType =
    type !== undefined && (JOURNEY_TYPES as readonly string[]).includes(type);

  // Hook'un erken-return'den önce çağrılması zorunlu (React rules of hooks).
  // Geçersiz tip ise slug'ı undefined geçer, hook 'not-found' döner;
  // ama daha temiz akış için aşağıdaki redirect'i tercih ediyoruz.
  const journeyType = isValidType ? (type as JourneyType) : undefined;
  const { entity: journey, status } = useEntity(journeyType, getJourney);

  // Sekme başlığı — MDX'ten gelirse onu kullan, fallback i18n label.
  const titleForTab = journey
    ? pickLang(journey.title, lang)
    : isValidType
      ? t(`journeys.${journeyType}`)
      : '';
  usePageTitle(titleForTab);

  if (!isValidType) {
    return <Navigate to={homeUrl(lang)} replace />;
  }
  if (status === 'loading') return <EntityLoading />;
  if (status === 'not-found' || !journey) {
    return <EntityNotFound slug={journeyType ?? ''} />;
  }

  const words = getWordsByJourney(journey.slug);
  const title = pickLang(journey.title, lang) ?? t(`journeys.${journey.slug}`);
  const subtitle = pickLang(journey.subtitle, lang) ?? '';
  const bodyHtml = pickLang(journey.body, lang);
  const sources = pickLangArray(journey.sources, lang);

  return (
    <main className="journey-page">
      <header className="journey-head">
        <nav className="journey-nav" aria-label="breadcrumb">
          <Link to={journeysUrl(lang)} className="journey-back">
            ← {t('journeys.indexBack')}
          </Link>
        </nav>
        <div className="journey-mark" aria-hidden="true">
          ◆
        </div>
        <h1 className="journey-title">{title}</h1>
        {subtitle && <p className="journey-subtitle">{subtitle}</p>}
      </header>

      <JourneyEssayBody bodyHtml={bodyHtml} lang={lang} />

      <section className="journey-words">
        <header className="journey-words-head">
          <h2 className="journey-words-title">{t('entities.wordPlural')}</h2>
          <span className="journey-words-count">
            {words.length === 0
              ? t('journeys.empty')
              : t('journeys.wordCount', { count: words.length })}
          </span>
        </header>

        {words.length === 0 ? (
          <p className="journey-empty-note">{t('journeys.emptyNote')}</p>
        ) : (
          <ul className="journey-words-list">
            {words.map((w) => {
              const wTitle = pickLang(w.title, lang) ?? w.slug;
              const meaning = pickLang(w.literalMeaning, lang);
              return (
                <li key={w.slug} className="journey-word-item">
                  <Link to={entityUrl(lang, 'word', w.slug)} className="journey-word-card">
                    <div className="journey-word-title">{wTitle}</div>
                    {meaning && (
                      <div
                        className="journey-word-subtitle"
                        dangerouslySetInnerHTML={{
                          __html: meaning.replace(/\*([^*]+?)\*/g, '<em>$1</em>'),
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {sources.length > 0 && (
        <section className="journey-sources">
          <h2 className="journey-sources-title">{t('common.sources')}</h2>
          <ol className="journey-sources-list">
            {sources.map((s, i) => (
              <li
                key={i}
                className="journey-sources-item"
                dangerouslySetInnerHTML={{
                  __html: s
                    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
                    .replace(/"([^"]+)"/g, '“$1”'),
                }}
              />
            ))}
          </ol>
        </section>
      )}

      <footer className="journey-foot">
        <p className="journey-foot-note">{t('journeys.colophon')}</p>
      </footer>
    </main>
  );
}

// ─── Essay body ────────────────────────────────────────────────────────

function JourneyEssayBody({
  bodyHtml,
  lang,
}: {
  bodyHtml: string | undefined;
  lang: 'tr' | 'en' | 'ar';
}) {
  if (!bodyHtml || bodyHtml.trim().length === 0) return null;

  // Drop cap'i sadece Latin script'te uygula — ThemePage ile aynı disiplin.
  const className =
    lang === 'ar'
      ? 'journey-essay journey-essay--ar'
      : 'journey-essay journey-essay--latin journey-essay--with-dropcap';

  return (
    <article
      className={className}
      {...(lang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
