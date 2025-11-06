import React from 'react';
import type { Invoice } from '../../types';

interface InvoicePrintTemplateProps {
  invoice: Invoice;
  companyName?: string;
  companyAddress?: string;
}

/**
 * Printable invoice template component
 * This component renders an invoice in a print-friendly format
 * Includes @media print styles to hide interactive elements
 */
export const InvoicePrintTemplate = React.forwardRef<HTMLDivElement, InvoicePrintTemplateProps>(
  ({ invoice, companyName = 'Your Company', companyAddress }, ref) => {
    const calculateItemTotal = (item: { quantity: number | string; unit_price: number | string; total_price?: number | string }): string => {
      if (item.total_price) {
        return Number(item.total_price).toFixed(2);
      }
      return (Number(item.quantity) * Number(item.unit_price)).toFixed(2);
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'draft':
          return 'bg-gray-100 text-gray-800';
        case 'sent':
          return 'bg-blue-100 text-blue-800';
        case 'paid':
          return 'bg-green-100 text-green-800';
        case 'overdue':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div ref={ref} className="invoice-print-template bg-white p-8" style={{ minHeight: '100vh' }}>
        {/* Print-specific styles */}
        <style>{`
          @media print {
            .invoice-print-template {
              padding: 0 !important;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
          
          @media screen {
            .invoice-print-template {
              max-width: 8.5in;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          }
        `}</style>

        {/* Invoice Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-xl text-gray-700">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Company and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* From (Company) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">From</h3>
            <div className="text-gray-900">
              <p className="font-semibold text-lg">{companyName}</p>
              {companyAddress && <p className="text-sm mt-1">{companyAddress}</p>}
            </div>
          </div>

          {/* To (Customer) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
            <div className="text-gray-900">
              <p className="font-semibold text-lg">{invoice.customer_name}</p>
              {invoice.customer_email && <p className="text-sm">{invoice.customer_email}</p>}
              {invoice.customer_phone && <p className="text-sm">{invoice.customer_phone}</p>}
              {invoice.customer_address && <p className="text-sm mt-1">{invoice.customer_address}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-200">
          <div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Issue Date:</span>
              <span className="ml-2 text-sm text-gray-900">{new Date(invoice.issue_date).toLocaleDateString()}</span>
            </div>
            {invoice.due_date && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <span className="ml-2 text-sm text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {invoice.payment_method && (
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                <span className="ml-2 text-sm text-gray-900">{invoice.payment_method}</span>
              </div>
              {invoice.paid_at && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">Paid At:</span>
                  <span className="ml-2 text-sm text-gray-900">{new Date(invoice.paid_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">${calculateItemTotal(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-medium">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900 font-medium">${Number(invoice.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-gray-900 font-medium">-${Number(invoice.discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300 mt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${Number(invoice.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';
