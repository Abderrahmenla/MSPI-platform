'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../api/users.api';
import { usersKeys } from '../constants/users-query-keys.constants';

export function useProfile() {
  return useQuery({
    queryKey: usersKeys.profile(),
    queryFn: fetchProfile,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) return false;
      return failureCount < 2;
    },
  });
}
