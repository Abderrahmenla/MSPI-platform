import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/products.api';
import { productsQueryKeys } from '../constants/products-query-keys.constants';
import type { CreateProductData } from '../types/product.types';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
    },
  });
}
