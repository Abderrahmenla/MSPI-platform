import { useQuery } from '@tanstack/react-query';
import { fetchOrders, type FetchOrdersParams } from '../api/orders.api';
import { ordersQueryKeys } from '../constants/orders-query-keys.constants';

export function useOrders(params?: FetchOrdersParams) {
  return useQuery({
    queryKey: ordersQueryKeys.list(params),
    queryFn: () => fetchOrders(params),
  });
}
