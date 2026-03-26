'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useQuote } from '@/modules/quotes/hooks/use-quote';
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function QuoteDetailPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useQuote(params.uuid);

  useEffect(() => {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401 || status === 404) {
      router.push(
        status === 401 ? ROUTES_MAP.login : ROUTES_MAP.account.quotes,
      );
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-[#525252]">
        Chargement…
      </div>
    );
  }

  const quote = data?.data;
  if (!quote) return null;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href={ROUTES_MAP.account.quotes}
        className="inline-flex items-center gap-1 text-sm text-[#525252] hover:text-[#0a0a0a]"
      >
        ← Retour aux devis
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[Rubik] text-xl font-semibold text-[#0a0a0a]">
              Devis {quote.ref}
            </h1>
            <p className="mt-1 text-sm text-[#525252]">
              {formatDate(quote.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              QUOTE_STATUS_COLORS[quote.status],
            )}
          >
            {QUOTE_STATUS_LABELS[quote.status]}
          </span>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-3 rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <h2 className="font-[Rubik] font-semibold text-[#0a0a0a]">
          Informations de contact
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#525252]">Nom</dt>
            <dd className="mt-0.5 font-medium text-[#0a0a0a]">
              {quote.contactName}
            </dd>
          </div>
          <div>
            <dt className="text-[#525252]">Téléphone</dt>
            <dd className="mt-0.5 font-medium text-[#0a0a0a]">
              {quote.contactPhone}
            </dd>
          </div>
          {quote.contactEmail && (
            <div>
              <dt className="text-[#525252]">Email</dt>
              <dd className="mt-0.5 font-medium text-[#0a0a0a]">
                {quote.contactEmail}
              </dd>
            </div>
          )}
          {quote.companyName && (
            <div>
              <dt className="text-[#525252]">Entreprise</dt>
              <dd className="mt-0.5 font-medium text-[#0a0a0a]">
                {quote.companyName}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Message */}
      <div className="space-y-2 rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <h2 className="font-[Rubik] font-semibold text-[#0a0a0a]">Message</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[#525252]">
          {quote.message}
        </p>
      </div>
    </div>
  );
}
