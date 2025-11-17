import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services';
import type { InvoiceSummary, RevenueByStatus, Currency } from '../types';
import { Loading, ErrorMessage } from '../components/common';
import { useAuthStore } from '../store';
import { useTenantStore } from '../store/tenantStore';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';
import { getErrorMessage } from '../types/error';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentTenant, fetchTenantById } = useTenantStore();
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueByStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the display currency from tenant's default or fallback to USD
  const displayCurrency: Currency = currentTenant?.default_currency || 'USD';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch tenant information if we have a user with tenant_id
        if (user?.tenant_id && !currentTenant) {
          await fetchTenantById(user.tenant_id);
        }

        const [summaryData, revenueByStatus] = await Promise.all([
          analyticsService.getInvoiceSummary(),
          analyticsService.getRevenueByStatus(),
        ]);
        setSummary(summaryData);
        setRevenueData(revenueByStatus);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, currentTenant, fetchTenantById]);

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.full_name}!
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/invoices/create"
            className="btn-primary"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Multi-Currency Warning */}
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Multi-Currency Analytics Limitation
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Analytics currently aggregate amounts across all currencies without conversion. 
                For accurate multi-currency reporting, the backend needs to be updated to either 
                group by currency or convert to {displayCurrency}. Amounts below are shown with 
                the {displayCurrency} symbol but may include mixed currencies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-blue-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                <dd className="text-lg font-semibold text-gray-900">{summary?.total_invoices || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-green-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue (approx. {displayCurrency})
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatCurrencyWithSymbol(Number(summary?.total_revenue || 0), displayCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-yellow-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Amount (approx. {displayCurrency})
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatCurrencyWithSymbol(Number(summary?.pending_amount || 0), displayCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-red-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Overdue (approx. {displayCurrency})
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatCurrencyWithSymbol(Number(summary?.overdue_amount || 0), displayCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Status Breakdown */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Status</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Draft</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{summary?.draft_count || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Sent</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{summary?.sent_count || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Paid</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{summary?.paid_count || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Overdue</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">{summary?.overdue_count || 0}</div>
          </div>
        </div>
      </div>

      {/* Revenue by Status */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revenue by Status
          <span className="ml-2 text-xs font-normal text-gray-500">
            (Approx. {displayCurrency} - mixed currencies)
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.map((item) => (
                <tr key={item.status}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'paid' ? 'bg-green-100 text-green-800' :
                      item.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrencyWithSymbol(Number(item.total_amount || 0), displayCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> The backend currently aggregates amounts across all currencies without conversion. 
            For accurate multi-currency analytics, backend updates are required to either group by currency or 
            convert all amounts to {displayCurrency}. Individual invoices maintain their original currency.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/invoices/create"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Invoice
          </Link>
          <Link
            to="/invoices"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View All Invoices
          </Link>
          <Link
            to="/users"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};
