import type { EntityType, Lang } from '@/types/entities';

/**
 * URL'deki entity-segment'i merkezi tanım.
 *
 * Karar (Oturum 4): segment Türkçe sabittir, dil prefix'inden bağımsız.
 *   /tr/kelime/algorithm   ✓
 *   /en/kelime/algorithm   ✓ (segment yine 'kelime')
 *   /ar/kelime/algorithm   ✓
 *
 * GRAND_PLAN §3.2 ve DATA-SCHEMA §11 ile tutarlı. İleride dile göre
 * segment istenirse buradan tek noktada genişletilir (segments[lang][type]).
 */
export const ENTITY_PATH_SEGMENT: Record<EntityType, string> = {
  word: 'kelime',
  person: 'kisi',
  book: 'kitap',
  theme: 'tema',
};

/** Ters yönlü harita: '/kelime/' → 'word'. Routing'de path → entity-type için. */
export const PATH_SEGMENT_TO_TYPE: Record<string, EntityType> = Object.fromEntries(
  Object.entries(ENTITY_PATH_SEGMENT).map(([type, seg]) => [seg, type as EntityType])
);

export const SUPPORTED_LANGS_TUPLE = ['tr', 'en', 'ar'] as const;

export function isLang(value: string | undefined): value is Lang {
  return value === 'tr' || value === 'en' || value === 'ar';
}

export function isEntitySegment(seg: string | undefined): seg is keyof typeof PATH_SEGMENT_TO_TYPE {
  return seg !== undefined && seg in PATH_SEGMENT_TO_TYPE;
}

/** Bir entity için canonical URL üret. */
export function entityUrl(lang: Lang, type: EntityType, slug: string): string {
  return `/${lang}/${ENTITY_PATH_SEGMENT[type]}/${encodeURIComponent(slug)}`;
}

/** Anasayfa (atlas) URL'si. */
export function homeUrl(lang: Lang): string {
  return `/${lang}`;
}

/**
 * Word listesi (catalogue) URL helper'ları (dilim 7/10.A).
 *
 * `/tr/kelimeler` (3 dilde aynı segment) — bütün Word'leri tek sayfada
 * grid/sort modunda listeleyen route. HomePage'in Directory sütunu
 * Words için alfabetik tek-sütun liste; bu sayfa daha geniş bir kanvas
 * (sort: alfabetik / journey arketipi / atlas rota sayısı). Filter
 * paneli (§4.2 3-mode + tier/journey/atlas filter) catalogue tier
 * açıldığında eklenecek — şu an 9 showcase için over-engineered.
 *
 * Segment seçimi: `kelimeler` (kelime'nin çoğulu). ENTITY_PATH_SEGMENT
 * tek-Word segment'i ('kelime') ile rezonansta; çoğul → liste, tekil
 * → tek entity. Project'in "segment Türkçe sabit" disiplini (§3.2)
 * burada da geçerli.
 */
export const WORDS_LIST_SEGMENT = 'kelimeler';

export function wordsListUrl(lang: Lang): string {
  return `/${lang}/${WORDS_LIST_SEGMENT}`;
}

/**
 * Person ve Book listeleme URL helper'ları (dilim 7/16.δ.A).
 *
 * `wordsListUrl` (7/10.A) entity-tipi simetri zincirine Person ve Book
 * eklendi. 7/14.β'da catalogue tier Person+Book için mimari simetri
 * tamamlanmıştı (entity tarafında); şimdi liste-katmanında da. URL
 * disiplini aynı: segment Türkçe sabit, dil prefix'inden bağımsız.
 *
 *   /:lang/kisiler   → PersonsListPage (sort: alfabetik / yaşam dönemi / atlas)
 *   /:lang/kitaplar  → BooksListPage   (sort: alfabetik / yazılış tarihi / atlas)
 *
 * ENTITY_PATH_SEGMENT'taki tekil form ('kisi', 'kitap') ile rezonansta —
 * çoğul → liste, tekil → tek entity. Theme için liste route'u henüz yok;
 * Theme.atlasAnchors zenginleşmediği ve Theme korpusu 4 entity kaldığı
 * sürece HomePage Directory tek-sütun listesi yeterli.
 */
export const PERSONS_LIST_SEGMENT = 'kisiler';
export const BOOKS_LIST_SEGMENT = 'kitaplar';

export function personsListUrl(lang: Lang): string {
  return `/${lang}/${PERSONS_LIST_SEGMENT}`;
}

export function booksListUrl(lang: Lang): string {
  return `/${lang}/${BOOKS_LIST_SEGMENT}`;
}

/**
 * Yolculuk URL helper'ları (dilim 7/7.A).
 *
 * Tasarım kararı: entity path segment'leri (`kelime/kisi/kitap/tema`)
 * Türkçe sabit; ENTITY_PATH_SEGMENT'la aynı disiplin. `yolculuk`
 * segment'i 4-entity grafının dışında — Word'lerin meta-taksonomisi,
 * ayrı bir entity tipi değil. URL'si bu yüzden ENTITY_PATH_SEGMENT'a
 * eklenmiyor; ayrı bir sabit.
 *
 *   /tr/yolculuk            → JourneysIndexPage (7 arketip listesi)
 *   /tr/yolculuk/translator → JourneyPage (mütercimin yolu)
 *   /tr/yolculuk/merchant   → JourneyPage (tüccarın kervanı)
 *   …
 *
 * En dil için segment yine 'yolculuk' (`/en/yolculuk/translator`).
 * GRAND_PLAN §3.2 kararı (segment dile bağımsız sabit) burada da
 * geçerli; URL'in canonical formu URL'in kendisinde, dil yalnız
 * prefix'te.
 */
export const JOURNEYS_PATH_SEGMENT = 'yolculuk';

/** Bütün yolculuklar dizini (`/tr/yolculuk`). */
export function journeysUrl(lang: Lang): string {
  return `/${lang}/${JOURNEYS_PATH_SEGMENT}`;
}

/** Tek bir yolculuk arketipi (`/tr/yolculuk/translator`). */
export function journeyTypeUrl(lang: Lang, type: string): string {
  return `/${lang}/${JOURNEYS_PATH_SEGMENT}/${encodeURIComponent(type)}`;
}

/**
 * About sayfası URL helper'ı (dilim 7/18.ε.A — launch hazırlığı kapısı).
 *
 *   /tr/hakkinda   /en/hakkinda   /ar/hakkinda
 *
 * Segment Türkçe sabit (ENTITY_PATH_SEGMENT + WORDS_LIST_SEGMENT +
 * JOURNEYS_PATH_SEGMENT'la aynı disiplin — §3.2). Sayfa kendisi üç dile
 * göre içerik değişir; URL şekli değişmez. Footer'daki "Hakkında" linki
 * bu helper'ı çağırır; chrome dışında üç-dil arası geçiş `swapLangInPath`
 * üzerinden bu URL'i de doğru korur (segment dile bağımlı olsa LangSwitch
 * /tr/hakkinda → /en/about gibi dile-özgü segment yazmak zorunda kalırdı;
 * sabit segment bu sürtünmeyi tamamen ortadan kaldırır).
 */
export const ABOUT_SEGMENT = 'hakkinda';

export function aboutUrl(lang: Lang): string {
  return `/${lang}/${ABOUT_SEGMENT}`;
}

/** Mevcut path'in dil-segment'ini değiştir (LangSwitch için). */
export function swapLangInPath(currentPath: string, nextLang: Lang): string {
  // Beklenen format: /:lang/...
  const parts = currentPath.split('/').filter(Boolean);
  if (parts.length === 0) return `/${nextLang}`;
  if (isLang(parts[0])) {
    parts[0] = nextLang;
  } else {
    parts.unshift(nextLang);
  }
  return '/' + parts.join('/');
}
