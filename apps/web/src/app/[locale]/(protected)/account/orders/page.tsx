'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useOrders } from '@/modules/orders/hooks/use-orders';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';
import type { OrderStatus } from '@/modules/orders/types/order.types';

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

const PAGE_LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOrders({ page, limit: PAGE_LIMIT });

  useEffect(() => {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      router.push(ROUTES_MAP.login);
    }
  }, [error, router]);

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-4">
      <h1 className="font-[Rubik] text-2xl font-semibold text-[#0a0a0a]">
        Mes commandes
      </h1>

      <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-[#525252]">
            Chargement…
          </div>
        ) : orders.length === 0 ? (
          <div className="space-y-2 py-16 text-center">
            <p className="text-sm text-[#525252]">
              Vous n&apos;avez pas encore de commande.
            </p>
            <Link
              href={ROUTES_MAP.products}
              className="inline-block text-sm text-[#ec4130] hover:underline"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-[#e4e4e7] bg-[#f4f4f5]">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3 text-left font-medium text-[#525252]"
                    >
                      Référence
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 text-left font-medium text-[#525252]"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 text-left font-medium text-[#525252]"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3 text-right font-medium text-[#525252]"
                    >
                      Total
                    </th>
                    <th scope="col" className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e7]">
                  {orders.map((order) => (
                    <tr key={order.uuid} className="hover:bg-[#f4f4f5]">
                      <td className="px-5 py-4 font-medium text-[#0a0a0a]">
                        {order.ref}
                      </td>
                      <td className="px-5 py-4 text-[#525252]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium',
                            ORDER_STATUS_COLORS[order.status],
                          )}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-[#0a0a0a]">
                        {order.totalAmount.toFixed(2)} TND
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={ROUTES_MAP.account.order(order.uuid)}
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
              {orders.map((order) => (
                <li key={order.uuid}>
                  <Link
                    href={ROUTES_MAP.account.order(order.uuid)}
                    className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-[#f4f4f5]"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[#0a0a0a]">
                        {order.ref}
                      </p>
                      <p className="text-xs text-[#525252]">
                        {formatDate(order.createdAt)}
                      </p>
                      <span
                        className={cn(
                          'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                          ORDER_STATUS_COLORS[order.status],
                        )}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#0a0a0a]">
                      {order.totalAmount.toFixed(2)} TND
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
