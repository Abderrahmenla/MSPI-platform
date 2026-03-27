'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ADMIN_ROUTES } from '@/modules/core/constants/routes-map.constants';
import { cn } from '@/modules/core/lib/cn';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useUpdateProduct } from '@/modules/products/hooks/use-update-product';
import type { Product } from '@/modules/products/types/product.types';

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        0
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {stock}
    </span>
  );
}

function ProductRow({ product }: { product: Product }) {
  const { mutate: updateProduct, isPending, isError } = useUpdateProduct();

  const thumbnail = product.images[0]?.url ?? null;

  function handleToggleActive() {
    updateProduct({
      uuid: product.uuid,
      data: { isActive: !product.isActive },
    });
  }

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 pr-3 pl-4">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.nameFr}
            width={40}
            height={40}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
            —
          </div>
        )}
      </td>
      <td className="px-3 py-3 text-sm font-medium text-gray-900">
        {product.nameFr}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600">
        {product.price.toLocaleString('fr-TN', {
          style: 'currency',
          currency: 'TND',
        })}
      </td>
      <td className="px-3 py-3">
        <StockBadge stock={product.stock} />
      </td>
      <td className="px-3 py-3">
        <button
          onClick={handleToggleActive}
          disabled={isPending}
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
            product.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          )}
        >
          {product.isActive ? 'Actif' : 'Inactif'}
        </button>
      </td>
      <td className="py-3 pr-4 pl-3 text-right">
        {isError && <span className="mr-2 text-xs text-red-600">Erreur</span>}
        <Link
          href={ADMIN_ROUTES.product(product.uuid)}
          className="text-sm font-medium text-[#ec4130] hover:text-[#d63828]"
        >
          Modifier
        </Link>
      </td>
    </tr>
  );
}

const PAGE_LIMIT = 20;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useProducts({
    search: debouncedSearch || undefined,
    isActive: activeFilter,
    limit: PAGE_LIMIT,
  });

  const products = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <Link
          href={ADMIN_ROUTES.product('new')}
          className="rounded-md bg-[#ec4130] px-4 py-2 text-sm font-medium text-white hover:bg-[#d63828] focus:ring-2 focus:ring-[#ec4130] focus:ring-offset-2 focus:outline-none"
        >
          Ajouter un produit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#ec4130] focus:ring-1 focus:ring-[#ec4130] focus:outline-none"
        />
        <div className="flex rounded-md border border-gray-300 text-sm">
          <button
            onClick={() => setActiveFilter(undefined)}
            className={cn(
              'rounded-l-md px-3 py-2 transition-colors',
              activeFilter === undefined
                ? 'bg-[#ec4130] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveFilter(true)}
            className={cn(
              'border-x border-gray-300 px-3 py-2 transition-colors',
              activeFilter === true
                ? 'bg-[#ec4130] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            Actifs
          </button>
          <button
            onClick={() => setActiveFilter(false)}
            className={cn(
              'rounded-r-md px-3 py-2 transition-colors',
              activeFilter === false
                ? 'bg-[#ec4130] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            Inactifs
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Chargement...
          </p>
        )}
        {isError && (
          <p className="px-6 py-8 text-center text-sm text-red-600">
            Erreur lors du chargement des produits.
          </p>
        )}
        {!isLoading && !isError && products.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            Aucun produit trouvé.
          </p>
        )}
        {!isLoading && products.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pr-3 pl-4 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Nom (FR)
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Prix
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Actif
                </th>
                <th className="py-3 pr-4 pl-3 text-right text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <ProductRow key={product.uuid} product={product} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.meta && (
        <p className="text-right text-sm text-gray-500">
          {data.meta.total} produit{data.meta.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
