import { http } from '@/modules/core/services/http.service';
import type { Customer, ListCustomersResponse } from '../types/customer.types';

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function fetchCustomers(
  params?: FetchCustomersParams,
): Promise<ListCustomersResponse> {
  const { data } = await http.get<ListCustomersResponse>('/admin/customers', {
    params,
  });
  return data;
}

export async function fetchCustomer(uuid: string): Promise<Customer> {
  const { data } = await http.get<Customer>(`/admin/customers/${uuid}`);
  return data;
}
