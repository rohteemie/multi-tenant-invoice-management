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
  // Invoice number configuration
  invoice_number_prefix?: string; // Prefix for invoice numbers (max 20 chars)
  invoice_number_format?: string; // Format string for invoice numbers (max 100 chars)
  invoice_number_sequence?: number; // Current sequence number for invoices
  // PDF customization
  primary_color?: string; // Primary color for PDF branding (hex code)
  secondary_color?: string; // Secondary color for PDF branding (hex code)
  custom_footer?: string; // Custom footer text for invoices (max 500 chars)
  draft_watermark_enabled?: boolean; // Whether to show watermark on draft invoices
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
  // Invoice number configuration
  invoice_number_prefix?: string; // Prefix for invoice numbers (max 20 chars)
  invoice_number_format?: string; // Format string for invoice numbers (max 100 chars)
  invoice_number_sequence?: number; // Current sequence number for invoices
  // PDF customization
  primary_color?: string; // Primary color for PDF branding (hex code)
  secondary_color?: string; // Secondary color for PDF branding (hex code)
  custom_footer?: string; // Custom footer text for invoices (max 500 chars)
  draft_watermark_enabled?: boolean; // Whether to show watermark on draft invoices
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
  // Invoice number configuration
  invoice_number_prefix?: string; // Optional prefix for invoice numbers (max 20 chars)
  invoice_number_format?: string; // Optional format string for invoice numbers (max 100 chars)
  invoice_number_sequence?: number; // Optional current sequence number for invoices
  // PDF customization
  primary_color?: string; // Optional primary color for PDF branding (hex code)
  secondary_color?: string; // Optional secondary color for PDF branding (hex code)
  custom_footer?: string; // Optional custom footer text for invoices (max 500 chars)
  draft_watermark_enabled?: boolean; // Optional - whether to show watermark on draft invoices
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
