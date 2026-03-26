'use client';

import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import type { CartItem } from '../types/cart.types';

interface CartSummaryProps {
  items: CartItem[];
  locale: string;
}

export function CartSummary({ items, locale }: CartSummaryProps) {
  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.qty,
    0,
  );

  const currencyLabel = locale === 'ar' ? 'د.ت' : 'DT';

  const formattedTotal = total.toLocaleString(
    locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-TN' : 'en-TN',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );

  const totalLabel =
    locale === 'ar' ? 'المجموع الكلي:' : locale === 'fr' ? 'Total :' : 'Total:';

  const codLabel =
    locale === 'ar'
      ? 'الدفع عند الاستلام'
      : locale === 'fr'
        ? 'Paiement à la livraison'
        : 'Cash on Delivery';

  const checkoutLabel =
    locale === 'ar'
      ? 'إتمام الطلب'
      : locale === 'fr'
        ? 'Passer la commande'
        : 'Proceed to Checkout';

  const continueLabel =
    locale === 'ar'
      ? '← متابعة التسوق'
      : locale === 'fr'
        ? '← Continuer les achats'
        : '← Continue Shopping';

  const hasOos = items.some((item) => item.product.stock === 0);

  return (
    <div className="sticky bottom-0 z-[60] rounded-2xl border border-gray-100 bg-white p-4 shadow-lg md:static md:shadow-md">
      {/* Total */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{totalLabel}</span>
        <span className="font-rubik text-xl font-bold text-gray-900">
          {formattedTotal}{' '}
          <span className="text-sm font-normal text-gray-500">
            {currencyLabel}
          </span>
        </span>
      </div>

      {/* COD trust line */}
      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-500 h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        >
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
        <span>{codLabel}</span>
      </div>

      {/* Checkout CTA */}
      <Link
        href={ROUTES_MAP.checkout}
        className={[
          'mb-3 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition-colors',
          hasOos
            ? 'pointer-events-none cursor-not-allowed bg-gray-300'
            : 'bg-brand-500 hover:bg-brand-600',
        ].join(' ')}
        aria-disabled={hasOos}
      >
        {checkoutLabel}
      </Link>

      {/* Continue shopping */}
      <Link
        href={ROUTES_MAP.products}
        className="block text-center text-sm text-gray-500 hover:text-gray-700"
      >
        {continueLabel}
      </Link>
    </div>
  );
}
