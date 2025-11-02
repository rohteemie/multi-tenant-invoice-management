export interface InvoiceSummary {
  total_invoices: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
  total_revenue: string | number;
  pending_amount: string | number;
  overdue_amount: string | number;
}

export interface RevenueByStatus {
  status: string;
  count: number;
  total_amount: string | number;
}
