// AUTO-GEN script — Riḥlat al-Kalimāt manifest builder.
//
// Görev: /content/{words,persons,books,themes}/*.mdx dosyalarını tarar,
// frontmatter'larını okur, *yalnız özet alanları* `src/content/manifest.
// generated.ts` dosyasına TypeScript olarak yazar. Bu dosya:
//   • git'e eklenmez (.gitignore'da)
//   • predev/prebuild package script'lerinde otomatik oluşturulur
//   • dev sırasında MDX değiştikçe Vite plugin tarafından yeniden üretilir
//   • Tipleri @/types/entities'tan import eder (Word/Person/Book/ThemeSummary)
//
// Niçin Node script + emit edilen TS: Vite plugin runtime'ında "virtual
// module" üretmek de mümkündü, ama tsc'nin de manifest'i görmesi gerek
// (tipler), ve diskteki gerçek bir TS dosyası tüm araç zincirinde
// (typecheck, IDE, build) tutarlı çalışır. Manifest stale kalsa bile
// hızlı tespit edilir — Vite HMR rejenere eder, predev de.
//
// Ne yazılıyor (entity başına minimum alanlar):
//   Word    → slug, type, tier, title, category?, atlasAnchor?, atlasAnchors?,
//             journey_type?, literalMeaning
//   Person  → slug, type, tier, title, category?, atlasAnchor?, atlasAnchors?,
//             romanName, arabicName?, trForm?, nisba?, lifespan?
//   Book    → slug, type, tier, title, category?, atlasAnchor?, atlasAnchors?,
//             fullArabicTitle, transliteration, titleMeaning, authorSlug,
//             composedYear?
//   Theme   → slug, type, tier, title, subtitle?, words, persons, books,
//             atlasAnchors?
//
// Bu liste @/types/entities §8.5'teki summary interface'leriyle birebir
// senkronize. O dosyaya yeni bir alan eklenirse buraya da eklenmeli;
// `npm run typecheck` consumer-tarafında eksik alan varsa fail eder
// (dev için bu da bir korkuluk).

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// Dilim 7/9.B — JOURNEY_TYPES DRY refactor: canonical kaynak
// `src/types/entities.ts` (§JourneyType + §JOURNEY_TYPES const). Script
// artık tsx üzerinden çalıştığı için (package.json + vite.config.ts spawn
// güncellendi) .ts modülünü doğrudan import edebiliyor — eskiden 4 yerde
// (entities.ts, validate-corpus.mjs, bu dosya, ve loader.ts) duplikate
// olan liste artık tek doğru kaynaktan tüketiliyor. Yeni arketip eklenirse
// **sadece iki** yer güncellenir: entities.ts (canonical) ve i18n locales
// `journeys.<type>` üç dilde.
import { JOURNEY_TYPES } from '../src/types/entities.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const wordsDir = join(root, 'content/words');
const personsDir = join(root, 'content/persons');
const booksDir = join(root, 'content/books');
const themesDir = join(root, 'content/themes');
const journeysDir = join(root, 'content/journeys');

const outPath = join(root, 'src/content/manifest.generated.ts');

// ─── Frontmatter okuma — validate-corpus.mjs ile aynı regex ───────────
const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
function readFrontmatter(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const m = FM_RE.exec(raw);
  if (!m) throw new Error(`No frontmatter in ${filePath}`);
  const data = yaml.load(m[1]);
  if (data === null || typeof data !== 'object') {
    throw new Error(`Frontmatter not an object in ${filePath}`);
  }
  return data;
}

function listSlugs(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .sort(); // deterministic order — git diff stable
}

// ─── Localized helpers ────────────────────────────────────────────────
const LANGS = ['tr', 'en', 'ar'];

function pickLocalized(loc) {
  if (loc === undefined || loc === null || typeof loc !== 'object' || Array.isArray(loc)) {
    return undefined;
  }
  const out = {};
  for (const lang of LANGS) {
    const v = loc[lang];
    if (typeof v === 'string') out[lang] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function pickTier(t, fallback = 'catalogue') {
  return t === 'showcase' || t === 'catalogue' ? t : fallback;
}

function pickThemeTier(t) {
  return t === 'magnum' ? 'magnum' : 'cluster';
}

function pickStringList(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter((x) => typeof x === 'string' && x.trim().length > 0);
}

// ─── Per-entity summary extractors ────────────────────────────────────

function summarizeWord(slug, fm) {
  const summary = {
    slug,
    type: 'word',
    tier: pickTier(fm.tier),
    title: pickLocalized(fm.title) ?? {},
    literalMeaning: pickLocalized(fm.literalMeaning) ?? {},
  };
  const cat = pickLocalized(fm.category);
  if (cat) summary.category = cat;
  if (typeof fm.atlasAnchor === 'string') summary.atlasAnchor = fm.atlasAnchor;
  // Dilim 7/6.A: Word.atlasAnchors çoklu-yer rotası — Person/Book ile
  // aynı pickThemeAtlasAnchors helper'ı, üçüncü stratified entity tipinde
  // simetrik. Atlas (homepage) manifest'ten doğrudan multi-anchor pin
  // ve dotted-sepia rota çizebilir.
  const atlasAnchors = pickThemeAtlasAnchors(fm.atlasAnchors);
  if (atlasAnchors) summary.atlasAnchors = atlasAnchors;
  // Dilim 7/6.C: Word.journey_type — 7 arketipten biri (yolculuk
  // arketipi). Bilinmeyen değer sessizce yutulur (validate-corpus
  // build-time'da enum bütünlüğünü zorlar).
  if (typeof fm.journey_type === 'string' && JOURNEY_TYPES.includes(fm.journey_type)) {
    summary.journey_type = fm.journey_type;
  }
  return summary;
}

function summarizePerson(slug, fm) {
  const romanName =
    typeof fm.romanName === 'string' && fm.romanName.length > 0 ? fm.romanName : slug;
  const summary = {
    slug,
    type: 'person',
    tier: pickTier(fm.tier),
    title: pickLocalized(fm.title) ?? {},
    romanName,
  };
  const cat = pickLocalized(fm.category);
  if (cat) summary.category = cat;
  if (typeof fm.atlasAnchor === 'string') summary.atlasAnchor = fm.atlasAnchor;
  // Dilim 7/4.C: Person.atlasAnchors çoklu-yer. Eski tek-yer
  // atlasAnchor alanı korunur (geriye dönük uyumluluk); yeni
  // atlasAnchors doluysa Atlas + MiniAtlas onu tercih eder.
  const atlasAnchors = pickThemeAtlasAnchors(fm.atlasAnchors);
  if (atlasAnchors) summary.atlasAnchors = atlasAnchors;
  if (typeof fm.arabicName === 'string') summary.arabicName = fm.arabicName;
  const trForm = pickLocalized(fm.trForm);
  if (trForm) summary.trForm = trForm;
  const nisba = pickLocalized(fm.nisba);
  if (nisba) summary.nisba = nisba;
  // Dilim 7/16: Person.lifespan summary'ye taşınır — PersonsListPage'in
  // kronolojik sort modu için. Boş string'leri sızdırma (manifest temizliği).
  if (typeof fm.lifespan === 'string' && fm.lifespan.trim().length > 0) {
    summary.lifespan = fm.lifespan;
  }
  return summary;
}

function summarizeBook(slug, fm) {
  const summary = {
    slug,
    type: 'book',
    tier: pickTier(fm.tier),
    title: pickLocalized(fm.title) ?? {},
    fullArabicTitle: typeof fm.fullArabicTitle === 'string' ? fm.fullArabicTitle : '',
    transliteration: pickLocalized(fm.transliteration) ?? {},
    titleMeaning: pickLocalized(fm.titleMeaning) ?? {},
    authorSlug: typeof fm.authorSlug === 'string' ? fm.authorSlug : '',
  };
  const cat = pickLocalized(fm.category);
  if (cat) summary.category = cat;
  if (typeof fm.atlasAnchor === 'string') summary.atlasAnchor = fm.atlasAnchor;
  // Dilim 7/5.A: Book.atlasAnchors çoklu-yer rotası — Person.atlasAnchors
  // (dilim 7/4.C) ile aynı şekil, aynı pickThemeAtlasAnchors helper'ı.
  // Atlas (homepage) BookSummary üzerinden multi-anchor pin'leri ve
  // dotted-sepia rotayı manifest yüklenmesinden hemen çizebilir;
  // BookPage MiniAtlas'ı ise full Book entity'sinden okur.
  const atlasAnchors = pickThemeAtlasAnchors(fm.atlasAnchors);
  if (atlasAnchors) summary.atlasAnchors = atlasAnchors;
  // Dilim 7/16: Book.composedYear summary'ye taşınır — BooksListPage'in
  // kronolojik sort modu için. Boş string'leri sızdırma.
  if (typeof fm.composedYear === 'string' && fm.composedYear.trim().length > 0) {
    summary.composedYear = fm.composedYear;
  }
  return summary;
}

function pickThemeAtlasAnchors(arr) {
  if (!Array.isArray(arr)) return undefined;
  const out = [];
  for (const item of arr) {
    if (item === null || typeof item !== 'object') continue;
    if (typeof item.slug !== 'string' || !item.slug.trim()) continue;
    const entry = { slug: item.slug };
    if (typeof item.year === 'string' && item.year.trim()) entry.year = item.year;
    const label = pickLocalized(item.label);
    if (label) entry.label = label;
    out.push(entry);
  }
  return out.length > 0 ? out : undefined;
}

function summarizeTheme(slug, fm) {
  const summary = {
    slug,
    type: 'theme',
    tier: pickThemeTier(fm.tier),
    title: pickLocalized(fm.title) ?? {},
    words: pickStringList(fm.words),
    persons: pickStringList(fm.persons),
    books: pickStringList(fm.books),
  };
  const sub = pickLocalized(fm.subtitle);
  if (sub) summary.subtitle = sub;
  const atlasAnchors = pickThemeAtlasAnchors(fm.atlasAnchors);
  if (atlasAnchors) summary.atlasAnchors = atlasAnchors;
  return summary;
}

// Dilim 7/35: Journey summary — slug + title + subtitle. body MDX-lazy
// fetch'de gelir; manifest yalnız liste-card için yeterli alanları
// taşır. tier yok (7 arketip eşit-yetkili).
function summarizeJourney(slug, fm) {
  return {
    slug,
    type: 'journey',
    title: pickLocalized(fm.title) ?? {},
    subtitle: pickLocalized(fm.subtitle) ?? {},
  };
}

// ─── Emit a TS object literal ─────────────────────────────────────────
//
// Manuel JSON.stringify yerine kontrollü emit kullanıyoruz çünkü:
//   • TypeScript narrow union istiyor (`type: 'word' as const`'a benzer
//     şey YAZMAYACAĞIZ — tip imzası `Record<string, WordSummary>` olduğu
//     için 'word' string literal automatic narrow oluyor; ama emit'in
//     stable diff'i için biz key sırasını sabitliyoruz)
//   • Çıktı insanların okuyabileceği şekilde indent edilsin
//
// Stratejimiz: JSON.stringify(obj, null, 2) yeterli — TS literal type
// inference doğru çalışır çünkü sabit string'ler ('word' vs) sabit
// dönecek. Wrap'ı manuel const-assertion ile sertleştirmiyoruz; tip
// kontrolü Record<string, WordSummary> üzerinden geliyor.

function tsObjectMap(name, summaries, summaryType) {
  const lines = [`export const ${name}: Record<string, ${summaryType}> = {`];
  for (const s of summaries) {
    // İçeriği JSON.stringify ile yaz; sonra ilk seviye anahtarı
    // unquoted bırakmak için " etrafa basit bir indent.
    const body = JSON.stringify(s, null, 2)
      .split('\n')
      .map((l, i) => (i === 0 ? l : '  ' + l))
      .join('\n');
    lines.push(`  ${JSON.stringify(s.slug)}: ${body},`);
  }
  lines.push('};');
  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────

const wordSlugs = listSlugs(wordsDir);
const personSlugs = listSlugs(personsDir);
const bookSlugs = listSlugs(booksDir);
const themeSlugs = listSlugs(themesDir);
const journeySlugs = listSlugs(journeysDir);

const wordSummaries = wordSlugs.map((s) =>
  summarizeWord(s, readFrontmatter(join(wordsDir, `${s}.mdx`)))
);
const personSummaries = personSlugs.map((s) =>
  summarizePerson(s, readFrontmatter(join(personsDir, `${s}.mdx`)))
);
const bookSummaries = bookSlugs.map((s) =>
  summarizeBook(s, readFrontmatter(join(booksDir, `${s}.mdx`)))
);
const themeSummaries = themeSlugs.map((s) =>
  summarizeTheme(s, readFrontmatter(join(themesDir, `${s}.mdx`)))
);
const journeySummaries = journeySlugs.map((s) =>
  summarizeJourney(s, readFrontmatter(join(journeysDir, `${s}.mdx`)))
);

const banner = `// AUTO-GENERATED by scripts/generate-manifest.mjs — DO NOT EDIT MANUALLY.
//
// Bu dosya MDX dosyalarının özetlerini taşır (slug + başlık + tier +
// theme→entity slug listeleri vb). Tam entity bodies dynamic import ile
// çalışma anında parse edilir; bu manifest sadece liste UI'ları için
// hafif giriş noktasıdır.
//
// Yeniden üretmek için:
//   npm run manifest        (tek seferlik)
//   npm run dev             (predev otomatik çalıştırır)
//   npm run build           (prebuild + validate ile)
//
// MDX dosyalarını dev sırasında değiştirirseniz Vite plugin
// (vite.config.ts'teki rihlaContentManifest) bu dosyayı yeniden üretip
// HMR'i tetikler — el ile çalıştırma gerekmez.
//
// Tip senkronizasyonu: @/types/entities §8.5 (Summary tipleri) bu
// dosyanın sözleşmesini kurar. Yeni alan eklenirse jenerator (yukarıda)
// + summary interface birlikte güncellenmeli; eksik alan varsa tsc fail.

import type {
  WordSummary,
  PersonSummary,
  BookSummary,
  ThemeSummary,
  JourneySummary,
} from '@/types/entities';
`;

const body = [
  banner,
  tsObjectMap('WORD_MANIFEST', wordSummaries, 'WordSummary'),
  '',
  tsObjectMap('PERSON_MANIFEST', personSummaries, 'PersonSummary'),
  '',
  tsObjectMap('BOOK_MANIFEST', bookSummaries, 'BookSummary'),
  '',
  tsObjectMap('THEME_MANIFEST', themeSummaries, 'ThemeSummary'),
  '',
  tsObjectMap('JOURNEY_MANIFEST', journeySummaries, 'JourneySummary'),
  '',
].join('\n');

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, body, 'utf8');

console.log(
  `[manifest] wrote ${outPath}\n` +
    `  words:    ${wordSummaries.length}\n` +
    `  persons:  ${personSummaries.length}\n` +
    `  books:    ${bookSummaries.length}\n` +
    `  themes:   ${themeSummaries.length}\n` +
    `  journeys: ${journeySummaries.length}`
);
