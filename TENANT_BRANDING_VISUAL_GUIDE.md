# Tenant Branding Features - Visual Guide

## Feature Overview

This document provides a visual description of the new tenant branding features implemented in the frontend.

## 1. Tenant Settings Page - Branding Section

### Logo Upload (No Logo)
```
┌─────────────────────────────────────────────────────────┐
│ Organization Logo                                        │
├─────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════╗  │
│  ║  [Upload Icon]                                     ║  │
│  ║                                                    ║  │
│  ║  [Choose file]  or drag and drop                  ║  │
│  ║                                                    ║  │
│  ║  PNG, JPG, or SVG up to 2MB                       ║  │
│  ╚═══════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────┘
```

### Logo Upload (With Logo)
```
┌─────────────────────────────────────────────────────────┐
│ Organization Logo                                        │
├─────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════╗  │
│  ║                                                    ║  │
│  ║            [Company Logo Image]                   ║  │
│  ║                                                    ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                    [Delete Logo]                         │
└─────────────────────────────────────────────────────────┘
```

### Contact Information Section
```
┌─────────────────────────────────────────────────────────┐
│ Contact Information                                      │
│ This information will appear on your invoices            │
├─────────────────────────────────────────────────────────┤
│  Email                          Phone                    │
│  ┌─────────────────────────┐   ┌─────────────────────┐  │
│  │ contact@company.com     │   │ +1 (555) 123-4567  │  │
│  └─────────────────────────┘   └─────────────────────┘  │
│                                                          │
│  Address                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 123 Main St                                       │   │
│  │ Suite 100                                         │   │
│  │ City, State, ZIP                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tax Settings Section
```
┌─────────────────────────────────────────────────────────┐
│ Tax Settings                                             │
├─────────────────────────────────────────────────────────┤
│  Default Tax Rate               Tax Label                │
│  ┌─────────────────────────┐   ┌─────────────────────┐  │
│  │ 15.00                 % │   │ VAT                 │  │
│  └─────────────────────────┘   └─────────────────────┘  │
│  Tax rate: 15.00%                                        │
└─────────────────────────────────────────────────────────┘
```

## 2. Invoice Detail Page - Branding Display

### Before (No Branding)
```
┌─────────────────────────────────────────────────────────┐
│ Invoice #INV-001                                  [SENT] │
│                                                          │
│ [Download PDF] [Send to Customer] [Update Status]       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Customer Information          Invoice Information        │
│ ...                          ...                        │
└─────────────────────────────────────────────────────────┘
```

### After (With Branding)
```
┌─────────────────────────────────────────────────────────┐
│ Invoice #INV-001                                  [SENT] │
│                                                          │
│ [Download PDF] [Send to Customer] [Update Status]       │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐   │
│ │ From                                              │   │
│ │ ┌────────┐  Acme Corporation                     │   │
│ │ │ [LOGO] │  123 Main Street, Suite 100           │   │
│ │ │        │  New York, NY 10001                   │   │
│ │ └────────┘  +1 (555) 123-4567                    │   │
│ │             contact@acmecorp.com                  │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ Customer Information          Invoice Information        │
│ ...                          ...                        │
└─────────────────────────────────────────────────────────┘
```

### Invoice Totals (With Custom Tax Label)
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                              Subtotal    $1,000.00      │
│                              VAT (15%)   $  150.00      │
│                              Discount    $   50.00      │
│                              ─────────────────────       │
│                              Total       $1,100.00      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 3. Component States

### LogoUpload Component - States

#### Initial/Empty State
- Shows upload area with dashed border
- Upload icon in center
- "Choose file" button
- "or drag and drop" text
- File requirements text

#### Drag Over State
- Border becomes solid blue
- Background light blue
- Indicates drop zone is active

#### Preview State
- Shows uploaded logo
- Delete button below
- No upload area visible

#### Loading State
- Delete button shows spinner
- Button disabled
- Text changes to "Loading..."

#### Error State
- Red error message appears
- Upload area remains visible
- Previous state preserved

### Form Validation

#### Logo Upload Validation
```
Valid:
✓ logo.png (1.5 MB, image/png)
✓ company.jpg (500 KB, image/jpeg)
✓ brand.svg (200 KB, image/svg+xml)

Invalid:
✗ document.pdf → "Invalid file type. Please upload PNG, JPG, or SVG files only."
✗ huge.png (3 MB) → "File is too large. Maximum size is 2MB."
```

#### Contact Information Validation
```
Email:
✓ contact@company.com
✓ info@example.org
✗ invalid-email → Browser validation

Phone:
✓ +1 (555) 123-4567
✓ +44 20 1234 5678
✓ Any text (flexible format)

Address:
✓ Multi-line supported
✓ Any format accepted
```

## 4. User Workflows

### Setting Up Branding (Step-by-Step)

```
Step 1: Navigate to Tenant Settings
  ↓
Step 2: Scroll to "Branding" section
  ↓
Step 3: Upload logo (drag-and-drop or choose file)
  ↓ [Validation]
  ├─ Valid → Upload succeeds → Preview shown
  └─ Invalid → Error shown → Try again
  ↓
Step 4: Fill in contact information
  - Email
  - Phone
  - Address
  ↓
Step 5: Configure tax settings
  - Tax Rate
  - Tax Label
  ↓
Step 6: Click "Save Changes"
  ↓
Success! → Branding active on invoices
```

### Viewing Branded Invoice

```
User views invoice
  ↓
System checks for tenant branding
  ├─ Has branding → Display branding section
  │   ├─ Logo (if available)
  │   ├─ Company name
  │   └─ Contact info (if available)
  │
  └─ No branding → Skip branding section
  ↓
Display customer information
  ↓
Display line items
  ↓
Display totals with custom tax label
```

## 5. Responsive Behavior

### Desktop (>= 1024px)
- Two-column layout for contact fields
- Logo preview at comfortable size
- Full-width forms

### Tablet (768px - 1023px)
- Two-column layout maintained
- Slightly smaller logo preview
- Adjusted spacing

### Mobile (< 768px)
- Single-column layout
- Stacked fields
- Touch-friendly upload area
- Full-width buttons

## 6. Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Choose file button
2. Email field
3. Phone field
4. Address field
5. Tax rate field
6. Tax label field
7. Save button
```

### Screen Reader Support
- Logo upload: "Choose file, Organization Logo"
- Preview: "Logo preview, image"
- Delete: "Delete Logo, button"
- Fields: Proper labels for all inputs
- Errors: Announced when displayed

## 7. Error Scenarios

### Upload Errors
```
Scenario 1: File too large
┌────────────────────────────────────────────┐
│ ⚠️ File is too large. Maximum size is 2MB. │
└────────────────────────────────────────────┘

Scenario 2: Invalid file type
┌────────────────────────────────────────────────────────┐
│ ⚠️ Invalid file type. Please upload PNG, JPG, or SVG │
│    files only.                                         │
└────────────────────────────────────────────────────────┘

Scenario 3: Network error
┌────────────────────────────────────────────┐
│ ⚠️ Failed to upload logo. Please try again.│
└────────────────────────────────────────────┘
```

### Success Messages
```
┌────────────────────────────────────────────┐
│ ✓ Logo uploaded successfully                │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ ✓ Tenant settings updated successfully      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ ✓ Logo deleted successfully                 │
└────────────────────────────────────────────┘
```

## 8. Color Scheme

### Upload Area
- Border: gray-300 (normal), blue-500 (drag over)
- Background: gray-50 (normal), blue-50 (drag over)
- Icon: gray-400
- Text: gray-700

### Buttons
- Upload: blue-600 (primary)
- Delete: red-600 (danger)
- Save: blue-600 (primary)

### Error Messages
- Background: red-50
- Border: red-200
- Text: red-800

### Success Messages
- Background: green-50
- Border: green-200
- Text: green-800

## 9. Performance Characteristics

### File Upload
- Validation: Instant (client-side)
- Preview generation: < 100ms (FileReader API)
- Upload time: Depends on file size and connection
- Progress: Not shown (uploads are fast for 2MB max)

### Image Display
- Logo caching: Browser handles automatically
- Responsive sizing: CSS object-contain
- Lazy loading: Not needed (single image)

## 10. Browser Support

### Required Features
✓ FormData API
✓ FileReader API
✓ Drag and drop events
✓ Modern CSS (flex, grid)
✓ ES6+ JavaScript

### Supported Browsers
✓ Chrome/Edge 88+
✓ Firefox 85+
✓ Safari 14+
✓ Mobile browsers (iOS Safari 14+, Chrome Android)

## 11. Future UI Enhancements

### Potential Improvements
- Logo cropping tool
- Multiple logo uploads (different sizes)
- Color picker for brand colors
- Live invoice preview
- Template selector
- Bulk branding for multiple tenants
- Brand guideline upload

### Requested Features (Not Implemented)
- PDF background image
- Custom fonts
- Watermarks
- Multiple contact persons
- Branch-specific branding
