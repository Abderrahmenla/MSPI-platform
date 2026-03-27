'use client';

import Link from 'next/link';
import { useDashboardStats } from '@/modules/dashboard/hooks/use-dashboard-stats';
import { ADMIN_ROUTES } from '@/modules/core/constants';
import { cn } from '@/modules/core/lib/cn';
import {
  ORDER_STATUS_CLASSES,
  ORDER_STATUS_LABELS,
} from '@/modules/orders/constants/order-status.constants';
import type { OrderStatus } from '@/modules/orders/types/order.types';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p
        className={cn('mt-2 text-3xl font-bold', accent ? '' : 'text-gray-900')}
        style={accent ? { color: '#ec4130' } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

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
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-red-600">
          Erreur lors du chargement des statistiques.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total commandes" value={data.totalOrders} />
        <StatCard label="En attente" value={data.pendingOrders} accent />
        <StatCard
          label="Chiffre d'affaires"
          value={formatCurrency(data.totalRevenue)}
        />
        <StatCard label="Total clients" value={data.totalCustomers} />
        <StatCard label="Nouveaux devis" value={data.newQuotes} />
      </div>

      {/* Recent orders */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
          <Link
            href={ADMIN_ROUTES.orders}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#ec4130' }}
          >
            Voir tout
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            Aucune commande récente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Réf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders.map((order) => (
                  <tr key={order.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                      {order.ref}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.customer.name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 tabular-nums">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
