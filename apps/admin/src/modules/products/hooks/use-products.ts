import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products.api';
import { productsQueryKeys } from '../constants/products-query-keys.constants';
import type { FetchProductsParams } from '../types/product.types';

export function useProducts(params?: FetchProductsParams) {
  return useQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}
