'use client';

import { ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';

interface CartIconProps {
  count?: number;
}

export function CartIcon({ count = 0 }: CartIconProps) {
  return (
    <Link
      href={ROUTES_MAP.cart}
      className="hover:text-brand-500 relative inline-flex items-center justify-center p-2 text-gray-700 transition-colors"
      aria-label={`Cart${count > 0 ? `, ${count} items` : ''}`}
    >
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="bg-brand-500 absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
