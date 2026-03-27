'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuote } from '@/modules/quotes/hooks/use-quote';
import { useUpdateQuoteStatus } from '@/modules/quotes/hooks/use-update-quote-status';
import {
  VALID_TRANSITIONS,
  type QuoteStatus,
} from '@/modules/quotes/types/quote.types';
import { ADMIN_ROUTES } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';

const STATUS_BADGE: Record<QuoteStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  OFFER_SENT: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-gray-100 text-gray-600',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  OFFER_SENT: 'Offre envoyée',
  WON: 'Gagné',
  LOST: 'Perdu',
  EXPIRED: 'Expiré',
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const { data: quote, isLoading, isError } = useQuote(uuid);
  const { mutate: updateStatus, isPending } = useUpdateQuoteStatus();

  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | ''>('');
  const [note, setNote] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  }

  if (isError || !quote) {
    return (
      <div className="p-8 text-center text-red-600">
        Erreur lors du chargement du devis.
      </div>
    );
  }

  const transitions = VALID_TRANSITIONS[quote.status];
  const isTerminal = transitions.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    updateStatus(
      { uuid, status: selectedStatus as QuoteStatus, note: note || undefined },
      {
        onSuccess: () => {
          setSelectedStatus('');
          setNote('');
          setSuccessMsg('Statut mis à jour avec succès.');
          setTimeout(() => setSuccessMsg(''), 3000);
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href={ADMIN_ROUTES.quotes}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour aux devis
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{quote.ref}</h1>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
            STATUS_BADGE[quote.status],
          )}
        >
          {STATUS_LABEL[quote.status]}
        </span>
      </div>

      {/* Info card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Informations du devis
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Contact
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{quote.contactName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Entreprise
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{quote.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Téléphone
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{quote.contactPhone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Email
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{quote.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Date de création
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(quote.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          {quote.customer && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Client associé
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {quote.customer.name}
              </dd>
            </div>
          )}
        </dl>

        {/* Message */}
        <div className="mt-4">
          <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Message
          </dt>
          <dd className="mt-1 rounded-md bg-gray-50 p-3 text-sm text-gray-800">
            {quote.message}
          </dd>
        </div>

        {/* Existing note */}
        {quote.note && (
          <div className="mt-4">
            <dt className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              Note interne
            </dt>
            <dd className="mt-1 rounded-md bg-yellow-50 p-3 text-sm text-gray-800">
              {quote.note}
            </dd>
          </div>
        )}
      </div>

      {/* Status update form */}
      {!isTerminal && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Mettre à jour le statut
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nouveau statut
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as QuoteStatus)
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#ec4130] focus:ring-1 focus:ring-[#ec4130] focus:outline-none"
                required
              >
                <option value="">Sélectionner un statut</option>
                {transitions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="note"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Note interne (optionnel)
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Ajouter une note de suivi..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#ec4130] focus:ring-1 focus:ring-[#ec4130] focus:outline-none"
              />
            </div>

            {successMsg && (
              <p className="text-sm font-medium text-green-600">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !selectedStatus}
              className="rounded-md bg-[#ec4130] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d63828] disabled:opacity-50"
            >
              {isPending ? 'Enregistrement...' : 'Valider'}
            </button>
          </form>
        </div>
      )}

      {isTerminal && (
        <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Ce devis est dans un état final et ne peut plus être modifié.
        </div>
      )}
    </div>
  );
}
