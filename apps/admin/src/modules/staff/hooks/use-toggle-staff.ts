import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateStaff, reactivateStaff } from '../api/staff.api';
import { staffQueryKeys } from '../constants/staff-query-keys.constants';

interface ToggleStaffVars {
  id: number;
  activate: boolean;
}

export function useToggleStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activate }: ToggleStaffVars) =>
      activate ? reactivateStaff(id) : deactivateStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() });
    },
  });
}
