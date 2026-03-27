export interface Customer {
  uuid: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    orders: number;
    quotes: number;
  };
}

export interface ListCustomersResponse {
  data: Customer[];
  meta: { total: number; page: number; limit: number };
}
