import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '../api/orders.api';
import { ordersQueryKeys } from '../constants/orders-query-keys.constants';
import type { OrderStatus } from '../types/order.types';

interface UpdateOrderStatusVars {
  uuid: string;
  status: OrderStatus;
  trackingNumber?: string;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status, trackingNumber }: UpdateOrderStatusVars) =>
      updateOrderStatus(uuid, status, trackingNumber),
    onSuccess: (_data, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.detail(uuid) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.lists() });
    },
  });
}
