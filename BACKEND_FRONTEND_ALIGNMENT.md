# Backend-Frontend Data Model Alignment

## Overview

This document describes the changes made to align the frontend TypeScript types and data models with the backend Python schemas, ensuring complete parity between backend API contracts and frontend data structures.

## Problem Statement

After analyzing the backend repository (`multi-tenant-saas-backend`), several discrepancies were identified between the backend schemas and frontend types:

1. **Invoice Model**: Frontend had additional fields not supported by backend
2. **Currency Support**: Frontend supported 7 currencies while backend only supports 4
3. **Payment Methods**: Frontend used string types instead of backend enum
4. **User Model**: Missing `currency_preference` field from backend
5. **Tenant Model**: Tax configuration structure didn't match backend

## Changes Made

### 1. Invoice Model Alignment

#### Removed Frontend-Only Fields
- **`customer_vat_number`**: Not supported by backend API
- **`updater_id`**: Not part of backend Invoice model
- **`tax_rate` per item**: Backend doesn't support per-item tax rates
- **`tax_amount` per item**: Backend doesn't calculate per-item taxes

#### Currency Enum Alignment
**Before:**
```typescript
type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'AUD';
```

**After:**
```typescript
export const Currency = {
  NGN: 'NGN', // Nigerian Naira
  USD: 'USD', // US Dollar
  GBP: 'GBP', // British Pound
  EUR: 'EUR'  // Euro
} as const;

export type Currency = typeof Currency[keyof typeof Currency];
```

#### PaymentMethod Enum Addition
**Added:**
```typescript
export const PaymentMethod = {
  TRANSFER: 'transfer',
  CASH: 'cash',
  POS: 'pos',
  CHEQUE: 'cheque',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  OTHER: 'other'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
```

**Updated Interface:**
```typescript
export interface Invoice {
  // ... other fields
  currency: Currency; // Now required, not optional
  payment_method?: PaymentMethod; // Now uses enum instead of string
  // Removed: customer_vat_number, updater_id
}
```

### 2. User Model Alignment

**Added:**
```typescript
export interface User {
  // ... existing fields
  currency_preference: string; // User's preferred currency (NGN, USD, GBP, EUR)
  // Note: Cannot be changed once set, per backend business logic
}
```

**Updated UserCreate:**
```typescript
export interface UserCreate {
  // ... existing fields
  currency_preference?: string; // Optional on create, defaults to NGN
}
```

### 3. Tenant Model Alignment

#### Tax Configuration Restructuring

**Before:**
```typescript
export interface TenantTaxConfig {
  default_tax_rate?: number;
  tax_rates?: TaxRate[];
  tax_label?: string;
  tax_id?: string;
}

export interface Tenant {
  // ... other fields
  tax_config?: TenantTaxConfig;
}
```

**After:**
```typescript
export interface Tenant {
  // ... other fields
  default_currency: Currency; // Now required
  tax_rate?: number; // Tax/VAT rate as percentage (0-100, null for tax-free)
  tax_label?: string; // Tax label (e.g., "VAT", "GST", "Sales Tax")
}
```

### 4. UI Changes

#### Invoice Forms
- **Removed VAT/Tax Number Field**: Input field removed from create/edit forms
- **Removed Per-Item Tax Fields**: Tax rate input removed from line items
- **Payment Method Dropdown**: Changed from text input to select with enum values

**Payment Method Dropdown:**
```tsx
<select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
  className="mt-1 input-field"
  required
>
  <option value="">Select payment method</option>
  <option value={PaymentMethod.TRANSFER}>Bank Transfer</option>
  <option value={PaymentMethod.CASH}>Cash</option>
  <option value={PaymentMethod.POS}>POS</option>
  <option value={PaymentMethod.CHEQUE}>Cheque</option>
  <option value={PaymentMethod.CARD}>Card</option>
  <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
  <option value={PaymentMethod.OTHER}>Other</option>
</select>
```

#### Currency Selector
- **Removed**: JPY (Japanese Yen), CAD (Canadian Dollar), AUD (Australian Dollar)
- **Kept**: NGN, USD, GBP, EUR
- **Default Changed**: From USD to NGN (Nigerian Naira)

#### Invoice Detail Page
- **Removed Tax Column**: Line item table no longer shows per-item tax
- **Removed VAT Number Display**: Customer VAT number field removed
- **Removed Updater ID**: Last updated by field removed

### 5. Currency Utilities Update

**Before:**
```typescript
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦',
  JPY: '¥', CAD: 'C$', AUD: 'A$',
};
```

**After:**
```typescript
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};
```

### 6. Test Updates

All test files updated to reflect the new data models:

- **Added `currency` field**: All Invoice mocks now include required currency field
- **Added `currency_preference`**: All User mocks include this field
- **Added `default_currency`**: All Tenant mocks include this required field
- **Updated payment methods**: Changed from strings to PaymentMethod enum values
- **Removed unsupported currencies**: Tests now only use NGN, USD, GBP, EUR

**Example:**
```typescript
const mockInvoice: Invoice = {
  id: '1',
  invoice_number: 'INV-001',
  customer_name: 'Test Customer',
  tenant_id: 'tenant-1',
  creator_id: 'user-1',
  currency: 'NGN', // Now required
  status: 'draft',
  // ... rest of fields
  // Removed: customer_vat_number, updater_id
};
```

## Backend Schema Reference

### Invoice Model (Backend)
From `app/models/invoice.py`:
```python
class Currency(str, enum.Enum):
    NGN = "NGN"  # Nigerian Naira
    USD = "USD"  # US Dollar
    GBP = "GBP"  # British Pound
    EUR = "EUR"  # Euro

class PaymentMethod(str, enum.Enum):
    TRANSFER = "transfer"
    CASH = "cash"
    POS = "pos"
    CHEQUE = "cheque"
    CARD = "card"
    MOBILE_MONEY = "mobile_money"
    OTHER = "other"

class Invoice(Gen_Model, Base):
    invoice_number = Column(String(50), nullable=False)
    tenant_id = Column(String(60), ForeignKey("tenants.id"), nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(255), nullable=True)
    currency = Column(Enum(Currency), nullable=False, default=Currency.NGN)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    # ... other fields
    # Note: No customer_vat_number, updater_id, or per-item tax fields
```

### User Model (Backend)
From `app/models/user.py`:
```python
class User(Gen_Model, Base):
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    tenant_id = Column(String(60), ForeignKey("tenants.id"), nullable=False)
    currency_preference = Column(String(3), nullable=False, default="NGN")
    # ... other fields
```

### Tenant Model (Backend)
From `app/models/tenant.py`:
```python
class Tenant(Gen_Model, Base):
    name = Column(String(100), nullable=False)
    default_currency = Column(String(3), default="NGN", nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=True)
    tax_label = Column(String(50), nullable=True)
    # ... other fields
```

## Impact Analysis

### Bundle Size
- **Before**: 384.83 kB (108.84 kB gzipped)
- **After**: 383.65 kB (108.59 kB gzipped)
- **Change**: -1.18 kB (-0.25 kB gzipped) - Slight reduction

### Tests
- **Total Tests**: 159
- **Passing**: 159 (100%)
- **Failed**: 0

### Breaking Changes
These changes are **breaking** for any code that:
1. Uses removed currency codes (JPY, CAD, AUD)
2. References `customer_vat_number` or `updater_id` fields
3. Uses per-item `tax_rate` or `tax_amount`
4. Expects `payment_method` as string instead of enum
5. Treats `currency` as optional on Invoice

### Non-Breaking Changes
These changes are **non-breaking**:
1. Adding `currency_preference` to User (was missing)
2. Flattening Tenant tax config (backend never used nested structure)
3. Making `default_currency` required (backend always provides it)

## Security Considerations

### CodeQL Scan Results
- **JavaScript Alerts**: 0
- **TypeScript Alerts**: 0
- **Status**: ✅ PASSED

### Data Privacy (GDPR/ISO27001)
No changes to data privacy or security posture:
- No new personal data fields added
- No changes to data retention
- No changes to access control
- Removed fields were not storing sensitive data

## Migration Guide

### For Developers

If you have custom code using the old types:

1. **Currency Updates**:
   ```typescript
   // Before
   const currency: Currency = 'JPY';
   
   // After - Use one of: NGN, USD, GBP, EUR
   const currency: Currency = 'NGN';
   ```

2. **Payment Method Updates**:
   ```typescript
   // Before
   const payment: string = 'Credit Card';
   
   // After
   import { PaymentMethod } from './types';
   const payment: PaymentMethod = PaymentMethod.CARD;
   ```

3. **Invoice Type Updates**:
   ```typescript
   // Before
   const invoice: Invoice = {
     customer_vat_number: 'GB123',
     currency: undefined, // Optional
     // ...
   };
   
   // After
   const invoice: Invoice = {
     currency: 'NGN', // Required
     // Removed: customer_vat_number
     // ...
   };
   ```

4. **User Type Updates**:
   ```typescript
   // Before
   const user: User = {
     email: 'user@example.com',
     // ...
   };
   
   // After
   const user: User = {
     email: 'user@example.com',
     currency_preference: 'NGN', // Required
     // ...
   };
   ```

## Documentation Updates

### README.md
- Updated currency list from 7 to 4 currencies
- Added payment method tracking feature
- Removed references to VAT/Tax number collection
- Removed references to per-item tax rates

### Feature Descriptions
Updated in `DashboardLayout.tsx`:
- Multi-Currency Support: Changed from 7 to 4 currencies

## Testing Strategy

### Test Coverage
All 159 tests updated and passing:
- Invoice CRUD operations tests
- User management tests
- Currency utility tests
- Invoice UI tests
- PDF generation tests
- Status transition tests

### Test Updates Made
1. Added required fields to all mock objects
2. Updated currency test expectations
3. Fixed payment method type assertions
4. Updated form interaction tests for select dropdowns

## Conclusion

The frontend now has complete parity with the backend data models:

✅ **Type Safety**: All types match backend schemas exactly
✅ **No Extra Fields**: Removed frontend-only fields
✅ **Correct Enums**: Currency and PaymentMethod match backend
✅ **Required Fields**: All backend-required fields are required in frontend
✅ **Tests Passing**: 100% test pass rate (159/159)
✅ **Build Success**: Clean TypeScript compilation
✅ **Security**: 0 CodeQL alerts

This alignment ensures:
- API requests have correct structure
- Type errors caught at compile time
- No runtime errors from mismatched data
- Easier backend-frontend integration
- Clear contract between frontend and backend
