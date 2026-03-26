'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeCart } from '../api/cart.api';
import { getGuestCart, clearGuestCart } from '../lib/guest-cart';
import { cartKeys } from '../constants/cart-query-keys.constants';

/**
 * Silently merges the guest localStorage cart with the server cart on every
 * page mount. If the merge succeeds (user is authenticated), the local cart
 * is cleared. If it fails with 401 (guest), nothing happens.
 */
export function CartMergeOnLogin() {
  const queryClient = useQueryClient();
  const attempted = useRef(false);

  const { mutate: merge } = useMutation({
    mutationFn: mergeCart,
    onSuccess: () => {
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
    onError: () => {
      // 401 = not authenticated; any other error = ignore silently
    },
  });

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const items = getGuestCart();
    if (items.length > 0) {
      merge({ items });
    }
  }, [merge]);

  return null;
}
