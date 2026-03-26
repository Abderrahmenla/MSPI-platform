'use client';

import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { QuantitySelector } from '@/modules/products/components';
import { useUpdateCartItem } from '../hooks/use-update-cart-item';
import { useRemoveCartItem } from '../hooks/use-remove-cart-item';
import type { CartItem } from '../types/cart.types';

interface CartItemRowProps {
  item: CartItem;
  locale: string;
}

export function CartItemRow({ item, locale }: CartItemRowProps) {
  const { mutate: updateQty, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

  const { product, qty } = item;

  const name =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn;

  const unitPrice = parseFloat(product.price);
  const subtotal = unitPrice * qty;
  const currencyLabel = locale === 'ar' ? 'د.ت' : 'DT';

  const formatPrice = (n: number) =>
    n.toLocaleString(
      locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-TN' : 'en-TN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );

  const thumbnail = [...(product.images ?? [])].sort(
    (a, b) => a.position - b.position,
  )[0]?.url;

  const subtotalLabel =
    locale === 'ar'
      ? 'المجموع:'
      : locale === 'fr'
        ? 'Sous-total :'
        : 'Subtotal:';

  const removeLabel =
    locale === 'ar' ? 'إزالة' : locale === 'fr' ? 'Supprimer' : 'Remove';

  const isOos = product.stock === 0;

  return (
    <div
      className={[
        'flex gap-3 rounded-xl border p-3',
        isOos ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <Link
        href={ROUTES_MAP.product(product.slug)}
        className="flex-shrink-0"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-gray-200"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="9"
                  cy="9"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 16l5-5 4 4 3-3 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Link
          href={ROUTES_MAP.product(product.slug)}
          className="hover:text-brand-600 truncate text-sm font-semibold text-gray-900"
        >
          {name}
        </Link>

        <span className="text-sm text-gray-500">
          {formatPrice(unitPrice)}{' '}
          <span className="text-xs">{currencyLabel}</span>
        </span>

        <div className="flex items-center justify-between gap-2">
          <QuantitySelector
            value={qty}
            max={product.stock || qty}
            onChange={(newQty) => updateQty({ itemId: item.id, qty: newQty })}
          />

          <button
            type="button"
            disabled={isRemoving || isUpdating}
            onClick={() => removeItem(item.id)}
            aria-label={removeLabel}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-500">
          {subtotalLabel}{' '}
          <span className="font-semibold text-gray-800">
            {formatPrice(subtotal)} {currencyLabel}
          </span>
        </p>
      </div>
    </div>
  );
}
