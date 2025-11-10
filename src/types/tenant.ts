import type { Currency, TaxRate } from './invoice';

export interface TenantTaxConfig {
  default_tax_rate?: number;
  tax_rates?: TaxRate[];
  tax_label?: string; // e.g., "VAT", "GST", "Sales Tax"
  tax_id?: string; // Tenant's own tax ID
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  plan_type: string;
  is_active: boolean;
  default_currency?: Currency;
  tax_config?: TenantTaxConfig;
  created_at: string;
  updated_at: string;
}

export interface TenantCreate {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
  default_currency?: Currency;
  tax_config?: TenantTaxConfig;
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
