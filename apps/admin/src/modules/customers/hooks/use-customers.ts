import { useQuery } from '@tanstack/react-query';
import {
  fetchCustomers,
  type FetchCustomersParams,
} from '../api/customers.api';
import { customersQueryKeys } from '../constants/customers-query-keys.constants';

export function useCustomers(params?: FetchCustomersParams) {
  return useQuery({
    queryKey: customersQueryKeys.list(params),
    queryFn: () => fetchCustomers(params),
  });
}
