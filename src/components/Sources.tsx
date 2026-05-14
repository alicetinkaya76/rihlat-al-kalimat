import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import type { Localized } from '@/types/entities';

interface Props {
  sources: Localized[];
  /** Section frame için "§ NN" ön eki. Default `§ 04` (Person/Book
   *  sayfalarında bu doğru); WordPage etymology § 03 + siblings § 04
   *  eklediği için `§ 05` geçer. RelatedWords ile aynı prop pattern'i. */
  sectionNum?: string;
}

/**
 * Kaynaklar listesi. Her kaynak Localized — sayfaya çıktığında
 * geçerli dilin sürümü gösterilir, fallback'ler pickLang üzerinden.
 *
 * Kaynak markdown'ı şu an minimal — *italic* destekleniyor.
 */
export default function Sources({ sources, sectionNum = '§ 04' }: Props) {
  const { t } = useTranslation();
  const { lang } = useLang();

  if (sources.length === 0) return null;

  return (
    <section className="section">
      <header className="section-head">
        <span className="section-num">{sectionNum}</span>
        <h2 className="section-title">{t('sections.sources')}</h2>
      </header>

      <ol className="sources-list">
        {sources.map((src, i) => {
          const text = pickLang(src, lang) ?? '';
          // Arapça kaynaklarda gerçek text RTL olabilir; LTR sıralı bib
          // referansları için orijinal prototip dir="ltr" kullanmıştı.
          const isArabicScript = /[\u0600-\u06FF]/.test(text);
          return (
            <li
              key={i}
              {...(lang === 'ar' && !isArabicScript
                ? { dir: 'ltr' as const, style: { textAlign: 'start' as const } }
                : {})}
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(text) }}
            />
          );
        })}
      </ol>
    </section>
  );
}

function renderInlineMarkdown(s: string): string {
  return s.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
