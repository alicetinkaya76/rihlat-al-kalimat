import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

import {
  getTheme,
  getWordSummary,
  getPersonSummary,
  getBookSummary,
} from '@/content/registry';
import { useEntity } from '@/hooks/useEntity';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { entityUrl, homeUrl } from '@/router/paths';
import { pickLang, pickLangArray } from '@/utils/localized';
import { EntityLoading, EntityNotFound } from '@/components/EntityPageStates';
import MiniAtlas from '@/components/LeafletMiniAtlas';
import JsonLd from '@/components/JsonLd';
import { buildThemeJsonLd, buildBreadcrumbJsonLd } from '@/utils/jsonLd';
import type { Theme, Lang } from '@/types/entities';

// Section frame ailesini ve colophon'u WordPage.css'ten paylaş; tema-spesifik
// kuralları (essay typography, drop cap, tier badge, entity grid) ThemePage.css
// getirir. Aynı pattern Person/BookPage'de geçerli (Oturum 4/2 #9 kararı).
import './WordPage.css';
import './ThemePage.css';

/**
 * Tek bir Theme entity'sinin sayfası.
 *
 * URL: `/:lang/tema/:slug`
 *
 * Theme, diğer üç entity'den belirgin biçimde farklı bir sayfa türüdür:
 *   • Stratigrafisi yok — kazı metaforu Theme için anlamlı değil; Theme
 *     ya bir esay (magnum) ya da varlık demeti (cluster).
 *   • Header sade: tier badge + büyük başlık + opsiyonel subtitle.
 *     Person/Book header'larındaki meta-strip yok.
 *   • Ana yapı: tek-kolonlu okuma alanı (max-inline-size: 70ch tipografik
 *     prose) + altında tip-bazlı entity grid'leri (§ Words, § Persons,
 *     § Books) + § Sources + colophon.
 *
 * Section numaralandırması:
 *   § 01 — esay gövdesi (prose body) — bölüm başlığı YOK; o sadece okuma
 *           alanı, başlık-altı doğrudan başlar.
 *           [Karar: numara böylece Words'le başlasın diye essay'e
 *           sectionNum vermedik. Esay zaten başlığın doğal devamı.]
 *   § 01 Words      — varsa
 *   § 02 Persons    — varsa
 *   § 03 Books      — varsa
 *   § 04 Sources    — varsa (language-specific, magnum'da genellikle dolu)
 */
export default function ThemePage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLang();
  const { t } = useTranslation();
  const { entity: theme, status } = useEntity(slug, getTheme);

  // Dilim 7/11.C: sekme başlığı — tema adı locale'e göre.
  const titleForTab = theme ? pickLang(theme.title, lang) : slug;
  usePageTitle(titleForTab);

  if (!slug) return <Navigate to={homeUrl(lang)} replace />;
  if (status === 'loading') return <EntityLoading />;
  if (status === 'not-found' || !theme) return <EntityNotFound slug={slug} />;

  // Numara sıralaması — sadece dolu olan bölümler için artan tek bir
  // sayaç tutar. Boş listeler atlanır, böylece "§ 02 Persons" yerine
  // "§ 01 Persons" görünür eğer Words listesi boşsa.
  const sectionCounter = makeCounter();
  const wordsNum = theme.words.length > 0 ? sectionCounter() : null;
  const personsNum = theme.persons.length > 0 ? sectionCounter() : null;
  const booksNum = theme.books.length > 0 ? sectionCounter() : null;
  const hasSources = pickLangArray(theme.sources, lang).length > 0;
  const sourcesNum = hasSources ? sectionCounter() : null;

  return (
    <main className="theme-main">
      <JsonLd
        data={[
          buildThemeJsonLd(theme, {
            lang,
            pagePath: window.location.pathname,
          }),
          buildBreadcrumbJsonLd([
            { name: t('breadcrumb.home'), path: homeUrl(lang) },
            {
              name: pickLang(theme.title, lang) ?? theme.slug,
              path: window.location.pathname,
            },
          ]),
        ]}
      />
      <ThemeHeader theme={theme} />

      {theme.atlasAnchors && theme.atlasAnchors.length > 0 && (
        <MiniAtlas anchors={theme.atlasAnchors} />
      )}

      <ThemeEssayBody theme={theme} lang={lang} />

      {wordsNum !== null && (
        <ThemeEntitySection
          sectionNum={wordsNum}
          title={t('entities.wordPlural')}
          slugs={theme.words}
          renderItem={(s) => <WordCard slug={s} lang={lang} />}
        />
      )}

      {personsNum !== null && (
        <ThemeEntitySection
          sectionNum={personsNum}
          title={t('entities.personPlural')}
          slugs={theme.persons}
          renderItem={(s) => <PersonCard slug={s} lang={lang} />}
        />
      )}

      {booksNum !== null && (
        <ThemeEntitySection
          sectionNum={booksNum}
          title={t('entities.bookPlural')}
          slugs={theme.books}
          renderItem={(s) => <BookCard slug={s} lang={lang} />}
        />
      )}

      {sourcesNum !== null && <ThemeSources theme={theme} sectionNum={sourcesNum} />}

      <footer>
        <p className="colophon">
          <em>Riḥlat al-Kalimāt</em> <span className="colophon-mark" /> {theme.slug}{' '}
          <span className="colophon-mark" /> {lang}
        </p>
      </footer>
    </main>
  );
}

// ─── Header ────────────────────────────────────────────────────────────

function ThemeHeader({ theme }: { theme: Theme }) {
  const { lang } = useLang();
  const { t } = useTranslation();

  const title = pickLang(theme.title, lang) ?? theme.slug;
  const subtitle = pickLang(theme.subtitle, lang);
  const isArabicTitle = lang === 'ar';

  return (
    <header className="theme-header">
      <span className={`theme-tier-badge theme-tier-${theme.tier}`}>
        {t(`theme.tier.${theme.tier}`)}
      </span>
      <h1
        className="theme-title"
        {...(isArabicTitle ? { lang: 'ar', dir: 'rtl' } : {})}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="theme-subtitle"
          {...(isArabicTitle ? { lang: 'ar', dir: 'rtl' } : {})}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

// ─── Essay body ────────────────────────────────────────────────────────

function ThemeEssayBody({ theme, lang }: { theme: Theme; lang: Lang }) {
  const html = pickLang(theme.body, lang);
  if (!html || html.trim().length === 0) return null;

  // Drop cap'i sadece Latin script'te uygula — Arapça'da bağlantılı
  // harflerle drop cap tipografik olarak çalışmıyor (kürsi-yi bozar).
  const className =
    lang === 'ar'
      ? 'theme-essay theme-essay--ar'
      : `theme-essay theme-essay--latin theme-essay--with-dropcap`;

  return (
    <article
      className={className}
      {...(lang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Entity grid section ──────────────────────────────────────────────

function ThemeEntitySection({
  sectionNum,
  title,
  slugs,
  renderItem,
}: {
  sectionNum: string;
  title: string;
  slugs: string[];
  renderItem: (slug: string) => ReactNode;
}) {
  return (
    <section className="section">
      <header className="section-head">
        <span className="section-num">{sectionNum}</span>
        <h2 className="section-title">{title}</h2>
      </header>
      <ul className="theme-entity-grid">
        {slugs.map((s) => (
          <li key={s}>{renderItem(s)}</li>
        ))}
      </ul>
    </section>
  );
}

// ─── Per-type cards ───────────────────────────────────────────────────
//
// Her kart sadece kendi entity tipinin özet bilgisine erişir;
// getWordSummary / getPersonSummary / getBookSummary ile manifest'ten
// senkron bir küçük objeyi çeker (başlık + literal/transliteration +
// meaning). Tam entity gövdesi (strata + body + crossLinks) kart için
// gereksiz; sayfa ziyaret edildiğinde lazy fetch zaten orada olur.
// Slug korpusta yoksa fallback: slug'ı düz göster ama tıklanmaz kart
// (validator zaten dev console'da uyarıyor; üretimde böyle bir entity
// olmamalı, ama defensive UI iyi şey).

function WordCard({ slug, lang }: { slug: string; lang: Lang }) {
  const w = getWordSummary(slug);
  if (!w) return <DeadCard slug={slug} type="word" />;
  const title = pickLang(w.title, lang) ?? slug;
  const meaning = pickLang(w.literalMeaning, lang);
  return (
    <Link to={entityUrl(lang, 'word', slug)} className="theme-entity-card theme-entity-card--word">
      <div className="theme-entity-card-title">{title}</div>
      {meaning && (
        <div
          className="theme-entity-card-subtitle"
          dangerouslySetInnerHTML={{ __html: stripInlineMd(meaning) }}
        />
      )}
    </Link>
  );
}

function PersonCard({ slug, lang }: { slug: string; lang: Lang }) {
  const p = getPersonSummary(slug);
  if (!p) return <DeadCard slug={slug} type="person" />;
  const titleSrc = lang === 'ar' && p.arabicName ? p.arabicName : p.romanName;
  const subtitle = pickLang(p.trForm, lang) ?? pickLang(p.nisba, lang);
  return (
    <Link
      to={entityUrl(lang, 'person', slug)}
      className="theme-entity-card theme-entity-card--person"
    >
      <div
        className="theme-entity-card-title"
        dangerouslySetInnerHTML={{ __html: stripInlineMd(titleSrc) }}
      />
      {subtitle && (
        <div
          className="theme-entity-card-subtitle"
          dangerouslySetInnerHTML={{ __html: stripInlineMd(subtitle) }}
        />
      )}
    </Link>
  );
}

function BookCard({ slug, lang }: { slug: string; lang: Lang }) {
  const b = getBookSummary(slug);
  if (!b) return <DeadCard slug={slug} type="book" />;
  const translit = pickLang(b.transliteration, lang);
  const meaning = pickLang(b.titleMeaning, lang);
  const titleHtml = translit ? stripInlineMd(translit) : b.fullArabicTitle;
  return (
    <Link
      to={entityUrl(lang, 'book', slug)}
      className="theme-entity-card theme-entity-card--book"
    >
      <div
        className="theme-entity-card-title"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      {meaning && (
        <div
          className="theme-entity-card-subtitle"
          dangerouslySetInnerHTML={{ __html: stripInlineMd(meaning) }}
        />
      )}
    </Link>
  );
}

function DeadCard({ slug, type }: { slug: string; type: string }) {
  // Slug korpusta yok — validator dev console'da uyardı. UI'da sessiz
  // bir gri kart göster, tıklanmaz.
  return (
    <div
      className="theme-entity-card theme-entity-card--dead"
      title={`${type} '${slug}' not in corpus`}
    >
      <div className="theme-entity-card-title">{slug}</div>
      <div className="theme-entity-card-subtitle">—</div>
    </div>
  );
}

// ─── Sources (Theme'in kendi şekli — Localized<string[]>) ─────────────

function ThemeSources({ theme, sectionNum }: { theme: Theme; sectionNum: string }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const list = pickLangArray(theme.sources, lang);
  if (list.length === 0) return null;

  return (
    <section className="section">
      <header className="section-head">
        <span className="section-num">{sectionNum}</span>
        <h2 className="section-title">{t('sections.sources')}</h2>
      </header>
      <ol className="sources-list">
        {list.map((src, i) => {
          const isArabicScript = /[\u0600-\u06FF]/.test(src);
          return (
            <li
              key={i}
              {...(lang === 'ar' && !isArabicScript
                ? { dir: 'ltr' as const, style: { textAlign: 'start' as const } }
                : {})}
              dangerouslySetInnerHTML={{ __html: stripInlineMd(src) }}
            />
          );
        })}
      </ol>
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function stripInlineMd(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}

/** Bölüm numarası sayacı. Boş bölümleri atlamak için: yalnızca
 *  *render edilen* bölümler artırır, böylece sayılar 01, 02, 03… olarak
 *  bitişik kalır. Boş Words listesi varsa Persons § 01 olur. */
function makeCounter() {
  let n = 0;
  return (): string => {
    n += 1;
    return `§ ${n.toString().padStart(2, '0')}`;
  };
}
