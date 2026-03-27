import type { QuoteStatus } from '../types/quote.types';

export const QUOTE_STATUS_CLASSES: Record<QuoteStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  OFFER_SENT: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  OFFER_SENT: 'Offre envoyée',
  WON: 'Gagné',
  LOST: 'Perdu',
  EXPIRED: 'Expiré',
};
