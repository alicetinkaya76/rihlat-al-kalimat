import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import { parseYearStart } from '@/utils/year';
import type { Stratum } from '@/types/entities';

interface Props {
  strata: Stratum[];
  /** Layer DOM ID üretici — Stratigraphy ve Layer aynı id paternini paylaşır. */
  layerIdFor: (stratumId: string) => string;
}

/**
 * Sol kenardaki sticky stratigrafi şeridi (mobile <900px: yatay üst bar).
 *
 * Scroll-driven aktif-stop ve progress bar:
 *   - IntersectionObserver ile her layer'ın görünürlüğünü izler
 *   - viewport %40'ından yukarıdaki son layer 'active'
 *   - üstündekiler 'passed', altındakiler 'pending'
 *   - progress bar yüksekliği (mobilde genişliği) (activeIdx / (n-1)) * 100%
 *
 * Proportional mode (dilim 7/15.γ.B): toggle stop'ları eşit-aralıklı
 * yerine yıl-orantılı konumlar. Toplam yelpaze (oldest stratum yılı →
 * newest stratum yılı) için her stratum'un konum yüzdesi (year - min) /
 * (max - min) hesaplanır; inline style olarak taşınır. Default: false
 * (eşit). Toggle eserin yaş ölçeğini görsel argümana çevirir: eşit
 * modda 5 stratum eşit boşlukta — modern üst-yüzey "büyük" görünür;
 * orantılı modda 2026/1700/1500/825/628 → modern stratum yığılır altta,
 * eski stratumlar geniş yayılır. Bir kelimenin yaşının görsel ağırlığı.
 */
export default function Stratigraphy({ strata, layerIdFor }: Props) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isProportional, setIsProportional] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Her stratum'un toplam yelpazedeki yüzdelik konumu.
  // %0 = en yeni stratum (üstte), %100 = en eski stratum (altta).
  // Yıl bilinmeyen stratum'lar (parseYearStart === null) eşit-aralık
  // fallback'ine düşer; en az 2 sayısal yıl yoksa hepsi eşit-aralık.
  const yearPositions = useMemo<number[]>(() => {
    const years = strata.map((s) => parseYearStart(s.year));
    const numeric = years.filter((y): y is number => y !== null);
    if (numeric.length < 2) {
      return strata.map((_, i) =>
        strata.length > 1 ? (i / (strata.length - 1)) * 100 : 0
      );
    }
    const minY = Math.min(...numeric);
    const maxY = Math.max(...numeric);
    const span = maxY - minY;
    if (span === 0) {
      return strata.map((_, i) =>
        strata.length > 1 ? (i / (strata.length - 1)) * 100 : 0
      );
    }
    return years.map((y, i) => {
      if (y === null) {
        return strata.length > 1 ? (i / (strata.length - 1)) * 100 : 0;
      }
      return ((maxY - y) / span) * 100;
    });
  }, [strata]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const layerEls = strata
      .map((s) => document.getElementById(layerIdFor(s.id)))
      .filter((el): el is HTMLElement => el !== null);
    if (layerEls.length === 0) return;

    const compute = () => {
      const viewLine = window.innerHeight * 0.4;
      let active = 0;
      layerEls.forEach((el, i) => {
        if (el.getBoundingClientRect().top < viewLine) active = i;
      });
      setActiveIdx(active);
    };

    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        compute();
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strata, layerIdFor]);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const ratio = strata.length > 1 ? activeIdx / (strata.length - 1) : 0;
    if (isMobile) {
      el.style.inlineSize = ratio * 100 + '%';
      el.style.blockSize = '2px';
    } else {
      el.style.blockSize = ratio * 100 + '%';
      el.style.inlineSize = '2px';
    }
  }, [activeIdx, isMobile, strata.length]);

  return (
    <aside className="strat-ribbon" aria-label={t('sections.stratigraphy')}>
      <div className="strat-title">{t('sections.stratigraphy')}</div>
      <button
        type="button"
        className={`strat-mode-toggle${isProportional ? ' strat-mode-toggle--active' : ''}`}
        onClick={() => setIsProportional((p) => !p)}
        aria-pressed={isProportional}
        aria-label={
          isProportional
            ? t('stratigraphy.modeProportionalActive')
            : t('stratigraphy.modeProportionalInactive')
        }
        title={
          isProportional
            ? t('stratigraphy.modeProportionalActive')
            : t('stratigraphy.modeProportionalInactive')
        }
      >
        {isProportional ? '⫷' : '≡'}
      </button>
      <div
        className={`strat-track${isProportional ? ' strat-track--proportional' : ''}`}
      >
        <div className="strat-progress" ref={progressRef} />
        {strata.map((s, i) => {
          const place = pickLang(s.place, lang) ?? '';
          const state =
            i === activeIdx ? 'true' : undefined;
          const passed = i < activeIdx ? 'true' : undefined;
          const style = isProportional
            ? ({ '--strat-pos': `${yearPositions[i] ?? 0}%` } as React.CSSProperties)
            : undefined;
          return (
            <a
              key={s.id}
              href={`#${layerIdFor(s.id)}`}
              className="strat-stop"
              data-active={state}
              data-passed={passed}
              data-layer={s.id}
              style={style}
            >
              <span className="strat-dot" />
              <span className="strat-year" dir="ltr">
                {s.year}
              </span>
              <span className="strat-place">{place}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
