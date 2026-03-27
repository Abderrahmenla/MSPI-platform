import { useQuery } from '@tanstack/react-query';
import { fetchStaff } from '../api/staff.api';
import { staffQueryKeys } from '../constants/staff-query-keys.constants';

export function useStaff() {
  return useQuery({
    queryKey: staffQueryKeys.lists(),
    queryFn: fetchStaff,
  });
}
