import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// CSS yükleme sırası ÖNEMLİ:
//   1. tokens.css — :root değişkenleri (renk/tipografi ölçekleri)
//   2. global.css — reset + body + grain overlay + a11y temelleri
// Sayfa-spesifik stiller (örn. WordPage.css) ilgili sayfanın
// kendi modülünden import edilir — burada değil.
import './styles/tokens.css';
import './styles/global.css';

// i18next — modül yüklendiğinde init çalışır; App render'dan önce hazır.
import './i18n/config';

import App from './App';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found in index.html');
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
