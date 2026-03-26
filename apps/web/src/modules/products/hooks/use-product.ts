'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProductBySlug } from '../api/products.api';
import { productsKeys } from '../constants/products-query-keys.constants';

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productsKeys.detail(slug),
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}
