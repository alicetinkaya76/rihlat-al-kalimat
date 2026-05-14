import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { entityUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import type { CircleMember, PersonCircle as PersonCircleData } from '@/types/entities';

interface Props {
  circle: PersonCircleData;
}

/**
 * "Etki halkası" / "Inheritance line" — tam genişlikli bölüm. Prototip
 * al-khwarizmi.html'de `.contemporaries > .contemp` grid yapısı.
 *
 * §13'teki kural tip seviyesinde discriminated union ile zorlanmıştır:
 *  • `direction: 'none'`               → komponent hiçbir şey render etmez
 *  • `direction: 'forward'|'contemporary'` → label + en az 1 üye zorunlu
 *
 * Üyenin `personSlug`'ı varsa kart `<Link>`, yoksa `<article>` (yer
 * tutucu — Person sayfası henüz oluşturulmamış olabilir).
 */
export default function PersonCircle({ circle }: Props) {
  const { t } = useTranslation();
  const { lang } = useLang();

  if (circle.direction === 'none') return null;

  const label = pickLang(circle.label, lang) ?? t('sections.inheritanceLine');

  return (
    <section className="section">
      <header className="section-head">
        <span className="section-num">§ 03</span>
        <h2 className="section-title">{label}</h2>
      </header>
      <div className="contemporaries">
        {circle.members.map((m, i) => (
          <ContempCard key={`${m.personSlug ?? 'm'}-${i}`} member={m} />
        ))}
      </div>
    </section>
  );
}

function ContempCard({ member }: { member: CircleMember }) {
  const { lang } = useLang();
  const name = pickLang(member.name, lang) ?? '';
  const note = pickLang(member.note, lang) ?? '';

  const inner = (
    <>
      <div className="contemp-head">
        <h3 className="contemp-title">{name}</h3>
        {member.arabicName && (
          <span className="contemp-arabic" lang="ar" dir="rtl">
            {member.arabicName}
          </span>
        )}
      </div>
      {member.years && (
        <p className="contemp-years" dir="ltr">
          {member.years}
        </p>
      )}
      {note && (
        <p
          className="contemp-note"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(note) }}
        />
      )}
    </>
  );

  if (member.personSlug) {
    return (
      <Link className="contemp" to={entityUrl(lang, 'person', member.personSlug)}>
        {inner}
      </Link>
    );
  }
  return <article className="contemp">{inner}</article>;
}

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
