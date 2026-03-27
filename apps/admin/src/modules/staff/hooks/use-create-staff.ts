import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStaff } from '../api/staff.api';
import { staffQueryKeys } from '../constants/staff-query-keys.constants';
import type { CreateStaffData } from '../types/staff.types';

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffData) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() });
    },
  });
}
