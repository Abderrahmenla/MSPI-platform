'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/use-products';
import { ProductCard } from './product-card';
import { SortBar } from './sort-bar';
import { ProductsSkeleton } from './products-skeleton';
import type { SortOption } from '../types/product.types';

const WHATSAPP_NUMBER = '21600000000';

interface ProductsGridProps {
  locale: string;
}

export function ProductsGrid({ locale }: ProductsGridProps) {
  const [sort, setSort] = useState<SortOption>('default');
  const { data, isLoading, isError } = useProducts({ limit: 100 });

  const sorted = useMemo(() => {
    if (!data?.data) return [];
    const items = [...data.data];
    if (sort === 'price_asc') {
      items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === 'price_desc') {
      items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return items;
  }, [data, sort]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-100" />
        <ProductsSkeleton />
      </div>
    );
  }

  if (isError) {
    const msg =
      locale === 'ar'
        ? 'حدث خطأ أثناء تحميل المنتجات'
        : locale === 'fr'
          ? 'Erreur lors du chargement des produits'
          : 'Failed to load products';
    return <p className="py-16 text-center text-sm text-gray-500">{msg}</p>;
  }

  if (sorted.length === 0) {
    const waHref = `https://wa.me/${WHATSAPP_NUMBER}`;
    const emptyMsg =
      locale === 'ar'
        ? 'لا توجد منتجات حالياً'
        : locale === 'fr'
          ? 'Aucun produit disponible'
          : 'No products available right now';
    const ctaLabel =
      locale === 'ar'
        ? 'تواصل معنا'
        : locale === 'fr'
          ? 'Contactez-nous'
          : 'Contact us';

    return (
      <div className="flex flex-col items-center gap-4 py-24">
        {/* Line-art empty shelf */}
        <svg
          viewBox="0 0 120 80"
          fill="none"
          className="h-24 w-24 text-gray-200"
          aria-hidden="true"
        >
          <rect
            x="10"
            y="60"
            width="100"
            height="4"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="10"
            y="30"
            width="100"
            height="4"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="20"
            y1="34"
            x2="20"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="100"
            y1="34"
            x2="100"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="35"
            y="36"
            width="20"
            height="22"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="65"
            y="40"
            width="14"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <p className="text-base font-medium text-gray-500">{emptyMsg}</p>
        <a
          href={`${waHref}?text=${encodeURIComponent(locale === 'ar' ? 'مرحبا، أريد الاستفسار عن المنتجات' : 'Bonjour, je voudrais des informations sur vos produits')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20ba5a]"
        >
          {ctaLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SortBar value={sort} onChange={setSort} locale={locale} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {sorted.map((product) => (
          <ProductCard key={product.uuid} product={product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
