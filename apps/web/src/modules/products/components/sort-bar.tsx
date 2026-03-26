'use client';

import type { SortOption } from '../types/product.types';

interface SortBarProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  locale: string;
}

const SORT_OPTIONS: {
  value: SortOption;
  labelAr: string;
  labelFr: string;
  labelEn: string;
}[] = [
  {
    value: 'default',
    labelAr: 'الافتراضي',
    labelFr: 'Par défaut',
    labelEn: 'Default',
  },
  {
    value: 'price_asc',
    labelAr: 'السعر: من الأقل',
    labelFr: 'Prix croissant',
    labelEn: 'Price: Low to High',
  },
  {
    value: 'price_desc',
    labelAr: 'السعر: من الأعلى',
    labelFr: 'Prix décroissant',
    labelEn: 'Price: High to Low',
  },
];

function getOptionLabel(
  opt: (typeof SORT_OPTIONS)[number],
  locale: string,
): string {
  if (locale === 'ar') return opt.labelAr;
  if (locale === 'fr') return opt.labelFr;
  return opt.labelEn;
}

export function SortBar({ value, onChange, locale }: SortBarProps) {
  const sortLabel =
    locale === 'ar'
      ? 'ترتيب حسب:'
      : locale === 'fr'
        ? 'Trier par :'
        : 'Sort by:';

  const currentLabel = getOptionLabel(
    SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0],
    locale,
  );

  return (
    <div className="sticky top-14 z-[70] border-b border-gray-100 bg-white/95 px-4 py-2 backdrop-blur-sm md:static md:top-auto md:z-auto md:border-none md:bg-transparent md:p-0 md:backdrop-blur-none">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span>{sortLabel}</span>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as SortOption)}
            aria-label={sortLabel}
            className="focus:ring-brand-500 appearance-none rounded-lg border border-gray-200 bg-white py-1.5 ps-3 pe-7 text-sm font-medium text-gray-800 focus:ring-2 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {getOptionLabel(opt, locale)}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        </div>
        <span className="sr-only">{currentLabel}</span>
      </label>
    </div>
  );
}
