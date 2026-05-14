import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import WordHeader from '@/components/WordHeader';
import Stratigraphy from '@/components/Stratigraphy';
import Layer, { ROMAN } from '@/components/Layer';
import EtymologyTree from '@/components/EtymologyTree';
import Siblings from '@/components/Siblings';
import Sources from '@/components/Sources';
import ThemeBadges from '@/components/ThemeBadges';
import JourneyBadge from '@/components/JourneyBadge';
import MiniAtlas from '@/components/LeafletMiniAtlas';
import JsonLd from '@/components/JsonLd';
import { EntityLoading, EntityNotFound } from '@/components/EntityPageStates';

import { getWord, getThemesForEntity } from '@/content/registry';
import { useEntity } from '@/hooks/useEntity';
import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';
import { homeUrl, wordsListUrl } from '@/router/paths';
import { pickLang } from '@/utils/localized';
import { buildWordJsonLd, buildBreadcrumbJsonLd } from '@/utils/jsonLd';

import './WordPage.css';

/**
 * Tek bir Word entity'sinin sayfası.
 *
 * URL: `/:lang/kelime/:slug`
 *  • slug bulunamazsa NotFound rotasına yönlenir
 *  • bulunan entity şu kompozisyonla render edilir:
 *      WordHeader
 *      → Stratigraphy + Layer×N (ana strat-layout)
 *      → EtymologyTree (§ 03; word.etymologyTree varsa)
 *      → Siblings (§ 04)
 *      → Sources (§ 05; etymology bölümü var olduğundan numara kayar)
 *      → colophon
 *  • etymologyTree opsiyonel — yoksa o bölüm tamamen render edilmez ve
 *    Siblings/Sources numaralandırması (§ 04, § 05) yine de tutarlı kalır
 *    (her entity'de tutarlı olan numara → konum eşlemesi). İleride
 *    "etymologyless catalogue Word'ü" durumu için, numaralandırma
 *    re-shuffling istenirse buraya bir helper eklenebilir; MVP'de tüm
 *    showcase Word'lerin etymology'si olur.
 */
export default function WordPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLang();
  const { t } = useTranslation();
  const { entity: word, status } = useEntity(slug, getWord);

  // Dilim 7/11.C: tarayıcı sekme başlığı entity adıyla yansır
  // ("<word> · Riḥlat al-Kalimāt"). Yüklenirken word undefined olur,
  // hook'un boş-input'ta brand'e düşme davranışı geçici "Riḥlat al-Kalimāt"
  // gösterir; entity geldiğinde update'lenir. Slug var ama entity yoksa
  // (not-found) slug'ı fallback olarak göster — kullanıcıya hangi terimi
  // aradığını hatırlatır.
  const titleForTab = word ? pickLang(word.title, lang) : slug;
  usePageTitle(titleForTab);

  if (!slug) {
    return <Navigate to={homeUrl(lang)} replace />;
  }
  if (status === 'loading') return <EntityLoading />;
  if (status === 'not-found' || !word) return <EntityNotFound slug={slug} />;

  const layerIdFor = (id: string) => `layer-${id}`;
  const themes = getThemesForEntity('word', word.slug);

  // MiniAtlas adaptörü (dilim 7/6.A'da Word'e multi-anchor desteği
  // geldikten sonra Person/BookPage paterniyle birebir simetrik):
  //   • Yeni şekil: word.atlasAnchors (çoklu-yer rotası, year + label ile).
  //   • Eski şekil: word.atlasAnchor (tek slug string) — geriye dönük
  //     uyumluluk için tek-elemanlı bir array adaptörüne çevrilir.
  //   • İkisi de yoksa MiniAtlas zaten boş anchors'la null döner; yine de
  //     gereksiz render'ı engellemek için koşullu çağırıyoruz.
  // Dört entity tipinin (Word/Person/Book/Theme) hepsi artık aynı adapter
  // paterni üzerinden MiniAtlas'ı besliyor; mimari simetri kapandı.
  const miniAtlasAnchors =
    word.atlasAnchors && word.atlasAnchors.length > 0
      ? word.atlasAnchors
      : word.atlasAnchor
        ? [{ slug: word.atlasAnchor }]
        : null;

  return (
    <main>
      <JsonLd
        data={[
          buildWordJsonLd(word, {
            lang,
            pagePath: window.location.pathname,
          }),
          buildBreadcrumbJsonLd([
            { name: t('breadcrumb.home'), path: homeUrl(lang) },
            { name: t('breadcrumb.words'), path: wordsListUrl(lang) },
            {
              name: pickLang(word.title, lang) ?? word.slug,
              path: window.location.pathname,
            },
          ]),
        ]}
      />
      <WordHeader word={word} />

      <ThemeBadges themes={themes} variant="inline" />

      {/* JourneyBadge — Word'ün 7 yolculuk arketipinden hangisine ait
          olduğunu söyler. ThemeBadges'le aynı *meta-veri şeridi* sicilinde
          (mono etiket + pill). journey_type undefined ise hiç render
          olmaz; catalogue tier Word'leri kategorize edilmemiş olabilir.
          (Dilim 7/6.C.) */}
      {word.journey_type && <JourneyBadge type={word.journey_type} />}

      {miniAtlasAnchors && <MiniAtlas anchors={miniAtlasAnchors} />}

      <div className="strat-layout">
        <Stratigraphy strata={word.strata} layerIdFor={layerIdFor} />

        <article className="layers">
          {word.strata.map((s) => (
            <Layer
              key={s.id}
              stratum={s}
              layerId={layerIdFor(s.id)}
              romanNum={ROMAN[s.id] ?? s.id}
            />
          ))}
        </article>
      </div>

      {word.etymologyTree && (
        <EtymologyTree tree={word.etymologyTree} sectionNum="§ 03" />
      )}

      <Siblings siblings={word.siblings ?? []} />
      <Sources sources={word.sources} sectionNum="§ 05" />

      <footer>
        <p className="colophon">
          <em>Riḥlat al-Kalimāt</em> <span className="colophon-mark" /> {word.slug}{' '}
          <span className="colophon-mark" /> {lang}
        </p>
      </footer>
    </main>
  );
}
