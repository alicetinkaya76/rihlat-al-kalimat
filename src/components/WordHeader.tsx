import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import type { Word } from '@/types/entities';

interface Props {
  word: Word;
}

/**
 * Kelime sayfasının üst başlık bloğu — prototype'taki .word-header
 * yapısının React karşılığı. Crumbs, kelime başlığı, dil varyantları,
 * IPA, rozet, "literal meaning" alıntısı.
 *
 * Prototype audio butonu yer tutucu: gerçek ses dosyası gelene kadar
 * pasif (disabled). word.audio dolduğunda aktifleştirilir.
 */
export default function WordHeader({ word }: Props) {
  const { lang } = useLang();
  const { t } = useTranslation();

  const title = pickLang(word.title, lang) ?? word.slug;
  const literal = pickLang(word.literalMeaning, lang);
  const category = pickLang(word.category, lang);

  return (
    <section className="word-header">
      <div className="crumbs reveal r-1">
        <span>{t('nav.brand')}</span>
        <span className="sep">·</span>
        <span>{t('entities.wordPlural')}</span>
        {category && (
          <>
            <span className="sep">·</span>
            <span>{category}</span>
          </>
        )}
      </div>

      <h1 className="word-title reveal r-2">{title}</h1>

      <div className="variants reveal r-3">
        {word.variants.map((v) => (
          <span
            key={v.lang}
            className={`v${v.isModern ? ' modern' : ''}`}
            data-lang={v.lang === 'arabic' ? 'ar' : undefined}
          >
            <span className="v-label">{t(`languages.${v.lang}`)}</span>
            <span
              className="v-form"
              {...(v.lang === 'arabic' ? { lang: 'ar', dir: 'rtl' } : {})}
            >
              {v.form}
            </span>
          </span>
        ))}
      </div>

      <div className="meta-row reveal r-4">
        {word.ipa && (
          <span className="ipa" dir="ltr">
            {word.ipa}
          </span>
        )}
        {word.audio && (
          <button
            type="button"
            className="audio-btn"
            aria-label={t('nav.brand') + ' — listen'}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>
        )}
        {category && <span className="badge">{category}</span>}
      </div>

      {literal && (
        <p
          className="literal reveal r-5"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(literal) }}
        />
      )}
    </section>
  );
}

/** Tek satırlık literal alıntısı için ufak bir inline-markdown.
 *  marked'ı çağırmak yerine sadece *italic* dönüşümü yapan minimal hali. */
function renderInlineMarkdown(s: string): string {
  return s.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
