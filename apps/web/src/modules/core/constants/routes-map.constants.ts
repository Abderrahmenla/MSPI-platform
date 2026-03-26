/**
 * Central route map for the web app.
 * All `Link` hrefs and `redirect()` calls MUST use these constants.
 * Paths are relative to the locale prefix (next-intl handles locale injection).
 */
export const ROUTES_MAP = {
  home: '/',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  devis: '/devis',
  login: '/login',
  cart: '/cart',
  checkout: '/checkout',
  checkoutConfirmation: '/checkout/confirmation',
  account: {
    root: '/account',
    orders: '/account/orders',
    order: (uuid: string) => `/account/orders/${uuid}`,
    quotes: '/account/quotes',
    quote: (uuid: string) => `/account/quotes/${uuid}`,
    profile: '/account/profile',
  },
} as const;
