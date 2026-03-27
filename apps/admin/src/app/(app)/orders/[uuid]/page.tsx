'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useOrder } from '@/modules/orders/hooks/use-order';
import { useUpdateOrderStatus } from '@/modules/orders/hooks/use-update-order-status';
import { ADMIN_ROUTES } from '@/modules/core/constants';
import { cn } from '@/modules/core/lib/cn';
import {
  ORDER_STATUS_CLASSES,
  ORDER_STATUS_LABELS,
} from '@/modules/orders/constants/order-status.constants';
import type { OrderStatus } from '@/modules/orders/types/order.types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        ORDER_STATUS_CLASSES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function OrderDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const { data: order, isLoading, isError } = useOrder(uuid);
  const updateStatus = useUpdateOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;

    setFeedback(null);
    try {
      await updateStatus.mutateAsync({
        uuid,
        status: selectedStatus,
        trackingNumber: trackingNumber || undefined,
      });
      setFeedback({
        type: 'success',
        message: 'Statut mis à jour avec succès.',
      });
      setSelectedStatus('');
      setTrackingNumber('');
    } catch {
      setFeedback({
        type: 'error',
        message: 'Erreur lors de la mise à jour du statut.',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <Link
          href={ADMIN_ROUTES.orders}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Retour aux commandes
        </Link>
        <p className="text-red-600">Commande introuvable ou erreur serveur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={ADMIN_ROUTES.orders}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          Commande{' '}
          <span className="font-mono text-lg text-gray-600">{order.ref}</span>
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Articles</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Qté
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-gray-900">
                        {item.product.name}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                        {item.qty}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700"
                    >
                      Total commande
                    </td>
                    <td className="px-6 py-4 text-right text-base font-bold text-gray-900 tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status update */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Mettre à jour le statut
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {feedback && (
                <div
                  className={cn(
                    'rounded-lg px-4 py-3 text-sm font-medium',
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-700',
                  )}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="status-select"
                    className="text-xs font-medium text-gray-600 uppercase"
                  >
                    Nouveau statut
                  </label>
                  <select
                    id="status-select"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as OrderStatus)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                    required
                  >
                    <option value="">Sélectionner…</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 space-y-1">
                  <label
                    htmlFor="tracking-input"
                    className="text-xs font-medium text-gray-600 uppercase"
                  >
                    Numéro de suivi (optionnel)
                  </label>
                  <input
                    id="tracking-input"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ex: TN123456789"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedStatus || updateStatus.isPending}
                  className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: '#ec4130' }}
                >
                  {updateStatus.isPending ? 'En cours…' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Client</h2>
            </div>
            <div className="space-y-2 px-6 py-4 text-sm">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.email}</p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">
                Adresse de livraison
              </h2>
            </div>
            <div className="space-y-1 px-6 py-4 text-sm text-gray-700">
              <p className="font-medium">{order.addressSnapshot.name}</p>
              <p>{order.addressSnapshot.phone}</p>
              <p>{order.addressSnapshot.address}</p>
              <p>{order.addressSnapshot.city}</p>
            </div>
          </div>

          {/* Order meta */}
          <div className="rounded-xl bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Informations</h2>
            </div>
            <dl className="space-y-3 px-6 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd className="text-gray-900">{formatDate(order.createdAt)}</dd>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Suivi</dt>
                  <dd className="font-mono text-gray-900">
                    {order.trackingNumber}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
