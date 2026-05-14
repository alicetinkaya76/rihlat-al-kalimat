import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'rihla-theme';

function readInitialTheme(): Theme {
  // index.html'deki inline-script atributu set etmiş olmalı; oradan oku.
  const fromAttr = document.documentElement.getAttribute('data-theme') as
    | Theme
    | null;
  if (fromAttr === 'light' || fromAttr === 'dark') return fromAttr;

  // Yedek: localStorage / prefers-color-scheme.
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage erişilemez */
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Tema state'ini yönetir.
 * • Mount sırasında HTML üzerindeki data-theme'i kaynak alır (FOUC önleyici
 *   inline script ile uyumlu).
 * • Değişimde hem DOM hem localStorage senkron tutulur.
 * • OS-seviyesi tema değişimine reactive: kullanıcı manuel set etmediği
 *   sürece prefers-color-scheme değişikliklerini izler.
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
} {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  // Tema değişiminde DOM ve storage'ı senkronla.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* yoksay */
    }
  }, [theme]);

  // OS tema değişikliklerini izle — yalnız kullanıcı manuel seçim yapmadıysa
  // takip et. Şu an basit: kullanıcı bir kere set ettiyse storage doludur,
  // o yüzden burada storage'ı da dinleyen koşullu bir mantık eklenebilir.
  // Sadelik için şimdilik manuel-seçim daima kazanır.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return; // kullanıcı seçimini değiştirme
      } catch {
        /* yoksay */
      }
      setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),
    []
  );

  return { theme, setTheme, toggleTheme };
}
