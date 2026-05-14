import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { listBooks } from '@/content/registry';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { ToolbarButton } from '@/components/ToolbarButton';
import { parseYearStart } from '@/utils/year';
import type { BookSummary } from '@/types/entities';

import './EntityListPage.css';

/**
 * Books Catalogue listing page (dilim 7/16.δ.A).
 *
 * URL: `/:lang/kitaplar` — `personsListUrl` ile aynı simetri. Persons
 * sayfasının Book uyarlaması; fark:
 *
 *   • Sort modes: alfabetik / yazılış tarihi / atlas rotası
 *   • Subtitle: titleMeaning (kitap adının anlamı; HomePage Directory
 *     Books sütunundaki ile aynı)
 *   • Title kaynağı: lang === 'ar' ise fullArabicTitle (markup'sız),
 *     diğer dillerde transliteration (*italic* taşıyabilir) →
 *     stripInlineMarkdown
 *   • Yıl rozeti: composedYear (Person'daki lifespan'in karşılığı)
 *
 * BookSummary.composedYear PersonSummary.lifespan ile birlikte dilim
 * 7/16'da manifest'e eklendi; parseYearStart üzerinden kronolojik
 * sıralama yapar.
 */
export default function BooksListPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  usePageTitle(t('entities.bookPlural'));

  const books = useMemo(() => listBooks(), []);
  const filteredBooks = useMemo(
    () => (tierFilter === 'all' ? books : books.filter((b) => b.tier === tierFilter)),
    [books, tierFilter]
  );
  const sortedBooks = useMemo(
    () => sortBooks(filteredBooks, sortMode, lang),
    [filteredBooks, sortMode, lang]
  );

  const isRtl = lang === 'ar';

  return (
    <main className="entitylist-main" lang={lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="entitylist-header">
        <h1 className="entitylist-title">{t('entities.bookPlural')}</h1>
        <p className="entitylist-subtitle">
          {t('booksList.subtitle')}{' '}
          <span className="entitylist-count">
            —{' '}
            {tierFilter === 'all'
              ? t('booksList.count', { count: books.length })
              : t('booksList.countFiltered', {
                  shown: filteredBooks.length,
                  total: books.length,
                })}
          </span>
        </p>
      </header>

      <div className="entitylist-sort" role="toolbar" aria-label={t('booksList.sortLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('booksList.sortLabel')}
        </span>
        <SortButton mode="alphabetical" current={sortMode} onClick={setSortMode}>
          {t('booksList.sortAlphabetical')}
        </SortButton>
        <SortButton mode="composed" current={sortMode} onClick={setSortMode}>
          {t('booksList.sortComposed')}
        </SortButton>
        <SortButton mode="anchors" current={sortMode} onClick={setSortMode}>
          {t('booksList.sortAnchors')}
        </SortButton>
      </div>

      <div className="entitylist-filter" role="toolbar" aria-label={t('booksList.filterLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('booksList.filterLabel')}
        </span>
        <FilterButton mode="all" current={tierFilter} onClick={setTierFilter}>
          {t('booksList.filterAll')}
        </FilterButton>
        <FilterButton mode="showcase" current={tierFilter} onClick={setTierFilter}>
          {t('booksList.filterShowcase')}
        </FilterButton>
        <FilterButton mode="catalogue" current={tierFilter} onClick={setTierFilter}>
          {t('booksList.filterCatalogue')}
        </FilterButton>
      </div>

      <ul className="entitylist-grid">
        {sortedBooks.map((b) => {
          const translit = pickLang(b.transliteration, lang);
          const titleHtml =
            lang === 'ar'
              ? b.fullArabicTitle
              : translit
                ? stripInlineMarkdown(translit)
                : b.fullArabicTitle;
          const meaning = pickLang(b.titleMeaning, lang);
          const anchorCount = atlasAnchorCount(b);
          return (
            <li key={b.slug}>
              <Link to={entityUrl(lang, 'book', b.slug)} className="entitylist-card">
                {b.composedYear && (
                  <span className="entitylist-card-lifespan">{b.composedYear}</span>
                )}
                <h2
                  className="entitylist-card-title"
                  dangerouslySetInnerHTML={{ __html: titleHtml }}
                />
                {meaning && (
                  <p
                    className="entitylist-card-meaning"
                    dangerouslySetInnerHTML={{
                      __html: meaning.replace(/\*([^*]+?)\*/g, '<em>$1</em>'),
                    }}
                  />
                )}
                {anchorCount > 1 && (
                  <p className="entitylist-card-anchors">
                    <span aria-hidden="true">◇</span>{' '}
                    {t('booksList.anchorCount', { count: anchorCount })}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

// ─── Sort + filter logic ───────────────────────────────────────────────

type SortMode = 'alphabetical' | 'composed' | 'anchors';
type TierFilter = 'all' | 'showcase' | 'catalogue';

function atlasAnchorCount(b: BookSummary): number {
  if (b.atlasAnchors && b.atlasAnchors.length > 0) return b.atlasAnchors.length;
  return b.atlasAnchor ? 1 : 0;
}

function sortBooks(
  books: BookSummary[],
  mode: SortMode,
  lang: string
): BookSummary[] {
  const arr = [...books];
  const titleOf = (b: BookSummary): string => {
    if (lang === 'ar') return b.fullArabicTitle;
    const t = pickLang(b.transliteration, lang as 'tr' | 'en' | 'ar');
    return (t ?? b.fullArabicTitle).replace(/[*_]/g, '');
  };

  if (mode === 'alphabetical') {
    arr.sort((a, b) => titleOf(a).localeCompare(titleOf(b), lang));
  } else if (mode === 'composed') {
    arr.sort((a, b) => {
      const ya = b_year(a);
      const yb = b_year(b);
      if (ya !== yb) return ya - yb;
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  } else {
    arr.sort((a, b) => {
      const ca = atlasAnchorCount(a);
      const cb = atlasAnchorCount(b);
      if (ca !== cb) return cb - ca;
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  }
  return arr;
}

function b_year(b: BookSummary): number {
  if (!b.composedYear) return Number.POSITIVE_INFINITY;
  const parsed = parseYearStart(b.composedYear);
  return parsed === null ? Number.POSITIVE_INFINITY : parsed;
}

function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}

// ─── Toolbar typed aliases ─────────────────────────────────────────────
const SortButton = ToolbarButton<SortMode>;
const FilterButton = ToolbarButton<TierFilter>;
