'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCartItem } from '../api/cart.api';
import { cartKeys } from '../constants/cart-query-keys.constants';

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
