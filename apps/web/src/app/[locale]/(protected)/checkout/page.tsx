'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { ROUTES_MAP } from '@/modules/core/constants';
import { useCart } from '@/modules/cart/hooks/use-cart';
import { CheckoutForm } from '@/modules/orders/components/checkout-form';
import { OrderSummary } from '@/modules/orders/components/order-summary';

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_360px] md:items-start">
      <div className="flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        ))}
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default function CheckoutPage({ params: _params }: Props) {
  const idempotencyKey = useRef(crypto.randomUUID());
  const router = useRouter();
  const { data, isLoading, isError, error } = useCart();

  const is401 =
    (error as { response?: { status?: number } })?.response?.status === 401;

  useEffect(() => {
    if (is401) {
      router.replace(ROUTES_MAP.login);
    }
  }, [is401, router]);

  const items = data?.data?.items ?? [];

  useEffect(() => {
    if (!isLoading && !is401 && items.length === 0) {
      router.replace(ROUTES_MAP.cart);
    }
  }, [isLoading, is401, items.length, router]);

  if (isLoading || is401 || (!isLoading && items.length === 0)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="mb-6 h-8 w-56 animate-pulse rounded bg-gray-100" />
        <CheckoutSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center md:px-6">
        <p className="text-sm text-gray-500">
          Erreur lors du chargement du panier.
        </p>
      </div>
    );
  }

  const locale = useLocale();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Finaliser la commande
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_360px] md:items-start">
        {/* Checkout form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-gray-900">
            Informations de livraison
          </h2>
          <CheckoutForm
            idempotencyKey={idempotencyKey.current}
            locale={locale}
          />
        </div>

        {/* Order summary */}
        <OrderSummary items={items} locale={locale} />
      </div>
    </div>
  );
}
