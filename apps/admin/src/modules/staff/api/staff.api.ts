import { http } from '@/modules/core/services/http.service';
import type { CreateStaffData, StaffMember } from '../types/staff.types';

export async function fetchStaff(): Promise<StaffMember[]> {
  const { data } = await http.get<StaffMember[]>('/admin/staff');
  return data;
}

export async function createStaff(
  payload: CreateStaffData,
): Promise<StaffMember> {
  const { data } = await http.post<StaffMember>('/admin/staff', payload);
  return data;
}

export async function deactivateStaff(id: number): Promise<StaffMember> {
  const { data } = await http.patch<StaffMember>(
    `/admin/staff/${id}/deactivate`,
  );
  return data;
}

export async function reactivateStaff(id: number): Promise<StaffMember> {
  const { data } = await http.patch<StaffMember>(
    `/admin/staff/${id}/reactivate`,
  );
  return data;
}
