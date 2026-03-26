'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuotes } from '@/modules/quotes/hooks/use-quotes';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';
import type { QuoteStatus } from '@/modules/quotes/types/quote.types';

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  OFFER_SENT: 'Offre envoyée',
  WON: 'Accepté',
  LOST: 'Perdu',
  EXPIRED: 'Expiré',
};

const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  OFFER_SENT: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

const PAGE_LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function QuotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuotes({ page, limit: PAGE_LIMIT });

  useEffect(() => {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      router.push(ROUTES_MAP.login);
    }
  }, [error, router]);

  const quotes = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-4">
      <h1 className="font-[Rubik] text-2xl font-semibold text-[#0a0a0a]">
        Mes devis
      </h1>

      <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-[#525252]">
            Chargement…
          </div>
        ) : quotes.length === 0 ? (
          <div className="space-y-2 py-16 text-center">
            <p className="text-sm text-[#525252]">
              Vous n&apos;avez pas encore de devis.
            </p>
            <Link
              href={ROUTES_MAP.devis}
              className="inline-block text-sm text-[#ec4130] hover:underline"
            >
              Demander un devis
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-[#e4e4e7] bg-[#f4f4f5]">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-[#525252]">
                      Référence
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-[#525252]">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left font-medium text-[#525252]">
                      Statut
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e7]">
                  {quotes.map((quote) => (
                    <tr key={quote.uuid} className="hover:bg-[#f4f4f5]">
                      <td className="px-5 py-4 font-medium text-[#0a0a0a]">
                        {quote.ref}
                      </td>
                      <td className="px-5 py-4 text-[#525252]">
                        {formatDate(quote.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium',
                            QUOTE_STATUS_COLORS[quote.status],
                          )}
                        >
                          {QUOTE_STATUS_LABELS[quote.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={ROUTES_MAP.account.quote(quote.uuid)}
                          className="text-sm font-medium text-[#ec4130] hover:underline"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-[#e4e4e7] md:hidden">
              {quotes.map((quote) => (
                <li key={quote.uuid}>
                  <Link
                    href={ROUTES_MAP.account.quote(quote.uuid)}
                    className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-[#f4f4f5]"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#0a0a0a]">
                        {quote.ref}
                      </p>
                      <p className="text-xs text-[#525252]">
                        {formatDate(quote.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        QUOTE_STATUS_COLORS[quote.status],
                      )}
                    >
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e4e4e7] px-5 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm text-[#525252] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Précédent
                </button>
                <span className="text-sm text-[#525252]">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-sm text-[#525252] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
