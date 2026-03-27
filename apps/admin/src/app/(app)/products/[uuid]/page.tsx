'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/modules/products/hooks/use-product';
import { useCreateProduct } from '@/modules/products/hooks/use-create-product';
import { useUpdateProduct } from '@/modules/products/hooks/use-update-product';
import { ADMIN_ROUTES } from '@/modules/core/constants';
import type { CreateProductData } from '@/modules/products/types/product.types';

const EMPTY_FORM: CreateProductData = {
  nameFr: '',
  nameAr: '',
  nameEn: '',
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  category: '',
  descriptionFr: '',
  isActive: true,
  isFeatured: false,
};

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;
  const isNew = uuid === 'new';

  const { data: product, isLoading } = useProduct(uuid);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<CreateProductData>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        nameFr: product.nameFr,
        nameAr: product.nameAr ?? '',
        nameEn: product.nameEn ?? '',
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        category: product.category ?? '',
        descriptionFr: product.descriptionFr ?? '',
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    }
  }, [product]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = e.target;
    const checked =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const payload: CreateProductData = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice
        ? Number(form.compareAtPrice)
        : undefined,
      stock: Number(form.stock),
    };

    try {
      if (isNew) {
        const created = await createProduct.mutateAsync(payload);
        router.replace(ADMIN_ROUTES.product(created.uuid));
      } else {
        await updateProduct.mutateAsync({ uuid, data: payload });
        setFeedback({ type: 'success', message: 'Produit mis à jour.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Une erreur est survenue.' });
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={ADMIN_ROUTES.products}
        className="text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← Retour aux produits
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        {isNew ? 'Nouveau produit' : 'Modifier le produit'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Names */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Nom du produit</h2>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom (Français) *
              </label>
              <input
                name="nameFr"
                value={form.nameFr}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom (Arabe)
                </label>
                <input
                  name="nameAr"
                  value={form.nameAr ?? ''}
                  onChange={handleChange}
                  dir="rtl"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom (Anglais)
                </label>
                <input
                  name="nameEn"
                  value={form.nameEn ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Prix & Stock</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prix (TND) *
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.001"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prix barré (TND)
              </label>
              <input
                name="compareAtPrice"
                type="number"
                min="0"
                step="0.001"
                value={form.compareAtPrice ?? ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Détails</h2>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <input
                name="category"
                value={form.category ?? ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 sm:max-w-xs"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description (Français)
              </label>
              <textarea
                name="descriptionFr"
                value={form.descriptionFr ?? ''}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#ec4130' } as React.CSSProperties}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive ?? true}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: '#ec4130' }}
                />
                Actif
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured ?? false}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: '#ec4130' }}
                />
                Mis en avant
              </label>
            </div>
          </div>
        </div>

        {feedback && (
          <p
            className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {feedback.message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: '#ec4130' }}
          >
            {isPending
              ? 'Enregistrement…'
              : isNew
                ? 'Créer le produit'
                : 'Enregistrer'}
          </button>
          <Link
            href={ADMIN_ROUTES.products}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
