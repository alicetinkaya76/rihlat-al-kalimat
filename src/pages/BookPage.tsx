import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import BookHeader from '@/components/BookHeader';
import RelatedWords from '@/components/RelatedWords';
import ManuscriptInventory from '@/components/ManuscriptInventory';
import TranslationChain from '@/components/TranslationChain';
import Stratigraphy from '@/components/Stratigraphy';
import Layer, { ROMAN } from '@/components/Layer';
import Sources from '@/components/Sources';
import ThemeBadges from '@/components/ThemeBadges';
import MiniAtlas from '@/components/LeafletMiniAtlas';
import JsonLd from '@/components/JsonLd';
import { EntityLoading, EntityNotFound } from '@/components/EntityPageStates';

import { getBook, getPersonSummary, getThemesForEntity } from '@/content/registry';
import { useEntity } from '@/hooks/useEntity';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { homeUrl, booksListUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { buildBookJsonLd, buildBreadcrumbJsonLd } from '@/utils/jsonLd';

import './WordPage.css';
import './PersonPage.css';
import './BookPage.css';

/**
 * Tek bir Book entity'sinin sayfası.
 *
 * URL: `/:lang/kitap/:slug`
 *  • slug bulunamazsa NotFound benzeri "Yakında" bloğu
 *  • Bulunan entity:
 *      BookHeader (manuscript-mark, Arapça başlık, transliterasyon,
 *                  anlam, meta-grid, genre-badges, opening-quote)
 *    + .strat-layout (3 sütun: stratigraphy + layers + book-aside)
 *    + RelatedWords variant='grid' (full-width "Bu kitaba bağlı kelimeler")
 *    + Sources
 *    + colophon
 */
export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLang();
  const { t } = useTranslation();
  const { entity: book, status } = useEntity(slug, getBook);

  // Dilim 7/11.C: sekme başlığı — kitap adı locale'e göre.
  const titleForTab = book ? pickLang(book.title, lang) : slug;
  usePageTitle(titleForTab);

  if (!slug) return <Navigate to={homeUrl(lang)} replace />;
  if (status === 'loading') return <EntityLoading />;
  if (status === 'not-found' || !book) return <EntityNotFound slug={slug} />;

  const layerIdFor = (id: string) => `layer-${id}`;
  const themes = getThemesForEntity('book', book.slug);

  // Yazar görüntüsü: author-aside yalnız slug + romanName + arabicName +
  // trForm/nisba alanlarını okur — hepsi PersonSummary'de var. Tam Person
  // gövdesini indirip parse etmeye gerek yok; sync getPersonSummary yeterli.
  // (Eski kod `getPerson` ile tam Person'a ulaşıyordu; lazy mimaride o
  // async bir Promise dönerdi, oysa BookPage'in render akışını tek bir
  // sync veriyle çözebiliyoruz.)
  const author = book.authorSlug ? getPersonSummary(book.authorSlug) : undefined;
  const authorIsLive = Boolean(author);
  const authorDisplay = author
    ? lang === 'ar' && author.arabicName
      ? author.arabicName
      : stripInlineMarkdown(author.romanName)
    : book.authorSlug;

  // MiniAtlas adaptörü (dilim 7/5.A):
  //   • Yeni şekil: book.atlasAnchors (çoklu-yer rotası: yazılış + tercüme/
  //     dağılım yer(ler)i; year + label ile).
  //   • Eski şekil: book.atlasAnchor (tek slug string) — geriye dönük uyumluluk
  //     için fallback olarak tek-elemanlı bir array'e çevrilir.
  //   • İkisi de yoksa MiniAtlas zaten boş anchors'la null döner; yine de
  //     gereksiz render'ı engellemek için koşullu çağırıyoruz.
  // PersonPage'deki adaptör ile birebir simetrik.
  const miniAtlasAnchors =
    book.atlasAnchors && book.atlasAnchors.length > 0
      ? book.atlasAnchors
      : book.atlasAnchor
        ? [{ slug: book.atlasAnchor }]
        : null;

  return (
    <main>
      <JsonLd
        data={[
          buildBookJsonLd(book, {
            lang,
            pagePath: window.location.pathname,
          }),
          buildBreadcrumbJsonLd([
            { name: t('breadcrumb.home'), path: homeUrl(lang) },
            { name: t('breadcrumb.books'), path: booksListUrl(lang) },
            {
              name: pickLang(book.title, lang) ?? book.slug,
              path: window.location.pathname,
            },
          ]),
        ]}
      />
      <BookHeader
        book={book}
        authorIsLive={authorIsLive}
        authorDisplay={authorDisplay}
      />

      {miniAtlasAnchors && <MiniAtlas anchors={miniAtlasAnchors} />}

      <div className="strat-layout strat-layout--with-aside">
        <Stratigraphy strata={book.strata} layerIdFor={layerIdFor} />

        <article className="layers">
          {book.strata.map((s) => (
            <Layer
              key={s.id}
              stratum={s}
              layerId={layerIdFor(s.id)}
              romanNum={ROMAN[s.id] ?? s.id}
            />
          ))}
        </article>

        <aside className="book-aside reveal r-6">
          {author && (
            <BookAuthorAside
              romanName={stripInlineMarkdown(author.romanName)}
              arabicName={author.arabicName ?? ''}
              note={pickLang(author.trForm, lang) ?? pickLang(author.nisba, lang) ?? ''}
              slug={author.slug}
            />
          )}
          <ManuscriptInventory
            title={t('sections.manuscripts')}
            manuscripts={book.manuscripts}
          />
          <TranslationChain
            title={t('sections.translations')}
            translations={book.translations}
          />
          <ThemeBadges themes={themes} variant="aside" />
        </aside>
      </div>

      <RelatedWords
        variant="grid"
        sectionNum="§ 03"
        title={t('sections.relatedWords')}
        links={book.relatedWords}
      />
      <Sources sources={book.sources} />

      <footer>
        <p className="colophon">
          <em>Riḥlat al-Kalimāt</em> <span className="colophon-mark" /> {book.slug}{' '}
          <span className="colophon-mark" /> {lang}
        </p>
      </footer>
    </main>
  );
}

/**
 * Yazar mini-kartı (BookPage'in kenar kolonunda en üstte). Aside'ın
 * .crosslink kart paterniyle uyumlu, ama prototip al-jabr.html'in
 * .author-link tipografisini kullanır (Latin ad serif italik, Arapça
 * isim büyük accent renkli, kısa not).
 */
function BookAuthorAside({
  romanName,
  arabicName,
  note,
  slug,
}: {
  romanName: string;
  arabicName: string;
  note: string;
  slug: string;
}) {
  const { t } = useTranslation();
  const { lang } = useLang();
  return (
    <div className="aside-block">
      <h4 className="aside-title">{t('sections.author')}</h4>
      <a className="author-link" href={`/${lang}/kisi/${encodeURIComponent(slug)}`}>
        {arabicName && (
          <span className="author-arabic" lang="ar" dir="rtl">
            {arabicName}
          </span>
        )}
        <span className="author-roman">{romanName}</span>
        {note && (
          <span
            className="author-note"
            dangerouslySetInnerHTML={{ __html: stripInlineMarkdown(note) }}
          />
        )}
      </a>
    </div>
  );
}

/** romanName veya tagline'da kullanılan minik markdown'ı düz HTML'e çevir
 *  (italic ve bold). Linkler için href tarafına string-temizleme istemediğimiz
 *  için ayrı bir helper. */
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}
