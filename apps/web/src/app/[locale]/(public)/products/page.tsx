import type { Metadata } from 'next';
import { ProductsGrid } from '@/modules/products/components';

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'منتجاتنا | MSPI Fire Safety',
};

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;

  const heading =
    locale === 'ar'
      ? 'منتجاتنا'
      : locale === 'fr'
        ? 'Nos Produits'
        : 'Our Products';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        {heading}
      </h1>
      <ProductsGrid locale={locale} />
    </div>
  );
}
