'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/modules/core/lib/cn';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';

const NAV_ITEMS = [
  { label: 'Mon compte', href: ROUTES_MAP.account.root },
  { label: 'Mes commandes', href: ROUTES_MAP.account.orders },
  { label: 'Mes devis', href: ROUTES_MAP.account.quotes },
  { label: 'Mon profil', href: ROUTES_MAP.account.profile },
];

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Strip locale prefix for comparison
    const withoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    if (href === ROUTES_MAP.account.root) {
      return withoutLocale === ROUTES_MAP.account.root;
    }
    return withoutLocale.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {/* Mobile tab bar */}
      <nav className="sticky top-0 z-10 border-b border-[#e4e4e7] bg-white md:hidden">
        <div className="scrollbar-hide flex overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                isActive(item.href)
                  ? 'border-[#ec4130] text-[#ec4130]'
                  : 'border-transparent text-[#525252] hover:text-[#0a0a0a]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:flex md:gap-8">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block border-l-4 px-5 py-3 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'border-[#ec4130] bg-[#fff5f5] text-[#ec4130]'
                    : 'border-transparent text-[#525252] hover:bg-[#f4f4f5] hover:text-[#0a0a0a]',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
