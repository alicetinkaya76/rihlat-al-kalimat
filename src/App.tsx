import TopBar from '@/components/TopBar';
import SiteFooter from '@/components/SiteFooter';
import AppRoutes from '@/router/AppRoutes';

/**
 * Uygulama kökü. TopBar her sayfada sabit; altında route'a göre değişen
 * sayfa gövdesi (HomePage / WordPage / NotFound / ileride Person/Book/
 * Theme sayfaları); en altta SiteFooter (dilim 7/18.ε.A) — marka
 * mührü, Hakkında linki, edition. Chrome'un üst-alt simetrisi: TopBar
 * interaktif (dil, tema), SiteFooter pasif imza.
 *
 * BrowserRouter main.tsx'te en üstte; useLocation/useNavigate hook'ları
 * bütün ağaçta erişilebilir.
 */
export default function App() {
  return (
    <>
      <TopBar />
      <AppRoutes />
      <SiteFooter />
    </>
  );
}
