'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/modules/core/lib/cn';
import { ADMIN_ROUTES } from '@/modules/core/constants';
import { adminLogout } from '@/modules/auth/api';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', href: ADMIN_ROUTES.dashboard, icon: '▦' },
  { label: 'Commandes', href: ADMIN_ROUTES.orders, icon: '📦' },
  { label: 'Devis', href: ADMIN_ROUTES.quotes, icon: '📋' },
  { label: 'Clients', href: ADMIN_ROUTES.customers, icon: '👤' },
  { label: 'Produits', href: ADMIN_ROUTES.products, icon: '🔧' },
  { label: 'Paramètres', href: ADMIN_ROUTES.settings, icon: '⚙' },
];

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      router.push(ADMIN_ROUTES.login);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-gray-100 px-6">
          <span
            className="font-[family-name:var(--font-rubik)] text-2xl font-bold"
            style={{ color: '#ec4130' }}
          >
            MSPI
          </span>
          <span className="ml-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
              style={
                isActive(item.href) ? { backgroundColor: '#ec4130' } : undefined
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 px-3 py-4">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
              'text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600',
              loggingOut && 'cursor-not-allowed opacity-60',
            )}
          >
            <span className="text-base leading-none">↩</span>
            {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 right-0 left-0 z-10 flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mr-3 rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
          aria-label="Ouvrir le menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span
          className="font-[family-name:var(--font-rubik)] text-xl font-bold"
          style={{ color: '#ec4130' }}
        >
          MSPI
        </span>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6 pt-20 lg:ml-64 lg:pt-6">
        {children}
      </main>
    </div>
  );
}
