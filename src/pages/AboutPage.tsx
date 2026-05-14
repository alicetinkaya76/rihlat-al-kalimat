import { useTranslation } from 'react-i18next';

import { useLang } from '@/hooks/useLang';
import { usePageTitle } from '@/hooks/usePageTitle';

import './AboutPage.css';

/**
 * Hakkında sayfası — projenin kolofon-kalitesinde tek-sayfa imzası
 * (dilim 7/18.ε.A).
 *
 * Kompozisyon: tek sütun, max-inline-size ~62ch (Word/Person sayfasının
 * okuma kolonuyla rezonansta). 5 bölüm:
 *   1. Thesis     — projenin tezi tek paragrafta
 *   2. Method     — 4-varlık şeması + stratigrafi + atlas + yolculuk
 *   3. State      — şu anki korpus + tier disiplini sayıları
 *   4. Sources    — peer-reviewed çalışma standardı, OED/CNRTL/Lexico
 *                   gibi tertiary referansların rolü
 *   5. Closing    — bir kolofon mührü ve davet
 *
 * Üç dil paralel prose'u doğrudan TSX'te (HomePage tagline paterni —
 * uzun düzyazıyı i18n JSON'a kırmak gereksiz fragmantasyon yaratırdı).
 * Sadece bölüm başlıkları i18n key'le — onlar UI chrome'unun parçası.
 *
 * Routing: `/:lang/hakkinda` (segment Türkçe sabit; aboutUrl(lang)).
 * URL üç dilde aynı şekilde; içerik dilden okunur.
 *
 * Lazy: AppRoutes'taki tüm sayfalar gibi `lazy(() => import(...))`
 * altında. Beklenen chunk ~3-4 KB gz (sadece prose + 1 küçük CSS).
 */
export default function AboutPage() {
  const { t } = useTranslation();
  const { lang } = useLang();

  usePageTitle(t('about.title'));

  return (
    <main className="about-main">
      <article className="about-article">
        <header className="about-header">
          <h1 className="about-title">{t('about.title')}</h1>
          <p className="about-subtitle">{t('about.subtitle')}</p>
        </header>

        <section className="about-section" aria-labelledby="about-thesis">
          <h2 id="about-thesis" className="about-section-head">
            {t('about.thesisHead')}
          </h2>
          <div className="about-prose">
            {lang === 'tr' && (
              <p>
                <em>Riḥlat al-Kalimāt</em>, Avrupa dillerinin altında uyuyan
                Arapça tabakaları bir arkeoloji sahası gibi okuyan bir
                çalışmadır. Tek tek kelimeler değil; her kelimenin
                arkasındaki <strong>kişi</strong>, <strong>kitap</strong>,{' '}
                <strong>tema</strong> ve <strong>yolculuk</strong> — dört
                varlığın oluşturduğu bağıntı grafı önümüze konur. Aşağıdaki
                soruyu bütün proje boyunca soruyoruz: <em>Bu kelime nereden
                geldi?</em> ile yetinmiyoruz — <em>kimin ağzından, hangi
                kitabın hangi sayfasında, hangi şehre uğrayarak,
                arkasında hangi kuruma yaslanarak geldi?</em>
              </p>
            )}
            {lang === 'en' && (
              <p>
                <em>Riḥlat al-Kalimāt</em> reads the Arabic strata buried
                beneath the European languages as if it were an archaeological
                site. Not single words in isolation, but the relational graph
                of four entities behind each word — <strong>persons</strong>,{' '}
                <strong>books</strong>, <strong>themes</strong>, and the{' '}
                <strong>journeys</strong> words take. The question this
                project asks is not just <em>where did this word come
                from?</em> but: <em>from whose mouth, on which page of which
                book, through which cities, leaning on which institutions
                did it arrive?</em>
              </p>
            )}
            {lang === 'ar' && (
              <p>
                <em>رِحلة الكَلِمات</em> قِراءةٌ للطَّبَقاتِ العَربيَّةِ
                المَدفونةِ تحتَ اللُّغاتِ الأُوروبيَّةِ بِوَصفِها مَوقِعاً
                أَركيولوجيّاً. لا كَلِماتٌ مُفرَدةٌ مَعزولة، بَل شَبكةُ
                العَلاقاتِ بينَ أَربَعِ ذَواتٍ خَلفَ كُلِّ كَلِمة:{' '}
                <strong>أَشخاصٌ</strong> و<strong>كُتُبٌ</strong> و
                <strong>مَوضوعاتٌ</strong> و<strong>رِحلاتٌ</strong> تَقطَعُها
                الكَلِمة. السُّؤالُ الذي يَطرَحُه هذا المَشروعُ ليسَ فقط{' '}
                <em>من أينَ جاءَت هذه الكَلِمة؟</em> بَل:{' '}
                <em>عَن فَمِ مَن، وعَلى أَيَّةِ صَفحةٍ من أَيِّ كِتاب،
                ومُروراً بأَيِّ المُدُن، استِناداً إلى أَيَّةِ مُؤَسَّسةٍ
                وَصَلَت؟</em>
              </p>
            )}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-method">
          <h2 id="about-method" className="about-section-head">
            {t('about.methodHead')}
          </h2>
          <div className="about-prose">
            {lang === 'tr' && (
              <>
                <p>
                  Her kelime <strong>beş tarihsel sediment'te</strong>{' '}
                  okunur — bugünden köke doğru kazılır, ters kronolojik
                  sıra disiplinle korunur. Üç dilde paralel anlatım; ne
                  birebir çeviri ne özet — her dilin <em>kendi
                  prozodisinde</em> aynı argümanı taşımak şartı.
                </p>
                <p>
                  Coğrafya bir <strong>atlas haritası</strong> üzerinden
                  okunur. Her kelimenin bir <em>iconic durağı</em>
                  (atlasAnchor) ve uygun olduğunda bir{' '}
                  <em>çok-noktalı rotası</em> (atlasAnchors) vardır:
                  Bağdat'tan Tuleytula'ya, oradan Floransa'ya, oradan
                  Cambridge'e — kelimenin geçtiği yolun her durağı kendi
                  editöryel argümanını taşır. Atlas üzerinde rotaların
                  kesişme noktaları (özellikle Tuleytula) bir <em>tezi
                  görsel kanıt olarak</em> sunar.
                </p>
                <p>
                  Üst-örgü <strong>yedi yolculuk arketipidir</strong>:
                  mütercim, tüccar, Endülüs, haçlı, gökbilimci, simyacı,
                  diplomat. Her kelime bir ya da birden fazla arketibe
                  bağlanır; bu sınıflama Avrupa diline geçişin tek
                  patikadan değil yedi tipik koridordan geçtiğini
                  görünür kılar.
                </p>
              </>
            )}
            {lang === 'en' && (
              <>
                <p>
                  Each word is read across <strong>five historical
                  strata</strong> — excavated from the present back
                  towards the root, with strict reverse-chronological
                  discipline. Three parallel languages: neither verbatim
                  translation nor summary, but the same argument carried
                  in each tongue's <em>own prosody</em>.
                </p>
                <p>
                  Geography is read through a stylised{' '}
                  <strong>atlas map</strong>. Each word has an{' '}
                  <em>iconic anchor</em> (atlasAnchor) and, where
                  appropriate, a <em>multi-stop route</em> (atlasAnchors):
                  from Baghdad to Toledo, on to Florence, then Cambridge —
                  each anchor carries its own editorial argument. The
                  intersections between routes (Toledo above all) present a{' '}
                  <em>thesis as visual evidence</em>.
                </p>
                <p>
                  An overlay of <strong>seven journey archetypes</strong>{' '}
                  binds the corpus: translator, merchant, Andalusian,
                  crusader, astronomer, alchemist, diplomatic. Each word
                  belongs to one or several archetypes; the classification
                  makes visible that the path into European languages is
                  never single — it runs through seven typical corridors.
                </p>
              </>
            )}
            {lang === 'ar' && (
              <>
                <p>
                  تُقرَأُ كُلُّ كَلِمةٍ في{' '}
                  <strong>خَمسِ طَبَقاتٍ تاريخيَّة</strong> — يُحفَرُ من
                  الحاضِرِ إلى الأَصلِ، بترتيبٍ زَمَنيٍّ مَعكوسٍ صارِم.
                  ثَلاثُ لُغاتٍ مُتَوازِية: لا تَرجَمةٌ حَرفيَّةٌ ولا
                  تَلخيص، بَل الحُجَّةُ ذاتُها بنَبَرةِ كُلِّ لُغةٍ.
                </p>
                <p>
                  تُقرَأُ الجُغرافيا على <strong>خَريطةِ أَطلَس</strong>{' '}
                  مُنَمنَمة. لِكُلِّ كَلِمةٍ مَوضِعُها الأَيقونيُّ
                  (atlasAnchor) ومَسارٌ مُتَعَدِّدُ المَحَطّاتِ عندَ
                  الاقتِضاءِ (atlasAnchors): من بَغدادَ إلى طُلَيطِلةَ ثُمَّ
                  فلورنسا ثُمَّ كامبردج — كُلُّ مَحَطَّةٍ تَحمِلُ
                  حُجَّتَها التَّحريريَّةَ الخاصَّة. ونِقاطُ التَّقاطُعِ
                  بينَ المَسارات (طُلَيطِلةُ قَبلَ كُلِّ شَيءٍ) تَعرِضُ
                  أُطروحةً كأَنَّها بُرهانٌ بَصَريّ.
                </p>
                <p>
                  وفَوقَ هذا كُلِّه طَبَقةُ{' '}
                  <strong>سَبعةِ أَنماطٍ من الرِّحلات</strong>: المُتَرجِم،
                  والتاجِر، والأَندَلُسيّ، والصَّليبيّ، والفَلَكيّ،
                  والكيميائيّ، والدِّبلوماسيّ. تَنتَمي كُلُّ كَلِمةٍ إلى
                  نَمَطٍ أو أكثَر؛ وهذا التَّصنيفُ يُبَرهِنُ على أنَّ
                  الطَّريقَ إلى اللُّغاتِ الأُوروبيَّةِ لم يَكُن واحِداً
                  قَطّ — بَل يَجري عَبرَ سَبعَةِ مَمَرّاتٍ نَمَطيَّة.
                </p>
              </>
            )}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-state">
          <h2 id="about-state" className="about-section-head">
            {t('about.stateHead')}
          </h2>
          <div className="about-prose">
            {lang === 'tr' && (
              <p>
                Şu anki sürüm <strong>19 kelime, 4 kişi, 2 kitap, 4 tema</strong>{' '}
                — toplam 29 girdi içerir. Korpus iki katmanlıdır: <em>vitrin</em>{' '}
                (showcase) girdileri uzun, beş sediment'te zengin essay'ler;{' '}
                <em>katalog</em> girdileri editöryel disiplinin daha sıkı
                takip edildiği özlü kayıtlar. Bütün vitrin kelimeleri çok
                noktalı atlas rotasına sahiptir; üç ana koridor — Bağdat,
                Tuleytula, Floransa — projenin omurgasıdır. Korpus
                önümüzdeki dilimlerde her oturumda 3-4 yeni katalog
                girdisiyle genişler; tezin geometrisi sabit, dolduğu
                hacim büyür.
              </p>
            )}
            {lang === 'en' && (
              <p>
                The current edition holds <strong>19 words, 4 persons,
                2 books, 4 themes</strong> — 29 entries in all. The corpus
                runs at two levels: <em>showcase</em> entries are long,
                richly stratified essays; <em>catalogue</em> entries are
                tighter records observing stricter editorial discipline.
                Every showcase word carries a multi-anchor atlas route;
                three corridors — Baghdad, Toledo, Florence — form the
                project's spine. The corpus grows by three to four
                catalogue entries per editorial dilim; the geometry of
                the argument is fixed, the volume it fills grows.
              </p>
            )}
            {lang === 'ar' && (
              <p>
                يَحوي الإصدارُ الحاليُّ{' '}
                <strong>تِسعَ عَشرةَ كَلِمةً، وأَربَعةَ أَشخاصٍ،
                وكِتابَين، وأَربَعةَ مَوضوعات</strong> — تِسعةً وعِشرينَ
                مادَّةً جُملةً. ويَجري الأَرشيفُ في طَبَقَتَين: مَوادُّ{' '}
                <em>النَّموذَجِ</em> مَقالاتٌ طَويلةٌ غَنيَّةُ السَّديم،
                ومَوادُّ <em>الفِهرِسِ</em> سُجِلّاتٌ مُكَثَّفةٌ بانضِباطٍ
                تَحريريٍّ أَشَدّ. وَلِكُلِّ كَلِمةٍ نَموذَجيَّةٍ مَسارُها
                المُتَعَدِّدُ على الأَطلَس؛ والمَمَرّاتُ الثَّلاثةُ —
                بَغداد، طُلَيطِلة، فلورنسا — هي عَمودُ المَشروع. ويَنمو
                الأَرشيفُ بِثَلاثِ إلى أَربَعِ مَوادَّ فِهرسيَّةٍ في كُلِّ
                دَلِيمٍ تَحريريّ؛ هَندَسةُ الحُجَّةِ ثابِتةٌ، والحَجمُ
                الذي تَملَؤه يَنمو.
              </p>
            )}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-sources">
          <h2 id="about-sources" className="about-section-head">
            {t('about.sourcesHead')}
          </h2>
          <div className="about-prose">
            {lang === 'tr' && (
              <p>
                Her girdi en az beş kaynağa dayanır; tercih sırası şudur:
                eleştirel edisyonlar (Brill, De Gruyter, Leiden, IFAO);{' '}
                peer-reviewed makaleler (<em>Arabica</em>,{' '}
                <em>JAOS</em>, <em>Der Islam</em>); kurumsal sözlükler
                (OED, CNRTL, DRAE, TDV İslâm Ansiklopedisi). Online genel
                sözlükler (Wiktionary, Lexico, Etimoloji Türkçe gibi)
                tertiary kontrol amacıyla okunur ama doğrudan kaynak
                gösterilmez. Bir iddianın yalnız bir kaynakta görünmesi
                varsa metinde açıkça işaretlenir; ihtilaflı tartışmalar
                tek bir görüş etrafında düzleştirilmez.
              </p>
            )}
            {lang === 'en' && (
              <p>
                Every entry rests on at least five sources; the order of
                preference is: critical editions (Brill, De Gruyter,
                Leiden, IFAO); peer-reviewed articles (<em>Arabica</em>,{' '}
                <em>JAOS</em>, <em>Der Islam</em>); institutional
                dictionaries (OED, CNRTL, DRAE, the TDV Encyclopedia of
                Islam). General online lexica (Wiktionary, Lexico, the
                Turkish <em>Etimoloji</em>) are consulted as tertiary
                cross-checks but never cited as primary. When a claim
                rests on a single source the text says so; contested
                debates are not flattened into a single view.
              </p>
            )}
            {lang === 'ar' && (
              <p>
                تَستَنِدُ كُلُّ مادَّةٍ إلى خَمسةِ مَصادِرَ على الأَقَلّ،
                وَتَرتيبُ الأَولَويّاتِ: التَّحقيقاتُ النَّقديَّة (Brill،
                De Gruyter، Leiden، IFAO)؛ والأَوراقُ المُحَكَّمة
                (<em>Arabica</em>، <em>JAOS</em>، <em>Der Islam</em>)؛
                والمَعاجِمُ المُؤَسَّسيَّة (OED، CNRTL، DRAE، وموسوعةُ
                الإسلامِ التُّركيَّة TDV). أمّا المَعاجِمُ العامَّةُ على
                الشَّبَكة (Wiktionary، Lexico، <em>Etimoloji Türkçe</em>)
                فتُقرَأُ لِلتَّحَقُّقِ الثُّلاثيّ ولا تُذكَرُ مَصادِرَ
                مُباشِرة. وَإذا قامَت دَعوى على مَصدَرٍ واحدٍ ذُكِرَ ذلك
                في المَتنِ صَراحة؛ ولا تُسَطَّحُ النِّقاشاتُ الخِلافيَّةُ
                إلى رأيٍ واحِد.
              </p>
            )}
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-closing">
          <h2 id="about-closing" className="about-section-head">
            {t('about.closingHead')}
          </h2>
          <div className="about-prose">
            {lang === 'tr' && (
              <p>
                Bir tortu sahası kendisini açmaz; kazılması, sediment'lerin
                ayırt edilmesi, her tabakanın kendi içinde okunması gerekir.
                Bu site, üç dilin altında yatan tek bir tortunun beş
                sediment'i — okunmayı bekleyen bir <em>kolofon</em>.
              </p>
            )}
            {lang === 'en' && (
              <p>
                A sediment site does not open itself; it is excavated,
                its strata distinguished, each layer read on its own
                terms. This is a single sediment beneath three languages,
                in five strata — a <em>colophon</em> waiting to be read.
              </p>
            )}
            {lang === 'ar' && (
              <p>
                مَوقِعُ الرُّسوبِ لا يَنفَتِحُ من تِلقاءِ نَفسِه؛ بَل
                يُحفَرُ، وَتُفصَلُ طَبَقاتُه، وتُقرَأُ كُلُّ طَبَقةٍ في
                شَرطِها الخاصّ. هذا تَرسُّبٌ واحِدٌ تحتَ ثَلاثِ لُغات،
                في خَمسِ طَبَقات — <em>كولوفونٌ</em> يَنتَظِرُ القارِئ.
              </p>
            )}
          </div>
        </section>

        <p className="about-colophon">
          <em>{t('nav.brand')}</em> <span className="about-colophon-mark" />{' '}
          {t('about.title')} <span className="about-colophon-mark" /> {lang}
        </p>
      </article>
    </main>
  );
}
