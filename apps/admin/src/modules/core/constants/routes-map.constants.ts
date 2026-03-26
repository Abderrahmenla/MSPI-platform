export const ADMIN_ROUTES = {
  login: '/login',
  dashboard: '/',
  orders: '/orders',
  order: (uuid: string) => `/orders/${uuid}`,
  quotes: '/quotes',
  quote: (uuid: string) => `/quotes/${uuid}`,
  customers: '/customers',
  customer: (uuid: string) => `/customers/${uuid}`,
  products: '/products',
  product: (uuid: string) => `/products/${uuid}`,
  settings: '/settings',
} as const;
