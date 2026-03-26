import { http } from '@/modules/core/services/http.service';
import type {
  CreateQuoteDto,
  QuoteListResponse,
  QuoteResponse,
} from '../types';

export async function createQuote(dto: CreateQuoteDto): Promise<QuoteResponse> {
  const { data } = await http.post<QuoteResponse>('/customer/quotes', dto);
  return data;
}

export async function fetchQuotes(params?: {
  page?: number;
  limit?: number;
}): Promise<QuoteListResponse> {
  const { data } = await http.get<QuoteListResponse>('/customer/quotes', {
    params,
  });
  return data;
}

export async function fetchQuote(uuid: string): Promise<QuoteResponse> {
  const { data } = await http.get<QuoteResponse>(`/customer/quotes/${uuid}`);
  return data;
}
