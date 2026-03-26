'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuote } from '../api';
import { quotesKeys } from '../constants';

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
}
