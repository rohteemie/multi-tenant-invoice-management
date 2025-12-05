/**
 * Audit Log types matching backend schema
 */

export const AuditAction = {
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  TOKEN_REFRESH: 'token_refresh',
  
  // User management events
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  
  // Tenant management events
  TENANT_CREATED: 'tenant_created',
  TENANT_UPDATED: 'tenant_updated',
  TENANT_DELETED: 'tenant_deleted',
  
  // Invoice management events
  INVOICE_CREATED: 'invoice_created',
  INVOICE_UPDATED: 'invoice_updated',
  INVOICE_DELETED: 'invoice_deleted',
  INVOICE_STATUS_CHANGED: 'invoice_status_changed',
  
  // Data export events
  DATA_EXPORTED: 'data_exported',
  INVOICE_PDF_GENERATED: 'invoice_pdf_generated',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export const ResourceType = {
  USER: 'user',
  TENANT: 'tenant',
  INVOICE: 'invoice',
  INVOICE_ITEM: 'invoice_item',
  AUTH: 'auth',
  EXPORT: 'export',
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export interface AuditLog {
  id: string;
  user_id: string | null;
  tenant_id: string | null;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  changes: string | null; // JSON string with structure: { "before": {...}, "after": {...} }
  description: string | null;
  status: string; // 'success' | 'failure'
  created_at: string;
  updated_at: string;
}

export interface AuditLogFilter {
  user_id?: string;
  tenant_id?: string;
  action?: AuditAction;
  resource_type?: ResourceType;
  resource_id?: string;
  status?: string;
  start_date?: string; // ISO 8601 format
  end_date?: string; // ISO 8601 format
}
