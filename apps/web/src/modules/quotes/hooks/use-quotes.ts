'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchQuotes } from '../api';
import { quotesKeys } from '../constants';

export function useQuotes(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: quotesKeys.list(params),
    queryFn: () => fetchQuotes(params),
  });
}
