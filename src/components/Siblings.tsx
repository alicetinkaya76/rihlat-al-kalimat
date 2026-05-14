import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import type { CrossLink } from '@/types/entities';

interface Props {
  siblings: CrossLink[];
}

/**
 * "Akraba kelimeler" alt grid'i. Status === 'live' kartlar gerçek link;
 * 'placeholder' olanlar tıklanamaz (henüz içerik yok). Prototip'in
 * .siblings + .sibling kompozisyonuna birebir uyum.
 */
export default function Siblings({ siblings }: Props) {
  const { t } = useTranslation();
  const { lang } = useLang();

  if (siblings.length === 0) return null;

  return (
    <section className="section">
      <header className="section-head">
        <span className="section-num">§ 04</span>
        <h2 className="section-title">{t('sections.siblings')}</h2>
      </header>

      <div className="siblings">
        {siblings.map((s) => (
          <SiblingCard key={`${s.targetType}-${s.targetSlug}`} link={s} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function SiblingCard({
  link,
  lang,
}: {
  link: CrossLink;
  lang: ReturnType<typeof useLang>['lang'];
}) {
  const roman = pickLang(link.roman, lang) ?? link.targetSlug;
  const note = pickLang(link.note, lang) ?? '';
  const isLive = link.status === 'live';

  const inner = (
    <>
      <div className="sibling-head">
        <h3 className="sibling-title">{roman}</h3>
        {link.arabic && (
          <span className="sibling-arabic" lang="ar" dir="rtl">
            {link.arabic}
          </span>
        )}
      </div>
      {/* Translit yer tutucu — DATA-SCHEMA'da CrossLink üzerine eklenebilir
          ileride; şu an prototype'taki "al-jabr · indirgeme" satırı yok. */}
      {note && (
        <div
          className="sibling-note"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(note) }}
        />
      )}
    </>
  );

  if (isLive) {
    return (
      <Link className="sibling" to={entityUrl(lang, link.targetType, link.targetSlug)}>
        {inner}
      </Link>
    );
  }
  return (
    <span
      className="sibling"
      style={{ opacity: 0.55, cursor: 'default', pointerEvents: 'none' }}
      aria-disabled="true"
    >
      {inner}
    </span>
  );
}

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
