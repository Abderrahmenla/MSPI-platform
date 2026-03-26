'use client';

import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useOrders } from '@/modules/orders/hooks/use-orders';
import { useQuotes } from '@/modules/quotes/hooks/use-quotes';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';
import type { OrderStatus } from '@/modules/orders/types/order.types';
import type { QuoteStatus } from '@/modules/quotes/types/quote.types';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

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
    month: 'short',
    year: 'numeric',
  });
}

export default function AccountPage() {
  const router = useRouter();
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders({ limit: 3 });
  const {
    data: quotesData,
    isLoading: quotesLoading,
    error: quotesError,
  } = useQuotes({ limit: 3 });

  useEffect(() => {
    const is401 = (err: unknown) =>
      (err as { response?: { status?: number } })?.response?.status === 401;
    if (is401(ordersError) || is401(quotesError)) {
      router.replace(ROUTES_MAP.login);
    }
  }, [ordersError, quotesError, router]);

  const orders = ordersData?.data ?? [];
  const quotes = quotesData?.data ?? [];
  const totalOrders = ordersData?.meta?.total ?? 0;
  const totalQuotes = quotesData?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-[Rubik] text-2xl font-semibold text-[#0a0a0a]">
        Mon compte
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#525252]">Commandes</p>
          <p className="mt-1 font-[Rubik] text-3xl font-bold text-[#0a0a0a]">
            {ordersLoading ? '—' : totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#525252]">Devis</p>
          <p className="mt-1 font-[Rubik] text-3xl font-bold text-[#0a0a0a]">
            {quotesLoading ? '—' : totalQuotes}
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <section className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e4e4e7] px-5 py-4">
          <h2 className="font-[Rubik] font-semibold text-[#0a0a0a]">
            Dernières commandes
          </h2>
          <Link
            href={ROUTES_MAP.account.orders}
            className="text-sm text-[#ec4130] hover:underline"
          >
            Voir tout
          </Link>
        </div>
        {ordersLoading ? (
          <div className="px-5 py-8 text-center text-sm text-[#525252]">
            Chargement…
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#525252]">
            Aucune commande pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-[#e4e4e7]">
            {orders.map((order) => (
              <li key={order.uuid}>
                <Link
                  href={ROUTES_MAP.account.order(order.uuid)}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f4f4f5]"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0a0a0a]">
                      {order.ref}
                    </p>
                    <p className="mt-0.5 text-xs text-[#525252]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        ORDER_STATUS_COLORS[order.status],
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-sm font-semibold text-[#0a0a0a]">
                      {order.totalAmount.toFixed(2)} TND
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent quotes */}
      <section className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e4e4e7] px-5 py-4">
          <h2 className="font-[Rubik] font-semibold text-[#0a0a0a]">
            Derniers devis
          </h2>
          <Link
            href={ROUTES_MAP.account.quotes}
            className="text-sm text-[#ec4130] hover:underline"
          >
            Voir tout
          </Link>
        </div>
        {quotesLoading ? (
          <div className="px-5 py-8 text-center text-sm text-[#525252]">
            Chargement…
          </div>
        ) : quotes.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#525252]">
            Aucun devis pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-[#e4e4e7]">
            {quotes.map((quote) => (
              <li key={quote.uuid}>
                <Link
                  href={ROUTES_MAP.account.quote(quote.uuid)}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#f4f4f5]"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0a0a0a]">
                      {quote.ref}
                    </p>
                    <p className="mt-0.5 text-xs text-[#525252]">
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
        )}
      </section>
    </div>
  );
}
