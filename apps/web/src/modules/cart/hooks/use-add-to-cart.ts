'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { addCartItem, type AddCartItemPayload } from '../api/cart.api';
import { ROUTES_MAP } from '@/modules/core/constants';

export function useAddToCart() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => addCartItem(payload),
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        router.push(ROUTES_MAP.login);
      }
    },
  });
}
