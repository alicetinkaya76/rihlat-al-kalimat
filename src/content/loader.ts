import yaml from 'js-yaml';
import { marked } from 'marked';

import type {
  ActorTag,
  Book,
  CircleMember,
  CrossLink,
  EtymologyNode,
  Journey,
  JourneyType,
  Lang,
  Localized,
  Manuscript,
  ManuscriptStatus,
  Person,
  PersonCircle,
  Stratum,
  Theme,
  ThemeAtlasAnchor,
  ThemeTier,
  Translation,
  Word,
} from '@/types/entities';
import { JOURNEY_TYPES } from '@/types/entities';

/**
 * Frontmatter + body parser. Standalone, browser-safe.
 *
 * Dört entity parser'ı:
 *   parseFrontmatter(raw)      — raw .mdx string'i → { data, content }
 *   parseWord(raw, slug)       — Word entity'si (5 strata + etymologyTree)
 *   parsePerson(raw, slug)     — Person (5 strata + circle + cross-links)
 *   parseBook(raw, slug)       — Book (5 strata + manuscripts + translations)
 *   parseTheme(raw, slug)      — Theme (no strata; body + flat slug lists)
 *
 * Hepsi aynı iskeleti paylaşır: frontmatter YAML → tip-güvenli reshape;
 * Markdown body alanları `marked` ile HTML'e çevrilip entity'ye yazılır.
 */

const LANGS: Lang[] = ['tr', 'en', 'ar'];

// ─────────────────────────────────────────────────────────────────────
// Marked yapılandırması
// ─────────────────────────────────────────────────────────────────────

marked.setOptions({
  // Inline HTML (span class="term", span class="ar-inline" gibi) gövdede
  // doğal akar; sanitize ETMİYORUZ çünkü içerik bizim editöryel kontrolümüzde.
  // Asla user-input'tan beslenmez.
  gfm: true,
  breaks: false,
});

// ─────────────────────────────────────────────────────────────────────
// Frontmatter ayrıştırma — gray-matter yerine 5-satırlık regex + js-yaml
// (gray-matter Node-targeted; tarayıcıda ekstra polyfill istemiyoruz).
// ─────────────────────────────────────────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface ParsedDocument {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontmatter(raw: string): ParsedDocument {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    return { data: {}, content: raw };
  }
  const data = yaml.load(match[1] ?? '') as Record<string, unknown> | null;
  return {
    data: data ?? {},
    content: match[2] ?? '',
  };
}

// ─────────────────────────────────────────────────────────────────────
// Yardımcı: Localized<string> içindeki markdown'ı HTML'e çevir
// ─────────────────────────────────────────────────────────────────────

function renderMarkdownLocalized(loc: unknown): Localized<string> {
  const out: Localized<string> = {};
  if (!isObject(loc)) return out;
  for (const lang of LANGS) {
    const md = (loc as Record<string, unknown>)[lang];
    if (typeof md === 'string' && md.trim().length > 0) {
      out[lang] = marked.parse(md, { async: false }) as string;
    }
  }
  return out;
}

/** Localized<string> alanını dönüştürmeden olduğu gibi al — başlık / yer / vb. için. */
function pickLocalized(loc: unknown): Localized<string> {
  const out: Localized<string> = {};
  if (!isObject(loc)) return out;
  for (const lang of LANGS) {
    const v = (loc as Record<string, unknown>)[lang];
    if (typeof v === 'string') out[lang] = v;
  }
  return out;
}

function pickLocalizedStringArray(loc: unknown): Localized<string[]> {
  const out: Localized<string[]> = {};
  if (!isObject(loc)) return out;
  for (const lang of LANGS) {
    const v = (loc as Record<string, unknown>)[lang];
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      out[lang] = v as string[];
    }
  }
  return out;
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

// ─────────────────────────────────────────────────────────────────────
// CrossLink, ActorTag, Stratum, sources reshaping
// ─────────────────────────────────────────────────────────────────────

function reshapeCrossLink(raw: unknown, path: string): CrossLink {
  if (!isObject(raw)) {
    throw new Error(`[${path}] CrossLink expected object, got ${typeof raw}`);
  }
  const targetType = raw.targetType;
  if (
    targetType !== 'word' &&
    targetType !== 'person' &&
    targetType !== 'book' &&
    targetType !== 'theme'
  ) {
    throw new Error(
      `[${path}] CrossLink.targetType invalid: ${String(targetType)}`
    );
  }
  const targetSlug = raw.targetSlug;
  if (typeof targetSlug !== 'string') {
    throw new Error(`[${path}] CrossLink.targetSlug must be string`);
  }
  const status = raw.status === 'live' ? 'live' : 'placeholder';
  const link: CrossLink = {
    targetType,
    targetSlug,
    roman: pickLocalized(raw.roman),
    note: pickLocalized(raw.note),
    status,
  };
  if (typeof raw.arabic === 'string') link.arabic = raw.arabic;
  return link;
}

function reshapeActorTag(raw: unknown, path: string): ActorTag | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!isObject(raw)) {
    throw new Error(`[${path}] actorTag expected object, got ${typeof raw}`);
  }
  const tag: ActorTag = {
    label: pickLocalized(raw.label),
    name: pickLocalized(raw.name),
  };
  if (Array.isArray(raw.personRefs)) {
    tag.personRefs = raw.personRefs.filter((x): x is string => typeof x === 'string');
  }
  if (Array.isArray(raw.bookRefs)) {
    tag.bookRefs = raw.bookRefs.filter((x): x is string => typeof x === 'string');
  }
  return tag;
}

/**
 * Çoklu-yer rotası (`atlasAnchors`) için ortak reshape helper'ı.
 *
 * Dilim 7/5.A: dilim 7/4.C'de Person'a, dilim 7/3.C'de Theme'e tanıtılan
 * `atlasAnchors?: ThemeAtlasAnchor[]` alanı için browser-tarafı parser
 * yoktu — sadece `scripts/generate-manifest.mjs` build-time'da bu alanı
 * okuyup *summary*'lere yazıyordu. Atlas (homepage) summary üzerinden
 * çalıştığı için sorunsuzdu; ama PersonPage / ThemePage runtime'da
 * **full entity**'yi tüketir (lazy MDX'ten parse) — orada bu alan sessiz
 * undefined dönüyordu. ThemePage MiniAtlas hiç render olmuyordu;
 * PersonPage MiniAtlas her zaman tek-anchor fallback'ine düşüyordu.
 *
 * Bu helper hem o gizli regresyonu kapatır hem de Book için açılan
 * üçüncü kullanıcıya hizmet eder — tek bir doğru kaynak. Davranış
 * generate-manifest.mjs/`pickThemeAtlasAnchors` ile birebir:
 *   • Array değilse → undefined (alan opsiyonel)
 *   • Her öğe: `slug` zorunlu, `year` opsiyonel string, `label` opsiyonel
 *     Localized
 *   • Boş array → undefined döner (UI tarafı `length > 0` koşullarıyla
 *     temiz çalışsın diye; manifest taraflı ile aynı sözleşme)
 *
 * Slug bütünlüğü (`ATLAS_PLACES`'ta var mı + tekil mi) burada DEĞİL
 * `scripts/validate-corpus.mjs`'in `checkAtlasAnchorsArray` helper'ında
 * koşar (build-time). Browser parser permissive: validate başarılı
 * olursa runtime parser sessiz kabul eder.
 */
function reshapeAtlasAnchors(raw: unknown): ThemeAtlasAnchor[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ThemeAtlasAnchor[] = [];
  for (const item of raw) {
    if (!isObject(item)) continue;
    const slug = item.slug;
    if (typeof slug !== 'string' || slug.trim().length === 0) continue;
    const entry: ThemeAtlasAnchor = { slug };
    if (typeof item.year === 'string' && item.year.trim().length > 0) {
      entry.year = item.year;
    }
    const label = pickLocalized(item.label);
    // pickLocalized boş Localized {} döner; doluluk kontrolü:
    if (Object.keys(label).length > 0) entry.label = label;
    out.push(entry);
  }
  return out.length > 0 ? out : undefined;
}

function reshapeStratum(raw: unknown, idx: number, path: string): Stratum {
  if (!isObject(raw)) {
    throw new Error(`[${path}] stratum[${idx}] expected object`);
  }
  const idStr = String(raw.id ?? idx + 1);
  if (idStr !== '1' && idStr !== '2' && idStr !== '3' && idStr !== '4' && idStr !== '5') {
    throw new Error(`[${path}] stratum[${idx}].id must be '1'..'5', got ${idStr}`);
  }
  const stratum: Stratum = {
    id: idStr,
    year: typeof raw.year === 'string' ? raw.year : '',
    place: pickLocalized(raw.place),
    title: pickLocalized(raw.title),
    headline: pickLocalized(raw.headline),
    body: renderMarkdownLocalized(raw.body),
  };
  const tag = reshapeActorTag(raw.actorTag, `${path}/stratum[${idx}]`);
  if (tag) stratum.actorTag = tag;
  return stratum;
}

function reshapeSourcesList(raw: unknown): Localized[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => pickLocalized(s));
}

// ─────────────────────────────────────────────────────────────────────
// EtymologyNode (recursive) reshaping
// ─────────────────────────────────────────────────────────────────────

function reshapeEtymologyNode(raw: unknown, path: string): EtymologyNode {
  if (!isObject(raw)) {
    throw new Error(`[${path}] EtymologyNode expected object, got ${typeof raw}`);
  }
  const label = typeof raw.label === 'string' ? raw.label : '';
  if (label.length === 0) {
    throw new Error(`[${path}] EtymologyNode.label must be non-empty string`);
  }
  const node: EtymologyNode = {
    label,
    language: pickLocalized(raw.language),
  };
  if (typeof raw.year === 'string') node.year = raw.year;
  if (Array.isArray(raw.children) && raw.children.length > 0) {
    node.children = raw.children.map((c, i) =>
      reshapeEtymologyNode(c, `${path}/children[${i}]`)
    );
  }
  return node;
}

// ─────────────────────────────────────────────────────────────────────
// Word parser
// ─────────────────────────────────────────────────────────────────────

export function parseWord(rawMdx: string, fallbackSlug: string): Word {
  const { data } = parseFrontmatter(rawMdx);
  const slug = (typeof data.slug === 'string' ? data.slug : fallbackSlug) || fallbackSlug;
  const path = `word/${slug}`;

  if (data.type !== undefined && data.type !== 'word') {
    throw new Error(`[${path}] type expected 'word', got ${String(data.type)}`);
  }
  const tier = data.tier === 'showcase' ? 'showcase' : 'catalogue';

  const variantsRaw = Array.isArray(data.variants) ? data.variants : [];
  const variants = variantsRaw
    .filter(isObject)
    .map((v) => ({
      lang: v.lang as 'turkish' | 'english' | 'arabic',
      form: typeof v.form === 'string' ? v.form : '',
      ...(typeof v.isModern === 'boolean' ? { isModern: v.isModern } : {}),
    }));

  const strataRaw = Array.isArray(data.strata) ? data.strata : [];
  const strata = strataRaw.map((s, i) => reshapeStratum(s, i, path));

  const siblings = (Array.isArray(data.siblings) ? data.siblings : []).map((s, i) =>
    reshapeCrossLink(s, `${path}/siblings[${i}]`)
  );

  const word: Word = {
    slug,
    type: 'word',
    tier,
    title: pickLocalized(data.title),
    strata,
    sources: reshapeSourcesList(data.sources),
    variants,
    literalMeaning: pickLocalized(data.literalMeaning),
    siblings,
  };

  if (typeof data.ipa === 'string') word.ipa = data.ipa;
  if (typeof data.audio === 'string') word.audio = data.audio;
  if (data.category !== undefined) word.category = pickLocalized(data.category);
  if (typeof data.atlasAnchor === 'string') word.atlasAnchor = data.atlasAnchor;
  // Dilim 7/6.A: Word.atlasAnchors çoklu-yer rotası — Person/Book ile
  // simetrik. Cotton'ın Indus → Bağdat → Endülüs hattı, orange'ın iki-kollu
  // Arapça/Portekiz yolculuğu vb. atlasAnchors içine kayda alınır;
  // doluysa Atlas + MiniAtlas tek-yer atlasAnchor'a tercih eder.
  const wordAnchors = reshapeAtlasAnchors(data.atlasAnchors);
  if (wordAnchors) word.atlasAnchors = wordAnchors;
  // Dilim 7/6.C: Word.journey_type (7 yolculuk arketipinden biri).
  // Showcase için beklenir; catalogue'da opsiyonel. Permissive parser:
  // bilinmeyen değer sessizce yutulur, validate-corpus build-time'da
  // enum bütünlüğünü zorlar (fail-fast).
  if (
    typeof data.journey_type === 'string' &&
    (JOURNEY_TYPES as readonly string[]).includes(data.journey_type)
  ) {
    word.journey_type = data.journey_type as JourneyType;
  }
  if (data.etymologyTree !== undefined) {
    word.etymologyTree = reshapeEtymologyNode(
      data.etymologyTree,
      `${path}/etymologyTree`
    );
  }

  return word;
}

// ─────────────────────────────────────────────────────────────────────
// CircleMember + PersonCircle (discriminated union) reshaping
// ─────────────────────────────────────────────────────────────────────

function reshapeCircleMember(raw: unknown, path: string): CircleMember {
  if (!isObject(raw)) {
    throw new Error(`[${path}] CircleMember expected object, got ${typeof raw}`);
  }
  const m: CircleMember = {
    name: pickLocalized(raw.name),
    years: typeof raw.years === 'string' ? raw.years : '',
    note: pickLocalized(raw.note),
  };
  if (typeof raw.arabicName === 'string') m.arabicName = raw.arabicName;
  if (typeof raw.personSlug === 'string') m.personSlug = raw.personSlug;
  return m;
}

function reshapePersonCircle(raw: unknown, path: string): PersonCircle {
  // Veri yoksa veya direction ayarlanmamışsa → 'none'.
  if (!isObject(raw)) return { direction: 'none' };
  const dir = raw.direction;
  if (dir !== 'forward' && dir !== 'contemporary' && dir !== 'none') {
    throw new Error(
      `[${path}] PersonCircle.direction must be 'forward'|'contemporary'|'none', got ${String(dir)}`
    );
  }
  if (dir === 'none') {
    const out: PersonCircle = { direction: 'none' };
    return out;
  }
  // 'forward' | 'contemporary' → label + en az bir üye zorunlu.
  const membersRaw = Array.isArray(raw.members) ? raw.members : [];
  const members = membersRaw.map((m, i) =>
    reshapeCircleMember(m, `${path}/members[${i}]`)
  );
  if (members.length === 0) {
    throw new Error(
      `[${path}] PersonCircle direction='${dir}' requires at least one member`
    );
  }
  // Non-empty tuple type için cast — runtime kontrolü yukarıda zaten yapıldı.
  const [first, ...rest] = members as [CircleMember, ...CircleMember[]];
  return {
    direction: dir,
    label: pickLocalized(raw.label),
    members: [first, ...rest],
  };
}

// ─────────────────────────────────────────────────────────────────────
// Manuscript (discriminated union: status='full' → url required)
// ─────────────────────────────────────────────────────────────────────

function reshapeManuscript(raw: unknown, path: string): Manuscript {
  if (!isObject(raw)) {
    throw new Error(`[${path}] Manuscript expected object, got ${typeof raw}`);
  }
  const rawStatus = raw.status;
  const status: ManuscriptStatus =
    rawStatus === 'full' || rawStatus === 'partial' || rawStatus === 'offline'
      ? rawStatus
      : 'partial';
  const shelfmark = typeof raw.shelfmark === 'string' ? raw.shelfmark : '';
  const name = pickLocalized(raw.name);
  const where = pickLocalized(raw.where);
  if (status === 'full') {
    if (typeof raw.url !== 'string' || raw.url.length === 0) {
      throw new Error(`[${path}] Manuscript status='full' requires non-empty 'url'`);
    }
    return { status: 'full', shelfmark, name, where, url: raw.url };
  }
  // partial / offline — url opsiyonel
  const partial: Manuscript = { status, shelfmark, name, where };
  if (typeof raw.url === 'string') partial.url = raw.url;
  return partial;
}

// ─────────────────────────────────────────────────────────────────────
// Translation
// ─────────────────────────────────────────────────────────────────────

function reshapeTranslation(raw: unknown, path: string): Translation {
  if (!isObject(raw)) {
    throw new Error(`[${path}] Translation expected object, got ${typeof raw}`);
  }
  const t: Translation = {
    year: typeof raw.year === 'string' ? raw.year : '',
    language: typeof raw.language === 'string' ? raw.language : '',
    name: typeof raw.name === 'string' ? raw.name : '',
    by: pickLocalized(raw.by),
  };
  if (typeof raw.translatorSlug === 'string') t.translatorSlug = raw.translatorSlug;
  return t;
}

// ─────────────────────────────────────────────────────────────────────
// Person parser
// ─────────────────────────────────────────────────────────────────────

export function parsePerson(rawMdx: string, fallbackSlug: string): Person {
  const { data } = parseFrontmatter(rawMdx);
  const slug = (typeof data.slug === 'string' ? data.slug : fallbackSlug) || fallbackSlug;
  const path = `person/${slug}`;

  if (data.type !== undefined && data.type !== 'person') {
    throw new Error(`[${path}] type expected 'person', got ${String(data.type)}`);
  }
  const tier = data.tier === 'showcase' ? 'showcase' : 'catalogue';

  const romanName =
    typeof data.romanName === 'string' && data.romanName.length > 0
      ? data.romanName
      : slug;

  const strataRaw = Array.isArray(data.strata) ? data.strata : [];
  const strata = strataRaw.map((s, i) => reshapeStratum(s, i, path));

  const wordsIndebtedRaw = Array.isArray(data.wordsIndebted) ? data.wordsIndebted : [];
  const wordsIndebted = wordsIndebtedRaw.map((s, i) =>
    reshapeCrossLink(s, `${path}/wordsIndebted[${i}]`)
  );

  const worksRaw = Array.isArray(data.works) ? data.works : [];
  const works = worksRaw.map((s, i) => reshapeCrossLink(s, `${path}/works[${i}]`));

  const circle = reshapePersonCircle(data.circle, `${path}/circle`);

  const person: Person = {
    slug,
    type: 'person',
    tier,
    title: pickLocalized(data.title),
    strata,
    sources: reshapeSourcesList(data.sources),
    romanName,
    roleBadges: pickLocalizedStringArray(data.roleBadges),
    circle,
  };

  if (data.category !== undefined) person.category = pickLocalized(data.category);
  if (typeof data.atlasAnchor === 'string') person.atlasAnchor = data.atlasAnchor;
  // Dilim 7/5.A: full Person tarafında atlasAnchors parsing — dilim 7/4.C'de
  // type ve manifest tarafı eklenmişti, parser tarafı eksikti. PersonPage
  // MiniAtlas adaptörü `person.atlasAnchors`'i sorgular (ben tek slug
  // fallback'i değil çoklu rotaya öncelik vermek için); manifest summary
  // homepage Atlas'ı için doğru olsa da entity sayfası tarafı boş kalıyordu.
  const personAnchors = reshapeAtlasAnchors(data.atlasAnchors);
  if (personAnchors) person.atlasAnchors = personAnchors;
  if (typeof data.arabicName === 'string') person.arabicName = data.arabicName;
  if (data.trForm !== undefined) person.trForm = pickLocalized(data.trForm);
  if (typeof data.lifespan === 'string') person.lifespan = data.lifespan;
  if (data.birthplace !== undefined) person.birthplace = pickLocalized(data.birthplace);
  if (data.activeIn !== undefined) person.activeIn = pickLocalized(data.activeIn);
  if (data.workLanguages !== undefined) {
    person.workLanguages = pickLocalized(data.workLanguages);
  }
  if (data.nisba !== undefined) person.nisba = pickLocalized(data.nisba);
  if (wordsIndebted.length > 0) person.wordsIndebted = wordsIndebted;
  if (works.length > 0) person.works = works;

  return person;
}

// ─────────────────────────────────────────────────────────────────────
// Book parser
// ─────────────────────────────────────────────────────────────────────

export function parseBook(rawMdx: string, fallbackSlug: string): Book {
  const { data } = parseFrontmatter(rawMdx);
  const slug = (typeof data.slug === 'string' ? data.slug : fallbackSlug) || fallbackSlug;
  const path = `book/${slug}`;

  if (data.type !== undefined && data.type !== 'book') {
    throw new Error(`[${path}] type expected 'book', got ${String(data.type)}`);
  }
  const tier = data.tier === 'showcase' ? 'showcase' : 'catalogue';

  const strataRaw = Array.isArray(data.strata) ? data.strata : [];
  const strata = strataRaw.map((s, i) => reshapeStratum(s, i, path));

  const fullArabicTitle =
    typeof data.fullArabicTitle === 'string' ? data.fullArabicTitle : '';
  const authorSlug = typeof data.authorSlug === 'string' ? data.authorSlug : '';
  const composedYear = typeof data.composedYear === 'string' ? data.composedYear : '';

  const manuscriptsRaw = Array.isArray(data.manuscripts) ? data.manuscripts : [];
  const manuscripts = manuscriptsRaw.map((m, i) =>
    reshapeManuscript(m, `${path}/manuscripts[${i}]`)
  );

  const translationsRaw = Array.isArray(data.translations) ? data.translations : [];
  const translations = translationsRaw.map((t, i) =>
    reshapeTranslation(t, `${path}/translations[${i}]`)
  );

  const relatedWordsRaw = Array.isArray(data.relatedWords) ? data.relatedWords : [];
  const relatedWords = relatedWordsRaw.map((s, i) =>
    reshapeCrossLink(s, `${path}/relatedWords[${i}]`)
  );

  const book: Book = {
    slug,
    type: 'book',
    tier,
    title: pickLocalized(data.title),
    strata,
    sources: reshapeSourcesList(data.sources),
    fullArabicTitle,
    transliteration: pickLocalized(data.transliteration),
    titleMeaning: pickLocalized(data.titleMeaning),
    authorSlug,
    composedYear,
    composedPlace: pickLocalized(data.composedPlace),
    originalLanguage: pickLocalized(data.originalLanguage),
    genreBadges: pickLocalizedStringArray(data.genreBadges),
    manuscripts,
    translations,
    relatedWords,
  };

  if (data.category !== undefined) book.category = pickLocalized(data.category);
  if (typeof data.atlasAnchor === 'string') book.atlasAnchor = data.atlasAnchor;
  // Dilim 7/5.A: Book.atlasAnchors — kitabın hayat rotası (yazıldığı yer +
  // tercüme/dağılım yerleri). Person.atlasAnchors ile aynı şekil; aynı
  // reshape helper'ı; validate ve manifest tarafı simetrik.
  const bookAnchors = reshapeAtlasAnchors(data.atlasAnchors);
  if (bookAnchors) book.atlasAnchors = bookAnchors;
  if (data.openingQuote !== undefined) {
    book.openingQuote = pickLocalized(data.openingQuote);
  }

  return book;
}

// ─────────────────────────────────────────────────────────────────────
// Theme parser
// ─────────────────────────────────────────────────────────────────────
//
// Theme şeması diğer üç entity'den belirgin biçimde farklı:
//   • strata yok (zamana yayılmış bir kazı sayfası değil — esay/küme)
//   • CrossLink yapısı yok; words/persons/books düz slug listeleri
//   • sources `Localized<string[]>` (her dil kendi bibliyografyasını
//     taşır — magnum esaylar dile göre farklı kaynaklara dayanabilir;
//     diğer entity'lerde her source tek bir multi-lingual citation idi)
//   • body tek bir multi-lingual markdown alanı (parseTheme onu HTML'e
//     çevirip kaydeder, render zamanında dangerouslySetInnerHTML ile
//     basılır — Stratum.body ile aynı pattern)
//   • opsiyonel atlasAnchor yok: GRAND_PLAN §4.4 Theme'lerin coğrafi
//     yeri olmayabilir (soyut tema). Schema'da BaseEntity'i extend
//     etmediğimiz zaten bunu söylüyor.
//
// Tier kontrolü: 'magnum' | 'cluster' (DATA-SCHEMA §4.4.6). Tanımsız
// gelirse default 'cluster' (daha sade, daha güvenli).

function parseSlugList(raw: unknown, path: string): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    throw new Error(`[${path}] expected array of slug strings, got ${typeof raw}`);
  }
  return raw.map((v, i) => {
    if (typeof v !== 'string' || v.trim().length === 0) {
      throw new Error(
        `[${path}[${i}]] expected non-empty slug string, got ${String(v)}`
      );
    }
    return v;
  });
}

export function parseTheme(rawMdx: string, fallbackSlug: string): Theme {
  const { data } = parseFrontmatter(rawMdx);
  const slug = (typeof data.slug === 'string' ? data.slug : fallbackSlug) || fallbackSlug;
  const path = `theme/${slug}`;

  if (data.type !== undefined && data.type !== 'theme') {
    throw new Error(`[${path}] type expected 'theme', got ${String(data.type)}`);
  }
  const tier: ThemeTier = data.tier === 'magnum' ? 'magnum' : 'cluster';

  const theme: Theme = {
    slug,
    type: 'theme',
    tier,
    title: pickLocalized(data.title),
    body: renderMarkdownLocalized(data.body),
    words: parseSlugList(data.words, `${path}/words`),
    persons: parseSlugList(data.persons, `${path}/persons`),
    books: parseSlugList(data.books, `${path}/books`),
    sources: pickLocalizedStringArray(data.sources),
  };

  if (data.subtitle !== undefined) {
    theme.subtitle = pickLocalized(data.subtitle);
  }
  // Dilim 7/5.A: parseTheme'in atlasAnchors gözardı'sı dilim 7/3.C'den beri
  // gizli kalan bir regresyondu — ThemePage'in `theme.atlasAnchors &&
  // theme.atlasAnchors.length > 0` koşulu her zaman false dönüyor, MiniAtlas
  // hiç render olmuyordu. (Atlas tarafı manifest'ten okuduğu için pin
  // rotaları orada doğru çiziliyordu; tek noksanlık ThemePage içindeydi.)
  const themeAnchors = reshapeAtlasAnchors(data.atlasAnchors);
  if (themeAnchors) theme.atlasAnchors = themeAnchors;

  return theme;
}

// ─────────────────────────────────────────────────────────────────────
// Journey parser (dilim 7/35 — Shape ο)
// ─────────────────────────────────────────────────────────────────────
//
// Yolculuk arketipinin tam essay'i. Theme ile yapısal olarak çok yakın
// (body + sources, ama words/persons/books listesi YOK — reverse-index
// zaten Word.journey_type'tan besleniyor) ama slug'ı `JourneyType`
// enum'una kilitli; tier yok (7 arketip eşit yetkili).
//
// Hata yönetimi: bilinmeyen slug → throw (validate-corpus build-time'da
// önceden yakalar, bu son savunma hattı).

export function parseJourney(rawMdx: string, fallbackSlug: string): Journey {
  const { data } = parseFrontmatter(rawMdx);
  const slug = (typeof data.slug === 'string' ? data.slug : fallbackSlug) || fallbackSlug;
  const path = `journey/${slug}`;

  if (data.type !== undefined && data.type !== 'journey') {
    throw new Error(`[${path}] type expected 'journey', got ${String(data.type)}`);
  }
  if (!(JOURNEY_TYPES as readonly string[]).includes(slug)) {
    throw new Error(
      `[${path}] slug '${slug}' is not in canonical JOURNEY_TYPES (${JOURNEY_TYPES.join(', ')})`
    );
  }

  return {
    slug: slug as JourneyType,
    type: 'journey',
    title: pickLocalized(data.title),
    subtitle: pickLocalized(data.subtitle),
    body: renderMarkdownLocalized(data.body),
    sources: pickLocalizedStringArray(data.sources),
  };
}

// ─────────────────────────────────────────────────────────────────────
// İhraç edilen yardımcılar — başka modüllerden de yararlı
// ─────────────────────────────────────────────────────────────────────

export { LANGS };
export const _internal = { pickLocalized, renderMarkdownLocalized, isObject };
