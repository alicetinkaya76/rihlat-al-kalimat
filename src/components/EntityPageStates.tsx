import { useTranslation } from 'react-i18next';

import ManuscriptLoader from '@/components/ManuscriptLoader';

/**
 * Lazy entity hidrasyonu sırasında WordPage / PersonPage / BookPage /
 * ThemePage'in paylaştığı iki düşük-gürültü görsel:
 *   • EntityLoading     — MDX dynamic import devam ederken gösterilir.
 *                         AppRoutes'taki RouteFallback ile aynı bileşeni
 *                         (`ManuscriptLoader`) sarmalar — kullanıcı için
 *                         "yine yükleniyor" hissi tutarlı kalır (route
 *                         geçişi vs entity hidrasyonu görsel olarak ayırt
 *                         edilmez; dilim 7/1 disiplini).
 *   • EntityNotFound    — slug korpusta yok ya da parse hata verdi.
 *                         Eski sayfa-içi "Yakında" bloğunun tek-yer'leşmiş
 *                         hâli; her sayfada 8 satır tekrarı yerine.
 *
 * Dilim 7/10.C: EntityLoading artık `ManuscriptLoader`'a delege ediyor —
 * loading state polish layer'a taşındı; AppRoutes'taki inline-styled
 * fallback ile birlikte tek doğru kaynak.
 */

export function EntityLoading() {
  return <ManuscriptLoader />;
}

export function EntityNotFound({ slug }: { slug: string }) {
  const { t } = useTranslation();
  return (
    <main style={{ maxInlineSize: '70ch', margin: '4rem auto', padding: '0 2rem' }}>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 'var(--fs-3xl)' }}>
        {t('common.comingSoon')}
      </h1>
      <p style={{ color: 'var(--fg-muted)', marginBlockStart: '1rem' }}>
        <code>{slug}</code> için içerik henüz hazırlanmadı.
      </p>
    </main>
  );
}
