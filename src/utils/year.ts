/**
 * Yıl-string parser — korpusun heterojen year formatlarını sayıya çevirir.
 *
 * Dilim 7/15.γ'da tanıtıldı. İki kullanıcı:
 *   • Atlas timeline view — yıl-eksenli filtreleme (γ(A))
 *   • Word-page Stratigraphy proportional mode — yıl-orantılı cetvel (γ(B))
 *
 * Korpustaki year string'leri editöryel — bilim tarihi yazılırken kullanılan
 * doğal yazımı korur. Bu yüzden tek bir regex yok; bir dizi mini-strateji
 * pre-parse'ı kapsar.
 *
 * Strateji öncelik sırası:
 *   1. BCE/MÖ tespiti → sayıyı negatif tut.
 *   2. Yüzyıl notasyonu: "14th c.", "12. yy", "11.-12. yy" → yüzyıl × 100 - 50
 *      (yüzyıl ortası varsayılır). İlk yüzyıl tespit edilir.
 *   3. Aralık başlangıcı: "1145 — 1202", "~628 → ~825", "Ottoman → 1930s" →
 *      ilk dört-haneli (veya üç-haneli) sayı.
 *   4. Tek-sayı fallback: ilk uzun sayıyı al.
 *   5. Sözel fallback ("pre-Islamic", "Ottoman", "Modern") → null;
 *      caller bunları filtreleme dışı bırakır.
 *
 * Notlar:
 *   • "Ottoman → 1930s" → 1930 (sondaki sayı baskın bilgi). Önceki kelime
 *     pre-modern context ipucu; başlangıç olarak 1930 kullanmak makul çünkü
 *     "Osmanlı-1930s" aralığında stratum'un *odağı* 1930s'tir.
 *   • "c. 780–850" → 780 (aralık başlangıcı; doğum-ölüm gibi okunur).
 *   • "~3000 BCE ↓" → -3000 (BCE + negatif; ↓ pre-stratum işareti bilgisi).
 *   • Tüm sonuçlar tam sayı (yuvarlanır).
 *
 * Test çağrılarıyla doğrulanmış değil — runtime'da yanlış parse edilen
 * bir string Atlas timeline'da pin'i göstermez; bu kabul edilebilir bir
 * graceful failure (yıl bilinmiyor → her zaman görünür VEYA hiç görünmez,
 * caller karar verir).
 */
export function parseYearStart(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (s.length === 0) return null;

  // 1) BCE/MÖ tespiti
  const isBCE = /\b(BCE|MÖ|BC)\b/i.test(s);

  // 2) Yüzyıl notasyonu — "14th c.", "12. yy", "11.-12. yy"
  //    Tek bir yüzyıl yakalanır; aralık varsa ilk yüzyıl.
  const centuryMatch = s.match(/(\d{1,2})\s*(?:st|nd|rd|th|\.)\s*(?:c\.|yy|c$)/i);
  if (centuryMatch && centuryMatch[1]) {
    const century = parseInt(centuryMatch[1], 10);
    if (!Number.isNaN(century)) {
      // Yüzyıl ortası (e.g. 14th c. → 1350)
      const yearMid = (century - 1) * 100 + 50;
      return isBCE ? -yearMid : yearMid;
    }
  }

  // 3) İlk uzun sayıyı al — 3-4 haneli, "c.", "~", "MÖ" gibi prefix'lerden
  //    bağımsız. Aralık varsa ilk sayıyı.
  const numMatch = s.match(/(\d{3,4})/);
  if (numMatch && numMatch[1]) {
    const year = parseInt(numMatch[1], 10);
    if (!Number.isNaN(year)) {
      return isBCE ? -year : year;
    }
  }

  // 4) Sözel-tek fallback ("pre-Islamic", "Ottoman", "Modern" gibi) → null
  return null;
}

/**
 * Aralıktan bitiş yılı çıkarır — varsa. Aralığın *sonu* için kullanılır
 * (örn. proportional stratigraphy'de stratum'un "ne kadar sürdüğünü"
 * göstermek). Tek-sayı durumlarında bitiş == başlangıç.
 *
 * "1145 — 1202" → 1202
 * "~628 → ~825" → 825
 * "Ottoman → 1930s" → 1930 (sondaki sayı)
 * "c. 825" → 825 (aralık değil; tek nokta)
 *
 * Şu an yalnız local Stratigraphy tarafından kullanılıyor (Atlas filtre
 * cumulative başlangıç-yılına göre çalışır); ama exported, ileride genişler.
 */
export function parseYearEnd(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (s.length === 0) return null;

  const isBCE = /\b(BCE|MÖ|BC)\b/i.test(s);

  // Aralık varsa son sayıyı al — son uzun sayı.
  const allMatches = Array.from(s.matchAll(/(\d{3,4})/g));
  if (allMatches.length === 0) {
    // Yüzyıl notasyonu fallback
    return parseYearStart(s);
  }
  const lastMatch = allMatches[allMatches.length - 1];
  if (!lastMatch || !lastMatch[1]) return parseYearStart(s);
  const year = parseInt(lastMatch[1], 10);
  if (Number.isNaN(year)) return parseYearStart(s);
  return isBCE ? -year : year;
}

/**
 * Kullanıcı dostu yıl ekran formatı. -3000 → "3000 BCE", 825 → "825",
 * 1500 → "1500", 2026 → "2026". Sayfa-dilinden bağımsız (sayılar
 * uluslararası).
 *
 * BCE ekinin Arapça eşdeğeri "ق.م" — caller dil-bağımlı düzenler
 * (utility dil bilmiyor; sıradan ortak ekran).
 */
export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year}`;
}
