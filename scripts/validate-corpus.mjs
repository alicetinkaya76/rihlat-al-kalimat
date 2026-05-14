// Standalone corpus smoke-test — Node ortamında YAML-frontmatter okur,
// validator invariant'larının kritik alt-kümesini koşar. Vite dev/build
// sırasında registry.ts IIFE'sinin tarayıcıda çalışmasına ihtiyaç
// duymadan korpus çapraz-tutarlılığını rapor eder.
//
// Çalıştırma: `tsx scripts/validate-corpus.mjs` (package.json
// `validate`/`prebuild` script'leri zaten tsx'i kullanıyor). tsx,
// `src/content/atlas.ts` TS modülünü runtime'da derler — atlas slug
// listesi artık manuel senkron gerektirmiyor.
//
// Kapsam:
//   • her Word/Person/Book MDX'inde tam 5 stratum + id 1..5
//   • showcase tier ≥2 dil başlık
//   • Word.siblings status:'live' → hedef slug korpusta var mı
//   • Word.journey_type (varsa) 7 arketipten biri mi (dilim 7/6.C)
//   • Person.wordsIndebted / works status:'live' → hedef slug var mı
//   • Book.relatedWords status:'live' → hedef slug var mı
//   • Theme.words / persons / books slug'ları korpustaki entity'lere
//     çözülüyor mu (assertThemeSlugIntegrity'nin Node analogu)
//   • Theme magnum tier ≥2 dilde başlık
//   • Word.atlasAnchors / Theme.atlasAnchors / Person.atlasAnchors /
//     Book.atlasAnchors slug'ları ATLAS_PLACES'da var mı + tekil mi
//     (atlas.ts'ten otomatik türetilen slug seti ile, paylaşılan
//     checkAtlasAnchorsArray helper'ı — dilim 7/6.A'da Word de eklendi,
//     dört entity tipi de aynı invariant'larla denetlenir)
//
// Çıkış kodu: 0 ise temiz; 1 ise en az bir invariant ihlal.

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// Atlas slug havuzu artık TS source-of-truth'tan (src/content/atlas.ts)
// **doğrudan** geliyor. Bu script `tsx scripts/validate-corpus.mjs` ile
// çalıştırılır; tsx (esbuild altında) atlas.ts'i runtime'da derler ve
// `import type` deklarasyonunu siler — yani Vite path alias (`@/types/`)
// runtime'a sızmaz. Yeni AtlasPlace eklendiğinde manuel adım yok.
import { ATLAS_PLACES } from '../src/content/atlas.ts';
import { JOURNEY_TYPES } from '../src/types/entities.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const errors = [];
const E = (path, msg) => errors.push(`[${path}] ${msg}`);

function readFrontmatter(path) {
  const raw = readFileSync(path, 'utf8');
  const m = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!m) {
    throw new Error(`No frontmatter in ${path}`);
  }
  return yaml.load(m[1]);
}

function listSlugs(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

function checkStrataAndCoverage(entity, slug, type) {
  const path = `${type}/${slug}`;
  if (!Array.isArray(entity.strata) || entity.strata.length !== 5) {
    E(path, `Expected exactly 5 strata, got ${entity.strata?.length ?? 0}`);
    return;
  }
  ['1', '2', '3', '4', '5'].forEach((expected, i) => {
    const got = String(entity.strata[i]?.id ?? '');
    if (got !== expected) {
      E(path, `Stratum at index ${i} has id "${got}", expected "${expected}"`);
    }
  });
  if (entity.tier === 'showcase') {
    const filled = ['tr', 'en', 'ar'].filter(
      (k) => entity.title?.[k] && String(entity.title[k]).trim()
    );
    if (filled.length < 2) {
      E(`${path}#title`, `Showcase tier requires ≥2 languages; found ${filled.length}`);
    }
  }
}

function checkCrossLink(link, idx, basePath, sluginess) {
  const fieldPath = `${basePath}[${idx}]`;
  if (link.status !== 'live') return;
  const pool = sluginess[link.targetType];
  if (!pool) {
    E(fieldPath, `Unknown targetType "${link.targetType}"`);
    return;
  }
  if (!pool.has(link.targetSlug)) {
    E(
      fieldPath,
      `CrossLink → ${link.targetType}/${link.targetSlug} marked 'live' but target not found`
    );
  }
}

/**
 * Çoklu-anchor (atlasAnchors[]) yapısal doğrulayıcı. Theme.atlasAnchors ve
 * (dilim 7/4.C itibarıyla) Person.atlasAnchors için aynı invariant:
 *   - array olmalı
 *   - her öğe nesne olmalı, `slug` string'i taşımalı
 *   - her slug ATLAS_PLACES'da bulunmalı
 *   - aynı entity içinde slug tekrarı olmamalı
 * `entityKind` mesajda görünür ("theme" veya "person").
 */
function checkAtlasAnchorsArray(anchors, path, entityKind, ATLAS_SLUGS) {
  if (anchors === undefined) return;
  if (!Array.isArray(anchors)) {
    E(`${path}#atlasAnchors`, `atlasAnchors must be an array if present`);
    return;
  }
  const seen = new Set();
  anchors.forEach((a, i) => {
    const fp = `${path}#atlasAnchors[${i}]`;
    if (a === null || typeof a !== 'object') {
      E(fp, `entry must be an object`);
      return;
    }
    if (typeof a.slug !== 'string' || !a.slug.trim()) {
      E(fp, `entry missing 'slug' string`);
      return;
    }
    if (!ATLAS_SLUGS.has(a.slug)) {
      E(fp, `atlas anchor "${a.slug}" not found in ATLAS_PLACES (see src/content/atlas.ts)`);
    }
    if (seen.has(a.slug)) {
      E(fp, `duplicate anchor "${a.slug}" — anchors must be unique within a ${entityKind}`);
    }
    seen.add(a.slug);
  });
}

const wordsDir = join(root, 'content/words');
const personsDir = join(root, 'content/persons');
const booksDir = join(root, 'content/books');
const themesDir = join(root, 'content/themes');
const journeysDir = join(root, 'content/journeys');

const wordSlugs = new Set(listSlugs(wordsDir));
const personSlugs = new Set(listSlugs(personsDir));
const bookSlugs = new Set(listSlugs(booksDir));
const themeSlugs = new Set(listSlugs(themesDir));
const journeySlugs = new Set(listSlugs(journeysDir));
const sluginess = {
  word: wordSlugs,
  person: personSlugs,
  book: bookSlugs,
  theme: themeSlugs,
};

// ─── Atlas anchor slug havuzu ────────────────────────────────────────
//
// Yukarıdaki `import { ATLAS_PLACES } from '../src/content/atlas.ts'`
// sayesinde slug listesi tek doğru kaynaktan (TS modülü) türetiliyor.
// Yeni AtlasPlace eklemek = atlas.ts'e bir satır eklemek; bu validator
// otomatik tanır. (Dilim 7/4.C'de Person.atlasAnchors da bunu kullandığı
// için tanım Persons loop'undan önceye taşındı; dilim 7/6.A'da Word de
// aynı kümeyi tüketiyor.)
const ATLAS_SLUGS = new Set(Object.keys(ATLAS_PLACES));

// Dilim 7/9.B — JOURNEY_TYPES DRY refactor: canonical kaynak
// `src/types/entities.ts` (yukarıdaki `import { ATLAS_PLACES }` ile aynı
// tsx-üzerinden-TS-import paterninde). 7 arketip listesi artık tek doğru
// kaynaktan tüketiliyor; eskiden 4 yerde duplikate olan değer yalnız
// entities.ts'te. Yeni arketip eklenirse iki yer güncellenir: entities.ts
// (`JourneyType` union + `JOURNEY_TYPES` const) ve i18n locales'te
// `journeys.<type>` anahtarları üç dilde.
const JOURNEY_TYPES_SET = new Set(JOURNEY_TYPES);

// ─── Words ──────────────────────────────────────────────────────────
for (const slug of wordSlugs) {
  const entity = readFrontmatter(join(wordsDir, `${slug}.mdx`));
  checkStrataAndCoverage(entity, slug, 'word');
  (entity.siblings ?? []).forEach((s, i) =>
    checkCrossLink(s, i, `word/${slug}#siblings`, sluginess)
  );
  // Dilim 7/6.A: Word.atlasAnchors çoklu-yer rotası — Person/Book/Theme
  // ile aynı invariant'lar, paylaşılan checkAtlasAnchorsArray helper'ı.
  // Cotton'ın Indus → Bağdat → Endülüs hattı gibi rotaları yapısal olarak
  // doğrular.
  checkAtlasAnchorsArray(entity.atlasAnchors, `word/${slug}`, 'word', ATLAS_SLUGS);
  // Dilim 7/6.C: journey_type enum bütünlüğü. Opsiyonel alan; tanımlıysa
  // yedi arketipten biri olmalı. Showcase için "doluluk" zorlanmaz —
  // bu editöryel bir disiplin meselesi, build pipeline'da değil
  // (catalogue tier zaman zaman kategorize edilemeyen kelimeler taşır).
  if (entity.journey_type !== undefined && !JOURNEY_TYPES_SET.has(entity.journey_type)) {
    E(
      `word/${slug}#journey_type`,
      `unknown journey_type "${entity.journey_type}" — must be one of: ${JOURNEY_TYPES.join(', ')}`
    );
  }
}

// ─── Persons ────────────────────────────────────────────────────────
for (const slug of personSlugs) {
  const entity = readFrontmatter(join(personsDir, `${slug}.mdx`));
  checkStrataAndCoverage(entity, slug, 'person');
  (entity.wordsIndebted ?? []).forEach((s, i) =>
    checkCrossLink(s, i, `person/${slug}#wordsIndebted`, sluginess)
  );
  (entity.works ?? []).forEach((s, i) =>
    checkCrossLink(s, i, `person/${slug}#works`, sluginess)
  );
  // Dilim 7/4.C: Person.atlasAnchors çoklu-yer rotası — aynı invariant'lar
  // Theme.atlasAnchors ile.
  checkAtlasAnchorsArray(entity.atlasAnchors, `person/${slug}`, 'person', ATLAS_SLUGS);
}

// ─── Books ──────────────────────────────────────────────────────────
for (const slug of bookSlugs) {
  const entity = readFrontmatter(join(booksDir, `${slug}.mdx`));
  checkStrataAndCoverage(entity, slug, 'book');
  (entity.relatedWords ?? []).forEach((s, i) =>
    checkCrossLink(s, i, `book/${slug}#relatedWords`, sluginess)
  );
  // Dilim 7/5.A: Book.atlasAnchors çoklu-yer rotası — Person.atlasAnchors
  // (dilim 7/4.C) ile aynı invariant'lar, paylaşılan checkAtlasAnchorsArray
  // helper'ı. Kitabın yazıldığı yer + tercüme/dağılım yer(ler)i.
  checkAtlasAnchorsArray(entity.atlasAnchors, `book/${slug}`, 'book', ATLAS_SLUGS);
  // Dilim 7/16.δ.C: Book.authorSlug integrity. 7/14'te ibn-sina placeholder
  // olarak duruyordu (validator henüz authorSlug üzerinden doğrulama yapmıyordu);
  // 7/16'da ibn-sina catalogue Person olarak korpusa girdi, böylece authorSlug
  // integrity check'i de açılabilir. CrossLink değil düz string slug; Theme'in
  // words/persons/books slug kontrolüyle aynı disiplin. Boş authorSlug'a izin
  // verilmez — Book.authorSlug zorunlu alan.
  if (typeof entity.authorSlug !== 'string' || entity.authorSlug.trim().length === 0) {
    E(`book/${slug}`, 'authorSlug missing or empty');
  } else if (!sluginess.person.has(entity.authorSlug)) {
    E(`book/${slug}#authorSlug`, `authorSlug "${entity.authorSlug}" not found in Person corpus`);
  }
}

// ─── Themes ─────────────────────────────────────────────────────────
for (const slug of themeSlugs) {
  const entity = readFrontmatter(join(themesDir, `${slug}.mdx`));
  const path = `theme/${slug}`;
  // tier title coverage
  const min = entity.tier === 'magnum' ? 2 : 1;
  const filled = ['tr', 'en', 'ar'].filter(
    (k) => entity.title?.[k] && String(entity.title[k]).trim()
  );
  if (filled.length < min) {
    E(`${path}#title`, `Theme tier '${entity.tier}' requires ≥${min} languages; found ${filled.length}`);
  }
  for (const bucket of ['words', 'persons', 'books']) {
    const arr = entity[bucket] ?? [];
    const seen = new Set();
    arr.forEach((slugRef, i) => {
      if (seen.has(slugRef)) {
        E(`${path}#${bucket}[${i}]`, `duplicate slug "${slugRef}" in ${bucket} list`);
      }
      seen.add(slugRef);
      const pool = bucket === 'words' ? wordSlugs : bucket === 'persons' ? personSlugs : bookSlugs;
      if (!pool.has(slugRef)) {
        E(`${path}#${bucket}[${i}]`, `${bucket} → "${slugRef}" not found in corpus`);
      }
    });
  }
  // atlasAnchors — sıralı bir slug listesi (Theme.atlasAnchors invariant).
  // Aynı invariant'lar Person.atlasAnchors için de geçerli — paylaşılan
  // helper (checkAtlasAnchorsArray) kullanılıyor.
  checkAtlasAnchorsArray(entity.atlasAnchors, path, 'theme', ATLAS_SLUGS);
}

// ─── Journeys (dilim 7/35 — Shape ο) ────────────────────────────────
// Dosya disiplinleri:
//   1) Slug JOURNEY_TYPES enum'una uymalı (canonical 7 arketip)
//   2) 7 arketipin her birinin tek MDX dosyası olmalı (eksiksiz coverage)
//   3) title/subtitle/body üç dilde dolu (showcase-tier disiplini)
//   4) sources üç dilde en az 1 entry
for (const slug of journeySlugs) {
  const entity = readFrontmatter(join(journeysDir, `${slug}.mdx`));
  const path = `journey/${slug}`;
  if (!JOURNEY_TYPES_SET.has(slug)) {
    E(path, `slug "${slug}" is not a canonical JOURNEY_TYPE; valid: ${[...JOURNEY_TYPES_SET].join(', ')}`);
    continue;
  }
  if (entity.type !== undefined && entity.type !== 'journey') {
    E(path, `frontmatter type must be 'journey' (got '${entity.type}')`);
  }
  for (const field of ['title', 'subtitle', 'body']) {
    const loc = entity[field];
    if (loc === undefined || loc === null || typeof loc !== 'object') {
      E(`${path}#${field}`, `missing or non-object`);
      continue;
    }
    for (const lang of ['tr', 'en', 'ar']) {
      const v = loc[lang];
      if (typeof v !== 'string' || !v.trim()) {
        E(`${path}#${field}.${lang}`, `Journey requires all 3 languages; '${lang}' missing or empty`);
      }
    }
  }
  const sources = entity.sources;
  if (sources === undefined || sources === null || typeof sources !== 'object') {
    E(`${path}#sources`, `missing sources block`);
  } else {
    for (const lang of ['tr', 'en', 'ar']) {
      const arr = sources[lang];
      if (!Array.isArray(arr) || arr.length === 0) {
        E(`${path}#sources.${lang}`, `Journey sources require ≥1 entry in '${lang}'`);
      }
    }
  }
}

// JOURNEY_TYPES coverage: her enum üyesi için bir MDX dosyası
for (const t of JOURNEY_TYPES) {
  if (!journeySlugs.has(t)) {
    E(`journeys/${t}`, `canonical JOURNEY_TYPE '${t}' has no MDX file in content/journeys/`);
  }
}

// ─── Rapor ──────────────────────────────────────────────────────────
console.log('—— Riḥlat al-Kalimāt corpus smoke-test ——');
console.log(`words:    ${wordSlugs.size}  · ${[...wordSlugs].join(', ')}`);
console.log(`persons:  ${personSlugs.size}  · ${[...personSlugs].join(', ')}`);
console.log(`books:    ${bookSlugs.size}  · ${[...bookSlugs].join(', ')}`);
console.log(`themes:   ${themeSlugs.size}  · ${[...themeSlugs].join(', ')}`);
console.log(`journeys: ${journeySlugs.size}  · ${[...journeySlugs].join(', ')}`);
console.log('');
if (errors.length === 0) {
  console.log('✔ 0 invariant violations.');
  process.exit(0);
}
console.log(`✘ ${errors.length} validation error(s):`);
for (const e of errors) console.log(`  • ${e}`);
process.exit(1);
