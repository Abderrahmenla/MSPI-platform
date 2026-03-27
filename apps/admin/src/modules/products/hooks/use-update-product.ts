import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '../api/products.api';
import { productsQueryKeys } from '../constants/products-query-keys.constants';
import type { UpdateProductData } from '../types/product.types';

interface UpdateProductVars {
  uuid: string;
  data: UpdateProductData;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: UpdateProductVars) =>
      updateProduct(uuid, data),
    onSuccess: (_result, { uuid }) => {
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(uuid),
      });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
    },
  });
}
