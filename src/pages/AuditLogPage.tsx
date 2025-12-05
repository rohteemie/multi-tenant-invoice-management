import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../store';
import { UserRole, AuditAction, ResourceType } from '../types';
import { Loading, ErrorMessage, Button } from '../components/common';
import {
  getAuditLogs,
  type GetAuditLogsParams,
} from '../services';
import type { AuditLog } from '../types';

export const AuditLogPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(50);
  
  // Filters
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterResourceType, setFilterResourceType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Check if current user can view audit logs (Admin or Owner only)
  const canViewAuditLogs = currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!canViewAuditLogs) {
      setError('You do not have permission to view audit logs. Only Admins and Owners can access this page.');
      setIsLoading(false);
      return;
    }
    
    loadAuditLogs();
  }, [canViewAuditLogs, currentPage, filterAction, filterResourceType, filterStatus, filterUserId, filterStartDate, filterEndDate]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: GetAuditLogsParams = {
        skip: currentPage * itemsPerPage,
        limit: itemsPerPage,
      };
      
      if (filterAction) {
        params.actions = [filterAction as AuditAction];
      }
      
      if (filterResourceType) {
        params.resource_types = [filterResourceType as ResourceType];
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      if (filterUserId) {
        params.user_id = filterUserId;
      }
      
      if (filterStartDate) {
        try {
          params.start_date = new Date(filterStartDate).toISOString();
        } catch {
          setError('Invalid start date format');
          return;
        }
      }
      
      if (filterEndDate) {
        try {
          params.end_date = new Date(filterEndDate).toISOString();
        } catch {
          setError('Invalid end date format');
          return;
        }
      }
      
      const logs = await getAuditLogs(params);
      setAuditLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterAction('');
    setFilterResourceType('');
    setFilterStatus('');
    setFilterUserId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(0);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getActionBadgeColor = (action: string): string => {
    if (action.includes('failed')) return 'bg-red-100 text-red-800';
    if (action.includes('deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (action.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string): string => {
    return status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (!canViewAuditLogs) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <ErrorMessage message="You do not have permission to view audit logs. Only Admins and Owners can access this feature." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filter-action" className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              id="filter-action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="input-field"
            >
              <option value="">All Actions</option>
              <option value={AuditAction.LOGIN}>Login</option>
              <option value={AuditAction.LOGOUT}>Logout</option>
              <option value={AuditAction.LOGIN_FAILED}>Login Failed</option>
              <option value={AuditAction.USER_CREATED}>User Created</option>
              <option value={AuditAction.USER_UPDATED}>User Updated</option>
              <option value={AuditAction.USER_DELETED}>User Deleted</option>
              <option value={AuditAction.INVOICE_CREATED}>Invoice Created</option>
              <option value={AuditAction.INVOICE_UPDATED}>Invoice Updated</option>
              <option value={AuditAction.INVOICE_DELETED}>Invoice Deleted</option>
              <option value={AuditAction.INVOICE_STATUS_CHANGED}>Invoice Status Changed</option>
              <option value={AuditAction.DATA_EXPORTED}>Data Exported</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-resource-type" className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              id="filter-resource-type"
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value)}
              className="input-field"
            >
              <option value="">All Resources</option>
              <option value={ResourceType.USER}>User</option>
              <option value={ResourceType.TENANT}>Tenant</option>
              <option value={ResourceType.INVOICE}>Invoice</option>
              <option value={ResourceType.AUTH}>Authentication</option>
              <option value={ResourceType.EXPORT}>Export</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              id="filter-start-date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              id="filter-end-date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Audit Logs Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit logs found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.resource_type}</div>
                        {log.resource_id && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            ID: {log.resource_id}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || isLoading}
        >
          Previous
        </Button>
        
        <span className="text-sm text-gray-700">
          Page {currentPage + 1}
        </span>
        
        <Button
          type="button"
          variant="secondary"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={auditLogs.length < itemsPerPage || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
