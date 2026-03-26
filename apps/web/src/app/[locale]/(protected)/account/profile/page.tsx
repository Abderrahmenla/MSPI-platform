'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProfile } from '@/modules/users/hooks/use-profile';
import { ROUTES_MAP } from '@/modules/core/constants/routes-map.constants';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading, error } = useProfile();

  useEffect(() => {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      router.push(ROUTES_MAP.login);
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-[#525252]">
        Chargement…
      </div>
    );
  }

  const profile = data?.data;
  if (!profile) return null;

  const initials = getInitials(profile.name);

  return (
    <div className="space-y-5">
      <h1 className="font-[Rubik] text-2xl font-semibold text-[#0a0a0a]">
        Mon profil
      </h1>

      <div className="rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
        {/* Avatar + name */}
        <div className="mb-6 flex items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ec4130]">
              <span className="font-[Rubik] text-xl font-bold text-white">
                {initials}
              </span>
            </div>
          )}
          <div>
            <p className="font-[Rubik] text-lg font-semibold text-[#0a0a0a]">
              {profile.name}
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-2.5 py-1 text-xs font-medium text-white">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Compte Facebook
            </span>
          </div>
        </div>

        {/* Info rows */}
        <dl className="space-y-4 border-t border-[#e4e4e7] pt-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <dt className="shrink-0 text-sm text-[#525252] sm:w-32">Nom</dt>
            <dd className="text-sm font-medium text-[#0a0a0a]">
              {profile.name}
            </dd>
          </div>
          {profile.email && (
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <dt className="shrink-0 text-sm text-[#525252] sm:w-32">Email</dt>
              <dd className="text-sm font-medium text-[#0a0a0a]">
                {profile.email}
              </dd>
            </div>
          )}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <dt className="shrink-0 text-sm text-[#525252] sm:w-32">
              Connexion via
            </dt>
            <dd className="text-sm font-medium text-[#0a0a0a]">Facebook</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-[#525252]">
          Les informations du profil sont gérées via votre compte Facebook.
        </p>
      </div>
    </div>
  );
}
