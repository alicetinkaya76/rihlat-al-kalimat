# RIḤLAT AL-KALIMĀT
### Avrupa Dillerinin Arap Tortuları — Üç Dilli Bir Arkeoloji Sahası
### *A Trilingual Archaeology of Arabic Sediments in European Languages*
### *علم آثار اللغات الأوروبية: الطبقات العربية*

> "Her ödünç kelime, iki uygarlığın aynı anda nefes aldığı bir andır."
> *Every loanword is a moment when two civilizations breathed at the same time.*

---

## 0 ▸ Bu Dokümanın Statüsü

Bu, bir **çalışma anlaşmasıdır**, taş üzerine yazılı bir spec değil. Her oturumda bu dokümana geri dönüp yeniden okuyacağız; oturum sonunda öğrendiklerimiz gri bloklarla işlenecek. Plan canlıdır, dilin kendisi gibi.

Plan iki katmanlıdır:
- **Üst katman**: Editorial vizyon, tasarım DNA'sı, içerik standardı, üç dillilik mimarisi — *değişmez sabitler*.
- **Alt katman**: Oturum-oturum yol haritası — *esnek, sırası değişebilir*.

---

## 1 ▸ Editorial Vizyon

### 1.1 Projenin Tezi
Avrupa dillerine geçmiş Arapça kökenli kelimeler, salt etimolojik kuriyozite değildir. Her biri, şu üçünden en az birini taşır:

1. **Bir teknoloji transferi** (cebir → soyut matematik; alembik → damıtma; sıfır → konumsal sayı sistemi).
2. **Bir kurumsal mimari** (divan → gümrük; muhtesip → almotacén; emir-ül-bahr → admiral).
3. **Bir kavramsal dönüşüm** (rızk → risk; al-kuhl → alcohol; makhzan → magazine).

Site, bu kelimeleri **fosil olarak değil, hâlâ canlı ama unutulmuş bir damar** olarak sergiler. Ziyaretçi siteyi terk ederken Excel'de `AVERAGE()` yazdığında 13. yüzyıl Akdeniz sigortacılığını çağırdığını **bilecek**. Bu hedef.

### 1.2 Editoryal Ton
- **Akademik gevşeklikte değil; popüler-bilim ciddiyetinde.**
- Anlatı ağırlıklı; her kelime için bir **kültürel hikâye** yazılır, kuru bir etimoloji notu değil.
- Tarihsel kesinlik **mecburidir**; spekülasyon ayrılır ("muhtemelen", "tartışmalı").
- Üslup üç dilde de aynı olmalı ama **birebir çeviri değil**: her dil kendi okuyucusunun ufkundan yazılır. (Detay: §3.4)
- Hedef metin uzunluğu kelime başına: **300–450 kelime** (TR), **250–400 kelime** (EN), **200–350 kelime** (AR).
- Sıkıcı bir cümle yazıldığı an silinir. Nefes alan paragraflar, somut sahneler, beklenmedik bağlantılar.

### 1.3 Kapsam Felsefesi
"100 kelimeyi yüzeysel anlatmak" yerine **"40 kelimeyi unutulmaz anlatmak"** prensibi.
- **Showcase Set: ~40 kelime** — derinlemesine yazılır, görselleştirilir, bağlantılandırılır.
- **Catalogue Set: ~80 kelime** — daha kısa kart formatında, ama yine üç dilde.
- Toplam: ~120 giriş; "vitrin kalitesi" ile "ansiklopedik tamamlık" dengelenir.

---

## 2 ▸ Tasarım DNA'sı

### 2.1 Estetik Yön: **Manuscript & Stratigraphy**
*Yazma + Tortulaşma.* Bir İslam dünyası elyazmasının disiplinli sayfa düzeni × bir kazı sahasının dikey katmanlı görselliği. Editorial bir gazete ile bir doğa tarihi müzesi vitrini arasındaki yer.

**Reddedilen yönler** (AI-jenerik):
- Mor/pembe gradyan, glassmorphism köpük, "modern startup" pastel.
- *Inter / Roboto / Space Grotesk* gibi fazla görülmüş tipografi.
- Düz beyaz arka plan + emoji ikonlar + yuvarlak kart kosalakları.

### 2.2 Tipografi
| Kullanım | Font | Niçin |
|---|---|---|
| Display (başlık, kelime adı) | **EB Garamond** | 16. yy elyazması ruhu; geniş optik aralık; ince kontrast. |
| Body (anlatı metni) | **Söhne**[^1] veya **Geist** | Çağdaş insancıl sans; uzun okuma için temiz; Garamond ile karşıtlık. |
| Mono (IPA, tarih, sitasyon) | **JetBrains Mono** | "Bilim notu" tonu; teknik detayları ayırır. |
| Arapça (display + body) | **Amiri** | Klasik Naskh; manuscript geleneği; Garamond ile aynı tarihsel ağırlıkta. |
| Arapça (modern UI) | **IBM Plex Sans Arabic** | Arayüz mikrodetayları için, Amiri'nin sıcaklığını koruyan modern. |

[^1]: Söhne paid'dir; açık kaynak alternatifi: **Geist Sans** (Vercel) veya **Public Sans**.

**Tipografik kararlar:**
- Display'de **küçük büyükharfler (smcp)** ve **eski stil rakamlar (onum)** açık.
- Latin başlıklarda Garamond *italic*'i bilinçli ve seçici kullanılır (bir özlem ifadesi gibi).
- Arapça başlıklarda Amiri'nin **Quranic varyantı değil** — Quranic varyant dini metin için; bu site dini değil, bilimsel.
- Üç dil bir arada görüldüğünde optik denge kritik: Latin x-height ile Arapça x-height'ı yazılım katmanında dengelenir (`font-size-adjust`).

### 2.3 Renk Paleti
Her renk **corpus içinden bir kelimeye veya tarihî bir maddeye** bağlıdır. Tesadüfi seçilmemiştir.

| Token | HEX | Kaynağı |
|---|---|---|
| `--ink` | `#1A1612` | Mürekkep — el yazması teninin negatifi |
| `--parchment` | `#F4EFE6` | Parşömen — manuscript zemini |
| `--parchment-deep` | `#E8DFCC` | Yıpranmış parşömen, ikincil yüzey |
| `--terracotta` | `#B8442E` | Kazı toprağı; *realgar* pigmenti çağrışımı |
| `--lazaward` | `#1F3D6B` | Lapis lazuli mavisi — corpus'taki *Azure* kelimesinin somutu |
| `--gold-leaf` | `#A88B3D` | Manuscript tezhip altını |
| `--saffron` | `#D4923A` | *Zaʿfarān* — vurgu rengi |
| `--moss` | `#5A6B4A` | Kına/sumak yeşili tonu |

**Kullanım kuralı**: Parşömen + mürekkep ana ağırlığı taşır (≥80%). Terracotta yapısal vurgu. Lazaward göç hatları/su mühendisliği. Altın yalnızca "manuscript anı" — başlık ilk harfi, alıntı süslemesi, Easter egg detaylar.

**Karanlık mod**: deep-ink zemine altın + parşömen. *Gece çalışan münzevî bilim insanı* hissi. Bu mod olmazsa olmaz; çünkü manuscript estetiği geceleyin daha güçlü konuşur.

### 2.4 Dokular ve Atmosfer
- Sayfanın arka planında **çok hafif bir kâğıt grain'i** (SVG noise filtresi, opacity 0.04). Düz değil, doku var.
- Word page'de derinlere indikçe **stratigrafik şerit** — sol kenarda toprak katmanlarını gösteren ince bir cetvel.
- Hover state'lerde **mürekkep yayılması** mikrodetayı (CSS filter ile).
- Geçişlerde **sayfa çevirme** değil — bir kâğıdın katlanması veya bir tortunun açılması metaforu.
- Atlas'ta göç hatları **mürekkeple çizilen kalem hareketi** gibi animasyonla doldurulur.

### 2.5 Hareket / Motion İlkeleri
- **Sakin maksimalizm**: çok şey olur, ama hiçbir şey aceleci değildir. Sayfa yüklemesi 600–900 ms staggered reveal.
- Scroll-driven hikâye Word page'de mecburi (Framer Motion `useScroll`).
- Hover'lar agresif değil — el yazması okurken oluşan dikkat tonunu bozmaz.
- Loader: dönen spinner yok. Bir damla mürekkebin kâğıda yayılması.

### 2.6 Diferansiyasyon — Akılda Kalan O Tek Şey
Her ziyaretçi siteden ayrılırken **tek bir görüntüyü** hatırlamalıdır. Aday: **Word page'de scroll ettikçe sol kenardaki dikey "kazı şeridi"nin katmanlarda dolup ilerlemesi**. Modern → 12. yy Toledo → 9. yy Bağdat → kök. Hiçbir başka site bunu yapmıyor.

---

## 3 ▸ Üç Dillilik Mimarisi (TR / EN / AR)

### 3.1 Felsefe
Üç dil **eşit vatandaştır** — ne TR ana ne EN dünya standardı ne AR egzotik. Her biri site mimarisinde tam ağırlık taşır. Arapça **özellikle** birinci sınıf vatandaş olmalı, çünkü kelimelerin **kaynak dili** Arapçadır. Site, kaynağı kuruyup tüketicilere servis eden bir kanal değil, kaynağı **konuşan** bir mecra olmalıdır.

### 3.2 Dil Değiştirme UX'i
- Üst sağda (RTL'de üst solda) üç-yollu toggle: **TR / EN / العربية**.
- Tercih `localStorage`'a değil, **URL'ye** yazılır: `/tr/word/algoritma`, `/en/word/algorithm`, `/ar/word/الخوارزمية`. Paylaşılabilirlik için kritik.
- İlk ziyarette tarayıcı `Accept-Language` header'ından otomatik tahmin (ama override edilebilir).
- URL slug'ları her dilde dilin kendi yazımıyla — Latin transkripsiyon yamalı kullanılmaz.

### 3.3 RTL (Sağdan Sola) Yönetimi
- **Tek bir CSS değişkeni**: `dir="rtl"` html tag'inde. Tüm layout `logical properties` ile yazılır: `margin-inline-start` not `margin-left`, `padding-inline-end` not `padding-right`.
- **Ayna-çevrilmemesi gereken** öğeler: sayılar, IPA, Latin alıntılar, takvim/zaman çubuğu yönü (gerekirse), grafik eksenler. Bunlar `dir="ltr"` ile özel olarak işaretlenir.
- **Atlas haritası**: Akdeniz haritası RTL'de aynalanmaz (coğrafya gerçektir!) — ama metin etiketleri Arapçaya geçer ve sağdan sola hizalanır.
- **Phylogenetic tree** (etimolojik ağaç): Arapça modunda kök sağda, dallar sola doğru büyür.
- **Tablo başlıkları** RTL'de sağdan başlar; ama tablo *içeriğinde* Latin ve Arapça veri yan yanaysa hücre içinde her birinin kendi yönü korunur (`unicode-bidi: plaintext`).

### 3.4 Çeviri Felsefesi: Eşit Yazım, Birebir Olmama
Üç dilin metinleri aynı veriyi farklı kültürel ufuklardan anlatır. **Hiçbir dil diğerinin çevirisi değildir.**

- **TR**: Türk okuyucusu için. Osmanlı-Türk dil mirasını referans olarak kullanır ("kantar", "imbik", "şurup" zaten Türkçedir — bu okuyucu için **kelime yabancı değil, yarı tanıdık**). Ton: Cemil Meriç + Cevat Şakir karışımı; kültürel öz-bilinç ama kasvet değil.
- **EN**: Anglofon okur için. Bu okur için kelimeler **yabancı**, hikâye sürpriz olmalıdır. "Did you know `algebra` comes from..." aczinden kaçınılır; bilim tarihçisi otoritesi (Toby Huff, George Saliba tonu).
- **AR**: Arapça okur için. Bu okur için kelime **kendi dilidir** — egzotik değil. Hikâye kayıp bir mirasın yeniden tanınması olarak yazılır. Modern Standart Arapça (MSA), klasik nüanslarla; gazete Arapçasının kuruluğundan kaçınma. *Al-Jabarti* veya *al-Sharq al-Awsat* kültürel köşesi tonu.

Her giriş üç dilde **bağımsız yazılır**, ardından üçü çapraz okunarak içerik tutarlılığı sağlanır (gerçek tarih ve isimler aynı kalır; anlatım açıları farklılaşabilir).

### 3.5 Tipografik Hijyen
- **Latin satır içinde Arapça**: `<span lang="ar">العربية</span>` ile işaretlenir; tarayıcı `font-family` cascade'i Amiri'ye geçer.
- **Arapça satır içinde Latin**: `<span lang="en" dir="ltr">algorithm</span>`.
- Üç dilin de **rakamları** site genelinde Hindu-Arabic (0-9). Arapça-Hindi rakamlar (٠١٢٣) sadece tarihsel/edebî alıntılarda.
- **IPA** her zaman LTR, JetBrains Mono.
- **Arapça diakritik (ḥarakāt)**: Etimoloji bölümlerinde tam (`صِفْر`); akıcı metinde minimal (`صفر`). UX kararı: gereksiz harake çorbası okuyucuyu boğar.

---

## 4 ▸ Bilgi Mimarisi

```
/                          → Atlas (Akdeniz haritası, ana sayfa)
/words                     → Catalogue (kart grid + filtre)
/word/:slug                → Word page (derin scroll-driven hikâye)
/journeys                  → Yolculuk Tipolojisi (7 arketip)
/journeys/:type            → Bir tipin tüm kelimeleri
/about                     → Editoryal nota, kaynaklar, kolofon
/timeline                  → Kronolojik görünüm (8.–17. yy)
```

### 4.1 Atlas (Anasayfa)
- Akdeniz odaklı **özel çizilmiş SVG harita** (Leaflet/Mapbox değil — pastoral, manuscript hissi için).
- Bağdat, Kahire, Kayrevan, Kurtuba, Toledo, Palermo, Venedik, Lizbon, Marsilya, Paris, Londra düğüm noktaları.
- 8 ila 17. yy zaman çubuğu; kaydırdıkça göç hatları yavaşça çizilir.
- 7 yolculuk tipinin renk-kodlu filtresi.
- Hover'da kelime adı + kısa özet; tıklayınca Word page.

### 4.2 Catalogue
- Specimen kart grid'i — her kart bir **müze numune kartı** estetiğinde.
- Filtreler: yolculuk tipi, dil/varyant, dönem, kategori (mimari, tıp, denizcilik vs).
- Üç görünüm modu: **kart grid / kompakt liste / kronolojik şerit**.
- Üç dilde de arama; arama Arap kökü, Latin varyant, anlam alanı üzerinden yapılır.

### 4.3 Word Page (Tekil Kelime — Sitenin Kalbi)
Bu, sitenin en yoğun çalışılacak sayfasıdır. Anatomi:

```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
│ Kelime başlığı: ALGORITHM                       │
│ Üç dilde varyantlar yan yana: algoritma | algorithm | الخوارزمية │
│ IPA, ses dalga ikonu (telaffuz)                 │
│ Yolculuk tipi rozeti                            │
└─────────────────────────────────────────────────┘
       │
       │ scroll ↓
       │
┌─────────────────────────────────────────────────┐
│ STRATIGRAFI ŞERIDI (sol kenarda kalıcı)         │
│                                                 │
│ MODERN (2026) — sayfada bulunduğun seviye       │
│ ─────────────                                   │
│ Anlatı: kelime bugün ne anlama geliyor?         │
│                                                 │
│ 19.YY — Latince formundan modern dile           │
│ ─────────────                                   │
│ Anlatı: standartlaşma, akademik kullanım        │
│                                                 │
│ 12.YY — Toledo'da Latinceleşme                  │
│ ─────────────                                   │
│ Anlatı: çevirmen kim, hangi metin               │
│                                                 │
│ 9.YY — Bağdat, kelimenin doğuşu                 │
│ ─────────────                                   │
│ Anlatı: el-Harezmi, Beytülhikme, bağlam         │
│                                                 │
│ ÖNCESİ — Sanskrit/Babil aritmetik geleneği      │
│ ─────────────                                   │
│ Anlatı: kelimenin atası                         │
└─────────────────────────────────────────────────┘
       │
       │ scroll ↓
       │
┌─────────────────────────────────────────────────┐
│ ETIMOLOJIK AĞAÇ (D3.js)                         │
│ Kök → tüm Avrupa varyantları (kardeş kelimeler) │
└─────────────────────────────────────────────────┘
       │
┌─────────────────────────────────────────────────┐
│ AKRABA KELİMELER                                │
│ Aynı yolculuk tipinden 3-5 kelime önerisi       │
└─────────────────────────────────────────────────┘
       │
┌─────────────────────────────────────────────────┐
│ KAYNAKLAR & İLERİ OKUMA                         │
└─────────────────────────────────────────────────┘
```

### 4.4 Person, Book, Theme Sayfaları (Oturum 2 mimari pivot eki)

Mevcut Word merkezli model, *bilgi grafına* genişletildi. Sözlükten dört-varlıklı bir bilgi grafına geçiş.

#### 4.4.1 Varlık tipleri

| Tip | URL şeması | Kapsam |
|---|---|---|
| Word (mevcut) | `/{lang}/kelime/{slug}` | 140 (43 showcase + 97 catalogue) |
| **Person** | `/{lang}/kisi/{slug}` | ~30-35 showcase + ~25 catalogue |
| **Book** | `/{lang}/kitap/{slug}` | ~20 showcase + ~15 catalogue |
| **Theme** | `/{lang}/tema/{slug}` | 5-6 |

Edge'ler: Word↔Person, Word↔Book, Word↔Word, Person↔Book, Person↔Person (halka), Book↔Book, Theme↔herşey.

#### 4.4.2 Birleştirici metafor — ters-kronolojik kazı

Stratigrafi metaforu üç varlık tipi için aynı: tarihsel sediment'in ters-kronolojik kazısı. Word için etimolojik, Person için adın tarihsel varlığı, Book için metnin okunma katmanları. Üçünde de en üstte 2026, en altta kaynak.

#### 4.4.3 Cross-link mekaniği

| Sayfa | Sticky right aside | Bottom |
|---|---|---|
| Word | yok | Sibling words |
| Person | "Borçlu kelimeler" + "Eserleri" | Halka (forward/contemporary) |
| Book | "Yazar" + "Elyazmaları" + "Tercümeler" | "Bağlı kelimeler" |
| Theme | tema-spesifik | tema-spesifik |

Glyph: `❦` Book'a, `◇` Person'a.

#### 4.4.4 Person sayfası özel — directional `circle`

- **`forward`**: biyografisi boş figürler (al-Khwārizmī)
- **`contemporary`**: biyografisi belgeli figürler
- **`none`**: yön belgeli değil

Yanlış yön = sayfa zımnen yalan söyler. Detay: `DATA-SCHEMA.md` §5.

#### 4.4.5 Book sayfası özel — manuscript inventory

| Renk | Anlam |
|---|---|
| 🟢 Yeşil | Tam dijital |
| 🟡 Altın | Kısmi |
| ⚫ Gri | Offline |

#### 4.4.6 Theme sayfaları — iki sınıf

- **Magnum** (~1500-2000 kelime): "Hint-Arap Rakamları Yolculuğu", "Bakışın Geometrisi"
- **Klaster** (~600-800 kelime): "Endülüs Sofrası", "Yıldız Tablosu Kelimeleri"

#### 4.4.7 Toplam hacim

140 + 60 + 35 + 6 ≈ 240 sayfa × 3 dil ≈ 720 paralel metin (öncekinin %35-40 fazlası).

#### 4.4.8 Veri modeli

Detay: `DATA-SCHEMA.md`. `Word`, `Person`, `Book`, `Theme` interface'leri.

#### 4.4.9 Yeni konvansiyonlar

1. Directional `circle` (Person)
2. Manuscript online-status renk kodu
3. Cross-link glyph sistemi (❦ ◇)
4. "↓" pre-stratum işareti
5. Showcase/catalogue tüm tiplere yayıldı

#### 4.4.10 Oturum sıralamasındaki etki

Ana §7 sıralaması değişmez. Oturum 3'ün ilk işi 4-tip veri modeli + iskele.

#### 4.4.11 Görsel şartname referansları

- `algorithm.html` — Word DNA (Oturum 1)
- `al-khwarizmi.html` — Person DNA (Oturum 2)
- `al-jabr.html` — Book DNA (Oturum 2)

React'te sıfırdan yazılırken görsel + kompozisyon referansı.

> **Editöryel not (Oturum 3):** Bu §4.4 patch olarak Oturum 2 sonunda yazıldı; Oturum 3'te plana entegre edilirken mevcut "Yolculuk Tipolojisi Sayfası" başlığı §4.5'e kaydırıldı. İki bölüm farklı amaçlara hizmet eder: §4.4 (Person/Book/Theme) entity-graph mimarisi; §4.5 (yolculuk arketipleri) corpus-içi tematik gruplandırma. Veri modelinde `journey_type` alanı korunur.

### 4.5 Yolculuk Tipolojisi Sayfası
7 arketip için ayrı bir bölüm. Her arketip kendi mini-essay'i + ilgili tüm kelimelerin listesi:
1. Mütercimin Yolu (Toledo–Salerno)
2. Tüccarın Kervanı
3. Endülüs Tortusu
4. Haçlının Hatırası
5. Yıldızbilimcinin Mirası
6. Simyacının Atölyesi
7. Diplomatik Mübadele

---

## 5 ▸ Veri Modeli

### 5.1 Word Schema (her kelime için JSON)
```jsonc
{
  "id": "algorithm",
  "tier": "showcase",            // "showcase" | "catalogue"
  "journey_type": "translator",  // 7 arketipten biri
  "category": "math_science",
  "era_first_attestation": 1145, // Adelard of Bath / Toledo
  "era_arabic_origin": 825,
  "stratigraphy": [              // zaman katmanları (Word page için)
    { "year": 825, "place": "Baghdad", "form": "al-Khwārizmī", "actor": "Bayt al-Ḥikma" },
    { "year": 1145, "place": "Toledo", "form": "algorismus", "actor": "Adelard of Bath" },
    { "year": 1450, "place": "Paris", "form": "algorisme", "actor": null },
    { "year": 1900, "place": "—", "form": "algorithm", "actor": null }
  ],
  "ar": {
    "root": "خوارزمي",
    "transliteration": "al-Khwārizmī",
    "ipa": "/al.xwaː.rizˈmiː/",
    "literal_meaning": "Harezmli (kişi)",
    "story_md": "...",            // 200-350 kelime, MSA
    "title": "الخوارزمية"
  },
  "tr": {
    "title": "Algoritma",
    "ipa": "/aɫɡoɾitma/",
    "story_md": "...",            // 300-450 kelime
    "summary": "..."               // tek cümle, kart için
  },
  "en": {
    "title": "Algorithm",
    "ipa": "/ˈælɡəˌrɪðəm/",
    "story_md": "...",            // 250-400 kelime
    "summary": "..."
  },
  "variants": {                    // diğer Avrupa dillerinde formlar
    "fr": "algorithme",
    "es": "algoritmo",
    "it": "algoritmo",
    "de": "Algorithmus",
    "pt": "algoritmo"
  },
  "siblings": ["algebra", "zero"], // aynı çeviri okulundan
  "sources": [
    { "type": "book", "ref": "Burnett, Charles. *Arabic into Latin in the Middle Ages.* 2009." }
  ],
  "audio": {
    "ar_pronunciation": "/audio/ar/algorithm.mp3"
  },
  "map_route": [                   // Atlas haritası için
    { "lat": 33.3, "lng": 44.4, "year": 825, "label": "Baghdad" },
    { "lat": 39.8, "lng": -4.0, "year": 1145, "label": "Toledo" }
  ]
}
```

### 5.2 Veri Yönetimi
- Tüm kelimeler `/data/words/*.json` dosyalarında, her kelime ayrı dosya (Git diff temizliği için).
- Build sırasında tek bir `corpus.json` oluşturulur; çalışma anında bu yüklenir.
- 40+ showcase için detay alanları doldurulur; 80 catalogue için minimal alanlar.
- TR/EN/AR metinleri Markdown — inline `<span lang="..">` tag'lerine izin verilir.

---

## 6 ▸ Teknik Yığın

| Katman | Tercih | Niçin |
|---|---|---|
| Build | **Vite** | Hızlı; Next.js'in fazlalığına gerek yok (statik site) |
| UI | **React 18** | Bilinen sular |
| Yönlendirme | **React Router v6** | i18n-aware route'lar için yeterli |
| Stil | **Tailwind CSS** | Logical properties (RTL) güzel; özel teması ile |
| i18n | **react-i18next** | TR/EN/AR resource yönetimi |
| Animasyon | **Framer Motion** + **CSS** karışık | Scroll-driven için Motion |
| Veri vizüalizasyon | **D3.js** (etimolojik ağaç) + custom SVG (atlas) | Leaflet değil; kendi haritamız |
| İçerik | Markdown + frontmatter (`gray-matter`) | Yazma deneyimi |
| Tipografi | Self-hosted woff2 (Google Fonts CDN değil) | Performans + hijyen |
| Dağıtım | **Cloudflare Pages** veya **Vercel** | Statik build |

**Kütüphaneye eklenmeyecekler**: shadcn/ui (kendi bileşenlerimiz olmalı, jenerik değil), Headless UI (gerekmiyor), Mapbox (haritamız özel).

---

## 7 ▸ Oturum Yol Haritası

> Her oturum bir **deliverable** üretir. Oturumlar lineer, ama 6-7-8 sırası içerik durumuna göre değişebilir.

### 🜚 Oturum 1 — Tasarım DNA & Tipografik Numune
**Hedef**: Görsel kimliği nihaî olarak kilitlemek. Tek bir vertical slice çıkarmak.

**Üretilecekler**:
- Vite + React + Tailwind + i18n iskeleti.
- Tipografi yüklemesi (EB Garamond + Geist + Amiri + JetBrains Mono).
- CSS değişkenleri (palet, spacing, type scale) tanımlanır.
- **Tek bir kelime için Word page tam tasarımı** (TR/EN/AR üç versiyon yan yana toggle'lanabilir).
- Aday kelime: **Algorithm** (içerik zaten zengin, üç dilde de güçlü hikâye).
- Karanlık mod dahil.

**Risk / Karar Noktası**: Kullanıcı tasarım dilini onayladığında bu DNA artık değişmez. Onaylamazsa, geri dönüp paleti/tipografiyi yeniden seçeriz.

**Çıktı**: `localhost:5173/tr/word/algorithm` çalışır halde, görsel bomba.

---

### 🜚 Oturum 2 — Veri Mimarisi & İçerik Pipelining
**Hedef**: 120 kelimelik veri modelini stub'lamak; üç dillilik altyapısını döşemek.

**Üretilecekler**:
- `/data/words/*.json` 120 stub dosya (sadece başlıklar, varyantlar, kategori).
- Markdown loader pipeline.
- i18n resource ayrımı (`/locales/tr/common.json` vs).
- RTL stylesheet'inin tüm temel layout'larda doğru çalıştığının testi.
- Header + dil-switcher + footer (üç dilli).
- 5 referans kelime için **tam içerik** üç dilde yazılır:
  - **Algorithm** (Mütercim yolu)
  - **Risk** (Kavramsal dönüşüm)
  - **Magazine** (Çoklu evrim)
  - **Admiral** (Haçlı/diplomatik)
  - **Aldebaran** (Yıldızbilim mirası)

**Risk**: Arapça yazımının kalitesi. Burada yazı kalitesi standartını net olarak konulmalı; sonraki oturumlarda buna göre üretim olacak.

**Çıktı**: `/words` listeleme sayfası 120 kelimeyle dolu (yarısı placeholder), 5 derin yazılmış kelime.

---

### 🜚 Oturum 3 — Atlas (Anasayfa)
**Hedef**: Akdeniz haritası, zaman çubuğu, göç hatları.

**Üretilecekler**:
- Özel SVG Akdeniz haritası (yaklaşık 1200×700 viewBox; pastoral hatlar).
- 11 düğüm şehri (yukarıda).
- Kelime göç hatları — bezier eğrileri, mürekkep çizimi animasyonu.
- Zaman slider (8.–17. yy); kaydırdıkça hatlar drawn-on olur.
- 7 yolculuk tipi renk-kodlu filtresi.
- Hover'da mini-tooltip (kelime + kısa anlam); tıklayınca Word page'e geçiş.
- Üç dilde label'lar.

**Risk**: SVG haritası zanaat işidir; basit dikdörtgen Akdeniz olmamalı, hafifçe stilize ama tanınabilir.

**Çıktı**: `/` adresi tam çalışır, tüm kelimeler harita üzerinde.

---

### 🜚 Oturum 4 — Catalogue & Word Page Şablonu
**Hedef**: `/words` ve `/word/:slug` sayfalarının nihaî yapıları (şablon olarak; içerik henüz az).

**Üretilecekler**:
- Specimen kart komponenti (üç dilli, hover state, mürekkep yayılması).
- Filtre paneli (kategori, yolculuk tipi, dönem).
- Üç görünüm modu (grid / liste / kronoloji şeridi).
- Word page'in **tüm bölümleri** çalışır — stratigrafik şerit, başlık bloğu, akraba kelimeler, kaynaklar.
- Scroll-driven motion (Framer Motion `useScroll`).
- 5 referans kelime tam yaşıyor; geri kalan 35 showcase kelime stub.

**Risk**: Stratigrafik şerit hassas iş. Sol kenarda fixed-position değil, scroll-progress'e göre seviyelenmeli.

**Çıktı**: Bir okuyucu siteye girip 5 kelimeyi gerçekten okuyabilir.

---

### 🜚 Oturum 5 — Etimolojik Ağaç & Yolculuk Sayfaları
**Hedef**: D3.js ile filogenetik ağaç + 7 yolculuk arketipinin essay sayfaları.

**Üretilecekler**:
- D3.js radial veya horizontal tree komponenti, RTL desteği.
- Her ağaç bir kökten Avrupa varyantlarına dallanır.
- 7 yolculuk arketipinin **kapak essay'leri** üç dilde (her biri ~600 kelime).
- `/journeys` ve `/journeys/:type` route'ları.

**Risk**: D3.js + React entegrasyonu ve RTL'de dal yönü.

**Çıktı**: Yolculuk arketipleri tam yaşıyor; her Word page'de altta etimolojik ağaç var.

---

### 🜚 Oturum 6 — İçerik Pasajı 1: 15 Kelime, Üç Dil
**Hedef**: Showcase'in derin yazıma giren ilk büyük dilimi.

**Üretilecekler**: 15 kelime × 3 dil = 45 derinlemesine yazılmış metin.

Aday seçim (yolculuk dağılımına göre):
- **Mütercim**: Cebir, Sıfır, Zenith, Azimuth (4)
- **Tüccar**: Şeker, Pamuk, Kahve (3)
- **Endülüs**: Alcalde, Aceite, Ojalá (3)
- **Haçlı**: Suikast, Arsenal (2)
- **Yıldızbilim**: Vega, Algol (2)
- **Kimya**: Alkol (1)

**Çıktı**: Toplam 20 derin yazılmış kelime (Oturum 2'deki 5 + bu 15).

---

### 🜚 Oturum 7 — İçerik Pasajı 2: 20 Kelime + Catalogue Kısa Yazımları
**Hedef**: Showcase'in geri kalan 20'si + 80 catalogue girişi için kısa yazımlar.

**Üretilecekler**:
- 20 showcase kelime × 3 dil.
- 80 catalogue kelime × 3 dil × kısa form (60-100 kelime).

**Çıktı**: Tüm corpus tamamlanmış.

---

### 🜚 Oturum 8 — Polish, Mikrointeraksiyon, Easter Egg
**Hedef**: Sıradan iyi siteyi unutulmaz yapan detaylar.

**Üretilecekler**:
- Sayfa geçiş animasyonları (kâğıt katlama metaforu).
- Mürekkep yayılma hover state'leri her kart için.
- Loading state'leri (mürekkep damlası).
- 404 sayfası (manuscript metaforuyla).
- Easter egg fikirleri:
  - Konsole'a Arapça/TR/EN üç dilde gizli mesaj.
  - Belirli kelimelerin yan yana okunması yeni anlam üretir.
  - Click-and-hold ile bir kelimenin "gerçek katmanlarını" gösteren mikro-animasyon.
- Erişilebilirlik audit (WCAG AA): klavye nav, ARIA, kontrast, ekran okuyucu RTL/LTR.
- Performans: lighthouse 95+; font-display swap; lazy load.

---

### 🜚 Oturum 9 — Lansman Hazırlığı
**Hedef**: Production-ready.

**Üretilecekler**:
- Sosyal medya kartları (OG image, Twitter card) üç dilde.
- Kolofon sayfası: kullanılan fontlar, kaynaklar, teşekkürler, açık kaynak lisansı.
- Cloudflare Pages / Vercel deploy.
- Robots.txt, sitemap.xml.
- Bir "okuyucu kılavuzu" mini-essay anasayfaya ekle.

---

## 8 ▸ Kalite Çıtası — Reddedilen Şeyler

Bu liste tasarımın **olmaması gereken** halini sabitliyor:

- ❌ Genel "blog" kart estetiği (yuvarlatılmış köşe + soft shadow + emoji)
- ❌ AI-jenerik mor-pembe gradyan
- ❌ Inter / Roboto / Space Grotesk / Poppins
- ❌ Lucide ikonlarının dekoratif kullanımı (ikon ancak işlevsel zorunluluksa)
- ❌ "Modern startup" mavi-beyaz palet
- ❌ Stock fotoğraf
- ❌ Lorem ipsum (tek bir karakter bile yok)
- ❌ Alfabetik liste sıralaması (anlamlı sıralama: yolculuk + dönem)
- ❌ "Bilim insanı portreleri" kliklenebilir kartlar (gereksiz)
- ❌ Tek-tıklamayla TR'den EN'e Google-çeviri tonu metin

---

## 9 ▸ Açık Kararlar (Karar Verilmesi Gereken)

| # | Soru | Olası Yanıt | Kim Karar Verir |
|---|---|---|---|
| 1 | Tier dağılımı: 40 showcase + 80 catalogue — bu oran iyi mi? | Esnek; 30+90 da olabilir. | Kullanıcı |
| 2 | Ses kayıtları: Arapça telaffuzlar nereden? TTS mi, gerçek konuşmacı mı? | TTS başlangıç, sonra opsiyonel insan kayıt. | Sonraya |
| 3 | Kaynaklar/bibliyografi her kelime için zorunlu mu? | Evet, showcase için. | Sabit |
| 4 | Yorum / okuyucu katkısı sistemi olacak mı? | Hayır (en azından V1'de). | Sabit |
| 5 | Mobil deneyim: aynı zenginlik mi, sade bir varyant mı? | Aynı zenginlik, ama atlas mobil-uyumlu yeniden çizilir. | Tasarım |
| 6 | Dağıtım: kendi domain'in olacak mı? | Sonra konuşulur. | Kullanıcı |
| 7 | Yapay zeka asistanı / soru-cevap özelliği? | Hayır V1'de; opsiyonel V2 fikri. | Sonraya |
| 8 | Açık kaynak yapılacak mı (GitHub repo)? | Karar açık. | Kullanıcı |

---

## 10 ▸ Başarı Kriteri

Site tamamlandığında, üç soruyu **evet** ile yanıtlamalı:

1. **Görsel imza**: Bir tasarımcı arkadaşa ekran görüntüsü gösterdiğimde "vay, bu nedir?" diyor mu?
2. **Edebî değer**: Bir kelime sayfasını okuduktan sonra okuyucu, başkasına anlatmak istiyor mu?
3. **Kültürel onurlandırma**: Arapça konuşan bir okur sitede gezdiğinde **sömürülmüş** değil **konuşulmuş** hissediyor mu?

Üç sorudan birinin cevabı "hayır" ise iş bitmemiştir.

---

## 11 ▸ Oturum-Oturum İlerleme Tablosu

Bu tablo dilim 7/5'te kullanıcı isteğiyle açıldı: *"planın içine her oturum sonrası ne yapıldı ve kaldı tablo şeklinde ver."* Her oturum + dilim için üç sütun: (a) yapılanın özü, (b) plana göre o tarihte hâlâ açık kalan iş, (c) projenin geneline göre kümülatif tamamlanma oranı.

Yüzdeler **§12'deki ağırlıklı ortalama**ya göre — her oturum için tek bir nokta tahmini değil, dört ölçüm açısının ağırlıklı toplamı. (a) ve (b) ise oturumun gerçek deliverable'larına bakar; § kayıtlı her dilim README'sinin uzun anlatısının üç-cümlelik karşılığıdır.

| Oturum / Dilim | (a) Yapıldı | (b) Hâlâ açık | (c) Kümülatif % |
|---|---|---|---|
| **1** | Vite+React+Tailwind+i18n iskelesi; tipografi (EB Garamond + Geist + Amiri + JetBrains Mono); CSS tokens + dark mode; Algorithm Word page tek-sayfa görsel imza onaylandı. | 4-varlık modeli yok (sadece Word); Atlas yok; Catalogue/listeleme yok; içerik 1 kelime. | ~%8 |
| **2** | Veri mimarisi pivot edildi: Word-only → Word/Person/Book/Theme bilgi grafı. JSON şema → TS interface. 5 referans kelime + 1 person + 1 book için tam content. RTL stylesheet temel layout testi. | Atlas yok; ThemePage yok; Etimoloji ağacı yok; içerik 5 kelime + 1 person + 1 book stub. | ~%14 |
| **3** | (Atlas inşası) Mediterranean SVG haritası + 11 düğüm; zoom henüz yok. WordPage stratigrafi + Layer + Etimoloji ağacı (D3). | Yolculuk tipolojisi sayfaları yok; Catalogue filtreleri yok; PersonPage/BookPage UI'i derlenmedi; içerik 5-6 entity. | ~%19 |
| **4 / 1** | PersonPage ilk versiyon; PersonHeader, PersonCircle, WorksTimeline, ManuscriptInventory, TranslationChain bileşenleri. al-khwarizmi şuanı kazıyor. | BookPage tamamlanmadı; ThemePage yok; cross-link grafı yarım. | ~%21 |
| **4 / 2** | BookPage tamamlandı (Manuscript inventory + Translation chain + BookHeader); al-jabr.mdx ilk Book showcase. CrossLink integrity validatörü çalışıyor. | ThemePage yok (4-varlık grafının dördüncü ayağı eksik); içerik 1 word + 1 person + 1 book. | ~%23 |
| **5 / 2** | parseTheme ve ThemePage iskelesi; hindu-arabic-numerals.mdx ilk magnum theme. ThemeBadges henüz yok. | Theme back-link (entity→themes) yok; cluster tier theme yok; tüm Word sayfalarında theme bağı görünmüyor. | ~%24 |
| **5 / 3** | Cross-link grafının tam kapanışı: algorithm.siblings live. parseTheme stabilleşti. validate-corpus.mjs Node-side smoke test bağımsız çalışıyor. | Hâlâ tek showcase Word (algorithm); ikinci/üçüncü Word'ler placeholder. | ~%25 |
| **5 / 4** | algebra.mdx + zero.mdx ikinci ve üçüncü showcase Word'ler. ThemeBadges component (inline + aside variant). Theme reverse-index `getThemesForEntity`. al-jabr crosslink üçgeni tamam. | Cluster tier hâlâ test edilmedi (sadece magnum hindu-arabic-numerals var); Atlas'ta tema rotaları yok. | ~%26 |
| **6 / 1** | Per-route React.lazy code-split (-118 KB gz). Atlas region etiketleri (al-Andalus, Transoxiana, India, England). D3-zoom + pan + reset. andalusian-translation-workshop ilk cluster theme. `--display` token tanımı, tsconfig.node.json temizliği. | MDX gövdeleri hâlâ tek `localized-*.js` chunk'ında (110 KB gz); 2 theme var ama Atlas'ta görünmüyor. | ~%27 |
| **7 / 1** | **MDX-level lazy registry**: manifest pattern (`generate-manifest.mjs` + `src/content/manifest.generated.ts`). Per-MDX dynamic chunk. localized chunk 110→32 KB gz (-78 KB gz). useEntity hook, EntityLoading + EntityNotFound paylaşılan bileşenler. Vite plugin (rihlaContentManifest) HMR. Validate runtime'dan build-time'a (`prebuild`). | Theme.atlasAnchors yok (Atlas'ta tema rotaları yok); endulus-sofrasi cluster yok; Word'lerde "yer haritası bağlamı" yok. | ~%28 |
| **7 / 2** | Theme.atlasAnchors veri tarafı + Atlas'ta tema pin'leri (halo + dotted-sepia path). lazy parser (loader chunk ayrıldı, ~30 KB gz). endulus-sofrasi.mdx (sugar + lemon + alcohol cluster). Bağdat'ta üç-tip yelpaze (Word + Person + Book aynı yerde). | endulus-sofrasi 3 word; cluster genişlemesi gerekiyor (cotton/orange/coffee). Word.atlasAnchor tek-yer (Word.atlasAnchors yok). ThemePage'de mini-Atlas yok. | ~%29 |
| **7 / 3** | (Üç-kollu sprint) (A) validate-corpus ↔ atlas.ts tsx üzerinden auto-sync (manuel slug Set'i öldü). (B) endulus-sofrasi cluster genişlemesi: cotton + orange + coffee — 3 yeni showcase Word, iki-tabakalı havza. (C) ThemePage mini-Atlas: anchors highlight + figcaption rota listesi. | WordPage'de mini-Atlas yok; MiniAtlas adı yanıltıcı (Theme-spesifik isim). Person multi-anchor yok. | ~%29.5 |
| **7 / 4** | (Üç-kollu sprint) (A) Atlas + MiniAtlas seas paylaşımı (AtlasGeography ortak component). (B) WordPage mini-Atlas + MiniAtlas rename (Theme-spesifik değil). (C) **Person.atlasAnchors** çoklu-yer rotası (tip + manifest + validate + Atlas runtime); al-khwarizmi Hârezm→Bağdat. | Book.atlasAnchors yok (Person için kurulan altyapı simetrik olarak Book'a uzanmalı). Loader-tarafında *gizli regresyon*: parsePerson/parseTheme `atlasAnchors`'i okumuyor — Atlas'ta görünüyor (manifest üzerinden) ama PersonPage/ThemePage MiniAtlas'larında görünmüyor. Henüz farkedilmedi. | ~%29.8 |
| **7 / 5** | (Üç-kollu sprint) (A) `reshapeAtlasAnchors` ortak helper + üç latent regresyonun kapatılması (parsePerson, parseTheme, parseBook). (B) **Book.atlasAnchors** simetrik altyapı: tip + manifest + validate + Atlas runtime + BookPage MiniAtlas + al-jabr.mdx (Bağdat → Toledo). (C) GRAND_PLAN §11 ilerleme tablosu + §12 yüzdelik tamamlanma tahmini. | İçerik darboğazı: 9 word + 1 person + 1 book + 3 theme = 14 entity; hedef ~240 entity. `/journeys` yok. `/timeline` yok. `/words` filtre paneli yok (sadece Homepage dizin). Polish layer açılmadı (sayfa geçişleri, ink-drop loading, 404 manuscript, easter egg). Audio yok. OG image, kolofon, deploy yok. Word.atlasAnchors yok (suggestion #5, en büyük data-model genişlemesi). | ~%30 |
| **7 / 6** | (Üç-kollu sprint) (A) **Word.atlasAnchors** — dört-entity multi-anchor mimari simetrisinin kapanması (Atlas runtime üç stratified tipi tek döngüde işliyor); cotton üç-anchor rota (Delhi → Bağdat → Kurtuba). (B) **MiniAtlas hover tooltip**: anchor dot'larında year + label mini-kart, klavye-paritesi (tabIndex/focus), sabit etiketler korunur. (C) **`journey_type` Word schema** + `JourneyBadge` component + i18n locales 3 dilde — `/journeys/:type` route'unun veri tarafı; 9 mevcut Word kategorize (3 translator + 3 andalusian + 2 merchant + 1 alchemist). | `/journeys` ve `/journeys/:type` route'ları henüz yok (sadece schema açıldı). Word.atlasAnchors yalnız cotton'da denendi (orange/sugar/coffee adayları bekliyor). HomePage'de JourneyBadge yok (sadece WordPage). JOURNEY_TYPES listesi üç yerde duplicate (refactor adayı). `/timeline` yok. `/words` filtre paneli yok. Polish layer açılmadı. Audio yok. OG image, kolofon, deploy yok. 3 yolculuk arketipi (crusader, astronomer, diplomatic) henüz örneksiz. | ~%32 |
| **7 / 7** | (Üç-kollu sprint) (A) **`/journeys` + `/journeys/:type` routes**: JourneysIndexPage (7 arketip dizini, Word sayılarıyla) + JourneyPage (tek arketip + Word listesi) + reverse-index (`getWordsByJourney`, `listJourneyCounts`) + 7 arketip subtitle × 3 dil i18n bundle'a (~1,000 kelime editöryel prose, factual register). (B) **HomePage Journeys section**: Atlas ile Directory arasında 7-arketip pill listesi, taksonomik gezinti katmanı (atlas: coğrafi + directory: alfabetik + journeys: taksonomik). (C) **sugar.mdx multi-anchor**: Delhi → Bağdat → Kurtuba — cotton ile birebir aynı rota; Atlas'ta iki paralel dotted-sepia çizgi Arap Yeşil Devrimi kanalını görsel olarak gösterir. | Tam essay (~600 kelime/dil/arketip = ~12,600 kelime) hâlâ yok; subtitle stub düzeyinde. 3 arketip (crusader, astronomer, diplomatic) hâlâ örneksiz Word taşıyor. Atlas multi-anchor coverage: 2/9 (cotton, sugar) — orange/coffee/lemon henüz tek-anchor. Catalogue tier hâlâ açılmadı. `/words` filtre paneli yok. Polish layer ve launch hazırlığı açılmadı. | ~%34 |
| **7 / 8** | (Üç-kollu sprint) (A) **Atlas geography +2**: `lisbon` (Cordoba'dan batı, [85,385], Portekiz tatlı portakal terminus'u) + `mokha` (Cairo'dan güney-doğu, [555,645], Yemen Sufi kahve kökeni). Atlas viewBox'ının batı ucu ve güney ucu ilk defa varlık-anchor noktaları haline geldi (toplam 17→19 place). (B) **orange + coffee 4-hop multi-anchor**: orange Delhi → Şam → Kurtuba → Lizbon (Sanskrit *nāraṅga*'dan Portekiz tatlı portakalına; cotton/sugar'dan Damascus'ta ayrışıyor); coffee Mokha → Kahire → Konstantinopolis → Londra (Yemen Sufi → Memlûk → Osmanlı → Aydınlanma; tamamen farklı eksende, güney-kuzey). Atlas argümanı **tek-olgu tek-rota**'dan **çoklu-olgu çoklu-rota**'ya — 4 Word + 4 bağımsız tarihsel olgu + 3 görsel-ayrı atlas rotası. (C) **HomePage Word kartlarında inline journey tag**: `EntityCard`'a opsiyonel `journeyTag?: JourneyType` prop'u, kart başlığı üstünde küçük moss-yeşili "◆ ARKETİP" mono-uppercase indicator (Persons/Books/Themes sütunlarında yok). 9/9 Word'de görsel journey tag. | Tam essay (~600 kelime/dil/arketip = ~12,600 kelime) hâlâ yok. 3 arketip (crusader, astronomer, diplomatic) hâlâ örneksiz Word taşıyor. Atlas multi-anchor coverage: 4/9 — alcohol/algebra/algorithm/lemon/zero hâlâ tek-anchor (lemon ibn-Sīnā ekseninde adaylanır). Catalogue tier hâlâ açılmadı (korpus skoru'nun en büyük itici gücü). `/words` filtre paneli yok. Atlas bölge etiketleri (`region` field) hâlâ runtime'da görünmüyor. Atlas mobile/responsive ölçeklendirme yok. Polish layer ve launch hazırlığı açılmadı. | ~%34-35 |
| **7 / 9** | (Üç-kollu sprint, diversifiye prong'larla) (A) **lemon 4-hop multi-anchor**: Delhi → Bağdat → Kurtuba → Londra (Indo-Burmese Munda *nimbū* → Arap tarımı *līmūn* → Endülüs bahçesi Ibn al-'Awwām → Royal Navy iskorbüt Lind 1747). cotton/sugar ile ilk 3 hop'ta overlap, sonra Londra'ya kuzeye kırılır — Atlas'ta 5. multi-anchor Word, 4 görsel-ayrı rotanın 4. argümanı (Arap kanal + 4. hop İmparatorluk hijyeni). Word.atlasAnchors coverage 4/9 → 5/9 (%44 → %56). 7/8 önerisi #4'teki bukhara/Qānūn ekseni reddedildi; gerçek strata'ya bağlı kalındı. (B) **JOURNEY_TYPES DRY refactor**: 4-yer duplikasyonu (entities.ts canonical + 2 .mjs script local + loader.ts/JourneyPage.tsx zaten import) tek doğru kaynağa indirildi. `scripts/generate-manifest.mjs` artık tsx üzerinden çalışıyor (package.json + vite.config.ts spawn güncellendi), `validate-corpus.mjs` zaten tsx kullanıyordu. Negatif test ✓ — error mesajındaki canonical 7 üye entities.ts'ten gelir. 7/6 "Yapılmayan" listesi'ndeki "JOURNEY_TYPES three places duplicate" notu kapandı. (C) **NotFound manuscript redesign**: inline-styled minimal hâl (dilim 1) manuscript-and-stratigraphy estetiğine taşındı — "№ 404" mono catalog numarası + lyrical display başlık 3 dilde + ◇ stratigraphic rule + editöryel gövde ("perhaps a link turned in the wrong direction") + marjinal-not stilinde back link + RTL hijyen (Arapça `٤٠٤`, Amiri için italic→bold). Polish layer ilk gerçek girişi (§12.4 7 → 9). NotFound 1.05 KB gz lazy chunk, eager paint'i etkilemiyor. | Tam essay (~600 kelime/dil/arketip = ~12,600 kelime) hâlâ yok. 3 arketip (crusader, astronomer, diplomatic) hâlâ örneksiz Word taşıyor. Atlas multi-anchor coverage 5/9 — alcohol/algebra/algorithm/zero hâlâ tek-anchor. Catalogue tier hâlâ açılmadı. `/words` filtre paneli yok. Polish layer NotFound dışında açılmadı (sayfa geçişleri, ink-drop loading, easter egg). Atlas mobile/responsive yok. Audio yok. OG image, kolofon, deploy yok. al-Khwārizmī Person hâlâ 2-hop (Hârezm → Bağdat); 4-hop'a çıkarsa bilimsel diaspora görsel argümanı genişler. | ~%35-36 |
| **7 / 10** | (Üç-kollu sprint, diversifiye prong'larla) (A) **`/kelimeler` Catalogue listing route**: `WORDS_LIST_SEGMENT = 'kelimeler'` + `wordsListUrl(lang)` helper paths.ts'te; lazy `WordsListPage` AppRoutes'ta; ~150 satır TSX + ~180 satır CSS yeni sayfa — h1 başlık + sayım rozeti + 3 sort modu segmented toolbar (alfabetik / arketipe göre / atlas rota sayısı, ARIA toolbar pattern) + responsive grid (1-4 sütun, minmax 280px) + manuscript-aesthetic Word kartları (◆ ARKETİP tag + h2 başlık + literal meaning + ◇ N-hop rozeti yalnız multi-anchor için). HomePage `DirectoryColumn` bileşenine opsiyonel `headerLink?: { to, label }` prop'u eklendi — yalnız Words sütununda *"tümünü gör →"* italik moss link (Persons/Books/Themes'te yok; Catalogue route'ları onlar için henüz yok). i18n 3 dilde 8 yeni `wordsList.*` anahtar. Filter paneli **henüz açılmadı** (9 Word için over-engineered; catalogue tier ile birlikte gelir). (B) **al-Khwārizmī 4-hop multi-anchor Person** (ilk Person 4-hop): Hârezm → Bağdat → Tuleytula → Floransa (doğum → Bayt al-Ḥikma → Toledo çeviri hareketi *Algorismi* adının Avrupa'ya girişi → Fibonacci *Liber Abaci* Toskana resepsiyonu). Atlas haritasında **bilim diaspora görsel argümanı** — kelime taşınması değil, kavram-sistem aktarımı; tek Person rotası "yön değişimi" (Toledo → Florence doğuya geri) ile öne çıkıyor. Person multi-anchor coverage 0/1 → 1/1 (showcase). 3 → 4 görsel atlas rotası (cotton+sugar+lemon overlap + orange + coffee + al-Khwarizmi). (C) **ManuscriptLoader** paylaşılan bileşen: AppRoutes RouteFallback + EntityPageStates EntityLoading'in iki inline-styled minimal bloğu tek polish'lı bileşene refactor — pulse'lu ◇ gold-leaf glyph (1.8s ease-in-out infinite, opacity 0.25-0.75 + scale 0.95-1.05, composite-only animation) + italik serif loading metni (Amiri için italic→normal Arapça override) + `prefers-reduced-motion` saygısı (animasyon kapanır, ◇ statik). Polish layer ikinci girişi (NotFound dilim 7/9.C'de birinciydi). +0.32 KB gz eager (Suspense fallback chicken-and-egg — lazy yapılamaz). | Tam essay (~600 kelime/dil/arketip) hâlâ yok. 3 arketip örneksiz. Atlas multi-anchor coverage 5/9 Word + 1/1 Person — alcohol/algebra/algorithm/zero hâlâ tek-anchor Word; al-jabr Book 2-hop kalıyor (4-hop'a çıkarılabilir). Catalogue tier hâlâ açılmadı (route ve listing UI hazır, içerik bekliyor). `/kelimeler` filter paneli açılmadı (catalogue tier ile gelir). Polish layer derinleşmedi (sayfa geçiş animasyonu yok, easter egg yok). Atlas mobile/responsive yok. Audio, OG image, kolofon, deploy yok. Theme.atlasAnchors zenginleşmemiş (mevcut 2-3 hop'lar editöryel olarak derinleştirilebilir). | ~%36 |
| **7 / 11** | (Üç-kollu sprint, polish + entity-tip simetrisi + browser entegrasyonu) (A) **Global page-enter animation**: tek CSS kuralı `main { animation: page-enter 0.35s cubic-bezier(0.4, 0, 0.2, 1) both; }` + `@keyframes` opacity 0→1 + translateY 8px→0. Her `<main>` mount'unda tetiklenir — initial app load, entity-type değişimleri (HomePage→WordPage). Same-type slug değişiminde tetiklenmez (kasıtlı: instant content swap). prefers-reduced-motion global universal selector kuralıyla otomatik nötrleşir. Zero JS, ~50 bytes CSS, framer-motion açılmadı (eager chunk'a 10-15 KB overhead istemiyoruz). Polish layer 3. girişi. (B) **al-jabr 4-hop multi-anchor Book** (ilk Book 4-hop): Bağdat → Tuleytula → Floransa → Londra (yazılış c. 825 → 1145 Robert of Chester Latin çevirisi → 1202 Fibonacci *Liber Abaci* Toskana resepsiyonu → **1831 Frederic Rosen Oriental Translation Fund critical edition**). Editöryel argüman: *kitap, adamı 600 yıl aşar* — al-Khwārizmī Person rotası Floransa'da biter, al-jabr Book rotası Londra'da 19. yy critical edition'ıyla yeni hayat bulur. al-Khwārizmī Person rotasıyla Bağdat→Toledo→Florence kesişiyor (kitap düşüncenin taşıyıcısı), Londra ise sadece kitap'a özgü modern philological recovery momenti. Entity-tip simetrisi tamamlandı: **5 Word + 1 Person + 1 Book** çoklu-anchor, üçü de `atlasAnchors[]` mimarisinde. 5 → 6 görsel atlas rotası. (C) **`usePageTitle` hook + 9-sayfa entegrasyonu**: `document.title` sayfa-bazlı yansır — template `<entity adı> · Riḥlat al-Kalimāt`; HomePage brand-only, entity sayfalarında localized title (pickLang), Journey sayfalarında i18n key, NotFound "404". Browser sekme + bookmark + history hijyeni; react-helmet açılmadı (5 KB overhead için tek alan değişikliği). Hook ~30 bytes gz, tree-shake sonrası 9 sayfada paylaşılır. Polish layer 4. girişi. | Tam essay (~600 kelime/dil/arketip) hâlâ yok. 3 arketip örneksiz. Atlas multi-anchor coverage 5/9 Word — alcohol/algebra/algorithm/zero hâlâ tek-anchor Word (showcase'in tüm Word'lerine multi-anchor erişimi yok). Catalogue tier hâlâ açılmadı (route + UI hazır, içerik bekliyor). `/kelimeler` filter paneli açılmadı. Polish layer 4 bileşenli ama yine 5. giriş açık (easter egg, OG image, manuscript-themed favicon). Atlas mobile/responsive yok. Atlas yıl-eksenli timeline view yok (anchor `year` verileri hazır, UI eklemesi yok). Audio, kolofon, deploy yok. Theme.atlasAnchors zenginleşmemiş. | ~%39 |
| **7 / 12** | (Üç-kollu sprint, catalogue tier açılışı) (A) **Catalogue tier — 6 yeni Word, tier'ın yapısal açılışı**: admiral (crusader, cordoba) + azimuth (astronomer, toledo) + tariff (diplomatic, cairo) + damask (merchant, damascus) + alembic (alchemist, baghdad) + assassin (crusader, damascus). Üç eksik arketip (crusader, astronomer, diplomatic) tek dilimde açıldı; 7 yolculuk arketipi artık 7/7 doluluk (önceki 4/7). 5 ayrı atlas anchor üzerine dağıtım — coğrafi yığılma yok. Her catalogue Word 5 stratum × 3 dil (TR + EN + AR), tek-anchor, 3 kaynak (peer-reviewed scholarship), `siblings` çoğunlukla boş (azimuth → algorithm + alembic → alcohol sibling bağı bilinçle eklendi: *aynı Tuleytula tezgâhı*, *aynı al- öneki*). Editöryel pattern: catalogue Words showcase'in ~%60'ı uzunlukta; mimari kalıpla bir yapılı (5 stratum + sources + variants), retoriği daha sıkı; *bir leke nasıl bir meslek adına dönüşür* (assassin) gibi keskin argümanlar. Tier schema'sı dilim 2'den beri vardı (`Tier = 'showcase' | 'catalogue'`), loader.ts'de default 'catalogue', validate'de tier-aware `assertShowcaseLanguageCoverage` — yani mimari maliyet sıfır, içerik maliyeti yüz. Korpus: 9 Word → 15 Word (+%67), toplam entity 14 → 20 (+%43). 15 lazy chunk × ~5-7 KB gz/each, eager bundle değişmedi. (B) **`/kelimeler` tier filter UI**: WordsListPage'e ikinci toolbar — `Tümü / Vitrin / Katalog` segmented control. State: `tierFilter: 'all' | 'showcase' | 'catalogue'`, default 'all'. Filter ÖNCE, sort SONRA — bağımsız useMemo katmanları (filter ve sort bağımsız invalidate olur). `SortButton`, generic `ToolbarButton<M extends string>`'a yükseltildi; TS 5.6 instantiation expressions ile typed alias'lar (`const SortButton = ToolbarButton<SortMode>`, `const FilterButton = ToolbarButton<TierFilter>`). Filter aktifken count display "X / Y girdi" formatında (`wordsList.countFiltered`). i18n 3 dilde 5 yeni `wordsList.*` anahtar (filterLabel, filterAll, filterShowcase, filterCatalogue, countFiltered). Toplam wordsList anahtar sayısı 9 → 14. 7/10'da yorum satırında *"catalogue tier ile birlikte gelir"* denmişti — bu dilimde geldi. CSS: `.wordslist-filter` ayrı class, `.wordslist-sort` ile semantik ayrım (sort ≠ filter), button stili paylaşımlı (`.wordslist-sort-btn`). (C) **§11 + §12.5 + README bookkeeping**: 7/12 row eklendi; §12.5 tablosu shift (7/11 → 7/12 latest sütun, 7/10 → 7/11 önceki sütun); skorlar +1.5 corpus boyutu × 0.5 ağırlık + UI completeness + roadmap polish layer kaymaları. README Durum bloğu + dilim 12 section. | Showcase Word'lerden 4'ü hâlâ tek-anchor (alcohol, algebra, algorithm, zero). Catalogue tier şu an 6 Word — hedef ~%50 noktasına ulaşmak için ~20-25 catalogue daha gerekiyor (~3-4 dilim). Catalogue Word'lerin hiçbiri multi-anchor değil (editöryel tercih: tek-anchor catalogue'un dilini sade tut). Person ve Book için catalogue örneği yok (sadece Word'lerde tier açıldı). Theme.atlasAnchors zenginleşmemiş. `/kelimeler` filter URL'e taşınmadı (deep-link için ileride — "andalusian + showcase" gibi state paylaşılabilir olunca). HomePage Directory sütununda showcase/catalogue ayrımı görsel değil (Atlas dot'unda da değil — tüm anchor'lar aynı görünüyor). Polish layer derinleşmedi (page-enter, usePageTitle, NotFound, ManuscriptLoader hâlâ 4 bileşen — easter egg, OG image, audio, favicon, kolofon bekliyor). Atlas mobile/responsive yok. Audio yok. Deploy yok. | **~%43** |
| **7 / 13** | (Üç-kollu sprint, Shape α — catalogue depth) (A) **4 yeni catalogue Word, üç eksik arketip × anchor kombinasyonu dolduran**: cipher (translator, toledo — *aynı Arapça ṣifr'ın Latin kalemde ikiye dallanışı*, zero ile bilinçli sibling bağı), escabeche (andalusian, cordoba — Endülüs Sofrası cluster'ının catalogue tier'a inişi, *sikbāj* → Sefarad diasporası + Manila Galyonu üç-kıta yayılımı), check (diplomatic, cordoba — Persian *šāh* → Arabic shaṭranj → Latin scaccus/eschec → English check/checkmate/exchequer/cheque, *en semantik açıdan üretken catalogue Word*), arsenal (merchant, cairo — *dār aṣ-ṣināʿa* Fatımî tersanesi → Venedik Arsenale; admiral ile sibling bağı, *aynı denizci-devlet sözlüğü, aynı Norman-Sicilya tüccar koridorundan Latin'e*). Korpus: 15 Word → 19 Word (+%27), toplam entity 20 → 24 (+%20). Catalogue tier 6 → 10 Word (+%67 catalogue içinde). 4 lazy chunk: escabeche 10.10 KB gz, cipher 10.23 KB gz, arsenal 10.76 KB gz, check 11.08 KB gz — *showcase tier'ın ~%55'i kadar*, 7/12'nin catalogue Word'lerinden ~%25 daha derin (cipher/check'in semantik genişliği uzun strata 1 prose'larını gerektiriyor). 7/12'nin pattern'i (sibling bağı bilinçle, çoğunlukla boş) korundu: cipher↔zero ve arsenal↔admiral iki sibling çifti — *aynı Latin sayfası iki sözcüğe dallanıyor*, *aynı denizci sözlüğü iki kuruma dallanıyor*. (B) **`zero` 4-hop multi-anchor** (showcase'in beşinci multi-anchor Word'ü, ikinci translator-archetype rotası): Bhillamāla (c. 628, Brahmagupta) → Bağdat (c. 825, al-Khwārizmī) → Tuleytula (c. 1145, Adelard) → Floransa (1202-1494, Fibonacci-Pacioli). cotton/sugar/lemon Hindistan-Arap-Endülüs *agricultural* kanalına paralel bir Hindistan-Arap-Toledo-Pisa *mathematical* kanalı — Atlas'ta iki argüman görsel-olarak simetrik. Showcase multi-anchor coverage 5/9 → 6/9 (%56 → %67); kalan tek-anchor: alcohol, algebra, algorithm. (C) **Atlas dot tier ayrımı** (görsel hiyerarşi): `AnchoredEntity.tier?: Tier \| ThemeTier` alanı; `toAnchored` `entity.tier`'i taşır; `Atlas.tsx` `.atlas-pin--light` class'ını catalogue/cluster pin'lerine ekler; `Atlas.css` light-tier kuralları (mark `r: 3.5` vs default 5, halo `r: 8.5` vs 11 + opacity 0.55 vs 0.85). SVG `r` modern tarayıcılarda CSS özelliği — eski tarayıcılarda SVG default fallback'i makul. Hover'a alındığında halo opacity 0.55 → 0.85 (kullanıcı odaklandığı şeyin tier'ından emin olur, ama tıklama davranışı aynı). Polish layer 5. girişi (~50 byte CSS, JS yok). | Showcase Word'lerden 3'ü hâlâ tek-anchor (alcohol, algebra, algorithm). Catalogue tier 10 Word — hedef ~%50 noktasına 15-20 catalogue daha. Catalogue Word'lerin hiçbiri hâlâ multi-anchor (editöryel tercih korunuyor). **Person ve Book için catalogue örneği yok — Shape β'nın hedefi.** HomePage Directory sütununda showcase/catalogue ayrımı görsel değil (Atlas dot'unda çözüldü ama directory'de değil). Theme.atlasAnchors zenginleşmemiş. `/kelimeler` filter URL'e taşınmadı. Atlas timeline (year-axis) view yok — *Shape γ'nın hedefi*. Word-page stratigraphic ruler scroll-progress'e bağlanmamış (§2.6'nın "diferansiyasyon" şartı). Audio yok. OG image, favicon, kolofon, deploy yok. | **~%46** |
| **7 / 14** | (Üç-kollu sprint, Shape β — entity-tip simetrisi) (A) **İlk 2 catalogue Person**: ibn-al-haytham (astronomer, multi-anchor Bağdat+Cairo+Paris — *Kitāb al-Manāẓir* yedi kitabı el-Hâkim'in ev-arrestindeki on yılda yazıldı, Witelo→Bacon→Kepler hattıyla Avrupa optik müfredatının altı yüz yıllık temeli; A. I. Sabra'nın deyişiyle *one period of captivity, one scientific field*; circle: Witelo + Kepler + Sabra), hunayn-ibn-ishaq (translator, multi-anchor Bağdat+Konstantinopolis — Bayt al-Ḥikma'nın baş çevirmeni, Galen Yunanca külliyâtının %30'u sadece onun Arapçasından geriye çevrilerek bilinir; *Risāla fī mā tarjamahu min kutub Jālīnūs* çeviri biliminin doğum belgesi; circle: oğlu İshak + Konstantinüs Africanus + Gerrit Bos). Korpus 1 Person → 3 Person (+%200); ilk multi-anchor catalogue Person'lar (Atlas'ta multi-anchor coverage Word+Person+Book birleşik 6/13 → 8/15). Editöryel pattern: showcase Person'un circle.members'ı genelde 5+; catalogue 3-4 → daha sıkı düzenleme. Stratum sayısı yapısal olarak 5 (değişmedi); sources catalogue Word standardı 3'le simetrik. **Multi-anchor argüman: catalogue Person'ları "minor" Person olarak değil "kompakt deep" olarak konumlandırmak — showcase düşüş değil, başka bir yoğunluk türü.** (B) **İlk catalogue Book**: al-qanun-fi-al-tibb (İbn Sînâ, multi-anchor Buhara+Toledo+Roma — c. 1012-1024 boyunca beş kitap parça parça yazıldı, 1187 Cremonalı Gerard'ın Latince *Liber Canonis*'i Avrupa tıp eğitiminin asıl kitabı oldu altı yüz yıl, 1593 Roma Medici Doğu Matbaası Avrupa'da basılan ilk Arapça kitap olarak Arapça orijinalin editio princeps'i; *canonical* kelimesinin modern semantik tortusu doğrudan bu kitabın altı yüz yıllık okutulmasından; relatedWords: alcohol + alembic — V. kitap damıtma drogları). authorSlug `ibn-sina` placeholder olarak duruyor (validator authorSlug üzerinden CrossLink integrity kontrolü yapmıyor; Avicenna catalogue Person olarak ileri dilime ertelendi). 1 Book → 2 Book; 4 manuscript + 5 translation (showcase al-jabr ile yapısal denklik). (C) **HomePage Directory tier indicator**: EntityCard'a `tier?: Tier \| ThemeTier` prop; başlık satırının sağında küçük glyph — ◆ (showcase/magnum, opacity 0.65) / ◇ (catalogue/cluster, opacity 0.45); kart hover'a alındığında opacity 1.0; pointer-events:none + cursor default (kart-link bütünlüğü). Title-row flex container'ı title + glyph'i baseline-aligned hizalar. Atlas dot tier ayrımı (7/13.C) Directory'ye uzantı: aynı editöryel hiyerarşi iki katmanda görsel sicilini bulur — Atlas (coğrafi gezinti) **+** Directory (alfabetik dizin). i18n 3 dilde 2 yeni `home.*` anahtar (tierShowcase, tierCatalogue) — ARIA-label + title attr için. Type imports: HomePage.tsx artık `Tier` ve `ThemeTier`'i `JourneyType` ile birlikte import eder. Polish layer 6. girişi: tier-dot Atlas (7/13.C) + tier-glyph Directory (7/14.C) — *iki katmandaki tek argüman*. Korpus: 19 W + 3 P + 2 B + 3 T = 27 entity (önceki 24). 3 lazy chunk: ibn-al-haytham 13.27 KB gz, hunayn-ibn-ishaq 13.62 KB gz, al-qanun-fi-al-tibb 14.85 KB gz — showcase Person/Book'tan ~%30 kısa, catalogue Word'lerden ~%30 uzun (Person+Book yapısal olarak daha geniş frontmatter taşır: circle, manuscripts, translations). HomePage chunk 8.37 → 8.49 KB gz (+0.12 KB tier-row JSX + i18n); index eager 81.67 → 81.80 KB gz (+0.13 KB tier render + i18n keys). registry 18.08 → 21.35 KB gz (+3.27 KB — manifest 1→3 Person + 1→2 Book artışı: Person/Book summary'leri Word'den ~2× büyük). | Showcase Word'lerden hâlâ 3'ü tek-anchor (alcohol, algebra, algorithm). Catalogue tier şimdi 10 Word + 2 Person + 1 Book; Theme catalogue (cluster) henüz açılmadı. Avicenna'nın kendisi (Book.authorSlug = `ibn-sina`) Person olarak yok — Book'lar authorSlug için CrossLink integrity yok ama tutarlılık için ileri dilime giriyor. Theme.atlasAnchors zenginleşmemiş. `/kelimeler` filter URL'e taşınmadı (Person ve Book için liste sayfası de yok aslında — sadece HomePage Directory üzerinden erişim). Atlas timeline (year-axis) view yok — *Shape γ'nın hedefi, sıradaki dilim*. Word-page stratigraphic ruler scroll-progress'e bağlanmamış (§2.6 diferansiyasyon — *Shape γ*). 6. polish entry için manuscript favicon ya da kolofon `/about` page ya da OG image bekliyor. Audio, deploy yok. Mobile/responsive Atlas yok. | **~%50** |
| **7 / 15** | (Üç-kollu sprint, Shape γ — zamanın görünür hale gelmesi) (A) **Atlas timeline view**: yıl-eksenli filtreleme. Yeni `src/utils/year.ts` modülü — `parseYearStart`/`parseYearEnd`/`formatYear`; korpustaki 142 farklı year-string formatını dört strateji-katmanlı parser ile sayıya çevirir (BCE/MÖ tespiti → yüzyıl notasyonu "14th c.", "12. yy" → ilk uzun sayı → sözel fallback). `AnchoredEntity.startYear?: number \| null` field'ı multi-anchor pin'lere yıl bilgisi taşır; tek-yer (atlasAnchor fallback) pin'leri null (filtre dışı, hep görünür). `yearFilter: number \| null` state, default null (filtre yok); `yearRange` useMemo korpus min-max'ı hesaplar. Slider toolbar atlas-wrap + atlas-legend arasında native `<input type=range>` + reset button (kullanıcı seçim aktifken görünür); 3 dilde 4 yeni `atlas.timeline*` i18n key (Label/All/UpTo/Reset). Pin render `.atlas-pin--future` class'ı yearFilter > startYear ise pin'i fade-out eder (opacity 0.15, pointer-events: none, 300ms transition; light-tier ile cascade çakışmasız). Cumulative semantik: kullanıcı 700'de duraklar → hâlâ az pin görünür; 1100'e ittirir → pin'ler doluyor; 1900'de → hepsi. *Bir korpusun zaman içinde nasıl biriktiğini* görünür hale getirir; cotton'un -3000 evcilleştirmesinden zero'nun 1494 *editio princeps*'ine kadar tarihsel oluş görsel argüman olur. (B) **Word-page Stratigraphy proportional mode**: §2.6 GRAND_PLAN'ın *diferansiyasyon* şartının ikinci katmanı — mevcut Stratigraphy zaten scroll-progress'le aktif-stratum gösteriyordu, ama 5 stratum *eşit aralıklı* duruyordu; yıl mesafeleri (2026/1700/1500/825/628) görsel olarak gizliydi. Toggle (≡/⫷ glyph) `isProportional` state'i değiştirir; aktifken stop'lar `position: absolute` + `inset-block-start: var(--strat-pos)` ile yıl-orantılı konumlanır. `yearPositions` useMemo `(maxY - y) / span * 100%` hesaplar — %0 = en yeni (üst), %100 = en eski (alt). Yıl bilinmeyen stratum'lar eşit-aralık fallback'ine düşer; en az 2 sayısal yıl yoksa toggle "no-op" (zaten eşit görünür). Mobile (<900px): toggle gizli, track yatay (logical-property çakışmaması için override). Editöryel argüman: *eşit mod okumayı kolaylaştırır*, *orantılı mod gerçeği gösterir* — kullanıcı tercihi olarak sunulan iki sicil. 3 dilde 2 yeni `stratigraphy.modeProportional*` i18n key. (C) **6. polish entry — manuscript favicon**: `public/favicon.svg` — Atlas pin geometrisinin manuscript-arka planlı kondansasyonu (parchment fill #f4ecd8, lazaward halo #1f4e7a, gold mark #c9941b, sepia ✦ köşe yıldızları). 64×64 viewBox, 16×16 da net kalır. `index.html`'e `<link rel="icon" type="image/svg+xml">` + apple-touch-icon. 2.7 KB tek dosya, eager bundle değişmedi (Vite static asset olarak servis eder). Polish layer 6/6 dolu: page-enter + usePageTitle + NotFound + ManuscriptLoader + Atlas tier-dot + Directory tier-glyph + (γ.C yedinci ama 6. *non-tier* entry — favicon tier'la bağımsız). | Korpus genişlemedi (γ UI dilimi; içerik dilimi değil). Atlas timeline'da yıl-bilinmeyen pin'ler filtrelenmez (editöryel tercih) — kullanıcı "tüm zaman" filtrelemesi yapsa bile tek-yer fallback pin'leri görür. Proportional Stratigraphy mobil'de devre dışı (yatay barda absolute pozisyon işe yaramaz). Atlas timeline + Stratigraphy toggle URL'e taşınmadı (state share/deep-link yok). Word'ler için liste sayfası dışında Person/Book için liste sayfası hâlâ yok (`/kisiler`, `/kitaplar` route'ları gelmedi). Theme catalogue (cluster) tier açılmadı. Avicenna catalogue Person hâlâ yok. Apple-touch-icon ayrı PNG'ye düşürülmedi (SVG kullanılıyor, çoğu modern iOS destekler ama bazı eski iOS sürümleri PNG bekler). Kolofon `/about` page yok. OG image yok. Audio yok. Deploy yok. | **~%53** |
| **7 / 16** | (Üç-kollu sprint, Shape δ — liste simetrisi + katalog derinliği) (A) **`/kisiler` + `/kitaplar` listing routes**: entity-tip simetri zincirinin liste-katmanı kapanışı. `PERSONS_LIST_SEGMENT='kisiler'` + `BOOKS_LIST_SEGMENT='kitaplar'` + `personsListUrl/booksListUrl` helper'lar paths.ts'te; 2 yeni lazy route AppRoutes'ta. `WordsListPage.css` → `EntityListPage.css` rename + tüm `wordslist-*` class'ları `entitylist-*`'a taşındı — 3 sayfa ortak stylesheet (4.94 KB raw / 1.21 KB gz tek chunk). `ToolbarButton` generic'i `@/components/ToolbarButton.tsx` paylaşılan dosyaya çekildi (3 sayfada call-site netliği için typed alias'lar lokalde kalır). Sort modları her sayfaya özgü: PersonsListPage *alfabetik / yaşam dönemi / atlas rotası*; BooksListPage *alfabetik / yazılış tarihi / atlas rotası*. Kronolojik sort için `PersonSummary.lifespan?` + `BookSummary.composedYear?` manifest'e eklendi; `parseYearStart` (7/15 utility'si) kullanılarak Number'a çevrilir, bilinmeyen yıl Infinity'ye düşer. Tier filtresi (Tümü/Vitrin/Katalog) üç sayfada da aynı. HomePage `DirectoryColumn` Persons + Books sütunlarına da *"tümünü gör →"* link'i (önceki yalnız Words'te vardı; entity-tip simetrisi homepage'de de kapandı). i18n 3 dilde 2 yeni namespace: `personsList.*` + `booksList.*` (her biri 13 anahtar — toplam 26 × 3 = 78 yeni anahtar). Build: WordsListPage 3.23 KB / 1.14 KB gz, PersonsListPage 3.47 KB / 1.22 KB gz, BooksListPage 3.48 KB / 1.23 KB gz — sayfaların her biri kart-mantık tarafından ufak (ortak CSS dışarıda). (B) **İlk catalogue-Word-anchored cluster theme — `lugat-al-bahr-arabi`**: *Arap Denizci Sözlüğü*. 3. cluster theme (mevcut iki cluster showcase Word grupluyordu); ilk olarak iki catalogue Word'ü yan yana koyan (admiral + arsenal). Editöryel argüman: *bir Akdeniz devletinin denizini iki kelimeyle adlandırması — yapı ve yetki*. *dār aṣ-ṣināʿa* → Venedik Arsenale, *amīr al-baḥr* → Norman *ammiratus* → admiral. 3 dilde ~430 kelime/dil essay (showcase magnum hindu-arabic-numerals'in ~%35'i kadar; cluster yoğunluğu — editöryel disiplin). 3-anchor route: cairo (Fâtımî tersanesi, c. 950) → palermo (Norman saray, c. 1130) → venice (Arsenale, 1104). Lazy chunk 18.21 KB / 9.23 KB gz. Atlas'a 6. cluster/theme rotası, denizci-imparatorluk argümanını magnum-mathematical (Hint-Arap rakamları) ve cluster-agricultural (Endülüs Sofrası) yanına ekler — *üçüncü Akdeniz sözlük kategorisi: kurumsal*. 2 yeni atlas yeri: palermo [410, 405] (Sicilya, Norman-Arab admiralty pivot) + venice [400, 295] (Adriyatik başı). Toplam atlas yeri 19 → 22 (yeni: palermo, venice, hamadan). (C) **Avicenna catalogue Person — `ibn-sina`** + **Book.authorSlug integrity check**: al-qanun-fi-al-tibb'in dilim 7/14'te bırakılan `authorSlug: ibn-sina` placeholder'ı kapandı. ibn-sina catalogue Person, multi-anchor bukhara (980-1002 — Sâmânî saray hekimliği) + hamadan (1015-1037 — Büveyhî vezirliği + *Kânûn* + *Şifâ* tamamlanması). circle.direction `forward`, 3 üye: ibn-Rushd (rakip), Albertus Magnus (Latin taşıyıcı), Étienne Gilson (modern felsefî kurtarıcı). wordsIndebted: alcohol + alembic (*Kânûn* Beşinci Kitabı'nın damıtma sözlüğü). works: al-qanun-fi-al-tibb (LIVE — placeholder kapandı). 1 yeni atlas yeri: hamadan [770, 365] (Cibâl, İbn Sînâ'nın ölüm + son eser yeri). 4. catalogue Person; lazy chunk 35.18 KB / 17.26 KB gz. validate-corpus.mjs'e `authorSlug integrity check` eklendi: Book.authorSlug'un Person korpusunda bulunması zorunlu — 7/14'te ertelenen yapısal disiplin. Editöryel argüman: *bir Pers'in Arapça yazdığı bir kitabın altı yüzyıl boyunca Avrupa tıp fakültesinin müfredatı olması; modern "canonical" sıfatının semantik kaynağı*. Korpus: 19 W + 4 P + 2 B + 4 T = **29 entity** (önceki 27, +%7.4). Index eager 82.17 → 82.63 KB gz (+0.46 KB — 2 list route + 2 entity register + i18n + paths helpers; çok hafif). | Tam essay (~600 kelime/dil/arketip) hâlâ yok. Showcase Word'lerden 3'ü hâlâ tek-anchor (alcohol, algebra, algorithm). Catalogue tier şimdi 10 Word + 3 Person (al-Khwārizmī showcase + 3 catalogue) + 2 Book (1 showcase + 1 catalogue) + 1 cluster theme yeni (lugat-al-bahr-arabi) — Person catalogue 3/4; **Book catalogue da artık var (1/2)**; theme catalogue tier 3 cluster + 1 magnum. Liste sayfaları tier filter URL'e taşınmadı. Theme.atlasAnchors zenginleşmesi henüz olmadı. Atlas mobile/responsive yok. Atlas timeline state URL'e taşınmadı. Polish layer 6 entry'de duruyor (favicon dahil, ε'da OG image + kolofon `/about` page öncelikli olmaya başladı). Audio yok. OG image, kolofon, deploy yok. Word.atlasAnchors coverage 6/9 — 3 showcase Word hâlâ tek-anchor. Apple-touch-icon ayrı PNG açılmadı. `/temalar` route'u henüz yok (theme korpusu 4 entity; HomePage dizini hâlâ yeterli, ileride). | **~%53** |
| **7 / 17** ⟵ *bu dilim* | (Üç-kollu sprint, Shape ζ — showcase argümanı kapanışı: 9/9 multi-anchor) (A) **alcohol 4-hop multi-anchor + tier düzeltmesi**: showcase'in son 3 tek-anchor Word'ünden birincisi. Mevcut frontmatter `tier: catalogue / atlasAnchor: cordoba` idi — ikisi de düzeltme: **alcohol tier'ı showcase'e taşındı** (~23 KB essay büyüklüğü + 3-kıta etimoloji + Câbir/Râzî/Albertus 5-stratum derinliği showcase-territory; pre-7/12 corpus'undaki kalıntı bir miskategorizasyondu), atlasAnchor `baghdad`a alındı (Câbir-Râzî alchemy pivot, en iconic durak). 4-hop rota: **cairo** (c. -1500 → c. 900, antik kohl geleneği — *al-kuḥl* antimon sülfür göz tozu) → **baghdad** (c. 800-925, Câbir bin Hayyân + er-Râzî *Hâvī*/*Esrâr al-Kîmyâ* — *al-kuḥūl* alchemik laboratuvarda *süblimat/öz* anlamına genişler) → **toledo** (c. 1180, Gerardus Cremonensis Latin tercüme korpusu — *alchol* Avrupa laboratuvarına girer) → **paris** (c. 1250-1500, Albertus Magnus + Vincent de Beauvais — *spiritus vini* söylemi; alkol *göz tozundan damıtık şarabın ruhuna* dönüşür). Etimolojik argüman editöryel olarak temiz: *bir kelimenin anlamı laboratuvarda değişti* — kohl tozu → süblimat → öz → ruh; her tabaka önceki tabakanın metaforik genişlemesi. (B) **algebra 4-hop multi-anchor**: **baghdad** (c. 825, el-Hârezmî *al-Jabr wa al-Muqābala* — *kırığı kaynaştırma ve dengeleme*; bilinmeyenli denklemin kurumsal hesabı) → **toledo** (1145, Robert of Chester *Liber algebrae et almucabola* — Arapça *al-jabr* Latin metnin başlığında *algebra* olur) → **florence** (1202-1494, Fibonacci *Liber Abaci* + Pacioli *Summa* — *algebra* İtalyan tüccar-matematikçinin günlük pratiği) → **paris** (1591-1637, Viète *In artem analyticen isagoge* + Descartes *La Géométrie* — *sembolik cebir* doğar; *x* harfi denklemde yerini alır). al-jabr Book'unun 4-hop'undan farklı: Book rota Bağdat-Toledo-Floransa-Londra (1831 Rosen *editio princeps* — *kitabın philological rescue'su*); Word rota Bağdat-Toledo-Floransa-Paris (Viète-Descartes — *kavramın sembolik dönüşümü*). Aynı kelimenin Person/Book/Word olarak üç ayrı entity'de izlediği üç ayrı 4-hop rota — *aynı kaynaktan üç ayrı tarihsel argüman*. (C) **algorithm 4-hop multi-anchor + primary anchor düzeltmesi**: mevcut `atlasAnchor: khwarazm` → `baghdad`a alındı. *Word'ün hayatı Bağdat'ta başladı, Hârizm man'ın doğduğu yer*. al-Khwārizmī Person 4-hop (khwarazm → baghdad → toledo → florence) ile algorithm Word 4-hop (baghdad → toledo → florence → cambridge) **aynı başlangıç-orta-orta'yı paylaşır, başta ve sonda diverj eder** — editöryel argüman: *adam ve kelime yollarını ayırır; kelime adamın dışına çıkar, modern çağa geçer*. Cambridge 4. anchor: Alan Turing *On Computable Numbers* (1936) — *algorithm* artık her *etkili hesaplama prosedürünün* formal adı; el-Hârezmî'nin nisbesi bilgisayar çağına geçer. Üç rota Toledo'da kesişir — *Arapça bilim sözlüğünün Avrupa'ya tek geçit noktası* (azimuth, cipher, zero, al-jabr Book, al-Khwārizmī Person ile aynı kesişme — Toledo 6 multi-anchor route'un düğüm noktası, atlas'taki en yoğun anchor). **9/9 showcase Word multi-anchor — showcase argümanı kapandı**. Yeni atlas yeri eklenmedi (tüm 6 anchor cairo/baghdad/toledo/florence/paris/cambridge önceden korpusta). Build: alcohol 20.70 / 9.92 KB gz (+~0.5), algebra 28.32 / 13.97 KB gz (+~0.7), algorithm 23.50 / 11.19 KB gz (+~0.8), registry 56.36 / 25.60 KB gz (+~2.3 — manifest yeni 12 anchor objesi taşır), index 82.63 → 82.63 KB gz **değişmedi** (multi-anchor sadece lazy + registry chunk'ı, eager'a sızıntı yok). 12 yeni anchor labels × 3 dil = 36 micro-essay; her label 1 cümle, *anchor için editöryel argüman*. | Tam essay (~600 kelime/dil/arketip) hâlâ yok — 3 arketip örneksiz. **Catalogue Word multi-anchor hâlâ 0/10** (editöryel tercih korunuyor: catalogue dilini sade tut). Catalogue Person multi-anchor 2/3 (ibn-sina 2-hop, hunayn-ibn-ishaq + ibn-al-haytham hâlâ tek-anchor). Theme.atlasAnchors zenginleşmesi olmadı. Liste sayfaları tier filter URL'e taşınmadı. Atlas mobile/responsive yok. Atlas timeline state URL'e taşınmadı. Polish layer 6 entry'de duruyor (ε'da OG image + kolofon `/about` page açılır). Audio yok. OG image, kolofon, deploy yok. Apple-touch-icon ayrı PNG açılmadı. `/temalar` route'u henüz yok. Atlas legend'da hâlâ tier-dot var ama route-line yoğunluğu için yeni bir görsel sicil yok (florence 3 multi-anchor route'un kesişimi; ileride node-degree görsel argümanı olabilir). | **~%56** |

### Tablo notları

- **Atlama sebepleri**: Oturum 5 dilim 1 README'de raporlanmadı (kullanıcı tarafından atlandı veya dilim 5/2'ye dolaylı katıldı); tabloda bırakılmadı. Oturum 7 dilim 2 README'de "**🜚 Oturum 7 dilim 2**" başlıklı bir bölüm olarak ayrıca duruyor (ana akış değil, appendix); tabloda tarih sırasıyla doğru yerde.
- **Yüzde fonksiyonu monoton ama doğrusal değil**: oturum 1-4 arasında her dilim ~+2-3% (iskele aşaması, hızlı kazanım); 5-7 arasında her dilim ~+0.3-1% (içerik aşaması, yavaş kazanım çünkü altyapı zaten büyük ölçüde kuruldu, korpus 240 entity'ye doğru yavaş genişler). Bu eğri "infrastructure-front-loaded" projelerin tipik şekli.
- **(a) ve (b) sütunları READMEM'lere bağımlıdır**: Her dilim'in tam anlatısı README.md'deki ilgili `## Oturum X / dilim Y` bölümünde; tablo o bölümlerin üç-cümlelik özetidir.

---

## 12 ▸ Tamamlanma Tahmini — Çok Yönlü

Kullanıcı isteği: *"yüzdelik olarak yaklaşık bitiş süresi."* Tek bir sayı yanıltıcı olur — proje dört ayrı eksende ilerliyor ve hızları farklı. Aşağıda dört ölçüm açısı, sonunda ağırlıklı ortalama.

### 12.1 Ölçüm 1 — Orijinal §7 oturum yol haritası

§7'de planlanan 9 oturumun nominal ilerlemesi. Oturumlar dilimlere bölündüğü için "kaç oturum'dayız" ham sayısı aldatıcı; bunun yerine *oturumların editörel sonucuna göre* sayıyoruz:

| Oturum | Plan | Gerçekleşme | % |
|---|---|---|---|
| 1. Tasarım DNA + numune | ✓ Algorithm Word page çalışır halde | 100 |
| 2. Veri mimarisi + 120 stub | ◐ 4-varlık-grafı pivotu yapıldı; 120 stub yapılmadı (yeniden ölçeklendirildi) | 60 |
| 3. Atlas | ✓ Atlas çalışıyor; zoom + region etiketleri sonradan eklendi | 95 |
| 4. Catalogue + Word page şablonu | ◐ Word page tam; Catalogue filtre paneli yok (sadece Homepage dizin) | 55 |
| 5. Etimoloji ağacı + yolculuk sayfaları | ◐ Etimoloji ağacı tam; `/journeys` route'u yok | 50 |
| 6. İçerik pasajı 1: 15 kelime | ◐ 9 kelime tam; ek 6 kelime yapılmadı | 60 |
| 7. İçerik pasajı 2: 20 kelime + 80 catalogue | ✗ 0 ek kelime; catalogue tier başlamadı | 5 |
| 8. Polish + microinteraction + easter egg | ✗ Açılmadı | 0 |
| 9. Lansman hazırlığı | ✗ Açılmadı | 0 |

Ortalama: (100 + 60 + 95 + 55 + 50 + 60 + 5 + 0 + 0) / 9 = **~%47** orijinal-roadmap-tabanlı.

### 12.2 Ölçüm 2 — §4.4 4-varlık-grafı korpus hacmi

§4.4.7'de hedeflenen: 140 word + 60 person + 35 book + 6 theme ≈ **240 entity** × 3 dil = 720 paralel metin. Şu anki durum: 9 + 1 + 1 + 3 = **14 entity**. Her entity'nin 3 dilde tam yazılması ortalama 4-6 saatlik editorial iş; lazy-mimari yapı kuruldu, gerçek darboğaz yazım.

14 / 240 = **~%5.8** korpus-tabanlı tamamlanma.

Önemli not: korpus doğrusal ilerlemiyor. Showcase entity'ler (mevcut 14'ün hepsi showcase) catalogue entity'lerden çok daha uzun (~30 KB MDX vs ~5 KB). Hedef ~60 showcase + ~180 catalogue ise gerçek "yazım yükü" yer-ağırlıklı olarak:

- showcase yazım yükü: 14/60 ≈ %23
- catalogue yazım yükü: 0/180 ≈ %0
- ağırlıklı (showcase yazım yükü ~×3): (23×3 + 0) / 4 = **~%17**.

### 12.3 Ölçüm 3 — UI feature completeness

Tüm UI iskelesi var mı? Aşağıdaki kontrol listesi:

| Feature | Durum | % |
|---|---|---|
| Vite/React/i18n/Tailwind iskele | ✓ | 100 |
| Tipografi (4 font ailesi) + tokens + dark mode | ✓ | 100 |
| Üç dilli routing (TR/EN/AR) + RTL | ✓ | 100 |
| Lazy MDX + manifest mimarisi | ✓ | 100 |
| Validate + typecheck + build pipeline | ✓ | 100 |
| Atlas (homepage) — zoom, region, multi-anchor (4 tip) | ✓ (7/6'da Word multi-anchor da eklendi; 7/7'de ikinci paralel rota) | 100 |
| MiniAtlas (entity sayfası) — 4 tip için + hover tooltip | ✓ (7/6'da hover tooltip + klavye-paritesi) | 100 |
| Word page (stratigrafi + etymology + siblings + sources + JourneyBadge) | ✓ (7/6'da JourneyBadge eklendi) | 100 |
| Person page (circle + works + words + atlas) | ✓ | 90 |
| Book page (manuscripts + translations + atlas) | ✓ | 90 |
| Theme page (essay + entity grids + atlas) | ✓ | 90 |
| ThemeBadges back-link | ✓ | 100 |
| `journey_type` schema + JourneyBadge component | ✓ (7/6.C; data layer hazır) | 100 |
| `/journeys` index sayfası (7 arketip + Word sayıları) | ✓ (7/7.A) | 90 |
| `/journeys/:type` arketip sayfası (Word listesi + subtitle) | ✓ (7/7.A; full essay yok, subtitle stub) | 65 |
| HomePage Journeys gezinti katmanı | ✓ (7/7.B) | 100 |
| Tam arketip essay'leri (7 arketip × 3 dil × ~600 kelime) | ✗ subtitle stub var (~30-50 kelime/dil) | 15 |
| `/words` Catalogue (filtre paneli + 3 view mode) | ✗ Homepage dizin tek view | 25 |
| `/timeline` kronolojik görünüm | ✗ | 0 |
| `/about` editorial nota + kaynaklar + kolofon | ✗ | 0 |
| Sayfa geçiş animasyonları (kâğıt katlama) | ✗ | 0 |
| Mürekkep yayılması hover state'leri | ◐ Atlas pin + JourneyBadge + Journey pill için var; karta yok | 50 |
| Loading state — ink drop | ◐ Sade italic faint var | 50 |
| 404 sayfası — manuscript metaforu | ◐ NotFound var ama özel metafor değil | 50 |
| Easter egg detayları | ✗ | 0 |
| Audio (TTS veya insan kayıt) | ✗ | 0 |
| OG image / Twitter card | ✗ | 0 |
| Sitemap.xml / robots.txt | ✗ | 0 |
| Cloudflare/Vercel deploy | ✗ | 0 |
| Accessibility audit (WCAG AA) | ◐ Bazı parçalar (RTL, ARIA on Atlas + MiniAtlas hover keyboard + Journey breadcrumbs) ama formal audit yok | 50 |
| Lighthouse 95+ | ? Test edilmedi | 0 |

Toplam: kabaca **~%63** UI-tabanlı tamamlanma (dilim 7/6'daki %59'dan +4 puan; üç yeni satır 65-100 arası skorlandı, hover state'leri 40→50, accessibility 45→50).

### 12.4 Ölçüm 4 — Polish/launch tabakası

Oturum 8 (polish) + Oturum 9 (lansman) §7'deki son iki oturum. Bu tabaka bilinçli olarak son oturumlara bırakılmış — içerik aşaması bitmeden polish ışıltısı eklemek için yer yok. Şu an: **~%85** (dilim 7/18.ε + 7/19.ι ile büyük sıçramalar; tam doluluğa ~%15 kala).

**7/19.ι breakdown** (Δ 65 → 85, +20):
- SITE_ORIGIN build-time injection (vite plugin + sitemap origin-aware): **+5**
- `_redirects` + `_headers` Cloudflare/Netlify uyumlu konfig: **+5**
- `vercel.json` Vercel için eşdeğer konfig: **+3**
- 404 polish (didYouMean util + suggestion UI): **+3**
- `data/site-config.json` (origin SOT): **+1**
- `docs/DEPLOY.md` Cloudflare-first deploy rehberi: **+3**

**7/18.ε breakdown** (önceki dilim, Δ 24 → 65, +41):
- AboutPage (`/:lang/hakkinda`) — 5 bölüm × 3 dil kolofon sayfası: +15
- OG image + index.html meta etiketleri: +10
- sitemap.xml (126 URL) + robots.txt + prebuild hook: +5
- apple-touch-icon.png 180×180 (favicon zincirinin tamlığı): +3
- SiteFooter chrome bileşeni: +3
- aboutUrl() helper + i18n footer.*/about.*: +2
- README ε endcap + 7/16-7/17 hijyen + GRAND_PLAN §12.4: +2

Kümülatif: ε+ι dilimleri tek-başına §12.4'i **24 → 85** taşıdı (Δ +61
puan; ağırlıklı katkı 0.10 × 61 = +%6.1 projeye).

Kalan **~%15** polish/launch:

- **Gerçek deploy** (canlı URL — domain tescil + dashboard onboarding + ilk build + sitemap submit + post-deploy checklist): %8. *Bu dilim değil; editöryel eylem.*
- **Analytics** (Plausible/Umami — privacy-respecting): %1
- **Lighthouse audit + fix** (CLS/LCP/INP optimizasyonu, font-display, image lazy loading): %3
- **CSP `unsafe-inline` kaldırma** (inline theme script'i ayrı .js'e taşı, FOUC tradeoff'unu ölçüp ele al): %1
- **Mikro-polishler** (entity sayfaları arası prefetch, route-enter animation refinement, dark/light theme assets, share buttons): %2

### 12.5 Ağırlıklı Ortalama

Hangi ölçüme ne kadar ağırlık vermek? Bağlam editöryel: bu kullanıcı için "bitti" demek **tam korpus + tam UI + tam polish**, yani üç tabakanın hepsi. Ağırlıklandırma:

| Ölçüm | Açı | Ağırlık | Skor (7/44) | Katkı | Skor (7/42) |
|---|---|---|---|---|---|
| 12.1 | Orijinal roadmap (oturum ilerlemesi) | 0.15 | 76¹ | 11.40 | 75 |
| 12.2 | Korpus hacmi (içerik) | 0.50 | 64.5² | 32.25 | 64.5 |
| 12.3 | UI feature completeness | 0.25 | 100³ | 25.00 | 99 |
| 12.4 | Polish/launch | 0.10 | 98⁴ | 9.80 | 97 |
| | | **1.00** | | **~%80.95** | ~%80.45 |

¹ Oturum 7 skoru 47.0 → 47.5: Atlas projenin ana keşif aracı oldu (dilim 7/44
HomePage refactor — atlas-merkezli kompozisyon, AtlasFilters üst-bar, showcase
kelimeler grid'i, compact directory strip). Bu orijinal roadmap'in "interactive
discovery hub" vision'una yakınlaştı. 75 → 76.

² Korpus skoru 64.5 → 64.5 (sabit). Dilim 7/43-44 saf-UI refactor; korpus
dokunulmadı. Envanteri %100 stabil: 32 W + 11 P + 7 B + 6 T + 7 J = 63 entity.

³ UI completeness 99 → **100** (+1). Üç dilim toplamı (7/42 + 7/43 + 7/44):
(a) 7/42 — Leaflet + Stamen Watercolor temel entegrasyon (+3); (b) 7/43 —
AtlasFilters: kelime arama (debounced 180ms, slug+TR/EN/AR title substring match),
archetype chip bar (7 chip, tek-seçimli), reset, URL state senkron (useSearchParams
ile `?word=`, `?journey=`), match-count canlı bildirim, deep-link paylaşılabilir
URL'ler; LeafletAtlas highlight props (`highlightedPlaces`, `highlightedEntitySlugs`);
filter aktif olduğunda dimmed marker'lar (opacity 0.45 + saturate 0.4),
highlighted entity popup linkleri parşömen-altın arka plan; intersection logic
(word + journey filtreleri mantıksal AND); (c) 7/44 — HomePage atlas-merkezli
refactor: hero minimum + atlas + AtlasFilters + showcase grid (13 word) + compact
directory strip (5 sayı/link); eski 4-sütun directory grid kaldırıldı; mobile
responsive. UI feature completeness FULL — modern web app standard'ında.

⁴ Polish 97 → 98 (+1). HomePage kompozisyon disiplini (4 net section, her biri
self-contained), mobile responsive break (640px chip bar dikey, directory strip
sıkıştırma), deep-link UX (URL → state → atlas highlight loop'u browser
geri/ileri ile uyumlu). RTL Arapça için filter input `dir='auto'` (RTL karakter
geldiğinde otomatik), atlas tile LTR kalır (coğrafya dil-bağımsız).

**Sonuç dilim 7/44 sonu: ~%80.95 tamamlanma**, Shape τ-prime — atlas projenin ana
keşif aracı, HomePage atlas-merkezli. Δ7/42→7/44 = **+%0.50 puan** — **%81 yumuşak
eşiğinin eteğinde** (UI ekseni *full*, korpus eksen'i 64.5 sabit). Tüm önceki
dilim'lerin δ'ları: Δ7/14→7/15 ≈ +3 (γ); Δ7/15→7/16 ≈ +1.3 (δ); Δ7/16→7/17 ≈
+2.3 (ζ); Δ7/17→7/18 ≈ +4.6 (ε); Δ7/18→7/19 ≈ +2.8 (ι); Δ7/19→7/20 ≈ +0.8
(η-prime); Δ7/20→7/21 ≈ +1.8 (θ); Δ7/21→7/22 ≈ +1.4 (θ-prime); Δ7/22→7/23 ≈
+1.2 (λ); Δ7/23→7/24 ≈ +0.8 (λ-prime); Δ7/24→7/25 ≈ +0.3 (μ); Δ7/25→7/26 ≈
+0.55 (ν); Δ7/26→7/27 ≈ +0.30 (ν-prime); Δ7/27→7/28 ≈ +0.45 (ν-double-prime);
Δ7/28→7/29 ≈ +1.50 (κ); Δ7/29→7/30 ≈ +0.65 (κ-prime); Δ7/30→7/31 ≈ +0.20
(ν-triple-prime); Δ7/31→7/32 ≈ +0.20 (ξ); Δ7/32→7/33 ≈ +0.20 (ξ-prime);
Δ7/33→7/34 ≈ +0.60 (ξ-double-triple-prime); Δ7/34→7/35 ≈ +2.10 (ο); Δ7/35→7/36
≈ +1.20 (π); Δ7/36→7/37 ≈ +0.80 (π-prime); Δ7/37→7/38 ≈ +1.00 (π-double-prime);
Δ7/38→7/39 ≈ +0.45 (ρ); Δ7/39→7/40 ≈ +0.20 (σ); Δ7/40→7/42 ≈ +0.75 (σ-prime);
Δ7/42→7/44 ≈ **+0.50 (τ-prime — *atlas etkileşim + HomePage refactor, %81 eşiğine
yakın*)**. **Cumulative η-prime → … → τ-prime = +%17.95 puan yirmi-dört dilimde.**

Atlas refactor cycle (7/42 + 7/43 + 7/44) tamamlandı — projenin *iskeletsel
mimarisi* complete. Korpus 63 entity sabit; atlas modern tile-based interaktif
keşif aracı; mini-atlas'lar + full atlas Stamen Watercolor üzerinde Leaflet;
URL-state deep-linkable filter; HomePage atlas-merkezli kompozisyon.

**KULLANICI AKSIYONU GEREKLİ** (hâlâ): Stadia Maps ücretsiz hesap + domain
whitelist (`alicetinkaya76.github.io`). Bu yapılmadan production'da Stamen tile'ları
401 döner; localhost dev çalışır. Adım ~2 dakika, ücretsiz, akademik kullanım
explicit permission gerekmez. Sıradaki — **Oturum 8**: korpus genişlemesi
(32 → ~50 word hedefi); atlas refactor sonrası her yeni Word otomatik atlas'ta
gerçek coğrafi konumda görünür (sadece `atlasAnchor: '<slug>'` verilir).

### 12.6 Süre tahmini

Oturum başı ortalama dilim sayısı: 1.3 (oturum 4, 5, 6, 7 ortalaması — bazı oturumlar tek dilim, bazıları 4 dilim). Dilim başı ortalama tamamlanma artışı: dilim 7/3-7/5 boyunca ~+0.3 ila +1%. Aynı oranda devam ederse:

- **~%50 noktası**: ~25-30 dilim × ~0.7% = 20 dilim. Yaklaşık 15 oturum.
- **~%80 noktası**: 50 dilim. Yaklaşık 35-40 oturum.
- **~%100 noktası** (tam korpus + polish + launch): 90+ dilim. Yaklaşık 70+ oturum.

Ama oran bizim seçimimize bağlı. Catalogue entity'lere geçilirse dilim başı entity sayısı 3-5x artar (catalogue ~%75 daha kısa); bu bütçeyi kabaca yarıya indirir. Yani:

- **Realist agresif hız**: tam korpus 35-45 oturum.
- **Mevcut hız** (showcase-only): 70+ oturum.

Editöryel olarak: "120 kelimeyi yüzeysel anlatmak yerine 40 kelimeyi unutulmaz anlatmak" prensibi (§1.3) catalogue tier'ı küçültür → ~60-90 showcase + ~20-40 catalogue, yani **~120 hedef entity, 240 değil**. O zaman:

- **~%50 noktası**: 8-12 oturum (5-6 ay civarında).
- **~%80 noktası**: 18-25 oturum.
- **~%100 noktası**: 35-45 oturum.

### 12.7 Eldeki kararı belirginleştirmek

Yüzde "bittik mi" sorusuna cevap, başarı kriterinin (§10) üç sorusuna *evet* demektir. Bugün: (1) Görsel imza ✓, (2) Edebî değer ◐ (showcase Word'ler hak ediyor; korpus dar), (3) Kültürel onurlandırma ✓ (Arapça birinci sınıf vatandaş, MSA + klasik nüans, RTL doğru). Yani %100 demek için "hangi kelimeyi açsam yeterince derin" duygusunun da olması gerek — şu anki 9 kelime, ısrarcı bir okuyucuyu 30 dakika tutar, ama 9 kelimeden sonra kapı önüne çıkmak istenir. Korpus ~30 derin kelimeye çıktığında o his değişir; ~60'a çıktığında "bu site bir referans" tonuna geçer. O eşik **proje açısından ~%65-70** civarında çakışır.

---

*Son dilim: 7/40 (Shape σ — *rebranding to Riḥlat al-Kalimāt*; proje adı *Lisān al-Fossil* → *Riḥlat al-Kalimāt*, deploy günü öncesi tam-temizlik). **Karar süreci**: eski adın üç zayıflığı (dil-karışım Arapça+Latin/İngiliz, *fossil*'in olumsuz çağrışımı projenin canlı-kullanım izini sürme karakterine ters, tek "dil" odağı çoklu-varlık ağını dar tutuyor); altı tek-kelimeli aday (*Riḥla*, *al-Athar*, *Ṭabaqāt*, *al-Maʿbar*, *Sijill*, *Dīwān*) ve dört kompozit (*Lisān al-Athar*, *Lisān al-Riḥla*, *Riḥlat al-Kalimāt*, *Ṭabaqāt al-Kalimāt*) arasından **Riḥlat al-Kalimāt** (Kelimelerin Yolculuğu) seçildi — *yolculuk* (journey ekseni'ni adlandırılmamış halde taşır, 7 *riḥla* = 7 archetype) + *kelimeler* (içerik özü); kompoziti soyutluğu çözer; *fossil*'in implicit "ölü" yan-anlamını tersine çevirir (*kelime hâlâ yolda*); TR/EN/AR üç dilli okuyucuya akıcı. **Kapsam seviyesi C**: tam temizlik, dilim notları dahil; eski isim sadece git history'de. **İsim formları sabit**: brand display *Riḥlat al-Kalimāt* (Latin tr., harekeli); native *رِحلة الكَلِمات* (harekeli her yerde footerNote/AboutPage/jsonLd) / *رحلة الكلمات* (haresiz, brandArabic locale field); URL-safe slug `rihla` (kısa, ergonomic); tagline TR *Kelimelerin Yolculuğu*, EN *The Journey of Words*. **Refactor disiplinler-arası**: **~152 replacement / ~40 dosya** — 9 farklı Latin pattern (brand display, uppercase banner, URL placeholder `.example`/`.com`, Vite plugin fn `lisanContentManifest`/`lisanOriginInject`, localStorage anahtarları `lisan-theme`/`lisan-lang`, klasör ref, package adı `lisan` → `rihla`) + 4 Arapça brand-form (canonical harekeli *لِسانُ الأَحفور*, haresiz *لسان الأحفور*, feminine jsonLd *لِسانُ الأُحفورة*, og-image visual-form *ﺭﻮﻔﺣَﻷﺍ ُﻥﺎﺴِﻟ* → standart Arabic Unicode, modern tarayıcılar Amiri font ile shape eder) + Vite plugin internal `name` field (`'lisan-content-manifest'` → `'rihla-content-manifest'`) + console log prefix'leri (`[lisan-manifest]` → `[rihla-manifest]`, `[lisan-origin]` → `[rihla-origin]`) + site-config staging URL (`lisan.pages.dev` → `rihla.pages.dev`). **Korunan** (bilinçle dokunulmadı): içerik MDX'lerindeki literal *لِسان* "dil" kelimesi (al-biruni/fibonacci/azimuth/magazine/mattress/elixir/tariff/carat — gerçek Arapça "dil" anlamı, proje-adı değil); Türkçe "lisans" (license) substring'i. **Vite plugin'leri**: `lisanContentManifest` → `rihlaContentManifest` (7 ref), `lisanOriginInject` → `rihlaOriginInject` (8 ref). **localStorage clean-start**: `lisan-theme` → `rihla-theme`, `lisan-lang` → `rihla-lang` — deploy edilmediği için kullanıcı tercih kaybı yok; eğer önce deploy edilmiş olsaydı eski-anahtardan yeni-anahtara migration script gerekliydi. **Görsel asset güncellemeleri**: `public/favicon.svg` `aria-label="Riḥlat al-Kalimāt"` + comment header; `public/og-image.svg` üç text element — üst başlık (Garamond 78pt) *Riḥlat al-Kalimāt*, alt başlık (Amiri 58pt) *رِحلة الكَلِمات* standart Arabic Unicode, tagline alt-yazısı *Kelimelerin Yolculuğu · The Journey of Words*. **Build**: korpus 63 → 63 entity (saf-rebranding, içerik dokunulmadı, sadece trattato-d-aritmetica.mdx içindeki *المَشروعِ الحالي* parantez self-referansı güncellendi); eager `index` **81.85 KB gz** (-0.01 vs 7/39 — string uzunluk farkı minimum sürpriz); registry **64.80 KB gz** sabit (atlasAnchors yapısı dokunulmadı); hash'ler yeniden hesaplandı (registry-4t2dFvyO vs 7/39 registry-4YiKgyKf — string içerik değişimi bundle content hash'ini etkiler, beklenen). validate ✓ 0 violation, typecheck ✓ (artık `rihla@0.1.0`), build ✓ 11.81s. §12.1 roadmap 75 → 75 (rebrand orijinal roadmap'te yok); §12.2 korpus 64.5 → 64.5 (içerik dokunulmadı); §12.3 UI 96 → 96 (UI yapısı sabit, sadece string'ler); §12.4 polish 95 → **97** (+2: *brand-identity coherence* — proje adı projenin gerçek karakterini taşıyor; pre-launch rebrand pre-emptive bir ödeme, kullanıcı tabanı oluştuktan sonra rebrand etmek yüksek-maliyetli; *deploy-day-readiness* maksimuma yaklaşıyor). **Sonuç ~%79.50 → ~%79.70 (Δ +0.20)** — küçük puansal kazanım ama yapısal-kalitatif en büyük adım yirmi dilim'de: proje **kendi adını sahipleniyor**. %80 yumuşak eşiğine **~%0.30 kaldı**. **Cumulative η-prime → … → σ = +%16.70 puan yirmibir dilimde**. Sıradaki: kullanıcı GitHub repo oluşturup `git push origin main` çekecek, workflow otomatik tetiklenecek; `https://USER.github.io/REPO/` 2-3 dakika içinde canlı. Proje, kendi adını taşıyarak ilk live URL'sini görmeye hazır.*
---

*Bu plan, bir dilin başka bir dile bıraktığı izleri sergileyen bir sitenin planıdır. Plan da bir izdir — sonraki Claude oturumları onu yeniden okuyacak.*

