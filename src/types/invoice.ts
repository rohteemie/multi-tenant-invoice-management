export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue'
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

// Currency and Tax support
export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'AUD';

export interface TaxRate {
  id?: string;
  name: string;
  rate: number; // Percentage (e.g., 7.5 for 7.5%)
  is_default?: boolean;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  tax_rate?: number; // Tax percentage for this item
  tax_amount?: number; // Calculated tax for this item
  invoice_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number; // Optional per-item tax rate
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  creator_id: string;
  updater_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_vat_number?: string; // VAT/Tax ID for customer
  branch_id?: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  currency?: Currency; // Invoice currency
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  paid_at?: string;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreate {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_vat_number?: string;
  branch_id?: string;
  issue_date: string;
  due_date?: string;
  currency?: Currency;
  notes?: string;
  items: InvoiceItemCreate[];
}

export interface InvoiceUpdate {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_vat_number?: string;
  branch_id?: string;
  issue_date?: string;
  due_date?: string;
  currency?: Currency;
  notes?: string;
  items?: InvoiceItemCreate[];
}

export interface InvoiceStatusUpdate {
  status: InvoiceStatus;
  payment_method?: string;
}
