import { useEffect, useState } from 'react';

/**
 * Lazy entity hidrasyon hook'u — dilim 7/1.
 *
 * Manifest'te slug'ı olan ama gövdesi henüz indirilmemiş bir entity'yi
 * dynamic import üzerinden çeker. Üç durum: 'loading' (network bekleniyor),
 * 'loaded' (entity hazır), 'not-found' (slug undefined ya da fetcher
 * undefined döndü).
 *
 * Race-safe: aynı bileşen içinde slug değişirse (örn. user `/tr/kelime/
 * algorithm`'tan `/tr/kelime/algebra`'ya geçer ve sayfa unmount yerine
 * useParams güncellenir) önceki Promise resolve olduğunda state'e
 * yansıtılmaz. `alive` flag pattern'i.
 *
 * Kullanım:
 *   const { entity: word, status } = useEntity(slug, getWord);
 *   if (status === 'loading')   return <RouteFallback />;
 *   if (status === 'not-found') return <ComingSoon slug={slug} />;
 *   // status === 'loaded' → word kesinlikle var
 *
 * Tasarım notu: status='not-found' ile entity===undefined kombinasyonunu
 * tek bir union olarak da modelleyebilirdik (`{ status: 'loaded'; entity:
 * T }` vs); ancak her sayfa zaten guard'ları ardışık yazıyor ve TS'in
 * narrowing'i basit boolean check'lerle çalışıyor — daha sade tutuldu.
 *
 * Cache: registry.ts kendi seviyesinde (slug → Promise) cache tutuyor;
 * burada ayrıca cache'lemeye gerek yok. Hook her mount'ta useEffect içinde
 * fetcher'ı çağırır; resolved Promise mikrotask'ta anında dönmüş olur.
 */
export type EntityStatus = 'loading' | 'loaded' | 'not-found';

export interface EntityState<T> {
  entity: T | undefined;
  status: EntityStatus;
}

export function useEntity<T>(
  slug: string | undefined,
  fetcher: (slug: string) => Promise<T | undefined>
): EntityState<T> {
  const [state, setState] = useState<EntityState<T>>(() =>
    slug
      ? { entity: undefined, status: 'loading' }
      : { entity: undefined, status: 'not-found' }
  );

  useEffect(() => {
    if (!slug) {
      setState({ entity: undefined, status: 'not-found' });
      return;
    }
    let alive = true;
    setState({ entity: undefined, status: 'loading' });
    fetcher(slug).then((e) => {
      if (!alive) return;
      setState(
        e !== undefined
          ? { entity: e, status: 'loaded' }
          : { entity: undefined, status: 'not-found' }
      );
    });
    return () => {
      alive = false;
    };
    // fetcher referansının kararlı olduğunu varsayıyoruz (registry export'u
    // module scope'ta sabit); dep listesine ekleyince edge case'lerde
    // gereksiz re-fire olur. Cağıranların inline lambda passing'inden
    // kaçınması beklenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return state;
}
