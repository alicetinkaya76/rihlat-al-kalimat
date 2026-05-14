/**
 * LeafletAtlas — Akdeniz + Yakın Doğu + Hint atlası (dilim 7/42.σ-prime).
 *
 * Mimari:
 *  • react-leaflet + Stamen Watercolor — manuscript-uyumlu sanatsal harita.
 *  • Tüm 26 yer marker olarak görünür; her marker hover'da şehir adını,
 *    tıklamada popup'ta o yere bağlı entity'lerin listesini gösterir.
 *  • Entity loader'dan tüm Word/Person/Book/Theme summary'leri çek, byPlace
 *    gruplaması yap — her yerin altında hangi entity'ler var, tek geçişte
 *    hesapla.
 *  • Bounded view: Atlantik (-12° lng) ↔ Hint (80° lng), Britanya (60° lat)
 *    ↔ Yemen (10° lat). Bu kapsam korpusun tüm anchor'larını doğal olarak
 *    sınırlar; kullanıcı dünyaya zoom-out edemez.
 *
 * Dilim 7/43 hedefi (sonra): archetype filter + kelime arama. Bu versiyon
 * sadece veri katmanı + tile + marker — yapı kurulur, etkileşim sonra
 * eklenir.
 */

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { listAtlasPlaces, type AtlasPlace } from '@/content/atlas';
import { listBooks, listPersons, listThemes, listWords } from '@/content/registry';
import { pickLang } from '@/utils/localized';
import { entityUrl } from '@/router/paths';
import type {
  Lang,
  EntityType,
  WordSummary,
  PersonSummary,
  BookSummary,
  ThemeSummary,
} from '@/types/entities';
import './LeafletAtlas.css';

// ── Stamen Watercolor (Stadia Maps) ─────────────────────────────────
const TILE_URL =
  'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a> ' +
  '· <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a> ' +
  '· <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

// ── Bounded view — korpus coğrafi kapsamı ────────────────────────────
const ATLAS_BOUNDS: LatLngBoundsExpression = [
  [10, -14], // güneybatı: Lizbon batısı + Yemen güneyi
  [60, 82],  // kuzeydoğu: Cambridge kuzeyi + Delhi doğusu
];

// Pin türleri için kısa entity özeti (popup içinde liste)
interface PinnedEntity {
  type: EntityType;
  slug: string;
  label: string;       // popup içinde gösterilecek başlık
  subLabel?: string;   // ikincil bilgi (yıl, açıklama)
}

interface PlaceCluster {
  place: AtlasPlace;
  entities: PinnedEntity[];
}

// Word/Person/Book summary'sinden tek-yerli pin türet
function entitySummaryToPin(
  entity: WordSummary | PersonSummary | BookSummary,
  type: EntityType,
  lang: Lang
): PinnedEntity {
  const label = pickLang(entity.title, lang) ?? entity.slug;
  return { type, slug: entity.slug, label };
}

// Theme summary'sinden çok-yerli pinler türet (her anchor için bir pin)
function themeToPins(theme: ThemeSummary, lang: Lang): { place: string; pin: PinnedEntity }[] {
  const label = pickLang(theme.title, lang) ?? theme.slug;
  const anchors = theme.atlasAnchors ?? [];
  return anchors.map((a) => ({
    place: a.slug,
    pin: {
      type: 'theme' as EntityType,
      slug: theme.slug,
      label,
      subLabel: a.label ? (pickLang(a.label, lang) ?? a.year) : a.year,
    },
  }));
}

// ── Custom marker — entity sayısına göre büyüyen ────────────────────
const placeIcon = (count: number, dimmed: boolean = false) => {
  const size = Math.min(48, 24 + count * 3);
  const fontSize = count >= 10 ? 12 : 13;
  const dimClass = dimmed ? ' rihla-place-marker-inner--dimmed' : '';
  return L.divIcon({
    className: `rihla-place-marker${dimmed ? ' rihla-place-marker--dimmed' : ''}`,
    html: `<span class="rihla-place-marker-inner${dimClass}" style="width:${size}px;height:${size}px;font-size:${fontSize}px">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export interface LeafletAtlasProps {
  /** Eğer verilirse, sadece bu place slug'ları normal görünür, diğerleri soluk.
   *  null/undefined → tüm marker'lar normal. */
  highlightedPlaces?: Set<string> | null;
  /** Tıklanabilir entity slug'ları (popup linklerinde fark için). Yalnız vurgu.  */
  highlightedEntitySlugs?: Set<string> | null;
}

export default function LeafletAtlas({
  highlightedPlaces,
  highlightedEntitySlugs,
}: LeafletAtlasProps = {}) {
  const { t } = useTranslation();
  const { lang } = useLang();

  // ── Tüm entity'leri byPlace gruplaması ile organize et ─────────────
  const clusters = useMemo<PlaceCluster[]>(() => {
    const byPlace = new Map<string, PinnedEntity[]>();

    // Word + Person + Book: tek atlasAnchor (varsa)
    for (const w of listWords()) {
      if (!w.atlasAnchor) continue;
      const arr = byPlace.get(w.atlasAnchor) ?? [];
      arr.push(entitySummaryToPin(w, 'word', lang));
      byPlace.set(w.atlasAnchor, arr);
    }
    for (const p of listPersons()) {
      if (!p.atlasAnchor) continue;
      const arr = byPlace.get(p.atlasAnchor) ?? [];
      arr.push(entitySummaryToPin(p, 'person', lang));
      byPlace.set(p.atlasAnchor, arr);
    }
    for (const b of listBooks()) {
      if (!b.atlasAnchor) continue;
      const arr = byPlace.get(b.atlasAnchor) ?? [];
      arr.push(entitySummaryToPin(b, 'book', lang));
      byPlace.set(b.atlasAnchor, arr);
    }

    // Theme: çoklu atlasAnchors
    for (const th of listThemes()) {
      const themePins = themeToPins(th, lang);
      for (const { place, pin } of themePins) {
        const arr = byPlace.get(place) ?? [];
        arr.push(pin);
        byPlace.set(place, arr);
      }
    }

    // PlaceCluster[] oluştur — yalnız entity'si olan yerler
    return listAtlasPlaces()
      .map((place: AtlasPlace) => {
        const entities = byPlace.get(place.slug) ?? [];
        return { place, entities };
      })
      .filter((c: { place: AtlasPlace; entities: PinnedEntity[] }) => c.entities.length > 0)
      .sort((a: { entities: PinnedEntity[] }, b: { entities: PinnedEntity[] }) => b.entities.length - a.entities.length);
  }, [lang]);

  return (
    <div className="rihla-atlas">
      <MapContainer
        bounds={ATLAS_BOUNDS}
        scrollWheelZoom={true}
        style={{ height: 600, width: '100%' }}
        attributionControl={true}
        zoomControl={true}
        maxZoom={8}
        minZoom={3}
        maxBoundsViscosity={0.85}
        worldCopyJump={false}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={16}
        />
        {clusters.map((cluster) => {
          // Filter aktifse: highlighted set'te olmayan yer'ler dimmed.
          // Filter yoksa (null/undefined): tüm marker'lar normal.
          const isDimmed =
            highlightedPlaces != null &&
            highlightedPlaces.size > 0 &&
            !highlightedPlaces.has(cluster.place.slug);
          return (
          <Marker
            key={cluster.place.slug}
            position={cluster.place.latlng}
            icon={placeIcon(cluster.entities.length, isDimmed)}
            opacity={isDimmed ? 0.45 : 1}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={0.96}>
              <div className="rihla-atlas-tooltip">
                <strong>{pickLang(cluster.place.name, lang) ?? cluster.place.slug}</strong>
                {cluster.place.region && (
                  <span className="rihla-atlas-tooltip-region">
                    {' '}· {pickLang(cluster.place.region, lang)}
                  </span>
                )}
                <div className="rihla-atlas-tooltip-count">
                  {cluster.entities.length} {t('atlas.entities', 'kayıt')}
                </div>
              </div>
            </Tooltip>
            <Popup maxWidth={320} minWidth={240}>
              <div className="rihla-atlas-popup">
                <h3 className="rihla-atlas-popup-name">
                  {pickLang(cluster.place.name, lang) ?? cluster.place.slug}
                </h3>
                {cluster.place.region && (
                  <div className="rihla-atlas-popup-region">
                    {pickLang(cluster.place.region, lang)}
                  </div>
                )}
                <ul className="rihla-atlas-popup-list">
                  {cluster.entities.map((e, i) => {
                    const isEntityHighlighted =
                      highlightedEntitySlugs != null &&
                      highlightedEntitySlugs.size > 0 &&
                      highlightedEntitySlugs.has(e.slug);
                    return (
                    <li key={`${e.type}-${e.slug}-${i}`}>
                      <Link
                        to={entityUrl(lang, e.type, e.slug)}
                        className={`rihla-atlas-popup-link type-${e.type}${isEntityHighlighted ? ' rihla-atlas-popup-link--highlighted' : ''}`}
                      >
                        {e.label}
                      </Link>
                      {e.subLabel && (
                        <span className="rihla-atlas-popup-sub"> · {e.subLabel}</span>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
