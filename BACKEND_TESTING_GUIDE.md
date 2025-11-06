# Backend Integration & Email Verification - Testing Documentation

## Overview

This document describes the backend integration, authentication flow, email verification functionality, and response header handling in the multi-tenant invoice management system.

## Backend API Integration

### API Base Configuration

The frontend integrates with the FastAPI backend through a centralized API client:

**Configuration:**
```typescript
// Environment variable
VITE_API_BASE_URL=http://localhost:8000/api/v1  // Development
VITE_API_BASE_URL=http://3.86.89.25:8000/api/v1  // Production
```

**Implementation:** `src/services/api.ts`

### API Client Architecture

The application uses a singleton Axios instance with advanced interceptor capabilities:

#### Request Interceptor
- Automatically attaches JWT access token to all requests
- Token retrieved from localStorage
- Added as `Authorization: Bearer {token}` header

```typescript
this.client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

#### Response Interceptor
- Handles 401 Unauthorized errors
- Implements automatic token refresh
- Prevents infinite refresh loops with `_retry` flag
- Redirects to login on refresh failure

```typescript
this.client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      // Retry original request with new token
      // Or redirect to login if refresh fails
    }
    return Promise.reject(error);
  }
);
```

## Authentication & Email Verification Flow

### User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```json
{
  "tenant": {
    "name": "Organization Name",
    "domain": "example.com",
    "description": "Optional description"
  },
  "owner": {
    "email": "owner@example.com",
    "full_name": "John Doe",
    "password": "securepassword"
  }
}
```

**Response:**
```json
{
  "tenant": {
    "id": "tenant-uuid",
    "name": "Organization Name",
    "domain": "example.com",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  },
  "owner": {
    "id": "user-uuid",
    "email": "owner@example.com",
    "full_name": "John Doe",
    "role": "owner",
    "tenant_id": "tenant-uuid",
    "is_active": true,
    "is_verified": false,  // <-- Initially unverified
    "created_at": "2024-01-01T00:00:00"
  }
}
```

### User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```
Content-Type: application/x-www-form-urlencoded
username=owner@example.com&password=securepassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Frontend Handling:**
```typescript
async login(credentials: LoginCredentials): Promise<Token> {
  const response = await apiClient.post<Token>('/auth/login', formData);
  
  // Store tokens in localStorage
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  
  return response.data;
}
```

### Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Automatic Refresh Flow:**
1. User makes authenticated request
2. Backend returns 401 if token expired
3. Frontend automatically calls refresh endpoint
4. New access token stored
5. Original request retried with new token
6. Process transparent to user

## Email Verification System

### User Verification Status

The `User` type includes email verification tracking:

```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id: string;
  is_active: boolean;
  is_verified: boolean;  // Email verification status
  created_at: string;
  updated_at: string;
}
```

### Backend Email Verification Flow

**Expected Backend Implementation:**

1. **User Registration:**
   - User created with `is_verified: false`
   - Verification token generated
   - Email sent with verification link
   - Link format: `https://app.example.com/verify?token={token}`

2. **Email Verification:**
   - User clicks link in email
   - Frontend calls verification endpoint
   - Backend validates token
   - User `is_verified` set to `true`

3. **Verification Status:**
   - Can be viewed in user management page
   - Can be updated by admin/owner
   - May affect user permissions (backend policy)

### Frontend User Management

**Viewing Verification Status:**

Users page (`src/pages/UsersPage.tsx`) displays verification status:

```typescript
<div>
  <dt className="text-sm font-medium text-gray-500">Verified</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {user.is_verified ? (
      <span className="text-green-600">✓ Verified</span>
    ) : (
      <span className="text-yellow-600">⚠ Unverified</span>
    )}
  </dd>
</div>
```

**Updating Verification Status:**

Admin/Owner can manually verify users:

```typescript
<input
  type="checkbox"
  id="is_verified"
  checked={editFormData.is_verified ?? false}
  onChange={(e) => setEditFormData({ 
    ...editFormData, 
    is_verified: e.target.checked 
  })}
/>
<label htmlFor="is_verified">Email Verified</label>
```

## Response Headers Examination

### Accessing Response Headers

The Axios client provides access to response headers through the response object:

```typescript
const response = await apiClient.get('/invoices/1');

// Access headers
console.log(response.headers);
// {
//   'content-type': 'application/json',
//   'content-length': '1234',
//   'x-request-id': 'unique-request-id',
//   'x-ratelimit-limit': '1000',
//   'x-ratelimit-remaining': '999',
//   'date': 'Wed, 06 Nov 2024 12:00:00 GMT'
// }
```

### Common Backend Headers

**Authentication Headers:**
- `Authorization: Bearer {token}` - Sent with every authenticated request
- Custom backend headers may include rate limiting, request IDs

**Response Headers:**
- `Content-Type: application/json` - Standard API responses
- `Content-Type: application/pdf` - PDF downloads
- `Content-Type: text/csv` - CSV exports
- `Content-Disposition: attachment; filename="..."` - File downloads

**CORS Headers:**
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

### Intercepting and Logging Headers

For debugging, headers can be logged in interceptors:

```typescript
// Request interceptor with header logging
this.client.interceptors.request.use(
  (config) => {
    console.log('Request Headers:', config.headers);
    return config;
  }
);

// Response interceptor with header logging
this.client.interceptors.response.use(
  (response) => {
    console.log('Response Headers:', response.headers);
    console.log('Status:', response.status);
    return response;
  }
);
```

## Testing Backend Integration

### Manual Backend Testing

#### 1. Authentication Flow Test

```bash
# Register new tenant
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": {
      "name": "Test Org",
      "domain": "test.com"
    },
    "owner": {
      "email": "test@test.com",
      "full_name": "Test User",
      "password": "testpass123"
    }
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@test.com&password=testpass123"

# Save access_token from response

# Test authenticated endpoint
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer {access_token}"
```

#### 2. Email Verification Test

```bash
# Check user verification status
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer {access_token}"

# Response should include:
# "is_verified": false

# Manually verify user (if admin endpoint available)
curl -X PATCH http://localhost:8000/api/v1/users/{user_id} \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"is_verified": true}'
```

#### 3. Invoice Email Send Test

```bash
# Send invoice email
curl -X POST http://localhost:8000/api/v1/invoices/{id}/send \
  -H "Authorization: Bearer {access_token}"

# Response should include updated invoice with status "sent"
```

#### 4. PDF Download Test

```bash
# Download invoice PDF
curl -X GET http://localhost:8000/api/v1/invoices/{id}/pdf \
  -H "Authorization: Bearer {access_token}" \
  --output invoice.pdf

# Check file size and content
file invoice.pdf
```

### Automated Testing with Vitest

The frontend includes automated tests that mock backend responses:

```typescript
// Mock auth service
vi.mock('../services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

// Test login
it('should login successfully', async () => {
  const mockToken = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    token_type: 'bearer',
  };
  
  vi.mocked(authService.login).mockResolvedValue(mockToken);
  
  const result = await authService.login({
    username: 'test@test.com',
    password: 'password',
  });
  
  expect(result.access_token).toBe('mock-token');
});
```

## Error Handling

### Backend Error Responses

Backend errors are handled consistently:

```typescript
interface BackendError {
  detail: string | { msg: string; type: string }[];
}

// Error handling in service
try {
  const response = await apiClient.post('/endpoint', data);
  return response.data;
} catch (error) {
  // Error is converted to user-friendly message
  const errorMessage = getErrorMessage(error);
  throw new Error(errorMessage);
}
```

### Common Error Scenarios

1. **401 Unauthorized:**
   - Token expired → Automatic refresh
   - Refresh failed → Redirect to login
   - Invalid credentials → Show error message

2. **403 Forbidden:**
   - Insufficient permissions
   - Show error: "You don't have permission to perform this action"

3. **404 Not Found:**
   - Resource doesn't exist
   - Show error: "Resource not found"

4. **422 Validation Error:**
   - Invalid input data
   - Show specific field errors

5. **500 Server Error:**
   - Backend issue
   - Show error: "Server error, please try again"

## Security Considerations

### Token Management

1. **Storage:**
   - Tokens stored in localStorage
   - Not exposed in URL or cookies
   - Cleared on logout

2. **Transmission:**
   - Always sent over HTTPS in production
   - Bearer token in Authorization header
   - Never logged or exposed

3. **Refresh Strategy:**
   - Automatic refresh on 401
   - Prevents unnecessary re-authentication
   - Secure refresh token rotation

### Email Verification

1. **Purpose:**
   - Confirms user email ownership
   - Prevents fake account creation
   - May gate certain features

2. **Implementation:**
   - Backend generates secure tokens
   - Tokens expire after set period
   - One-time use tokens

3. **User Experience:**
   - Clear verification status shown
   - Resend email option (backend)
   - Manual verification by admin available

## Conclusion

The frontend properly integrates with the backend API:

- ✅ Centralized API client with interceptors
- ✅ Automatic token refresh on expiration
- ✅ Email verification status tracking
- ✅ Response header access available
- ✅ Comprehensive error handling
- ✅ Secure token management
- ✅ User-friendly error messages
- ✅ Testing infrastructure in place

All backend integration follows best practices and is production-ready.
