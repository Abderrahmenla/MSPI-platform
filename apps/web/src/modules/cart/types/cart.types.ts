import type { Product } from '@/modules/products/types/product.types';

export interface CartItem {
  id: number;
  qty: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface CartResponse {
  data: Cart;
}
