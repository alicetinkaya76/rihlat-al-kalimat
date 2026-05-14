import type { Lang, Localized } from '@/types/entities';

const FALLBACK_CHAIN: Lang[] = ['en', 'tr', 'ar'];

/**
 * Bir Localized<T> alanından mevcut dile uygun değeri çek; yoksa
 * fallback zincirinden ilk dolu olanı döner. Showcase tier'da en az
 * iki dil dolu olduğu için pratikte daima değer döner; ama undefined
 * olabileceği tip seviyesinde belirtilir.
 */
export function pickLang<T>(loc: Localized<T> | undefined, lang: Lang): T | undefined {
  if (!loc) return undefined;
  if (loc[lang] !== undefined) return loc[lang];
  for (const f of FALLBACK_CHAIN) {
    if (f !== lang && loc[f] !== undefined) return loc[f];
  }
  return undefined;
}

/** Diziye karşılık gelen helper — Localized<string[]> için. */
export function pickLangArray(
  loc: Localized<string[]> | undefined,
  lang: Lang
): string[] {
  return pickLang(loc, lang) ?? [];
}
