import { http } from '@/modules/core/services/http.service';
import type {
  ProductListResponse,
  ProductResponse,
} from '../types/product.types';

export interface ListProductsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export async function fetchProducts(
  params: ListProductsParams = {},
): Promise<ProductListResponse> {
  const { data } = await http.get<ProductListResponse>('/products', { params });
  return data;
}

export async function fetchProductBySlug(
  slug: string,
): Promise<ProductResponse> {
  const { data } = await http.get<ProductResponse>(`/products/${slug}`);
  return data;
}
