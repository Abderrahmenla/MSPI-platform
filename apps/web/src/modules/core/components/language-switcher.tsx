'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
] as const;

type Locale = (typeof LOCALES)[number]['code'];

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(locale: Locale) {
    router.replace(pathname, { locale });
  }

  return (
    <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
            currentLocale === code
              ? 'bg-brand-500 text-white'
              : 'text-gray-600 hover:text-gray-900',
          )}
          aria-pressed={currentLocale === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
