# Philbox Backend Integration Guides - Complete Documentation

**Comprehensive guide for frontend developers integrating with Philbox backend**

---

## Overview

This documentation package contains complete backend integration guides for all 5 user roles in the Philbox system. Each guide includes:

- ✅ Base configuration and setup
- ✅ All authentication endpoints with request/response examples
- ✅ Code implementation examples in React
- ✅ Frontend page structure and integration points
- ✅ Error handling patterns
- ✅ Best practices and tips
- ✅ Implementation checklists

---

## Available Guides

### 1. **Admin Backend Integration Guide**

📄 File: `Admin-Backend-Integration-Guide.md`

**For Super Admin Portal Developers**

- **2FA Login** (OTP verification)
- **Staff Management**: Admins, Salespersons
- **Branch Management**: Create, Read, Update, Delete
- **Permissions & Roles Management**
- **Activity Logging & Audit Trail**
- **Pages**: Dashboard, Staff List, Branch List, Permissions
- **Permissions**: Full system access (32/32)

---

### 2. **Doctor Backend Integration Guide**

📄 File: `Doctor-Backend-Integration-Guide.md`

**For Doctor Portal Developers**

- **Registration & Email Verification**
- **Login with Email/Password**
- **Google OAuth Integration**
- **2-Step Onboarding**:
  - Step 1: Document Submission (CNIC, License, Degree, etc.)
  - Step 2: Profile Completion (Bio, Specialization, Fee, etc.)
- **Complete Profile Management**
- **Pages**: Register, Verify, Login, Documents, Profile, Dashboard
- **Permissions**: Appointments, Prescriptions, Customer Data (7/32)

---

### 3. **Salesperson Backend Integration Guide**

📄 File: `Salesperson-Backend-Integration-Guide.md`

**For Salesperson Portal Developers**

- **Login** with Email/Password
- **Forget Password** - Email reset link
- **Reset Password** - Password change via token
- **Logout** - Session destruction
- **Pages**: Login, Forget Password, Reset Password, Dashboard
- **Permissions**: Orders, Medicines, Prescriptions, Customers, Appointments, Reports (9/32 available, operations not yet implemented)

---

### 4. **Customer Backend Integration Guide**

📄 File: `Customer-Backend-Integration-Guide.md`

**For Customer Portal Developers**

- **Registration** with Email Verification
- **Login** with Email/Password
- **Google OAuth Integration**
- **Forget Password** - Email reset link
- **Reset Password** - Password change via token
- **Logout** - Session destruction
- **Get Current User** - Session verification
- **Update Profile**: Personal info, address, and images
- **Pages**: Register, Verify, Login, Profile, Dashboard
- **Permissions**: Browse medicines, Place orders, View prescriptions, Book appointments (8/32 available, most operations not yet implemented)

---

### 5. **Branch Admin Backend Integration Guide**

📄 File: `BranchAdmin-Backend-Integration-Guide.md`

**For Branch Admin Portal Developers**

**⚠️ NOTE**: BranchAdmin authentication routes are not yet implemented separately. This guide documents the structure but authentication endpoints are still in development.

- **2FA Login** - Planned (OTP verification)
- **Forget Password** - Planned
- **Branch Management** - Planned (View and Update branch info)
- **Salespersons Management** - Planned (branch-scoped)
- **Orders Management** - Planned (branch-scoped)
- **Permissions**: Branch-scoped operations (13/32 available)

---

## Quick Start Guide

### Step 1: Choose Your Portal

| Role         | Guide                                 | Auth Type   | Pages Count |
| ------------ | ------------------------------------- | ----------- | ----------- |
| Super Admin  | Admin-Backend-Integration-Guide       | 2FA OTP     | 8+          |
| Branch Admin | BranchAdmin-Backend-Integration-Guide | 2FA OTP     | 7+          |
| Doctor       | Doctor-Backend-Integration-Guide      | Email/OAuth | 7+          |
| Salesperson  | Salesperson-Backend-Integration-Guide | Email       | 8+          |
| Customer     | Customer-Backend-Integration-Guide    | Email/OAuth | 9+          |

### Step 2: Read the Overview Section

Each guide starts with:

- Base URL and configuration
- Authentication method explanation
- Required headers

### Step 3: Implement Authentication

All guides include:

- Complete endpoint documentation
- Request/response examples
- Error handling examples
- React implementation code

### Step 4: Build the Pages

Each guide lists:

- All required pages with paths
- Integration endpoints
- Form fields and actions
- Display elements

### Step 5: Handle Errors

Each guide includes:

- Standard error response format
- HTTP status codes table
- Frontend error handling pattern
- Common error scenarios

---

## Key Concepts

### Base URL

All API endpoints use:

```
http://localhost:5000/api/{role}
```

Where `{role}` is:

- `admin` - For Super Admin & Branch Admin
- `doctor` - For Doctor endpoints
- `salesperson` - For Salesperson endpoints
- `customer` - For Customer endpoints

### Authentication

**Session-Based with Cookies:**

```javascript
// Always include in all requests
credentials: "include";

// Browser automatically sends connect.sid cookie
```

**Two Types:**

1. **2FA with OTP** (Admin & Branch Admin)
   - Login → OTP sent to email → Verify OTP → Session created

2. **Simple Email/Password** (Doctor, Salesperson, Customer)
   - Login with email/password → Session created

3. **OAuth2** (Doctor & Customer only)
   - Redirect to Google → Google handles auth → Backend creates session

### Permissions

All responses include user's role and permissions:

```json
{
  "role": {
    "name": "salesperson",
    "permissions": ["read_medicines", "create_orders", ...]
  }
}
```

**Use for RBAC in Frontend:**

```javascript
{
  hasPermission("create_orders") && <CreateOrderButton />;
}
```

### NextStep Navigation

Many endpoints return `nextStep` field:

```json
{
  "nextStep": "complete-profile"
}
```

**Navigation Map:**

- `verify-email` → Email verification page
- `submit-application` → Document submission page
- `complete-profile` → Profile completion form
- `wait-for-approval` → Waiting page
- `dashboard` → Dashboard
- `login` → Login page

---

## File Organization

```
docs/
├── Admin-Backend-Integration-Guide.md
├── BranchAdmin-Backend-Integration-Guide.md
├── Doctor-Backend-Integration-Guide.md
├── Salesperson-Backend-Integration-Guide.md
├── Customer-Backend-Integration-Guide.md
├── Backend-Integration-Summary.md (this file)
├── Customer-Backend-Guide-For-Frontend.md (original reference)
├── RBAC.md
└── PHILBOX_RBAC_PERMISSIONS.md
```

---

## Common Integration Patterns

### 1. Authentication Setup

```javascript
// Create API client with session support
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    credentials: "include", // CRITICAL: Include session
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // No session, redirect to login
      window.location.href = "/login";
    }
    throw new Error(data.message);
  }

  return data;
};
```

### 2. Session Check on App Load

```javascript
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/{role}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        setUser(data.data);
      }
    } catch (error) {
      navigate("/login");
    }
  };

  checkSession();
}, []);
```

### 3. Login with NextStep Routing

```javascript
const handleLogin = async (credentials) => {
  const result = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // Store user data
  setUser(result.data.user);

  // Route based on nextStep
  const routes = {
    "verify-email": "/verify-email",
    "submit-application": "/onboarding/documents",
    "complete-profile": "/onboarding/profile",
    dashboard: "/dashboard",
  };

  navigate(routes[result.data.nextStep] || "/dashboard");
};
```

### 4. Permission-Based Rendering

```javascript
const canView = (permission) => {
  return user?.role?.permissions?.includes(permission);
};

// In JSX
{
  canView("read_orders") && <OrdersList />;
}
{
  canView("create_orders") && <CreateOrderButton />;
}
{
  !canView("delete_users") && <DisabledDeleteButton />;
}
```

### 5. Form with File Upload

```javascript
const handleSubmit = async (formData, files) => {
  const submitData = new FormData();

  // Text fields
  Object.entries(formData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      submitData.append(key, JSON.stringify(value));
    } else {
      submitData.append(key, value);
    }
  });

  // Files
  Object.entries(files).forEach(([key, file]) => {
    if (file) submitData.append(key, file);
  });

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: submitData,
    // NO Content-Type header for FormData!
  });
};
```

---

## Frontend Development Sequence

### Phase 1: Core Authentication (Week 1)

- [ ] Setup API client and base configuration
- [ ] Implement login pages for all roles
- [ ] Implement email verification
- [ ] Implement forget/reset password
- [ ] Setup session management
- [ ] Test authentication flow

### Phase 2: OAuth Integration (Week 2)

- [ ] Add Google OAuth buttons
- [ ] Implement OAuth success/error pages
- [ ] Test OAuth flow
- [ ] Verify session after OAuth

### Phase 3: Role-Specific Onboarding (Week 2-3)

- [ ] Doctor: Document submission + Profile completion
- [ ] Customer: Address + Image upload
- [ ] Verify nextStep routing

### Phase 4: Core Dashboards (Week 3)

- [ ] Super Admin Dashboard
- [ ] Branch Admin Dashboard
- [ ] Doctor Dashboard
- [ ] Salesperson Dashboard
- [ ] Customer Dashboard

### Phase 5: Feature Pages (Week 4+)

- [ ] Staff Management (Admin only)
- [ ] Branch Management (Admin only)
- [ ] Orders Management (All relevant roles)
- [ ] Customers Management
- [ ] Reports & Analytics

### Phase 6: Testing & Polish (Week 6+)

- [ ] Test all endpoints
- [ ] Test error scenarios
- [ ] Test permission-based access
- [ ] Test file uploads
- [ ] Test responsiveness
- [ ] Fix bugs and edge cases

---

## Endpoint Summary

### Admin Endpoints

```
POST   /admin/auth/login
POST   /admin/auth/verify-otp
POST   /admin/auth/forget-password
POST   /admin/auth/reset-password
POST   /admin/auth/logout

GET    /admin/staff-management/admins
GET    /admin/staff-management/salespersons
POST   /admin/staff-management/salespersons
PUT    /admin/staff-management/salespersons/:id
DELETE /admin/staff-management/salespersons/:id

GET    /admin/branch-management/branches
POST   /admin/branch-management/branches
PUT    /admin/branch-management/branches/:id
DELETE /admin/branch-management/branches/:id

GET    /admin/permissions-management/roles
GET    /admin/permissions-management/permissions
GET    /admin/permissions-management/user-role
POST   /admin/permissions-management/permissions
POST   /admin/permissions-management/users/assign-role
```

### Doctor Endpoints

```
POST   /doctor/auth/register
POST   /doctor/auth/verify-email
POST   /doctor/auth/login
POST   /doctor/auth/submit-application
POST   /doctor/auth/complete-profile
POST   /doctor/auth/forget-password
POST   /doctor/auth/reset-password
POST   /doctor/auth/logout
GET    /doctor/auth/google
GET    /doctor/auth/google/callback
GET    /doctor/auth/me
```

### Salesperson Endpoints

```
POST   /salesperson/auth/login
POST   /salesperson/auth/forget-password
POST   /salesperson/auth/reset-password
POST   /salesperson/auth/logout
```

### Customer Endpoints

```
POST   /customer/auth/register
POST   /customer/auth/verify-email
POST   /customer/auth/login
POST   /customer/auth/forget-password
POST   /customer/auth/reset-password
POST   /customer/auth/logout
GET    /customer/auth/me
GET    /customer/auth/google
GET    /customer/auth/google/callback
PUT    /customer/auth/profile
```

---

## Important Notes

### Session Management

- ✅ Always include `credentials: 'include'` in fetch
- ✅ Browser automatically sends and receives cookies
- ✅ No manual token handling needed
- ✅ Check session on app load
- ✅ Redirect to login if session invalid (401)

### File Uploads

- ✅ Use `FormData()` for multipart requests
- ✅ Append files with `formData.append('key', file)`
- ✅ DON'T set `Content-Type` header (browser sets it)
- ✅ Validate file size before upload
- ✅ Show upload progress to user

### Error Handling

- ✅ Check `response.ok` or `response.status`
- ✅ Show user-friendly error messages
- ✅ Log technical errors to console
- ✅ Handle network errors gracefully
- ✅ Show retry option when appropriate

### Permission-Based Access

- ✅ Check permissions from `user.role.permissions`
- ✅ Hide/disable UI elements user can't access
- ✅ Don't rely on frontend validation alone
- ✅ Backend enforces permissions
- ✅ Show permission error message if API rejects

### NextStep Routing

- ✅ Always check `nextStep` field in responses
- ✅ Route users to appropriate next page
- ✅ Don't let users skip steps
- ✅ Save progress for resumable flows
- ✅ Handle resume from any step

---

## Troubleshooting

### Session Issues

**Problem**: Always redirected to login even after login
**Solution**:

- ✅ Verify `credentials: 'include'` in all requests
- ✅ Check browser cookies (DevTools → Application → Cookies)
- ✅ Check backend CORS settings
- ✅ Verify backend session middleware order

### File Upload Issues

**Problem**: Files not uploading or too large
**Solution**:

- ✅ Check file size (max 5MB)
- ✅ Validate file type before send
- ✅ Use FormData, don't JSON.stringify
- ✅ Don't set Content-Type header
- ✅ Check network tab for actual upload size

### CORS Issues

**Problem**: "No 'Access-Control-Allow-Origin' header"
**Solution**:

- ✅ Backend CORS already configured
- ✅ Use correct base URL
- ✅ Include credentials in request
- ✅ Check backend is running on localhost:5000

### Permission Denied Errors

**Problem**: Endpoint returns 403 Forbidden
**Solution**:

- ✅ Verify user has required permission
- ✅ Check role is assigned correctly
- ✅ Verify permission name in code
- ✅ Check user isn't blocked/suspended

---

## References

- **RBAC Documentation**: `RBAC.md`
- **Permission Matrix**: `PHILBOX_RBAC_PERMISSIONS.md`
- **Original Customer Guide**: `Customer-Backend-Guide-For-Frontend.md`
- **Project Proposal**: Available in project documentation

---

## Contact & Support

**For Backend Issues:**

- Check backend logs: `npm run dev`
- Verify endpoints are implemented
- Check middleware order in server.js
- Review error response messages

**For Frontend Integration Issues:**

- Check Network tab in DevTools
- Verify request format matches examples
- Check response format matches documentation
- Review browser console for errors

**For Permissions/RBAC Issues:**

- Verify role is assigned to user
- Check permission name spelling
- Review PHILBOX_RBAC_PERMISSIONS.md
- Verify user's role has the permission

---

## Version History

| Version | Date     | Changes                             |
| ------- | -------- | ----------------------------------- |
| 1.0     | Dec 2025 | Initial comprehensive guide created |

---

## Frontend Framework Notes

All code examples are shown in **React**, but the API patterns apply to:

- ✅ Vue.js
- ✅ Angular
- ✅ Svelte
- ✅ Next.js
- ✅ Nuxt
- ✅ Plain JavaScript/HTML
- ✅ Any other framework

The key principles:

- Use `fetch()` or similar HTTP client
- Include `credentials: 'include'` for session
- Handle JSON responses
- Manage state appropriately
- Route based on `nextStep` field

---

**Happy Development! 🚀**

For detailed information on any specific role, please refer to the corresponding integration guide.
