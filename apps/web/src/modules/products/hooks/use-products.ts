'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProducts, type ListProductsParams } from '../api/products.api';
import { productsKeys } from '../constants/products-query-keys.constants';

export function useProducts(params: ListProductsParams = {}) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => fetchProducts(params),
  });
}
