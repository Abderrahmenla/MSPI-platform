import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api/dashboard.api';

const DASHBOARD_QUERY_KEY = ['dashboard', 'stats'] as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardStats,
  });
}
