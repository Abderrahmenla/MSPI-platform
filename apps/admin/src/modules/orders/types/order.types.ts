export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  product: { name: string };
}

export interface Order {
  uuid: string;
  ref: string;
  status: OrderStatus;
  totalAmount: number;
  addressSnapshot: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
  customer: { name: string; email: string };
}

export interface ListOrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number };
}
