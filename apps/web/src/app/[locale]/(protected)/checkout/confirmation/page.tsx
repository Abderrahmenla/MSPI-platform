'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { useOrders } from '@/modules/orders/hooks';
import { ROUTES_MAP } from '@/modules/core/constants';
import { cn } from '@/modules/core/lib/cn';

function ConfirmationSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-xl bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="h-7 w-56 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-gray-100" />
          <div className="h-16 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="flex w-full gap-3">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default function CheckoutConfirmationPage({ params: _params }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRef = searchParams.get('ref');

  // Validate that ref matches expected order reference format (e.g., ORD-XXXXXX)
  // to prevent social-engineering via crafted query strings.
  const ORDER_REF_PATTERN = /^[A-Z]{2,5}-[A-Za-z0-9]{4,20}$/;
  const ref = rawRef && ORDER_REF_PATTERN.test(rawRef) ? rawRef : null;

  useEffect(() => {
    if (!ref) {
      router.replace(ROUTES_MAP.home);
    }
  }, [ref, router]);

  const { data, isLoading, isError } = useOrders({ limit: 50 });

  if (!ref) {
    return null;
  }

  if (isLoading) {
    return <ConfirmationSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-gray-500">
          Erreur lors du chargement de la commande. Veuillez réessayer.
        </p>
        <Link
          href={ROUTES_MAP.account.orders}
          className="mt-4 inline-block text-sm font-medium text-[#ec4130] underline"
        >
          Voir mes commandes
        </Link>
      </div>
    );
  }

  const order = data?.data?.find((o) => o.ref === ref);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-xl bg-white p-8 shadow-md">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Success icon */}
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full',
              'bg-green-50',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-bold text-gray-900">
            Commande confirmée !
          </h1>

          {/* Order reference */}
          <p className="text-sm text-gray-500">
            Référence de commande :{' '}
            <span className="font-semibold text-gray-900">{ref}</span>
          </p>

          {/* Status badge */}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 ring-inset',
            )}
          >
            {order?.status === 'PENDING' || !order
              ? 'En attente de confirmation'
              : order.status}
          </span>

          {/* Info message */}
          <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Vous serez contacté pour confirmer votre commande. Paiement à la
            livraison.
          </p>

          {/* CTA buttons */}
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES_MAP.account.orders}
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl px-4 py-2.5',
                'border border-gray-200 bg-white text-sm font-medium text-gray-700',
                'transition-colors hover:bg-gray-50',
              )}
            >
              Voir mes commandes
            </Link>
            <Link
              href={ROUTES_MAP.products}
              className={cn(
                'flex flex-1 items-center justify-center rounded-xl px-4 py-2.5',
                'bg-[#ec4130] text-sm font-medium text-white',
                'transition-colors hover:bg-[#d63828]',
              )}
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
