'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem, type AddCartItemPayload } from '../api/cart.api';
import { addGuestCartItem } from '../lib/guest-cart';
import { cartKeys } from '../constants/cart-query-keys.constants';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => addCartItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
    onError: (error: unknown, variables) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        // Guest: persist to localStorage so it can be merged after login
        addGuestCartItem(variables.productId, variables.qty);
      }
    },
  });
}
