'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orders.api';
import { ordersKeys } from '../constants/orders-query-keys.constants';

export function useOrder(uuid: string) {
  return useQuery({
    queryKey: ordersKeys.detail(uuid),
    queryFn: () => fetchOrder(uuid),
    enabled: Boolean(uuid),
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
}
