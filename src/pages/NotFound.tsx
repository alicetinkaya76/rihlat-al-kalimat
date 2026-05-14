import { Link, useLocation } from 'react-router-dom';

import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { entityUrl, homeUrl } from '@/router/paths';
import { extractSlugFromPath, findEntitySuggestions } from '@/utils/didYouMean';

import './NotFound.css';

/**
 * 404 sayfası (dilim 7/9.C, manuscript redesign).
 *
 * Önceki hâl (dilim 1) inline-styled minimal bir blok'tu; sitenin
 * editöryel sicilinde (GRAND_PLAN §1.2) hiç oturmuyordu. Bu sürüm
 * polish layer'ın ilk gerçek girişi: manuscript-and-stratigraphy
 * estetiği, kütüphane-katalog metaforu, üç dilde lyrical prose.
 *
 * Yapı:
 *   • "№ 404" — pre-title, mono gold, küçük catalog numarası
 *   • Lyrical başlık — "Bu giriş henüz arşivde yok" (3 dilde)
 *   • ◇ rule — Stratigraphy stratum-bar motifinin küçük abisi
 *   • Editöryel gövde — "perhaps a link turned in the wrong direction,
 *     perhaps the content has not yet been written"
 *   • Marjinal-not stilinde geri-dön linki
 *
 * Catch-all route: Person/Book/Theme rotalarında mevcut entity'siz
 * slug'lar `EntityPageStates.EntityNotFound`'a düşer (orada da
 * benzer ton var). Bu sayfa *tamamen* eşleşmeyen URL'ler için —
 * /asdfasdf, /tr/yanlis-rota gibi.
 *
 * Niçin inline JSX prose (i18n bundle'a taşımak yerine): bu metin
 * üç-dört cümlelik, page-spesifik, başka bir sayfada paylaşılmıyor.
 * i18n bundle'a koyarsam initial-paint chunk'ı 4 satır metin için
 * büyür. Sayfa-içi switch (`lang === 'tr' && ...`) HomePage'in
 * tagline paterniyle aynı.
 */
export default function NotFound() {
  const { lang } = useLang();
  const location = useLocation();
  // Dilim 7/11.C: sekme başlığı — "404 · Riḥlat al-Kalimāt". Sayfanın
  // pre-label'ına ("№ 404") paralel; üç dilde de "404" rakamı evrensel.
  usePageTitle('404');
  const isRtl = lang === 'ar';

  // Dilim 7/19.ι.B — did-you-mean. URL'in son segment'inden bir slug
  // çıkarılıp Levenshtein/substring eşleşmesi ile en yakın korpus
  // girdileri önerilir. /tr/kelime/algorythm → "algorithm (Kelime)".
  // Hiç eşleşme yoksa öneri bloğu render edilmez.
  const querySlug = extractSlugFromPath(location.pathname);
  const suggestions = querySlug ? findEntitySuggestions(querySlug) : [];

  return (
    <main className="notfound-main" dir={isRtl ? 'rtl' : 'ltr'} lang={lang}>
      <p className="notfound-prelabel" aria-hidden="true">
        {lang === 'ar' ? '٤٠٤' : '№ 404'}
      </p>

      <h1 className="notfound-title">
        {lang === 'tr' && 'Bu giriş henüz arşivde yok.'}
        {lang === 'en' && 'This entry is not yet in the archive.'}
        {lang === 'ar' && 'هذه المادَّةُ ليست في الأَرشيفِ بَعد.'}
      </h1>

      <div className="notfound-rule" aria-hidden="true">
        <span className="notfound-rule-mark">◇</span>
      </div>

      <p className="notfound-body">
        {lang === 'tr' && (
          <>
            Aradığınız sayfa arşive girmemiş — <em>belki</em> bir bağlantı
            yanlış yöne kıvrılmıştır, <em>belki</em> içerik henüz
            işlenmiş değildir. Anasayfaya dönüp atlas haritasından, kelime
            dizininden ya da yolculuk arketiplerinden gezinebilirsiniz.
          </>
        )}
        {lang === 'en' && (
          <>
            The page you sought has no entry — <em>perhaps</em> a link turned
            in the wrong direction, <em>perhaps</em> the content has not
            yet been written. You can return to the home and navigate by
            the atlas, the directory, or the journey archetypes.
          </>
        )}
        {lang === 'ar' && (
          <>
            الصفحةُ التي طَلَبتَها ليست لها مادَّةٌ في الأَرشيف — <em>لعلَّ</em>
            رابطًا انْعَطفَ في غير اتِّجاهه، <em>ولعلَّ</em> المُحتوى لم يُكتَب
            بعد. يمكنك العَودةُ إلى الصفحةِ الرئيسة، وتَصَفُّحُ الأَطلَسِ،
            أو الفِهرسِ، أو أَنماطِ الرَّحَلات.
          </>
        )}
      </p>

      {suggestions.length > 0 && (
        <aside className="notfound-suggestions" aria-labelledby="notfound-sugg-head">
          <p id="notfound-sugg-head" className="notfound-suggestions-head">
            {lang === 'tr' && (
              <>
                Belki şunu aradınız <span className="notfound-sugg-mark">◇</span>
              </>
            )}
            {lang === 'en' && (
              <>
                Perhaps you meant <span className="notfound-sugg-mark">◇</span>
              </>
            )}
            {lang === 'ar' && (
              <>
                لَعَلَّكَ قَصَدتَ <span className="notfound-sugg-mark">◇</span>
              </>
            )}
          </p>
          <ul className="notfound-suggestions-list">
            {suggestions.map((s) => {
              const typeLabel =
                lang === 'tr'
                  ? { word: 'kelime', person: 'kişi', book: 'kitap', theme: 'tema' }[s.type]
                  : lang === 'en'
                    ? { word: 'word', person: 'person', book: 'book', theme: 'theme' }[s.type]
                    : { word: 'كَلِمة', person: 'شَخص', book: 'كِتاب', theme: 'مَوضوع' }[s.type];
              return (
                <li key={`${s.type}-${s.slug}`} className="notfound-suggestion">
                  <Link to={entityUrl(lang, s.type, s.slug)} className="notfound-suggestion-link">
                    <span className="notfound-suggestion-slug">{s.slug}</span>
                    <span className="notfound-suggestion-type" aria-hidden="true">
                      {' · '}
                      {typeLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      <Link to={homeUrl(lang)} className="notfound-back">
        {lang === 'tr' && '← Anasayfaya dön'}
        {lang === 'en' && '← Return to home'}
        {lang === 'ar' && 'العَودة إلى الصفحة الرئيسة →'}
      </Link>
    </main>
  );
}
