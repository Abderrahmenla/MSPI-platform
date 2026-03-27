import type { FetchQuotesParams } from '../api/quotes.api';

export const quotesQueryKeys = {
  all: ['quotes'] as const,
  lists: () => [...quotesQueryKeys.all, 'list'] as const,
  list: (params?: FetchQuotesParams) =>
    [...quotesQueryKeys.lists(), params] as const,
  details: () => [...quotesQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...quotesQueryKeys.details(), uuid] as const,
};
