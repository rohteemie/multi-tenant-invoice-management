import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store';
import { useAuthStore } from '../store';
import { Button, ErrorMessage, SuccessMessage, Loading, CurrencySelector, TaxRateInput, LogoUpload } from '../components/common';
import { TenantBrandingSettings, InvoiceNumberConfig } from '../components/tenant';
import { UserRole } from '../types';
import type { TenantCreate, Currency } from '../types';

export const TenantSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();
  const { currentTenant, isLoading, error, fetchTenantById, updateTenant, deleteTenant, uploadLogo, deleteLogo, setError } = useTenantStore();
  
  const [formData, setFormData] = useState<Partial<TenantCreate>>({
    name: '',
    domain: '',
    description: '',
    plan_type: '',
    default_currency: 'NGN',
    tax_rate: 0,
    tax_label: '',
    address: '',
    phone: '',
    email: '',
    invoice_number_prefix: '',
    invoice_number_format: 'INV-{YYYY}-{0000}',
    invoice_number_sequence: 1,
    primary_color: '#000000',
    secondary_color: '#666666',
    custom_footer: '',
    draft_watermark_enabled: false,
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        default_currency: currentTenant.default_currency || 'NGN',
        tax_rate: currentTenant.tax_rate || 0,
        tax_label: currentTenant.tax_label || '',
        address: currentTenant.address || '',
        phone: currentTenant.phone || '',
        email: currentTenant.email || '',
        invoice_number_prefix: currentTenant.invoice_number_prefix || '',
        invoice_number_format: currentTenant.invoice_number_format || 'INV-{YYYY}-{0000}',
        invoice_number_sequence: currentTenant.invoice_number_sequence || 1,
        primary_color: currentTenant.primary_color || '#000000',
        secondary_color: currentTenant.secondary_color || '#666666',
        custom_footer: currentTenant.custom_footer || '',
        draft_watermark_enabled: currentTenant.draft_watermark_enabled || false,
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

  const handleCurrencyChange = (currency: Currency) => {
    setFormData({
      ...formData,
      default_currency: currency,
    });
  };

  const handleTaxRateChange = (rate: number) => {
    setFormData({
      ...formData,
      tax_rate: rate,
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!currentUser?.tenant_id) return;
    
    try {
      await uploadLogo(currentUser.tenant_id, file);
      setSuccessMessage('Logo uploaded successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error is handled in store
    }
  };

  const handleLogoDelete = async () => {
    if (!currentUser?.tenant_id) return;
    
    try {
      await deleteLogo(currentUser.tenant_id);
      setSuccessMessage('Logo deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // Error is handled in store
    }
  };

  const handleBrandingChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleInvoiceNumberChange = (field: string, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!currentUser?.tenant_id) return;

    try {
      await updateTenant(currentUser.tenant_id, formData);
      setSuccessMessage('Tenant settings updated successfully');
      // Reset initialization flag to allow form to refresh with updated values
      setIsInitialized(false);
    } catch {
      // Error is handled in store
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser?.tenant_id) return;

    try {
      await deleteTenant(currentUser.tenant_id);
      // Logout user after deleting tenant using authStore
      logout();
      navigate('/login');
    } catch {
      // Error is handled in store
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
            Manage your organization settings and branding
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        {successMessage && <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />}

        {/* Logo Upload Section */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
          <LogoUpload
            currentLogoUrl={currentTenant.logo_url}
            onUpload={handleLogoUpload}
            onDelete={currentTenant.logo_url ? handleLogoDelete : undefined}
            isLoading={isLoading}
          />
        </div>

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

            <CurrencySelector
              value={formData.default_currency}
              onChange={handleCurrencyChange}
              label="Default Currency"
              required
            />

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

        {/* Contact Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <p className="text-sm text-gray-500 mb-4">
            This information will appear on your invoices
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="contact@yourcompany.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="123 Main St, Suite 100, City, State, ZIP"
              />
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TaxRateInput
              value={formData.tax_rate || 0}
              onChange={handleTaxRateChange}
              label="Default Tax Rate"
            />

            <div>
              <label htmlFor="tax_label" className="block text-sm font-medium text-gray-700">
                Tax Label
              </label>
              <input
                id="tax_label"
                name="tax_label"
                type="text"
                value={formData.tax_label}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., VAT, GST, Sales Tax"
              />
            </div>
          </div>
        </div>

        {/* PDF Branding Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Branding</h3>
          <p className="text-sm text-gray-500 mb-4">
            Customize the appearance of your invoice PDFs with colors and footer text
          </p>
          <TenantBrandingSettings
            primaryColor={formData.primary_color}
            secondaryColor={formData.secondary_color}
            customFooter={formData.custom_footer}
            draftWatermarkEnabled={formData.draft_watermark_enabled}
            onChange={handleBrandingChange}
            disabled={isLoading}
          />
        </div>

        {/* Invoice Number Configuration */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Number Configuration</h3>
          <p className="text-sm text-gray-500 mb-4">
            Configure how invoice numbers are generated for your organization
          </p>
          <InvoiceNumberConfig
            prefix={formData.invoice_number_prefix}
            format={formData.invoice_number_format}
            sequence={formData.invoice_number_sequence}
            onChange={handleInvoiceNumberChange}
            disabled={isLoading}
          />
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
              onClick={() => setShowDeleteConfirm(true)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full mx-4 relative z-10">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Organization
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this organization? This will deactivate the organization and all associated data will become inaccessible. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <Button
                  onClick={handleDeleteConfirm}
                  variant="danger"
                  className="w-full sm:w-auto"
                  isLoading={isLoading}
                >
                  Delete Organization
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
