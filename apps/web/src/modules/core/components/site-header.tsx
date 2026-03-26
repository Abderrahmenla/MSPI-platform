'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { CartIcon } from './cart-icon';
import { MobileDrawer } from './mobile-drawer';

const NAV_LINKS = [
  {
    href: ROUTES_MAP.products,
    labelAr: 'المنتجات',
    labelFr: 'Produits',
    labelEn: 'Products',
  },
  {
    href: ROUTES_MAP.devis,
    labelAr: 'طلب عرض سعر',
    labelFr: 'Demande de devis',
    labelEn: 'Devis',
  },
  {
    href: ROUTES_MAP.account.root,
    labelAr: 'حسابي',
    labelFr: 'Mon compte',
    labelEn: 'Account',
  },
] as const;

function getLabel(link: (typeof NAV_LINKS)[number], locale: string): string {
  if (locale === 'ar') return link.labelAr;
  if (locale === 'fr') return link.labelFr;
  return link.labelEn;
}

interface SiteHeaderProps {
  locale: string;
  cartCount?: number;
}

export function SiteHeader({ locale, cartCount = 0 }: SiteHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[100] w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
          {/* Mobile: Hamburger */}
          <button
            className="flex items-center justify-center p-2 text-gray-700 md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link
            href={ROUTES_MAP.home}
            className="font-rubik flex items-center gap-2 font-bold text-gray-900"
            aria-label="MSPI Fire Safety — Home"
          >
            <span className="text-brand-500 text-xl leading-none">🔥</span>
            <span className="text-base md:text-lg">MSPI</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-brand-500 text-sm font-medium text-gray-700 transition-colors"
              >
                {getLabel(link, locale)}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher currentLocale={locale} />
            </div>
            <CartIcon count={cartCount} />
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        locale={locale}
      />
    </>
  );
}
