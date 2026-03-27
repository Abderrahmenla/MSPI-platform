import type { FetchCustomersParams } from '../api/customers.api';

export const customersQueryKeys = {
  all: ['customers'] as const,
  lists: () => [...customersQueryKeys.all, 'list'] as const,
  list: (params?: FetchCustomersParams) =>
    [...customersQueryKeys.lists(), params] as const,
  details: () => [...customersQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...customersQueryKeys.details(), uuid] as const,
};
