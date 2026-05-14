import RelatedWords from './RelatedWords';
import type { CrossLink } from '@/types/entities';

interface Props {
  title: string;
  links: CrossLink[];
}

/**
 * Bir kişinin eserleri için kenar kolonu (al-khwarizmi.html'in
 * `.aside-block > Eserleri` bölümü). Görsel olarak `RelatedWords`
 * aside-variant'ıyla birebir aynı; ayrı komponent olması ileride
 * gerçek bir *zamanlama* (yıla göre dikey timeline, vb.) eklenmesini
 * kolaylaştırır. README → "PersonCircle, WorksTimeline, RelatedWords"
 * üçlüsü adlandırması korunur.
 */
export default function WorksTimeline({ title, links }: Props) {
  return <RelatedWords variant="aside" title={title} links={links} />;
}
