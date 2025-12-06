import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services';
import type { PlatformStats } from '../services/adminService';
import { Loading, ErrorMessage } from '../components/common';

/**
 * Super Admin Dashboard
 * Displays platform-wide statistics and quick access to admin features
 */
export const SuperAdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPlatformStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

      const statCards = [
    {
      title: 'Total Tenants',
      value: stats.total_tenants,
      description: `${stats.active_tenants} active, ${stats.suspended_tenants} suspended`,
      link: '/admin/tenants',
      linkText: 'Manage Tenants',
      colorClass: 'text-blue-600 hover:text-blue-500',
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      description: `${stats.active_users} active, ${stats.inactive_users} inactive`,
      link: '/admin/users',
      linkText: 'View All Users',
      colorClass: 'text-green-600 hover:text-green-500',
    },
    {
      title: 'Super Admins',
      value: stats.superadmins_count,
      description: 'Platform administrators',
      link: '/admin/users?is_superadmin=true',
      linkText: 'View Super Admins',
      colorClass: 'text-purple-600 hover:text-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Platform-wide overview and management controls
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.title}
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {card.value}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-500">
                    {card.description}
                  </dd>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={card.link}
                  className={`text-sm font-medium ${card.colorClass}`}
                >
                  {card.linkText} &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/tenants"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Tenants
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Users
            </Link>
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Audit Logs
            </Link>
            <button
              onClick={loadStats}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh Stats
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tenant Health</span>
              <span className="text-sm font-medium text-green-600">
                {stats.active_tenants > 0 ? 'Healthy' : 'No Active Tenants'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Activity</span>
              <span className="text-sm font-medium text-green-600">
                {stats.active_users > 0 ? 'Active' : 'No Active Users'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Super Admin Coverage</span>
              <span className="text-sm font-medium text-green-600">
                {stats.superadmins_count} {stats.superadmins_count === 1 ? 'admin' : 'admins'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
