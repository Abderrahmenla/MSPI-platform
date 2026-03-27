import { useQuery } from '@tanstack/react-query';
import { fetchCustomer } from '../api/customers.api';
import { customersQueryKeys } from '../constants/customers-query-keys.constants';

export function useCustomer(uuid: string) {
  return useQuery({
    queryKey: customersQueryKeys.detail(uuid),
    queryFn: () => fetchCustomer(uuid),
    enabled: Boolean(uuid),
  });
}
