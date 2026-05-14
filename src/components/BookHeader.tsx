import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang, pickLangArray } from '@/utils/localized';
import type { Book } from '@/types/entities';

interface Props {
  book: Book;
  /** Yazar slug'ının korpus içinde gerçekten var olup olmadığını bilmek
   *  isteyen tarafın geçirdiği bayrak. Var ise yazar adı `<Link>` olur,
   *  yoksa düz metin (placeholder). */
  authorIsLive: boolean;
  /** Yazarın görüntülenecek çok-dilli adı; yazar varsa Person.romanName /
   *  arabicName seçilerek dışarıdan geçirilir. */
  authorDisplay: string;
}

/**
 * Kitap sayfasının üst başlığı — al-jabr.html prototipindeki
 * `.book-header` yapısının React karşılığı.
 *
 *  • `book-title-arabic` daima Arapça başlığı (fullArabicTitle) taşır;
 *    AR/LTR UI fark etmez (yazılı eserin asıl dili Arapça).
 *  • `book-title-translit` UI diline göre transliterasyon (TR Türkçe,
 *    EN İngilizce; iki konvansiyon farklı). Localized.
 *  • `book-title-meaning` "anlamı" satırı — Localized.
 *  • Yazar satırı meta-grid'in *ilk* hücresi; live ise tıklanır.
 */
export default function BookHeader({ book, authorIsLive, authorDisplay }: Props) {
  const { lang } = useLang();
  const { t } = useTranslation();

  const translit = pickLang(book.transliteration, lang);
  const meaning = pickLang(book.titleMeaning, lang);
  const composedPlace = pickLang(book.composedPlace, lang);
  const originalLanguage = pickLang(book.originalLanguage, lang);
  const opening = pickLang(book.openingQuote, lang);
  const genres = pickLangArray(book.genreBadges, lang);

  return (
    <section className="book-header">
      <div className="crumbs reveal r-1">
        <span>{t('nav.brand')}</span>
        <span className="sep">·</span>
        <span>{t('entities.bookPlural')}</span>
        {book.composedYear && (
          <>
            <span className="sep">·</span>
            <span dir="ltr">{book.composedYear}</span>
          </>
        )}
      </div>

      <div className="manuscript-mark reveal r-2" aria-hidden="true">
        ❦ ❦ ❦
      </div>

      <h1 className="book-title-arabic reveal r-2" lang="ar" dir="rtl">
        {book.fullArabicTitle}
      </h1>

      {translit && (
        <p
          className="book-title-translit reveal r-3"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(translit) }}
        />
      )}

      {meaning && (
        <p
          className="book-title-meaning reveal r-3"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(meaning) }}
        />
      )}

      <div className="book-meta reveal r-4">
        {book.authorSlug && (
          <span className="m">
            <span className="m-label">{t('book.meta.author')}</span>
            <span className="m-value">
              {authorIsLive ? (
                <Link to={entityUrl(lang, 'person', book.authorSlug)}>
                  {authorDisplay}
                </Link>
              ) : (
                authorDisplay
              )}
            </span>
          </span>
        )}
        {book.composedYear && (
          <span className="m">
            <span className="m-label">{t('book.meta.composed')}</span>
            <span className="m-value" dir="ltr">
              {book.composedYear}
            </span>
          </span>
        )}
        {composedPlace && (
          <span className="m">
            <span className="m-label">{t('book.meta.composedIn')}</span>
            <span className="m-value">{composedPlace}</span>
          </span>
        )}
        {originalLanguage && (
          <span className="m">
            <span className="m-label">{t('book.meta.originalLanguage')}</span>
            <span className="m-value">{originalLanguage}</span>
          </span>
        )}
      </div>

      {genres.length > 0 && (
        <div className="genre-badges reveal r-4">
          {genres.map((g, i) => (
            <span key={`${g}-${i}`} className="genre-badge">
              {g}
            </span>
          ))}
        </div>
      )}

      {opening && (
        <p
          className="opening-quote reveal r-5"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(opening) }}
        />
      )}
    </section>
  );
}

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
