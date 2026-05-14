import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { listWords } from '@/content/registry';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { ToolbarButton } from '@/components/ToolbarButton';
import type { WordSummary } from '@/types/entities';

import './EntityListPage.css';

/**
 * Words Catalogue listing page (dilim 7/10.A).
 *
 * URL: `/:lang/kelimeler` — segment Türkçe sabit (paths.ts §3.2 disiplini).
 *
 * Eksik route'un karşılanması: HomePage'in Directory sütunu Word'ler için
 * alfabetik tek-sütun liste; bu sayfa daha geniş bir kanvas (sort: alfabetik
 * / journey arketipi / atlas rota sayısı). Catalogue tier açıldığında filter
 * paneli (§4.2 — tier/journey/atlasAnchor multi-select) buraya gelir; şu an
 * 9 showcase Word için sort yeterli, filter UI over-engineered olur.
 *
 * Mimari:
 *   • Veri: `listWords()` — manifest senkron, eager registry. HomePage ile
 *     aynı kaynak; ek lazy chunk gerekmez.
 *   • Sort: client-side, `useMemo` + `localeCompare(other, lang)` (Türkçe
 *     ve Arapça collation runtime-destekli).
 *   • Card layout: HomePage entity-card paterniyle aynı görsel dil, ama
 *     daha geniş grid (3-4 sütun desktop, responsive). Journey tag (◆ ARKETİP)
 *     ve atlas anchor count (◇ N-hop) görünür metadata.
 *
 * Niçin sayfa-içi state (URL query param yerine `?sort=journey`): sort
 * editöryel olarak share-edilen birşey değil; bir URL'i kopyalayan kişi
 * sort tercihini değil "kelime listesi" sayfasını paylaşır. Catalogue tier
 * açıldığında filter URL'e taşınmalı (deep-link önemli — "andalusian +
 * showcase" kombinasyonu paylaşılabilir bir state); o zaman migrate.
 */
export default function WordsListPage() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  // Dilim 7/12: tier filtresi. Default 'all' — backward-compatible varsayılan.
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  // Dilim 7/11.C: sekme başlığı — "Kelimeler · Riḥlat al-Kalimāt" (locale'e göre).
  usePageTitle(t('entities.wordPlural'));

  const words = useMemo(() => listWords(), []);
  // Filter ÖNCE, sort SONRA: filtreleme sıralanacak dizi kümesini daraltır.
  // useMemo katmanı iki ayrı — filter ve sort bağımsız invalidate olur.
  const filteredWords = useMemo(
    () => (tierFilter === 'all' ? words : words.filter((w) => w.tier === tierFilter)),
    [words, tierFilter]
  );
  const sortedWords = useMemo(
    () => sortWords(filteredWords, sortMode, lang),
    [filteredWords, sortMode, lang]
  );

  const isRtl = lang === 'ar';

  return (
    <main className="entitylist-main" lang={lang} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="entitylist-header">
        <h1 className="entitylist-title">{t('entities.wordPlural')}</h1>
        <p className="entitylist-subtitle">
          {t('wordsList.subtitle')}{' '}
          <span className="entitylist-count">
            —{' '}
            {tierFilter === 'all'
              ? t('wordsList.count', { count: words.length })
              : t('wordsList.countFiltered', {
                  shown: filteredWords.length,
                  total: words.length,
                })}
          </span>
        </p>
      </header>

      <div className="entitylist-sort" role="toolbar" aria-label={t('wordsList.sortLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('wordsList.sortLabel')}
        </span>
        <SortButton mode="alphabetical" current={sortMode} onClick={setSortMode}>
          {t('wordsList.sortAlphabetical')}
        </SortButton>
        <SortButton mode="journey" current={sortMode} onClick={setSortMode}>
          {t('wordsList.sortJourney')}
        </SortButton>
        <SortButton mode="anchors" current={sortMode} onClick={setSortMode}>
          {t('wordsList.sortAnchors')}
        </SortButton>
      </div>

      {/* Dilim 7/12: tier filtresi — catalogue tier açıldığında 9 showcase
          + 6 catalogue Word'ün ayrımı bir UI affordance'ı olarak görünür.
          Aynı toolbar pattern'i ve aynı button stili — semantik olarak ayrı
          (sort ≠ filter), görsel olarak komşu. */}
      <div className="entitylist-filter" role="toolbar" aria-label={t('wordsList.filterLabel')}>
        <span className="entitylist-sort-label" aria-hidden="true">
          {t('wordsList.filterLabel')}
        </span>
        <FilterButton mode="all" current={tierFilter} onClick={setTierFilter}>
          {t('wordsList.filterAll')}
        </FilterButton>
        <FilterButton mode="showcase" current={tierFilter} onClick={setTierFilter}>
          {t('wordsList.filterShowcase')}
        </FilterButton>
        <FilterButton mode="catalogue" current={tierFilter} onClick={setTierFilter}>
          {t('wordsList.filterCatalogue')}
        </FilterButton>
      </div>

      <ul className="entitylist-grid">
        {sortedWords.map((w) => {
          const title = pickLang(w.title, lang) ?? w.slug;
          const meaning = pickLang(w.literalMeaning, lang);
          const anchorCount = atlasAnchorCount(w);
          return (
            <li key={w.slug}>
              <Link to={entityUrl(lang, 'word', w.slug)} className="entitylist-card">
                {w.journey_type && (
                  <span className="entitylist-card-journey">
                    <span className="entitylist-card-journey-mark" aria-hidden="true">
                      ◆
                    </span>
                    <span>{t(`journeys.${w.journey_type}`)}</span>
                  </span>
                )}
                <h2 className="entitylist-card-title">{title}</h2>
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
                    {t('wordsList.anchorCount', { count: anchorCount })}
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

type SortMode = 'alphabetical' | 'journey' | 'anchors';

/** Tier filtresi — catalogue tier dilim 7/12'de açıldığında eklendi.
 *  `all` default; *showcase* sadece 9 derin Word'ü, *catalogue* sadece 6
 *  yeni catalogue Word'ü gösterir. Tıpkı sort gibi sayfa-içi state — URL
 *  query param olmaması, paylaşılabilir bir state ihtiyacının henüz net
 *  olmamasından. Filter sayısı 13+ Word'e gelince bir önem kazanacak,
 *  catalogue tier büyür ve "tier × journey" kombinasyonları
 *  share-edilebilir bir state'e dönüşür; o zaman URL'e taşınır. */
type TierFilter = 'all' | 'showcase' | 'catalogue';

function atlasAnchorCount(w: WordSummary): number {
  if (w.atlasAnchors && w.atlasAnchors.length > 0) return w.atlasAnchors.length;
  return w.atlasAnchor ? 1 : 0;
}

function sortWords(
  words: WordSummary[],
  mode: SortMode,
  lang: string
): WordSummary[] {
  const arr = [...words];
  const titleOf = (w: WordSummary): string =>
    pickLang(w.title, lang as 'tr' | 'en' | 'ar') ?? w.slug;

  if (mode === 'alphabetical') {
    arr.sort((a, b) => titleOf(a).localeCompare(titleOf(b), lang));
  } else if (mode === 'journey') {
    // Group by journey_type (undefined sorts last); within group alphabetical.
    arr.sort((a, b) => {
      const ja = a.journey_type ?? '~'; // tilde > all ASCII letters → undefineds last
      const jb = b.journey_type ?? '~';
      if (ja !== jb) return ja.localeCompare(jb);
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  } else {
    // anchors: more anchors first, then alphabetical
    arr.sort((a, b) => {
      const ca = atlasAnchorCount(a);
      const cb = atlasAnchorCount(b);
      if (ca !== cb) return cb - ca;
      return titleOf(a).localeCompare(titleOf(b), lang);
    });
  }
  return arr;
}

// ─── Toolbar button (segmented control) ────────────────────────────────
//
// Dilim 7/16.δ.A: ToolbarButton generic'i `@/components/ToolbarButton`
// paylaşılan dosyasına taşındı; Persons/Books list page'ler de aynı
// component'i tüketir. Burada typed alias'lar (SortButton/FilterButton)
// call-site netliği için tutuluyor.

/** Sort toolbar için typed alias — call-site netliği için. */
const SortButton = ToolbarButton<SortMode>;
/** Tier filter toolbar için typed alias. */
const FilterButton = ToolbarButton<TierFilter>;
