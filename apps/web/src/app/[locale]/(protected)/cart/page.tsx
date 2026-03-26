import { CartView } from '@/modules/cart/components/cart-view';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CartPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <CartView locale={locale} />
    </div>
  );
}
