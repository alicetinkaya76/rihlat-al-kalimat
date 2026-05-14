# Production deploy rehberi

> Dilim 7/19.ι.A · launch hazırlığı

Bu doküman, Riḥlat al-Kalimāt'in üç destekli hosting platformuna nasıl
deploy edileceğini anlatır: **Cloudflare Pages** (primary tercih),
**Netlify** (cousin platform — aynı konfigürasyon dosyaları), **Vercel**
(ayrı konfigürasyon — `vercel.json`).

İçindekiler:

1. Ön hazırlık — production origin
2. Cloudflare Pages
3. Netlify
4. Vercel
5. Post-deploy checklist
6. SITE_ORIGIN nasıl çalışır
7. Sık karşılaşılan sorunlar

---

## 1. Ön hazırlık — production origin

Site şu an **placeholder origin** ile build alıyor:
`https://rihla.example`. Bu origin sitemap.xml'in `<loc>`
URL'lerine, index.html'in OG/Twitter meta etiketlerine, canonical
link'e gömülüyor. Production deploy *öncesinde* gerçek origin
belirlenmeli.

**İki yöntem** (ikisi de çalışır; önemli olan tutarlılık):

### Yöntem A — `data/site-config.json` (versiyon kontrolünde)

```json
{
  "origin": "https://rihla.com",
  "_originStatus": "production"
}
```

Tüm platformlarda otomatik okunur. Yerel `npm run build` da bu değeri
kullanır. **Single source of truth** — README endcap'inde domain
değiştiyse buraya kaydı düşürülür.

### Yöntem B — `SITE_ORIGIN` ortam değişkeni (env)

Her platformun dashboard'ında env var olarak set edilir. site-config'i
**override eder**; yani staging vs production ayrımı için ideal —
versiyon kontrolünde production origin var, staging env'i farklı
SITE_ORIGIN gönderiyor.

Çözünürlük zinciri (yüksek öncelik üstte):

```
process.env.SITE_ORIGIN
        ↓ (yoksa)
data/site-config.json → origin
        ↓ (yoksa)
"https://rihla.example" (placeholder fallback)
```

---

## 2. Cloudflare Pages (önerilen)

### Niçin Cloudflare:

- **Bedava tier en cömert** — build minute sınırı yok, 500 build/ay (statik
  site için yıllarca yetiyor).
- **Türkiye'de POP** — projenin merkez izleyicisi için en hızlı CDN.
- **`_redirects` + `_headers` Netlify uyumlu format** — gelecekte
  Netlify'a geçilse sürtünmesiz.

### Adımlar:

1. **Repository hazır olsun.** GitHub/GitLab/Bitbucket — Cloudflare bunu
   dashboard'dan bağlar.

2. **`pages.cloudflare.com` → Create a project → Connect to Git**.

3. **Framework preset: `None`** (Vite seçmeyin — Cloudflare'in Vite
   preset'i mevcut `prebuild` script'iyle çakışabilir; manuel `npm run
   build` daha güvenli).

4. **Build configuration:**

   | Alan | Değer |
   |---|---|
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (varsayılan) |
   | Node version | `20` veya `22` (environment variables → `NODE_VERSION=22`) |

5. **Environment variables (production):**

   ```
   SITE_ORIGIN = https://rihla.com   # gerçek domain
   NODE_VERSION = 22
   ```

   Preview branch için ayrı SITE_ORIGIN (örn. preview deploy URL'sini
   set etmek isterseniz `https://rihla.pages.dev`).

6. **Deploy.** İlk build ~30-60 sn. Sonraki build'ler ~15-30 sn (cache'li
   `npm ci`).

7. **Custom domain bağla** (varsa). Cloudflare DNS aynı hesapta ise
   tek-tıkla; başka registrar ise CNAME `your-project.pages.dev`
   şeklinde apex'e veya `www`'ye işaret edin.

### Cloudflare-specific kontroller:

- `_redirects` otomatik tanınır. Test: `https://your-site.pages.dev/asdf`
  → 200 ile `index.html`'i serve eder (SPA fallback).
- `_headers` otomatik uygulanır. Test (Chrome DevTools → Network):
  herhangi bir HTML response, `X-Frame-Options: DENY`, `Content-Security-
  Policy: ...` görmeli.
- Accept-Language redirect: `/` → `/tr|/en|/ar` Cloudflare side'de
  çalışmaz (Cloudflare Workers gerekli — bu projede yok). Client-side
  fallback `LangAwareRedirect.tsx` her hâlükârda halleder.

---

## 3. Netlify

Cloudflare ile birebir aynı konfigürasyon dosyaları (`_redirects`,
`_headers`) okunur. Tek fark: dashboard.

### Adımlar:

1. **`app.netlify.com` → Add new site → Import from Git**.
2. **Build settings:**

   | Alan | Değer |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Node version (Site settings → Environment) | `NODE_VERSION=22` |

3. **Environment variables:**

   ```
   SITE_ORIGIN = https://rihla.com
   ```

4. **Custom domain** (varsa). Netlify DNS veya external CNAME.

### Netlify-specific:

- Accept-Language redirect: Netlify **server-side** destekliyor.
  `_redirects` dosyasındaki `Language=tr` koşulu Netlify'da çalışır.
  Cloudflare'de de çalışıyor; iki platform için aynı dosya yeter.
- Build minute sınırı: bedava tier 300/ay. Statik site için yeterli
  (her commit'te ~30 sn → ayda ~600 commit'e dayanır).

---

## 4. Vercel

Vercel `_redirects` formatını okumuyor — onun yerine `vercel.json`
kullanıyor. Bu dosya repo'nun kökünde var; Vercel otomatik tanır.

### Adımlar:

1. **`vercel.com` → New project → Import Git repository**.
2. **Framework preset:** Vite (Vercel doğru otomatik tanır).
3. **Build configuration:** vercel.json'da set edili; dashboard'da
   override etmeye gerek yok.
4. **Environment variables:**

   ```
   SITE_ORIGIN = https://rihla.com
   ```

   Production + Preview ortamları için ayrı set edebilirsiniz.

5. **Custom domain** — Vercel domain yönetimi en kolay.

### Vercel-specific:

- Accept-Language redirect: **bedava tier'da yok** (Edge Middleware
  gerekli, Vercel Pro). Client-side fallback yeterli.
- `vercel.json`'daki `rewrites` SPA fallback'i sağlar; statik public
  asset'ler (sitemap, robots, og-image) regex'le hariç tutulur.

---

## 5. Post-deploy checklist

Her deploy sonrası şu noktaları kontrol edin (5 dakika):

- [ ] `https://your-domain/` → `/tr` (veya tarayıcı diline göre) yönlendiriyor mu?
- [ ] `https://your-domain/tr` → Anasayfa atlas yükleniyor mu?
- [ ] `https://your-domain/sitemap.xml` → 200, XML, `<loc>` URL'leri
      production origin'iyle başlıyor mu?
- [ ] `https://your-domain/robots.txt` → 200, sitemap satırı doğru
      origin'le mi?
- [ ] `https://your-domain/og-image.png` → 200, 1200×630 PNG.
- [ ] `https://your-domain/favicon.svg` → 200, SVG.
- [ ] `https://your-domain/apple-touch-icon.png` → 200, 180×180 PNG.
- [ ] Twitter Card Validator: `https://cards-dev.twitter.com/validator`
      → URL'i gir, "summary_large_image" görüntüsü gözüksün.
- [ ] Facebook Sharing Debugger:
      `https://developers.facebook.com/tools/debug/` → OG meta doğru mu?
- [ ] DevTools Network: HTML response'larda `Content-Security-Policy`,
      `X-Frame-Options: DENY`, `Referrer-Policy` görünüyor mu?
- [ ] Lighthouse audit (Performance / Accessibility / SEO / Best
      Practices) → her bölüm ≥90?
- [ ] 404 sayfası: `https://your-domain/tr/kelime/algorythm` →
      "Belki şunu aradınız: algorithm" önerisi geliyor mu?

---

## 6. SITE_ORIGIN nasıl çalışır

Origin değişkeninin iki nokta üzerinde etkisi var:

### A. Sitemap (`public/sitemap.xml`)

`scripts/generate-sitemap.mjs` `prebuild` hook'unda her build'de tazelenir.
Sitemap içindeki tüm `<loc>` URL'leri mutlak — production origin'i
zorunlu (sitemap.org spec).

```bash
# Verify
grep "<loc>" dist/sitemap.xml | head -3
# →    <loc>https://rihla.com/tr</loc>
```

### B. index.html OG meta + canonical

`vite.config.ts` `rihlaOriginInject` plugin'i `transformIndexHtml`
hook'unda placeholder'ları replace eder. Sadece `vite build` çalıştırıldığında;
dev server'da placeholder kalır (geliştirici görsün diye).

```bash
# Verify
grep -E "og:url|og:image|canonical" dist/index.html
# →   <meta property="og:url" content="https://rihla.com/" />
# →   <link rel="canonical" href="https://rihla.com/" />
```

### Placeholder kalırsa ne olur?

Build başarısız olmaz; sadece konsola uyarı düşer:

```
[rihla-origin] using placeholder origin (https://rihla.example);
set SITE_ORIGIN env or data/site-config.json for production
```

Production deploy'da bu uyarıyı görürseniz: search engine'lere yanlış
domain raporlanır, OG paylaşımları kırılır. Build log'larında bu
uyarıyı arayın; CI'da fail yapabilir bir adım eklemek gerekirse
(`grep -q "using placeholder" build.log && exit 1`) eklenir.

---

## 7. Sık karşılaşılan sorunlar

### "Sitemap.xml'de placeholder origin görüyorum"

Sebep: `SITE_ORIGIN` env yok, `data/site-config.json` da placeholder.
Çözüm: ya env set edin, ya da `data/site-config.json` → `origin` alanını
production domain'e güncelleyin.

### "OG image Twitter'da görünmüyor"

Sebep listesi (en yaygından nadirına):

1. `og:image` URL'i absolute değil (relative path; spec mutlak ister).
   Bizde `transformIndexHtml` zaten mutlak yapıyor; placeholder kalmışsa
   bu hata olur.
2. CSP `img-src` Twitter'ı engelliyor — bizim CSP `'self' data:` —
   Twitter kendi cache'inden serve eder, sorun olmaz.
3. Image > 5MB veya yanlış MIME. Bizim PNG 70 KB.

### "Build başarılı ama site beyaz"

Sebep: `_redirects` veya SPA fallback eksik; React router `/tr` URL'ini
sunucuya soruyor ve sunucu `index.html`'i serve etmediği için 404
dönüyor.
Çözüm: hosting platformunun konfigürasyonunda SPA fallback (`/*` →
`/index.html` 200) açık mı kontrol edin.

### "Lighthouse SEO 100'den düşük"

Olası sebepler:

1. `lang` attribute eksik → React `LangScope` set ediyor; sadece JS
   yüklendikten sonra. SSR olmadığı için ilk-yükleme HTML'de `lang="tr"`
   sabit. Acceptable.
2. Meta description eksik → index.html'de `<meta name="description">`
   var.
3. robots.txt yok → public/robots.txt var.

### "Custom domain HTTPS sertifikası gelmiyor"

Cloudflare/Netlify/Vercel hepsi Let's Encrypt otomatik. DNS yayılması
(15 dk - 24 saat). DNS'in doğru target'a işaret ettiğinden emin olun:
`dig your-domain CNAME` veya `dig your-domain A`.

---

## Editöryel not

Bu doküman *Cloudflare Pages-first* yazıldı çünkü Türkiye-merkezli
izleyiciye en hızlı erişim sağlıyor (POP'lar Istanbul'da). Ama
**`_redirects` + `_headers` Netlify ile aynı format** olduğu için
geçiş anlık. Vercel ayrı bir konfigürasyon dosyası tutuyor ama yine
de aynı repo'dan deploy edilebilir — bu disiplin "vendor lock-in"den
korunma niyetiyle.

İlk live URL hangi platformda olursa olsun, `data/site-config.json`
domain'le güncellenir, README endcap'ine production URL'i not düşülür,
post-deploy checklist çalıştırılır. ι dilimi *sadece* deploy hazırlığı —
gerçek deploy bir editöryel adım, kullanıcı tarafından domain tescili
ve dashboard onboarding'i yapıldıktan sonra.
