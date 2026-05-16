import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
/**
 * Riḥlat al-Kalimāt içerik manifest plugin'i (Oturum 7 dilim 1).
 *
 * Görev:
 *   1. `buildStart` — Vite build/dev başlatılırken manifest'i yeniden üret.
 *      (Normal akışta `predev`/`prebuild` package script'i bunu zaten yapar;
 *      bu plugin "vite'ı doğrudan çağıran" senaryolar için belt-and-
 *      suspenders.)
 *   2. `configureServer` — dev sırasında `/content/**\/*.mdx` değiştiğinde
 *      manifest'i yeniden üret. Manifest dosyasının disk hâli güncellendiği
 *      için Vite'in module graph'ı zaten invalidate ediyor; biz sadece
 *      üreteceğiz, HMR'i Vite hallediyor.
 *
 * Niçin spawnSync subprocess (in-process dynamic import yerine):
 *   • Generator script Node-only (fs/yaml); Vite plugin context'inde dynamic
 *     import edilebilirdi ama subprocess izolasyonu daha temiz: hata
 *     generator'da kaldıkça plugin state'i kirlenmez, log çıktısı net.
 *   • Süre: 6 MDX'te ~50ms; 240 MDX'e çıktığında bile <500ms.
 *
 * Stale risk: `vite build`'i package.json'dan değil doğrudan çağıran ve
 * arada content/'i değiştiren bir kullanıcı için bile buildStart manifest'i
 * taze günceller — her seferinde rejenere ediyoruz (file-exists kontrol
 * yerine).
 */
function rihlaContentManifest(): Plugin {
  const generatorPath = path.resolve(__dirname, 'scripts/generate-manifest.mjs');
  const manifestPath = path.resolve(__dirname, 'src/content/manifest.generated.ts');
  // Dilim 7/9.B: generator now uses tsx (it imports JOURNEY_TYPES from
  // src/types/entities.ts to eliminate the previously-duplicated arketip
  // listesi). tsx is a devDep; the resolved binary is in node_modules/.bin.
  // On Windows the binary is `tsx.cmd`; spawnSync's PATHEXT handling covers
  // that when given a bare command, but here we pass an absolute path so
  // we account for it manually.
  const tsxBin = path.resolve(
    __dirname,
    'node_modules/.bin',
    process.platform === 'win32' ? 'tsx.cmd' : 'tsx'
  );
  const contentRe = /\/content\/(words|persons|books|themes)\/[^/]+\.mdx$/;

  function regenerate(reason: string): void {
    const res = spawnSync(tsxBin, [generatorPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    if (res.status === 0) {
      const out = (res.stdout ?? '').trim();
      // eslint-disable-next-line no-console
      console.log(`[rihla-manifest:${reason}] ${out.split('\n').join(' ')}`);
    } else {
      // eslint-disable-next-line no-console
      console.error(`[rihla-manifest:${reason}] generation failed (exit ${res.status})`);
      // eslint-disable-next-line no-console
      console.error(res.stderr ?? '');
    }
  }

  return {
    name: 'rihla-content-manifest',

    buildStart() {
      regenerate('buildStart');
      if (!existsSync(manifestPath)) {
        throw new Error(
          `[rihla-manifest] manifest still missing after generation: ${manifestPath}`
        );
      }
    },

    configureServer(server) {
      const handler = (file: string) => {
        const norm = file.replace(/\\/g, '/');
        if (!contentRe.test(norm)) return;
        regenerate('watch');
      };
      server.watcher.on('change', handler);
      server.watcher.on('add', handler);
      server.watcher.on('unlink', handler);
    },
  };
}

/**
 * Production origin injection plugin (dilim 7/19.ι.A — production deploy).
 *
 * Görev: build-time'da `https://rihla.example` placeholder'larını
 * (index.html'in OG/Twitter Card meta etiketleri ve canonical link'i) gerçek
 * production origin'iyle değiştirir. Origin kaynakları, öncelik sırasıyla:
 *   1. `SITE_ORIGIN` ortam değişkeni — CI/CD/local deploy override
 *   2. `data/site-config.json` → `origin` alanı — versiyon kontrolündeki
 *      kanonik production URL (Cloudflare Pages / Netlify deploy'da bunu
 *      dashboard'dan veya env üzerinden set ederiz; bu dosyada da kayıt
 *      tutulur — single source of truth)
 *   3. Fallback: `https://rihla.example` (placeholder olduğu
 *      gibi kalır — yerel `vite build` çıktısı production'a gitmiyorsa
 *      placeholder'ı görmek meta etiketlerin doğru bağlandığını anlamamızı
 *      sağlar)
 *
 * `transformIndexHtml` hook'u sadece build aşamasında çalışır — dev
 * server'da index.html'i değiştirmez (geliştiriciye placeholder'ı
 * göstermeyiz; local'de zaten relative paths yeter).
 *
 * Sitemap.xml zaten `process.env.SITE_ORIGIN` okur (generate-sitemap.mjs);
 * bu plugin index.html için aynı zinciri açar — iki ayrı yere aynı env
 * değişkeni dokunur.
 *
 * Niçin tek bir RegExp `replaceAll`:
 *   index.html'de 6 yerde `https://rihla.example` görünür:
 *     • og:image, og:url, twitter:image (mutlak URL'ler)
 *     • canonical link href
 *   Hepsi tam URL — string replace yeter, parsing gereksiz. Eğer placeholder
 *   ileride başka yerde de kullanılırsa (sitemap link header vs) bu plugin
 *   tek noktada güncellenir.
 */
function rihlaOriginInject(): Plugin {
  const PLACEHOLDER = 'https://rihla.example';

  function resolveOrigin(): string {
    // 1. Env override
    const env = process.env.SITE_ORIGIN;
    if (env && env.trim().length > 0) return env.trim().replace(/\/$/, '');

    // 2. data/site-config.json
    try {
      const configPath = path.resolve(__dirname, 'data/site-config.json');
      if (existsSync(configPath)) {
        // Static ESM import edilen readFileSync — eski CJS require kalıntısı
        // ESM-mode'da `Dynamic require of "node:fs" is not supported` hatası
        // veriyordu; top-level import çözer (Session 10.5 hotfix).
        const raw = readFileSync(configPath, 'utf8');
        const json = JSON.parse(raw);
        if (typeof json.origin === 'string' && json.origin.length > 0) {
          return String(json.origin).replace(/\/$/, '');
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[rihla-origin] failed reading data/site-config.json:', e);
    }

    // 3. Fallback
    return PLACEHOLDER;
  }

  return {
    name: 'rihla-origin-inject',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const origin = resolveOrigin();
        if (origin === PLACEHOLDER) {
          // eslint-disable-next-line no-console
          console.warn(
            `[rihla-origin] using placeholder origin (${PLACEHOLDER}); set SITE_ORIGIN env or data/site-config.json for production`
          );
          return html;
        }
        const replaced = html.split(PLACEHOLDER).join(origin);
        // eslint-disable-next-line no-console
        console.log(`[rihla-origin] injected production origin: ${origin}`);
        return replaced;
      },
    },
  };
}

export default defineConfig({
  // GitHub Pages deploy için base path:
  // - Yerel dev / preview: BASE_PATH unset → '/' (default)
  // - GitHub Actions production build: BASE_PATH=/repo-name/ env'i set edilir
  //   (.github/workflows/deploy.yml'de). Sondaki slash önemli; Vite asset URL'lerini
  //   bunun üzerine inşa eder.
  // - Custom domain kullanılırsa BASE_PATH=/ yapılabilir.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), rihlaContentManifest(), rihlaOriginInject()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
