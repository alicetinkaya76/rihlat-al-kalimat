import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import LangAwareRedirect from './LangAwareRedirect';
import LangScope from './LangScope';
import ManuscriptLoader from '@/components/ManuscriptLoader';

import { ENTITY_PATH_SEGMENT, JOURNEYS_PATH_SEGMENT, WORDS_LIST_SEGMENT, PERSONS_LIST_SEGMENT, BOOKS_LIST_SEGMENT, ABOUT_SEGMENT } from './paths';

/**
 * Tüm route tanımları.
 *
 *   /                                  → / kullanıcının diline redirect
 *   /:lang                             → HomePage (atlas)
 *   /:lang/kelime/:slug                → WordPage
 *   /:lang/kelimeler                   → WordsListPage
 *   /:lang/kisi/:slug                  → PersonPage
 *   /:lang/kisiler                     → PersonsListPage (dilim 7/16.δ.A)
 *   /:lang/kitap/:slug                 → BookPage
 *   /:lang/kitaplar                    → BooksListPage  (dilim 7/16.δ.A)
 *   /:lang/tema/:slug                  → ThemePage
 *   /:lang/yolculuk                    → JourneysIndexPage (7 arketip dizini)
 *   /:lang/yolculuk/:type              → JourneyPage (tek arketip)
 *   /:lang/hakkinda                    → AboutPage (dilim 7/18.ε.A — launch hazırlığı)
 *   *                                  → 404
 *
 * Path segment'leri ENTITY_PATH_SEGMENT + JOURNEYS_PATH_SEGMENT +
 * (WORDS|PERSONS|BOOKS)_LIST_SEGMENT'tan okunur — tek doğru kaynak.
 *
 * Code-split:
 *   Her sayfa React.lazy ile dynamic import'a alındı (Oturum 6/1). MDX
 *   içerikleri per-route lazy'ye geçirildi (Oturum 7/1). Dilim 7/7.A'da
 *   journey sayfaları eklendi; ikisi de aynı lazy paterni.
 *   JourneysIndexPage + JourneyPage manifest reverse-index'ten okur,
 *   MDX yükü yok — chunk hafif (~3-4 KB gz tahminen). 7/16.δ.A'da
 *   PersonsListPage + BooksListPage da aynı pattern'le — manifest
 *   eager, lazy chunk yalnız sayfa yapı + sort/filter UI.
 */

const HomePage = lazy(() => import('@/pages/HomePage'));
const WordPage = lazy(() => import('@/pages/WordPage'));
const WordsListPage = lazy(() => import('@/pages/WordsListPage'));
const PersonPage = lazy(() => import('@/pages/PersonPage'));
const PersonsListPage = lazy(() => import('@/pages/PersonsListPage'));
const BookPage = lazy(() => import('@/pages/BookPage'));
const BooksListPage = lazy(() => import('@/pages/BooksListPage'));
const ThemePage = lazy(() => import('@/pages/ThemePage'));
const JourneysIndexPage = lazy(() => import('@/pages/JourneysIndexPage'));
const JourneyPage = lazy(() => import('@/pages/JourneyPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/**
 * Route geçişlerinde — chunk indirilirken — kısa görünen düşük-gürültü
 * fallback. Dilim 7/10.C'de inline-styled hâlinden shared
 * `ManuscriptLoader` bileşenine taşındı; `EntityLoading` (EntityPageStates)
 * ile aynı görsel — kullanıcı route geçişi ile entity hidrasyonunu
 * görsel olarak ayırt edemesin (dilim 7/1 disiplini). Polish layer'ın
 * ikinci girişi (NotFound dilim 7/9.C'de açılışı yapmıştı).
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<ManuscriptLoader />}>
      <Routes>
        <Route path="/" element={<LangAwareRedirect />} />

        <Route path="/:lang" element={<LangScope />}>
          <Route index element={<HomePage />} />
          <Route path={WORDS_LIST_SEGMENT} element={<WordsListPage />} />
          <Route path={PERSONS_LIST_SEGMENT} element={<PersonsListPage />} />
          <Route path={BOOKS_LIST_SEGMENT} element={<BooksListPage />} />
          <Route path={`${ENTITY_PATH_SEGMENT.word}/:slug`} element={<WordPage />} />
          <Route path={`${ENTITY_PATH_SEGMENT.person}/:slug`} element={<PersonPage />} />
          <Route path={`${ENTITY_PATH_SEGMENT.book}/:slug`} element={<BookPage />} />
          <Route path={`${ENTITY_PATH_SEGMENT.theme}/:slug`} element={<ThemePage />} />
          <Route path={JOURNEYS_PATH_SEGMENT} element={<JourneysIndexPage />} />
          <Route path={`${JOURNEYS_PATH_SEGMENT}/:type`} element={<JourneyPage />} />
          <Route path={ABOUT_SEGMENT} element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
