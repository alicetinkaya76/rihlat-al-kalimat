import { Link } from 'react-router-dom';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import type { Translation } from '@/types/entities';

interface Props {
  title: string;
  translations: Translation[];
}

/**
 * Kitap sayfasının kenar kolonunda tercüme zinciri. al-jabr.html
 * prototipindeki `.translation` kartlarının React karşılığı.
 *
 * Üye, korpusta var olan bir kişiye atfedilmişse (`translatorSlug` set
 * + Person registry'sinde varlık beklenebilir) `<Link>`, aksi halde
 * sade `<span>`. Şu an cross-link integrity validator'ı çağıramıyoruz
 * — bu sayfa render-zamanı; integrity kontrolü build-time bir adımda
 * sonraki dilim için.
 */
export default function TranslationChain({ title, translations }: Props) {
  const { lang } = useLang();

  if (translations.length === 0) return null;

  return (
    <div className="aside-block">
      <h4 className="aside-title">{title}</h4>
      {translations.map((tr, i) => {
        const by = pickLang(tr.by, lang);
        const inner = (
          <>
            <span className="translation-year" dir="ltr">
              {tr.year} · {tr.language}
            </span>
            <span
              className="translation-name"
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(tr.name) }}
            />
            {by && <span className="translation-by">{by}</span>}
          </>
        );

        if (tr.translatorSlug) {
          return (
            <Link
              key={`${tr.year}-${tr.language}-${i}`}
              className="translation"
              to={entityUrl(lang, 'person', tr.translatorSlug)}
            >
              {inner}
            </Link>
          );
        }
        return (
          <span key={`${tr.year}-${tr.language}-${i}`} className="translation">
            {inner}
          </span>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
