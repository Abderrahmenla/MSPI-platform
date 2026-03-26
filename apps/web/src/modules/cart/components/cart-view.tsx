'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { Link } from '@/i18n/navigation';
import { useCart } from '../hooks/use-cart';
import { CartItemRow } from './cart-item-row';
import { CartSummary } from './cart-summary';

interface CartViewProps {
  locale: string;
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-xl border border-gray-100 p-3"
          aria-hidden="true"
        >
          <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
            <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartView({ locale }: CartViewProps) {
  const { data, isLoading, isError, error } = useCart();
  const router = useRouter();

  const is401 =
    (error as { response?: { status?: number } })?.response?.status === 401;

  useEffect(() => {
    if (is401) {
      router.replace(ROUTES_MAP.login);
    }
  }, [is401, router]);

  if (isLoading || is401) {
    return <CartSkeleton />;
  }

  if (isError) {
    const msg =
      locale === 'ar'
        ? 'حدث خطأ أثناء تحميل السلة'
        : locale === 'fr'
          ? 'Erreur lors du chargement du panier'
          : 'Failed to load cart';
    return <p className="py-16 text-center text-sm text-gray-500">{msg}</p>;
  }

  const items = data?.data?.items ?? [];

  const heading =
    locale === 'ar'
      ? `سلة التسوق — ${items.length} ${items.length === 1 ? 'منتج' : 'منتجات'}`
      : locale === 'fr'
        ? `Panier — ${items.length} article${items.length !== 1 ? 's' : ''}`
        : `Your Cart — ${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    const emptyMsg =
      locale === 'ar'
        ? 'سلتك فارغة'
        : locale === 'fr'
          ? 'Votre panier est vide'
          : 'Your cart is empty';
    const subMsg =
      locale === 'ar'
        ? 'تصفح منتجاتنا واختر ما يناسبك'
        : locale === 'fr'
          ? "Parcourez nos produits et trouvez ce qu'il vous faut"
          : 'Browse our products and find what you need';
    const browseLabel =
      locale === 'ar'
        ? 'تصفح المنتجات'
        : locale === 'fr'
          ? 'Voir les produits'
          : 'Browse Products';

    return (
      <div className="flex flex-col items-center gap-4 py-24">
        {/* Line-art empty cart */}
        <svg
          viewBox="0 0 80 80"
          fill="none"
          className="h-24 w-24 text-gray-200"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M24 30h4l6 20h12l6-16H30"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="54" r="2" fill="currentColor" />
          <circle cx="46" cy="54" r="2" fill="currentColor" />
        </svg>
        <p className="text-lg font-semibold text-gray-700">{emptyMsg}</p>
        <p className="text-sm text-gray-400">{subMsg}</p>
        <Link
          href={ROUTES_MAP.products}
          className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {browseLabel}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{heading}</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px] md:items-start">
        {/* Items list */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} locale={locale} />
          ))}
        </div>

        {/* Summary */}
        <CartSummary items={items} locale={locale} />
      </div>
    </div>
  );
}
