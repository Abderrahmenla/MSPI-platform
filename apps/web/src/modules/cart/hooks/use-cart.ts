'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../api/cart.api';
import { cartKeys } from '../constants/cart-query-keys.constants';

export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: fetchCart,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
}
