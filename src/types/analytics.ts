export interface InvoiceSummary {
  total_invoices: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
  total_revenue: number;
  pending_amount: number;
  overdue_amount: number;
}

export interface RevenueByStatus {
  status: string;
  count: number;
  total_amount: number;
}
