/**
 * AtlasFilters — atlas etkileşim katmanı (dilim 7/43.τ).
 *
 * Mimari:
 *  • Üç filtre eksen: kelime arama (text), arketip filter (chip), reset.
 *  • URL state ile senkron: `useSearchParams` ile `?word=`, `?journey=`
 *    okur ve yazar. Deep-linkable: `/tr?word=coffee` paylaşıldığında
 *    açan kullanıcı aynı filtreyi görür.
 *  • Word arama: debounced (180ms), case-insensitive, slug VE TR/EN/AR
 *    başlık üzerinde substring match. Eşleşen kelimelerin atlasAnchor'ı
 *    `highlightedPlaces` set'ine girer.
 *  • Archetype filter: tek-seçimli (radio benzeri). Seçili archetype'ın
 *    word'lerinin atlasAnchor'ı highlight set'ine girer. Word arama ile
 *    bir-arada kullanılırsa intersection (mantıksal AND) uygulanır.
 *  • Reset: ikisini de temizler, URL query strip edilir.
 *
 * Sonuç: atlas marker'larında highlighted set'ekilerse normal, dışındakiler
 * %45 opacity. Bu görsel hiyerarşi kullanıcının "hangi yerler ilgilidir"
 * sorusuna anında cevap verir.
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { listJourneyCounts, listWords } from '@/content/registry';
import { pickLang } from '@/utils/localized';
import type { JourneyType } from '@/types/entities';
import './AtlasFilters.css';

export interface AtlasFiltersState {
  highlightedPlaces: Set<string>;
  highlightedEntitySlugs: Set<string>;
  activeWordQuery: string;
  activeJourney: JourneyType | null;
}

export interface AtlasFiltersProps {
  onStateChange: (state: AtlasFiltersState) => void;
}

const EMPTY_STATE: AtlasFiltersState = {
  highlightedPlaces: new Set(),
  highlightedEntitySlugs: new Set(),
  activeWordQuery: '',
  activeJourney: null,
};

export default function AtlasFilters({ onStateChange }: AtlasFiltersProps) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state → component state
  const urlWord = searchParams.get('word') ?? '';
  const urlJourney = (searchParams.get('journey') as JourneyType | null) ?? null;

  // Input state — kullanıcının yazdığı (debounce kaynağı)
  const [wordInput, setWordInput] = useState(urlWord);

  // URL değişirse (geri/ileri buton, deep-link) input'u senkronize et
  useEffect(() => {
    setWordInput(urlWord);
  }, [urlWord]);

  // Debounce — 180ms, ardından URL'e yaz
  useEffect(() => {
    const handle = setTimeout(() => {
      if (wordInput !== urlWord) {
        const next = new URLSearchParams(searchParams);
        if (wordInput.trim()) {
          next.set('word', wordInput.trim());
        } else {
          next.delete('word');
        }
        setSearchParams(next, { replace: true });
      }
    }, 180);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordInput]);

  const journeys = useMemo(() => listJourneyCounts(), []);
  const allWords = useMemo(() => listWords(), []);

  // ── Filter hesaplama ─────────────────────────────────────────────────
  // Word query → eşleşen kelimelerin slug + anchor set'leri
  // Journey filter → o archetype'a ait kelimelerin slug + anchor set'leri
  // İkisi varsa intersection, biri varsa o, hiç biri yoksa boş set
  const filterState = useMemo<AtlasFiltersState>(() => {
    const query = urlWord.trim().toLowerCase();
    const journeyFilter = urlJourney;

    if (!query && !journeyFilter) {
      return EMPTY_STATE;
    }

    // Kelime havuzu: word query varsa filtrele, yoksa hepsi
    let matchedWords = allWords;
    if (query) {
      matchedWords = matchedWords.filter((w) => {
        // Slug match
        if (w.slug.toLowerCase().includes(query)) return true;
        // Title match (lang-spesifik + tüm dillerde)
        const titles = [
          pickLang(w.title, 'tr'),
          pickLang(w.title, 'en'),
          pickLang(w.title, 'ar'),
        ];
        return titles.some((t) =>
          t ? t.toLowerCase().includes(query) : false
        );
      });
    }

    // Journey filter
    if (journeyFilter) {
      matchedWords = matchedWords.filter((w) => w.journey_type === journeyFilter);
    }

    const places = new Set<string>();
    const entitySlugs = new Set<string>();
    for (const w of matchedWords) {
      entitySlugs.add(w.slug);
      // Word'ün tek atlasAnchor'ı veya çoklu atlasAnchors'ı
      if (w.atlasAnchor) places.add(w.atlasAnchor);
      if (w.atlasAnchors) {
        for (const a of w.atlasAnchors) places.add(a.slug);
      }
    }

    return {
      highlightedPlaces: places,
      highlightedEntitySlugs: entitySlugs,
      activeWordQuery: query,
      activeJourney: journeyFilter,
    };
  }, [urlWord, urlJourney, allWords]);

  // Parent'a duyur
  useEffect(() => {
    onStateChange(filterState);
  }, [filterState, onStateChange]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const setJourney = (type: JourneyType | null) => {
    const next = new URLSearchParams(searchParams);
    if (type) {
      next.set('journey', type);
    } else {
      next.delete('journey');
    }
    setSearchParams(next, { replace: true });
  };

  const reset = () => {
    setWordInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('word');
    next.delete('journey');
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilter =
    filterState.activeWordQuery !== '' || filterState.activeJourney !== null;

  const matchCount = filterState.highlightedEntitySlugs.size;

  return (
    <div className="rihla-atlas-filters">
      {/* ── Üst sıra: kelime arama + reset ──────────────────────────── */}
      <div className="rihla-atlas-filters-search-row">
        <label className="rihla-atlas-filters-search-label">
          <span className="rihla-atlas-filters-search-label-text">
            {t('atlas.searchLabel', 'Kelime ara')}
          </span>
          <input
            type="search"
            className="rihla-atlas-filters-search-input"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder={t('atlas.searchPlaceholder', 'örn. coffee, admiral, algorithm')}
            dir={lang === 'ar' ? 'auto' : 'ltr'}
            aria-label={t('atlas.searchLabel', 'Kelime ara')}
          />
        </label>
        {hasActiveFilter && (
          <button
            type="button"
            className="rihla-atlas-filters-reset"
            onClick={reset}
            aria-label={t('atlas.resetLabel', 'Filtreleri temizle')}
          >
            ✕ {t('atlas.reset', 'temizle')}
          </button>
        )}
      </div>

      {/* ── Orta sıra: archetype chip bar ───────────────────────────── */}
      <div className="rihla-atlas-filters-journey-row" role="radiogroup" aria-label={t('atlas.journeyFilter', 'Arketip filtresi')}>
        <span className="rihla-atlas-filters-journey-label">
          {t('atlas.journeyFilter', 'Yolculuk arketipi')}
        </span>
        <ul className="rihla-atlas-filters-journey-list">
          {journeys.map(({ type, count }) => {
            const isEmpty = count === 0;
            const isActive = filterState.activeJourney === (type as JourneyType);
            return (
              <li key={type}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={isEmpty}
                  className={`rihla-atlas-filters-journey-chip${isActive ? ' rihla-atlas-filters-journey-chip--active' : ''}${isEmpty ? ' rihla-atlas-filters-journey-chip--empty' : ''}`}
                  onClick={() => setJourney(isActive ? null : (type as JourneyType))}
                >
                  <span aria-hidden="true">◆</span>
                  <span className="rihla-atlas-filters-journey-chip-text">
                    {t(`journeys.${type}`)}
                  </span>
                  <span className="rihla-atlas-filters-journey-chip-count">
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Alt sıra: durum bildirimi ───────────────────────────────── */}
      {hasActiveFilter && (
        <div className="rihla-atlas-filters-status" role="status" aria-live="polite">
          {matchCount === 0
            ? t('atlas.noMatch', 'Eşleşme yok')
            : t('atlas.matchCount', {
                count: matchCount,
                defaultValue: `${matchCount} eşleşme`,
              })}
        </div>
      )}
    </div>
  );
}
