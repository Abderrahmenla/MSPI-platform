import type { FetchOrdersParams } from '../api/orders.api';

export const ordersQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersQueryKeys.all, 'list'] as const,
  list: (params?: FetchOrdersParams) =>
    [...ordersQueryKeys.lists(), params] as const,
  details: () => [...ordersQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...ordersQueryKeys.details(), uuid] as const,
};
