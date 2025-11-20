export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue'
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

// Currency support - aligned with backend
export const Currency = {
  NGN: 'NGN', // Nigerian Naira
  USD: 'USD', // US Dollar
  GBP: 'GBP', // British Pound
  EUR: 'EUR'  // Euro
} as const;

export type Currency = typeof Currency[keyof typeof Currency];

// Payment method enum - aligned with backend
export const PaymentMethod = {
  TRANSFER: 'transfer',
  CASH: 'cash',
  POS: 'pos',
  CHEQUE: 'cheque',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  OTHER: 'other'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  invoice_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenant_id: string;
  creator_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  branch_id?: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  currency: Currency; // Invoice currency (required, aligned with backend)
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: PaymentMethod;
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
  branch_id?: string;
  issue_date: string;
  due_date?: string;
  currency?: Currency; // Optional on create (backend uses tenant default)
  notes?: string;
  items: InvoiceItemCreate[];
}

export interface InvoiceUpdate {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  branch_id?: string;
  issue_date?: string;
  due_date?: string;
  currency?: Currency;
  notes?: string;
  items?: InvoiceItemCreate[];
}

export interface InvoiceStatusUpdate {
  status: InvoiceStatus;
  payment_method?: PaymentMethod;
}
