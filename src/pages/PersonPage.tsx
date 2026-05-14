import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PersonHeader from '@/components/PersonHeader';
import PersonCircle from '@/components/PersonCircle';
import RelatedWords from '@/components/RelatedWords';
import WorksTimeline from '@/components/WorksTimeline';
import Stratigraphy from '@/components/Stratigraphy';
import Layer, { ROMAN } from '@/components/Layer';
import Sources from '@/components/Sources';
import ThemeBadges from '@/components/ThemeBadges';
import MiniAtlas from '@/components/LeafletMiniAtlas';
import JsonLd from '@/components/JsonLd';
import { EntityLoading, EntityNotFound } from '@/components/EntityPageStates';
import { buildPersonJsonLd, buildBreadcrumbJsonLd } from '@/utils/jsonLd';

import { getPerson, getThemesForEntity } from '@/content/registry';
import { useEntity } from '@/hooks/useEntity';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { homeUrl, personsListUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';

// WordPage.css strat/layer/sources/colophon kompozisyonunu paylaşır
// (README §"PersonPage CSS'i WordPage.css ile stratigrafi/layer kısmını
// paylaşır"). PersonPage.css yalnızca person-spesifik blokları getirir.
import './WordPage.css';
import './PersonPage.css';

/**
 * Tek bir Person entity'sinin sayfası.
 *
 * URL: `/:lang/kisi/:slug`
 *  • slug bulunamazsa NotFound benzeri "Yakında" bloğuna düşer
 *  • bulunan entity:
 *      PersonHeader
 *    + .strat-layout (3 sütun: stratigraphy + layers + person-aside)
 *    + PersonCircle (full-width "Etki halkası" — direction='none' ise gizli)
 *    + Sources
 *    + colophon
 */
export default function PersonPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLang();
  const { t } = useTranslation();
  const { entity: person, status } = useEntity(slug, getPerson);

  // Dilim 7/11.C: sekme başlığı — entity adı locale'e göre; yüklenirken
  // slug fallback (kullanıcıya hangi kişinin sayfasında olduğunu hatırlatır).
  const titleForTab = person ? pickLang(person.title, lang) : slug;
  usePageTitle(titleForTab);

  if (!slug) return <Navigate to={homeUrl(lang)} replace />;
  if (status === 'loading') return <EntityLoading />;
  if (status === 'not-found' || !person) return <EntityNotFound slug={slug} />;

  const layerIdFor = (id: string) => `layer-${id}`;
  const themes = getThemesForEntity('person', person.slug);

  // MiniAtlas adaptörü (dilim 7/4.C):
  //   • Yeni şekil: person.atlasAnchors (çoklu-yer, year + label ile).
  //   • Eski şekil: person.atlasAnchor (tek slug string) — geriye dönük
  //     uyumluluk için fallback olarak tek-elemanlı bir array'e çevrilir.
  //   • İkisi de yoksa MiniAtlas zaten boş anchors'la null döner; yine de
  //     gereksiz render'ı engellemek için koşullu çağırıyoruz.
  const miniAtlasAnchors =
    person.atlasAnchors && person.atlasAnchors.length > 0
      ? person.atlasAnchors
      : person.atlasAnchor
        ? [{ slug: person.atlasAnchor }]
        : null;

  return (
    <main>
      <JsonLd
        data={[
          buildPersonJsonLd(person, {
            lang,
            pagePath: window.location.pathname,
          }),
          buildBreadcrumbJsonLd([
            { name: t('breadcrumb.home'), path: homeUrl(lang) },
            { name: t('breadcrumb.persons'), path: personsListUrl(lang) },
            {
              name: pickLang(person.title, lang) ?? person.slug,
              path: window.location.pathname,
            },
          ]),
        ]}
      />
      <PersonHeader person={person} />

      {miniAtlasAnchors && <MiniAtlas anchors={miniAtlasAnchors} />}

      <div className="strat-layout strat-layout--with-aside">
        <Stratigraphy strata={person.strata} layerIdFor={layerIdFor} />

        <article className="layers">
          {person.strata.map((s) => (
            <Layer
              key={s.id}
              stratum={s}
              layerId={layerIdFor(s.id)}
              romanNum={ROMAN[s.id] ?? s.id}
            />
          ))}
        </article>

        <aside className="person-aside reveal r-6">
          {person.wordsIndebted && person.wordsIndebted.length > 0 && (
            <RelatedWords
              variant="aside"
              title={t('sections.wordsIndebted')}
              links={person.wordsIndebted}
            />
          )}
          {person.works && person.works.length > 0 && (
            <WorksTimeline title={t('sections.works')} links={person.works} />
          )}
          <ThemeBadges themes={themes} variant="aside" />
        </aside>
      </div>

      <PersonCircle circle={person.circle} />
      <Sources sources={person.sources} />

      <footer>
        <p className="colophon">
          <em>Riḥlat al-Kalimāt</em> <span className="colophon-mark" /> {person.slug}{' '}
          <span className="colophon-mark" /> {lang}
        </p>
      </footer>
    </main>
  );
}
