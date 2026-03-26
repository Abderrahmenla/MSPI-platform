'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../api/orders.api';
import { ordersKeys } from '../constants/orders-query-keys.constants';

export function useOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () => fetchOrders(params),
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
}
