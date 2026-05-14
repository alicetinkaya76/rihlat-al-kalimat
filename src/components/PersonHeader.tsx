import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { pickLang, pickLangArray } from '@/utils/localized';
import type { Person } from '@/types/entities';

interface Props {
  person: Person;
}

/**
 * Kişi sayfasının üst başlık bloğu — al-khwarizmi.html prototipindeki
 * `.person-header` yapısının React karşılığı.
 *
 * Önemli notlar:
 *  • h1 (`person-roman`) daima romanName'i, h2 (`person-name-arabic`)
 *    daima arabicName'i taşır. AR UI'da CSS, ikincisini büyütüp
 *    birincisini küçük italik bir transliterasyona indirger; LTR UI'da
 *    tersi. DOM sırası iki yönde de aynı (h1 → h2).
 *  • `trForm: Localized` — pickLang fallback zinciriyle UI dilinin formu
 *    seçilir; her dilde *farklı bir formülasyon* taşıdığı için (Oturum 4
 *    ActorTag.name kararıyla aynı gerekçe) Localized.
 *  • romanName içindeki `*x*` minik markdown italik kalıbı `<em>x</em>`'e
 *    çevrilir (prototipte nisbe kısmı italik vurguyla).
 */
export default function PersonHeader({ person }: Props) {
  const { lang } = useLang();
  const { t } = useTranslation();

  const category = pickLang(person.category, lang);
  const tagline = pickLang(person.trForm, lang);
  const birthplace = pickLang(person.birthplace, lang);
  const activeIn = pickLang(person.activeIn, lang);
  const workLanguages = pickLang(person.workLanguages, lang);
  const nisba = pickLang(person.nisba, lang);
  const roles = pickLangArray(person.roleBadges, lang);

  return (
    <section className="person-header">
      <div className="crumbs reveal r-1">
        <span>{t('nav.brand')}</span>
        <span className="sep">·</span>
        <span>{t('entities.personPlural')}</span>
        {category && (
          <>
            <span className="sep">·</span>
            <span>{category}</span>
          </>
        )}
      </div>

      <div className="person-name-block reveal r-2">
        <h1
          className="person-roman"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(person.romanName) }}
        />
        {person.arabicName && (
          <h2 className="person-name-arabic" lang="ar" dir="rtl">
            {person.arabicName}
          </h2>
        )}
        {tagline && (
          <div
            className="person-tr-form"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(tagline) }}
          />
        )}
      </div>

      {(person.lifespan || birthplace || activeIn || workLanguages) && (
        <div className="person-meta reveal r-3">
          {person.lifespan && (
            <MetaCell labelKey="person.meta.lifespan" value={person.lifespan} />
          )}
          {birthplace && (
            <MetaCell labelKey="person.meta.birthplace" value={birthplace} />
          )}
          {activeIn && (
            <MetaCell labelKey="person.meta.activeIn" value={activeIn} />
          )}
          {workLanguages && (
            <MetaCell labelKey="person.meta.workLanguages" value={workLanguages} />
          )}
        </div>
      )}

      {roles.length > 0 && (
        <div className="role-badges reveal r-4">
          {roles.map((role, i) => (
            <span
              key={`${role}-${i}`}
              className="role-badge"
              {...(lang === 'ar' ? { lang: 'ar' as const } : {})}
            >
              {role}
            </span>
          ))}
        </div>
      )}

      {nisba && (
        <p
          className="nisba-quote reveal r-5"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(nisba) }}
        />
      )}
    </section>
  );
}

function MetaCell({ labelKey, value }: { labelKey: string; value: string }) {
  const { t } = useTranslation();
  return (
    <span className="m">
      <span className="m-label">{t(labelKey)}</span>
      <span className="m-value">{value}</span>
    </span>
  );
}

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
