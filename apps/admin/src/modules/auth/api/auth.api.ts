import { http } from '@/modules/core/services';

export async function adminLogin(email: string, password: string) {
  return http.post('/auth/admin/login', { email, password });
}

export async function adminLogout() {
  return http.post('/auth/admin/logout');
}
