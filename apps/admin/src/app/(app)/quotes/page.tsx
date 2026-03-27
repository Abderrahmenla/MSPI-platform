'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuotes } from '@/modules/quotes/hooks/use-quotes';
import type { QuoteStatus } from '@/modules/quotes/types/quote.types';
import {
  QUOTE_STATUS_CLASSES,
  QUOTE_STATUS_LABELS,
} from '@/modules/quotes/constants/quote-status.constants';
import { ADMIN_ROUTES } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';

const PAGE_LIMIT = 20;

const STATUS_OPTIONS: { label: string; value: QuoteStatus | '' }[] = [
  { label: 'Tous', value: '' },
  { label: 'Nouveau', value: 'NEW' },
  { label: 'Contacté', value: 'CONTACTED' },
  { label: 'Offre envoyée', value: 'OFFER_SENT' },
  { label: 'Gagné', value: 'WON' },
  { label: 'Perdu', value: 'LOST' },
  { label: 'Expiré', value: 'EXPIRED' },
];

export default function QuotesPage() {
  const [status, setStatus] = useState<QuoteStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuotes({
    status,
    page,
    limit: PAGE_LIMIT,
  });

  const quotes = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
        <span className="text-sm text-gray-500">{total} devis au total</span>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatus(opt.value);
              setPage(1);
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              status === opt.value
                ? 'bg-[#ec4130] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            Erreur lors du chargement des devis.
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun devis trouvé.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Réf</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((quote) => (
                <tr key={quote.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">
                    {quote.ref}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {quote.contactName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quote.contactEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {quote.companyName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        QUOTE_STATUS_CLASSES[quote.status],
                      )}
                    >
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={ADMIN_ROUTES.quote(quote.uuid)}
                      className="font-medium text-[#ec4130] hover:underline"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
