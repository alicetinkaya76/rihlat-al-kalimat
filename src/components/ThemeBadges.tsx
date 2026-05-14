import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import type { ThemeSummary } from '@/types/entities';

import './ThemeBadges.css';

type Variant = 'inline' | 'aside';

interface Props {
  /** Geri-bağlantı kümesi: `getThemesForEntity(type, slug)` çıktısı.
   *  Dilim 7/1'den itibaren `ThemeSummary[]`; back-link badge'i sadece
   *  slug + title + tier okur, bunlar manifest summary'sinde zaten dolu —
   *  full Theme gövdesini indirmeye gerek yok. */
  themes: ThemeSummary[];
  /**
   * `'inline'`: WordPage'in header → strat-layout arasında ince yatay
   * şerit. Etiket + tier-renkli pill badge'ler.
   * `'aside'`: PersonPage / BookPage kenar kolonunda standart
   * `.aside-block` + dikey kart yığını paterniyle.
   */
  variant: Variant;
}

/**
 * Bir Word/Person/Book entity'sinin parçası olduğu Theme'leri gösteren
 * geri-bağlantı kümesi (Slice 5/4 — Theme back-links altyapısı).
 *
 * Veri kaynağı: registry'nin `getThemesForEntity` ters-indeksi
 * (modül-yüklenirken eager kuruluyor; assertThemeSlugIntegrity zaten
 * her slug'ın korpusta gerçek olduğunu doğruladığı için broken-ref
 * burada imkânsız — placeholder/live ayrımı yok).
 *
 * Boş `themes` dizisinde komponent `null` döner — sayfada hiçbir iz
 * bırakmaz. Çağıran tarafın `themes.length > 0` kontrolüne ihtiyacı
 * yok ama README pattern'iyle tutarlılık için yine de şart koştuk
 * (RelatedWords da kendi `links` boşsa null döner).
 *
 * Tier paleti: magnum → `--gold`, cluster → `--accent-2` (lazaward).
 * ThemePage'in tier-badge palette'i ile birebir aynı; tematik tutarlılık
 * için Theme dünyasının ana renkleri burada da geri yankılanır.
 */
export default function ThemeBadges({ themes, variant }: Props) {
  const { t } = useTranslation();
  const { lang } = useLang();

  if (themes.length === 0) return null;

  const items = themes.map((th) => {
    const title = pickLang(th.title, lang) ?? th.slug;
    const tierClass =
      th.tier === 'magnum' ? 'theme-badge--magnum' : 'theme-badge--cluster';
    const mark = th.tier === 'magnum' ? '✦' : '◆';
    return (
      <Link
        key={th.slug}
        to={entityUrl(lang, 'theme', th.slug)}
        className={`theme-badge ${tierClass}`}
      >
        <span className="theme-badge-mark" aria-hidden="true">
          {mark}
        </span>
        <span className="theme-badge-title">{title}</span>
      </Link>
    );
  });

  if (variant === 'inline') {
    return (
      <div className="theme-badges theme-badges--inline reveal r-2">
        <span className="theme-badges-label">
          {t('sections.appearsInThemes')}
        </span>
        <span className="theme-badges-list">{items}</span>
      </div>
    );
  }

  return (
    <div className="aside-block theme-badges theme-badges--aside">
      <h4 className="aside-title">{t('sections.appearsInThemes')}</h4>
      <div className="theme-badges-list">{items}</div>
    </div>
  );
}
