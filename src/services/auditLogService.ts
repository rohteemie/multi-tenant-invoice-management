/**
 * Audit Log Service
 * Handles API requests for audit log operations
 */
import { apiClient } from './api';
import type { AuditLog, AuditAction, ResourceType } from '../types';

export interface GetAuditLogsParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  actions?: AuditAction[];
  resource_types?: ResourceType[];
  resource_id?: string;
  status?: string;
  start_date?: string; // ISO 8601 format
  end_date?: string; // ISO 8601 format
}

/**
 * Get list of audit logs with optional filters
 */
export async function getAuditLogs(params?: GetAuditLogsParams): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[] | { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] }>('/audit-logs/', { params });
  // Handle both array response and paginated response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Handle paginated response with various field names
  const data = response.data as { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] };
  const logs = data.items ?? data.data ?? data.audit_logs;
  if (!logs) {
    console.error('Unexpected audit logs response format: missing items, data, and audit_logs fields', response.data);
    return [];
  }
  return logs;
}

/**
 * Get a specific audit log by ID
 */
export async function getAuditLog(id: string): Promise<AuditLog> {
  const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
  return response.data;
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  params?: Omit<GetAuditLogsParams, 'user_id'>
): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[] | { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] }>(`/audit-logs/user/${userId}`, { params });
  // Handle both array response and paginated response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Handle paginated response with various field names
  const data = response.data as { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] };
  const logs = data.items ?? data.data ?? data.audit_logs;
  if (!logs) {
    console.error('Unexpected user audit logs response format: missing items, data, and audit_logs fields', response.data);
    return [];
  }
  return logs;
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  params?: Omit<GetAuditLogsParams, 'resource_type' | 'resource_id'>
): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[] | { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] }>(
    `/audit-logs/resource/${resourceType}/${resourceId}`,
    { params }
  );
  // Handle both array response and paginated response formats
  if (Array.isArray(response.data)) {
    return response.data;
  }
  // Handle paginated response with various field names
  const data = response.data as { items?: AuditLog[]; data?: AuditLog[]; audit_logs?: AuditLog[] };
  const logs = data.items ?? data.data ?? data.audit_logs;
  if (!logs) {
    console.error('Unexpected resource audit logs response format: missing items, data, and audit_logs fields', response.data);
    return [];
  }
  return logs;
}
