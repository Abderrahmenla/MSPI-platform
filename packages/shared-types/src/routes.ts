export const WEB_ROUTES = {
  home: (locale: string) => `/${locale}`,
  products: (locale: string) => `/${locale}/products`,
  productDetail: (locale: string, slug: string) =>
    `/${locale}/products/${slug}`,
  cart: (locale: string) => `/${locale}/cart`,
  checkout: (locale: string) => `/${locale}/checkout`,
  devis: (locale: string) => `/${locale}/devis`,
  login: (locale: string) => `/${locale}/login`,
  account: (locale: string) => `/${locale}/account`,
  orders: (locale: string) => `/${locale}/account/orders`,
  orderDetail: (locale: string, uuid: string) =>
    `/${locale}/account/orders/${uuid}`,
  quotes: (locale: string) => `/${locale}/account/quotes`,
  quoteDetail: (locale: string, uuid: string) =>
    `/${locale}/account/quotes/${uuid}`,
  profile: (locale: string) => `/${locale}/account/profile`,
} as const;

export const ADMIN_ROUTES = {
  login: '/login',
  dashboard: '/',
  orders: '/orders',
  orderDetail: (uuid: string) => `/orders/${uuid}`,
  quotes: '/quotes',
  quoteDetail: (uuid: string) => `/quotes/${uuid}`,
  customers: '/customers',
  customerDetail: (uuid: string) => `/customers/${uuid}`,
  products: '/products',
  productEdit: (uuid: string) => `/products/${uuid}`,
  settings: '/settings',
} as const;
