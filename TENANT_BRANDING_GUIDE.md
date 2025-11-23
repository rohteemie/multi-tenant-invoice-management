# Tenant Branding Features - Implementation Guide

## Overview
This document describes the new tenant branding features implemented in the frontend, including logo upload, contact information management, and branded invoice displays.

## Features Implemented

### 1. Logo Upload
- **Location**: Tenant Settings Page
- **Functionality**: 
  - Upload organization logo (PNG, JPG, SVG)
  - Maximum file size: 2MB
  - Drag-and-drop support
  - Preview before upload
  - Delete existing logo
- **Validation**:
  - File type validation (PNG, JPG, SVG only)
  - File size validation (max 2MB)
  - User-friendly error messages

### 2. Contact Information
- **Location**: Tenant Settings Page
- **Fields**:
  - Email: Organization contact email
  - Phone: Organization contact phone number
  - Address: Full organization address (multi-line support)
- **Display**: Contact information appears on invoice detail pages

### 3. Tax Settings
- **Location**: Tenant Settings Page
- **Fields**:
  - Tax Rate: Percentage (0-100)
  - Tax Label: Custom label (e.g., "VAT", "GST", "Sales Tax")
- **Display**: Custom tax label appears on invoices instead of generic "Tax"

### 4. Invoice Branding Display
- **Location**: Invoice Detail Page
- **Content**:
  - Organization logo (if uploaded)
  - Organization name
  - Contact information (address, phone, email)
  - Custom tax label on invoice totals
- **Behavior**: Only displays if at least one branding element is available

## API Integration

### Endpoints Used

#### Upload Logo
```
POST /api/v1/tenants/{tenant_id}/logo
Content-Type: multipart/form-data
Body: FormData with 'file' field
Response: { logo_url: string }
```

#### Get Logo
```
GET /api/v1/tenants/{tenant_id}/logo
Response: { logo_url: string }
```

#### Delete Logo
```
DELETE /api/v1/tenants/{tenant_id}/logo
Response: void
```

#### Update Tenant (Contact Info)
```
PUT /api/v1/tenants/{tenant_id}
Body: {
  address?: string,
  phone?: string,
  email?: string,
  tax_rate?: number,
  tax_label?: string
}
Response: Tenant
```

## Component Architecture

### LogoUpload Component
**Path**: `src/components/common/LogoUpload.tsx`

**Props**:
- `currentLogoUrl?: string` - URL of current logo (optional)
- `onUpload: (file: File) => Promise<void>` - Upload handler
- `onDelete?: () => Promise<void>` - Delete handler (optional)
- `isLoading?: boolean` - Loading state (optional)

**Features**:
- File input with custom styling
- Drag-and-drop zone
- Image preview
- File validation
- Error handling
- Loading states

**Usage Example**:
```tsx
<LogoUpload
  currentLogoUrl={tenant.logo_url}
  onUpload={handleLogoUpload}
  onDelete={handleLogoDelete}
  isLoading={isLoading}
/>
```

### TenantSettingsPage Updates
**Path**: `src/pages/TenantSettingsPage.tsx`

**New Sections**:
1. **Branding Section**: Logo upload component
2. **Contact Information**: Email, phone, address fields
3. **Tax Settings**: Tax rate and label inputs

**State Management**:
- Form data includes all new branding fields
- Separate handlers for logo upload/delete
- Success/error message display

### InvoiceDetailPage Updates
**Path**: `src/pages/InvoiceDetailPage.tsx`

**Changes**:
1. Fetch tenant data when displaying invoice
2. Display tenant branding section (logo + contact info)
3. Use custom tax label in invoice totals
4. Graceful handling when branding data is unavailable

## Type Definitions

### Updated Tenant Interface
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
  logo_url?: string;        // NEW
  address?: string;         // NEW
  phone?: string;           // NEW
  email?: string;           // NEW
  created_at: string;
  updated_at: string;
}
```

### Updated TenantCreate Interface
```typescript
export interface TenantCreate {
  name: string;
  domain?: string;
  description?: string;
  plan_type?: string;
  default_currency?: Currency;
  tax_rate?: number;
  tax_label?: string;
  address?: string;         // NEW
  phone?: string;           // NEW
  email?: string;           // NEW
}
```

## State Management

### TenantStore Updates
**Path**: `src/store/tenantStore.ts`

**New Actions**:
```typescript
uploadLogo: (tenantId: string, file: File) => Promise<string>
deleteLogo: (tenantId: string) => Promise<void>
```

**Behavior**:
- Upload/delete operations refresh tenant data
- Errors are stored in state for UI display
- Loading states managed automatically

## Permissions

### Access Control
- **Logo Upload/Delete**: Owner role only
- **Contact Info Update**: Owner role only
- **Tax Settings Update**: Owner role only

**Implementation**: Existing `canManageTenant` check in TenantSettingsPage

## Testing

### Test Coverage
Total Tests: 175 (159 existing + 16 new)

#### LogoUpload Component Tests
**File**: `src/test/LogoUpload.test.tsx`
- Renders upload area when no logo present
- Displays logo preview when URL provided
- Shows/hides delete button based on props
- Validates file type (PNG/JPG/SVG only)
- Validates file size (max 2MB)
- Calls upload handler for valid files
- Calls delete handler on button click
- Handles loading states correctly

#### TenantService Tests
**File**: `src/test/tenantService.logo.test.ts`
- Upload logo with FormData
- Handle upload errors
- Fetch logo URL
- Handle fetch errors
- Delete logo
- Handle delete errors
- Update tenant with branding fields

### Running Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test LogoUpload.test.tsx

# Run tests with coverage
npm run test:coverage
```

## User Workflow

### Setting Up Branding (Owner)
1. Navigate to "Tenant Settings"
2. In the "Branding" section:
   - Click "Choose file" or drag-and-drop logo file
   - Logo is validated and uploaded automatically
   - Preview appears after successful upload
3. In "Contact Information" section:
   - Enter email, phone, and address
4. In "Tax Settings" section:
   - Set tax rate and custom label (e.g., "VAT")
5. Click "Save Changes"

### Viewing Branded Invoice
1. Navigate to any invoice detail page
2. If branding is configured, see:
   - Organization logo at top
   - Contact information below logo
   - Custom tax label in invoice totals

### Deleting Logo
1. Navigate to "Tenant Settings"
2. In "Branding" section, click "Delete Logo"
3. Logo is removed, upload area reappears

## Error Handling

### Frontend Validation
- **File Type**: Only PNG, JPG, SVG accepted
- **File Size**: Maximum 2MB
- **Error Display**: User-friendly messages in UI

### Backend Errors
- API errors are caught and displayed to user
- Network errors show generic error message
- Form remains usable after errors

### Graceful Degradation
- Invoice pages work without branding data
- Missing fields are simply not displayed
- No errors thrown if tenant fetch fails

## Browser Compatibility
- Modern browsers with FormData support
- File drag-and-drop API support
- FileReader API for preview

## Future Enhancements (Not Implemented)
- Logo cropping/editing tool
- Multiple logo sizes/versions
- Additional branding colors
- Custom fonts
- Invoice template customization

## Troubleshooting

### Logo Not Uploading
1. Check file type (must be PNG, JPG, or SVG)
2. Check file size (must be under 2MB)
3. Verify user has Owner role
4. Check network/API connectivity

### Logo Not Displaying on Invoice
1. Verify logo was uploaded successfully
2. Check tenant data includes logo_url
3. Verify browser can access logo URL
4. Check for CORS issues with logo hosting

### Contact Info Not Saving
1. Verify user has Owner role
2. Check form validation
3. Verify API connectivity
4. Check browser console for errors

## Security Considerations

### File Upload Security
- Client-side validation (file type and size)
- Backend validation required (not in scope)
- Uploaded files served from trusted domain
- No execution of uploaded files

### Access Control
- Logo management restricted to Owner role
- Contact info update restricted to Owner role
- API endpoints should validate tenant ownership

### Data Privacy
- Contact information stored securely
- Only displayed to authenticated users
- Logo URLs may be publicly accessible

## Performance Considerations

### File Upload
- 2MB file size limit prevents large uploads
- FormData used for efficient multipart upload
- Preview generated using FileReader API

### Image Display
- Logo cached by browser
- Responsive image sizing
- CSS object-contain prevents distortion

### State Management
- Tenant data fetched once per page load
- Logo upload refreshes tenant data automatically
- Minimal re-renders with Zustand

## Accessibility

### LogoUpload Component
- File input properly labeled
- Keyboard accessible
- Screen reader friendly
- Error messages announced

### Forms
- All fields properly labeled
- Required fields marked
- Error messages associated with fields
- Logical tab order

## Best Practices

### Using LogoUpload Component
```tsx
// Good: Provide all handlers
<LogoUpload
  currentLogoUrl={logo}
  onUpload={handleUpload}
  onDelete={handleDelete}
  isLoading={loading}
/>

// Acceptable: No delete handler (read-only)
<LogoUpload
  currentLogoUrl={logo}
  onUpload={handleUpload}
  isLoading={loading}
/>
```

### Error Handling
```tsx
// Good: Handle errors gracefully
const handleLogoUpload = async (file: File) => {
  try {
    await uploadLogo(tenantId, file);
    setSuccessMessage('Logo uploaded!');
  } catch (error) {
    // Error handled by store, shown in UI
  }
};
```

### Displaying Branding
```tsx
// Good: Conditional rendering
{currentTenant?.logo_url && (
  <img src={currentTenant.logo_url} alt="Logo" />
)}

// Good: Fallback values
<span>{currentTenant?.tax_label || 'Tax'}</span>
```

## Maintenance

### Adding New Branding Fields
1. Update `Tenant` interface in `src/types/tenant.ts`
2. Update `TenantCreate` interface
3. Add field to TenantSettingsPage form
4. Update form state initialization
5. Add tests for new field

### Modifying Validation
1. Update validation in LogoUpload component
2. Update error messages
3. Update tests
4. Update documentation

## Support
For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Check browser console for errors
4. Review backend API documentation
