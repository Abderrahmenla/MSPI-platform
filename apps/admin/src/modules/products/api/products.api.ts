import { http } from '@/modules/core/services/http.service';
import type {
  CreateProductData,
  FetchProductsParams,
  ListProductsResponse,
  Product,
  UpdateProductData,
} from '../types/product.types';

export async function fetchProducts(
  params?: FetchProductsParams,
): Promise<ListProductsResponse> {
  const { data } = await http.get<ListProductsResponse>('/admin/products', {
    params,
  });
  return data;
}

export async function fetchProduct(uuid: string): Promise<Product> {
  const { data } = await http.get<Product>(`/admin/products/${uuid}`);
  return data;
}

export async function createProduct(
  payload: CreateProductData,
): Promise<Product> {
  const { data } = await http.post<Product>('/admin/products', payload);
  return data;
}

export async function updateProduct(
  uuid: string,
  payload: UpdateProductData,
): Promise<Product> {
  const { data } = await http.patch<Product>(
    `/admin/products/${uuid}`,
    payload,
  );
  return data;
}

export async function toggleProductStatus(
  uuid: string,
  isActive: boolean,
): Promise<Product> {
  const { data } = await http.patch<Product>(`/admin/products/${uuid}`, {
    isActive,
  });
  return data;
}
