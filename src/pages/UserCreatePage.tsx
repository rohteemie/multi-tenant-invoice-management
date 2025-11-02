import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services';
import { Button, ErrorMessage } from '../components/common';
import { getErrorMessage } from '../types/error';
import { UserRole } from '../types';
import { useAuthStore } from '../store';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.ATTENDANT,
  });

  // Check if current user has permission to create users (owner or admin)
  const canCreateUsers = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!user?.tenant_id) {
      setError('User tenant information not available');
      return;
    }

    setIsLoading(true);

    try {
      await userService.create({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        tenant_id: user.tenant_id,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCreateUsers) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You don't have permission to create new users. Only owners and admins can register new users.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
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
              User Created Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Redirecting to users page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Register New User
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a new user to your organization
          </p>
        </div>
      </div>

      <form className="card space-y-6" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        <div className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 input-field"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 input-field"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="mt-1 input-field"
            >
              <option value={UserRole.ATTENDANT}>Attendant</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value={UserRole.ADMIN}>Admin</option>
              {user?.role === UserRole.OWNER && (
                <option value={UserRole.OWNER}>Owner</option>
              )}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select the role for this user. Different roles have different permissions.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
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

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/users')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
};
