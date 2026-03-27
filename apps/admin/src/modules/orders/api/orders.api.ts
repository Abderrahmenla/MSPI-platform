import { http } from '@/modules/core/services/http.service';
import type {
  ListOrdersResponse,
  Order,
  OrderStatus,
} from '../types/order.types';

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | '';
  search?: string;
}

export async function fetchOrders(
  params?: FetchOrdersParams,
): Promise<ListOrdersResponse> {
  const { data } = await http.get<ListOrdersResponse>('/admin/orders', {
    params,
  });
  return data;
}

export async function fetchOrder(uuid: string): Promise<Order> {
  const { data } = await http.get<Order>(`/admin/orders/${uuid}`);
  return data;
}

export async function updateOrderStatus(
  uuid: string,
  status: OrderStatus,
  trackingNumber?: string,
): Promise<Order> {
  const { data } = await http.patch<Order>(`/admin/orders/${uuid}/status`, {
    status,
    ...(trackingNumber ? { trackingNumber } : {}),
  });
  return data;
}
