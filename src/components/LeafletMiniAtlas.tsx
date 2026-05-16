/**
 * LeafletMiniAtlas — entity-specific bounded mini-map (dilim 7/42.σ-prime).
 *
 * Mimari:
 *  • react-leaflet + Stamen Watercolor (Stadia Maps üzerinden).
 *  • API: aynı eski MiniAtlas — `<LeafletMiniAtlas anchors={...} />`.
 *    Sayfa kodlarında sadece import yolu değişir, çağrı imzası aynı.
 *  • Tile: Stamen Watercolor — sanatsal sulu-boya parşömen estetiğine
 *    birebir uyumlu. localhost'ta API key'siz çalışır; production için
 *    Stadia ücretsiz hesap + domain whitelist gerekli.
 *  • Marker: numaralı (1, 2, 3, ...), anchor sırasına göre — kelimenin
 *    yolculuk kronolojisini görsel olarak okumayı kolaylaştırır.
 *  • Bounds: anchor noktalarına otomatik fit + 1.5° lat/lng padding.
 *    Bu şehirler arası boşluğun "nefes" bulmasını sağlar; tek-anchor
 *    durumunda da pin sayfanın ortasında olur.
 *  • scrollWheelZoom kapalı: sayfa içinde scroll-yakalama önlenir
 *    (kullanıcı sayfayı kaydırırken harita zoom yapmasın). Drag pan +
 *    pinch zoom + +/− kontrolleri aktif.
 *
 * Stamen Watercolor max zoom 16 — daha üstünde tile eksikliği var,
 * Stadia docs uyarı veriyor. Kuyruklu yıldız: bizim use case zaten
 * şehir-üstü gözlem (zoom 4-8), bu sınırı görmeyeceğiz.
 */

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import { getAtlasPlace } from '@/content/atlas';
import type { ThemeAtlasAnchor } from '@/types/entities';
import './LeafletMiniAtlas.css';

export interface MiniAtlasProps {
  anchors: ThemeAtlasAnchor[];
}

// ── Stamen Watercolor (Stadia Maps) ─────────────────────────────────
const TILE_URL =
  'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stamen.com/" target="_blank" rel="noopener">Stamen Design</a> ' +
  '· <a href="https://stadiamaps.com/" target="_blank" rel="noopener">Stadia Maps</a> ' +
  '· <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

// ── Custom numaralı marker (parşömen-uyumlu) ─────────────────────────
const numberedIcon = (n: number) =>
  L.divIcon({
    className: 'rihla-marker',
    html: `<span class="rihla-marker-inner">${n}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

export default function LeafletMiniAtlas({ anchors }: MiniAtlasProps) {
  const { lang } = useLang();

  // Anchors → koordinatları olan noktalar (slug → ATLAS_PLACES lookup).
  // Bilinmeyen slug'lar (validate-corpus zaten yakalardı ama defansif) atlanır.
  const points = useMemo(() => {
    return anchors
      .map((a, i) => {
        const place = getAtlasPlace(a.slug);
        if (!place) return null;
        return { ...place, anchor: a, order: i + 1 };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [anchors]);

  // Bounded box: anchor'ların min/max lat-lng + 1.5° padding.
  // Tek anchor durumunda da ~150km'lik bir görüş penceresi oluşur.
  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    if (points.length === 0) return undefined;
    const lats = points.map((p) => p.latlng[0]);
    const lngs = points.map((p) => p.latlng[1]);
    const padLat = 1.5;
    const padLng = 1.5;
    return [
      [Math.min(...lats) - padLat, Math.min(...lngs) - padLng],
      [Math.max(...lats) + padLat, Math.max(...lngs) + padLng],
    ];
  }, [points]);

  if (points.length === 0) return null;

  return (
    <div className="rihla-mini-atlas">
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        style={{ height: 400, width: '100%' }}
        attributionControl={true}
        zoomControl={true}
        maxZoom={16}
        minZoom={3}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          maxZoom={16}
        />
        {points.map((p) => (
          <Marker
            key={p.slug}
            position={p.latlng}
            icon={numberedIcon(p.order)}
          >
            <Tooltip
              direction="top"
              offset={[0, -18]}
              opacity={0.96}
              permanent={false}
              sticky
              interactive
            >
              <div className="rihla-marker-tooltip">
                <div className="rihla-tooltip-name">
                  {pickLang(p.name, lang) ?? ''}
                </div>
                {p.region && (
                  <div className="rihla-tooltip-region">
                    {pickLang(p.region, lang) ?? ''}
                  </div>
                )}
                {p.anchor.year && (
                  <div className="rihla-tooltip-year">{p.anchor.year}</div>
                )}
                {p.anchor.label && (
                  <div className="rihla-tooltip-label">
                    {pickLang(p.anchor.label, lang) ?? ''}
                  </div>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
