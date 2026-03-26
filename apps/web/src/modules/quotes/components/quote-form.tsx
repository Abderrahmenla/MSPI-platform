'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/modules/core/lib/cn';
import { useCreateQuote } from '../hooks';
import type { CreateQuoteDto } from '../types';

interface QuoteFormValues {
  contactName: string;
  contactPhone: string;
  companyName?: string;
  contactEmail?: string;
  message: string;
}

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate, isPending, isError } = useCreateQuote();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormValues>();

  function onSubmit(values: QuoteFormValues) {
    const dto: CreateQuoteDto = {
      contactName: values.contactName,
      contactPhone: values.contactPhone,
      message: values.message,
      ...(values.companyName ? { companyName: values.companyName } : {}),
      ...(values.contactEmail ? { contactEmail: values.contactEmail } : {}),
    };

    mutate(dto, {
      onSuccess: () => {
        setSubmitted(true);
        reset();
      },
    });
  }

  const fieldClass = cn(
    'border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2',
    'focus:ring-brand-500 border-gray-300 text-sm text-gray-900',
    'disabled:bg-gray-50 disabled:text-gray-400',
  );

  const errorClass = 'mt-1 text-xs text-red-600';

  if (submitted) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-green-200 bg-green-50 px-6 py-5 text-center"
      >
        <svg
          className="mx-auto mb-3 h-10 w-10 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-base font-semibold text-green-800">
          Votre demande a été envoyée !
        </p>
        <p className="mt-1 text-sm text-green-700">
          Notre équipe vous contactera sous 24h.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-[#ec4130] hover:underline"
        >
          Soumettre une nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Contact Name */}
      <div>
        <label
          htmlFor="quote-contactName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          id="quote-contactName"
          type="text"
          disabled={isPending}
          autoComplete="name"
          className={fieldClass}
          placeholder="Ex : Mohamed Ben Ali"
          {...register('contactName', { required: 'Champ obligatoire' })}
        />
        {errors.contactName && (
          <p className={errorClass}>{errors.contactName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="quote-contactPhone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          id="quote-contactPhone"
          type="tel"
          disabled={isPending}
          autoComplete="tel"
          className={fieldClass}
          placeholder="Ex : 21612345678"
          {...register('contactPhone', {
            required: 'Champ obligatoire',
            pattern: {
              value: /^(?:\+?216)?[2-9]\d{7}$/,
              message: 'Numéro de téléphone invalide',
            },
          })}
        />
        {errors.contactPhone && (
          <p className={errorClass}>{errors.contactPhone.message}</p>
        )}
      </div>

      {/* Company (optional) */}
      <div>
        <label
          htmlFor="quote-companyName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Entreprise{' '}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </label>
        <input
          id="quote-companyName"
          type="text"
          disabled={isPending}
          autoComplete="organization"
          className={fieldClass}
          placeholder="Ex : MSPI Sécurité"
          {...register('companyName')}
        />
      </div>

      {/* Email (optional) */}
      <div>
        <label
          htmlFor="quote-contactEmail"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email{' '}
          <span className="text-xs font-normal text-gray-400">(optionnel)</span>
        </label>
        <input
          id="quote-contactEmail"
          type="email"
          disabled={isPending}
          autoComplete="email"
          className={fieldClass}
          placeholder="Ex : contact@entreprise.com"
          {...register('contactEmail', {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Adresse email invalide',
            },
          })}
        />
        {errors.contactEmail && (
          <p className={errorClass}>{errors.contactEmail.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="quote-message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Décrivez votre besoin <span className="text-red-500">*</span>
        </label>
        <textarea
          id="quote-message"
          rows={5}
          disabled={isPending}
          className={cn(fieldClass, 'resize-none')}
          placeholder="Ex : Installation de détecteurs incendie pour un entrepôt de 500 m²..."
          {...register('message', {
            required: 'Champ obligatoire',
            minLength: {
              value: 20,
              message: 'Minimum 20 caractères',
            },
          })}
        />
        {errors.message && (
          <p className={errorClass}>{errors.message.message}</p>
        )}
      </div>

      {/* Generic error */}
      <div aria-live="polite" aria-atomic="true">
        {isError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            Une erreur s&apos;est produite. Veuillez réessayer.
          </p>
        )}
      </div>

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
        {isPending ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}
