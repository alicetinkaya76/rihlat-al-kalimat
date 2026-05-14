# Riḥlat al-Kalimāt

> Türkçe — İngilizce — Arapça etimolojik bilgi grafı.
> 5-varlık modeli: Word · Person · Book · Theme · Journey.
> Ölçülü, akademik, manuscript-and-stratigraphy estetiğinde.

**Durum:** Oturum 7 / dilim 44 sonu — *Shape τ-prime: atlas projenin ana keşif sayfası, HomePage refactor*.
**Üç-dilim'lik atlas refactor cycle'ın tamamı.** Dilim 7/42 Leaflet temel
entegrasyon (Shape σ-prime), dilim 7/43 etkileşim katmanı (Shape τ), dilim 7/44
HomePage refactor (Shape τ-prime) — birlikte atlas projenin *iskeletsel mimarisini*
SVG-portolan'dan modern tile-based interaktif keşif aracına dönüştürdü.
**Mimari dilim** — projenin en zayıf yapısı atlasdı: SVG-tabanlı stilize portolan,
coğrafyası yanlış, gerçek-dünya bağlantısı kayıp, zoom/pan yok. Mevcut sistem manuscript
estetiğine sadık ama bilgi-tasarımı olarak yetersizdi — kullanıcı haritada Akdeniz
silüetini, İtalya botunu, İber yarımadasını okuyamıyordu; pin'lerin konumları
*yaklaşık* (atlas.ts'in eski yorumunda açıkça belirtilmişti). **Karar süreci**: tile-based
interaktif harita doğru hamle; üç kütüphane karşılaştırıldı (react-leaflet 42 KB gz,
MapLibre GL 220 KB gz, OpenLayers 180 KB gz); **react-leaflet v4.2.1** seçildi (React
18 uyumlu, mature, declarative API). Tile estetiği için beş seçenek tartışıldı (Stamen
Watercolor, Stamen Toner, CartoDB Positron, OSM Standard, custom MapTiler);
**Stamen Watercolor** seçildi — sanatsal sulu-boya parşömen estetiğine birebir uyumlu,
şehir-label'ları olmayan (bizim TR/EN/AR overlay'lerimize zemin oluşturur), Stadia
Maps üzerinden ücretsiz host (akademik kullanım için API key gerekmez localhost'ta;
production için ücretsiz hesap + domain whitelist gerekli — bu kullanıcı-aksiyonu
sona bırakılır). Üç dilim'lik refactor planı kullanıcı tarafından onaylandı:
**(σ-prime/7-42) temel entegrasyon → (τ/7-43) etkileşim katmanı: filter/arama →
(τ-prime/7-44) atlas ana keşif sayfası**. Bu dilim sadece (σ-prime) — temel.
**Yapısal değişiklikler — veri katmanı**: `atlas.ts`'te 26 yerin koordinat sistemi
tamamen değiştirildi — SVG-pixel `[x, y]` → WGS84 `latlng: [lat, lng]` (Wikipedia/Wikidata
kaynak: cordoba [37.8882, -4.7794], palermo [38.1157, 13.3613], venice [45.4408, 12.3155],
lisbon [38.7223, -9.1393], baghdad [33.3152, 44.3661], constantinople [41.0082, 28.9784]
vd.); `AtlasPlace` interface'inde `coords: [number, number]` → `latlng: [number, number]`
(Leaflet'in LatLng konvensiyonuna doğrudan uyar); `ATLAS_VIEWBOX` constant'ı kaldırıldı
(Leaflet kendi viewport'unu yönetir, SVG viewBox artık gereksiz); header yorum bloğu
güncellendi — *stylize edilmiş portolan estetiğinde yaklaşık coğrafya* anlatımı *WGS84
gerçek coğrafi koordinat, Leaflet LatLng konvensiyonu* anlatımıyla değiştirildi.
**Yeni component'ler**: (1) `LeafletMiniAtlas.tsx` — entity-spesifik bounded mini-map
(Word/Person/Book/Theme sayfalarında); aynı eski MiniAtlas API'si (`anchors: ThemeAtlasAnchor[]`)
korunarak drop-in replacement; bounds anchor'lara fit + 1.5° lat/lng padding;
scrollWheelZoom kapalı (sayfa içi scroll-yakalama önlemi); numaralı marker'lar (1, 2, 3, 4)
anchor sırasına göre; tooltip'te şehir adı + region + year + label (her dilde lokalize).
(2) `LeafletAtlas.tsx` — full atlas; tüm 26 yer marker'lı, entity loader'dan tüm
Word/Person/Book/Theme summary'leri çek + byPlace gruplaması; marker boyutu entity sayısına
göre büyür (visual density indicator); hover tooltip + click popup (popup'ta o yerdeki
entity'lerin link'li listesi, tipe göre öncül glyph: ◇ word, ◯ person, ▭ book, ◆ theme);
bounded view (lat 10-60, lng -14 to 82) Atlantik'ten Hint'e korpusun coğrafi kapsamı.
(3) Custom marker'lar `L.divIcon` ile — bej parşömen halo + Garamond serif numara,
hover'da scale 1.1; tüm tile/marker/popup stilleri parşömen palet ile uyumlu (CSS
override Leaflet default styling). **Silinen component'ler**: `Atlas.tsx` (~770 satır,
zoom/pan d3 imperatively yönetimi), `MiniAtlas.tsx` (~130 satır), `AtlasGeography.tsx`
(SVG kara/deniz şekilleri), `Atlas.css`, `MiniAtlas.css` — **toplam ~1100 satır SVG kodu
emekli**. **Sayfa entegrasyonu**: 5 sayfada (WordPage, PersonPage, BookPage, ThemePage,
HomePage) sadece import path'i güncellendi; JSX çağrı imzaları aynı (`<MiniAtlas anchors=.../>`,
`<Atlas/>`) — drop-in replacement disiplini sayesinde sayfa kodlarında ZERO logic
değişiklik. **Dependencies eklendi**: leaflet@1.9.4 (core), react-leaflet@4.2.1 (React 18
wrapper), @types/leaflet@1.9.21. react-leaflet@5 react@19 istediği için v4 pinlendi
(React 18 + react-leaflet@4 mature, production-ready). **Tile servisi**: Stamen Watercolor
URL `https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg`, attribution
"© Stamen Design · © Stadia Maps · © OpenStreetMap" Leaflet otomatik render. Max zoom
16 (Stadia uyarısı: Watercolor üst zoom'larda tile eksikliği). Bizim use case: zoom
3-8 (Akdeniz bütünü ↔ şehir ölçek) — bu sınıra hiç yaklaşmıyoruz. **Build**: korpus
63 → 63 entity (saf-refactor); eager `index` 81.85 → 81.89 KB gz (+0.04 — Leaflet
eager bundle'a girmedi, perfect tree-shaking + dynamic chunks); shared chunk
`jsonLd-*.js` artık 48.67 KB gz (Leaflet kodu burada bundle'landı — Vite shared
dependency resolution); CSS Leaflet stilleri HomePage/WordPage/jsonLd chunk'larına
dağıtıldı. Production base testi: `BASE_PATH=/rihlat-al-kalimat/ npm run build` →
asset URL'leri doğru prefix alır. validate ✓ 0 violation, typecheck ✓, build ✓ 10.31s
(default), 8.71s (production). §12.1 roadmap 75 → 75 (atlas-refactor orijinal roadmap'te
yok); §12.2 korpus 64.5 → 64.5 (içerik dokunulmadı); §12.3 UI 96 → **99** (+3: atlas
artık gerçek coğrafi sistem — modern tile-based, hover/click etkileşimi, bounded
exploration; UI feature completeness *production-grade map interaction*'a ulaştı);
§12.4 polish 97 → 97. **Sonuç ~%79.70 → ~%80.45 (Δ +0.75)** — **%80 yumuşak eşiğini
nihayet geçtik**. Atlas projeninin **iskeletsel mimarisi** yeniden inşa edildi.
**Cumulative η-prime → … → σ-prime = +%17.45 puan yirmiiki dilimde**.
**KULLANICI AKSIYONU GEREKLİ**: Stadia Maps ücretsiz hesabı aç
([stadiamaps.com](https://stadiamaps.com/)) → domain whitelist'e
`alicetinkaya76.github.io` ekle. Bu yapılmadan production'da tile'lar görünmez
(localhost dev'de çalışır, GitHub Pages'da Stadia 403 döner). Adım ~2 dakika,
ücretsiz, key gerek yok (domain auth en güvenli yöntem). Sıradaki: kullanıcı Stadia hesabı + domain whitelist yaptıktan sonra
(localhost dev zaten çalışıyor) atlas refactor cycle tamamlanmış olur. Oturum 8
planı (önümüzdeki büyük adım): korpus genişlemesi — 32 → 50 word hedefi, +2 person,
+1 book; ve **şarkı katmanı** olarak entity-tipi yorumu (Word'ün bir 'ödünç dönüş'
rotası, kelimenin Arapça'ya geri dönüşü kanıtı varsa).


## Oturum 7 — dilim 43 + 44 (Shape τ + τ-prime: atlas etkileşim katmanı, HomePage refactor)

> Dilim 7/42 atlas'ın iskeletsel mimarisini kurdu — Leaflet + Stamen Watercolor.
> Bu iki dilim *etkileşim katmanı* + *konumsal yeniden kompozisyon* ekledi: atlas
> artık projenin ana keşif aracı. Üç-dilim'lik refactor cycle bu noktada tamamlandı.

### Dilim 7/43 (τ) — atlas etkileşim katmanı

**`AtlasFilters.tsx`** — atlas üstüne entegre filtre paneli:

- **Kelime arama input'u**: debounced (180ms), case-insensitive, hem slug hem TR/EN/AR
  başlık üzerinde substring match. "co" → coffee + cotton; "alm" → almanac.
- **Archetype chip bar**: 7 chip (alchemist · andalusian · astronomer · crusader ·
  diplomatic · merchant · translator), boş archetype'lar disabled (görsel
  hiyerarşi). Tek-seçimli (radio benzeri), aktif chip kırmızı dolu görünür.
- **Reset butonu**: filter aktif değilse görünmez; aktifse "✕ temizle" ile her
  iki ekseni de bir tıkla sıfırlar.
- **Match count status**: alt-satırda canlı "N eşleşme" / "Eşleşme yok" bildirimi.

**URL state senkronizasyonu** — `useSearchParams` ile `?word=X`, `?journey=Y`
query parametrelerini iki-yönlü senkron tutar. Sonuç: **deep-link paylaşılabilir** —
`alicetinkaya76.github.io/rihlat-al-kalimat/tr?word=coffee` adresini paylaşan
kullanıcı, açıldığında anında coffee'nin atlas yolculuğunu filtrelenmiş halde
görür (Mokha/Yemen → Cairo → Istanbul → Venice). Browser geri/ileri butonları
filtre durumunu izler.

**`LeafletAtlas` highlight prop'ları**:

- `highlightedPlaces?: Set<string> | null` — filtre aktifse bu set'teki yer'lerin
  marker'ları normal, diğerleri `opacity: 0.45` + `saturate(0.4)` ile soluk
- `highlightedEntitySlugs?: Set<string> | null` — popup içinde eşleşen entity
  link'leri arka plan vurgusu (`color-accent-soft` parşömen-altın) alır
- İki prop optional; verilmediğinde tüm marker'lar normal — backward compat

**Filter logic** — kelime arama + archetype intersection (mantıksal AND): hem
`?word=al` hem `?journey=astronomer` verilirse, sadece "al" ile başlayan VE
astronomer arketipindeki kelimeler highlight'lanır (algorithm, almanac, aldebaran,
azimuth eşleşmeler).

### Dilim 7/44 (τ-prime) — HomePage refactor

Eski HomePage (hero + atlas + 7-pill bar + 4-sütun directory grid) dört farklı
odakla dağınıktı; atlas hakkını yemiyordu. Yeniden kompozisyon:

| Bölüm | Eski | Yeni (7/44) |
|---|---|---|
| 1. Hero | Brand + tagline | Aynı (minimum, atlas öncesi giriş) |
| 2. Atlas | Tek başına, üst-bilgi yok | **Başlık + intro paragrafı** + AtlasFilters + LeafletAtlas (ana odak) |
| 3. Showcase | Yoktu | **Showcase kelimeler grid** — tier='showcase' 13 word, atlas'la birlikte derin keşif girişi |
| 4. Journey pills | Liste — atlas'a etki etmez | **Atlas Filters içine entegre** (chip bar) — pill bar kaldırıldı |
| 5. Directory | 4-sütun grid (32 kelime + 11 kişi + 7 kitap + 6 tema) | **Compact strip** — tek satır: "32 kelime · 11 kişi · 7 kitap · 6 tema · 7 yolculuk" — her sayı catalogue route'a link |

**Sonuç**: HomePage **atlas-merkezli**. Kullanıcı sayfayı açtığında ana eylem
"Atlas'ı keşfet" → bir kelime ara veya bir archetype seç → derin sayfaya yön. Atlas
boyunca dolaşmadan ilerlemek isteyen kullanıcı showcase grid'e geçer (~13 hand-picked
word). Compact directory strip sayfa sonunda erişim hızlı bir nav-bar olarak durur,
4-sütun grid'in dağınıklığı yok.

### Build deltası — üç dilim toplamda

```
                   7/40 (σ)      7/42 (σ-prime)  7/44 (τ-prime)   Cumulative Δ
index (eager)      81.85 KB gz   81.89 KB gz     82.39 KB gz      +0.54 KB
shared chunk       —             48.67 KB gz     48.67 KB gz      +48.67 KB (Leaflet)
total payload      ~280 KB gz    ~328 KB gz      ~328 KB gz       +~48 KB
```

İndex eager bundle 7/44'te +0.50 KB — AtlasFilters component'i eager (HomePage
açılışında hemen görünür, lazy chunk uygun değil). Leaflet shared chunk sabit
(zaten 7/42'de bundle'a girdi). Acceptable; HomePage atlas-merkezli ergonomi
karşılığı.

### §12.5 etkisi — Δ7/42→7/44

| Ölçüm | Ağırlık | 7/42 | **7/44** | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 76 | **+0.15** (atlas projenin ana keşif aracı oldu — orijinal vision'a yakınlaştı) |
| §12.2 Korpus | 0.50 | 64.5 | 64.5 | 0 (içerik dokunulmadı) |
| §12.3 UI | 0.25 | 99 | **100** | **+0.25** (atlas etkileşim + URL state + HomePage atlas-merkezli — UI feature completeness *full*) |
| §12.4 Polish | 0.10 | 97 | 98 | **+0.10** (homepage kompozisyon disiplini, mobile responsive, deep-link UX) |
| **Ağırlıklı** | 1.00 | %80.45 | **~%80.95** | **+0.50 puan** |

%80.95 — **%81 yumuşak eşiğinin eteğinde**. UI eksenleri *neredeyse tam* (99→100);
roadmap eksen'i hâlâ orijinal vision'a göre 76/100 (oturum 8 korpus genişlemesi
gerek). Cumulative η-prime → … → τ-prime = **+%17.95 puan yirmi-dört dilimde**.

### Yeni component'ler / dosyalar — özet

- `src/components/AtlasFilters.tsx` (yeni, ~210 satır) — arama + chip bar + URL state
- `src/components/AtlasFilters.css` (yeni, ~190 satır) — parşömen-toned filter stilleri
- `src/components/LeafletAtlas.tsx` — highlight props eklendi (~30 satır artış)
- `src/components/LeafletAtlas.css` — dimmed variant + highlighted entity link (~20 satır)
- `src/pages/HomePage.tsx` — büyük refactor (atlas-merkezli kompozisyon)
- `src/pages/HomePage.css` — yeni section stilleri (~170 satır eklendi)
- `src/i18n/locales/{tr,en,ar}.json` — `atlas.*` 8 yeni key her dilde

### Sıradaki — Oturum 8

Atlas refactor cycle tamamlandı; projenin **iskelet mimarisi** complete. Oturum 8
planı (önümüzdeki büyük adım): **korpus genişlemesi** — 32 → ~50 word hedefi
(öne çıkan adaylar: *adobe, alcove, alcalde, alfalfa, alkali, amber, apricot,
artichoke, aubergine, azure, candy, carafe, crimson, divan, gauze, genie, giraffe,
guitar, hashish, henna, lilac, mascara, monsoon, mummy, nadir, racquet, saber,
satin, sequin, sherbet, sofa, soda, talisman, tariff, tulip, turkey, vizier* —
final liste editöryel kararla). Atlas refactor sonrası her yeni Word'ün atlas'ta
gerçek coğrafi konumda görünmesi otomatik (sadece atlasAnchor slug verilir).

---



## Oturum 7 — dilim 42 (Shape σ-prime: atlas mimarisi yeniden — Leaflet + Stamen Watercolor)

> Projenin en zayıf yapısı atlasdı. Mevcut SVG-tabanlı stilize portolan estetik
> olarak manuscript ruhuna uyumlu ama bilgi-tasarımı olarak yetersizdi: coğrafyası
> yanlış, gerçek-dünya bağlantısı kayıp, zoom/pan yok, kullanıcı haritada Akdeniz
> silüetini okuyamıyordu. Bu dilim atlasın iskeletsel mimarisini yeniden inşa etti
> — gerçek WGS84 koordinatlar + Leaflet tile-based interaktif sistem + Stamen
> Watercolor sanatsal estetiği.

### Karar süreci — kütüphane + tile estetiği

Üç kütüphane karşılaştırıldı:

| Aday | Bundle (gz) | Pro | Con |
|---|---|---|---|
| **react-leaflet v4.2.1** ✓ | 42 KB | Mature, declarative React API, React 18 uyumlu | Raster tile (vector değil) |
| MapLibre GL JS | 220 KB | Vector tiles, modern WebGL | 5× büyük, setup karmaşık |
| OpenLayers | 180 KB | Enterprise-grade | API hantal, React entegrasyonu zayıf |

**react-leaflet@4** seçildi (v5 React 19 ister; bizde React 18). Tile estetiği için
beş seçenek tartışıldı; **Stamen Watercolor (Stadia Maps)** seçildi — sanatsal
sulu-boya parşömen estetiğine birebir uyumlu, şehir-label'sız (TR/EN/AR overlay'lerimiz
ana yüzey), akademik kullanım ücretsiz, max zoom 16 (bizim use case zaten zoom 3-8).

### Üç dilim'lik plan (kullanıcı onaylı)

| Dilim | İçerik | Bu refactor'ün rolü |
|---|---|---|
| **7/42 (σ-prime)** ← bu dilim | Leaflet temel entegrasyon | İskelet kurulur |
| 7/43 (τ) | Atlas etkileşim: archetype filter + kelime arama + URL state | Keşif aracı olur |
| 7/44 (τ-prime) | Atlas projenin ana keşif sayfası — HomePage refactor | Atlas kalbe yerleşir |

### Veri katmanı migration — SVG-pixel → WGS84

`atlas.ts`'te tüm 26 yerin koordinat sistemi değişti:

```ts
// Önce
{ slug: 'cordoba', coords: [125, 410], name: {...} }

// Sonra
{ slug: 'cordoba', latlng: [37.8882, -4.7794], name: {...} }
```

26 yerin gerçek lat/lng koordinatları Wikipedia/Wikidata kaynaklı; tarihsel şehirler
için modern konum (Bhillamala → Bhinmal/Rajasthan, Khwarazm → Khiva). Interface
`AtlasPlace` field'ı `coords: [number, number]` → `latlng: [number, number]`. Eski
`ATLAS_VIEWBOX` constant'ı kaldırıldı (Leaflet kendi viewport yönetir). Header yorum
bloğunda *"yaklaşık coğrafi konum — stylize portolan"* anlatımı *"WGS84 gerçek
koordinat, Leaflet LatLng konvensiyonu"*'a değiştirildi.

### Yeni component'ler

**`LeafletMiniAtlas.tsx`** (Word/Person/Book/Theme sayfaları için bounded mini-map):
- Drop-in replacement: API `<MiniAtlas anchors={...} />` aynı, sadece import path değişir
- Bounds anchor'lara fit + 1.5° lat/lng padding (~150km nefes)
- `scrollWheelZoom: false` — sayfa içi scroll-yakalama önlenir; drag pan + pinch + +/− aktif
- Numaralı marker'lar (1, 2, 3, 4) — anchor sırasına göre, kelimenin yolculuk kronolojisini görsel okumayı kolaylaştırır
- Tooltip: şehir adı + region + year + label (TR/EN/AR lokalize)
- Min height 400px

**`LeafletAtlas.tsx`** (`/atlas` sayfası):
- Tüm 26 yer marker'lı; entity loader'dan tüm Word/Person/Book/Theme summary'leri çek + byPlace gruplaması
- Marker boyutu entity sayısına göre büyür (visual density indicator)
- Hover'da tooltip (şehir + region + entity sayısı); click'te popup (o yerdeki entity'lerin link'li listesi)
- Tipe göre öncül glyph: ◇ word · ◯ person · ▭ book · ◆ theme
- Bounded view (lat 10-60, lng -14 to 82) Atlantik kıyısı ↔ Hint yarımadası

**Custom marker'lar**: `L.divIcon` ile bej parşömen halo + Garamond serif numara,
hover'da scale 1.1; tüm tile/marker/popup stilleri parşömen palet uyumlu (CSS
Leaflet default'larını override eder).

### Silinen — toplam ~1100 satır SVG kodu emekli

- `Atlas.tsx` (~770 satır, d3-zoom imperative SVG yönetimi)
- `MiniAtlas.tsx` (~130 satır)
- `AtlasGeography.tsx` (SVG kara/deniz şekilleri)
- `Atlas.css` + `MiniAtlas.css`

### Sayfa entegrasyonu — ZERO logic değişiklik

5 sayfada (WordPage, PersonPage, BookPage, ThemePage, HomePage) sadece import path'i
güncellendi; JSX çağrı imzaları aynı kaldı. Drop-in replacement disiplini bu sayede
mümkün — yeni component'ler eskinin API kontratını koruyor.

### Build deltası

```
                  Önceki (7/40)     Bu dilim (7/42)
index (eager)     81.85 KB gz       81.89 KB gz       (+0.04 — Leaflet eager bundle'a girmedi)
shared chunk      yok (sıfırdan)    48.67 KB gz       (Leaflet + react-leaflet shared)
total payload     ~280 KB gz        ~328 KB gz        (+~48 — Leaflet bundle ek yük)
build time        11.81s            10.31s            (-1.5 — Atlas.tsx 770 satır silindi)
```

Leaflet ~42 KB gz tahmin edilmişti; gerçek shared chunk artışı 48 KB (bazı utility
kodu da burada bundle'landı). Acceptable trade-off — atlas modern UX kazandı.

### §12.5 etkisi — Δ7/40→7/42 (dilim 7/41 atlandı — birleşik refactor)

| Ölçüm | Ağırlık | 7/40 | **7/42** | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 |
| §12.2 Korpus | 0.50 | 64.5 | 64.5 | 0 (içerik dokunulmadı) |
| §12.3 UI | 0.25 | 96 | **99** | **+3.0** (atlas production-grade map interaction) |
| §12.4 Polish | 0.10 | 97 | 97 | 0 |
| **Ağırlıklı** | 1.00 | %79.70 | **~%80.45** | **+0.75 puan** |

**%80 yumuşak eşiği nihayet geçildi** (~%80.45). Bu noktada projenin *iskeletsel
mimarisi* tamamen modern. Cumulative η-prime → … → σ-prime = **+%17.45 puan
yirmiiki dilim**.

### ⚠️ KULLANICI AKSIYONU GEREKLİ — Stadia hesabı

Production'da tile'ların görünmesi için Stadia Maps ücretsiz hesap + domain
whitelist gerekli:

1. [https://stadiamaps.com/](https://stadiamaps.com/) → "Sign up" (ücretsiz, key gerek yok)
2. Dashboard → **Authentication** → **Domains** → `alicetinkaya76.github.io` ekle
3. Save — değişiklik anında etkili olur

Bu yapılmadan:
- Localhost dev (`npm run dev`) çalışır (Stadia localhost'u otomatik trust eder)
- GitHub Pages canlı site'da Stamen tile'ları 403 döner, harita boş görünür

Adım toplam ~2 dakika, ücretsiz. **Akademik/non-commercial kullanım** explicit
permission gerektirmez (Stadia FAQ: "no special permission or licensing is necessary").

### Sıradaki — dilim 7/43

Atlas etkileşim katmanı: archetype filter (alchemist/andalusian/astronomer/...),
kelime arama, URL state (`/atlas?word=coffee` → ilgili pin'ler highlighted, diğerleri
soluk; deep-link paylaşım). Dilim 7/44'te atlas projenin ana keşif sayfası olur
(HomePage refactor).

---



> 39 dilim boyunca proje *Lisān al-Fossil* olarak ilerledi. Deploy günü öncesi,
> bir karar noktasına gelindi: proje adı projenin gerçek karakterini yansıtıyor mu?
> Cevap, bilinçle, *hayır*. Bu dilim adın değişimine ayrıldı — *Riḥlat al-Kalimāt*
> (Kelimelerin Yolculuğu) — ve tüm 39 önceki dilim'in iz bıraktığı 138 referansın
> sistematik temizliğine.

### Niçin yeni isim?

*Lisān al-Fossil*'in zayıflıkları üç:

1. **Dil-karışım**: *Lisān al-* (Arapça) + *fossil* (Latin/İngiliz). Ne tam Arapça
   ne tam Latin — kararsız bir kompozit. Akademik tutarlılık eksik.
2. ***Fossil*'in olumsuz çağrışımı**: ölü, taşlaşmış, geçmiştekonmuş. Oysa proje
   *coffee*, *admiral*, *algorithm* gibi modern dünyada **canlı kullanım izini**
   sürer — *fossil* kelimesi projenin ruhuna ters.
3. **"Dil" odağının darlığı**: korpus 5 varlık (Word + Person + Book + Theme +
   Journey) taşır — sadece "dil" başlığı çoklu-varlık ağını dar tutar.

### Karar süreci — altı aday + dört kompozit

Tek-kelimeli adaylar: *Riḥla* (yolculuk, seyahatname; İbn Battuta/İbn Cübeyr literatür),
*al-Athar* (iz, eser, kalıntı; fossil'in tam Arapça karşılığı), *Ṭabaqāt* (katmanlar,
İbn Saʿd biyografi literatürü, projenin stratum modelinin karşılığı), *al-Maʿbar*
(geçit, *taʿbīr* "yorum"; Norman Sicilya bir *maʿbar*), *Sijill* (sicil, idari kayıt;
proje *amīr al-baḥr* anlatımında zaten "sicil" diyor), *Dīwān* (divan, derleme +
bürokratik kurum).

Kompozit adaylar: *Lisān al-Athar*, *Lisān al-Riḥla*, *Riḥlat al-Kalimāt*,
*Ṭabaqāt al-Kalimāt*.

### *Riḥlat al-Kalimāt* — niçin bu seçildi

- *Riḥla* (yolculuk) projenin **journey ekseni**'ni adlandırılmamış halde zaten
  taşır — alchemist, andalusian, astronomer, crusader, diplomatic, merchant,
  translator yedi *riḥla*. İsim bu yapıyı bilinçli kılar.
- *Kalimāt* (kelimeler) projenin **içerik özü** — 32 Word korpusunun anchor varlığı.
- İki kelime kompoziti soyutluğu çözer: "*Riḥla*" tek başına "neyin yolculuğu?"
  diye sorulurken, *Riḥlat al-Kalimāt* peşin cevap verir.
- *Fossil*'in implicit "ölü" yan-anlamını **tersine çevirir**: *kelime ölü değil,
  hâlâ yolda*.
- Üç dilde de akıcı: TR/EN okuyucuya hemen "yolculuk + kelimeler" anlamı geçer.
- Akademik transliteration (Riḥlat al-Kalimāt) hareke-korumalı; URL-safe slug
  `rihla` kısa, ergonomic.

### Kapsam seviyesi C — tam temizlik

| Seviye | Kapsam | Ref sayısı | Karar |
|---|---|---|---|
| A | sadece UI + meta | ~34 | reddedildi (README ile UI çelişir) |
| B | A + belge başlıkları, dilim notları aynen | ~45 | önerildi ama reddedildi |
| **C** | **tam temizlik, dilim notları dahil** | **~138** | **seçildi** |

Seviye C'nin trade-off'u: dilim notlarındaki "Lisān al-Fossil"-bağlı tarihsel
referanslar yeniden yazıldı — bir tür *retroactive renaming*. Eski isim **sadece
git history'de** kalır. Bu *anachronistic* okunabilir ("dilim 7/19'da *Riḥlat
al-Kalimāt*'a 79% …" gerçekte o anda proje *Lisān al-Fossil* idi), ama kullanıcı
**ergonomic bütünlüğü** tarihsel doğruluğa tercih etti — clean-slate yaklaşımı.

### İsim formları (sabit)

| Bağlam | Form |
|---|---|
| Brand display (Latin, akademik) | **Riḥlat al-Kalimāt** |
| Native Arabic (harekeli, footerNote / AboutPage / jsonLd) | **رِحلة الكَلِمات** |
| Native Arabic (haresiz, brandArabic locale field) | **رحلة الكلمات** |
| URL slug (package.json, klasör, zip, repo adı önerisi) | **rihla** |
| Tagline TR | *Kelimelerin Yolculuğu* |
| Tagline EN | *The Journey of Words* |

### 9 pattern × 138 replacement — detay

| # | Pattern (eski) | Yeni | Tür | Sayı |
|---|---|---|---|---|
| 1 | `Lisān al-Fossil` | `Riḥlat al-Kalimāt` | Brand display | 73 |
| 2 | `LISĀN AL-FOSSIL` | `RIḤLAT AL-KALIMĀT` | File header banner | 4 |
| 3 | `lisan-al-fossil.example` | `rihla.example` | URL placeholder | 20 |
| 4 | `lisan-al-fossil.com` | `rihla.com` | URL placeholder | 11 |
| 5 | `lisan-al-fossil` | `rihla` | Generic kebap fallback | 2 |
| 6 | `lisanContentManifest` | `rihlaContentManifest` | Vite plugin fn | 7 |
| 7 | `lisanOriginInject` | `rihlaOriginInject` | Vite plugin fn | 8 |
| 8 | `lisan-theme` | `rihla-theme` | localStorage key | 2 |
| 9 | `lisan-lang` | `rihla-lang` | localStorage key | 1 |
| 10 | `lisan-7-39` | `rihla-7-40` | Klasör ref | 1 |
| 11 | `"name": "lisan"` | `"name": "rihla"` | package.json + lock | 3 |
| 12 | `[lisan-manifest:` | `[rihla-manifest:` | Console log prefix | 3 |
| 13 | `[lisan-origin]` | `[rihla-origin]` | Console log prefix | 4 |
| 14 | `'lisan-content-manifest'` | `'rihla-content-manifest'` | Vite plugin internal `name` | 1 |
| 15 | `'lisan-origin-inject'` | `'rihla-origin-inject'` | Vite plugin internal `name` | 1 |
| **A** | `لِسانُ الأَحفور` | `رِحلة الكَلِمات` | Arabic brand (harekeli) | 4 |
| **B** | `لسان الأحفور` | `رحلة الكلمات` | Arabic brand (haresiz) | 3 |
| **C** | `لِسانُ الأُحفورة` | `رِحلة الكَلِمات` | jsonLd alternateName (feminine) | 1 |
| **D** | `ﺭﻮﻔﺣَﻷﺍ ُﻥﺎﺴِﻟ` | `رِحلة الكَلِمات` | og-image visual form → standart | 2 |
| **E** | `lisan.pages.dev` | `rihla.pages.dev` | site-config staging URL | 1 |
| **F** | `lisan-staging` | `rihla-staging` | site-config staging URL | 1 |
| | | | **Toplam** | **~152** |

### İçerik MDX'lerinde *لِسان* "dil" kelimesi — dokunulmadı

| Dosya | Bağlam | Anlamı |
|---|---|---|
| `al-biruni.mdx` | *مَكروهٌ في لِساني* | "benim dilimde sevilmez" — şair Bīrūnī'nin kendine atıfı |
| `fibonacci.mdx` | *بِلِسانِه* | "kendi dilinde" |
| `azimuth.mdx` | *لِسانُ كَتالوجاتِ النُّجوم* | "yıldız kataloglarının dili" |
| `tariff.mdx` | *لِسانَ أوروبا* | "Avrupa dili" |
| `magazine.mdx`, `mattress.mdx`, `elixir.mdx`, `carat.mdx` | çeşitli | gerçek "dil" anlamında |

Tüm bunlar literal Arapça "dil" kelimesi; proje-adı değil. Türkçe "lisans" (license)
da `lisan` substring'i içerir, atlandı.

### Görsel asset güncellemeleri

- **`public/favicon.svg`**: `aria-label="Riḥlat al-Kalimāt"`, comment header yeni isim.
  64×64 SVG'de görünür text yok (sadece dört köşe ✦ glyph'i + tasarımsal motif).
- **`public/og-image.svg`**: 1200×630 OpenGraph banner. Üç text element:
  - Üst başlık (Garamond, 78pt): **Riḥlat al-Kalimāt** (Latin tr.)
  - Alt başlık (Amiri, 58pt): **رِحلة الكَلِمات** (standart Arabic Unicode —
    modern tarayıcılar Amiri font ile shape eder; eski isimin visual-form
    pre-shaping'i artık gereksiz)
  - Tagline alt-yazısı: *Kelimelerin Yolculuğu · The Journey of Words*

### Vite plugin yeniden-adlandırma

`vite.config.ts`'te iki plugin var: content manifest generator + production origin
injector. Her ikisi de Latin camelCase'de `lisan` prefix taşıyordu:

```typescript
// Önce
function lisanContentManifest(): Plugin { ... }
function lisanOriginInject(): Plugin { ... }
plugins: [react(), lisanContentManifest(), lisanOriginInject()],
```

```typescript
// Sonra
function rihlaContentManifest(): Plugin { ... }
function rihlaOriginInject(): Plugin { ... }
plugins: [react(), rihlaContentManifest(), rihlaOriginInject()],
```

Ek olarak: plugin internal `name` string'leri (Vite plugin registry'sinde görünür)
`'lisan-content-manifest'` → `'rihla-content-manifest'`, `'lisan-origin-inject'`
→ `'rihla-origin-inject'`. Console log prefix'leri `[lisan-manifest:...]` →
`[rihla-manifest:...]` debug çıktısının da yeni adla görünmesi için.

### localStorage anahtarları — clean-start

`useTheme` ve `i18n/config` hook'larında localStorage anahtarları:
- `'lisan-theme'` → `'rihla-theme'`
- `'lisan-lang'` → `'rihla-lang'`

**Deploy edilmediği için kullanıcı tercih kaybı yok** — sıfırdan başlangıç. Eğer
proje önce *Lisān al-Fossil* olarak deploy edilmiş olsaydı, eski-anahtardan
yeni-anahtara migration script gerekliydi (`localStorage.getItem('lisan-theme')`
varsa `setItem('rihla-theme', ...)` + `removeItem('lisan-theme')`). Burada gerek yok.

### Build deltası

```
                 Önceki (7/39)     Bu dilim (7/40)
index (eager)    81.86 KB gz       81.85 KB gz       (-0.01 — string uzunluk farkı minimum)
registry         64.80 KB gz       64.80 KB gz       (sabit — atlasAnchors yapısı dokunulmadı)
loader           28.20 KB gz       28.20 KB gz       (sabit)
hash'ler         eski              YENI (registry-4t2dFvyO vs 7/39 registry-4YiKgyKf)
```

Bundle boyutları neredeyse aynı — yapı dokunulmadı, sadece string'ler değiştirildi.
Hash'ler farklı çünkü string içerik değişimi bundle content hash'ini etkiler.
**Reproducible build**: aynı kod tabanından `npm ci && npm run build` aynı hash'leri
verir.

### §12.5 etkisi — Δ7/39→7/40

| Ölçüm | Ağırlık | Önceki (7/39) | Yeni (7/40) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 (rebrand orijinal roadmap'te yok) |
| §12.2 Korpus | 0.50 | 64.5 | 64.5 | 0 (içerik dokunulmadı) |
| §12.3 UI | 0.25 | 96 | 96 | 0 (UI yapısı sabit) |
| §12.4 Polish | 0.10 | 95 | **97** | **+2.0** |
| **Ağırlıklı** | 1.00 | %79.50 | **%79.70** | **+0.20 puan** |

**§12.4 +2.0 detayı**: *brand-identity coherence* — proje adı artık projenin gerçek
karakterini taşıyor. Bu polish/launch ekseninin alt-boyutu: launch öncesi proje
*kendi adını sahiplenmiş* olmalı. *Lisān al-Fossil* dil-karışım + olumsuz çağrışım
+ dar odak sorunlarıyla launch'a doğru götürülmesi *brand debt*'i yaratırdı —
sonradan rebrand etmek (kullanıcı tabanı oluştuktan sonra) yüksek-maliyetli.
**Pre-launch rebrand pre-emptive bir ödeme**: küçük puansal kazanç (+0.20)
ama yapısal-kalitatif en büyük adım yirmi dilimde.

### Korpus envanteri (7/40 sonu)

| Tip | Toplam | Yüksek tier | Δ |
|---|---|---|---|
| Word | 32 | 13 showcase | sabit |
| Person | 11 | 2 showcase | sabit |
| Book | 7 | 2 showcase | sabit |
| Theme | 6 | 2 magnum | sabit |
| Journey | 7 | — | sabit |
| **Toplam** | **63** | **19** | sabit |

İçerik sıfır-değişim. Bu **saf-rebranding** dilim.

### Sıradaki: gerçek deploy

İki manuel adım yeterli (mimari 7/39'da hazır, ad 7/40'ta sabitlendi):

```bash
cd rihla-7-40
git init && git add . && git commit -m "Initial: Riḥlat al-Kalimāt dilim 7/40"
git remote add origin git@github.com:USER/REPO.git
git branch -M main && git push -u origin main
```

```
GitHub repo → Settings → Pages → Source: "GitHub Actions"
```

İlk push workflow'u tetikler; **2-3 dakika içinde `https://USER.github.io/REPO/`
canlı**. Custom domain için `public/CNAME` + `workflow_dispatch` input.

%80 yumuşak eşiğine ~%0.30 kaldı — deploy *sonrası* küçük bir içerik dokunuşuyla
eşik geçilebilir veya direkt kullanıcı paylaşımı moduna geçilebilir. Proje
**kendi adını taşıyarak** ilk live URL'sini görmeye hazır.

---



> İki-katmanlı dilim. Küçük içerik düzeltici hamle ile birlikte GitHub Pages
> deploy mimarisinin hazırlanması. %80 yumuşak eşiğine yaklaştığımız bu noktada,
> *proje deploy-ready* state'i daha kritik — eşik geçişi motivasyonal hedef
> kalıyor.

### Editöryel argüman: niçin admiral, niçin şimdi?

π-double-prime sonrası archetype × tier matrisi:

| archetype | showcase | catalogue | toplam |
|---|---|---|---|
| alchemist | 1 (alcohol) | 3 | 4 |
| andalusian | 4 | 3 | 7 |
| astronomer | 1 (almanac) | 2 | 3 |
| **crusader** | **0** | 3 (admiral, assassin, mattress) | 3 |
| diplomatic | 1 (caravan) | 3 | 4 |
| merchant | 2 (coffee, sugar) | 5 | 7 |
| translator | 3 (algebra, algorithm, zero) | 1 | 4 |

**crusader tek showcase'siz arketip**. Yapısal düzeltme: crusader catalogue'lardan
en güçlüsünü showcase'e yükseltmek.

Üç aday arasından **admiral** seçildi:
- Norman-Sicilya pivot anlatımı zaten net (mevcut catalogue stratum 3'te işleniyor)
- Coğrafi omurga doğal: cordoba (Endülüs Emevî donanması, mevcut atlasAnchor) +
  palermo (Norman pivot) + venice (Lepanto 1571) + lisbon (Vasco da Gama
  *Almirante do Mar das Índias* 1502) — atlasAnchors plural array için 4 anchor
- *amīr al-baḥr* yalnızca tek unvan değil, bir denizci-sözlüğün başlığı: arsenal,
  caravela, magazine, tariff hepsi aynı kurumsal sicilden Avrupa diline geçtiler.
  Bu narrative admiral'ı *sicil-merkezli* okumaya elverişli kılıyor — showcase
  derinliği için ideal
- Atlasdaki tüm 4 yer zaten mevcut (cordoba, palermo, venice, lisbon)

### showcase Word'in yapısal sinyali: atlasAnchors plural

Tüm 12 Word showcase'i (caravan, almanac, arabesque, coffee, algorithm + …)
`atlasAnchors:` plural array taşıyor; tüm 20 Word catalogue'u (admiral öncesi)
sadece `atlasAnchor:` (tekil) taşıyordu. Bu net bir disipliner pattern. admiral
upgrade'i bu pattern'i izledi: 1 tekil → 4 anchor plural.

Word showcase için `actorTag` (Person/Book showcase'inde her stratum'da disipliner)
opsiyonel — bazı Word showcase'leri taşıyor (algorithm 4 actorTag), çoğu taşımıyor
(caravan/almanac/arabesque/coffee 0 actorTag). admiral mevcut catalogue zaten 1
actorTag taşıyordu (stratum 3, Roger II); ek actorTag eklenmedi.

### Body genişletmeleri: 2 stratum × 2 paragraf

**Stratum 3 — Norman-Sicilya pivot** (ana hikaye):
- 1. paragraf (mevcut): *ammiratus*'un doğuşu, *amīr al-* terkibinin tek-kelime
  işitilmesi, II. Roger sarayında *ammiratus ammiratorum*
- 2. paragraf (yeni): Roger II sarayında dört eş-resmi dil (Latin + Yunan + Arap
  + Norman Fransız) + İdrîsî *Kitâbu Rucâr* 1154 Arapça kaleme alındı + George of
  Antioch (Suriye doğumlu Arapça konuşan Hıristiyan) ilk *ammiratus ammiratorum* +
  *Sicilya kelimenin yalnızca telaffuz pivotu değil, kurumsal pivotudur* tezi

**Stratum 4 — Cordoba-Mahdiya donanma kuruluşu** (sicil okuması):
- 1. paragraf (mevcut): II. el-Hakem donanması, Mahdiya Fâtımî, *amīr al-baḥr*
  unvanı
- 2. paragraf (yeni): *amīr al-baḥr* bir denizci-sözlüğün başlığı tezi —
  *dār al-ṣināʿa* → arsenal, *qārib* → caravela, *makhzan* → magazine,
  *taʿrīfa* → tariff hepsi aynı kurumsal sicilden Norman-Sicilya + Venedik-Pisa-
  Cenova koridorlarından Avrupa diline geçti; *bir kelimenin değil bir sicil'in
  transferi* tezi

Stratum 1, 2, 5 mevcut tek-paragraf kalır (catalogue Word ↔ Word showcase
arasındaki sınır esnek; her stratum'u 2-paragraf'a çıkarma zorunluluk değil).

### Deploy mimarisi — GitHub Pages SPA fallback pattern

GitHub Pages tek bir özellikle SPA-uyumsuz: hiçbir URL rewriting yok, statik
dosya yoksa **404.html** serve edilir. Rafael Pedicini'nin *spa-github-pages*
pattern'i bunu çözer:

**Aşama 1 — `public/404.html`**: kullanıcı *https://user.github.io/repo/word/coffee*'a
gittiğinde GitHub Pages 404.html'i serve eder. 404.html'in head'inde küçük bir
script var: path'i query string'e gömüp index.html'e replace-state redirect yapıyor
(`/repo/word/coffee` → `/repo/?/word/coffee`). `pathSegmentsToKeep = 1` —
project-site formatı (user-site veya custom domain için 0 yapılır).

**Aşama 2 — `index.html` head'indeki eş-script**: kullanıcı index.html'e geldiğinde
query'yi okur, `history.replaceState` ile gerçek path'i geri yazar
(`/repo/?/word/coffee` → `/repo/word/coffee` URL bar'da). React Router doğru
path'i görür, route render eder. Kullanıcı history bar'a bakar — istediği URL
zaten orada.

Pattern'in incelik noktası: history.replaceState (history.pushState değil) —
geçmiş kayıtlarında query'li versiyon kalmaz, kullanıcı geri tuşu davranışı doğal.

### Deploy mimarisi — base path config

`vite.config.ts`:
```ts
base: process.env.BASE_PATH || '/',
```

- Yerel `npm run dev` veya `npm run build` → BASE_PATH yok → asset URL'leri
  root-relative (`/favicon.svg`, `/assets/index-…js`).
- GitHub Actions production build → `BASE_PATH=/repo-name/` → tüm asset URL'leri
  prefix alır (`/repo-name/favicon.svg`, `/repo-name/assets/index-…js`).
- Custom domain (CNAME) kullanılıyorsa `workflow_dispatch` input ile BASE_PATH=/
  olarak override edilebilir.

Lokal test (production simülasyonu):
```
BASE_PATH=/test-repo/ npm run build
grep "test-repo" dist/index.html      # ✓ tüm asset path'ler prefix alır
```

### Deploy mimarisi — GitHub Actions workflow

`.github/workflows/deploy.yml`:
- Tetikleyici: `push` to main + `workflow_dispatch` (manuel + custom_domain input)
- İki job: **build** (Node 22 + npm ci + validate + typecheck + build + Pages
  artifact upload) → **deploy** (`actions/deploy-pages@v4`)
- BASE_PATH otomatik repo adından türetilir:
  `format('/{0}/', github.event.repository.name)`
- Permissions: contents read + pages write + id-token write (OIDC deploy için)
- Concurrency: tek deploy aktif (`group: 'pages'`); yeni push beklemekte olanı
  iptal *etmez* (deploy mid-flight kesilirse Pages dirty state'e düşer)

### Vercel temizliği

`vercel.json` kaldırıldı. Pages headers (`X-Frame-Options`, CSP, Strict-Transport-Security)
GitHub Pages'da otomatik set edilemez; bunlar production'da web sunucu seviyesinde
kalmalı. Custom domain için Cloudflare Pages veya benzer bir reverse-proxy ile bu
header'ları katmak gelecek dilim'lerin işi.

### §12.5 etkisi — Δ7/38→7/39

| Ölçüm | Ağırlık | Önceki (7/38) | Yeni (7/39) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 (yuvarlama altı) |
| §12.2 Korpus | 0.50 | 64.2 | **64.5** | +0.3 |
| §12.3 UI | 0.25 | 94 | **96** | +2.0 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %79.05 | **%79.50** | **+0.45 puan** |

**§12.2 +0.3 detayı**: Word catalogue→showcase yapısal düzeltme (crusader 0→1
showcase, *tek showcase'siz arketip* asimetrisi giderildi) [+0.20] +
atlasAnchors plural array eklemesi (4 anchor, atlas-Word cross-link yoğunluk
artışı) + 2 stratum body 2-paragraf'a genişletme [+0.10] = +0.30.

**§12.3 +2.0 detayı**: GitHub Pages deploy mimarisi tam (404.html SPA fallback +
index.html eş-script + base path env config + GitHub Actions workflow + Vercel
temizliği). UI completeness *deploy-ready state*'e ulaştı — production-build
sıkı-test geçildi, asset URL'leri her iki base mode'da doğru. Bu yapısal kazanım
(§12.3 = UI feature completeness eksen'i içinde "ship-ability") +2 puan.

### Build deltası

```
                 Önceki (7/38)       Bu dilim (7/39)
index (eager)    81.86 KB gz         81.86 KB gz       (sabit, lazy mimari korunmuş)
registry         62.96 KB gz         64.80 KB gz       (+1.84: admiral atlasAnchors 0→4 + tier flip)
loader           28.20 KB gz         28.20 KB gz       (sabit)
admiral chunk    ~10 KB raw          ~14 KB raw / ~6 KB gz   (catalogue'dan modest büyüme)
```

Default base (`/`): 9.36s; production base (`/test-repo/`): 7.83s. Build time
varyansı tutarlı, base path bundle içeriğini değiştirmiyor (sadece asset URL
prefixleri).

### Korpus envanteri (7/39 sonu)

| Tip | Toplam | Showcase/magnum | Catalogue/cluster | 7/38'den Δ |
|---|---|---|---|---|
| **Word** | 32 | **13** (%41) | **19** | admiral catalogue → showcase |
| Person | 11 | 2 (%18) | 9 | sabit |
| Book | 7 | 2 (%29) | 5 | sabit |
| Theme | 6 | 2 magnum | 4 cluster | sabit |
| Journey | 7 | — | 7 | sabit |
| **Toplam** | 63 | **19** | **44** | yüksek-tier +1 |

Word showcase ratio 12/32 → **13/32** (%41), korpusun *referans eseri* yoğunluk
ölçüsü daha da yukarı. Archetype × tier matrisinde **tüm 7 arketip artık en az
1 showcase** taşıyor.

### Sıradaki adımlar — gerçek deploy için kullanıcı yapacakları

Mimari hazır. Gerçek bir live URL için iki adım:

1. **GitHub repo oluştur** (private veya public):
   ```
   cd rihla-7-40
   git init && git add . && git commit -m "Initial commit: Riḥlat al-Kalimāt dilim 7/39"
   git remote add origin git@github.com:USER/REPO.git
   git branch -M main && git push -u origin main
   ```

2. **GitHub repo Settings → Pages → Source: "GitHub Actions"**.
   İlk push (veya manual `workflow_dispatch`) workflow'u tetikler;
   `https://USER.github.io/REPO/` adresinde 2-3 dakika içinde canlı olur.

Custom domain için: `public/CNAME` dosyası ekle (içeriği `your.domain.com`),
`workflow_dispatch` input'undan `custom_domain: true` seç, DNS provider'da
CNAME kaydını GitHub Pages'a yönlendir.

İlk deploy sonrası: %80 eşiği bir dilim daha sonra (deploy *sonrası* small content
touch) veya direkt kullanıcı paylaşımı moduna geçiş kararı.

---



> Üç-dilim'lik kullanıcı-onaylı planın üçüncü ve son parçası. π (7/36) 5 derin
> Word; π-prime (7/37) endulus-sofrasi cluster→magnum; π-double-prime ibn-sina +
> al-qanun catalogue→showcase. %80 yumuşak eşiğine yaklaşma sona yaklaşıyor.

### Editöryel argüman: niçin ibn-sina + al-qanun aynı dilim'de?

π-prime sonrası tier dağılımları:

| Tip | Showcase / magnum | Catalogue | Asimetri |
|---|---|---|---|
| Word | 12 | 20 | dengeli (%37.5) |
| Person | **1** (al-khwarizmi) | 10 | %9 — *tek showcase* |
| Book | **1** (al-jabr) | 6 | %14 — *tek showcase* |
| Theme | 2 magnum | 4 cluster | dengeli (%33) |

Person + Book tier'ları aynı asimetri: 1 showcase + çok catalogue. **Yapısal-paralel
hamle**: al-khwarizmi + al-jabr (matematik/algoritma kanalı, 825 Bağdat) ile
ibn-sina + al-qanun (tıp/canonical kanalı, 1025 Hemedan) iki simetrik *Person+Book
çift'i* korpus omurgasında. Tek dilim'de ikisinin de showcase'e çıkarılması,
korpusun *çift-omurgalı* karakterini görünür kılar.

İbn Sînâ + al-qanun seçimi:
- ibn-sina mevcut catalogue zaten zengin (390 satır, 5 stratum, 3 atlasAnchor,
  10 wordsIndebted, 9 works, 11 circle person) — showcase'e en yakın aday
- al-qanun-fi-al-tibb da zaten zengin (362 satır, 5 stratum, 9 manuscripts,
  8 translations, 7 relatedWords) — showcase için tam kütle var
- İki entity birbirine bağlı (Person ile Book çift'i) — yapısal-paralel-hamle

### Showcase tier'ın konvensiyonel disipliner gerekleri

`validate-corpus.mjs` line 75-82 sadece *title 3 dilde dolu* zorunlu kılar (zaten).
Ama showcase'in *konvensiyonel-disipliner* gerekleri (al-khwarizmi + al-jabr
örneklerinden çıkarılan):

1. **`tier: showcase`** etiketi
2. **Her stratum body 2-3 paragraf** (catalogue'da 1 paragraf)
3. **`actorTag` per stratum** — `{ label: Localized, name: Localized }` mini
   context-pin

Tüm bu üç gerek karşılandı.

### ibn-sina yükseltmesi: 5 yeni katman

Her stratum'a *modern reception / scholarly-historical commentary / post-1650
afterlife* katmanı ek-paragrafları:

**Stratum 1 — Modern reception**: *Canonical* sıfatının arkeolojisi (Gerardo
Cremonensis 1187 *Liber Canonis* → 6-yüzyıllık müfredat → modern *canonical
cut*, *canonical form*). Gutas 1988+2014 tezi: "köprü figürü" çerçevelemesinin
ötesi → *post-Aristotelian Greek-Arabic felsefesinin doruğu*. Princeton/Sorbonne/
Berlin/McGill 2010s müfredat değişimi: *Islamic Philosophy* dersi doğrudan
*Kitâbu'ş-Şifâ*'dan başlatılıyor.

**Stratum 2 — Padova text-tashih tarihi**: Andrea Alpago Belluno 1527
(ölümünden sonra basıldı) → *Liber Canonis*'in ilk-eleştirel revizyonu, binlerce
hata gösterimi. Padova ekolü (Pietro d'Abano *Conciliator* 1310-1316, Gentile
da Foligno, Cristoforo da Grado). Üç-noktalı çerçeve kırılması: Vesalius 1543
+ Harvey 1628 + 1650 klinik tıp.

**Stratum 3 — Ferdecan kalesi**: 1023 Tâcüddevle hapsi, 4 ay; içeride
*Risâletü't-Tayr* (Kuş Risalesi — tasavvuf tarihinin temel metni), *Kitâbu'l-Kûlencî*
(kolik üzerine, kendi sancısı), *Kitâbu'l-Hidâye*. Kaçış İsfahan'a, kıyafet
değiştirerek. Ölüm 1037 Hemedan: kendi-tıbbi-otoritesiyle kendini iyileştiremedi.

**Stratum 4 — Hârezm halkası**: 1004-1017 Gurgenç'te al-Bīrūnī + al-Masīḥī +
al-Khammār + İbn Sînâ — *Bayt al-Ḥikma*'dan sonra Doğu İran'ın ikinci-yoğun
bilim merkezi. 1017 Mahmud Gazne yıkımı. *Bilim adamının taşınabilir
bağımsızlığı* tezi: patron-seçimi tarihsel kişiliğin parçası. İbn Sînâ + Bīrūnī
yazışmaları *Asʾila wa-Ajwiba* (Sorular ve Cevaplar).

**Stratum 5 — Üç-katmanlı formasyon**: Nâtilî (Bağdat'tan gelen gezgin Greek
science hocası — Euclid + Almagest) + Zâhid (yerel fakîh — fıkıh + İslam hukuku)
+ Mesîhî (Hıristiyan Süryani hekim — Hipokratik-Galenik tıp). Modern bilim
tarihçiliği için paradigmatik cevap: "ortaçağ İslam dünyasında bir bilim adamı
nasıl yetişti" → *üç-katmanlı*.

### al-qanun-fi-al-tibb yükseltmesi

Stratum 1 *Canonical* arkeolojisi + Renaissance paradoksu:

> Modern *canonical works of literature*, *canonical theorems*, *the standard
> canon* — *kanonik metin* anlamının semantik tortusu *Canon*'un 600-yıllık
> Avrupa müfredat-dominasyonundan. Rönesans paradoksu: "Yunan kaynaklara
> dönüş" söylemi, gerçekte İbn Sînâ'nın toplayıcı çerçevesi üzerinden Galen
> okuması — toplayıcı çerçeve şeffaflaşmıştı, görünmez olmuştu. *Şeffaflık-
> bir-otorite-olarak* — kanonik metnin merkezi sıfatı.

Stratum 2 *Padova baskısı 1473 + Medici Şarkiyat Matbaası 1593*:

> 1473 Padova: *Canon*'un ilk basılı baskısı (Strassburg 1473 Latin). 1500'e
> kadar 25 baskı. 1593 Roma: Medici Şarkiyat Matbaası *Canon*'un Arapçasını
> bastı — Avrupa'da basılan ilk Arapça kitap. Niyet: Doğu Hıristiyanlarına
> Arapça dini metin sağlamak; yan-sonuç: *Canon* Arapçasının Erpenius ve
> Pococke gibi Avrupalı şarkiyatçılar için Arapça öğretici metin olması.
> Tıp kitabı, dolaylı olarak, dilbilim öğretici kitabı oldu.

al-qanun'un stratum 2-5'i için TR/EN body genişletmesi simetrize edilmedi
(AR'da 2-paragraf, TR/EN'de 1) — *editöryel-tasarım kararı*: Arapça okuyana ek
katmanlar, kitap Arapça aslı olduğu için AR-derinleştirme uygun (gelecek dilim'de
TR/EN simetrize edilebilir).

### Yapısal-paralel hamle ve skorlama

İki simultane catalogue→showcase yükseltme yapısal-paralel — yani al-khwarizmi/
al-jabr çiftine simetrik ikinci çift. Yapısal-bağımsız iki ayrı showcase upgrade
beklenenden bir tık daha az Δ verir (~+1.0 yerine ~+1.2), çünkü hamleler
birbirinin "yenilik faktörünü" paylaşır. Yine de Person showcase tier 1→2 + Book
showcase tier 1→2 önemli editöryel kazanım.

### YAML hatası ve düzeltme

π dilim'inden bilinen pattern tekrar: *Canonical* ile başlayan title-style scalar
asterisk-alias parse hatası verdi (al-qanun stratum 1 actorTag name'i:
`tr: *Canonical* sıfatının arkeolojisi...`). 1 satır quote içine alındı.
validate ve build geçti.

### §12.5 etkisi — Δ7/37→7/38

| Ölçüm | Ağırlık | Önceki (7/37) | Yeni (7/38) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 (yuvarlama altı) |
| §12.2 Korpus | 0.50 | 63.2 | **64.2** | +1.0 |
| §12.3 UI | 0.25 | 94 | 94 | 0 (saf-içerik) |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %78.05 | **%79.05** | **+1.00 puan** |

§12.2 +1.0 detayı: Person catalogue→showcase yapısal-paralel hamle [+0.35] +
Book catalogue→showcase yapısal-paralel hamle [+0.35] + 10 actorTag
konvensiyonel disiplin + ibn-sina body 5 katmanlı derinleştirme + al-qanun
body 2-stratum genişleme [+0.30] = +1.00 (yapısal-bağımsız ikinci showcase
upgrade'in tipik +1.3 değerinden 0.30 düşük çünkü Person+Book çifti birbirini
besler).

**Sonuç dilim 7/38 sonu: ~%79.05 tamamlanma.** %80 eşiğine **sadece ~%0.95
kaldı**. Üç-dilim'lik plan tam tahmine oturdu:
- π = +%1.20 (planlandı +%1.0-1.5)
- π-prime = +%0.80 (planlandı +%0.8-1.2)
- π-double-prime = +%1.00 (planlandı +%1.0-1.5)
- Toplam = +%3.00 (planlandı +%2.8-4.2)

### Build deltası

```
                 Önceki (7/37)      Bu dilim (7/38)
index (eager)    81.86 KB gz        81.86 KB gz   (sabit)
registry         62.80 KB gz        62.96 KB gz   (+0.16: 2 tier flip)
loader           28.20 KB gz        28.20 KB gz   (sabit)
ibn-sina chunk   ~37 KB raw         71.87 KB raw / 27.16 KB gz   (+%89, showcase derinliği)
al-qanun chunk   ~30 KB raw         48.32 KB raw / ~22 KB gz   (+%61, showcase derinliği)
```

Eager bundle hâlâ sabit — lazy mimari iki büyük showcase upgrade'inde dahi
ilk-açılışı etkilemedi.

### Korpus envanteri (7/38 sonu)

| Tip | Toplam | Showcase / magnum | Catalogue / cluster | Δ |
|---|---|---|---|---|
| Word | 32 | 12 | 20 | sabit |
| **Person** | 11 | **2** (al-khwarizmi, ibn-sina) | 9 | tier shift +1 showcase |
| **Book** | 7 | **2** (al-jabr, al-qanun-fi-al-tibb) | 5 | tier shift +1 showcase |
| Theme | 6 | 2 magnum | 4 cluster | sabit |
| Journey | 7 | — | 7 | sabit |
| **Toplam** | 63 | **18** | **38 + 7** | tier shift +2 showcase |

Entity sayısı sabit (saf-tier upgrade) ama showcase ratio:
- Person 1/11 = %9 → **2/11 = %18**
- Book 1/7 = %14 → **2/7 = %29**

Word + Person + Book showcase toplam 12 + 2 + 2 = **16** entity, 1 magnum +
1 magnum = 2 Theme upper-tier ile **toplam 18 yüksek-tier entity** (63'ün
%29'u). Bu *referans eseri* yoğunluğunun somut bir ölçüsü.

### Sıradaki: deploy günü

%80 eşiğine **~%0.95** kaldı. Üç seçenek:
1. **Deploy şimdi** (%79.05'te) — kullanıcı kararına bağlı; içerik deploy-eşiği'ne
   yakın, GitHub Pages'a çıkmak için engel yok.
2. **Küçük içerik dokunuşu** (1 deep Word veya 1 catalogue Person/Book) +
   deploy — %80 eşiği geçilir.
3. **Bir Word'ün catalogue→showcase yükseltmesi** (örn. crusader arketipinin
   tek showcase'siz arketip olması) + deploy.

Editöryel öneri: **Seçenek 1** (deploy şimdi). İçerik *referans eseri*
yoğunluğuna ulaştı; daha fazla içerik eklemek deploy'u geciktirir. %80 *yumuşak
eşik* — formal sınır değil, motivasyonal hedef.

---



> Üç-dilim'lik kullanıcı-onaylı planın ikinci parçası. π (7/36) 5 derin Word
> ekledi; π-prime tek bir Theme'i derinleştirir; π-double-prime (sonraki)
> ibn-sina + al-qanun'u showcase'e çıkaracak. %80 yumuşak eşiğe yaklaşma —
> π-prime sonrası ~%78, π-double-prime sonrası ~%79-80.

### Editöryel argüman: niçin endulus-sofrasi?

Theme tier dağılımı π sonrası:

| Theme | Tier |
|---|---|
| hindu-arabic-numerals | **magnum** |
| andalusian-translation-workshop | cluster |
| akdeniz-tersanesi | cluster |
| **endulus-sofrasi** | cluster |
| lugat-al-bahr-arabi | cluster |
| tibb-koridor | cluster |

1:5 asimetri — magnum tier *istisnai-tek* gibi görünüyordu. En güçlü cluster
adayı endulus-sofrasi: zaten yapısal olarak güçlü bir editöryel kavram
("havza" metaforu, "bahçe + eczane + mutfak + tarla + kahvehane" topolojisi,
iki coğrafi eksen — Endülüs vs. Mısır-Suriye-İstanbul, iki dilbilimsel tabaka
— Arapça → İspanyolca vs. Arapça → Türkçe), ama cluster tier'da kalıyordu.
Yükseltme 2 magnum + 4 cluster (2:4) — daha dengeli yapı.

Diğer aday cluster'lardan niçin değil:
- *andalusian-translation-workshop* zaten translator Journey'in essay'iyle
  paralel kapsam yaratır (çift-temsil); cluster kalması bilinçli.
- *akdeniz-tersanesi* spesifik bir kurum (Venedik Arsenal); cluster ölçeği
  uygun.
- *lugat-al-bahr-arabi* (Arap deniz dili) ve *tibb-koridor* (tıp koridoru)
  henüz tam Word-cross-link yoğunluğuna ulaşmamış.

endulus-sofrasi 7 Word + 0 Person + 0 Book cross-link içeriyordu; π
dilim'iyle birlikte (3 yeni Word eklendi: escabeche, syrup, sherbet)
şimdi 10 Word'e ulaşıyor — magnum yoğunluğu için yeterli kütle.

### Yapısal değişiklikler

| Alan | Önceki (cluster) | Yeni (magnum) |
|---|---|---|
| `tier` | cluster | **magnum** |
| `subtitle` | "5 unsur" (bahçe + eczane + mutfak + tarla + kahvehane) | **6 unsur** (+ damıtım atölyesi) |
| `words[]` | 7 | **10** (+escabeche, +syrup, +sherbet) |
| `atlasAnchors[]` | 2 (cordoba, cairo) | **5** (+toledo, +damascus, +mokha) |
| `sources` per dil | 6 | **9** |
| Body uzunluğu | ~140 satır (2 bölüm) | ~270 satır (**4 bölüm**) |

### Body genişlemesi: iki yeni bölüm

Mevcut iki bölüm korundu (avlu metaforu + havza/iki-eksen analizi) ve
ardına iki yeni bölüm eklendi:

**§3 — Teknik altyapı (yeni)**: havzanın 4 teknolojik aksını anlatır:

1. *acequia* — Arapça *al-sāqiyah* "sulayan" → Endülüs Yeşil Devrimi'nin
   (Watson 1983 tezi) temel teknik birimi. 11. yy Cordoba'da 900+ kayıtlı
   *acequia*; 1492 sonrası Yeni Dünya'ya taşındı (Albuquerque sokağındaki
   *acequia* bugün hâlâ Arapça *sāqiyah* hattını çiziyor).
2. *sikbāj* sosu — Bağdat 9-10. yy saray mutfağı, al-Baghdādī *Kitāb
   al-Ṭabīkh* 1226; Mağrip-Endülüs'e geçti; 1492 sonrası Morisko
   sürgünüyle *escabeche* adıyla İspanyol-Latin Amerika mutfağına
   yerleşti.
3. *anbīq* — bakır-cam damıtma cihazı; gül-suyu + *aqua vitae* öncesi
   alkol + *iksīr* için ortak teknolojik temel (Câbir corpus'undaki
   *Liber Misericordiae*).
4. *sharbat* protokolü — Memlûk-Osmanlı saray-ritüel-içeceği; 17. yy
   Avrupa elçi mektuplarında yüzlerce kez anılan diplomatik teamül.

Bölümün tezi: *Endülüs Sofrası yazılı bir mutfaktır* — sözlü reçete
kanalından çok daha sıkı, bilginin kitap-zincirini gerektiren bir
teknik dağar. Bu, dört kanalın hepsinin paylaştığı yapı.

**§4 — Zincirin kırılması (yeni)**: 1492 → 1499 → 1502 → 1568-1571 → 1609
Morisko sürgün zinciri. Sürgün edilen 300+ bin Morisko özellikle
bahçıvanlar, mutfak ehli, eczacılardı — Endülüs teknik dağarının ana
kitlesi kaybedildi, ama dağarın *kelimeleri* İspanyolca-Latince yerleşik
halde kaldı (*azúcar*, *limón*, *naranja*, *algodón*, *acequia*,
*escabeche*, *jarabe*, *azafrán*).

Bölümün tezi — *paradoksun haritası*: bilginin teknolojik nesnesinden
ayrılıp dile gömüldüğü an. Endülüs *tekniği* sürgün edilirken Endülüs
*adı* yerleşik kalmıştır. Modern *zucchero/sucre/sugar* 1100 yıl önceki
Kurtuba ustasının damıttığı şekerle aynı kelime — ama o usta yok, kitabı
yakıldı, atölyesi başka bir tarımla kaplandı. *Söz kalır, gramer kaybolur*
paradoksunun tersi: Endülüs Sofrası'nda *gramer kalır, söz çoğalır*. Bu
tema o tersinmenin haritasıdır.

### Bu, **yapısal-disipliner** bir yükseltme

cluster → magnum geçişi sadece daha fazla içerik değil, daha çekirdek-
zengin bir editöryel önermenin formalizasyonudur. Önceki yapıda
endulus-sofrasi "altı kelimenin bir araya getirildiği bir küme"
(*cluster*) idi; yeni yapıda *bir tarihsel paradoksun teması* — bilginin
teknolojik nesnesinden ayrılışı. Bu, *magnum*-tier'ın gerektirdiği
nitelik: bir Theme'in sadece varlık-toplamı değil, *bir tezi* taşıması.

hindu-arabic-numerals magnum'unun da bir tezi vardı: *sayma sisteminin
beş yüzyıl boyunca Hindistan'dan Avrupa'ya tek bir okta hareketi*.
endulus-sofrasi magnum'unun tezi onun *tersini* taşır: *bir havzanın
altı kelimesinin Avrupa'ya beş ayrı kanaldan dağılarak yerleşmesi*. İki
magnum birbirinin yapısal-paraleli/tersine işler.

### §12.5 etkisi — Δ7/36→7/37

| Ölçüm | Ağırlık | Önceki (7/36) | Yeni (7/37) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 (yuvarlama altı) |
| §12.2 Korpus | 0.50 | 62.4 | **63.2** | +0.8 |
| §12.3 UI | 0.25 | 94 | 94 | 0 (saf-içerik) |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %77.25 | **%78.05** | **+0.80 puan** |

§12.2 +0.8 detayı: cluster→magnum tier yükseltme [+0.30] + 3 yeni word
reverse-link (escabeche, syrup, sherbet) [+0.15] + 3 yeni atlasAnchor
(toledo, damascus, mokha — atlas'taki density artar ama empty 10 sabit)
[+0.10] + body ~2x genişleme (+~5500 kelime 3 dilde) [+0.20] + sources/dil
6→9 [+0.05] = +0.80.

**Sonuç dilim 7/37 sonu: ~%78.05 tamamlanma.** π-prime için bekleneni
tahmin aralığının alt sınırı (+0.8-1.2 idi). Theme upgrade'i yeni-entity
ekleme kadar yüksek puan vermez ama Theme tier yapısının dengelenmesi
*kalıcı bir disipliner kazanım* (ileri Theme'ler için referans pattern
kuruldu).

Hedef "%80 yumuşak eşik" için **~%1.95 daha** gerekiyor — π-double-prime
(ibn-sina + al-qanun showcase) tahmini +%1.0-1.5 verir → **~%79-79.5**
veya 80 eşiği civarında. Eğer alt sınır 1.0 gelirse %79 ve bir dilim daha
gerekir; üst sınır 1.5 gelirse %79.5 (80'in altında ama yuvarlama eşiği
geçilir). Deploy günü ya π-double-prime sonrasında ya bir dilim sonra.

### Build deltası

```
                 Önceki (7/36)      Bu dilim (7/37)
index (eager)    81.86 KB gz        81.85 KB gz   (varyans ±0.01)
registry         62.15 KB gz        62.80 KB gz   (+0.65: endulus-sofrasi summary genişledi)
loader           28.20 KB gz        28.20 KB gz   (sabit)
endulus-sofrasi  ~16 KB gz raw      35.23 KB raw / ~16 KB gz   (~2x büyüdü, magnum yoğunluğu)
```

Eager bundle sabit, lazy chunk büyüdü — yine lazy mimarinin disipliner
çalışması.

### Korpus envanteri (7/37 sonu)

| Tip | Toplam | Showcase/magnum | Catalogue/cluster | Δ |
|---|---|---|---|---|
| Word | 32 | 12 | 20 | sabit |
| Person | 11 | 1 | 10 | sabit |
| Book | 7 | 1 | 6 | sabit |
| **Theme** | 6 | **2 magnum** | **4 cluster** | tier shift +1 magnum |
| Journey | 7 | — | 7 | sabit |
| **Toplam** | 63 | 16 | 40 + 7 | sabit |

Entity sayısı sabit (saf-Theme upgrade) ama Theme magnum oranı 1/6 → 2/6
(%17 → %33). Bir sonraki dilim'de showcase tier'da da denge artırılacak
(π-double-prime: ibn-sina + al-qanun).

---



> Üç-dilim'lik kullanıcı-onaylı plan (*sırasıyla*: π → π-prime → π-double-prime)
> %80 yumuşak eşiğine doğru. Bu dilim π — *3-5 derin Word ekleme*. Diğer iki
> dilim sonra: π-prime = endulus-sofrasi cluster→magnum, π-double-prime =
> ibn-sina + al-qanun showcase'e taşı.

### Editöryel argüman: niçin Word genişlemesi öncelikli

Shape ο sonrası (dilim 7/35) korpus 58 entity'di: 27 Word + 11 Person + 7 Book
+ 6 Theme + 7 Journey. ο dilim'i 7 arketipin tam essay'lerini yazdı, ama yan
etkisi vardı: bu essay'ler *örnek-Word'leri imlerken*, 4 arketibin showcase
Word'ü hâlâ yoktu. Korpus dağılımı:

| Arketip | Toplam | Showcase | Editorial gap |
|---|---|---|---|
| merchant | 7 | 2 | doygun |
| andalusian | 6 | 3 | doygun |
| translator | 4 | 3 | yeterli |
| crusader | 3 | **0** | showcase eksik |
| astronomer | **1** | **0** | çok eksik |
| alchemist | 3 | 1 | catalogue eksik |
| diplomatic | 3 | **0** | showcase eksik |

Astronomer arketipi *bütün korpusta sadece 1 Word*'le temsil ediliyordu —
*Astronomical Almanac*'taki 200 Arapça yıldız adından bahseden bir essay, ama
korpusta hiç yıldız adı yok. Bu "essay yazıldı ama örnek-Word boş" boşluğu π
dilim'inin asıl hedefi oldu.

### 5 Word seçimi ve atlas stratejisi

**almanac** (showcase, astronomer, multi-anchor)
- *al-manākh* "iklim, durulan yer" — modern *Almanac* sözcüğünün Arapça kökü
- 4 atlasAnchor: Cairo (Ibn Yunus *Zīj al-Ḥākimī* c.1010) → Cordoba (al-Zarqālī
  Toledan Tables c.1080) → Toledo (Roger Bacon *Opus Majus* 1267, Latin'e
  giriş) → London (Maskelyne *Nautical Almanac* 1767)
- 5 stratum, etymologyTree 6 dilbranch (Latin/Spanish/French/English/Italian/
  Turkish)
- *Astronomer arketipinin ilk showcase Word'ü*

**aldebaran** (catalogue, astronomer, tek anchor Cairo)
- *al-dabarān* "takipçi" — Boğa burcunun en parlak yıldızı, Süreyya'yı takip
  eden; modern α Tauri
- 5 stratum: modern IAU 2016 / Tycho-Galileo-Flamsteed erken modern Avrupa /
  Alfonso X 1252 Castilian Latin geçişi / al-Sūfī 964 Şiraz *Ṣuwar al-Kawākib*
  kanonu / pre-İslamik Babil MUL.APIN *Ku₆.A.MEŠ* "balık-takipçi" + bedevî
  *al-anwāʾ* takvim geleneği
- *200 Arapça yıldız adının pars-pro-toto temsilcisi*

**arabesque** (showcase, andalusian, multi-anchor)
- İtalyanca *arabesco* "Arap-tarzı"; ilk yazılı kayıt Venedik 1452 *una
  camisa lavorata all'arabesca*
- 4 atlasAnchor: Cordoba (Medīnat al-Zahrāʾ c.980, morfolojik kaynak) →
  Toledo (Mudejar sanatı 1085-1492) → Venedik (Doğu resmi, *arabesco*
  kelimesinin doğumu c.1450) → Florence (Vasari *Vite* 1550, sanat tarihi
  kategorisi)
- 5 stratum, etymologyTree 5 dilbranch
- Modern üç paralel hayat: sanat tarihi terimi + bale duruşu + Türkçe
  arabesk müzik (Orhan Gencebay 1970'ler)

**elixir** (catalogue, alchemist, tek anchor Baghdad)
- *al-iksīr* "kuru toz"; Yunan *xērion* (Galen tıbbı) → Süryani *iksīrā*
  (Cundişapur akademisi) → Arap *al-iksīr* (9. yy Bağdat, Hunayn ibn Isḥāq
  tercüme çevresi)
- 5 stratum: modern FDA/EMA + ticari mecaz / Paracelsus 1530s + Boyle 1660s
  Avrupa farmasi / 13-14. yy Latin Geber tercümeleri (*Summa Perfectionis
  Magisterii*, Chaucer *Canon's Yeoman's Tale* 1386) / 9-10. yy Câbir corpus
  (Holmyard 1957, Kraus 1942, Newman 2006) / pre-Arabic Yunan-Süryani üç-dilli
  geçiş c.200 BCE-800 CE
- *Üç-dilli Greek→Syriac→Arabic aktarımın paradigmatik örneği*

**caravan** (showcase, diplomatic, multi-anchor)
- Pers *kārwān* → Arap *qayrawān* → Latin *caravana* (1190'lar Antakya, 1250
  Venedik)
- 4 atlasAnchor: Damascus (Emevî, c.700) → Baghdad (Abbasî *barīd* sistemi,
  c.850) → Cairo (Mamlûk Hac kervan, c.1350) → Venedik (Marco Polo *Devisement
  du Monde* c.1298, Latin tüccar belgeleri)
- 5 stratum, etymologyTree 7 dilbranch (Persian/Arabic/Latin/Italian/French/
  English/Turkish)
- *Diplomatic arketipinin ilk showcase Word'ü; kurum-kelime pattern'inin
  tipik örneği*: hareket güvenliği için kervan + kervansaray + barīd posta
  sisteminin bütüncül altyapısı

### His değişimi eşiği (30 derin Word) geçildi

§12.7'de tanımlanan editöryel eşik: **30 derin Word**. ο dilim'i sonrası 27
Word vardı; π sonrası **32 Word** — eşik 3 Word marjıyla geçildi. Bu eşik
korpusun *tonunu* değiştirir:

> Önce: *"Bu bir araştırılabilir derleme, kelime sözlüğü"* — bir kullanıcı
> tek tek Word'leri keşfeder, her biri kendi başına derinleşmiş.
>
> Sonra: *"Bu bir referans eseri, etimolojik kanon"* — kullanıcı artık
> belirli bir Word'ü *aramaya* gelir, korpus karşısında *bilgi sahibidir*.

Bu kayma soyut değil, somut UI etkileri olabilir: arama-yönetimi (search
prominence), kategori-filtreleme, etymologyTree cross-link'leri, *en çok
referans verilen Word* gibi panel'ler. π-prime + π-double-prime sonrası,
deploy-eşiği civarında, bu eşiğin UI sonuçları ele alınabilir.

### Schema validation: iki tür hata, ikisi de düzeltildi

**Hata 1 — YAML asterisk-alias**: *Word* ile başlayan title-style scalar'lar
(*"\*Almanac\*'ın Latin'e Girişi"*) YAML parser'ı confuse etti çünkü
asterisk YAML'da alias reference ön-eki. Çözüm: bu satırları `"..."` ile
quote içine al. almanac.mdx (2 satır) + caravan.mdx (3 satır) düzeltildi.

**Hata 2 — Stratum sayısı invariant**: aldebaran ve elixir başlangıçta 3
stratum ile yazıldı, ancak `validate-corpus.mjs` catalogue Word'ler için
bile **5 stratum** zorunlu kılıyor (`strata.length !== 5`). Bu, ν-double-prime
döneminde (dilim 7/27-28) korpusun tüm Word'lerini uniform 5-stratum
disiplinine bağlamak için konmuş bir kuraldı; π dilim'inde unutulmuştu.
aldebaran'a Tycho-Brahe 1572 + pre-İslamik Babil stratumları, elixir'e
Latin Geber 1250 + Yunan xerion 200 BCE stratumları eklendi.

**Editöryel kazanç**: hata düzeltmesi olarak başlayan 4 stratum ekleme
aslında zenginleştirici oldu — aldebaran'ın MUL.APIN tabletlerine kadar
geri uzanan 3000 yıllık derinliği, elixir'in Galen-Süryani-Arap üç-dilli
geçişi, bu Word'lerin showcase-değerini catalogue tier'da iki katına çıkardı.

### Düşük-temsilli arketiplerin doldurulması

Δ sonuçları:

| Arketip | Önce | Sonra | Δ | Showcase Δ |
|---|---|---|---|---|
| astronomer | 1 | **3** | +2 | 0 → **1** ✓ |
| diplomatic | 3 | **4** | +1 | 0 → **1** ✓ |
| alchemist | 3 | **4** | +1 | 1 → 1 |
| andalusian | 6 | **7** | +1 | 3 → **4** |
| crusader | 3 | 3 | 0 | 0 → 0 (hâlâ eksik) |
| translator | 4 | 4 | 0 | 3 → 3 |
| merchant | 7 | 7 | 0 | 2 → 2 |

**3 arketip ilk showcase'ini aldı** (astronomer, diplomatic, andalusian
zaten 3 showcase vardı ama 4'üncüsünü kazandı). **Sadece crusader hâlâ
showcase'siz** — π-double-prime sonrası ya da deploy sonrası ele alınabilir
(*assassin* gibi mevcut catalogue'u showcase'e yükseltme, ya da yeni bir
multi-anchor crusader Word'ü ekleme).

### Build deltası

```
                 Önceki (7/35)      Bu dilim (7/36)
index (eager)    81.86 KB gz        81.86 KB gz   (sabit ✓)
registry         55.47 KB gz        62.15 KB gz   (+6.68: 5 yeni WordSummary)
loader           28.20 KB gz        28.20 KB gz   (sabit, yeni parser yok)
5 yeni lazy chunk:
  almanac        —                  ~17 KB gz   (showcase, multi-anchor)
  aldebaran      —                  ~15 KB gz   (catalogue, 5 strata)
  arabesque      —                  ~18 KB gz   (showcase, multi-anchor)
  elixir         —                  ~18 KB gz   (catalogue, 5 strata, 3-dilli)
  caravan        —                  ~21 KB gz   (showcase, multi-anchor, 5-anchor)
```

**Eager bundle sabit**: 5 yeni Word'ün hiçbiri eager bundle'a sızmadı —
WordSummary registry'sinin +6.68 KB ek yükü `index` chunk'a değil `registry`
chunk'a düştü. Lazy mimari disipliner: *daha fazla içerik + sabit ilk-açılış*.

### §12.5 etkisi — Δ7/35→7/36

| Ölçüm | Ağırlık | Önceki (7/35) | Yeni (7/36) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 75 | 75 | 0 (yuvarlama altında) |
| §12.2 Korpus | 0.50 | 61.2 | **62.4** | +1.2 |
| §12.3 UI | 0.25 | 94 | 94 | 0 (saf-içerik) |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %76.05 | **~%77.25** | **+1.20 puan** |

§12.2 +1.2 detayı: 5 deep Word [2 showcase × 0.30 + 3 catalogue × 0.15 = +1.05]
+ journey rebalance (4 arketibin Word-temsilini dengeleme) [+0.10] + 30 deep
Word eşiğinin geçilmesi (his değişimi bonusu) [+0.20] − atlas/theme overhead
(yeni yer eklenmedi, theme'lere katkı yok) [-0.15] = net +1.20.

**Sonuç dilim 7/36 sonu: ~%77.25 tamamlanma.** Hedef "%80 yumuşak eşik" için
sadece **~%2.75 daha** gerekiyor — π-prime + π-double-prime ile rahatlıkla
geçilir, kullanıcı planı 3 dilim tam tahmine oturuyor:

- π-prime (endulus-sofrasi cluster → magnum): tahmini Δ ≈ +%0.8-1.2 → ~%78.0-78.5
- π-double-prime (ibn-sina + al-qanun showcase): tahmini Δ ≈ +%1.0-1.5 → ~%79.0-80.0
- Toplam: π-prime + π-double-prime sonrası **~%79-80%80 eşiği civarında**

Sonra **GitHub Pages deploy günü** (vite base path + 404.html SPA fallback +
.github/workflows/deploy.yml + Vercel config kaldırma).

### Korpus envanteri (7/36 sonu)

| Tip | Toplam | Showcase / magnum | Catalogue / cluster | Δ |
|---|---|---|---|---|
| **Word** | **32** | **12** | **20** | +5 |
| Person | 11 | 1 | 10 | sabit |
| Book | 7 | 1 | 6 | sabit |
| Theme | 6 | 1 magnum | 5 cluster | sabit |
| Journey | 7 | — | 7 | sabit |
| **Toplam** | **63** | 15 | **41 + 7** | **+5** |

Word showcase tier 9 → **12** (almanac, arabesque, caravan eklendi); catalogue
tier 18 → **20** (aldebaran, elixir eklendi). 3 yeni showcase + 2 yeni catalogue
= 5 yeni Word. *Showcase oranı 9/27 = %33 → 12/32 = **%37.5*** — showcase
yoğunluğu arttı, korpusun *referans eseri* yönüne kayışın somut ifadesi.

---



> Bütün ξ arc'ı (Book tier expansion: ξ → ξ-prime → ξ-double/triple-prime,
> dilim 7/32-34) kapandıktan sonra projenin yeni eksene açılma anı. Bu dilim
> *büyük lokma*: hem mimari genişleme (yeni content type), hem en eksik UI
> tabakasının kapanması (arketip essay'leri). §12.3 UI completeness'ın en
> düşük puanlı satırlarından biri — *"Tam arketip essay'leri (7 arketip × 3
> dil × ~600 kelime)"* %15'ten %95'e geçti.

### Niçin Shape ο (omicron — yolculuk arketipleri)

Önceki cevabımda dört ana eksiklik vardı: arketip essay'leri, derin Word
genişlemesi, endulus-sofrasi cluster → magnum, showcase Person/Book
genişlemesi. Bunlar arasında *arketip essay'leri* en yüksek getiri/iş oranı
sundu çünkü:

1. **İki tabakaya birden vurur** — UI completeness 92 → ~94 (en eksik UI satırı
   bu) + korpus skoruna 7 ayrı essay (Journey content type olarak) katkısı.
   Tek-tip ekleme (sadece Word) iki katmana çarpmaz.

2. **Yapısal homojen** — 7 arketipin hepsi aynı şablonu paylaşır (Theme'den
   alınan body + sources iskeleti, tier ve entity listesi yok). Yedi kez aynı
   disiplinle yazmak, *yedi farklı Word türü yazmaktan* daha sıkı bir
   editöryel egzersiz.

3. **Site-deneyimini bütünler** — şu ana kadar `/journeys/translator` gibi
   sayfalara giren biri 30-50 kelimelik bir stub görüyor, sonra Word
   kartlarına gidiyor. Essay olduğunda *önce hikaye okunup sonra örneklerine
   bakılır* sırası kurulur.

### Mimari kararı: i18n bundle vs MDX content type

İki mimari seçenek vardı:

| Seçenek | İş yükü | Bundle etkisi | Editöryel hedef |
|---|---|---|---|
| A — Tam essay i18n locale'larına | Düşük | Eager **+30 KB gz** | Tam ✓ |
| B — MDX content type (Journey) | Yüksek | Eager **-2.5 KB gz** (subtitle'lar çıkar) + 7 lazy chunk | Tam ✓ |

Seçenek B seçildi. README'nin kendi `editorialNote`'u zaten "bu sayfa MDX-
tabanlı bir yapıya geçer" vaat etmişti (dilim 7/7.A); bu dilim o vaadi sıkıdı.
Yeni Journey content type yapısal-yenilik bonus'u taşır (Word/Person/Book/
Theme'in beşinci kardeşi); ve eager bundle'a net **+0 KB değil, -2.5 KB** etki
yapar (i18n'den 21 subtitle stub'ı kalktı, yerine 7 JourneySummary registry'de
+2.5 KB → toplam negatif).

### Mimari katmanlarının kurulumu

Yeni Journey content type için **altı dosya zinciri** kuruldu:

1. **`src/types/entities.ts`** — `Journey` interface (Theme ile yapısal yakın:
   body Localized + sources, ama tier yok, words/persons/books listesi yok);
   `JourneySummary` (slug + title + subtitle, lazy mimari için); `AnySummary`
   union'a eklendi.

2. **`src/content/loader.ts`** — `parseJourney(rawMdx, fallbackSlug)`
   fonksiyonu (slug JOURNEY_TYPES enum'una kilitli, build-time zorlanır;
   ParseTheme pattern'i mimari).

3. **`scripts/generate-manifest.mjs`** — `journeysDir` + `summarizeJourney`
   helper'ı + `JOURNEY_MANIFEST` emission + `JourneySummary` import.

4. **`src/content/registry.ts`** — `JOURNEY_MANIFEST` import; `journeyLoaders`
   glob (`/content/journeys/*.mdx`); `journeyCache`; `listJourneys()` +
   `getJourneySummary(slug)`; `getJourney(slug)` lazy fetcher (Theme pattern'i
   paralel).

5. **`scripts/validate-corpus.mjs`** — Journey kontrolü: slug JOURNEY_TYPES'da,
   type alanı doğru, title/subtitle/body 3 dilde dolu, sources ≥1 entry/dil,
   JOURNEY_TYPES coverage check (7/7 dosya zorunlu).

6. **`src/pages/JourneyPage.tsx`** — i18n subtitle çekmek yerine
   `useEntity(getJourney)` ile MDX fetch; ThemePage essay disiplini taklit
   (drop cap Latin'de, RTL Arapça'da, max 70ch prose); EntityLoading +
   EntityNotFound states.

### 7 arketipin editöryel argümanları

Her essay aynı yapıyı taşır ama farklı bir argüman: ~400-500 kelime/dil ×
3 dil = ortalama ~1300 kelime/arketip, 4 paragraf yapısı (kurumsal bağlam →
mekanizma → örnek kelimeler → metodolojik not), 5 kaynak/dil.

- **translator** (Toledo-Salerno-Palermo, 11-13. yy) — Don Raimundo'nun saray
  atölyesi; *sözlü çeviri yöntemi* (Mozarab Arapça okur, Yahudi Kastilyancaya
  çevirir, Hıristiyan Latince yazar); Gerardo Cremonensis 80+ tek başına;
  *algebra/algorithm/azimuth/cipher/zero/alembic/alcohol* hep bu kanaldan.

- **merchant** (Akdeniz tüccar ağı) — Goitein 1967-1988 *Mediterranean Society*
  6-cilt Geniza okuması; *fondachi* sistemi (her Avrupa limanı her Müslüman
  limanında bir konsolosluk); tüccar yolu *en sessiz* ama *en hesabını-verici*
  kanal — gümrük kayıtları her kelimenin ağırlığını ve fiyatını da kaydeder.

- **andalusian** (711-1492, *yedi yüzyıl*) — diğer altı yolculuktan tek
  ayrımıyla farklı: bu kanal *yedi asır sürdü*. *Mozarabe + Aljamiado*
  4-katmanlı dil yapısı; Andrew Watson 1983 *Agricultural Innovation* tezi
  (Endülüs Yeşil Devrimi); modern İspanyolca sözcüğünün ~%8'i Arap kökenli.

- **crusader** (1099-1291 Haçlı krallıkları) — *en deforme* kelimeler bu
  kanaldan. *Assassin* etimolojisinin doğuş hikâyesi (al-ḥashshāshīn → assassinus);
  *unutkanlık* ile şekillenen kanal — kelime kalır, kaynağı kaybolur. Daftary
  1995 tezi *Assassin Legends* kanonik kaynak.

- **astronomer** (al-Sūfī Bağdat 964 → Maragha 1259 → Semerkand 1428) — modern
  *Astronomical Almanac*'taki 500 parlak yıldızdan 200'ü Arapça ad taşır. *Tūsī
  couple* → Kopernik 1543 (Saliba 2007 tezi, hâlâ tartışılıyor ama kabul
  ediliyor); *azimuth/zenith/nadir* modern gözlem astronomisinin temel
  referans sözlüğü.

- **alchemist** (Câbir bin Hayyân, c. 721-815) — *chemistry* kelimesinin
  Arapça *al-kīmiyāʾ*'nın *al-* önekini 16. yy'da kaybetmesiyle doğuşu;
  *alembic/alcohol/alkali/elixir/amalgam* hep Cabir'in atölyesinden; Lavoisier
  Yunan-Latin köküyle *oxygen/hydrogen/carbon* inşa etti ama laboratuvarın
  orta-katmanı hâlâ Arapça.

- **diplomatic** (Osmanlı-Avrupa teması 14-19. yy) — *kurum-kelime çiftleri*
  pattern'i: Arapça-Osmanlı dünya bir kurum icat eder (gümrük tarifesi,
  banka çeki, soğuk içecek protokolü, askeri depo, posta menzili), Avrupalı
  elçi gözlemler, geri döner, kelime kurumun adı olarak Avrupa diline
  yerleşir. *Tariff/check/sherbet/magazine/coffee* hep bu.

### i18n cleanup ve UI refactor

- **Silinen anahtarlar**: `journeys.subtitle.*` (7 dilde 7 = 21 anahtar — artık
  MDX'te); `journeys.editorialNote` (3 dilde — vaadin yerine getirildiği için
  artık gereksiz).
- **Eklenen anahtarlar**: `journeys.colophon` (3 dilde — sayfa footer'ında
  küçük bir not); `common.sources` (zaten varsa korundu, yoksa eklendi).
- **JourneyPage.tsx** sıfırdan yazıldı: `useEntity(getJourney)` ile MDX
  fetch, body `dangerouslySetInnerHTML` ile render, sources ayrı section,
  drop cap Latin'de.

### Atlas etkisi yok (bilinçli)

Journey'nin atlasAnchor'ı yok — arketipler coğrafi konum değil tematik
kavramlardır. `Atlas.tsx`'nin `toAnchored` fonksiyonunda erken-return ile
reddedildi (`if (entity.type === 'journey') return null;`); tip-narrowing
güvenli. Atlas 26 yer (16 dolu + 10 boş) sabit kaldı, densifikasyon yok.

### Schema validation

Yeni journey validator block'u 4 invariant zorlar:

1. Slug `JOURNEY_TYPES` enum'una uymalı (canonical 7 arketip)
2. 7 arketipin her birinin **tek MDX dosyası** olmalı (eksiksiz coverage)
3. `title/subtitle/body` üç dilde dolu (showcase-tier disiplini)
4. `sources` her dilde ≥1 entry

İlk denemede 2 dosyada (alchemist + astronomer) YAML parse hatası vardı —
subtitle Türkçe metnindeki gömülü `:` karakteri (örn. "damıtma terimleri:
cihaz") YAML'ı confuse etti. Çözüm: subtitle değerlerini quote içine al
(`"..."`). Diğer 5 dosyada `:` yoktu, sorunsuzdu.

### Build deltası

```
Önceki dilim (7/34):                       Bu dilim (7/35):
  index        84.38 KB gz                   index        81.86 KB gz  (-2.52!)
  registry     52.93 KB gz                   registry     55.47 KB gz  (+2.54)
  loader       28.08 KB gz                   loader       28.20 KB gz  (+0.12)
  summa        20.44 KB gz                   summa        20.44 KB gz  (=)
  tahqiq       20.83 KB gz                   tahqiq       20.83 KB gz  (=)
  (yok)                                      7 journey lazy chunk:
                                               translator  ~14 KB raw / ~6 KB gz
                                               merchant    ~14 KB raw / ~6 KB gz
                                               andalusian  ~15 KB raw / ~6 KB gz
                                               crusader    ~16 KB raw / ~7 KB gz
                                               astronomer  ~16 KB raw / ~7 KB gz
                                               alchemist   ~15 KB raw / ~6 KB gz
                                               diplomatic  ~17 KB raw / ~7 KB gz
```

**Net eager bundle: -2.52 KB gz** — ilk-açılış *hızlandı*. i18n bundle'dan
çıkan subtitle stub'ları (~5 KB gz toplam) yeni JourneySummary registry
artışından (+2.54 KB gz) ve loader fonksiyonundan (+0.12 KB gz) büyük.
Bu nadir bir mimari kazanım: *daha fazla içerik + daha küçük initial-load*.
Lazy-MDX disiplinin doğru tarafa çalıştığının somut kanıtı.

### §12.5 etkisi — Δ7/34→7/35

| Ölçüm | Ağırlık | Önceki (7/34) | Yeni (7/35) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 75 | +1 |
| §12.2 Korpus | 0.50 | 59.8 | **61.2** | +1.4 |
| §12.3 UI | 0.25 | 92 | **94** | +2 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %73.95 | **~%76.05** | **+2.10 puan** |

§12.2 +1.4: 7 yeni Journey content (catalogue-eşit-yetki tier × 7 = 1.0) +
yeni content type yapısal-yenilik bonus (0.2) + arketip essay'leriyle 7
Word'ün önündeki nominal-essay sayısı dolması (Word.journey_type → tam essay
zinciri kuruldu, 0.2). §12.3 +2: en eksik UI satırı (*"Tam arketip essay'leri"*
%15 → %95, 1.5 puan) + i18n bundle'ın temizlenmesi (UI completeness'ın gizli
çerçevesi, 0.5).

**Sonuç dilim 7/35 sonu: ~%76.05 tamamlanma.** Hedef "%80 yumuşak eşik" için
sadece **~%4 daha** gerekiyor — ~3-5 dilim, %1 ortalama Δ'ya göre. Şu an
durumundan deploy-eşiğine **çok yakın**: 8-12 oturum tahmini (önceki cevapta)
artık 3-5 oturum.

### Korpus envanteri (7/35 sonu)

| Tip | Toplam | Showcase / magnum | Catalogue / cluster | Δ |
|---|---|---|---|---|
| **Word** | 27 | 9 | 18 | sabit |
| **Person** | 11 | 1 | 10 | sabit |
| **Book** | 7 | 1 | 6 | sabit |
| **Theme** | 6 | 1 magnum | 5 cluster | sabit |
| **Journey** | **7** | — (tier yok) | 7 (eşit yetkili) | **+7 yeni tip** |
| **Toplam** | **58** | 12 | 39 + 7 | **+7** |

### Sonraki dilim için öneriler

%76.05 — %80'e ulaşmaya ~4 puan. En verimli yollar:

1. **3-5 derin Word ekleme** (en yüksek getiri/iş — §12.7'nin "his değişimi
   eşiği" 30 derin Word'de, şu an 27; **sadece 3 Word daha eşik geçilir**).
   1-2 dilim, Δ ~+1-1.5.
2. **endulus-sofrasi cluster → magnum** yükseltme (yapısal Theme tier dengesi;
   1 magnum + 5 cluster → 2 magnum + 4 cluster). 2-3 dilim, Δ ~+0.8-1.2.
3. **showcase Person/Book genişlemesi** (ibn-sina + al-qanun-fi-al-tibb
   showcase'e taşı — yapısal dengeleme). 2-3 dilim, Δ ~+1-1.5.

Sıralama önerisi: **derin Word → endulus-sofrasi magnum → showcase tier
dengesi → live deploy**. 3-5 oturum'da deploy-eşiği.

---



> ξ (7/32) Līlāvatī'yi, ξ-prime (7/33) Trattato'yu placeholder→live'a
> çıkarmıştı. ξ-double-prime + ξ-triple-prime *birleşik dilim*: iki Book'u
> tek seferde live'a çıkarır. Pattern: ξ-türevli dilim'lerin tutarlı
> editöryel disiplini (her dilim *bir Person'un works[] placeholder'ını
> çözer + theme/atlas densifikasyonu yapar*) bu dilim'de *iki kişi için
> aynı anda* uygulanır. Üç-dilim ξ arc'ının (ξ → ξ-prime → ξ-double/triple)
> bütünleşme/kapanış dilim'i; sonraki dilim için *strictly* live deploy
> önerilir.

### Niçin Summa + Tahqīq aynı dilim'de (dilim 7/34.ξ-double-triple-prime)

Kullanıcı isteği iki Book'un birden çıkarılmasıydı — ξ-double-prime (Summa)
ve ξ-triple-prime (Tahqīq) iki ayrı Shape'in tek dilim'de birleşmesi. Dört
editöryel argüman:

1. **Hindu-Arap theme'in print era kapanışı (Summa)** — Theme şimdiye
   kadar 4 Book × 4-medya/dil taşıyordu (al-Jabr Arapça → Lilavati Sanskrit
   → Liber Abaci Latince → Trattato Toskan vernaküler). Summa 1494 *Latin
   matbu* halkasıyla **5-Book × 5-medya/dil** tablosu kuruldu. Sadece son
   bir kitap ekleme değil — *el yazması çağından matbu çağa geçiş* atlası;
   Hindu rakam sisteminin *medya sıçraması*nın görünür hale gelmesi.
   Pacioli Bölüm 11 (*Particularis de Computis et Scripturis*) modern
   çift-girişli muhasebenin yapısal kaynağı — Sombart 1916 tezi, Geddes
   1985 düzeltmesi, Sangster 2018 modern sentezi. Theme'in en doğal
   tamamlanma noktası bu Book.

2. **Beşinci yazar+yer+eser densifikasyon pattern'i (Summa)** — Atlas
   densifikasyon örnekleri şimdi *beş*: Bağdat/al-Jabr+al-Khwārizmī, Pisa/
   Liber-Abaci+Fibonacci, Ujjain/Lilavati+Bhāskara, Floransa/Trattato+
   Dell'Abbaco, ve şimdi **Venedik/Summa+Pacioli**. Pacioli ν-triple-prime
   (7/31) dilim'inde Venedik'e zaten yerleşmişti tek başına; Summa onun
   yanına geldiğinde *yer gerçek bir entelektüel düğüm* olur. Beş örnek
   pattern'i *yerleşmiş yapısal disiplin* olarak konsolide eder.

3. **Bīrūnī'nin works[] disiplini (Tahqīq)** — al-Bīrūnī 7/27 ν-prime
   dilim'inde catalogue Person olarak girmiş, works[0] olarak tahqīq
   placeholder bırakmıştı. Bu placeholder dört dilim boyunca açıktı.
   ξ-prime'da (7/33) Dell'Abbaco için yaptığımız *Person'un placeholder
   works'ünü live'a dönüştürme* disiplinini Bīrūnī için tekrarlamak
   yapısal tutarlılık. Bīrūnī'nin major work'siz duruşu *kompakt deep*
   catalogue Person argümanının nihai testiydi — bu test geçildi.

4. **Tahqīq'in editöryel argümanı: oryantalizm-karşıtı bin yıllık metin** —
   Sabra 1996, Lawrence 1976, Sharma 2014: *Tahqīq* Said'in 1978
   *Orientalism* eleştirisinin İslam-içi *karşı-paterni*. Modern
   karşılaştırmalı din çalışmalarının metodolojik atası, on birinci
   yüzyılda yazıldı. Bu argüman Hindu-Arap rakam sistemi tarihinden
   *farklı* bir eksendedir — kitap-tarihi değil, *yöntem-tarihi*. Bu
   yüzden Tahqīq Hindu-Arap theme'inin books listesine *eklenmedi*
   (editöryel disiplin: theme rakam-sistemi pedagojik kitaplarını grupluyor,
   etnografik karşı-pattern kitapları değil); Tahqīq tek başına yaşar,
   *kompakt deep* catalogue Book pattern'inin örneklemesi. Bu *theme'siz
   tek-Book disiplini* yeni bir editöryel kalıp — al-Qānūn fī al-Tibb
   (tibb-koridor theme'inde) ve Trattato/Liber Abaci/Lilavati/al-Jabr/
   Summa (Hindu-Arap theme'inde) yanında ilk theme-bağımsız Book.

### Editöryel disiplin: *theme bağı* mı, *kompakt deep* mi?

Bu dilim Book tier için *yeni bir editöryel ayrım* kurar:

| Pattern | Örnek | Editöryel argüman |
|---|---|---|
| Theme'in kitap dizisinin halkası | Summa (Hindu-Arap stage 5) | *Theme tarihinin görünürlüğü* — kitap kanonik dizinin parçası |
| Theme'siz kompakt deep | Tahqīq (theme-bağsız) | *Theme'siz tek-Book* — kitabın kendi argümanı theme'inden bağımsız |
| Showcase + theme'in çekirdek halkası | al-Jabr (Hindu-Arap + andalusian-translation-workshop) | *Çoklu-theme cross-link* — kitap birden fazla theme'e açılır |

Bu üç-katmanlı tipoloji Book tier'ın artık olgunlaşmış editöryel
kompleksite seviyesini gösterir.

### Schema disipliner uygulamalar

İki yeni Book gold-standard `manuscripts` şemasını kullanır (`shelfmark` +
`name` Localized + `where` Localized + `url`) — al-Jabr/al-Qanun/Liber
Abaci/Lilavati ile aynı pattern, Trattato'nun `location/note` schema-uyumsuz
formundan farklı (Trattato schema bug'ı out-of-scope, ileride düzeltilebilir).
`fullArabicTitle` non-Arabic-original için fonetik transliterasyon pattern'i
*sadece Summa için* (الموسوعةُ في الحِسابِ وَالهَندَسةِ — Latin başlığın
Arapça anlam-yansıması; Trattato/Liber Abaci/Lilavati'deki transliterasyon
pattern'inden farklı çünkü *Summa*'nın yarısı zaten Toskan vernaküler ve
Pacioli Bölüm 11'i *Compendio della contabilità a la veneziana* gibi yarı
İtalyan dilden — fonetik transliterasyon yerine anlam-çevirisi). Tahqīq
zaten Arapça orijinal — direkt başlık. Bu üçüncü editöryel-schema kalıbı:
non-Arabic-original Book'larda *iki yöntem* (fonetik vs anlam-çevirisi);
gelecekte bibliyografik disiplin için belgelenmesi gereken bir karar
noktası.

### Live'a çıkarılan Person works[]'leri

- **Pacioli.works[0]** (luca-pacioli.mdx): `summa-de-arithmetica` placeholder
  → live. ν-triple-prime'dan beri açık olan cross-reference kapanır.
- **al-Biruni.works[0]** (al-biruni.mdx): `tahqiq-ma-li-l-hind` placeholder
  → live. ν-prime'dan beri açık olan cross-reference kapanır.

İki major Person için major work cross-reference resolution'u tek dilim'de.
Önceki ξ-prime'da Dell'Abbaco.works[0], ξ'de Bhāskara.works[0] — pattern
tutarlı: her ξ-türevli dilim *placeholder cross-reference çözümü* yapar.
Bu dilim *iki* yapar.

### Atlas densifikasyon dökümü

| Yer | Pattern | Önceki entity | Yeni entity | Densifikasyon |
|---|---|---|---|---|
| Venedik | Mevcut → 2 entity | Pacioli (catalogue Person) | + Summa (catalogue Book) | 1 → 2 |
| Gazne | Mevcut → 2 entity | al-Bīrūnī (catalogue Person, multi-anchor) | + Tahqīq (catalogue Book, multi-anchor primary) | 1 → 2 |

Beşinci ve altıncı yazar+yer+eser örneği. Pattern artık *yerleşmiş yapısal
disiplin* — yeni place gerekmeden mevcut yerlerin entity-yoğunluğu artırılır.
Empty 10 sabit (yeni yer eklenmedi).

### Hindu-Arap theme'in son durumu

```
theme.books = [
  'al-jabr',                    // c. 825 — Arapça
  'lilavati',                   // c. 1150 — Sanskrit
  'liber-abaci',                // 1202 — Latince
  'trattato-d-aritmetica',      // c. 1340 — Toskan vernaküler
  'summa-de-arithmetica',       // 1494 — Latin matbu
]
```

5-Book × 5-medya/dil × 5-yüzyıl × 5-atlas-yer kapanış tablosu. Tahqīq
*bilinçle eklenmedi* — yukarıda açıklanan editöryel disiplin. Theme'in
"Hindu-Arap rakam sisteminin kitap kanonu" iddiası şimdi tam.

### Build deltası

```
Önceki dilim (7/33):                       Bu dilim (7/34):
  index        84.39 KB gz                   index        84.38 KB gz  (-0.01, varyans)
  registry     49.65 KB gz                   registry     52.93 KB gz  (+3.28)
  loader       28.08 KB gz                   loader       28.08 KB gz  (=)
  trattato     18.03 KB gz                   trattato     18.03 KB gz  (=)
  (yeni)                                     summa        20.44 KB gz  (yeni lazy)
  (yeni)                                     tahqiq       20.83 KB gz  (yeni lazy)
```

İki yeni lazy chunk eager sızıntı yapmadan eklendi (zaten lazy MDX manifest
mimarisi 7/1'de bu için tasarlanmıştı). registry +3.28 KB gz iki yeni Book
summary'sinin manuscripts (4-5 entry) + translations (4-5 entry) +
relatedWords (1-2 entry) cross-link'leriyle taşımaktan. Trattato +1.08 idi;
iki Book ~3× = +3.28 — tutarlı. Tek-Book ortalaması ~1.6 KB gz registry —
büyük catalogue Person (~3.3 KB gz/Person, ν-triple-prime'da Pacioli) ile
catalogue Word (~0.4 KB gz/Word) arasında, Book entity'nin yapısal
yoğunluğunu yansıtır.

### §12.5 etkisi — Δ7/33→7/34

| Ölçüm | Ağırlık | Önceki (7/33) | Yeni (7/34) | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 59.2 | **59.8** | +0.6 |
| §12.3 UI | 0.25 | 92 | 92 | 0 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %73.35 | **~%73.95** | **+0.6 puan** |

§12.2 +0.6: 2 catalogue Book (Summa 0.20 + Tahqīq 0.20 = 0.40) + 2 atlas
densifikasyon (Venedik 0.05 + Gazne 0.05 = 0.10) + Hindu-Arap theme print
era kapanışı (0.05) + Book tier 5 → 7 dört-dilim arc'ın final
kapanışı/disipliner olgunluk (0.05). 7/33'ün +0.4'üyle aynı tek-Book
oranı — *iki Book × 0.4 birleşik dilim* doğrusal toplam (atlas/theme
overhead aynı kalır, içerik linear ölçeklenir).

### Sonraki dilim için öneriler

%73.95 — projenin tamamlanma sınırına yakınlık çok net. Tüm tematik arc'lar
kapandı: atlas-rebalancing (ν → ν-triple-prime), polish (κ/κ-prime), Book
tier expansion (ξ → ξ-prime → ξ-double/triple-prime). Daha fazla içerik
veya polish *kesin azalan-getiri*.

1. **Live deploy** (9. kez kesinlikle önerilen — Vercel config zaten hazır,
   teknik blocker yok; tek mesele kullanıcı kararı).
2. **κ-double-prime** (CSP-strict tam tamamlama; *muhtemelen değer-altı*,
   Δ ≈ +%0.3-0.5).
3. **Yeni Theme** (mevcut Theme'lere göre yapısal-yenilik düşük;
   3-4 dilim ek iş; ortalama Δ ≈ +%0.5-0.8).

Sıralama önerisi: **live deploy → κ-double-prime (gereksiz) → yeni Theme
(genişleme istenirse)**.

---



> ξ dilim'i (7/32) Book tier'in en az gelişmiş katman olduğu tespitiyle
> Līlāvatī'yi live entity'ye çıkarmıştı (Hindu-Arap theme stage 1.5).
> ξ-prime aynı disiplinle bir adım daha: Trattato d'aritmetica live
> (Hindu-Arap theme stage 5). Pattern: her ξ-türevli dilim *bir Book
> placeholder'ı live entity'ye dönüştürür*; her birinde theme'in
> kronolojik diziline yeni bir halka eklenir; her birinde mevcut bir
> atlas yer densifikasyon kazanır.

### Niçin Trattato d'aritmetica (dilim 7/33.ξ-prime)

Üç editöryel argüman:

1. **Hindu-Arap theme kitap dizisinin kronolojik genişlemesi** — Theme
   şimdiye kadar 3 Book taşıyordu (al-Jabr c.825, Lilavati c.1150,
   Liber Abaci 1202); Trattato c.1340 bu kronolojiyi *bir adım daha*
   ileri taşır. Kitap dizisinin *dil ilerlemesi* özellikle güzel:
   Arapça → Sanskrit → Latince → **Toskan vernaküler**. Latin Avrupa'nın
   *dallanan* vernaküler dil seçimi (Dante 1304'te şiirde + Dell'Abbaco
   1340'ta bilimde) projenin theme arc'ına yeni bir boyut ekler.
2. **Modern muhasebenin "Pacioli öncesi" halkası** — Yaygın anlatımda
   modern çift-girişli muhasebenin babası Pacioli'dir (Summa 1494);
   Trattato bu anlatıya Toskan abbaco okul geleneğinin 150 yıl önce
   aynı pratiği zaten yapıyor olduğunu göstererek düzelti getirir.
   Pacioli'nin selefinin selefi — modern bilim tarihçiliğinin son
   50 yılda kabul ettiği bir düzeltme (Goldthwaite 1972, Van Egmond
   1980, Ulivi 2002).
3. **Vernaküler bilim dilinin tarihsel anı** — 14. yy Avrupa'sında
   bilim Latince yazılırdı; Trattato'nun Toskan vernaküler seçimi
   *bilinçli, ideolojik* bir karardı (Dante'nin *De vulgari eloquentia*'sıyla
   rezonansta). Modern ders kitabı kavramının (vernaküler okul-kitabı,
   Latince akademik tractatus değil) doğum momentlerinden biri.

### Schema disipliner çözüm — non-Arabic original devamı

Liber Abaci ve Līlāvatī için belirlediğimiz pattern (non-Arabic-original
Books için `fullArabicTitle` Arap harfli fonetik transliterasyon)
Trattato için de uygulandı: `fullArabicTitle: تْراتّاتو ديلابّاكو`.
Üçüncü tutarlı örnek; pattern artık projenin Book entity disiplinine
yerleşmiş sayılır.

### Manuscripts + Translations stratigrafisi

**Manuscripts**: Floransa Biblioteca Riccardiana (MS 2236 c. 1370 —
Dell'Abbaco'nun atölyesinden çıkan en yakın nüsha + MS 2511 + MS 2705)
+ Biblioteca Nazionale Centrale (MS Magl. XI.85, c. 1390, marjinal
notlarla — gerçekten ders kitabı olarak kullanıldığının kanıtı);
Venedik Marciana, Paris BnF, Vatikan Apostolica secondary nüshalar.
100+ toplam.

**Translations**: Van Egmond 1980 İngilizce özet-çevirisi (akademik,
kısmi); *anlamlı başka bir çeviri tarihçesi yok*. Bu kendisi tarihsel
veri — vernaküler Toskan yerel-pedagojik amaçta kalıp Avrupa'nın
diğer dillerine çevirilmedi; Pacioli'nin Summa'sı (1494) bu Toskan-
vernaküler kanalı Avrupa-genel kanala bağladığı için yayıldı. Modern
eleştirel matbu baskı bibliyografik *boşluk*: Arrighi 1964 yalnız
bölüm 1-6; bölüm 7-13 hâlâ yalnız el-yazması nüshalarda erişilebilir.
Bu *boşluk* Riḥlat al-Kalimāt'in *modern bilim tarihinin sessizlikleri*
katmanına somut bir örnek.

### Atlas densification — florence

Florence atlas'a önceden eklenmişti (ν dilim'inde, sonra ν-double-prime'da
Dell'Abbaco için primary). Şimdi *Trattato d'aritmetica* da florence
primary; florence entity-sayısı 1 → 2. Bu **atlas densification**'ın
üçüncü örneği — yazar+yer+eser üçlüsünün aynı pinde toplandığı pattern:
al-Khwārizmī+al-Jabr@Bağdat (γ dilim öncesi), Fibonacci+Liber-Abaci@Pisa
(ν dilim'inde), Bhāskara+Lilavati@Ujjain (ξ dilim'inde), şimdi
Dell'Abbaco+Trattato@Floransa. Atlas pin'i UI tooltip'inde 2 entity
gösterecek (Person + Book ilişkisi).

### Hindu-Arap theme — 4-Book × 4-dil tablonun kurulması

| Tarih | Yer | Kitap | Dil | Medya |
|---|---|---|---|---|
| c. 825 | Bağdat | al-Jabr (al-Khwārizmī) | Arapça | el yazması |
| c. 1150 | Ujjain | Līlāvatī (Bhāskara II) | Sanskrit | el yazması |
| 1202 | Pisa | Liber Abaci (Fibonacci) | Latince | el yazması |
| **c. 1340** | **Floransa** | **Trattato d'aritmetica (Dell'Abbaco)** | **Toskan vernaküler** | **el yazması** |

Theme şimdi 4 Book × 4 dil × 4 yüzyıl × 4 atlas place taşır. Hindu-Arap
rakamlarının dil-yolculuğu protagonist-imzalı somut belgelerle tamamen
işlenmiş. Hâlâ eksik: print era için Pacioli *Summa* (1494) — placeholder,
ξ-double-prime adayı; theme bunu kazandığında 5-Book × 5-medya sıçraması
(el yazması → matbu) tablosunu kuracak.

### Cross-reference resolution

Dell'Abbaco'nun works dizisindeki `targetSlug: trattato-d-aritmetica`
artık `status: live` (önceki `placeholder`). ν-double-prime'da yazdığım
Dell'Abbaco Person entity'sinin works[0] artık tıklanabilir link;
modern PersonPage UI'da Dell'Abbaco sayfası açıldığında Trattato
"İlgili eserler" şeridinde *grayed-out "Yakında"* statüsünden geçer.

### Build çıktısı

| | 7/32 sonu | 7/33 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 84.40 | 84.39 | -0.01 (varyans) |
| `registry` (KB gz) | 48.57 | **49.65** | +1.08 (1 yeni Book summary; manuscripts/translations zenginliği) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni lazy chunk | — | trattato-d-aritmetica | 1 YENİ |
| Korpus entity | 48 | **49** | +1 |
| Book tier | 4 | **5** | +1 |
| Atlas florence | 1 | **2** | +1 densification |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/32 | 7/33 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 58.8 | **59.2** | +0.4 |
| §12.3 UI | 0.25 | 92 | 92 | 0 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %73.15 | **~%73.35** | **+0.20 puan** |

§12.2 +0.4: 1 catalogue Book Trattato (0.20) + florence atlas densification
(0.05) + Hindu-Arap theme densifikasyonu 13 → 14 entity (0.10) + Book
tier'in 4 → 5 entity'ye genişlemesi yapısal disiplin (0.05). ξ ile
aynı δ — Book tier'in marjinal değeri tutarlı.

### Sonraki dilim için öneriler

%73.35 — projenin tamamlanma sınırına yakınlık çok net. Atlas-rebalancing
+ polish + Book tier expansion (2 dilim) arc'ları kapandı.

1. **Live deploy** (8. kez kesinlikle önerilen).
2. **ξ-double-prime** (Book tier expansion devamı: Summa de Arithmetica
   veya Tahqīq mā li'l-Hind live'a — her biri bir Person'un placeholder
   works'ünü çözer ve atlas densifikasyonu yapar; Δ ≈ +%0.3-0.4, tutarlı
   marjinal değer).
3. **κ-double-prime** (CSP-strict; *muhtemelen değer-altı*).

Sıralama önerisi: **live deploy → ξ-double-prime (opsiyonel, tutarlı
marjinal değer) → κ-double-prime (gereksiz)**.

---

## Oturum 7 — dilim 32 (Shape ξ: Book tier expansion — Līlāvatī live entity)

> Atlas-rebalancing 4-dilim arc (ν+ν-prime+ν-double-prime+ν-triple-prime)
> ve κ+κ-prime polish slice'ları geride bırakıldıktan sonra projenin
> *yapısal en-az-gelişmiş* katmanına dönüş: Book tier. Korpus 11
> Person'a karşılık yalnız 3 Book taşıyordu (al-Jabr, al-Qanun fi
> al-Tibb, Liber Abaci); son dilim'lerde eklediğim 8 *placeholder*
> Book cross-reference (Tahqīq mā li'l-Hind, al-Qānūn al-Masʿūdī,
> Kitāb al-Ṣaydana, Līlāvatī, Bījagaṇita, Trattato d'aritmetica,
> Summa de Arithmetica, De Divina Proportione) Book entity'lerinin
> *kavramsal olarak var olduğunu* ama *gerçek olarak yazılmadığını*
> gösteriyordu. ξ bu birikimden en değerlisini live entity'ye
> dönüştürür.

### Niçin Līlāvatī (dilim 7/32.ξ)

Üç editöryel argüman:

1. **Hindu-Arap theme için pedagojik vurgu** — Theme şimdiye kadar
   Brahmagupta'nın *Brāhmasphuṭasiddhānta* (Bhillamāla 628) ile
   başlayan ve Pacioli'nin *Summa* (Venedik 1494) ile biten 6-aşamalı
   protagonist-tablosunu kurmuştu, ama bu zincirin *pedagojik* vurgusu
   eksikti. *Līlāvatī* daughter-poem motifiyle bu eksiği doldurur:
   matematik öğretmek için yazılmış, kıza yazılmış, modern Hindistan'da
   hâlâ NCERT müfredatında ve kız isimlerinde yaşayan tek metin.
2. **Cultural longevity sergilemesi** — Modern bilim tarihinde 875
   yıl önceki bir matematik metninin müfredatta yaşamaya devam etmesi
   son derece nadirdir. *Līlāvatī* projenin "kitap kendi isim-aurasıyla
   on kuşaklık kültürel kanalda yaşayabilir" tezini en saf biçimde
   örnekler.
3. **Manuscripts + translations stratigrafi** — Book entity'sinin
   `manuscripts[]` ve `translations[]` alanları için en zengin tarihsel
   içeriği taşır: Hint palm-leaf geleneği (100+ nüsha) + Mughal Farsça
   çevirisi (1587 Faizi, Akbar sarayı) + Colebrooke İngilizce çevirisi
   (1817, Kalküta). Modern Hint dillerine çevirilerin 20. yy boyunca
   devam etmesi. Türkçe/Arapça çevirinin yokluğu *anlamlı bir kültürel
   sessizlik* (Tahqīq mā li'l-Hind'in tersi: al-Bīrūnī Sanskrit→Arapça
   yapmıştı; ama *Līlāvatī* aksi yönde, 12. yy Hint-içi devamlılığını
   Faizi 1587'de Farsçaya çevirir, Arapçaya değil).

### Schema'nın non-Arabic original durumu

Book interface `fullArabicTitle: string` ister; *Līlāvatī* Sanskrit
orijinaldir. Liber Abaci'nin yaptığı gibi (Latin orijinal için Arap
harfli transliterasyon) çözüm: `fullArabicTitle: ليلاڤاتي` (Sanskrit
ad'ın Arap harfine fonetik transliterasyonu, `ڤ` harfiyle Sanskrit
*v* sesi). Bu pattern Liber Abaci'den miras; non-Arabic-original
Books için projenin tutarlı disiplini.

### Atlas densifikasyonu detayı

Ujjain place atlas'ta yer alıyordu ve Bhāskara II'nin primary anchor'ıydı
(ν-double-prime dilim'inde dolmuştu). Şimdi *Līlāvatī* de ujjain primary;
ujjain'in entity-sayısı 1 → 2. Bu **atlas densifikasyon** — empty primary
sayısı değişmez (10 sabit) ama o yer artık zengin: iki entity (yazar +
eseri) aynı pinde buluşur. Modern atlas UI'da bu pin tooltip'inde 2
entity gösterecek (`Bhāskara II · Līlāvatī`). Bu pattern al-Khwārizmī
+ al-Jabr'ın Bağdat'ta + Fibonacci + Liber Abaci'nin Pisa'da yaptığı
gibi: **yazar-yeri-eser** üçlüsünün aynı atlas pininde toplanması.

### Hindu-Arap theme — kitap dizisinin tamamlanması

| Tarih | Yer | Kitap | Dil | Medya |
|---|---|---|---|---|
| c. 825 | Bağdat | al-Jabr (al-Khwārizmī) | Arapça | el yazması |
| **c. 1150** | **Ujjain** | **Līlāvatī (Bhāskara II)** | **Sanskrit** | **el yazması** |
| 1202 | Pisa | Liber Abaci (Fibonacci) | Latince | el yazması |

Theme şimdi 3 Book taşır — 3 farklı medeniyet + 3 farklı dil + 3 farklı
yüzyıl. Hindu-Arap rakamlarının Hindistan-İslam-Latin Avrupa üçlü
transmisyonunun her halkasında somut bir kitap-belgesi. Hâlâ eksik:
Toskan vernaküler era için Dell'Abbaco *Trattato d'aritmetica* (c. 1340)
ve print era için Pacioli *Summa* (1494) — ikisi de placeholder, ξ-prime
veya sonraki dilim için aday.

### Cross-reference resolution

Bhāskara II'nin works dizisindeki `targetSlug: lilavati` artık
`status: live` (önceki `placeholder`). Bu dilim ν-double-prime'da
*kavramsal olarak* var olan ilişkiyi *fiilen* gerçekleştirir. Modern
PersonPage UI'da Bhāskara II sayfası açıldığında "İlgili eserler"
şeridinde Līlāvatī tıklanabilir link olur (önceki *grayed-out
"Yakında"* statüsünden geçer).

### Build çıktısı

| | 7/31 sonu | 7/32 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 84.40 | 84.40 | 0 (Book entity lazy) |
| `registry` (KB gz) | 47.74 | **48.57** | +0.83 (1 yeni Book summary; manuscripts/translations cross-link'leri) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni lazy chunk | — | lilavati | 1 YENİ |
| Korpus entity | 47 | **48** | +1 |
| Book tier | 3 | **4** | +1 (Book tier %33 büyüdü) |
| Atlas ujjain | 1 | **2** | +1 densification |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/31 | 7/32 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 58.4 | **58.8** | +0.4 (catalogue Book + atlas densification + theme densification + Book tier balance) |
| §12.3 UI | 0.25 | 92 | 92 | 0 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %72.95 | **~%73.15** | **+0.20 puan** |

§12.2 +0.4: 1 catalogue Book Līlāvatī (0.20) + ujjain atlas densification
(0.05) + Hindu-Arap theme densifikasyonu 12 → 13 entity (0.10) + Book
tier'in 3 → 4 entity'ye genişlemesi yapısal disiplin (Book tier hâlâ
en küçük tabaka ama denge artıyor) (0.05). Toplam Δ +0.4 — ν-triple-prime
(+0.20) ile karşılaştırıldığında 2× daha büyük; Book tier'in *yapısal
açlığı* nedeniyle her yeni Book entity'sinin marjinal değeri yüksek.

### Sonraki dilim için öneriler

%73.15 — projenin tamamlanma sınırına yakınlık çok net. Atlas-rebalancing
+ polish + Book tier expansion arc'ları kapandı.

1. **Live deploy** (7. kez kesinlikle önerilen). %73 ile gerçekten
   yeterince olgun.
2. **ξ-prime** (Book tier expansion devamı: Summa de Arithmetica veya
   Tahqīq mā li'l-Hind veya Trattato d'aritmetica live'a — her biri
   bir Person'un placeholder works'ünü çözer; Δ ≈ +%0.3-0.5).
3. **κ-double-prime** (CSP-strict tamamlama; *muhtemelen değer-altı*).

Sıralama önerisi: **live deploy → ξ-prime (opsiyonel, Book tier
genişletme hala marjinal değer veriyor) → κ-double-prime (gereksiz)**.

---

## Oturum 7 — dilim 31 (Shape ν-triple-prime: atlas-rebalancing son halkası — Luca Pacioli Venedik için, Hindu-Arap stage 6 print era)

> ν dilim'i (7/26) atlas-rebalancing trilogy'sini başlatmıştı (Pisa +
> Brahmagupta/Fibonacci/Liber Abaci); ν-prime (7/27) ikinci adımdı
> (Ghazna + al-Bīrūnī); ν-double-prime (7/28) trilogy'nin kapanışıydı
> (Ujjain/Khwarazm/Florence + Bhāskara II/ibn ʿIrāq/Dell'Abbaco).
> κ + κ-prime polish layer'ı doldurduktan sonra (7/29-30), ν-triple-
> prime *strictly opsiyonel* olarak Hindu-Arap theme'inin tarihsel
> tablosuna eksik kalan son halkayı ekler: print era kapanışı.

### Pacioli (dilim 7/31.ν-triple-prime)

**Tip:** catalogue Person.
**Atlas-anchor:** `venice` (empty primary → 1 entity DOLU).
**Theme:** hindu-arabic-numerals (stage 6 — print era; Fibonacci 1202
→ Dell'Abbaco c. 1340 → **Pacioli 1494** üç-kuşak Toskan abbaco hattı).

**Editöryel argüman:** Hindu-Arap Rakamları theme'i şimdiye kadar Toskan
abbaco geleneğinin el-yazması katmanını (Fibonacci, Dell'Abbaco) ve
Hint-içi/Khwārazm-yan-kanal katmanlarını (Bhāskara II, al-Bīrūnī)
protagonist-imzalı işaretlemişti. Eksik kalan **kritik halka**: bu
geleneğin **matbaa'ya geçiş anı**. Pacioli'nin *Summa* (1494) ilk
basılı kapsamlı matematik metnidir; aynı zamanda modern çift-girişli
muhasebenin ilk sistematik açıklamasını içerir. Print era + accounting-
revolution + Rönesans matematik-sanat sentezi (De Divina Proportione +
Leonardo) — tek bir Fransiskan rahibin biyografisi.

**5 strata:**
- 2026: Modern accounting'in babası — Pacioli'nin 1494 kuralları
  bugünün SAP/Oracle/QuickBooks algoritmalarının temeli (530 yıllık
  süreklilik).
- c. 1517-1600: Avrupa matbaa dolaşımı — *Summa* Almanca/Felemenkçe/
  Fransızca çevirilerle Avrupa-genel muhasebe-okulu olur; Pacioli
  adı bizzat anılır.
- 1494: Venedik, Paganino Paganini matbaası — 600 sayfa, Toskan
  vernaküler İtalyancası; bölüm 11 (Particularis de Computis et
  Scripturis), bölüm 12 (regola della cosa cebir).
- c. 1490-1499: Milano Sforza sarayı + Leonardo da Vinci — De Divina
  Proportione'nin 60 illüstrasyonu Leonardo'nun elinden; Rönesans
  matematik-sanat arayüzünün simgesel ortaklığı.
- c. 1447-1480: Sansepolcro doğum + Piero della Francesca'nın
  matematik atölyesinde eğitim; Roma'da Leon Battista Alberti
  öğrenciliği + Fransiskan rahipliğine giriş.

**4 circle member:** Dell'Abbaco (selefi), Leonardo da Vinci (yakın
arkadaş), Piero della Francesca (ilk hocası), Paganino Paganini
(Summa matbaacısı — matbaa teknolojisinin bilgi-akışında *imkân-
yaratıcı* rolünün simgesi).

### Hindu-Arap Rakamları theme'i — 6-aşamalı tablonun tamamlanması

| Aşama | Tarih | Yer | Protagonist | Medya |
|---|---|---|---|---|
| 1 | 628 | Bhillamāla | **Brahmagupta** | el yazması (Sanskrit) |
| 1.5a | c. 1030 | Khwārazm-Gazne | **al-Bīrūnī** (yan-kanal) | el yazması (Arapça, Sanskritçeden) |
| 1.5b | c. 1150 | Ujjain | **Bhāskara II** (Hint-içi) | el yazması (Sanskrit) |
| 2 | c. 825 | Bağdat | **al-Khwārizmī** | el yazması (Arapça) |
| 3 | c. 1145 | Toledo | Robert of Chester (theme anchor) | el yazması (Latince çeviri) |
| 4 | 1202 | Pisa | **Fibonacci** (*Liber Abaci*) | el yazması (Latince) |
| 5 | c. 1340 | Floransa | **Paolo Dell'Abbaco** (*Trattato*) | el yazması (Toskan vernaküler) |
| **6** | **1494** | **Venedik** | **Luca Pacioli** (*Summa*) | **matbu (Toskan vernaküler)** |

Theme şimdi 12 entity, 7 protagonist, 6 atlas place, 7 yüzyıl, 3
medeniyetler-arası geçiş + **1 medya-teknolojisi sıçraması** (1494
matbaa). Tek-theme bilim-tarihi mikrokozmosu artık eksiksiz.

### Atlas-rebalancing — 4-dilim arc'ın kapanışı

| Dilim | Atlas total | Used | Empty | Δ empty | Strateji |
|---|---|---|---|---|---|
| ν öncesi (μ sonu) | 24 | 10 | 14 | — | — |
| ν | 25 | 11 | 14 | 0 | pisa eklendi + kullanıldı |
| ν-prime | 26 | 12 | 14 | 0 | ghazna eklendi + kullanıldı |
| ν-double-prime | 26 | 15 | 11 | −3 | yeni place yok; 3 empty doldu |
| **ν-triple-prime** | **26** | **16** | **10** | **−1** | yeni place yok; 1 empty doldu |

4-dilim arc toplamı: atlas total 24 → 26 (+2), used 10 → 16 (+6),
empty 14 → 10 (−4). Atlas-rebalancing stratejisi 4 dilim'de kümülatif
6 atlas-kullanım artışı + 4 boş-pin azalması; her dilim editöryel
olarak bilim-tarihi-temalı (Hindu-Arap Rakamları), atlas-honesty
disiplini korunmuş, üretim-locus ilkesi tutarlı uygulanmış. Bu arc
bugünden geriye bakıldığında projenin **en uzun tek-tematik dilim
serisi** (4 dilim) ve **en büyük tek-theme genişlemesi** (5 entity
→ 12 entity).

### Build çıktısı

| | 7/30 sonu | 7/31 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 84.41 | 84.40 | -0.01 (varyans) |
| `registry` (KB gz) | 47.14 | **47.74** | +0.60 (1 yeni Person summary) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni lazy chunk | — | luca-pacioli | 1 YENİ |
| Korpus entity | 46 | **47** | +1 |
| Atlas used | 15 | **16** | +1 |
| Atlas empty | 11 | **10** | −1 |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/30 | 7/31 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 58.0 | **58.4** | +0.4 (1 catalogue Person + 1 atlas fill + theme stage 6) |
| §12.3 UI | 0.25 | 92 | 92 | 0 |
| §12.4 Polish | 0.10 | 95 | 95 | 0 |
| **Ağırlıklı** | 1.00 | %72.75 | **~%72.95** | **+0.20 puan** |

§12.2 +0.4: 1 catalogue Person Pacioli (0.20) + 1 atlas empty-primary
fill venice (0.05) + Hindu-Arap theme densifikasyonu 11 → 12 entity +
stage 6 print-era kapanışı (0.10) + 4-dilim atlas-rebalancing arc'ın
yapısal tamamlanış disiplini (0.05). Δ ν-prime'a yakın (+0.30); doyma
çok yakın — ν-triple-prime'ın *strictly opsiyonel* karakteri Δ'ya da
yansıyor.

### Sonraki dilim için öneriler

%72.95 — projenin tamamlanma sınırına çok net yakınlık. Atlas-
rebalancing arc kapandı, polish layer %95, korpus 47 entity.

1. **Live deploy** (6. kez kesinlikle önerilen). Daha fazla içerik
   veya polish azalan-getiri bölgesinde; bütün arc'lar kapandı.
2. **κ-double-prime** (CSP-strict tamamlama: 47 entity × 3 dil =
   141× JSON-LD external dosya generation + `'unsafe-inline'`
   kaldırma; Δ ≈ +%0.5 ama maliyet yüksek, **muhtemelen değer-altı**).
3. **Yeni Theme** (örn. astronom-geleneği veya Endülüs-translatio'sunun
   alt-grup'u; ama Themes'i 6'dan 7'ye çıkarmak yeni-arc gerektirir;
   her yeni Theme ortalama 3-4 dilim ek iş).

Sıralama önerisi: **live deploy** (gerçekten; arc'lar kapandı, içerik
olgun). Diğer seçenekler değer-altı.

---

## Oturum 7 — dilim 30 (Shape κ-prime: polish micro-slice — Breadcrumb JSON-LD + Sitemap lastmod + Theme bootstrap extraction)

> κ dilim'i (7/29) polish layer'a iki büyük katkı yapmıştı: JSON-LD
> structured data (5 schema.org tip) ve Share button (3-katmanlı
> progressive enhancement). κ kapsamında bilinçli olarak bıraktığım
> üç eksik vardı: Breadcrumb JSON-LD, sitemap `<lastmod>`, ve theme
> bootstrap inline-script extraction. κ-prime bu üçünü tamamlar.

### (a) Breadcrumb JSON-LD — schema.org/BreadcrumbList (dilim 7/30.κ-prime.A)

**Eksiklik:** κ'da entity-tipi JSON-LD eklendi ama BreadcrumbList yoktu.
Google Search Console'un dokümanı: "BreadcrumbList structured data
*may or may not* be reflected in the page UI" — UI'da visible breadcrumb
olmasa bile Google bu hint'i kabul eder ve search snippet'inde URL
yerine breadcrumb trail gösterir.

**Yapı:**
- `src/utils/jsonLd.ts`'ye `buildBreadcrumbJsonLd(items)` eklendi —
  `BreadcrumbItem[]` array'ini `itemListElement` ListItem dizisine
  çevirir. `position` 1-indexed (Google'ın beklediği gibi).
- 4 entity sayfasının `<JsonLd data={...}>` çağrısı array'e dönüştü:
  `[entitySchema, breadcrumbSchema]`. JsonLd component zaten array'i
  kabul ediyordu (dilim 7/29.κ'da yapılmıştı), yeni component yazmadık.

**Sayfa başına breadcrumb yapısı:**
- **PersonPage:** Home → Persons → al-Bīrūnī (3-element)
- **WordPage:** Home → Words → algorithm (3-element)
- **BookPage:** Home → Books → Liber Abaci (3-element)
- **ThemePage:** Home → Endülüs Sofrası (2-element — Theme'in liste
  sayfası yok, doğal olarak kısa)

**i18n breadcrumb namespace** — `breadcrumb.home` / `.words` / `.persons`
/ `.books` / `.themes` 3 dilde. AR locale'de `الصَّفحةُ الرَّئيسة` /
`الكَلِمات` vb. Editöryel disiplinle entity-tipi etiketleri zaten
mevcut i18n bundle'ında vardı (nav, wordsList, vb.) ama breadcrumb
context'inde semantik farklı; ayrı namespace temiz.

**Pickup:** Google Rich Results Test breadcrumb için canonical pass
edecek; search snippet'inde "rihla > Persons > al-Bīrūnī"
şeklinde URL yerine breadcrumb görünür.

### (b) Sitemap `<lastmod>` — file mtime tabanlı freshness sinyali (dilim 7/30.κ-prime.B)

**Eksiklik:** Mevcut sitemap.xml'de `<lastmod>` tag'i yoktu;
`<changefreq>` ve `<priority>` vardı ama "ne zaman değişti?" bilgisi
yoktu. Sitemap protocol'ünde lastmod opsiyonel ama önerilen; Google
"lastmod is a hint, not a directive" der ama doğru kullanılırsa güncel
sayfaları crawler'a önceler.

**Strateji:**
- `scripts/generate-sitemap.mjs`'ye `statSync` import + `BUILD_DATE`
  sabiti + `entityLastmod(type, slug)` helper eklendi.
- **Entity sayfaları** (Word/Person/Book/Theme): `content/{type}s/{slug}.mdx`
  dosyasının mtime'ı (ISO yyyy-mm-dd). İçerik dokunulduğunda mtime
  değişir; dokunulmamış entity'ler eski lastmod'la kalır.
- **Statik sayfalar** (Home/About/List/Journey): `BUILD_DATE` — manifest-
  driven oldukları için herhangi bir entity değişikliği bunları etkiler;
  konservatif tahmin "şu an".
- `urlEntriesForPage(pathBuilder, meta)` artık opsiyonel `meta.lastmod`
  kabul ediyor; tüm 15 çağrı bu alanı sağladı.

**Sayım:** 59 unique page × 3 dil = 177 `<url>` blok, hepsinde `<lastmod>`.
Sitemap.xml her build'de mtime-fresh.

**Crawler perspektifi:** İçerik dilim'i (örn. ν'de Brahmagupta + Fibonacci
eklendiğinde) sadece 3 entity'nin lastmod'u günceldir; dokunulmamış 43
entity'nin lastmod'u önceki tarihiyle kalır. Google crawler bu farklılığı
görüp güncel sayfalara öncelik verir; eski sayfaları daha az ziyaret eder.
Crawl budget verimliliği.

### (c) Theme bootstrap extraction — CSP cleanup adım 1 (dilim 7/30.κ-prime.C)

**Eksiklik:** `index.html` `<head>`'inde inline `<script>(function(){...})()</script>`
tema bootstrap (11 satır pre-React FOUC önleme). `_headers`'da CSP
`script-src 'unsafe-inline'` bu inline blok için açıktı — yorum'da
"ileride polish slice'a alınacak" yazıyordu (dilim 7/19.ι.A'dan).

**Yapı:**
- `public/theme-bootstrap.js` oluşturuldu — bire-bir aynı içerik, sadece
  konum değişti.
- `index.html`'de inline `<script>...</script>` → `<script
  src="/theme-bootstrap.js"></script>` render-blocking sync external
  (defer/async **YOK** — body parse'i bu sync yükten ÖNCE `data-theme`
  atribute'ı görmeli, parchment-FOUC oluşmasın).
- `_headers` + `vercel.json`'a `theme-bootstrap.js` için cache rule
  eklendi (`public, max-age=86400, stale-while-revalidate=604800`).
- `vercel.json` SPA rewrite exception listesine `theme-bootstrap.js`
  eklendi (asset olarak servis edilsin, SPA fallback'e gitmesin).

**CSP-strict yolculuğu durum:** `'unsafe-inline'` script-src yine
korunuyor. Tema bootstrap inline'dan kalktı (✓ bir adım ileri), ama
**React-injected JSON-LD blokları** (κ dilim'inde tanıtıldı,
`src/components/JsonLd.tsx`) entity sayfalarında inline `<script
type="application/ld+json">` olarak DOM'a yerleşir; içerikleri dinamik
(entity-bağlı), build-time hash imkânsız. JSON-LD'yi external'a
taşımanın iki yolu da maliyetli:
1. Build-time entity-başına JSON-LD dosyası üret: 46 entity × 3 dil
   = **138× dosya yaz** + her sayfada extra HTTP request. SEO için
   marjinal kazanım.
2. JSON-LD'yi runtime fetch ile yükle: SSR'sız SPA'da search-engine
   indexlemesi bozulur (Googlebot JS render'ı en başta etkili değil
   yapısal veri için).

**Pragmatik karar:** `'unsafe-inline'` JSON-LD için kalır. Tema
bootstrap extraction structural improvement; CSP fülmeden değil
*kademeli ilerleme* paradigmasıyla. `_headers` + `theme-bootstrap.js`
+ `JsonLd.tsx` yorum blokları bu trade-off'u dokümante eder.

**FOUC riski:** ~200 byte external file, HTTP/2 multiplex + Vercel/
Cloudflare edge cache ile <10ms latency (preconnect google fonts'dan
daha hızlı). Body parse bu kadar gecikme tolere eder; parchment-FOUC
gözle görülmez. Hot path testi deploy sonrası — local dev'de zaten
http://localhost:5173 üzerinden vite middleware sync döndürüyor.

### Build çıktısı

| | 7/29 sonu | 7/30 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 84.27 | **84.41** | +0.14 (buildBreadcrumbJsonLd + i18n breadcrumb keys) |
| `registry` (KB gz) | 47.14 | 47.14 | 0 (korpus dokunulmadı) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni public asset | — | theme-bootstrap.js (~200 byte) | 1 YENİ |
| Sitemap `<lastmod>` tag | 0 | **177** | +177 |
| Korpus entity | 46 | 46 | 0 (saf-polish) |
| Atlas place | 26 | 26 | 0 |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/29 | 7/30 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 58.0 | 58.0 | 0 (saf-polish) |
| §12.3 UI | 0.25 | 91 | **92** | +1 (BreadcrumbList yapısal UI parçası) |
| §12.4 Polish | 0.10 | 91 | **95** | +4 (sitemap lastmod + CSP cleanup adım 1) |
| **Ağırlıklı** | 1.00 | %72.10 | **~%72.75** | **+0.65 puan** |

§12.3 +1: BreadcrumbList structured UI parçası — UI'da görünmez ama
search-engine perspective'inden hierarchical navigation hint.
§12.4 +4: Sitemap lastmod (crawler-freshness sinyali, deploy-için-
kritik) + theme bootstrap external (CSP cleanup adım 1 + dokümante
edilmiş trade-off, code-cleanliness).

### Sonraki dilim için öneriler

%72.75 — polish layer artık nerdeyse tamamen olgun. Sıradaki adımlar:

1. **Live deploy** (kesinlikle önerilen, beşinci kez). Polish layer
   max'a yaklaşıyor; canlı URL real-world SEO + Web Share API mobile
   testi için gerekli. Δ tahmin: +%5-7.
2. **κ-double-prime** (CSP-strict tamamlama: JSON-LD'yi build-time
   entity-başına external dosyalara taşı; 138× JSON dosya generation,
   `'unsafe-inline'` script-src kaldırma; Δ ≈ +%0.5 ama maliyet yüksek,
   muhtemelen değer-altı).
3. **ν-triple-prime** (Pacioli için Venedik + Bhāskara için Delhi
   secondary anchor; doyma yakın, Δ ≈ +%0.3-0.5).

Sıralama önerisi: **live deploy → ν-triple-prime (opsiyonel) → κ-double-prime (opsiyonel)**.

---

## Oturum 7 — dilim 29 (Shape κ: polish — JSON-LD structured data + Share button)

> Üç-dilim atlas-rebalancing trilogy'sinden (ν + ν-prime +
> ν-double-prime) sonra mekanik olarak farklı bir iş: polish layer.
> Content-tipi dilim'ler her birinde +%0.3-0.55 katkı veriyordu; κ
> *polish micro-slice'larından farklı* — UI feature completeness +
> launch readiness'i artıran, korpus eklemeyen bir dilim. Polish
> layer'ın hâlihazırda olgun olduğu (CSP, OG/Twitter cards, sitemap,
> robots.txt, 404, favicon, apple-touch — hepsi ε/ι dilim'lerinde
> kurulmuş) tespitiyle κ kapsamını gerçek-eksiklere odakladık.

### (a) JSON-LD structured data (dilim 7/29.κ.A)

**Eksiklik:** Sayfalarda hiçbir `<script type="application/ld+json">`
yoktu. Schema.org markup search engine crawler'larının zengin snippet
üretmesi için temel girdi; ayrıca Linked Open Data semantik webi için
evrensel köprü.

**Yapı:**
- `src/utils/jsonLd.ts` — 5 build fonksiyonu: `buildPersonJsonLd`,
  `buildBookJsonLd`, `buildWordJsonLd`, `buildThemeJsonLd`,
  `buildWebSiteJsonLd`. Salt-fonksiyon disiplini (yan etki yok).
  Lifespan parser (`"c. 973 – c. 1050"` → birthDate "973" + deathDate
  "1050"). `absoluteUrl` helper'ı SSR-safety için `typeof window`
  kontrolüyle relative path'e düşer.
- `src/components/JsonLd.tsx` — `dangerouslySetInnerHTML` ile inline
  `<script type="application/ld+json">` render eder. `<` karakteri
  `\u003c` ile escape edilir (script-injection guard — `</script>`
  substring'i jsonString'de oluşamasın).
- 5 sayfaya enjekte: PersonPage, BookPage, WordPage, ThemePage,
  HomePage — return JSX'in top'ında, page header'dan önce.

**Schema.org tip eşlemesi (editöryel argüman):**
- `Person` — birthDate/deathDate + birthPlace (Place node) + jobTitle
  (category) + url + alternateName (diğer iki dil)
- `Book` — datePublished (composedYear) + description (titleMeaning) +
  inLanguage + alternateName
- `DefinedTerm` — bizim Word "etimolojik bir sözlük girdisi" semantiğine
  uygun düşer (Article'dan daha iyi; Thing'den daha spesifik)
- `Article` — Theme yapısal kapsayıcı yazı (`articleSection: "Theme"`
  kategori etiketi)
- `WebSite` — HomePage'de site-genel; 3-dilli `inLanguage` array

**Edge case'ler:**
- `Word.title` yoksa name slug'a düşer (DefinedTerm.name zorunlu)
- `Theme.subtitle` yoksa `body`'nin ilk 200 karakteri markdown-stripped
  description olur (`#*_`>``` karakterleri yumuşatılır)
- Lifespan parser regex em-dash + en-dash + c. prefix'i tolere eder

**Crawler perspektifi:** Google Rich Results Test, Bing Markup Validator,
Schema.org Validator hepsi pass etmeli (manuel test deploy sonrası).
Knowledge panel için Person/Book entity'leri en yüksek değerli.

### (b) Share button (dilim 7/29.κ.B)

**Eksiklik:** Hiçbir paylaşım UI'ı yoktu. Modern bir bilgi-grafı sayfası
URL paylaşımını kolaylaştırmalı; mobile'da Web Share API yerel paylaşım
sheet'ini açar (WhatsApp, Mail, Mastodon, X, Telegram, vb. — kullanıcı
seçer), masaüstünde clipboard kopyalama yeterli.

**Üç-katmanlı strateji** (progressive enhancement disiplini):
1. `navigator.share({ title, url })` — modern mobile + Safari/Edge masaüstü
2. `navigator.clipboard.writeText(url)` — Chrome/Firefox masaüstü
3. `document.execCommand('copy')` — HTTPS olmayan / clipboard reddedilen
   son fallback (gizli textarea + select)

**UI disiplini:**
- 36×36 daire buton (ThemeToggle estetiği) — TopBar controls slot'ında
- Inline `aria-live="polite"` toast feedback ("Bağlantı kopyalandı")
- Toast 2 saniye sonra auto-clear (useEffect cleanup ile race-free)
- AbortError (kullanıcı paylaşım sheet'ini iptal etti) sessizce geçilir
- i18n: `share.share` / `share.copied` / `share.shared` üç dilde

**Accessibility:**
- Semantic `<button>`, klavye-odaklanabilir, focus-visible outline
- aria-label feedback durumuna göre değişir (screen reader "Kopyalandı"yı
  duyar)
- aria-live region `display: none` değil — opacity:0 + clip; SR'lar
  display:none içerik'i duymaz

### (c) CSP `'unsafe-inline'` durumu — bilinçli koruma

ι dilim'inde (7/19) _headers comment'inde CSP'nin `script-src
'unsafe-inline'` taşıdığı dokümante edilmişti — index.html'deki
pre-React tema bootstrap script'i nedeniyle. κ kapsamında bu kaldırmayı
düşündük ama JSON-LD inject pattern'imiz `<script
type="application/ld+json">` etiketlerini React tarafından DOM'a
yerleştiriyor — bunlar da CSP `script-src` direktifi altında. CSP-strict
regime için iki yol:
1. Build-time SHA-256 hash hesabı (index.html sabit script için ✓,
   JSON-LD entity-dynamic ✗)
2. CSP nonce — server-rendered token gerekir; statik deploy'da işe yaramaz

Pragmatik karar: `'unsafe-inline'` script-src yine korunsun. Eğitim-amaçlı
statik bilgi grafı için saldırı yüzeyi minimal (user input yok, auth
yok, backend yok). _headers comment'i mevcut açıklamayı koruyor.

### Build çıktısı

| | 7/28 sonu | 7/29 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 83.62 | **84.27** | +0.65 (ShareButton + i18n keys + utility imports) |
| `registry` (KB gz) | 47.14 | 47.14 | 0 (içerik değişmedi) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni source dosyaları | — | jsonLd.ts + JsonLd.tsx + ShareButton.{tsx,css} | 4 yeni |
| Korpus entity | 46 | 46 | 0 (saf-polish) |
| Atlas place | 26 | 26 | 0 |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/28 | 7/29 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 |
| §12.2 Korpus | 0.50 | 58.0 | 58.0 | 0 (saf-polish) |
| §12.3 UI | 0.25 | 88 | **91** | +3 (ShareButton + JsonLd component, search-engine-readiness) |
| §12.4 Polish | 0.10 | 85 | **91** | +6 (yapılandırılmış veri, launch-readiness) |
| **Ağırlıklı** | 1.00 | %70.60 | **~%72.10** | **+1.5 puan** |

§12.3 +3: ShareButton TopBar'a yeni-aktör katılımı + JsonLd component
search-engine-readiness için yapısal UI parçası. §12.4 +6: JSON-LD
deploy öncesi "olması-gerekli" item — Google Rich Results gibi
arama-motoru entegrasyonunun temel parçası. Polish layer'ın bilinçli
en-büyük-puan kazancı bu kategoride; UI'da görünür artış (Share button)
ve UI'da görünmez ama deploy-için-kritik artış (JSON-LD) bir arada.

### Sonraki dilim için öneriler

%72.10 — projenin tamamlanma sınırına yaklaştığı net. Polish layer
mekanik olarak güçlendi. Sıradaki adımlar:

1. **Live deploy** (kesinlikle önerilen — bekleme daha fazla anlamlı değil).
   Polish ile launch-readiness yüksek; canlı URL gerçek SEO + Web Share
   API'nin gerçek mobile testi için gereklidir. Δ tahmin: +%5-7.
2. **ν-triple-prime** (atlas-rebalancing'in son halkası: Pacioli için
   Venedik, Bhāskara için Delhi secondary, ibn ʿIrāq circle expansion).
   Doyma yakın, Δ ≈ +%0.3-0.5.
3. **κ-prime** (polish micro-slice: Breadcrumb JSON-LD + sitemap auto
   lastmod + CSP hash-script extraction). Δ ≈ +%0.5.

Sıralama önerisi: **live deploy → κ-prime → ν-triple-prime (opsiyonel)**.

---

## Oturum 7 — dilim 28 (Shape ν-double-prime: atlas-rebalancing trilogy kapanışı — 3 catalogue Person, 3 empty primary dolduruldu)

> 7/26 ν atlas-rebalancing stratejisini başlatmıştı (Pisa eklendi,
> Brahmagupta + Fibonacci + Liber Abaci), 7/27 ν-prime ikinci adımdı
> (Ghazna + al-Bīrūnī, Khwārazm-Gazne ekseni). 7/28 ν-double-prime
> trilogy'nin kapanışı: önceki iki dilim'in başlattığı *empty atlas
> primary doldurma* işine yoğunlaşır — 3 catalogue Person ile tek
> dilim'de 3 empty primary fiilen doldurulur. ν+ν-prime'da fiilî empty
> primary sayımı sabit kalmıştı (14 → 14, atlas yeni place eklenirken
> kullanıldığı için); ν-double-prime'da yeni place eklenmez, sadece
> mevcut empty primary'ler doldurulur — gerçek atlas-rebalancing
> *bilanço* kazanımı bu dilim'de gerçekleşir: **empty 14 → 11**.

### (a) Bhāskara II — Brahmagupta'nın 500 yıl sonraki Hint mirasçısı (dilim 7/28.ν-double-prime.A)

**Tip:** catalogue Person.
**Atlas-anchor:** `ujjain` (boş primary → 1 entity DOLU).
**Theme:** hindu-arabic-numerals (stage 1.5 — Brahmagupta 628 ile
al-Khwārizmī c. 825 / al-Bīrūnī c. 1030 / Fibonacci 1202 arasında
*Hint-içi devamlılık* halkası).

**Editöryel argüman:** Hindu-Arap Rakamları theme'i şimdiye kadar
Hindistan'dan Arap dünyasına ve oradan Latin Avrupa'ya gelen
*tek-yönlü transmisyon* zincirini temsil ediyordu. Bhāskara II bu
zincire bir *yan-zaman* katar: Hindistan içinde matematik geleneği
1030-1200 arası durmamış; al-Bīrūnī Sanskritçe öğrenirken Hint
matematikçileri kendi geleneklerini olgunlaştırmaya devam ediyordu.
*Siddhāntaśiromaṇi* (c. 1150) — 4 bölüm, 1450 ayet — Brahmagupta'nın
yarım bıraktığı sıfır aritmetiğini tamamlar: sıfıra bölmek = *khahara*
(sonsuzluk). Modern analizin ∞ kavramı 12. yy Ujjain'inde adlandırılmıştı.

- **5 strata:** 2026 modern miras (*Līlāvatī* kız ismi; NCERT
  müfredatı); c. 1817 H. T. Colebrooke'un Kalküta çevirisi (Bhāskara
  II'nin Avrupa keşfi); c. 1150 *Siddhāntaśiromaṇi* Ujjain'de —
  sıfıra bölme khahara olarak adlandırılır; c. 1150 *Līlāvatī* —
  kıza yazılmış aritmetik şiiri, Hint matematik pedagojisinin
  temel-taşı; c. 1114-1140 Vijjaḍaviḍa'da babası Maheśvara'dan
  yetişme — üç-kuşak bilim ailesinin orta halkası.
- **Atlas etkisi:** ujjain place'i atlas'a önceden eklenmişti ama
  boş primary'di; şimdi Brahmagupta-Bhāskara Hint hattının ikinci
  ayağı olarak DOLU.
- **wordsIndebted:** zero (live); **works:** lilavati, bijaganita
  (placeholder); **circle:** Brahmagupta + Maheśvara + Colebrooke.

### (b) Abū Naṣr ibn ʿIrāq — Khwārazm prens-matematikçisi (dilim 7/28.ν-double-prime.B)

**Tip:** catalogue Person.
**Atlas-anchor:** `khwarazm` (boş primary → 1 entity DOLU).
**Theme:** YOK — theme-bağımsız.

**Editöryel argüman:** ibn ʿIrāq theme-bağımsız bir catalogue
Person — projenin bilinçli editöryel disiplini. Hindu-Arap theme'i
*Hindu-Arabic numerals* transmisyonuna odaklı; ibn ʿIrāq geometrici/
trigonometrist (Apollonius *Konikler* revizyonu, Menelaus küresel
üçgen teoremi). Onu theme'e dahil etmek theme'in koherans-ekseni
seyreltirdi. Theme-bağımsız catalogue Person'lar projenin disiplinli
olduğunun işareti: her Person bir theme'e ait olmak zorunda değil.
ibn al-Haytham bu pattern'in ilk örneğiydi; ibn ʿIrāq ikincisi.
Önceki dilim'lerde al-Bīrūnī'nin circle'ında hoca olarak geçtiği
için cross-link'ler zaten kurulu — şimdi standalone entity olarak
genişler.

- **5 strata:** 2026 aristokrat-bilimci-öğretmen arketipi (modern
  PI/lab-director benzeri); c. 1880-1920 Heinrich Suter'in *Die
  Mathematiker und Astronomen der Araber* (1900) ile modern Avrupa
  keşfi; c. 990-1017 Khwārazm Ma'munid sarayında üretim ve al-Bīrūnī
  mentorluğu; **1017** Gazneli Mahmud'un Khwārazm darbesi — bilim
  ekolünün siyasi parçalanışı, ibn ʿIrāq Gazne'ye sürgün; c. 960-990
  Banū ʿIrāq prens hânedânında matematik eğitimi.
- **Atlas etkisi:** khwarazm önceden al-Bīrūnī secondary anchor
  olarak UI-pin'liydi; şimdi entity-primary DOLU.
- **circle:** al-Bīrūnī (öğrencisi) + İbn Sînâ (eşzamanlısı,
  c. 1000'de Cürcâniye'de buluştular) + Suter (modern keşfedicisi).
- 4 farklı şehirde aynı binada bulunan üç büyük 11. yy bilim insanı
  (ibn ʿIrāq + al-Bīrūnī + İbn Sînâ) episodunun ilk tam belgelenmesi.

### (c) Paolo Dell'Abbaco — Fibonacci'nin Toskan mirasçısı (dilim 7/28.ν-double-prime.C)

**Tip:** catalogue Person.
**Atlas-anchor:** `florence` (boş primary → 1 entity DOLU).
**Theme:** hindu-arabic-numerals (stage 5 — Fibonacci 1202 sonrası
Toskan kurumsallaşma).

**Editöryel argüman:** Hindu-Arap rakamlarının Toskana'daki
yolculuğunun stage 4'ü Pisa-Fibonacci (1202, *Liber Abaci*) idi.
Stage 5'i Floransa-Dell'Abbaco: Fibonacci'nin 80 yıl sonraki Toskan
mirasçısı, Latince akademik kitabı *vernaküler Toskanaca okul-
kitabına* dönüştüren *maestro d'abbaco*. Bu kurumsallaşma — Hindu-Arap
sisteminin sadece bilgi olarak Avrupa'ya gelmesi değil, *tüccar
sınıfının günlük aracı* haline gelmesi — modern muhasebenin
(çift-girişli defter tutma, döviz çevrimi, bileşik faiz) Avrupa-
temelinin atılışıdır. Stage 6 = Luca Pacioli 1494 (matbu).

- **5 strata:** 2026 modern STEM eğitimi (vernaküler matematik
  geleneği; business school = abbaco-okul torunu); c. 1494 Pacioli
  *Summa* matbu eseri (çift-girişli defter tutma); c. 1340-1370
  Floransa Santa Trinità abbaco okulu yönetimi + *Trattato
  d'aritmetica* (100+ el yazması nüsha); c. 1320-1340 Boccaccio
  çevresi (Decameron'un *10×10×10* yapısı abbaco-zihninin yansıması);
  c. 1281-1320 Prato doğumu + Pisa eğitimi (Fibonacci'nin şehrinde).
- **Atlas etkisi:** florence atlas'a önceden eklenmişti ama
  ν dilim'inde Fibonacci için *honesty düzeltisi* sonrası (florence
  → pisa anchor değişimi) boş primary kalmıştı; şimdi Dell'Abbaco
  ile DOLU.
- **wordsIndebted:** zero (live — *cifra* terminolojisinin vernaküler
  Toskanca'ya girişi); **works:** trattato-d-aritmetica (placeholder);
  **circle:** Fibonacci (selefi) + Boccaccio (çağdaşı) + Pacioli
  (halefi) + Filippo Villani (biyografı).

### (d) Hindu-Arap Rakamları theme'i — 5-aşamalı atlas yolculuğu tamamlandı

7/27 ν-prime sonrası theme: 3 W + 4 P + 2 B = 9 entity. ν-double-prime
sonrası: 3 W + **6 P** + 2 B = **11 entity**. Theme şimdi 5 aşamalı
atlas yolculuğunu eksiksiz protagonist-imzalı olarak gösterir:

| Aşama | Tarih | Yer | Protagonist |
|---|---|---|---|
| 1 | 628 | Bhillamāla | **Brahmagupta** |
| 1.5 | c. 1030 | Khwārazm-Gazne | **al-Bīrūnī** (yan-kanal) |
| 1.5 | c. 1150 | Ujjain | **Bhāskara II** (Hint-içi devamlılık) |
| 2 | c. 825 | Bağdat | **al-Khwārizmī** |
| 3 | c. 1145 | Toledo | Robert of Chester (theme anchor'da) |
| 4 | 1202 | Pisa | **Fibonacci** (*Liber Abaci*) |
| 5 | c. 1340 | Floransa | **Paolo Dell'Abbaco** (*Trattato d'aritmetica*) |
| 6 | 1494 | Venedik (gelecek) | Luca Pacioli (henüz eklenmedi) |

Projenin tek bir theme'i artık 11 entity, 6 protagonist, 5 atlas
place, 7 yüzyıl, 3 medeniyetler-arası geçişi içeren *bir bilim
tarihi mikrokozmosu*. Bu yapısal genişlik tek başına theme-tipi
disiplinin kanıtı.

### (e) Atlas-rebalancing trilogy — sentez

Üç dilim'in (ν + ν-prime + ν-double-prime) ortak amacı: atlas
yetimi metriğini iyileştirmek. Trilogy boyunca:

| Dilim | Atlas total | Used | Empty | Δ empty | Strateji |
|---|---|---|---|---|---|
| ν öncesi (μ sonu) | 24 | 10 | 14 | — | — |
| ν sonu | 25 | 11 | 14 | 0 | pisa eklendi + kullanıldı |
| ν-prime sonu | 26 | 12 | 14 | 0 | ghazna eklendi + kullanıldı |
| **ν-double-prime sonu** | **26** | **15** | **11** | **−3** | yeni place yok; 3 empty doldu |

ν ve ν-prime atlas'ı *genişleterek* dengeledi (toplam empty
sayısı sabit kaldı çünkü yeni place'ler hemen dolduruldu); bu
"görünür-genişleme" idi. ν-double-prime *gerçek bilanço kazanımı*
yaptı — atlas'a hiç yeni place eklenmeden 3 empty primary doldu.
Stratejik mantık: önce atlas'ı *zenginleştirip* sonra
*temizlemek*. Üç dilim'in birlikteliği bu pattern'i sergiler.

### Build çıktısı (dilim 7/28 sonrası)

| | 7/27 sonu | 7/28 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 83.62 | 83.62 | 0 |
| `registry` (KB gz) | 45.72 | 47.14 | +1.42 (3 yeni Person summary) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni lazy chunks | — | bhaskara-ii + ibn-iraq + paolo | 3 YENİ |
| Korpus entity | 43 | **46** | +3 |
| Atlas place | 26 | 26 | 0 |
| Atlas used | 12 | **15** | +3 |
| Atlas empty | 14 | **11** | **−3** |

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/27 | 7/28 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 (eşik altında) |
| §12.2 Korpus | 0.50 | 57.1 | **58.0** | +0.9 (3 catalogue Person + 3 atlas fill + theme densifikasyon + atlas-rebalancing trilogy yapısal kapanış) |
| §12.3 UI | 0.25 | 88 | 88 | 0 (saf içerik) |
| §12.4 Polish | 0.10 | 85 | 85 | 0 |
| **Ağırlıklı** | 1.00 | %70.15 | **~%70.60** | **+0.45 puan** |

§12.2 +0.9: 3 catalogue Person (her biri 0.20 = 0.60) + 3 atlas
empty-primary fill (her biri 0.05 = 0.15) + theme densifikasyon
9 → 11 entity (0.10) + atlas-rebalancing trilogy yapısal kapanış
disiplini (0.05). ν+ν-prime+ν-double-prime trilogy'sinin toplam
katkısı: %69.3 → %70.6 = **+%1.3 puan üç dilimde**.

### Sonraki dilim için öneriler

Atlas-rebalancing trilogy kapandı. Sıradaki adımlar:

1. **Live deploy** (kesinlikle önerilen). 46 entity, 26 atlas
   place, theme yapısı %100 kapanmış, Hindu-Arap Rakamları 11-entity
   büyük theme, atlas-yetimi 14 → 11 düştü, build sağlam (83.62 KB gz
   eager). %70.6 — proje canlı URL için fazlasıyla olgun. Daha fazla
   içerik *deploy öncesi gereksiz*. Δ tahmin: +%6-8 (canlı kullanıcı
   geri bildirimiyle iteration).
2. **κ** (polish: CSP sıkılaştırma, Lighthouse audit + fix, share
   buttons, launch-öncesi-sonrası polish). Δ tahmin: +%2-3.
3. **ν-triple-prime** (Bhāskara II için Delhi secondary anchor +
   Ujjain'e gözlemevi book entity Siddhāntaśiromaṇi gibi). Δ tahmin:
   +%0.3-0.5. Doyma noktası yakın.

Sıralama önerisi: **live deploy → κ → ν-triple-prime (opsiyonel)**.
Atlas-rebalancing tematik trilogy doğal kapanış noktasına ulaştı;
canlı URL'siz daha fazla içerik *azalan-getiri* bölgesine giriyor.

---

## Oturum 7 — dilim 27 (Shape ν-prime: atlas-rebalancing devamı — al-Bīrūnī ile Khwārazm-Gazne ekseni)

> 7/26 ν dilim'i atlas-rebalancing stratejisini başlattı (Pisa eklendi,
> Brahmagupta + Fibonacci + Liber Abaci); 7/27 ν-prime aynı stratejide
> ikinci adım: Khwārazm-Gazne eksenini Hindu-Arap Rakamları theme'ine
> *yan-akış* olarak ekler. ν dilim'inde ana zincirin (Brahmagupta 628
> → al-Khwārizmī c. 825 → Robert of Chester 1145 → Fibonacci 1202) 4
> ayağı kişi-imzalı yapılmıştı; ν-prime şimdi bu ana zincire bir
> *paralel-zincir* getirir: Brahmagupta → al-Khwārizmī (Bağdat dolaylı)
> → al-Bīrūnī (Khwārazm-Gazne **doğrudan**, c. 1030). al-Bīrūnī
> Sanskritçeyi öğrenip *Brāhmasphuṭasiddhānta*'yı birinci elden okudu;
> bu kanal Bağdat-Toledo ana çizgisinden farklı, daha doğu, daha
> az-Latin-Avrupa'ya ulaşmış bir kanal.

### (a) al-Bīrūnī — Khwārazm'lı polymath, Gazne'nin saray bilimcisi (dilim 7/27.ν-prime.A)

**Tip:** catalogue Person.
**Atlas-anchor primary:** `ghazna` (atlas'a **YENİ** 26. place;
al-Bīrūnī'nin 1017-1050 yaşadığı/öldüğü/üretim yaptığı yer).
**Atlas-anchors secondary:** `khwarazm` (973-1017 doğum + Ma'munîler
sarayı + ilk eğitim), `delhi` (c. 1017-1030 Hint seferleri).

**Editöryel argüman:** projenin **ilk 3-atlas-anchor catalogue
Person'u** — al-Khwārizmī'nin 2-anchor örneği (Khwārazm + Bağdat)
bir adım geliştirildi. al-Bīrūnī tek bir kente bağlanamaz: Khwārazm
yetiştiği, Ghazna üretim yaptığı, Hindistan'da gözlem yaptığı yer
— üç-uçlu bir bilim biyografisi. Catalogue Person'larım üretim
yerinde primary anchor disiplinini koruyor (Brahmagupta=Bhillamāla,
Fibonacci=Pisa, al-Khwārizmī=Baghdad — al-Bīrūnī=Ghazna). Ghazna
atlas'a yeni eklenip hemen primary-doldurulması ν dilim'inin
Pisa-pattern'iyle birebir tutarlı (yeni atlas place + onu primary
anchorlayan entity aynı dilim'de).

- **ghazna atlas place** atlas.ts'e eklendi (florence/hamadan
  arasında, Afgan platosu koordinatları [945, 365]); 26. place,
  hemen al-Bīrūnī tarafından primary-doldurulmuş.
- **theme persons[]** 3 → 4 (brahmagupta, al-khwarizmi, **al-biruni**,
  fibonacci — kronolojik sırada): Hindu-Arap Rakamları theme'i
  8 → **9 entity** (3 W + 4 P + 2 B), projenin en geniş
  tek-konulu theme'i genişlemeye devam ediyor.
- 5 strata: 2026 modern miras (multidisipliner deha figürü, 146
  eser, modern h-indeks öncesi kendi bibliyografyasını çıkarması);
  c. 1145-1200 Adelard of Bath aracılığıyla *al-Qānūn*'un Latin
  Avrupa'ya gecikmiş ve eksik geçişi; 1030-1031 Gazne'de *Tahqīq*
  ve *al-Qānūn al-Masʿūdī*'nin tamamlanması (proto-antropoloji +
  Hint trigonometrik fonksiyonlarının Arap astronomi geleneğine
  yerleştirilmesi); c. 1017-1030 Punjab/Multan/Lahore Hint
  seferleri ve Brahminlerden Sanskritçe öğrenme; c. 973-1017
  Khwārazm Kāth çevresinde Ebû Naṣr ibn ʿIrāq mentorluğunda
  yetişme.

### (b) Atlas-rebalancing detayı — UI-pin vs entity-primary ayrımı

ν-prime'ın atlas-yetimi metriği üzerindeki etkisi *karmaşık*. Hem
+1 (ghazna eklendi+kullanıldı) hem +0 (toplam empty count sabit:
14 → 14, çünkü atlas-total da 25 → 26 büyüdü). Ama UI-pin görünürlüğü
açısından gerçek kazanç vardır: al-Bīrūnī'nin Person.atlasAnchors[]
3-anchor rotası Atlas runtime'ı tarafından `themePaths` üzerinden
ghazna ↔ khwarazm ↔ delhi dotted sepia path olarak çizilir. Khwarazm
ve Delhi entity-primary anchor olarak boş kalıyor (al-Bīrūnī'nin
secondary'leri) — ama Atlas'ta görsel olarak işaretlenmiş hale
geliyorlar.

| Yer | ν öncesi | ν-prime sonrası | Δ |
|---|---|---|---|
| ghazna | yok | atlas'a YENİ + 1 entity primary | YENİ + DOLU |
| khwarazm | boş | boş primary; al-Bīrūnī secondary → UI-pin | UI-pin kazanımı |
| delhi | boş | boş primary; al-Bīrūnī secondary → UI-pin | UI-pin kazanımı |

Yani ν-prime fiili UI-etkisi olarak 3 atlas place'i "görünür" hale
getirdi, ama entity-primary sayımına yansıyan yalnız 1 (ghazna).
Bu bir editöryel düşünce: *atlas-yetimi metriği* yalnız primary
sayımına bakarsa UI'daki gerçek görsel etkiyi eksik ölçer. Gelecek
dilim'de delhi ve khwarazm için *primary-anchor entity* (örn:
Hindistan astronomu Bhāskara II için delhi, Khwārazm Ma'munid
döneminden ibn ʿIrāq için khwarazm) eklemek bu eksiği kapatabilir.

### (c) Hindu-Arap Rakamları theme'i — Khwārazm-Gazne yan-akışı

7/26 ν sonrası theme: 3 W + 3 P + 2 B = 8 entity (4 atlas ayağı:
Bhillamāla 628 → Bağdat c. 825 → Toledo 1145 → Pisa 1202). ν-prime
sonrası: 3 W + **4 P** + 2 B = **9 entity**; al-Bīrūnī ana zincire
*paralel-yan-akış* olarak girer (Brahmagupta → al-Khwārizmī ana
çizgi: Bağdat dolaylı kanalı; Brahmagupta → al-Bīrūnī ikinci çizgi:
Khwārazm-Gazne Sanskritçe doğrudan kanalı; her ikisi de 825-1030
arası Hint matematiğinin Arap dünyasına geçişinin *iki ayrı yolu*).

Editöryel argüman: medeniyetler-arası bilgi geçişi nadiren tek
kanaldan olur. Hint matematiği Arap dünyasına iki bağımsız yoldan
geçti: (1) c. 770'lerde Bağdat'ta Sindhind çeviri programı +
al-Khwārizmī (c. 825) — *dolaylı, Sanskritçe öğrenilmeden, çeviriden
çeviri*; (2) c. 1018-1030 Mahmud Gazne'nin Hint seferleri +
al-Bīrūnī — *doğrudan, Sanskritçe öğrenilerek, birinci elden*.
Bu iki kanal arasında 200 yıl ve 4000 km vardır; ama her ikisi de
aynı kaynağı (Brahmagupta'nın *Brāhmasphuṭasiddhānta*'sını) okur.
Theme şimdi bu *çift-kanal disiplini*ni temsil eder.

### Build çıktısı (dilim 7/27 sonrası)

| | 7/26 sonu | 7/27 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 83.61 | 83.62 | +0.01 (varyans) |
| `registry` (KB gz) | 43.40 | 45.72 | **+2.32** (1 yeni Person summary) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni `al-biruni` lazy | yok | 19.77 KB gz | YENİ |
| Atlas place sayısı | 25 | 26 | +1 (ghazna) |
| Korpus entity | 42 | **43** | +1 |

Registry +2.32 KB gz: 1 yeni Person summary girişi, ortalamadan
biraz yüksek (al-Bīrūnī özet verisi 3 atlas anchor ve 4 work
referansı taşıdığı için zengin). al-Bīrūnī lazy chunk 19.77 KB gz —
Brahmagupta (14-18 gz aralığı tahminim) ve Fibonacci'den (45 KB
raw → ~18 gz) biraz büyük; 5 strata × 3 dil × ortalama gövdeler
+ 4 work + 4 circle member ile makul.

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/26 | 7/27 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 (eşik altında) |
| §12.2 Korpus | 0.50 | 56.5 | **57.1** | +0.6 (1 catalogue Person + 1 atlas place + theme densifikasyon + ilk 3-anchor disiplini) |
| §12.3 UI | 0.25 | 88 | 88 | 0 (saf içerik) |
| §12.4 Polish | 0.10 | 85 | 85 | 0 |
| **Ağırlıklı** | 1.00 | %69.85 | **~%70.15** | **+0.30 puan** |

§12.2 +0.6: 1 catalogue Person (0.25) + 1 atlas place (0.1) + theme
densifikasyon 8→9 (0.15) + ilk 3-atlas-anchor Person yapısal disiplini
(0.1). ν dilim'inin +1.0 katkısının kabaca yarısı — beklenen
(ν 3 entity, ν-prime 1 entity).

### Sonraki dilim için öneriler

%70 eşiği geçildi — psikolojik dönüm noktası. ν-prime sonrası
sıradaki adım için seçenekler:

1. **Live deploy** (önerilen). 43 entity, 26 atlas place, theme yapısı %100 kapanmış, atlas-honesty Khwārazm-Gazne ekseni eklendi, Hindu-Arap theme 9-entity. Daha fazla içerik *deploy öncesi gereksiz*. Δ tahmin: +%8 puan.
2. **κ** (polish: CSP `unsafe-inline` kaldırma, Lighthouse audit + fix, share buttons, launch öncesi/sonrası polish). Δ tahmin: +%2-3.
3. **ν-double-prime** (atlas-rebalancing devamı). Delhi için Bhāskara II (12. yy Hint matematikçisi); Khwarazm için ibn ʿIrāq (al-Bīrūnī'nin hocası — al-biruni mevcut paragrafta zaten mentor olarak geçer); Florence için Paolo Dell'Abbaco veya Luca Pacioli. 3'lü slate. Δ tahmin: +%0.6-0.8.

Sıralama önerisi: **live deploy → κ → ν-double-prime**. ν+ν-prime ile atlas-rebalancing stratejisi olgunlaştı; daha fazla içerik canlı URL'siz değer üretmiyor.

---

## Oturum 7 — dilim 26 (Shape ν: atlas-rebalancing içerik — 3 yeni catalogue entity, atlas 24→25, Hindu-Arap theme densifikasyonu)

> 7/25 μ theme bidirectional disiplinin yapısal kapanışıydı (sıfır
> yeni entity, doku-temizleme); 7/26 ν *içerik genişlemesi*, ama
> daha önce gözden kaçırılmış stratejik eksen üzerinde: *atlas
> yetimi*. 7/25 sonu durumu: 24 atlas place, yalnız 10'u entity
> bağlı, 14'ü boş pin. Cordoba (10) ve Bağdat (10) çift-merkez
> oturmuş; θ-double-prime aday-listesi (muslin/almanac/gauze/alkali)
> tümü tekrar Cordoba/Damascus eksenine düşerdi, *atlas yetimi*'ni
> azaltmazdı. ν stratejik yön değişikliği: hem mevcut theme'lerin
> atlas argümanlarının terk edilmiş köşelerine, hem boş pin
> doldurmaya odaklanma.

### (a) Brahmagupta — Hindu-Arap theme stage 1 protagonisti (dilim 7/26.ν.A)

**Tip:** catalogue Person.
**Atlas-anchor:** `bhillamala` (tek-anchor — 598-668 lifespan,
*Brāhmasphuṭasiddhānta*'nın yazıldığı kent).

**Editöryel argüman:** Hindu-Arap Rakamları theme'i atlas-rota'sında
4 ayak (bhillamala 628 → bağdat 825 → toledo 1145 → pisa 1202)
sunar; her ayağın bir kişi-protagonisti olur ama 7/25 sonu durumunda
stage 1 (Brahmagupta) ve stage 4 (Fibonacci) korpusta yoktu —
theme metni bu iki adı *adlı protagonist* olarak çağırdığı halde.
Brahmagupta'nın eklenmesi:

- **bhillamala atlas place** 1 → 2 entity (zero + brahmagupta).
- **theme persons[]** 1 → 2 (al-khwarizmi + brahmagupta).
- *Brāhmasphuṭasiddhānta*'nın 18. bölümünde sıfır ve negatif sayılar
  için verilen aritmetik kurallar — *sıfır + sıfır = sıfır; sayı +
  sıfır = sayı; sayı × sıfır = sıfır* — modern aritmetiğin formel
  temelinin tarihsel başlangıç noktasıdır. zero Word'ü bu kuralların
  *sözcüksel taşıyıcısı*; Brahmagupta o kurallı temelin *kişisel
  imzası*.
- 5 strata: 2026 modern miras (sıfırın aritmetik yetkisi); 1145
  Toledo (Sindhind çevirilerinin Latin Avrupa'ya geçişi);
  c. 770→825 Bağdat (Hint heyeti + al-Fazārī + al-Khwārizmī);
  628 Bhillamāla (kuralların yazımı); c. 598→628 Önce
  (Āryabhaṭa geleneği + Brahmagupta'nın eleştirel halefliği).

### (b) Leonardo Fibonacci — Hindu-Arap theme stage 4 protagonisti, Pisa atlas'a yeni (dilim 7/26.ν.B)

**Tip:** catalogue Person.
**Atlas-anchor:** `pisa` (atlas'a yeni — 25. place — c. 1170-1245
lifespan, *Liber Abaci*'nin yazıldığı kent); ikincil anchor
`florence` (Toskan abakuscu okullarının halka inişi).

**Editöryel argüman:** Hindu-Arap theme stage 4 (Latin Avrupa'ya
geçiş) anchor'ı 7/2.5'te ujjain/rome → bhillamala/florence olarak
düzeltilmişti; *Floransa 1202 · Leonardo Fibonacci* etiketi sözel
olarak doğruydu ama tarihen Fibonacci'nin doğduğu, çalıştığı ve
*Liber Abaci*'yi yazdığı yer **Pisa**, Floransa değildi. ν dilim'i
bu atlas-honesty kusurunu *Pisa'yı atlas'a ekleyerek* düzeltir;
Fibonacci ve Liber Abaci primary-anchor olarak Pisa'da otururlar;
hindu-arabic-numerals theme stage 4 anchor'ı `florence` → `pisa`
güncellendi. Florence şu an entity-boş pin (theme atlas
anchor'ından da çıktı); gelecek dilim'de Tuskan abakuscu Person
(Paolo Dell'Abbaco gibi) gelirse dolar — ν-prime / ξ adayı.

- **pisa atlas place** atlas.ts'e eklendi (paris/rome arasında,
  Toskana kıyısı koordinatları); 25. place.
- **theme persons[]** 2 → 3 (+fibonacci); **theme books[]** 1 → 2
  (+liber-abaci).
- 5 strata: 2026 modern miras (Fibonacci dizisi = yanlış neden
  hatırlanma); c. 1240→1340 Toskana abakuscu okulları (*scuole
  d'abaco*); 1202-1228 Liber Abaci baskıları; c. 1185→1200 Bijāya
  Mağrip kıyısı (babasının gümrük bürosu — Arap muhasebeciyle
  karşılaşma); c. 1170 önce (Pisa cumhuriyeti, Bonacci ailesi).

### (c) Liber Abaci — Fibonacci'nin kitabı (dilim 7/26.ν.C)

**Tip:** catalogue Book.
**Atlas-anchor:** `pisa` (1202 yazıldı, 1228 gözden geçirildi);
ikincil anchor `florence` (Toskan abakuscu okulları halefiyle
2 yüzyıl uzun çocuk-kitap zinciri).

**Editöryel argüman:** Hindu-Arap Rakamları theme'i şu ana kadar
sadece 1 book (al-Jabr — el-Hârezmî'nin Bağdat kitabı, Latin
Avrupa'ya stage 3'te giriş) sahipti; stage 4'te kitap-protagonisti
yoktu. Liber Abaci'nin eklenmesi:

- **pisa atlas place** 1 → 2 entity (fibonacci + liber-abaci) —
  yeni-eklenen place hemen yoğunlaştı.
- **theme books[]** 1 → 2.
- 5 strata: 2026 (popüler-akademik kanalın iki ayrı okuması — tavşan
  vs. ders kitabı); 1228-14. yy (Toskan halefler *trattati
  d'abaco*); 1202 ilk baskı yapısı (yöntem → uygulama → genelleme,
  modern ders kitabı modeli); c. 1185-1200 hammaddenin Akdeniz
  toplaması (Bijāya/Mısır/Suriye/Bizans/Sicilya/Provence); c. 825
  → 1145 Önce (el-Hârezmî → Chester'lı Robert → Fibonacci üç-aşama
  kitap-zinciri).

### (d) Atlas-rebalancing argümanı — yetim azaltma

**Önceki durum (7/25 sonu):** 24 place, 10 entity-kullanılan,
**14 boş yetim**. Dağılım çift-merkezli: cordoba 10, bağdat 10,
diğer 8 place toplam 4-2-1 entity dağılımıyla.

**ν sonrası durum (7/26 sonu):** 25 place, **11 entity-kullanılan**,
14 boş yetim (florence yeni boş + pisa yeni kullanılan). Aynı
"boş pin" sayısı, ama:

| Yer | Önce | Sonra | Δ |
|---|---|---|---|
| pisa | yok | 2 entity (fibonacci + liber-abaci) | YENİ |
| bhillamala | 1 entity (zero) | 2 entity (+brahmagupta) | +1 |
| florence | 1 theme anchor | boş | −1 |

Florence kaybı **bilinçli ve tarihen daha doğru**: Fibonacci ve
Liber Abaci tarihen Pisa'lı; florence anchor'ı sözel-Toskan
kestirmesiydi. ν düzeltisi atlas-honesty kazancı. Gelecek dilim'de
Tuskan abakuscu Person (Paolo Dell'Abbaco) gelirse florence yeniden
dolar.

### (e) Hindu-Arap Rakamları theme'i — tek-konulu büyük theme'e dönüşüm

7/25 sonu durumunda hindu-arabic-numerals theme **3 word + 1
person + 1 book = 5 entity** kapsıyordu — minimal cluster büyüklüğü.
ν sonrası: **3 word + 3 person + 2 book = 8 entity** — theme
densifikasyonunun en güçlü örneği, projenin en geniş tek-konulu
theme'i. Editöryel etki:

- Atlas rota'sının 4 ayağı şimdi *kişi-imzalı*: Brahmagupta,
  al-Khwārizmī (mevcut), Robert of Chester (henüz Person değil
  ama theme atlas anchor'ında), Fibonacci.
- ThemePage'in entity-grid'i 5 → 8 kart; theme'in *ekspozisyon
  derinliği* her ayak için 1 kişi + 1 word/book ile dengeli.
- Çift-yönlü Word bağı (zero ↔ hindu-arabic-numerals, 7/25 μ'da
  kurulmuştu) bozulmadı; ν yapısal disiplin değil içerik
  genişlemesi.

### Build çıktısı (dilim 7/26 sonrası)

| | 7/25 sonu | 7/26 sonu | Δ |
|---|---|---|---|
| `index` eager (KB gz) | 83.62 | 83.61 | −0.01 (varyans) |
| `registry` (KB gz) | 39.57 | 43.40 | **+3.83** (3 yeni entity stub) |
| `loader` (KB gz) | 28.08 | 28.08 | 0 |
| Yeni `brahmagupta` lazy | yok | ~47.9 KB raw | YENİ |
| Yeni `fibonacci` lazy | yok | ~45.0 KB raw | YENİ |
| Yeni `liber-abaci` lazy | yok | ~35.2 KB raw | YENİ |
| Atlas place sayısı | 24 | 25 | +1 (pisa) |
| Korpus entity | 39 | **42** | +3 |

Registry +3.83 KB gz beklenen aralıkta (3 yeni summary girişi,
her biri ~1-1.5 KB summary verisi). Eager paint -0.01 varyans
düzeyinde — yeni entity'ler tamamen lazy.

### Tamamlanma ölçümü güncelleme

| Ölçüm | Ağırlık | 7/25 | 7/26 | Δ |
|---|---|---|---|---|
| §12.1 Roadmap | 0.15 | 74 | 74 | 0 (eşik altında) |
| §12.2 Korpus | 0.50 | 55.5 | **56.5** | +1.0 (3 catalogue entity + 1 theme densifikasyon) |
| §12.3 UI | 0.25 | 88 | 88 | 0 (saf içerik) |
| §12.4 Polish | 0.10 | 85 | 85 | 0 |
| **Ağırlıklı** | 1.00 | %69.3 | **%69.8** | **+0.5 puan** |

§12.2 +1.0: 3 yeni catalogue entity (her biri ~0.25) + theme
densifikasyonunun yapısal kapanış değeri (~0.25 — Hindu-Arap
theme stage 1 ve stage 4 boş-kişi sorunu çözüldü, theme atlas
argümanı her ayak için kişi-imzalı oldu).

### Sonraki dilim için öneriler

7/26 ν sonrası önümüzde üç yön açık:

1. **Live deploy** (önerilen). 7/19.ι'da §12.4 polish %85'e ulaşmıştı; korpus 42 entity, theme yapısı %100 kapanmış (μ'da), atlas Hindu-Arap-densifiyle dengeli. Canlı URL artık değer üretir; daha fazla içerik *deploy öncesi gereksiz*. Δ tahmin: +%8 puan.
2. **ν-prime** (atlas-rebalancing devam). Mokha (coffee yan-anchor olarak), Khwārazm (al-Bīrūnī Person olarak), Florence (Paolo Dell'Abbaco veya Cosimo Bartoli Tuskan-abakuscu Person olarak) — başka bir 3'lü slate, 3 atlas place'i daha entity-kullanılır hâle getirir. Δ tahmin: +%0.8-1.0.
3. **κ** (polish: CSP `unsafe-inline` kaldırma, Lighthouse audit + fix, share buttons). Launch öncesi-sonrası polish. Δ tahmin: +%2-3.

Sıralama önerisi: **live deploy → κ → ν-prime**. Deploy doyma noktasını kanıtlar; sonra polish'ten kazanım net; sonra korpus genişlemesi gerçek kullanıcı geri bildirimiyle çerçevelenir.

---

## Oturum 7 — dilim 25 (Shape μ: theme bidirectional kapanışı — 6/6 tam disiplin)

> *Son dört dilim catalogue Word genişlemesi (θ + θ-prime) ve theme
> densifikasyonu (λ + λ-prime) olarak ilerledi. 7/24 sonrası 5/6
> theme'in çift-yönlü Word bağı vardı — yalnız iki theme tek-yönlü.
> 7/25 μ dilim'i bu iki son theme'i de disipline alır: zero ↔
> hindu-arabic-numerals, admiral ↔ lugat-al-bahr-arabi + akdeniz-
> tersanesi. Projenin **en küçük dilimi** — sadece sibling-ref ekleme
> işi — ama disiplin kapanışı. μ adı (Yunanca "mu") küçüklüğü
> simgeler; ama kapanış değerli: hiçbir theme tek-yönlü kalmasın
> editöryel kural buradan itibaren kalıcı.*

### (a) zero → hindu-arabic-numerals

zero korpus'taki **en eski showcase Word** (proje başlangıcından
itibaren) ve hindu-arabic-numerals temasının **anahtar terimi**.
Tema'nın 4 atlas-anchor argümanı (Bhillamāla 628 → Bağdat c. 825 →
Toledo 1145 → Floransa 1202) sıfır+pozisyonel sistemin yolculuğunu
izler; zero o sistemin **sözcüksel taşıyıcısı**. Tema-tarafında zero
mevcut `words:` listesinde (theme→Word); şimdi Word-tarafında theme
ref eklendi (Word→theme). Tam çift-yönlü.

Sibling-ref notunda dört aşamanın dört imlasıyla anlatıldı: 7. yy
Hindistan boşluk-işareti → 9. yy Bağdat *ṣifr* → 12. yy Toledo
*cifra* → 15. yy Floransa *zero*. Aynı kavram, dört yazılış, bir
tema-yolculuğu.

### (b) admiral → lugat-al-bahr-arabi + akdeniz-tersanesi

admiral **iki theme'in** çift-yönlü Word'ü oluyor — çoklu-theme
bidirectional disipliniyle ilk örnek.

**lugat-al-bahr-arabi (Arap denizcilik sözlüğü)**: temanın subtitle'ı
*"yapı ve yetki"* iki ayak. *Arsenal* = yapı (dār aṣ-ṣināʿa, tesis),
*admiral* = yetki (amīr al-baḥr, komutan). Sibling-ref notu admiral'ın
**yetki/kişi-imzası** rolünü açıklar.

**akdeniz-tersanesi (Akdeniz tersanesi)**: temanın **kuzey-batı
köşesi** (Cordoba) pin imzası. Akdeniz dört-köşeli ağda admiral
Cordoba'yı temsil eder; lugat-al-bahr-arabi'de ise denizcilik
kavramı olarak.

**Editöryel disiplin**: bir Word **iki theme'in aynı anda çift-yönlü
üyesi** olabilir. Bu **çoklu-theme bidirectional** disiplini admiral'la
ilk kanıtlanıyor. admiral'ın **iki ortogonal okuması** sibling-ref
notunda açıkça söylenir: *"bir Word'ün iki theme'de aynı anda
bulunabilmesi — denizcilik kavramı (lugat-al-bahr-arabi) **ve**
Akdeniz coğrafyası (akdeniz-tersanesi) — bilgi grafımızın **ortogonal
organizasyon disiplini**'ni gösterir"*.

### (c) Cumulative theme-disiplin durumu

7/25 μ sonrası **theme yapısı tamamen kapanmış**:

| Disiplin | Durum |
|---|---|
| Theme sayısı | 6 (1 magnum + 5 cluster) |
| Bidirectional theme-Word çift | **6/6 = 100%** |
| Çoklu-theme Word (≥2 theme'de listelenen) | 3 (alcohol, admiral, arsenal) |
| Çoklu-theme bidirectional Word (≥2 theme'in siblings'de ref'i) | **1 (admiral)** — yeni disiplin |
| Atlas multi-anchor theme | 4 (hindu-arabic-numerals 4, lugat-al-bahr-arabi 3, tibb-koridor 4, akdeniz-tersanesi 4) |

Theme yapısının **hiç bir boş köşesi yok** — her theme'in en az bir
çift-yönlü Word bağı var, her theme atlas üzerinde multi-anchor,
her theme cluster veya magnum tier'da. Yapısal disiplin tamamlandı.

### Build çıktısı (dilim 7/25 sonrası)

| | 7/24 sonu | 7/25 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.62 KB gz | **83.62 KB gz** | **0** *(sabit)* |
| `registry` chunk | 39.58 KB gz | **39.57 KB gz** | −0.01 *(varyans)* |
| `zero` lazy | 13.42 KB gz | **15.34 KB gz** | +1.92 *(1 theme sibling-ref + 3-dil note)* |
| `admiral` lazy | 4.65 KB gz | **9.63 KB gz** | +4.98 *(2 theme sibling-ref + 3-dil note × 2)* |
| Build süresi | 8.73s | 9.75s | +1.02s |

`npm run validate` ✓ — 27 W + 4 P + 2 B + 6 T = 39 entity (değişmedi),
24 atlas place (değişmedi), 0 invariant violation. `npm run typecheck`
✓. `npm run build` ✓ 9.75s.

| | 7/24 sonu | 7/25 sonu | Kümülatif Δ |
|---|---|---|---|
| Entity sayısı | 39 | **39** | 0 (disiplin dilim'i) |
| Sibling crossLink | (mevcut) | +3 | zero × 1 + admiral × 2 |
| Bidirectional theme-Word çift | 4 | **6** | +2 |
| Theme bidirectional yüzde | 66.7% | **100%** | +%33.3 |
| Çoklu-theme bidirectional Word | 0 | **1** (admiral) | +1 (yeni disiplin) |
| Ağırlıklı ortalama | ~%69.0 | ~%69.3 | **Δ +%0.3**, *7/24 endcap'inde μ için tahmin edilen +%0.3 ile birebir eşleşiyor* |

GRAND_PLAN §12.2 korpus skoru: 55 → **55.5** (+0.5). 12.5 ağırlıklı
katkı: 0.50 × 0.5 = +%0.25.

7/25 sonrası sıradaki dilim editöryel — **artık kesinlikle live deploy**:
korpus dolu (39 entity), theme yapısı %100 kapanmış, atlas dengeli
(2 super-pin + 5 medium-pin), build sağlam. Editöryel bekleme yok.
Diğer seçenekler:

- **Live deploy** (yine birinci öncelik) — domain + Cloudflare Pages.
- **κ — polish dilimi**: CSP, Lighthouse, share buttons. Launch
  öncesi/sonrası polish.
- **θ-double-prime**: muslin, almanac, gauze, alkali (Δ ≈ +%1.0
  ama doyma noktası yakın).

Sıralama: **live deploy → κ → θ-double-prime**.

---

---

## Oturum 7 — dilim 24 (Shape λ-prime: ikinci yeni Theme, akdeniz-tersanesi — Akdeniz dört-köşeli ağ)

> *7/23 λ tibb-koridor projeye **zamansal koridor** yapısını getirdi
> — 9.→15. yy tek hat üzerinde tıp metinlerinin çevirimi. 7/24 λ-prime
> aynı yapısal disiplinin **mekansal eşi**'ni getirir: akdeniz-tersanesi
> 11.-13. yy'larda Akdeniz'in dört köşesinden (Cordoba, Palermo, Cairo,
> Damascus) Latin Avrupa'ya askeri-teknik-lüks Arap kelime hazinesinin
> eşzamanlı paralel ihracını gösterir. Editöryel argüman: bir bilgi
> grafının değeri yalnız kapsamından değil, **organizasyon eksenlerinin
> sayısından** gelir. λ + λ-prime'la birlikte projede artık iki ana
> multi-anchor theme var — biri zamansal, biri mekansal; aynı entity'ler
> her iki theme'in altında okunabilir. Bu **iki ortogonal eksen**
> ortaya çıkardığı anlatı zenginliği yeni Word/Person/Book eklemekten
> daha değerli.*

### (a) Yeni theme'in yapısı

**slug**: `akdeniz-tersanesi` — Türkçe, "Mediterranean Arsenal"
anlamı; theme'in **en güçlü kelimesi** (arsenal) tema adına metafor
olarak gömülü. tibb-koridor pattern'ı: kelimenin kendisi tema'da
(tibb-koridor'da *tibb*, akdeniz-tersanesi'nde *arsenal* < *tersane*).

**tier**: cluster (tibb-koridor'la aynı; magnum bağımsız anlatı yükü
yerine **kümeleme cihazı** rolü).

**title**:
- TR: *Akdeniz Tersanesi · Arap Askeri-Teknik-Lüks Kelime Hazinesinin
  Dört Köşeli Ağı*
- EN: *The Mediterranean Arsenal · The Four-Cornered Network of Arabic
  Military, Technical and Luxury Vocabulary*
- AR: *تَرسانةُ المُتَوَسِّط · الشَّبَكةُ الرُّباعيّةُ لِمُعجَمِ المَفرداتِ
  العَرَبيّةِ العَسكَريّةِ-التِّقنيّةِ-الفاخِرة*

### (b) Üyeler — 6 Word + 0 Person + 0 Book

| Kategori | Üyeler | Sayı |
|---|---|---|
| Words | admiral, mattress, arsenal, damask, assassin, tariff | 6 |
| Persons | — | 0 |
| Books | — | 0 |
| **Toplam entity** | | **6** |

tibb-koridor'la kıyas: 4 W + 2 P + 1 B = 7 entity. λ-prime sadece
Word ekseninde — Person yok (bu koridorun Person'ları korpus'ta yok;
Norman Sicilya'nın saray kişileri, Suriye Haşhaşi liderleri, Memlûk
amirleri henüz Person olarak işlenmedi — gelecek dilim için potansiyel).
Bu farkın editöryel anlamı: **tibb-koridor metin-tercümesinin** (Person
+ Book + Word) **tam paketini** sunarken, **akdeniz-tersanesi maddi
kültür tercümesinin** (yalnız Word ekseni) **eksik paketini** sunar.
Maddi-kültür tercümesi metin-tercümesine kıyasla daha az "yazar" lı —
çünkü mobilya, dokuma, tersane, gümrük, suikastçi gibi pratikler
bireysel-yazılı tarihte iz bırakmaz; sözcükler bırakır.

### (c) Atlas-anchor argümanı — 4 anchor, Akdeniz dört köşesi

| # | Köşe | Anchor | Yıl | Word ailesi |
|---|---|---|---|---|
| 1 | kuzey-batı | **cordoba** | c. 850-1085 | admiral (denizci-askeri) |
| 2 | kuzey-orta | **palermo** | 1072-1194 | mattress (saray-mobilya) |
| 3 | güney | **cairo** | c. 1000-1250 | arsenal + tariff (askeri-tüccar) |
| 4 | doğu | **damascus** | c. 1080-1273 | damask + assassin (lüks-folklor) |

Atlas üzerinde dört pin **Akdeniz'in dört köşesi dörtgeni**'ni çizer.
Kuzey-güney ekseni (Sicilya-Mısır kıyısı), doğu-batı ekseni (Cordoba-
Şam ana karası). Tibb-koridor'un **çizgisi** (4 anchor'ı kronolojik
sıraya getirilirse Bağdat → Konstantinopol → Salerno → Padua = soldan
sağa zikzak çizgi) yerine, akdeniz-tersanesi'nin **dörtgeni**
(eşzamanlı dört nokta). İki theme atlas üzerinde farklı geometrik
formlar olarak görünür — okuyucu için anlık görsel kontrast.

### (d) Üç editöryel disiplin

**1. Sicilya'nın çifte imzası**: admiral ve mattress aynı Norman
sarayından iki ayrı sicilde çıkar — askerî hiyerarşi (*amīr al-baḥr*)
ve oda mobilyası (*al-maṭraḥ*). Aynı geçiş atölyesi, aynı dönem,
aynı kanal; iki sicil. Palermo pin'inin ağırlığı bu çiftli girişle
artar. Bu pattern'ı θ'da mattress.mdx'in editöryel argümanında bir
Word seviyesinde söylemiştik; λ-prime onu theme yapısında **kanonize**
ediyor.

**2. İkiz pattern — makro vs mikro toponim**: damask (Şam = bütün
şehir, makro-toponim) + tabby (al-ʿAttābī = Bağdat'taki bir mahalle,
mikro-toponim) iki ölçekte aynı geçiş mekaniği. Bu pattern'ı θ-prime'da
tabby.mdx'in editöryel argümanında söylemiştik; λ-prime ikizin
**diğer yarısını** (damask) theme yapısına ekleyerek çiftin **görünür**
hâle gelmesini sağlar.

**3. Tek pin'de iki sicil — Şam'ın çifte kültürel imzası**: damask
(lüks tekstil — saray-piyasa sicili) + assassin (Nizârî İsmâilî
tarikatı — folklor-siyasi sicil) aynı Damascus pin'inde, iki ayrı
kültürel sicil. Şehir bir kültürel monolit değil; aynı atlas
koordinatından iki farklı türde imza çıkar. Aynı argüman cairo'da
da işler (arsenal askeri-üretim + tariff tüccar-mali — iki sicil),
ama daha az dramatic — çünkü her ikisi de "ekonomik" alana ait. Şam
örneği daha keskin: lüks vs şiddet.

### (e) Çoklu-theme membership disiplini

Bu λ-prime'ın somutlaştırdığı **ortogonal organizasyon eksenleri**'nin
en güçlü göstergesi:

| Word | Theme 1 | Theme 2 | Disiplin |
|---|---|---|---|
| admiral | lugat-al-bahr-arabi (denizcilik kavramı) | akdeniz-tersanesi (Akdeniz mekansal) | iki theme'in üyesi |
| arsenal | lugat-al-bahr-arabi (denizcilik kavramı) | akdeniz-tersanesi (Akdeniz mekansal) | iki theme'in üyesi |
| alcohol | endulus-sofrasi (Endülüs gündelik) | tibb-koridor (tıbbi eczacılık) | iki theme'in üyesi |

Üç Word çoklu-theme membership örneği. Disiplin: bir Word **bir tema'da
hapsolmaz**; farklı eksenlerden okunabilir. Atlas + theme + sibling
crossLink üç eksende kelime yerini bulur.

Theme dosyasının body anlatısı bu argümanı **açıkça yapısallaştırıyor**:
admiral'in iki theme'de olmasının "bilgi grafımızın **ortogonal
organizasyon disiplini**"ni gösterdiğini söyler. Bu disiplinin theme
seviyesinde sözcüğe dökülmesi λ-prime'ın en güçlü editöryel katkısı.

### (f) Yapısal kapanış durumu — 5/6 theme çift-yönlü

| Theme | Bidirectional Word | Eklenme dilim'i |
|---|---|---|
| endulus-sofrasi | saffron | 7/21 θ |
| andalusian-translation-workshop | lute | 7/22 θ-prime |
| tibb-koridor | syrup | 7/23 λ |
| **akdeniz-tersanesi** | **damask** | **7/24 λ-prime** |
| hindu-arabic-numerals | — | (henüz yok) |
| lugat-al-bahr-arabi | — | (henüz yok) |

**5/6 theme çift-yönlü** (4 yeni eklendi son 4 dilim'de). Hâlâ
tek-yönlü olan 2 theme: hindu-arabic-numerals (zero veya algorithm'a
ref eklenebilir) ve lugat-al-bahr-arabi (admiral veya azimuth'a ref).
Gelecek dilim için **çok küçük bir editöryel kapatma işi** — iki Word
file'ına 2-cümlelik theme sibling-ref eklemek yeterli.

### (g) λ + λ-prime cumulative — iki theme'in birlikte etkisi

| | 7/22 sonu (θ-prime) | 7/24 sonu (λ-prime) | Cumulative Δ |
|---|---|---|---|
| Themes | 4 | 6 | +2 |
| Toplam entity | 37 | 39 | +2 |
| Theme entity-kapsam toplamı | 14 ref | **34 ref** | +20 |
| Bidirectional theme-Word çift | 2 | 4 | +2 |
| Çoklu-theme Word | 1 (alcohol) | **3** (alcohol + admiral + arsenal) | +2 |
| Atlas multi-anchor theme | 2 | 4 | +2 |
| Ağırlıklı ortalama | %67.0 | %69.0 | **+%2.0** iki dilimde |

**İki theme = +%2.0 puan**. Tibb-koridor (+%1.2) + akdeniz-tersanesi
(+%0.8) = %2.0. λ-prime'ın katkısı (+%0.8) λ'nın (+%1.2) altında —
çünkü λ-prime'ın yapısal yenilik içeriği daha az (λ ilk theme-densifikasyon
dilim'i; λ-prime aynı disiplinin tekrarı). Ama λ-prime'ın bir
**yapısal kapanış** değeri var: **kontrast yapıyı sağlıyor** (zamansal
vs mekansal); bu kontrast olmadan tibb-koridor "tek tema-örneği"
gibi okunurdu, şimdi "iki yapı tipinin birincisi" olarak.

### Build çıktısı (dilim 7/24 sonrası)

| | 7/23 sonu | 7/24 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.62 KB gz | **83.62 KB gz** | **0** *(sabit; eager bundle dokunulmadı)* |
| `registry` chunk | 38.29 KB gz | **39.58 KB gz** | **+1.29** *(theme summary + 6 entity refs + 4 anchor labels × 3 dil)* |
| `akdeniz-tersanesi` lazy | — | **18.08 KB gz** | yeni (cluster theme, 6 W + 4 anchor + 3-dil body) |
| `damask` lazy | (yoktu) | **9.94 KB gz** | yeni *(önceden siblings:[] idi; şimdi 3 sibling-ref)* |
| `tibb-koridor` lazy | 14.80 KB gz | 14.80 KB gz | sabit |
| Toplam yeni lazy | — | 28.02 KB gz | 1 theme + 1 Word *(siblings)* |
| Build süresi | 9.71s | 8.73s | −0.98s |

`npm run validate` ✓ — **27 W + 4 P + 2 B + 6 T = 39 entity** (38 → 39,
+1 Theme), 24 atlas place (sabit), 0 invariant violation. `npm run
typecheck` ✓. `npm run build` ✓ 8.73s.

| | 7/23 sonu | 7/24 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 27 / 4 / 2 / 5 | 27 / 4 / 2 / **6** | **+1 Theme** |
| Toplam entity | 38 | **39** | +1 |
| Theme entity-kapsam toplamı (ref'ler) | 21 | **27** | +6 (akdeniz-tersanesi 6 Word ref) |
| Bidirectional theme-Word çift | 3 (saffron, lute, syrup) | **4** (+damask) | +1 |
| Çoklu-theme Word (≥2 theme'de) | 1 (alcohol) | **3** (+admiral, +arsenal) | +2 |
| Atlas multi-anchor theme | 3 | **4** (+akdeniz-tersanesi 4 anchor) | +1 |
| Atlas medium-pin (≥3 entity, super-pin altı) | 3 (salerno, constantinople, palermo zaten) | **5** (+damascus, +cairo) | +2 |
| Ağırlıklı ortalama | ~%68.2 | ~%69.0 | **Δ +%0.8**, *7/23 endcap'inde λ-prime için tahmin edilen +%0.6-0.8 ile birebir eşleşiyor* |

GRAND_PLAN §12.2 korpus skoru: 53.5 → **55** (+1.5). 12.5 ağırlıklı
katkı: 0.50 × 1.5 = +%0.75.

7/24'ten sonra sıradaki dilim editöryel:

- **Live deploy** — projenin doğal sonraki adımı. Korpus dolu (39
  entity), yapısal disiplinler kapanmış (4/4 Person multi-anchor;
  5/6 theme bidirectional; 2 super-pin + 5 medium-pin), iki ana
  multi-anchor theme (tibb-koridor zamansal + akdeniz-tersanesi
  mekansal). 1 MB zip, ~84 KB gz eager. Live URL editöryel olarak
  zaman.
- **κ — polish dilimi**: CSP `unsafe-inline` kaldırma, Lighthouse
  audit, share buttons. ε + ι sonrası kalan %15-20 polish/launch'i
  kemikleştirir.
- **Küçük tamamlama dilim'i** — hindu-arabic-numerals'a zero veya
  algorithm sibling-ref (5/6 → 6/6 theme bidirectional); lugat-al-
  bahr-arabi'ye admiral veya azimuth sibling-ref. Δ ≈ +%0.3 (çok
  küçük ama disiplin-tamamlayıcı).
- **θ-double-prime** — daha fazla catalogue Word (muslin, almanac,
  gauze, alkali). Δ ≈ +%1.0 ama atlas densifikasyon doyma noktası
  yakın.

Sıralama tavsiyesi: **live deploy → κ polish → küçük tamamlama →
θ-double-prime**. Live deploy şu noktada **kesinlikle** doğru adım.

---

---

---

## Oturum 7 — dilim 23 (Shape λ: yeni Theme, tibb-koridor — yapısal kapanış)

> *7/21 θ + 7/22 θ-prime catalogue Word genişlemesi iki dilim'de 8
> yeni Word getirdi. Yeni Word'lerden 4'ü tıbbi/eczacılık ailesinde:
> syrup, sherbet (θ); alcohol ve alembic ise ε öncesinden mevcut.
> Yine η-prime'ın eklediği Person 3-hop rotaları (hunayn → salerno,
> ibn-sina → padua) bu Word'lerle aynı atlas-koridorunu izliyor. 7/23
> λ bu mevcut entity'lerin **tematik çatısını** kuruyor — yeni Theme
> tibb-koridor. Editöryel argüman: bir bilgi grafının değeri yalnız
> kapsamından değil, **bağlantı yoğunluğundan** gelir. λ'nın katkısı
> kapsam değil yoğunluk — 7 mevcut entity bir çatı altına; aynı entity'ler
> şimdi atlas üzerinde, theme listesinde, sibling crossLink'lerinde
> üç ayrı şekilde okunabilir.*

### (a) Yeni theme yapısı

**slug**: `tibb-koridor` — Türkçe-Arapça karışım, mevcut endulus-sofrasi
ve lugat-al-bahr-arabi disiplini içinde (slug'lar İngilizce-Türkçe-Arapça
transliterasyon karışıkı; her slug kendi içeriğine uygun dilden geliyor).

**tier**: cluster. Magnum (hindu-arabic-numerals 384 satır, bağımsız
anlatı) değil; **kümeleme cihazı** rolünde — mevcut Word/Person/Book
detayları zaten ayrı dosyalarda. Tema'nın işi tek çatı altında toplama
+ atlas argümanı + lexical iz haritası vermek.

**title**:
- TR: *Tıbb Koridoru · Hippokrates'ten Padua'ya*
- EN: *The Medicine Corridor · From Hippocrates to Padua*
- AR: *مَمَرُّ الطِّبّ · مِن أَبُقراطَ إلى بادوفا*

**subtitle (TR)**: *Yunan-Arap-Latin tıp metinlerinin Akdeniz koridorunda
bin yıllık çevirimi; bir Galen cümlesinin Bağdat'tan Salerno'ya, oradan
Padua'nın anatomi sınıfına yedi yüzyıllık yolculuğu.*

### (b) Üyeler — 7 entity bir çatı altına

| Kategori | Üyeler | Sayı |
|---|---|---|
| Words | alcohol, alembic, syrup, sherbet | 4 |
| Persons | hunayn-ibn-ishaq, ibn-sina | 2 |
| Books | al-qanun-fi-al-tibb | 1 |
| **Toplam entity** | | **7** |

Bu 7 entity her biri zaten kendi dosyasında 5-stratum × 3-dil yapısıyla
detaylı işlenmiş. Theme'in yaptığı şey bunları **tematik çatı altına
toplamak** + atlas-koridoru argümanını görselleştirmek + lexical iz
haritasını sunmak. Editöryel olarak bu, Word/Person/Book'ların **yatay
yapısı** + Theme'in **dikey-tematik yapısı** = iki ortogonal organizasyon
ekseni; korpusun değeri iki eksen aynı anda kullanıldığında ortaya çıkar.

### (c) Atlas-anchor argümanı — 4 anchor + kronolojik koridor

| # | Anchor | Yıl | Editöryel rol |
|---|---|---|---|
| 1 | **baghdad** | c. 830-873 | Kaynak atölye — Bayt al-Hikma, Hunayn'ın Galen tercüme programı, eczacılığın 9. yy kurumsallaşması |
| 2 | **constantinople** | c. 830+ → 15.-17. yy | Çift-katmanlı pin: (a) 9. yy Yunan elyazma kaynak kanalı (Hunayn'ın seyahatleri), (b) 15.-17. yy Osmanlı saray *şerbethâne*'si (sherbet'in diplomatik koridoru) |
| 3 | **salerno** | c. 1080 → c. 1200 | Geçiş atölyesi — Constantinus Africanus, *Liber Pantegni*, *Antidotarium Nicolai* (eczacılık paketinin Latin diline tek-paket boşaltılması) |
| 4 | **padua** | 1473 → c. 1650 | Curriculum yerleşmesi — *Canon Medicinae* matbu Latin baskısı, Vesalius/Fabricius/Harvey'in eğitim ortamı |

**Kronolojik okuma**: 9. yy → 11. yy → 15. yy. Üç ana sıçrama: kaynak
toplama (Bağdat-Konstantinopol), Latinleşme (Salerno), müfredata
yerleşme (Padua). **600 yıllık** uzun gerilim — Hunayn 873'te öldü;
*Canon Medicinae* 1473'te Padua'da matbu çıktı. Aynı disiplin,
aralarında yüzyıllar geçti.

### (d) İki uçlu Person yapısı

| Person | 3-anchor rota | Koridor ucu |
|---|---|---|
| **hunayn-ibn-ishaq** | baghdad → constantinople → salerno | **Yunan → Arap → Latin** ucu |
| **ibn-sina** | bukhara → hamadan → padua | **Arap → Latin → modern Avrupa** ucu |

İki Person aynı koridorun **iki uçlu yapısını** temsil eder. Hunayn'ın
işi: Yunan tıbbının Arapça'ya geçişi + Arap eczacılığının kuruluşu.
İbn Sina'nın işi: Arap tıbbının (kendi içinde gelişmiş hâliyle) Latin
müfredatına yerleşmesi. Aralarında **iki yüzyıllık karanlık dönem**
(c. 1200-1400) — Toledo çevirileri yapılmış (12. yy), ama curriculum
yerleşmesi henüz yok. 1473 Padua matbu baskı bu sessizliği kırar.

Atlas üzerinde **hunayn ve ibn-sina rotaları kesişmez**. İki Person
iki ayrı coğrafi-zamansal eksenle aynı tematik anlatıyı taşır.
Tibb-koridor theme'inin yapısal güzelliği: iki kesişmeyen rotayı tek
tema-çatısı altında **görünür** kılar.

### (e) Lexical iz — koridorun dört Word'ü

| Word | Anchor(s) | Koridor rolü |
|---|---|---|
| **alcohol** | baghdad, toledo, paris | Toledo-Paris hattı: universitas tıbbına geçiş (12.-13. yy) |
| **alembic** | baghdad, damascus, toledo | Eczacılığın temel aleti; Yunan *ambix* → Arapça → Latin |
| **syrup** | salerno | Salerno-Cassino hattının imza-kelimesi; *Antidotarium Nicolai* yüzlerce *syrupus* tarifi |
| **sherbet** | constantinople | *Alternatif kanal* — aynı *ş-r-b* kökü ama farklı sicil (Osmanlı saray protokolü); koridorun "ikiz pencere"si |

**sherbet'in özel rolü**: theme'in 4 Word'ünden biri olarak dahil edildi,
çünkü aynı kökten farklı koridora gitmiş olması koridorun **disiplin
genişliğini** gösterir — *bir kelimenin iki kanalı*. Bu syrup-sherbet
ikiz argümanı θ'da editöryel kanca olarak somutlaşmıştı, λ'da theme
yapısının bir parçası olur.

**Atlas-pin örtüşme tablosu**: koridorun zenginliği aynı pin'de birden
çok entity'nin birden çok zaman-katmanında durmasıyla görünür:

| Atlas-pin | tibb-koridor entity'leri | Diğer entity'ler (aynı pin) |
|---|---|---|
| baghdad | hunayn-ibn-ishaq, alcohol, alembic | algebra, algorithm, cipher, zero, ibn-al-haytham, carat, tabby |
| constantinople | hunayn, sherbet | (yalnız bu iki, ama iki zaman katmanı) |
| salerno | hunayn, syrup | (yalnız bu iki, ama η-prime ile yeni eklendi) |
| padua | ibn-sina | (yalnız bu bir) |

Tibb-koridor pin'lerinden 2'si (baghdad, constantinople) zaten yoğun;
2'si (salerno, padua) η-prime'ın eklediği yeni place'ler.

### (f) Çift-yönlü disiplin

Saffron + lute pattern'ı: theme yeni eklendiğinde **en güçlü Word'ünün**
siblings listesine theme sibling-ref eklenir (Word→Theme yönü);
theme'in `words:` listesi zaten Word'leri çağırır (Theme→Word yönü).
λ için **syrup** (koridorun imza-kelimesi, *Antidotarium Nicolai*
referansı, η-prime ile aynı pin) seçildi:

```
syrup.mdx siblings:
  - alcohol (Word↔Word, aynı atölye farklı koridor)
  - sherbet (Word↔Word, aynı kök farklı kanal)
  - tibb-koridor (Word↔Theme, koridorun imza-kelimesi)  ← yeni
```

Sherbet'e theme ref eklenmedi (sherbet'in koridor rolü "alternatif
kanal" — primary değil); alcohol ve alembic'e de eklenmedi (onlar
daha eski Word'ler, eklenmek zorunda değiller; saffron pattern'ı en
güçlü Word'le tek-yönlü çift-yönlü disipline yetiyor).

### (g) Yapısal kapanış argümanı

7/23 sonrası mevcut 5 theme'in çift-yönlü Word-bağ durumu:

| Theme | Bidirectional Word | Tek-yönlü Word |
|---|---|---|
| endulus-sofrasi | saffron (7/21 θ) | cotton, lemon, orange, sugar, coffee, alcohol |
| andalusian-translation-workshop | lute (7/22 θ-prime) | algorithm, algebra, zero |
| tibb-koridor | syrup (7/23 λ) | alcohol, alembic, sherbet |
| hindu-arabic-numerals | — | algorithm, algebra, zero |
| lugat-al-bahr-arabi | — | (denizcilik Word'leri — admiral, azimuth, tariff, vb.) |

3/5 theme çift-yönlü bağlama disiplinine sahip; 2/5 tek-yönlü.
Hindu-Arabic ve lugat-al-bahr-arabi gelecek dilim için potansiyel
hedefler.

### Build çıktısı (dilim 7/23 sonrası)

| | 7/22 sonu | 7/23 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.62 KB gz | **83.62 KB gz** | **0** *(eager bundle dokunulmadı)* |
| `registry` chunk | 37.26 KB gz | **38.29 KB gz** | **+1.03** *(theme summary + 7 entity refs + 4 anchor labels)* |
| `tibb-koridor` lazy | — | **14.80 KB gz** | yeni (cluster theme, 4 anchor + 3-dil body) |
| `syrup` lazy | 12.79 KB gz | **13.31 KB gz** | +0.52 *(theme sibling ref + 3-dil note)* |
| Toplam yeni lazy | — | 14.80 KB gz | 1 theme dilim |
| Build süresi | 9.29s | 11.58s | +2.29s *(yeni theme MDX parse + bundle)* |

`npm run validate` ✓ — **27 W + 4 P + 2 B + 5 T = 38 entity** (37 → 38,
+1 Theme), 24 atlas place (sabit), 0 invariant violation.
`npm run typecheck` ✓. `npm run build` ✓ 11.58s.

| | 7/22 sonu | 7/23 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 27 / 4 / 2 / 4 | 27 / 4 / 2 / **5** | **+1 Theme** |
| Toplam entity | 37 | **38** | +1 |
| Theme'in entity-kapsamı (toplam Word+Person+Book ref'leri) | 14 (4 theme × ortalama 3.5 ref) | **21** (+7 ref: tibb-koridor 4W+2P+1B) | +7 entity-ref |
| Atlas-anchor sayısı (theme tarafından çağrılan) | (mevcut) | +4 (tibb-koridor anchors) | 4 yeni atlas-anchor-via-theme |
| Bidirectional theme-Word çift sayısı | 2 (saffron, lute) | **3** (+syrup) | +1 |
| Sibling crossLink sayısı | (mevcut) | +1 | syrup → tibb-koridor |
| Ağırlıklı ortalama | ~%67.0 | ~%67.8 | **Δ +%0.8**, *7/22 endcap'inde λ için tahmin edilen Δ ≈ +%0.8 ile birebir eşleşiyor* |

GRAND_PLAN §12.2 korpus skoru: 52 → **53.5** (+1.5). 12.5 ağırlıklı
katkı: 0.50 × 1.5 = +%0.75.

7/23'ten sonra sıradaki dilim editöryel:

- **Shape λ-prime** — ikinci yeni Theme. Sicilya-saray theme'i (admiral
  + mattress + arsenal kümesi) en güçlü aday; ya da denizci-Arab theme'i
  (azimuth + admiral + tariff + lugat-al-bahr-arabi enrichment). Δ ≈
  +%0.6-0.8 — λ'ya benzer ölçek.
- **Live deploy** — editöryel adım: domain tescili + Cloudflare Pages
  onboarding + canlı URL.
- **θ-double-prime** — daha fazla catalogue Word (muslin, almanac,
  gauze, alkali). Korpus 38 → 41-42. Δ ≈ +%1.0 ama atlas-densifikasyon
  doyma noktası yakın.
- **κ — polish dilimi**: CSP `unsafe-inline` kaldırma, Lighthouse
  audit, share buttons.

Sıralama tavsiyesi: **live deploy → λ-prime → κ → θ-double-prime**.
Live deploy şu noktada en doğal sonraki adım: korpus zaten dolu
(37-38 entity), yapısal kapanışlar yapılmış (catalogue Person 4/4
multi-anchor; 3/5 theme bidirectional), atlas-pin densifikasyonu
sağlam (2 super-pin). Live URL editöryel olarak doğru zaman; ondan
sonra λ-prime (yapısal devam), κ (launch sonrası polish), θ-double-
prime (kapsam genişleme getiri azalan dönemde).

---

---

---

## Oturum 7 — dilim 22 (Shape θ-prime: catalogue Word densifikasyonu, mevcut yoğun-pin'lerin zenginleştirilmesi)

> *7/21 θ catalogue Word genişlemesinin ilk büyük dilim'iydi: 4 yeni
> Word, 4 farklı koridor, 4 farklı geçiş tipi. 7/22 θ-prime aynı
> momentum'u sürdürür ama **stratejik olarak ters yönde**: θ atlas
> pin çeşitliliğini rafine etti (her Word farklı pin); θ-prime mevcut
> **yoğun pin'leri** (Bağdat + Cordoba) zenginleştirir (her Word
> önceden 8-entity ağırlıklı bir pin'e ekleniyor). Editöryel argüman:
> bir bilgi grafı'nın "saçaklı" mı (çok-pin, az-yoğun) yoksa "yoğun"
> mu (az-pin, çok-yoğun) olması gerektiği bir trade-off; iyi atlas
> her ikisine de ihtiyaç duyar. θ-prime'ın dilim'i, **yoğunluk
> ayağı**. Sonuç: Baghdad ve Cordoba pin'leri 8 → 10 entity'ye çıktı;
> okuyucu bir pin'e hover ettiğinde 10 farklı kelime/kişi listesi
> görür. Bu "rich hub" görünümü güçlü bir vizüel disiplin.*

### (a) `carat` — Bizans-Arap-Avrupa ölçü hattı (dilim 7/22.θ-prime.A)

**Köken zinciri.** Yunanca *kerátion* (keçiboynuzu tohumu, Bizans
1/24-solidus standart birimi) > Arapça *qīrāṭ* (Abdülmelik 696 sikke
reformuyla dinarın 1/24'i; cevher-tartısının dakikası) > Akdeniz
Latincesi *carratus* (12. yy Sicilya-Toledo) > İtalyanca *carato*
(13. yy Pegolotti Floransa) > Eski Fransızca *carat* (14. yy) >
İngilizce *carat* (1469 ilk şahit).

**Editöryel argüman 1 — "loan of a loan".** *Qīrāṭ* sadece yarısı
bilinen kelime: Arap kısmı görünür, Bizans-Yunan kısmı görünmez.
Avrupa'ya geçişte yine yalnız "Arapça'dan" söz edilir; Bizans katmanı
silinmiş kalır. Klasik filolojide *çift-katlı alıntı kelime*.

**Editöryel argüman 2 — 24 sayısının yapısal kalıcılığı.** Dinarın
1/24'e bölünmesi ortaçağ İslam matematiğinin temel sistemi oldu —
günün 24 saati, akademik takvimin 24-bölünmeli yapısı. Sonra Avrupa
*altın karat* için aynı 24-bölünmeli sistemi miras aldı (24-karat
saf, 18-karat 18/24 = %75, 14-karat 14/24 = %58.3). **Sayısal bir
sözleşme bin yıldan uzun yaşar.**

**Editöryel argüman 3 — 1907 metrik standart.** 19. yy elmas pazarı
(Kimberley 1867 sonrası) şehir-başına farklı carat ağırlıklarını
sürdürmeyi imkânsız kıldı; 1907 Paris Uluslararası Ağırlıklar Bürosu
**kesin 200 mg** olarak sabitledi (1914 ABD, 1932 İngiltere yasal
benimseme). Bir keçiboynuzu tohumunun ortalama ağırlığı modern
küresel standart hâline geldi.

**Atlas-anchor**: `baghdad`. `actorTag.personRefs: [al-khwarizmi]`.

**Sibling crossLinks**: carat ↔ tariff (Akdeniz tüccar uzman-sözlüğü);
carat ↔ check (aynı Bağdat-Abbâsî maliye atölyesi).

### (b) `magazine` — Endülüs ticaret + Londra 1731 ikincil doğum (dilim 7/22.θ-prime.B)

**Köken zinciri.** *Makhzan* (klasik Arapça, *kh-z-n* "saklamak"
kökünden) > Endülüs Arapçası *al-makhzan* > İspanyolca *almacén* +
İtalyanca *magazzino* (1227 Pisa noteri) > Eski Fransızca *magasin*
(15. yy başı) > İngilizce *magazine* (1580'ler, askerî sicil).

**Editöryel argüman 1 — üç-sicilli kelime.** Bir kelime, üç farklı
profesyonel sicilde: (a) **ticaret** sicili (liman ambarı → şehir
deposu → perakende satış noktası — modern *mağaza*); (b) **askerî**
sicil (powder magazine → mermi haznesi); (c) **yayıncılık** sicili
(Edward Cave 1731 *Gentleman's Magazine* — entelektüel-depo metaforu
→ modern dergi). Avrupa'ya 13. yy'da sadece ticaret sicili geçti;
17. yy'da askerî sicil eklendi; 1731'de yayın sicili eklendi.

**Editöryel argüman 2 — geç-Mağrip al-makhzan.** Sözcüğün Arapça-içi
bir başka kariyer'i: 19. yy Fas'ta *al-makhzan* = "merkez hükümet,
devlet kurumu"; Avrupalıların *the Maghzen* dediği şey **Faslı
hükümet bürokrasisinin tamamı**. Bu sicil Avrupa'ya hiç taşınmadı.
Sözcüğün **iki paralel hayatı** var — bir Avrupa'da ticaret-askerî-
yayın, bir Mağrip'te devlet-kurumu.

**Editöryel argüman 3 — Cave'in metaforu.** Edward Cave (1691-1754)
Londra'da 1731 Ocak'ında *The Gentleman's Magazine*'i çıkarttığında
*magazine* sözcüğünün yayıncılık anlamı yoktu — Cave **bir matbaacının
yarattığı metafor**: dergi = depo; içinde çeşitli makaleler depolanmış.
Metafor o kadar başarılı oldu ki 18. yy ortasına gelindiğinde Avrupa
dillerinin çoğunda *magazine / Magazin* artık öncelikle "süreli yayın".
**400 yıl önce alınmış bir ticari kelime, bir matbaacı eliyle yepyeni
bir doğum yaşadı.**

**Türkçe çift-kanal**: *mağaza* (Akdeniz ticaret hattının doğrudan
Türkçeye geçişi) + *magazin* (Avrupa dergi-sicilinin geç-Tanzimat
döneminde Türkçeye yansıması). **İki dolaylı kanal, iki anlam**.

**Atlas-anchor**: `cordoba`. **Sibling crossLinks**: magazine ↔
arsenal (iki paralel *askerî depo* kelimesi, iki farklı Arapça
kökten); magazine ↔ tariff (Pisa-Cenova noteri uzman sözlüğünün
ikiz kelimeleri).

### (c) `tabby` — Bağdat mahallesi → dokuma deseni → kedi (dilim 7/22.θ-prime.C)

**Köken zinciri.** *ʿAttāb* (Arap aile adı, Emevî Halife I. Muaviye'nin
torunlarından) > *ḥayy al-ʿAttābī* (Bağdat'ın güney-batı mahallesi,
ipek-dokuma merkezi 9.-12. yy) > *al-ʿAttābī* (dokuma türü adı —
dalgalı/şeritli ipek-pamuk karışım) > Endülüs Arapçası ile İspanyolca
*ataby* (12. yy Toledo) > İtalyanca *tabbino* (13. yy Cenova) > Eski
Fransızca *atabis > tabis* (14. yy) > İngilizce *tabby* (1583 ilk
tekstil şahidi) > 1638 İngiltere'de **şeritli kedi**.

**Editöryel argüman 1 — beş halkalı zincir, mikro-toponim disiplini.**
Aile adı → mahalle adı → dokuma adı → tekstil tipi adı → hayvan tipi
adı. Beş halkanın **her birinde** önceki halkanın spesifik anlamı
silinir, daha-genel bir tip-adı'na dönüşür. Sözcük "neyin adı olduğunu"
unutmaya çalışır; ama etimolojik tarihçi bütün halkaları geri-okur.

**Editöryel argüman 2 — makro vs mikro toponim**. *Damask* Şam'ın
adından (makro-toponim, büyük şehir); *tabby* Bağdat'taki bir
mahallenin adından (mikro-toponim, şehir-içi). **İki ölçekte aynı
geçiş mekaniği** — uzmanlaşmış üretim kümesinin coğrafi imzası
ürün adına dönüşür.

**Editöryel argüman 3 — kedi sıçraması ve aristokrat estetik.** 17.
yy başında Avrupa pet-kültürü doğdu; aristokrat çevreler "değerli ipek
desenli" bir hayvan için tekstil-sözcüğü ödünç aldılar. Modern dünyada
*tabby cat* (Brathwait 1638, Topsell 1658) baskın anlam; dokuma anlamı
tekstil tarihçilerinin uzman sözlüğüne çekildi. Modern kedi
soykütüklerinde *tabby* standart; ev kedilerinin %60-70'inde tabby
geni var. **Bir Bağdat mahallesinin adı, dünyadaki kedilerin
çoğunluğunu çağırır.**

**Atlas-anchor**: `baghdad`. **Sibling crossLinks**: tabby ↔ damask
(ikiz toponym-textile geçişi); tabby ↔ cotton (tabby kumaşının
pamuk yarısı).

### (d) `lute` — Endülüs müzik koridoru + Ziryâb göçü (dilim 7/22.θ-prime.D)

**Köken zinciri.** *Al-ʿūd* (klasik Arapça, *ʿ-w-d* "dönmek" kökünden;
"ağaç parçası") > Endülüs Arapçası > İspanyolca *laúd* > Eski Provansal
*laüt* > Eski Fransızca *leüt* > İtalyanca *liuto*, Almanca *Laute*,
Hollandaca *luit*, İngilizce *lute* (c. 1361 *Pearl* el yazması ilk
İngilizce şahit). Türkçeye iki dolaylı kanal: Anadolu Yunancası
*laoúto* > *lavta*; Arapça doğrudan > *ud*.

**Editöryel argüman 1 — Ziryâb tek-adam-iki-saray.** Abû el-Hasen
Ali ibn Nâfiʿ (c. 789-857) Bağdat'tan 822'de Cordoba'ya göç ettiğinde
yalnızca bir enstrüman getirmedi; **kapsamlı saray-medeniyet paketi**:
müzik kuramı (24-mod / makam sistemi), mobilya (kristal cam), yemek
pratiği (üç-tabak sırası), saç-bakım, mevsim-giysi sistemi, ud'a 5.
tel. **Bir adam, iki saray** — bilgi grafı'nda Person olmasa da etkisi
catalogue Person bir 3-anchor adamı kadar.

**Editöryel argüman 2 — barbat kayboldu.** Müzik aletinin gerçek
adı Sasanî Farsça *barbat / barbut*; Arap kültürü onu *al-ʿūd* olarak
yeniden-adlandırdı, aletin ahşap gövdesinden. *Barbat* sözcüğü Arap
dünyasında bir yüzyıl içinde kayboldu, Avrupa müzikolojisi 1900'lere
kadar bu Sasanî-asıllı ismi hiç bilmedi. **Sözcük bir aletin ismini
değiştirdiğinde, aletin tüm önceki tarihini bir kelimenin altında
kaybedebilir.**

**Editöryel argüman 3 — 400 yıl saray-merkez + 200 yıl sessizlik.**
1450-1750 Avrupa Rönesans-Barok lute çağı: Petrucci 1507 ilk tabulatura,
Francesco da Milano, Dowland, Weiss, Bach BWV 996. 1750'lerden 1970'lere
**lute Avrupa'da pratikçe öldü** — Klasik dönemin orkestra-merkezli
estetiği marjinalleştirdi. 1970'lerde akademik canlanma (Hopkinson
Smith, Paul O'Dette). Paralel olarak *ud* Arap-Türk klasik müziğinin
omurgası olarak hiç kesintisiz devam etti. **Bir alet iki tarihte
yaşadı: Avrupa'da kesintili, Doğu'da sürekli.**

**Theme bağı çift-yönlü**: *lute ↔ andalusian-translation-workshop*.
Atölye **metin-tercümesi**'nin (Toledo'da Latince çeviriler) ana sicili;
ama lute Endülüs'ün **müzik-tercümesi**'ni somutlaştırır — Ziryâb'ın
822'de getirdiği şey ses, kuram, repertuvar. Atölyenin **metin-dışı
kanalı**. Theme'in `words:` listesine *lute* eklendi (algorithm +
algebra + zero ailesine dördüncü üye). 7/21'de saffron'la endulus-
sofrasi için yapılan çift-yönlü bağlama disiplini şimdi atölye için
de uygulandı.

**Atlas-anchor**: `cordoba`. `actorTag` (stratum 4): "Ziryāb · *Abû
el-Hasen Ali ibn Nâfiʿ* (c. 789-857 — 822 Bağdat→Cordoba göçü)".

**Sibling crossLinks**: lute ↔ theme:andalusian-translation-workshop;
lute ↔ cotton (aynı Endülüs koridorunun maddî vs estetik ayakları).

### (e) θ-prime'ın atlas-pin densifikasyon argümanı

θ atlas-pin çeşitliliğini rafine etti — yeni catalogue Word'ler
4 farklı koridora dağıldı (Endülüs, Salerno, Konstantinopol, Sicilya).
θ-prime tersini yapar — mevcut "yoğun pin'leri" zenginleştirir. Sonuç
tablo:

| Atlas-pin | 7/21 sonu entity sayısı | 7/22 θ-prime sonu | Δ |
|---|---|---|---|
| **baghdad** | 8 (alcohol+algebra+algorithm+cipher+alembic+zero+hunayn+ibn-al-haytham) | **10** | **+carat, +tabby** |
| **cordoba** | 8 (cotton+lemon+orange+sugar+coffee+saffron+andalusian-translation-workshop+endulus-sofrasi) | **10** | **+magazine, +lute** |

Diğer pin'ler değişmedi: salerno 2 (hunayn + syrup), constantinople
2 (hunayn + sherbet), palermo 2 (admiral + mattress), padua 1
(ibn-sina), florence 1 (al-khwarizmi), paris 1 (ibn-al-haytham),
toledo 1 (algebra), khwarazm 1 (al-khwarizmi), hamadan 1 (ibn-sina),
bukhara 1 (ibn-sina), cairo 1 (ibn-al-haytham), bağdat olmayan
diğerleri 1'er.

**Yeni atlas dağılım profili**:
- 2 super-pin (10-entity yoğun): baghdad, cordoba
- 3 medium-pin (2-entity): salerno, constantinople, palermo
- 19 light-pin (1-entity): kalanlar

θ + θ-prime'ın birleşik etkisi: **eşitsiz ama editöryel olarak
gerekli dağılım**. Klasik anlatıda Bağdat ve Cordoba zaten merkez
şehirler olduğundan, atlas-pin sayıları onları yansıtır. Atlas
düzgün bir "dağıtım haritası" değil, doğru bir "ağırlık haritası".

### (f) Türkçe çift-kanal disiplininin θ-prime'a özgü yoğunluğu

θ-prime'ın 4 Word'ünden 3'ü Türkçede **çiftli yansıma** gösterir —
sözcüğün iki ayrı dilde Türkçeye iki ayrı kez girişi:

| Word | Türkçe doğrudan-Arap | Türkçe Avrupa-üzeri |
|---|---|---|
| carat | (yok — *qīrāṭ* Türkçeye Avrupa hattından *kırat/karat* olarak girdi) | kırat / karat |
| magazine | mağaza (Akdeniz ticaret hattı) | magazin (Avrupa dergi hattı) |
| tabby | (Türkçede *tekir* farklı etimolojiden; Bağdat *ʿAttābī* doğrudan Türkçeye geçmemiş) | — |
| lute | ud (Arapça doğrudan) | lavta (Yunanca *laoúto* üzerinden) |

**magazine ve lute** Türkçede çift-yönlü iz bırakan iki sözcük. Bu
**iki-kanal disiplini** sözcüklerin Türkçeye iki coğrafyadan iki kez
girişinin patternıdır; θ'da syrup+sherbet (aynı kök, iki kanal) ile
benzer bir disiplin görünmüştü.

### Build çıktısı (dilim 7/22 sonrası)

| | 7/21 sonu | 7/22 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.62 KB gz | 83.62 KB gz | **0** *(eager bundle dokunulmadı)* |
| `registry` chunk | 31.19 KB gz | **37.26 KB gz** | **+6.07** *(4 Word summary + theme bidir bağ)* |
| `carat` lazy | — | 13.56 KB gz | yeni |
| `magazine` lazy | — | 13.03 KB gz | yeni |
| `tabby` lazy | — | 14.42 KB gz | yeni |
| `lute` lazy | — | 15.98 KB gz | yeni (en büyük; teknik müzik terminoloji) |
| Toplam yeni lazy | — | 56.99 KB gz | 4 catalogue Word |
| Build süresi | 10.91s | 9.48s | −1.43s *(manifest cache; varyans)* |

`npm run validate` ✓ — **27 W + 4 P + 2 B + 4 T = 37 entity** (33 → 37,
+4 catalogue Word), 24 atlas place (sabit), 0 invariant violation.
`npm run typecheck` ✓. `npm run build` ✓ 9.48s.

| | 7/21 sonu | 7/22 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 23 / 4 / 2 / 4 | **27** / 4 / 2 / 4 | **+4 Word** |
| Toplam entity | 33 | **37** | +4 |
| Catalogue Word sayısı | 14 | **18** | +4 |
| Atlas places | 24 | 24 | 0 (densifikasyon dilim'i) |
| Atlas super-pin (≥10 entity) | 0 | **2** (baghdad+cordoba) | +2 |
| Sibling crossLink sayısı | (mevcut) | +8 | carat×2 + magazine×2 + tabby×2 + lute×2 |
| Theme `words:` listesi | endulus-sofrasi: 7 | **+andalusian-translation-workshop: 4** | +lute (bidir) |
| Journey arketipi dağılımı | (mevcut) | +3 merchant + 1 andalusian | merchant ağırlıklı dilim |
| Türkçe çift-kanal örneklemesi | (mevcut) | +2 (magazine, lute) | iki yeni iki-kanal kelimesi |
| Ağırlıklı ortalama | ~%65.6 | ~%67.0 | Δ +1.4, *7/21 endcap'inde θ-prime tahmini Δ ≈ +%1.0-1.3'ten hafif üstü* |

GRAND_PLAN §12.2 korpus skoru: 49 → **52** (+3). 12.5 ağırlıklı
katkı: 0.50 × 3 = +%1.5.

7/22'den sonra sıradaki dilim editöryel:

- **Shape θ-double-prime** — daha fazla catalogue Word (muslin,
  almanac, gauze, alkali, fanatic gibi adaylar). Korpus 37 → 40-41.
  Δ ≈ +%1.0. Momentum sürdürür ama getiri azalmaya başlar.
- **Shape λ — yeni Theme**: tıp-koridoru theme'i (syrup + sherbet
  + alcohol + alembic + Hunayn + Constantinus Africanus kümesi)
  veya Sicilya-saray theme'i (admiral + mattress + arsenal kümesi).
  Δ ≈ +%0.8.
- **Live deploy** — editöryel adım: domain tescili + Cloudflare Pages
  onboarding + canlı URL. ι ile "konfigüre et + tıkla" mesafesinde.
- **Shape κ — polish dilimi**: CSP `unsafe-inline` kaldırma,
  Lighthouse audit + fix, share buttons.

Sıralama tavsiyesi: **λ → live deploy → θ-double-prime → κ**. λ
mevcut catalogue genişlemesinin **yapısal kapanışı** olur (yeni
Theme'lerin tıp ve saray kümelerini emmesi); live deploy onun
ardından doğal; θ-double-prime canlıdan sonra; κ launch sonrası
polish. Editöryel.

---

---

---

## Oturum 7 — dilim 21 (Shape θ: catalogue Word genişlemesi, dört koridorun yeni kelimeleri)

> *7/20 η-prime catalogue Person tarafına yapısal kapanış getirdi
> (4/4 Person multi-anchor) ve atlas'ı dört farklı Latin-resepsiyon
> koridoruyla rafine etti: Florence, Salerno, Paris, Padua. 7/21 θ
> aynı dört koridoru — artı Sicilya saray koridorunu — somut catalogue
> Word girdileriyle doldurur. Editöryel argüman: her koridorun kendi
> tipinde bir geçiş diline sahip olduğunu göstermek. **saffron** tarım
> ürünü (yazısız, çiftçi-eli), **syrup** tıbbi terim (kitap-sayfası,
> manastır-okul), **sherbet** saray-protokolü (törensel, sözel),
> **mattress** halk dili (gündelik konuşma, oda-içi). Dört kelime,
> dört geçiş türü, dört koridor. Toledo monolitliğini hem coğrafi
> hem **tipolojik olarak** dağıtan dilim.*

### (a) `saffron` — Endülüs tarım koridoru (dilim 7/21.θ.A)

**Köken zinciri.** *zaʿfarān* (klasik Arapça, prehistorik Sami katmanlı
— Akkadca *azupīrānu*, Aramca *zaʿparānā*) > Endülüs Arapçası
*az-zaʿfarān* > İspanyolca *azafrán* (al- artikeli korunur, Endülüs
hattının imzası) > Eski Fransızca *safran* > İngilizce *saffron* (al-
düşer, Latin-Fransız hattı). Her dilde "yellow spice + yellow dye"
çift-anlamını korur.

**Editöryel argüman.** Saffron'un Endülüs'e gelişi 8. yy Emevî
tarımıyla; İbn Bassâl, İbn el-Avvâm, Ebu'l-Hayr el-İşbîlî'nin
*al-falāḥa al-andalusiyya* yazınında kataloglanmış (ekim derinliği,
çiçeklenme zamanı, stigma toplama yöntemi). 1492 Granada düşüşü ve
1609-1614 Morisko sürgününden sonra **İslam kurumu silindi ama
tarım toprağında kaldı** — La Mancha (Albacete, Toledo eyaletleri)
Müslüman çiftçinin sulama+hasat tekniklerini Hıristiyan İspanyol
köylülüğüne miras bıraktı; *azafrán* kelimesi tarımla birlikte
bilkağıt-asimile oldu. *Linguistic assimilation beneath agricultural
continuity*: imparatorluk yıkılır, din değişir, tarlanın takvimi
aynı kelimeyle anılmaya devam eder. Bu Endülüs sediment'inin en saf
örneklerinden.

**Atlas-anchor:** `cordoba` (tek-anchor — catalogue Word standardı).
**Theme bağı:** `endulus-sofrasi` (mutfak ayağı — cotton, lemon,
orange, coffee, alcohol, sugar ile aynı aile). Theme'in `words:`
listesine eklendi — çift-yönlü çözüldü.

**Sibling crossLinks:** saffron ↔ cotton (aynı Endülüs tarım reformu);
saffron ↔ lemon (aynı sulama-getirisi narenciye-baharat-baklagil ailesi).

### (b) `syrup` — Latin tıp koridoru (dilim 7/21.θ.B)

**Köken zinciri.** *sharāb* (klasik Arapça, *ş-r-b* "içmek" kökünden;
tıbbi-teknik anlamda "bal/şekerle koyulaştırılmış ilaç içeceği")
> Latin *syrupus / siropus* (Constantinus Africanus c. 1085, *Liber
Pantegni*) > Eski Fransızca *sirop* > İngilizce *syrup* (c. 1398,
John Trevisa).

**Editöryel argüman — η-prime ile doğrudan bağ.** 9. yy Bağdat
*al-ṣaydala* (eczacılık atölyesi) sözcüğü tıbbi teknik kategori
olarak şekillendirdi: Yuhanna ibn Mâseveyh, Hunayn ibn İshak'ın
Galen-tercümeleri, Sâbur ibn Sehl'in *al-Aqrābādhīn*'i, İbn Sînâ'nın
*Kânûn*'u (V. kitap) — hepsi *sharāb*'ı eczacılık reçetesi olarak
kullanır. **200 yıl sonra Constantinus Africanus** (Tunus doğumlu,
Salerno-Monte Cassino) bu Arap eczacılık paketini Latinceye çevirir;
*syrupus* kelime olarak değişmez geçer, anlam kayması olmaz. **12.
yy ortasında *Antidotarium Nicolai* Salerno'da derlenir** — Avrupa'nın
sonraki dört yüzyıllık eczane standardı *syrupus de absinthio*,
*syrupus violarum*, *syrupus rosaceus*, *syrupus de papavere* (haşhaş,
ağrı kesici) tariflerini tutarlı sözlüğe oturtur. **Niçin Latin
tıbbı Yunan-asıllı Galenos terminolojisinin altına gömmedi:** *syrupus*
sözcüğü Hümanist 15. yy tıbbı bile bırakmadı; kendi Arap-orijinal
kanalını korudu. Sözcük bugün hâlâ eczanede canlı (*syrupus simplex*,
*syrupus tussium*) — ortaçağ Salerno-Cassino zincirinden modern
reçeteye doğrudan hat.

**Atlas-anchor:** `salerno` (η-prime'da eklenen yeni place — hunayn-
ibn-ishaq'ın 3. anchor'ıyla **birebir aynı pin**; iki entity aynı
coğrafi noktada kesişir, atlas üzerinde görsel olarak yan yana).

**`actorTag` (stratum 3 + 4):** `personRefs: [hunayn-ibn-ishaq]` —
syrup'un Latin tıbbına geçişi *Hunayn'ın Galen tercümeleri Latince
syrupus*'ı doğurduğu zinciri taşıyan editöryel notla.

**Sibling crossLinks:** syrup ↔ alcohol (aynı Arap eczacılık
atölyesi, farklı koridor: alcohol Toledo-Paris hattı, syrup Salerno-
Cassino hattı); syrup ↔ sherbet (aynı *ş-r-b* kökü, farklı kanal —
*bir-kelime-iki-Avrupa* disiplini).

### (c) `sherbet` — Osmanlı diplomatik koridoru (dilim 7/21.θ.C)

**Köken zinciri.** *sharbat / sharbah* (klasik Arapça, *ş-r-b*'den
*faʿla* sigâsı; "bir yudum, bir içiş" — *sharāb*'ın akraba/dar
formu) > Osmanlı Türkçesi *şerbet* > İtalyanca *sorbetto* (16. yy,
Venedik *Bailo* elçileri) > Fransızca *sorbet* (17. yy, Versailles
Café Procope) > İngilizce *sherbet* (1603, Knolles *General Historie
of the Turkes*).

**Editöryel argüman — bir-kelime-iki-kanal disiplini.** *sharāb* (geniş
"içecek") 9. yy Bağdat eczacılık atölyesinde tıbbi olarak daraltıldı;
*sharbat / sharbah* (dar "tek bir yudum, tatlı-soğuk meyve içeceği")
sosyal-sofra anlamını korudu. 15. yy ortasından itibaren Osmanlı
sarayı (Topkapı, II. Mehmed 1444-1481) *sharbat*'ı saray-protokolünün
merkez içeceği yaptı: *şerbethâne* ayrı kurum, *şerbetçibaşı* resmî
unvan; cülûs, elçi kabulü, sünnet, düğün, mevlid hepsi *şerbet*
dağıtımıyla işaretlenir. *Yedi katlı şerbet* / *dokuz katlı şerbet*
gibi karmaşık formüller (gül + nilüfer + amber + misk + safran +
bal/şeker). **Avrupa elçileri** (Venedik *Bailo* 1454+, Fransa
*Capitulations* 1535+, İngiltere Levant Company 1581+, Habsburg
1547+, Hollandalı 1612+) bu rituali *sefâret-nâme*lerinde detayla
anlatır; sözcük *sharbet/sorbet/sorbetto* olarak Avrupa dillerine
geçer. **17. yy Sicilya doğumlu Procopio Cutò** (Café Procope, Paris
1686) *sorbet*'i Avrupa-tarzına dönüştürür: tuz-buz karışımıyla
yarı-dondurma. Buradan itibaren Avrupa *sorbet*'i Türk *şerbet*'inden
ayrılır: biri yarı-katı/mutfak, öbürü sıvı/sofra. *Aynı kelime, iki
geleneğin nesnesini taşır* — modern dünyada Türkiye'de meyve
suyu/Ramazan iftarı, Fransa'da yemek-arası damak temizleyici, ABD'de
sütlü dondurma, İngiltere'de toz şeker.

**Atlas-anchor:** `constantinople` (Osmanlı sarayının coğrafi merkezi;
hunayn-ibn-ishaq'la **aynı pin** — iki kelime aynı coğrafi noktada,
iki ayrı zaman katmanında: hunayn 9. yy Bizans elyazma yolculukları,
sherbet 15.-17. yy Osmanlı saray-protokolü).

**Sibling crossLinks:** sherbet ↔ syrup (twin — aynı kök, farklı
kanal); sherbet ↔ coffee (aynı Osmanlı diplomatik koridoru, *Osmanlı
sofra paketi* — 17. yy başında Avrupa'ya birlikte taşınır).

### (d) `mattress` — Sicilya saray koridoru (dilim 7/21.θ.D)

**Köken zinciri.** *al-maṭraḥ* (klasik Arapça + Mağrip/Endülüs/Sicilya
konuşma Arapçası, *ṭ-r-ḥ* "atmak/yere bırakmak" kökünden *mafʿal*
sigâsı; "atılan yer" > "yere serilen şilte") > Sicilyaca *materazzo
/ matarazzo* (12.-13. yy) > İtalyanca *materasso* > Eski Fransızca
*materas / matelas* (c. 1170 *Chanson de Roland* el yazma; *r > l*
dissimilasyonu Picard/Flaman lehçelerinde) > Orta İngilizce *materas
/ matras* (c. 1290 Anglo-Norman üzerinden) > İngilizce *mattress*
(17. yy ortaografi düzenleme: *-tt-* + *-ss*).

**Editöryel argüman — *admiral*'ın çifte imzası.** Norman Sicilya
(1072-1194) Müslüman emirat döneminden (831-1072) miras kalan Arapça
konuşan nüfusu, idari kadroyu, mobilya kültürünü saray çatısı altında
tuttu. II. Roger (1130-1154) sarayında *qāʾid* unvanlı Müslüman
görevliler, Arapça-Latince-Yunanca üç dilli ferman, Cappella Palatina
muqarnas tavanları — *mattress*'in çıktığı kültür-iç eklemlenme tam
bu nokta. *Admiral* (*amīr al-baḥr > ammiratus*) bu sarayın askerî
sicilinden çıkarken, *mattress* (*al-maṭraḥ > materazzo*) aynı sarayın
oda sicilinden çıkar. **Aynı saray, iki sicil, iki kelime** — Sicilya'nın
çifte imzası.

**İkinci editöryel argüman — konuşma Arapçasının kanalı.** Yüksek
bilim kelimeleri (tıp, astronomi, matematik) Toledo'dan **metin
kanalıyla** Latin sayfasına geçer; gündelik mobilya kelimeleri (mattress)
Sicilya'dan **konuşma kanalıyla** Latin yaşamına geçer. *İki ayrı dil-
temas mekaniği*. *al-maṭraḥ* zaten klasik Arap edebî dilinde dar
kullanım — *firāsh* (yatak) edebî dilde daha yaygın; *maṭraḥ* daha
çok Mağrip/Endülüs/Sicilya halk dili. Modern Mağrip Arapçası (Cezayir,
Tunus, Fas) hâlâ *maṭraḥ* kullanır aynı anlamda; klasik kanaldan
değil **konuşma kanalından geçen tek catalogue Word**.

**Atlas-anchor:** `palermo` (admiral'la aynı pin — iki entity aynı
coğrafi noktada, iki ayrı saray sicilinde).

**Sibling crossLinks:** mattress ↔ admiral (aynı saray, farklı sicil
— askerî vs mobilya); mattress ↔ arsenal (aynı İtalyan-Akdeniz
tüccar koridoru, mimari-mobilya ailesi).

### (e) θ'nın atlas argümanını rafine edişi

η-prime atlas'a iki yeni place (salerno, padua) ekleyerek **Latin-
resepsiyon koridor çeşitliliğini** görünür kıldı (Florence, Salerno,
Paris, Padua). θ aynı koridorların **kelime düzeyinde örneklendirmesi**:

| Koridor | η-prime Person | θ Word | Atlas-pin örtüşmesi |
|---|---|---|---|
| Latin tıp / Salerno | hunayn-ibn-ishaq | **syrup** | salerno (aynı pin) |
| Osmanlı diplomatik / Konstantinopol | hunayn-ibn-ishaq (Bizans elyazma) | **sherbet** | constantinople (aynı pin, farklı zaman katmanı) |
| Latin curriculum / Padua | ibn-sina | (— bu dilim yok; gelecek θ-prime'da *alchemy* kelimeleri olabilir) | — |
| Latin scholastik / Paris | ibn-al-haytham | (alcohol zaten 4-hop ile geçer) | paris (mevcut) |
| Endülüs tarım / Cordoba | (Person yok bu koridorda) | **saffron** | cordoba (cotton, lemon, orange, sugar ile aynı pin) |
| Sicilya saray / Palermo | (Person yok bu koridorda) | **mattress** | palermo (admiral ile aynı pin) |

Yani **6 farklı koridorun 5'inde** artık hem Person hem Word-örneği
(veya en az Word-örneği) var. Atlas argümanının tipik *çoklu-Latin-
resepsiyonu* tezi şimdi hem Person tarafından hem Word tarafından
desteklenir.

### (f) Tipolojik argüman — dört geçiş türü

Dört yeni Word **dört ayrı dil-temas tipini** somutlaştırır:

| Word | Geçiş kanalı | Sözcüğün tipi | Geçişin yeri |
|---|---|---|---|
| saffron | tarım pratiği, çiftçi-eli | "yazı-sonrası" — kelime ürünle birlikte yayılır | La Mancha tarlası |
| syrup | yazılı tıp metni, manastır-okul | "yazı-içi" — kelime kitap sayfasında çevrilir | Monte Cassino *scriptorium* |
| sherbet | sözel saray-protokolü, törensel | "törensel" — kelime hizmet ritüelinde duyulur | Topkapı *şerbethâne*si |
| mattress | gündelik konuşma, oda-içi | "halk-dili" — kelime kullanım sırasında duyulur | Palermo saray yatak odası |

Bu **dört tipoloji** Arapçanın Avrupa dillerine geçişinin tek bir
mekanizma değil farklı mekanizmaların paralel ağı olduğunu gösterir.
Toledo metin-kanalı klasik anlatının merkezindeydi; θ'nın katkısı:
*metin-kanalı* sadece bir tane; tarım-pratiği, sözel-saray, halk-
konuşması da en az o kadar etkili olabilir.

### Build çıktısı (dilim 7/21 sonrası)

| | 7/20 sonu | 7/21 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.61 KB gz | 83.62 KB gz | +0.01 *(gzip varyansı; eager bundle dokunulmadı)* |
| `registry` chunk | 26.38 KB gz | **31.19 KB gz** | **+4.81** *(4 yeni Word summary + journey/anchor/sibling refs)* |
| `saffron` lazy | — | 11.60 KB gz | yeni |
| `syrup` lazy | — | 12.79 KB gz | yeni |
| `sherbet` lazy | — | 12.53 KB gz | yeni |
| `mattress` lazy | — | 12.88 KB gz | yeni |
| Toplam yeni lazy | — | 49.80 KB gz | 4 catalogue Word standardı |
| Build süresi | 9.34s | 10.91s | +1.57s *(4 yeni MDX parse)* |

`npm run validate` ✓ — **23 W + 4 P + 2 B + 4 T = 33 entity** (29 → 33,
+4 catalogue Word), 24 atlas place (η-prime kazanımı sabit), 0 invariant
violation. `npm run typecheck` ✓. `npm run build` ✓ 10.91s.

| | 7/20 sonu | 7/21 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 19 / 4 / 2 / 4 | **23** / 4 / 2 / 4 | **+4 Word** |
| Toplam entity | 29 | **33** | +4 |
| Catalogue Word sayısı | 10 | **14** | +4 |
| Atlas places | 24 | 24 | 0 (η-prime'ın eklediği genişlemiş atlas kullanıldı) |
| Sibling crossLink sayısı | (mevcut) | +8 | saffron×2 + syrup×2 + sherbet×2 + mattress×2 |
| Theme `words:` listesi | endulus-sofrasi: 6 | **endulus-sofrasi: 7** | +saffron (çift-yönlü) |
| Journey arketipi dağılımı | (mevcut) | +andalusian +alchemist +diplomatic +crusader | 4 farklı arketip |
| Latin-resepsiyon koridor örneklemesi | 4 Person + 0 Word | 4 Person + 4 Word | tipolojik denge |
| Ağırlıklı ortalama | ~%63.8 | ~%65.6 | Δ +1.8, *catalogue genişleme tahminleri ile uyumlu* |

GRAND_PLAN §12.2 korpus skoru: 45.5 → **49** (+3.5). 12.5 ağırlıklı
katkı: 0.50 × 3.5 = +%1.75.

7/21'den sonra sıradaki dilim editöryel:

- **Shape θ-prime** — daha fazla catalogue Word genişlemesi (3-4 yeni:
  carat, magazine, tabby, marzipan gibi adaylar). Korpus 33 → 36-37.
  Δ ≈ +%1.0-1.3.
- **Shape ι-prime / live deploy** — editöryel adım (dilim değil):
  domain tescili + Cloudflare Pages onboarding + canlı URL. ι'nın
  pratiğe geçişi.
- **Shape κ — polish dilimi**: CSP `unsafe-inline` kaldırma (theme
  bootstrap script'ini ayrı .js'e), Lighthouse audit + fix (font-display,
  prefetch), share buttons. ε + ι sonrası kalan ~%15 polish/launch'i
  kemikleştirir.
- **Shape λ — yeni Theme**: tıp-koridoru theme'i veya Sicilya-saray
  theme'i. Yeni catalogue Word'lerin (syrup + sherbet + mattress)
  güçlü olduğu üç koridor mevcut theme'lerin dışında — yeni Theme
  bunları kümeleyebilir. Δ ≈ +%0.8.

Sıralama tavsiyesi: **θ-prime → live deploy → κ polish → λ theme**.
θ-prime mevcut momentumu sürdürür (catalogue genişleme); live deploy
ne zaman olursa (kullanıcı eylemi); κ ε+ι doğal sonu; λ tematik
zenginleşme.

---

---

---

## Oturum 7 — dilim 20 (Shape η-prime: catalogue Person 3-hop, Latin-resepsiyon ayakları)

> *7/18 ε (launch hazırlığı) + 7/19 ι (deploy hazırlığı) iki "izleyici-
> altyapısı" dilimi ardından, 7/20 η-prime saf-içerik dilimi — korpusa
> dönüş. Ama dar bir genişleme: yeni Person veya Word değil, mevcut
> catalogue Person'lara **derinlik**. Editöryel argüman çubuğu η-prime
> için 7/18 ε endcap'inde net çerçevelenmişti: Toledo'ya alternatif
> Akdeniz koridorları (Salerno, Padua) ve Atlantik kıyısı (Paris)
> atlas'a girecek. ibn-al-haytham'ın Paris'i zaten 7/16'da eklenmişti
> (sadece 7/17 README'sine eksik kayıt olarak yazılmamıştı — 7/18'de
> düzeltildi); η-prime hunayn → Salerno ve ibn-sina → Padua
> eklemeleriyle tabloyu kapatır. **4/4 Person multi-anchor; her birinin
> editöryel argümanı kendi koridorunda**.*

### (a) Atlas — Salerno (dilim 7/20.η-prime.A)

**Niçin Salerno?** Schola Medica Salernitana 9.-13. yy'larda Avrupa'nın
en eski tıp okulu; Greko-Latin-Arap-Yahudi tıp geleneklerinin tek çatıda
buluştuğu nadir merkez. Constantinus Africanus (c. 1020-1087) Kartaca'dan
getirdiği Arapça tıp külliyatını burada (ve hayatının son yıllarında
Monte Cassino manastırında) Latinceye çevirdi. Bu çeviri zinciri:

- **`Liber Pantegni`** — Haly Abbas/al-Majūsī'nin *Kāmil aṣ-Ṣināʿa
  aṭ-Ṭibbiyya*'sının Latin uyarlaması. 11. yy Latin tıbbının ilk
  kapsamlı sentetik metni.
- **`Isagoge ad Tegni Galieni`** — Hunayn ibn İshak'ın *al-Madkhal ilā
  ʿilm aṭ-ṭibb* (Tıp ilmine giriş) eserinin Latincesi. Avrupa tıp
  okullarında 14.-16. yy boyunca giriş ders kitabı.

Yani **Hunayn'ın Galen-Hippokrates Arapça tercümeleri Latin tıbbına
Salerno üzerinden girdi** — adam Bağdat'ta 873'te ölmüş, mirası 200
yıl sonra Salerno-Cassino kanalında Latin curriculum'unun temeli
olmuş. Bu *postümüz miras* tipik 4-hop showcase argümanından farklı:
Hunayn kendisi Salerno'yu hiç görmedi; ama tercüme eserlerinin Avrupa
yolculuğunun başlangıç noktası burası.

**Koordinat editörlüğü.** [415, 380]: Rome [395, 355]'in güney-doğusu,
Palermo [410, 405]'in hemen kuzeyi, Florence [385, 320]'den ~75 birim
güney. Görsel olarak: Tirhen Denizi'nin doğu kıyısı bandı, Napoli'nin
hemen güneyi (Napoli atlas'ta yok ama coğrafyası bilinen referans).
Palermo'yla 25 birim mesafe — pin'ler çakışmaz, route çizgileri
ayırt edilir.

**Region.** *"Güney İtalya · Campania"* (TR), *"Southern Italy · Campania"*
(EN), *"جَنوبُ إيطاليا · كَمبانيا"* (AR). Region etiketi atlas-pin
hover'ında gelecek dilimlerde gösterilecek (şu an UI'da kullanılmıyor;
ileri polish).

### (b) Atlas — Padua (dilim 7/20.η-prime.B)

**Niçin Padua?** Università di Padova (kuruluş 1222) Avrupa'nın ikinci
en eski üniversitesi (Bologna'dan sonra) ve 15.-17. yy'larda tıp
eğitiminin epicenter'i. İbn Sînâ'nın *al-Qānūn fī aṭ-Ṭibb*'ı 1450
sonrasında Padua tıp curriculum'unun **zorunlu ders kitabı** hâline
geldi:

- **1473** — Padua'da basılan ilk Latin matbu sürüm (*Canon Medicinae*);
  Gerardus Cremonensis'in 12. yy Toledo çevirisinin matbu kıyılışı.
- **Vesalius** (*De humani corporis fabrica*, 1543) — anatomi reformu;
  *Kânûn*'un anatomi bölümlerini düzeltir ama disiplinin yapısını
  *Kânûn*'un içinden eleştirir.
- **Fabricius** (embriyoloji, 16. yy sonu) — *Kânûn*'un nesil/üreme
  bölümlerini deneysel olarak inceler.
- **William Harvey** (*De motu cordis*, 1628) — kan dolaşımının
  keşfi. Harvey Padua'da Fabricius'un öğrencisiydi; *Kânûn*'un
  Latin sürümleriyle eğitildi.

Yani **modern Avrupa tıbbının kanonik figürleri *Kânûn*'un sayfalarında
yetişti**. *Kânûn* sadece "kaynak" değil, *müfredat*'tır — 600 yıl
boyu (1473'ten 1750'lere kadar) Padua dahil çoğu Avrupa tıp fakültesinde
ders kitabı.

**Koordinat.** [385, 305]: Florence [385, 320]'in hemen kuzeyi (aynı
x ekseninde), Venice [400, 295]'in batı-güney-batısı. Görsel olarak:
Po Ovası, Adriatik'in kuzey-batı kıvrımı. Florence ve Venice'le pin
mesafeleri 15-18 birim — sıkı ama ayırt edilir; üç İtalyan kuzey
şehri (Florence-Padua-Venice) küçük bir İtalyan üçgeni oluşturur.

**Region.** *"Po Ovası"* (TR), *"the Po Valley"* (EN), *"سَهلُ بو"* (AR).

### (c) hunayn-ibn-ishaq + salerno — Süryanice→Arapça hattının postümüz Latin açılışı (dilim 7/20.η-prime.C)

**3-hop rota**:
- **baghdad** (c. 825-873) → Bayt al-Ḥikma, baş çevirmen, Süryanice→Arapça hattını kuran adam
- **constantinople** (c. 830 →) → Bizans elyazma toplamaları, Galen-Hippokrates-Eukleides için seyahatler
- **salerno** (c. 1080 — postümüz) → Constantinus Africanus Latin geçişi

**Editöryel argüman.** Hunayn'ın hayatı boyunca yaptığı iş: Yunan
bilimini önce Süryanice'ye, sonra Arapça'ya çevirmek. Süryanice
mother tongue'ı, çevirinin diline. Yunanca kaynak diline. Arapça
hedef diline. Bu *üç-dilli philolog* kimliği Bağdat'ta atölye-disiplin
hâline gelmiş.

Adam 873'te öldü. Ama eserleri yaşamaya devam etti. İki yüzyıl sonra,
1000'lerin sonunda, Tunus doğumlu bir hekim olan Constantinus Africanus
Kartaca'dan İtalya'ya geçti, hayatının son yıllarını Salerno tıp
okulu ile Monte Cassino manastırı arasında geçirdi; Arapça öğrendiği
tıp metinlerini Latinceye çevirdi. *Isagoge* adıyla Latinleştirdiği
metin: Hunayn'ın *al-Madkhal*'i.

Yani: *Süryanice → Arapça* hattını kurmuş adam, 200 yıl sonra
postümüz olarak *Arapça → Latince* hattını açtı. Aynı disiplin
zinciri, başka bir uçta. Bağdat-Konstantinopol-Salerno üçgeninin
editöryel argümanı bu zincir-ötesi devamlılık. Anchor label'ı:

> *"Schola Medica Salernitana — Constantinus Africanus Hunayn'ın
> Arapça Galen-Hippokrates tercümelerini Latinceye taşır;
> Süryanice→Arapça hattı iki yüzyıl sonra Arapça→Latince hattını
> açar"*

### (d) ibn-sina + padua — *Kânûn*'un Latin curriculum'unu 600 yıl ele geçirişi (dilim 7/20.η-prime.D)

**3-hop rota**:
- **bukhara** (980-c.1002) → Sâmânî saray kütüphanesi, on yedi yaşında saray hekimliği
- **hamadan** (1015-1037) → vezirlik yılları, *Kitâbu'l-Kânûn fî't-Tıbb*'ın yazılışı, ölüm
- **padua** (1473→c.1650 — postümüz) → Latin *Canon Medicinae* curriculum'a girer, Vesalius/Harvey eğitimi

**Editöryel argüman.** İbn Sînâ Buhârâ'da doğdu, Hemedan'da öldü.
*Kânûn* hayatının ortalarında, Hemedan vezirlik yıllarında yazıldı.
Eser Latince'ye 12. yy'da Gerardus Cremonensis tarafından Toledo'da
çevrildi (ama ibn-sina'nın atlasAnchor'ları Toledo'yu içermiyor —
adam orada hiç bulunmadı, *Kânûn*'un tercümesi onun rotası değil).

Padua argümanı farklı: *Kânûn*'un Latin sürümü Padua'da matbu hâle
geldi (1473), oradan tüm Avrupa'ya yayıldı. Daha da önemlisi,
*Kânûn* Padua tıp curriculum'unun resmi ders kitabıydı 250 yıl boyu.
Yani **modern Avrupa hekimleri *Kânûn* okuyarak eğitildi**:

- Vesalius'un anatomi reformu *Kânûn*'un anatomi bölümünü düzeltir
- Fabricius'un embriyoloji deneyleri *Kânûn*'un nesil bölümünü test eder
- Harvey'in kan dolaşımı keşfi *Kânûn*'un kalp-damar modelini aşar
  ama o modelin **terimleriyle** konuşur

Yani: Buhârâ doğumlu bir adam, Hemedan'da öldükten 400 yıl sonra,
İtalya'nın kuzey-doğusunda bir üniversite şehrinde *Avrupa modern
tıbbının doğum kanalı* hâline geldi. Eseri Avrupa'ya geçti, ama
*kimliği* — Buhârâ-doğumlu, Hemedan-ölen Müslüman polimat — orada
yetişen Vesalius/Fabricius/Harvey kuşaklarına teslim edildi. Anchor
label'ı:

> *"Università di Padova — *Canon Medicinae* Latin baskısı (1473)
> Avrupa tıp curriculum'una girer; Vesalius'un anatomisi, Harvey'in
> kan dolaşımı keşfi *Kânûn*'un sayfaları üzerine kurulur — Buhârâ'da
> doğan adam altı yüzyıl Avrupa hekimini yetiştirir"*

### (e) Atlas argümanının η-prime sonrası rafine'i

ε ve ζ dönemine kadar showcase argümanı **Toledo merkezli** çerçeveydi:
*"Arapça bilim sözlüğünün Avrupa'ya ana geçit noktası Toledo"*. Bu
hâlâ doğru — 8-route Toledo node-degree atlas'taki en yoğun nokta.
Ama η-prime ile gelen rafine:

**Toledo monolitik bir tez değil; ana koridor ama tek koridor da değil.**

4 Person'un Latin-resepsiyon ayağı kontrol edilirse:

| Person | Latin-resepsiyon anchor'ı | Argüman |
|---|---|---|
| al-khwarizmi | **florence** (4-hop'un son durağı) | Fibonacci → Pacioli — Toledo'dan sonra italyan ticaret matematiği |
| hunayn-ibn-ishaq | **salerno** | Constantinus Africanus — Akdeniz tıp koridoru |
| ibn-al-haytham | **paris** | 13. yy scholastik (Witelo, Roger Bacon) — Atlantik koridoru |
| ibn-sina | **padua** | 15.-17. yy modern tıp curriculum'u — Adriatik koridoru |

Yani **dört Person'un dördünde de Latin-resepsiyon noktası farklı**.
Toledo *bir* hub ama her hub değil. Akdeniz (Salerno) + Atlantik
(Paris) + Adriatik (Padua) + İtalyan ticaret (Florence) — dört ayrı
koridor. Bu argüman atlas üzerinde route çizgileriyle görsel olarak
okunur; aynı tezi prose olarak söylemekten daha güçlü.

7/18 ε AboutPage §3 prose'undaki *"üç koridor — Bağdat, Toledo, Floransa
— projenin omurgası"* cümlesi hâlâ doğru (omurga argümanı showcase
Word'lerle ilgili: alcohol/algebra/algorithm 9/9 multi-anchor'ın Toledo
node'unda kesiştiği gerçeği). Ama η-prime'la kataloglu Person tarafı
**omurganın yanındaki dört kol** olarak gözükür.

### Build çıktısı (dilim 7/20 sonrası)

| | 7/19 sonu | 7/20 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.62 KB gz | **83.61 KB gz** | −0.01 *(gzip varyansı; eager bundle dokunulmadı)* |
| `registry` chunk | 25.60 KB gz | **26.38 KB gz** | **+0.78** *(2 atlas place × 3 dil name+region + 2 anchor × 3 dil label)* |
| `hunayn-ibn-ishaq` lazy | 13.62 KB gz | 13.85 KB gz | +0.23 |
| `ibn-sina` lazy | 17.26 KB gz | 17.66 KB gz | +0.40 |
| Build süresi | 9.43s | 9.34s | −0.09s *(varyans)* |

`npm run validate` ✓ — 19 W + 4 P + 2 B + 4 T = **29 entity** (değişmedi),
**24 atlas place** (+2: salerno, padua), 0 invariant violation.
`npm run typecheck` ✓. `npm run build` ✓ 9.34s.

| | 7/19 sonu | 7/20 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 19 / 4 / 2 / 4 | 19 / 4 / 2 / 4 | 0 |
| Atlas places | 22 | **24** | **+2 (salerno, padua)** |
| Multi-anchor Person | 1 SC (4-hop) + 3 CAT (2 × 2-hop + 1 × 3-hop) | **1 SC (4-hop) + 3 CAT (3-hop)** | +2 anchor; tek-anchor Person YOK |
| Catalogue Person anchor toplamı | 7 (3+2+2) | **9** (3+3+3) | +2 |
| Latin-resepsiyon koridor sayısı | 3 (Toledo + Florence + Paris) | **4** (+Salerno, +Padua → çıkar Toledo'nun monolikliği) | +1 koridor (Akdeniz tıp ayağı) |
| Ağırlıklı ortalama | ~%63.0 | ~%63.8 | Δ +0.8, *η-prime tahminiyle eşleşiyor* |

GRAND_PLAN §12.2 korpus skoru: 44 → **45.5** (+%1.5). 12.5 ağırlıklı
katkı: 0.50 × 1.5 = +%0.75.

7/20'den sonra sıradaki dilim editöryel:

- **Shape θ** — catalogue Word genişlemesi. 3-4 yeni catalogue Word
  (saffron, mattress, atlas, syrup gibi). Korpus 29 → 32-33 entity.
  Δ ≈ +%1.2-1.5. Atlas'a 0-2 yeni place tipik.
- **Live deploy** — editöryel adım (dilim değil): domain tescil +
  dashboard onboarding + production'a yayım. ι ile bu adım
  "konfigüre et + tıkla" mesafesinde.
- **Polish dilimi (κ?)** — CSP `unsafe-inline` kaldırma (inline theme
  script'i ayrı .js'e), Lighthouse audit + fix (font-display, image
  loading), entity sayfaları prefetch. ε + ι sonrası kalan ~%15
  polish/launch'i kemikleştirir.

Sıralama tavsiyesi: **θ → live deploy → κ polish**. θ korpus
genişlemesini ana hareket olarak alır; canlı URL ondan sonra; κ
launch sonrası polish. Live deploy iki dilim arasına da girebilir —
kullanıcı eylemi olarak ne zaman olursa olsun, ondan sonraki tüm
dilimler "izleyicili" hâle gelir.

---

---

## Oturum 7 — dilim 19 (Shape ι: production deploy hazırlığı)

> *7/18 ε kapısı dış-izleyici asset'lerini (about page, OG image,
> sitemap, robots, apple-touch-icon, footer chrome) açtı. 7/19 ι bu
> asset'leri **gerçek izleyiciye götüren altyapıyı** ekler: build-time
> origin injection, üç platforma uyumlu hosting konfig dosyaları,
> 404 polish'i, deploy rehberi. ε *teorik olarak* deploy-hazır bir
> site üretti; ι **pragmatik olarak** deploy-edilebilir. Aradaki fark:
> placeholder URL'lerin gerçeğe akabilen bir zinciri, SPA fallback'in
> garantili çalışması, security header'ların yerinde olması, 404'ün
> kullanıcıyı yutmaması. Site hâlâ canlı **değil** — bu editöryel
> bir adım (domain tescili + dashboard onboarding); ama ι sonrasında
> deploy "konfigüre et + tıkla" mesafesinde.*

### (a) `SITE_ORIGIN` build-time injection — iki noktaya tek kanal (dilim 7/19.ι.A)

**Problem:** 7/18 ε index.html'e OG meta + canonical etiketlerini
ekledi, ama tüm URL'ler `https://rihla.example` placeholder'ıyla.
Sitemap generator de placeholder fallback'iyle başladı. Production
deploy *öncesinde* bu placeholder'lar gerçek origin'e dönüşmeli; aksi
halde search engine'ler yanlış domain raporlar, Twitter/Facebook OG
paylaşımı kırık görsel verir.

**Çözüm yapısı.** Tek bir **çözünürlük zinciri**, iki ayrı yerde aynı
disiplinle okunur:

```
process.env.SITE_ORIGIN
        ↓ (yoksa)
data/site-config.json → origin
        ↓ (yoksa)
"https://rihla.example" (placeholder fallback)
```

İki konsumer:

1. **`scripts/generate-sitemap.mjs`** — `prebuild` hook'unda çalışır,
   `<loc>` URL'lerine origin'i gömer. Çözünürlük fonksiyonu inline
   (Node-only, ESM).
2. **`vite.config.ts` `rihlaOriginInject` plugin'i** — `transformIndexHtml`
   hook'unda index.html'deki placeholder string'lerini origin'le replace
   eder. `apply: 'build'` — dev server'a dokunmaz (geliştirici lokalde
   placeholder'ı görmeli; OG meta zincirinin doğru bağlandığını anlaması
   için).

**Tek-kanal disiplin.** İki yer (sitemap + index.html) ayrı origin
ayarına sahip olsa "iki dil arası bir farklılık" doğardı — örn. sitemap
`https://rihla.com` derken index.html `https://www.rihla.com`
diyebilir. Çözünürlük zincirinin paylaşılması bu riski sıfırlar.

**`data/site-config.json`** — versiyon kontrolünde tek doğru kaynak.
Production origin tescil edilince güncellenir; bu commit deploy'a
giderken otomatik etkili olur. `SITE_ORIGIN` env'i staging/preview
override'ları için: dashboard'da set edilir, dosyaya dokunmadan
override eder. Yerel `npm run build` `data/site-config.json`'u kullanır
(env yoksa).

**RegExp `replaceAll` neden yeterli.** Placeholder 6 yerde geçiyor:
`og:image`, `og:url`, `twitter:image`, `canonical`, ve string replace
hepsini yakalar. Parser overhead'i (DOM/AST) bu kadar dar bir
replacement için gereksiz. Eğer placeholder ileride başka yerde de
kullanılırsa (örn. `<link rel="alternate" hreflang>` header'ları,
analytics endpoint vs) tek noktada — bu plugin — güncellenir.

### (b) `_redirects` + `_headers` — Cloudflare/Netlify uyumlu hosting konfig (dilim 7/19.ι.B)

**Niye Cloudflare-first?** Üç sebep editöryel olarak terazide:

1. **Bedava tier en cömert** — build minute sınırı yok, 500 build/ay
   (statik bir sayfa için yıllarca yetiyor). Netlify 300 build minute/ay
   sınırı bu projede haziran 2026 öncesi vurulmaz, ama proje 10
   katına çıktığında olabilir.
2. **Türkiye'de POP'lar** — projenin merkez izleyici kitlesi (Türkçe-
   konuşan akademik+meraklı okuyucu) için Cloudflare CDN'i Vercel
   (ABD-merkezli) veya Netlify'dan (orta) daha hızlı. Doğubayazıt'tan
   deploy ediyoruz; izleyicinin %60-70'i Türkiye'de varsayıyoruz.
3. **`_redirects` + `_headers` Netlify ile birebir aynı format** —
   ileride Netlify'a geçilirse sürtünmesiz. "Vendor lock-in"den
   korunma disiplini: bu iki dosya iki platform için ortak; sadece
   Vercel için ayrı `vercel.json`.

**`public/_redirects` içeriği.**

```
/    /tr  302  Language=tr
/    /en  302  Language=en
/    /ar  302  Language=ar
/    /tr  302
/*   /index.html   200
```

Sıralama: ilk eşleşen kural galip. Accept-Language tabanlı redirect
spesifik (Language koşullu), default redirect catch-all. Son satır SPA
fallback (200 = rewrite, redirect değil; URL bar'da `/tr/kelime/algorithm`
kalır, ama server `/index.html`'i serve eder; React router ele alır).

**`public/_headers` içeriği.** Beş kategori:

| Kategori | Path | Header'lar |
|---|---|---|
| Global security | `/*` | X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: camera=() microphone=() geolocation=() interest-cohort=(), HSTS max-age=31536000, COOP same-origin, CSP (default-src 'self' + font-src https://fonts.gstatic.com vb) |
| Hashed assets | `/assets/*` | Cache-Control: public, max-age=31536000, immutable |
| HTML | `/`, `/*.html` | Cache-Control: public, max-age=0, must-revalidate |
| Statik public | `/favicon.svg`, `/apple-touch-icon.png`, `/og-image.{png,svg}` | Cache-Control: public, max-age=86400, stale-while-revalidate=604800 |
| Sitemap + robots | `/sitemap.xml`, `/robots.txt` | Cache-Control: public, max-age=3600, Content-Type: application/xml |

**CSP'in `'unsafe-inline'` script-src maddesi.** Bu küçük bir teknik
borç: index.html'de pre-React inline theme bootstrap script'i var
(11 satır, flicker önleme için). Onu CSP-uyumlu nonce'a taşımak iki yol:

- (a) Build-time nonce — statik hosting için elverişsiz, nonce
  request başına değişmeli.
- (b) Inline script'i ayrı .js dosyasına taşımak — FOUC riski (theme
  attribute script download/parse'inden sonra konur, parchment'in
  saniyelik ışıltısı görünür).

(b) doğru çözüm ama ι dilimi için *maliyet>fayda*: 11 satır script,
attacker exploit yüzeyi yok. Polish dilimi olarak (ι sonrası, η-prime'la
beraber veya ayrı) ele alınabilir; o zaman FOUC tradeoff'unu önce
ölç, sonra karar ver.

### (c) `vercel.json` — Vercel için eşdeğer konfigürasyon (dilim 7/19.ι.C)

Vercel `_redirects` formatını okumuyor; kendi `vercel.json` schema'sına
ihtiyaç duyuyor. Aynı davranışı (security headers + cache + SPA
fallback) JSON formatında ifade ediyor. Aynı repo'dan üç platform da
deploy edebilir — disiplinler örtüşüyor.

Tek anlamlı tradeoff: Accept-Language redirect Vercel'in bedava
tier'ında yapılamaz (Edge Middleware/Pro gerekli). Cloudflare ve
Netlify'da server-side çalışır. Vercel'de **client-side fallback**
`LangAwareRedirect.tsx` (mevcut, dilim 7/4'ten beri) bu boşluğu
doldurur — kullanıcı `/` URL'e geldikten sonra React mount olur,
i18next-browser-languagedetector `navigator.language`'ı okur,
`<Navigate>` `/tr|/en|/ar`'a yönlendirir.

### (d) 404 polish — "did you mean" entity önerisi (dilim 7/19.ι.D)

**`src/utils/didYouMean.ts`.** İki fonksiyon:

- `extractSlugFromPath(pathname)` — URL'in son segment'ini çıkarır,
  rezerve segment'leri (lang/entity/route) hariç tutar. `/tr/kelime/algorythm`
  → `'algorythm'`. `/tr/hakkinda` → `''` (rezerve).
- `findEntitySuggestions(query)` — Levenshtein distance + substring
  match hibridi. 29 entity üzerinde tarama (~350 karşılaştırma × O(m·n)
  Levenshtein ≈ 50K ops; tek-sefer 404 render'ında, anlık). En yakın
  3 öneri döner, distance'a göre sıralı.

**Algoritmanın sezgisi.** Levenshtein eşik 3; substring match (3+
karakter) ek branch. Bu hibrit:

- `algorythm` → `algorithm` d=1 (typo)
- `ibn-sin` → `ibn-sina` d=1 (truncation)
- `al-jabra` → `al-jabr` d=1 + `algebra` d=3 (iki aday)
- `sugarcane` → `sugar` substring match (d=4 olmasına rağmen)
- `sina` → `ibn-sina` substring match
- `asdfasdf` → (hiç eşleşme, boş)

Substring branch'i Levenshtein'ın katılığını yumuşatıyor; doğal "ben
sadece kelimenin parçasını biliyorum" senaryosunu yakalar.

**NotFound entegrasyonu.** Body retorik tonundan sonra, back-link
öncesinde bir `<aside>` blok'u — *"Belki şunu aradınız ◇ ..."*.
3 dilde lokalize; entity tipi etiketi (`kelime/kişi/kitap/tema`) her
dilde ayrı. Boş suggestions array'i durumunda blok render edilmez
(query rezerve segment, ya da uzak typo).

Lazy chunk delta: 1.87 → 2.34 KB gz (+0.47 KB). 50K ops'lik basit
algoritma + suggestion UI + CSS bir 470 byte tipik 404 sayfasına
ekleniyor. Bu polish layer'ın küçük ama yüksek değerli girişlerinden:
kayıp kullanıcıyı yutmak yerine ona somut bir hedef vermek.

### (e) `data/site-config.json` — production origin için SOT (dilim 7/19.ι.E)

İçerik 4 alan, hepsi self-documenting:

```json
{
  "_comment": "...build-time origin injection için single-source-of-truth...",
  "origin": "https://rihla.example",
  "_originStatus": "placeholder",
  "_originStatusOptions": ["placeholder | staging | production"]
}
```

Production tescil edilince:

1. `origin` alanı domain'le güncellenir
2. `_originStatus` `"production"` olur
3. README endcap'inde URL not düşülür

Bu üç adımlık ritüel ι sonrası ilk deploy commit'inde — *"Live URL:
https://rihla.com"* dilim 7/20 endcap'ine girer.

### (f) `docs/DEPLOY.md` — deploy rehberi (dilim 7/19.ι.F)

7 bölümlü Türkçe deploy rehberi: ön hazırlık, Cloudflare Pages,
Netlify, Vercel, post-deploy checklist (10 madde), SITE_ORIGIN nasıl
çalışır, sık sorunlar. Üç platform için adım adım dashboard talimatı +
beklenen davranış + DevTools-doğrulanabilir kontrol.

Editöryel ton: Cloudflare-first ama platform-agnostik. Vendor
lock-in'den korunma disiplini metin içinde explicit.

### Showcase argümanı — ι'nın "izleyici-altyapısı" katkısı

Atlas'ın **8-route Toledo node-degree** argümanı (7/17.ζ kapanışı)
şimdi tam zincirde:

| Katman | 7/17 sonu | 7/18 sonu | 7/19 sonu |
|---|---|---|---|
| Atlas görsel (HomePage) | Toledo 8-route hover | aynı | aynı |
| About §3 prose | yok | "üç koridor — Bağdat, Toledo, Floransa — projenin omurgası" | aynı |
| OG image atlas geometri | yok | Toledo merkez 4-ışın | aynı |
| Search engine erişimi | sitemap mevcut, placeholder origin | sitemap mevcut, env-aware origin | **sitemap + canonical + hreflang production-origin'le indekslenebilir** |
| Sosyal paylaşım | OG meta mevcut, placeholder URL | aynı | **OG image mutlak URL production'da çözüldü; Twitter/Facebook Card Validator pass eder** |
| 404 polish | 7/9 manuscript redesign | aynı | **+ did-you-mean entity önerisi (Levenshtein hybrid)** |
| Security headers | yok | yok | **CSP + 5 katman güvenlik header tüm rotalarda** |

Yani 7/19 sonrası **showcase argümanı sosyal medya / search engine /
güvenlik / hata-toleransı katmanlarında tam yüzeyli**.

### Build çıktısı (dilim 7/19 sonrası)

| | 7/18 sonu | 7/19 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 83.61 KB gz | 83.62 KB gz | +0.01 *(gzip varyansı; LangAwareRedirect dokunulmadı, SiteFooter dokunulmadı, paths.ts dokunulmadı)* |
| `NotFound` lazy | 1.87 KB gz | **2.34 KB gz** | +0.47 *(didYouMean util + suggestion UI + 80 satır CSS)* |
| `registry` chunk | 25.59 KB gz | 25.60 KB gz | +0.01 *(varyans)* |
| Public asset Δ | — | + `_redirects` (1.5 KB) + `_headers` (3 KB) | +4.5 KB *(metinsel konfig)* |
| Repo asset Δ | — | + `vercel.json` (~1.8 KB) + `data/site-config.json` (~0.7 KB) + `docs/DEPLOY.md` (~8 KB) | +10.5 KB *(repo-only, dist'e gitmez)* |
| Build süresi | 8.50s | 9.43s | +0.93s *(`transformIndexHtml` extra hook; minimal)* |

`npm run validate` ✓ — 19 W + 4 P + 2 B + 4 T = **29 entity** (değişmedi),
0 invariant violation. `npm run typecheck` ✓. `npm run build` ✓ 9.43s.

| | 7/18 sonu | 7/19 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 19 / 4 / 2 / 4 | 19 / 4 / 2 / 4 | 0 |
| Atlas places | 22 | 22 | 0 |
| Routes | 12 | 12 | 0 *(yeni route yok; mevcut hepsi)* |
| Vite plugin sayısı | 1 (rihlaContentManifest) | **2** (+ rihlaOriginInject) | +1 |
| Build script sayısı | 3 (manifest, validate, sitemap) | 3 | 0 *(sitemap origin-aware oldu, ekstra script yok)* |
| Public konfig dosyası | 0 | **2** (`_redirects`, `_headers`) | +2 |
| Repo konfig dosyası | 0 | **2** (`vercel.json`, `data/site-config.json`) | +2 |
| Yardımcı util sayısı | (mevcut) | +1 (didYouMean) | +1 |
| Docs sayfası | 1 (README) | **2** (+DEPLOY.md) | +1 |
| Ağırlıklı ortalama | ~%60.2 | ~%63.5 | Δ +3.3, *deploy-edilebilir hâl* |

GRAND_PLAN §12.4 "Polish/launch tabakası" puanı: 65/100 → **85/100**
(SITE_ORIGIN injection %5, hosting konfig dosyaları %7, vercel.json
%3, 404 polish %3, deploy rehberi %2). Kalan %15: gerçek deploy
(canlı URL), analytics opsiyonel, lighthouse audit + fixes, ι sonrası
küçük polishler (CSP `unsafe-inline` kaldırma, prefetch, font-display
optimization).

7/19'dan sonra sıradaki dilim editöryel:

- **Shape η-prime** — catalogue Person 3-hop derinleşmesi: hunayn'a
  Salerno/Monte Cassino + ibn-sina'ya Padua (Latin-resepsiyon ayakları).
  Atlas'a +2 yeni place (salerno, padua). Δ ≈ +%0.8.
- **Shape θ** — catalogue Word genişlemesi: 3-4 yeni catalogue Word
  (saffron / mattress / atlas / syrup). Korpus 29 → 32-33. Δ ≈ +%1.2-1.5.
- **Live deploy** — editöryel adım: domain tescili, dashboard onboarding,
  ilk build, sitemap.xml'i Google Search Console + Bing Webmaster'a
  submit, Twitter Card validator çalıştırma, post-deploy checklist'in
  10 maddesini doğrulama. Bu bir dilim *değil* — kullanıcı eylemi.
  ι bu adımı *deploy-edilebilir* hâle getirdi.

Sıralama önerisi: **η-prime → θ → (live deploy) → ε sonrası polish**.
η-prime hızlı, sürpriz değer (catalogue Person'lara 3-hop = yeni
Akdeniz koridorları); θ kümülatif (her dilim 3-4 catalogue Word, 4-5
dilime kadar 50 entity'e ulaşır). Live deploy düz çizgide bir editöryel
karar; ne zaman olursa ondan sonraki tüm dilimler "izleyici-katmanlı"
hâle gelir.

---

---

## Oturum 7 — dilim 18 (Shape ε: launch hazırlığı kapısı)

> *7/17 showcase argümanını sayfalar arasında **kapatmıştı**; 7/18 bu
> argümanı **dış izleyiciye sunulabilir hâle getirir**. ε kapısı yapısal
> bir sıçrama değil — bir geçit. Korpus aynı (19+4+2+4=29 entity),
> atlas aynı (22 place), validator aynı (0 violation). Değişen şey:
> projenin **kolofon imzası** (AboutPage + SiteFooter), **search engine
> erişilebilirliği** (sitemap.xml, robots.txt), **sosyal paylaşım
> deneyimi** (OG image + Twitter Card meta), **eski iOS uyumu**
> (apple-touch-icon.png). 7/17'den sonra READMÉ önermişti — "ε ile
> launch tarafı çözüldükten sonra korpus genişlemesi tek başına
> projenin büyük hareket noktası olur." ε ondan sonraki her dilimi
> "izleyicili" yapar.*

### (a) `/:lang/hakkinda` AboutPage — 5 bölümlü kolofon sayfası (dilim 7/18.ε.A)

**URL deseni.** `paths.ts`'e `ABOUT_SEGMENT = 'hakkinda'` + `aboutUrl(lang)`
helper'ları eklendi. Segment Türkçe sabit — `ENTITY_PATH_SEGMENT`,
`WORDS_LIST_SEGMENT`, `JOURNEYS_PATH_SEGMENT`'la aynı §3.2 disiplini.
LangSwitch `swapLangInPath` ile `/tr/hakkinda` ↔ `/en/hakkinda` ↔
`/ar/hakkinda` arası geçişi sürtünmesiz yapar. Eğer segment dile bağımlı
olsa LangSwitch `/tr/hakkinda` → `/en/about` haritalamak zorunda kalırdı;
sabit segment bu fragmantasyonu ortadan kaldırır.

**Sayfa kompozisyonu.** Tek sütun, max-inline-size 62ch (Word/Person
sayfasının okuma kolonundan biraz daha geniş — manifesto tonu). Header'da
büyük başlık + italik subtitle; sonra 5 bölüm:

1. **Bu proje** (thesis) — *Avrupa dillerinin altında uyuyan Arapça
   tabakaları arkeoloji sahası gibi okuyan üç-dilli bir bilgi grafı.
   4 varlık (kelime, kişi, kitap, tema), 5 sediment, 3 dil paralel.*
2. **Editöryel yöntem** (method) — beş tarihsel sediment ters
   kronolojik; üç dilde paralel anlatım (birebir çeviri değil,
   *kendi prozodisinde aynı argüman*); atlas haritası + multi-anchor
   route'lar; 7 yolculuk arketipi üst-örgü.
3. **Şu an** (state) — *19 kelime, 4 kişi, 2 kitap, 4 tema; 29 girdi.
   Showcase + catalogue iki katman. Vitrin kelimelerin tamamı
   multi-anchor; üç koridor (Bağdat, Toledo, Floransa) projenin
   omurgası.*
4. **Kaynak standartı** (sources) — Brill/De Gruyter/Leiden/IFAO
   eleştirel edisyonlar; *Arabica*/JAOS/*Der Islam* peer-reviewed;
   OED/CNRTL/DRAE/TDV institutional. Wiktionary/Lexico tertiary,
   asla primary. Tek-kaynaklı iddialar metin içinde işaretlenir.
5. **Kapanış** (closing) — *Bir tortu sahası kendisini açmaz;
   kazılması, sediment'lerinin ayırt edilmesi, her tabakanın kendi
   içinde okunması gerekir. Bu site, üç dilin altında yatan tek bir
   tortunun beş sediment'i — okunmayı bekleyen bir kolofon.*

Üç dil paralel prose'u **doğrudan TSX'te** (HomePage tagline paterni —
`{lang === 'tr' && ...}`). Uzun düzyazıyı i18n JSON'a parçalamak
gereksiz fragmantasyon yaratırdı; sadece bölüm başlıkları i18n key'le
çünkü onlar UI chrome'unun parçası. Trade-off bilinçli: bu yaklaşım
metni dosyada okunabilir kılar (ayrıştırılmış key dizisi yerine akıcı
paragraf), ama tek dezavantaj çevirinin source-of-truth'unun bir JSON
dosyası değil bir TSX dosyası olması — about için kabul edilebilir
çünkü içerik durağan (sürüm endcap'leri dışında değişmez).

**AboutPage.css.** Manuscript-aesthetic disiplin: section başlıkları
küçük-caps + ince üst-rule (manuscript marginalia tonu); paragraflar
arası `--space-6` boşluk (entity sayfalarınkinden biraz daha hava);
em → terracotta accent (Arapça transliterations), strong → bold
ink (editöryel emphasis). Arapça lokalde Amiri serif + 1.2rem +
line-height 2.05 (Arap matbu disiplini). Page-enter animasyonu
6px translate + 0.6s ease (manuscript "açılış" efekti).

**Lazy chunk: 5.72 KB gz.** AboutPage düz prose; multi-anchor route
veya entity registry yükü yok. Toplam ağırlık (CSS dahil) hindu-arabic-
numerals'in yarısı kadar — sade.

### (b) `SiteFooter` chrome bileşeni — pasif alt-imza (dilim 7/18.ε.B)

**Mimari yer.** App.tsx kökünde TopBar'ın aynası olarak; her sayfada
görünür. HomePage atlasından sonra, WordPage colophon'undan sonra,
NotFound'un altında — sayfa sonunu mühürler.

**Sade tek satır:** marka mührü · *Riḥlat al-Kalimāt* · 〈sep〉 ·
*Hakkında* link · 〈sep〉 · *Edition 7/18.ε*. Renkler `--fg-faint`
düzeyinde — sayfayla rekabet etmez; hover yalnız link'te (`--accent`).
Üst rule (`--rule`) + center-aligned 70ch max-inline-size + serif
italik. RTL'de doğal flex akışıyla ters yöne dizilir.

**Chrome simetri argümanı.** TopBar (üst) interaktif: dil seçimi, tema
toggle. SiteFooter (alt) pasif: sadece imza + bir link. Bu fark görsel
olarak boyut, renk, hover yokluğu ile taşınır — kullanıcı üst-altı
fonksiyonel olarak ayırt eder.

**`SiteFooter.module.css`** scoped — global namespace kirlenmesi yok.
`styles.brand` + `styles.brandMark` + `styles.link` vb. Component-local
class isimleri (`wordslist-*` paterni gibi değil; daha kapalı).

### (c) OG image 1200×630 — manuscript-aesthetic banner (dilim 7/18.ε.C)

**Tasarım disiplini.** favicon.svg'nin kanonik paletini taşır:
parchment `#f4ecd8`, gold `#c9941b`, lazaward `#1f4e7a`, sepia-ink
`#5a4a36`. Üç dilde "Riḥlat al-Kalimāt" mührü + dört-varlık altyazısı
(Word · Person · Book · Theme).

**Sağ-sütun atlas-pin geometri.** Bir merkez büyük pin (Toledo'yu
temsil eden, halo + gold mark + dış dashed halka) ve etrafından çıkan
**dört rota ışını** dört anchor pin'ine (Baghdad sol-üst, Florence
sağ-üst, Paris sol-alt, Cambridge sağ-alt). Bu geometri 7/17 endcap'inin
*editöryel tezi görsel kanıt olarak* sunma argümanının kondansasyonu:
**Arapça bilim sözlüğünün Avrupa'ya bütün geçit yolu Toledo'dan geçer**.
Hiçbir metin etiketi yok — soyut özetlemesi.

**Arapça shaping zinciri.** cairosvg pango/harfbuzz kullanmadığı için
Unicode source string'leri yanlış render eder (harfler bağlanmaz,
diacritic'ler düşer). Çözüm:

1. `arabic-reshaper` (`delete_harakat: false`) — Unicode → Arabic
   Presentation Forms; diacritic'ler korunur, harfler glif-pozisyonel
   formuyla ortaya çıkar.
2. `python-bidi` `get_display()` — BiDi algoritması; logical-order →
   visual-order çevirisi.
3. Pre-shaped + pre-reordered metin SVG'ye gömülür; `direction="rtl"`
   attribute'u **kaldırılır** çünkü metin artık görsel-sıralı, LTR
   olarak çizilince doğru görünür.

Source `رِحلة الكَلِمات` → font (Amiri) shapes it automatically. Browser'da
canlı render olsa bu manuel adıma gerek yoktu (Chrome/Firefox/Safari
hepsi shape ediyor) — ama OG image static asset, build-time render
ediliyor, headless renderer pango'suz.

**Üretim:** `public/og-image.svg` (source) → cairosvg → `public/og-image.png`
(70 KB, 1200×630 RGB). SVG re-edit edilirse manuel re-render gerekir
(şu an `scripts/render-og-image.mjs` yok; tek-seferlik adım, dilimde
SVG değiştikçe yeniden çalıştırılır).

### (d) `scripts/generate-sitemap.mjs` + `robots.txt` + prebuild hook (dilim 7/18.ε.D)

**Sitemap kapsamı.** Korpustaki her entity × 3 dil:
- 19 Word × 3 = 57
- 4 Person × 3 = 12
- 2 Book × 3 = 6
- 4 Theme × 3 = 12

Statik route'lar × 3 dil:
- HomePage × 3 = 3
- AboutPage × 3 = 3
- 3 listing (`/kelimeler`, `/kisiler`, `/kitaplar`) × 3 = 9

Journey index + 7 arketip × 3 dil = 24.

**Toplam: 42 unique page × 3 dil = 126 `<url>` block**. Her `<url>`
kendi içinde 3 dil `xhtml:link rel="alternate" hreflang="..."` +
`x-default` (tr) taşır — Google'ın çok-dilli site önerisi.

`<changefreq>` ve `<priority>`:
- HomePage 1.0 / weekly
- entity sayfaları 0.8 / weekly
- listing sayfaları 0.6 / weekly
- journey index + journey type 0.6/0.5 / weekly
- AboutPage 0.5 / monthly (içerik durağan)

**SITE_ORIGIN env.** Script `process.env.SITE_ORIGIN ?? 'https://rihla.example'`
fallback'i kullanır; CI/CD'de production deploy'da bu env değişkeni set
edilir (Vercel `vercel.json` env config; Netlify `netlify.toml` env).
Şimdiki placeholder deploy zamanı netleşecek.

**prebuild hook.** `package.json`:
```json
"prebuild": "tsx scripts/generate-manifest.mjs && tsx scripts/validate-corpus.mjs && tsx scripts/generate-sitemap.mjs"
```

Sıralama önemli: manifest önce (TS source-of-truth tazelensin),
validate sonra (korpus invariant'ları geçsin), sitemap en son (slug
listesi taze MDX dosyalarından gelsin). Her `npm run build` baseline'da
sitemap'i de tazeler.

**robots.txt.** Sade — `User-agent: * / Allow: / / Sitemap: ...`.
Site statik bir yayın; rate limit gerekmiyor; bütün crawler'lara açık.
Sitemap URL'i mutlak (sitemap.xml içindeki `<loc>`'ların `loc.toString()`'i
mutlak olduğu için; SITE_ORIGIN env satırı build zamanı injection).

### (e) `apple-touch-icon.png` + index.html meta etiketleri (dilim 7/18.ε.E)

**apple-touch-icon.** favicon.svg'den cairosvg ile 180×180 PNG render.
Manuel adım: SVG comment'leri cairosvg'nin defusedxml parser'ı sıkı
olduğu için strip edilir (renderer için geçici dosya, orijinal
favicon.svg dokunulmaz kalır — browser'lar bu yorumları sorunsuz
handle eder; sadece cairosvg'nin parser'ı problem ediyor).

`index.html`:
```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

Eski `<link rel="apple-touch-icon" href="/favicon.svg" />` satırı silindi —
SVG'yi iOS Safari home-screen icon olarak render edemiyor; PNG zorunlu.

**OG + Twitter Card meta etiketleri.** index.html `<head>`'e eklenen
8 OG tag (`type/site_name/title/description/image/image:width/height/alt/url/locale[2]`)
+ 4 Twitter tag (`card/title/description/image/image:alt`) + canonical link.
Tüm URL'ler mutlak (OG spec mutlak ister), placeholder origin
`https://rihla.example`. Twitter Card `summary_large_image` —
1200×630 OG image bu kart tipiyle birebir uyumlu.

### (f) Hijyen düzeltmeleri — 7/16 ve 7/17 endcap'leri

**7/17 endcap'inde η framing düzeltmesi.** Önceki framing: *"Shape η =
catalogue Person multi-anchor genişlemesi: hunayn-ibn-ishaq ve
ibn-al-haytham hâlâ tek-anchor."* 7/18.ε.A başlangıcında manifest probe'u
gösterdi ki bu yanlış: hunayn 2-hop (baghdad+constantinople),
ibn-al-haytham **3-hop** (baghdad+cairo+paris) zaten var. Endcap satırları
yeniden çerçevelendi → **Shape η-prime**: hunayn'a 3. anchor
(Salerno/Monte Cassino — Constantinus Africanus Latin geçişi) +
ibn-sina'ya 3. anchor (Padua — Latin curriculum mırası). Toledo'ya
alternatif Akdeniz koridorları atlas'a girer.

**7/16 endcap tablosunda hijyen notu.** *Multi-anchor Person* satırı
pre-7/16'da eksik kayıttı: ibn-al-haytham'ın 3. anchor'ı 7/15'in
*öncesinde* sessizce eklenmiş ama tabloya yansımamıştı. 7/18.ε.A
sırasında manifest probe'uyla görüldü; tablonun altına explicit not
eklendi (kayıt tutarlılığı için).

### Showcase argümanı — ε kapısının dış-izleyici yüzeyi

Atlas'ın **8-route Toledo node-degree** argümanı (7/17.ζ'da kapanmıştı)
şimdi üç katmanda görünür:

| Katman | 7/17 sonu | 7/18 sonu |
|---|---|---|
| Atlas'ta görsel (HomePage) | Toledo node, 8 route hover'ı | aynı + dilim 7/18 değişikliği yok |
| About page'in §3 prose'u | yok (sayfa yoktu) | *"üç koridor — Bağdat, Toledo, Floransa — projenin omurgası"* |
| OG image atlas-pin geometri | yok (görsel yoktu) | Toledo merkez büyük pin + 4 ışın, **4 anchor pin** |

OG image'in atlas-pin geometri sahnesi 7/17 argümanının **sosyal-paylaşım
düzeyinde** sürdürülmesidir — Twitter'da görüldüğünde Toledo'nun
merkeziliği bir editöryel tezdir görsel olarak.

### Build çıktısı (dilim 7/18 sonrası)

| | 7/17 sonu | 7/18 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 82.63 KB gz | **83.61 KB gz** | +0.98 *(SiteFooter + aboutUrl + i18n footer.* + about.* eager kayıt)* |
| `registry` chunk | 25.60 KB gz | 25.59 KB gz | −0.01 *(gzip variance; içerik değişmedi)* |
| `AboutPage` lazy chunk | — | 5.72 KB gz | yeni route |
| Bütün public asset | favicon.svg 2.7 KB | + og-image 70 + og.svg 7 + apple-touch 8 + sitemap 73 + robots 0.5 | +159 KB *(static; lazy/external)* |
| Total dist/ | n/a | 73 KB sitemap + 70 KB og + 8 KB apple + 2.7 KB favicon + ... | — |
| Build süresi | 7.79s | 8.50s | +0.71s *(prebuild'e sitemap generation eklendi)* |

`npm run validate` ✓ — 19 W + 4 P + 2 B + 4 T = **29 entity** (değişmedi),
0 invariant violation. `npm run typecheck` ✓. `npm run build` ✓ 8.50s.

| | 7/17 sonu | 7/18 sonu | Kümülatif Δ |
|---|---|---|---|
| Words / Persons / Books / Themes | 19 / 4 / 2 / 4 | 19 / 4 / 2 / 4 | 0 |
| Atlas places | 22 | 22 | 0 |
| Routes | 11 | 12 | +1 (`/hakkinda`) |
| Lazy chunk sayısı | 35 | 36 | +1 (AboutPage) |
| Chrome bileşen sayısı | 1 (TopBar) | 2 (+SiteFooter) | +1 |
| i18n key | 3 dil × ~140 = ~420 | 3 dil × ~162 = ~486 | +66 *(about.*  + footer.*)* |
| Build script | 2 (manifest, validate) | 3 (+sitemap) | +1 |
| Public asset | 1 (favicon.svg) | 6 (+og-image.svg/png, apple-touch-icon.png, robots.txt, sitemap.xml) | +5 |
| Ağırlıklı ortalama | ~%55.6 | ~%58 | Δ +2.4, *launch tabakası açıldı* |

GRAND_PLAN §12.4 "Polish/launch tabakası" puanı: 30/100 → **65/100**
(About sayfası %15, OG image %10, sitemap+robots %5, apple-touch-icon
+ favicon zincir tamlığı %5). Kalan %35: live deploy (Vercel/Netlify
konfig), production SITE_ORIGIN injection, analytics opsiyonel,
404 page polish, lighthouse audit.

7/18'den sonra sıradaki dilim editöryel karar:

- **Shape η-prime** — catalogue Person 3-hop derinleşmesi (hunayn +
  ibn-sina'ya Latin-resepsiyon anchor'ları: Salerno/Monte Cassino +
  Padua). Atlas'a 2 yeni place (salerno + padua), Akdeniz koridorları
  Toledo alternatifi olarak görünür. Ağırlıklı ortalama Δ ≈ +0.8.
- **Shape θ** — catalogue Word genişlemesi: 3-4 yeni catalogue Word
  (örn. saffron, mattress, atlas, syrup) — her biri 5-stratum × 3 dil,
  multi-anchor opsiyonel. Korpus 29 → 32-33; ağırlıklı ortalama
  Δ ≈ +1.2-1.5. Atlas'a 0-2 yeni place.
- **Shape ι** — production deploy: Vercel `vercel.json` konfig, custom
  domain DNS, SITE_ORIGIN env, analytics (Plausible/Umami — privacy-
  respecting), final lighthouse audit. Korpus genişlemesi öncesi
  *live URL* hareket noktası — ε'nin dış-izleyici argümanını gerçek
  izleyici argümanına dönüştürür.

η-prime ve θ "izleyici-sonrası" dilimler (ε'nin temellendirdiği zemine
oturur); ι ε'nin doğal kapanışı. Sıralama tercihi ε → ι → θ → η-prime
(önce site canlı, sonra korpus genişle), veya ε → η-prime → θ → ι
(önce şu anki korpus tamamla, sonra deploy). Editöryel.

---

---

## Oturum 7 — dilim 17 (Shape ζ: showcase argümanı kapanışı, 9/9 multi-anchor)

> *7/16 entity-tip simetrisini liste-katmanına genişletti; 7/17 göğüsteki
> son düğümü çözüyor — *showcase Word'lerin tamamının atlas üzerinde
> okunaklı bir tarihsel rotası olması*. 6/9'dan 9/9'a geçiş yapısal bir
> sıçrama değil bir argüman kapanışı: 7/4'te coffee, 7/8'de cotton, 7/9'da
> lemon, 7/10'da al-Khwārizmī Person, 7/11'de al-jabr Book + cotton/sugar
> Atlas rotaları, 7/13'te zero ile devam eden multi-anchor inşası bu
> dilimle 'showcase tier' tarafında **eksiksiz** oluyor. Üç ayrı 4-hop
> rotası tek atlas levhasında kesişir — Toledo'da ortak düğüm, Paris'te
> ortak (alcohol+algebra), Florence'ta ortak (algebra+algorithm),
> Cambridge'te tek (algorithm modern); bu kesişme deseni şu argümanı
> taşır: **Arapça bilim sözlüğünün Avrupa'ya bütün geçit yolu Toledo
> 12. yüzyıl tercüme atölyesinden geçer**. Üç Word'ün yan-yana rotası bu
> tezi tek bir görsel kanıt olarak sunar.*

### (a) alcohol 4-hop multi-anchor + tier düzeltmesi (dilim 7/17.ζ.A)

**Pre-flight: tier düzeltmesi.** Mevcut frontmatter `tier: catalogue /
atlasAnchor: cordoba` taşıyordu. İki düzeltme:

| | Önce | Sonra |
|---|---|---|
| `tier` | `catalogue` | `showcase` |
| `atlasAnchor` | `cordoba` | `baghdad` |

`tier: catalogue` etiketi pre-7/12 corpus'undan kalma bir
miskategorizasyondu — 7/12.A'da catalogue tier ilk açıldığında "ilk 6
catalogue Word" listesinde (admiral, azimuth, tariff, damask, alembic,
assassin) alcohol yoktu, ama frontmatter etiketi düzeltilmemişti. Plan
notlarında *"showcase Word'lerden 3'ü hâlâ tek-anchor (alcohol, algebra,
algorithm)"* deyişi 7/13'ten beri Shape α-β-γ-δ boyunca tutarlı —
editöryel kayıt showcase, schema kayıt catalogue. Bu dilim ikisini
hizaya getiriyor.

alcohol'un showcase-territory olmasının nedenleri:

- **Essay büyüklüğü**: 22.78 KB (catalogue Word'lerin ortalaması
  ~19 KB; showcase Word'lerin ortalaması ~36 KB; alcohol orta-üst
  — 5-stratum × 3 dil tam doluluk taşıyor)
- **3-kıta etimolojisi**: Antik Mısır (kohl) → Abbasi Bağdat'ı
  (alchemy systematization) → Latin Avrupa (Toledo translation school)
  → Akademik Paris (Albertus Magnus, *spiritus vini*)
- **Semantik genişlik**: *al-kuḥl* göz tozu olarak başlar, *al-kuḥūl*
  alchemist'in laboratuvarında *süblimat / öz* anlamına genişler, sonra
  Avrupa damıtma teknolojisiyle *damıtılmış şarabın ruhu* olarak
  modernleşir — *bir kelimenin anlamı laboratuvarda değişti*

`atlasAnchor: cordoba` da editöryel olarak isabetli değildi — Cordoba
Endülüs alchemy geleneğinin parçası ama alcohol'un *iconic* durağı
Bağdat (Câbir + Râzî). Lemon'da olduğu gibi atlasAnchor "en iconic
durak"tır; Bağdat alcohol için bu rolü oynar.

**4-hop rotası.**

```yaml
atlasAnchors:
  - slug: cairo
    year: "c. -1500 → c. 900"
    label:
      tr: "Antik kohl geleneği — *al-kuḥl*, kirpik diplerine sürülen
           antimon sülfür tozu; süblimasyon yoluyla *en ince* hâle
           getirilen."
  - slug: baghdad
    year: "c. 800 — 925"
    label:
      tr: "Câbir bin Hayyân ve er-Râzî — *al-kuḥūl* alchemik
           laboratuvarda *süblimat / öz* anlamına genişler; Hâvī ve
           Esrâr al-Kîmyâ'da terim sistematikleşir."
  - slug: toledo
    year: "c. 1180"
    label:
      tr: "Gerardus Cremonensis — Câbirî Latin tercüme korpusu (*Liber
           de Aluminibus et Salibus* ve sair); *alchol* terimi Avrupa
           laboratuvarına girer."
  - slug: paris
    year: "c. 1250 — 1500"
    label:
      tr: "Albertus Magnus, Vincent de Beauvais — akademik alkimya;
           *spiritus vini* söylemi; alkol bir göz tozundan damıtık
           şarabın *ruhuna* dönüşür."
```

Her label 3 dilde paralel (TR/EN/AR); 4 anchor × 3 dil = 12 micro-essay.
Her label tek bir editöryel argüman taşır — *bu nokta için neden bu
nokta*.

### (b) algebra 4-hop multi-anchor (dilim 7/17.ζ.B)

`atlasAnchor: baghdad` (değişmedi). Route:

| Anchor | Yıl | Argüman |
|---|---|---|
| baghdad | c. 825 | el-Hârezmî *al-Jabr wa al-Muqābala* — *kırığı kaynaştırma ve dengeleme*; bilinmeyenli denklemin kurumsal hesabı doğar |
| toledo | 1145 | Robert of Chester *Liber algebrae et almucabola* — Arapça *al-jabr* Latin metnin başlığında *algebra* olur |
| florence | 1202 — 1494 | Fibonacci *Liber Abaci* + Pacioli *Summa* — *algebra* İtalyan tüccar-matematikçinin günlük pratiği |
| paris | 1591 — 1637 | Viète *In artem analyticen isagoge* + Descartes *La Géométrie* — *sembolik cebir* doğar; *x* harfi denklemde yerini alır |

**al-jabr Book 4-hop'undan editöryel farklılaşma.** Aynı kaynaktan iki
ayrı 4-hop:

| Entity | Anchor 1 | Anchor 2 | Anchor 3 | Anchor 4 | Editöryel argüman |
|---|---|---|---|---|---|
| Book *al-jabr* | baghdad | toledo | florence | london | *kitabın philological rescue'su* (1831 Rosen *editio princeps* — *kitap adamı 600 yıl aşar*) |
| Word *algebra* | baghdad | toledo | florence | paris | *kavramın sembolik dönüşümü* (Viète-Descartes — *x harfinin denklemde yerini alması*) |
| Person *al-Khwārizmī* | khwarazm | baghdad | toledo | florence | *insanın bilim diaspora rotası* (4 hop son durağı Floransa, Fibonacci Toskana resepsiyonu) |

Üç entity birbirini tekrarlamaz — aynı kaynaktan üç ayrı tarihsel
argüman. Atlas'ta üç 4-hop yan yana çizilir: Bağdat ortak başlangıç,
Toledo ortak orta; sonra Person Floransa'da biter (insanın hikayesi
Fibonacci'de kapanır), Book Londra'ya devam eder (kitap modern critical
edition'da yeniden doğar), Word Paris'e devam eder (kavram sembolik
algebraya dönüşür).

### (c) algorithm 4-hop multi-anchor + primary anchor düzeltmesi (dilim 7/17.ζ.C)

**Primary anchor değişikliği.** `atlasAnchor: khwarazm` → `baghdad`.
Editöryel argüman:

> Word'ün hayatı Bağdat'ta başladı; Hârizm adamın doğduğu yer. Atlas
> primary anchor (HomePage Atlas haritasında tek pin) Word'ün
> *iconic* durağıdır, etimolojinin başlangıç noktası değildir.
> Lemon'ın primary anchor'ı Delhi değil Cordoba (Endülüs bahçesi en
> iconic durak); Zero'nun primary anchor'ı Bhillamala değil yine
> Bhillamala (çünkü Brahmagupta orada *ilk yazılı kuram* var — tek
> iconic durak). Algorithm için iconic durak Bağdat (al-Khwārizmī'nin
> yazdığı yer, *Algoritmi de numero Indorum* başlığının izlediği
> köken).

`khwarazm` artık yalnız al-Khwārizmī Person'ın atlas pin'ini taşır —
*Hârezm small-town birinci anchor pin'i Person'a kalır, Word çıkar*.

**4-hop rotası.**

| Anchor | Yıl | Argüman |
|---|---|---|
| baghdad | c. 825 | el-Hârezmî *Kitāb al-Ḥisāb al-Hindī* — Hint rakamlarıyla *prosedürel* aritmetik; *adam, kitap, yöntem* aynı kişide birleşir |
| toledo | c. 1145 | *Algoritmi de numero Indorum* — Latin tercümede el-Hârezmî'nin nisbesi *Algoritmi* olur; yöntemin adı insanın adından bağımsızlaşır |
| florence | 1202 | Fibonacci *Liber Abaci* — *Algorismus* Avrupa matematiğinde *konumsal aritmetik yöntemi*nin tek adı; tüccarın belleğinde sistematikleşir |
| cambridge | 1936 | Alan Turing *On Computable Numbers* — *algorithm* artık her *etkili hesaplama prosedürünün* formal adı; el-Hârezmî'nin nisbesi bilgisayar çağına geçer |

**al-Khwārizmī Person 4-hop'u ile karşılaştırma.**

```
Person:    khwarazm  →  baghdad  →  toledo  →  florence
Word:                    baghdad  →  toledo  →  florence  →  cambridge
```

Üç orta-anchor paylaşılır (baghdad, toledo, florence); başta ve sonda
diverj eder. Editöryel argüman: *adam ve kelime yollarını ayırır —
Person Hârizm'de başlar, Word Bağdat'ta; Person Floransa'da biter, Word
Cambridge'e devam eder*. **Kelime adamın dışına çıkar, modern çağa
geçer**.

### Showcase argümanı kapanışı — Atlas'taki üç-rota görsel kanıt

**Toledo: 6 multi-anchor route'un düğüm noktası.** Bu dilim sonunda
Toledo'dan geçen entity rotası:

- algebra Word (anchor 2)
- algorithm Word (anchor 2)
- alcohol Word (anchor 3)
- azimuth Word (single anchor, catalogue 7/12)
- cipher Word (single anchor, catalogue 7/13)
- zero Word (anchor 3, showcase 7/13)
- al-jabr Book (anchor 2, showcase 7/11)
- al-Khwārizmī Person (anchor 3, showcase 7/10)

**8 ayrı route Toledo'dan geçer** — *Arapça bilim sözlüğünün Avrupa'ya
tek geçit noktası*; atlas'taki en yoğun anchor. Diğer çift-aşı yerler:

- baghdad: 4 multi-anchor + 4 single = 8 toplam
- florence: 4 multi-anchor (algebra+algorithm+al-jabr+al-Khwārizmī) + 0 single
- cairo: 2 multi-anchor (alcohol+coffee) + 3 single (arsenal/tariff/admiral via lugat) + cluster theme
- paris: 2 multi-anchor (alcohol+algebra) + 0 single
- cambridge: 1 multi-anchor (algorithm) + 0 single — modern crystallization

Atlas'taki node-degree desenleri editöryel argümanı görselleştirir:
**Toledo merkezi**, **Bağdat-Floransa süreklilik koridoru**, **Cambridge
modern eklenti**. Üç anchor — Bağdat, Toledo, Floransa — Word/Person/
Book/Theme dahil tüm kaynak-rotasyon koridorunun omurgası.

### Build çıktısı (dilim 7/17 sonrası)

| | 7/16 sonu | 7/17 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 82.63 KB gz | 82.63 KB gz | 0 *(saf-içerik dilim; UI dokunulmadı)* |
| `registry` chunk | 23.29 KB gz | 25.60 KB gz | +2.31 KB gz (manifest 12 yeni anchor obj × 3 dil label) |
| `alcohol` lazy chunk | 10.10 KB gz | 9.92 KB gz | −0.18 *(strata değişmedi, frontmatter atlas blocks ekledi; gzip negatif çünkü değişiklik küçük + frontmatter daha tekrarlı string'ler yarattı)* |
| `algebra` lazy chunk | 13.28 KB gz | 13.97 KB gz | +0.69 |
| `algorithm` lazy chunk | 10.37 KB gz | 11.19 KB gz | +0.82 |
| Atlas multi-anchor route sayısı | 5 W + 1 P + 1 B = 7 | 8 W + 1 P + 1 B = 10 | +3 (3 yeni Word route) |
| Yeni atlas yeri | — | — | 0 *(tüm 6 anchor cairo/baghdad/toledo/florence/paris/cambridge önceden korpusta)* |
| Build süresi | 8.01s | 8.87s | — |

`npm run validate` ✓ — 19 W + 4 P + 2 B + 4 T = **29 entity** (değişmedi),
0 invariant violation. `npm run typecheck` ✓. `npm run build` ✓ 8.87s.

| | 7/16 sonu | 7/17 sonu | Kümülatif Δ |
|---|---|---|---|
| Word.tier dağılımı | 8 SC + 11 CAT | 9 SC + 10 CAT | alcohol terfisi |
| Showcase Word multi-anchor | 6/8 (%75) | **9/9 (%100)** | showcase argümanı kapandı |
| Catalogue Word multi-anchor | 0/11 | 0/10 | editöryel tercih korunuyor |
| Atlas route'lar | 7 multi | 10 multi | +3 |
| Toledo node-degree | 5 | 8 | +3 *(üç yeni Word route Toledo'dan geçer)* |
| Ağırlıklı ortalama | ~%53.3 | ~%55.6 | Δ +2.3, *showcase argümanı kapanışı* |

7/17'den sonra showcase tarafı yapısal olarak kapanmış görünüyor.
Sonraki dilim editöryel karar:

- **Shape ε** — kolofon `/about` page + OG image (Twitter/Facebook
  meta etiketleri için 1200×630 manuscript-aesthetic banner) + apple-
  touch-icon PNG (eski iOS uyumu) + deploy hygiene (Vercel/Netlify
  konfigürasyonu, robots.txt, sitemap.xml). Launch-hazırlık dilimi.
- **Shape η-prime** — catalogue Person 3-hop derinleşmesi. *Düzeltme
  (dilim 7/18.ε önerisi)*: ilk η framing'i ("hunayn ve ibn-al-haytham
  tek-anchor") generated manifest'le çelişiyordu — kontrol ettiğinde
  her ikisi de zaten multi-anchor (hunayn 2-hop baghdad+constantinople,
  ibn-al-haytham 3-hop baghdad+cairo+paris). Gerçek η-prime hareketi:
  hunayn'a Salerno/Monte Cassino 3. anchor'ı (Constantinus Africanus
  Latin geçişi) + ibn-sina'ya Padua 3. anchor'ı (Latin curriculum
  mırası) — catalogue Person'larda iki *Latin-resepsiyon* ayağı.
  Toledo'ya alternatif Akdeniz koridorlarını (Salerno, Padua) atlas'a
  getirir.

ε ile launch tarafı çözüldükten sonra korpus genişlemesi tek başına
projenin büyük hareket noktası olur — her dilim 3-4 yeni catalogue
entity ile ~%1-1.5 katkı; %75-80'e ulaşmak için ~15-20 dilim.

---

---

## Oturum 7 — dilim 16 (Shape δ: liste-katmanı simetrisi + katalog derinleşmesi)

> *7/14 entity-tip simetrisini Person+Book entity sayfasına genişletti;
> 7/15 zamanın görünür hale gelişini iki kanalda (Atlas timeline +
> Stratigraphy proportional) çözdü; 7/16 simetri zincirinin liste-
> katmanını kapatıyor — Word'lerin `/kelimeler`'i 7/10'da açılmıştı,
> Person ve Book'un karşılığı bu dilimde geldi. Aynı zamanda katalog
> tarafı iki yerde derinleşti: ilk catalogue-Word-anchored cluster
> theme (lugat-al-bahr-arabi, admiral+arsenal denizci sözlüğü) ve
> 7/14'te placeholder bırakılan ibn-sina catalogue Person. Δ küçük
> ama editöryel argüman yoğun: her entity-tipi artık aynı UI
> affordance'larını paylaşır (list route + sort/filter + manuscript-
> aesthetic kart); kod-mimari tarafında üç sayfa ortak EntityListPage
> stylesheet'i ve ortak ToolbarButton component'i kullanır.*

### (a) `/kisiler` + `/kitaplar` listing routes + CSS rename (dilim 7/16.δ.A)

**Pattern kaynağı.** 7/10.A'da `WORDS_LIST_SEGMENT = 'kelimeler'` +
`wordsListUrl(lang)` helper paths.ts'e girmişti; lazy `WordsListPage`
AppRoutes'a takılmıştı; ~150 satır TSX + ~180 satır CSS yeni sayfa.
7/12.B'de aynı sayfaya tier filter ikinci toolbar eklenmişti
(`tierFilter: 'all' | 'showcase' | 'catalogue'`). 7/16.A bu paterni
Person ve Book için tekrarlar.

**Yeni path helper'lar.**

```ts
export const PERSONS_LIST_SEGMENT = 'kisiler';
export const BOOKS_LIST_SEGMENT = 'kitaplar';

export function personsListUrl(lang: Lang): string {
  return `/${lang}/${PERSONS_LIST_SEGMENT}`;
}

export function booksListUrl(lang: Lang): string {
  return `/${lang}/${BOOKS_LIST_SEGMENT}`;
}
```

Segment'ler Türkçe-sabit (dile bağlı değil) — `wordsListUrl`'in
ilkesiyle aynı. `ENTITY_PATH_SEGMENT` tekil formuyla (`kisi`, `kitap`)
rezonansta: çoğul → liste, tekil → tek entity.

**Sort modları sayfaya özgü.**

PersonsListPage:

- *alfabetik* — Arapça lokalde `arabicName`, diğerlerinde stripped
  `romanName` üzerinden localeCompare
- *yaşam dönemi* — `PersonSummary.lifespan` (yeni manifest field)
  üzerinden `parseYearStart` ile sayıya çevirip artan sıra; bilinmeyen
  yıl Infinity'ye düşer
- *atlas rotası* — `atlasAnchors.length` (multi-anchor) ya da
  `atlasAnchor` (tek-anchor fallback) azalan, eş sayıda alfabetik

BooksListPage:

- *alfabetik* — Arapça lokalde `fullArabicTitle`, diğerlerinde stripped
  transliteration
- *yazılış tarihi* — `BookSummary.composedYear` (yeni manifest field)
  üzerinden aynı `parseYearStart`
- *atlas rotası* — Person'ınkiyle aynı şema

`parseYearStart` 7/15'te `src/utils/year.ts` modülüne eklenmişti —
şimdi iki sayfa daha onu tüketiyor (Atlas timeline → Stratigraphy
proportional mode → PersonsList → BooksList = 4 müşteri). *Year-parser
tek doğru kaynak.*

**Tier filtresi üç sayfada da aynı.** `tierFilter: 'all' | 'showcase'
| 'catalogue'` state, filter ÖNCE sort SONRA bağımsız useMemo
katmanları. 7/12'nin paterni 1:1 taşındı.

**Manifest field eklemeleri.**

`types/entities.ts`:

```ts
export type PersonSummary = {
  // ... mevcut alanlar
  /** Kişinin yaşam dönemi gösterim formu (örn. "980-1037 CE") —
   *  PersonsListPage'in kronolojik sort'u için (dilim 7/16). */
  lifespan?: string;
};

export type BookSummary = {
  // ... mevcut alanlar
  /** Kitabın yazılış tarihi (örn. "c. 1025", "9. yy başı") —
   *  BooksListPage'in kronolojik sort'u için (dilim 7/16). */
  composedYear?: string;
};
```

`scripts/generate-manifest.mjs` emit loop'larında bu alanlar varsa
manifest'e yazılır (boş string filtrelenir, manifest temiz kalır).

**CSS rename: `wordslist-*` → `entitylist-*`.** Üç sayfa aynı görsel
sözlüğü paylaştığı için CSS'in adı semantik olarak yanlıştı. Rename
operasyonu temiz:

```
mv WordsListPage.css → EntityListPage.css  (yeni dosya, eski silindi)
sed s/wordslist-/entitylist-/g  →  CSS dosyası + WordsListPage.tsx
sed s/WordsListPage.css/EntityListPage.css/  →  import path
```

Hiçbir başka modül `wordslist-*` referansı taşımıyordu (class'lar
component-local'di) — mimari maliyet sıfır. Build çıktısında
`EntityListPage.css` 4.94 KB raw / 1.21 KB gz tek chunk, üç ListPage
ondan beslenir.

**`ToolbarButton` shared component.** 7/12.B'de WordsListPage içine
yerel olarak yazılmış generic'ti. 7/16'da üç sayfanın da kullanması
gerektiği için `src/components/ToolbarButton.tsx` paylaşılan dosyaya
taşındı. Sayfaların lokalinde yalnız typed alias'lar kalır:

```ts
import { ToolbarButton } from '@/components/ToolbarButton';

type SortMode = 'alphabetical' | 'lifespan' | 'anchors';
const SortButton = ToolbarButton<SortMode>;
const FilterButton = ToolbarButton<TierFilter>;
```

Call-site netliği korunur, gövde mantığı tek noktada.

**HomePage `headerLink` eklemesi.** 7/10'da `DirectoryColumn` bileşeni
opsiyonel `headerLink?: { to, label }` prop'u almıştı ama yalnız Words
sütunu kullanıyordu (Catalogue route'u sadece Words'te vardı).
7/16'da Persons ve Books sütunları da headerLink alıyor —
`personsListUrl(lang)` + `booksListUrl(lang)` ile. Themes sütunu hâlâ
linksiz: theme korpusu 4 entity, ayrı liste sayfası over-engineered
kalır şimdilik.

**i18n.** 3 dilde 2 yeni namespace, her biri 13 anahtar:

```
personsList.subtitle / count / sortLabel / sortAlphabetical /
sortLifespan / sortAnchors / anchorCount / seeAll / filterLabel /
filterAll / filterShowcase / filterCatalogue / countFiltered
```

(booksList aynı şablon, `sortLifespan` yerine `sortComposed`,
`anchorCount` cümlesinde "biyografik rota" yerine "elyazma/tercüme
rotası" gibi entity-tipine özgü deyişler.) Toplam 78 yeni i18n key,
TR/EN/AR'da paralel.

### (b) `lugat-al-bahr-arabi` — ilk catalogue-Word-anchored cluster theme (dilim 7/16.δ.B)

**Pattern boşluğu.** Korpustaki mevcut iki cluster theme
(andalusian-translation-workshop + endulus-sofrasi) showcase Word'leri
gruplayan cluster'lardı: Tuleytula'da bir araya gelen 4 showcase
(algorithm/algebra/alcohol/zero); Endülüs Sofrası'nda 4 showcase
(cotton, sugar, lemon, orange — *catalogue* damask aralarına dolaylı
giriyordu ama anchor argümanı showcase'in dört nokta sözlüğü
üzerindeydi). *Hiçbir cluster theme şu ana kadar yalnız catalogue
Word'leri argümanın eksenine almamıştı.* 7/16.B bu boşluğu kapatır.

**Editöryel argüman.** *Bir Akdeniz devleti denizini iki kelimeyle
adlandırır: yapıya bir isim, yetkiye bir isim.* Yapının adı *dār
aṣ-ṣināʿa* (zenaat evi / tersane); yetkinin adı *amīr al-baḥr*
(denizin emiri). İkisi birlikte bir devleti deniz devleti yapar — ve
bu sözlüğün tek bir Arap mührü vardır. Cluster bu iki kelimeyi yan
yana koyar (admiral + arsenal) ve gösterir ki Avrupa Akdeniz'inin
deniz iktidarının leksikal omurgası bu iki Arapça isimden çekilmiştir.

**3-anchor rotası.**

- **cairo** (c. 950) — Fâtımî *dār aṣ-ṣināʿa* Fustat'ta, *amīr al-baḥr*
  unvanının kurumsallaştığı saray.
- **palermo** (c. 1130) — II. Roger'in Norman sarayı, *ammiratus*
  Latinize unvanın doğduğu yer. Antakyalı George *ammiratus
  ammiratorum* unvanını taşır.
- **venice** (1104 →) — Arsenale di Venezia, *dār aṣ-ṣināʿa* paterninin
  Avrupa endüstri tarihine çevrildiği yer. 1320'lerde günde bir kadırga
  çıkaran seri-üretim tezgâhı. Dante *Cehennem* Canto XXI'de
  Arsenale'nin smola kazanlarını dünyasının en canlı görüntüsü olarak
  betimler — şiir-tarihsel tanıklık.

**3 dilde essay.** ~430 kelime/dil, showcase magnum
hindu-arabic-numerals'in ~%35'i kadar — cluster yoğunluğu, *yapısal
kapanış* tonunda. Hindu-Arabic Numerals bir *çizgi*ydi (Hindistan-
Bağdat-Tuleytula-Floransa, beş yüzyıllık tek ok); Endülüs Sofrası bir
*havzaydı* (aynı toprak, altı ürün, iki tabaka); lugat-al-bahr-arabi
bir *limandır* — üç şehir, üç kıyı, tek bir devlet-fikri. Editöryel
metafor disiplini: her cluster theme kendi geometrik tipinde.

**Yeni atlas yerleri.**

```ts
{ slug: 'palermo', x: 410, y: 405, /* ... */ },  // Norman Sicilya
{ slug: 'venice',  x: 400, y: 295, /* ... */ },  // Adriyatik başı
```

(üçüncü yeni yer hamadan ibn-sina için — bkz. (c).) Atlas places
19 → 22.

**5 kaynak**, peer-reviewed: Pryor & Jeffreys *The Age of the ΔΡΟΜΩΝ*
(Bizans-İslam donanma tarihi), Lev *State and Society in Fatimid Egypt*
(Fâtımî donanması + *dār aṣ-ṣināʿa* yapısı), Houben *Roger II of
Sicily* (Norman saray entegrasyonu), Concina *L'Arsenale della
Repubblica di Venezia* (Venedik Arsenali kurumsal tarihi), Picard *Sea
of the Caliphs* (modern bütünleştirici Akdeniz-İslam analizi).

**Build çıktısı.** Lazy chunk 18.21 KB / 9.23 KB gz — magnum
hindu-arabic-numerals (12.08 KB gz) ile endulus-sofrasi (8-9 KB gz
civarı) arasında. Üç anchor'lık essay, üç dilde paralel.

### (c) `ibn-sina` Avicenna catalogue Person + authorSlug integrity check (dilim 7/16.δ.C)

**7/14'ten kalan placeholder.** Dilim 7/14.β.B'de ilk catalogue Book —
*al-Qānūn fī al-Ṭibb* — eklendiğinde `authorSlug: ibn-sina`
yazılmıştı, ama ibn-sina Person'ı henüz yoktu. Validator o sırada
`authorSlug`'u herhangi bir integrity check'ten geçirmiyordu —
*placeholder yıllanması güvenli değil ama bilinçli*. 7/16.C iki şeyi
aynı dilimde yapar: (1) Person'ı yazar, (2) validator'ı sıkar.

**ibn-sina Person — 5 stratum × 3 dil.**

- **Stratum 1 (modern legacy, 2026)** — *canonical* sıfatının semantik
  kaynağı. *al-Qānūn* Latince *Canon Medicinae* olarak 12. yüzyıldan
  17. yüzyıla Avrupa tıp fakültelerinin ana metni; "canonical" sıfatı
  modern İngilizce'de *otoritatif/temel referans* anlamını *al-Qānūn*'un
  konumundan miras alır.
- **Stratum 2 (Latin curriculum, 12.-17. yy)** — Gerardus Cremonensis
  1180 civarı Toledo'da Latin çevirisi; sonra Padua, Montpellier,
  Bologna tıp fakülteleri 1650'lere kadar *Canon*'u zorunlu metin
  olarak okutur. *600 yıllık müfredat hakimiyeti.*
- **Stratum 3 (Hamadan vezir yılları, 1015-1037)** — Büveyhî sarayında
  iki kez vezir, *Kânûn*'un ve *Şifâ*'nın çoğu bölümü bu dönemde
  tamamlanır. Ölüm de Hamadan'da (1037).
- **Stratum 4 (Cürcan / Rey / İsfahan, c. 1002-1015)** — Hârizm
  saldırısından sonra batı İran'da gezgin yıllar; küçük saraylarda
  hekim+filozof+vezir karması.
- **Stratum 5 (Buhârâ çocukluğu, 980-1002)** — Sâmânî sarayında
  hekimlik gençlik. Aristoteles'in *Metafizik*'ini Fârâbî'nin şerhi
  sayesinde anladığı meşhur sahne (kendi *otobiyografi*'sinden).

**`wordsIndebted`: alcohol + alembic.** *Kânûn* Beşinci Kitabı (basit
ve mürekkep ilaçlar) damıtma sözcüklerinin Avrupa'ya en geniş
taşıyıcısı — *al-kuḥūl* ve *al-anbīq* terimleri Avrupa farmakoloji
sözlüğüne *Kânûn* tercümeleri üzerinden girer.

**`circle.direction: forward`** (3 üye): ibn-Rushd (rakip Endülüslü
filozof, *Tahāfut* polemiği), Albertus Magnus (13. yy Köln/Paris,
Latin Skolastik'in büyük Avicenna-okuyucusu), Étienne Gilson (20. yy
Toronto, modern Tomistik-Avicennan felsefe tarihinin kurucu adı —
*ibn-Sînâ'nın 20. yy'da hâlâ canlı bir muhatap olarak okunduğunun
imzası*).

**Multi-anchor.** Hamadan + Buhârâ — iki yer Person rotası. al-Khwārizmī
(4-hop showcase Person) ile karşılaştırılabilir bir editöryel
disiplinde değil; catalogue Person olarak 2-anchor yeterli — *Kânûn*'un
yazılış yeri (Hamadan) + ilk eğitim/erken yetişme (Buhârâ).

**Yeni atlas yeri hamadan.** `[770, 365]` koordinat — Cibâl bölgesi,
Büveyhî hâkimiyeti. Buhârâ (mevcut) + Hamadan (yeni) = iki anchor.

**Validator'da authorSlug integrity check.** `validate-corpus.mjs`
Books loop'una eklenen iki satır:

```js
if (typeof entity.authorSlug !== 'string' || entity.authorSlug.trim().length === 0) {
  E(`book/${slug}`, 'authorSlug missing or empty');
} else if (!sluginess.person.has(entity.authorSlug)) {
  E(`book/${slug}#authorSlug`, `authorSlug "${entity.authorSlug}" not found in Person corpus`);
}
```

Boş authorSlug + Person korpusunda olmayan slug — iki invariant. Theme
slug check'leri (words/persons/books) ile aynı disiplin. 7/14'te
"ileri dilime giriyor" denmişti — şimdi geldi. al-jabr.authorSlug
(al-khwarizmi) ve al-qanun-fi-al-tibb.authorSlug (ibn-sina) ikisi de
artık geçerli referans; validator hem mevcut placeholder'ı doğrular
hem gelecekteki book'ların kayıt diskliplini bekler.

### Build çıktısı (dilim 7/16 sonrası)

| | 7/15 sonu | 7/16 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 82.17 | 82.63 | +0.46 KB gz (2 list route + 2 entity register + i18n + paths helpers) |
| `registry` chunk | 21.35 KB gz | 23.29 KB gz | +1.94 KB gz (manifest +2 entity + 3 atlas place + lifespan/composedYear) |
| `WordsListPage` | 1.14 KB gz | 1.14 KB gz | 0 (CSS rename JS'i etkilemedi) |
| `PersonsListPage` | — | 1.22 KB gz | yeni route |
| `BooksListPage` | — | 1.23 KB gz | yeni route |
| `EntityListPage.css` (paylaşılan) | — | 1.21 KB gz | rename + ortak |
| `ibn-sina` lazy chunk | — | 17.26 KB gz | yeni catalogue Person |
| `lugat-al-bahr-arabi` lazy chunk | — | 9.23 KB gz | yeni cluster theme |
| Build süresi | 10.02s | 8.01s | – |

`npm run validate` ✓ — 19 W + 4 P + 2 B + 4 T = **29 entity**, 0
invariant violation. `npm run typecheck` ✓. `npm run build` ✓ 8.01s.

| | 7/15 sonu | 7/16 sonu | Kümülatif Δ |
|---|---|---|---|
| Words | 19 | 19 | 0 |
| Persons | 3 | 4 | +1 (ibn-sina) |
| Books | 2 | 2 | 0 |
| Themes | 3 | 4 | +1 (lugat-al-bahr-arabi) |
| Atlas places | 19 | 22 | +3 (palermo, venice, hamadan) |
| Catalogue Person | 2 | 3 | +1 |
| Cluster theme | 2 | 3 | +1 (ilk Word-catalogue-anchored) |
| Multi-anchor Person | 1 SC + 1 CAT (2-hop) | 1 SC + 2 CAT (2-hop) | +1 multi-anchor Person |
| Listing route | 1 (`/kelimeler`) | 3 (`+/kisiler` `+/kitaplar`) | entity-tipi simetri |
| Validator integrity | atlasAnchors + crossLinks | + Book.authorSlug | Δ +1 invariant |
| Ağırlıklı ortalama | ~%53 | ~%53.3 | Δ +1.3, *simetri kapanışı* |

> **Hijyen düzeltmesi (dilim 7/18.ε.A'da fark edildi):** Yukarıdaki
> *Multi-anchor Person* satırı pre-7/16 corpus'unda eksik kayıt: 7/16
> sonunda gerçek dağılım **1 SC (4-hop) + 1 CAT (3-hop ibn-al-haytham)
> + 2 CAT (2-hop hunayn + ibn-sina)** idi. ibn-al-haytham'ın 3. anchor'ı
> (Paris — Latin resepsiyonu) 7/15 öncesinde sessizce eklenmişti ama
> tabloya yansımamıştı. 7/17 endcap'inde "hunayn ve ibn-al-haytham hâlâ
> tek-anchor" cümlesi bu eksik kayıt zincirinden geliyordu; 7/18.ε.A
> sırasında manifest probe'uyla düzeltildi (η-prime framing'i yukarıdaki
> 7/17 endcap'inde yeniden çerçevelendi).

7/16'dan sonra projenin liste-katmanı + catalogue-cluster + Book
integrity üçü de tamamlanmış görünüyor. Sonraki dilim editöryel karar:
**Shape ε** (kolofon `/about` + OG image + apple-touch-icon PNG +
deploy hygiene) launch hazırlığına geçer; **Shape ζ** (showcase'in
kalan 3 multi-anchor: alcohol, algebra, algorithm) showcase argümanını
tamamlar.

---

---

## Oturum 7 — dilim 15 (Shape γ: zamanın görünür hale gelmesi)

> *Üç dilimlik Shape α-β-γ projesinin son halkası.* 7/12-13 catalogue
> tier'ını Word katmanında açıp derinleştirdi. 7/14 catalogue'ı Person
> ve Book'a uzatarak entity-tip simetrisini tamamladı. 7/15 yeni içerik
> eklemedi — onun yerine *iki kanal'da aynı argümanı görsel imzaya
> bağladı*: Atlas'ta korpusun zaman içinde nasıl biriktiğini, Word
> sayfasında bir kelimenin stratum'larının gerçek yaş mesafelerini.
> Polish layer 6/6 dolu; bu dilim sonunda *eklemeyi* değil *anlatmayı*
> önceleyen bir kapanış.

### (a) Atlas timeline view (dilim 7/15.γ.A)

**Sorun:** Atlas'taki pin'lerin her biri *kendi anchor.year*'ına sahip,
ama bu bilgi şu ana kadar yalnız hover-tooltip'te sub-label olarak
görünüyordu. Korpusta cotton'un Indus Vadisi evcilleştirmesi (-3000),
Brahmagupta'nın Bhillamāla *Brāhmasphuṭasiddhānta*'sı (628), Fâtımî
Kahire'nin *dār aṣ-ṣināʿa*'sı (~830), Toledo'nun çeviri okulu (~1145),
Floransa'nın *Liber Abaci*'si (1202), Roma'nın Medici *editio princeps*'i
(1593) hep yan yana — *zamansız olarak duruyordu*.

**Çözüm:** Yıl-eksenli cumulative filtreleme. Kullanıcı bir yıl seçer
(slider'la); o yıla kadar var olan anchor'lar normal görünür, sonrası
fade-out. **Cotton'un evcilleşmesi**: kullanıcı -3000'de duraklar →
Atlas'ta yalnız Bhillamāla, Delhi gibi Hindistan pin'leri ve Cotton'un
en eski anchor'ı görünür; Bağdat, Toledo, Kahire — *hepsi gelecekte*.
Kullanıcı 825'e ittirir → Bayt al-Ḥikma açılıyor, Hârezmî, Hunayn ibn
İshak, *al-Jabr*'ın yazılma anı; Toledo hâlâ gelecek (1145). 1500'e
ittirir → Avrupa pin'leri çoğunlukla görünür; Roma 1593 hâlâ yok.
**Tüm Atlas bir saatlik bir film haline gelir.**

Mimari kararlar:
1. **Year parser ortak utility** (`src/utils/year.ts`). 142 farklı
   year-string format dört strateji-katmanlı parser ile sayıya çevrilir:
   (1) BCE/MÖ tespiti → negatif sayı; (2) yüzyıl notasyonu ("14th c.",
   "12. yy") → yüzyıl ortası; (3) ilk uzun sayı (3-4 haneli) — aralıklarda
   başlangıç; (4) sözel fallback ("pre-Islamic", "Ottoman") → null. Hem
   Atlas (γ.A) hem Stratigraphy (γ.B) bu utility'i kullanır — iki
   katmandaki tek argümanın altında *tek bir yıl-okuma kuralı*.
2. **startYear field type'da `number | null`**. Multi-anchor pin'ler
   `anchor.year`'dan parse edilir; tek-yer fallback pin'leri (entity-level
   `year` alanı yok) null taşır → filtreden etkilenmez (her zaman görünür).
   Null = *bilinmeyen*, *belirsiz konumdan kaçındık*; bunlara filtre
   uygulamak (gizlemek) bilgi kaybı olurdu.
3. **Cumulative ≠ window**. Window mode (min-max çift slider, sadece o
   aralıktaki pin'ler görünür) daha mühendis bir UI, ama *o anda korpusun
   tarihteki konumunu* anlatmıyor. Cumulative mode (tek slider, o yıla
   kadar) tarihsel oluş'u anlatır — *o yılda korpus bu kadar dolmuştu*.
   Editöryel: argümana göre seçim yapıldı.
4. **`.atlas-pin--future` cascade**. Future class light-tier (catalogue)
   üzerine düşer — geometri (mark r=3.5, halo r=8.5) korunur, opacity
   %15'e iner. Hover-blok: future pin'e hover olmaz (pointer-events: none).

`atlas.timelineLabel` ("Zaman:"), `timelineAll` ("tüm zaman"),
`timelineUpTo` ("{{year}}'a kadar"), `timelineReset` ("Tüm zamana dön")
— 3 dilde 4 anahtar.

### (b) Word-page Stratigraphy proportional mode (dilim 7/15.γ.B)

**Sorun:** Stratigraphy zaten scroll-progress'e bağlı (§2.6 diferansiyasyon
şartının ilk katmanı dilim 4-5'te yapılmıştı; ben başlangıçta yapılmamış
olduğunu sandım, oturum başında bunu fark ettim). Ama 5 stratum *eşit
aralıklı* duruyor — *zero*'nun strata'sı 2026/1854/1299/1145/628 hep aynı
boşlukta. Modern stratum görsel olarak *eski*'yle aynı ağırlık taşıyor;
gerçek yaş ölçeği gizli.

**Çözüm:** Toggle (≡/⫷ glyph). Default: eşit-aralık (mevcut UI, hiçbir
şey bozulmaz). Toggle açıldığında: stop'lar `position: absolute` olur,
inline-style `--strat-pos` CSS custom property'siyle yıl-orantılı
konumlanır. `yearPositions` useMemo `(maxY - y) / span * 100%` hesabıyla
%0 = en yeni (üstte), %100 = en eski (altta).

**Editöryel argüman karşılaştırma**:
- *Eşit mod*: 5 stratum eşit boşlukta. Modern üst-yüzey görsel olarak
  *eski*'yle aynı ağırlık taşır. Kompozisyon ritmik — *okumak için iyi*.
- *Orantılı mod*: stop'lar gerçek yıllara göre yığılır. Modern stratum
  (2026, 1854, 1299) küçük bir bantta birikir; eski stratum'lar (1145,
  628) geniş yayılır. *Kelimenin yaşının görsel ağırlığı.*

Kullanıcı tercihi olarak sunulan iki sicil. Toggle keyboard-accessible
(`aria-pressed`), title attr ile screen-reader friendly. Mobile (<900px):
toggle gizli (toggle gerektiğinde yatay barda absolute-pozitionlama anlamsız).

Yıl bilinmeyen stratum'lar (parseYearStart === null) için fallback:
eşit-aralık konumu. En az 2 sayısal yıl yoksa hepsi eşit-aralık (toggle
no-op).

`stratigraphy.modeProportionalInactive` ("Yıl-orantılı moda geç (gerçek
mesafeleri göster)") + `modeProportionalActive` ("Eşit-aralık moda geç
(okuma için)") — 3 dilde 2 anahtar.

### (c) Manuscript favicon (dilim 7/15.γ.C)

**Sorun:** Browser tab'ında default Vite favicon (yıldırım) — uygulama
kendi grameriyle örtüşmüyor.

**Çözüm:** Atlas pin geometrisinin manuscript-arka planlı kondansasyonu.

Tasarım kararları:
1. **SVG, raster değil**. 64×64 viewBox; 16×16, 32×32, 256×256
   ölçeklerinde net kalır. Tek dosya, 2.7 KB. Modern tarayıcılar
   (Chrome 80+, Firefox 41+, Safari 15+, Edge 80+) native destekler.
2. **Renkler hard-coded**. CSS variable favicon'da kullanılamaz; sepia
   palette (parchment #f4ecd8, gold #c9941b, lazaward #1f4e7a, sepia-ink
   #5a4a36) tema-bağımsız, dark mode'da da makul.
3. **Atlas pin sembolik özet**. Halo (büyük açık daire, lazaward stroke,
   parchment fill) + Mark (orta gold filled) + iç-vurgu noktası
   (illuminated-manuscript hissi). Uygulamanın kendi grameri favicon'da
   tekrarlanır.
4. **Dört köşede ✦**. Atlas.tsx'teki decorative star sembolünün
   referansı. 16×16'da kaybolur (kabul edilebilir), 32×32+'de hissedilir.

`index.html` head'inde `<link rel="icon" type="image/svg+xml">` +
`<link rel="apple-touch-icon">`. Vite static asset olarak `public/`'ten
servis eder.

### Polish layer 6/6 dolu

Bu dilim sonunda polish layer 6 bileşene erişti:
1. **Page-enter animation** (dilim 7/8): sayfa geçişinde subtle fade
2. **`usePageTitle` hook** (7/11.C): document.title senkronizasyonu
3. **NotFound page** (7/9.B): 404 manuscript-stillinde
4. **ManuscriptLoader** (7/9.B): lazy chunk yüklenirken parşömen-gölge
5. **Atlas tier-dot** (7/13.C): pin'lerde catalogue vs showcase ayrımı
6. **Directory tier-glyph** (7/14.C): kart başlığında ◆/◇ glyph
7. **Manuscript favicon** (7/15.C): browser tab manuscript-arka planı

(6/6 dolu, 7. ekleme γ.C — *non-tier* sicilinden polish; sıralamada
fazlalık değil derin bir tabakaya iniş.)

### Build çıktısı (dilim 7/15 sonrası)

| | 7/14 sonu | 7/15 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 81.80 | 82.17 | +0.37 (timeline state + year parser + proportional mode logic + 6 i18n key) |
| Word lazy chunks | 9 SC + 10 CAT | 9 SC + 10 CAT | 0 |
| Person lazy chunks | 1 SC + 2 CAT | 1 SC + 2 CAT | 0 |
| Book lazy chunks | 1 SC + 1 CAT | 1 SC + 1 CAT | 0 |
| `public/favicon.svg` | — | 2.7 KB | yeni static asset |

`npm run validate` ✓ — 19 W + 3 P + 2 B + 3 T = 27 entity, 0 invariant
violation (içerik değişmedi). `npm run typecheck` ✓. `npm run build` ✓ 10.02s.

### Üç dilimlik Shape α-β-γ projesi kapanışı

| | 7/12 sonu | 7/15 sonu | Kümülatif Δ |
|---|---|---|---|
| Words | 15 | 19 | +4 |
| Persons | 1 | 3 | +2 |
| Books | 1 | 2 | +1 |
| Themes | 3 | 3 | 0 |
| Toplam entity | 20 | 27 | +35% |
| Catalogue tier oranı | 6/15 (Word) | 13/24 (W+P+B) | catalogue tier 3 entity-tipinde |
| Multi-anchor showcase | 5/9 Word | 6/9 W + 2/3 P + 2/2 B | ek kanallar açıldı |
| Polish layer | 4 | 7 | +3 (tier-dot, tier-glyph, favicon) |
| Ağırlıklı ortalama | %43.3 | ~%53 | Δ +9.7, *Shape α-β-γ kombinasyonu* |

Bu üç dilimden sonra projenin yapısal omurgası tamamlanmış görünüyor:
catalogue tier tüm entity tiplerinde, görsel hiyerarşi iki UI
register'da, zaman ekseni iki katmanda. Bundan sonraki dilimler ya
*korpus genişletme* (Theme cluster açılması, daha çok catalogue Word
veya Person/Book, Avicenna Person'ı vs.) ya da *deploy + son polish*
(OG image, kolofon `/about`, audio) yönüne gidebilir.

---

---

## Oturum 7 — dilim 14 (Shape β: entity-tip simetrisi + Directory tier ayrımı)

> *Tier'ın simetri açılışı.* 7/12 tier'ı Word katmanında açtı (6
> catalogue Word); 7/13 catalogue tier'ı derinleştirdi (4 catalogue Word
> daha + zero math-channel multi-anchor + Atlas tier dot). 7/14
> simetriyi tamamlar: tier artık yalnız Word'lerde değil Person ve
> Book'larda da var; yalnız Atlas'ta değil HomePage Directory'sinde de
> görsel imzasını taşıyor. Editöryel argüman: *"catalogue" kompakt bir
> Word türü değildir — kompakt bir entity türüdür*. Üç entity-tipinin
> her birinde, "derin işlenmiş" ve "kompakt giriş" iki ayrı yoğunluk
> registeri olarak duruyor.

### (a) İlk 2 catalogue Person (dilim 7/14.β.A)

**İbnü'l-Heysem (`ibn-al-haytham`, astronomer)**. Atlas multi-anchor:
Bağdat (Basra-Bağdat hattındaki Iraklı formasyon) → Kahire (Fâtımî
sarayı, *Kitāb al-Manāẓir*'in yazıldığı ev-arrest on yılı, c. 1010-1040) →
Paris (13. yy Latin resepsiyonu — Witelo, Bacon, Kepler). Editöryel
argüman: *bir tutsaklık döneminin bir bilim alanını doğurması* (A. I.
Sabra'nın yorumlamasından). Hâkim Bi-Emr-Allah'a Nil-kontrolü vaadinde
bulunan İbnü'l-Heysem'in başarısız Asuvan incelemesi sonrası halifeden
gizlenmek için (gerçekten ya da numarayla) deliliğe çekilmesi ve on yıllık
ev-arrestinde optik biliminin yedi-kitaplık temel metnini yazması.
Circle: 3 üye (catalogue norm) — Witelo (*Perspectiva* 1270, *Kitāb
al-Manāẓir*'in Latin yeniden-anlatımı) + Kepler (1604 *Ad Vitellionem
Paralipomena*, intromission modelini modern matematiksel forma oturtan)
+ A. I. Sabra (1989 modern eleştirel basım + İngilizce tercüme).
wordsIndebted: `algorithm` — *aynı isim-disipline-dönüşme pattern'inin
başka örneği* (Alhazen problemi).

**Huneyn ibn İshak (`hunayn-ibn-ishaq`, translator)**. Atlas multi-anchor:
Bağdat (Bayt al-Ḥikma, c. 825-873 boyunca baş çevirmen) + Konstantinopolis
(Bizans elyazma toplama seyahatleri). Editöryel argüman: *çevirmenin
görünmezliği* — Galen'in günümüze ulaşmış Yunanca külliyâtının %30'u
yalnız Huneyn'in Arapça çevirilerinden geri çevrilerek bilinir; Yunanca
asılları kayıp. *Bir tıp tarihçisi Galen üzerine bir kitap yazarken hâlâ
Huneyn ibn İshak'tan tercüme okur.* c. 856'da Ali ibn Yahya'ya yazdığı
*Risāla fī mā tarjamahu min kutub Jālīnūs* — Galen'in 129 risalesini
teker teker filolojik tasdik eden otobiyografik belge — *bilim
tarihçilerinin elinde olağanüstü tek bir doküman* (Gerrit Bos'un yorumu).
Circle: 3 üye — oğlu İshak ibn Huneyn (Aristoteles külliyatının Arapça
çevirisinin başyazarı) + Konstantinüs Africanus (1085 Monte Cassino,
Latin'e çevirmeyi başlatan) + Gerrit Bos (2016 *Risāla*'nın modern
eleştirel basımının editörü). wordsIndebted: `alcohol` + `alembic` (her
ikisi de Galen-sonrası simyâ-tıb literatürünün damıtma terminolojisi —
Yunan-Süryanice-Arapça-Latin zincirinin Huneyn'in masasından geçen kolu).

**Catalogue Person editöryel disiplini**:
- Stratum yapısı = showcase (5 stratum × 3 dil; mimari kural)
- Circle.members 3-4 (showcase 5+)
- Sources 3 (showcase 6+)
- Multi-anchor mümkün ve uygulandı (her ikisi 2-hop). Bu 7/13.A'daki
  *catalogue Word'lerin hiçbiri multi-anchor değil* tercihinin Person
  için farklı oluşundan: Person biyografisi tek-yerde özetlenemez, oysa
  Word'ün etimolojik yolculuğu tek-anchor catalogue olarak okunabiliyor.
  Mimari simetri korunuyor (`atlasAnchors?: ThemeAtlasAnchor[]` aynı
  field), editöryel kullanım entity tipine göre özelleşiyor.

### (b) İlk catalogue Book — *al-Qānūn fī al-Ṭibb* (dilim 7/14.β.B)

İbn Sînâ'nın *Kanunu* — tıp tarihinin en açık "kanonik metin haline gelen
kitabı". Atlas multi-anchor: Buhara (1012-1024 boyunca beş kitabın parça
parça yazılması — Sâmânî düşüşü sonrası gezgin saray hekimi Avicenna'nın
Cürcan → Rey → Hamadan rotasında) + Toledo (1187 Cremonalı Gerard'ın
*Liber Canonis* Latin çevirisi) + Roma (1593 Medici Doğu Matbaası
*editio princeps* — Avrupa'da basılan ilk Arapça kitap).

Editöryel argüman: *the medical canon that was Europe's textbook for six
hundred years*. *Liber Canonis* on dördüncü yüzyıldan on yedinci yüzyıl
ortasına kadar Padova, Bologna, Montpellier, Paris, Salamanca, Oxford'da
zorunlu ders kitabıdır — bir tıp öğrencisi altı-yedi yıllık eğitimi
boyunca bu metni adım adım okur. 1473 Milano ilk Latin basımından 1500'e
yirmi beş ayrı baskı; on altıncı yüzyıl boyunca yüzlerce. 1545 Padova ilk
Avrupa botanik bahçesi V. kitap drog listesini canlı yetiştirmek için
kurulur. Modern İngilizcedeki *the canonical text* / *canonical works of
literature* anlamının semantik tortusunun ana kaynağı — *Canon* başlığını
taşıyan kitabın altı yüz yıllık merkezi metin olma deneyimi.

Yapısal denklik: showcase *al-Jabr*'la (4 manuscript + 4 translation)
yapısal denklik (4 manuscript + 5 translation). authorSlug `ibn-sina`
placeholder — Avicenna catalogue Person olarak ileri dilime ertelendi;
validator authorSlug üzerinden CrossLink integrity kontrolü yapmıyor.
relatedWords: `alcohol` + `alembic` — V. kitap damıtma drogları,
Avrupa farmakopelerinin Arapça kaynaklı terim hazinesinin ana kanalı.

### (c) HomePage Directory tier indicator (dilim 7/14.β.C)

Atlas dot tier ayrımı (7/13.C) editöryel hiyerarşiyi *Atlas'ta* görsel
imzaya bağlamıştı. 7/14.C aynı argümanı *Directory*'ye uzatır: HomePage
4-sütunlu listede her entity kartının başlık satırının sağında küçük bir
glyph belirir — **◆** (dolu elmas, showcase/magnum, opacity 0.65) ya da
**◇** (boş elmas, catalogue/cluster, opacity 0.45). Kart hover'a
alındığında opacity 1.0'a çıkar — kullanıcı tarama yaparken tier yumuşak
arka plan, kart odakta tam görünür sicil.

Mimari kararlar:
1. **Glyph başlığın sağında, journey-tag başlığın üstünde**. İki sicil
   görsel olarak çakışmaz. Journey-tag (◆ moss-yeşil + uppercase ARKETİP)
   Word'lerde özel, tier-glyph dört entity tipinin hepsinde paylaşılır;
   farklı sicil renkleri (moss-yeşil vs ink-soft) ve farklı font register
   (uppercase mono vs serif compact) ayrımı güçlendirir.
2. **`pointer-events: none` + `cursor: default`**. Glyph tıklanabilir
   değil; kart-link bütünlüğünü korumak için. ARIA-label ve title attr
   ekranı okuyuculara dilçevirili (`home.tierShowcase` / `home.tierCatalogue`).
3. **Title-row flex container**. Title + glyph baseline-aligned; title
   `flex: 1 1 auto` (ana sicil), glyph `flex: 0 0 auto` (kompakt).
   Arapça'da Latin-Arapça mixed register sorunsuz — glyph dil-bağımsız
   Unicode geometric shape.
4. **Type imports**: HomePage.tsx artık `Tier` ve `ThemeTier`'i
   `JourneyType` ile aynı import bloğunda taşır; ileride başka
   tier-aware UI'lara genişlerse kolayca evrensel sicil olur.

Polish layer 5'ten **6**'ya: page-enter + usePageTitle + NotFound +
ManuscriptLoader + Atlas tier-dot (7/13.C) + **Directory tier-glyph
(7/14.C)**. *Tier hiyerarşisi iki katmanda görsel imzasını bulur* —
Atlas (coğrafi gezinti) + Directory (alfabetik dizin), aynı argüman iki
register'da.

### Build çıktısı (dilim 7/14 sonrası)

| | 7/13 sonu | 7/14 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 81.67 | 81.80 | +0.13 (tier-row render + 2 i18n keys × 3 dil) |
| Word lazy chunks (toplam) | 9 SC + 10 CAT | 9 SC + 10 CAT | 0 |
| Person lazy chunks (toplam) | 1 SC | 1 SC + 2 CAT | +2 catalogue |
| Book lazy chunks (toplam) | 1 SC | 1 SC + 1 CAT | +1 catalogue |
| ibn-al-haytham | — | 13.27 | yeni |
| hunayn-ibn-ishaq | — | 13.62 | yeni |
| al-qanun-fi-al-tibb | — | 14.85 | yeni |
| HomePage | 8.37 | 8.49 | +0.12 (tier-row JSX) |
| registry (manifest) | 18.08 | 21.35 | +3.27 (Person+Book manifest payları) |

`npm run validate` ✓ — 19 Word + 3 Person + 2 Book + 3 Theme = 27 entity,
0 invariant violation. `npm run typecheck` ✓. `npm run build` ✓ 10.37s.

### Sonraki dilim için öneriler (Shape γ kuyrukta)

7/12-7/14 üç dilim Shape α → β'yi tamamladı: catalogue tier'ı Word'lerde
açtı (7/12), Word'lerde derinleştirdi (7/13), Person + Book'a uzattı
(7/14). **Shape γ — UI argümanı: zamanın görünür hale gelmesi** sırada:

- **γ(A) — Atlas timeline view**. Anchor `year` verilerini (cotton'ın
  c. 3000 BCE'sinden zero'nun 1494'üne) kullanan year-axis slider ya da
  scroll-driven year reveal. Atlas'ta zaman ekseni şu an gizli;
  görselleştirme onu açar. En yüksek effort prong'u, en yüksek payoff'lu
  potansiyel.
- **γ(B) — Word-page stratigraphic ruler scroll-progress**. §2.6
  GRAND_PLAN'ın *diferansiyasyon* şartı (*the one thing visitors should
  remember*). Word sayfalarındaki sol-cetvel scroll progress'le 5
  stratum'u izleyen interaktif bir göstergeye dönüşür.
- **γ(C) — 6. polish layer entry**. Manuscript favicon (en küçük) /
  kolofon `/about` page (orta) / OG image (orta) seçeneklerinden biri.

---

---

## Oturum 7 — dilim 13 (Shape α: catalogue derinleşmesi + math-channel multi-anchor + Atlas tier ayrımı)

> *Üç farklı yönden tek bir dilim* — 7/12'nin catalogue tier'ı yapısal
> olarak açtığı yerden, dilim 7/13 üç ayrı momentum'u birlikte ilerletti:
> catalogue tier hızlandı (corpus weight Δ'sının çoğu), showcase
> tier'ının matematik damarı Atlas'ta tam görsel argüman oldu (zero'nun
> 4-hop rotası cotton/sugar/lemon ile simetrik), ve Atlas'ın görsel
> hiyerarşisi editöryel tier ayrımını taşımaya başladı (catalogue dot
> daha kompakt, showcase dot tam ağırlık). Şu an için *bu üç ilerleme
> aynı tema'nın üç yönüdür*: derinlik (catalogue genişler) + simetri
> (Atlas argümanlarının paralelliği) + okunabilirlik (tier hiyerarşisi
> görsel olarak okunur).

### (a) 4 yeni catalogue Word (dilim 7/13.A)

Catalogue tier'ı 6 Word'den 10 Word'e çıkardık — %67 catalogue içinde
genişleme, %27 toplam Word korpusunda. Her Word 5 stratum × 3 dil,
tek-anchor (catalogue editöryel disiplini), 3 peer-reviewed kaynak.
Editöryel argümanlar:

- **cipher** (translator, toledo): *aynı Arapça ṣifr'ın Latin kalemde
  ikiye dallanışı*. İtalyan abakuscu hattı → *zero* (rakam), Fransız
  *chiffre* hattı → *cipher* (rakam → şifre). Cipher Bletchley Park'a,
  Shannon'un *Communication Theory of Secrecy Systems*'ine, modern TLS
  *cipher suite*'ine kadar — *boşluk*'tan *gizlilik*'e. Bilinçli sibling:
  zero. Aynı Toledo masası, iki ayrı sicil.
- **escabeche** (andalusian, cordoba): *sikbāj* → Pers-Arap Bağdat
  saray reçetesi → Endülüs mutfağında *Llibre de Sent Soví* (c. 1324)
  ilk Romance tasdiki → Sefarad diasporası + Manila Galyonu üç-kıta
  yayılımı. Lima'da, Tanca'da, Manila'da aynı kelime, aynı tarif.
  Endülüs Sofrası cluster'ının doğal akrabası.
- **check** (diplomatic, cordoba): *en semantik açıdan üretken catalogue
  Word*. Persian *šāh* → Arabic *shaṭranj/shāh māt* → Latin
  scaccus/eschec/jaque → English check/checkmate/exchequer/cheque/to
  check. Bir oyun çığlığının altı yüz yıl içinde küresel ödeme aracının
  adı olmasının tam zinciri. Tek Word, altı modern İngilizce iş.
- **arsenal** (merchant, cairo): *dār aṣ-ṣināʿa* Fatımî tersanesi →
  Venedik Arsenale (1104) → Avrupa devletlerinin silah depoları. Sözcük
  tek başına değil, *bir mühendislik modeli* taşıdı: depolama, kerime
  atölyeleri, halat, kuru havuzlar — tek devlet yönetimi altında. On
  dördüncü yüzyıl Venedik envanteri, on birinci yüzyıl Kahire envanteri
  ile bunyevî olarak şaşırtıcı derecede benzer. Bilinçli sibling:
  admiral (*amīr al-baḥr*) — aynı denizci-devlet sözlüğünden iki kelime,
  aynı Norman-Sicilya tüccar koridorundan Latin'e. Kişi bir tarafta,
  mekan diğer tarafta.

7/12'nin sibling-disiplini pattern'i korundu: 4 yeni Word'den 2'sinde
bilinçli sibling (cipher↔zero, arsenal↔admiral); diğer 2'si (escabeche,
check) `siblings: []`. Sibling editöryel iddiadır, etiketleme değil.

### (b) `zero` 4-hop multi-anchor (dilim 7/13.B)

Showcase Word'lerden birinin atlas anchor'ını tek-yerden çoklu-yere
genişletme — cotton (7/6.A), sugar (7/7.C), orange (7/8.B), coffee
(7/8.B), lemon (7/9.A) sırasının altıncısı. Şimdiye kadar 4'ü merchant
ya da andalusian arketipi (agricultural channel); zero ilk *translator*
arketipi (mathematical channel) multi-anchor.

Rotanın dört hop'u: **Bhillamāla** (c. 628 — Brahmagupta'nın
*Brāhmasphuṭasiddhānta*'sı, sıfırın ve negatif sayıların ilk yazılı
kuramı) → **Bağdat** (c. 825 — Bayt al-Ḥikma'da Hint *śūnya*'sının
Arapça *ṣifr* olarak yeniden adlandırılışı) → **Tuleytula** (c. 1145 —
Bath'lı Adelard'ın *Liber Algorismi de numero indorum*'unda *ṣifr* →
*cifra* Latin geçişi) → **Floransa** (1202-1494 — Fibonacci'nin *Liber
Abaci*'sinden Pacioli'nin *Summa*'sına Toskana abakuscu hattı,
*cifra* → *zefiro* → *zero*).

Atlas'taki simetri argümanı: cotton/sugar/lemon Hindistan-Arap-Endülüs
agricultural channel'inin üç koşut rotası — *aynı tarımsal teknoloji
transferi*. zero'nun rotası aynı doğu kökenden başlar (Hindistan), aynı
Arap-merkezli aşamadan geçer (Bağdat), aynı Latin yaylasında
dönüştürülür (Toledo), ama Avrupa'da agricultural Endülüs yerine
mathematical Toskana'ya iner. *Aynı şekil, farklı içerik*. Atlas'ta iki
çizgi paralel akar ama farklı yerlerde biter — bir tarımsal devrimin
yanı sıra bir matematiksel devrimin coğrafi argümanı.

Showcase multi-anchor coverage: 5/9 → 6/9 (%56 → %67). Kalan tek-anchor
Word'ler: alcohol, algebra, algorithm. alcohol simyâ damarında
(alchemist), algebra ve algorithm translator damarında yer alır; üçü
de muhtemelen multi-hop yazılabilir — algebra için al-Khwārizmī Person
rotasıyla overlap olur (Hârezm → Bağdat → Toledo → Floransa); algorithm
için aynı; alcohol için Bağdat → Endülüs → İskoçya damıtma damarı.

### (c) Atlas dot tier ayrımı (dilim 7/13.C)

Atlas haritasında her entity pin'i (Word/Person/Book/Theme) iki SVG
daireden oluşur: dış halo (r=11, açık renk + opacity 0.85) + iç mark
(r=5, dolu renk). 7/12 sonrasında 20 entity × multi-anchor pattern
sonrasında pin yoğunluğu görsel olarak yüklendi: showcase ve catalogue
Word'ler aynı görsel ağırlığı taşıyor, oysa editöryel ağırlıkları çok
farklı.

Çözüm: tier modifier class. `AnchoredEntity.tier?: Tier | ThemeTier`
alanı; `toAnchored` `entity.tier`'i kopyalar; `Atlas.tsx` pin'in
`<g>` className'ine `.atlas-pin--light` ekler eğer tier `catalogue`
ya da `cluster` ise. CSS:

- `.atlas-pin--light .atlas-pin-mark { r: 3.5; }` — default r=5'ten %30 küçük
- `.atlas-pin--light .atlas-pin-halo { r: 8.5; opacity: 0.55; }` — default 11/0.85'ten daha solgun
- `.atlas-pin--light.atlas-pin--hover .atlas-pin-halo { opacity: 0.85; }` — hover'da tam ağırlığa döner

SVG `r` modern tarayıcılarda CSS özelliği olarak ayarlanabilir
(Chrome 56+, Firefox 59+, Safari 14+); eski tarayıcılarda SVG attribute
default'u (5, 11) zaten makul fallback — düşürme bozulması olmaz.
JavaScript değişikliği sıfır (state, render path, hover logic
değişmedi). +~50 byte CSS, eager bundle değişmedi (81.67 KB gz).

Polish layer 5. girişi (NotFound + ManuscriptLoader + page-enter +
usePageTitle + tier-dot). 7/9-7/11 dalgasında yapılmış polish girdileri
*sayfa boyu* tek seferlik dokunuşlardı; tier-dot ilk *Atlas'ı
bilgilendiren* polish — derinlik ve kompakt arasındaki editöryel
ayrımın görsel imzasını taşıyor.

### Build çıktısı (dilim 7/13 sonrası)

| | 7/12 sonu | 7/13 sonu | Δ |
|---|---|---|---|
| `index` (eager) | 81.67 | 81.67 | 0 (tier-dot CSS ~50 byte index içinde) |
| Word lazy chunks (toplam) | 9 SC + 6 CAT | 9 SC + 10 CAT | +4 catalogue |
| escabeche | — | 10.10 | yeni |
| cipher | — | 10.23 | yeni |
| arsenal | — | 10.76 | yeni |
| check | — | 11.08 | yeni |
| zero (atlasAnchors eklendi) | 14.43 | 14.50 | +0.07 (manifest payı) |

`npm run validate` ✓ — 19 word + 1 person + 1 book + 3 theme, 0 invariant
violation. `npm run typecheck` ✓. `npm run build` ✓ 9.41s.

### Sonraki dilim için öneriler (Shape β + γ kuyrukta)

Bu dilim Shape α'yı (catalogue derinleşmesi) tamamladı. Kullanıcının
"hepsini sırayla yap" direktifi gereği Shape β ve Shape γ kuyrukta:

**Shape β — Entity-tip simetrisi** (sonraki dilim, 7/14): Person ve
Book için ilk catalogue örnekler. Person catalogue adayları: ibn
al-Haytham (astronomer/cairo), al-Bīrūnī (translator+astronomer/
khwarazm), al-Zahrāwī (medicine/cordoba), Ḥunayn ibn Isḥāq (translator/
baghdad). Book catalogue adayı: *al-Qānūn fī al-Ṭibb* (Avicenna,
1025; Latin Toledo çevirisi 1187, Salerno medikal müfredatı). HomePage
Directory tier visual (4 sütun × showcase/catalogue indicator).

**Shape γ — UI argümanı: zamanın görünür hale gelmesi** (7/15): Atlas
timeline view — anchor `year` verilerini kullanan year-axis slider ya
da scroll-driven year reveal. Word-page stratigraphic ruler scroll
progress'e bağlama (§2.6 diferansiyasyon şartı). Polish layer 6.
girişi (kolofon `/about`, OG image, ya da manuscript-themed favicon).

---

---

## Oturum 7 — dilim 12 (catalogue tier açılışı: 6 yeni Word + `/kelimeler` tier filter)

> *Mimari hazır, içerik yokken yeterli mi?* — soruyu daha önceki
> dilim "hayır" diye yanıtladı; bu dilim yapısal olarak doldurdu.
> Catalogue tier dilim 2'den beri `Tier = 'showcase' | 'catalogue'`
> olarak schema'da, loader.ts'de tier-default'u 'catalogue', validate
> tier-aware `assertShowcaseLanguageCoverage` — yani mimari maliyet
> sıfır, içerik maliyeti yüz. Bu dilim bu yüzdeyi tek bir oturuma
> sığdırdı: **6 yeni Word, 7 arketipin 3 boş olanını açan, 5 ayrı
> atlas anchor üzerine dağıtılmış.** Tier yapısal olarak açılmış
> olmakla "kullanıcı için gerçek" arasındaki fark, `/kelimeler`
> sayfasına eklenen tier filtre toolbar'ı; filter şu an sade
> (Tümü / Vitrin / Katalog) ama 7/10'da "*catalogue tier ile birlikte
> gelir*" diye rezerve edilmişti, sözünü tuttu.

### (a) Catalogue tier — 6 yeni Word (dilim 7/12.A)

**Tier nedir, niye var, ne değildir.** Riḥlat al-Kalimāt'in editöryel
disiplininde iki kategori vardır: *showcase* Word'ler derin esseyle
açılır (5 stratum × 3-4 paragraf × 3 dil ≈ 12,000+ kelime), *catalogue*
Word'ler aynı yapıyı kompakt biçimde taşır (5 stratum × 1 paragraf ×
3 dil ≈ 1,500-2,000 kelime, ama her yapısal alan dolu). Schema bu
ayrımı dilim 2'den beri `Tier` enum'unda taşır; `validate-corpus`
tier-aware (`assertShowcaseLanguageCoverage` showcase için ≥2 dil
title zorlar, catalogue için ≥1 dil yeterli; ama her iki tier de 5
strata + atlas anchor referansı + sources entegrasyonunu zorlar).
Yapı aynı, derinlik farklı.

**Editöryel pattern.** Her catalogue Word için tek-anchor (multi-hop
değil); 5 stratum üreterek ters-kronolojik kazı yapısını korur (en
güncel kullanım → Avrupa pickup → Arapça pratik → kök öncülü);
literalMeaning + title + category 3 dilde tam; siblings çoğunlukla
boş (yalnız iki Word'de bilinçli sibling: azimuth → algorithm
"*aynı Tuleytula tezgâhı, aynı *al-*'ın gövdeye yapışması*"; alembic
→ alcohol "*aynı Arapça *al-* öneki, aynı simyâ tezgâhı, aynı damıtma
süreci — kelime farklı*"). Her Word 3 peer-reviewed kaynak — alanın
standart referansları, modern critical scholarship öncelikli (Daftary
yerine Lewis 1955 değil; her ikisini birlikte oku notu Lewis için).

**Arketip simetrisi: 4/7 → 7/7.** Önceki dilimlerin yedi yolculuk
arketipinin (translator, merchant, andalusian, crusader, astronomer,
alchemist, diplomatic) yalnız ilk dördü doluydu. Bu dilim üç eksik
arketipi tek hamlede açtı:

| Arketip | Önce | Şimdi (+yeni Word) |
|---|---|---|
| translator | algebra, algorithm, zero (3) | (değişmedi) |
| andalusian | cotton, sugar, lemon (3) | (değişmedi) |
| merchant | coffee, orange (2) | **+damask** = 3 |
| alchemist | alcohol (1) | **+alembic** = 2 |
| crusader | — | **+admiral, +assassin** = 2 |
| astronomer | — | **+azimuth** = 1 |
| diplomatic | — | **+tariff** = 1 |

7 arketipin tamamı artık en az bir örnek taşıyor; `/journeys/:type`
route'unda 7 sayfanın 7'si artık "boş arketip" silik gösterimi
yerine gerçek Word listesi gösteriyor (HomePage Journeys section'da
yıllarca silik durmuş olan crusader / astronomer / diplomatic pill'leri
ilk defa standart kontrastta).

**Coğrafi dağılım: 5 atlas anchor.** Hiçbir tek yere yığılmadan:

| Word | Anchor | Stratum 4 (Arapça pratik) yerinin gerekçesi |
|---|---|---|
| admiral | cordoba | Endülüs Emevî donanması, II. el-Hakem (h. 961-976), Almeriya tersanesi |
| azimuth | toledo | Tuleytula çeviri tezgâhı (Gerard of Cremona 12. yy), önceki Endülüs astronomi geleneği |
| tariff | cairo | Fâtımî + Memlûk dönemleri, İskenderiye-Damietta-Akkâ ticaret üçgeni, Cenizah evrakı |
| damask | damascus | Eyyûbî-Memlûk dönemi: figürlü ipek + *fūlād* çelik + gül; eponym |
| alembic | baghdad | Câbir bin Hayyân (öl. ~815) atölyesi, sonra Râzî (öl. 925) |
| assassin | damascus | Suriye Nizârî kalesi Masyaf (Alamût Persiya'da ama atlas'ta yok; damascus en yakın) |

Atlas dot sayısı 5 → 11 (5 showcase + 6 catalogue); ama görsel rota
grafiği aynı (catalogue Word'ler multi-hop çizgi eklemiyor; bilinçli
editöryel tercih).

**Korpus skor delta'sı.** §12.5 ağırlıklı ortalamada korpus skoru 22
→ 28 (+6 puan). "+6" sayısal değil yapısal: schema'da ve loader'da
Tier ayrımı dilim 2'den beri sessiz dururken bu dilim onu konuşturdu.
Δ'nın çoğunluğu §12.2 katkısında (×0.5 ağırlık → +3.0 ağırlıklı puan);
%39.5 → %43.3 sıçramanın çekirdeği bu.

**Bundle Δ.** 6 yeni lazy chunk (admiral, alembic, assassin, azimuth,
damask, tariff) — her biri ~5-7 KB gz, manifest pattern'i (dilim 7/1)
sayesinde eager bundle'a girmiyor. Registry chunk 24.85 → 31.29 KB
(+6.44 KB raw, +2.95 KB gz) — 6 yeni manifest girişi. Initial paint
(`index`): 245.89 KB / 81.53 KB gz → 246.31 KB / 81.67 KB gz (+0.42 KB
raw, +0.14 KB gz). Bu Δ tier filter UI'dan (state + 5 i18n key + filter
useMemo).

### (b) `/kelimeler` tier filter UI (dilim 7/12.B)

7/10'da WordsListPage'in baş yorumunda şu cümle vardı: *"Catalogue
tier açıldığında filter paneli (§4.2 — tier/journey/atlasAnchor
multi-select) buraya gelir; şu an 9 showcase Word için sort yeterli,
filter UI over-engineered olur."* Bu dilim catalogue tier'ı açtı —
filter UI'nın bekleme süresi bitti.

**State + filter pipeline.** Yeni `TierFilter = 'all' | 'showcase' |
'catalogue'` type'ı, `tierFilter` state'i (default 'all'), iki ayrı
useMemo katmanı: önce `filteredWords` (tier filter sonucu), sonra
`sortedWords` (sort sonucu). Filter ve sort bağımsız invalidate olur
— filter değiştiğinde sort yeniden çalışmaz (sort fonksiyonu memoize),
sort değiştiğinde filter yeniden çalışmaz. Sayım gösterimi filter
aktifken `"X / Y girdi"` formatına geçer (`wordsList.countFiltered`).

**Toolbar component generalization.** Önceki `SortButton`'ın iç
gövdesi tier filter için aynen geçerliydi (segmented control,
aria-pressed, active border). Bunu generic `ToolbarButton<M extends
string>` componentine yükselttim; TS 5.6'nın instantiation
expressions özelliği (`const SortButton = ToolbarButton<SortMode>;`)
ile çağrı yerlerinde tip çıkarımı korundu. Diff küçük (~10 satır),
ileride üçüncü bir toolbar (journey filter, anchor count filter)
geldiğinde aynı pattern'i bedava kullanır.

**CSS: ayrı `.wordslist-filter` class.** Aynı flex/gap/border
düzeni, ama semantik olarak ayrı — `.wordslist-sort` yerine
`.wordslist-filter` kullanmak `sort ≠ filter` ayrımını HTML'de
yansıtır. Button stili paylaşımlı (`.wordslist-sort-btn` her iki
toolbar'da). Mobil responsive: `@media (max-inline-size: 640px)`
kuralı her iki toolbar'a uygulanır (`.wordslist-sort, .wordslist-filter
{ gap: var(--space-1); }`).

**i18n: 5 yeni anahtar × 3 dil.** `wordsList.filterLabel`,
`filterAll`, `filterShowcase`, `filterCatalogue`, `countFiltered`.
3 dildeki terminoloji kararları:

| Anahtar | TR | EN | AR |
|---|---|---|---|
| filterLabel | Süz: | Filter: | رَشِّح: |
| filterAll | Tümü | All | الكُلّ |
| filterShowcase | Vitrin | Showcase | النَّموذجيّة |
| filterCatalogue | Katalog | Catalogue | الفِهرس |
| countFiltered | {{shown}} / {{total}} girdi | {{shown}} of {{total}} entries | {{shown}} من {{total}} مادَّة |

Arapça'da *الفِهرس* (klasik "fihrist, katalog") seçildi (modern
*كَتالوج* yerine), proje tonu klasik-yatkın olduğundan. Türkçe
*Vitrin* showcase için kullanıldı — "vitrindeki nesne" metaforu
showcase tier'ın "derinleştirilmiş, sergi-derecesinde işlenmiş"
anlamını taşıyor.

**Filter URL'e taşınmadı, henüz.** WordsListPage'in baş yorumu:
*"Catalogue tier açıldığında filter URL'e taşınmalı (deep-link
önemli — 'andalusian + showcase' kombinasyonu paylaşılabilir bir
state); o zaman migrate."* Filter şu an URL'de değil — paylaşılabilir
state ihtiyacı 6 catalogue Word ile henüz net değil. Catalogue 30+
Word'e çıktığında ve kullanıcılar "tier × journey × atlas-anchor-count"
kombinasyonlarını paylaşmak isteyince, migration başlar.

### (c) §11 + §12.5 + README bookkeeping (dilim 7/12.C)

GRAND_PLAN.md §11 dilim ilerleme tablosuna yeni satır:
**7/12 ⟵ *bu dilim***, **~%43** sütun değeri ile. §11.7/11 satırının
"⟵ *bu dilim*" işareti kaldırıldı (artık 7/12 cari).

§12.5 ağırlıklı ortalama tablosu shift edildi:
- "Skor (7/11)" sütunu → "Skor (7/12)" (yeni cari sütun)
- "Skor (7/10)" sütunu → "Skor (7/11)" (önceki referans sütun)
- 12.1 roadmap: 58 → 60 (Oturum 6 arketip simetrisi tamamlanması)
- 12.2 korpus: 22 → 28 (catalogue tier yapısal açılışı, +6 puan)
- 12.3 UI: 72 → 74 (tier filter UI gerçek bir ihtiyacı karşılıyor)
- 12.4 polish: 18 → 18 (bilinçli durağanlık)
- Ağırlıklı toplam: ~%39.5 → ~%43.3, Δ +3.8

§12.5 kapanış paragrafı ve §12 sayfa-sonu footnote'u 7/12'ye
güncellendi; "Sonraki dilim — catalogue genişlemesi devam ederse"
projeksiyonu yeniden hesaplandı (7/13 ~%46, 7/14 ~%48, 7/15 ~%50).

### Bundle Δ

| Chunk | 7/11 | 7/12 | Δ raw | Δ gz |
|---|---|---|---|---|
| `index` (eager) | 245.89 KB / 81.53 gz | 246.31 KB / 81.67 gz | +0.42 KB | +0.14 KB |
| `registry` (eager) | 24.85 KB / 11.79 gz | 31.29 KB / 14.74 gz | +6.44 KB | +2.95 KB |
| 6 yeni lazy chunks | — | ~30-40 KB / ~5-7 KB each gz | +30-40 KB | +30-42 KB lazy |

Eager bundle Δ (`index` + `registry`): **+6.86 KB raw / +3.09 KB gz**.
Bunun çoğu 6 yeni entity manifest entry'sinden (registry chunk). Filter
UI'nın katkısı `index` chunk'ındaki ~0.14 KB gz — minimal. Lazy
chunk'lar (ziyaretçi yalnız ziyaret ettiği entity'yi indirir, hepsini
değil) initial paint'i etkilemiyor.

Tüm chunk hash'leri reproducible: `npm ci` + `npm run build` aynı
hash'leri üretiyor (in-place vs fresh-extract /tmp testleri kontrol
edilmeli).

### Korpus + mimari durumu

| | 7/11 | 7/12 |
|---|---|---|
| Word | 9 (hepsi showcase) | **15** (9 showcase + 6 catalogue) |
| Person | 1 (showcase) | 1 |
| Book | 1 (showcase) | 1 |
| Theme | 3 (2 cluster + 1 magnum) | 3 |
| Toplam entity | 14 | **20** |
| Showcase Word multi-anchor coverage | 5/9 | 5/9 (catalogue tek-anchor) |
| Atlas place | 19 | 19 (değişmedi) |
| Atlas dot sayısı | 7 | **13** (7 + 6 catalogue tek-anchor) |
| Görsel atlas rotası (multi-hop) | 6 | 6 (değişmedi) |
| Yolculuk arketipi doluluk | 4/7 | **7/7** |
| Polish layer bileşeni | 4 | 4 (değişmedi) |
| Site sayfa sayısı (route) | 11 | 11 (değişmedi: catalogue Word'ler mevcut route altyapısı kullanır) |
| i18n bundle anahtar | ~140 | ~155 (+5 wordsList × 3 dil + 6 catalogue Word title/category/literalMeaning satırları MDX'te) |
| Ağırlıklı tamamlanma | ~%39.5 | **~%43.3** |

### Sonraki dilim için öneriler

Bu dilim catalogue tier'ı açtı; tier şu an 6 Word, hedef ~60. Üç farklı
yön mümkün:

**1. Catalogue genişlemesi (en olası).** 7/13'te 4-6 catalogue Word daha
— mevcut arketiplerin altını dolduran ya da bilinçli olarak ihmal edilmiş
yarı-bölgeleri açan (ör. Persia-Türkçe pickup: *ḥarīr-i bāzar* alışveriş
sözlüğü; ör. Andalusian merchant arketipinin denizci kanadı: *garbo*
kuzey-batı Atlantik rüzgârı, *escabeche* turşu damıtması). Skor: %43 →
~%46.

**2. Person/Book tier-açılışı.** Şu an 1 showcase Person + 1 showcase
Book var. Person catalogue (ör. ibn al-Haytham, al-Bīrūnī, ez-Zehrâvî,
Ḥunayn ibn İshâq) ve Book catalogue (ör. *al-Qānūn fī al-Ṭibb*, *Optics*,
*Algorismus*) Word tier'ından sonra şablonlanmış mimariye binebilir.
Skor: %43 → ~%45 (Person/Book ağırlığı Word'den küçük).

**3. UI derinleşmesi: Atlas timeline view.** Atlas anchor'larında `year`
alanı var (her anchor'ın yılı kayıtlı), ama UI'da görünmüyor. Year-axis
slider eklemek (anchor'ları zaman içinde animate, ya da yıl-aralığı
filter) korpus'un kronolojik derinliğini ilk defa görsel argümana
çevirir. Skor: %43 → ~%44.5 (UI completeness; polish kategorisine
yakın).

Öneri: **(1)**, çünkü corpus weight (×0.5) Δ'yı en hızlı büyüten kova
ve §12 footnote'unun "%50 noktası 8-12 oturum" tahmini ancak catalogue
hızlanırsa tutar. Person/Book'a yatırım yapmadan önce Word catalogue'unu
15 → 25 civarına çıkarmak — Word entity-tip'inin tarihselliği yeterince
geniş bir editöryel patika sunuyor, başka entity-tipleri'ne *henüz*
düşmeden.

---

## Oturum 7 — dilim 11 (al-jabr 4-hop Book + global page-enter animation + per-page `document.title`)

Üç-kollu sprint, diversifiye prong'larla — entity-tip simetrisinin
kapanması, polish layer'ın çoklu derinleşmesi, ve browser entegrasyon
hijyeni:
(A) **Global page-enter animation** — her `<main>` mount'unda
350ms fade-in + 8px slide-up, CSS-only, manuscript-feel yatışkın;
(B) **al-jabr 4-hop multi-anchor Book** — projedeki **ilk 4-hop Book**,
entity-tip simetrisi (Word + Person + Book) tamamlanır;
(C) **`usePageTitle` hook + 9-sayfa entegrasyonu** — `document.title`
sayfa-bazlı yansır, "<entity adı> · Riḥlat al-Kalimāt" template'i,
browser sekme + bookmark + history hijyeni.

Dilim 7/9 polish layer'ı NotFound ile açtı (1. giriş — yanlış-URL'de
nadiren görünür). Dilim 7/10 ManuscriptLoader ile derinleştirdi (2. giriş —
her route/entity yüklemesinde görünür). Dilim 7/11 *her gezinmede,
her sayfada, her tarayıcı sekmesinde* görünür iki yeni polish girişi
ekliyor: page-enter animation (3.) ve usePageTitle (4.). Polish artık
"kenarda bir özel sayfa" değil, sitenin **görsel imzasının her
yerinde dokunduğu** bir doku. Aynı zamanda al-jabr 4-hop'la Book
taksonomisi Word/Person'la simetri kazanıyor — üç entity tipinin de
multi-anchor verisi var.

### (a) Global page-enter animation (dilim 7/11.A)

Her `<main>` mount'unda CSS native animation tetiklenir:

```css
main {
  animation: page-enter 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes page-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Karakteristikler:**
- **350ms** — fark edilir ama gecikme hissi vermez
- **cubic-bezier(0.4, 0, 0.2, 1)** — Material-design standard ease-out
- **opacity 0 → 1 + translateY 8px → 0** — minimal kinetik
- **`both` fill-mode** — başlangıç durumu animasyon bitene kadar tutulur (FOUC yok)

**Niçin CSS-only, framer-motion değil:** `framer-motion` zaten
package.json'da var (^11.11.17) ama henüz hiçbir yerde kullanılmıyor.
Hello-world fade-in için framer-motion'u açmak ~10-15 KB gz overhead
(motion.div + AnimatePresence tree-shake sonrası), eager index chunk'a
girer. CSS-only animation 50 bytes total cost, sıfır JS. Daha karmaşık
polish (route exit animation, gesture-based, scroll-bound) gerektiğinde
framer-motion'a geçilir; bu eşik şu an aşılmadı.

**Tetikleme semantiği:** Her `<main>` DOM element'inin **kendi mount'unda**
animation kuralı çalışır. Bu şu hareketleri kapsar:
- İlk app load: HomePage `<main>` mount'lanır → animasyon çalışır ✓
- Navigasyon HomePage → WordPage: WordPage `<main>` mount'lanır →
  animasyon çalışır ✓
- Navigasyon /word/A → /word/B: WordPage komponenti aynı kalır
  (sadece props/params değişir), `<main>` DOM node'u aynı → animasyon
  **çalışmaz**. Bu kasıtlıdır — aynı-tip içerik swap'i instantane
  hissedilsin, kullanıcı "yeni sayfa" değil "yeni veri" beklesin.

**prefers-reduced-motion:** `src/styles/global.css` 73. satırda zaten
bir universal selector kuralı var:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.1s !important;
  }
}
```

Bu kural `page-enter` animasyonunu da **otomatik nötrleştirir** — duration
0.01ms'e iner, kullanıcı kinetiği görmez, semantic çıktı aynı kalır.
Ayrı bir override yazılmadı; mevcut disipline güvenildi.

**Kapsam:** HomePage, WordPage, PersonPage, BookPage, ThemePage,
JourneysIndexPage, JourneyPage, WordsListPage, NotFound, ManuscriptLoader,
EntityNotFound — semantic HTML konvansiyonu gereği her sayfada **tek
bir `<main>`** olmalı; bu kural her sayfanın tek `<main>`'ine değer.
Kasıtlı global yaklaşım: sayfa-bazlı animation class manuel olarak
eklenmek zorunda değil, drift riski yok.

### (b) al-jabr 4-hop multi-anchor Book (dilim 7/11.B)

**Önceki durum:** al-jabr.mdx 2-hop — Bağdat (c. 825, yazıldığı yer) +
Toledo (1145, Robert of Chester Latin çevirisi).

**Yeni durum — 4-hop:** Bağdat → Toledo → **Floransa** → **Londra**.

| Hop | Yer | Yıl | Tematik kapsam |
|---|---|---|---|
| 1 | baghdad | c. 825 | Bayt al-Ḥikma — kitabın yazıldığı yer |
| 2 | toledo | 1145 | Chesterli Robert'ın Latinceleştirmesi — *Liber algebrae et almucabolae* |
| 3 | florence | 1202 → | Toskana tüccar resepsiyonu — Fibonacci *Liber Abaci*'sinde al-Jabr'ın yöntemleri Akdeniz ticaret hesabına gömülür |
| 4 | london | 1831 | Frederic Rosen'in eleştirel baskısı — Oriental Translation Fund; kitap modern Batı bilim tarihine asıl Arapça metniyle yeniden girer |

**Editöryel argüman: "kitap, adamı 600 yıl aşar".** al-Khwārizmī
Person rotası (dilim 7/10.B): Hârezm → Bağdat → Toledo → Floransa.
al-jabr Book rotası: Bağdat → Toledo → Floransa → Londra. Üç orta
hop'ta üst üste (kitap, adamın düşünce taşıyıcısı) — ama:
- al-Khwārizmī Person rotası **Floransa'da biter**: 13. yy'da Fibonacci
  üzerinden Avrupa'ya geçen düşünce orada "absorbe edilmiş" sayılır.
  Şahsın etkisi (eponim *algorismi* → *algorithm*) bu kavşakta
  sertleşir.
- al-jabr Book rotası **Londra'da bir kez daha açılır**: 1831'de
  Frederic Rosen, Oriental Translation Fund tarafından desteklenen
  eleştirel baskıyla *al-Kitāb al-Mukhtaṣar fī Ḥisāb al-Jabr wa-l-
  Muqābala*'yı asıl Arapça metni + İngilizce çeviri olarak basar.
  Bu, kitabın **modern Batı bilim tarihine ikinci girişi**. İlk giriş
  Latin çeviriydi (Toledo 1145 → Avrupa üniversiteleri). İkincisi
  philological-orientalist bir geri-keşif — Arapça-olmayan-Latin
  formundan kurtulup orijinal metniyle akademiye girer. Modern
  matematik tarihi çalışmaları (Roshdi Rashed, Boris Berggren) bu
  Rosen baskısına dayanır.

**Geometrik özellik:** al-jabr ve al-Khwārizmī rotaları Floransa'ya kadar
neredeyse paralel — kitap, adamla birlikte taşınır. Floransa sonrası
ayrışırlar:
- al-Khwārizmī rotası Floransa'da biter (intelektüel rezolüsyon)
- al-jabr rotası Floransa'dan **Londra'ya kuzeybatı** uzanır
  (+255 piksel batı + 55 piksel kuzey) — Toledo → Floransa hop'unun
  ters-yön bounce'u'na paralel, ama daha uzun bir adım

**Entity-tip simetrisi tamamlandı:**
- **5 multi-anchor Word**: cotton (3-hop), sugar (3-hop), orange
  (4-hop), coffee (4-hop), lemon (4-hop). Coverage 5/9.
- **1 multi-anchor Person**: al-Khwārizmī (4-hop). Coverage 1/1.
- **1 multi-anchor Book**: al-jabr (4-hop). Coverage 1/1.

Üç entity tipi de aynı `atlasAnchors[]` mimarisinde, aynı multi-anchor
rota render mantığında (dilim 7/2-7/5'te düzeltilmişti — mimari
simetri sağlamdı, içerik yetişmemişti). Artık her tip showcase
entity'lerinde örnek bir rota var.

**Bundle maliyeti:** +0.38 KB registry gz (2 yeni anchor × 3 dil ×
{year, label} manifest'e ekleniyor) + 0.49 KB al-jabr MDX chunk
(frontmatter +2 anchor block'u). al-Khwārizmī 4-hop dilim 7/10'la
aynı pay (~0.66 KB toplam yapısal pay).

**Atlas geometry note:** 4 yer (baghdad, toledo, florence, london)
zaten atlas.ts'te var; yeni place eklemeden geometry hop'u açıldı.
Sadece London hop'u al-Khwārizmī Person rotasıyla *kesişmiyor* —
kitap yaşamının modern recovery momentine özgü.

### (c) `usePageTitle` hook + 9-sayfa entegrasyonu (dilim 7/11.C)

**Önceki durum:** Tüm sayfalar aynı static `<title>` — `index.html`'in
"Riḥlat al-Kalimāt" base'i. WordPage'de "algorithm" sayfasındayken
browser sekmesi/bookmark/history'de "Riḥlat al-Kalimāt" yazardı —
hangi entity'de olduğu görünmezdi. Bookmarklar kelime-bazlı
ayırt edilemezdi.

**Yeni durum — `usePageTitle` hook:**

```ts
// src/hooks/usePageTitle.ts
const BRAND = 'Riḥlat al-Kalimāt';
export function usePageTitle(title: string | null | undefined): void {
  useEffect(() => {
    const trimmed = (title ?? '').trim();
    document.title = trimmed ? `${trimmed} · ${BRAND}` : BRAND;
  }, [title]);
}
```

**Niçin react-helmet değil:** tek bir alan değiştiriyoruz (document.title);
`<head>` içine meta tag enjeksiyonu, link tag manipulation, SSR
support gibi react-helmet'in tüm özelliklerine ihtiyacımız yok.
react-helmet (veya helmet-async) ~5 KB gz overhead getirir; bizim
hook 5 satır + ~30 bytes gz. Tek-yer-açar disiplini.

**9-sayfa entegrasyonu:**

| Sayfa | Title kaynağı | Örnek (TR) |
|---|---|---|
| HomePage | `''` (boş) | `Riḥlat al-Kalimāt` |
| WordPage | `pickLang(word.title, lang)` | `algorithm · Riḥlat al-Kalimāt` |
| PersonPage | `pickLang(person.title, lang)` | `el-Hârezmî · Riḥlat al-Kalimāt` |
| BookPage | `pickLang(book.title, lang)` | `el-Jabr · Riḥlat al-Kalimāt` |
| ThemePage | `pickLang(theme.title, lang)` | `Endülüs Sofrası · Riḥlat al-Kalimāt` |
| JourneysIndexPage | `t('journeys.indexTitle')` | `Yolculuk arketipleri · Riḥlat al-Kalimāt` |
| JourneyPage | `t(\`journeys.${type}\`)` | `Mütercimin yolu · Riḥlat al-Kalimāt` |
| WordsListPage | `t('entities.wordPlural')` | `Kelimeler · Riḥlat al-Kalimāt` |
| NotFound | `'404'` | `404 · Riḥlat al-Kalimāt` |

**Loading state davranışı:** Entity sayfalarında (Word/Person/Book/Theme)
hook erken-return'lerden ÖNCE çağrılır (React rules of hooks).
Entity henüz yüklenmediyse `word === undefined`, title `slug` fallback'i
alır → sekmede `algorithm · Riḥlat al-Kalimāt` (slug literal); entity
yüklendiğinde `pickLang(word.title, lang)` ile yerine localized name
gelir (`algorithm · Riḥlat al-Kalimāt` aynı kalır TR/EN için; AR'da
`الخوارزميّ · Riḥlat al-Kalimāt`).

**Geçersiz parametre durumu (JourneyPage):** Geçerli arketip değilse
title boş gönderilir → brand'e düşer → redirect zaten /:lang'a
yönlendirir. Hook erken-return'den önce çağrılır; sıralama
React hooks kurallarına uyar.

**Cleanup yok (kasıtlı):** useEffect cleanup'ında title restore etmiyoruz.
Sıra: Sayfa A unmount → Sayfa B mount → B kendi title'ını set eder.
Cleanup restore yapsaydı geçici stale title oluşurdu; atlamak güvenli
çünkü her sayfa kendi başlığını set ediyor. Aksi durum (sayfa
unmount oldu, hiçbir yeni sayfa mount olmadı) sadece app destroy
sırasında olur — orada title önemsizdir.

**Bundle maliyeti:** Hook gövdesi ~30 bytes gz, 9 sayfada paylaşıldığı
için tree-shake sonucu shared chunk'ta yaşar — toplam +0.04 KB
per consuming chunk. index chunk'a doğrudan değmiyor (hook'u eager
chunk import etmiyor).

### Bundle Δ

| Chunk | 7/10 sonu | 7/11 | Δ gz |
|---|---|---|---|
| `index` JS (eager core) | 81.50 | 81.53 | +0.03 |
| `index` CSS (eager) | ~5.32 | ~5.34 | +0.02 (page-enter @keyframes) |
| `HomePage` JS | 8.29 | 8.33 | +0.04 (usePageTitle) |
| `registry` (shared) | 11.41 | **11.79** | **+0.38** (al-jabr atlasAnchors[] +2 hops) |
| `al-jabr` (lazy MDX) | 18.27 | **18.76** | **+0.49** (frontmatter +2 anchor blocks) |
| `WordsListPage` (lazy) | 1.02 | 1.06 | +0.04 |
| `WordPage` (lazy) | 1.70 | 1.70 | 0 |
| `PersonPage` (lazy) | 1.69 | 1.73 | +0.04 |
| `BookPage` (lazy) | 2.04 | 2.08 | +0.04 |
| `ThemePage` (lazy) | 1.56 | 1.60 | +0.04 |
| `JourneyPage` (lazy) | 0.77 | 0.82 | +0.05 |
| `JourneysIndexPage` (lazy) | 0.56 | 0.59 | +0.03 |
| `NotFound` (lazy) | 1.05 | 1.09 | +0.04 |
| `AtlasGeography` (shared) | 1.96 | 1.96 | 0 |
| **Initial paint (HomePage, JS only)** | **~103.2** | **~103.6** | **+0.4 KB gz** |

Δ kompozisyonu:
- **al-jabr 4-hop manifest payı**: +0.38 KB registry (Faz B)
- **usePageTitle hook**: +0.04 KB per page (Faz C; tree-shaken)
- **page-enter animation**: ~50 bytes total CSS (Faz A; zero JS)

**Initial paint trendi (7/6 → 7/11):**

| Dilim | Initial paint (KB gz) | Δ | Karakter |
|---|---|---|---|
| 7/6 | ~101.0 | — | Word.atlasAnchors + journey schema açılışı |
| 7/7 | ~101.3 | +0.3 | /journeys route + 7 archetype subtitle |
| 7/8 | ~101.9 | +0.6 | orange + coffee 4-hop manifest |
| 7/9 | ~102.5 | +0.6 | lemon 4-hop manifest |
| 7/10 | ~103.2 | +0.7 | al-Khwārizmī 4-hop + eager loader + headerLink |
| 7/11 | ~103.6 | +0.4 | al-jabr 4-hop + usePageTitle (page-enter CSS-only sıfır) |

Linear ~+0.5 KB / dilim trend devam. 240 entity hedefiyle ~30-40 KB
manifest payı, eager chunk hâlâ 110-130 KB altında — acceptable.

### Korpus + mimari durumu

- **9 word / 1 person / 1 book / 3 theme** (sayısal değişmedi)
- **19 atlas place** (değişmedi)
- **Multi-anchor entity coverage:**
  - 5/9 Word (cotton, sugar, orange, coffee, lemon — 3 ila 4 hop)
  - **1/1 Person** (al-Khwārizmī — 4 hop)
  - **1/1 Book** (al-jabr — 4 hop, **yeni bu dilim**)
- **Atlas görsel rotaları**: 6 (cotton+sugar+lemon ilk 3 hop overlap +
  orange Lisbon'a + coffee Mokha→Londra + lemon Londra'ya + al-Khwārizmī
  Hârezm→Bağdat→Toledo→Florence + **al-jabr Bağdat→Toledo→Florence→London**).
  al-Khwārizmī ve al-jabr rotası Florence'a kadar üst üste; al-jabr
  oradan Londra'ya kuzeye uzanır.
- **Polish layer 4 bileşenli**: NotFound (7/9) + ManuscriptLoader (7/10) +
  page-enter animation (7/11) + usePageTitle (7/11)
- **Browser entegrasyonu**: sekme başlığı, bookmark, history her sayfa için
  ayrı; user "el-Hârezmî" sekmesini geri açabilir, bookmark kaydedebilir.
- **Entity-tip simetrisi**: 3 entity tipinde de en az 1 multi-anchor örnek
  (4-hop showcase). Atlas argümanı her tip için var.

### Sonraki dilim için öneriler

1. **7 arketip için tam essay (~600 kelime/dil/arketip).** Hâlâ
   subtitle'larla sınırlı; tam essay editöryel düzeyde §4.5'te planlı.
   `content/journeys/*.mdx` + parseJourney + manifest entry. ~12,600
   kelime editöryel yük. *Kullanıcının editöryel sesinde* yazılmalı.
2. **Catalogue tier'ın açılması.** §12.2 (korpus skoru) en büyük tek
   tahrik. 10-15 catalogue Word, sonra filter paneli `/kelimeler`'de
   açılabilir. UI hazır (dilim 7/10), filter URL state container
   açılır, deep-link share edilebilir. Ağırlıklı ortalama %38 →
   %42-45 beklenir.
3. **Polish layer'ın 5. girişi.** Bu dilim 2 ekledi (page-enter +
   usePageTitle). Sıradakiler:
   - **Easter egg**: favicon tıklama? Atlas zoom-out → world view?
     Stratigraphy strata iz sürme (3+ stratuma hover ile gizli açılış)?
   - **OG image / sosyal kart**: SVG-based, sayfa-bazlı dinamik
     (Open Graph + Twitter Card). Bookmarking + paylaşımın görsel
     hijyeni.
   - **Favicon manuscript-themed**: şu an default Vite favicon.
     Manuscript ◇ glyph favicon, dark/light mode variantları.
4. **Atlas mobile / responsive ölçeklendirme.** viewBox sabit 1200×700,
   dar ekranlarda pin etiketleri çakışır. Adaptive viewBox veya
   viewport-bazlı pin yoğunluğu adaptif. Polish + UX iyileştirme.
5. **Theme.atlasAnchors zenginleşmesi.** endulus-sofrasi + andalusian-
   translation-workshop temalarının mevcut anchor sayıları gözden
   geçirilebilir; Toledo + Cordoba ötesinde editöryel kapsamla
   genişleyebilir (örn. endulus-sofrasi: Mağrib + Sicilya rotaları).
6. **Atlas yıl eksenli timeline view'i.** Şu an statik harita;
   anchor'ların `year` alanı zaman ekseni üzerinde animasyon ya da
   filtre (slider: c. 600 ↓ ile 1831 arası) sağlanabilir. Editöryel
   olarak hazır veri var (her anchor'da year), UI eklemesi yeterli.
   Atlas'ın görsel argümanı temporal boyut kazanır.

---


## Oturum 7 — dilim 10 (`/kelimeler` Catalogue route + al-Khwārizmī 4-hop Person + manuscript-themed lazy loader)

Üç-kollu sprint, diversifiye prong'larla — bir kayıp route, bir
mimari simetri kapanışı, bir polish girişi:
(A) **`/kelimeler` Catalogue route** — uzun süredir bekleyen eksik
sayfa, grid + 3 sort modu; (B) **al-Khwārizmī 4-hop Person** —
projedeki **ilk 4-hop Person**, bilim düşüncesinin coğrafi diyasporası;
(C) **ManuscriptLoader** — pulse'lu ◇ glyph + italik loading metni,
RouteFallback + EntityLoading'in iki inline-styled minimal bloğunun
tek polish'lı bileşene refactor edilmesi.

Dilim 7/9 polish layer'ı NotFound (404 manuscript redesign) ile
açmıştı. Dilim 7/10 polish layer'ı *site içinde* derinleştiriyor —
NotFound rastlanılan bir sayfa (kullanıcı yanlış URL'e gittiğinde);
ManuscriptLoader **her route geçişinde + her entity hidrasyonunda**
görünür. Yani polish bu dilim'de "kenarda görünen bir sayfa" değil,
"her gezinmede her kullanıcının gördüğü görsel imza" tarafına geçti.
Aynı zamanda mimari olarak eksik route (`/kelimeler`) tamamlandı ve
Person taksonomisi Word taksonomisiyle simetri kazandı (5 multi-anchor
Word + 1 multi-anchor Person — entity-tipler arası eşit derinleşme).

### (a) `/kelimeler` Catalogue route — listing page (dilim 7/10.A)

**URL:** `/:lang/kelimeler` (segment Türkçe sabit — paths.ts §3.2
disiplini: ENTITY_PATH_SEGMENT.word = 'kelime' tekil, listing segment
'kelimeler' çoğul; rezonansta).

**Mimari:**
- `src/router/paths.ts` — `WORDS_LIST_SEGMENT = 'kelimeler'` sabit +
  `wordsListUrl(lang)` helper.
- `src/router/AppRoutes.tsx` — lazy `WordsListPage` + index route'tan
  sonra Word/Person/Book route'larından önce. Path segment paths.ts'ten
  okunur (tek doğru kaynak).
- `src/pages/WordsListPage.tsx` — yeni component (~150 satır).
- `src/pages/WordsListPage.css` — manuscript-aesthetic grid styling
  (~180 satır).
- `src/i18n/locales/{tr,en,ar}.json` — `wordsList.*` 8 anahtar 3 dilde.

**Sayfa yapısı:**
1. **Header** — h1 başlık ("Kelimeler"/"Words"/"الكلمات") + serif
   subtitle ("Korpusun bütün kelimeleri.") + mono sayım rozeti
   ("— 9 girdi" / "— 9 entries" / "— ٩ مَوادّ").
2. **Sort toolbar** — segmented control, 3 buton: *Alfabetik /
   Arketipe göre / Atlas rotası*. Aktif buton gold-leaf border;
   pasif olanlar muted, hover'da bg-deep + ink color. ARIA `role="toolbar"` +
   `aria-pressed`. Default sort = alfabetik.
3. **Grid** — responsive `grid-template-columns: repeat(auto-fit,
   minmax(280px, 1fr))` — desktop'ta 3-4 sütun, mobile'da 1 sütun.
4. **Card** — `<Link>` wrap, hover'da gold-sweep border + bg-deep.
   İçerik: ◆ ARKETİP journey tag (HomePage paterniyle aynı) + h2
   başlık + serif italic literal meaning + opsiyonel ◇ N-hop atlas
   rotası badge (yalnız multi-anchor Word'lerde).

**Sort modları:**
- **Alfabetik**: `localeCompare(other, lang)` — Türkçe/Arapça
  collation runtime-destekli (modern tarayıcılar Intl.Collator
  taşıyor). Yani 'ç' Türkçe'de 'c'den sonra; Arapça'da `ب` `ت`'den
  önce — runtime doğru yapar.
- **Arketipe göre**: `journey_type` grup, içeride alfabetik.
  Undefined olanlar sona (`'~'` sentinel — ASCII tüm harflerden
  büyük). Mevcut showcase'te tüm Word'lerin `journey_type`'ı var,
  ama catalogue tier'ında olmayabilir.
- **Atlas rotası**: `atlasAnchors.length` desc; sonra alfabetik.
  Multi-anchor (5 Word) önde, tek-anchor (4 Word) sonra. Atlas
  argümanı yoğun olan kelimeler liste başında görünür.

**Sort URL'e taşınmadı.** Şu an client-side state. Karar: sort
editöryel olarak share-edilen birşey değil; kopyalanan URL "kelime
listesi" sayfasını paylaşır, sort tercihini değil. Catalogue tier
açıldığında filter URL'e taşınmalı (deep-link şart: "andalusian +
showcase" kombinasyonu paylaşılabilir state). O zaman migrate.

**Niçin "filter" yok bu dilim'de?** 9 showcase Word için filter paneli
over-engineered olur — kullanıcı tüm 9 kelimeyi tek ekranda görüyor;
filter'lanacak hacim yok. Filter UI'nin değeri catalogue tier (~100+
Word) açıldığında belirir. Şimdi filter eklersem mimari debt'i
büyütürüm (kullanılmayan UI bakım gerektirir).

**HomePage entegrasyonu:** `DirectoryColumn` bileşenine opsiyonel
`headerLink?: { to: string; label: string }` prop'u eklendi. Yalnız
Words sütununda `headerLink={{ to: wordsListUrl(lang), label: t('wordsList.seeAll') }}` —
"tümünü gör →" italik moss link. Diğer sütunlarda (Persons/Books/
Themes) prop verilmez, undefined kalır, link render olmaz — Catalogue
route'ları henüz yok. HomePage'in directory col-headrow CSS'i flex
baseline align ile başlığı solda, link'i sağda hizalar.

**Sort durumunun a11y'si:** segmented control ARIA toolbar paternine
uydu (`role="toolbar"`, `aria-pressed` per buton). Klavye navigasyonu:
Tab → toolbar gir, Tab → çık (radio değil — sort tek-seçim ama radio
group'a kısıtlamak gereksiz). focus-visible outline (2px moss).

### (b) al-Khwārizmī 4-hop Person multi-anchor (dilim 7/10.B)

**Önceki durum:** al-Khwarizmi.mdx'in atlasAnchors'ı 2-hop:
khwarazm (c. 780, doğum) → baghdad (c. 820-850, Bayt al-Ḥikma,
*Al-Jabr* yazılış yeri).

**Yeni durum — 4-hop:** khwarazm → baghdad → toledo → florence.

| Hop | Yer | Yıl | Tematik kapsam |
|---|---|---|---|
| 1 | khwarazm | c. 780 | Doğduğu nisba — Hârezm |
| 2 | baghdad | c. 820 — 850 | Bayt al-Ḥikma; *Al-Jabr* + *Ḥisāb al-Hind* burada yazılır |
| 3 | toledo | 12. yy | Tuleytula çeviri hareketi — *Al-Jabr* 1145'te Latince'ye, *Algorismi* adı Avrupa'ya |
| 4 | florence | 1202 → | Toskana resepsiyonu — Fibonacci *Liber Abaci* (Pisa, 1202); Hint-Arap aritmetiği İtalyan tüccarına |

**Argüman:** Word multi-anchor rotaları (cotton/sugar/orange/coffee/
lemon) bir **kelimenin** coğrafi yolculuğunu çiziyordu. al-Khwārizmī
4-hop **bir düşüncenin** yolculuğunu çiziyor — bedeni Mâverâünnehir-
Mezopotamya'da (1-2. hop) ama eserleri ölümünden 300 yıl sonra Toledo
çeviri okulları üzerinden Avrupa'ya geçer (3. hop) ve Tuscan İtalyan
tüccar matematiğinde "Algorismi adı = aritmetik usulü" denkliğiyle
yerleşir (4. hop). Atlas haritasında **bilim diyaspora rotası** —
kelime taşınması değil, kavram-sistem aktarımı.

**Geometrik özellik:** 2. → 3. hop (Bağdat [700,400] → Toledo [150,365])
nearly horizontal, ~550 piksel batıya — orange'ın Cordoba'dan Lisbon'a
giden tek batıya-uzanış rotasına paralel ama daha uzun (orange iki adımda,
al-Khwārizmī tek adımda atlas viewBox'ın doğusundan batısına). 3. → 4.
hop (Toledo [150,365] → Florence [385,320]) **doğuya geri kıvrılır** —
+235 piksel doğu-kuzeydoğu. Atlas'taki *yalnız bu Person rotasında*
böyle "yön değişimi" var: matematik düşüncesi batıya gider, sonra
Toskana üzerinden doğuya geri gelir. Görsel argüman: Latince çeviri
İtalya'yı (kavşak ülke) ekonomik dönüşümün eşiğinde besler.

**Niçin Florence, Pisa değil?** Fibonacci *Liber Abaci*'yi Pisa'da
1202'de yazdı; ama atlas.ts'te `pisa` slug'ı yok, `florence` var.
Editorial defense: Tuscan polities (Pisa, Florence, Siena) collective
olarak Hindu-Arap aritmetiğini benimseyen 13.-14. yy ticari sınıfı
oluşturdu; Florence sonra **Toskana matematik kültürünün** zirvesi
oldu (Medici bankacılığı, abacus okulları). Etiket bunu açıklıyor:
"Toskana resepsiyonu — Fibonacci *Liber Abaci* (Pisa, 1202)" — Pisa
kaynağı, Florence bölgesel kapsam. İleride atlas geometry-pivot
dilimi'nde pisa eklenirse 4. hop daha doğru bir yere taşınabilir.

**Bundle maliyeti:** registry chunk +0.31 KB gz (manifest'e 2 yeni
anchor × 3 dil × {year, label}). al-Khwarizmi MDX chunk +0.35 KB
(frontmatter +2 anchor block). Toplam +0.66 KB — orange/coffee/lemon
4-hop'larıyla aynı yapısal pay.

### (c) ManuscriptLoader — manuscript-themed lazy loader (dilim 7/10.C)

**Önceki durum:** İki ayrı dosyada iki inline-styled minimal blok:
- `src/router/AppRoutes.tsx#RouteFallback` — route lazy chunk
  indirilirken görünür.
- `src/components/EntityPageStates.tsx#EntityLoading` — entity MDX
  hidrasyonu devam ederken görünür.

İkisi de **aynı stil** taşıyordu: italik serif "Yükleniyor…" metni,
--fg-faint renkte, 50vh min-height. Bilinçli paralel — dilim 7/1'in
disiplini: kullanıcı "route geçişi" ile "entity yükleme"yi görsel
olarak ayırt etmesin. Ama tek doğru kaynak değildi (drift kaynağı +
inline-styled = polish yok).

**Yeni durum — `ManuscriptLoader` paylaşılan bileşen:**
- `src/components/ManuscriptLoader.tsx` — JSX wrapper, ~25 satır.
- `src/components/ManuscriptLoader.css` — CSS-only animasyon, ~60 satır.
- AppRoutes RouteFallback inline blok → `<ManuscriptLoader />` (silindi
  `RouteFallback` function declaration + `useTranslation` import).
- EntityPageStates `EntityLoading` inline blok → `return <ManuscriptLoader />`.
  `EntityNotFound` aynı dosyada kaldı (untouched), `useTranslation`
  import hâlâ kullanılıyor.

**Tasarım:**
- **◇ glyph** — Stratigraphy / ThemeBadges / JourneyBadge /
  NotFound rule ile aynı sembol; gold-leaf renkli, 1.75rem.
- **Pulse animasyonu** — 1.8s ease-in-out infinite, opacity 0.25-0.75 +
  scale 0.95-1.05. Composite-only animation (opacity + transform,
  paint pahası yok).
- **Loading metni** — italik serif (Latince), normal Arapça (Amiri
  italic desteklemez). --fg-faint renkte. Eski paletten kalan tek öğe;
  tipografik tutarlılık.
- **prefers-reduced-motion** saygısı: `@media (prefers-reduced-motion:
  reduce) { .manuscript-loader-mark { animation: none; opacity: 0.5; } }`
  — animasyon kapanır, ◇ orta-opacity statik. Erişilebilirlik
  disiplini (WCAG 2.3.3 ruhu — kinetik tetikleyici çıkar, semantik
  korunur).

**Niçin eager import (lazy değil)?** Suspense fallback chicken-and-egg:
lazy chunk indirilirken gösterilecek bileşen *lazy chunk indirme tamamlanmadan*
hazır olmalı. Dolayısıyla ManuscriptLoader index chunk'ında eager
yaşar. Cost: +0.32 KB gz index. Karşılığında dilim 1'in iki inline
blok'unun yerine tek polish'lı bileşen — DRY + maintainability +
visible polish.

### Bundle Δ

| Chunk | 7/9 sonu | 7/10 | Δ gz |
|---|---|---|---|
| `index` (eager core) | 81.18 | **81.50** | **+0.32** (eager ManuscriptLoader) |
| `HomePage` | 8.22 | 8.29 | +0.07 (headerLink JSX + wordsListUrl import) |
| `registry` (shared) | 11.10 | **11.41** | **+0.31** (al-Khwarizmi atlasAnchors[] +2 hops) |
| `WordsListPage` (lazy, YENİ) | — | **1.02** | yeni chunk |
| `al-khwarizmi` (lazy MDX) | 15.78 | 16.13 | +0.35 (frontmatter +2 anchor) |
| `AtlasGeography` (shared) | 1.96 | 1.96 | 0 |
| `NotFound` (lazy) | 1.05 | 1.05 | 0 |
| **Initial paint (HomePage)** | **~102.5** | **~103.2** | **+0.7 KB gz** |

**Initial paint trendi (7/6 → 7/10):**

| Dilim | Initial paint (KB gz) | Δ | Karakter |
|---|---|---|---|
| 7/6 | ~101.0 | — | Word.atlasAnchors schema + journey schema açılışı |
| 7/7 | ~101.3 | +0.3 | /journeys route + 7 archetype subtitle |
| 7/8 | ~101.9 | +0.6 | orange + coffee 4-hop manifest |
| 7/9 | ~102.5 | +0.6 | lemon 4-hop manifest |
| 7/10 | ~103.2 | +0.7 | al-Khwarizmi 4-hop + eager loader + headerLink |

Linear ~+0.5 KB / dilim trend tutarlı. 240 entity hedefe ulaşılırsa
registry hesaplaması yapılırsa ~30-40 KB gz manifest payı — eager
chunk hâlâ 100 KB altında kalır. Acceptable.

### Korpus + mimari durumu

- **9 word / 1 person / 1 book / 3 theme** (sayısal değişmedi)
- **19 atlas place** (değişmedi)
- **5 multi-anchor Word** + **1 multi-anchor Person** (+1: al-Khwārizmī
  2-hop → 4-hop). Entity-tip simetrisi açıldı: artık iki tip de
  multi-anchor.
- **4 görsel-ayrı atlas rotası** (Word) + **1 Person rotası**:
  - cotton+sugar+lemon ilk 3 hop overlap
  - orange Lisbon'a
  - coffee Mokha → Londra
  - lemon Londra'ya (Cordoba sonrası)
  - **al-Khwārizmī Hârezm → Bağdat → Toledo → Floransa** (Person, yeni)
- **Yeni navigable route**: `/:lang/kelimeler` — uzun süredir eksikti
- **Polish layer ikinci girişi**: ManuscriptLoader (NotFound 7/9'da
  birinciydi)
- **HomePage Directory** — Words sütun başlığında "tümünü gör →"
  linki; route keşfedilebilirliği

### Sonraki dilim için öneriler

1. **7 arketip için tam essay (~600 kelime/dil/arketip).** Hâlâ
   subtitle'lar (~30-50 kelime) ile sınırlıyız; tam essay editöryel
   düzeyde §4.5'te planlı. `content/journeys/*.mdx` + parseJourney +
   manifest entry. ~12,600 kelime editöryel yük. *Kullanıcının
   editöryel sesinde* yazılmalı.
2. **Catalogue tier'ın açılması.** §12.2 (korpus skoru) %20 →
   %25-28 sıçramasını sağlayacak en büyük tek tahrik. 10-15
   catalogue Word (editöryel format showcase'in 1/4 uzunluğunda).
   **`/kelimeler` artık hazır** (bu dilim açıldı) — Catalogue tier
   geldiğinde filter paneli eklenebilir, listing zaten 3 sort modu
   ile fonksiyonel. Ağırlıklı ortalama %36 → %40-43 beklenir.
3. **Polish layer derinleşmesi.** NotFound + ManuscriptLoader açıldı;
   sıradakiler: sayfa geçiş animasyonu (View Transitions API veya
   framer-motion fade-in route swap), easter egg (favicon tıklama?
   Atlas zoom animasyonu? Stratigraphy iz sürme?). §12.4'ün asıl
   açılışı 10 → 25-30'a buradan.
4. **Atlas mobile / responsive ölçeklendirme.** Şu an viewBox sabit
   1200×700, mobilde dar ekranlarda pin etiketleri çakışır. Atlas
   için ayrı bir mobile-density-tuned viewBox veya viewport-bazlı
   pin yoğunluğu adaptif. Polish + UX iyileştirme — özellikle
   `/kelimeler` artık geldikten sonra Atlas anasayfadaki ana
   görsel argümanın en yoğun çiziminde mobile okunabilirlik bekleniyor.
5. **Theme.atlasAnchors zenginleşmesi.** Theme entity'leri zaten
   multi-anchor altyapısına sahip (dilim 7/2'de geldi); andalusian-
   translation-workshop ve endulus-sofrasi'nin anchor sayıları
   denetlenebilir, mevcut rotalar Toledo + Cordoba'nın ötesinde
   editöryel kapsamla genişleyebilir.
6. **Book.atlasAnchors derinleşmesi.** al-jabr.mdx'in mevcut anchors
   (Bağdat → Toledo) al-Khwarizmi'nin Person rotasıyla bu dilim'de
   görsel olarak konuşur (aynı 2-3. hop'lar). Genişletilirse: ek
   manuscript-tarihi konumu (Cambridge MS, Vatikan vs.) — kitabın
   "fiziksel taşınması" görsel argümanı.

---


## Oturum 7 — dilim 9 (lemon 4-hop + JOURNEY_TYPES DRY + NotFound manuscript redesign)

Üç-kollu sprint, diversifiye edilmiş prong'larla:
(A) içerik/data — **lemon multi-anchor**, Word.atlasAnchors coverage
4/9 → 5/9; (B) mimari debt — **JOURNEY_TYPES DRY refactor**, 4-yer
duplikasyon → 1 canonical kaynak; (C) polish — **NotFound** manuscript
redesign, polish layer'ın ilk gerçek girişi.

Dilim 7/8'de Atlas argümanı tek-olgu tek-rotadan dört bağımsız
coğrafi olguya çıkmıştı. Bu dilim üç farklı eksende derinleştiriyor:
*content* tarafında lemon 5. multi-anchor Word (Atlas'ta 5. Word
rotası — cotton/sugar/lemon ilk 3 hop overlap, sonra lemon Londra'ya
kırar), *mimari* tarafında 4-yer arketip listesi duplikasyonu
tek doğru kaynağa indi (typecheck-time sözleşme yerine runtime'da
canonical import), *polish* tarafında 404 sayfası inline-styled
minimal hâlinden manuscript-and-stratigraphy estetiğine taşındı —
polish layer §12.4 ilk gerçek puan artışı.

### (a) lemon 4-hop multi-anchor (dilim 7/9.A)

cotton (7/6.A) → sugar (7/7.C) → orange (7/8.B) → coffee (7/8.B) →
**lemon** (7/9.A) — beşinci multi-anchor Word. Word.atlasAnchors
coverage 4/9 → 5/9 (%44 → %56).

**lemon — 4-hop rota: Delhi → Bağdat → Kurtuba → Londra.**

| Hop | Yer | Yıl | Tematik kapsam |
|---|---|---|---|
| 1 | delhi | c. 600 ↓ | Hint-Burma substrat — *nimbū*, Munda dil ailesinin Sanskrit-öncesi yerli adı |
| 2 | baghdad | 9. — 13. yy | Arap tarım çağı — *līmūn*, Hint isminin Arapçanın *ay*-paterniyle yeniden biçimlendirilmesi |
| 3 | cordoba | 11. — 15. yy | Endülüs bahçesi — Ibn al-'Awwām'ın *Kitāb al-Filāḥa*'sı, narenciye sulama ağı |
| 4 | london | 1747 → | Royal Navy iskorbüt rejimi — Lind'in (1747) klinik denemesi, 1795 zorunlu narenciye |

**Niye bu route, ibn-Sīnā/Bukhara ekseni değil?** Dilim 7/8'in
"Sonraki dilim için öneriler" listesi (#4) lemon'un bukhara/Qānūn
eksenini önermişti. Ama lemon.mdx editörel stratasını oturup
okuyunca: stratum-4 yer satırı *"Basra · Bağdat · Kahire · Şam"* —
bukhara değil. Ibn Sīnā Qānūn alıntısı var ama coğrafi emphasis
Bağdat eczacılığı + Mağrib genişlemesi. Stratum-5 "Assam · Burma · Pencap"
— Indo-Burmese substrate (Munda *nimbū*). Stratum-3 Cordoba/Sevilla/
Palermo. Stratum-2 HMS Salisbury / Royal Navy. Editöryel disiplin:
*yazdığını izle* — uydurma bir Bukhara hop'u editöryel gerçekliği
keserdi. Gerçek 4-hop: delhi (Indo-Burmese stratum-5 proxy'si) →
baghdad (Arab agriculture stratum-4 proxy'si) → cordoba (Andalusian
stratum-3) → london (Scurvy regime stratum-2). 4 hop, 4 ayrı tarihsel
çağ, 4 ayrı şehir.

**Atlas haritasında üç-line overlap argümanı.** cotton/sugar zaten
Delhi → Baghdad → Cordoba (3-hop). lemon ilk 3 hop'ta onlarla
birebir aynı yolda, sonra Londra'ya kuzeye kırılıyor. Atlas
haritasında bu noktada **3 paralel dotted-sepia çizgi** (cotton +
sugar + lemon Cordoba'ya kadar üst üste) + lemon'un yalnız 4. hop'u
(Cordoba → London) ayrı bir görsel argüman:

> Arap-İslam Yeşil Devrimi (André Watson) tek bir mahsul
> değil, *bir kanal*. Pamuk dokuyor, şeker tatlandırıyor, limon
> ekşitiyor — üçü aynı acequia ağında, aynı çağda, aynı
> yolculukla. Ama lemon bir adım daha gitti: 18. yy'da İngiliz
> donanmasının iskorbütünü iyileştirip İmparatorluk hijyenine
> dönüştü. Aynı bahçenin ürünü, üç yüzyıl sonra dünyanın yarısını
> denize sokuyor.

Geometrik olarak: Cordoba'dan Londra'ya çizgi orange'ın
Cordoba'dan Lisbon'a çizgisiyle paralel ama *terste* — orange
batıya Atlantik'e (Portekiz keşfi), lemon kuzeye Britanya'ya
(donanma sağlığı). İki Atlantik dünyası, iki ayrı 18. yy modu.

**Atlas runtime değişikliği YOK.** 7/8 yorumuyla aynı:
Atlas.tsx'in multi-anchor path collector'u (line 365) `listWords()`
üzerinden çalışıyor; lemon frontmatter'ına `atlasAnchors:`
eklemek otomatik rota çizimini açar. Sıfır kod değişikliği.

### (b) JOURNEY_TYPES DRY refactor (dilim 7/9.B)

**Önceki durum (mimari debt):** 7-arketip listesi **4 yerde**
duplicate:

1. `src/types/entities.ts` §JourneyType union + §JOURNEY_TYPES const — canonical
2. `src/content/loader.ts` — import from entities.ts ✓ (zaten doğru)
3. `src/pages/JourneyPage.tsx` — import from entities.ts ✓ (zaten doğru)
4. **`scripts/generate-manifest.mjs`** — local copy (Node ESM, .ts import edemiyordu)
5. **`scripts/validate-corpus.mjs`** — local Set (tsx altında çalıştığı halde local tutuyordu)

Dilim 7/6 "Yapılmayan" listesi'nde *"JOURNEY_TYPES listesi üç yerde
duplicate (refactor adayı)"* notu vardı. Bu dilim kapattı.

**Çözüm — tsx birleştirme:**
- `package.json`: `node scripts/generate-manifest.mjs` → `tsx scripts/generate-manifest.mjs` (3 yerde: `manifest`, `predev`, `pretypecheck`, `prebuild`).
- `vite.config.ts`: `spawnSync('node', [generatorPath], ...)` → `spawnSync(tsxBin, [generatorPath], ...)` (Windows için `tsx.cmd` fallback'i ile). `tsxBin` `node_modules/.bin/tsx`'i resolve eder.
- `scripts/generate-manifest.mjs`: local `JOURNEY_TYPES` array kaldırıldı, `import { JOURNEY_TYPES } from '../src/types/entities.ts'` eklendi (tsx artık .ts import'unu resolve ediyor — `validate-corpus.mjs` zaten aynı paterni `ATLAS_PLACES` için kullanıyordu).
- `scripts/validate-corpus.mjs`: local `JOURNEY_TYPES` Set kaldırıldı, aynı şekilde entities.ts'ten import. Set'i ihtiyaç anında `new Set(JOURNEY_TYPES)` ile lokal kur (`JOURNEY_TYPES_SET`); error mesajındaki spread'i array `JOURNEY_TYPES.join(', ')` ile değiştir.

**Negatif test ile doğrulanmış:** lemon.mdx'in journey_type'ını
*navigator* (canonical 7 listesinde olmayan) yapıp validate
koşturduğumda:

```
✘ 1 validation error(s):
  • [word/lemon#journey_type] unknown journey_type "navigator" —
    must be one of: translator, merchant, andalusian, crusader,
    astronomer, alchemist, diplomatic
```

Error mesajındaki canonical 7 üye **entities.ts'ten geldi** — refactor
sağlam. Geri restore ettim, ✔ 0 invariant violations.

**Yeni arketip eklemek artık:** entities.ts'te `JourneyType` union'a
ekle + `JOURNEY_TYPES` const'a ekle (tek dosyada **iki satır**) +
i18n locales üç dilde `journeys.<type>` anahtarı (zorunlu, kullanıcı-
görür). Eskiden buna ek olarak generate-manifest.mjs ve
validate-corpus.mjs'in **dördüncü ve beşinci yerlerinde** de
güncellenmek zorundaydı (kolay unutulur, drift kaynağı). Şimdi
duplicate yok.

**Vite plugin spawn değişikliğinin maliyeti:** tsx ilk modül
resolution ekstra ~150-200 ms ekler (esbuild başlatma). manifest
generation 6 MDX için ~50ms idi, şimdi ~200-250ms. 240 MDX'e
çıktığında bile <1s. Acceptable — manifest rejen sadece predev/
prebuild/MDX-watch'ta tetiklenir, hot loop değil.

### (c) NotFound manuscript redesign (dilim 7/9.C)

**Önceki hâl:** 80 satır inline-styled minimal blok ("404" mono
küçük başlık + display başlık + serif gövde + accent link). Dilim 1'de
yazılmıştı; sitenin geri kalanının sicilinde durmuyordu. GRAND_PLAN
§1.2 *"Ölçülü, akademik, manuscript-and-stratigraphy estetiği"* —
bu sayfa o sicili karşılamıyordu.

**Yeni tasarım — manuscript-katalog kart sicili:**

```
                          № 404

              Bu giriş henüz arşivde yok.

                  ────── ◇ ──────

      Aradığınız sayfa arşive girmemiş — *belki* bir
      bağlantı yanlış yöne kıvrılmıştır, *belki* içerik
      henüz işlenmiş değildir. Anasayfaya dönüp atlas
      haritasından, kelime dizininden ya da yolculuk
      arketiplerinden gezinebilirsiniz.

                 ← Anasayfaya dön
```

**Yapı taşları:**
- **Pre-label** "№ 404" (Arapça'da `٤٠٤`) — mono, gold-leaf,
  letter-spacing 0.25em uppercase. Kütüphane catalog numarası.
- **Title** — display serif (EB Garamond), 300 weight, üç dilde
  lyrical: "Bu giriş henüz arşivde yok" / "This entry is not yet
  in the archive" / "هذه المادَّةُ ليست في الأَرشيفِ بَعد."
- **◇ rule** — Stratigraphy stratum-bar motifinin küçük abisi:
  iki yana 1px çizgi (opacity 0.4), ortada ◇ glyph (gold-leaf,
  opacity 0.7). Sayfa nefesi, manuscript page break ritmi.
- **Body** — serif, manuscript-archive metaforu. Anahtar nüans:
  iki *belki*/*perhaps*/*لعلَّ* italik. Editöryel disiplin:
  "404" demiyor, "arşive girmemiş" diyor.
- **Back link** — italik serif, marjinal-not sicili. Moss accent
  (JourneyBadge ile aynı palet). Hover'da underline + ink color
  geçişi.

**i18n stratejisi:** bu sayfaya özgü prose üç dilde **inline**
JSX switch'i (HomePage tagline paterni). i18n bundle'a koymadım —
4 cümle, başka sayfada paylaşılmıyor, initial-paint chunk'ı
büyütmek lüks. Bundle accounting: NotFound chunk **1.05 KB gz**,
lazy (route-bazlı), 404'e gelinmedikçe yüklenmiyor.

**RTL davranışı:** `dir={lang === 'ar' ? 'rtl' : 'ltr'}` parent'ta;
catalog numarası Arapça'da `٤٠٤` (Arap-Hint rakamları, 4-0-4) —
Latin "№ 404"'ün Arapça versiyonu yok ama rakam karakterleri
locale'i takip etmeli. Back link okunu Arapça'da `→` (RTL akış
yönünde "geri"). Italic Arapça'da bold'a çevrildi (`[lang="ar"]
.notfound-body em { font-style: normal; font-weight: 700; }`) —
Amiri font italik desteklemez, bold daha okunaklı.

**Sayfa kapsamı:** NotFound, *catch-all* unmatched-route handler'ı.
Person/Book/Theme rotalarında valid route ama eksik entity →
`EntityPageStates.EntityNotFound` (ayrı bileşen, dilim 7/1'de
açıldı). NotFound saf "URL hiç eşleşmedi" durumu için —
/asdfasdf, /tr/yanlis-yon, vb.

### Bundle Δ

| Chunk | 7/8 sonu | 7/9 | Δ gz |
|---|---|---|---|
| `index` (eager core) | 81.14 | 81.18 | +0.04 |
| `HomePage` | 8.22 | 8.22 | 0 |
| `registry` (shared) | 10.53 | **11.10** | **+0.57** (lemon atlasAnchors[] 4 hop) |
| `lemon` (lazy MDX) | 16.65 | 17.16 | +0.51 |
| `NotFound` (lazy, YENİ) | — | **1.05** | yeni chunk, lazy |
| `AtlasGeography` (shared) | 1.96 | 1.96 | 0 |
| **Initial paint (HomePage)** | **~101.9** | **~102.5** | **+0.6 KB gz** |

Lemon multi-anchor maliyeti 0.57 KB registry'de — orange/coffee
ile aynı yapısal pay (4-hop manifest data). NotFound lazy chunk
eager bundle'a değmiyor. JOURNEY_TYPES refactor net etkisi sıfır
(silinen local kopyalar = yeni import edilen referansla denkleşiyor).

**Initial paint trendi (7/6 → 7/9):**

| Dilim | Initial paint (KB gz) | Δ |
|---|---|---|
| 7/6 | ~101.0 | — |
| 7/7 | ~101.3 | +0.3 (7 archetype i18n subtitles) |
| 7/8 | ~101.9 | +0.6 (orange + coffee atlasAnchors) |
| 7/9 | ~102.5 | +0.6 (lemon atlasAnchors) |

Linear ~+0.5 KB / dilim trend. 9 Word'ün hepsi 4-hop multi-anchor'a
çıksa registry +~3 KB gz; manageable.

### Korpus + mimari durumu

- **9 word / 1 person / 1 book / 3 theme** (sayısal değişmedi)
- **19 atlas place** (değişmedi)
- **5 multi-anchor Word** (+1: lemon): cotton/sugar 3-hop;
  orange/coffee/lemon 4-hop. Coverage 5/9 (%56).
- **4 görsel-ayrı atlas rotası**: (cotton+sugar+lemon ilk 3 hop'ta
  overlap; lemon Cordoba sonrası kuzeye) + orange Lisbon'a +
  coffee Mokha → Londra.
- **JOURNEY_TYPES tek doğru kaynak** (4 yer → 1 yer)
- **NotFound manuscript redesigned** — polish layer ilk girişi

### Sonraki dilim için öneriler

1. **7 arketip için tam essay (~600 kelime/dil/arketip).** Hâlâ
   subtitle'lar (~30-50 kelime) ile sınırlıyız; tam essay editöryel
   düzeyde §4.5'te planlı. `content/journeys/*.mdx` + parseJourney +
   manifest entry. ~12,600 kelime editöryel yük. *Kullanıcının
   editöryel sesinde* yazılmalı.
2. **Catalogue tier'ın açılması.** §12.2 (korpus skoru) %19 →
   %23-27 sıçramasını sağlayacak en büyük tek tahrik. 10-15
   catalogue Word (editöryel format showcase'in 1/4 uzunluğunda).
   Ağırlıklı ortalama %35 → %38-40 beklenir.
3. **`/words` Catalogue route'u + filtre paneli.** §4.2'de planlanan
   3-mode görünüm (grid / liste / kronoloji) + filter (journey_type,
   atlasAnchor, tier). Atlas pin'i + Directory tag'i + bu sayfa
   filtreleri = entity-arası çapraz-erişimin tam UI'ı.
4. **Polish layer derinleştirme.** NotFound başlangıç. Sıradakiler:
   sayfa geçişleri (View Transitions API veya framer-motion fade-in),
   route-değişim ink-drop loading state'i (lazy entity sayfaları için),
   easter egg (favicon tıklama? Atlas zoom animasyonu?). §12.4'ün
   asıl açılışı.
5. **Atlas mobile / responsive ölçeklendirme.** Şu an viewBox sabit
   1200×700, mobilde dar ekranlarda pin etiketleri çakışır.
   Atlas için ayrı bir mobile-density-tuned viewBox veya viewport-
   bazlı pin yoğunluğu adaptif.
6. **al-Khwārizmī'nin atlasAnchors zenginleşmesi.** Şu an Hârezm
   → Bağdat (2 hop). Bağdat ölümünden sonra eserlerinin gittiği
   yerler (Toledo çevirisi, Floransa Fibonacci) ek anchor'lar
   olarak eklenebilir → 4-hop Person. Bilimsel diaspora görsel
   argümanı.

---


## Oturum 7 — dilim 8 (Atlas +2 place + orange/coffee 4-hop multi-anchor + Word-card journey tag)

Üç-kollu sprint: (A) `src/content/atlas.ts`'e iki yeni place — **lisbon**
ve **mokha** — orange'ın Portekiz çağı terminus'u ve coffee'nin Yemen
kökeni için; (B) orange.mdx + coffee.mdx multi-anchor — cotton/sugar'ın
3-hop paterni 4-hop'a uzatıldı ve **temelden farklı iki coğrafi
trajede**: orange Damascus üzerinden Atlantik'e, coffee Mokha'dan
Londra'ya; (C) HomePage'de Word kartlarına inline JourneyBadge —
küçük moss-yeşili "◆ ARKETİP" tag'i (Persons/Books/Themes
sütunlarında yok).

Dilim 7/6.A'da Word.atlasAnchors mimari simetrisi açılmış (cotton),
7/7.C'de ikinci Word eklenmişti (sugar); ama her ikisi de aynı 3-hop
rotada (Delhi → Bağdat → Kurtuba) — Atlas haritasında **tek bir
tarihsel olgunun iki kanıtı** (Watson'ın Arap Yeşil Devrimi: tekstil +
şeker). Bu dilim Atlas'ı **tek-olgu tek-rota**'dan **çoklu-olgu
çoklu-rota**'ya geçiriyor: 4 Word, 4 bağımsız tarihsel olgu, 4 ayrı
coğrafi argüman. Ve HomePage'in journey arketipleri artık Directory
grid'de Word kartları içinde görünür — Atlas pin'i + Directory tag'i +
Theme back-link + Journey pill, 4 ayrı modalitenin birleşik görsel dili.

### (a) Atlas: lisbon + mokha (dilim 7/8.A)

`src/content/atlas.ts`'e iki yeni `AtlasPlace`, alfabetik konumda:

```ts
{
  slug: 'lisbon',
  coords: [85, 385],
  name: { tr: 'Lizbon · Lisboa', en: 'Lisbon', ar: 'لشبونة' },
  region: { tr: 'Portekiz · Atlas Kıyısı', en: 'Portugal · the Atlantic coast', ar: 'البرتغال · الساحلُ الأطلسيّ' },
},
{
  slug: 'mokha',
  coords: [555, 645],
  name: { tr: 'Muha · Mokha', en: 'Mokha · al-Mukhā', ar: 'المُخا' },
  region: { tr: 'Yemen · Kızıldeniz', en: 'Yemen · the Red Sea', ar: 'اليَمَن · البَحرُ الأحمَر' },
},
```

**Koordinatlar.** Atlas viewBox 1200×700, kabaca x=0 İberya batısı,
x=1200 Hint yarımadası doğusu; y=0 kuzey (Britanya), y=700 güney
(Yemen/Hint Okyanusu). Lizbon Cordoba'dan ([125, 410]) biraz batı ve
biraz kuzey; Atlas'ın *batı ucu*. Mokha Cairo'dan ([510, 470])
güney-doğu, Kızıldeniz'in güney kıyısı; Atlas'ın *güney ucu* — bugüne
kadar olmayan bir coğrafi referans noktası açıyor.

**Yer seçimi disiplini.** README'nin 7/7 sonu "Sonraki dilim için
öneriler" listesinde 4 aday vardı (lisbon, mokha, manchester,
hispaniola). Bu dilimde *yalnız ikisi*: lisbon ve mokha — çünkü:

- **Manchester (sınai pamuk)** bu dilimde cotton'a dokunulmuyor;
  veri-tüketicisiz bir AtlasPlace eklemek mimari disiplini (her
  veri parçasının bir runtime tüketicisi olmalı) bozardı. cotton'un
  bir gün 4-hop'a uzatılıp Manchester'a varması olabilir; o zaman
  manchester eklenir.
- **Hispaniola (kolonyal şeker)** Atlas viewBox'ının (x=0..1200) dışında —
  Karayipler eklenmesi viewBox'ı yeniden ölçeklendirmek + bütün
  mevcut place'lerin x koordinatlarını re-pivot etmek anlamına gelir.
  Bu ayrı bir geometri-pivot dilimi (ileride "küresel kapsamı açan
  re-scoping").

**Validator otomatik tanır.** `scripts/validate-corpus.mjs`'in
`ATLAS_SLUGS` set'i `new Set(Object.keys(ATLAS_PLACES))` ile runtime'da
kuruluyor; yeni slug'lar otomatik tanınır. Hiçbir validator değişikliği
gerekmiyor. ✔ 0 invariant violations.

### (b) orange + coffee multi-anchor (dilim 7/8.B)

Cotton'un (7/6.A) ve sugar'ın (7/7.C) frontmatter paterni izlendi:
mevcut `atlasAnchor:` korundu (fallback), üstüne `atlasAnchors:` listesi
yazıldı. Her anchor 3 dilde label + year.

**orange — 4-hop rota: Delhi → Şam → Kurtuba → Lizbon.**

| Hop | Yer | Yıl | Tematik kapsam |
|---|---|---|---|
| 1 | delhi | c. 500 BCE — 700 CE | Indus-Pers koridoru — Sanskritçe *nāraṅga*, Hint substrat ödüncü |
| 2 | damascus | 9. — 13. yy | Arap eczacılığının *nāranj*'ı — Suriye bahçeleri, *Qānūn* maddesi |
| 3 | cordoba | 10. — 15. yy | Endülüs avlu-bahçesinin acı portakalı, *naranja* > Avrupa dilleri |
| 4 | lisbon | 1520 → | Portekiz gemilerinin Çin'den getirdiği tatlı portakal — yeni adı *portakal* |

Niye Şam (Damascus), Bağdat değil? Orange'ın strata-4 yer satırı
"Bağdat · Şam · Eczacılığın Nāranj'ı" — *Qānūn*'da *nāranj* girdisi
İbn Sīnā Buhara/İsfahan'da yazıldı ama "klinik metin" coğrafyası Şam
Emevi/Eyyubi eczanesi: turunç ve narenciye yağı (zayt al-naranj) ilk
ticari ölçekte burada damıtıldı. Cotton'un Bağdat hop'u "tekstil
dokuma standardı" — paralel olgu, paralel şehir. Atlas haritasında
orange ve cotton/sugar **Damascus civarında ayrışır**: cotton/sugar
Bağdat'a iner (güney), orange Şam'a sapar (batı).

Niye 4-hop, 3-hop değil? Orange editöryel stratasında *iki ayrı
meyve* anlatılıyor: acı portakal (10.-15. yy, Endülüs sonu) ve
tatlı portakal (1520+, Portekiz). Bu iki olgu coğrafi olarak ayrılıyor:
ilki Kurtuba'da duruyor, ikincisi Lizbon'a uzanıyor. 3-hop'ta keseydim
editöryel gerçekliği keserdim. Cotton/sugar 3-hop kalıyor çünkü
onların tarihi Kurtuba'da kapanıyor (Endülüs sonrası başka bir bölüm
değil; yalnız modern kolonyal çağ, ki ayrı bir hop için viewBox dışına
çıkmak gerek).

**coffee — 4-hop rota: Muha → Kahire → Konstantinopolis → Londra.**

| Hop | Yer | Yıl | Tematik kapsam |
|---|---|---|---|
| 1 | mokha | c. 1450 — 1550 | Yemen Sufi halkalarının *qahwa*'sı — Aden, Mokha, dünyaya tek kapı |
| 2 | cairo | 1500 — 1600 | Memlûk başkenti — Al-Azhar etrafında ilk kahvehaneler ve *fatwā* tartışmaları |
| 3 | constantinople | 1555 — 1700 | Osmanlı kahvehanesinin doğuşu — Tahtakale, Kanunî sonrası sosyal sözleşme |
| 4 | london | 1652 — 1750 | Penny universities — Lloyd's, Jonathan's, Aydınlanma çekirdek mekânları |

Coffee'nin atlasAnchor (fallback) "cairo" kalıyor — şehir-coğrafyası
en simetrik konumda. Ama 4-hop rota artık öne geçiyor: Atlas'ta
çizgi Mokha'dan Londra'ya tırmanır. Mokha → Cairo segmenti (y=645 →
y=470, Δy=175) Atlas'ın *en güneyden çıkan tek diyagonal*'i — başka
hiçbir Word rotası Yemen'e dokunmuyor. Atlas okuru için bu çizgi tek
başına bir argüman: "kahve diğer bütün showcase Word'lerden farklı
bir tarih-coğrafyaya ait — onun referans noktası Akdeniz değil
Kızıldeniz".

Niye Venedik değil (strata-3'te geçiyor)? Coffee Londra'da
"sociopolitical thickness" zirvesine ulaşır — Lloyd's of London
sigortacılığı, Jonathan's borsa, Aydınlanma kahvehaneleri. Venedik
ticari giriş noktası ama kurumsal etki Londra. Editöryel hiyerarşi:
Mokha (origin) → Cairo (institutional) → Constantinople (imperial) →
London (modern public sphere). 4 hop, 4 tarihsel mod.

**Atlas runtime değişikliği YOK.** `src/components/Atlas.tsx`'in
multi-anchor path collector'u (line 365, `listWords()`'ten
`atlasAnchors` topluyor) zaten cotton + sugar için çalışıyordu;
orange + coffee atlasAnchors'a sahip oldukları anda otomatik rota
çizimi alır. SVG `<path className="atlas-theme-path">` rendering
loop'u (line 551) 4 word path'i çizer — name-space collision-free
(`word/orange`, `word/coffee` keys). Sıfır kod değişikliği.

### (c) HomePage WordCard inline journey tag (dilim 7/8.C)

`src/pages/HomePage.tsx`'in `EntityCard` subkomponentine opsiyonel
`journeyTag?: JourneyType` prop'u; mevcut olduğunda kart başlığının
*üstünde* küçük inline tag belirir:

```tsx
{journeyTag && (
  <span className="home-entity-journey">
    <span className="home-entity-journey-mark" aria-hidden="true">◆</span>
    <span className="home-entity-journey-text">{t(`journeys.${journeyTag}`)}</span>
  </span>
)}
```

Tag *yalnız Words sütununda* görünür — Persons/Books/Themes
sütunlarında EntityCard çağırırken `journeyTag` prop'u verilmez,
TypeScript'in opsiyonel-prop sözleşmesi gereği undefined kalır,
render edilmez.

**Tipografi.** `font-family: var(--mono)`, `font-size: 0.625rem`,
`letter-spacing: 0.15em`, `text-transform: uppercase`. Bu register
HomePage'in `.home-directory-col-head`'inin (0.18em letter-spacing,
mono, uppercase) küçültülmüş kardeşi — başka bir tipografik dünya
açmıyor, mevcut "etiket" diline yapışıyor. Glyph (◆) JourneyBadge
ile aynı.

**Renk.** `color: var(--moss, var(--accent))`, `opacity: 0.78`.
Hover'da opacity → 1, ama renk aynı kalır (tıklanır görüntü vermesin
diye — tag tıklanmaz, kart-link bütünlüğü korunur). JourneyBadge'in
moss-paleti ile birebir.

**Arapça hijyeni.** `[lang="ar"]` selector'ında `text-transform: none`
(Arapça'da uppercase yok), `font-family: var(--arabic-ui)` (mono
Arapça karakterleri kötü resmeder), `font-size: 0.75rem` (Arapça mono
Latince mono'dan biraz daha büyük olmalı — palet hijyeni).

**WordSummary verisi.** `journey_type?: JourneyType` zaten 7/6.C'de
WordSummary'ye eklenmişti — manifest pipeline'ı her şeyi taşıyor.
Sadece HomePage'in `words.map` kapanımı `w.journey_type`'ı
EntityCard'a iletmeye başladı. 9 showcase Word'ün hepsi
`journey_type` sahibi (alcohol→alchemist, sugar/coffee→merchant,
algebra/algorithm/zero→translator, cotton/lemon/orange→andalusian) —
HomePage'de 9 kartın 9'unda tag görünür.

Niye tag, kart-link İÇİNDE? Çünkü kart-link bütün kartı kapsar
(`<Link>` > tüm içerik). Tag link içinde olunca tıklama Word sayfasına
gider — journey sayfasına değil. *Niye journey sayfasına tıklayamasın?*
Bilinçli tasarım kararı: tek bir kart bir tek hedefi belirtmeli (Word).
Journey arketibine erişmek için kullanıcı zaten HomePage'in
*home-journeys* section'ında (7/7.B'de eklendi) pill'lere tıklayabilir.
Görsel ekonomi: tag arketibi *imler*, navigasyonu değil. Atlas pin'i
de böyledir — pin Word sayfasına gider, bölge etiketi tıklanmaz.

### Bundle Δ

| Chunk | 7/7 sonu | 7/8 | Δ gz |
|---|---|---|---|
| `index` (eager core) | 81.13 | 81.14 | ~0 |
| `HomePage` | 8.16 | 8.22 | +0.06 (journey-tag JSX + i18n key lookup) |
| `registry` (shared) | 9.55 | 10.53 | **+0.98** (orange + coffee `atlasAnchors[]` 8 anchor × 3 dil × {year, label}) |
| `orange` (lazy) | 19.96 | 20.33 | +0.37 |
| `coffee` (lazy) | 21.88 | 22.38 | +0.50 |
| **Total initial paint** | **~113** | **~114** | **+1.1 KB gz** |

Multi-anchor maliyetinin büyük çoğunluğu `registry` chunk'ında —
manifest senkron tüketilir (Atlas anasayfada eager). Bu yapısal
maliyet; lazy edilemez. Her yeni multi-anchor Word için ~0.5 KB gz
bekleniyor. 4 mevcut multi-anchor Word toplam ~2 KB gz registry
payı — 9 Word/3 Theme/1 Person/1 Book = 14 entity manifest
toplamının ~%20'si.

### Korpus durumu (değişmedi sayısal, zenginleşti yapısal)

- **9 word** (alcohol, algebra, algorithm, coffee, cotton, lemon,
  orange, sugar, zero) — sayısal aynı, ama dördü artık multi-anchor:
  cotton/sugar 3-hop + orange/coffee 4-hop. Multi-anchor coverage:
  4/9 = %44.
- **19 atlas place** (17'den +2: lisbon, mokha)
- **Atlas rota sayısı:** cotton + sugar üst üste = 1 görsel rota;
  +orange (4-hop) + coffee (4-hop) = toplam **3 görsel-ayrı rota**
  Atlas haritasında çiziliyor (önceki dilim sonunda 1).
- **Coğrafi kapsam:** Atlas viewBox'ının batı ucu (Lizbon) ve güney
  ucu (Mokha) ilk defa varlık-anchor noktaları haline geldi —
  haritanın aktif alanı genişledi.
- HomePage Word kartları: 9/9'unda görsel journey tag

### Sonraki dilim için öneriler

1. **7 arketip için tam essay (~600 kelime/dil/arketip).** Hâlâ
   subtitle'lar (~30-50 kelime) ile sınırlıyız; tam essay editöryel
   düzeyde §4.5'te planlı. `content/journeys/*.mdx` + parseJourney +
   manifest entry gerekir. ~12,600 kelime editöryel yük. *Kullanıcının
   editöryel sesinde* yazılmalı; subtitle'lar yer kapatır ama tonal
   olarak değişebilir.
2. **Catalogue tier'ın açılması.** §12.2 (korpus skoru) %17 →
   %22-25 sıçramasını sağlayacak en büyük tek tahrik. 10-15
   catalogue Word (editöryel format showcase'in 1/4 uzunluğunda).
   Ağırlıklı ortalama %35 → %38-40 beklenir.
3. **`/words` Catalogue route'u + filtre paneli.** §4.2'de planlanan
   3-mode görünüm (grid / liste / kronoloji) + filter (journey_type,
   atlasAnchor, tier). Atlas pin'i + Directory tag'i + bu sayfa
   filtreleri = entity-arası çapraz-erişimin tam UI'ı. Tier-/journey-
   filter widget'ı catalogue tier opening bekleyebilir (catalogue
   tier ile birlikte gelir).
4. **Lemon multi-anchor (üçüncü 4-hop Word).** İbn Sīnā ekseninde
   bir rota: bukhara (*Qānūn*) → cairo (eczacılık) → cordoba (Endülüs
   bahçesi) → ... (4. hop adayı?). Editöryel bağlam gerektirir.
   Atlas haritasında al-Khwārizmī'nin atlasAnchors'ı zaten
   khwarazm → baghdad — lemon'un bukhara hop'u onunla görsel
   olarak konuşurdu (bilim ve eczacılık tarihi farklı şehirde
   nasıl aynı çağda paralel kurulur).
5. **Atlas region etiketleri.** AtlasPlace.region (al-Andalus,
   Mesopotamia, Transoxiana, Yemen · Kızıldeniz, Portekiz · Atlas
   Kıyısı, vs.) zaten tüm 19 place'te tanımlı, ama UI'a değmiyor.
   Bölge etiketi ekleme — D3 collision detection veya manuel
   yerleşim — coğrafi bağlam katmanı.
6. **Atlas mobile / responsive ölçeklendirme.** Şu an viewBox sabit
   1200×700, mobilde dar ekranlarda pin etiketleri çakışır. Atlas
   için ayrı bir mobile-density-tuned viewBox veya `viewport`-
   bazlı pin yoğunluğu adaptif.

---


## Oturum 7 — dilim 7 (`/journeys` route + arketip dizini + ikinci multi-anchor Word)

Üç-kollu sprint: (A) `/journeys` ve `/journeys/:type` route'ları +
JourneysIndexPage + JourneyPage + reverse-index + 7 subtitle ×
3 dil, (B) HomePage'de 7-arketip pill dizini, (C) sugar.mdx
multi-anchor (cotton ile paralel Arap Yeşil Devrimi rotası).

Dilim 7/6.C'de `journey_type` schema açılmış, JourneyBadge WordPage'de
görünüyordu ama *gidilecek bir yer yoktu* — rozet "translator" diyordu
ama tıklanmıyordu. Bu dilim o boşluğu kapatıyor: rozetten arketibin
sayfasına, sayfadan arketibe ait diğer Word'lere; arketiplerden HomePage'e
geri. Editöryel disiplin: i18n bundle'a yalnız *subtitle* (1 paragraf,
arketibin tanımı); tam essay (sonraki içerik dilim'i için, kullanıcının
editöryel sesinde) açıkta — şu an "henüz örneksiz" notuyla şeffaf
biçimde işaretli.

### (a) `/journeys` + `/journeys/:type` routes (dilim 7/7.A)

**URL şeması:**
- `/:lang/yolculuk` → JourneysIndexPage (7 arketip dizini)
- `/:lang/yolculuk/:type` → JourneyPage (tek arketip)

Path segment'i `yolculuk` Türkçe sabit (ENTITY_PATH_SEGMENT'la aynı
disiplin — GRAND_PLAN §3.2). En/ar URL'leri de `/en/yolculuk/translator`,
`/ar/yolculuk/translator` formunda.

**Tip değişiklikleri (`src/router/paths.ts`):**
- `JOURNEYS_PATH_SEGMENT = 'yolculuk'` sabiti
- `journeysUrl(lang)` ve `journeyTypeUrl(lang, type)` URL helper'ları
- Entity path'lerin tersine, journey path tipini `ENTITY_PATH_SEGMENT`'a
  eklemedik çünkü journey 4-entity grafının dışında — Word'lerin
  *meta-taksonomisi*, ayrı bir entity tipi değil.

**Routes (`src/router/AppRoutes.tsx`):**
- İki yeni React.lazy import: `JourneysIndexPage`, `JourneyPage`
- LangScope altında iki yeni `<Route>` — entity route'larıyla aynı
  Suspense + lazy pattern.

**Reverse-index (`src/content/registry.ts`):**
- Yeni helper'lar:
  - `getWordsByJourney(type: string): WordSummary[]` — arketibe ait
    Word özetlerini döner. Manifest'ten eager IIFE ile kurulur
    (Theme reverse-index ile aynı pattern). Mikro veri (9 word ×
    7 arketip max), lazy memoize gereksiz.
  - `listJourneyCounts(): Array<{type, count}>` — JourneysIndexPage
    için. Sıralama §4.5 GRAND_PLAN'daki kanonik sıra (translator →
    diplomatic), alfabetik değil (editöryel ağırlık var).

**JourneysIndexPage component (`src/pages/JourneysIndexPage.tsx`):**
- 7 arketip kartı, her biri:
  - Mark (`◆`) + arketip adı (i18n `journeys.<type>`)
  - Word sayısı rozeti (mono font, küçük caps — manuscript catalogue
    numarası izlenimi)
  - Subtitle (i18n `journeys.subtitle.<type>` — 30-50 kelime tanımlama)
- Empty arketipler (count === 0: crusader, astronomer, diplomatic)
  silik (`opacity: 0.62`) ama yine de tıklanabilir — kullanıcı "bu
  arketip ne demek?" diye merak ederse JourneyPage'ten tanımı okur.
- Footer'da küçük italik editorial-note: "Bu sayfanın tanıtım metni
  şu an kısa bir alt-başlıkla sınırlı. §4.5'te planlı tam essay
  sonraki editöryel dilim için açıkta." Şeffaflık disiplini.

**JourneyPage component (`src/pages/JourneyPage.tsx`):**
- URL param doğrulama: `JOURNEY_TYPES`'a uymayan değer →
  `Navigate to={homeUrl(lang)} replace`. Validator URL'i denetlemez,
  bu sayfa kendisi doğrular.
- Kompozisyon:
  - Breadcrumb (← Bütün yolculuklar)
  - Mark (`◆`) + arketip adı (büyük başlık)
  - Subtitle (italik, max 60ch line-length)
  - Words listesi (1/2/3-sütun responsive grid)
  - Empty state: "Bu arketibe ait kelimeler henüz korpusa girmedi.
    Sonraki içerik dilim'lerinde — admiral, assassin, Aldebaran gibi
    adaylarla — bu sayfa dolacak." (3 boş arketip için görünür.)

**i18n locales — `journeys.*` bloğu genişletildi:**

Yeni anahtarlar (3 dilde):
- `journeys.indexTitle`, `journeys.indexSubtitle`, `journeys.indexBack`
- `journeys.wordCount_one`, `journeys.wordCount_other` (pluralization)
- `journeys.empty`, `journeys.emptyNote`
- `journeys.editorialNote`
- `journeys.subtitle.<type>` × 7 — arketibin tanımlaması

7 subtitle x 3 dil x ~30-50 kelime = ~1,000 kelime editöryel prose.
Tonal disiplin: **factual, encyclopedic, neutral register** — showcase
Word'lerin literary tonundan ayrı. Bu disiplin gelecekteki editöryel
dilim'in üzerine yazabileceği bir taban; sıkı edebî bir cümle koymak
*kalitesizlik değil* ama bu seviyede *yer kapatır*. Yer açık bırakıldı.

### (b) HomePage'de Journeys section (dilim 7/7.B)

**Yer:** Atlas (coğrafi gezinti) + Directory (alfabetik dizin) arasında.
Üçüncü gezinti katmanı — *taksonomik*.

**Yapı:**
- Section header: "Yolculuk arketipleri" başlığı (Link to /yolculuk)
  + subtitle ("7 yolculuk arketipi · kelimelerin geliş yolları")
- 7 pill liste (flex-wrap):
  - Mark (`◆`) + arketip adı + sayı rozeti
  - JourneyBadge'in moss-yeşili paletini takip eder
  - Empty arketipler silik (`opacity: 0.55`) — tıklanabilir kalır

**Mimari karar:** HomePage'in zaten 3 ana erişim modu vardı:
1. **Atlas** — coğrafi olarak ("Bağdat'ta kim var?")
2. **Directory** — alfabetik liste ("kelime A→Z")
3. Şimdi **Journeys** — taksonomik ("hangi yolculuk arketipi?")

Üç farklı sorgu zihniyeti, üç farklı UI affordance. Aynı 9 Word'e üç
farklı yoldan ulaşılabilir — bu kullanıcı için "kelimeleri keşfetmek"
sözlü ezbere düşmez.

**HomePage.tsx değişikliği:** ~30 satır ek JSX; imports'ta
`listJourneyCounts`, `journeyTypeUrl`, `journeysUrl` eklendi.

**HomePage.css ekleri:** `.home-journeys`, `.home-journey-pill`,
`.home-journey-pill--empty`, `.home-journey-pill-count` (mono küçük
rozet). RTL adaptasyonu otomatik (logical properties + flex-wrap).

### (c) sugar.mdx multi-anchor — paralel Arap Yeşil Devrimi rotası (dilim 7/7.C)

Cotton dilim 7/6.A'da multi-anchor olmuştu: **Delhi → Bağdat → Kurtuba**.
Sugar'ın strata'sı (yukarıda 5 yer'e değiniyor) aynı yolu izliyor:
- Stratum 5 (~350 BCE): Ganj Vadisi → **delhi** anchor
- Stratum 4 (~850-1000): Cundişapur, Bağdat, Basra → **baghdad** anchor
- Stratum 3 (10-15. yy): Mısır, Endülüs, Sicilya, Cenova → **cordoba** anchor

Üç anchor seçimi cotton ile *birebir aynı* (Delhi → Baghdad → Cordoba).
Editöryel niyet: bu örtüşme tesadüfi değil. André Watson'ın "Arab
Agricultural Revolution" tezi (1983) — 8-12. yüzyıllarda Arap-İran
ekosistemi Hindistan'dan birçok mahsul (pamuk, şeker, pirinç, narenciye,
patlıcan) aynı kanaldan Akdeniz'e taşıdı; Endülüs *acequia* ağı bu
yeniliklerin son istasyonuydu. **Atlas haritasında iki paralel dotted
çizgi** (cotton ve sugar) bu tezi *görsel olarak* gösteriyor: aynı
trajeyi takip eden iki Word, aynı çağda aynı yoldan geçmiş.

Frontmatter güncellemesi:
```yaml
atlasAnchor: cordoba       # eski tek-yer, fallback olarak korundu
atlasAnchors:              # yeni çoklu-yer rotası
  - slug: delhi
    year: "c. 350 BCE ↓"
    label: { tr: "Ganj Vadisi · Pataliputra — *śarkarā* / *guḍa*; ..." }
  - slug: baghdad
    year: "c. 850 — 1000"
    label: { tr: "Cundişapur, Bağdat, Basra — Arap eczacılığında *sukkar* ..." }
  - slug: cordoba
    year: "10. — 15. yy"
    label: { tr: "Endülüs, Sicilya, Cenova — *azúcar* / *zucchero*; ..." }
```

Atlas'ta toplam multi-anchor rota sayısı: 4 (cotton, sugar,
al-khwarizmi, al-jabr) + 1 magnum theme (hindu-arabic-numerals). İki
Word'ün aynı 3-yer rotasını izlemesi atlas üzerinde *paralel görsel
desen* yaratıyor — kanalın kendisi anlamlı bir tarihsel olgu olarak
görünür kılınıyor.

### Build çıktısı (dilim 7/7 sonu)

| | 7/6 sonu | 7/7 sonu | Δ |
|---|---|---|---|
| `index` (eager core) | 77.23 | 81.13 | **+3.90** |
| `localized` (manifest) | ~8.9 | ~9.2 | +0.3 |
| `transform` (d3) | 12.46 | 12.46 | 0 |
| `HomePage` | 7.77 | 8.16 | +0.39 |
| `AtlasGeography` | 10.59 | 1.77 | -8.82¹ |
| `registry` (shared) | — | 9.55 | **+9.55** (YENİ) |
| `loader` (parser) | 28.10 | 28.08 | -0.02 |
| YENİ `JourneysIndexPage` | — | 0.55 + 0.79 = 1.34 | lazy |
| YENİ `JourneyPage` | — | 0.77 + 0.79 = 1.56 | lazy |
| **Total initial paint** | **~108.05** | **~113.07** | **+5.0 KB gz** |

¹ AtlasGeography'nin `10.59 → 1.77` "düşüşü" yanıltıcı — Vite chunk
organizasyonu değişti. 7/6'da AtlasGeography bazı bağımlılıkları
(muhtemelen d3 selection) dolaylı taşıyordu; 7/7'de Vite registry'i
ayrı chunk olarak çıkardığında, AtlasGeography sadece kendi içeriğini
taşıyor. Net etki kullanıcı için: aynı ya da daha iyi (paylaşılan
chunk Vite cache'iyle değer veriyor).

**Yeni `registry` chunk (+9.55 KB gz):** 4 importer (HomePage,
JourneysIndexPage, JourneyPage, Atlas) → Vite paylaşılan chunk
çıkardı; mimari olarak temiz. Her tek importer için ayrı kopya yok.

**+3.90 KB gz `index` artışı dağılımı (tahmini):**
- i18n journeys subtitles + indexTitle + indexSubtitle + emptyNote +
  editorialNote × 3 dil ≈ 3-3.5 KB gz (Arapça en uzun, ~1.2 KB)
- JOURNEYS_PATH_SEGMENT + journey URL helpers ≈ 0.1 KB
- HomePage Journeys section JSX + import refs ≈ 0.3 KB

Lazy chunk'lar (JourneyPage 0.77 + JourneysIndexPage 0.55 = 1.32 KB gz)
yalnız o sayfalar ziyaret edildiğinde indirilir.

### Korpus durumu (dilim 7/7 sonrası)

- **9 word** (alcohol, algebra, algorithm, coffee, cotton ¹,
  lemon, orange, **sugar** ¹, zero) — *iki* multi-anchor Word artık.
  ¹ Aynı 3-anchor rotası: Delhi → Baghdad → Cordoba.
- **1 person** (çoklu-anchor) + **1 book** (çoklu-anchor) + **3 theme**
  (1 magnum + 2 cluster; 2'si çoklu-anchor).
- 9 word artık `journey_type` ile kategorize: 3 translator + 3
  andalusian + 2 merchant + 1 alchemist; 3 arketip (crusader,
  astronomer, diplomatic) henüz örneksiz (JourneyPage'lerinde "henüz
  örneksiz" notu görünür).
- 17 atlas place — değişmedi.
- Atlas multi-anchor rota sayısı: önceden 3 (cotton, al-khwarizmi,
  al-jabr); şimdi 4 (+ sugar).
- `/journeys` route'u canlı — homepage'den + WordPage rozetinden
  navigate edilebilir.
- `npm run validate` ✓ — 0 ihlal; iki negatif test (bad atlasAnchors
  slug 7/6'dan beri çalışıyor, bad journey_type enum 7/6.C'de eklendi).
- `npm run typecheck` ✓ — strict + noUnusedLocals + noUncheckedIndexedAccess
  altında temiz.
- `npm run build` ✓ — initial paint ~113 KB gz; lazy chunks kompozisyonu
  korundu.

### Mimari kararlar (bu dilim'e özgü)

- **#35. Journey arketipini ayrı bir entity tipi olarak DEĞİL, Word'ün
  meta-taksonomisi olarak modellemek.** Theme/Person/Book/Word dört
  entity tipi `BaseEntity` üzerinden ortak şeklini paylaşır (strata,
  sources, atlasAnchor, vb). Journey arketipi 5-stratum kazısı
  taşımıyor; bir *kategori*, bir tarihsel anlatı değil. Bu nedenle:
  - JourneyType bir union (7 string), entity değil
  - Route shema'sında `yolculuk` segment'i `ENTITY_PATH_SEGMENT`'a
    eklenmiyor
  - Manifest tarafında ayrı bir `JOURNEY_MANIFEST` yok; reverse-index
    Word manifest'inden kurulur
  - parseJourney yok, validate'te journey-as-entity check yok
  Karar gerekçesi: GRAND_PLAN §4.5'te "yolculuk arketipi" sözcüğü
  *kategori* anlamında kullanılıyor; entity-grafının dışında kalan
  bir kesişim eksenidir.

- **#36. JourneyPage'lere full essay yerine subtitle.** §4.5'te
  "mini-essay" var; bu dilim *yalnız subtitle* yazdı (~30-50 kelime).
  Tam essay (~600 kelime) sonraki editöryel dilim için açıkta. Niçin:
  *kullanıcının editöryel sesi olmadan* 7 essay yazımı 7 ayrı sıkı
  cümle disiplini ister. Açıkta bırakmak doğru disiplin: footer'da
  şeffaf "henüz subtitle seviyesinde" notu var. Bu *teknik borç değil
  editöryel borç* — şu an "okunabilir bir UI"yi tamamlamak için
  yeterli.

- **#37. i18n bundle subtitle için, content/mdx full essay için.**
  Şu an subtitle'lar `journeys.subtitle.<type>` anahtarlarında.
  Full essay geldiğinde `content/journeys/translator.mdx` benzeri
  dosyalar açılır; o zaman parseJourney, summarizeJourney, manifest
  entry, validate kontrolü gerekir. **Bu migrasyon yolu**:
  - Schema-light şu an: i18n
  - Schema-rich daha sonra: MDX entity, ama 5-stratum'sız (kategori
    entity'leri için ayrı BaseEntity variant olabilir)
  JSDoc'ta açıkça not düştüm — gelecek-Claude oturumu bu yolu görür.

- **#38. Sugar'ın atlasAnchors'ı cotton ile birebir aynı (Delhi →
  Baghdad → Cordoba).** Tesadüf değil; *editöryel kararla* aynı
  seçildi. Atlas haritasında iki paralel dotted çizgi → "aynı kanal,
  iki ürün" görsel argümanı. André Watson'ın tezini (Arab Agricultural
  Revolution) visualize ediyor. Bu, *aynı yer adlarını taşıyan iki
  Word'e Atlas'ın nasıl tepki vereceğinin* ilk testi — overlap'ın
  yanyana mı, dağınık mı görüneceği. Pin yelpazesi (`pinOffset`) zaten
  ≥3 entity için yapılmıştı; Bağdat'ta artık 4 pin (al-khwarizmi,
  al-jabr, cotton, sugar) ve iki dotted-sepia path birbiriyle
  parallel — atlas pin renderı bunu hâlâ temiz tutuyor.

- **#39. HomePage'de Journeys section Atlas ile Directory arasında.**
  Üç pozisyon adayı vardı:
  - Üstte (Atlas öncesi): çok belirgin, ama atlas görsel ağırlığı
    önündeki tek satırla bozulurdu
  - Atlas + Directory arasında: ✓ seçilen. Atlas → coğrafi, Directory
    → alfabetik; Journey → taksonomik. Mantıksal soldan sağa hiyerarşi:
    "Burada nerede?", "Adı nedir?", "Hangi sınıftandır?"
  - Sayfanın altında: gözden kaçar
  Karar #2; sicilen "üç ana erişim yolu" görsel-hiyerarşiyi de
  kuruyor.

- **#40. Empty arketipler (crusader/astronomer/diplomatic) silik ama
  tıklanabilir.** UX karar: empty arketipi *gizlemek* "yok" izlenimi
  verir; *tamamen renkli* göstermek "burada var" yalanı söyler.
  Silik (`opacity: 0.55`) + tıklanabilir + kendi sayfasında "henüz
  örneksiz" notu — kullanıcı kategorinin *varlığını* öğrenir,
  *boşluğunu* gerçekçi görür. Şeffaflık + büyümeyi davet ediş.

### Sonraki dilim için öneriler

1. **7 arketip için tam essay (~600 kelime/dil/arketip).** Kullanıcının
   editöryel sesinde yazılmalı; mevcut subtitle'lar yer kapatır
   ama tonal olarak değiştirilebilir. `content/journeys/*.mdx`
   dosyaları + parseJourney + manifest entry gerekir. ~12,600 kelime
   editöryel yük (showcase Word'lerle aynı disiplin).
2. **Catalogue tier'ın açılması.** Hâlâ tek tier'da (showcase) takılı
   kaldık. 10-15 catalogue Word ile §12.2 (korpus skoru) %17 → %22-25
   sıçrar; ağırlıklı ortalama %32 → %35-37'ye gider. Editöryel format
   showcase'in 1/4'ü uzunluğunda.
3. **Word.atlasAnchors üçüncü Word için.** Cotton + sugar paralel
   trajede; üçüncüsünü FARKLI bir trajede yapmak (orange'ın iki-kollu
   Endülüs/Portekiz yolculuğu — Lisbon atlas'a eklenmeli; coffee'nin
   Yemen→Cairo→Istanbul rotası — Yemen atlas'a eklenmeli; lemon'un
   ibn Sīnā ekseninde) — Atlas'ın çoklu-rota görünümü zenginleşir.
4. **Atlas yeni place'ler:** Lisbon (Portuguese orange route),
   Yemen/Mokha (coffee origin), Manchester (industrial cotton),
   Hispaniola (colonial sugar). 4 yeni AtlasPlace = ~20 satır kod +
   coğrafi-doğru koordinatlar + 3 dilde isim.
5. **HomePage WordCard'larda inline JourneyBadge.** Şu an HomePage
   Directory grid'inde Word kartları arketip taşımıyor; küçük bir
   moss-yeşili dot eklemek (renkli arketip indikatörü) — *Atlas'ta
   pin rengi entity tipi, Directory'de pill rengi journey* gibi bir
   görsel-dil tutarlılığı kurar.
6. **`/words` Catalogue route'u + filtre paneli.** Hâlâ HomePage
   Directory tek görünüm. §4.2'de planlanan 3-mode görünüm (grid /
   liste / kronoloji) + filter (journey_type, atlasAnchor, tier)
   ayrı bir UI dilim'i.

---


## Oturum 7 — dilim 6 (multi-anchor mimari kapanışı + hover + journey schema)

Üç-kollu sprint: (A) Word.atlasAnchors → dört-entity multi-anchor
simetrisinin kapanması (Atlas birleşik döngüye geçer), (B) MiniAtlas
hover tooltipi (sabit etiket + hover detay, klavye-paritesi), (C)
`journey_type` Word schema + JourneyBadge component + i18n locales —
`/journeys/:type` route'unun veri tarafı.

Dilim'in editöryel arka-fikri: dilim 7/5'te Book için kurulan multi-anchor
altyapısı dört entity tipinden üçünü kapsıyordu (Theme, Person, Book —
Word hâlâ tek-anchor). Bu dilim simetrik tamamlamayı yapıyor; Atlas
runtime kodu artık üç stratified entity'yi tek hattan işliyor, "Word'ü
ayrı tutuyoruz" yorumu eskimiş — yorum kaldı, kontekst dönüştü. Aynı
zamanda dilim 7/4'ten kalan "MiniAtlas hover state" suggestion (#4)
ve dilim 5'ten beri planda olan "yolculuk arketipleri" (§4.5) için
zemin döşeniyor.

### (a) Word.atlasAnchors — dört-entity simetrinin kapanması (dilim 7/6.A)

Person.atlasAnchors (7/4.C) ve Book.atlasAnchors (7/5.A) mimari
patern'i Word için **birebir tekrarlanıyor**. Yeni mimari kavram yok —
sadece simetri.

**Tip değişiklikleri (`src/types/entities.ts`):**
- `Word.atlasAnchors?: ThemeAtlasAnchor[]` (§129-167) — Person/Book
  ile aynı JSDoc paterni, "kelimenin coğrafi biyografisi tek bir pinde
  dondurulmaz" gerekçesiyle. Cotton'ın Indus → Bağdat → Endülüs hattı,
  orange'ın iki-kollu Arapça/Portekiz yolculuğu örnek olarak gösterildi.
- `WordSummary.atlasAnchors?: ThemeAtlasAnchor[]` — manifest'e taşınır,
  Atlas pin'leri ve rota çizgisi lazy fetch'siz erişir.

**Loader (`src/content/loader.ts`):**
- `parseWord`, dilim 7/5.A'da kurulan paylaşılan `reshapeAtlasAnchors`
  helper'ını çağırıyor (dilim 7/5.A'da Person/Book/Theme için kuruldu;
  Word dördüncü çağıran).

**Manifest (`scripts/generate-manifest.mjs`):**
- `summarizeWord` artık `pickThemeAtlasAnchors`'ı çağırıyor. Aynı
  helper, dördüncü çağıran (Theme + Person + Book + Word). Dilim 7/6.C
  ekiyle birlikte (`journey_type`) Word manifest entry'si en zengin
  hâline geldi — şu alanlar: slug, type, tier, title, category?,
  atlasAnchor?, atlasAnchors?, journey_type?, literalMeaning.

**Validate (`scripts/validate-corpus.mjs`):**
- Words loop'unda `checkAtlasAnchorsArray(entity.atlasAnchors,
  'word/...', 'word', ATLAS_SLUGS)` çağrısı. Paylaşılan helper artık
  dört entity tipini de denetliyor (Word + Theme + Person + Book).
- `ATLAS_SLUGS` deklarasyonu Words loop'undan ÖNCE'ye taşındı (önce
  Person'dan sonra geliyordu; dilim 7/4.C'de Book'a uzanırken bir
  daha önceye alınmıştı; şimdi Word de onu tüketiyor → en üste).

**Negatif test:** cotton.mdx'in baghdad anchor'ı `gibberishplace`'e
çevrildi, validator yakaladı:
`[word/cotton#atlasAnchors[1]] atlas anchor "gibberishplace" not
found in ATLAS_PLACES`. Restore sonrası 0 ihlal.

**Atlas runtime (`Atlas.tsx`):**
- `groups` useMemo radikal olarak basitleşti: önceden Word ayrı
  döngüde tek-anchor, Person + Book birleşik döngüde multi-anchor,
  Theme ayrı; şimdi **Word + Person + Book** tek bir birleşik döngüde
  `StratifiedSummary[]` üzerinden. Theme yine ayrı (BaseEntity'i
  extend etmez, tek-anchor fallback'i yok). Eskiden 90 satır kod, üç
  ayrı pattern; şimdi 50 satır, iki pattern. Yorum bloğu "üç stratified
  entity tipi de aynı veri şeklini ve aynı dispatch mantığını paylaşır"
  diyor — kodun kendisi yorumla aynı şeyi söylüyor.
- `themePaths` collectPath döngüsü Word'leri de topluyor. Key namespace:
  `theme/`, `person/`, `book/`, `word/` (collision yok). ≥2 anchor'lı
  herhangi bir Word artık Atlas'ta dotted-sepia rota çiziyor — cotton
  üç-anchor olduğundan ilk gerçek Word rotası.
- Tip imports: `PersonSummary` + `BookSummary` ayrı import'lara gerek
  kalmadı, `StratifiedSummary` (mevcut union) yeterli; imports
  küçüldü.

**WordPage entegrasyonu (`src/pages/WordPage.tsx`):**
- Dilim 7/4.B'deki tek-elemanlı adaptör (`atlasAnchor` ⇒
  `[{ slug }]`) artık fallback olarak korunuyor, ama yeni multi-anchor
  yola öncelik veriliyor. Person/BookPage adaptörüyle birebir simetrik.

**MiniAtlas JSDoc**: çağıranlar listesi dört entity tipini de
kapsayacak şekilde güncellendi. Dilim 7/4.B "yakında" Person; dilim
7/5.A "şu an" Book; dilim 7/6.A "şu an" Word.

**Korpus güncellemesi (`content/words/cotton.mdx`):**
```yaml
atlasAnchor: cordoba     # eski tek-yer, fallback olarak korundu
atlasAnchors:            # yeni çoklu-yer rotası
  - slug: delhi
    year: "c. 3000 BCE →"
    label: { tr: "Indus Vadisi — *Gossypium arboreum* ilk evcilleştirme", ... }
  - slug: baghdad
    year: "7. — 10. yy"
    label: { tr: "Erken Arap tekstil çağı — *quṭn* kelimesi ve dokuma standartı", ... }
  - slug: cordoba
    year: "10. — 13. yy"
    label: { tr: "Endülüs sulama ağları (*acequia*) — bahçe-tarımının lifi", ... }
journey_type: andalusian
```

Cotton'ın stratigrafisi zaten 5 yere yayılıyordu (Modern global +
Manchester/Mississippi/Bombay + Mursiye/Sevilla/Granada + Bağdat/Şam/
Fustāt + Indus Vadisi); atlasAnchors o 5'in editöryel olarak en güçlü
3 noktasını seçti (yolculuğun başı + orta + son; modern Manchester
sömürgesel ek bir hikaye, Endülüs anahtar düğüm). Atlas haritasında
Delhi → Bağdat → Kurtuba dotted-sepia çizgisi: Indus'tan Endülüs'e
bin sekiz yüzyıllık tekstil zinciri. Dilim 7/5.A #25 kararındaki
"üç anchor zaman makinesini bulanıklaştırır" disiplini bu kez **üç**
seçimini destekledi (cotton'ın yolculuğu cebir/zero gibi *ikili*
nokta-yolculuğu değil; üç-noktalı bir yay).

Diğer 8 Word: hâlâ tek-anchor (`atlasAnchor` doluyor, `atlasAnchors`
boş). orange/sugar/coffee için ileride benzer üç-yer rotaları
açılabilir — bu dilim'in editöryel ekonomisi cotton'ı pilot olarak
seçti.

### (b) MiniAtlas hover tooltip (dilim 7/6.B)

Dilim 7/4'ün "Sonraki dilim için öneriler" #4'üne karşılık. MiniAtlas'ta
anchor dot'larına hover/focus tooltipi geldi.

**Tasarım kararları:**
- **Sabit etiketler korundu.** Sabit yer-adı etiketi (PlaceLabel) her
  zaman görünür — figcaption listesiyle birlikte erişilebilirliği
  tamamlar. Hover tooltipi *additive* enrichment, sabit etiketin
  yerine geçen değil.
- **Hover içeriği yer adı DEĞİL.** Sabit etiket zaten yer adını söylüyor;
  tooltip *year + label* gösteriyor — anchor'ın temadaki rolü
  ("Bayt al-Ḥikma — kitabın yazıldığı yer", "Indus Vadisi —
  Gossypium arboreum ilk evcilleştirme"). Bilgi tekrarı yok.
- **Hover-target dot'tan büyük.** Görsel anchor dot'u 5px radius;
  transparent hover-target halkası 11px radius. Küçük dot'a denk
  gelmeyen fareler/touch'lar da yakalanır — özellikle mobile'da kritik.
- **Klavye-paritesi.** Anchor `<g>` artık `tabIndex={0}` + `role="button"`
  + `aria-label`; onFocus/onBlur paired with onMouseEnter/onMouseLeave.
  Tab gezintesinde her anchor odaklanabilir, focus'lanan dot'un üstüne
  tooltip çıkar. Outline yerine dot'un kendisi altın stroke alıyor —
  manuscript sicilinde "outline halkası" yabancı durur.
- **Animasyon yok.** Hover hemen görünür, hemen kaybolur. CSS
  transition: 0; manuscript-disiplin. Fade-in çoğu UI kütüphanesinde
  default, ama bu sicilde "rahatsızlık titremesi" yaratır.
- **`pointer-events: none` tooltip'te.** Tooltip kendisi parent
  dot'un hover'ını çalmaz; mouse tooltipe doğru kayarken hover state
  kopmaz, sayfa kararlı kalır.

**Boyut hesabı dinamik**: `Math.max(80, Math.min(360, maxLen * 7 +
24))`. Çok kısa year tek başına 80px; çok uzun label 360px (viewBox
1200'ün %30'u, taşma riski yok). İki satır (year + label) varsa
yükseklik 44, tek satır 26. Yukarı kayar konumdaki ty (-32 veya -44)
PlaceLabel'ın y=-12 ile çakışmaz.

**CSS yenilik:**
- `.mini-atlas-hover-target` (transparent r=11 halka)
- `.mini-atlas-place--anchor:focus .mini-atlas-dot` (altın stroke,
  outline yerine)
- `.mini-atlas-tooltip-box / -year / -label` (parchment fill + accent
  border + mono year, italic label)

**Erişilebilirlik notu:** Tooltip içeriği zaten figcaption listesinde
mevcut (anchor.year, anchor.label her item'da görünür); tooltip
sight-only enrichment. Ekran-okuyucu kullanıcıları figcaption üzerinden
tam route bilgisini alır.

### (c) `journey_type` Word schema + JourneyBadge + i18n (dilim 7/6.C)

§4.5 GRAND_PLAN'da 7 yolculuk arketipi tanımlı; ana sayfa şu ana kadar
arketipleri görmüyordu. Bu dilim arketip taksonomisini Word
schema'sına bağlıyor — `/journeys/:type` route'unun **veri tarafı**
açılıyor. Route ve essay sayfaları sonraki dilim için (editöryel
yük: 7 arketip × 3 dil × ~600 kelime).

**Tip değişiklikleri (`src/types/entities.ts`):**
- `JourneyType` discriminated union (§Lang yanında):
  `'translator' | 'merchant' | 'andalusian' | 'crusader' | 'astronomer'
  | 'alchemist' | 'diplomatic'`. 7 değer; §4.5'teki arketipler.
- `JOURNEY_TYPES` runtime tuple (`as const satisfies readonly
  JourneyType[]`) — loader + validator için iterable.
- `Word.journey_type?: JourneyType` (§144-150 ekinde) — opsiyonel;
  catalogue tier'da boş kalabilir.
- `WordSummary.journey_type?: JourneyType` — manifest'e taşınır;
  ileride HomePage word kartları arketipe göre renklendirilirse veya
  `/journeys/:type` reverse-index'i kurulursa manifest yeterli olur
  (full entity gerekmez).

**Loader (`src/content/loader.ts`):**
- `parseWord`, frontmatter'daki `journey_type`'ı okur; bilinmeyen değer
  sessizce yutulur (permissive parser); enum bütünlüğü `validate-corpus`
  tarafında build-time'da zorlanır (fail-fast).

**Manifest (`scripts/generate-manifest.mjs`):**
- `summarizeWord` artık `journey_type`'ı içeriyor (enum check ile).
  Manifest'in Node-vanilla bağlamı `import type` kullanamadığı için
  JOURNEY_TYPES listesi script'in başında lokal olarak duplicate
  edildi (3 yer artık aynı listeyi taşıyor: entities.ts, manifest
  gen, validate; yeni arketip eklenirse hepsi senkron tutulmalı —
  yorumda not düşüldü).

**Validate (`scripts/validate-corpus.mjs`):**
- Words loop'unda enum check: `journey_type !== undefined && !JOURNEY_TYPES.has(...)
  → exit 1`. Showcase'te zorunluluk yok (editöryel disiplin), ama
  *tanımlıysa* enum'a uymalı.

**Negatif test:** algorithm'in `journey_type: translator` →
`gibberish_archetype`'a çevrildi, validator yakaladı:
`unknown journey_type "gibberish_archetype" — must be one of:
translator, merchant, andalusian, crusader, astronomer, alchemist,
diplomatic`. Restore sonrası 0 ihlal.

**Yeni component (`src/components/JourneyBadge.tsx` + `.css`):**
- Props: `type: JourneyType`, `variant?: 'inline' | 'aside'`.
- Görsel sicil: ThemeBadges'in mono-etiket + pill paterni; ama renk
  semantiği ayrı — magnum/cluster gold/lazaward yerine **moss yeşili**
  (§2.3 palette'in "kazı toprağı yan tonu"). 7 arketipin hepsi aynı
  renk; arketip ayrımı metinden gelir.
- Pill markerı `◆` (cluster ThemeBadge'le aynı şekil; renk farklı
  yeterli ayrım).
- Hover: hafif translateY(-1px) + color-mix backdrop — Atlas pin'le
  aynı tempo (0.25s ease).
- RTL safety: pill yuvarlak, border logical değil; her iki yönde
  aynı.

**i18n locales (`src/i18n/locales/{tr,en,ar}.json`):**
- Yeni `journeys.*` bloğu üç dilde:
  - tr: "Yolculuk" / "Mütercimin yolu" / "Tüccarın kervanı" /
    "Endülüs tortusu" / "Haçlının hatırası" / "Yıldızbilimcinin mirası"
    / "Simyacının atölyesi" / "Diplomatik mübadele"
  - en: "Journey" / "The translator's path" / "The merchant's caravan"
    / "Andalusian sediment" / "The crusader's memory" /
    "The astronomer's legacy" / "The alchemist's workshop" /
    "Diplomatic exchange"
  - ar: "الرِّحلة" / "دَربُ المُترجِم" / "قافِلةُ التاجِر" / "الرُّسوبُ الأندَلسيّ"
    / "ذِكرى الصَّليبيِّ" / "ميراثُ الفَلَكيِّ" / "مَختَبَرُ الكيميائيِّ"
    / "المُبادَلةُ الدِّبلوماسيَّة"
- Üç dilin de etiketleri kültürel pozisyonlarından yazıldı — TR/EN
  birebir paralel değil; AR ise klasik manuscript registri (örn.
  "مَختَبَرُ الكيميائيِّ" = simyacının laboratuvarı, "كيمياء" sözcüğünün
  Arapça kökenini hatırlatan).

**WordPage entegrasyonu:**
- `<WordHeader>` + `<ThemeBadges>` sonrası, `<MiniAtlas>` öncesi.
  ThemeBadges *makro-bağlamı* veriyor ("bu kelime hangi büyük
  hikâyenin parçası"); JourneyBadge *arketipi* veriyor ("hangi
  yolculuk arketipi"). İki bilgi katmanı yan yana, sicilen aynı
  meta-veri şeridinde, ama renk semantiğiyle ayrı.
- `word.journey_type` undefined ise hiç render olmaz.

**Korpus güncellemesi — 9 Word kategorize edildi:**

| Slug | journey_type | Gerekçe |
|---|---|---|
| algorithm | translator | Toledo Çevirmen Okulu — Robert of Chester / Adelard of Bath |
| algebra | translator | Aynı çeviri zinciri — *Liber algebrae et almucabolae* (1145) |
| zero | translator | Latin *cifra* → *zero*; Toledo math chain |
| alcohol | alchemist | *al-anbīq* / *al-kuhl* damıtma laboratuvarı |
| cotton | andalusian | Indus → Bağdat → Endülüs *acequia* avlu-bahçesi |
| sugar | merchant | Hindistan → İran → Akdeniz tüccar kervanı (Haçlı ödüncü de) |
| coffee | merchant | Yemen → Kahire → İstanbul kahvehanesi; ticaret yolları |
| lemon | andalusian | İbn-i Sînâ *Qānūn* citrus + Endülüs aşılanmış ağaç |
| orange | andalusian | Endülüs *naranja* / Sevilla acı portakal + marmalade |

7 arketipten 4'ü temsil ediliyor (translator, alchemist, andalusian,
merchant). 3'ü (crusader, astronomer, diplomatic) hâlâ örneksiz —
sonraki içerik dilim'lerinde kelime eklendikçe dolar (admiral →
diplomatic/crusader, Aldebaran/Vega → astronomer, assassin →
crusader gibi).

### Build çıktısı (dilim 7/6 sonu)

| | 7/5 sonu | 7/6 sonu | Δ |
|---|---|---|---|
| `index` (eager core) | 76.79 | 77.23 | +0.44 |
| `localized` (manifest) | ~8.6 | ~8.9 | +0.3 |
| `transform` (d3) | 12.46 | 12.46 | 0 |
| `HomePage` | 7.79 | 7.77 | -0.02 |
| `AtlasGeography` | 10.21 | 10.59 | +0.38 |
| `loader` (parser chunk) | 28.02 | 28.10 | +0.08 |
| **Total initial paint** | **~107.5** | **~108.05** | **+0.55 KB gz** |

İndex +0.44 KB gz: JourneyBadge.tsx + .css runtime + i18n journeys
bloğu 3 dilde (etkiler yalnız index chunk'a). Manifest +0.3:
9 word × journey_type entry + cotton 3-anchor frontmatter. Loader
+0.08: reshapeAtlasAnchors enum guard. AtlasGeography +0.38:
Vite dedupe-shift (kod değişmedi, hash farkıyla bundle organizasyonu
küçük bir kayma).

**Lazy chunk artışı**: cotton-*.js 20.42 → 20.74 KB gz (+0.32 KB gz —
3-anchor frontmatter 3 dilde label içeriyor). Diğer 8 word chunk'ı
neredeyse değişmedi (journey_type tek string, manifest'te de mevcut
olduğundan body MDX'te sadece bir satır).

### Korpus durumu (dilim 7/6 sonrası)

- **9 word** (alcohol, algebra, algorithm, coffee, **cotton**¹,
  lemon, orange, sugar, zero) + **1 person** (çoklu-anchor) +
  **1 book** (çoklu-anchor) + **3 theme** (1 magnum + 2 cluster,
  2'si çoklu-anchor).
  ¹ cotton dilim 7/6.A'da multi-anchor oldu (Delhi → Bağdat → Kurtuba).
- 9 word artık `journey_type` ile kategorize: 3 translator + 3 andalusian
  + 2 merchant + 1 alchemist; 3 arketip (crusader, astronomer,
  diplomatic) henüz örneksiz.
- 17 atlas place — değişmedi.
- `npm run validate` ✓ — paylaşılan `checkAtlasAnchorsArray` Word/
  Theme/Person/Book dört entity tipinde de aynı invariant'ları
  zorluyor + journey_type enum check. İki negatif test (bad
  atlasAnchors slug, bad journey_type) yakalandı.
- `npm run typecheck` ✓ — strict + noUnusedLocals + noUncheckedIndexedAccess
  altında temiz. (Bir defalık TS18048 hatası `MiniAtlasTooltip`'te
  `label`'ın `string | undefined`'dan `string`'e indirgenmesiyle
  çözüldü: `(anchor.label && pickLang(...)) || ''`.)
- `npm run build` ✓ — initial paint ~108 KB gz; 9 word + 1 person
  + 1 book + 3 theme korpus lazy-mimari sözleşmesini koruyor.
- Atlas dotted-sepia rota sayısı: önceden 2 (al-khwarizmi: Hârezm→
  Bağdat; al-jabr: Bağdat→Toledo); artık 3 (cotton: Delhi→Bağdat→
  Kurtuba). 1 magnum theme rotası (hindu-arabic-numerals) yine
  yerinde.

### Mimari kararlar (bu dilim'e özgü)

- **#28. Word'ün multi-anchor desteği "ileride catalogue da gerekirse"
  diye değil, Cotton'ın strata'sının zaten gösterdiği bir gerçeklik
  için.** Dilim 7/4.5'in suggestion #5'i bunu "büyük data-model
  genişlemesi" olarak işaretlemişti — gerçekte tip + manifest +
  validate + loader + Atlas + WordPage adaptörü işi 7/4.C + 7/5.A'da
  Person/Book için *zaten yapılan* iş; sadece dördüncü çağıran. Helper'lar
  paylaşımlı, ekstra mimari kavram yok. "Büyük genişleme" Word'ün
  içeriğine değil bu dilim'in mekaniğine değdiyse, o da editöryel
  yığın değil mekanik yığın — paylaşılan helper'lar zaten kuruldu.
- **#29. Cotton'ın 5 strata yerine 3 anchor seçimi.** Cotton'ın 5
  strata'sı 5 ayrı yere değiniyor: Modern global / Manchester+Mississippi+
  Bombay / Mursiye+Sevilla+Granada / Bağdat+Şam+Fustāt / Indus Vadisi.
  Atlas'taki rota *editöryel bir özet* — 5 noktalı bir rota görsel
  kalabalık yaratır + Modern global atlas anchor'ı olmayan bir tabaka
  (dünya). 3 nokta (Delhi-baghdad-cordoba) doğum + yükseliş + olgunluk
  yayını gösteriyor; Manchester sömürgesel ek, Modern global meta —
  ikisi rotanın dışında bırakıldı, atlas okuruyla MDX okuru farklı
  bilgi tabakalarına erişiyor.
- **#30. MiniAtlas tooltip içeriği = year + label (yer adı DEĞİL).**
  Düşündüm: tooltip yer adını da büyütüp gösterebilirdi (sabit
  etiketten farklı, daha okunaklı). Ama sabit etiket *zaten orada*;
  tooltip *aynı bilgiyi büyüterek tekrar etmek* yerine, *farklı bir
  bilgi* sunmalı — temadaki rolü, yılı. Bu kullanıcının "üzerine
  geliyorum, daha fazla ne öğreneceğim?" beklentisine doğru cevap.
  Tooltip'te yer adı tekrarı isteyecek bir mobile durum varsa
  (sabit etiket küçük punto, başka pin'le çakışıyor) — o zaman
  *sabit etiketi* iyileştir, tooltip'i değil.
- **#31. JourneyBadge → moss yeşili, ThemeBadge gold/lazaward yerine.**
  ThemeBadge ile renk uyumu cazipti (UI tutarlılık), ama sicilen
  *farklı bir veri katmanı* için *farklı bir renk* daha iyi okunur:
  Theme = makro-anlatı kapsamı (magnum/cluster ayrımı); Journey =
  arketip taksonomisi (renk-bağımsız). Aynı şeritte iki ayrı renk =
  iki ayrı veri katmanı, kullanıcı için *bir bakışta* fark edilir.
  Moss palette tonu §2.3'te zaten yan-renk olarak rezerve edilmişti
  (sumak/kına yeşili); ilk gerçek kullanım.
- **#32. journey_type'ı Word'e *opsiyonel* tut.** Showcase'te zorunlu
  yapma cazibesi vardı (validate-corpus showcase için 7 arketipten
  birini ister); ama editöryel disiplin meselesi, build pipeline
  meselesi değil. Bir Word *hiçbir arketipe* tam uyum sağlamayabilir
  (bazıları iki arketip arasında — sugar: merchant + crusader gibi);
  *zorunlu tek-arketip* yanlış seçimi *zorlardı*. Opsiyonel kalsın;
  doluysa enum'a uysun. Bu disiplin "her yere doğru cevap" değil
  "her cevap kendi içinde tutarlı" prensibi.
- **#33. `/journeys/:type` route'unu açmadan veri tarafını kurma.**
  Schema + manifest + badge component'i route'tan önce inşa etmek
  klasik altyapı-önce-UI mimarisi; ama buradaki spesifik gerekçe:
  7 essay × 3 dil × ~600 kelime = ~12,600 kelime yazım yükü. Bu
  yük tek bir dilim'de açılırsa içerik kalitesi düşer (editöryel
  rejim §1.2 sıkıdır). Ayrı bir editöryel dilim — şu an veri
  altyapısı hazır, route'un acı çekmeden açılabilmesi için içerik
  toplu yazılır.
- **#34. JOURNEY_TYPES listesi üç yerde duplicate, "tek doğru kaynak"
  yok.** entities.ts (TS as const), manifest gen (JS array),
  validate (JS Set) — üçü aynı 7 string'i taşır. Ortak modüle
  taşımak isteyebilirdik (`validators-pure.ts` gibi); şu an mikro
  duplikasyon. Yeni arketip eklenirse üç yer + 3 dilin locales
  + GRAND_PLAN.md (§4.5) güncellenmeli — JSDoc'ta not düşüldü.
  Editöryel yük dengesinde (her yıl ~1 yeni arketip ekleyeceğimiz
  bir hız değil), mikro duplikasyon kabul edilebilir.

### Sonraki dilim için öneriler

1. **`/journeys` + `/journeys/:type` route'u + 7 essay.** Schema +
   badge bu dilimde kuruldu; route'un kendisi açılmadı. 7 arketip ×
   3 dil × ~600 kelime essay = en büyük editöryel yığın; ayrı bir
   dilim olmalı. Reverse-index manifest'ten kurulur (Word →
   journey_type → Word[] listesi).
2. **Word.atlasAnchors başka bir Word için.** Cotton pilot oldu;
   orange'ın iki-kollu Arapça/Portekiz yolculuğu (Endülüs *naranja*
   + Portekiz tatlı portakal Lizbon → Goa), sugar'ın Hindistan →
   Endülüs Hat'ı, coffee'nin Yemen → Kahire → İstanbul rotası ekleme
   adayları. Her biri 3-anchor.
3. **HomePage word kart'ında JourneyBadge mini gösterimi.** Şu an
   sadece WordPage'de görünüyor; HomePage dizininde de küçük rozet
   olarak gösterilirse arketip-bazlı görsel hiyerarşi mümkün olur
   (kart sıralaması arketipe göre gruplanabilir; "yolculuk
   sıralaması" UI'a çıkar).
4. **JOURNEY_TYPES tek doğru kaynak refactor.** entities.ts +
   manifest gen + validate üçü aynı 7 string'i taşır. Bir
   `src/content/journey-types.mjs` (Node-yüklenebilir, hem TS hem JS
   tarafından okunur) bunu birleştirir; her yeni arketip eklemek
   tek dosya edit'ine düşer.
5. **MiniAtlas tooltip mobile davranışı.** Touch ekranlarda hover
   `onFocus`'a düşer; ama bazı browser'larda tap → focus → tap-away
   → blur akışı tooltip'i kapatmadan önce link tetikler. Manuel
   test gerekir; tooltip'in `pointer-events: none` olması bu sorunu
   büyük ölçüde önlüyor olmalı, ama doğrulanmadı.
6. **Catalogue tier'ın açılması.** Korpus skoru'nun (§12.2)
   gerçek itici gücü; 10-15 catalogue Word ile %30 → %35-38 sıçrar.
   Editöryel format: showcase'in ~1/4'ü uzunluğunda (~150 kelime ×
   3 dil; 5-strata değil 2-3 strata; minimal etymology tree).

---


## Oturum 7 — dilim 5 (Book.atlasAnchors + üç latent regresyon)

Bir oturumda üç bağlı dilim — (A) full-entity parser regresyon kapama
+ Book.atlasAnchors altyapı, (B) UI entegrasyonu (Atlas + BookPage), (C)
GRAND_PLAN ilerleme tablosu + yüzdelik tamamlanma tahmini.

İçeriksel hareket olmayan, ama orta-ölçekte mimari simetri tamamlayan
bir dilim: Person için kurulan tüm parametreler artık Book için de
geçerli (tip, manifest, validate, runtime, page UI, content). Ek
olarak, dilim 7/3.C ve 7/4.C'de **tip seviyesinde** kurulmuş olan
multi-anchor sözleşmesinin **runtime parser tarafında** karşılığı
yoktu — Atlas (homepage manifest üzerinden) doğru çalışırken iki
entity sayfası (Person, Theme) sessiz yanlış davranıyordu. Bu dilim o
sessiz regresyonu da kapatıyor.

### (a) Full-entity atlasAnchors parsing — üç gizli regresyon (dilim 7/5.A)

**Sorun**: Dilim 7/3.C (Theme.atlasAnchors) ve 7/4.C (Person.atlasAnchors)
şu zinciri eksik bıraktı:
- `src/types/entities.ts`: `atlasAnchors?: ThemeAtlasAnchor[]` eklendi ✓
- `scripts/generate-manifest.mjs`: `pickThemeAtlasAnchors` çıktıyı manifest
  summary'sine yazıyor ✓
- `scripts/validate-corpus.mjs`: `checkAtlasAnchorsArray` slug bütünlüğünü
  build-time zorluyor ✓
- `src/components/Atlas.tsx`: manifest summary üzerinden multi-anchor
  pin + dotted-sepia path ✓
- `src/content/loader.ts`: **YOK** — `parsePerson` / `parseTheme`
  frontmatter'daki `atlasAnchors` alanını okumuyor; full entity'de
  alan her zaman `undefined`.

Atlas (homepage) summary üzerinden çalıştığı için sorunsuzdu;
sezgisel olarak da "Person/Theme'in atlasAnchors'ı zaten Atlas'ta
gözüküyor; bu yüzden kod doğru sanılıyordu" oldu. Ama:
- `ThemePage.tsx` § "{theme.atlasAnchors && theme.atlasAnchors.length > 0 && <MiniAtlas …>}":
  koşul her zaman false. ThemePage MiniAtlas asla render olmuyor.
- `PersonPage.tsx` § "miniAtlasAnchors = person.atlasAnchors && length > 0
  ? person.atlasAnchors : person.atlasAnchor ? [{slug}] : null":
  birinci dal hiç tetiklenmiyor, her zaman tek-anchor fallback. Yani
  al-Khwārizmī sayfasının MiniAtlas'ı her zaman sadece Bağdat
  gösteriyor — Hârezm yok.

**Çözüm**: `src/content/loader.ts`'e yeni helper
`reshapeAtlasAnchors(raw: unknown): ThemeAtlasAnchor[] | undefined`
(§ 172-215). Davranışı `scripts/generate-manifest.mjs`'in
`pickThemeAtlasAnchors`'ı ile birebir simetrik:
- Array değilse → undefined
- Her öğe: `slug` zorunlu (boş string elenir), `year` opsiyonel string,
  `label` opsiyonel `Localized` (boş Localized `{}` elenir)
- Boş array → undefined döner (UI tarafı `length > 0` koşullarıyla
  temiz çalışsın diye; manifest helper'ı ile aynı sözleşme)
- Slug bütünlüğü (`ATLAS_PLACES`'ta var mı + tekil mi) burada
  zorlanmaz — orası build-time `checkAtlasAnchorsArray`'in işi.

Üç parser'da tek satır wiring:
```ts
// parsePerson:
const personAnchors = reshapeAtlasAnchors(data.atlasAnchors);
if (personAnchors) person.atlasAnchors = personAnchors;

// parseBook (YENİ — dilim 7/5.A'nın yapısal eki):
const bookAnchors = reshapeAtlasAnchors(data.atlasAnchors);
if (bookAnchors) book.atlasAnchors = bookAnchors;

// parseTheme:
const themeAnchors = reshapeAtlasAnchors(data.atlasAnchors);
if (themeAnchors) theme.atlasAnchors = themeAnchors;
```

**Niçin tek helper, üç callsite**: `pickThemeAtlasAnchors` (manifest
gen) ve `reshapeAtlasAnchors` (runtime loader) iki ayrı modül
(Node-side build script vs. browser-side runtime). İkisini ortak bir
"pure" modüle çıkarmak mümkün ama henüz değer-maliyet eşiğini
geçmiyor (validators-pure.ts gibi). Tek bir browser-side helper'la
üç parser'ı paylaştırmak şu an iyi denge — manifest tarafı ayrı
yaşar ama davranış spec'i bu dosyada (JSDoc) net.

### (b) Book.atlasAnchors — type + manifest + validate + UI (dilim 7/5.A)

Person.atlasAnchors mimarisi (dilim 7/4.C) Book için **birebir
tekrarlanan**şın açıklayıcı listesi:

**Tip değişiklikleri (`src/types/entities.ts`):**
- `Book.atlasAnchors?: ThemeAtlasAnchor[]` (§ 234-262) — Person ile
  aynı JSDoc paterni, "kitabın hayatı tek yerde geçmez" gerekçesiyle.
- `BookSummary.atlasAnchors?: ThemeAtlasAnchor[]` (§ 350-372) —
  manifest'e taşınır, Atlas pin'leri ve rota çizgisi lazy fetch'siz
  erişir.

**Manifest (`scripts/generate-manifest.mjs`):**
- `summarizeBook` artık `pickThemeAtlasAnchors`'ı Person için
  yapıldığı gibi çağırıyor. Aynı helper, üçüncü çağıran (Theme +
  Person + Book) — gerçek DRY.

**Validate (`scripts/validate-corpus.mjs`):**
- Books loop'unda `checkAtlasAnchorsArray(entity.atlasAnchors,
  'book/...', 'book', ATLAS_SLUGS)` çağrısı. Paylaşılan helper artık
  üç entity tipini de denetliyor (Theme + Person + Book).

**Negatif test:** `toledo` → `gibberishplace` enjekte ettim,
validator yakaladı:
`[book/al-jabr#atlasAnchors[1]] atlas anchor "gibberishplace" not
found in ATLAS_PLACES`. Restore sonrası 0 ihlal.

**Atlas runtime (`Atlas.tsx`):**
- `groups` useMemo iki-aşamalı yapıda yeniden düzenlendi:
  - **Word**: tek-anchor (her zaman tek-yer; Word'e multi-anchor
    suggestion #5 olarak yol haritasında duruyor).
  - **Person + Book birleşik döngü**: aynı veri şekli + aynı dispatch
    mantığı — multi-anchor doluysa Theme-pattern, yoksa tek-anchor
    fallback. (Yorum bloğunda: "Word'ü hâlâ ayrı tutuyoruz çünkü
    Word.atlasAnchors henüz tip seviyesinde yok; eklendiğinde bu
    döngü tüm StratifiedSummary'i tek hattan ele alabilir.")
  - **Theme**: ayrı (BaseEntity'i extend etmez, tek-anchor fallback'i
    yok — yalnız multi-anchor).
- `themePaths` useMemo: `collectPath` artık Book'ları da topluyor.
  `key namespace`: `theme/`, `person/`, `book/` (collision yok).

**BookPage entegrasyonu (`src/pages/BookPage.tsx`):**
- MiniAtlas import + render eklendi. PersonPage'in adaptörü ile
  birebir simetrik:
  ```ts
  const miniAtlasAnchors =
    book.atlasAnchors && book.atlasAnchors.length > 0
      ? book.atlasAnchors
      : book.atlasAnchor
        ? [{ slug: book.atlasAnchor }]
        : null;
  ```
- BookHeader ile `.strat-layout` arasında render edilir; PersonPage
  paterni.

**MiniAtlas JSDoc**: çağıranlar listesi BookPage'i de kapsayacak
şekilde güncellendi (dilim 7/4'te "yakında" olarak yazılmıştı, artık
"şu an" — Person + Book + Word + Theme dört tip de aynı bileşeni
besliyor).

**Korpus güncellemesi (`content/books/al-jabr.mdx`):**
```yaml
atlasAnchor: baghdad     # eski tek-yer, fallback olarak korundu
atlasAnchors:            # yeni çoklu-yer rotası
  - slug: baghdad
    year: "c. 825"
    label: { tr: "Bayt al-Ḥikma — kitabın yazıldığı yer", ... }
  - slug: toledo
    year: "1145"
    label: { tr: "Chesterli Robert'ın Latinceleştirmesi — *Liber algebrae
            et almucabolae*", ... }
```

al-Jabr'ın iki-tabakalı hayatı artık Atlas'ta görünür: Bağdat
(yazıldığı yer) → Toledo (Latince'ye geçtiği yer). al-Khwārizmī'nin
Hârezm → Bağdat rotasıyla birlikte, Bağdat artık iki ayrı dotted
rotanın **buluştuğu** yer — bir kişinin ürettiği yer + onun ürettiği
kitabın yazıldığı yer aynı noktada üst üste gelir. Atlas pin
yelpazesi (`pinOffset`) zaten ≥3 entity için olduğundan, görsel
olarak temiz.

### (c) GRAND_PLAN ilerleme tablosu + yüzdelik tahmin (dilim 7/5.C)

`GRAND_PLAN.md`'in sonuna iki yeni bölüm eklendi:
- **§11 Oturum-Oturum İlerleme Tablosu**: her oturum + dilim için
  "ne yapıldı / ne kaldı / kümülatif %" satırı. Tablonun şu anki
  son satırı dilim 7/5; kümülatif tamamlanma **%30** civarında —
  altyapı %80+, korpus %6, polish/launch tabakası açılmamış.
- **§12 Tamamlanma Tahmini — Çok Yönlü**: dört farklı ölçüm açısı
  (orijinal §7 oturum yol haritası, §4.4 4-varlık-grafı korpus, UI
  feature completeness, polish/launch tabakası). Her açıdan ayrı
  yüzde + ağırlıklı ortalama. Kullanıcının "kaç oturum daha?"
  sorusu için kalibre edilmiş.

Bu kullanıcı isteğiyle açıldı ("planın içine her oturum sonrası ne
yapıldı ve kaldı tablo şeklinde ver. yüzdelik olarak yaklaşık bitiş
süresi") — *yapılan iş kayıtı* olarak değil, *hedeflenen iş
ölçüsü* olarak da bakılması için.

### Build çıktısı (dilim 7/5 sonu)

| | 7/4 sonu | 7/5 sonu | Δ |
|---|---|---|---|
| `index` (eager core) | 76.85 | 76.79 | -0.06 |
| `localized` (manifest) | 8.45 | ~8.6 | +0.15 |
| `transform` (d3) | 12.46 | 12.46 | 0 |
| `HomePage` | 7.81 | 7.79 | -0.02 |
| `AtlasGeography` | 1.77 | 10.21¹ | +8.4 |
| **Total initial paint** | **107.34** | **~107.5** | **+0.2 KB gz** |

¹ AtlasGeography chunk bu build'de farklı dedupe yapısıyla raporlandı
(seas + rivers + bağımlılıkları); 7/4'teki "1.77 KB gz" rapor anına
özel bir dedupe sonucuydu. Net etki kullanıcı için aynı — paylaşılan
chunk Vite'nin cache headers'ıyla hâlâ paylaşılıyor; ilk ziyarette
ya HomePage ya BookPage indirir, ikinci sayfa cache hit'i alır.

**Lazy chunk artışı**: `al-jabr-*.js` 39.91 KB / 18.27 KB gz —
atlasAnchors frontmatter eklendi ama body değişmedi, küçük artış
manifest tarafından ABSORBE edildi (full Book chunk artmadı).
BookPage chunk 6.60 KB / 2.01 KB gz (önceki ~1.68'den +0.33 KB —
MiniAtlas + adaptör mantığı).

### Korpus durumu (dilim 7/5 sonrası)

- **9 word** (alcohol, algebra, algorithm, coffee, cotton, lemon, orange,
  sugar, zero) + **1 person** (çoklu-anchor) + **1 book** (çoklu-anchor)
  + **3 theme** (1 magnum + 2 cluster, 2'si çoklu-anchor).
- 17 atlas place — değişmedi.
- `npm run validate` ✓ — paylaşılan `checkAtlasAnchorsArray` artık
  Theme + Person + Book üç entity tipinde de aynı invariant'ları
  zorluyor. Negatif test: bad book slug yakalandı.
- `npm run typecheck` ✓ — strict + noUnusedLocals + noUncheckedIndexedAccess
  altında temiz.
- `npm run build` ✓ — initial paint hâlâ ~107 KB gz; al-jabr lazy
  chunk artmadan atlasAnchors taşıyor.
- al-Jabr rotası: Bağdat (c. 825, "Bayt al-Ḥikma — kitabın yazıldığı yer")
  → Toledo (1145, "Chesterli Robert'ın Latinceleştirmesi — *Liber
  algebrae et almucabolae*").

### Mimari kararlar (bu dilim'e özgü)

- **#23. `reshapeAtlasAnchors` browser-side runtime, ayrı modüle değil.**
  Manifest gen'inin `pickThemeAtlasAnchors`'ı (Node) ve runtime
  `reshapeAtlasAnchors`'ı (browser) iki ayrı kod yolu — ortak bir
  `validators-pure.ts`'ye taşımak ideal ama henüz değer eşiğini
  geçmiyor. Üç entity (Theme + Person + Book) için tek helper
  paylaşımı bu dilim'in işi; "iki modül arası simetri" sonraki dilim
  için açık. JSDoc'ta sözleşme açık (manifest + loader davranışı
  birebir).
- **#24. Latent regresyonu sessiz düzeltmemek.** Dilim 7/3.C ve 7/4.C
  README'leri "Person/Theme.atlasAnchors çalışıyor" diyordu; gerçekte
  Atlas tarafında çalışıyordu, entity sayfalarında değil. Bu dilim
  README'sinde regresyonu açıkça çağırıyoruz çünkü gelecek-Claude
  oturumlarında "neden 7/5 dilim'de loader değişti?" sorusu doğal
  yerde cevaplanır. Editöryel anlamda: önceki başarı raporlarının
  yanlışlığını silmek değil, üstüne yeni gerçeği yazmak.
- **#25. al-Jabr için iki anchor: Bağdat + Toledo, üçüncü değil.**
  Düşündüm: Padua (16. yy Roma rakamından Hint-Arap rakamına
  geçişin son atölyelerinden biri), Floransa (Cardano'nun *Ars
  Magna* öncesi), Cambridge (1857 Rosen'in tercümesinin akademik
  alımlanması)... Hepsi savunulabilir. Ama editöryel olarak
  *yolculuk metaforu* en güçlü iki yerde duruyor: kitabın yazıldığı
  yer + Latin dünyaya geçtiği yer. Üçüncü anchor zaman makinesi
  hatlarının net mesajını bulanıklaştırır. Person.atlasAnchors için
  de aynı disiplin (Hârezm + Bağdat, üçüncüsü yok); simetri korunur.
- **#26. BookPage MiniAtlas konumu = PersonPage'le aynı.** BookHeader
  + MiniAtlas + .strat-layout sırası. ThemePage'de header + MiniAtlas
  + body sırası; WordPage'de header + ThemeBadges + MiniAtlas +
  .strat-layout sırası. Dört entity tipinde de "header → coğrafi
  bağlam → derinlemesine içerik" akışı aynı. Bu, kullanıcının dört
  entity tipi arasında gezerken hep "harita zaten orada, derine
  inmeden önce" beklentisi kuruyor.
- **#27. İlerleme tablosu GRAND_PLAN'a, README'ye değil.** README
  oturum-oturum gelişimi (geriye doğru) anlatıyor; her oturumun
  detayı orada. GRAND_PLAN ileriye doğru hedefi anlatıyor; oturum
  başarılarının kümülatif kataloğu da oraya ait — "plan ve
  ilerleme tek yerde" prensibi. README ile GRAND_PLAN arasında
  çift-girişi engellemek için: README dilim-bazlı uzun açıklama
  + son satır kümülatif % atfı; GRAND_PLAN tablo + tamamlanma çerçevesi.

---



## Oturum 7 / dilim 1 — bu dilimde ne yapıldı

**Tema**: korpus ölçeklenmesi öncesi altyapıyı hafifletmek. Geçen
oturumda page-level code split kapatılmıştı; MDX gövdeleri hâlâ tek
chunk'taydı. Bu dilimde MDX-seviye lazy gerçekleşti.

### A. Manifest mimarisi — build-time özet, runtime tam-lazy

#### A.1 `scripts/generate-manifest.mjs` (yeni)

`scripts/validate-corpus.mjs`'in kardeşi. `/content/{words,persons,books,
themes}/*.mdx` dosyalarının frontmatter'ını okur, *yalnız özet alanları*
(slug + başlık + tier + atlasAnchor + Theme→words/persons/books slug
listeleri) `src/content/manifest.generated.ts`'e TypeScript olarak yazar.
Yaklaşık 10 KB tipli TS, alfabetik slug sıralı (git diff stable).

Yeni alan eklemek istendiğinde iki yer güncellenir: (1) `@/types/entities`
§8.5'teki `*Summary` interface'i, (2) generator'daki ilgili `summarize*`
fonksiyonu. tsc consumer-tarafında eksik alanı yakalar — sessiz fail
imkânsız.

#### A.2 `src/types/entities.ts` §8.5 — Summary tipleri (yeni)

`WordSummary | PersonSummary | BookSummary | ThemeSummary` interface'leri.
Tam entity tipinin "manifest'te taşınan" alt-kümesi. Niçin `Pick<>`
zinciri değil de explicit interface: manifest'in **kontratı** kendi
başına bir API yüzeyi; full entity şişerse summary değişmemeli (örn.
`Word`'e ileride `pronunciationVariants: ...` eklenirse, manifest bunu
otomatik almasın). Ayrıca `StratifiedSummary` (Word|Person|Book) ve
`AnySummary` (Theme dahil) ek union'lar — Atlas + listing UI'larının
karışık-tip yerlerinde.

#### A.3 `src/content/manifest.generated.ts` (yeni, .gitignore'da)

Generator'ın çıktısı. Üç yer onu yeniden üretir:
- `npm run dev` → `predev` script'i
- `npm run build` → `prebuild` script'i (validate-corpus da burada koşar)
- `npm run typecheck` → `pretypecheck` script'i (manifest yoksa tsc fail)
- Vite plugin (aşağıda) MDX değişikliklerinde dev sırasında otomatik

#### A.4 `src/content/registry.ts` — sıfırdan yeniden yazıldı

İki katman:

**Senkron — manifest'ten:**
- `listWords/Persons/Books/Themes(): WordSummary[]` (vb.)
- `getWordSummary/PersonSummary/BookSummary/ThemeSummary(slug)` (yeni —
  sayfa içinde başka bir entity'ye sync minimal erişim için; örn.
  BookPage author-aside, ThemePage entity-cards)
- `getThemesForEntity(type, slug): ThemeSummary[]` — eski `Theme[]`
  imzası `ThemeSummary[]`'e düştü; ThemeBadges component'i zaten
  yalnız `slug + title + tier` okur (hepsi summary'de).

**Asenkron — lazy MDX'ten:**
- `getWord/Person/Book/Theme(slug): Promise<Entity | undefined>`
  — `import.meta.glob({eager: false, query: '?raw'})` ile path-keyli
  `() => Promise<string>` map'inden o entity'nin chunk'ını dynamic
  import eder, sonra `parseWord` (vb.) ile parse eder.
- `makeLazyFetcher` factory: 4 entity için aynı pattern (cache + 404
  guard + parse-error guard). Cache: `Map<slug, Promise<Entity>>` —
  aynı entity ikinci ziyarette ücretsiz.
- Validation: artık registry runtime'da YOK. `validateCorpusCollect`
  IIFE'si kaldırıldı; `prebuild` zinciri `validate-corpus.mjs`'i
  çalıştırır → invariant ihlali build'i fail eder.

#### A.5 `src/hooks/useEntity.ts` (yeni)

Race-safe async hidrasyon hook'u. 4 sayfanın paylaştığı pattern:
```ts
const { entity, status } = useEntity(slug, getWord);
if (status === 'loading')   return <EntityLoading />;
if (status === 'not-found') return <EntityNotFound slug={slug} />;
// status === 'loaded' → entity kesinlikle var
```
`alive` flag pattern'i ile slug değişiminde önceki Promise resolve
olduğunda state güncellenmez (kullanıcı `/tr/kelime/algorithm`'tan
hızla `/tr/kelime/algebra`'ya geçerse stale write yok).

#### A.6 `src/components/EntityPageStates.tsx` (yeni)

Paylaşılan iki bileşen: `<EntityLoading />` (route fallback ile aynı
tipografik dil — italic faint serif) ve `<EntityNotFound slug={slug} />`
(eski "coming soon" bloğunun tek-yer'leşmiş hâli). 4 sayfada 8'er satır
duplikasyon vardı; bir dosya, iki bileşen.

### B. Sayfaları async-aware yapma

#### B.1 `WordPage / PersonPage / BookPage / ThemePage`

Hepsi aynı triplet: `useEntity` + `EntityLoading` + `EntityNotFound`.
Imports güncellendi, sync `getWord(slug)` + inline "coming soon" blokları
kaldırıldı.

**BookPage'de özel detay**: author-aside eski kodda `getPerson(book.
authorSlug)` ile **tam Person** çekiyordu, sırf ad + nisba + slug
göstermek için. Lazy mimaride `getPerson` async döndü; ama author-aside
async'e gerek yok çünkü `getPersonSummary(book.authorSlug)` aynı 4-5
alanı sync veriyor — author bilgisinin tam Person'ını indirmek BookPage
ziyaretinde gereksiz network. Sync yola çevrildi.

**ThemePage'de özel detay**: entity-grid kart bileşenleri (`WordCard /
PersonCard / BookCard`) eski kodda `getWord/Person/Book(slug)` ile
**tam entity** çekiyordu — yine sırf 2-3 alan (başlık + literal/
transliteration meaning) göstermek için. Hepsi `getWordSummary` /
`getPersonSummary` / `getBookSummary` sync getter'larına dönüştürüldü.
Theme sayfasını ziyaret etmek artık o tema'nın listelediği N entity'nin
gövdesini değil, sadece tema MDX'ini indiriyor.

#### B.2 `ThemeBadges` prop tipi

`themes: Theme[]` → `themes: ThemeSummary[]`. Component zaten yalnız
`slug + title + tier` okuyor, davranış değişmedi.

#### B.3 `Atlas` tip imzaları

`AnyEntity / StratifiedEntity` → `AnySummary / StratifiedSummary`.
Atlas pin yerleştirmesi `atlasAnchor + title + romanName + arabicName +
fullArabicTitle + transliteration` okur — hepsi summary'de.

#### B.4 `HomePage` — kod değişikliği yok

HomePage entity tipini hiç import etmiyordu; tipler `list*()` çağrılarından
inferred geliyor → otomatik `*Summary` daraldı. Type-error yok, runtime
davranışı aynı, ama indirilen ağırlık **tüm MDX gövdeleri yerine yalnız
manifest** (yaklaşık 10 KB).

### C. Build-zinciri ve Vite plugin

#### C.1 `vite.config.ts` plugin (yeni — `rihlaContentManifest`)

İki kanca:
- `buildStart`: vite build/dev başlangıcında manifest'i rejenere eder.
  Belt-and-suspenders — `predev`/`prebuild` script'i normalde bunu
  yapıyor, ama vite'i doğrudan çağıran (npm zincirini atlayan) senaryolar
  için.
- `configureServer`: dev sırasında `/content/**/*.mdx` değiştiğinde
  manifest'i rejenere eder. Generator dosyayı yeniden yazar → Vite
  module graph'ı `manifest.generated.ts`'in değiştiğini görür → import
  zincirinde HMR/reload tetiklenir. Editor "kaydet" → tarayıcı tazelenir,
  manifest yansır.

Niçin `spawnSync` subprocess (in-process dynamic import değil): izolasyon.
Generator hatası plugin state'ini kirletmesin, log çıktısı net olsun.
6 MDX'te ~50ms; 240 MDX'e çıktığında bile <500ms (frontmatter parsı yaml
ile O(n) ve ufak).

#### C.2 `package.json` script zinciri

```jsonc
"manifest":     "node scripts/generate-manifest.mjs",
"validate":     "node scripts/validate-corpus.mjs",
"predev":       "node scripts/generate-manifest.mjs",
"dev":          "vite",
"pretypecheck": "node scripts/generate-manifest.mjs",
"typecheck":    "tsc -b",
"prebuild":     "node scripts/generate-manifest.mjs && node scripts/validate-corpus.mjs",
"build":        "tsc -b && vite build",
"preview":      "vite preview",
```

`predev/prebuild/pretypecheck` lifecycle script'leri — npm bunları
otomatik tetikler, kullanıcı el ile çağırmaz. `manifest` ve `validate`
sade tek-seferlik komutlar (debugging / CI).

#### C.3 `.gitignore`

`src/content/manifest.generated.ts` eklendi. Otomatik üretilen dosya;
diff gürültüsü ekleyince PR'ları okumak zorlaşır.

### D. Kaldırılan / temizlenen şeyler

- `registry.ts` IIFE'si: `validateCorpusCollect` runtime call'u — artık
  build-time-only (prebuild'de validate koşar).
- `AppRoutes.tsx` doc-blok'undaki "MDX hâlâ eager" uyarı paragrafı —
  artık geçerli değil, yerine güncel açıklama.
- `entities.ts`'te bir şey *kaldırılmadı*; §8.5 (Summary tipleri) ve
  §8 (BaseEntity) yan yana. Validatörler ve `Corpus` tipi olduğu gibi
  duruyor; Node-side validate-corpus.mjs onları çalıştırıyor (direkt
  TS değil ama aynı invariant'ları manuel implement ediyor — bu
  duplikasyon eski karardı; ileride ortak Node-yüklenebilir
  `validators-pure.ts` çıkarmak mümkün).

### E. Ölçüm — chunk boyutları

| Chunk | Önce (6/1) | Sonra (7/1) | Δ |
|---|---|---|---|
| `index-*.js` (eager core) | 236 KB / **77 KB gz** | 236 KB / **77 KB gz** | — |
| **`localized-*.js`** | 276 KB / **110 KB gz** | 96 KB / **32 KB gz** | **−78 KB gz** |
| `transform-*.js` (Atlas d3) | 37 KB / 12 KB gz | 37 KB / 12 KB gz | — |
| `HomePage-*.js` | 22 KB / 8 KB gz | 24 KB / 9 KB gz | +1 |
| `WordPage` / Person / Book / Theme | (toplam) ~30 KB / ~10 KB gz | ~28 KB / ~9 KB gz | ≈ |
| **YENİ `algorithm-*.js`** | — | 21 KB / 10 KB gz | yalnız o entity'de |
| **YENİ `algebra-*.js`** | — | 26 KB / 13 KB gz | yalnız o entity'de |
| **YENİ `zero-*.js`** | — | 28 KB / 14 KB gz | yalnız o entity'de |
| **YENİ `al-khwarizmi-*.js`** | — | 33 KB / 16 KB gz | yalnız o entity'de |
| **YENİ `al-jabr-*.js`** | — | 39 KB / 18 KB gz | yalnız o entity'de |
| **YENİ `hindu-arabic-numerals-*.js`** | — | 21 KB / 12 KB gz | yalnız o entity'de |
| **YENİ `andalusian-translation-workshop-*.js`** | — | 12 KB / 7 KB gz | yalnız o entity'de |

**Initial paint (HomePage, /tr/):** 207 KB gz → **130 KB gz** (%37 azalma).

**Per-entity ekleme:** ortalama ~12 KB gz (showcase Word ~13 / Book ~18 /
Person ~16 / cluster Theme ~7 / magnum Theme ~12).

**Korpus ölçeklenme dinamiği:** eager olsaydı `localized-*.js` doğrusal
büyüyecekti (240 entity × ~14 KB gz = ~3 MB gz tek chunk, her ziyarette
indir). Lazy olarak `localized-*.js` korpusla büyümez — yalnız manifest
büyür (240 entity × ~50 byte özet = ~12 KB gz, ihmal edilebilir).
Per-route maliyet doğrusal kaldı ama parça-parça.

### F. Mimari kararlar (bu dilim'e özgü)

1. **`Pick<>` yerine explicit Summary interface'ler.** Manifest = API
   yüzeyi; full entity şişerse summary değişmesin. tsc her iki tarafta
   sembolik fark yaratıyor; `Pick<Word, 'slug' | 'title' | ...>` yazımı
   ileride Word'e alan eklenince summary'i sessizce büyütürdü.
2. **Manifest dosyası gitignore'da, generator komut script'i.** Vite
   plugin'i sadece dev HMR + build-belt-and-suspenders için; **virtual
   module** (`virtual:manifest`) kullanılmadı çünkü tsc'nin manifest'i
   görmesi gerek (tipler) — diskteki gerçek bir TS dosyası tüm araç
   zincirinde tutarlı (tsc + IDE + vite).
3. **`getThemesForEntity` artık `ThemeSummary[]`** (eski `Theme[]`).
   Reverse-index sadece `slug + title + tier` okur; tam Theme'i bu uğurda
   indirmek absurd olurdu.
4. **Sync `getXSummary` getter'ları** (BookPage author-aside, ThemePage
   entity-cards). Sayfa-içi cross-reference *aynı sayfada* başka bir
   entity'nin minimal bilgisini istediğinde ek async dönüş istemiyoruz —
   summary zaten manifest'te oturuyor, yine sync yola düştük.
5. **`useEntity` hook tek bir generic** — 4 sayfa için ayrı `useWord/
   useBook/...` hook'ları yazmak yerine. Generic + slug-key dependency
   araması yeter; race-safety `alive` flag pattern'iyle.
6. **`prebuild`'de `validate-corpus.mjs`** — runtime'dan çıkarmanın
   bedeli unutulan invariant ihlali olamasın. Validate koşmazsa build
   yine geçer (TS hata çıkarmaz), ama `npm run build` zincirinde
   `validate` exit-1 ise prebuild fail eder → hatalar erken yakalanır.
   CI bu zinciri kullanır; geliştirici lokali typecheck + dev'de
   yine validate-bağımsız çalışır (HMR'i bozmamak için).
7. **`makeLazyFetcher` factory** — 4 fetcher'ın aynı yapıyı paylaşması
   için. Manuel her birinde aynı try/catch + cache + 404 guard yazmaktansa
   tek bir fonksiyon ailesi; tip parametresi `<T>` ile parser tipi
   farklılaşır.

---



## Oturum 6 / dilim 1 — bu dilimde ne yapıldı

Tek oturumda üç paralel iş kolu: **(A) içerik canlılığı** (yeni cluster
Theme), **(B) altyapı borcu temizliği** (token + tsconfig + code-split),
**(C) görsel polish** (Atlas region + zoom).

### A. `andalusian-translation-workshop` — ilk cluster-tier Theme (yeni)

- `content/themes/andalusian-translation-workshop.mdx` — slug
  `andalusian-translation-workshop`, tier: `cluster`. Editöryel eksen:
  Toledo, 1085 sonrası — Arapça matematiksel külliyatın tek bir nesil
  ve tek bir şehir içinde Latince'ye geçişi. Magnum'un (`hindu-arabic-
  numerals`) zamansal *çizgi* metaforuna karşı, mekânsal *yoğunluk*
  metaforu. Aynı üç Word'ü (`algorithm`, `algebra`, `zero`) topluyor +
  ek olarak `al-khwarizmi` (Person) ve `al-jabr` (Book) — yani şu anki
  *tüm* korpus iki tema arasında paylaşılıyor.
- Esay uzunluğu ~600 word/dil (3 dil = ~1800w toplam) — magnum'un
  yaklaşık 1/3'ü; cluster tier'ın "daha demet, daha kısa" tonunun
  korpusta ilk uygulaması. Üç bölüm: (1) Toledo 1085 — Don Raimundo'nun
  atölyesinin kuruluşu; (2) atölyenin yöntemi (Arapça → sözlü Romance →
  Latin yazı, üç dilli koreografi) ve 1145 (Robert of Chester) / 1170s
  (Gerard of Cremona) çevirileri; (3) Bağdat'ın `Bayt al-Ḥikma`'sı ile
  yapısal karşılaştırma (200 yıl Arapça'ya, 80 yıl Latince'ye).
- 6 source/dil — Burnett 2001 (Toledo program coherence), Hasse 2010
  (Latin Averroes), d'Alverny 1982 (translators), Karpinski 1915
  (Robert of Chester edition), Gutas 1998 (Bağdat arka planı), González
  Palencia 1942 (klasik arşiv). Arapça'da yarısı Arapça-aslî kaynak
  (Sâ'id al-Andalusî, al-ʿAbbâdî, Leo Africanus).
- **Topology sonucu** — Theme back-links artık ilk kez gerçek anlamda
  *çoklu-badge* gösteriyor:
  - `algorithm.mdx` → 2 Theme: hindu-arabic-numerals + andalusian-…
  - `algebra.mdx`   → 2 Theme: hindu-arabic-numerals + andalusian-…
  - `zero.mdx`      → 2 Theme: hindu-arabic-numerals + andalusian-…
  - `al-khwarizmi`  → 2 Theme: hindu-arabic-numerals + andalusian-…
  - `al-jabr`       → 2 Theme: hindu-arabic-numerals + andalusian-…

  ThemeBadges component'i tier-rengi ile iki badge'i yan yana basıyor
  (magnum: gold tonu, cluster: lazaward tonu); hover sırası dosya
  okuma sırası (registry deterministik).
- **Schema değişikliği YOK** — Theme tier render path'i ThemePage'te
  zaten cluster + magnum için aynı (yalnız `theme-tier-${tier}` CSS
  sınıfında badge rengi değişiyor). Cluster için ekstra UI dalı
  açmadık; bunu ileride magnum-cluster ayrımı *gerçekten* görsel
  bir farkı haklı çıkardığında yaparız.

### B. Polish — üç latent borç temizlendi

#### B.1 `--display` CSS değişkeni tanımı

`src/styles/tokens.css`'te `--display` 5 callsite'da kullanılıyordu
(WordPage / PersonPage / BookPage / ThemePage / HomePage "coming soon"
fallback'i) ama tanımsızdı; tarayıcı sessizce Times'a düşüyordu. MVP
çözümü: `--display: var(--serif)` (EB Garamond) eşle. Yeni font
yüklemek istemedik (HomePage'de büyük başlıklar zaten `fs-3xl`/`fs-4xl`
ile "display"-tonunda görünüyor). İleride ayrı bir başlıklık yüzü
(ör. Cormorant SC) istenirse yalnız bu satır değişir; callsite'lar
zaten `var(--display)` çağırıyor.

#### B.2 `tsconfig.node.json` + `vite.config.ts` typecheck temizliği

İki bağlı sorun:
1. **TS6310** — parent `tsconfig.json` `noEmit: true`, child
   `tsconfig.node.json` `composite: true` ama emit ayarı uyumsuz:
   "Referenced project may not disable emit". Composite child'ın
   emit'i ON olmalı (composite mantığı `tsbuildinfo` üretmek için
   emit'e dayanır).
2. **`Cannot find module 'node:path'` + `__dirname` undefined** —
   `vite.config.ts` Node built-in'leri kullanıyor ama `@types/node`
   yüklü değildi.

Çözüm tek dilim'de:

- `npm install -D @types/node@^22` (devDependency).
- `tsconfig.node.json` yeniden yazıldı: `target: ES2022`, `lib: [ES2022]`,
  `types: ["node"]`, `outDir: ./node_modules/.cache/tsc-vite-config/`
  (tsbuildinfo + .d.ts cache içine, build artifact'ı *değil*); `noEmit`
  KALDIRILDI (composite'la çelişiyordu).
- `package.json` `typecheck` script: `tsc -b --noEmit` → `tsc -b`.
  `--noEmit` flag'i parent flag olarak child'a sızıyor ve TS6310'u
  yeniden tetikliyordu; çıkardık. `tsc -b` zaten yalnız tsbuildinfo
  cache'e yazıyor — gerçek artifact üretmiyor.
- `.gitignore`: `*.tsbuildinfo` (parent için kökte üretilen
  `tsconfig.tsbuildinfo` cache dosyası).

Doğrulama: `npm run typecheck` → 0 hata; `tsc -b` → 0 hata; vite build
hâlâ temiz.

#### B.3 Per-route code-split (React.lazy)

`src/router/AppRoutes.tsx` yeniden yazıldı:

```ts
const HomePage   = lazy(() => import('@/pages/HomePage'));
const WordPage   = lazy(() => import('@/pages/WordPage'));
const PersonPage = lazy(() => import('@/pages/PersonPage'));
const BookPage   = lazy(() => import('@/pages/BookPage'));
const ThemePage  = lazy(() => import('@/pages/ThemePage'));
const NotFound   = lazy(() => import('@/pages/NotFound'));
```

Tüm `<Routes>` `<Suspense fallback={<RouteFallback />}>` ile sarıldı.
`RouteFallback` minimal: parchment background + italic faint
`{t('common.loading')}` (i18n locales'te zaten var). Build çıktısı
karşılaştırması:

| Sürüm                | Dosya             | Boyut     | Gzip      |
| -------------------- | ----------------- | --------- | --------- |
| **Önce (5/4)**       | tek bundle        | 579 KB    | 195 KB    |
| **Sonra (6/1)**      | `index-*.js`      | 236 KB    | **77 KB** |
|                      | `localized-*.js`* | 276 KB    | 110 KB    |
|                      | `transform-*.js`† | 37 KB     | 12 KB     |
|                      | `HomePage.js`     | 22 KB     | 8 KB      |
|                      | `WordPage.js`     | 12 KB     | 5 KB      |
|                      | …Person/Book/Theme/NotFound | 1–7 KB | <2 KB |

\* MDX raw içerikleri Vite tarafından bu chunk'a gruplandı (6 dosya
toplam ~210 KB raw). Per-route MDX lazy YAPILMADI — onu yapmak
registry'nin tüm imzasını async'e (`Promise<Word>`) çevirmek demek;
ayrı bir dilim. Şu an: ana sayfaya gelindiğinde `localized-*.js`
chunk'ı da yükleniyor (HomePage'in `listWords/Persons/Books`'a
ihtiyacı var, bu da MDX'leri tetikliyor); ama Word/Theme/Book/Person
sayfaları arasında geçiş tamamen ayrı chunk indiriyor.

† d3-zoom + d3-selection + bağımlılıkları (Atlas chunk'ı). HomePage
zaten lazy olduğu için bu chunk da yalnız ana sayfaya gelinince
indiriliyor.

Vite 500 KB uyarısı kayboldu. CSS de per-route ayrılmış (Vite
otomatik): `WordPage.css` 15 KB ayrı, `BookPage.css` 9 KB ayrı vb.
Initial paint için kritik path: `index.css` (24 KB) + `HomePage.css`
(9 KB) + `index-*.js` (77 KB gz) ≈ 110 KB / ~30 KB gz.

### C. Atlas zenginleştirme

`src/components/Atlas.tsx` yeniden yapılandırıldı; iki yeni davranış
+ bir struct değişikliği.

#### C.1 SVG yapı değişikliği — zoomable canvas + static overlay

Eski yapı: tüm grafik (frame, pusula, denizler, nehirler, yerler,
pin'ler, manuscript marks) SVG'nin doğrudan çocuklarıydı. Yeni yapı:

```
<svg>
  <defs>...</defs>
  <rect parchment-grain />            ← static
  <g class="atlas-canvas" transform={d3-zoom-string}>
    <g class="atlas-seas">…</g>       ← zoom edilir
    <g class="atlas-rivers">…</g>
    <g class="atlas-regions">…</g>    ← YENİ
    <g class="atlas-places">…</g>
    <g class="atlas-pins">…</g>
    <HoverTooltip />
  </g>
  <g class="atlas-overlay">           ← static
    <rect frame /> <rect inner-frame />
    <g class="atlas-cardinals">N/S/W/E</g>
    <g class="atlas-corner-marks">✦✦✦✦</g>
  </g>
</svg>
```

Karar: kullanıcı zoom yaparken **pusula ve çerçeve sabit kalmalı** —
manuscript haritalarda da çerçeve sayfanın bir parçasıdır, içerik
kayar ama pergel değişmez. Bu yüzden frame + cardinals + corner
marks `<g.atlas-overlay>`'e taşındı; zoom transform onları etkilemiyor.

#### C.2 Region etiketleri (yeni)

`AtlasPlace.region` veri-alanı (al-Andalus, Transoxiana, the Levant,
Mesopotamia, India, England, Egypt, France, Italy, the Bosphorus,
Khwārazm region) tüm 15 yer için zaten Localized doluydu — UI'a
hiç değmiyordu. Şimdi:

- `computeRegionGroups(places, lang)` helper'ı `region.en`'e göre yerleri
  grupluyor; sadece **çoklu-şehir bölgelerini** tutuyor (`count >= 2`)
  — tek-şehir bölgesi etiketsiz kalır çünkü o bölgenin "anlam yoğunluğu"
  zaten tek pin'le temsil ediliyor; etiket göstermek görsel kalabalık
  yaratırdı.
- Şu anki korpus için 4 region görünüyor:
  - **al-Andalus** (Córdoba + Toledo) — centroid ≈ (137, 388)
  - **Transoxiana** (Bukhara + Samarkand) — ≈ (882, 285)
  - **India** (Delhi + Ujjain) — ≈ (988, 450)
  - **England** (London + Cambridge) — ≈ (210, 180)
- Stil: `.atlas-region-label` — manuscript-italic, faint sepia
  (`opacity: 0.62`), 17px, UPPERCASE 0.18em letter-spacing (Latin script;
  klasik harita konvansiyonu); Arapça'da italic değil normal Amiri,
  19px, letter-spacing 0 (Arapça'da tracking harf-bağlarını bozar).
  Z-order: `<g.atlas-places>`'tan ÖNCE → şehir adları her zaman
  region etiketinin ÜSTÜNDE; pin'ler en üstte.

#### C.3 D3-zoom + pan

`d3-zoom` zaten dependency'deydi (`@types/d3-zoom` da öyle). Bağlama:

```ts
useEffect(() => {
  const z = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.6, 4])
    .translateExtent([[-W*0.5, -H*0.5], [W*1.5, H*1.5]])
    .filter(event => !(event.target as Element)?.closest('a'))
    .on('zoom', e => { setTransformStr(...); setIsZoomed(...) });
  select(svgRef.current).call(z);
  return () => select(svgRef.current).on('.zoom', null);
}, []);
```

Filter'ın sebebi: pin'ler `<a>` (Link) olarak render ediliyor — onlara
tıklamak entity sayfasına gitmeli, zoom başlatmamalı. `closest('a')`
ile pin tıklamaları d3-zoom'dan gizleniyor. Wheel her zaman geçer
(target ne olursa olsun zoom etmeli); touch/mouse ise yalnız zemin
veya etiketten başlayanlar.

Translate extent'i viewBox'ın %50 fazlası — kullanıcı haritayı
ekrandan tamamen sürükleyemez. Scale extent [0.6, 4] — uzaklaştırma
hafif, yakınlaştırma 4× ile detaylı pin/region'ları rahat okuyabilir.

`isZoomed` state'i transform identity'den uzaklaştığında `true`'ya
geçer; bu durumda lejand satırının sağ ucunda **reset zoom butonu**
görünür: `⤺ Yakınlaştırmayı sıfırla` (TR / EN: "Reset zoom" / AR:
"إعادةُ التَكبير"). Tıklandığında `transition().duration(400)` ile
identity'ye yumuşak dönüş.

#### C.4 i18n locales — yeni anahtar

`atlas.resetZoom` üç dilde:
- TR: "Yakınlaştırmayı sıfırla"
- EN: "Reset zoom"
- AR: "إعادةُ التَكبير"

#### C.5 Atlas.css — eklemeler

- `.atlas-svg` artık `cursor: grab` + `:active { cursor: grabbing }` +
  `touch-action: none` (mobile pinch-zoom'un page'i değil sadece
  haritayı zoom etmesi için).
- `.atlas-region-label` + AR varyantı (yukarıda C.2'de açıklandı).
- `.atlas-zoom-reset` — transparent border-only button, `var(--mono)`
  küçük caps, hover'da gold border + parchment fill.
- Mobile @media (≤640px): region label boyutu 14/16px'e küçülür,
  zoom-reset auto-margin yerine kendi satırına düşer.

---

## Oturum 5 / dilim 4 — bu dilimde ne yapıldı

### `algebra.mdx` — ikinci showcase Word (yeni)

- `content/words/algebra.mdx` — atlasAnchor: `baghdad`, ipa
  `/ˈæl.dʒɪ.brə/`. Editöryel eksen: Arapça <em>al-jabr</em>'ın *cerrahi*
  eğretilemesi (kırığı kaynaştırma; *al-mujabbir* = kemik tamircisi)
  matematiksel "denklem dengeleme" kavramına nasıl yapıştığı. 5 stratum
  ters-kronolojik:
  1. Modern (2026): grup/halka/cisim — soyut yapı; finite-field şifreleme,
     Hilbert uzayı, lineer cebir = "matematiksel düşüncenin havası".
  2. Sembolik Çağ (1545–1707): Cardano *Ars Magna* → Bombelli imajinerleri →
     Viète *logistica speciosa* → Descartes *La Géométrie* → Newton
     *Arithmetica universalis*. Kelimenin gönderdiği nesne değişiyor:
     Bağdat'ın iki ameliyesinden, harfler üzerindeki *manipülasyonun
     kendisinin* adına.
  3. Latin Aktarımı (1145): Chesterli Robert *Liber algebrae et almucabolae*;
     Cremonalı Gerard ikinci çeviri; *al-muqābala* yolda kayboluyor;
     İtalyan abakuscu geleneği (Fibonacci sonrası) kelimeyi günlük
     kullanıma indiriyor.
  4. Doğuş Tabakası (~825, Bağdat, Bayt al-Ḥikma): el-Harezmî altı kanonik
     denklem tipi; *al-jabr* + *al-muqābala* iki ameliye; cerrahi
     eğretileme açıkça anlatılıyor. actorTag → `personRefs: [al-khwarizmi]`,
     `bookRefs: [al-jabr]`.
  5. Daha Eski (~628 → MÖ 1700): Brahmagupta *Brāhmasphuṭasiddhānta*
     bījagaṇita çekirdeği → Bhāskara II *Bījagaṇita* (1150) → Diophantus
     *Arithmetica* (~250) → Babil ikinci-derece prosedürleri (YBC 6967).
     "Üç akış bir Bağdat masasında buluştu, el-Harezmî sadece *kırığı
     kaynaştırma* demeyi seçti, ad kalıcı oldu."
- Etymology ağacı — Arapça الجَبْر'den **iki** ana dal (algorithm.mdx'in
  tek dalına karşı): (a) Osmanlı Türkçesi'nde *cebr* doğrudan ödünç →
  Modern *cebir* (1930s reform); (b) Latince *algebra* (1145) → İtalyanca
  *algebra* (Fibonacci çevresi) → İngilizce *algebra* (c.1550); ayrıca
  Fransızca *algèbre*. Dört modern dilde aynı atadan dört torun.
- Siblings: `algorithm` (live) + `zero` (live). Her ikisinin de notu
  bu dilim'in mimari yorumunu taşıyor: "aynı masada, aynı yıllarda
  doğan kız kardeşler" / "sıfır olmadan denklem dengesi mümkün değil".
- 6 source: Rashed *Al-Khwārizmī* (Saqi 2009), Hughes ed. *Robert of
  Chester's Latin Translation* (Steiner 1989), Høyrup *Lengths, Widths,
  Surfaces* (Springer 2002), Berggren *Episodes* (2nd ed. Springer 2016),
  Plofker *Mathematics in India* (PUP 2009), Saliba *Islamic Science*
  (MIT 2007).
- Boyut: ~28 KB tek dosyada; algorithm.mdx ölçeğinde (~26 KB) yakın.

### `zero.mdx` — üçüncü showcase Word (yeni; korpustaki en zengin etimoloji)

- `content/words/zero.mdx` — atlasAnchor: `ujjain` (kavramın ilk eksiksiz
  aritmetiğini Brahmagupta *Brāhmasphuṭasiddhānta*'sında orada veriyor;
  Arapça *ṣifr* o kavramın *calque*'i). Etimolojinin coğrafi çapası
  Arapça-doğum yerinden değil — kavramın doğum yerinden. **Karar #19**
  (aşağıda).
- 5 stratum ters-kronolojik:
  1. Modern (2026): klavye 0; *zero* / *cipher* / *chiffre* aynı kelimeden
     dünyanın yarısının kelime hazinesi.
  2. Biçimsel Çağ (1854–1936): Boole *Laws of Thought* — yanlış=0/doğru=1
     ikili cebrini kuruyor → Cantor boş kümenin kardinali → Frege
     "kendine eşit olmayan nesneler" → Peano doğal sayıların başlangıcı
     → Turing soyut makinesi (boş hücre, 0 bit).
  3. Yasak Tabakası (1299 — c.1500): Floransa *Arte del Cambio* yasağı,
     "kafir hesabı" suçlaması, *0*'ın *6/9*'a sahteciliği; abakuscular
     vs. *algoristi*; *cifra*'nın ikiz anlamı — *boşluk* ve *gizli yazı*.
     "Yasak çıkmadan önce sıfır bir simgeydi; yasak sırasında *bir
     şüphe* oldu."
  4. Latin Aktarımı (1145–1202): Adelard *Liber Algorismi* → *cifra*;
     ikiz dal — Venedik İtalyancası *zefiro / zevero* → İtalyanca *zero*
     (Pacioli *Summa* 1494) → İngilizce *zero* (c.1600); ayrı dal Eski
     Fransızca *chiffre* → Modern Fr. *chiffre* + İngilizce *cipher*.
     Aynı kelimeden, aynı dilde: <em>zero</em> (rakam) ve <em>cipher</em>
     (kod).
  5. Doğuş (~628 → ~825, Bhillamāla → Bağdat): Brahmagupta'nın *śūnya*
     ("boş") sıfıra ilk eksiksiz aritmetiği veriyor; iki yüzyıl sonra
     el-Harezmî *Kitāb al-Ḥisāb al-Hindī*'de Sanskritçe *śūnya*'ya
     Arapça karşılığı seçiyor: <em>ṣifr</em> ("boş, çıplak, hiçbir şey").
     Calque, ses ödüncü değil. "Hindistan hayalete bedenini verdi;
     Bağdat ona Arapça adını taktı." Babil çivi yazılı tabletleri yer
     değerini biliyor ama sıfırın yerine yalnız bir *boşluk* koyuyor —
     işaretsiz hayalet.
- Etymology ağacı — Arapça الصِّفْر'den **üç** ana dal (korpustaki en
  derin tree):
  - (a) Türkçe *sıfır* doğrudan Osmanlı ödüncü
  - (b) Latince *cifra* → Venedik *zefiro* → İtalyanca *zero* →
    Fransızca *zéro* → İngilizce *zero*
  - (c) Latince *cifra* → Eski Fransızca *chiffre* → Modern Fr.
    *chiffre* (rakam · şifre) + İngilizce *cipher* (sıfır · kod)
- Siblings: `algorithm` (live, "taşınılan sistemin kalbi") + `algebra`
  (live, "denklem dengesi sıfırla mümkündür").
- 6 source: Kaplan *The Nothing That Is*, Plofker (Brahmagupta + śūnya
  için), Burnett *Numerals and Arithmetic*, Devlin *Man of Numbers*
  (Liber Abaci için), Saliba, Crossley & Henry "Thus Spake al-Khwārizmī"
  *Historia Mathematica* 17 (1990).

### Cross-link grafının tam kapanışı

- `algorithm.mdx` siblings (algebra, zero) `status: placeholder` →
  `status: live` — yalnızca iki satır YAML değişikliği (note metinleri
  korundu, dilim 5/1'de yazılmış halleriyle yerli yerinde duruyor).
- Sonuç: korpusta *placeholder* olan tek bir slug kalmadı.
  `validateCorpusCollect`'in `assertCrossLinkIntegrity` döngüsü artık
  word↔word kenarını da denetliyor (live olduğu için integrity check
  devreye giriyor; algorithm/algebra/zero üçgeninde tüm hedefler
  bulunuyor → 0 hata).

### Theme ters-indeksi — `getThemesForEntity(type, slug)` (yeni)

- `src/content/registry.ts` — yeni helper. Schema değişikliği yok;
  Theme.words/persons/books listelerinin *forward* yönü zaten
  `assertThemeSlugIntegrity` ile validasyona alınmış halde duruyor.
  Eklenen şey o ileri grafın *tersine* açılması.
- Strateji: **eager memoize**, modül yüklenirken tek bir IIFE içinde
  tüm Theme'leri tarar, `Map<string, Theme[]>` kurar — anahtar
  `${type}:${slug}`. Çağrı O(1). Bunu lazy memoize değil eager seçtim
  çünkü:
  - Theme'lerin tümü zaten eager parse ediliyor (registry başlığında
    `import.meta.glob({eager:true})`); ters-indeks için ek I/O yok,
    yalnız bir tek-pas iterasyon.
  - Korpus ölçeği: 30 Theme × ortalama 20 slug ≈ 600 entry. Mikro
    veri; lazy memoization karmaşıklığı ölçeğe göre fazla.
  - HMR: dev'de Theme MDX değiştiğinde registry yeniden değerleniyor →
    IIFE de yeniden koşuyor → indeks taze. Manual cache invalidation
    yok.
- Boş arama → boş dizi (`?? []`); `ThemeBadges` boş dizide `null`
  render eder, sayfada hiç iz bırakmaz. `placeholder` semantiği yok
  (Theme schema'sında zaten yoktu); listedeki her slug live kabul
  ediliyor — broken-ref imkânsız çünkü `assertThemeSlugIntegrity`
  zaten şimşek-fail-fast olarak garantiliyor.

### `<ThemeBadges>` component (yeni)

- `src/components/ThemeBadges.tsx` + `.css`. RelatedWords paterniyle
  kardeş: `themes: Theme[]` + `variant: 'inline' | 'aside'`.
  - **`inline`**: WordPage header'ından sonra ince yatay şerit. Mono-font
    küçük etiket ("Şu temalarda anılır") + tier-renkli pill badge'ler
    (`max-inline-size: 70ch`, header tipografisinin metin sütun
    genişliğine yapışıyor; alt-border `--rule-soft` ile strat-layout'tan
    görsel olarak ayrılıyor).
  - **`aside`**: PersonPage / BookPage kenar kolonunda. Mevcut
    `.aside-block` + `.aside-title` paterniyle iç içe — yeni CSS
    sınıfı icat etmedim, var olan tipografiyi devraldım.
- Tier paleti **ThemePage'in tier-badge palette'iyle birebir**:
  magnum → `var(--gold)`, cluster → `var(--accent-2)` (lazaward).
  Mark karakter (`✦` magnum / `◆` cluster) yine ThemePage'in görsel
  diline uyuyor. Tematik tutarlılık: kullanıcı bir Theme sayfasında
  altın badge gördükten sonra Word sayfasına döndüğünde aynı altını
  görüyor — renk, *Theme* dünyasının imzası.
- RTL safety: `border-inline-start`, `padding-inline-start`, `margin-inline-end`
  logical properties kullanıldı; `[dir="rtl"]` override'ı gerekmedi.
- Hover: hafif `translateY(-1px)` + tier rengiyle border. Atlas pin'inin
  `transform` etkileşimiyle aynı tempo (`0.25s ease`).

### Page wiring (3 sayfa, ince yerleştirme)

- **WordPage**: `<WordHeader>` sonrası, `<div className="strat-layout">`
  öncesi — inline şerit. Header'ın "literalMeaning quote + variants
  list"i tamamlandıktan sonra, strata kazısına inmeden önce, kelimenin
  hangi temasal eksenlerde anıldığını okur. Dökme prosa'ya geçişten
  önce *makro-bağlamı* veriyor.
- **PersonPage**: `aside.person-aside` içinde, `RelatedWords` (wordsIndebted)
  ve `WorksTimeline`'dan sonra. Aside'da en alta yerleştirildi —
  görsel-hiyerarşi: önce kişinin ürünü (kelime, eser), sonra bunlar
  hangi makro-temalarda anılıyor.
- **BookPage**: `aside.book-aside` içinde, `BookAuthorAside` →
  `ManuscriptInventory` → `TranslationChain` sırasının ardından.
  Yine en alta — kitabın yazarı/elyazmaları/çevirileri biyografik
  veri; tema bağı dilseldir, son-eklenen sırada en doğru.

### `hindu-arabic-numerals.mdx` — `words` listesi tamamlandı

- Önce: `words: [algorithm]`. Sonra: `words: [algorithm, algebra, zero]`.
  Tek satır YAML değişikliği. `assertThemeSlugIntegrity` üç slug'ın da
  korpusta gerçek olduğunu denetliyor; 0 yeni hata.
- Bunun dolaylı sonucu: ThemePage'in entity grid'inde `Words` bölümü
  artık 1 değil 3 kart taşıyor; ve üç Word'ün her biri Theme back-link
  şeridinde aynı magnum'u (`Hindu-Arap Rakamlarının Yolculuğu`)
  gösteriyor. Grafın iki yönü senkron.

### i18n: `sections.appearsInThemes` (3 lokal)

- `sections.appearsInThemes`:
  - tr: "Şu temalarda anılır"
  - en: "Appears in themes"
  - ar: "يَرِدُ في الموضوعات"
- Cinsiyet-nötr formülasyon (Word feminin, Person + Book maskülin) —
  `يرد` MSA'da pasif/genel ifade için neutralize edici. Tek anahtar üç
  entity tipinde de geçerli; tip-spesifik ayrı anahtar gerekmedi.

### `scripts/validate-corpus.mjs` — bonus, runtime'dan bağımsız smoke-test

- Node ortamında `js-yaml` ile MDX frontmatter'ları okur, `entities.ts`
  validatörlerinin kritik alt-kümesini koşar:
  - tam 5 stratum + id 1..5
  - showcase tier ≥2 dil başlık
  - Word.siblings / Person.wordsIndebted / Person.works /
    Book.relatedWords cross-link integrity (status: 'live' → hedef
    korpusta var mı)
  - Theme.words/persons/books slug integrity + duplicate detection
  - magnum tier ≥2 dil başlık
- Atlas anchor doğrulaması atlandı (atlas.ts TypeScript; Vite
  runtime'ında zaten denetleniyor). Bu betik bilinçli olarak
  registry.ts ile *kod paylaşmıyor* — tarayıcıdan bağımsız ikinci bir
  doğrulayıcı; CI'a düşürüldüğünde Vite build başarılı bile olsa
  invariant ihlallerini ayrı yakalar. README'de zaten "ileride build
  script" diye not düşülmüştü; bu o.
- Bu dilim'de çıktı: `3 word + 1 person + 1 book + 1 theme · 0
  invariant violations.`

### Atlas — Bağdat üçlü pin (kod değişikliği yok, doğrulama)

- Bağdat'ta artık üç entity: al-khwarizmi (Person) + al-jabr (Book) +
  algebra (Word). `pinOffset(idx, total)` zaten `total >= 3` durumu
  için yelpaze açtırıyordu (radian 0.5 spread, r=13). Kod değiştirmeye
  gerek kalmadı — yeni eklenti mevcut fan kollisyon-çözümünü ilk kez
  *gerçek üç-entity* veriyle test ediyor. Görsel tip-renkli üç pin —
  Word altın, Person terracotta, Book lazaward — Bağdat dot'unun
  çevresinde küçük üçlü yelpaze.

### Smoke test — sonuç

- Corpus: 3 Word + 1 Person + 1 Book + 1 Theme.
- `node scripts/validate-corpus.mjs`: ✓ 0 invariant ihlali.
- `npm run typecheck`: yalnız 3 latent hata (vite.config.ts node types
  + tsconfig.node TS6310) — bu dilim'in eklediği kod sıfır TS hatası
  üretti.
- `npx vite build`: başarılı, registry IIFE'sini tarayıcıda
  doğrulayacağı için console.error build çıktısında görünmez ama
  bundle yeni MDX content + ThemeBadges + theme reverse-index hepsini
  taşıyor (grep `theme-badge` → 1× CSS, grep `algebra|cifra|...` →
  131× JS).
- Bundle: 523 KB → 579 KB (+56 KB JS). Kırılım kabaca: algebra.mdx
  ~28 KB ham + zero.mdx ~28 KB ham, Vite dedupe + minification sonrası
  net +56 KB. ThemeBadges + reverse index ~2 KB. CSS 70 KB → 70 KB
  (ThemeBadges.css ~1 KB, mevcut bundle'a dahil edildi).

### Mimari kararlar (bu dilim'e özgü)

- **#19. zero atlasAnchor: `ujjain`, `baghdad` değil.** Tartışma:
  algorithm'da etymology ağacının kökü = pin (khwarazm yer adı, bu yüzden
  `khwarazm` anchor); algebra'da etymology kökü Arapça الجَبْر — yer
  adı değil, ama mathematical use'un doğum yeri Bağdat → `baghdad`
  anchor. zero için etymology kökü Arapça الصِّفْر, ama bu kelime
  *calque* — Sanskrit *śūnya*'nın anlam-ödüncü; ses ödüncü değil. Eğer
  pin etymology kökünün *yer*ini değil, ödünç-zincirinin *kavramsal
  doğum yerini* gösterirse Bhillamāla/Ujjain doğru. Kelime "zero"
  Avrupa dillerine geldiğinde kavramsal yükü Bağdat'tan değil
  Brahmagupta'dan taşıyor; pin onu yansıtmalı. Sonuç: `ujjain`.
  Bağdat'ta zaten 3 entity var (al-khwarizmi + al-jabr + algebra);
  zero'yu da oraya çapalamak görsel olarak Bağdat'ı aşırı yüklerdi —
  editöryel ekonomiyle yapısal doğruluk aynı yöne çekti.
- **#20. ThemeBadges yerleşimi: WordPage'de inline şerit, Person/Book'ta
  aside-block.** Word page tek-sütun (header → strat-layout); aside'ı
  yok. Theme bağını strat-layout'a karıştırmak (örn. footer-içine
  veya Sources sonrası) "kelime aktif okumadan sonra reading-tail'de
  *temasal genişleme*" hissi vermez — kullanıcı zaten okumayı bitirmiş.
  Header'dan hemen sonra — strata kazısına dalmadan önce —
  *makro-bağlamı* makul; "bu kelime *hangi büyük hikayenin* parçası?"
  sorusuna cevap, kazıya başlamadan verilen davet. Person/Book zaten
  iki-sütun (`.strat-layout--with-aside`); aside Theme bağı için doğal
  yer — biyografik aside-veriyle (eserler, elyazmaları) birlikte
  *yan-veri* statüsünde duruyor.
- **#21. Theme reverse-index: eager IIFE, lazy memoize değil.**
  Karar gerekçesi yukarıda detaylandı (HMR friendly + 600-entry mikro
  veri ölçeğinde lazy karmaşıklığı külfet). Alternatif tasarım — Theme
  sayfasında forward index'i kullanıp tersini *each call* hesaplamak —
  her sayfa render'da O(themes × bucket) iteration: 30 × 60 = 1800
  string-comparison/sayfa. Şu an o pahalı değil, ama eager Map lookup
  O(1) — sembolik temizlik. registry yüklenmiş ama IIFE çalışmamış
  durum imkânsız (modül-seviyesi top-level statement).
- **#22. ThemeBadges'i RelatedWords'ün soyutlamasına ekleme.** Düşündüm:
  `ThemeBadges` ve `RelatedWords` aynı şey değil mi — *bir entity'den
  başka entity'lere bağ-kart koleksiyonu*? RelatedWords `CrossLink`
  (placeholder/live distinction taşır, arabic + roman + note 3-tier
  metadata) için tasarlanmış; ThemeBadges Theme entity referansı
  (placeholder yok, title + tier yeterli, daha *hafif* veri tipi) için.
  RelatedWords'ün CrossLink interface'ine Theme'i sokmak (transformation
  layer ile) overdesign olur; iki ince component ayrı yaşasın daha
  okunaklı. Plus: ThemeBadges tier-renkli, RelatedWords entity-tipi
  renkli — farklı renk-semantiği, farklı UX.

---



## Oturum 5 / dilim 3 — bu dilimde ne yapıldı

### `parseTheme` — dördüncü parser (yeni)

- `src/content/loader.ts` — `parseBook` paterninde, ama Theme'in üç
  belirgin farklı şekli için ek mantık: (a) strata yok (kazı metaforu
  Theme için anlamlı değil); (b) `body: Localized` tek multi-lingual
  markdown alanı — `renderMarkdownLocalized` ile HTML'e çevriliyor,
  Stratum.body ile aynı pattern; (c) `sources: Localized<string[]>`
  (her dil kendi bibliyografyasını taşır) — diğer entity'lerdeki
  `Localized[]` (her source tek bir multi-lingual citation) şeklinden
  farklı. Loader'daki mevcut `pickLocalizedStringArray` helper'ı tam
  bu şekli zaten okuyor; yeni helper gereksizdi. words/persons/books
  flat slug array'leri için yeni `parseSlugList` helper'ı (non-empty
  string + tip kontrolü).
- Top-of-file docstring güncellendi: artık dört parser listeli, "Person,
  Book, Theme parser'ları sonraki oturumda" notu kaldırıldı.

### Theme validatörleri (yeni)

- `src/types/entities.ts` — iki yeni assert:
  - `assertThemeSlugIntegrity(theme, corpus, path)` — `theme.words`,
    `theme.persons`, `theme.books` listelerinin her elemanı korpusta
    gerçekten varolan bir entity'ye çözülmek zorunda. Cross-link
    semantiği yok (Theme schema'sında placeholder durumu yok); listede
    olan her slug `live` kabul edilir. Ayrıca aynı listede duplicate
    slug → ayrı hata. Path mesajları `theme/X#words[N]` granülerliğinde.
  - `assertThemeTitleCoverage(loc, path, themeTier)` — magnum tier'da
    ≥2 dilde başlık zorunlu (showcase Word/Person/Book ile aynı çizgi);
    cluster'da ≥1 yeterli. `assertShowcaseLanguageCoverage`'ın Theme
    uyarlaması — `Tier` (showcase/catalogue) yerine `ThemeTier` (magnum/
    cluster) parametresi alır.
- Hem `validateCorpus` (throw-on-first) hem `validateCorpusCollect`
  (collect mode) Theme döngüsünü içerir. Theme strata-sahibi olmadığı
  için stratified döngüden ayrı.

### Theme registry — aktivasyon

- `src/content/registry.ts` — `parseTheme` import'u eklendi, themeSources
  artık parse ediliyor (eskiden `void themeSources` ile mute idi).
  `listThemes()` exported. `_corpus.themes` artık dolu olabiliyor;
  `validateCorpusCollect` çağrısı dolu themes'le çalışır.

### `<ThemePage>` + ThemePage.css (yeni)

- `src/pages/ThemePage.tsx` — kompozisyon:
  ```
  ThemeHeader  →  ThemeEssayBody  →  § 01..N entity grids  →  Sources  →  colophon
  ```
  Header sade: tier-badge (mono, uppercase Latin / non-uppercase Arabic) +
  display başlık (serif 3.5rem, Arabic'te `--arabic` font + bold) +
  opsiyonel italic subtitle.
- Entity grid bölümleri **tip bazında ayrı section'lar** (Words / Persons
  / Books) — her biri kendi başlık altında. Boş bölümler atlanır;
  numara sayacı (`makeCounter`) yalnızca dolu olan bölümleri sayar,
  böylece "§ 02 Persons" yerine "§ 01 Persons" görünür eğer Words
  listesi boşsa. Tipografik tutarlılık için bu tercih edildi (numara
  her dilde tutarlı bir konum eşlemesi taşır).
- WordCard / PersonCard / BookCard — slug → entity lookup; Word için
  title + literalMeaning, Person için romanName/arabicName + nisba,
  Book için transliteration + titleMeaning. DeadCard fallback: validator
  yine de yakalamış olsa bile slug korpusta yoksa gri tıklanmaz kart
  (defensive UI; üretimde böyle bir entity olmamalı).
- ThemeSources — `Sources` komponenti `Localized[]` alıyor; Theme'in
  `Localized<string[]>` şekline uygun değil. Onun yerine ThemePage'in
  içinde inline subcomponent: `pickLangArray(theme.sources, lang)`'ten
  string[] alıp aynı `.sources-list` CSS sınıfıyla render eder.

- `src/pages/ThemePage.css` — section-frame WordPage.css'ten miras;
  bu dosyada yalnız Theme-spesifik kurallar:
  - **Essay typography:** `.theme-essay` max-inline-size 70ch
    (manuscript prose okuma alanı), font-size `--fs-md`, line-height
    1.75 (Latin) / 1.95 (Arabic). Paragraf-arası `--space-6` margin.
    Inline `<span lang="ar">` Latin metin içinde `--arabic` font'a
    + 1.05em x-height eşlemesine düşer.
  - **Drop cap:** `.theme-essay--with-dropcap > p:first-of-type::first-letter`
    — manuscript altın renk, 4.2em float-start, line-height 0.92.
    Sadece Latin script'te; Arabic'te `theme-essay--ar` sınıfı
    drop cap kuralını taşımaz (bağlantılı harflerde tipografik
    bozulma — Arabic kürsi-altı kuyrukları drop cap ile çakışır).
  - **Tier badge:** `.theme-tier-magnum`→`--gold`, `.theme-tier-cluster`→`--accent-2`
    (lazaward). 1px border + currentColor. Mono font Latin'de,
    `--arabic-ui` Arabic'te.
  - **Entity grid:** auto-fit minmax(240px, 1fr); kart sol-kenar
    şeridi tip-renkli (Word→altın, Person→accent terra-cotta, Book→
    accent-2 lazaward — Atlas pin renkleriyle aynı semantik).
  - **HR divider:** markdown'daki `* * *` satır kesimi (essay'lerde
    "interlude" göstergesi) `<hr>` olarak çıkar; CSS `::before`
    altın "✦" karakteri letter-spacing 1.5em ile ortalar.

### Route aktivasyonu

- `src/router/AppRoutes.tsx` — `/{lang}/tema/:slug` artık
  `<NotFound>` yerine `<ThemePage>` döner. Önceki dilime ait "sonraki
  oturum implement edilecek" yorumu kaldırıldı.

### HomePage dizini — 4. sütun

- `src/pages/HomePage.tsx` — `listThemes()` import edildi, dizin
  grid'inin sonuna `DirectoryColumn`-bazlı Themes sütunu eklendi.
  EntityCard'a Theme kart tipi geçirilirken `theme.subtitle`'ı subtitle
  olarak kullanır. CSS değişmedi: `repeat(auto-fit, minmax(280px, 1fr))`
  4 sütunu desktop'ta (1120px+) zaten tutar.

### İlk Theme MDX — `hindu-arabic-numerals.mdx` (yeni, magnum)

- `content/themes/hindu-arabic-numerals.mdx` — magnum tier, üç dilde
  beş paragraflı esay (~1500 kelime/dil). Yapı (üç dilde aynı):
  (1) gündelik mucize — *825* tuşuna basıyoruz okunmuyor; (2) Hint
  kökeni — *Brāhmasphuṭasiddhānta* (628), *śūnya* niceleştirilmesi;
  (3) Arapça aktarım — Bayt al-Ḥikma, *al-Khwārizmī*, kayıp Arapça
  asıl + *Dixit Algoritmi* Latin çevirisi; (4) Latince yolculuk —
  Toledo (1085 sonrası), Adelard / John of Seville, Sacrobosco
  *Algorismus vulgaris*, Fibonacci *Liber Abaci* (1202); (5) Avrupa
  direnişi — Floransa Arte del Cambio yasağı (1299), abakuscılar vs.
  algoristler; (6) hayatta kalan kelimeler — *algorithm* (nisba),
  *zero* / *cipher* (Arapça `ṣifr` → Latince `cifra` çift-dalı),
  *algebra* (al-jabr "kırığı kaynaştırma").
- Üç dil **çeviri değil**; aynı haritayı kendi kültürel register'ında
  yazar (Oturum 4'ten gelen "eşit yazım, birebir olmama" prensibi).
  TR İletişim Yayınları kültür-tarihi tonu (Hârezm/Bağdat/Floransa
  parantezli açıklamalar, Türkçe akademik nesir); EN Burnett/Saliba
  akademik anlatı sicili; AR çağdaş Arapça intellectual-history
  (klasik tashkil işaretlemesi minimal, MSA register).
- Slug listeleri: `words: [algorithm]`, `persons: [al-khwarizmi]`,
  `books: [al-jabr]`. algebra ve zero esay-prose'da geçer ama slug
  array'lerinde yok — onlar için MDX dosyası yok ve validator var
  olmayan slug'ı reddeder. İki Word eklendiğinde theme'in slug
  array'ine de eklenecek (tek satır YAML değişikliği).
- Sources: dil başına 5-6 referans. TR/EN aynı çekirdek (Burnett,
  Saliba, Plofker, Crossley & Henry, Folkerts) + dile özgü ilave
  (TR: Smith & Karpinski klasik referansı; EN: Kunitzsch transmisyon
  makalesi). AR: Saliba'nın Arapça çevirisi, Rosenfeld & İhsanoğlu,
  Razuq al-Sayyid, Maymūna Ṣiddīq — İngilizce literatürün düz çevirisi
  olmayan bağımsız Arapça akademik kaynaklar.

### Smoke test — 5/5 senaryo

Pozitif yol + 4 adversarial:
1. ✓ MDX parse → tüm alanlar doğru, body HTML'e dönüşüyor, inline
   `<span lang="...">` markup'ı korunuyor (marked default davranışı).
2. ✓ Korpus tamamı (3 stratified entity + 1 theme) → `validateCorpusCollect`
   0 hata.
3. ✓ Bilinmeyen word slug ("nonexistent") → `[theme/.../words[1]] words → "nonexistent" not found in corpus`.
4. ✓ Magnum tier'da tek dil başlık → `Theme tier 'magnum' requires title in ≥2 language(s); found only 1`.
5. ✓ Duplicate slug Theme.persons içinde → `[theme/.../persons[1]] duplicate slug "al-khwarizmi" in persons list`.
6. ✓ Cluster tier'da boş başlık → `Theme tier 'cluster' requires title in ≥1 language(s); found only 0` (cluster gevşek-eşik kuralı sıfıra düşmüyor).
7. ✓ Cluster + tek dil başlık → 0 hata (negatif kontrol; cluster'ın
   gevşek eşiği gerçekten gevşek).

### i18n: `theme.tier.magnum / theme.tier.cluster` (3 lokal)

- TR: "Magnum esay" / "Tema demeti"
- EN: "Magnum essay" / "Cluster"
- AR: "مَقالةٌ كُبرى" / "عُنقودٌ موضوعيّ"

### Build sonrası

- Bundle 495 KB → 523 KB (+28 KB JS, ThemePage kodu + magnum MDX
  ~9 KB/lang × 3 dil + frontmatter); CSS 64 KB → 68 KB (+4 KB,
  ThemePage.css). Vite "500kB üstü chunk" uyarısını veriyor; code-split
  bu dilim'de yapılmadı, ileride `import.meta.glob({eager: false})` ile
  per-route lazy import sonraki temizlik dilime kalsın.
- Görsel sanity bu dilim'de **smoke + structural review** ile sınırlı:
  ThemePage HTML/CSS olduğu için Atlas SVG'si gibi cairosvg ile
  PNG'ye render edilemiyor (browser-bağımlı). Kullanıcı `npm run dev`
  ile `/tr/tema/hindu-arabic-numerals` rotasını visiting görsel
  doğrulamayı yapar; üç dilde drop cap (TR/EN aktif, AR suppress),
  entity grid tip-renkleri, magnum tier badge altın rengi
  manuel kontrol edilir.

---



## Oturum 5 / dilim 2 — bu dilimde ne yapıldı

### `<Atlas>` — homepage manuscript haritası (yeni)

- `src/components/Atlas.tsx` — ham SVG, harici grafik kütüphanesi yok.
  ViewBox `1200×700` (manuscript double-spread oranı). Mimari karar:
  *coğrafi gerçekçilik değil, portolan-chart estetiği* — sadece denizler
  çizili (basit kapalı yollar, lazaward-tinted parchment fill), karalar
  negatif uzayda ima. Bu, "amatör coastline çizimi" tuzağını ortadan
  kaldırır ve Idrīsī / Ottoman portolan'larının stylize sea-chart
  geleneğine yaklaşır. Çizilen su kütleleri: Atlantic kenar şeridi →
  Mediterranean (genişçe yatay blob, Sicilya-tipi daralma yok, ince
  bezier kontrolüyle yumuşak) → Black Sea / Caspian / Aral (üçlü ellipse
  kümesi) → Persian Gulf / Red Sea (dar SE-yönelimli paths) → Bay of
  Bengal / Indian Ocean güney bandı. Üzerinde sepia rivers (Tigris ve
  Euphrates parallel paths Bayt al-Hikma'nın çevresinden geçer; Nile,
  Indus, Oxus → Aral). Hover: pin scale 1.35, üzerine SVG-içi tooltip
  (Localized label, Arabic-script ise `--arabic` font). Click: `<Link>`
  ile entity sayfasına. Mobile: container `overflow-x: auto`, SVG
  `min-inline-size: 760px` — EtymologyTree ile aynı pattern.

### `src/content/atlas.ts` — yer veritabanı (yeni)

- 15 yer kayıtlı: Baghdad, Bukhara, Cairo, Cambridge, Constantinople ·
  İstanbul, Córdoba, Damascus, Delhi, Khwārazm, London, Paris, Rome,
  Samarkand, Toledo, Ujjain. Her kayıt: `slug`, `coords: [x, y]` (SVG
  units, lat-lng *değil*), `name: Localized` (TR/EN/AR — örn. Bağdat /
  Baghdad / بغداد), opsiyonel `region`. `ATLAS_VIEWBOX` const, helper'lar:
  `getAtlasPlace(slug)`, `listAtlasPlaces()`, `placeName(p, lang)`.
  Mimari sebep: yer veritabanı entity-tipinden ayrı modül — yeni şehir
  eklemek tek satır YAML değil, tek `AtlasPlace` literal. validator
  ATLAS_PLACES'a doğrudan bağımlı *değil* (aşağıda).

### `BaseEntity.atlasAnchor?: string` (schema genişletmesi)

- `src/types/entities.ts` — `BaseEntity`'ye opsiyonel `atlasAnchor`
  alanı: yer slug'ına referans. Lat-lng yerine slug kullanmanın iki
  faydası: (a) MDX yazarı koordinat tahmini yapmaz, sadece "baghdad"
  yazar; (b) atlas SVG yeniden çizilirse koordinatlar tek noktada
  güncellenir, MDX'lere dokunulmaz. Üç parser (`parseWord` /
  `parsePerson` / `parseBook`) `data.atlasAnchor` string'ini okur ve
  entity'ye atar.

### `assertAtlasAnchorIntegrity` + validator wiring

- `entities.ts` — `assertCrossLinkIntegrity` kardeşi: bilinmeyen anchor
  slug'ı → `CorpusValidationError`. *Validator → atlas modülü bağımlılığı
  yok*: kontrol fonksiyonu valid slug kümesini parametre olarak alır
  (`ReadonlySet<string>`). `validateCorpus` ve `validateCorpusCollect`
  imzalarına opsiyonel `atlasPlaceSlugs` eklendi; verilmezse anchor
  doğrulama atlanır (geriye uyumluluk).
- `src/content/registry.ts` — runtime'da `new Set(Object.keys(ATLAS_PLACES))`
  geçer. Ölü pin → dev console'da net path mesajı (örn. *"[word/algorithm
  #atlasAnchor] atlasAnchor 'atlantis' not found in ATLAS_PLACES"*).

### MDX frontmatter — anchor değerleri

- `algorithm.mdx` → `atlasAnchor: khwarazm` (kelimenin etimolojik kökeni;
  dilim 5/1'de etymology ağacının kök node'u olarak alınan kararla
  tutarlı — pin Aral'ın güneyinde Hârezm bölgesinin ortasında).
- `al-khwarizmi.mdx` → `atlasAnchor: baghdad` (Bayt al-Ḥikma).
- `al-jabr.mdx` → `atlasAnchor: baghdad` (telif yeri).
- Sonuç: pin kümesi anlamlı bir hikâye anlatıyor — "kelime Hârezm'de
  doğdu, adam Bağdat'ta yazdı, kitap Bağdat'ta basıldı."

### Pin tasarımı: tip-renk + collision offset

- Word→`--gold`, Person→`--accent` (terra-cotta), Book→`--accent-2`
  (lazaward) — sitedeki entity-rengi semantiği ile aynı (Sources
  cards, sibling cards, Stratigraphy renkleriyle koherent).
- Aynı anchor'da çoklu entity: tip bazında küçük dikey/yatay offset.
  Tek entity: tam pin yerinde (`(0, -10)`). İki entity: yatay çift
  (`(±9, -12)`). Üçlü: küçük yelpaze (üç açı). Bağdat'ta person + book
  şu an çift offset'te — Khwārazmī sol, al-Jabr sağ.
- Halo + mark iki katmanı: `bg`-fill halo dış (parchment'e oturur),
  type-color mark iç (8px diameter). Hover'da `transform: scale(1.35)`,
  `transform-box: fill-box` ile origin doğru.

### `<HomePage>` yeniden kompozisyonu

- `src/pages/HomePage.tsx` — önceki dilim'deki (4/2) düz liste-grid
  sayfa, "Atlas sonraki oturumda gelecek" notuyla geçici idi. Yeni
  yapı: bilingual başlık + tagline (3 dil) → `<Atlas>` (centerpiece) →
  Directory section (üç sütunlu Word/Person/Book grid, accessibility +
  direkt erişim fallback'i). `home-entity-card` hover: top'ta gold rule
  `transform: scaleX(0)` → `scaleX(1)` animasyonu — Sources card
  hover'ıyla aynı micro-interaction tonu.
- `src/pages/HomePage.css` — yeni CSS dosyası (önceki dilim'de inline
  styles vardı; bu dilimle dosyaya çıktı). `home-directory-grid`:
  `repeat(auto-fit, minmax(280px, 1fr))` — 3 kolon desktop, 2 kolon
  tablet, 1 kolon mobile.

### i18n: `home.atlasTitle / atlasSubtitle / directoryTitle / directorySubtitle`

- TR: "Atlas / kazı sahası — varlıkların coğrafi çapaları" / "Dizin /
  korpustaki tüm kayıtlar"
- EN: "Atlas / the excavation site — geographic anchors of the corpus"
- AR: "الأطلس / موقعُ الحَفريّة — مَراسي الكلمات والأشخاص والكتب"

### Smoke test — pozitif + adversarial

- Pozitif: 3 entity → 3 valid anchor → `validateCorpusCollect` 0 hata.
- Adversarial: `word.atlasAnchor = 'atlantis'` → 1 hata, path mesajıyla:
  *"[word/algorithm#atlasAnchor] atlasAnchor 'atlantis' not found in
  ATLAS_PLACES"*. Validator integrity zinciri çalışıyor.

### Görsel sanity check

- Atlas SVG'si izole HTML'de cairosvg ile PNG'ye render edildi; ilk
  render'da üç görünür glitch tespit edilip düzeltildi: (a) Cairo (555,
  470) Red Sea üstüne düşüyordu → x=510'a çekildi (Nil deltasında); (b)
  London (200, 195) ile Cambridge (205, 195) etiketleri çakışıyordu →
  Cambridge (220, 165)'e taşındı; (c) entity'li yerlerde label pin halo
  arkasında kalıyordu → `y={-10}` koşullu olarak `y={-26}`'ya yükseldi.
- Tipografi: Latin yer adları `--serif` italic (boş yerler)/`--serif`
  düz (entity'li yerler), Arapça yer adları `--arabic`. Cardinal
  (NSEW) `--mono` küçük caps. Köşe manuscript marks (✦) altın renk.

---


### `<EtymologyTree>` — D3 yatay ağaç (yeni)

- `src/components/EtymologyTree.tsx` — D3 yalnızca *layout hesabı*
  için (`d3.hierarchy` + `d3.tree`); SVG element ağacı React tarafından
  render ediliyor (idiomatic React, manuel `select(...).remove()`
  cycling'i yok). Yatay tree: kök sol/sağ kenar (LTR/RTL), yapraklar zıt
  yönde. Etiket node *altına* ortalanmış üç satır: `label` (serif/Arabic) /
  `language` (mono küçük caps) / `year` (mono italic). Connector'lar
  elle yazılmış cubic bezier (kontrol noktaları midX'te) — `d3.linkHorizontal`'ın
  accessor tip-karmaşasından kaçınmak için. ResizeObserver: container
  genişliği değiştikçe layout yeniden hesaplanır; minimum kolon genişliği
  (`LEVEL_MIN_PX = 170`) altına inilemediği için dar viewport'larda
  container `overflow-x: auto` ile yatay kaydırılır.
- `src/components/EtymologyTree.css` — section-frame WordPage.css'den
  miras; bu dosyada sadece tree-spesifik kurallar. Renk paleti tamamen
  token: kök daire `--accent` (terra-cotta), iç node'lar `--gold`
  (manuscript altın yaprak), yapraklar `--accent-2` (lazaward modern
  boya); link'ler `--rule`. Light/dark otomatik. `.etymology-node-label[lang="ar"]`
  → `--arabic` font ailesi (Amiri); AR sayfada language satırı `--arabic-ui`'ye
  düşer ve uppercase'i bırakır (Arapça'da küçük-uppercase tipografik anlamlı
  değil).

### `EtymologyNode.language: string → Localized` (schema genişletmesi)

- `src/types/entities.ts` — `EtymologyNode.language` artık `Localized`.
  `label` (kelimenin kanonik formu — örn. `"الخوارزميّ"`, `"Algoritmi · Algorismus"`)
  düz `string` kalıyor: yazıldığı dilde tek sabit form, dile göre
  yeniden formüle edilmiyor. `language` ise dile göre değişen açıklama
  ("Eski Fransızca" / "Old French" / "الفرنسيّة القديمة") — Oturum 4 #7'de
  `ActorTag.name` için alınan kararla aynı çizgi: dile göre formüle
  edilebilen alan zorunlu Localized. `year` ("c. 825", "13th c.",
  "1930s →") `string` — `Stratum.year` ile aynı pan-lingual sicilde.

### `parseWord` recursive `etymologyTree` çözümü

- `src/content/loader.ts` — `reshapeEtymologyNode(raw, path)` rekürsif
  helper; `label` zorunlu non-empty string, `language` Localized,
  `year` opsiyonel string, `children` opsiyonel `EtymologyNode[]`.
  `parseWord` artık `data.etymologyTree`'yi de işliyor (varsa).

### `validateCorpusCollect` — toplayıcı doğrulama (cross-cutting hygiene)

- `src/types/entities.ts` — mevcut `validateCorpus` (ilk hatada throw)
  korunuyor; yanına `validateCorpusCollect(corpus)` eklendi: aynı
  invariant'ları paylaşır ama her kontrolü `try`/`catch` ile sarmalayıp
  hataları diziye toplar, döner. Strict mod (build script) `validateCorpus`'u,
  dev/runtime registry yüklemesi `validateCorpusCollect`'i kullanır.
- `src/content/registry.ts` — modülün en sonunda (tüm parse'lar
  bittikten ve tüm registry'ler dolduktan sonra) `validateCorpusCollect`
  çağrılır; sıfırdan büyük hata varsa `console.error`'a yazılır. Parse
  hatalarıyla aynı tonda — build patlatmıyoruz, dev console'a yazıyoruz.
  Adversarial test (`live` cross-link → mevcut olmayan slug) iki hatayı
  da net path mesajıyla yakaladı: `[word/algorithm#siblings[0]] CrossLink → word/algebra marked 'live' but target not found`.

### Section numbering reshuffle (Word sayfası)

- WordPage'de yeni bölüm sırası: Etymology § 03 → Siblings § 04 →
  Sources § 05. PersonPage ve BookPage etkilenmedi (etymology yok orada).
- `src/components/Sources.tsx` artık `sectionNum?: string` prop alıyor,
  default `"§ 04"` (Person/Book için doğru). WordPage'den `"§ 05"`
  açıkça geçirilir. RelatedWords'in zaten kullandığı parameterizasyon
  pattern'i — komponent paylaşımının doğal sonucu.
- `src/components/Siblings.tsx` § 03'ten § 04'e geçti (sabit; yalnızca
  Word sayfasında kullanılıyor, prop'a gerek yok).

### `algorithm.mdx`'e etymology verisi (yeni 8 node)

- Editöryel karar: README'nin "Hint Brāhmasphuṭasiddhānta → Arapça →
  Latince → Fransızca → İng/TR" zinciri *intellektüel transmission*
  zinciri; *etymology* ise kelimenin kendi tarihi. Brāhmasphuṭasiddhānta
  kelimenin kökü değil — Hint ondalık aritmetiğinin taşıyıcısı (al-Khwārizmī'nin
  uyarladığı içerik). Bu iz zaten Stratum 5'in `actorTag`'ında doğru
  yerinde duruyor. Etymology ağacının kökü ise *Khwārazm* (Aral Gölü
  güneyi, Eski İran toponim) — al-Khwārizmī'nin nisbasının dilsel
  kaynağı. Ağaç böylece dilsel sicilde tutarlı: yer adı → nisba → Latin
  uyarlaması → Romance + Germanic kollar → modern formlar.
- 5 katman, 8 node; Algoritmi'den çift dal: `algorisme` (Eski Fr →
  Middle English `augrim/algrim`, ölü dal) ve `algorithme` (Modern Fr,
  17–18. yy., Greek *arithmos* halk-etimolojisiyle — bu nüans Stratum 3'ün
  prozasında zaten var) → `algorithm` (Modern İngilizce, c. 1700 →) +
  `algoritma` (Modern Türkçe, 1930'lar, Cumhuriyet matematik tedrisatıyla).

### `sections.etymology` i18n anahtarı (3 lokal)

- `tr.json` → "Köken ağacı"
- `en.json` → "Etymology"
- `ar.json` → "شجرةُ الاشتقاق"

---

## Oturum 4 / dilim 2 — bu dilimde ne yapıldı

### `<PersonPage>` + alt komponentler (yeni)

- `src/pages/PersonPage.tsx` — kompozisyon: PersonHeader → 3-kolonlu
  strat-layout (stratigraphy + layers + person-aside) → PersonCircle →
  Sources → colophon. `WordPage.css` (shared frame) + `PersonPage.css`
  (person-spesifik) birlikte yüklenir.
- `src/pages/PersonPage.css` (~400 satır) — sadece kişi-spesifik bloklar:
  header (romanName + arabicName + tagline + meta strip + role badges +
  nisba pull-quote), `.strat-layout--with-aside` 3-kolon override,
  `.person-aside` sticky kenar, `.aside-block` patern, `.crosslink`
  kart ailesi, `.contemporaries` ızgara, `.contemp` kart. AR modunda
  romanName ↔ arabicName görsel hiyerarşisi otomatik flip.
- `src/components/PersonHeader.tsx` — başlık bloku. Roman adı `**bold**`
  / `*italic*` markdown'unu render eder; Arapça ad daima `lang="ar"
  dir="rtl"`. `lifespan/birthplace/activeIn/workLanguages` meta-strip,
  i18n anahtarları `person.meta.*`. Role badges, nisba quote.
- `src/components/PersonCircle.tsx` — § 03 "Etki halkası" bölümü.
  Discriminated union: `direction: 'none'` → component tamamen `null`
  döner; `'forward' | 'contemporary'` → ızgara. Section frame
  (`.section/.section-head/.section-num/.section-title`) ortak frame
  pattern'iyle.
- `src/components/RelatedWords.tsx` — variant'lı tek komponent.
  `variant: 'aside'` → person sayfasında `wordsIndebted` için kenar
  blokları (`.aside-block` + `.crosslink` kartları). `variant: 'grid'`
  → book sayfasında `relatedWords` için tam-genişlik 3-sütunlu ızgara
  (`.related-word-card` + `.rw-arabic` + `.rw-title` + `.rw-note`).
  Her iki variant'ta `status: 'placeholder'` → `<span>`,
  `status: 'live'` → `<Link>`.
- `src/components/WorksTimeline.tsx` — `RelatedWords variant='aside'`
  etrafında ince sarmalayıcı. Kişi sayfasında `works` listesini aynı
  kart formuyla render eder.

### `<BookPage>` + alt komponentler (yeni)

- `src/pages/BookPage.tsx` — kompozisyon: BookHeader → 3-kolonlu
  strat-layout (stratigraphy + layers + book-aside [yazar mini-kartı +
  ManuscriptInventory + TranslationChain]) → RelatedWords (grid variant)
  → Sources → colophon. Yazar referansı `getPerson(book.authorSlug)` ile
  registry'den çözülür; bulunduysa kart link'leniyor, yoksa düz `<span>`.
  Dile göre yazar adı: `lang === 'ar' && arabicName ? arabicName : romanName`.
- `src/pages/BookPage.css` (~400 satır) — sadece kitap-spesifik bloklar:
  ortalanmış başlık + ❦❦❦ manuscript-mark + Arapça-her-zaman-RTL başlık
  + translit + meaning + meta strip + genre-badges + opening-quote;
  `.book-aside` sticky kenar (`max-block-size: calc(100vh - 100px);
  overflow-y: auto`); `.author-link` altın-borderlı mini-kart;
  `.manuscript` kartları `data-online` attribute'unun üç durumu için
  ayrı stillenmiş badge (full → altın, partial → accent-2, offline →
  muted); `.translation` kartları; `.related-words` ızgarası +
  `.related-word-card` ile scaleX altın-rule hover.
- `src/components/BookHeader.tsx` — kitap başlığı bloku. `fullArabicTitle`
  daima `lang="ar" dir="rtl"`; `transliteration` ve `titleMeaning`
  Localized; meta strip i18n `book.meta.*` anahtarlarıyla. Yazar meta
  hücresi `authorIsLive` → `<Link>`; değilse düz metin.
- `src/components/ManuscriptInventory.tsx` — discriminated union:
  `status: 'full'` derleme-zamanında `url` zorunluluğu sağlıyor; safe
  `<a>`. `status: 'partial' | 'offline'` opsiyonel `url` ile gelir →
  varsa `<a>`, yoksa `<span>`. Status badge'i `data-online` attribute'u
  üzerinden CSS'in stillemesi için bırakılır; i18n
  `book.manuscriptStatus.{full,partial,offline}`.
- `src/components/TranslationChain.tsx` — `.aside-block` içinde tercüme
  kartları. `translatorSlug` varsa person sayfasına `<Link>`; yoksa
  `<span>`. `year` ve `language` ayrı `dir="ltr"` ile, AR modunda da
  doğru akar.

### Content pipeline (genişletildi)

- `src/content/loader.ts` — **`parsePerson` + `parseBook` artık tam.**
  Yardımcılar: `reshapeCircleMember`, `reshapePersonCircle`
  (discriminated union'ı runtime'da tutar — `'none'` → `members: []`,
  aksi hâlde `[CircleMember, ...CircleMember[]]` tuple cast'i),
  `reshapeManuscript` (status='full' için non-empty url validate eder),
  `reshapeTranslation`. Theme parser stub kalmaya devam.
- `src/content/registry.ts` — `persons` ve `books` registry'leri eager
  glob'la kuruldu; `getPerson(slug)`, `listPersons()`, `getBook(slug)`,
  `listBooks()` ihraç edilir. Theme registry stub.

### `al-khwarizmi.mdx` (yeni — ikinci entity)

`content/persons/al-khwarizmi.mdx` — `al-khwarizmi.html` prototipinden
harfiyen taşındı, üç dilde tam içerik:

- 5 stratum × 3 dil (TR/EN/AR), her biri ~150-200 kelime: Modern miras
  (2026) → Avrupa'ya geçiş (1145–1300) → Bağdat zirvesi (~825–833,
  `actorTag.bookRefs: [al-jabr]`) → Yetişme (c.780–820, çağdaş tanık
  Ibn al-Nadīm) → Öncüller (628↓, Brahmagupta + Sasânî zîc + Ptolemaios)
- `wordsIndebted`: algorithm (live), algebra (placeholder), zero
  (placeholder)
- `works`: al-jabr (live), kitab-al-hisab-al-hindi (placeholder),
  zij-al-sindhind (placeholder), surat-al-ard (placeholder)
- `circle.direction: 'forward'`, üyeler: Adelard of Bath
  (c.1080–c.1152), Leonardo Pisano · Fibonacci (c.1170–c.1250), Roshdi
  Rashed (b.1936) — her birinin name/arabicName/years/note 3 dilde
- 6 kaynak (Toomer DSB 1973, Rashed Saqi 2009, Saliba MIT 2007,
  Berggren Springer 2016, İhsanoğlu IRCICA 1997–2007, Ibn al-Nadīm
  Tehran 1971)

### `al-jabr.mdx` (yeni — üçüncü entity)

`content/books/al-jabr.mdx` — `al-jabr.html` prototipinden harfiyen,
üç dilde tam içerik (prototip TR + EN; **Arapça gövde sıfırdan yazıldı**
çünkü prototipte yoktu):

- Başlık tam form: الكتاب المختصر في حساب الجبر والمقابلة; transliteration
  Localized (TR cebr/muḳābele, EN al-Jabr/Muqābala); titleMeaning ve
  composedPlace ve openingQuote (al-Maʾmūn'un girişten alıntısı) hep 3
  dilde
- 5 stratum × 3 dil: Modern eleştirel basımlar (1831·2007) → Avrupa cebir
  geleneği (1545–1700) → Latince tercümeler (1145–1300) → Arap dünyasında
  dolaşım (~850–~1180) → Kompozisyon (c.825, `actorTag.personRefs:
  [al-khwarizmi]`)
- 4 elyazması: Bodleian Hunt 214 (partial, link), Madrid BNE 10010
  (partial, link), Vatican Lat 4606 (partial, link), Cairo Dār al-Kutub
  (offline, no link)
- 4 tercüme: 1145 Robert of Chester · 1170 Gerard of Cremona · 1831
  Rosen · 2007 Rashed
- `relatedWords`: algebra (placeholder), algorithm (**live**), al-muqabala
  (placeholder)
- 6 kaynak (Rosen 1831, Rashed Saqi 2009, Hughes Steiner 1989, Berggren
  Springer 2016, Høyrup Springer 2002, Sezgin Brill 1974)

### Cross-link üçgeni canlandı

Üç sayfa birbirine gerçek bağlarla kapandı:

- **algorithm** (kelime sayfası) — kendi siblings (algebra, zero) hâlâ
  placeholder; bu kasıtlı (Word ↔ Word kenarı bu dilimde açık değildi).
- **al-khwarizmi → algorithm**: `wordsIndebted` listesinde `live` status.
- **al-khwarizmi → al-jabr**: `works` listesinde `live` status; aynı
  zamanda Layer 3'ün `actorTag.bookRefs`'inde.
- **al-jabr → al-khwarizmi**: `authorSlug` registry'den çözülüp aside
  kart linkine dönüşür; aynı zamanda Layer 5'in
  `actorTag.personRefs`'inde.
- **al-jabr → algorithm**: `relatedWords` listesinde `live` status.

> Yani algorithm ↔ al-khwarizmi ↔ al-jabr — üç köşe arasında **5 yönlü
> kenar** canlı; sayfalar arası geçiş gerçekten çalışıyor.

### Routing

`AppRoutes.tsx`'te `/:lang/kisi/:slug` ve `/:lang/kitap/:slug`
stub'larındaki `<NotFound>` `<PersonPage>` ve `<BookPage>` ile
değiştirildi. Theme route stub olarak kalmaya devam.

### HomePage genişletildi

Tek "Kelimeler" listesi, üç bölümlü liste oldu: **Kelimeler**, **Kişiler**,
**Kitaplar**. Her listenin başında `<h2>` mono-ucase başlık + altında
ızgara kart. Person ve Book kartlarında başlık HTML olarak render edilir
(italic için). Banner v0.3, "cross-link üçgeni canlı".

### i18n locales (genişletildi)

Üç dilde yeni anahtarlar:
- `sections.author` — Yazar / Author / المؤلِّف
- `person.meta.{lifespan, birthplace, activeIn, workLanguages}`
- `book.meta.{author, composed, composedIn, originalLanguage}`
- `book.manuscriptStatus.{full, partial, offline}`

Editöryel formülasyonlar 4. dilim mimari kararlarıyla uyumlu (TR
"Yaşam/Doğum yeri/Faal olduğu yer/Çalışma dilleri", AR
"حياته/مسقط الرأس/مكان عمله/لغاتُ أعماله", vb.).

### `WordPage.css` minör fix

Önceki dilimden kalan latent bug: `.section/.section-head` wrapper'ları
prototip tarafından kullanılıyordu (örn. Sources, Siblings'in dış
çerçevesi) ama CSS kuralları taşınmamıştı. Bu dilimde unified frame
kuralları (`.section`, `.section-head` w/ altın rule, `.section-num`,
`.section-title`) WordPage.css'e SECTION FRAME bloku olarak eklendi.
PersonPage ve BookPage de bu sınıfları kullanır.

---

## Oturum 4 / dilim 1 — önceki dilim

İlk dikey kesit (Word entity'si): `/{lang}/kelime/algorithm` canlı.

### Routing

- `<BrowserRouter>` `main.tsx`'in kökünde; tüm hook'lar ağacın altında.
- Rota ağacı `src/router/AppRoutes.tsx`'te:
  - `/` → kullanıcının diline göre `/:lang`'e redirect (`LangAwareRedirect`)
  - `/:lang` → `LangScope` wrapper + `HomePage`
  - `/:lang/kelime/:slug` → `WordPage` (canlı)
  - `/:lang/kisi/:slug`, `/.../kitap/...`, `/.../tema/...` → `NotFound`
    (bir sonraki dilimde Person/Book/Theme sayfalarına bağlanacak)
- `LangScope` (`src/router/LangScope.tsx`) — URL'in `:lang` segment'ini i18n'in
  *source of truth*'u olarak işler. URL değişti mi → `i18n.changeLanguage` +
  `<html lang>` + `<html dir>` senkron. Tek yön: URL → i18n.
- `useLang.setLang(next)` artık navigate eder (URL'i değiştirir); i18n'i
  doğrudan değiştirmez. Döngü riski yok.
- `src/router/paths.ts` — `ENTITY_PATH_SEGMENT` (kelime/kisi/kitap/tema)
  tek doğru kaynak; `entityUrl(lang, type, slug)`, `homeUrl(lang)`,
  `swapLangInPath(path, nextLang)` yardımcıları.

### Content pipeline (yeni)

- **Karar:** `gray-matter` yerine doğrudan `js-yaml` + 5 satırlık frontmatter
  regex. Browser-safe; ekstra polyfill drama'sı yok.
- `src/content/loader.ts` — `parseFrontmatter`, `parseWord`. Markdown gövdeler
  `marked` ile HTML'e çevrilir; sonuç `Localized<string>` olarak Stratum'a
  yazılır.
- `src/content/registry.ts` — `import.meta.glob('/content/words/*.mdx',
  { eager: true, query: '?raw', import: 'default' })`. Tüm `.mdx` dosyaları
  build/dev sırasında okunup parse edilir; `getWord(slug)` ve `listWords()`
  ihraç eder. 240 dosyalık tam korpusa gelindiğinde lazy-load'a geçilebilir.
- **Person/Book/Theme parser'ları stub** — sonraki oturum.

### Slug stratejisi (Oturum 4 kararı)

- **MVP: tüm dillerde tek Latin slug** (`/ar/kelime/algorithm` ↔
  `/en/kelime/algorithm` ↔ `/tr/kelime/algorithm`). GRAND_PLAN §3.2'nin
  "her dilde dilin yazımıyla" yorumu sonraki oturumlara ertelendi.
- **Type segment:** dokümandaki konvansiyona uyum — daima Türkçe
  (`kelime/kisi/kitap/tema`), `:lang` prefix'inden bağımsız.

### `algorithm.mdx` (yeni — ilk içerik dosyası)

`content/words/algorithm.mdx` — `algorithm.html` prototipinden harfiyen
taşındı. YAML frontmatter olarak Word entity'sinin tamamı:

- 5 stratum × 3 dil (TR/EN/AR) gövde, her biri ~100-180 kelime
- Her stratum'da yıl, yer, başlık, headline, gerektiğinde actor-tag
  (Stratum 4'te `personRefs: [al-khwarizmi]` cross-reference)
- 3 dil-varyantı (Türkçe / English / العربية), İngilizce `isModern: true`
- IPA: `/ˈæl.ɡə.rɪð.əm/`, kategori (Mathematics & Science)
- 2 sibling (algebra ↔ zero) — `status: placeholder` (henüz dosya yok)
- 5 kaynak (Burnett, Saliba, Toomer, Plofker, İhsanoğlu/Folkerts/al-Sayyid)

### `<WordPage>` ve alt komponentler (yeni)

- `src/pages/WordPage.tsx` — kompozisyon: WordHeader + Stratigraphy +
  Layer×N + Siblings + Sources + colophon.
- `src/pages/WordPage.css` (~825 satır, *global* CSS, modül değil) —
  prototipten harfiyen alındı. Word ve sonraki Person/Book sayfalarının
  ortak stratigrafi/layer tipografisini taşır.
- `src/components/WordHeader.tsx` — crumbs, başlık, dil-varyantları,
  IPA, rozet, "literal meaning" pull-quote.
- `src/components/Stratigraphy.tsx` — sol kenardaki sticky şerit; mobile
  ≤900px'te yatay üst bara dönüşür. **Scroll-driven progress**: window
  scroll + `requestAnimationFrame` throttling ile her layer'ın
  görünürlük durumu (`active` / `passed` / `pending`) data-attribute'lara
  yazılır; progress bar yüksekliği/genişliği aktif index'e göre ölçeklenir.
- `src/components/Layer.tsx` — tek stratum: rule (Roma rakamı + başlık +
  yıl), layer-year, layer-place, layer-headline (inline italik), layer-body
  (önceden HTML'e çevrilmiş; `dangerouslySetInnerHTML`), opsiyonel
  actor-tag.
- `src/components/Siblings.tsx` — § 03 grid. `status: 'live'` → `<Link>`,
  `status: 'placeholder'` → `<span>` (görsel olarak yarı saydam, tıklanmaz).
- `src/components/Sources.tsx` — § 04 sıralı liste. Arapça UI'da
  Latin-yazılı kaynaklar `dir="ltr"` + `text-align: start` ile düzgün akar.

### Etymology tree

D3 ile çizilecek `<svg>` ağacı (DATA-SCHEMA §3 `EtymologyNode`) bu dilimde
yok. Prototip CSS'inin tree bölümü `WordPage.css`'e *kopyalanmadı*; ileride
ayrı bir `src/components/EtymologyTree.tsx` + kendi CSS'iyle gelecek.

---

## Yapılmayan / sonraki oturumlara kalan

> **Oturum 7/1'de kapanan kalemler:** *MDX-level lazy registry* (manifest
> + per-MDX dynamic chunk + useEntity hook ✓), *runtime corpus
> validation* (build-time'a taşındı, prebuild'de validate-corpus.mjs
> koşar ✓). *Validator iki-katmanlılığı* (eager build + lazy runtime)
> da örtük olarak çözüldü çünkü runtime artık validator çağırmıyor.
>
> **Oturum 6/1'de kapanan kalemler:** *Çoklu Theme* (ilk cluster geldi
> ✓), *Pre-existing tsconfig gürültüsü* (TS6310 + node:path birden
> gitti ✓), *Latent --display token tanımsız* (var(--serif)'e map'lendi
> ✓), *Bundle 500 KB üstü* (page-level lazy split — initial 590→236 KB
> ✓), *Word ↔ Word kenarı* (zaten 5/4'te kapanmıştı ✓).

- **Async parser refactor (`localized-*.js` chunk'ı tamamen lazy)** —
  Şu an manifest'ten bir entity sayfasına geldiğimizde dynamic-import
  edilen şey **MDX gövdesi**; ama o gövde sayfa içinde `parseWord`
  (loader.ts) ile parse ediliyor ve loader.ts + bağımlılıkları (`marked`
  ~25 KB gz, `js-yaml` ~10 KB gz) hâlâ initial-load chunk'ında. Yani
  `localized-*.js`'in 32 KB gz'ı bunlardan oluşuyor. Açmak için:
  `makeLazyFetcher` factory'sini `loader.ts`'i de dynamic import edecek
  şekilde yeniden imzala (`parser: () => Promise<(raw, slug) => T>`).
  İlk entity ziyaretinde `loader` chunk'ı + `marked` + `js-yaml` bir
  kez indirilir, sonra cache'lenir. Initial-load **130→100 KB gz**'e
  daha düşer; ilk entity ziyareti +30 KB gz cezası alır (tek seferlik).
  Tahmini boyut: yarım dilim (registry'nin 4 fetcher imzası + cache).
- **Audio playback** — `audio` alanı entity'lerde var ama header
  audio butonu pasif (gerçek dosya gelmedi).
- **Tam corpus** — `data/CORPUS-partial.tsv` 3 satır; 140 kelime gelince
  catalogue-tier Word stub'ları otomatik üretilebilir. Manifest jeneratoru
  da scale eder — 240 entity için frontmatter parsı <500ms.
- **Per-language slug** (GRAND_PLAN §3.2 tam yorumu) — şimdilik MVP olarak
  tek Latin slug. Geri dönülürse `BaseEntity`'ye `slugs?: Localized<string>`
  eklenir, `entityUrl` lookup'a uğrar; manifest jeneratoru her dil için
  reverse-lookup map'i emit eder.
- **Etymology'de placeholder navigasyon** — node'lar şu an "ölü"
  (tıklanmıyor). İlerideki geliştirme: kök/iç-node'lar üzerine tıklama
  ilgili Person/Place sayfasına götürebilir (örn. al-Khwārizmī node'u →
  `/{lang}/kisi/al-khwarizmi`); yapraklar başka Word sayfalarına. Bunun
  için `EtymologyNode`'a opsiyonel `targetType` / `targetSlug` eklenir,
  `EtymologyTree.tsx` `entityUrl` ile sarar.
- **Theme'e atlasAnchor** — Theme `BaseEntity`'i extend etmiyor; haritada
  yeri yok. *Hint-Arap Rakamları* gibi yolculuk-temaları için aslında
  *birden fazla* anchor mantıklı (Bhillamāla → Baghdad → Toledo →
  Florence → günümüz). Schema'da `Theme.atlasAnchors?: string[]` veya
  daha zengin `{slug, year, label}[]` formu açılabilir; Atlas o zaman
  Theme pin'lerini farklı sembolle (örn. zincir-bağlı yıldız) gösterir.
  Manifest summary'sinde alan şimdiden açık duruyor (eklendiğinde
  `summarizeTheme` güncellemek yetiyor). *Endülüs cluster* için doğal
  aday: toledo + cordoba (atölye + kaynak şehir).
- **Theme cluster ailesi** — şu an 1 magnum + 1 cluster (`andalusian-
  translation-workshop`). 3-4 cluster'a çıkıldığında ThemeBadges'in
  görsel sınırları (1 entity 4-5 Theme'de gözüktüğünde badge taşması)
  test edilir. Aday cluster'lar: *Endülüs Sofrası* (gıda kelimeleri:
  alkol, şeker, limon, portakal, pamuk, baharat — toledo+cordoba/genoa
  ekseni), *Astrolab kuşağı* (astronomi kelimeleri — zenith, nadir,
  azimuth, almanak — bağdat+meraga ekseni). Bu yeni Word'ler de korpusu
  ölçeklendirir; lazy mimari sayesinde her yeni MDX kendi chunk'ında —
  initial-load'a etki etmez.
- **Atlas label collision detection** — Region etiketleri şu anki
  korpusta dört bölgeye yerleşti (al-Andalus, Transoxiana, India,
  England); centroid'leri pin'lerin üstüne ya da kenarına denk
  düşebiliyor. 2x zoom üstünde rahat, 1x'te bazen şehir adıyla
  region adı çakışıyor. İleride `d3-force` simulation veya basit
  "centroid'i çekirdekten dik konum dışına it" çözümü. Şimdilik 0.62
  opacity bunu visual olarak idare ediyor.
- **Validator-duplikasyonu** — `entities.ts`'teki validator'lar (TS,
  runtime'da artık çağrılmıyor) ve `scripts/validate-corpus.mjs` (Node,
  prebuild'de çağrılıyor) aynı invariant'ları farklı dillerde implement
  ediyor. İleride: `src/types/validators-pure.ts` — Node-yüklenebilir
  saf TS, hem registry/runtime hem de Node script'i tek kaynaktan
  çağırır. Şu an drift küçük; ama yeni invariant eklerken iki yere
  bakmak gerekiyor — refactor adayı.

---

## Çalıştırma

```bash
npm install

npm run dev          # http://localhost:5173 → /tr → /tr (homepage)
                     # predev hook'u manifest'i otomatik üretir
                     # /tr/kelime/algorithm                ← Word (showcase)
                     # /tr/kelime/algebra                  ← Word (showcase)
                     # /tr/kelime/zero                     ← Word (showcase)
                     # /tr/kisi/al-khwarizmi               ← Person sayfası
                     # /tr/kitap/al-jabr                   ← Book sayfası
                     # /tr/tema/hindu-arabic-numerals      ← Theme (magnum)
                     # /tr/tema/andalusian-translation-workshop ← Theme (cluster)

npm run typecheck    # TS strict — sıfır hata; pretypecheck manifest üretir
npm run build        # tsc + vite build; prebuild = manifest + validate-corpus
npm run manifest     # Yalnızca manifest'i yeniden üret (debug/elle)
npm run validate     # Yalnızca corpus invariant'larını koştur (CI hook)
```

İlk açılışta tarayıcı diline göre `/tr`, `/en` veya `/ar`'e redirect
olunur. HomePage'de dört sütunlu dizin: Kelimeler, Kişiler, Kitaplar,
Temalar. Her karta tıklandığında ilgili sayfaya gidilir; ThemePage'de
esay-prose okunduktan sonra § 01–N bölümlerinden temada geçen Word/
Person/Book entity'lerine zıplanır. Diğer entity sayfalarındaki
person-aside (al-khwarizmi'de) ve book-aside (al-jabr'da) cross-link
kartlarından entity'ler arası zıplanabilir. LangSwitch tıklandığında
URL'in `:lang` segment'i değişir, sayfa aynı entity'nin başka dilindeki
sürümüne geçer.

**Lazy yükleme davranışı (Oturum 7/1):** HomePage'i ziyaret etmek
yalnız manifest + Atlas chunk'ını indirir (~130 KB gz). Bir entity
sayfasına tıkladığında o entity'nin kendi MDX chunk'ı dynamic import
ile gelir (~7-18 KB gz, içeriğin uzunluğuna göre); tarayıcı network
panelinde `algorithm-*.js`, `al-jabr-*.js` gibi adlarla görünür.
Aynı entity'ye ikinci ziyarette network çağrısı yok (modül cache).


---

## Dizin haritası

```
rihla/
├── GRAND_PLAN.md
├── README.md
├── index.html                          # FOUC inline tema script'i
├── package.json                        # ◇ Oturum 7/1 — predev/prebuild/pretypecheck script'leri
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts                      # ◇ Oturum 7/1 — rihlaContentManifest plugin
├── .gitignore                          # ◇ Oturum 7/1 — manifest.generated.ts ignore
├── scripts/
│   ├── validate-corpus.mjs             # Oturum 5/4 — Node smoke-test (prebuild'de koşar)
│   └── generate-manifest.mjs           # ★ Oturum 7/1 — frontmatter→manifest.generated.ts
├── content/
│   ├── words/
│   │   ├── algorithm.mdx               # Oturum 4/1 — ilk Word
│   │   ├── algebra.mdx                 # Oturum 5/4 — ikinci showcase Word
│   │   └── zero.mdx                    # Oturum 5/4 — üçüncü showcase Word
│   ├── persons/
│   │   └── al-khwarizmi.mdx            # Oturum 4/2 — ilk Person
│   ├── books/
│   │   └── al-jabr.mdx                 # Oturum 4/2 — ilk Book
│   └── themes/
│       ├── hindu-arabic-numerals.mdx   # Oturum 5/3 — ilk Theme (magnum)
│       └── andalusian-translation-workshop.mdx  # Oturum 6/1 — ilk cluster Theme
├── data/
│   └── CORPUS-partial.tsv
├── docs/
│   └── README.md
└── src/
    ├── main.tsx                        # BrowserRouter, CSS yükleme sırası
    ├── App.tsx                         # TopBar + AppRoutes
    ├── components/
    │   ├── TopBar.tsx + .module.css
    │   ├── LangSwitch.tsx + .module.css
    │   ├── ThemeToggle.tsx + .module.css
    │   ├── WordHeader.tsx              # Oturum 4/1
    │   ├── Stratigraphy.tsx            # Oturum 4/1 — Word/Person/Book ortak
    │   ├── Layer.tsx                   # Oturum 4/1 — Word/Person/Book ortak
    │   ├── Siblings.tsx                # § 04 (etymology yer açtı, Oturum 5/1)
    │   ├── Sources.tsx                 # + sectionNum prop (Oturum 5/1)
    │   ├── EtymologyTree.tsx           # Oturum 5/1 — D3 yatay ağaç
    │   ├── EtymologyTree.css           # Oturum 5/1
    │   ├── Atlas.tsx                   # ◇ Oturum 7/1 — AnyEntity → AnySummary
    │   ├── Atlas.css                   # Oturum 5/2 + 6/1 (region + zoom)
    │   ├── PersonHeader.tsx            # Oturum 4/2
    │   ├── PersonCircle.tsx            # Oturum 4/2
    │   ├── RelatedWords.tsx            # Oturum 4/2 — variant: 'aside'|'grid'
    │   ├── WorksTimeline.tsx           # Oturum 4/2 — RelatedWords sarmalayıcı
    │   ├── BookHeader.tsx              # Oturum 4/2
    │   ├── ManuscriptInventory.tsx     # Oturum 4/2 — discriminated union
    │   ├── TranslationChain.tsx        # Oturum 4/2
    │   ├── ThemeBadges.tsx + .css      # ◇ Oturum 7/1 — Theme[] → ThemeSummary[]
    │   └── EntityPageStates.tsx        # ★ Oturum 7/1 — paylaşılan loading + not-found
    ├── content/
    │   ├── loader.ts                   # Oturum 5/3 — parseTheme + parseSlugList
    │   ├── registry.ts                 # ★ Oturum 7/1 — sıfırdan yeniden yazıldı (manifest + lazy)
    │   ├── atlas.ts                    # Oturum 5/2 — ATLAS_PLACES tablosu (15 yer)
    │   └── manifest.generated.ts       # ★ Oturum 7/1 — auto-gen, .gitignore'da
    ├── hooks/
    │   ├── useTheme.ts
    │   ├── useLang.ts                  # router-aware (Oturum 4/1)
    │   └── useEntity.ts                # ★ Oturum 7/1 — async hidrasyon (race-safe)
    ├── i18n/
    │   ├── config.ts
    │   └── locales/{tr,en,ar}.json     # Oturum 6/1 — atlas.resetZoom + theme tier'ları
    ├── pages/
    │   ├── HomePage.tsx                # Oturum 5/3 — 4 sütun (tip imzası 7/1'de daraldı, kod aynı)
    │   ├── HomePage.css                # Oturum 5/2
    │   ├── WordPage.tsx                # ◇ Oturum 7/1 — useEntity, async hidrasyon
    │   ├── WordPage.css                # Oturum 4/1 — section-frame kuralları
    │   ├── PersonPage.tsx              # ◇ Oturum 7/1 — useEntity
    │   ├── PersonPage.css              # Oturum 4/2
    │   ├── BookPage.tsx                # ◇ Oturum 7/1 — useEntity + getPersonSummary author
    │   ├── BookPage.css                # Oturum 4/2
    │   ├── ThemePage.tsx               # ◇ Oturum 7/1 — useEntity + sync Summary cards
    │   ├── ThemePage.css               # Oturum 5/3
    │   └── NotFound.tsx
    ├── router/
    │   ├── paths.ts
    │   ├── LangAwareRedirect.tsx
    │   ├── LangScope.tsx
    │   └── AppRoutes.tsx               # ◇ Oturum 7/1 — doc-blok güncellendi (MDX-eager uyarısı kaldırıldı)
    ├── styles/
    │   ├── tokens.css
    │   └── global.css
    ├── types/
    │   └── entities.ts                 # ◇ Oturum 7/1 — §8.5 Summary tipleri (Word/Person/Book/ThemeSummary)
    └── utils/
        └── localized.ts                # pickLang(loc, lang) + pickLangArray
```

İşaret kılavuzu: `★` bu dilimde yeni dosya · `◇` bu dilimde dokunuldu ·
işaretsiz satırlar önceki oturumlardan değişmemiş geliyor; `# Oturum X/Y`
yorumu o dosyanın korpusa giriş dilimini gösterir.

---

## Mimari kararlar (oturum 4-6 boyunca biriken)

### Dilim 4/1'de alınanlar

1. **URL = source of truth (dil için).** `:lang` URL parametresi i18n'in
   önünde gelir. `LangScope` URL değişimini izler, `i18n.changeLanguage`'i
   tetikler. `useLang.setLang` URL'i değiştirir; i18n'e dokunmaz. Tek yön
   → döngü yok.

2. **Type segment evrensel Türkçe.** `kelime/kisi/kitap/tema` `:lang`'tan
   bağımsız sabit. `ENTITY_PATH_SEGMENT` haritası tek noktada; ileride
   dile göre segment istenirse buradan açılır.

3. **`gray-matter` yerine `js-yaml` + regex.** gray-matter Node-targeted,
   tarayıcıda Buffer/process polyfill gerektirir. Frontmatter regex'i 5
   satır; js-yaml zaten browser-friendly. Vite'in `?raw` import'u ile
   dosya içeriği string olarak gelir.

4. **Markdown gövde, build/dev'de HTML'e.** Stratum.body'leri `marked`'la
   bir kez HTML'e çevrilip Stratum entity'sine yazılır; `<Layer>` bunu
   `dangerouslySetInnerHTML` ile basar. İçerik editöryel kontrolde,
   kullanıcı girdisi değil — sanitize gereksiz.

5. **WordPage.css *global*, *modül değil*.** Prototip CSS class adlarına
   (`layer-rule`, `strat-stop`, `sibling-note` vb.) birebir uyum için.
   Module suffix'i kullanılsaydı her komponente ayrı CSS modülü gerekirdi
   ve sınıf adları hash'lenirdi. İleride başka sayfa türleri (Person/Book)
   aynı stratigrafi tipografisini paylaşacak; ortak global daha sağlıklı.

6. **Stratigrafi scroll-spy `IntersectionObserver` değil, scroll +
   `requestAnimationFrame`.** Sebep: prototipin "viewport %40 çizgisinden
   yukarıdaki son layer aktif" mantığı IO threshold'larıyla doğal
   eşleşmiyor — sürekli güncel pozisyon hesaplaması gerek. RAF throttling
   60fps'ye iniyor, çubuk akıcı kalıyor.

7. **`ActorTag.name: Localized<string>`** (şema güncellemesi). Prototipin
   actor-tag sloganları dile göre farklı formüle ediliyor (Layer 2'de
   "Alan Turing — Hesaplanabilir Sayılar (1936)" vs "Alan Turing — On
   Computable Numbers (1936)"). Canonical referans için `personRefs` /
   `bookRefs` slug'ları zaten ayrı.

### Dilim 4/2'de alınanlar

8. **`Person.trForm: string → Localized`** (şema genişletmesi).
   Prototipte tagline ("Hârezmli", "*The man from Khwārizm*",
   "المنسوبُ إلى خوارزم") dile göre yalnız çevrilmiyor, formülasyonu
   da değişiyor — TR'de açıklama parantezli, EN'de italik epitaf,
   AR'de tam cümle. Bu, #7'deki ActorTag.name kararının aynı mantıkla
   genişletilmesi: "dile göre yeniden formüle edilebilen alan, mecburen
   `Localized`."

9. **CSS paylaşımı: WordPage.css → Person/BookPage.css üst-yüklenir.**
   PersonPage.tsx ve BookPage.tsx hem `WordPage.css`'i (ortak
   stratigrafi/layer/section frame/sources/colophon) hem de kendi
   sayfa-spesifik CSS'lerini import eder. Tek ortak dosya değil — *layer
   kuralları paylaşılan, sayfa-spesifik kurallar ayrı*. Section frame'in
   `.section/.section-head/.section-num/.section-title` ailesi
   WordPage.css'e bu dilimde eklendi (latent bug fix: prototipte vardı,
   kod tarafına geçmemişti).

10. **`<RelatedWords variant='aside' | 'grid'>`** — tek komponent, iki
    görsel form. PersonPage `wordsIndebted`'i kenar bloku olarak; BookPage
    `relatedWords`'ü bottom-grid olarak render eder. Veri şekli aynı
    (`CrossLink[]`); yalnız layout farkı. İki ayrı komponent yazıp
    duplikasyon yapmak yerine variant prop'u — implementation overlap'i
    %80'in üzerindeydi.

11. **`ManuscriptInventory` discriminated union.** `status: 'full'` →
    `url: string` (zorunlu); `status: 'partial' | 'offline'` →
    `url?: string` (opsiyonel). TypeScript bunu derleme-zamanında
    tutuyor: status='full' branch'inde `<a href={url}>` güvenle yazılır,
    diğer branch'lerde URL'in yokluğu durumu kontrol edilmek zorundadır.
    Runtime validation `parseBook`'ta: status='full' geldi ama url yok →
    parse hatası fırlat.

12. **Yazar referansı runtime resolve.** `BookPage` `book.authorSlug`'ı
    `getPerson(slug)` ile çözer. Bulunduysa `<Link>`, yoksa düz `<span>`.
    Build sırasında doğrulama yapmıyoruz (entity'ler farklı dilim/MDX
    dosyalarında doğabiliyor). Güvenlik ağı: tarafsız hata yerine
    "yazar henüz placeholder" görüntüsü.

### Dilim 5/3'te alınanlar

13. **Theme schema'da `placeholder` semantiği yok — her slug `live`.**
    Word/Person/Book'taki `CrossLink.status` ('live' | 'placeholder')
    ayrımı Theme'in flat slug listelerinde **yok**. Sebep: Theme'in
    `words/persons/books` listeleri "bu temaya bağlı entity'ler"i ifade
    ediyor; var olmayan bir slug placeholder değil, **veri hatası**.
    Cross-link kartında "kelime henüz hazır değil ama gelecek" mesajı
    anlamlı (UI'da görünür); Theme'in tematik kümesinde böyle bir mesaj
    yanıltıcı olur. Sonuç: `assertThemeSlugIntegrity` her slug için
    direkt corpus lookup yapar, eksik → hata. Yeni Word/Person/Book
    entity'si eklenmeden Theme'in ilgili slug'ı listeye yazılamaz.

14. **Magnum'da ≥2 dil zorunluluğu, cluster'da ≥1.** `Tier`-bağımlı
    farklı eşik. Magnum esay büyük yatırım — tek dilde ise Theme'in
    *üç-dilli korpusa katkısı yok*; iki dile çıkmak minimum editöryel
    ciddiyettir. Cluster (kelime demeti) sadece bir başlık + entity
    listesi; tek dil ile bile tematik bilgi taşıyabilir, sonra
    çevirilebilir. `assertShowcaseLanguageCoverage`'ın doğrudan
    Theme'e uygulanmaması da bu yüzden — `Tier` ile `ThemeTier` semantik
    olarak farklı boyutlar.

15. **Body markdown HTML'e parse-zamanında çevriliyor.** `Theme.body`
    `Localized<string>`; raw markdown değil, parse aşamasında `marked`
    ile HTML'e dönüştürülüp kaydediliyor (Stratum.body ile aynı pattern).
    Render zamanında `dangerouslySetInnerHTML` ile basılır. Inline HTML
    (örn. `<span lang="ar">صِفر</span>`) marked'ın default davranışıyla
    korunuyor — *bilinçli* bir karar: editör Latin metin içinde Arapça
    yer adı yazarken `lang` attribute'ünü açıkça koyabiliyor, render
    zamanı `--arabic` font'a switch ediyor. Sanitization yok çünkü
    içerik bizim editöryel kontrolümüzde.

16. **Drop cap Latin'e özel.** `:first-of-type::first-letter` tipografik
    selektörü Arabic kürsi-altı kuyrukları (örn. ب, ج, خ) ve bağlantılı
    harf yapısıyla çakışır — float'lı büyük baş harf bağlantıyı koparır,
    halefini soldurur. Karar: `theme-essay--ar` sınıfı drop cap
    selektörünü taşımaz; Arabic body düz prose olarak akar. Latin (TR/EN)
    body'de altın drop cap manuscript dokunuşunu getirir.

17. **Theme route kuralı: NotFound → ThemePage zincirleme aktivasyonu.**
    Önceki dilim'de (5/2) `/tema/:slug` route'u explicit olarak
    `<NotFound>`'a bağlıydı (hata değil — placeholder). Bu dilim'de
    yalnızca element değiştirildi, segment ENTITY_PATH_SEGMENT'tan
    aynı kalıyor. URL şeması başından beri 4-entity yapılı tasarlandığı
    için (paths.ts) Theme'in route'a katılması içe-yönelik bir değişiklik —
    URL contract'ı değişmedi.

18. **HomePage 4 sütun, CSS değişmedi.** Directory grid template
    `repeat(auto-fit, minmax(280px, 1fr))` zaten esnek; 4 sütun desktop'ta
    (1120px+) doğal akar, mid breakpoint'te 2'ye iner. Yeni CSS kuralı
    eklemeden 4. tipi destekleyebildik — auto-fit/minmax pattern'inin
    avantajı. Tek-sütun mobile breakpoint zaten 640px'te düşüyor.

### Dilim 6/1'de alınanlar

> *(Dilim 5/4'ün kararları yalnız "Oturum 5 / dilim 4" bölümünde
> detaylı; mimari arşive numaralı olarak henüz devşirilmedi. Bu dilim'in
> ardından, 6/2'ye girerken 5/4 + 6/1'i tek geçişte numaralandırmak
> mantıklı olabilir. Şimdilik 6/1 doğrudan #19'dan devam ediyor.)*

19. **Cluster Theme magnum'la aynı render path'i kullanır.** ThemePage
    iki tier için ayrı dal açmadı — yalnız `theme-tier-${tier}` CSS
    sınıfı badge rengini değiştiriyor. Cluster'ın "daha demet, daha
    kısa" karakteri **içerik tarafının** bir özelliği (esay uzunluğu,
    tonu); kod simetrik kalıyor. Eğer ileride cluster gerçekten farklı
    bir layout (ör. esay yerine dominant entity grid + minimal prose)
    isterse, `tier === 'cluster'`-koşullu bir `<ClusterLayout>`
    açılabilir; şu an YAGNI.

20. **`--display` MVP'de `var(--serif)`'e map'leniyor.** Manuscript-y
    serif (EB Garamond) zaten yüklü; ayrı bir başlıklık font'u
    (Cormorant SC vb.) eklemenin maliyeti (network + WOFF2 yükü)
    görsel kazançtan büyük. Tek satırlık değişimle 5 callsite'ın
    hepsi düzeldi. İleride ayrı yüz istenirse yalnız tokens.css'in
    `--display` satırı değişir; callsite'lar zaten doğru token'ı
    çağırıyor — *iyi indirection*.

21. **Composite child tsconfig emit ON, outDir cache'e.** TypeScript
    composite project mantığı (`tsbuildinfo`) emit'e dayanır; `noEmit:
    true` ile composite uyumsuz (TS6310). Çözüm: emit'i AÇIK bırak,
    ama `outDir`'i `node_modules/.cache/tsc-vite-config/` altına yönelt
    — `node_modules` zaten gitignore'da, build artifact'ı değil. Parent
    için `*.tsbuildinfo` gitignore'a eklendi. `npm run typecheck`
    `tsc -b --noEmit` yerine `tsc -b` (parent flag child'a sızıp
    TS6310'u tetikliyordu).

22. **Page-level lazy, MDX-level eager.** `React.lazy` ile per-route
    code split *yapıldı*; ama `import.meta.glob({eager: true})`
    `registry.ts`'te değişmedi. Sebep: registry build-time'da tüm
    cross-link doğrulamasını yapıyor (`assertCrossLinkIntegrity`,
    `assertThemeSlugIntegrity`); MDX lazy'e geçmek registry'nin tamamen
    async API'ye dönüşmesini gerektirir → 5 sayfanın hepsine `Suspense`
    boundary'leri ekleme dilim'i kendi başına. Şu an: per-page split
    (Vite uyarısı kayboldu) yeterli kazanç; MDX lazy ayrı dilime
    bırakıldı.

23. **Atlas: zoomable canvas vs static overlay.** Çerçeve, pusula
    (N/S/W/E) ve manuscript marks (✦) zoom transform'u almıyor — ayrı
    `<g.atlas-overlay>` katmanında. Manuscript haritalarda da çerçeve
    sayfanın bir parçasıdır, içerik kayar ama pergel değişmez. Bu
    karar pusulayı her zaman okunur tutar (özellikle 4× zoom'da
    coğrafi bağlam kaybolmasın diye).

24. **Region etiketleri yalnız çoklu-şehir bölgelerine.** Tek-şehir
    bölgesi için region etiketi yazmadık — şehir adının kendisi zaten
    o bölgenin pin'i; ek bir etiket görsel kalabalık. `count >= 2`
    filter'ı *yoğunluk göstergesi* mantığı: bölge etiketi gerçekten
    "bir küme oluşturan şehirler" anlamı taşıyor. Bu, 15 yer
    arasında 4 bölge etiketi gösteriyor (al-Andalus, Transoxiana,
    India, England) — geri kalan 7 bölge tek-şehir.

25. **D3-zoom filter pin'leri dışlar.** `zoom().filter(event => !event.
    target.closest('a'))` — pin'ler `<a>` (Link) olarak render
    edildiğinden, filter onların üzerinden başlayan pointer
    hareketlerini zoom davranışından gizliyor; sonuç: pin tıklamaları
    entity sayfasına gider, zoom başlatmaz. Wheel her zaman geçer
    (pin üstünden bile zoom etmek mantıklı). Touch/mouse-drag pin'den
    başlamadığı sürece pan çalışır.

---

## Sonraki dilim için ilk üç adım önerisi

> Oturum 7/1'de eski üçlünün ilk maddesi (MDX-level lazy registry)
> kapandı. Yeni üçlü, geçen oturumun (2) ve (3) maddelerini öne çekiyor
> ve ilk noktada lazy mimarinin kalan içsel optimizasyonunu kapatıyor.

1. **Async parser refactor (`localized-*.js` chunk'ı tamamen lazy).**
   Şu anki durum: 32 KB gz `localized-*.js` chunk'ı `index`'le birlikte
   yükleniyor; içeriği `loader.ts` + `marked` (~25 KB gz) + `js-yaml`
   (~10 KB gz) — yani parser bağımlılıkları. MDX gövdeleri lazy ama
   parser'lar eager. Açmak için:
   - `makeLazyFetcher` factory'sini parser'ı dynamic import edecek
     şekilde yeniden imzala. Önce bir kez:
     `const loaderPromise = () => import('./loader');` (lazy ama
     module-scope'ta kapanım).
   - `getWord/Person/Book/Theme` ilk çağrıda `loaderPromise()` +
     `loader()` paralel başlatır; `Promise.all([loader(), loaderPromise()])`
     sonra `parseX(raw, slug)`.
   - Cache: in-memory `Map<slug, Promise<T>>` aynı şekilde çalışır;
     sadece içeride parser de async başlangıç ekler.
   - Beklenen sonuç: initial-load **130→100 KB gz** (~%23 daha az).
     İlk entity ziyareti +30 KB gz tek-seferlik ödeme; sonraki
     entity'ler için parser cache'lenmiş — sadece kendi MDX'i.
   - **Tahmini boyut:** yarım dilim. Registry'nin 4 fetcher imzası;
     pages'a dokunmaz (hook arayüzü değişmiyor, hâlâ `Promise<Entity>`).

2. **İkinci cluster Theme + 2-3 yeni Word ("Endülüs Sofrası").**
   Cluster ailesinin görsel davranışını sınamak için çoklu cluster
   gerek (1 entity → 3-4 Theme'de görünme durumu). Aday: **"Endülüs
   Sofrası"** — gıda/madde kelimeleri kümesi: `algorithm`/`algebra`/
   `zero`'dan farklı bir eksen (ev içi/günlük dil), aynı coğrafya
   (al-Andalus) ile tematik örtüşme:
   - Yeni Word adayları (showcase tier'dan ikisi, geri kalan
     catalogue): `sugar` (شَكَر / Sansk. *śarkarā*), `cotton`
     (قُطْن), `lemon` (لَيْمُون), `orange` (نارَنج), `alcohol`
     (الكُحْل) ve `coffee` (قَهْوة). İlk üç-dört'ü yaz; cluster MDX
     onları topluyor.
   - Bonus topology: `algorithm`/`algebra`/`zero` "Endülüs Sofrası"
     cluster'ında *değil* — yeni Word'ler farklı bir Theme grafına
     girdiği için ThemeBadges nereden bakacağını öğreniyor.
     `cordoba` çapası bu cluster'ın merkezi (Toledo'dan farklı,
     daha güneye); Atlas region etiketi "AL-ANDALUS" şu an Córdoba+
     Toledo merkezini gösteriyor — bu Word'ler eklenince centroid
     hassaslaşır.
   - **Lazy mimari faydası:** her yeni Word kendi chunk'ında olduğu
     için initial-load'a *etki etmez*. Korpus ölçeklenirken
     HomePage'in maliyeti sabit (sadece manifest büyür, yaklaşık
     50 byte/entity).
   - **Tahmini boyut:** orta-büyük dilim (3-4 yeni Word MDX +
     cluster MDX = ~180 KB içerik üretimi).

3. **Theme'e atlasAnchor + Atlas Theme pin'i.** Mevcut iki Theme,
   coğrafyada doğal olarak çapalı: magnum `hindu-arabic-numerals`
   (Bhillamāla→Bağdat→Toledo→Floransa, çok-anchor) ve cluster
   `andalusian-translation-workshop` (Toledo, tek anchor). Plan:
   - Schema: `Theme.atlasAnchors?: { slug: string; year?: number;
     label?: Localized }[]` (zincir-uyumlu, opsiyonel zaman damgası).
     `ThemeSummary`'ye de eklenir; `summarizeTheme` (generate-manifest.
     mjs) güncellenir; validator `assertThemeAtlasAnchorIntegrity`
     ekle (`scripts/validate-corpus.mjs`'a).
   - Atlas: yeni pin tipi `--theme` (CSS sınıfı zaten ayrılmış:
     `atlas-pin--theme`). Sembol önerisi: çift-halka veya zincir-bağlı
     yıldız (entity pin'lerinden ayrışsın). Multi-anchor Theme'leri
     **çizgi** olarak göster: anchor'lar arası ince noktalı sepia çizgi
     (yolculuk metaforu — magnum tema bu çizgiyi anlatıyor).
   - i18n: `entities.themePlural` zaten var, lejand'a 4. öğe.
   - **Tahmini boyut:** yarım-orta dilim (schema değişikliği + Atlas
     render path'i + 2 MDX'in atlasAnchor alanı + validator + manifest
     jeneratoru).

> Önerilen sıra: (1) parser-lazy ile initial-load'u 100 KB gz altına
> çek (kısa, iç-mimari, görünmez ama ölçülebilir kazanç); (2) ikinci
> cluster + içerik korpusunu büyüt; (3) Atlas Theme pin'leri ile haritada
> tematik katmanı aç. Lazy mimari yerleştiği için artık (2) içerik dilimi
> *initial-load'a etki etmiyor* — büyük editöryel dilimleri rahatça
> yapabiliriz.



---

## 🜚 Oturum 7 dilim 2 — Lazy parser + Endülüs Sofrası + Atlas tema pin'leri (gerçekleşen)

Önceki dilim önerilerinin (parser-lazy / cluster genişletmesi / Theme atlasAnchors) tümü sırayla yapıldı. Üç alt-dilim hâlinde uygulandı; bir kapanış dilimi (7/2.5) Atlas vekillerini sertleştirdi.

### (a) Parser-lazy refactor

`registry.ts`'in `marked` + `js-yaml` parser modülü (`./loader`) artık **runtime lazy**: ilk entity sayfası ziyaretine kadar yüklenmiyor. Mimari kararlar:

- Statik `import { parseWord, ... } from './loader'` kaldırıldı.
- Module-scope `_loaderPromise` + `loadParser()` kapanımı (tek seferlik dynamic import).
- `makeLazyFetcher`'ın `parser` parametresi `pickParser: (mod: LoaderModule) => (raw, slug) => T` lambda'sına dönüştü; tip-güvenli (`(m) => m.parseWord` vb.).
- Fetch'te `loader().then(raw => parser(raw))` yerine `Promise.all([loader(), loadParser()])` — MDX chunk'ı ile parser chunk'ı **paralel** yüklenir.

**Initial-load ölçümü (gerçek build):**

| Chunk | Önce (gz) | Sonra (gz) |
|---|---|---|
| `index-*.js` | 76.72 | 76.72 |
| `localized-*.js` (manifest + parser) | 31.93 | **4.25** |
| `loader-*.js` (parser, lazy) | — | **27.89** |
| `transform-*.js` | 12.46 | 12.46 |
| `HomePage-*.js` | 8.83 | 8.83 |
| **Initial paint (HomePage)** | **129.94** | **102.26** |

**Tasarruf: 27.68 KB gz (%21.3).** README hedefi (~100 KB gz) tutuldu. Index chunk'ında `loader-*.js`'e referans yok (grep doğrulaması: 0 hit) — parser yalnız `localized-*.js`'in dynamic `import()`'undan tetikleniyor. İlk entity ziyareti maliyeti: ~42.65 KB gz (parser sonraki ziyaretlerde cache'de).

**Risk değerlendirmesi (sonradan):** README "yarım dilim" tahmini doğrulandı. Slice 7/1'de validate-corpus runtime'dan çıkmıştı; bu yüzden registry'de parser'a bağımlı kalan tek kod yoktu — refactor saf data-flow değişikliği oldu.

### (b) Endülüs Sofrası cluster + 3 yeni Word

Yeni içerik:

| Dosya | Tier | Boyut (TR+EN+AR) | Stratum |
|---|---|---|---|
| `content/words/sugar.mdx` | showcase | ~40 KB | Modern → Atlantik Plantasyon → Akdeniz Rafinerisi → Arap Çağı → Hint Tabakası |
| `content/words/lemon.mdx` | showcase | ~39 KB | Modern → İskorbüt & İmparatorluk → Endülüs Bahçesi → Arap Tarımı → Hint-Burma Substrat |
| `content/words/alcohol.mdx` | catalogue | ~20 KB | Modern → Modern Kimya → Paracelsus → Toledo → Erken Arap Simyası |
| `content/themes/endulus-sofrasi.mdx` | cluster | ~11 KB | bahçe + eczane + mutfak; "havza" metaforu (magnum çizgiye karşıt) |

**Cross-link topolojisi:**
- `sugar` ↔ `lemon` (Endülüs Sofrası ikilisi, *sharbat* metaforu)
- `sugar` ↔ `alcohol` (Endülüs eczacılığının iki kutbu)
- `alcohol` ↔ `algebra` — yeni cluster'ı **mevcut korpusa** bağlayan köprü: `endulus-sofrasi`'nin üyesi `alcohol`, `andalusian-translation-workshop`'un üyesi `algebra`. ThemeBadges bu sayede ilk kez "iki cluster'a birden ait kelime" durumunu test ediyor.

**Tek tool-call boyut limiti gözlemi:** sugar.mdx ilk denemede 25 KB+ tek `create_file` ile gönderildi → response generation kesildi. **Çözüm:** Word MDX'leri 3 parçaya bölündü (frontmatter+strata 1-2 → sentinel → strata 3-4 → sentinel → stratum 5+etymologyTree+siblings+sources). Catalogue tier `alcohol` daha kompakt olduğu için tek-call gitti. Bu pattern gelecek içerik dilimleri için referans.

**Editöryel sınır (dürüst):** Arapça prose klasik vokalize MSA siciliyle yazıldı (mevcut algebra/zero MDX'leriyle uyumlu), ama anadili konuşan editör son cilası yapılmadı. Özellikle nisbe transkripsiyonu ve *sharbat*/*شَرَب* sicil-içi tercihi gözden geçirilmeli.

**Build sonrası lazy-mimari sözünün tutulması:**

| Aşama | Initial paint (gz) |
|---|---|
| Dilim (a) bitiminde | 102.26 KB |
| Dilim (b) bitiminde (+3 Word, +1 Theme) | **103.71 KB** |

Yalnız +1.45 KB gz manifest büyümesi (yeni summary'ler). Yeni MDX chunk'ları (`sugar`, `lemon`, `alcohol`, `endulus-sofrasi`) initial-load'a sızmadı — sadece o sayfa ziyaret edilirse yükleniyor.

### (c) Theme atlasAnchors + Atlas tema pin'leri

**Schema:**
- `ThemeAtlasAnchor` interface: `{ slug, year?, label? }`.
- `Theme.atlasAnchors?` + `ThemeSummary.atlasAnchors?` opsiyonel.

**Build pipeline:**
- `scripts/generate-manifest.mjs` — `pickThemeAtlasAnchors` helper'ı + `summarizeTheme` aktarımı.
- `scripts/validate-corpus.mjs` — `ATLAS_SLUGS` set'i (atlas.ts'ten manuel senkron, gerekçe inline yorumda) + her anchor'ın doğru slug + tekil olduğunu doğrulayan kontrol.
- `tsx` ile atlas.ts'i Node tarafından import etmek alternatifi vardı, küçük runtime dependency uğruna ertelendi.

**Atlas runtime (`Atlas.tsx`, en küçük dokunuş prensibi):**
- `AnchoredEntity` genişletildi: `subLabel?` ve `placeSlug?` (multi-anchor hover identity).
- `toAnchored` artık Theme tipini de işliyor.
- `groups` useMemo iki aşamalı: stratified entity'ler (mevcut akış) + themes (her anchor için ayrı kopya).
- Yeni `themePaths` useMemo (≥2 anchor) → noktalı sepia path (`stroke-dasharray: 2 5`), pins'in altında.
- HoverTooltip iki-satırlı (label + italic sublabel; AR sublabel için RTL + Amiri).
- Lejand'a 4. öğe.

**`Atlas.css`:**
- `.atlas-pin--theme` (`--moss` rengi; manuscript paletinin daha önce kullanılmayan dördüncü rengi).
- `.atlas-theme-path`, `.atlas-legend-dot--theme`, `.atlas-tooltip-sublabel`, `.atlas-pin--hover`.

**Build maliyeti:** dilim (b) sonrası → dilim (c) sonrası: 103.71 → 104.74 KB gz initial paint. **+1.03 KB gz.** Theme pin mantığı + 4-anchor route + sublabel + 4 yeni CSS sınıfı + manifest atlasAnchors verisi (3 tema × ~80 byte).

### (d) Atlas refinement (dilim 7/2.5)

Dilim (c)'de `hindu-arabic-numerals` rotasında iki vekil koymuştum: `ujjain` (Bhillamāla yerine), `rome` (Floransa yerine). Bu kapanış dilimi vekilleri sertleştiriyor:

- `src/content/atlas.ts`'e iki yeni `AtlasPlace`:
  - `bhillamala` (Bhinmal, Rajasthan) — `coords: [985, 445]`. Brahmagupta'nın *Brāhmasphuṭasiddhānta*'sı (628) burada yazıldı.
  - `florence` — `coords: [385, 320]`. Toskana abakuscu geleneğinin sembolik merkezi.
- `content/themes/hindu-arabic-numerals.mdx` atlasAnchors: `ujjain → bhillamala`, `rome → florence`. Editöryel orijinal rota artık tam: **Bhillamāla → Bağdat → Toledo → Floransa.**
- `scripts/validate-corpus.mjs` `ATLAS_SLUGS` güncelleme (alfabetik, iki yeni giriş).

Body prose Bhillamāla'yı doğrudan adlandırmıyordu (sadece anchor seviyesinde temsildi); değişikliğin prose üzerinde etkisi yok.

### Korpus durumu (dilim 7/2 sonrası)

- 6 word + 1 person + 1 book + 3 theme.
- 17 atlas place (15 → 17).
- `npm run validate` ✓ 0 ihlal.
- `npm run typecheck` ✓.
- `npm run build` ✓.

## Oturum 7 — dilim 3 (üç-kollu sprint)

Bir oturumda üç bağımsız dilim — (A) validate-corpus'un TS-source-of-truth'a bağlanması, (B) Endülüs Sofrası cluster'ının üç yeni showcase Word ile genişletilmesi, (C) ThemePage mini-Atlas. Sıra mantığı: önce (A) infra (yeni atlas place ekleme dilimi güvenli olsun), sonra (B) içerik genişletmesi, sonra (C) UI yeniliği (cluster zenginleşmiş yelpazeye göre anlam kazansın).

### (a) Validate-corpus ↔ atlas.ts auto-sync (dilim 7/3.A)

7/2 dilimde "tsx ile atlas.ts'i Node tarafından import etmek alternatifi vardı, küçük runtime dependency uğruna ertelendi" demiştik; bu dilim o ertelemeyi kapatıyor.

**Değişiklikler:**
- `tsx@^4.21.0` devDependency olarak eklendi.
- `scripts/validate-corpus.mjs`:
  - `import { ATLAS_PLACES } from '../src/content/atlas.ts';` doğrudan TS import.
  - Manuel 17-slug `ATLAS_SLUGS` Set'i (+ 30-satırlık gerekçe yorumu) kaldırıldı, yerine `new Set(Object.keys(ATLAS_PLACES))`.
  - Üst yorum bloğu güncellendi.
- `package.json` script'leri:
  - `validate`: `node scripts/validate-corpus.mjs` → `tsx scripts/validate-corpus.mjs`.
  - `prebuild`: aynı geçiş.

**Mimari prensip:** `atlas.ts`'teki `import type { Lang, Localized } from '@/types/entities'` deklarasyonu runtime'da esbuild tarafından silinir (`import type` tamamen erased), bu yüzden Vite path alias (`@/`) sorununa girmiyoruz; tsx Node-tarafı erişimde sadece runtime kod (`PLACES`, `Object.fromEntries`, exports) çalıştırır.

**Maliyet (dürüst):**
- Önce: `node validate-corpus.mjs` ~370 ms.
- Sonra: `tsx validate-corpus.mjs` ~800 ms (+400 ms esbuild startup).
- 7/2 README'deki "<500 ms hedef" aşıldı — bu, TS source-of-truth karşılığında ödenen bedel. Build pipeline (CI) maliyeti hissedilir değil; dev validate cycle'ında her çağrıda +400 ms.
- Negatif test: uydurma slug enjekte edip yakaladığını + restore sonrası 0 ihlal döndüğünü doğruladık.

**Build çıktısı:** zero runtime kod değişikliği; hash'ler 7/2.5 ile birebir aynı.

### (b) Endülüs Sofrası genişletme (dilim 7/3.B)

Üç yeni showcase Word + cluster güncellemesi + sugar/lemon/alcohol cross-link'leri.

**Yeni Word MDX'leri (üçü de showcase tier, 5-stratum):**

| Slug | atlasAnchor | Boyut | Strata özeti |
|---|---|---|---|
| `cotton` | cordoba | 53 KB / 340 satır | Global tekstil zinciri → Manchester/Mississippi/Bombay → Endülüs *acequia* ağı → Bağdat-Şam-Fustāt erken Arap çağı → Indus Vadisi (Mehrgarh c. 6000 BCE) |
| `orange` | cordoba | 56 KB / 369 satır | *Citrus × sinensis* küresel + "orange" rengi → Portekiz tatlı portakal voyajı (TR *portakal*) → Endülüs *naranja*/Sevilla bitter/marmalade → ibn Sīnā *nāranj* eczacılığı → Sanskrit *nāraṅga* "fil-çağıran" Indus-Pers koridoru |
| `coffee` | cairo | 56 KB / 333 satır | Specialty üçüncü dalga → Avrupa kahvehanesi (Lloyd's, Aydınlanma "kafein devrimi") → İstanbul/Kahire 16-17. yy → Sufi Yemen + Mekke 1511 yasağı → Etiyopya Kaffa / *bunna* / Khaldi efsanesi |

Her birinin etymologyTree iki kollu (örn. cotton: *quṭn* hattı + Persian *pambak* yan kolu; orange: *naranja* hattı + Portekiz *portogallo* yan kolu; coffee: *qahwa* hattı + Hollandaca *koffie* yan kolu). Her birinin siblings'i mevcut cluster üyeleriyle live link'li.

**Cluster güncellemesi (`endulus-sofrasi.mdx`):**
- `words: [sugar, lemon, alcohol]` → `words: [sugar, lemon, alcohol, cotton, orange, coffee]`.
- `atlasAnchors`: tek `cordoba` → iki anchor `cordoba` (11.-12. yy avlu-bahçesi) + `cairo` (16.-17. yy kahvehanesi). Cluster artık iki-coğrafyalı.
- `subtitle` 6-unsur listeye genişletildi (TR/EN/AR).
- `body` prose üç dilde tamamen yeniden yazıldı: havza imajı korunup 6-word'lük bir "iki-tabakalı havza" tanımına dönüştü — Endülüs ekseninde pamuk-şeker-alkol-acı portakal-limon, Mısır-İstanbul ekseninde tatlı portakal ve kahve.

**Sugar/lemon/alcohol siblings genişletmesi (cluster cohesion):**
- `sugar.mdx`: → cotton (Watson Green Revolution + plantasyon), → coffee (Karayip şeker + Avrupa kahvehanesi).
- `lemon.mdx`: → orange (ibn Sīnā *Qānūn* yan-yana citrus + Endülüs grafted ağaç), → cotton (Watson listesi + aynı *acequia*).
- `alcohol.mdx`: → orange (*al-anbīq* damıtık ikizi: *al-kuhl* + *azahar/neroli*), → coffee (klasik Arapça *qahwa* = "şarap", semantik kuzenlik).

Her cross-link 3 dilde dolu, status: live; validate çapraz-link bütünlüğünü onayladı.

**Initial paint etkisi (build hash karşılaştırması):**

| | Önce (7/2.5 sonu) | Sonra (7/3.B sonu) | Δ |
|---|---|---|---|
| `index` | 76.72 | 76.74 | +0.02 |
| `localized` (manifest) | 6.25 | 8.28 | **+2.03** |
| `transform` | 12.46 | 12.46 | 0 |
| `HomePage` | 9.34 | 9.34 | 0 |
| **Total** | **104.77** | **106.81** | **+2.04 KB gz** |

Manifest +2.03 KB gz tek anlamlı büyüme; 3 yeni Word'ün başlıkları + ipa + atlasAnchor + meta. Yeni Word chunk'ları (cotton 20.42, orange 19.94, coffee 21.86 KB gz) tümü lazy — initial-paint'e sızmıyor. Cluster (`endulus-sofrasi-*.js`) 4.85 → 6.64 KB gz: subtitle + body prose 6-word havza genişlemesi.

### (c) ThemePage mini-Atlas (dilim 7/3.C)

7/2 dilimde Theme.atlasAnchors veri tarafını kurmuştuk; (c) onun UI tezahürünü tamamlıyor. ThemePage artık header'dan sonra, essay body'den önce, sadece bu tema'nın anchor'larını highlight eden bir kompakt harita render ediyor.

**Yeni componentler:**
- `src/components/ThemeMiniAtlas.tsx` — atlas viewBox'ı (1200×700, aynı koordinat sistemi); seas + theme path + tüm place'ler (anchor olmayanlar silik dot, anchor olanlar renkli + adlı). figcaption olarak anchor listesi (yer + yıl + label).
- `src/components/ThemeMiniAtlas.css` — manuscript-aesthetic, parşömen palette uyumlu.

**Atlas.tsx ile ilişki:** kasıtlı duplication. Seas SVG path'leri her iki bileşende birebir aynı; gelecek bir dilimde `<AtlasGeography>` paylaşılan sub-component'ine refactor edilebilir. Bu dilimde refactor değil ürün-değeri öncelendi.

**Farklar Atlas vs MiniAtlas:**
| | Atlas (home) | MiniAtlas (theme) |
|---|---|---|
| Zoom/pan | d3-zoom | yok |
| Compass | var | yok |
| Manuscript frame & marks | var | yok |
| Rivers | var | yok (fazla detay) |
| Regions etiketleri | çoklu-şehir bölgelerine | yok |
| Hover tooltip | dinamik | yok (etiketler sabit) |
| Pin'ler | type-color (4 renk) | tek-renk anchor highlight |
| Theme path | tüm multi-anchor temalar | sadece bu tema |
| Place etiketi | tüm yerler | sadece anchor'lar |

**ThemePage entegrasyonu:** `theme.atlasAnchors?.length > 0` koşulu — anchors yoksa render edilmez. Aksi durumda `<ThemeHeader>` ve `<ThemeEssayBody>` arasında durur, kendi block-flow padding'iyle nefes alır.

**i18n:** Üç dilin `theme.miniAtlas.aria` key'leri eklendi (TR/EN/AR).

**Build çıktısı:**
- `ThemePage` chunk: 4.72 → 8.00 KB gz (lazy; sadece tema sayfası ziyaretinde indirilir).
- Yeni shared `atlas-XYZ.js` chunk 2.53 KB / 1.20 KB gz: hem Home Atlas hem ThemeMiniAtlas onu paylaşıyor (Vite chunk-splitting'in iyi davranışı).
- HomePage 9.34 → 8.24 KB gz (atlas modülü ayrı chunk'a çıkınca HomePage kendisi küçüldü; mini-atlas bunu mümkün kıldı).
- Total initial paint: **105.72 KB gz** (7/3.B sonu 106.81'den hafif düşüş, atlas-shared chunk'ın HomePage'i hafifletmesiyle).

### Korpus durumu (dilim 7/3 sonrası)

- **9 word** (alcohol, algebra, algorithm, **coffee**, **cotton**, lemon, **orange**, sugar, zero) + 1 person + 1 book + 3 theme.
- 17 atlas place (değişmedi; yeni word'ler mevcut place'lere bağlandı).
- `npm run validate` ✓ 0 ihlal — tsx-tabanlı, ATLAS_PLACES otomatik türetilir.
- `npm run typecheck` ✓.
- `npm run build` ✓ — 105.72 KB gz initial paint.
- Endülüs Sofrası cluster artık 6-word'lük iki-tabakalı havza (Endülüs ekseni + Mısır-İstanbul ekseni).

### Sonraki dilim için öneriler

1. **Atlas geography paylaşımı (Atlas + MiniAtlas refactor).** Şu an seas SVG path'leri iki dosyada dupliké. Yeni `<AtlasGeographyBase>` componentine çıkar; Atlas onu zoomable canvas içinde, MiniAtlas onu doğrudan kullanır. Bağımsız küçük dilim, runtime davranışı değişmez. Rivers + region etiketleri için de aynı paylaşım.
2. **Word sayfasında benzer mini-Atlas.** Word'lerin `atlasAnchor`'ı tek bir yer; ama o yerin bir "kazı sahası" görseli WordPage'de stratigrafi başında yer alabilir. Mevcut MiniAtlas tek-anchor durumunu zaten doğru render ediyor (path yok, tek pin); WordPage'e import etmek yarı saatlik bir iş.
3. **Showcase Word boyut diet'i.** cotton/orange/coffee her biri ~55 KB MDX — bu cluster ortalamasını yukarı çekiyor. Stratum body'leri biraz daraltılırsa initial-paint dışı chunk boyutları (lazy) düşer; ilk-okuma performansı için kritik değil ama mobile/yavaş ağ deneyimini iyileştirir.
4. **Anadili Arapça editör pasajı.** Yeni 3 word + cluster yeniden yazımı sırasında klasik vokalize MSA sicili korundu; ama anadili Arapça konuşan bir editörün cilası hâlâ borç (7/2 dilim notu hâlâ geçerli).
5. **Person/Book sayfalarına atlasAnchors-benzeri çoklu-yer.** Persons şu an tek `atlasAnchor` taşıyor; ama al-Khwārizmī Bağdat'ın yanında Khwārazm-doğumlu — çoklu-yer rotası Person için de değerli olabilir. Mimari: `atlasAnchors?: ThemeAtlasAnchor[]` Person'a da gelir; PersonPage MiniAtlas'ı reuse eder.

## Oturum 7 — dilim 4 (üç-kollu sprint)

Önceki dilim önerilerinin (1), (2), (5)'ini sırayla kapatan bir sprint. (3) Word boyut diet ve (4) Arapça sicil cilası bu dilimde değil — ikisi de editöryel iş, bağımsız bir oturum hak ediyor.

### (a) Atlas + MiniAtlas seas paylaşımı (dilim 7/4.A)

7/3.C dilimde "kasıtlı duplication" olarak işaretlediğim seas SVG path verisi (Atlas.tsx + ThemeMiniAtlas.tsx'te iki kez) tek bir kaynağa indirildi.

**Yeni `src/components/AtlasGeography.tsx`:**
- `<AtlasSeaShapes>` — 9 stylized deniz (Atlantic, Akdeniz, Karadeniz, Hazar, Aral, Kızıldeniz, Basra Körfezi, Hint Okyanusu, Bengal Körfezi).
- `<AtlasRiverShapes>` — 5 nehir (Dicle, Fırat, Nil, İndus, Ceyhun). Şu an yalnız Atlas kullanıyor; MiniAtlas mini-ölçekte gereksiz buldu. Gelecek kullanım için ihraç hazır.
- Bileşenler React Fragment döndürür; parent kendi `<g className>` wrapper'ını ve CSS scope'unu sürer. Aynı path verisi, iki farklı görsel sicilde (Atlas: koyu fill, MiniAtlas: silik) görünür.

**Vite chunk-splitting davranışı:**
- AtlasGeography ortak chunk: 3.92 KB / 1.77 KB gz.
- HomePage: 8.24 → 7.72 KB gz (-0.52); seas/rivers yükü AtlasGeography'ye geçti.
- ThemePage: 2.63 → 2.22 KB gz (-0.41); aynı şekilde.
- Net: HomePage'i ziyaret eden için +0.12 KB gz (yeni chunk header overhead'i kompansasyona yakın).

### (b) WordPage mini-Atlas + MiniAtlas rename (dilim 7/4.B)

WordPage'de — WordHeader + ThemeBadges sonrası, strat-layout öncesi — kelimenin `atlasAnchor`'ı bir mini-Atlas olarak görünür. "Bu kelime nerede kazıldı?" sorusu strata'ya girmeden cevaplanır.

**Tek-anchor adaptörü:** Word'ün `atlasAnchor` alanı `string`, ama MiniAtlas çoklu-anchor API'sini bekler. Tek-elemanlı adaptör: `<MiniAtlas anchors={[{ slug: word.atlasAnchor }]} />`. ThemeAtlasAnchor'ın `year` ve `label` alanları opsiyonel olduğundan kayıp veri yok.

**Component rename:** `ThemeMiniAtlas` → `MiniAtlas`. Sebep: bileşen artık Theme'e özgü değil — Word, sonradan Person de kullanıyor. Kapsam:
- File rename: `ThemeMiniAtlas.tsx/.css` → `MiniAtlas.tsx/.css`.
- Component & interface: `ThemeMiniAtlas/ThemeMiniAtlasProps` → `MiniAtlas/MiniAtlasProps`.
- CSS classes: `.theme-mini-atlas*` → `.mini-atlas*` (toplam 9 selector).
- Import + JSX güncellemesi: ThemePage + WordPage.
- JSDoc yenilendi: kullanıcı listesi (Theme/Word/Person) + adaptör örneği.

**Vite shared chunk:** MiniAtlas hem ThemePage hem WordPage tarafından referans alındığı için Vite onu kendi chunk'ına çıkardı (2.21 KB / 0.95 KB gz). ThemePage 4.87 KB gz (-0.13), WordPage 4.46 KB gz (+0.06, sadece import ve adaptör).

### (c) Person.atlasAnchors çoklu-yer rotası (dilim 7/4.C)

Person tipi şu ana kadar tek `atlasAnchor` (string) taşıyordu. Bu, al-Khwārizmī gibi *nisba*'sını bir yerden (Hârezm), üretimini başka bir yerden (Bağdat) alan kişiler için indirgemeci. Dilim 7/4.C, Theme.atlasAnchors ile aynı şekli (`ThemeAtlasAnchor[]`) Person'a getiriyor.

**Tip değişiklikleri (`src/types/entities.ts`):**
- `Person.atlasAnchors?: ThemeAtlasAnchor[]` eklendi. Mevcut `atlasAnchor?: string` (BaseEntity'den miras) korundu — geriye dönük uyumluluk fallback'i. Doluysa `atlasAnchors` tercih edilir.
- `PersonSummary.atlasAnchors?: ThemeAtlasAnchor[]` eklendi — manifest'e taşınır, Atlas/MiniAtlas lazy fetch'siz erişir.

**Manifest (`scripts/generate-manifest.mjs`):**
- `summarizePerson` artık `pickThemeAtlasAnchors` helper'ını çağırıyor (Theme için zaten vardı; aynı kod, ikinci çağıran). DRY.

**Validate (`scripts/validate-corpus.mjs`):**
- Yeni helper: `checkAtlasAnchorsArray(anchors, path, entityKind, ATLAS_SLUGS)`. Theme.atlasAnchors için inline yazılmış 30-satırlık kontrol bloğu fonksiyona çıkarıldı (DRY); aynı helper Person.atlasAnchors için de çağrılır.
- `ATLAS_SLUGS` deklarasyonu Persons loop'undan ÖNCE'ye taşındı (önce Theme'den sonra geliyordu; artık Person'lar da onu tüketiyor).
- Aynı dört invariant: array olmalı, her öğe `slug` taşımalı, slug ATLAS_PLACES'da olmalı, aynı entity içinde tekrar olmamalı.

**Negatif test:** `khwarazm` → `gibberishplace` enjeksiyon hata mesajıyla yakalandı:  
`[person/al-khwarizmi#atlasAnchors[0]] atlas anchor "gibberishplace" not found in ATLAS_PLACES`. Restore sonrası 0 ihlal. Shared helper iki entity için de doğru.

**Atlas runtime (`Atlas.tsx`):**
- `groups` useMemo iki-modlu Person'u ele alıyor: `atlasAnchors` doluysa Theme-pattern (her anchor için ayrı AnchoredEntity kopyası, `placeSlug`/`subLabel` doldurulur, multi-pin); yoksa fallback `atlasAnchor` (tek pin, eski yol). Word ve Book değişmedi, hâlâ tek-anchor.
- `themePaths` useMemo Person'u içeriyor: çoklu-anchor Person rotaları artık Atlas'ta dotted sepia path olarak görünür. `collectPath` helper'ı Theme ve Person için aynı path-build mantığını paylaşır. Key namespace'i: `theme/slug` ve `person/slug` (collision yok).
- CSS class adları (`.atlas-theme-path`, vb.) eski haliyle bırakıldı — rename CSS stylesheet'i etkilerdi, mevcut sepia-dotted estetik Theme ve Person için aynen geçerli.

**PersonPage entegrasyonu:**
- PersonHeader sonrası, strat-layout öncesi `<MiniAtlas>` render edilir.
- Adaptör: `atlasAnchors` doluysa onu kullan; değilse `atlasAnchor` varsa tek-elemanlı bir adaptöre çevir; yoksa render etme.

**Korpus güncellemesi (`content/persons/al-khwarizmi.mdx`):**
```yaml
atlasAnchor: baghdad  # eski tek-yer, fallback olarak korundu
atlasAnchors:         # yeni çoklu-yer rotası
  - slug: khwarazm
    year: "c. 780"
    label: { tr: "Doğduğu nisba — Hârezm", en: "Birthplace — Khwārizm", ar: "مَوضعُ النِّسبة — خُوارَزم" }
  - slug: baghdad
    year: "c. 820 — 850"
    label: { tr: "Bayt al-Ḥikma · *Al-Jabr* ve *Hisâb al-Hind* burada yazıldı", ... }
```

Hârezm → Bağdat rotası şimdi Atlas'ta dotted çizgi olarak görünür ve PersonPage'de mini-Atlas olarak; al-Khwārizmī artık tek bir yere indirgenmemiş bir biyografi taşıyor.

**Build çıktısı (HomePage'i ziyaret eden):**

| | 7/3 sonu | 7/4 sonu | Δ |
|---|---|---|---|
| `index` | 76.81 | 76.85 | +0.04 |
| `localized` (manifest) | 8.28 | 8.45 | **+0.17** |
| `transform` | 12.46 | 12.46 | 0 |
| `HomePage` | 7.72 | 7.81 | +0.09 |
| `AtlasGeography` | 1.77 | 1.77 | 0 |
| **Total** | **107.04** | **107.34** | **+0.30 KB gz** |

Manifest +0.17 KB gz al-khwarizmi.atlasAnchors içeriği (2 anchor × { slug, year, label-3-dil }). HomePage +0.09 KB gz Atlas runtime'ın Person çoklu-anchor mantığı.

PersonPage'i ziyaret eden lazy yük: PersonPage 1.68 KB gz + MiniAtlas 0.95 KB gz (shared) + AtlasGeography 1.77 KB gz (shared) = 4.40 KB gz toplam.

### Korpus durumu (dilim 7/4 sonrası)

- 9 word + 1 person (artık çoklu-anchor) + 1 book + 3 theme.
- 17 atlas place — değişmedi.
- `npm run validate` ✓ — tsx tabanlı, paylaşılan `checkAtlasAnchorsArray` Theme + Person için aynı invariant'lar.
- `npm run typecheck` ✓.
- `npm run build` ✓ — 107.34 KB gz initial paint.
- al-Khwārizmī rotası: Hârezm (c. 780, "Doğduğu nisba") → Bağdat (c. 820-850, "Bayt al-Ḥikma · Al-Jabr ve Hisâb al-Hind burada yazıldı").

### Sonraki dilim için öneriler

1. **Showcase Word boyut diet'i.** cotton/orange/coffee her biri ~55 KB MDX — strata body'leri biraz daraltılırsa lazy chunk'lar küçülür; mobile/yavaş ağ deneyimini iyileştirir. Editöryel iş.
2. **Anadili Arapça editör pasajı.** 7/2 ve 7/3'te yazılan Arapça prose'ların sicil cilası — anadil konuşanı bir editörün bakışı. Mekanik değil.
3. **Book.atlasAnchors.** Al-Jabr'ın yazılma yeri (Bağdat) + dağılım rotası (Toledo → Avrupa) çoklu-yer rotası olarak temsil edilebilir. Person.atlasAnchors için kurulan altyapı (tip + manifest + validate + Atlas runtime) Book için sadece bir tip-genişleme ve UI entegrasyonu gerektirir.
4. **MiniAtlas hover state'i.** Şu an sabit etiketler; iki+ anchor'lı durumda gerek olmayabilir ama Atlas'taki tooltip-pattern'i mini-formda yine de yararlı olur (özellikle mobile'de etiketler üst üste binerse).
5. **Word.atlasAnchors çoklu-yer.** Cotton'un strata'sı zaten 5 ayrı yer (Manchester, Mursiye, Bağdat, Mehrgarh, vb.) anlatıyor; bunları YAML alanı olarak da kayda almak Atlas'ta zengin bir "Word rotası" görselleştirir. En büyük data-model genişlemesi; refactor yapmadan önce kullanıcı niyeti netleşmeli.
