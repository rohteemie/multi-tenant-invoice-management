export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantCreate {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
}

export interface OwnerCreate {
  full_name: string;
  email: string;
  password: string;
}

export interface TenantRegister {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
  owner: OwnerCreate;
}

export interface TenantWithOwner {
  tenant: Tenant;
  owner: {
    id: string;
    email: string;
    full_name: string;
  };
}
