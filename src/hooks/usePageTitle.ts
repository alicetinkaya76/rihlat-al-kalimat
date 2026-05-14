import { useEffect } from 'react';

/**
 * `document.title`'ı sayfa-bazlı yöneten hook (dilim 7/11.C).
 *
 * Template: `<title> · Riḥlat al-Kalimāt` — title boş ya da yalnız
 * whitespace ise base brand'e düşer ("Riḥlat al-Kalimāt").
 *
 * Niçin hook (component yerine `<Helmet>`-vari): react-helmet bağımlılığı
 * eklemek mantıksız — tek alan değiştiriyoruz (title), <head> içine
 * meta tag enjeksiyonu yok. useEffect'le `document.title`'ı set etmek
 * 5 satır; ek paket 5 KB.
 *
 * Cleanup yok: yeni sayfa mount'unda kendi title'ını set eder; navigasyon
 * arasında geçici stale title problemi olmaz (sıra: A unmount → A cleanup
 * çalışsa restore eder → B mount → B title set eder. Hızlı geçiş, ama B
 * her zaman üstüne yazar). Cleanup'ı atlamak da güvenli, çünkü her sayfa
 * kendi başlığını set ediyor.
 *
 * SSR uyumu: useEffect SSR'da çalışmaz; sayfa server-rendered olsa bile
 * client'ta hidrate olduğunda title yenilenir. Vite + React 18 + SPA
 * mod'unda zaten SSR yok; bu hook client-only.
 *
 * Kullanım:
 *   const word = useWord(slug);
 *   usePageTitle(pickLang(word?.title, lang));
 *
 *   // HomePage'de: base brand'e düşmesi için boş geç
 *   usePageTitle('');
 */
const BRAND = 'Riḥlat al-Kalimāt';

export function usePageTitle(title: string | null | undefined): void {
  useEffect(() => {
    const trimmed = (title ?? '').trim();
    document.title = trimmed ? `${trimmed} · ${BRAND}` : BRAND;
  }, [title]);
}
