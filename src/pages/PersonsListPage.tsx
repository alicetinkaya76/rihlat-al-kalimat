import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { listPersons } from '@/content/registry';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { ToolbarButton } from '@/components/ToolbarButton';
import { parseYearStart } from '@/utils/year';
import type { PersonSummary } from '@/types/entities';

import './EntityListPage.css';

/**
 * Persons Catalogue listing page (dilim 7/16.δ.A).
 *
 * URL: `/:lang/kisiler` — `wordsListUrl` (7/10.A) ile simetrik. Entity-tip
 * simetri zincirinin liste-katmanı tarafında ikinci entity. Aynı manuscript-
 * aesthetic kart sözlüğü, aynı sort/filter toolbar pattern'i — fark:
 *
 *   • Sort modes: alfabetik / yaşam dönemi / atlas rotası
 *   • Subtitle stratejisi: trForm fallback nisba (HomePage Directory Persons
 *     sütunundaki ile aynı)
 *   • Title kaynağı: lang === 'ar' && arabicName ise arabicName, yoksa
 *     romanName (romanName *italic-Latin* form içerdiği için stripInlineMarkdown
 *     uygulanır — HomePage paterni)
 *
 * Listede Person kartlarının sıralama anahtarı (lifespan) PersonSummary'ye
 * dilim 7/16'da eklendi; year.ts/parseYearStart üzerinden sayıya çevrilir.
 *
 * Bu sayfa lazy chunk (AppRoutes'taki React.lazy ile) — Atlas + HomePage
 * yüklü ana akışta yer kaplamaz. Manifest senkron olarak listPersons()'tan
 * okur; parser/MDX chunk'ı triggerlanmaz.
 */
export default function PersonsListPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  // Dilim 7/11.C: sekme başlığı — "Kişiler · Riḥlat al-Kalimāt".
  usePageTitle(t('entities.personPlural'));

  const persons = useMemo(() => listPersons(), []);
  const filteredPersons = useMemo(
    () => (tierFilter === 'all' ? persons : persons.filter((p) => p.tier === tierFilter)),
    [persons, tierFilter]
  );
  const sortedPersons = useMemo(
    () => sortPersons(filteredPersons, sortMode, lang),
    [filteredPersons, sortMode, lang]
  );

  const isRtl = lang === 'ar';

  return (
    <main className="entitylist-main" lang={lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="entitylist-header">
        <h1 className="entitylist-title">{t('entities.personPlural')}</h1>
        <p className="entitylist-subtitle">
          {t('personsList.subtitle')}{' '}
          <span className="entitylist-count">
            —{' '}
            {tierFilter === 'all'
              ? t('personsList.count', { count: persons.length })
              : t('personsList.countFiltered', {
                  shown: filteredPersons.length,
                  total: persons.length,
                })}
          </span>
        </p>
      </header>

      <div className="entitylist-sort" role="toolbar" aria-label={t('personsList.sortLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('personsList.sortLabel')}
        </span>
        <SortButton mode="alphabetical" current={sortMode} onClick={setSortMode}>
          {t('personsList.sortAlphabetical')}
        </SortButton>
        <SortButton mode="lifespan" current={sortMode} onClick={setSortMode}>
          {t('personsList.sortLifespan')}
        </SortButton>
        <SortButton mode="anchors" current={sortMode} onClick={setSortMode}>
          {t('personsList.sortAnchors')}
        </SortButton>
      </div>

      <div className="entitylist-filter" role="toolbar" aria-label={t('personsList.filterLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('personsList.filterLabel')}
        </span>
        <FilterButton mode="all" current={tierFilter} onClick={setTierFilter}>
          {t('personsList.filterAll')}
        </FilterButton>
        <FilterButton mode="showcase" current={tierFilter} onClick={setTierFilter}>
          {t('personsList.filterShowcase')}
        </FilterButton>
        <FilterButton mode="catalogue" current={tierFilter} onClick={setTierFilter}>
          {t('personsList.filterCatalogue')}
        </FilterButton>
      </div>

      <ul className="entitylist-grid">
        {sortedPersons.map((p) => {
          const isArabic = lang === 'ar';
          const titleSource = isArabic && p.arabicName ? p.arabicName : p.romanName;
          const titleHtml = stripInlineMarkdown(titleSource);
          const subtitleSource = pickLang(p.trForm, lang) ?? pickLang(p.nisba, lang);
          const anchorCount = atlasAnchorCount(p);
          return (
            <li key={p.slug}>
              <Link to={entityUrl(lang, 'person', p.slug)} className="entitylist-card">
                {p.lifespan && (
                  <span className="entitylist-card-lifespan">{p.lifespan}</span>
                )}
                <h2
                  className="entitylist-card-title"
                  dangerouslySetInnerHTML={{ __html: titleHtml }}
                />
                {subtitleSource && (
                  <p
                    className="entitylist-card-meaning"
                    dangerouslySetInnerHTML={{
                      __html: subtitleSource.replace(/\*([^*]+?)\*/g, '<em>$1</em>'),
                    }}
                  />
                )}
                {anchorCount > 1 && (
                  <p className="entitylist-card-anchors">
                    <span aria-hidden="true">◇</span>{' '}
                    {t('personsList.anchorCount', { count: anchorCount })}
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

type SortMode = 'alphabetical' | 'lifespan' | 'anchors';
type TierFilter = 'all' | 'showcase' | 'catalogue';

function atlasAnchorCount(p: PersonSummary): number {
  if (p.atlasAnchors && p.atlasAnchors.length > 0) return p.atlasAnchors.length;
  return p.atlasAnchor ? 1 : 0;
}

function sortPersons(
  persons: PersonSummary[],
  mode: SortMode,
  lang: string
): PersonSummary[] {
  const arr = [...persons];
  // Display-title üretici — sort için kullanılır. HomePage paterniyle aynı:
  // Arapça lokalde arabicName tercih edilir; aksi halde romanName (markdown
  // emphasis temizlenmiş; collation `<em>` parantezlerinden etkilenmesin).
  const titleOf = (p: PersonSummary): string => {
    const raw =
      lang === 'ar' && p.arabicName
        ? p.arabicName
        : p.romanName.replace(/[*_]/g, '');
    return raw;
  };

  if (mode === 'alphabetical') {
    arr.sort((a, b) => titleOf(a).localeCompare(titleOf(b), lang));
  } else if (mode === 'lifespan') {
    // Lifespan başı yılına göre artan; bilinmeyen yıl listenin sonuna.
    // parseYearStart "c. 980", "9. yy", "fl. 825" gibi 142+ format'ı sayıya
    // çevirir (year.ts, dilim 7/15). NaN olursa Infinity'ye fallback —
    // tutarlı bir "sona it" davranışı.
    arr.sort((a, b) => {
      const ya = p_year(a);
      const yb = p_year(b);
      if (ya !== yb) return ya - yb;
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  } else {
    // anchors: daha çok anchor öne, ardından alfabetik.
    arr.sort((a, b) => {
      const ca = atlasAnchorCount(a);
      const cb = atlasAnchorCount(b);
      if (ca !== cb) return cb - ca;
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  }
  return arr;
}

function p_year(p: PersonSummary): number {
  if (!p.lifespan) return Number.POSITIVE_INFINITY;
  const parsed = parseYearStart(p.lifespan);
  return parsed === null ? Number.POSITIVE_INFINITY : parsed;
}

// ─── Helpers ───────────────────────────────────────────────────────────

/** HomePage'in `stripInlineMarkdown`'iyle aynı — markdown emphasis'i
 *  HTML emphasis'e çevirir. Person başlıklarında *italic-Latin* nispe
 *  forms görüntü tarafında em olarak render edilir. */
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}

// ─── Toolbar typed aliases ─────────────────────────────────────────────
const SortButton = ToolbarButton<SortMode>;
const FilterButton = ToolbarButton<TierFilter>;
