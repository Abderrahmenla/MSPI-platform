export const productsKeys = {
  all: ['products'] as const,
  list: (params?: Record<string, unknown>) =>
    [...productsKeys.all, 'list', params] as const,
  detail: (slug: string) => [...productsKeys.all, 'detail', slug] as const,
  stock: (slug: string) => [...productsKeys.all, 'stock', slug] as const,
};
