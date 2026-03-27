'use client';

import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { ROUTES_MAP } from '@/modules/core/constants';
import { useAddToCart } from '@/modules/cart/hooks/use-add-to-cart';
import type { OrderItem } from '../types/order.types';

export function useReorder() {
  const { mutateAsync } = useAddToCart();
  const router = useRouter();

  async function reorder(items: OrderItem[]) {
    let added = 0;
    let skipped = 0;
    const skippedNames: string[] = [];

    for (const item of items) {
      try {
        await mutateAsync({ productId: item.productId, qty: item.qty });
        added++;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 409 || status === 422) {
          skipped++;
          skippedNames.push(item.product?.name ?? item.productName);
        } else {
          // Non-OOS error: abort silently but count as skipped
          skipped++;
          skippedNames.push(item.product?.name ?? item.productName);
        }
      }
    }

    if (added === 0 && skipped > 0) {
      // §16.6: All items OOS
      toast.error(
        "Aucun article de cette commande n'est actuellement disponible.",
      );
      return;
    }

    if (skipped > 0) {
      // §16.6: Some items OOS
      toast.warning(
        `${skipped} article${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''} (rupture de stock).`,
        { description: skippedNames.join(', ') },
      );
    } else {
      // §16.6: All items added, note prices may differ
      toast.success('Articles ajoutés au panier.', {
        description: 'Les prix peuvent avoir changé depuis votre commande.',
      });
    }

    router.push(ROUTES_MAP.cart);
  }

  return { reorder };
}
