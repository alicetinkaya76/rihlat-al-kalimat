import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import type { Manuscript } from '@/types/entities';

interface Props {
  title: string;
  manuscripts: Manuscript[];
}

/**
 * Kitap sayfasının kenar kolonunda elyazması envanteri. al-jabr.html
 * prototipindeki `.manuscript` kartlarının React karşılığı.
 *
 * Discriminated union davranışı:
 *  • `status === 'full'` → tip `url: string`'i ZORUNLU kıldığı için
 *    güvenli `<a>` (yeni sekmede dış kütüphane). Çalışma zamanında
 *    extra defansif kontrol gereksiz — TypeScript daraltma yapıyor.
 *  • `status === 'partial' | 'offline'` → url opsiyonel; varsa `<a>`,
 *    yoksa `<span>`.
 */
export default function ManuscriptInventory({ title, manuscripts }: Props) {
  const { lang } = useLang();
  const { t } = useTranslation();

  if (manuscripts.length === 0) return null;

  return (
    <div className="aside-block">
      <h4 className="aside-title">{title}</h4>
      {manuscripts.map((m, i) => {
        const name = pickLang(m.name, lang) ?? '';
        const where = pickLang(m.where, lang) ?? '';
        const inner = (
          <>
            <span className="manuscript-shelfmark" dir="ltr">
              {m.shelfmark}
            </span>
            <span
              className="manuscript-name"
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(name) }}
            />
            {where && (
              <span
                className="manuscript-where"
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(where) }}
              />
            )}
            <span className="manuscript-status" data-online={m.status}>
              {t(`book.manuscriptStatus.${m.status}`)}
            </span>
          </>
        );

        // Discriminated narrowing: 'full' status ALWAYS supplies url (compile-time).
        if (m.status === 'full') {
          return (
            <a
              key={`${m.shelfmark}-${i}`}
              className="manuscript"
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          );
        }
        if (m.url) {
          return (
            <a
              key={`${m.shelfmark}-${i}`}
              className="manuscript"
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          );
        }
        return (
          <span key={`${m.shelfmark}-${i}`} className="manuscript">
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
