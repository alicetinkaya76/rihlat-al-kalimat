/**
 * Anasayfa — Riḥlat al-Kalimāt (dilim 7/44.τ-prime).
 *
 * Atlas-merkezli yeniden kompozisyon. Eski layout (hero + atlas + 7-pill +
 * 4-sütun directory grid) atlas'ın hakkını yemiyordu — sayfa 4 farklı odakla
 * dağınıktı. Bu refactor:
 *
 *   1. Hero — minimum (brand + tagline)
 *   2. AtlasFilters + LeafletAtlas — sayfanın ana keşif aracı, üst yerleşim,
 *      arama + archetype chip filter + URL state ile deep-link uyumlu
 *   3. Showcase kelimeler grid — sadece tier='showcase' (~13 kelime), atlas'la
 *      birlikte gezinmek için derin entry-point'ler
 *   4. Compact directory strip — "32 kelime · 11 kişi · 7 kitap · 6 tema ·
 *      7 yolculuk" tek satır, her sayı catalogue route link. Eski 4-sütun
 *      grid'in yerini alır: sade, atlas'a baskın olmaz.
 *
 * URL state: ?word=X / ?journey=Y query param'larıyla AtlasFilters çalışır.
 * Deep-link paylaşım: /tr?word=coffee → coffee'nin atlasAnchors'ı highlighted,
 * diğer marker'lar dimmed.
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';

import LeafletAtlas from '@/components/LeafletAtlas';
import AtlasFilters, { type AtlasFiltersState } from '@/components/AtlasFilters';
import JsonLd from '@/components/JsonLd';

import {
  listBooks,
  listJourneyCounts,
  listPersons,
  listThemes,
  listWords,
} from '@/content/registry';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  entityUrl,
  journeysUrl,
  wordsListUrl,
  personsListUrl,
  booksListUrl,
} from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { buildWebSiteJsonLd } from '@/utils/jsonLd';

import './HomePage.css';

const EMPTY_FILTER: AtlasFiltersState = {
  highlightedPlaces: new Set(),
  highlightedEntitySlugs: new Set(),
  activeWordQuery: '',
  activeJourney: null,
};

export default function HomePage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  usePageTitle('');

  // Filter state — AtlasFilters'tan yukarıya kalkar; LeafletAtlas'a iner.
  const [filterState, setFilterState] = useState<AtlasFiltersState>(EMPTY_FILTER);
  const handleFilterChange = useCallback((state: AtlasFiltersState) => {
    setFilterState(state);
  }, []);

  const words = listWords();
  const persons = listPersons();
  const books = listBooks();
  const themes = listThemes();
  const journeys = listJourneyCounts();

  // Showcase kelimeler — atlas'la birlikte alt-odak: derin keşif girişleri.
  const showcaseWords = words.filter((w) => w.tier === 'showcase');

  return (
    <main className="home-main">
      <JsonLd
        data={buildWebSiteJsonLd({
          lang,
          pagePath: window.location.pathname,
        })}
      />

      {/* ── 1. HERO — brand + tagline ───────────────────────────────── */}
      <header className="home-header">
        <h1 className="home-brand">
          {t('nav.brand')}{' '}
          <span className="home-brand-sep">·</span>{' '}
          <span lang="ar" dir="rtl" className="home-brand-arabic">
            {t('nav.brandArabic')}
          </span>
        </h1>
        <p className="home-tagline">
          {lang === 'tr' &&
            'Türkçe — İngilizce — Arapça etimolojik bilgi grafı. Kelime, kişi, kitap, tema; her biri kendi tarihsel sediment\'inde.'}
          {lang === 'en' &&
            'A trilingual etymological knowledge graph. Word, person, book, theme — each one read down through its own historical strata.'}
          {lang === 'ar' &&
            'مَعجمُ اشتقاقاتٍ ثلاثيُّ اللغة (التركيّة والإنجليزيّة والعربيّة). كلمةٌ، وشخصٌ، وكتابٌ، وموضوعٌ — كلٌّ منها مَقروءٌ في طبقاتِه التاريخيّة.'}
        </p>
      </header>

      {/* ── 2. ATLAS — sayfanın ana keşif aracı ────────────────────── */}
      <section className="home-atlas-section" aria-labelledby="home-atlas-head">
        <header className="home-atlas-head">
          <h2 id="home-atlas-head" className="home-atlas-title">
            {lang === 'tr' && 'Atlas — kelimelerin coğrafi yolculuğu'}
            {lang === 'en' && 'Atlas — the geography of words'}
            {lang === 'ar' && 'الأطلس — جغرافيا الكَلِمات'}
          </h2>
          <p className="home-atlas-intro">
            {lang === 'tr' &&
              'Bir kelime ara veya bir arketip seç — atlas pin\'leri yolculuğu izler. Pin\'e tıklayınca o yerde geçen tüm kelime/kişi/kitap/temalar açılır.'}
            {lang === 'en' &&
              'Search a word or pick an archetype — the atlas pins follow the journey. Click a pin to see all words, persons, books, and themes at that place.'}
            {lang === 'ar' &&
              'ابحَث كَلِمةً أو اختَر نَمَطَ رِحلةٍ — تَتَّبِعُ علاماتُ الأطلسِ المَسار. انقُر علامةً لِتَرى كلَّ الكَلِمات والأشخاص والكُتُب والمَوضوعات في ذلكَ المَكان.'}
          </p>
        </header>

        <AtlasFilters onStateChange={handleFilterChange} />

        <LeafletAtlas
          highlightedPlaces={filterState.highlightedPlaces}
          highlightedEntitySlugs={filterState.highlightedEntitySlugs}
        />
      </section>

      {/* ── 3. SHOWCASE KELIMELER — derin keşif girişleri ──────────── */}
      <section className="home-showcase" aria-labelledby="home-showcase-head">
        <header className="home-showcase-head">
          <h2 id="home-showcase-head" className="home-showcase-title">
            {lang === 'tr' && 'Öne çıkan kelimeler'}
            {lang === 'en' && 'Showcase words'}
            {lang === 'ar' && 'كَلِماتٌ مُختارَة'}
          </h2>
          <span className="home-showcase-subtitle">
            {lang === 'tr' &&
              `${showcaseWords.length} kelime · stratigrafik kazı — beş katmanın hepsi`}
            {lang === 'en' &&
              `${showcaseWords.length} words · stratigraphic dig — all five strata`}
            {lang === 'ar' &&
              `${showcaseWords.length} كَلِمة · حَفرٌ طَبَقيّ — كلُّ الطبَقاتِ الخَمس`}
          </span>
        </header>
        <ul className="home-showcase-grid">
          {showcaseWords.map((w) => {
            const title = pickLang(w.title, lang) ?? w.slug;
            const meaning = pickLang(w.literalMeaning, lang);
            const titleStyle: CSSProperties = {
              fontFamily: 'var(--display)',
              fontSize: 'var(--fs-lg)',
              fontWeight: 400,
            };
            return (
              <li key={w.slug}>
                <Link
                  to={entityUrl(lang, 'word', w.slug)}
                  className="home-showcase-card"
                >
                  {w.journey_type && (
                    <span className="home-showcase-card-journey">
                      <span aria-hidden="true">◆</span>{' '}
                      <span>{t(`journeys.${w.journey_type}`)}</span>
                    </span>
                  )}
                  <div className="home-showcase-card-title" style={titleStyle}>
                    {title}
                  </div>
                  {meaning && (
                    <div
                      className="home-showcase-card-meaning"
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
      </section>

      {/* ── 4. COMPACT DIRECTORY STRIP — sade nav-bar ──────────────── */}
      <section
        className="home-directory-strip"
        aria-labelledby="home-directory-head"
      >
        <h2 id="home-directory-head" className="home-directory-head">
          {lang === 'tr' && 'Tüm korpus'}
          {lang === 'en' && 'The full corpus'}
          {lang === 'ar' && 'كاملُ المُدَوَّنة'}
        </h2>
        <ul className="home-directory-counts">
          <li>
            <Link to={wordsListUrl(lang)} className="home-directory-counts-link">
              <span className="home-directory-counts-num">{words.length}</span>{' '}
              <span className="home-directory-counts-label">
                {t('entities.wordPlural')}
              </span>
            </Link>
          </li>
          <li>
            <Link
              to={personsListUrl(lang)}
              className="home-directory-counts-link"
            >
              <span className="home-directory-counts-num">{persons.length}</span>{' '}
              <span className="home-directory-counts-label">
                {t('entities.personPlural')}
              </span>
            </Link>
          </li>
          <li>
            <Link to={booksListUrl(lang)} className="home-directory-counts-link">
              <span className="home-directory-counts-num">{books.length}</span>{' '}
              <span className="home-directory-counts-label">
                {t('entities.bookPlural')}
              </span>
            </Link>
          </li>
          <li>
            <span className="home-directory-counts-link home-directory-counts-link--nolink">
              <span className="home-directory-counts-num">{themes.length}</span>{' '}
              <span className="home-directory-counts-label">
                {t('entities.themePlural')}
              </span>
            </span>
          </li>
          <li>
            <Link to={journeysUrl(lang)} className="home-directory-counts-link">
              <span className="home-directory-counts-num">{journeys.length}</span>{' '}
              <span className="home-directory-counts-label">
                {t('journeys.indexTitle')}
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
