import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuoteStatus } from '../api/quotes.api';
import { quotesQueryKeys } from '../constants/quotes-query-keys.constants';
import type { QuoteStatus } from '../types/quote.types';

interface UpdateQuoteStatusVariables {
  uuid: string;
  status: QuoteStatus;
  note?: string;
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, status, note }: UpdateQuoteStatusVariables) =>
      updateQuoteStatus(uuid, status, note),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: quotesQueryKeys.detail(uuid) });
      queryClient.invalidateQueries({ queryKey: quotesQueryKeys.lists() });
    },
  });
}
