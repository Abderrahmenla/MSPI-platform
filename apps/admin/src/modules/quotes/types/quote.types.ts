export type QuoteStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'OFFER_SENT'
  | 'WON'
  | 'LOST'
  | 'EXPIRED';

export interface Quote {
  uuid: string;
  ref: string;
  status: QuoteStatus;
  message: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  note?: string;
  customer?: { name: string; email: string };
}

export interface ListQuotesResponse {
  data: Quote[];
  meta: { total: number; page: number; limit: number };
}

export const VALID_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  NEW: ['CONTACTED', 'LOST', 'EXPIRED'],
  CONTACTED: ['OFFER_SENT', 'LOST', 'EXPIRED'],
  OFFER_SENT: ['WON', 'LOST', 'EXPIRED'],
  WON: [],
  LOST: [],
  EXPIRED: [],
};
