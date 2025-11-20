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
  logo_url?: string; // URL to tenant's logo (if uploaded)
  address?: string; // Tenant's address for branding
  phone?: string; // Tenant's phone for branding
  email?: string; // Tenant's email for branding
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
  address?: string; // Tenant's address for branding
  phone?: string; // Tenant's phone for branding
  email?: string; // Tenant's email for branding
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
  address?: string; // Optional tenant's address for branding
  phone?: string; // Optional tenant's phone for branding
  email?: string; // Optional tenant's email for branding
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
