export const ordersKeys = {
  all: ['orders'] as const,
  list: (params?: object) => [...ordersKeys.all, 'list', params] as const,
  detail: (uuid: string) => [...ordersKeys.all, 'detail', uuid] as const,
};
