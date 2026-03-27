'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useOrder } from '@/modules/orders/hooks/use-order';
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function OrderDetailPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useOrder(params.uuid);

  useEffect(() => {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401 || status === 404) {
      router.replace(
        status === 401 ? ROUTES_MAP.login : ROUTES_MAP.account.orders,
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

  const order = data?.data;
  if (!order) return null;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href={ROUTES_MAP.account.orders}
        className="inline-flex items-center gap-1 text-sm text-[#525252] hover:text-[#0a0a0a]"
      >
        ← Retour aux commandes
      </Link>

      {/* Header */}
      <div className="space-y-3 rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[Rubik] text-xl font-semibold text-[#0a0a0a]">
              Commande {order.ref}
            </h1>
            <p className="mt-1 text-sm text-[#525252]">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium',
              ORDER_STATUS_COLORS[order.status],
            )}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="border-t border-[#e4e4e7] pt-2">
            <p className="text-sm text-[#525252]">
              Numéro de suivi :{' '}
              <span className="font-medium text-[#0a0a0a]">
                {order.trackingNumber}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
        <h2 className="border-b border-[#e4e4e7] px-5 py-4 font-[Rubik] font-semibold text-[#0a0a0a]">
          Articles commandés
        </h2>
        <ul className="divide-y divide-[#e4e4e7]">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#0a0a0a]">
                  {item.product?.name ?? item.productName}
                </p>
                <p className="mt-0.5 text-xs text-[#525252]">
                  Qté : {item.qty} × {item.unitPrice.toFixed(2)} TND
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-[#0a0a0a]">
                {item.totalPrice.toFixed(2)} TND
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end border-t border-[#e4e4e7] px-5 py-4">
          <p className="font-[Rubik] text-base font-bold text-[#0a0a0a]">
            Total :{' '}
            <span className="text-[#ec4130]">
              {order.totalAmount.toFixed(2)} TND
            </span>
          </p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="rounded-xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-[Rubik] font-semibold text-[#0a0a0a]">
          Adresse de livraison
        </h2>
        <p className="text-sm text-[#0a0a0a]">
          {order.addressSnapshot.address}
        </p>
        <p className="text-sm text-[#525252]">{order.addressSnapshot.city}</p>
        {order.addressSnapshot.label && (
          <p className="mt-1 text-xs text-[#525252]">
            {order.addressSnapshot.label}
          </p>
        )}
        <p className="mt-1 text-sm text-[#525252]">{order.phone}</p>
      </div>
    </div>
  );
}
