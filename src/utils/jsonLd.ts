/**
 * RIḤLAT AL-KALIMĀT · JSON-LD (schema.org) yapılandırılmış veri haritası
 * ----------------------------------------------------------------------
 * Dilim 7/29.κ — polish. Her entity sayfasına schema.org formatında
 * yapılandırılmış veri eklemek için merkezi yardımcı.
 *
 * Niçin JSON-LD:
 *  • Google/Bing/DuckDuckGo crawler'ları için yapılandırılmış girdi —
 *    search snippet'lerde zengin görünüm (knowledge panel, breadcrumb).
 *  • Schema.org tipleri evrensel; semantik web (Linked Open Data)
 *    için temel kanca.
 *
 * Tip eşlemesi:
 *   Person  → schema.org/Person
 *   Book    → schema.org/Book
 *   Word    → schema.org/DefinedTerm   (etimolojik bir sözlük girdisi)
 *   Theme   → schema.org/Article       (yapısal bir kapsayıcı yazı)
 *
 * Tasarım disiplini:
 *  • Salt-fonksiyon: tip → JSON-LD object. Yan etki yok.
 *  • Çıktı `unknown` değil tipize edilmiş Record<string, unknown> —
 *    schema.org "free-form" yapı; biz @type + @context'i garanti
 *    ediyoruz, geri kalanı esnek.
 *  • Multi-dilli alanlar `pickLang` aracılığıyla aktif dilde okunur;
 *    alternateName olarak diğer iki dil de eklenir (hreflang-benzeri).
 *  • URL alanları absolute olmalıdır — origin parametresi build-time
 *    `SITE_ORIGIN` env'inden okunur (vite.config'teki rihlaOriginInject
 *    plugin'i index.html için yapar; biz runtime'da `window.location.origin`
 *    fallback ile aynı sonuca varırız).
 *
 * Niçin runtime origin fallback:
 *   Statik deploy'da JSON-LD inline script olarak React tarafından
 *   inject edilir; build-time'da hangi origin'e gideceğini bilmeyiz
 *   (preview/staging/production ayrı domain'ler olabilir). Runtime'da
 *   `window.location.origin` her zaman gerçek host'u verir. SSR
 *   yapıyor olsaydık `SITE_ORIGIN`'i preferred ederdik; SPA'da değil.
 */

import type {
  Book,
  Lang,
  Localized,
  Person,
  Theme,
  Word,
} from '@/types/entities';
import { pickLang } from './localized';

// ──────────────────────────────────────────────────────────────────────
// Yardımcılar
// ──────────────────────────────────────────────────────────────────────

const LANG_MAP: Record<Lang, string> = {
  tr: 'tr',
  en: 'en',
  ar: 'ar',
};

/**
 * Çok-dilli alandan ana değeri + diğer iki dilin alternateName listesini
 * çıkarır. `name` aktif locale; `alternateName` diğerleri (sadece dolu
 * olanlar). Showcase tier her zaman ≥2 dolu, catalogue ≥1.
 */
function pickAllLangs<T>(
  loc: Localized<T> | undefined,
  active: Lang
): { name?: T; alternateName: T[] } {
  if (!loc) return { name: undefined, alternateName: [] };
  const name = loc[active];
  const others: T[] = [];
  for (const l of ['tr', 'en', 'ar'] as Lang[]) {
    if (l === active) continue;
    if (loc[l] !== undefined) others.push(loc[l]!);
  }
  return { name, alternateName: others };
}

/**
 * `c. 973 – c. 1050` → { birthDate: "973", deathDate: "1050" }
 *
 * Dönemde "c." (circa) prefix'i, " – " separator'ı kullanılıyor.
 * Schema.org `birthDate` ISO-8601 (yıl-only kabul ediyor — 4-haneli
 * yıl). Parse hata verirse ikisi de undefined döner; schema-validator
 * eksik alanı tolere eder.
 */
function parseLifespan(
  lifespan?: string
): { birthDate?: string; deathDate?: string } {
  if (!lifespan) return {};
  // Match patterns like "c. 973 – c. 1050", "1170 – 1250", "973 – 1050"
  // Allow either em-dash or en-dash; flexible whitespace.
  const m = lifespan.match(/(?:c\.\s*)?(-?\d{1,4})\s*[–\-]\s*(?:c\.\s*)?(-?\d{1,4})/);
  if (!m) return {};
  return { birthDate: m[1], deathDate: m[2] };
}

function absoluteUrl(path: string): string {
  if (typeof window === 'undefined') {
    // Build-time SSR safety: relative paths are fine for static
    // generators; CSR will rewrite via window.location.
    return path;
  }
  // Already absolute?
  if (/^https?:\/\//.test(path)) return path;
  const origin = window.location.origin;
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

// ──────────────────────────────────────────────────────────────────────
// Per-entity JSON-LD üreticileri
// ──────────────────────────────────────────────────────────────────────

export interface JsonLdContext {
  /** Aktif UI dili. Hangi locale'in `name` olacağını belirler. */
  lang: Lang;
  /** Sayfanın canonical path'i — `/en/person/al-biruni` gibi. */
  pagePath: string;
}

/**
 * Person → schema.org/Person
 *
 * Alanlar:
 *   name           — aktif dilde tam ad
 *   alternateName  — diğer iki dildeki adlar
 *   description    — trForm (kişinin sıkıştırılmış tek-cümle özeti)
 *   birthDate      — lifespan'dan parse
 *   deathDate      — lifespan'dan parse
 *   birthPlace     — birthplace.{lang}
 *   jobTitle       — category (Matematikçi · Astronom · …)
 *   url            — canonical sayfa URL'i
 *   sameAs         — şimdilik boş; Wikidata/VIAF kanca'sı ileride
 */
export function buildPersonJsonLd(
  person: Person,
  ctx: JsonLdContext
): Record<string, unknown> {
  const { name, alternateName } = pickAllLangs(person.title, ctx.lang);
  const { birthDate, deathDate } = parseLifespan(person.lifespan);
  const description = pickLang(person.trForm, ctx.lang);
  const birthPlace = pickLang(person.birthplace, ctx.lang);
  const jobTitle = pickLang(person.category, ctx.lang);

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    inLanguage: LANG_MAP[ctx.lang],
    url: absoluteUrl(ctx.pagePath),
  };

  if (alternateName.length > 0) node.alternateName = alternateName;
  if (description) node.description = description;
  if (birthDate) node.birthDate = birthDate;
  if (deathDate) node.deathDate = deathDate;
  if (birthPlace) node.birthPlace = { '@type': 'Place', name: birthPlace };
  if (jobTitle) node.jobTitle = jobTitle;

  return node;
}

/**
 * Book → schema.org/Book
 *
 * Alanlar:
 *   name           — title.{lang}
 *   alternateName  — diğer iki dil
 *   description    — trForm
 *   inLanguage     — lang
 *   url            — canonical
 *
 * Notlar:
 *   • Book entity bizde tarihi metin (al-Jabr, Liber Abaci…); author
 *     genelde Person entity'mizde var ama Book yapısında doğrudan
 *     bağlı değil — şimdilik author alanını boş bırakıyoruz, ileride
 *     reverse-index ile eklenebilir.
 *   • Schema.org/Book'un `bookFormat` alanı modern format'lar için
 *     (Paperback, Hardcover); el yazması metinler için uygun değil.
 *     `temporalCoverage` (yıl) ekleyebilirdik ama Book.lifespan yok.
 */
export function buildBookJsonLd(
  book: Book,
  ctx: JsonLdContext
): Record<string, unknown> {
  const { name, alternateName } = pickAllLangs(book.title, ctx.lang);
  // Book'un kendisinde `trForm` yok (Person'a özgü); en yakın özet
  // alanı `titleMeaning` (başlığın anlam-çözümü). Schema.org'un
  // description'ı serbest metin kabul ediyor.
  const description = pickLang(book.titleMeaning, ctx.lang);

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name,
    inLanguage: LANG_MAP[ctx.lang],
    url: absoluteUrl(ctx.pagePath),
  };

  if (alternateName.length > 0) node.alternateName = alternateName;
  if (description) node.description = description;
  if (book.composedYear) node.datePublished = book.composedYear;

  return node;
}

/**
 * Word → schema.org/DefinedTerm
 *
 * Niçin DefinedTerm yerine Article ya da Thing:
 *  • DefinedTerm semantik web'de bir sözlük/glosari girdisi için
 *    tasarlandı — `inDefinedTermSet` ile parent set'e bağlanabilir.
 *    Bizim Word'ümüz tam olarak bu: etimolojik bir sözlük girdisi.
 *  • Article bir yazı/makale içindir; bizim Word sayfası katmanlı
 *    olsa da kavramsal olarak yazı değil terim.
 *  • Thing fazla genel.
 *
 * Alanlar:
 *   name           — slug (ya da locale'lenmiş daha iyi varsa)
 *   alternateName  — diğer dillerde imla varyantları (ileride
 *                    variants[] üzerinden çıkarılabilir)
 *   description    — trForm
 *   url            — canonical
 */
export function buildWordJsonLd(
  word: Word,
  ctx: JsonLdContext
): Record<string, unknown> {
  const { name, alternateName } = pickAllLangs(word.title, ctx.lang);
  // Word'da `trForm` yok (Person'a özgü); en yakın açıklama alanı
  // `literalMeaning` (kelimenin Arapça-orijinal anlamı/etimolojik
  // tanımı). DefinedTerm.description için doğal eşleşme.
  const description = pickLang(word.literalMeaning, ctx.lang);

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    // Word'un title.tr/en/ar yoksa slug'a düş — name zorunlu
    name: name ?? word.slug,
    inLanguage: LANG_MAP[ctx.lang],
    url: absoluteUrl(ctx.pagePath),
  };

  if (alternateName.length > 0) node.alternateName = alternateName;
  if (description) node.description = description;

  return node;
}

/**
 * Theme → schema.org/Article
 *
 * Theme yapısal bir kapsayıcı yazı: bir konu etrafında birkaç Word/
 * Person/Book entity'sini bağlar. Article semantiği uygun (Theme bizde
 * stratum yapısı taşımıyor, ama düz prose + bağlantılar).
 *
 * Alanlar:
 *   headline       — title.{lang}
 *   alternateName  — diğer dillerde başlıklar
 *   description    — trForm (theme'in özeti)
 *   url            — canonical
 *   inLanguage     — aktif dil
 *   articleSection — "Theme" (kategori etiketi)
 */
export function buildThemeJsonLd(
  theme: Theme,
  ctx: JsonLdContext
): Record<string, unknown> {
  const { name, alternateName } = pickAllLangs(theme.title, ctx.lang);
  // Theme'de `trForm` yok; en uygun açıklama `subtitle` (varsa) ya da
  // `body`'nin ilk 200 karakteri. Subtitle'ın varlığı içerik-bazlı;
  // catalogue tier'da bazen boş, magnum'da hep dolu.
  const subtitle = pickLang(theme.subtitle, ctx.lang);
  const body = pickLang(theme.body, ctx.lang);
  const description =
    subtitle ??
    (body
      ? body
          .replace(/[#*_`>]/g, '') // markdown sözcükçeleri yumuşat
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 200) + (body.length > 200 ? '…' : '')
      : undefined);

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: name,
    name,
    inLanguage: LANG_MAP[ctx.lang],
    url: absoluteUrl(ctx.pagePath),
    articleSection: 'Theme',
  };

  if (alternateName.length > 0) node.alternateName = alternateName;
  if (description) node.description = description;

  return node;
}

/**
 * Site-genel → schema.org/WebSite
 *
 * HomePage'de bir kez render edilir; site adı + ana URL + 3 dil-alternates.
 * Knowledge panel için temel girdi.
 */
export function buildWebSiteJsonLd(ctx: JsonLdContext): Record<string, unknown> {
  // Site açıklaması üç dilde sabit metin — i18n bundle'a taşımak overkill
  // (yalnız bir yerde, sabit, site-marka açıklaması). ctx.lang aktif dile
  // göre seçiyoruz; AR/EN'de farklı vurgu.
  const DESCRIPTION: Record<typeof ctx.lang, string> = {
    tr: 'Türkçe — İngilizce — Arapça etimolojik bilgi grafı. 4-varlık modeli: Word · Person · Book · Theme.',
    en: 'A Turkish — English — Arabic etymological knowledge graph. A four-entity model: Word · Person · Book · Theme.',
    ar: 'مَخطَطٌ مَعرفيٌّ اشتقاقيٌّ ثُلاثيُّ اللُّغة (التركيّةُ — الإنجليزيّةُ — العربيّةُ). نَموذَجٌ من أَربَعِ كياناتٍ: الكَلِمةُ · الشَّخصُ · الكِتابُ · المَوضوع.',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Riḥlat al-Kalimāt',
    alternateName: 'رِحلة الكَلِمات',
    description: DESCRIPTION[ctx.lang],
    url: absoluteUrl('/'),
    inLanguage: ['tr', 'en', 'ar'],
  };
}

// ──────────────────────────────────────────────────────────────────────
// BreadcrumbList (κ-prime — dilim 7/30)
// ──────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** İnsan-okunaklı etiket (aktif locale'de). */
  name: string;
  /** Path (absolute path; absoluteUrl wrapper'ı domain prefix ekler).
   *  Son item'in URL'i de eklenir — Google'ın önerisi: BreadcrumbList
   *  bütün item'ları (current page dahil) `item` field'ıyla taşımalı. */
  path: string;
}

/**
 * BreadcrumbList → schema.org/BreadcrumbList
 *
 * Niçin:
 *  • Google arama sonucu sayfanın URL'inin yerine breadcrumb trail
 *    gösterir (örn. `rihla > Persons > al-Bīrūnī` yerine
 *    çıplak URL). Tıklanabilirlik ve hierarchical-context iletir.
 *  • Sitenin tipik kullanıcı yolu (Home → Liste → Entity) zaten
 *    UI'da yok (sayfada visible breadcrumb yok); ama JSON-LD ile
 *    invisible olarak bu hierarchical hint'i veririz. Google bunu
 *    UI'da olmadan da kabul eder ("Breadcrumb structured data may
 *    or may not be reflected in the page UI" — Google docs).
 *
 * Yapı:
 *   itemListElement: [
 *     { @type: ListItem, position: 1, name: "...", item: url },
 *     { @type: ListItem, position: 2, name: "...", item: url },
 *     { @type: ListItem, position: 3, name: "...", item: url },
 *   ]
 *
 * `position` 1-indexed; Google bunu çiğ kullanır ("First item is the
 * top-level page"). En kısa breadcrumb: 2 element (Home → current).
 * Tipik: 3 element (Home → ListPage → EntityPage). Theme'in liste
 * sayfası yok; o yüzden Theme breadcrumb'ı 2-element (Home → Theme).
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
