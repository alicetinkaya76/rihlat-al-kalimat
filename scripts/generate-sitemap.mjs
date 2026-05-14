// AUTO-GEN script — Riḥlat al-Kalimāt sitemap builder (dilim 7/18.ε.A).
//
// Görev: korpustaki her entity için 3 dil URL'i, statik route'lar için
// 3 dil URL'i, ve JourneyPage için 7 arketip × 3 dil URL'i üretip
// `public/sitemap.xml`'e yazar.
//
// Çalıştırma:
//   `tsx scripts/generate-sitemap.mjs`
//
// package.json `prebuild` hook'unda generate-manifest + validate-corpus
// + bu script sırayla çalışır. Sitemap her build'de tazelenir; dev'de
// gerekmez (search engine indeksi sadece production deploy'a bakar).
//
// Çıktı: standart `sitemap.org` v0.9 XML. Her `<url>` için:
//   • `<loc>`                — canonical URL (varsayılan dil tr; ama
//                              her dil ayrı `<url>` girdisi olarak da
//                              eklenir)
//   • `<xhtml:link rel="alternate" hreflang="…">` — tr/en/ar alternatif
//                              dil URL'leri ve `x-default` (tr)
//   • `<changefreq>`         — `weekly` (içerik dilim'lerle güncellenir)
//   • `<priority>`           — HomePage 1.0; entity sayfaları 0.8;
//                              listing sayfaları 0.6; journey + about 0.5
//
// Korpus okuma: doğrudan `content/{words,persons,books,themes}/*.mdx`
// klasöründen slug listesi türetilir. Manifest dosyasından okumuyoruz
// çünkü manifest TS dosyası — Node'dan okumak için ek parse adımı
// gerekir, oysa slug listesi MDX dosya adlarından bedavaya alınır.

import { readdirSync, writeFileSync, mkdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ─── lastmod helpers (κ-prime, dilim 7/30) ────────────────────────────
//
// `<lastmod>` — search engine'lere "bu sayfa en son ne zaman değişti?"
// bilgisini taşıyan opsiyonel ama önerilen sitemap alanı. Google
// "lastmod is a hint, not a directive" der; ama doğru kullanılırsa
// güncel sayfaları crawler'a önceler.
//
// Strateji:
//   • Entity sayfaları (Word/Person/Book/Theme) → ilgili .mdx
//     dosyasının mtime'ı. İçerik gerçekten değiştiğinde mtime değişir
//     (Git checkout normalde mtime'ı korumaz ama deploy script'i hep
//     son commit zamanını set eder — pratikte build zamanı yeterli).
//   • Liste/Journey/About/Home sayfaları → BUILD_TIME (script çağrıldığı
//     an). Bu sayfalar manifest-driven; herhangi bir entity değişirse
//     içerikleri yenilenir, dolayısıyla en konservatif tahmin "şu an".
//
// Format: ISO-8601 yyyy-mm-dd (sitemap protocol kabul ediyor; saat
// gereksiz — search engine günlük granularity yeter).

const BUILD_DATE = new Date().toISOString().slice(0, 10);

function mtimeIsoDate(filePath) {
  try {
    const stat = statSync(filePath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    // Dosya yoksa fallback build date — sitemap'in tutarlılığı bozulmasın.
    return BUILD_DATE;
  }
}

function entityLastmod(type, slug) {
  return mtimeIsoDate(join(root, `content/${type}s/${slug}.mdx`));
}

// ─── Yapılandırma ─────────────────────────────────────────────────────

// SITE_ORIGIN: production deploy origin. Çözünürlük zinciri (vite.config.ts
// rihlaOriginInject plugin'iyle aynı disiplin):
//   1. process.env.SITE_ORIGIN — CI/CD ve local deploy override
//   2. data/site-config.json → origin — versiyon kontrolündeki kanonik kayıt
//   3. fallback placeholder — yerel build'lerde meta zincirini görmek için
function resolveOrigin() {
  const env = process.env.SITE_ORIGIN;
  if (env && env.trim().length > 0) return env.trim().replace(/\/$/, '');

  const configPath = join(root, 'data/site-config.json');
  if (existsSync(configPath)) {
    try {
      const json = JSON.parse(readFileSync(configPath, 'utf8'));
      if (typeof json.origin === 'string' && json.origin.length > 0) {
        return String(json.origin).replace(/\/$/, '');
      }
    } catch (e) {
      console.warn('[sitemap] failed reading data/site-config.json:', e.message);
    }
  }

  return 'https://rihla.example';
}

const SITE_ORIGIN = resolveOrigin();

const LANGS = ['tr', 'en', 'ar'];
const DEFAULT_LANG = 'tr';

// JOURNEY_TYPES'ı runtime'da TS modülünden okumak için ek parse adımı;
// burada manuel olarak listelemek pragmatic (entities.ts ile tutarlı
// olduğu README'de + tests'de güvence altında). 7 arketip kapalı küme
// (dilim 7/6.C); editöryel disiplin değişirse iki yerden de güncellenir.
const JOURNEY_TYPES = [
  'translator',
  'merchant',
  'andalusian',
  'crusader',
  'astronomer',
  'alchemist',
  'diplomatic',
];

// Path segment'leri paths.ts'in birebir kopyası — Türkçe sabit, dile
// bağımsız (§3.2 disiplini). Sitemap script'inde tek doğru kaynak
// gerekli; paths.ts'ten okumak da mümkündü ama bu script Node-only
// olduğu için sabitleri burada tutmak daha hijyenik (ileride TS path
// alias'a takılma riskini engeller).
const SEG = {
  word: 'kelime',
  person: 'kisi',
  book: 'kitap',
  theme: 'tema',
  wordsList: 'kelimeler',
  personsList: 'kisiler',
  booksList: 'kitaplar',
  journeys: 'yolculuk',
  about: 'hakkinda',
};

// ─── Korpus okuma ─────────────────────────────────────────────────────

function listSlugs(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

const wordSlugs = listSlugs(join(root, 'content/words'));
const personSlugs = listSlugs(join(root, 'content/persons'));
const bookSlugs = listSlugs(join(root, 'content/books'));
const themeSlugs = listSlugs(join(root, 'content/themes'));

// ─── URL üretimi ─────────────────────────────────────────────────────

/**
 * Her unique "page" için 3 dil URL üretip tek bir <url> bloğu olarak
 * sitemap.xml'e yazılır. Her dil ayrı bir <url> kaydı olur (Google'ın
 * önerisi); her kayıtta diğer iki dil + x-default `xhtml:link` ile
 * gösterilir.
 *
 * @param {(lang: string) => string} pathBuilder  lang argümanına göre
 *   "/tr/kelime/algorithm" gibi tam path döndüren fn (slash ile başlar).
 * @param {{ priority: string, changefreq: string }} meta
 */
function urlEntriesForPage(pathBuilder, meta) {
  const blocks = [];
  for (const lang of LANGS) {
    const loc = SITE_ORIGIN + pathBuilder(lang);
    const alternates = LANGS.map(
      (alt) =>
        `    <xhtml:link rel="alternate" hreflang="${alt}" href="${SITE_ORIGIN + pathBuilder(alt)}" />`
    );
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN + pathBuilder(DEFAULT_LANG)}" />`
    );
    const lines = [
      '  <url>',
      `    <loc>${loc}</loc>`,
      ...alternates,
      // lastmod opsiyonel — sağlanırsa eklenir. Build-time mtime ya
      // da BUILD_DATE fallback'i. Sitemap protocol "ne yazsan yaz,
      // ama tutarlı yaz" der; biz hep yyyy-mm-dd kullanıyoruz.
    ];
    if (meta.lastmod) lines.push(`    <lastmod>${meta.lastmod}</lastmod>`);
    lines.push(
      `    <changefreq>${meta.changefreq}</changefreq>`,
      `    <priority>${meta.priority}</priority>`,
      '  </url>'
    );
    blocks.push(lines.join('\n'));
  }
  return blocks;
}

const all = [];

// HomePage — manifest-driven; herhangi bir entity değişikliği homepage
// içeriğini etkiler. lastmod = build date.
all.push(
  ...urlEntriesForPage((l) => `/${l}`, {
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })
);

// About — static page; bu build'in tarihiyle eşle.
all.push(
  ...urlEntriesForPage((l) => `/${l}/${SEG.about}`, {
    priority: '0.5',
    changefreq: 'monthly',
    lastmod: BUILD_DATE,
  })
);

// Listing sayfaları — manifest-driven; entity ekleme/silme bunları
// etkiler. lastmod = build date.
all.push(
  ...urlEntriesForPage((l) => `/${l}/${SEG.wordsList}`, {
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })
);
all.push(
  ...urlEntriesForPage((l) => `/${l}/${SEG.personsList}`, {
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })
);
all.push(
  ...urlEntriesForPage((l) => `/${l}/${SEG.booksList}`, {
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })
);

// Journey index + arketipler — manifest-driven.
all.push(
  ...urlEntriesForPage((l) => `/${l}/${SEG.journeys}`, {
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: BUILD_DATE,
  })
);
for (const j of JOURNEY_TYPES) {
  all.push(
    ...urlEntriesForPage((l) => `/${l}/${SEG.journeys}/${j}`, {
      priority: '0.5',
      changefreq: 'weekly',
      lastmod: BUILD_DATE,
    })
  );
}

// Entity sayfaları — lastmod ilgili .mdx dosyasının mtime'ı. İçerik
// güncellendiğinde sitemap o sayfanın "freshness" sinyalini taşır;
// dokunulmamış entity'ler eski lastmod'la dururlar.
for (const slug of wordSlugs) {
  all.push(
    ...urlEntriesForPage((l) => `/${l}/${SEG.word}/${encodeURIComponent(slug)}`, {
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: entityLastmod('word', slug),
    })
  );
}
for (const slug of personSlugs) {
  all.push(
    ...urlEntriesForPage((l) => `/${l}/${SEG.person}/${encodeURIComponent(slug)}`, {
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: entityLastmod('person', slug),
    })
  );
}
for (const slug of bookSlugs) {
  all.push(
    ...urlEntriesForPage((l) => `/${l}/${SEG.book}/${encodeURIComponent(slug)}`, {
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: entityLastmod('book', slug),
    })
  );
}
for (const slug of themeSlugs) {
  all.push(
    ...urlEntriesForPage((l) => `/${l}/${SEG.theme}/${encodeURIComponent(slug)}`, {
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: entityLastmod('theme', slug),
    })
  );
}

// ─── XML yaz ─────────────────────────────────────────────────────────

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...all,
  '</urlset>',
  '',
].join('\n');

const outDir = join(root, 'public');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');

// Özet rapor — generate-manifest tarzında.
const totalUrlBlocks = all.length;
const uniquePages = totalUrlBlocks / LANGS.length;
console.log(`[sitemap] wrote ${outPath}`);
console.log(`  origin:        ${SITE_ORIGIN}`);
console.log(`  unique pages:  ${uniquePages} × ${LANGS.length} languages = ${totalUrlBlocks} <url> blocks`);
console.log(`  words:         ${wordSlugs.length}`);
console.log(`  persons:       ${personSlugs.length}`);
console.log(`  books:         ${bookSlugs.length}`);
console.log(`  themes:        ${themeSlugs.length}`);
console.log(`  journey types: ${JOURNEY_TYPES.length}`);
