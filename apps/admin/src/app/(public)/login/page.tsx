'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { adminLogin } from '@/modules/auth/api';
import { cn } from '@/modules/core/lib/cn';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await adminLogin(values.email, values.password);
      router.push('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        setServerError('Email ou mot de passe incorrect');
      } else {
        setServerError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <span
            className="font-[family-name:var(--font-rubik)] text-3xl font-bold"
            style={{ color: '#ec4130' }}
          >
            MSPI
          </span>
          <p className="mt-1 text-sm text-gray-500">
            Administration — Connexion
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: "L'email est requis",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'email invalide",
                },
              })}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none',
                'focus:border-[#ec4130] focus:ring-2 focus:ring-[#ec4130]/40',
                errors.email ? 'border-red-500' : 'border-gray-300',
              )}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Le mot de passe est requis',
              })}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm outline-none',
                'focus:border-[#ec4130] focus:ring-2 focus:ring-[#ec4130]/40',
                errors.password ? 'border-red-500' : 'border-gray-300',
              )}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full rounded-md py-2 text-sm font-semibold text-white transition-opacity',
              isSubmitting
                ? 'cursor-not-allowed opacity-60'
                : 'hover:opacity-90',
            )}
            style={{ backgroundColor: '#ec4130' }}
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}
