# Frontend-Backend Alignment Issue

## Overview

This document outlines the discrepancies identified between the frontend (multi-tenant-invoice-management) and backend (invoice-manager-saas-backend) repositories, along with required fixtures and development tasks to achieve full alignment.

**Analysis Date:** 2026-01-04  
**Backend Repository:** [rohteemie/invoice-manager-saas-backend](https://github.com/rohteemie/invoice-manager-saas-backend)  
**Frontend Repository:** [rohteemie/multi-tenant-invoice-management](https://github.com/rohteemie/multi-tenant-invoice-management)

---

## 1. Invoice Search Filters Enhancement

### Backend Implementation (Current)
The backend now supports advanced invoice search filters:

```python
@router.get("/", response_model=PaginatedResponse[Invoice])
def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[InvoiceStatus] = Query(None, description="Filter by status"),
    customer_name: Optional[str] = Query(None, max_length=100, description="Search by customer name (partial, case-insensitive)"),
    invoice_number: Optional[str] = Query(None, max_length=50, description="Search by invoice number (partial, case-insensitive)"),
    start_date: Optional[str] = Query(None, description="Filter invoices created on or after (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="Filter invoices created on or before (ISO 8601)"),
    min_amount: Optional[Decimal] = Query(None, ge=0, description="Minimum total amount filter"),
    max_amount: Optional[Decimal] = Query(None, ge=0, description="Maximum total amount filter"),
    ...
)
```

### Frontend Implementation (Current)
The frontend invoiceService only supports basic filters:

```typescript
// src/services/invoiceService.ts
async getAll(params?: {
  status?: string;
  customer_name?: string;
  branch_id?: string;
  skip?: number;
  limit?: number;
}): Promise<Invoice[]>
```

### Required Fixtures

#### Task 1.1: Update Invoice Service Interface
**File:** `src/services/invoiceService.ts`

```typescript
// Update the getAll method parameters
async getAll(params?: {
  status?: string;
  customer_name?: string;
  invoice_number?: string;      // NEW
  branch_id?: string;
  start_date?: string;          // NEW - ISO 8601 format
  end_date?: string;            // NEW - ISO 8601 format
  min_amount?: number;          // NEW
  max_amount?: number;          // NEW
  skip?: number;
  limit?: number;
}): Promise<Invoice[]>
```

#### Task 1.2: Update Invoice List/Search UI
**Files to modify:**
- `src/pages/InvoicesPage.tsx` (or similar)
- `src/components/invoice/InvoiceFilters.tsx` (create if not exists)

**UI Requirements:**
- Add search input for invoice number
- Add date range picker for start_date and end_date
- Add amount range inputs (min/max)
- Update the invoice list to use these new filters

#### Task 1.3: Create Invoice Filter Types
**File:** `src/types/invoice.ts`

```typescript
export interface InvoiceFilter {
  status?: InvoiceStatus;
  customer_name?: string;
  invoice_number?: string;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  skip?: number;
  limit?: number;
}
```

---

## 2. Tenant Model Enhancements

### Backend Implementation (Current)
The backend Tenant model now includes invoice number configuration and PDF customization:

```python
# app/models/tenant.py
class Tenant(Gen_Model, Base):
    # ... existing fields ...
    invoice_number_prefix = Column(String(20), default="INV", nullable=False)
    invoice_number_format = Column(String(100), default="{prefix}-{date}-{sequence:04d}", nullable=False)
    invoice_number_sequence = Column(Integer, default=0, nullable=False)
    # PDF Customization
    primary_color = Column(String(7), default="#2563eb", nullable=False)
    secondary_color = Column(String(7), default="#1e40af", nullable=False)
    custom_footer = Column(Text, nullable=True)
    draft_watermark_enabled = Column(Boolean, default=True, nullable=False)
```

### Frontend Implementation (Current)
The frontend Tenant type is missing several fields:

```typescript
// src/types/tenant.ts (current)
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  plan_type: string;
  is_active: boolean;
  default_currency: Currency;
  tax_rate?: number;
  tax_label?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}
```

### Required Fixtures

#### Task 2.1: Update Tenant Type Definition
**File:** `src/types/tenant.ts`

```typescript
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  plan_type: string;
  is_active: boolean;
  default_currency: Currency;
  tax_rate?: number;
  tax_label?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  // Invoice Number Configuration - NEW
  invoice_number_prefix?: string;
  invoice_number_format?: string;
  invoice_number_sequence?: number;
  // PDF Customization - NEW
  primary_color?: string;
  secondary_color?: string;
  custom_footer?: string;
  draft_watermark_enabled?: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Task 2.2: Update TenantCreate and TenantRegister Types
**File:** `src/types/tenant.ts`

```typescript
export interface TenantCreate {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
  default_currency?: Currency;
  tax_rate?: number;
  tax_label?: string;
  address?: string;
  phone?: string;
  email?: string;
  // Invoice Number Configuration - NEW
  invoice_number_prefix?: string;
  invoice_number_format?: string;
  // PDF Customization - NEW
  primary_color?: string;
  secondary_color?: string;
  custom_footer?: string;
  draft_watermark_enabled?: boolean;
}
```

#### Task 2.3: Create Tenant Settings UI for PDF Customization
**Files to create:**
- `src/components/tenant/TenantBrandingSettings.tsx`
- `src/components/tenant/InvoiceNumberConfig.tsx`

**UI Requirements:**
- Color pickers for primary_color and secondary_color
- Text input for custom_footer (max 500 chars)
- Toggle for draft_watermark_enabled
- Input for invoice_number_prefix (max 20 chars)
- Input for invoice_number_format with validation
- Preview of generated invoice number format

---

## 3. Analytics Schema Updates

### Backend Implementation (Current)
The backend analytics endpoints now return currency information:

```python
# app/schemas/analytics.py
class InvoiceSummary(BaseModel):
    total_invoices: int
    draft_count: int
    sent_count: int
    paid_count: int
    overdue_count: int
    total_revenue: Decimal
    pending_amount: Decimal
    overdue_amount: Decimal
    currency: str  # NEW - User's preferred currency

class RevenueByStatus(BaseModel):
    status: str
    count: int
    total_amount: Decimal
    currency: str  # NEW - User's preferred currency
```

### Frontend Implementation (Current)

```typescript
// src/types/analytics.ts (current)
export interface InvoiceSummary {
  total_invoices: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
  total_revenue: string | number;
  pending_amount: string | number;
  overdue_amount: string | number;
}

export interface RevenueByStatus {
  status: string;
  count: number;
  total_amount: string | number;
}
```

### Required Fixtures

#### Task 3.1: Update Analytics Types
**File:** `src/types/analytics.ts`

```typescript
export interface InvoiceSummary {
  total_invoices: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
  total_revenue: string | number;
  pending_amount: string | number;
  overdue_amount: string | number;
  currency: string;  // NEW - User's preferred currency
}

export interface RevenueByStatus {
  status: string;
  count: number;
  total_amount: string | number;
  currency: string;  // NEW - User's preferred currency
}
```

#### Task 3.2: Update Dashboard to Display Currency
**Files to modify:**
- `src/pages/DashboardPage.tsx` (or similar)
- `src/components/dashboard/SummaryCard.tsx` (or similar)

**UI Requirements:**
- Display amounts with correct currency symbol based on the `currency` field
- Show user's preferred currency in analytics cards

---

## 4. Audit Log Enhancements

### Backend Implementation (Current)
The backend has additional audit actions:

```python
# app/models/audit_log.py
class AuditAction(str, enum.Enum):
    # ... existing actions ...
    LOGIN_THROTTLED = "login_throttled"          # NEW
    LOGIN_EXCESSIVE_FAILURES = "login_excessive_failures"  # NEW
```

### Frontend Implementation (Current)

```typescript
// src/types/auditLog.ts (current - missing new actions)
export const AuditAction = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  TOKEN_REFRESH: 'token_refresh',
  // ... other actions
} as const;
```

### Required Fixtures

#### Task 4.1: Update Audit Action Types
**File:** `src/types/auditLog.ts`

```typescript
export const AuditAction = {
  // Authentication events
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  LOGIN_THROTTLED: 'login_throttled',              // NEW
  LOGIN_EXCESSIVE_FAILURES: 'login_excessive_failures',  // NEW
  TOKEN_REFRESH: 'token_refresh',
  // ... rest of actions
} as const;
```

#### Task 4.2: Update Audit Log Display
**Files to modify:**
- `src/components/audit/AuditLogTable.tsx` (or similar)

**UI Requirements:**
- Add display labels for new audit actions
- Potentially add filtering by the new action types

---

## 5. Paginated Response Support

### Backend Implementation (Current)
The backend returns paginated responses for invoice lists:

```python
# app/schemas/pagination.py
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_previous: bool
```

### Frontend Implementation (Current)
The frontend invoiceService returns a simple array without pagination metadata.

### Required Fixtures

#### Task 5.1: Create Paginated Response Type
**File:** `src/types/pagination.ts` (create new file)

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}
```

#### Task 5.2: Update Invoice Service
**File:** `src/services/invoiceService.ts`

```typescript
import type { PaginatedResponse } from '../types/pagination';

async getAll(params?: InvoiceFilter): Promise<PaginatedResponse<Invoice>> {
  const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices/', { params });
  return response.data;
}
```

#### Task 5.3: Update Invoice List UI with Pagination
**Files to modify:**
- `src/pages/InvoicesPage.tsx`
- Create `src/components/common/Pagination.tsx`

**UI Requirements:**
- Display pagination controls (page numbers, next/previous)
- Show total items count
- Allow changing page size
- Handle navigation between pages

---

## 6. Export Functionality Enhancement

### Backend Implementation (Current)
Export endpoint supports date filtering (full path: `/api/v1/invoices/export/invoices`):

```python
# app/api/v1/endpoints/invoices.py - mounted at /invoices
@router.get("/export/invoices")
def export_invoices(
    format: str = Query("csv", pattern="^(csv|json)$"),
    status: Optional[InvoiceStatus] = Query(None),
    start_date: Optional[str] = Query(None, description="Start date filter (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date filter (ISO 8601)"),
    ...
)
```

### Frontend Implementation (Current)
The frontend export service doesn't support date filtering.

### Required Fixtures

#### Task 6.1: Update Export Service
**File:** `src/services/invoiceService.ts`

```typescript
async exportInvoices(format: 'csv' | 'json', params?: {
  status?: string;
  customer_name?: string;
  branch_id?: string;
  start_date?: string;   // NEW
  end_date?: string;     // NEW
}): Promise<Blob>
```

#### Task 6.2: Update Export UI
**Files to modify:**
- Export dialog/modal component

**UI Requirements:**
- Add date range selection for exports
- Preview of export parameters before download

---

## 7. Test Updates Required

### Task 7.1: Update Type Tests
**Files to modify:**
- `src/test/*.test.ts` - Update all tests that use Tenant, Invoice, or Analytics types

### Task 7.2: Update Mock Data
All mock data in tests should include new fields:
- Tenant mocks: add `invoice_number_prefix`, `primary_color`, etc.
- Analytics mocks: add `currency` field

### Task 7.3: Add New Integration Tests
- Test invoice filtering with new parameters
- Test pagination handling
- Test export with date filters

---

## Implementation Priority

### Phase 1: Critical Alignment (High Priority)
1. [ ] Task 1.1-1.3: Invoice Search Filters
2. [ ] Task 3.1-3.2: Analytics Currency Support
3. [ ] Task 5.1-5.3: Paginated Response Support

### Phase 2: Feature Enhancement (Medium Priority)
1. [ ] Task 2.1-2.3: Tenant Model Updates and UI
2. [ ] Task 6.1-6.2: Export Date Filtering

### Phase 3: Cleanup (Lower Priority)
1. [ ] Task 4.1-4.2: Audit Log Updates
2. [ ] Task 7.1-7.3: Test Updates

---

## Breaking Changes Considerations

### API Response Changes
The invoice list endpoint now returns `PaginatedResponse<Invoice>` instead of `Invoice[]`. This requires frontend changes to handle the new response structure.

### Type Changes
Adding new required fields to types may cause TypeScript compilation errors in existing code. Recommend:
1. Make new fields optional initially
2. Gradually make them required as backend ensures all responses include them

---

## Estimated Development Effort

| Task Group | Estimated Hours |
|------------|-----------------|
| Invoice Search Filters | 4-6 hours |
| Tenant Model Updates | 6-8 hours |
| Analytics Updates | 2-3 hours |
| Audit Log Updates | 1-2 hours |
| Pagination Support | 4-6 hours |
| Export Enhancement | 2-3 hours |
| Test Updates | 4-6 hours |
| **Total** | **23-34 hours** |

---

## References

### Backend Files
- `app/schemas/invoice.py` - Invoice schema definitions
- `app/schemas/tenant.py` - Tenant schema definitions
- `app/schemas/analytics.py` - Analytics schema definitions
- `app/schemas/pagination.py` - Pagination schema
- `app/models/audit_log.py` - Audit log model
- `app/api/v1/endpoints/invoices.py` - Invoice API endpoints
- `app/api/v1/endpoints/analytics.py` - Analytics API endpoints

### Frontend Files
- `src/types/invoice.ts` - Invoice type definitions
- `src/types/tenant.ts` - Tenant type definitions
- `src/types/analytics.ts` - Analytics type definitions
- `src/types/auditLog.ts` - Audit log type definitions
- `src/services/invoiceService.ts` - Invoice service
- `src/services/analyticsService.ts` - Analytics service

### Documentation
- `BACKEND_FRONTEND_ALIGNMENT.md` - Previous alignment document
- `BACKEND_PARITY.md` - PDF generation refactoring documentation

---

## Conclusion

This issue documents all identified discrepancies between the frontend and backend implementations. The backend has evolved with new features (invoice search filters, PDF customization, invoice number configuration) that the frontend needs to support.

**Recommended next steps:**
1. Create separate GitHub issues for each task group
2. Prioritize Phase 1 tasks for immediate development
3. Update frontend tests alongside feature development
4. Conduct thorough testing after each phase completion
