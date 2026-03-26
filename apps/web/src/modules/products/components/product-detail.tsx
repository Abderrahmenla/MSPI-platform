'use client';

import { useState } from 'react';
import { useProduct } from '../hooks/use-product';
import { ImageGallery } from './image-gallery';
import { QuantitySelector } from './quantity-selector';
import { TrustBadges } from '@/modules/core/components';
import { useAddToCart } from '@/modules/cart/hooks/use-add-to-cart';

const WHATSAPP_NUMBER = '21600000000';

interface ProductDetailProps {
  slug: string;
  locale: string;
}

function StockBadge({ stock, locale }: { stock: number; locale: string }) {
  if (stock === 0) {
    const label =
      locale === 'ar'
        ? 'غير متوفر'
        : locale === 'fr'
          ? 'Rupture de stock'
          : 'Out of Stock';
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-500">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        {label}
      </span>
    );
  }
  if (stock <= 5) {
    const label =
      locale === 'ar'
        ? `باقي ${stock} فقط`
        : locale === 'fr'
          ? `Plus que ${stock}`
          : `Only ${stock} left`;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {label}
      </span>
    );
  }
  const label =
    locale === 'ar' ? 'متوفر' : locale === 'fr' ? 'En stock' : 'In Stock';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      {label}
    </span>
  );
}

export function ProductDetail({ slug, locale }: ProductDetailProps) {
  const { data, isLoading, isError } = useProduct(slug);
  const { mutate: addToCart, isPending } = useAddToCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    const msg =
      locale === 'ar'
        ? 'المنتج غير موجود'
        : locale === 'fr'
          ? 'Produit introuvable'
          : 'Product not found';
    return <p className="py-24 text-center text-base text-gray-500">{msg}</p>;
  }

  const product = data.data;

  const name =
    locale === 'ar'
      ? product.nameAr
      : locale === 'fr'
        ? product.nameFr
        : product.nameEn;

  const desc =
    locale === 'ar'
      ? product.descAr
      : locale === 'fr'
        ? product.descFr
        : product.descEn;

  const price = parseFloat(product.price).toLocaleString(
    locale === 'ar' ? 'ar-TN' : locale === 'fr' ? 'fr-TN' : 'en-TN',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );

  const currencyLabel = locale === 'ar' ? 'د.ت' : 'DT';
  const isOos = product.stock === 0;

  const waMessage =
    locale === 'ar'
      ? `مرحبا، أريد الاستفسار عن: ${name} (SKU: ${product.sku})`
      : locale === 'fr'
        ? `Bonjour, je voudrais des informations sur: ${name} (SKU: ${product.sku})`
        : `Hello, I'd like to inquire about: ${name} (SKU: ${product.sku})`;

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  const addLabel =
    locale === 'ar'
      ? 'أضف للسلة'
      : locale === 'fr'
        ? 'Ajouter au panier'
        : 'Add to Cart';

  const waLabel =
    locale === 'ar'
      ? 'استفسر عبر واتساب'
      : locale === 'fr'
        ? 'Demander via WhatsApp'
        : 'Inquire via WhatsApp';

  const descLabel =
    locale === 'ar' ? 'الوصف' : locale === 'fr' ? 'Description' : 'Description';

  const notifyLabel =
    locale === 'ar'
      ? 'أعلمني عند التوفر عبر واتساب'
      : locale === 'fr'
        ? 'Me notifier via WhatsApp'
        : 'Notify me via WhatsApp';

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
      {/* Gallery */}
      <ImageGallery images={product.images} alt={name} isOos={isOos} />

      {/* Info panel */}
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{name}</h1>

        {/* Price + stock */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={[
              'text-2xl font-bold',
              isOos ? 'text-gray-400' : 'text-gray-900',
            ].join(' ')}
          >
            {price}{' '}
            <span className="text-base font-normal text-gray-500">
              {currencyLabel}
            </span>
          </span>
          <StockBadge stock={product.stock} locale={locale} />
        </div>

        {/* Trust badges */}
        <TrustBadges
          locale={locale}
          className="md:grid-cols-2 lg:grid-cols-4"
        />

        {/* Description */}
        {desc && (
          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {descLabel}
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">{desc}</p>
          </div>
        )}

        {/* CTA section */}
        {isOos ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#20ba5a]"
          >
            {notifyLabel}
          </a>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Quantity */}
            <QuantitySelector
              value={qty}
              max={product.stock}
              onChange={setQty}
            />

            {/* Add to cart */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => addToCart({ productId: product.id, qty })}
              className="bg-brand-500 hover:bg-brand-600 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {isPending ? '...' : addLabel}
            </button>

            {/* WhatsApp inquiry */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl border border-[#25D366] px-4 py-3 text-center text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              {waLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
