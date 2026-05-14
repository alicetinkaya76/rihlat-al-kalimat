import { Link } from 'react-router-dom';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import type { CrossLink, Lang } from '@/types/entities';

type Variant = 'aside' | 'grid';

interface Props {
  /** Bölüm başlığı — i18n çağrısı çağıran tarafta yapılır. */
  title: string;
  links: CrossLink[];
  /**
   * `'aside'` (default): Person sayfasının kenar kolonu —
   * `.aside-block` + `.crosslink` kart dizgisi.
   * `'grid'`: Book sayfasının altındaki tam-genişlikli grid —
   * `.related-words` + `.related-word-card` paneli.
   */
  variant?: Variant;
  /** Yalnızca `variant='grid'` için bölüm numarası prefix'i (§ 03 vb.). */
  sectionNum?: string;
}

/**
 * Cross-link kartları kümesi. İki farklı sayfada iki farklı görünüm
 * ister: PersonPage'in aside'ı için dikey-yığın `.crosslink`, BookPage
 * altındaki tam-genişlikli `.related-words` grid'i. Status === 'live'
 * → `<Link>`; 'placeholder' → `<span>` (görsel olarak yarı saydam,
 * tıklanmaz).
 */
export default function RelatedWords({
  title,
  links,
  variant = 'aside',
  sectionNum,
}: Props) {
  const { lang } = useLang();
  if (links.length === 0) return null;

  if (variant === 'grid') {
    return (
      <section className="section">
        <header className="section-head">
          {sectionNum && <span className="section-num">{sectionNum}</span>}
          <h2 className="section-title">{title}</h2>
        </header>
        <div className="related-words">
          {links.map((l) => (
            <RelatedWordCard
              key={`${l.targetType}-${l.targetSlug}`}
              link={l}
              lang={lang}
            />
          ))}
        </div>
      </section>
    );
  }

  // aside
  return (
    <div className="aside-block">
      <h4 className="aside-title">{title}</h4>
      {links.map((l) => (
        <CrossLinkCard
          key={`${l.targetType}-${l.targetSlug}`}
          link={l}
          lang={lang}
        />
      ))}
    </div>
  );
}

function CrossLinkCard({ link, lang }: { link: CrossLink; lang: Lang }) {
  const roman = pickLang(link.roman, lang) ?? link.targetSlug;
  const note = pickLang(link.note, lang);

  const inner = (
    <>
      {link.arabic && (
        <span className="crosslink-arabic" lang="ar" dir="rtl">
          {link.arabic}
        </span>
      )}
      <span className="crosslink-roman">{roman}</span>
      {note && (
        <span
          className="crosslink-note"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(note) }}
        />
      )}
    </>
  );

  if (link.status === 'live') {
    return (
      <Link className="crosslink" to={entityUrl(lang, link.targetType, link.targetSlug)}>
        {inner}
      </Link>
    );
  }
  return (
    <span className="crosslink-placeholder" aria-disabled="true">
      {inner}
    </span>
  );
}

function RelatedWordCard({ link, lang }: { link: CrossLink; lang: Lang }) {
  const roman = pickLang(link.roman, lang) ?? link.targetSlug;
  const note = pickLang(link.note, lang);

  const inner = (
    <>
      {link.arabic && (
        <span className="rw-arabic" lang="ar" dir="rtl">
          {link.arabic}
        </span>
      )}
      <span className="rw-title">{roman}</span>
      {note && (
        <span
          className="rw-note"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(note) }}
        />
      )}
    </>
  );

  if (link.status === 'live') {
    return (
      <Link
        className="related-word-card"
        to={entityUrl(lang, link.targetType, link.targetSlug)}
      >
        {inner}
      </Link>
    );
  }
  return (
    <span
      className="related-word-card"
      aria-disabled="true"
      style={{ opacity: 0.55, cursor: 'default', pointerEvents: 'none' }}
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
