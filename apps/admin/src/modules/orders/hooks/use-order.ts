import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orders.api';
import { ordersQueryKeys } from '../constants/orders-query-keys.constants';

export function useOrder(uuid: string) {
  return useQuery({
    queryKey: ordersQueryKeys.detail(uuid),
    queryFn: () => fetchOrder(uuid),
    enabled: Boolean(uuid),
  });
}
