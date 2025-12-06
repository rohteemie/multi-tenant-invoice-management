export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenPayload {
  sub: string;
  tenant_id: string | null; // Nullable for Super Admin
  role: string;
  is_superadmin?: boolean; // Platform-level super admin flag
  exp?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}
