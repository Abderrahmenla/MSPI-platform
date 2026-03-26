export const quotesKeys = {
  all: ['quotes'] as const,
  list: (params?: object) => [...quotesKeys.all, 'list', params] as const,
  detail: (uuid: string) => [...quotesKeys.all, 'detail', uuid] as const,
};
