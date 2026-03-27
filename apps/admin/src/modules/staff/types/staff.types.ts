export type StaffRole = 'admin' | 'manager' | 'support';

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}
