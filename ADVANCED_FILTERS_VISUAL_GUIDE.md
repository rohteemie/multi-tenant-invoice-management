# Advanced Invoice Filters - Visual Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (InvoiceListPage.tsx)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────── Basic Filters ────────────────┐             │
│  │ Status │ Customer Name │ Invoice Number      │             │
│  └─────────────────────────────────────────────────┘             │
│                                                                 │
│  ┌──────────── Advanced Filters (Expandable) ──────────┐       │
│  │ Start Date │ End Date │ Min Amount │ Max Amount   │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
│  [Apply Filters]  [Clear Filters]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ fetchInvoices(params)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Store Layer                               │
│                   (invoiceStore.ts)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  InvoiceQueryParams {                                          │
│    status?: string                    ✅ Existing              │
│    customer_name?: string            ✅ Existing              │
│    invoice_number?: string           🆕 NEW                    │
│    branch_id?: string                ✅ Existing              │
│    start_date?: string               🆕 NEW (ISO 8601)         │
│    end_date?: string                 🆕 NEW (ISO 8601)         │
│    min_amount?: number               🆕 NEW                    │
│    max_amount?: number               🆕 NEW                    │
│    skip?: number                     ✅ Existing              │
│    limit?: number                    ✅ Existing              │
│  }                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ invoiceService.getAll(params)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                              │
│                  (invoiceService.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  async getAll(params?: InvoiceQueryParams)                     │
│    → GET /api/v1/invoices/                                     │
│      ?status=paid                                              │
│      &customer_name=Acme                                       │
│      &invoice_number=INV-001                                   │
│      &start_date=2024-01-01T00:00:00.000Z                     │
│      &end_date=2024-01-31T23:59:59.999Z                       │
│      &min_amount=100                                           │
│      &max_amount=500                                           │
│                                                                 │
│  async exportInvoices(format, params?)                         │
│    → GET /api/v1/invoices/export/invoices                     │
│      (Same parameters + format)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP GET with query params
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                │
│         (multi-tenant-saas-backend)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GET /api/v1/invoices/                                         │
│    • Filters invoices based on query parameters                │
│    • Returns matching invoices array                           │
│    • Supports partial matching on text fields                  │
│    • Supports range filtering on dates and amounts             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### User Action: Filter Paid Invoices in January 2024 Between $100-$500

```
1. User Input (UI)
   ┌──────────────────────────────────────┐
   │ Status: "paid"                       │
   │ Start Date: 2024-01-01              │
   │ End Date: 2024-01-31                │
   │ Min Amount: 100                     │
   │ Max Amount: 500                     │
   │ [Apply Filters] ← Click             │
   └──────────────────────────────────────┘
                    │
                    ▼
2. State Conversion (Component)
   {
     status: "paid",
     start_date: "2024-01-01T00:00:00.000Z",
     end_date: "2024-01-31T23:59:59.999Z",
     min_amount: 100,
     max_amount: 500
   }
                    │
                    ▼
3. Store Action (invoiceStore)
   fetchInvoices(params) → invoiceService.getAll(params)
                    │
                    ▼
4. API Call (invoiceService)
   GET /api/v1/invoices/?status=paid&start_date=2024-01-01T00:00:00.000Z
                         &end_date=2024-01-31T23:59:59.999Z
                         &min_amount=100&max_amount=500
                    │
                    ▼
5. Backend Processing
   • Filter by status = "paid"
   • Filter by created_at >= 2024-01-01
   • Filter by created_at <= 2024-01-31
   • Filter by total_amount >= 100
   • Filter by total_amount <= 500
                    │
                    ▼
6. Response
   [
     { id: "1", invoice_number: "INV-001", status: "paid", 
       total_amount: 250, created_at: "2024-01-15", ... },
     { id: "2", invoice_number: "INV-002", status: "paid", 
       total_amount: 450, created_at: "2024-01-20", ... }
   ]
                    │
                    ▼
7. UI Update
   Display filtered invoices in table
```

## UI State Diagram

```
┌─────────────────────────────────────────┐
│   Initial State: All Filters Empty     │
│   ┌─────────────────────────────────┐   │
│   │ Status: All                     │   │
│   │ Customer: ""                    │   │
│   │ Invoice #: ""                   │   │
│   │ [+ Show Advanced Filters]       │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  │ Click "Show Advanced Filters"
                  ▼
┌─────────────────────────────────────────┐
│   Advanced Filters Visible              │
│   ┌─────────────────────────────────┐   │
│   │ Status: All                     │   │
│   │ Customer: ""                    │   │
│   │ Invoice #: ""                   │   │
│   │ [− Hide Advanced Filters]       │   │
│   │ ┌───────────────────────────┐   │   │
│   │ │ Start Date: [Date Picker] │   │   │
│   │ │ End Date: [Date Picker]   │   │   │
│   │ │ Min Amount: [Number]      │   │   │
│   │ │ Max Amount: [Number]      │   │   │
│   │ └───────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
                  │ Set filters and click "Apply Filters"
                  ▼
┌─────────────────────────────────────────┐
│   Filters Applied                       │
│   ┌─────────────────────────────────┐   │
│   │ Status: paid                    │   │
│   │ Customer: "Acme"                │   │
│   │ Invoice #: "INV"                │   │
│   │ [− Hide Advanced Filters]       │   │
│   │ ┌───────────────────────────┐   │   │
│   │ │ Start: 2024-01-01         │   │   │
│   │ │ End: 2024-01-31           │   │   │
│   │ │ Min: 100                  │   │   │
│   │ │ Max: 500                  │   │   │
│   │ └───────────────────────────┘   │   │
│   │ [Apply] [Clear Filters]         │   │
│   └─────────────────────────────────┘   │
│   ↓ Loading...                          │
│   [Filtered Invoice List]               │
└─────────────────────────────────────────┘
                  │
                  │ Click "Clear Filters"
                  ▼
      Return to Initial State
```

## Filter Combination Matrix

| Filter Combination | Use Case | Example |
|-------------------|----------|---------|
| Status only | View all invoices of a type | All paid invoices |
| Customer + Status | Track specific customer | Acme Corp's paid invoices |
| Date Range only | Monthly reports | All invoices in January |
| Amount Range only | High-value invoices | Invoices > $1000 |
| Date + Amount | Period financial reports | Q1 invoices between $100-$500 |
| All filters | Precise search | Paid Acme invoices in Jan $100-$500 |

## Component Structure

```
InvoiceListPage
├── Header Section
│   ├── Title
│   └── Action Buttons
│       ├── Export CSV (with filters)
│       ├── Export JSON (with filters)
│       └── Create Invoice
│
├── Error Display (conditional)
│
├── Filters Card
│   ├── Basic Filters Row
│   │   ├── Status Dropdown
│   │   ├── Customer Name Input
│   │   └── Invoice Number Input (NEW)
│   │
│   ├── Advanced Toggle Button (NEW)
│   │
│   ├── Advanced Filters Section (collapsible, NEW)
│   │   ├── Start Date Picker
│   │   ├── End Date Picker
│   │   ├── Min Amount Input
│   │   └── Max Amount Input
│   │
│   └── Action Buttons
│       ├── Apply Filters
│       └── Clear Filters (NEW)
│
└── Invoice Table
    ├── Table Header
    └── Table Body (filtered results)
```

## Key Features

### 1. Progressive Disclosure
- Basic filters always visible
- Advanced filters hidden by default
- Toggle to show/hide advanced section

### 2. Flexible Filtering
- All filters optional
- Filters can be combined
- Partial matching on text fields
- Range filtering on dates and amounts

### 3. User Experience
- Clear visual hierarchy
- Responsive layout
- One-click clear all filters
- Loading states during fetch
- Error handling

### 4. Export Integration
- Exports respect active filters
- Same parameters for CSV and JSON
- Consistent behavior across features

---

**Created:** January 5, 2026  
**Version:** 1.0.0
