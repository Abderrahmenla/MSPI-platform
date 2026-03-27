import { http } from '@/modules/core/services/http.service';
import type {
  ListQuotesResponse,
  Quote,
  QuoteStatus,
} from '../types/quote.types';

export interface FetchQuotesParams {
  page?: number;
  limit?: number;
  status?: QuoteStatus | '';
}

export async function fetchQuotes(
  params?: FetchQuotesParams,
): Promise<ListQuotesResponse> {
  const { data } = await http.get<ListQuotesResponse>('/admin/quotes', {
    params,
  });
  return data;
}

export async function fetchQuote(uuid: string): Promise<Quote> {
  const { data } = await http.get<Quote>(`/admin/quotes/${uuid}`);
  return data;
}

export async function updateQuoteStatus(
  uuid: string,
  status: QuoteStatus,
  note?: string,
): Promise<Quote> {
  const { data } = await http.patch<Quote>(`/admin/quotes/${uuid}/status`, {
    status,
    ...(note ? { note } : {}),
  });
  return data;
}
