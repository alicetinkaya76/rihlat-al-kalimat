import { useTranslation } from 'react-i18next';

import './ManuscriptLoader.css';

/**
 * Manuscript-themed lazy loading state (dilim 7/10.C).
 *
 * Tek bileşen, iki kullanıcı:
 *   • `RouteFallback` (AppRoutes) — route lazy chunk indirilirken
 *   • `EntityLoading` (EntityPageStates) — entity MDX hidrasyonu
 *     devam ederken (her iki Suspense boundary'sinde aynı görsel —
 *     dilim 7/1'in disiplini: kullanıcı "route geçişi" ile "entity
 *     yükleme"yi görsel olarak ayırt etmesin).
 *
 * Önceki hâl: italik serif "Yükleniyor…" metni, --fg-faint renkte,
 * 50vh min-height. Funksiyoneldi ama "polish layer"ın §12.4 listesinde
 * "loading state" satırı 0'dı. NotFound (dilim 7/9.C) polish layer'ın
 * ilk gerçek girişiydi; bu bileşen ikinci giriş.
 *
 * Tasarım:
 *   • Yumuşak pulse'lu ◇ glyph (Stratigraphy/ThemeBadges/JourneyBadge/
 *     NotFound ile aynı sembol; gold-leaf renkli, opacity + scale animasyonu).
 *   • Altında italik serif loading metni — eski paletten korunan tek
 *     öğe; tipografik tutarlılık.
 *   • `prefers-reduced-motion` saygısı: animasyon kapanır, statik ◇
 *     görünür (erişilebilirlik disiplini).
 *
 * CSS-only animasyon — framer-motion ya da başka bağımlılık yok. Total
 * bileşen ~25 satır JSX + ~60 satır CSS, ~0.5 KB gz çıkıntı.
 */
export default function ManuscriptLoader() {
  const { t } = useTranslation();
  return (
    <main className="manuscript-loader" aria-busy="true" aria-live="polite">
      <span className="manuscript-loader-mark" aria-hidden="true">
        ◇
      </span>
      <p className="manuscript-loader-text">{t('common.loading')}</p>
    </main>
  );
}
