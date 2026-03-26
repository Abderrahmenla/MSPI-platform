'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchQuote } from '../api';
import { quotesKeys } from '../constants';

export function useQuote(uuid: string) {
  return useQuery({
    queryKey: quotesKeys.detail(uuid),
    queryFn: () => fetchQuote(uuid),
    enabled: Boolean(uuid),
  });
}
