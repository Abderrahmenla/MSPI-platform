'use client';

import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { useAddToCart } from '@/modules/cart/hooks/use-add-to-cart';
import type { Product } from '../types/product.types';

interface StockBadgeProps {
  stock: number;
  locale: string;
}

function StockBadge({ stock, locale }: StockBadgeProps) {
  if (stock === 0) {
    const label =
      locale === 'ar'
        ? 'غير متوفر'
        : locale === 'fr'
          ? 'Rupture de stock'
          : 'Out of Stock';
    return (
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
        {label}
      </span>
    );
  }
  if (stock <= 5) {
    const label =
      locale === 'ar'
        ? `باقي ${stock} فقط`
        : locale === 'fr'
          ? `Plus que ${stock}`
          : `Only ${stock} left`;
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        {label}
      </span>
    );
  }
  const label =
    locale === 'ar' ? 'متوفر' : locale === 'fr' ? 'En stock' : 'In Stock';
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {label}
    </span>
  );
}

interface ProductCardProps {
  product: Product;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart();

  const name =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn;

  const price = parseFloat(product.price).toLocaleString(
    locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-TN' : 'en-TN',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );

  const currencyLabel = locale === 'ar' ? 'د.ت' : 'DT';

  const thumbnail = product.images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;

  const isOos = product.stock === 0;

  const addLabel =
    locale === 'ar'
      ? 'أضف للسلة'
      : locale === 'fr'
        ? 'Ajouter au panier'
        : 'Add to Cart';

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link
        href={ROUTES_MAP.product(product.slug)}
        className="relative block aspect-square overflow-hidden bg-gray-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={name}
            className={[
              'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
              isOos ? 'grayscale-[50%]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-16 w-16 text-gray-200"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M4 32l10-10 8 8 6-6 16 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-1">
          <Link
            href={ROUTES_MAP.product(product.slug)}
            className="hover:text-brand-600 line-clamp-2 text-sm font-semibold text-gray-900"
          >
            {name}
          </Link>
        </div>

        <StockBadge stock={product.stock} locale={locale} />

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-base font-bold text-gray-900">
            {price}{' '}
            <span className="text-xs font-normal text-gray-500">
              {currencyLabel}
            </span>
          </span>
        </div>

        <button
          type="button"
          disabled={isOos || isPending}
          onClick={() => addToCart({ productId: product.id, qty: 1 })}
          className="bg-brand-500 hover:bg-brand-600 mt-1 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '...' : addLabel}
        </button>
      </div>
    </article>
  );
}
