import { http } from '@/modules/core/services/http.service';
import type { CartResponse } from '../types/cart.types';

export interface AddCartItemPayload {
  productId: number;
  qty: number;
}

export async function addCartItem(payload: AddCartItemPayload): Promise<void> {
  await http.post('/customer/cart/items', payload);
}

export async function fetchCart(): Promise<CartResponse> {
  const { data } = await http.get<CartResponse>('/customer/cart');
  return data;
}

export async function updateCartItem(
  itemId: number,
  qty: number,
): Promise<void> {
  await http.patch(`/customer/cart/items/${itemId}`, { qty });
}

export async function removeCartItem(itemId: number): Promise<void> {
  await http.delete(`/customer/cart/items/${itemId}`);
}

export interface MergeCartPayload {
  items: { productId: number; qty: number }[];
}

export async function mergeCart(payload: MergeCartPayload): Promise<void> {
  await http.post('/customer/cart/merge', payload);
}
