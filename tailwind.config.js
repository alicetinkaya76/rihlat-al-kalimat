/**
 * Tailwind, ileride yardımcı sınıflar (flex/grid/gap) için kullanılacak.
 * Bespoke manuscript stilleri CSS modules + tokens.css üzerinden gider.
 * Renkler ve tipografi CSS değişkenlerine bağlandı; Tailwind utility'leri de
 * theme switch'e otomatik uyum sağlar (örn. `bg-bg`, `text-fg`, `border-rule`).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        parchment: 'var(--parchment)',
        terracotta: 'var(--terracotta)',
        lazaward: 'var(--lazaward)',
        gold: 'var(--gold)',
        saffron: 'var(--saffron)',
        moss: 'var(--moss)',
        bg: 'var(--bg)',
        'bg-deep': 'var(--bg-deep)',
        'bg-edge': 'var(--bg-edge)',
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-faint': 'var(--fg-faint)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
      },
      fontFamily: {
        serif: 'var(--serif)',
        sans: 'var(--sans)',
        mono: 'var(--mono)',
        arabic: 'var(--arabic)',
        'arabic-ui': 'var(--arabic-ui)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
