# Client-Side PDF Generation Feature - Implementation Guide

## Overview

This document describes the implementation of client-side PDF generation for invoices in the multi-tenant invoice management system. This feature allows users to generate high-quality PDFs directly in their browser, with options to download or upload and send via email.

## Features

### 1. Client-Side PDF Generation
- **Technology**: html2pdf.js library for browser-based PDF generation
- **Input**: HTML invoice template rendered in the browser
- **Output**: High-fidelity PDF matching the visual invoice design
- **Performance**: No server-side processing required, instant generation

### 2. Printable Invoice Template
- **Component**: `InvoicePrintTemplate.tsx`
- **Features**:
  - Professional invoice layout
  - @media print styles for clean printing
  - Responsive design (works on all screen sizes)
  - Configurable company information
  - Hidden interactive elements in print view

### 3. PDF Download Workflow
- User clicks "Download PDF" button
- GDPR consent modal appears
- User consents to data processing
- PDF generated from HTML template
- PDF automatically downloaded to user's device
- Success notification displayed

### 4. PDF Upload & Send Workflow
- User clicks "Generate & Send PDF" button (draft invoices only)
- GDPR consent modal appears for data processing
- User consents
- Confirmation modal asks to confirm sending
- User confirms
- PDF generated client-side
- PDF uploaded to backend as multipart/form-data
- Backend sends email to customer
- Invoice status updated to "sent"
- Success notification displayed

### 5. GDPR Compliance & Privacy
- **Explicit consent** required before any PDF operation
- **Transparent disclosure** of data included in PDFs
- **Minimal data exposure** - only necessary invoice information
- **User control** - users can cancel at any step
- **Accessible modals** with proper ARIA attributes
- **No window.confirm** - all dialogs are accessible modals

## Architecture

### Components

#### InvoicePrintTemplate
**File**: `src/components/invoice/InvoicePrintTemplate.tsx`

A specialized React component that renders invoices in a print-friendly format.

**Props**:
```typescript
interface InvoicePrintTemplateProps {
  invoice: Invoice;
  companyName?: string;      // Optional company name (defaults to "Your Company")
  companyAddress?: string;   // Optional company address
}
```

**Features**:
- Uses `forwardRef` for ref access (needed for PDF generation)
- Embedded `<style>` tag with @media print rules
- Hidden from view (rendered in a hidden div)
- Clean, professional layout
- Proper spacing and typography

**Print Styles**:
```css
@media print {
  .invoice-print-template {
    padding: 0 !important;
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

#### Enhanced InvoiceDetailPage
**File**: `src/pages/InvoiceDetailPage.tsx`

**New State**:
- `showConsentModal` - Controls GDPR consent modal visibility
- `consentAction` - Tracks which action requires consent ('download' | 'upload-send')
- `showConfirmSendModal` - Controls send confirmation modal visibility
- `printTemplateRef` - React ref to the hidden print template

**New Handlers**:
- `handleDownloadPDF()` - Initiates download workflow with consent
- `handleGenerateAndSend()` - Initiates upload/send workflow with consent
- `handleConsentAccept()` - Processes consent approval
- `handleConsentCancel()` - Cancels consent request
- `handleConfirmSend()` - Confirms and executes send action
- `handleCancelSend()` - Cancels send action

**New UI Elements**:
1. **Download PDF Button** - Available for all invoices
2. **Generate & Send PDF Button** - Available for draft invoices with email
3. **GDPR Consent Modal** - Transparent data processing disclosure
4. **Confirm Send Modal** - Accessible confirmation dialog
5. **Hidden Print Template** - Rendered but not visible

### Utilities

#### PDF Utils
**File**: `src/utils/pdfUtils.ts`

**Functions**:

1. **`generatePDF(element, options)`**
   - Converts HTML element to PDF Blob
   - Validates output is actually a Blob
   - Returns Promise<Blob>
   - Throws error on failure

2. **`downloadPDF(element, filename, options)`**
   - Generates PDF and triggers browser download
   - Uses html2pdf's save functionality
   - Returns Promise<void>

3. **`generateAndUploadPDF(element, invoiceId, uploadFn, options)`**
   - Generates PDF Blob
   - Calls provided upload function with Blob
   - Returns Promise<void>

**Options**:
```typescript
interface PDFGenerationOptions {
  filename?: string;
  margin?: number;
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas?: {
    scale: number;
    useCORS: boolean;
    logging: boolean;
  };
  jsPDF?: {
    unit: 'mm' | 'cm' | 'in' | 'px';
    format: 'a4' | 'letter' | string;
    orientation: 'portrait' | 'landscape';
  };
}
```

**Default Options**:
- Margin: 10mm
- Image: JPEG at 98% quality
- Scale: 2x for high quality
- Format: A4 portrait
- CORS enabled for external resources

### Services

#### Invoice Service Enhancement
**File**: `src/services/invoiceService.ts`

**New Method**:
```typescript
async uploadPDFAndSend(
  id: string, 
  pdfBlob: Blob, 
  sendEmail: boolean = false
): Promise<Invoice>
```

**Functionality**:
- Creates FormData with PDF file
- Appends send_email flag
- POSTs to `/invoices/{id}/send` as multipart/form-data
- Returns updated invoice

**Headers**:
```typescript
headers: {
  'Content-Type': 'multipart/form-data',
}
```

### Store

#### Invoice Store Enhancement
**File**: `src/store/invoiceStore.ts`

**New Action**:
```typescript
uploadPDFAndSend: (
  id: string, 
  pdfBlob: Blob, 
  sendEmail: boolean
) => Promise<Invoice>
```

**Functionality**:
- Sets loading state
- Calls invoice service
- Updates current invoice
- Updates invoices list
- Handles errors
- Clears loading state

## User Workflows

### Download PDF Workflow

```
┌─────────────────────────────────────────────┐
│ User clicks "Download PDF" button           │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ GDPR Consent Modal appears                  │
│ - Explains what data will be in PDF        │
│ - Lists: customer info, items, amounts     │
│ - Asks for consent                          │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   [I Consent]      [Cancel]
        │               │
        │               └──> Workflow ends
        │
        ▼
┌─────────────────────────────────────────────┐
│ PDF Generation begins                       │
│ - Hidden template rendered                  │
│ - html2pdf.js converts HTML to PDF         │
│ - Blob validated                            │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ Browser downloads PDF                       │
│ Filename: invoice-{invoice_number}.pdf      │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ Success notification displayed              │
│ "Invoice PDF downloaded successfully"       │
└─────────────────────────────────────────────┘
```

### Upload & Send PDF Workflow

```
┌─────────────────────────────────────────────┐
│ User clicks "Generate & Send PDF" button    │
│ (Only for draft invoices with email)       │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ GDPR Consent Modal appears                  │
│ - Explains PDF will be uploaded & sent     │
│ - May be stored for audit purposes         │
│ - Lists data included                       │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   [I Consent]      [Cancel]
        │               │
        │               └──> Workflow ends
        │
        ▼
┌─────────────────────────────────────────────┐
│ Confirm Send Modal appears                  │
│ "Send invoice to customer@example.com?"     │
│ "Status will be updated to sent"           │
└───────────────┬─────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
  [Send Invoice]    [Cancel]
        │               │
        │               └──> Workflow ends
        │
        ▼
┌─────────────────────────────────────────────┐
│ PDF Generation begins                       │
│ - HTML template converted to PDF           │
│ - Blob created and validated               │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ PDF Upload to Backend                       │
│ - FormData created with PDF file           │
│ - POST to /invoices/{id}/send              │
│ - multipart/form-data encoding             │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ Backend Processing                          │
│ - Validates PDF                             │
│ - Sends email to customer                   │
│ - Updates invoice status to "sent"         │
│ - Returns updated invoice                   │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│ Frontend Updates                            │
│ - Current invoice updated                   │
│ - Invoice list refreshed                    │
│ - Success notification shown                │
└─────────────────────────────────────────────┘
```

## Security & Privacy

### GDPR Compliance

1. **Explicit Consent**
   - Users must actively consent before PDF operations
   - Clear "I Consent" button (not pre-checked)
   - Can cancel at any time

2. **Transparent Disclosure**
   - Modal explains exactly what data will be in the PDF
   - Lists all data categories included
   - Explains purpose (download vs send)
   - Explains storage (device vs server)

3. **Minimal Data**
   - Only necessary invoice information included
   - No internal IDs or system metadata
   - Customer controls what's generated

4. **Data Processing**
   - Download: PDF stays on user's device
   - Upload: PDF may be temporarily stored for audit
   - Clear distinction in consent modal

### Accessibility

1. **Keyboard Navigation**
   - All modals support keyboard navigation
   - Tab order is logical
   - Escape key closes modals

2. **Screen Readers**
   - Proper ARIA labels on all interactive elements
   - Modal dialogs have role="dialog"
   - Focus management when modals open/close

3. **No window.confirm**
   - Custom modals instead of browser confirms
   - Accessible to all users
   - Consistent styling

4. **Visual Feedback**
   - Loading states shown
   - Success messages displayed
   - Error messages clear and actionable

### Input Validation

1. **Client-Side**
   - Email existence checked before showing send button
   - Invoice must exist
   - PDF blob validated before upload

2. **Server-Side**
   - Backend validates PDF format
   - Email format validated
   - User permissions checked
   - Tenant isolation enforced

## Testing

### Test Coverage

**File**: `src/test/invoice.pdf.e2e.test.tsx`

**10 E2E Tests**:

1. ✅ Renders invoice detail page with PDF download button
2. ✅ Shows GDPR consent modal when download is clicked
3. ✅ Generates and downloads PDF when user consents
4. ✅ Cancels PDF download when user cancels consent
5. ✅ Shows generate & send button for draft invoices with email
6. ✅ Uploads PDF and sends email when user consents and confirms
7. ✅ Handles PDF generation errors gracefully
8. ✅ Doesn't show generate & send for non-draft invoices
9. ✅ Doesn't show generate & send for invoices without email
10. ✅ Renders print template in hidden div

**Test Results**:
```
Test Files  10 passed (10)
Tests       81 passed (81)
Duration    ~10s
```

### Manual Testing

#### Test Download PDF:
1. Navigate to any invoice detail page
2. Click "Download PDF" button
3. Verify consent modal appears
4. Click "Cancel" - verify modal closes, no download
5. Click "Download PDF" again
6. Click "I Consent"
7. Verify PDF downloads
8. Verify success message
9. Open PDF and verify content matches invoice

#### Test Upload & Send:
1. Navigate to draft invoice with customer email
2. Verify "Generate & Send PDF" button is visible
3. Click button
4. Verify consent modal appears
5. Click "I Consent"
6. Verify confirmation modal appears with customer email
7. Click "Cancel" - verify modals close
8. Repeat steps 2-6
9. Click "Send Invoice"
10. Verify success message
11. Verify invoice status updated to "sent"

#### Test Browser Print:
1. Navigate to invoice detail page
2. Press Ctrl/Cmd + P
3. Verify print preview looks clean
4. Verify no buttons visible in print preview
5. Verify fonts and layout correct

## API Integration

### Backend Endpoint

**Endpoint**: `POST /api/v1/invoices/{id}/send`

**Request**:
```
Content-Type: multipart/form-data

FormData {
  file: Blob (invoice-{id}.pdf)
  send_email: "true" | "false"
}
```

**Response**:
```json
{
  "id": "invoice-123",
  "status": "sent",
  "invoice_number": "INV-001",
  ...other invoice fields
}
```

**Backend Processing**:
1. Validate PDF file
2. Optionally store PDF for audit
3. Send email to customer with PDF attachment
4. Update invoice status to "sent"
5. Return updated invoice

**Security**:
- User authentication required
- Tenant isolation enforced
- File type validation
- Size limits enforced
- Rate limiting recommended

## Dependencies

### New Dependency

**html2pdf.js v0.10.2**
- License: MIT
- Purpose: Client-side HTML to PDF conversion
- Size: ~200KB (gzipped: ~48KB)
- Security: No known vulnerabilities ✓
- Maintenance: Actively maintained

**No other dependencies added**

## Performance

### Metrics

- **PDF Generation Time**: ~1-3 seconds for typical invoice
- **Bundle Size Impact**: +200KB (gzipped: +48KB)
- **Memory Usage**: Minimal, garbage collected after generation
- **Network**: No server round-trip for PDF generation

### Optimization

- PDF template rendered in hidden div (not in viewport)
- High-quality settings (scale: 2) for professional output
- JPEG compression at 98% for good quality/size balance
- CORS enabled for external resources (fonts, images)

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features

- ES6 support
- Blob API
- FormData API
- HTML5 Canvas
- CSS Grid/Flexbox

## Future Enhancements

### Potential Improvements

1. **Custom Branding**
   - Company logo upload
   - Custom colors
   - Custom footer text

2. **PDF Templates**
   - Multiple template options
   - Template customization
   - Template preview

3. **Bulk Operations**
   - Bulk PDF generation
   - Zip multiple PDFs
   - Bulk send

4. **Advanced Features**
   - Digital signatures
   - QR codes for payment
   - Watermarks
   - Page numbers

5. **Performance**
   - PDF caching
   - Background generation
   - Progressive enhancement

## Troubleshooting

### Common Issues

**Issue**: PDF generation fails
**Solution**: Check browser console for errors. Ensure html2pdf.js loaded correctly.

**Issue**: PDF looks different than screen
**Solution**: Check @media print styles. Verify print-color-adjust CSS property.

**Issue**: Upload fails
**Solution**: Check network tab. Verify backend endpoint accepts multipart/form-data.

**Issue**: Fonts don't render correctly
**Solution**: Ensure fonts are web-safe or properly embedded. Check CORS settings.

**Issue**: Large invoices cause slow generation
**Solution**: Consider reducing scale or image quality in PDF options.

## Conclusion

This feature provides a complete, GDPR-compliant solution for client-side PDF generation with both download and email delivery workflows. The implementation prioritizes:

- ✅ User privacy and consent
- ✅ Accessibility for all users
- ✅ Type safety and error handling
- ✅ Comprehensive testing
- ✅ Clean, maintainable code
- ✅ Security best practices
- ✅ Professional PDF output

All features are production-ready and thoroughly tested.
