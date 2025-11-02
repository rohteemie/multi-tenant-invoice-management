import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantService } from '../services';
import { Button, ErrorMessage } from '../components/common';
import { getErrorMessage } from '../types/error';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    tenantName: '',
    tenantDomain: '',
    tenantDescription: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.ownerPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.ownerPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await tenantService.register({
        name: formData.tenantName,
        domain: formData.tenantDomain,
        description: formData.tenantDescription,
        plan_type: 'free',
        owner: {
          full_name: formData.ownerName,
          email: formData.ownerEmail,
          password: formData.ownerPassword,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-gray-600">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Organization Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                    Organization Name *
                  </label>
                  <input
                    id="tenantName"
                    name="tenantName"
                    type="text"
                    required
                    value={formData.tenantName}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label htmlFor="tenantDomain" className="block text-sm font-medium text-gray-700">
                    Domain (Optional)
                  </label>
                  <input
                    id="tenantDomain"
                    name="tenantDomain"
                    type="text"
                    value={formData.tenantDomain}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="acme"
                  />
                </div>

                <div>
                  <label htmlFor="tenantDescription" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="tenantDescription"
                    name="tenantDescription"
                    rows={3}
                    value={formData.tenantDescription}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="Brief description of your organization"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Owner Account
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    required
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="john@acme.com"
                  />
                </div>

                <div>
                  <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    id="ownerPassword"
                    name="ownerPassword"
                    type="password"
                    required
                    value={formData.ownerPassword}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
