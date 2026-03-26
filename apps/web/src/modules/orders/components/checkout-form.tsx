'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from '@/i18n/navigation';
import { ROUTES_MAP } from '@/modules/core/constants';
import { cn } from '@/modules/core/lib/cn';
import { useCreateOrder } from '../hooks/use-create-order';
import type { CreateOrderDto } from '../types/order.types';

interface CheckoutFormValues {
  phone: string;
  address: string;
  city: string;
  label?: string;
}

interface CheckoutFormProps {
  idempotencyKey: string;
  locale: string;
}

export function CheckoutForm({ idempotencyKey, locale }: CheckoutFormProps) {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>();

  const is401 =
    (error as { response?: { status?: number } })?.response?.status === 401;

  useEffect(() => {
    if (is401) {
      router.replace(ROUTES_MAP.login);
    }
  }, [is401, router]);

  function onSubmit(values: CheckoutFormValues) {
    const dto: CreateOrderDto = {
      idempotencyKey,
      phone: values.phone,
      address: {
        address: values.address,
        city: values.city,
        ...(values.label ? { label: values.label } : {}),
      },
    };
    mutate(dto);
  }

  const fieldClass = cn(
    'border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2',
    'focus:ring-brand-500 border-gray-300 text-sm text-gray-900',
    'disabled:bg-gray-50 disabled:text-gray-400',
  );

  const errorClass = 'mt-1 text-xs text-red-600';

  const label = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      phone: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' },
      address: { ar: 'العنوان', fr: 'Adresse', en: 'Address' },
      city: { ar: 'المدينة', fr: 'Ville', en: 'City' },
      label: {
        ar: 'تسمية (اختياري)',
        fr: 'Étiquette (optionnel)',
        en: 'Label (optional)',
      },
      submit: {
        ar: 'تأكيد الطلب',
        fr: 'Confirmer la commande',
        en: 'Place Order',
      },
      required: {
        ar: 'هذا الحقل مطلوب',
        fr: 'Champ obligatoire',
        en: 'Required',
      },
      phonePlaceholder: {
        ar: 'مثال: 21612345678',
        fr: 'Ex : 21612345678',
        en: 'e.g. 21612345678',
      },
      errorGeneric: {
        ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        fr: "Une erreur s'est produite. Veuillez réessayer.",
        en: 'An error occurred. Please try again.',
      },
    };
    return map[key]?.[locale] ?? map[key]?.['fr'] ?? key;
  };

  const requiredMsg = label('required');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Phone */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label('phone')} <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder={label('phonePlaceholder')}
          disabled={isPending}
          className={fieldClass}
          {...register('phone', { required: requiredMsg })}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label('address')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          disabled={isPending}
          className={fieldClass}
          {...register('address', { required: requiredMsg })}
        />
        {errors.address && (
          <p className={errorClass}>{errors.address.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label('city')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          disabled={isPending}
          className={fieldClass}
          {...register('city', { required: requiredMsg })}
        />
        {errors.city && <p className={errorClass}>{errors.city.message}</p>}
      </div>

      {/* Label (optional) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label('label')}
        </label>
        <input
          type="text"
          disabled={isPending}
          className={fieldClass}
          {...register('label')}
        />
      </div>

      {/* Generic error */}
      {isError && !is401 && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {label('errorGeneric')}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl px-4 py-3',
          'text-sm font-semibold text-white transition-colors',
          isPending
            ? 'cursor-not-allowed bg-gray-300'
            : 'bg-[#ec4130] hover:bg-[#d63828]',
        )}
      >
        {isPending && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
        )}
        {label('submit')}
      </button>
    </form>
  );
}
