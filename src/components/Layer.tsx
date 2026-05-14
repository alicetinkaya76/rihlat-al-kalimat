import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import type { Stratum } from '@/types/entities';

interface Props {
  stratum: Stratum;
  /** DOM id (Stratigraphy ile paylaşılan üretici fonksiyonun çıktısı) */
  layerId: string;
  /** Roma rakamı I..V */
  romanNum: string;
}

const ROMAN: Record<string, string> = {
  '1': 'I',
  '2': 'II',
  '3': 'III',
  '4': 'IV',
  '5': 'V',
};

/**
 * Tek stratum'un mizanpajı. Body alanı önceden marked tarafından HTML'e
 * dönüştürülmüş olduğu için dangerouslySetInnerHTML ile basıyoruz —
 * içerik editöryel kontrolde, kullanıcı girdisi değil.
 */
export default function Layer({ stratum, layerId, romanNum }: Props) {
  const { lang } = useLang();
  const title = pickLang(stratum.title, lang) ?? '';
  const place = pickLang(stratum.place, lang) ?? '';
  const headline = pickLang(stratum.headline, lang) ?? '';
  const bodyHtml = pickLang(stratum.body, lang) ?? '';

  return (
    <section id={layerId} className="layer" data-layer={stratum.id}>
      <div className="layer-rule">
        <span className="rule-num">{romanNum}</span>
        <span>{title}</span>
        <span className="rule-line" />
        <span dir="ltr">{stratum.year}</span>
      </div>

      <span className="layer-year" dir="ltr">
        {stratum.year}
      </span>
      <span className="layer-place">{place}</span>

      <h2
        className="layer-headline"
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(headline) }}
      />

      <div
        className="layer-body"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {stratum.actorTag && (
        <div className="actor-tag">
          <span>{pickLang(stratum.actorTag.label, lang)}</span>
          <span className="actor-name">
            {pickLang(stratum.actorTag.name, lang)}
          </span>
        </div>
      )}
    </section>
  );
}

/** Headline tek satır olduğu için tam marked değil minimal italic dönüşümü. */
function renderInlineMarkdown(s: string): string {
  return s.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}

export { ROMAN };
