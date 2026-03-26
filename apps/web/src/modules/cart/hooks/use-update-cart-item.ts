'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCartItem } from '../api/cart.api';
import { cartKeys } from '../constants/cart-query-keys.constants';

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, qty }: { itemId: number; qty: number }) =>
      updateCartItem(itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
