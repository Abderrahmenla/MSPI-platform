'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCustomer } from '@/modules/customers/hooks/use-customer';
import { ADMIN_ROUTES } from '@/modules/core/constants';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function CustomerDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const { data: customer, isLoading, isError } = useCustomer(uuid);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4">
        <Link
          href={ADMIN_ROUTES.customers}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Retour aux clients
        </Link>
        <p className="text-sm text-red-600">Client introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={ADMIN_ROUTES.customers}
        className="text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← Retour aux clients
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        {customer.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customer.avatar}
            alt={customer.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-600">
            {customer.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-xl bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Informations</h2>
          </div>
          <dl className="divide-y divide-gray-100 px-6">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-gray-500">Nom</dt>
              <dd className="text-sm font-medium text-gray-900">
                {customer.name}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{customer.email}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-gray-500">Inscrit le</dt>
              <dd className="text-sm text-gray-900">
                {formatDate(customer.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Commandes</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {customer._count.orders}
            </p>
            <Link
              href={ADMIN_ROUTES.orders}
              className="mt-2 block text-xs font-medium hover:underline"
              style={{ color: '#ec4130' }}
            >
              Voir les commandes →
            </Link>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Devis</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {customer._count.quotes}
            </p>
            <Link
              href={ADMIN_ROUTES.quotes}
              className="mt-2 block text-xs font-medium hover:underline"
              style={{ color: '#ec4130' }}
            >
              Voir les devis →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
