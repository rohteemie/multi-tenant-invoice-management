import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store';
import { useAuthStore } from '../store';
import { Button, ErrorMessage, Loading } from '../components/common';
import { UserRole } from '../types';
import type { TenantCreate } from '../types';

export const TenantSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { currentTenant, isLoading, error, fetchTenantById, updateTenant, deleteTenant, setError } = useTenantStore();
  
  const [formData, setFormData] = useState<Partial<TenantCreate>>({
    name: '',
    domain: '',
    description: '',
    plan_type: '',
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Only owners can manage tenant settings
  const canManageTenant = currentUser?.role === UserRole.OWNER;

  useEffect(() => {
    if (!canManageTenant) {
      setError('Only tenant owners can access this page');
      return;
    }

    if (currentUser?.tenant_id) {
      fetchTenantById(currentUser.tenant_id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentTenant && !isInitialized) {
      setFormData({
        name: currentTenant.name,
        domain: currentTenant.domain || '',
        description: currentTenant.description || '',
        plan_type: currentTenant.plan_type,
      });
      setIsInitialized(true);
    }
  }, [currentTenant, isInitialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.tenant_id) return;

    try {
      await updateTenant(currentUser.tenant_id, formData);
      alert('Tenant settings updated successfully');
    } catch {
      // Error is handled in store
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.tenant_id) return;

    if (window.confirm('Are you sure you want to delete this tenant? This will deactivate the organization and all associated data will become inaccessible. This action cannot be undone.')) {
      try {
        await deleteTenant(currentUser.tenant_id);
        // Logout user after deleting tenant
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } catch {
        // Error is handled in store
      }
    }
  };

  if (!canManageTenant) {
    return (
      <div className="space-y-6">
        <ErrorMessage message="Only tenant owners can access this page" />
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (isLoading && !currentTenant) {
    return <Loading size="lg" text="Loading tenant settings..." />;
  }

  if (error && !currentTenant) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} />
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!currentTenant) {
    return <div>Tenant not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tenant Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization settings and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Tenant Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Domain
              </label>
              <input
                id="domain"
                name="domain"
                type="text"
                value={formData.domain}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., mycompany.com"
              />
            </div>

            <div>
              <label htmlFor="plan_type" className="block text-sm font-medium text-gray-700">
                Plan Type
              </label>
              <input
                id="plan_type"
                name="plan_type"
                type="text"
                value={formData.plan_type}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., Free, Basic, Premium"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="Brief description of your organization"
              />
            </div>
          </div>
        </div>

        {/* Tenant Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Status</h3>
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    currentTenant.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentTenant.is_active ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentTenant.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentTenant.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
            >
              Delete Organization
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              This will deactivate your organization and all data will become inaccessible.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
