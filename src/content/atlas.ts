import type { Lang, Localized } from '@/types/entities';

/**
 * ATLAS PLACES — Atlas haritasındaki yer veritabanı.
 *
 * Mimari (dilim 7/42.σ-prime sonrası):
 *  • Her yer bir slug + WGS84 [latitude, longitude] + Localized ad ile tanımlı.
 *  • Koordinatlar GERÇEK coğrafi (Wikipedia/Wikidata kaynak). Leaflet'in
 *    LatLng konvensiyonuna doğrudan uyar — `[lat, lng]` sırası önemli.
 *  • Entity'lerin `atlasAnchor` alanı buradaki slug'lardan birini gösterir.
 *  • Yeni şehir eklemek: aşağıdaki tabloya kayıt ekle (gerçek lat/lng ile).
 *    Validator otomatik yeni anchor'ı tanır.
 *
 * Coğrafi kapsama: Atlantik (Lizbon -9°D) ↔ Hint yarımadası (Delhi 77°D),
 * Cambridge (52°K) ↔ Mokha (13°K). Atlas'ın bound'ları bu aralığı kapsar.
 */

export interface AtlasPlace {
  slug: string;
  /** [latitude, longitude] in WGS84 (gerçek coğrafi koordinat).
   *  Leaflet'in lat/lng konvenansiyonuna doğrudan uyar. */
  latlng: [number, number];
  name: Localized;
  /** Opsiyonel: ait olduğu daha geniş bölge (örn. "Mesopotamia"). UI'da
   *  şu an kullanılmıyor; ileride hover-card'da gösterilebilir. */
  region?: Localized;
}

// ─────────────────────────────────────────────────────────────────────
// Yer kayıtları — alfabetik slug ile düzenli.
// ─────────────────────────────────────────────────────────────────────

const PLACES: AtlasPlace[] = [
  {
    slug: 'baghdad',
    latlng: [33.3152, 44.3661],
    name: { tr: 'Bağdat', en: 'Baghdad', ar: 'بغداد' },
    region: { tr: 'Mezopotamya', en: 'Mesopotamia', ar: 'بلاد الرافدين' },
  },
  {
    // Bhinmal (modern), Rajasthan. Brahmagupta'nın *Brāhmasphuṭasiddhānta*'sı
    // (628) burada yazıldı; sıfırın ve negatif sayıların ilk sistematik
    // matematik metni. Delhi'nin güneybatısı, Ujjain'in kuzeybatısı —
    // Gupta-sonrası Hindistan'ın matematik bantı.
    slug: 'bhillamala',
    latlng: [25.0089, 72.2497],
    name: { tr: 'Bhillamāla · Bhinmal', en: 'Bhillamāla · Bhinmal', ar: 'بهيلَمالا' },
    region: { tr: 'Hind', en: 'India', ar: 'الهند' },
  },
  {
    slug: 'bukhara',
    latlng: [39.7747, 64.4286],
    name: { tr: 'Buhara', en: 'Bukhara', ar: 'بخارى' },
    region: { tr: 'Mâverâünnehir', en: 'Transoxiana', ar: 'ما وراء النهر' },
  },
  {
    slug: 'cairo',
    latlng: [30.0444, 31.2357],
    name: { tr: 'Kahire', en: 'Cairo', ar: 'القاهرة' },
    region: { tr: 'Mısır', en: 'Egypt', ar: 'مصر' },
  },
  {
    slug: 'cambridge',
    latlng: [52.2053, 0.1218],
    name: { tr: 'Cambridge', en: 'Cambridge', ar: 'كامبريدج' },
    region: { tr: 'İngiltere', en: 'England', ar: 'إنكلترا' },
  },
  {
    slug: 'constantinople',
    latlng: [41.0082, 28.9784],
    name: {
      tr: 'Konstantinopolis · İstanbul',
      en: 'Constantinople · Istanbul',
      ar: 'القسطنطينيّة · إسطنبول',
    },
    region: { tr: 'Boğaziçi', en: 'The Bosphorus', ar: 'البوسفور' },
  },
  {
    slug: 'cordoba',
    latlng: [37.8882, -4.7794],
    name: { tr: 'Kurtuba · Córdoba', en: 'Córdoba', ar: 'قُرطبة' },
    region: { tr: 'Endülüs', en: 'al-Andalus', ar: 'الأندلس' },
  },
  {
    slug: 'damascus',
    latlng: [33.5138, 36.2765],
    name: { tr: 'Şam', en: 'Damascus', ar: 'دمشق' },
    region: { tr: 'Şâm', en: 'the Levant', ar: 'بلاد الشام' },
  },
  {
    slug: 'delhi',
    latlng: [28.6139, 77.209],
    name: { tr: 'Delhi', en: 'Delhi', ar: 'دلهي' },
    region: { tr: 'Hind', en: 'India', ar: 'الهند' },
  },
  {
    // Floransa — Leonardo Fibonacci'nin *Liber Abaci* (1202) ile Hindu-Arap
    // sayı sisteminin Latin Avrupası'na yerleştiği Toskana abakuscu
    // geleneğinin sembolik merkezi. Fibonacci aslen Pisa'da, fakat
    // Toskana'nın matematik mirası Floransa'da kurumsallaştı —
    // Atlas'ta tek bir İtalya-merkezi pin olarak temsil ediyoruz.
    slug: 'florence',
    latlng: [43.7696, 11.2558],
    name: { tr: 'Floransa · Firenze', en: 'Florence', ar: 'فلورنسا' },
    region: { tr: 'İtalya', en: 'Italy', ar: 'إيطاليا' },
  },
  {
    // Gazne — Gazneli Mahmud'un (998-1030) başkenti; al-Bīrūnī'nin
    // 1017'den ölümüne (c. 1050) kadar 33 yıl üretim yaptığı yer.
    // *Tahqīq mā li'l-Hind* (1030), *al-Qānūn al-Masʿūdī* (1031),
    // *Kitāb al-Ṣaydana* (c. 1050) burada yazıldı. Khwārizm sarayının
    // 1017'de yıkılışıyla Mahmud'un al-Bīrūnī'yi Gazne'ye taşıması,
    // Khwārizm bilim ekolünün Afgan platosuna nakli olarak okunur.
    // Atlas konumu: Bukhara [855,295] ve Samarkand [910,275]
    // güneydoğusu, Bhillamāla [985,445] kuzeybatısı — Khwārazm-İran
    // ile Hindistan arasındaki dağ geçidi.
    slug: 'ghazna',
    latlng: [33.5658, 68.4252],
    name: { tr: 'Gazne · Ghaznī', en: 'Ghazna · Ghaznī', ar: 'غَزنة · غَزنين' },
    region: { tr: 'Afgan platosu', en: 'Afghan plateau', ar: 'هَضْبةُ أَفغانِستان' },
  },
  {
    // Hamadan — Antik Ekbatana (Med başkenti); Büveyhî sarayının yer
    // yer ikametgâhı, İbn Sînâ'nın 1037'de öldüğü ve gömüldüğü şehir.
    // *Kitāb al-Shifāʾ* ve *Kitāb al-Qānūn fī al-Ṭibb*'in tamamlanışı
    // (1024-1037 arası) bu kentte; Şems-i Devle'nin veziri olarak
    // hizmet etti. Atlas konumu: Bağdat'ın kuzey-doğusu, Zağros'un
    // batı yamacı; Buhara'dan oldukça batıda, Mezopotamya'yı İran
    // platosuna bağlayan geçitte.
    slug: 'hamadan',
    latlng: [34.7985, 48.5147],
    name: { tr: 'Hemedan · Ekbatana', en: 'Hamadan · Ecbatana', ar: 'هَمَذان' },
    region: { tr: 'Cibâl · İran platosu', en: 'Jibāl · the Iranian plateau', ar: 'الجِبال · هَضبةُ إيران' },
  },
  {
    slug: 'khwarazm',
    latlng: [41.3786, 60.3624],
    name: { tr: 'Hârezm', en: 'Khwārazm', ar: 'خوارزم' },
    region: { tr: 'Aral Gölü güneyi', en: 'south of the Aral Sea', ar: 'جنوبَ بحر آرال' },
  },
  {
    // Kûfe — Mezopotamya'nın güney-batı yakasında, Bağdat'tan ~170 km
    // güney-doğu. 7. yy'da Hz. Ömer'in kurduğu garnizon şehir; 8.-9. yy'da
    // erken İslamî dilbilim, hukuk, ve KİMYA (al-kīmiyāʾ) merkezi.
    // Câbir b. Hayyân korpusunun yazıldığı yer olarak rivayet edilir;
    // *al-iksīr*, *al-anbīq*, *al-qalī*, *al-țilasm* gibi terimler bu
    // şehrin laboratuvar geleneğinden Bağdat'a, oradan Latin Avrupa'sına
    // geçti. Atlas konumu: Bağdat'ın güney-doğusu, Basra'nın kuzey-batısı.
    slug: 'kufah',
    latlng: [32.0285, 44.4045],
    name: { tr: 'Kûfe', en: 'Kufa · al-Kūfah', ar: 'الكوفة' },
    region: { tr: 'Mezopotamya', en: 'Mesopotamia', ar: 'بلاد الرافدين' },
  },
  {
    // Lizbon — Portekiz tatlı portakalının (Citrus × sinensis) 1520'lerde
    // Akdeniz havzasına ulaştığı Atlantik kapısı. Vasco da Gama sonrası
    // baharat ağının yan ürünü; modern *portakal/portocală/portokali*
    // adının Akdeniz dillerine girdiği nokta. Atlas'ın batı ucu —
    // Cordoba [125,410]'dan biraz batı + biraz kuzey, Atlas Okyanusu'na
    // bakar.
    slug: 'lisbon',
    latlng: [38.7223, -9.1393],
    name: { tr: 'Lizbon · Lisboa', en: 'Lisbon', ar: 'لشبونة' },
    region: { tr: 'Portekiz · Atlas Kıyısı', en: 'Portugal · the Atlantic coast', ar: 'البرتغال · الساحلُ الأطلسيّ' },
  },
  {
    slug: 'london',
    latlng: [51.5074, -0.1278],
    name: { tr: 'Londra', en: 'London', ar: 'لندن' },
    region: { tr: 'İngiltere', en: 'England', ar: 'إنكلترا' },
  },
  {
    // Merrakeş — Mağrib'in başkenti, Murâbıt ve Muvahhid sülalelerinin
    // payitahtı (1062-1269). İbn Rüşd'ün (Averroes) 1198'de sürgünde
    // öldüğü yer; Endülüs felsefe geleneğinin son düğümü. Endülüs ile
    // Sahra-altı Afrika arasında ticaret-bilim ekseni: Atlas dağlarının
    // kuzey eteklerinde, Cordoba'nın güney-batısı, Cebelitarık'tan
    // yaklaşık 600 km güney. Latin Avrupa'sının Averroist okumasının
    // arka-coğrafyası.
    slug: 'marrakech',
    latlng: [31.6295, -7.9811],
    name: { tr: 'Merrakeş', en: 'Marrakech', ar: 'مَرّاكُش' },
    region: { tr: 'Mağrib · Atlas Dağları eteği', en: 'al-Maghrib · the foot of the Atlas mountains', ar: 'المَغرب · سَفحُ جِبالِ الأَطلَس' },
  },
  {
    // Muha · Mokha · al-Mukhā — Yemen'in Kızıldeniz kıyısındaki liman
    // şehri; 15.-17. yüzyıllar arasında kahvenin (qahwa) dünyaya çıktığı
    // tek liman. Sufi dervişlerinin Adan'dan Mekke'ye taşıdığı çekirdek,
    // Osmanlı sonrası Yemen'in Mokha tüccar evleri üzerinden Avrupa
    // şirketlerine (önce Hollandalı VOC, sonra İngiliz Levant Company)
    // satıldı; "mocha" bugün hâlâ hem kahvenin hem o limanın adıdır.
    // Atlas'ın güney ucu — Kızıldeniz'in kıyısında, Mecca'dan biraz
    // güney-batı (Mecca atlas'ta yok, ama coğrafyası bilinen referans).
    slug: 'mokha',
    latlng: [13.3194, 43.2503],
    name: { tr: 'Muha · Mokha', en: 'Mokha · al-Mukhā', ar: 'المُخا' },
    region: { tr: 'Yemen · Kızıldeniz', en: 'Yemen · the Red Sea', ar: 'اليَمَن · البَحرُ الأحمَر' },
  },
  {
    // Padua · Padova — Università di Padova (kuruluş 1222) Avrupa'nın
    // ikinci en eski üniversitesi (Bologna'dan sonra) ve 15.-17. yy'larda
    // tıp eğitiminin epicenter'i. İbn Sina'nın *al-Qānūn fī aṭ-Ṭibb*'ı
    // 1450 sonrasında Padua tıp curriculum'unun zorunlu ders kitabı
    // hâline geldi; Vesalius (anatomi), Fabricius (embriyoloji), Harvey
    // (kan dolaşımı — Padua'da öğrenci) modern Avrupa tıbbının kanonik
    // figürleri *Canon*'un sayfalarında yetişti. *Canon*'un Padua-baskısı
    // (1473, ilk Latin matbu sürümü) Avrupa'ya yayılmasının başlangıç
    // noktası. Atlas konumu: Floransa'nın kuzeyi, Venedik'in batısı —
    // Adriatik'in kuzey-batı kıvrımı, Po Ovası.
    slug: 'padua',
    latlng: [45.4064, 11.8768],
    name: { tr: 'Padua · Padova', en: 'Padua · Padova', ar: 'بادوفا' },
    region: { tr: 'Po Ovası', en: 'the Po Valley', ar: 'سَهلُ بو' },
  },
  {
    // Palermo — Sicilya'nın başkenti. Müslüman emirat (831-1072) +
    // Norman krallığı (1072-1194) çatkısının dilsel sediment'i. Norman
    // sarayı Arapça çevirmen ve idari katipler tutmaya devam etti;
    // Müslüman tersane / amīr al-baḥr (deniz emiri) kurumu II. Roger
    // (h. 1130-1154) döneminde *ammiratus* etiketiyle Latin idari diline
    // geçti; *admiral*'in Avrupa kuluçka şehri. Atlas konumu: Roma'nın
    // güney-doğusu (Sicilya boğazı kuzeyi), Tunus'un kuzeyi.
    slug: 'palermo',
    latlng: [38.1157, 13.3613],
    name: { tr: 'Palermo', en: 'Palermo', ar: 'بَلَرْم · باليرمو' },
    region: { tr: 'Sicilya', en: 'Sicily', ar: 'صِقِلِّية' },
  },
  {
    slug: 'paris',
    latlng: [48.8566, 2.3522],
    name: { tr: 'Paris', en: 'Paris', ar: 'باريس' },
    region: { tr: 'Frenkistan', en: 'France', ar: 'فرنسا' },
  },
  {
    // Pisa · Toskana liman-cumhuriyeti. 11.-13. yy Akdeniz ticaretinin
    // batı kıyısındaki dört Cumhuriyet'inden biri (Cenova, Venedik,
    // Amalfi, Pisa); kuzey Afrika, Mısır, Sicilya ve Levant limanlarında
    // fondachi (han-konsolosluk) işletti. Bu ticaret ağı Leonardo
    // Fibonacci'nin (c. 1170 – c. 1245) Hint-Arap rakamlarıyla *Bijāya*
    // (bugünkü Cezayir Béjaïa'sı) gümrük büromuzdaki babasının yanında
    // tanıştığı kanaldır; 1202'de Pisa'da yazdığı *Liber Abaci* bu
    // rakamların Latin Avrupa'ya geçişinin teknik kapısıdır. Atlas
    // konumu: Floransa'nın batısı (Toskana kıyısı), Roma'nın kuzey-batısı.
    slug: 'pisa',
    latlng: [43.7228, 10.4017],
    name: { tr: 'Pisa', en: 'Pisa', ar: 'بيزا' },
    region: { tr: 'Toskana · Tirenya kıyısı', en: 'Tuscany · the Tyrrhenian coast', ar: 'توسكانا · ساحلُ تيرّينيا' },
  },
  {
    // Rey · al-Rayy — Tahran'ın güney-doğu eteğinde (modern Şehr-i Rey),
    // Sâsânî-İslam geçiş döneminin entelektüel merkezlerinden. 9.-11. yy
    // arasında bîmâristanı (tıp hastanesi) ile ünlü; Ebû Bekir er-Râzî
    // (854-925) burada doğdu, baş-hekimlik yaptı, hastanenin konumunu
    // bir parça etin asılıp hangi noktada en az bozulduğunu gözleyerek
    // seçtiği rivayet edilir. Bağdat ile Horasan arasındaki ana güzergâhın
    // düğümü; İslam'ın altın çağı şehirlerinin Mezopotamya-İran-Mâverâünnehir
    // hattındaki orta düğümü. Atlas konumu: Hamadan'ın kuzey-doğusu,
    // Bağdat'ın kuzey-doğusu, Buhara'nın güney-batısı.
    slug: 'rey',
    latlng: [35.5933, 51.4339],
    name: { tr: 'Rey · Şehr-i Rey', en: 'Rayy', ar: 'الرَّيّ' },
    region: { tr: 'Cibâl · İran platosu', en: 'Jibāl · the Iranian plateau', ar: 'الجِبال · هَضبةُ إيران' },
  },
  {
    slug: 'rome',
    latlng: [41.9028, 12.4964],
    name: { tr: 'Roma', en: 'Rome', ar: 'روما' },
    region: { tr: 'İtalya', en: 'Italy', ar: 'إيطاليا' },
  },
  {
    // Salerno · Schola Medica Salernitana — Avrupa'nın en eski tıp okulu
    // (c. 9.-13. yy), Greko-Latin-Arap-Yahudi tıp geleneklerinin tek
    // çatıda buluştuğu nadir merkez. Constantinus Africanus (c. 1020-1087)
    // Kartaca'dan getirdiği Arapça tıp külliyatını burada (ve hayatının
    // son demlerinde Monte Cassino manastırında) Latinceye çevirdi: Hunayn
    // bin İshak'ın Galen-tercümeleri Latin tıbbına bu kanal üzerinden
    // girdi. *Liber Pantegni* (Haly Abbas/al-Majūsī'nin *Kāmil aṣ-Ṣināʿa*'sının
    // Latince adaptasyonu), *Isagoge ad Tegni Galieni* (Hunayn'ın
    // *al-Madkhal*'inin Latincesi) Salerno-Cassino dönüm noktası. Atlas
    // konumu: Roma'nın güney-doğusu (Napoli'nin biraz güneyi), Palermo'nun
    // hemen kuzeyi — Tirhen Denizi'nin doğu kıyısı.
    slug: 'salerno',
    latlng: [40.6824, 14.7681],
    name: { tr: 'Salerno', en: 'Salerno', ar: 'سالِرنو' },
    region: { tr: 'Güney İtalya · Campania', en: 'Southern Italy · Campania', ar: 'جَنوبُ إيطاليا · كَمبانيا' },
  },
  {
    slug: 'samarkand',
    latlng: [39.6542, 66.9597],
    name: { tr: 'Semerkand', en: 'Samarkand', ar: 'سمرقند' },
    region: { tr: 'Mâverâünnehir', en: 'Transoxiana', ar: 'ما وراء النهر' },
  },
  {
    slug: 'toledo',
    latlng: [39.8628, -4.0273],
    name: { tr: 'Tuleytula · Toledo', en: 'Toledo', ar: 'طُلَيْطِلة' },
    region: { tr: 'Endülüs', en: 'al-Andalus', ar: 'الأندلس' },
  },
  {
    slug: 'ujjain',
    latlng: [23.1765, 75.7885],
    name: { tr: 'Ujjain', en: 'Ujjain', ar: 'أُجَّين' },
    region: { tr: 'Hind', en: 'India', ar: 'الهند' },
  },
  {
    // Venedik — Arsenale di Venezia (1104'ten itibaren) Avrupa'nın seri-
    // üretim tersane kavramının erken örneği; "arsenal" kelimesi Fâtımî
    // *dār aṣ-ṣināʿa*'nın Akdeniz tüccar koridorlarında *darsena* →
    // *arsenale* yoluyla Latince'ye geçişinin son düğümü. 13. yy'dan
    // itibaren venedik konsolosluk-elçi kanalı *tariffa*'yı (Arapça
    // *taʿrīfa* — bildirim/sınıflandırma cetveli) gümrük diline taşıdı.
    // Atlas konumu: Adriatik'in başı, Floransa'nın kuzeyi.
    slug: 'venice',
    latlng: [45.4408, 12.3155],
    name: { tr: 'Venedik · Venezia', en: 'Venice', ar: 'البُندُقيّة · فينيسيا' },
    region: { tr: 'Adriyatik', en: 'the Adriatic', ar: 'الأَدرياتيكيّ' },
  },
];

export const ATLAS_PLACES: Record<string, AtlasPlace> = Object.fromEntries(
  PLACES.map((p) => [p.slug, p])
);

export function getAtlasPlace(slug: string): AtlasPlace | undefined {
  return ATLAS_PLACES[slug];
}

export function listAtlasPlaces(): AtlasPlace[] {
  return PLACES.slice();
}

/** UI yardımcısı — geçerli dilde yer adı, fallback'ler ile. */
export function placeName(place: AtlasPlace, lang: Lang): string {
  return place.name[lang] ?? place.name.en ?? place.name.tr ?? place.slug;
}
