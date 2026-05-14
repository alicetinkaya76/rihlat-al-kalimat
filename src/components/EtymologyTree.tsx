import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3';

import { useLang } from '@/hooks/useLang';
import { pickLang } from '@/utils/localized';
import type { EtymologyNode } from '@/types/entities';

import './EtymologyTree.css';

/**
 * EtymologyTree — bir kelimenin köken ağacının yatay D3 tree'si.
 *
 * Mimari kararlar:
 *  • D3 yalnızca *layout hesabı* için (`d3.hierarchy` + `d3.tree`); SVG
 *    elementleri React tarafından render edilir. Bu, idiomatic React
 *    (manuel select/remove cycling yok), state senkronu temiz ve
 *    declarative.
 *  • Yatay tree: kök sol kenar (LTR) / sağ kenar (RTL); yapraklar zıt
 *    yönde. README #2 (Oturum 4 dilim 2 önerisi): "D3 ağacı dile göre
 *    yön (LTR/RTL) değiştirir."
 *  • Etiket node *altına* ortalanmış üç satır: ad / dil / yıl. Yan-tarafa
 *    yerleşim, uzun etiketlerde (örn. "Algoritmi · Algorismus") komşu
 *    sütunla çakışıyor; alt-yerleşim her node'a kendi dikey alanını verir.
 *  • Arapça-yazılı node etiketi `lang="ar" dir="rtl"`; Latin etiketler
 *    `dir="ltr"`. Etiketin yön'ü, *ağacın* yön'ünden bağımsız (içerik
 *    seviyesi vs. layout seviyesi).
 *  • SVG'nin minimum genişliği depth × LEVEL_MIN_PX'i geçemez; bu yüzden
 *    container `overflow-x: auto` — dar viewport'larda yatay kaydırılır.
 *  • Renk/tipografi token'lardan: --gold (circles), --rule (links), --fg
 *    (label), --fg-muted (lang), --fg-faint (year). Light/dark otomatik.
 */

interface Props {
  tree: EtymologyNode;
  /** Section frame için "§ 03" gibi ön ek. Default § 03. */
  sectionNum?: string;
}

/** Node etiketinin Arapça yazımda olup olmadığını anlama: Arabic-script
 *  Unicode bloğu (U+0600..U+06FF) bulunması yeter. Sources.tsx'te de
 *  aynı pattern kullanılıyor. */
const ARABIC_SCRIPT_RE = /[\u0600-\u06FF]/;

/** Layout sabitleri. Piksel cinsinden. */
const ROW_GAP = 110;          // sibling node'lar arasındaki dikey aralık
const LEVEL_MIN_PX = 170;     // en dar viewport'ta bile sütun genişliği bu
const ROOT_PAD = 28;          // kökten SVG kenarına boşluk
const LEAF_PAD = 130;         // yaprakların etiketinin sığması için kuyruk
const MARGIN_TOP = 28;
const MARGIN_BOTTOM = 36;

/** Ağaç dalları için elle yazılmış cubic bezier (d3.linkHorizontal'ın
 *  yatay versiyonu — kontrol noktası midX'te). Accessor'ları React
 *  tarafında doğrudan koordinat olarak vermek tip karmaşasını azaltıyor. */
function bezierLink(sx: number, sy: number, tx: number, ty: number): string {
  const midX = (sx + tx) / 2;
  return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
}

export default function EtymologyTree({ tree, sectionNum = '§ 03' }: Props) {
  const { t } = useTranslation();
  const { lang, isRtl } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // ResizeObserver — container genişliği değiştikçe layout yeniden hesaplanır.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // İlk ölçüm — ResizeObserver bazen ilk frame'de tetiklenmez.
    setContainerWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    const root = d3.hierarchy<EtymologyNode>(tree);
    const depth = root.height; // 0..N (yaprak için 0; kök için max)
    if (depth === 0) {
      // Tek node — sadece kökü göster, link yok.
      return {
        root: d3.tree<EtymologyNode>()(root) as HierarchyPointNode<EtymologyNode>,
        innerWidth: 0,
        svgWidth: ROOT_PAD + LEAF_PAD,
        height: ROW_GAP + MARGIN_TOP + MARGIN_BOTTOM,
        xOffset: MARGIN_TOP,
      };
    }
    // Sütun genişliği: container yeterince genişse eşit dağıt, değilse
    // en az LEVEL_MIN_PX. Bu, dar viewport'ta SVG'nin container'dan
    // taşmasını ve container'ın yatay kaydırmasını sağlar.
    const availableInner = Math.max(0, containerWidth - ROOT_PAD - LEAF_PAD);
    const colWidth = Math.max(LEVEL_MIN_PX, availableInner / depth);
    const innerWidth = colWidth * depth;

    const treeLayout = d3
      .tree<EtymologyNode>()
      .nodeSize([ROW_GAP, colWidth])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.25));

    const positioned = treeLayout(root);

    const xs = positioned.descendants().map((n) => n.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const xOffset = -minX + MARGIN_TOP;
    const height = maxX - minX + MARGIN_TOP + MARGIN_BOTTOM;
    const svgWidth = innerWidth + ROOT_PAD + LEAF_PAD;

    return { root: positioned, innerWidth, svgWidth, height, xOffset };
  }, [tree, containerWidth]);

  // Container ölçülmeden render etme — sıfır genişlikte yararsız.
  if (containerWidth === 0) {
    return (
      <section className="section etymology-section" ref={containerRef}>
        <header className="section-head">
          <span className="section-num">{sectionNum}</span>
          <h2 className="section-title">{t('sections.etymology')}</h2>
        </header>
        <div className="etymology-tree-placeholder" aria-hidden="true" />
      </section>
    );
  }

  const { root, innerWidth, svgWidth, height, xOffset } = layout;

  // Koordinat projeksiyon: depth → yatay, breadth → dikey. RTL'de yatayı
  // ayna. node.y = depth coord (d3 horizontal layout'ta), node.x = breadth.
  const projectX = (n: HierarchyPointNode<EtymologyNode>): number =>
    isRtl ? ROOT_PAD + (innerWidth - n.y) : ROOT_PAD + n.y;
  const projectY = (n: HierarchyPointNode<EtymologyNode>): number => xOffset + n.x;

  return (
    <section className="section etymology-section">
      <header className="section-head">
        <span className="section-num">{sectionNum}</span>
        <h2 className="section-title">{t('sections.etymology')}</h2>
      </header>

      <div className="etymology-tree-wrap" ref={containerRef}>
        <svg
          className="etymology-tree"
          width={svgWidth}
          height={height}
          viewBox={`0 0 ${svgWidth} ${height}`}
          role="img"
          aria-label={t('sections.etymology')}
        >
          <g className="etymology-links" aria-hidden="true">
            {root.links().map((link, i) => (
              <path
                key={`L${i}`}
                className="etymology-link"
                d={bezierLink(
                  projectX(link.source as HierarchyPointNode<EtymologyNode>),
                  projectY(link.source as HierarchyPointNode<EtymologyNode>),
                  projectX(link.target as HierarchyPointNode<EtymologyNode>),
                  projectY(link.target as HierarchyPointNode<EtymologyNode>)
                )}
              />
            ))}
          </g>

          <g className="etymology-nodes">
            {root.descendants().map((node, i) => {
              const labelIsArabic = ARABIC_SCRIPT_RE.test(node.data.label);
              const langText = pickLang(node.data.language, lang) ?? '';
              return (
                <NodeMark
                  key={`N${i}`}
                  cx={projectX(node)}
                  cy={projectY(node)}
                  label={node.data.label}
                  labelIsArabic={labelIsArabic}
                  language={langText}
                  year={node.data.year}
                  isRoot={!node.parent}
                  isLeaf={!node.children || node.children.length === 0}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// NodeMark — circle + alt-block (label / language / year)
// ─────────────────────────────────────────────────────────────────────

function NodeMark({
  cx,
  cy,
  label,
  labelIsArabic,
  language,
  year,
  isRoot,
  isLeaf,
}: {
  cx: number;
  cy: number;
  label: string;
  labelIsArabic: boolean;
  language: string;
  year: string | undefined;
  isRoot: boolean;
  isLeaf: boolean;
}) {
  // Etiket bloğu daire'nin altında ortalı. Daire merkezinden 18px aşağıda
  // ilk satır (label), sonra sırasıyla 16 ve 14 px ile language ve year.
  const cls = [
    'etymology-node',
    isRoot ? 'etymology-node--root' : '',
    isLeaf ? 'etymology-node--leaf' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g className={cls} transform={`translate(${cx}, ${cy})`}>
      <circle className="etymology-node-mark" r={isRoot || isLeaf ? 5.5 : 4.5} />

      {/* Etiket — Arapça-yazılı ise lang/dir override, latince-yazılı ise
          ana akışta (LTR). textAnchor middle olduğundan dir bidi-render'a
          etki eder, x koordinatına değil. */}
      <text
        className="etymology-node-label"
        textAnchor="middle"
        y={20}
        {...(labelIsArabic
          ? { lang: 'ar', dir: 'rtl' as const }
          : { dir: 'ltr' as const })}
      >
        {label}
      </text>

      {language && (
        <text className="etymology-node-language" textAnchor="middle" y={36}>
          {language}
        </text>
      )}

      {year && (
        <text className="etymology-node-year" textAnchor="middle" y={50}>
          {year}
        </text>
      )}
    </g>
  );
}

// Type kesme: HierarchyPointLink'i import et ki üst tarafta kullanılabilsin.
// (Yukarıda link.source/target için cast yapıyoruz, root.links() zaten
// HierarchyPointLink döndürüyor; ek import burada sadece tip seviyesinde
// belirginlik için.)
export type { HierarchyPointLink, HierarchyPointNode };
