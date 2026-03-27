import type { FetchProductsParams } from '../types/product.types';

export const productsQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productsQueryKeys.all, 'list'] as const,
  list: (params?: FetchProductsParams) =>
    [...productsQueryKeys.lists(), params] as const,
  details: () => [...productsQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...productsQueryKeys.details(), uuid] as const,
};
