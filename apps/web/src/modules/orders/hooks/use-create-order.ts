'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { createOrder } from '../api/orders.api';
import { ordersKeys } from '../constants/orders-query-keys.constants';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      router.push(
        `${ROUTES_MAP.checkoutConfirmation}?ref=${response.data.ref}`,
      );
    },
  });
}
