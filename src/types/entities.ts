/**
 * RIḤLAT AL-KALIMĀT · veri modeli
 * ----------------------------------------------------------------------
 * DATA-SCHEMA.md (Oturum 2 sonu) → TypeScript.
 *
 * Tasarım notları:
 *  • §13'teki validasyon kurallarının kompile-zaman uygulanabilenleri
 *    discriminated union ile zorlandı (PersonCircle, Manuscript).
 *  • "Tam 5 stratum" kuralı tip-zorlamayla esnek tutuldu — MDX
 *    frontmatter'tan parse edilen array'in uzunluğu runtime'da
 *    `assertFiveStrata` ile doğrulanır (bkz. en altta).
 *  • Theme bilerek BaseEntity'i extend ETMİYOR; strata'sı yok.
 *  • `sources` Theme'de `Localized<string[]>`, diğerlerinde `Localized[]` —
 *    DATA-SCHEMA'daki şekil farkı bilinçli olarak korundu (Theme'de
 *    her dil kendi kaynak listesini taşır; Word/Person/Book'ta her
 *    kaynak tek bir çok-dilli alıntıdır).
 */

// ───────────────────────────────────────────────────────────────────────
// §1 · Yardımcı tipler
// ───────────────────────────────────────────────────────────────────────

export type Lang = 'tr' | 'en' | 'ar';

/** Bir alanın çok-dilli sözlüğü. En az bir dilin dolu olması beklenir
 *  (showcase'te ≥2; runtime validator). */
export type Localized<T = string> = Partial<Record<Lang, T>>;

export type EntityType = 'word' | 'person' | 'book' | 'theme';
export type Tier = 'showcase' | 'catalogue';
export type ManuscriptStatus = 'full' | 'partial' | 'offline';
export type CircleDirection = 'forward' | 'contemporary' | 'none';
export type ThemeTier = 'magnum' | 'cluster';

/**
 * §4.5 GRAND_PLAN'da tanımlı 7 yolculuk arketipi. Word.journey_type
 * bu union'dan bir değer alır (opsiyonel — kategorize edilmemiş Word'ler
 * için boş bırakılabilir). Dilim 7/6.C'de tanıtıldı.
 *
 * Slug'lar URL-güvenli, lowercase, dash'siz; ileride `/journeys/:type`
 * route'unun param'i olarak kullanılır.
 *
 *   translator   → Mütercimin Yolu (Toledo–Salerno çevirmenler)
 *   merchant     → Tüccarın Kervanı (Akdeniz ticaret yolları)
 *   andalusian   → Endülüs Tortusu (al-Andalus dilsel sediment)
 *   crusader     → Haçlının Hatırası (Haçlı seferleri ödüncleri)
 *   astronomer   → Yıldızbilimcinin Mirası (Arapça gök kataloğu)
 *   alchemist    → Simyacının Atölyesi (damıtma/laboratuvar dili)
 *   diplomatic   → Diplomatik Mübadele (saray/protokol/posta)
 *
 * i18n locales'te `journeys.<type>` anahtarları üç dilde dolu;
 * JourneyBadge component bunları okur. validate-corpus build-time'da
 * enum bütünlüğünü zorlar (bilinmeyen değer → exit 1).
 */
export type JourneyType =
  | 'translator'
  | 'merchant'
  | 'andalusian'
  | 'crusader'
  | 'astronomer'
  | 'alchemist'
  | 'diplomatic';

/** Bilinen 7 arketipin tüplü dizisi — runtime validator + UI mapping için
 *  tek doğru kaynak. Yeni arketip eklenirse iki yer güncellenir: bu liste
 *  + ilgili i18n anahtarı. */
export const JOURNEY_TYPES = [
  'translator',
  'merchant',
  'andalusian',
  'crusader',
  'astronomer',
  'alchemist',
  'diplomatic',
] as const satisfies readonly JourneyType[];

// ───────────────────────────────────────────────────────────────────────
// §2 · Stratum (Word, Person, Book için ortak ters-kronolojik kazı birimi)
// ───────────────────────────────────────────────────────────────────────

export type StratumId = '1' | '2' | '3' | '4' | '5';

export interface Stratum {
  id: StratumId;
  /** "2026", "1145", "~825", "628 ↓". "↓" pre-stratum (öncül) işareti. */
  year: string;
  place: Localized;
  title: Localized;
  headline: Localized;
  /** Markdown gövde, prose içi xlink'ler dahil. Her dil için ayrı string. */
  body: Localized;
  actorTag?: ActorTag;
}

export interface ActorTag {
  label: Localized;
  /** Aktörün görünür adı + bu stratum'a özgü kısa anotasyon
   *  (örn. "Alan Turing — Hesaplanabilir Sayılar (1936)"). Dile göre
   *  farklılaşabildiği için Localized; canonical reference için ayrıca
   *  personRefs / bookRefs slug'ları kullanılır. */
  name: Localized<string>;
  personRefs?: string[];
  bookRefs?: string[];
}

/** İsteğe bağlı strict-tuple alias'ı: "tam 5 stratum" kuralının tip-zorlaması. */
export type StrictStrata = readonly [Stratum, Stratum, Stratum, Stratum, Stratum];

// ───────────────────────────────────────────────────────────────────────
// §3 · CrossLink (sidebar kartları)
// ───────────────────────────────────────────────────────────────────────

export interface CrossLink {
  targetType: EntityType;
  targetSlug: string;
  arabic?: string;
  roman: Localized;
  note: Localized;
  status: 'live' | 'placeholder';
}

// ───────────────────────────────────────────────────────────────────────
// §8 · BaseEntity (Word, Person, Book için ortak iskelet)
// ───────────────────────────────────────────────────────────────────────

export interface BaseEntity {
  slug: string;
  type: EntityType;
  tier: Tier;
  title: Localized;
  category?: Localized;
  /** Tam 5 öğe; runtime validator ile doğrula. Tipe yapışkan
   *  StrictStrata kullanmak istersen kendi entry'lerini öyle yaz. */
  strata: Stratum[];
  /** Çok-dilli alıntıların listesi: her öğe { tr?, en?, ar? } sözlüğü. */
  sources: Localized[];
  /** Atlas haritasındaki coğrafi çapa — `ATLAS_PLACES` tablosundaki bir
   *  slug'a referans (örn. "khwarazm", "baghdad", "toledo"). Lat-lng değil;
   *  atlas-SVG'nin kendi koordinat sistemi. Opsiyonel: bir entity'nin
   *  haritada yeri olmayabilir (örn. dilbilim teorisi gibi soyut Theme'ler).
   *  Yer slug'ı ATLAS_PLACES'da yoksa validateCorpusCollect uyarır. */
  atlasAnchor?: string;
}

// ───────────────────────────────────────────────────────────────────────
// §4 · Word
// ───────────────────────────────────────────────────────────────────────

export interface WordVariant {
  /** Linguistic kayıt — UI locale'inden farklı (etimolojik kaynak). */
  lang: 'turkish' | 'english' | 'arabic';
  form: string;
  isModern?: boolean;
}

export interface EtymologyNode {
  /** Etimonun kanonik formu — örn. "الخوارزميّ", "Algoritmi · Algorismus".
   *  Kelimenin kendisi tek; localize edilmez (transliterasyon ya da
   *  alternatif yazımlar gerekirse `label` içinde "·" ile ayrılır). */
  label: string;
  /** Dil/aşama açıklaması — TR "Eski Fransızca" / EN "Old French" / AR
   *  "الفرنسيّة القديمة". ActorTag.name ile aynı mantık (Oturum 4 #7):
   *  dile göre formüle edilen alan Localized. */
  language: Localized;
  /** "c. 825", "13th c.", "1930s →" gibi pan-lingual zaman damgası.
   *  Stratum.year ile aynı sicil — string, localize değil. */
  year?: string;
  children?: EtymologyNode[];
}

export interface Word extends BaseEntity {
  type: 'word';
  variants: WordVariant[];
  ipa?: string;
  audio?: string;
  literalMeaning: Localized;
  etymologyTree?: EtymologyNode;
  siblings: CrossLink[];
  /** Çoklu-yer rotası (dilim 7/6.A). Person ve Book için kurulan
   *  şekille birebir — `ThemeAtlasAnchor[]`. Word'ler genellikle tek
   *  bir kaynak yere bağlanır (Arapça orijinin yazıldığı yer), ama
   *  bazı kelimelerin hayatı 4-5 ayrı yere yayılır: cotton'ın strata'sı
   *  Indus Vadisi → Bağdat/Şam/Fustāt → Endülüs → Manchester yolculuğunu
   *  anlatır; orange Endülüs *naranja* + Portekiz *portogallo* iki kollu
   *  zenci-batı koridoru; sugar Kayrevan → Sicilya → Venedik. Bu rotaları
   *  Atlas'ta noktalı sepia çizgi olarak göstermek için tek tek kazı
   *  yapmadan da kavranabilir — kelimenin coğrafi biyografisi tek bir
   *  pinde dondurulmaz. Eğer `atlasAnchors` doluysa Atlas + MiniAtlas
   *  ONU kullanır; yoksa BaseEntity.atlasAnchor (tek-yer, geriye dönük)
   *  fallback olur. validate-corpus build-time'da slug'ların ATLAS_PLACES'da
   *  olduğunu ve her anchor'ın tekil olduğunu doğrular — Person/Book/Theme
   *  ile aynı paylaşılan helper.
   *
   *  Dilim 7/6.A itibarıyla dört entity tipinin tümü (Word/Person/Book/Theme)
   *  aynı `atlasAnchors?: ThemeAtlasAnchor[]` sözleşmesini taşır;
   *  mimari simetri tamamlandı. Atlas runtime'ı (Atlas.tsx) artık üç
   *  stratified entity tipini (Word/Person/Book) tek bir döngüde
   *  birleşik biçimde işler. */
  atlasAnchors?: ThemeAtlasAnchor[];
  /** 7 yolculuk arketipinden hangisine ait (§4.5 GRAND_PLAN).
   *  Showcase Word'lerde dolu olması beklenir; catalogue'da opsiyonel
   *  (kategorize edilemiyorsa boş bırakılabilir). Render zamanında
   *  JourneyBadge'e besler; ileride `/journeys/:type` route'unda
   *  ters-indeks olarak da kullanılır. Dilim 7/6.C'de tanıtıldı. */
  journey_type?: JourneyType;
}

// ───────────────────────────────────────────────────────────────────────
// §5 · Person — ANAHTAR: directional `circle`
// ───────────────────────────────────────────────────────────────────────

export interface CircleMember {
  name: Localized;
  arabicName?: string;
  years: string;
  note: Localized;
  personSlug?: string;
}

/**
 * Discriminated union → §13 kuralının tip-zorlaması:
 *   direction === 'none'                 → members yok / boş, label opsiyonel
 *   direction === 'forward' | 'contemporary' → en az 1 üye + label zorunlu
 *
 * "En az 1 üye" tip seviyesinde [CircleMember, ...CircleMember[]] ile
 * (non-empty array) sağlanır.
 */
export type PersonCircle =
  | {
      direction: 'none';
      label?: Localized;
      members?: never;
    }
  | {
      direction: 'forward' | 'contemporary';
      label: Localized;
      members: [CircleMember, ...CircleMember[]];
    };

export interface Person extends BaseEntity {
  type: 'person';
  romanName: string;
  arabicName?: string;
  /** İsmin altındaki küçük italik tagline. Prototip al-khwarizmi.html'de
   *  her dilde *farklı* bir formülasyon: TR Türkçe naturalizasyon, EN
   *  nispe-anlamı + Algorismi atfı, AR coğrafi izafet. Tek `string` bunu
   *  taşıyamadı; ActorTag.name (Oturum 4) ile aynı gerekçeyle Localized.
   *  Sadeleştirme istenirse pickLang fallback zaten boşları atlar. */
  trForm?: Localized;
  lifespan?: string;
  birthplace?: Localized;
  activeIn?: Localized;
  workLanguages?: Localized;
  roleBadges: Localized<string[]>;
  nisba?: Localized;
  wordsIndebted?: CrossLink[];
  works?: CrossLink[];
  circle: PersonCircle;
  /** Çoklu-yer rotası (dilim 7/4.C). Theme.atlasAnchors ile aynı şekil.
   *  Bir kişinin biyografisi genelde tek noktada özetlenemez — al-Khwārizmī
   *  Hârezm-doğumlu, Bağdat'ta üretti; rotaya doğrudan yer açar. Eğer
   *  `atlasAnchors` doluysa Atlas + MiniAtlas ONU kullanır; yoksa
   *  BaseEntity.atlasAnchor (tek-yer, geriye dönük) fallback olur.
   *  validate-corpus build-time'da slug'ların ATLAS_PLACES'da olduğunu ve
   *  her anchor'ın tekil olduğunu doğrular (Theme.atlasAnchors ile aynı
   *  invariant). */
  atlasAnchors?: ThemeAtlasAnchor[];
}

// ───────────────────────────────────────────────────────────────────────
// §6 · Book
// ───────────────────────────────────────────────────────────────────────

/**
 * Manuscript discriminated union → §13 kuralı:
 *   status === 'full' → url ZORUNLU
 *   status === 'partial' | 'offline' → url opsiyonel
 */
export type Manuscript =
  | {
      status: 'full';
      shelfmark: string;
      name: Localized;
      where: Localized;
      url: string;
    }
  | {
      status: 'partial' | 'offline';
      shelfmark: string;
      name: Localized;
      where: Localized;
      url?: string;
    };

export interface Translation {
  year: string;
  language: string;
  name: string;
  by: Localized;
  translatorSlug?: string;
}

export interface Book extends BaseEntity {
  type: 'book';
  fullArabicTitle: string;
  transliteration: Localized;
  titleMeaning: Localized;
  authorSlug: string;
  composedYear: string;
  composedPlace: Localized;
  originalLanguage: Localized;
  genreBadges: Localized<string[]>;
  openingQuote?: Localized;
  manuscripts: Manuscript[];
  translations: Translation[];
  relatedWords: CrossLink[];
  /** Çoklu-yer rotası (dilim 7/5.A). Person.atlasAnchors ile aynı şekil
   *  (`ThemeAtlasAnchor[]`). Bir kitabın hayatı genelde tek bir yerde
   *  geçmez: yazıldığı yer (örn. Bağdat c. 825) + tercümeye / dağılıma
   *  uğradığı yer(ler) (örn. Toledo 1145). Eğer `atlasAnchors` doluysa
   *  Atlas + MiniAtlas ONU kullanır; yoksa BaseEntity.atlasAnchor (tek-yer,
   *  geriye dönük) fallback olur. validate-corpus build-time'da slug'ların
   *  ATLAS_PLACES'da olduğunu ve her anchor'ın tekil olduğunu doğrular —
   *  Theme/Person.atlasAnchors ile paylaşılan `checkAtlasAnchorsArray`
   *  helper'ı. */
  atlasAnchors?: ThemeAtlasAnchor[];
}

// ───────────────────────────────────────────────────────────────────────
// §7 · Theme (BaseEntity'i extend ETMEZ — strata'sı yoktur)
// ───────────────────────────────────────────────────────────────────────

export interface Theme {
  slug: string;
  type: 'theme';
  tier: ThemeTier;
  title: Localized;
  subtitle?: Localized;
  /** Tek bir Markdown gövde — dil başına ayrı string. */
  body: Localized;
  /** Bu temaya bağlı varlıkların slug'ları. */
  words: string[];
  persons: string[];
  books: string[];
  /** Theme'de sources şekli farklı: dil başına ayrı liste. */
  sources: Localized<string[]>;
  /** Theme'nin Atlas üzerinde çizdiği coğrafi rota. Boş bırakılabilir
   *  (örn. soyut/dilbilim temaları); doluysa Atlas her anchor için bir
   *  pin (theme-tipi, halo ile), ≥2 anchor varsa anchor'lar arasında
   *  sıralanmış bir noktalı çizgi çizer (yolculuk metaforu).
   *
   *  Slug'lar ATLAS_PLACES tablosundaki bir girişi göstermelidir;
   *  validate-corpus.mjs build-time'da bunu doğrular. Sıra editöryeldir
   *  (dosya yazıldığı şekilde korunur); çizgi bu sırayı takip eder.
   *  `year` opsiyonel — gelecekteki zaman-cetveli UI'si için iz; şu an
   *  yalnız hover tooltip'e (varsa) düşer. `label` insan-okunaklı bir
   *  bağlam etiketidir (örn. "Hindistan", "Tercüme atölyesi") — pin
   *  tooltip'inde tema başlığının altına gelir. */
  atlasAnchors?: ThemeAtlasAnchor[];
}

export interface ThemeAtlasAnchor {
  /** ATLAS_PLACES tablosundaki bir slug — örn. "baghdad", "toledo". */
  slug: string;
  /** "c. 825", "1145" vb. — tema rotasında bu anchor'ın zamanı. */
  year?: string;
  /** Bu anchor'ın temadaki rolü — kısa, dile göre değişebilen
   *  açıklama. Örn. hindu-arabic-numerals/baghdad → "Bayt al-Ḥikma". */
  label?: Localized;
}

// ───────────────────────────────────────────────────────────────────────
// §7.5 · Journey (BaseEntity'i extend ETMEZ — Theme ile aynı şekil)
// ───────────────────────────────────────────────────────────────────────
//
// Dilim 7/35 (Shape ο): yolculuk arketipleri MDX content type olarak
// açıldı. Önce sadece i18n locales'te subtitle stub'ları vardı (dilim
// 7/7.A'da kondu, editorialNote "bu sayfa MDX-tabanlı bir yapıya geçer"
// vaadiyle). Şimdi geçiş tamamlandı.
//
// Slug'lar JOURNEY_TYPES enum'una kilitlidir (validate-corpus zorlar);
// canonical 7 arketip: translator, merchant, andalusian, crusader,
// astronomer, alchemist, diplomatic.
//
// Tier yok — 7 arketipin hepsi eşit-yetkili. Word.journey_type alanı
// reverse-index'i kuruyor (Word → Journey); Journey.words listesi yok
// çünkü reverse-index zaten Word manifest'ten besleniyor.

export interface Journey {
  /** JOURNEY_TYPES enum'una kilitli — validate-corpus build-time'da zorlar. */
  slug: JourneyType;
  type: 'journey';
  title: Localized;
  /** Kart önizleme — 1-2 cümle. JourneyPage'de başlığın altında. */
  subtitle: Localized;
  /** Tek bir Markdown gövde — Theme ile aynı şekil. ~400-500 kelime/dil
   *  editöryel essay; arketibin tarihsel hikâyesi + örnek Word'lere
   *  zemin. */
  body: Localized;
  /** Dil başına ayrı liste — Theme ile aynı. */
  sources: Localized<string[]>;
}

// ───────────────────────────────────────────────────────────────────────
// §8.5 · Summary tipleri — manifest (lazy MDX altyapısının hafif başlığı)
// ───────────────────────────────────────────────────────────────────────
//
// Oturum 7 dilim 1: MDX-level lazy registry. Tam entity (strata + body +
// crossLinks + …) yalnız bir entity sayfası ziyaret edildiğinde, dynamic
// import ile *o entity'nin* MDX dosyası indirilince parse edilir. Liste
// gösterimleri (HomePage dizini, Atlas pinleri, ThemePage entity-card'ları,
// ThemeBadges back-link'leri) ise **çok daha hafif** bir özet üzerinden
// çalışır.
//
// Summary'ler `Pick<FullEntity, ...>` olarak ifade edilebilirdi; biz
// bilinçli olarak ayrı interface'ler yazdık çünkü:
//   • Manifest'in *kontratı* — yani liste UI'larının okuyabileceği alanlar —
//     kendi başına bir API yüzeyi; full entity şişerse summary değişmemeli.
//   • generate-manifest.mjs bu interface'lere bakarak hangi alanları
//     emit edeceğini bilir; tek doğru kaynak.
//   • Pick zincirleri okumayı zorlaştırır; explicit gövde editörlerin
//     (ve gelecek-Claude'un) tek bakışta gördüğü şeyi netleştirir.
//
// Manifest summary'leri build-time'da scripts/generate-manifest.mjs
// tarafından `src/content/manifest.generated.ts`'e yazılır; o dosya
// .gitignore'da, `npm run dev/build` öncesi (predev/prebuild) yeniden
// üretilir, ve dev sırasında MDX değişikliklerinde Vite plugin yeniden
// üretip HMR'i tetikler.

export interface WordSummary {
  slug: string;
  type: 'word';
  tier: Tier;
  title: Localized;
  category?: Localized;
  atlasAnchor?: string;
  /** Çoklu-yer rotası (dilim 7/6.A). Person/Book/Theme ile aynı simetri.
   *  Atlas + MiniAtlas için lazy fetch'siz erişim — manifest'e taşınır.
   *  Doluysa `atlasAnchor` fallback'inin önüne geçer. */
  atlasAnchors?: ThemeAtlasAnchor[];
  /** Yolculuk arketipi — dilim 7/6.C. JourneyBadge HomePage word
   *  kartlarında (ileride) ve `/journeys/:type` route'unda kullanır;
   *  şu an WordPage'de tek-rozet olarak görünür. */
  journey_type?: JourneyType;
  /** Listeleme alt-açıklaması — HomePage word kartları + ThemePage WordCard
   *  bunu inline-md ile gösterir. */
  literalMeaning: Localized;
}

export interface PersonSummary {
  slug: string;
  type: 'person';
  tier: Tier;
  title: Localized;
  category?: Localized;
  atlasAnchor?: string;
  /** Çoklu-yer rotası (dilim 7/4.C). Atlas + MiniAtlas için lazy fetch'siz
   *  erişim. Dolu ise `atlasAnchor` fallback'inin önüne geçer. */
  atlasAnchors?: ThemeAtlasAnchor[];
  /** HomePage + Atlas + Theme cards bu alanı başlık olarak kullanır. */
  romanName: string;
  arabicName?: string;
  /** Tagline — TR/EN/AR farklı formülasyon (entity §5 yorumuna bak). */
  trForm?: Localized;
  /** Kart subtitle fallback'i (trForm yoksa). */
  nisba?: Localized;
  /** Yaşam dönemi — "c. 780 – 850" gibi tarih aralığı (Person.lifespan
   *  full alanının kopyası, manifest'te). Dilim 7/16: PersonsListPage'in
   *  kronolojik sort modu için. Tek string; bir kişinin biyografisi
   *  birden çok yıl-formatı taşıyabildiği için (örn. "c. 780", "fl. 825",
   *  "9. yy ortası"), parse year.ts/parseYearStart üzerinden hesaplanır.
   *  Yaşam bilinmiyorsa undefined (sort'ta listenin sonuna düşer). */
  lifespan?: string;
}

export interface BookSummary {
  slug: string;
  type: 'book';
  tier: Tier;
  title: Localized;
  category?: Localized;
  atlasAnchor?: string;
  /** Çoklu-yer rotası (dilim 7/5.A). Person.atlasAnchors ile aynı simetri.
   *  Atlas + MiniAtlas için lazy fetch'siz erişim — manifest'e taşınır.
   *  Doluysa `atlasAnchor` fallback'inin önüne geçer. */
  atlasAnchors?: ThemeAtlasAnchor[];
  /** HomePage Arapça kart başlığı. */
  fullArabicTitle: string;
  /** Latin başlık fallback'i (TR/EN sütununda). */
  transliteration: Localized;
  /** Kart subtitle. */
  titleMeaning: Localized;
  /** BookPage author-aside `getPersonSummary(authorSlug)` çağrısı için.
   *  Author bilgisinin kendisi değil, yalnız slug — author Person'ın özetini
   *  ayrıca PERSON_MANIFEST'ten çekeriz. */
  authorSlug: string;
  /** Yazılış tarihi — "c. 825" gibi tek-string. Dilim 7/16: BooksListPage'in
   *  kronolojik sort modu için. Book.composedYear full alanının summary
   *  kopyası; sort'ta year.ts/parseYearStart üzerinden sayıya çevrilir. */
  composedYear?: string;
}

export interface ThemeSummary {
  slug: string;
  type: 'theme';
  tier: ThemeTier;
  title: Localized;
  subtitle?: Localized;
  /** Theme'in slug listeleri reverse-index için zorunlu — getThemesForEntity
   *  manifest'teki bu üç dizi üzerinden Map kurar. Tam Theme.body'sine
   *  ihtiyaç yok; back-link badge'i sadece slug+title+tier okur. */
  words: string[];
  persons: string[];
  books: string[];
  /** Atlas tema pin'leri ve rota çizgisi — full Theme'deki ile aynı
   *  veri; Atlas component sayfa-yüklü değilken bile temalar için pin
   *  basabilsin diye summary'ye taşınır (parser/loader chunk'ını
   *  triggerlamadan).
   *
   *  Boyut endişesi yok: tipik tema 1-5 anchor; 6 tema × ~4 anchor ×
   *  ~80 byte = manifest'e <2 KB ek. Lazy-mimari sözleşmesi (HomePage
   *  ve Atlas, parser/MDX'e dokunmadan render olur) bu alanla
   *  korunur. */
  atlasAnchors?: ThemeAtlasAnchor[];
}

/** Dilim 7/35: Journey'in hafif başlığı. JourneysIndexPage liste
 *  kartlarında ve JourneyPage kendi içinde fallback olarak kullanılır;
 *  tam body MDX-lazy fetch'de çekilir. */
export interface JourneySummary {
  slug: JourneyType;
  type: 'journey';
  title: Localized;
  subtitle: Localized;
}

/** Strata-sahibi entity özetleri — Atlas + HomePage gibi karışık yer
 *  gösteren UI'lar için (Theme dışta tutulur, çünkü atlasAnchor'ı yok). */
export type StratifiedSummary = WordSummary | PersonSummary | BookSummary;

/** Tüm summary'ler (Theme + Journey dahil). HomePage dizini bunu
 *  kullanmaz çünkü her sütun ayrı tip; ileride mixed-type listeler
 *  için açık duruyor. */
export type AnySummary = StratifiedSummary | ThemeSummary | JourneySummary;

// ───────────────────────────────────────────────────────────────────────
// §9 · Korpus root + tip discrimination yardımcıları
// ───────────────────────────────────────────────────────────────────────

export interface Corpus {
  words: Word[];
  persons: Person[];
  books: Book[];
  themes: Theme[];
}

/** Tüm strata-sahibi varlıkları kapsayan birleşim — listeleme/arama için. */
export type StratifiedEntity = Word | Person | Book;

/** Tüm varlıkların birleşimi (Theme dahil). */
export type AnyEntity = StratifiedEntity | Theme;

// ───────────────────────────────────────────────────────────────────────
// §13 · Runtime validatörler
// ───────────────────────────────────────────────────────────────────────
//
// Tip sistemi her şeyi yakalayamaz; bu fonksiyonlar MDX yüklendikten
// sonra korpus build adımında çağrılır (sonraki oturum).
// ───────────────────────────────────────────────────────────────────────

export class CorpusValidationError extends Error {
  constructor(message: string, public path: string) {
    super(`[${path}] ${message}`);
    this.name = 'CorpusValidationError';
  }
}

/** Tam 5 stratum kuralı.
 *  Parametre `readonly Stratum[]` çünkü `StrictStrata` da `readonly` —
 *  kovaryans sayesinde mutable Stratum[] de buraya geçebilir. */
export function assertFiveStrata(
  strata: readonly Stratum[],
  path: string
): asserts strata is StrictStrata {
  if (strata.length !== 5) {
    throw new CorpusValidationError(
      `Expected exactly 5 strata, got ${strata.length}`,
      path
    );
  }
  const ids: StratumId[] = ['1', '2', '3', '4', '5'];
  strata.forEach((s, i) => {
    if (s.id !== ids[i]) {
      throw new CorpusValidationError(
        `Stratum at index ${i} has id "${s.id}", expected "${ids[i]}"`,
        path
      );
    }
  });
}

/** Showcase tier ≥2 dilde içerik gerektirir (DATA-SCHEMA §13). */
export function assertShowcaseLanguageCoverage(
  loc: Localized,
  path: string,
  tier: Tier
): void {
  if (tier !== 'showcase') return;
  const filled = (Object.keys(loc) as Lang[]).filter(
    (k) => loc[k] && loc[k]!.toString().trim().length > 0
  );
  if (filled.length < 2) {
    throw new CorpusValidationError(
      `Showcase tier requires content in ≥2 languages; found only ${filled.length}`,
      path
    );
  }
}

/** CrossLink hedef-slug bütünlüğü (status: 'live' ise hedef korpusta olmalı). */
export function assertCrossLinkIntegrity(
  link: CrossLink,
  corpus: Corpus,
  path: string
): void {
  if (link.status !== 'live') return;
  const pool: Record<EntityType, { slug: string }[]> = {
    word: corpus.words,
    person: corpus.persons,
    book: corpus.books,
    theme: corpus.themes,
  };
  const exists = pool[link.targetType].some((e) => e.slug === link.targetSlug);
  if (!exists) {
    throw new CorpusValidationError(
      `CrossLink → ${link.targetType}/${link.targetSlug} marked 'live' but target not found`,
      path
    );
  }
}

/** Atlas-anchor bütünlüğü — entity bir yere çapalanmışsa ATLAS_PLACES'da
 *  tanımlı olmalı. Validator'ı `@/content/atlas`'a bağımlı kılmamak için
 *  geçerli slug kümesi parametre olarak gelir (registry runtime'da
 *  `new Set(Object.keys(ATLAS_PLACES))` geçer). */
export function assertAtlasAnchorIntegrity(
  anchor: string | undefined,
  validPlaceSlugs: ReadonlySet<string>,
  path: string
): void {
  if (anchor === undefined) return;
  if (!validPlaceSlugs.has(anchor)) {
    throw new CorpusValidationError(
      `atlasAnchor "${anchor}" not found in ATLAS_PLACES`,
      path
    );
  }
}

/** Theme'in `words/persons/books` slug listelerinin korpusta gerçekten
 *  varolan entity'lere çözülmesi. Cross-cutting integrity — tıpkı
 *  `assertCrossLinkIntegrity`'nin Word/Person/Book için yaptığını
 *  Theme için yapar. Theme schema'sında `placeholder` semantiği yok
 *  (CrossLink değil, düz slug); o yüzden listede olan her slug `live`
 *  kabul edilir ve hedefin varlığı kontrol edilir. */
export function assertThemeSlugIntegrity(
  theme: Theme,
  corpus: Corpus,
  path: string
): void {
  const checkBucket = (
    bucketName: 'words' | 'persons' | 'books',
    pool: { slug: string }[]
  ): void => {
    const seen = new Set<string>();
    theme[bucketName].forEach((slug, i) => {
      if (seen.has(slug)) {
        throw new CorpusValidationError(
          `duplicate slug "${slug}" in ${bucketName} list`,
          `${path}#${bucketName}[${i}]`
        );
      }
      seen.add(slug);
      if (!pool.some((e) => e.slug === slug)) {
        throw new CorpusValidationError(
          `${bucketName} → "${slug}" not found in corpus`,
          `${path}#${bucketName}[${i}]`
        );
      }
    });
  };
  checkBucket('words', corpus.words);
  checkBucket('persons', corpus.persons);
  checkBucket('books', corpus.books);
}

/** Theme başlığının dil kapsaması. Magnum tier'da en az 2 dil zorunlu
 *  (showcase Word/Person/Book ile aynı çizgi); cluster'da en az 1 yeterli.
 *  `assertShowcaseLanguageCoverage`'ın Theme uyarlaması — Theme'de
 *  `Tier` değil `ThemeTier` olduğu için ayrı fonksiyon. */
export function assertThemeTitleCoverage(
  loc: Localized,
  path: string,
  tier: ThemeTier
): void {
  const min = tier === 'magnum' ? 2 : 1;
  const filled = (Object.keys(loc) as Lang[]).filter(
    (k) => loc[k] && loc[k]!.toString().trim().length > 0
  );
  if (filled.length < min) {
    throw new CorpusValidationError(
      `Theme tier '${tier}' requires title in ≥${min} language(s); found only ${filled.length}`,
      path
    );
  }
}

/** Korpus tamamı için temel doğrulama (sonraki oturum: build script'inden çağır).
 *  `atlasPlaceSlugs` opsiyonel: verildiyse her entity'nin atlasAnchor'ı
 *  kümeye karşı kontrol edilir. Verilmezse anchor doğrulama atlanır. */
export function validateCorpus(
  corpus: Corpus,
  atlasPlaceSlugs?: ReadonlySet<string>
): void {
  const stratified: Array<{ list: StratifiedEntity[]; type: string }> = [
    { list: corpus.words, type: 'word' },
    { list: corpus.persons, type: 'person' },
    { list: corpus.books, type: 'book' },
  ];

  for (const { list, type } of stratified) {
    for (const entity of list) {
      const path = `${type}/${entity.slug}`;
      assertFiveStrata(entity.strata, path);
      assertShowcaseLanguageCoverage(entity.title, `${path}#title`, entity.tier);
      if (atlasPlaceSlugs) {
        assertAtlasAnchorIntegrity(
          entity.atlasAnchor,
          atlasPlaceSlugs,
          `${path}#atlasAnchor`
        );
      }
    }
  }

  // CrossLink bütünlüğü — Person ve Book sayfalarındaki link kümeleri.
  for (const person of corpus.persons) {
    const path = `person/${person.slug}`;
    person.wordsIndebted?.forEach((l, i) =>
      assertCrossLinkIntegrity(l, corpus, `${path}#wordsIndebted[${i}]`)
    );
    person.works?.forEach((l, i) =>
      assertCrossLinkIntegrity(l, corpus, `${path}#works[${i}]`)
    );
  }
  for (const book of corpus.books) {
    const path = `book/${book.slug}`;
    book.relatedWords.forEach((l, i) =>
      assertCrossLinkIntegrity(l, corpus, `${path}#relatedWords[${i}]`)
    );
  }
  for (const word of corpus.words) {
    const path = `word/${word.slug}`;
    word.siblings.forEach((l, i) =>
      assertCrossLinkIntegrity(l, corpus, `${path}#siblings[${i}]`)
    );
  }

  // Theme bütünlüğü — başlık dil kapsaması + slug listelerinin korpusta
  // gerçekten varolan entity'lere çözülmesi. Theme strata-sahibi değil,
  // o yüzden `stratified` döngüsünden ayrı.
  for (const theme of corpus.themes) {
    const path = `theme/${theme.slug}`;
    assertThemeTitleCoverage(theme.title, `${path}#title`, theme.tier);
    assertThemeSlugIntegrity(theme, corpus, path);
  }
}

/**
 * Korpus doğrulamanın *toplayıcı* kardeşi — fırlatmak yerine bütün
 * `CorpusValidationError`'ları biriktirip dizi olarak döner. Registry'nin
 * dev/build sürdürülebilirliğini bozmadan tüm sorunları rapor edebilmesi
 * için kullanılır (parse hataları gibi: build patlatma, console'a yaz).
 *
 * `validateCorpus` (throw-on-first) build script'inden çağrılırsa hâlâ
 * fail-fast modda çalışır; aynı kontrolleri tekrarlamamak için bu fonksiyon
 * kontrolleri tek tek try/catch ile sarmalayıp aynı invariant'ı paylaşır.
 *
 * `atlasPlaceSlugs` opsiyonel — `validateCorpus` ile aynı semantik.
 */
export function validateCorpusCollect(
  corpus: Corpus,
  atlasPlaceSlugs?: ReadonlySet<string>
): CorpusValidationError[] {
  const errors: CorpusValidationError[] = [];
  const collect = (fn: () => void): void => {
    try {
      fn();
    } catch (e) {
      if (e instanceof CorpusValidationError) {
        errors.push(e);
      } else {
        throw e; // beklenmedik hata türü — yutmayalım
      }
    }
  };

  const stratified: Array<{ list: StratifiedEntity[]; type: string }> = [
    { list: corpus.words, type: 'word' },
    { list: corpus.persons, type: 'person' },
    { list: corpus.books, type: 'book' },
  ];

  for (const { list, type } of stratified) {
    for (const entity of list) {
      const path = `${type}/${entity.slug}`;
      collect(() => assertFiveStrata(entity.strata, path));
      collect(() =>
        assertShowcaseLanguageCoverage(entity.title, `${path}#title`, entity.tier)
      );
      if (atlasPlaceSlugs) {
        collect(() =>
          assertAtlasAnchorIntegrity(
            entity.atlasAnchor,
            atlasPlaceSlugs,
            `${path}#atlasAnchor`
          )
        );
      }
    }
  }

  for (const person of corpus.persons) {
    const path = `person/${person.slug}`;
    person.wordsIndebted?.forEach((l, i) =>
      collect(() => assertCrossLinkIntegrity(l, corpus, `${path}#wordsIndebted[${i}]`))
    );
    person.works?.forEach((l, i) =>
      collect(() => assertCrossLinkIntegrity(l, corpus, `${path}#works[${i}]`))
    );
  }
  for (const book of corpus.books) {
    const path = `book/${book.slug}`;
    book.relatedWords.forEach((l, i) =>
      collect(() =>
        assertCrossLinkIntegrity(l, corpus, `${path}#relatedWords[${i}]`)
      )
    );
  }
  for (const word of corpus.words) {
    const path = `word/${word.slug}`;
    word.siblings.forEach((l, i) =>
      collect(() => assertCrossLinkIntegrity(l, corpus, `${path}#siblings[${i}]`))
    );
  }

  // Theme bütünlüğü — `validateCorpus` ile aynı invariant'lar, try/catch
  // ile sarmalanmış. Magnum'da ≥2 dil başlık + slug listelerinin korpusa
  // çözülmesi (duplicate dahil) tek tek raporlanır.
  for (const theme of corpus.themes) {
    const path = `theme/${theme.slug}`;
    collect(() =>
      assertThemeTitleCoverage(theme.title, `${path}#title`, theme.tier)
    );
    collect(() => assertThemeSlugIntegrity(theme, corpus, path));
  }

  return errors;
}
