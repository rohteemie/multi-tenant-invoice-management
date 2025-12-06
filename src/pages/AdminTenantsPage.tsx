import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services';
import type { Tenant } from '../types';
import { Loading, ErrorMessage, SuccessMessage } from '../components/common';

/**
 * Super Admin Tenant Management Page
 * Lists all tenants with suspend/reactivate capabilities
 */
export const AdminTenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

  useEffect(() => {
    loadTenants();
  }, [filter]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter === 'all' ? {} : { is_active: filter === 'active' };
      const data = await adminService.listTenants(params);
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to suspend tenant "${tenantName}"? This will prevent all users in this tenant from accessing the system.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const result = await adminService.suspendTenant(tenantId);
      setSuccess(result.message);
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend tenant');
    }
  };

  const handleReactivate = async (tenantId: string, tenantName: string) => {
    if (!confirm(`Are you sure you want to reactivate tenant "${tenantName}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const result = await adminService.reactivateTenant(tenantId);
      setSuccess(result.message);
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate tenant');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all tenants across the platform
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Tenants
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`${
              filter === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`${
              filter === 'suspended'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Suspended
          </button>
        </nav>
      </div>

      {/* Tenants Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tenants found
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tenant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.domain || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.plan_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tenant.default_currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tenant.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tenant.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {tenant.is_active ? (
                      <button
                        onClick={() => handleSuspend(tenant.id, tenant.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(tenant.id, tenant.name)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
