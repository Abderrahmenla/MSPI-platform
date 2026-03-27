import { http } from '@/modules/core/services/http.service';
import type { Order } from '@/modules/orders/types/order.types';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  newQuotes: number;
  recentOrders: Order[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await http.get<DashboardStats>('/admin/dashboard/stats');
  return data;
}
