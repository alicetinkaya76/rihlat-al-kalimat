import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ShareButton.module.css';

/**
 * SHARE BUTTON — dilim 7/29.κ (polish).
 *
 * Tek-amaç chrome aktörü: aktif sayfanın URL'ini paylaşır. TopBar'da
 * LangSwitch ile ThemeToggle arasında oturur.
 *
 * Üç-katmanlı bir UI stratejisi:
 *
 *   1. `navigator.share` (Web Share API) — modern mobile + Edge/Safari masaüstü.
 *      Tarayıcı kendi paylaşım sheet'ini açar (WhatsApp, Mail, Mastodon, vb.).
 *      Bizim UI'mız onaylamadan kapatır; biz sadece çağırırız ve fail-silent
 *      olur (kullanıcı vazgeçerse `AbortError` atar — uyarı vermeden geçeriz).
 *
 *   2. `navigator.clipboard.writeText` — masaüstü Chrome/Firefox veya
 *      Web Share API olmayan mobile (eski Android).
 *      Linki panoya kopyalar; biz "Kopyalandı" toast'ı gösteririz (inline,
 *      buton içinde 2 saniye). Kullanıcı yapıştırarak istediği yere alır.
 *
 *   3. `document.execCommand('copy')` fallback — yasaklı clipboard izni
 *      veya HTTPS-olmayan deploy (lokal dev'de http://).
 *      Eski API, gizli textarea + select. Kötü ama çalışır.
 *
 * Hata durumlarında: fallback zincirinin son adımı bile çalışmazsa
 * "Bağlantı alınamadı" mesajını göstermek yerine *sessizce* başarısız
 * oluruz — kullanıcı zaten URL bar'dan kopyalayabilir, ekstra hata
 * gürültüsü gerekmiyor (PROGRESSIVE ENHANCEMENT prensibi).
 *
 * Accessibility:
 *  • `<button>` semantic; klavye odaklanabilir.
 *  • `aria-label` üç dilde i18n.
 *  • `aria-live="polite"` toast region — screen reader "Kopyalandı"yı duyar.
 *  • Pointer'sız klavye kullanıcısı için ayrı bir akış gerekmiyor —
 *    Enter/Space buton standardı.
 *
 * Niçin Web Share API öncelikli:
 *  • Mobile'da paylaşım kullanıcının kendi tercih ettiği uygulamayı
 *    (WhatsApp, X, Telegram, mail) seçmesine izin verir — bizim UI'da
 *    sosyal medya butonları zorlamayız (X/Twitter butonu zorunlu olur,
 *    ama Mastodon kullanıcısı mağdur kalır; vb.).
 *  • Masaüstünde Web Share API eksikse clipboard zaten daha güvenli ve
 *    daha hızlı bir iş akışı (kullanıcı kendisi yapıştıracağı yeri bilir).
 */

type FeedbackKind = 'idle' | 'copied' | 'shared';

export default function ShareButton() {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<FeedbackKind>('idle');

  // Toast auto-clear: feedback 'idle' dışına çıktığında 2 saniye sonra
  // 'idle'a geri dön. useEffect cleanup ile race-condition yok (yeni
  // share tetiklenirse önceki timer iptal).
  useEffect(() => {
    if (feedback === 'idle') return;
    const id = window.setTimeout(() => setFeedback('idle'), 2000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const title = document.title || 'Riḥlat al-Kalimāt';

    // 1. Web Share API (mobile + Safari/Edge masaüstü)
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({ title, url });
        setFeedback('shared');
        return;
      } catch (err) {
        // Kullanıcı paylaşım sheet'ini iptal ederse AbortError — sessizce geç.
        const name = err instanceof Error ? err.name : '';
        if (name === 'AbortError') return;
        // Diğer hata (permissions vs.) — clipboard'a düş.
      }
    }

    // 2. Clipboard API
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(url);
        setFeedback('copied');
        return;
      } catch {
        // Permissions reddedildi veya HTTPS değil — execCommand'a düş.
      }
    }

    // 3. execCommand fallback (eski API, hâlâ widely supported)
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        setFeedback('copied');
        return;
      }
    } catch {
      // Sessizce başarısız — kullanıcı URL bar'dan kopyalayabilir.
    }
  }, []);

  // Buton label'ı feedback durumuna göre değişir. Görsel olarak ikon
  // (SVG inline) sabit kalır; sadece a11y label + tooltip değişir.
  const label =
    feedback === 'copied'
      ? t('share.copied')
      : feedback === 'shared'
        ? t('share.shared')
        : t('share.share');

  return (
    <button
      type="button"
      className={styles.shareButton}
      onClick={handleShare}
      aria-label={label}
      title={label}
      data-feedback={feedback}
    >
      {/* Share ikonu — minimal sembol: kutu + ok yukarı (paylaş glyph).
         currentColor ile renk theme'e bağlanır. Ölçü 16×16, viewBox 24
         — TopBar'daki diğer ikonlarla aynı oran. */}
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v14" />
      </svg>
      <span
        className={styles.feedback}
        aria-live="polite"
        data-feedback={feedback}
      >
        {feedback !== 'idle' ? label : ''}
      </span>
    </button>
  );
}
