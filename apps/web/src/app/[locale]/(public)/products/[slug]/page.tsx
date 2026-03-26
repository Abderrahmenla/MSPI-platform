import { Link } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { ProductDetail } from '@/modules/products/components';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  const backLabel =
    locale === 'ar'
      ? '→ العودة إلى المنتجات'
      : locale === 'fr'
        ? '← Retour aux produits'
        : '← Back to Products';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Link
        href={ROUTES_MAP.products}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        {backLabel}
      </Link>
      <ProductDetail slug={slug} locale={locale} />
    </div>
  );
}
