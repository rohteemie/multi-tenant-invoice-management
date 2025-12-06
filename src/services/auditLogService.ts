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
  const response = await apiClient.get<AuditLog[]>('/audit-logs/', { params });
  return response.data;
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
  const response = await apiClient.get<AuditLog[]>(`/audit-logs/user/${userId}`, { params });
  return response.data;
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: ResourceType,
  resourceId: string,
  params?: Omit<GetAuditLogsParams, 'resource_type' | 'resource_id'>
): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[]>(
    `/audit-logs/resource/${resourceType}/${resourceId}`,
    { params }
  );
  return response.data;
}
