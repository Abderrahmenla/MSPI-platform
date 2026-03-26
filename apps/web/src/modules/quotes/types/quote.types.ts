export type QuoteStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'OFFER_SENT'
  | 'WON'
  | 'LOST'
  | 'EXPIRED';

export interface Quote {
  id: number;
  uuid: string;
  ref: string;
  status: QuoteStatus;
  message: string;
  companyName: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  createdAt: string;
}

export interface CreateQuoteDto {
  message: string;
  companyName?: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export interface QuoteListResponse {
  data: Quote[];
  meta: { total: number; page: number; limit: number };
}

export interface QuoteResponse {
  data: Quote;
}
