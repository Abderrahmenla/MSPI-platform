export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    slug: string;
    images: { url: string; position: number }[];
  };
}

export interface AddressSnapshot {
  address: string;
  city: string;
  label?: string;
}

export interface Order {
  id: number;
  uuid: string;
  ref: string;
  status: OrderStatus;
  totalAmount: number;
  phone: string;
  addressSnapshot: AddressSnapshot;
  trackingNumber: string | null;
  idempotencyKey: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderDto {
  idempotencyKey: string;
  phone: string;
  address: AddressSnapshot;
}

export interface OrderListResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number };
}

export interface OrderResponse {
  data: Order;
}
