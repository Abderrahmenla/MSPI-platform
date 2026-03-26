'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useProfile } from '@/modules/users/hooks/use-profile';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Auth guard for all protected routes.
 * Checks the user session via /customer/profile and redirects
 * unauthenticated users to the login page before any child content renders.
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isLoading, isError, error } = useProfile();

  const is401 =
    (error as { response?: { status?: number } })?.response?.status === 401;

  useEffect(() => {
    if (is401) {
      router.replace(ROUTES_MAP.login);
    }
  }, [is401, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-gray-400"
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
          <span className="text-sm text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  if (is401) {
    return null;
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Erreur de connexion. Veuillez rafra&icirc;chir la page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
