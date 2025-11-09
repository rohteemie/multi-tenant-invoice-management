# User and Tenant Management Permissions

This document describes the permission model for user and tenant management in the multi-tenant invoice management system.

## Overview

The system implements a hierarchical role-based access control (RBAC) model with four user roles:
- **Owner**: Full control over organization, users, and data
- **Admin**: Can manage invoices and view users
- **Manager**: Can manage invoices
- **Attendant**: Can view and create invoices

## User Management Permissions

### Viewing Users

**Who can view users:**
- Owner: ✅ Can view all users
- Admin: ✅ Can view all users
- Manager: ✅ Can view all users
- Attendant: ✅ Can view all users

**Accessible at:** `/users`

### Creating Users

**Who can create users:**
- Owner: ✅ Can create users with any role (except Owner)
- Admin: ✅ Can create users with any role (except Owner)
- Manager: ❌ Cannot create users
- Attendant: ❌ Cannot create users

**Accessible at:** `/users/create`

**Notes:**
- Only the system can create Owner accounts during organization registration
- Additional owners must be promoted by contacting technical support

### Editing Users

**Who can edit users:**
- Owner: ✅ Can edit ALL user details (name, role, status, verification)
- Admin: ❌ Cannot edit users
- Manager: ❌ Cannot edit users
- Attendant: ❌ Cannot edit users

**Special Rules:**
- Owner role cannot be changed through the UI
- Users cannot edit their own details
- Only owners can update user roles
- To change an owner's role, contact technical support

**Available Fields:**
- Full Name
- Role (Attendant, Manager, Admin) - Owner role is disabled
- Active Status (is_active)
- Verification Status (is_verified)

### Deleting Users

**Who can delete users:**
- Owner: ✅ Can delete non-owner users
- Admin: ❌ Cannot delete users
- Manager: ❌ Cannot delete users
- Attendant: ❌ Cannot delete users

**Restrictions:**
- ❌ Owners cannot delete themselves (must delete organization instead)
- ❌ Owners cannot delete other owners
- ❌ Non-owners cannot delete any users
- ❌ Users cannot delete themselves

**Error Messages:**
- "Only the organization owner can delete users"
- "Cannot delete your own account. To delete your account, delete the organization from Settings."
- "Cannot delete another owner. Contact the technical team or developer organization for assistance."

**Notes:**
- User deletion is a soft delete (sets `is_active` to `false`)
- Deleted users can be reactivated by the owner

## Tenant/Organization Management Permissions

### Viewing Organization Settings

**Who can view settings:**
- Owner: ✅ Can view and edit organization settings
- Admin: ❌ Cannot access settings
- Manager: ❌ Cannot access settings
- Attendant: ❌ Cannot access settings

**Accessible at:** `/settings`

### Editing Organization Settings

**Who can edit:**
- Owner: ✅ Can edit organization name, domain, description, plan type
- Others: ❌ Cannot edit

**Available Fields:**
- Organization Name
- Domain
- Plan Type
- Description

### Deleting Organization

**Who can delete:**
- Owner: ✅ Can delete (deactivate) the organization
- Others: ❌ Cannot delete

**What happens:**
1. Organization is soft deleted (`is_active` set to `false`)
2. User is automatically logged out
3. All organization data becomes inaccessible
4. User is redirected to login page

**Notes:**
- Organization deletion is permanent and cannot be undone through the UI
- To restore a deleted organization, contact technical support

## Success and Error Handling

### Success Messages

Success messages are displayed at the top of the page after:
- ✅ User updated successfully
- ✅ User deleted successfully
- ✅ Organization settings updated successfully

**Format:**
```
✓ User [Name] updated successfully
✓ User [Name] deleted successfully
✓ Tenant settings updated successfully
```

Success messages are:
- Auto-dismissible (user can click X to close)
- Display in green with a checkmark icon
- Remain visible until dismissed

### Error Messages

Error messages are displayed when:
- ❌ Permission denied
- ❌ Invalid operation attempted
- ❌ Backend error occurs
- ❌ Validation fails

**Common Errors:**
- "Only the organization owner can edit user details"
- "Only the organization owner can delete users"
- "Cannot delete your own account..."
- "Cannot delete another owner..."
- "Cannot change the role of an owner..."

Error messages are:
- Auto-dismissible (user can click X to close)
- Display in red with an X icon
- Provide specific, actionable information

## API Integration

### User Management Endpoints

```
GET    /users          - List all users (Owner, Admin, Manager, Attendant)
GET    /users/me       - Get current user details
GET    /users/:id      - Get specific user details
POST   /auth/register  - Create new user (Owner, Admin)
PUT    /users/:id      - Update user (Owner only)
DELETE /users/:id      - Soft delete user (Owner only, cannot delete self or other owners)
```

### Tenant Management Endpoints

```
GET    /tenants/:id    - Get organization details (Owner)
PUT    /tenants/:id    - Update organization (Owner only)
DELETE /tenants/:id    - Soft delete organization (Owner only)
```

## Testing

The implementation includes comprehensive tests covering:
- ✅ Permission checks for all operations
- ✅ Success message display
- ✅ Error message display
- ✅ Owner role protection
- ✅ Self-deletion prevention
- ✅ UI button visibility based on role

**Test File:** `src/test/user.management.test.tsx`

## Security Considerations

1. **Role Hierarchy**: Owner > Admin > Manager > Attendant
2. **Owner Protection**: Owner roles cannot be modified or deleted through the UI
3. **Self-Protection**: Users cannot delete themselves (prevents accidental lockout)
4. **Soft Deletes**: Deleted entities can be restored by technical support
5. **Permission Validation**: Both frontend and backend validate permissions
6. **Audit Trail**: All operations are logged on the backend

## Frontend Components

### Components

- `SuccessMessage` - Displays success notifications
- `ErrorMessage` - Displays error notifications
- `UsersPage` - User management interface
- `TenantSettingsPage` - Organization settings interface

### Stores

- `useUserStore` - Manages user state and operations
- `useTenantStore` - Manages organization state and operations
- `useAuthStore` - Manages authentication state

## User Experience Flow

### Edit User Flow

1. Owner navigates to `/users`
2. Clicks "Edit" button for a user
3. Modal appears with user details
4. Owner modifies fields
5. Clicks "Update User"
6. Success message appears: "User [Name] updated successfully"
7. Modal closes, user list refreshes

### Delete User Flow

1. Owner navigates to `/users`
2. Clicks "Delete" button for a non-owner user
3. Confirmation modal appears
4. Owner confirms deletion
5. Success message appears: "User [Name] deleted successfully"
6. User removed from list

### Delete Organization Flow

1. Owner navigates to `/settings`
2. Clicks "Delete Organization"
3. Confirmation modal appears with warning
4. Owner confirms deletion
5. Organization soft deleted
6. User logged out
7. Redirected to login page

## Troubleshooting

### "Only the organization owner can edit user details"

**Problem:** Non-owner trying to edit users  
**Solution:** Only owners can edit users. Contact your organization owner.

### "Cannot delete another owner"

**Problem:** Trying to delete a user with Owner role  
**Solution:** Contact technical support to remove owner status before deletion.

### "Cannot delete your own account"

**Problem:** Owner trying to delete themselves  
**Solution:** Delete the organization from Settings instead, which will deactivate your account.

### Edit button not visible

**Problem:** Non-owner users cannot see edit buttons  
**Solution:** This is expected. Only owners can edit users.

### Delete button not visible

**Problem:** Non-owner users cannot see delete buttons  
**Solution:** This is expected. Only owners can delete users.

## Backend Requirements

For the frontend to work correctly, the backend must:

1. Enforce the same permission rules
2. Return appropriate error messages (401, 403, etc.)
3. Support soft deletes (set `is_active: false`)
4. Validate role changes (prevent owner role changes)
5. Prevent self-deletion
6. Prevent deletion of owners

## Conclusion

This permission model ensures:
- ✅ Clear separation of responsibilities
- ✅ Protection against accidental data loss
- ✅ Owner role security
- ✅ User-friendly error messages
- ✅ Consistent success/error feedback
- ✅ Compliance with security best practices

For questions or issues, contact technical support or the development team.
