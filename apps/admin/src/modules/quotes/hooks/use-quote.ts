import { useQuery } from '@tanstack/react-query';
import { fetchQuote } from '../api/quotes.api';
import { quotesQueryKeys } from '../constants/quotes-query-keys.constants';

export function useQuote(uuid: string) {
  return useQuery({
    queryKey: quotesQueryKeys.detail(uuid),
    queryFn: () => fetchQuote(uuid),
    enabled: Boolean(uuid),
  });
}
