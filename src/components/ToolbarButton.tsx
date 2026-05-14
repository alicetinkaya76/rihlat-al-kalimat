import type { ReactNode } from 'react';

/**
 * Generic segmented-control button (dilim 7/10 — WordsListPage local;
 * dilim 7/16.δ.A — paylaşılan component).
 *
 * Sort modes ve tier filter aynı görsel pattern'i paylaşır: ARIA toolbar
 * içinde aria-pressed buttonu. Tip parametresi `M extends string` —
 * her iki tarafa da hizmet eder. WordsListPage'de yerel SortButton/
 * FilterButton typed alias'ları olarak girdi, 7/12'de ToolbarButton'a
 * yükseltildi, 7/16'da Person+Book list page'lerinin de gelmesiyle
 * paylaşılan `@/components/ToolbarButton` dosyasına taşındı.
 *
 * CSS class'ları: `entitylist-sort-btn` + `entitylist-sort-btn--active`
 * (EntityListPage.css). İsim "sort" diyor ama segmented control
 * davranışı sort/filter ayrımı yapmaz; her ikisi de aynı görsel sicilde.
 */
export function ToolbarButton<M extends string>({
  mode,
  current,
  onClick,
  children,
}: {
  mode: M;
  current: M;
  onClick: (mode: M) => void;
  children: ReactNode;
}) {
  const isActive = mode === current;
  return (
    <button
      type="button"
      className={
        'entitylist-sort-btn' + (isActive ? ' entitylist-sort-btn--active' : '')
      }
      aria-pressed={isActive}
      onClick={() => onClick(mode)}
    >
      {children}
    </button>
  );
}
