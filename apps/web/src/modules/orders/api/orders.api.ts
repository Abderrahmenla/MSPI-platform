import { http } from '@/modules/core/services/http.service';
import type {
  CreateOrderDto,
  OrderListResponse,
  OrderResponse,
} from '../types/order.types';

export async function createOrder(dto: CreateOrderDto): Promise<OrderResponse> {
  const { data } = await http.post<OrderResponse>('/customer/orders', dto);
  return data;
}

export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<OrderListResponse> {
  const { data } = await http.get<OrderListResponse>('/customer/orders', {
    params,
  });
  return data;
}

export async function fetchOrder(uuid: string): Promise<OrderResponse> {
  const { data } = await http.get<OrderResponse>(`/customer/orders/${uuid}`);
  return data;
}
