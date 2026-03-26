'use client';

import { useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { LanguageSwitcher } from './language-switcher';

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
    labelEn: 'Get a Quote',
  },
  {
    href: ROUTES_MAP.account.root,
    labelAr: 'حسابي',
    labelFr: 'Mon compte',
    labelEn: 'My Account',
  },
] as const;

function getLabel(link: (typeof NAV_LINKS)[number], locale: string): string {
  if (locale === 'ar') return link.labelAr;
  if (locale === 'fr') return link.labelFr;
  return link.labelEn;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

export function MobileDrawer({ open, onClose, locale }: MobileDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[110] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 start-0 z-[120] flex w-72 flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <div className="flex items-center justify-end border-b border-gray-100 p-4">
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 transition-colors hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="hover:bg-brand-500/5 hover:text-brand-500 rounded-lg px-4 py-3 text-base font-medium text-gray-800 transition-colors"
            >
              {getLabel(link, locale)}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-gray-100 p-4">
          <a
            href="https://wa.me/21600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-[#25D366]"
          >
            <Phone className="h-4 w-4" />
            WhatsApp Support
          </a>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </>
  );
}
