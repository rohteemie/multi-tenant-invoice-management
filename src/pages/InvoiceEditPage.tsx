import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInvoiceStore } from '../store';
import { Button, ErrorMessage, Loading } from '../components/common';
import type { InvoiceItemCreate } from '../types';
import { InvoiceStatus } from '../types';

export const InvoiceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentInvoice, isLoading, error, setError, fetchInvoiceById, updateInvoice } = useInvoiceStore();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    branch_id: '',
    issue_date: '',
    due_date: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItemCreate[]>([
    { description: '', quantity: 1, unit_price: 0 },
  ]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentInvoice && !isInitialized) {
      // Check if invoice is DRAFT
      if (currentInvoice.status !== InvoiceStatus.DRAFT) {
        setError('Only DRAFT invoices can be edited');
        return;
      }

      setFormData({
        customer_name: currentInvoice.customer_name,
        customer_email: currentInvoice.customer_email || '',
        customer_phone: currentInvoice.customer_phone || '',
        customer_address: currentInvoice.customer_address || '',
        branch_id: currentInvoice.branch_id || '',
        issue_date: currentInvoice.issue_date,
        due_date: currentInvoice.due_date || '',
        notes: currentInvoice.notes || '',
      });

      if (currentInvoice.items && currentInvoice.items.length > 0) {
        setItems(
          currentInvoice.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          }))
        );
      }

      setIsInitialized(true);
    }
  }, [currentInvoice, isInitialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemCreate, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'description' ? value : Number(value),
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) return;

    if (items.some((item) => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
      setError('Please fill in all item details correctly');
      return;
    }

    try {
      await updateInvoice(id, {
        ...formData,
        items,
      });
      navigate(`/invoices/${id}`);
    } catch {
      // Error is handled in store
    }
  };

  if (isLoading && !currentInvoice) {
    return <Loading size="lg" text="Loading invoice..." />;
  }

  if (error && !currentInvoice) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} />
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!currentInvoice) {
    return <div>Invoice not found</div>;
  }

  if (currentInvoice.status !== InvoiceStatus.DRAFT) {
    return (
      <div className="space-y-6">
        <ErrorMessage message="Only DRAFT invoices can be edited" />
        <Button variant="secondary" onClick={() => navigate(`/invoices/${id}`)}>
          Back to Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Invoice {currentInvoice.invoice_number}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Customer Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                Customer Name *
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                required
                value={formData.customer_name}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div>
              <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div>
              <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="customer_phone"
                name="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div>
              <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">
                Branch ID
              </label>
              <input
                id="branch_id"
                name="branch_id"
                type="text"
                value={formData.branch_id}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="customer_address"
                name="customer_address"
                rows={2}
                value={formData.customer_address}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700">
                Issue Date *
              </label>
              <input
                id="issue_date"
                name="issue_date"
                type="date"
                required
                value={formData.issue_date}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 input-field"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="mt-1 input-field"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="mt-1 input-field"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="mt-1 input-field"
                  />
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total
                  </label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/invoices/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Update Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};
