import { listBooks, listPersons, listThemes, listWords } from '@/content/registry';
import type { EntityType } from '@/types/entities';

/**
 * "Did you mean" suggestion utility (dilim 7/19.ι.B — 404 polish).
 *
 * Bir URL'in son segment'ini korpus slug'larıyla karşılaştırır ve en
 * yakın eşleşmeleri döner. NotFound sayfası bunu kullanır:
 *
 *   /tr/kelime/algorythm  →  "Did you mean: algorithm (Word)?"
 *   /tr/kisi/ibn-sin      →  "Did you mean: ibn-sina (Person)?"
 *   /tr/herhangi-bisey    →  (no match — boş döner)
 *
 * Algoritma: normalize edilmiş Levenshtein mesafesi (büyük/küçük harf
 * + non-ASCII ignore). Distance ≤ 3 *veya* substring match (3+ karakter)
 * eşik. Mesafe öncelik sırasında: önce *eşit* uzunluk + 1-2 distance,
 * sonra substring, sonra uzun mesafe.
 *
 * Niçin Levenshtein, neden Trie/Aho-Corasick değil:
 *   Korpus 29 entity; n=29 × ortalama slug uzunluğu 12 → ~350 karşılaştırma
 *   × Levenshtein O(m·n) ≈ 144 → ~50K ops. Tek-sefer 404 sayfasında
 *   yapılır, kullanıcı gözünden anlık. Trie kurmak overengineering.
 */

const MAX_DISTANCE = 3;
const MAX_RESULTS = 3;

export interface SuggestionMatch {
  slug: string;
  type: EntityType;
  /** Normalize edilmiş distance (0 = mükemmel match) */
  distance: number;
  /** Sıralama için tek skor; lower-is-better */
  score: number;
}

/** Levenshtein edit distance, iterative DP. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // insertion
        prev[j] + 1, // deletion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Tüm entity tiplerinin slug'larında arama yapar; en yakın eşleşmeleri
 * skorlu olarak döner. Hiç eşleşme yoksa boş dizi.
 */
export function findEntitySuggestions(query: string): SuggestionMatch[] {
  if (!query || query.length < 2) return [];
  const q = normalize(query);
  if (q.length < 2) return [];

  const candidates: Array<{ slug: string; type: EntityType }> = [
    ...listWords().map((w) => ({ slug: w.slug, type: 'word' as EntityType })),
    ...listPersons().map((p) => ({ slug: p.slug, type: 'person' as EntityType })),
    ...listBooks().map((b) => ({ slug: b.slug, type: 'book' as EntityType })),
    ...listThemes().map((t) => ({ slug: t.slug, type: 'theme' as EntityType })),
  ];

  const matches: SuggestionMatch[] = [];

  for (const c of candidates) {
    const normSlug = normalize(c.slug);
    const distance = levenshtein(q, normSlug);

    // Mükemmel eşleşme — query exact entity slug; bu zaten bizim
    // tahmin etmemiz gereken durum değil (rota eşleşseydi 404'e
    // düşmezdik). Defansif olarak içeride tutuyoruz; rare race.
    if (distance === 0) {
      matches.push({ slug: c.slug, type: c.type, distance: 0, score: 0 });
      continue;
    }

    // Substring match — query slug'un parçası (örn 'sina' → 'ibn-sina')
    const isSubstring = normSlug.includes(q) || q.includes(normSlug);
    if (isSubstring && q.length >= 3) {
      // substring güçlü sinyal; uzunluk farkını skorla
      matches.push({
        slug: c.slug,
        type: c.type,
        distance,
        score: Math.abs(normSlug.length - q.length) + 0.5, // substring küçük penalty
      });
      continue;
    }

    // Distance threshold
    if (distance <= MAX_DISTANCE) {
      matches.push({ slug: c.slug, type: c.type, distance, score: distance });
    }
  }

  matches.sort((a, b) => a.score - b.score);
  return matches.slice(0, MAX_RESULTS);
}

/**
 * URL'den slug-benzeri son segment'i çıkarır. `/tr/kelime/algorythm/`
 * → 'algorythm'. Boş/kısa segment'ler için boş string.
 */
export function extractSlugFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return '';
  // Eğer son segment Türkçe-segment veya dil-kodu ise (yani path
  // /:lang ya da /:lang/kelime gibi entity segment'inde bitiyorsa),
  // bunu slug olarak almayız.
  const RESERVED = new Set([
    'tr',
    'en',
    'ar',
    'kelime',
    'kisi',
    'kitap',
    'tema',
    'kelimeler',
    'kisiler',
    'kitaplar',
    'yolculuk',
    'hakkinda',
  ]);
  if (RESERVED.has(last)) return '';
  return last;
}
