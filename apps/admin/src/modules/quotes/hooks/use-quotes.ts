import { useQuery } from '@tanstack/react-query';
import { fetchQuotes, type FetchQuotesParams } from '../api/quotes.api';
import { quotesQueryKeys } from '../constants/quotes-query-keys.constants';

export function useQuotes(params?: FetchQuotesParams) {
  return useQuery({
    queryKey: quotesQueryKeys.list(params),
    queryFn: () => fetchQuotes(params),
  });
}
