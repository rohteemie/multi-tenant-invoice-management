import type { Currency } from './invoice';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  plan_type: string;
  is_active: boolean;
  default_currency: Currency; // Aligned with backend
  tax_rate?: number; // Tax/VAT rate as percentage (0-100, null for tax-free)
  tax_label?: string; // Tax label (e.g., "VAT", "GST", "Sales Tax")
  created_at: string;
  updated_at: string;
}

export interface TenantCreate {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
  default_currency?: Currency;
  tax_rate?: number; // Tax/VAT rate as percentage (0-100, null for tax-free)
  tax_label?: string; // Tax label (e.g., "VAT", "GST", "Sales Tax")
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
  default_currency?: Currency; // Optional, backend defaults to USD
  tax_rate?: number; // Optional tax/VAT rate as percentage (0-100)
  tax_label?: string; // Optional tax label (e.g., "VAT", "GST", "Sales Tax")
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
