import { http } from '@/modules/core/services/http.service';
import type { UserProfileResponse } from '../types/user.types';

export async function fetchProfile(): Promise<UserProfileResponse> {
  const { data } = await http.get<UserProfileResponse>('/customer/profile');
  return data;
}
