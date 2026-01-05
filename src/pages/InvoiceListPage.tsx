import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoiceStore } from '../store';
import { Loading, ErrorMessage, Button } from '../components/common';
import { InvoiceStatus } from '../types';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';

export const InvoiceListPage: React.FC = () => {
  const { invoices, isLoading, error, fetchInvoices, exportInvoices, deleteInvoice } = useInvoiceStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      // Validate amount range
      const minAmount = minAmountFilter ? Number(minAmountFilter) : undefined;
      const maxAmount = maxAmountFilter ? Number(maxAmountFilter) : undefined;
      
      if (minAmount !== undefined && (minAmount < 0 || !isFinite(minAmount))) {
        alert('Min amount must be a positive number');
        return;
      }
      
      if (maxAmount !== undefined && (maxAmount < 0 || !isFinite(maxAmount))) {
        alert('Max amount must be a positive number');
        return;
      }
      
      if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
        alert('Min amount cannot be greater than max amount');
        return;
      }
      
      // Validate date range
      if (startDateFilter && endDateFilter && startDateFilter > endDateFilter) {
        alert('Start date cannot be after end date');
        return;
      }
      
      await fetchInvoices({
        status: statusFilter || undefined,
        customer_name: customerFilter || undefined,
        invoice_number: invoiceNumberFilter || undefined,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
        min_amount: minAmount,
        max_amount: maxAmount,
      });
    } catch {
      // Error is handled in store
    }
  };

  const handleFilter = () => {
    loadInvoices();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await exportInvoices(format, {
        status: statusFilter || undefined,
        customer_name: customerFilter || undefined,
        invoice_number: invoiceNumberFilter || undefined,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
        min_amount: minAmountFilter ? Number(minAmountFilter) : undefined,
        max_amount: maxAmountFilter ? Number(maxAmountFilter) : undefined,
      });
    } catch {
      // Error is handled in store
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setCustomerFilter('');
    setInvoiceNumberFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        await deleteInvoice(id);
        // Refresh the invoice list after deletion
        await loadInvoices();
      } catch {
        // Error is handled in store
      }
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case InvoiceStatus.SENT:
        return 'bg-blue-100 text-blue-800';
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && invoices.length === 0) {
    return <Loading size="lg" text="Loading invoices..." />;
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Invoices
          </h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:ml-4">
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('json')}>
            Export JSON
          </Button>
          <Link to="/invoices/create" className="btn-primary">
            Create Invoice
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 input-field"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                id="customer"
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="mt-1 input-field"
                placeholder="Search by customer name"
              />
            </div>
            <div>
              <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                id="invoice-number"
                type="text"
                value={invoiceNumberFilter}
                onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                className="mt-1 input-field"
                placeholder="Search by invoice number"
              />
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAdvancedFilters ? '− Hide' : '+ Show'} Advanced Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDateFilter ? startDateFilter.split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Create date at noon local time to avoid timezone shifting
                      const date = new Date(e.target.value + 'T12:00:00');
                      setStartDateFilter(date.toISOString());
                    } else {
                      setStartDateFilter('');
                    }
                  }}
                  className="mt-1 input-field"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDateFilter ? endDateFilter.split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Create date at noon local time to avoid timezone shifting
                      const date = new Date(e.target.value + 'T12:00:00');
                      setEndDateFilter(date.toISOString());
                    } else {
                      setEndDateFilter('');
                    }
                  }}
                  className="mt-1 input-field"
                />
              </div>
              <div>
                <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700">
                  Min Amount
                </label>
                <input
                  id="min-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmountFilter}
                  onChange={(e) => setMinAmountFilter(e.target.value)}
                  className="mt-1 input-field"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700">
                  Max Amount
                </label>
                <input
                  id="max-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxAmountFilter}
                  onChange={(e) => setMaxAmountFilter(e.target.value)}
                  className="mt-1 input-field"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleFilter} className="flex-1 sm:flex-none">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="secondary" className="flex-1 sm:flex-none">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found. Create your first invoice!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/invoices/${invoice.id}`}>
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer_name}
                      </div>
                      {invoice.customer_email && (
                        <div className="text-sm text-gray-500">
                          {invoice.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrencyWithSymbol(
                        Number(invoice.total_amount),
                        invoice.currency || 'USD'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          to={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        {invoice.status === InvoiceStatus.DRAFT && (
                          <button
                            onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
