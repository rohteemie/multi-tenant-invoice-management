import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store';
import { Loading, ErrorMessage, Button } from '../components/common';
import { InvoiceStatus } from '../types';
import { getValidInvoiceStatusTransitions, capitalizeFirstLetter } from '../utils';

/**
 * Calculates the total price for an invoice item
 */
const calculateItemTotal = (item: { quantity: number | string; unit_price: number | string; total_price?: number | string }): string => {
  if (item.total_price) {
    return Number(item.total_price).toFixed(2);
  }
  return (Number(item.quantity) * Number(item.unit_price)).toFixed(2);
};

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentInvoice, isLoading, error, fetchInvoiceById, updateInvoiceStatus, deleteInvoice } = useInvoiceStore();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<InvoiceStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (id) {
      fetchInvoiceById(id);
    }
  }, [id]);

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setNewStatus('');
    setPaymentMethod('');
  };

  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;

    try {
      await updateInvoiceStatus(id, {
        status: newStatus,
        payment_method: newStatus === InvoiceStatus.PAID ? paymentMethod : undefined,
      });
      handleCloseModal();
    } catch {
      // Error is handled in store
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        navigate('/invoices');
      } catch {
        // Error is handled in store
      }
    }
  };

  if (isLoading && !currentInvoice) {
    return <Loading size="lg" text="Loading invoice..." />;
  }

  if (error && !currentInvoice) {
    return <ErrorMessage message={error} />;
  }

  if (!currentInvoice) {
    return <div>Invoice not found</div>;
  }

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

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Invoice {currentInvoice.invoice_number}
          </h2>
          <span
            className={`mt-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
              currentInvoice.status
            )}`}
          >
            {currentInvoice.status}
          </span>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
            Update Status
          </Button>
          {currentInvoice.status === InvoiceStatus.DRAFT && (
            <>
              <Button variant="primary" onClick={() => navigate(`/invoices/${id}/edit`)}>
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Invoice Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentInvoice.customer_name}</dd>
            </div>
            {currentInvoice.customer_email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.customer_email}</dd>
              </div>
            )}
            {currentInvoice.customer_phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.customer_phone}</dd>
              </div>
            )}
            {currentInvoice.customer_address && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.customer_address}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Invoice Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentInvoice.issue_date).toLocaleDateString()}
              </dd>
            </div>
            {currentInvoice.due_date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(currentInvoice.due_date).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentInvoice.creator_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentInvoice.created_at).toLocaleString()}
              </dd>
            </div>
            {currentInvoice.updater_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated By</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.updater_id}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentInvoice.updated_at).toLocaleString()}
              </dd>
            </div>
            {currentInvoice.payment_method && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.payment_method}</dd>
              </div>
            )}
            {currentInvoice.paid_at && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Paid At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(currentInvoice.paid_at).toLocaleString()}
                </dd>
              </div>
            )}
            {currentInvoice.branch_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Branch ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{currentInvoice.branch_id}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Line Items */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInvoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${calculateItemTotal(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${Number(currentInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${Number(currentInvoice.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-gray-900">-${Number(currentInvoice.discount_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${Number(currentInvoice.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {currentInvoice.notes && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentInvoice.notes}</p>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && currentInvoice && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Invoice Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Status: <span className="font-semibold capitalize">{currentInvoice.status}</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                    {getValidInvoiceStatusTransitions(currentInvoice.status).length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No valid status transitions available. Invoice is in final status.
                      </p>
                    ) : (
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as InvoiceStatus)}
                        className="mt-1 input-field"
                      >
                        <option value="">Select status</option>
                        {getValidInvoiceStatusTransitions(currentInvoice.status).map((status) => (
                          <option key={status} value={status}>
                            {capitalizeFirstLetter(status)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {newStatus === InvoiceStatus.PAID && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 input-field"
                        placeholder="e.g., Credit Card, Cash, Bank Transfer"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Payment method is required when marking invoice as paid
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleStatusUpdate}
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                  isLoading={isLoading}
                  disabled={!newStatus || (newStatus === InvoiceStatus.PAID && !paymentMethod)}
                >
                  Update
                </Button>
                <Button
                  onClick={handleCloseModal}
                  variant="secondary"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
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
