'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCustomers } from '@/modules/customers/hooks/use-customers';
import { ADMIN_ROUTES } from '@/modules/core/constants';

const PAGE_LIMIT = 20;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useCustomers({
    page,
    limit: PAGE_LIMIT,
    search: debouncedSearch || undefined,
  });

  const customers = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_LIMIT);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clients</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-transparent focus:ring-2 sm:max-w-xs"
          style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
        />
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <p className="px-6 py-8 text-center text-sm text-red-600">
            Erreur lors du chargement des clients.
          </p>
        ) : customers.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            Aucun client trouvé.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Devis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 tabular-nums">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 tabular-nums">
                      {customer._count.quotes}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={ADMIN_ROUTES.customer(customer.uuid)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#ec4130' }}
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {total} client{total > 1 ? 's' : ''} au total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
