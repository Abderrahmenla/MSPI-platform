'use client';

import type { CartItem } from '@/modules/cart/types/cart.types';
import { cn } from '@/modules/core/lib/cn';

interface OrderSummaryProps {
  items: CartItem[];
  locale: string;
}

export function OrderSummary({ items, locale }: OrderSummaryProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.qty,
    0,
  );

  const getProductName = (product: CartItem['product']) => {
    if (locale === 'ar') return product.nameAr;
    if (locale === 'en') return product.nameEn;
    return product.nameFr;
  };

  const currencyLabel = locale === 'ar' ? 'د.ت' : 'DT';

  const formatPrice = (amount: number) =>
    amount.toLocaleString(
      locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-TN' : 'en-TN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );

  const summaryLabel =
    locale === 'ar'
      ? 'ملخص الطلب'
      : locale === 'fr'
        ? 'Récapitulatif'
        : 'Order Summary';

  const subtotalLabel =
    locale === 'ar'
      ? 'المجموع الفرعي'
      : locale === 'fr'
        ? 'Sous-total'
        : 'Subtotal';

  const totalLabel =
    locale === 'ar' ? 'المجموع الكلي' : locale === 'fr' ? 'Total' : 'Total';

  const codLabel =
    locale === 'ar'
      ? 'الدفع عند الاستلام'
      : locale === 'fr'
        ? 'Paiement à la livraison'
        : 'Cash on Delivery';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        {summaryLabel}
      </h2>

      {/* Items */}
      <ul className="mb-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {getProductName(item.product)}
              </p>
              <p className="text-xs text-gray-400">
                {item.qty} × {formatPrice(parseFloat(item.product.price))}{' '}
                {currencyLabel}
              </p>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap text-gray-900">
              {formatPrice(parseFloat(item.product.price) * item.qty)}{' '}
              <span className="text-xs font-normal text-gray-500">
                {currencyLabel}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-100 pt-3">
        {/* Subtotal */}
        <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
          <span>{subtotalLabel}</span>
          <span>
            {formatPrice(subtotal)}{' '}
            <span className="text-xs text-gray-400">{currencyLabel}</span>
          </span>
        </div>

        {/* COD badge */}
        <div
          className={cn(
            'my-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700',
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
          {codLabel}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">{totalLabel}</span>
          <span className="font-rubik text-xl font-bold text-gray-900">
            {formatPrice(subtotal)}{' '}
            <span className="text-sm font-normal text-gray-500">
              {currencyLabel}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
