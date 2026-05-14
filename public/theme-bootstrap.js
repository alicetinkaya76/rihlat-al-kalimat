/**
 * Riḥlat al-Kalimāt · theme bootstrap (dilim 7/30 κ-prime).
 *
 * Tema flicker'ı önleyen pre-React script. localStorage'tan ya da
 * `prefers-color-scheme` media query'sinden temayı okur ve body
 * render'ından ÖNCE `<html>` element'ine `data-theme` atributunu
 * yerleştirir. Parchment/dark tema CSS değişkenleri bu atribute
 * bağlı; React tamamen yüklenmeden önce doğru renkler görünür.
 *
 * Niçin ayrı dosya (κ-prime'da ε'den taşındı):
 *
 *   Önceki durum (dilim 7/15.γ → 7/29.κ): index.html `<head>` içinde
 *   inline `<script>` olarak yazılıyordu. CSP `script-src 'unsafe-inline'`
 *   bu inline script için açıktı (_headers comment'ında dokümante
 *   edilmişti).
 *
 *   Şimdi (dilim 7/30.κ-prime): bu inline script `/theme-bootstrap.js`
 *   harici dosyaya çıkarıldı. index.html'de:
 *     <script src="/theme-bootstrap.js"></script>
 *   olarak yüklenir (defer/async YOK — render-blocking synchronous,
 *   body parse edilmeden önce data-theme atribute set edilmeli).
 *
 *   CSP `script-src 'self'` bu dosyayı doğrudan kabul eder. Ama
 *   `'unsafe-inline'` yine de gerekli — React-injected JSON-LD
 *   blokları inline script olarak kalır (κ dilim'inde tanıtıldı,
 *   bkz. src/components/JsonLd.tsx). CSP-strict yolculuğu burada
 *   *bir adım* ilerledi, *tamamlanmadı*.
 *
 *   FOUC riski: <head> içinde synchronous external script ~200 byte;
 *   HTTP/2 multiplex + Vercel/Cloudflare edge cache ile <10ms latency
 *   (preconnect google fonts'dan daha hızlı). Body parse'i bu kadar
 *   gecikme tolere eder; parchment-anının FOUC'u gözle görülmez.
 *
 *   Kaynak içerik bire-bir korunmuş — sadece konum değişti.
 */
(function () {
  try {
    var t = localStorage.getItem('rihla-theme');
    if (!t) {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    /* noop — localStorage erişimi reddedildiyse default tema (light) */
  }
})();
