import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/products.api';
import { productsQueryKeys } from '../constants/products-query-keys.constants';

export function useProduct(uuid: string) {
  return useQuery({
    queryKey: productsQueryKeys.detail(uuid),
    queryFn: () => fetchProduct(uuid),
    enabled: !!uuid && uuid !== 'new',
  });
}
