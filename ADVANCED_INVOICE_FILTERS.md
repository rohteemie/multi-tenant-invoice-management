# Advanced Invoice Search & Filter Feature

## Overview
The frontend now supports comprehensive invoice filtering capabilities that match the backend API, enabling users to search and filter invoices using multiple criteria simultaneously.

## Features Added

### Basic Filters (Always Visible)
1. **Status Filter** - Filter by invoice status
   - All, Draft, Sent, Paid, Overdue

2. **Customer Name Search** - Partial, case-insensitive search
   - Searches for customer names containing the input text

3. **Invoice Number Search** - Partial, case-insensitive search
   - Searches for invoice numbers containing the input text

### Advanced Filters (Collapsible)
4. **Date Range Filter**
   - **Start Date** - Filter invoices created on or after this date
   - **End Date** - Filter invoices created on or before this date
   - Uses ISO 8601 format for API communication
   - User-friendly date picker UI

5. **Amount Range Filter**
   - **Min Amount** - Filter invoices with total amount greater than or equal to this value
   - **Max Amount** - Filter invoices with total amount less than or equal to this value
   - Supports decimal values (e.g., 100.50)

## Implementation Details

### Backend API Alignment
All filter parameters are now aligned with the backend API specification:

| Parameter | Type | Description | Format |
|-----------|------|-------------|--------|
| `status` | string | Invoice status | draft, sent, paid, overdue |
| `customer_name` | string | Customer name (partial match) | Case-insensitive |
| `invoice_number` | string | Invoice number (partial match) | Case-insensitive |
| `start_date` | string | Created on or after | ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) |
| `end_date` | string | Created on or before | ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) |
| `min_amount` | number | Minimum total amount | Decimal |
| `max_amount` | number | Maximum total amount | Decimal |
| `branch_id` | string | Branch identifier | UUID |
| `skip` | number | Pagination offset | Integer |
| `limit` | number | Pagination limit | Integer |

### Files Modified

#### 1. Service Layer
**File:** `src/services/invoiceService.ts`
- Updated `getAll()` method to accept new filter parameters
- Updated `exportInvoices()` method to accept new filter parameters

#### 2. Store Layer
**File:** `src/store/invoiceStore.ts`
- Updated `InvoiceQueryParams` interface with new fields
- Updated `InvoiceExportParams` interface with new fields

#### 3. UI Layer
**File:** `src/pages/InvoiceListPage.tsx`
- Added state management for all filter fields
- Implemented collapsible advanced filters section
- Added "Clear Filters" button
- Updated filter application logic
- Updated export functionality to include all active filters

### User Interface

#### Basic Filters Section
```
┌─────────────────────────────────────────────────────────┐
│ Status         │ Customer Name    │ Invoice Number     │
│ [Dropdown ▼]   │ [Text Input]     │ [Text Input]       │
└─────────────────────────────────────────────────────────┘
```

#### Advanced Filters Section (Expandable)
```
┌─────────────────────────────────────────────────────────┐
│ [+ Show Advanced Filters]                               │
├─────────────────────────────────────────────────────────┤
│ Start Date     │ End Date        │ Min Amount │ Max Am. │
│ [Date Picker]  │ [Date Picker]   │ [Number]   │ [Number]│
└─────────────────────────────────────────────────────────┘
```

#### Action Buttons
```
┌─────────────────────────────────────┐
│ [Apply Filters] [Clear Filters]    │
└─────────────────────────────────────┘
```

## Usage Examples

### Example 1: Filter by Date Range
To find all invoices created in January 2024:
1. Click "Show Advanced Filters"
2. Set Start Date: 2024-01-01
3. Set End Date: 2024-01-31
4. Click "Apply Filters"

### Example 2: Filter by Amount Range
To find invoices between $100 and $500:
1. Click "Show Advanced Filters"
2. Set Min Amount: 100
3. Set Max Amount: 500
4. Click "Apply Filters"

### Example 3: Combined Filters
To find paid invoices for a specific customer in a date range:
1. Set Status: Paid
2. Set Customer Name: "Acme Corp"
3. Click "Show Advanced Filters"
4. Set Start Date: 2024-01-01
5. Set End Date: 2024-03-31
6. Click "Apply Filters"

### Example 4: Export with Filters
All active filters are automatically included when exporting:
1. Apply desired filters
2. Click "Export CSV" or "Export JSON"
3. The exported file will only include filtered invoices

## Testing

### Test Coverage
A comprehensive test suite was added in `src/test/invoice.filters.test.ts` with 8 tests covering:

1. ✅ Filter by invoice_number
2. ✅ Filter by date range (start_date, end_date)
3. ✅ Filter by amount range (min_amount, max_amount)
4. ✅ Combined filters (all parameters together)
5. ✅ Export with invoice_number filter
6. ✅ Export with date range filters
7. ✅ Export with amount range filters
8. ✅ Error handling with advanced filters

### Running Tests
```bash
# Run all tests
npm run test

# Run only filter tests
npm run test -- src/test/invoice.filters.test.ts

# Run with coverage
npm run test:coverage
```

## Technical Notes

### Date Handling
- **User Input:** HTML date picker uses YYYY-MM-DD format
- **State Storage:** Dates are stored as ISO 8601 strings
- **API Communication:** Dates are sent as ISO 8601 strings
- **Conversion:** Automatic conversion between formats ensures proper display and API compatibility

### Number Handling
- Amount inputs accept decimal values
- Empty strings are converted to `undefined` (not sent to API)
- Values are validated as numbers before sending to API

### Filter State Management
- All filters are optional
- Empty values are not sent to the API
- Filters persist during the page session
- "Clear Filters" button resets all filter fields

## Backend Reference
For backend implementation details, see:
- Backend Repository: https://github.com/rohteemie/multi-tenant-saas-backend
- API Endpoint: `GET /api/v1/invoices/`
- Query Parameters: All filters listed above

## Future Enhancements
Potential improvements for future versions:
1. **Saved Filters** - Save commonly used filter combinations
2. **Filter Presets** - Quick access to common filters (e.g., "This Month", "Last Quarter")
3. **URL Query Parameters** - Shareable filter URLs
4. **Filter Count Badge** - Show number of active filters
5. **Auto-Apply** - Apply filters as user types (with debouncing)
6. **Multi-Status Selection** - Select multiple statuses at once

## Security
✅ All inputs are properly validated
✅ XSS protection through React's built-in escaping
✅ No SQL injection risk (filters sent as query parameters)
✅ CodeQL security scan passed with 0 alerts

## Accessibility
- All filter inputs have proper labels
- Keyboard navigation supported
- Screen reader friendly
- Semantic HTML structure
- Clear visual feedback for active filters

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Date pickers use native HTML5 input type="date"
- Fallback for browsers without date picker support

---

**Last Updated:** January 5, 2026  
**Version:** 1.0.0  
**Author:** Copilot (GitHub Copilot for Pull Requests)
