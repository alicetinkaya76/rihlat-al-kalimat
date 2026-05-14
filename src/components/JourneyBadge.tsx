import { useTranslation } from 'react-i18next';

import type { JourneyType } from '@/types/entities';

import './JourneyBadge.css';

/**
 * JourneyBadge — bir Word'ün hangi yolculuk arketipine ait olduğunu
 * gösteren küçük rozet. WordPage'de WordHeader sonrası, ThemeBadges
 * yanında veya altında inline render edilir.
 *
 * 7 arketip (§4.5 GRAND_PLAN):
 *  - translator   → Mütercimin Yolu
 *  - merchant     → Tüccarın Kervanı
 *  - andalusian   → Endülüs Tortusu
 *  - crusader     → Haçlının Hatırası
 *  - astronomer   → Yıldızbilimcinin Mirası
 *  - alchemist    → Simyacının Atölyesi
 *  - diplomatic   → Diplomatik Mübadele
 *
 * Şu an statik bir rozet (link değil). İleride `/journeys/:type`
 * route'u açıldığında bu bileşen <Link> sarmalanır; o zamana kadar
 * bilgisel.
 *
 * Renk semantiği: ThemeBadges magnum gold + cluster lazaward
 * paletinden ayrılır — JourneyBadge kendi sicilinde, `--moss` (kına/
 * sumak yeşili — palette §2.3, "kazı toprağı"nın yan tonu). Her
 * arketip aynı renk; arketip ayrımı metinden (label) gelir.
 * Tier ayrımı yok; journey arketipi tier-bağımsızdır.
 *
 * Dilim 7/6.C'de tanıtıldı.
 */
export interface JourneyBadgeProps {
  type: JourneyType;
  variant?: 'inline' | 'aside';
}

export default function JourneyBadge({ type, variant = 'inline' }: JourneyBadgeProps) {
  const { t } = useTranslation();
  const label = t(`journeys.${type}`);
  const sectionLabel = t('journeys.label');
  return (
    <div className={`journey-badge journey-badge--${variant}`}>
      <span className="journey-badge-label">{sectionLabel}</span>
      <span className="journey-badge-pill" data-journey={type}>
        <span className="journey-badge-mark" aria-hidden="true">
          ◆
        </span>
        <span className="journey-badge-text">{label}</span>
      </span>
    </div>
  );
}
