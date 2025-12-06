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
  tenant_id: string | null; // Nullable for Super Admin users
  is_active: boolean;
  is_verified: boolean;
  is_superadmin: boolean; // Platform-level super admin flag
  currency_preference: string; // User's preferred currency (NGN, USD, GBP, EUR) - cannot be changed once set
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  tenant_id: string | null; // Nullable for Super Admin users
  currency_preference?: string; // Optional on create, defaults to NGN
  is_superadmin?: boolean; // Platform-level super admin flag
}

export interface UserUpdate {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
}
