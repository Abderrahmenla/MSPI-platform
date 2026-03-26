import { http } from '@/modules/core/services/http.service';

export interface AddCartItemPayload {
  productId: number;
  qty: number;
}

export async function addCartItem(payload: AddCartItemPayload): Promise<void> {
  await http.post('/customer/cart/items', payload);
}
