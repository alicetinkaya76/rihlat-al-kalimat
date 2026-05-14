/**
 * İçerik registry'si — manifest-tabanlı + per-route lazy MDX yükleyici
 * (Oturum 7 dilim 1).
 *
 * Mimari:
 *
 *   ┌──────────────────────┐  build-time   ┌────────────────────────────┐
 *   │ /content/**\/*.mdx   │ ──────────→   │ scripts/generate-          │
 *   │ (frontmatter only)   │               │   manifest.mjs             │
 *   └──────────────────────┘               └─────────────┬──────────────┘
 *                                                        │ emits
 *                                                        ▼
 *   ┌──────────────────────┐  runtime,     ┌────────────────────────────┐
 *   │ this file (registry) │  sync         │ src/content/manifest.      │
 *   │   list/get*Summary   │ ←───────────  │   generated.ts             │
 *   │   getThemesForEntity │               │   (~10 KB; bundled in main)│
 *   └──────────┬───────────┘               └────────────────────────────┘
 *              │
 *              │ get*(slug) — Promise<FullEntity>
 *              ▼
 *   ┌──────────────────────┐  runtime,     ┌────────────────────────────┐
 *   │ this file (registry) │  lazy         │ /content/<slug>.mdx        │
 *   │   getWord/Person/    │ ───────────→  │   (per-MDX dynamic chunk;  │
 *   │   Book/Theme         │               │   ~6 KB gz/file)           │
 *   └──────────────────────┘               └────────────────────────────┘
 *
 * Sözleşmeler:
 *   • `list*()` ve `get*Summary(slug)` → senkron, hafif. HomePage,
 *     Atlas, ThemeBadges, ThemePage entity-card'ları bunu tüketir.
 *   • `getWord/Person/Book/Theme(slug)` → asenkron, ihtiyaca-göre. Yalnız
 *     entity sayfası (WordPage vb) bunu tüketir; useEntity hook ile.
 *   • `getThemesForEntity(type, slug)` → reverse-index, senkron. Manifest'e
 *     bağlı; ThemeBadges'in kullandığı tek API.
 *   • Validate-corpus: artık registry'de YOK — `npm run validate` (Node)
 *     altında `scripts/validate-corpus.mjs` build-time'da çalışır
 *     (prebuild script'inde). Çalışma anı korpusu maliyet etmiyor.
 *
 * Lazy yöntemi: Vite'in `import.meta.glob({eager: false, query: '?raw'})`
 * fonksiyonu her path için bir `() => Promise<string>` döner. Promise
 * resolve olduğunda raw MDX string'i gelir; loader.ts'in `parseWord`
 * (vb) fonksiyonu o string'i Word'e çevirir. Cache: slug → Promise<Entity>.
 */

import {
  WORD_MANIFEST,
  PERSON_MANIFEST,
  BOOK_MANIFEST,
  THEME_MANIFEST,
  JOURNEY_MANIFEST,
} from './manifest.generated';

import type {
  Book,
  BookSummary,
  Journey,
  JourneySummary,
  Person,
  PersonSummary,
  Theme,
  ThemeSummary,
  Word,
  WordSummary,
} from '@/types/entities';

// ─── Lazy parser module ──────────────────────────────────────────────
//
// Parser modülü ('./loader' — `marked` + `js-yaml` + reshape mantığı, ham
// chunk ~30 KB gz) artık RUNTIME LAZY: ilk entity isteğinde dynamic
// import, sonraki çağrılarda module-scope kapanımıyla tek seferlik.
// HomePage, Atlas, ThemeBadges sadece manifest'i tüketir — hiçbiri
// parser'a bağlı değil; dolayısıyla parser chunk'ı initial-load'a
// (index-*.js) sızmıyor.
//
// Tip tarafı: `LoaderModule` tipi `import('./loader')`'ın static type
// query'si — TypeScript için sadece type-graph'a girer, runtime'da
// hiçbir şey emit etmez. Böylece `pickParser` lambdaları (örn.
// `(m) => m.parseWord`) tip-güvenli derlenir.

type LoaderModule = typeof import('./loader');

let _loaderPromise: Promise<LoaderModule> | null = null;
function loadParser(): Promise<LoaderModule> {
  if (_loaderPromise === null) {
    _loaderPromise = import('./loader');
  }
  return _loaderPromise;
}

// ─── Lazy raw-MDX loaders (per-MDX dynamic chunks) ───────────────────
//
// `import.meta.glob<string>` ile path-keyli bir Record döner; key:
// '/content/words/algorithm.mdx', value: () => Promise<string>. Vite
// build sırasında her dosya için ayrı bir chunk üretir (Rollup
// `code-splitting`). Dev'de, ilk çağrıda fetch + parse zincirini başlatır.
//
// `?raw` query'si: dosyanın string'e çevrilmesi (HTML/MDX sözdizimi olarak
// import edilmesi engellenmesi) içindir; loader.ts JSON-içermeyen ham
// string bekler.
//
// `import: 'default'` — Vite'in `?raw` çıkışında modül `default` export'u
// string olur; loader fonksiyonu doğrudan string istiyor.

const wordLoaders = import.meta.glob<string>('/content/words/*.mdx', {
  query: '?raw',
  import: 'default',
});

const personLoaders = import.meta.glob<string>('/content/persons/*.mdx', {
  query: '?raw',
  import: 'default',
});

const bookLoaders = import.meta.glob<string>('/content/books/*.mdx', {
  query: '?raw',
  import: 'default',
});

const themeLoaders = import.meta.glob<string>('/content/themes/*.mdx', {
  query: '?raw',
  import: 'default',
});

// Dilim 7/35 (Shape ο): Journey lazy loader — Theme ile aynı pattern,
// 7 dosya. Slug'lar JOURNEY_TYPES enum'una kilitli (validate-corpus
// build-time'da zorlar).
const journeyLoaders = import.meta.glob<string>('/content/journeys/*.mdx', {
  query: '?raw',
  import: 'default',
});

// ─── Synchronous summary access (manifest-driven) ─────────────────────

export function listWords(): WordSummary[] {
  return Object.values(WORD_MANIFEST);
}

export function getWordSummary(slug: string): WordSummary | undefined {
  return WORD_MANIFEST[slug];
}

export function listPersons(): PersonSummary[] {
  return Object.values(PERSON_MANIFEST);
}

export function getPersonSummary(slug: string): PersonSummary | undefined {
  return PERSON_MANIFEST[slug];
}

export function listBooks(): BookSummary[] {
  return Object.values(BOOK_MANIFEST);
}

export function getBookSummary(slug: string): BookSummary | undefined {
  return BOOK_MANIFEST[slug];
}

export function listThemes(): ThemeSummary[] {
  return Object.values(THEME_MANIFEST);
}

export function getThemeSummary(slug: string): ThemeSummary | undefined {
  return THEME_MANIFEST[slug];
}

// Dilim 7/35: Journey synchronous summary erişimi. JourneysIndexPage
// listJourneys'ı çağırır (kanonik sıralama içinde — aşağıdaki
// listJourneyCounts ile uyumlu); JourneyPage manifest'ten subtitle
// fallback'i çekebilir (MDX loading sırasında).
export function listJourneys(): JourneySummary[] {
  return Object.values(JOURNEY_MANIFEST);
}

export function getJourneySummary(slug: string): JourneySummary | undefined {
  return JOURNEY_MANIFEST[slug];
}

// ─── Async full-entity access (lazy MDX) ─────────────────────────────
//
// In-memory cache: slug → Promise<Entity | undefined>. İlk çağrıda dynamic
// import + parse Promise'i; sonraki çağrılarda aynı Promise (resolved
// olsa bile, await edildiğinde anında döner). Cache modül-yaşam-döngüsünü
// paylaşır; kullanıcı aynı entity'ye iki kere giderse network maliyeti yok.
//
// Hata yönetimi: parse hatası fırlatırsa (örn. bozuk YAML), undefined'a
// düşer ve console.error'a yazılır — eski registry'nin try/catch
// davranışıyla aynı. Manifest'te slug var ama dynamic loader yok demek
// pratikte imkânsız (manifest jeneratoru aynı dosyaları tarar); yine de
// `loaders[path]` undefined gelirse defensive olarak undefined döner.

const wordCache = new Map<string, Promise<Word | undefined>>();
const personCache = new Map<string, Promise<Person | undefined>>();
const bookCache = new Map<string, Promise<Book | undefined>>();
const themeCache = new Map<string, Promise<Theme | undefined>>();
const journeyCache = new Map<string, Promise<Journey | undefined>>();

function makeLazyFetcher<T>(
  loaders: Record<string, () => Promise<string>>,
  cache: Map<string, Promise<T | undefined>>,
  manifest: Record<string, unknown>,
  pickParser: (mod: LoaderModule) => (raw: string, slug: string) => T,
  kind: string,
  pathPrefix: string
): (slug: string) => Promise<T | undefined> {
  return (slug) => {
    const cached = cache.get(slug);
    if (cached) return cached;

    // Manifest'te yoksa dosya da yok — dynamic loader'a bile bakmaya gerek
    // yok; undefined Promise dön ve cache'leme (slug 404 ise tekrar
    // sorgulanması ucuz; cache'lersek silmek gerekir).
    if (!(slug in manifest)) {
      return Promise.resolve(undefined);
    }

    const path = `${pathPrefix}/${slug}.mdx`;
    const loader = loaders[path];
    if (!loader) {
      // Manifest <-> loader senkronsuzluğu — dev'de uyar, prod'da sessiz fail.
      // eslint-disable-next-line no-console
      console.warn(`[content] manifest has ${kind} ${slug} but no loader at ${path}`);
      return Promise.resolve(undefined);
    }

    // İki bağımsız network/parse işi: (a) MDX raw chunk fetch, (b) parser
    // modülü chunk fetch. `Promise.all` paralel başlatır → first-fetch
    // latency = max(loader, loadParser), toplam değil. Sonraki entity
    // isteklerinde `loadParser()` resolved Promise döner; tek maliyet
    // MDX'in kendisi.
    const promise: Promise<T | undefined> = Promise.all([loader(), loadParser()]).then(
      ([raw, mod]) => {
        try {
          return pickParser(mod)(raw, slug);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[content] failed to parse ${kind} ${path}:`, err);
          return undefined;
        }
      },
      (err) => {
        // MDX chunk veya parser chunk'ı yüklenemedi — telemetri açısından
        // ikisi aynı kovaya düşüyor; pratikte hata çıktısı (chunk URL'i)
        // hangisinin başarısız olduğunu gösteriyor.
        // eslint-disable-next-line no-console
        console.error(`[content] failed to load ${kind} ${path}:`, err);
        return undefined;
      }
    );
    cache.set(slug, promise);
    return promise;
  };
}

export const getWord = makeLazyFetcher<Word>(
  wordLoaders,
  wordCache,
  WORD_MANIFEST,
  (m) => m.parseWord,
  'word',
  '/content/words'
);

export const getPerson = makeLazyFetcher<Person>(
  personLoaders,
  personCache,
  PERSON_MANIFEST,
  (m) => m.parsePerson,
  'person',
  '/content/persons'
);

export const getBook = makeLazyFetcher<Book>(
  bookLoaders,
  bookCache,
  BOOK_MANIFEST,
  (m) => m.parseBook,
  'book',
  '/content/books'
);

export const getTheme = makeLazyFetcher<Theme>(
  themeLoaders,
  themeCache,
  THEME_MANIFEST,
  (m) => m.parseTheme,
  'theme',
  '/content/themes'
);

// Dilim 7/35: getJourney — lazy MDX fetcher, parseJourney parser'ı çağırır.
// JourneyPage useJourney hook'unun arkasında — Theme/Word/Person/Book ile
// aynı pattern.
export const getJourney = makeLazyFetcher<Journey>(
  journeyLoaders,
  journeyCache,
  JOURNEY_MANIFEST,
  (m) => m.parseJourney,
  'journey',
  '/content/journeys'
);

// ─── Theme reverse-index (back-links: entity → themes) ───────────────
//
// Eski mimaride tam Theme[] üzerinden kuruluyordu; şimdi manifest'teki
// ThemeSummary[] ile aynı veri (slug listeleri Theme'de zaten
// frontmatter'dan geliyordu, manifest'te de aynı) → davranış değişmedi.
//
// Schema'da `placeholder` semantiği yok (validate-corpus.mjs build-time'da
// her slug'ın korpusta varolduğunu doğrular), dolayısıyla bu indeks yalnız
// *live* Theme→entity bağlarını taşır; broken ref imkânsız.

const _themesByEntity = new Map<string, ThemeSummary[]>();

(function buildThemeReverseIndex(): void {
  const allThemes = Object.values(THEME_MANIFEST);
  const push = (key: string, t: ThemeSummary): void => {
    const list = _themesByEntity.get(key);
    if (list) list.push(t);
    else _themesByEntity.set(key, [t]);
  };
  for (const t of allThemes) {
    for (const w of t.words) push(`word:${w}`, t);
    for (const p of t.persons) push(`person:${p}`, t);
    for (const b of t.books) push(`book:${b}`, t);
  }
})();

/** Bir Word/Person/Book entity'sini listeleyen Theme'leri (özet) döner.
 *  Sıra: manifest'teki Theme okuma sırasıyla aynı (deterministik —
 *  generate-manifest.mjs slug alfabetik sıralar, sıralanmış manifestte
 *  reverse-index iteration sırasıyla biner). Boş diziye düşerse hiç
 *  Theme'de geçmiyor demektir; ThemeBadges component'i zaten boşken
 *  `null` render eder.
 *
 *  Önceki imza `Theme[]` döndürüyordu; şimdi `ThemeSummary[]` çünkü full
 *  Theme'i sadece reverse-index için diske dokundurmak istemiyoruz.
 *  ThemeBadges yalnız slug/title/tier okur, bunlar summary'de zaten var.
 */
export function getThemesForEntity(
  type: 'word' | 'person' | 'book',
  slug: string
): ThemeSummary[] {
  return _themesByEntity.get(`${type}:${slug}`) ?? [];
}

// ─── Journey reverse-index (Word.journey_type → Word[]) ──────────────
//
// Dilim 7/7.A: `/journeys/:type` route'unun veri tarafı. Word manifest'i
// üzerinden tek-pas iterasyonla `Map<JourneyType, WordSummary[]>` kurar.
// Theme reverse-index ile aynı pattern — eager IIFE, lazy memoize değil
// (mikro veri, modül yüklenirken tek seferlik kurulur).
//
// Niçin `WordSummary[]` (full Word değil): JourneyPage Word kartlarını
// gösterirken slug + title + literalMeaning + atlasAnchor okur — hepsi
// summary'de. Tam MDX body'sini indirmek absurd olurdu (manifest 1 KB
// vs. body chunk ~12 KB gz × N kelime).
//
// Sıra: manifest'teki Word okuma sırasıyla aynı (alfabetik slug; bu
// generate-manifest.mjs'in sortlu çıktısından gelir). Editöryel sıralama
// (örn. tarihsel öncelik) istenirse ileride bu helper'ın sıralama
// stratejisi değişebilir.

const _wordsByJourney = new Map<string, WordSummary[]>();

(function buildJourneyReverseIndex(): void {
  for (const w of Object.values(WORD_MANIFEST)) {
    if (!w.journey_type) continue;
    const list = _wordsByJourney.get(w.journey_type);
    if (list) list.push(w);
    else _wordsByJourney.set(w.journey_type, [w]);
  }
})();

/** Bir yolculuk arketipine ait Word özetlerini döner. journey_type
 *  string parametresi enum'a uymalı (validate-corpus build-time'da
 *  zorlar); bilinmeyen değer → boş dizi. JourneyPage bunu çağırır,
 *  Words kartlarını listeler. */
export function getWordsByJourney(type: string): WordSummary[] {
  return _wordsByJourney.get(type) ?? [];
}

/** Tüm yolculuk arketiplerini Word sayılarıyla döner — JourneysIndexPage
 *  için. Sıra GRAND_PLAN §4.5'teki kanonik sıralama (translator → diplomatic);
 *  alfabetik değil çünkü editöryel ağırlık var. */
export function listJourneyCounts(): Array<{ type: string; count: number }> {
  const order = [
    'translator',
    'merchant',
    'andalusian',
    'crusader',
    'astronomer',
    'alchemist',
    'diplomatic',
  ];
  return order.map((type) => ({
    type,
    count: _wordsByJourney.get(type)?.length ?? 0,
  }));
}
