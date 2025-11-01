export const UserRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ATTENDANT: 'attendant'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  tenant_id: string;
}

export interface UserUpdate {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
}
