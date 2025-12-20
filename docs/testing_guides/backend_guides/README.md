# Backend API Testing Guides - Complete Index

## Overview

This folder contains comprehensive testing guides for all backend API endpoints in the PHILBOX system. Each guide includes detailed endpoint documentation, request/response examples, validation rules, error cases, testing checklists, and performance benchmarks.

**Authentication Method:** SESSION-BASED (connect-mongo) with connect.sid cookie. NOT JWT tokens.

---

## 🚀 Quick Start

For a complete overview of all APIs, authentication setup, and frontend integration examples, see:

**[Backend API Complete Reference](./README_COMPLETE.md)**

---

## 📚 Available Guides

### 1. **ADMIN_API_COMPLETE_GUIDE.md**

**Coverage:** Complete admin operations including authentication, branch management, and admin statistics

**Key Features:**

- Admin authentication with conditional 2FA
- Branch CRUD operations with permissions
- Branch assignment management
- Branch performance metrics
- Password reset functionality
- Session-based authentication (connect.sid)

---

### 2. **USER_MANAGEMENT_API_GUIDE.md**

**Coverage:** Complete user management for admins and salespersons

**Key Features:**

- Admin CRUD operations (7 endpoints)
- Salesperson CRUD operations (7 endpoints)
- User activation/deactivation
- Role assignment
- User statistics
- Profile image uploads
- Salesperson task performance tracking
- Doctor application review and approval (4 endpoints)

---

### 3. **PERMISSIONS_RBAC_API_GUIDE.md**

**Coverage:** Role-Based Access Control system

**Key Features:**

- Role management (get all, get by ID, update permissions)
- Permission management (get all, create new)
- User role assignment
- Add/remove permissions from roles
- Permission checking
- Available permissions reference

---

### 4. **CUSTOMER_AUTH_API_GUIDE.md**

**Coverage:** Customer authentication and profile management

**Key Features:**

- Customer registration with email verification
- Login (email/password + Google OAuth)
- Profile management with image uploads
- Address management
- Password reset functionality
- Session management
- Frontend integration examples

---

### 5. **DOCTOR_AUTH_API_GUIDE.md**

**Coverage:** Doctor onboarding, authentication, and verification process

**Key Features:**

- Doctor registration with email verification
- Multi-step onboarding process
- Document submission for admin verification
- Profile completion (education, experience, specialization)
- Google OAuth authentication
- Onboarding state management
- Frontend integration examples

---

### 6. **SALESPERSON_AUTH_API_GUIDE.md**

**Coverage:** Salesperson authentication with conditional 2FA

**Key Features:**

- Login with conditional 2FA
- OTP verification flow
- 2FA settings management (enable/disable)
- Password reset functionality
- Session management
- Frontend integration examples

**Coverage:** Complete user management for admins and salespersons

**Key Features:**

- Admin CRUD operations (7 endpoints)
- Salesperson CRUD operations (7 endpoints)
- User activation/deactivation
- Role assignment
- User statistics
- Profile image uploads

---

### 3. **PERMISSIONS_RBAC_API_GUIDE.md**

**Status:** ✅ Complete
**Endpoints:** 9
**Coverage:** RBAC - Role and Permission management

**Endpoints Covered:**

- `GET /api/admin/permissions/roles` - Get all roles with permissions
- `GET /api/admin/permissions/roles/:roleId` - Get specific role
- `GET /api/admin/permissions/permissions` - Get all available permissions
- `POST /api/admin/permissions/permissions` - Create new permission
- `PUT /api/admin/permissions/roles/:roleId` - Update role permissions (bulk)
- `POST /api/admin/permissions/roles/:roleId/permissions` - Add single permission
- `DELETE /api/admin/permissions/roles/:roleId/permissions` - Remove permission
- `POST /api/admin/permissions/users/assign-role` - Assign role to user
- `GET /api/admin/permissions/user-role` - Get current user's role & permissions

**Key Features:**

- Complete RBAC system with 50+ permissions
- Non-destructive permission addition
- Bulk permission updates
- Permission module organization
- Permission matrix documentation

---

### 5. **CUSTOMER_AUTH_API_TESTING.md**

**Status:** ✅ Complete
**Endpoints:** 9
**Coverage:** Customer authentication, registration, and profile management

**Endpoints Covered:**

- `POST /api/customer/auth/register` - Customer registration
- `POST /api/customer/auth/verify-email` - Email verification with OTP
- `POST /api/customer/auth/login` - Customer login
- `GET /api/customer/auth/google` - Google OAuth initiation
- `GET /api/customer/auth/google/callback` - Google OAuth callback
- `POST /api/customer/auth/forget-password` - Request password reset
- `POST /api/customer/auth/reset-password` - Reset password
- `POST /api/customer/auth/logout` - Logout
- `GET /api/customer/auth/me` - Get current user profile
- `PUT /api/customer/auth/profile` - Update profile with images

**Key Features:**

- Self-registration with email verification
- Google OAuth integration
- Profile management with image uploads
- Address management
- Email-based password reset

---

### 6. **DOCTOR_AUTH_API_TESTING.md**

**Status:** ✅ Complete
**Endpoints:** 9
**Coverage:** Doctor authentication and 2-step onboarding

**Endpoints Covered:**

- `POST /api/doctor/auth/register` - Doctor registration
- `POST /api/doctor/auth/verify-email` - Email verification
- `POST /api/doctor/auth/login` - Doctor login
- `POST /api/doctor/auth/submit-application` - Submit documents (Step 1)
- `POST /api/doctor/auth/complete-profile` - Complete profile (Step 2)
- `POST /api/doctor/auth/forget-password` - Password reset request
- `POST /api/doctor/auth/reset-password` - Reset password
- `POST /api/doctor/auth/logout` - Logout
- `GET /api/doctor/auth/google` - Google OAuth

**Key Features:**

- 2-step onboarding process
  - Step 1: Submit medical documents
  - Step 2: Complete profile after admin approval
- Multi-file uploads to Cloudinary
- Admin review workflow
- Specialization and qualification tracking
- Consultation fee management

**Onboarding Status Flow:**

```
Registered → Email Verified → App Submitted (Pending Review)
                                    ↓
                            Admin Approval/Rejection
                                    ↓
                           Profile Completion Enabled
                                    ↓
                          Active & Ready for Appointments
```

---

### 7. **SALESPERSON_AUTH_API_TESTING.md**

**Status:** ✅ Complete
**Endpoints:** 4
**Coverage:** Salesperson authentication (admin-created accounts only)

**Endpoints Covered:**

- `POST /api/salesperson/auth/login` - Salesperson login
- `POST /api/salesperson/auth/forget-password` - Password reset request
- `POST /api/salesperson/auth/reset-password` - Reset password
- `POST /api/salesperson/auth/logout` - Logout

**Key Features:**

- Admin-created accounts only (no self-registration)
- Credentials sent via email from admin
- Account status checking (active/inactive)
- Rate limiting on authentication
- Session-based authentication with connect.sid cookie

---

## 🗺️ Complete API Map

```
http://localhost:5000/api/

├── super-admin/auth/                    [ADMIN_API_COMPLETE_GUIDE.md]
│   ├── POST /login
│   ├── POST /verify-otp
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   └── PATCH /2fa-settings
│
├── customer/auth/                       [CUSTOMER_AUTH_API_GUIDE.md]
│   ├── POST /register
│   ├── POST /verify-email
│   ├── POST /login
│   ├── GET /google
│   ├── GET /google/callback
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   ├── GET /me
│   └── PUT /profile
│
├── doctor/auth/                         [DOCTOR_AUTH_API_GUIDE.md]
│   ├── POST /register
│   ├── POST /verify-email
│   ├── POST /login
│   ├── POST /submit-application
│   ├── POST /complete-profile
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   └── GET /google
│
├── salesperson/auth/                    [SALESPERSON_AUTH_API_GUIDE.md]
│   ├── POST /login
│   ├── POST /verify-otp
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   └── PATCH /2fa-settings
│
└── super-admin/
    ├── users/                           [USER_MANAGEMENT_API_GUIDE.md]
    │   ├── POST /admins
    │   ├── GET /admins
    │   ├── GET /admins/:id
    │   ├── PUT /admins/:id
    │   ├── DELETE /admins/:id
    │   ├── PATCH /admins/:id/status
    │   ├── GET /admins/stats
    │   ├── POST /salespersons
    │   ├── GET /salespersons
    │   ├── GET /salespersons/:id
    │   ├── PUT /salespersons/:id
    │   ├── DELETE /salespersons/:id
    │   ├── PATCH /salespersons/:id/status
    │   ├── GET /salespersons/stats
    │   └── GET /salesperson-tasks/performance
    │
    ├── doctors/                         [USER_MANAGEMENT_API_GUIDE.md - Section 4]
    │   ├── GET /applications
    │   ├── GET /applications/:id
    │   ├── PATCH /applications/:id/approve
    │   └── PATCH /applications/:id/reject
    │
    ├── branches/                        [ADMIN_API_COMPLETE_GUIDE.md]
    │   ├── POST /branches
    │   ├── GET /branches
    │   ├── GET /branches/:id
    │   ├── PUT /branches/:id
    │   ├── DELETE /branches/:id
    │   ├── POST /branches/:id/assign-admin
    │   ├── POST /branches/:id/assign-salesperson
    │   ├── DELETE /branches/:id/remove-admin
    │   ├── DELETE /branches/:id/remove-salesperson
    │   ├── GET /branches/stats
    │   └── GET /branches/:id/performance
    │
    └── permissions/                     [PERMISSIONS_RBAC_API_GUIDE.md]
        ├── GET /roles
        ├── GET /roles/:roleId
        ├── PUT /roles/:roleId
        ├── POST /roles/:roleId/permissions
        ├── DELETE /roles/:roleId/permissions
        ├── GET /permissions
        ├── POST /permissions
        ├── POST /users/assign-role
        └── GET /user-role
```

---

## 📊 Statistics

| Metric                               | Count |
| ------------------------------------ | ----- |
| **Total Guides**                     | 6     |
| **Total Endpoints**                  | 50+   |
| **Admin Endpoints**                  | 20+   |
| **Customer Auth Endpoints**          | 10    |
| **Doctor Auth Endpoints**            | 9     |
| **Salesperson Auth Endpoints**       | 6     |
| **User Management Endpoints**        | 14    |
| **Permissions Management Endpoints** | 9     |

---

## 🔐 Authentication & Authorization Summary

| Endpoint Group         | Auth Required | Auth Method | Authorization                          |
| ---------------------- | ------------- | ----------- | -------------------------------------- |
| Admin Auth             | ❌ No         | -           | -                                      |
| Customer Auth          | ✅ Yes        | SESSION     | email verification + session           |
| Doctor Auth            | ✅ Yes        | SESSION     | email verification + 2-step onboarding |
| Salesperson Auth       | ✅ Yes        | SESSION     | admin-created accounts                 |
| User Management        | ✅ Yes        | SESSION     | session-based authorization            |
| Branch Management      | ✅ Yes        | SESSION     | session-based authorization            |
| Permissions Management | ✅ Yes        | SESSION     | session-based authorization            |

---

## 🧪 Testing Guidelines

### Before You Start

1. Ensure server is running on port 5000
2. Verify MongoDB is connected
3. Check email service is configured
4. Verify Cloudinary is configured (for file uploads)

### Testing Order

1. **Start with Auth Endpoints**: Test admin/customer/doctor/salesperson login flows
2. **Test User Management**: Create and manage users
3. **Test Branch Management**: Create and manage branches
4. **Test Permissions**: Manage roles and permissions
5. **Integration Tests**: Test end-to-end workflows

### Rate Limiting

- Admin/Auth endpoints have rate limiting
- Max 5 login attempts per 15 minutes
- Max 3 password reset attempts per hour
- Check documentation for specific limits

### Performance Expectations

- **Fast Endpoints** (< 200ms): GET by ID, logout
- **Medium Endpoints** (< 500ms): Login, search, simple POST
- **Slow Endpoints** (< 3000ms): File uploads, batch operations

---

## 🐛 Common Issues & Solutions

### "Unauthorized - Session required"

- Ensure valid session cookie (connect.sid) is sent
- Check cookie is not expired (default 7 days)
- Login again to create new session
- Verify CORS is configured to allow credentials

### "Forbidden - Insufficient permissions"

- Verify user role/category has required permissions
- Check role assignment in database
- Admin category matters (super-admin vs branch-admin)

### Rate Limit Exceeded (429)

- Wait at least 1 minute before retrying
- Check rate limit configuration
- Consider staggering requests across time

### Email Not Received

- Verify email service configuration
- Check email address is valid
- Review server logs for errors

### File Upload Failures

- Check file size limits
- Verify file format is allowed
- Ensure Cloudinary credentials are correct

---

## 📖 How to Use These Guides

### For Manual Testing

1. Open guide for desired endpoint
2. Copy request example
3. Paste into Postman/Insomnia
4. Adjust data as needed
5. Send and verify response

### For Automated Testing

1. Use Postman collection examples
2. Create test scripts using provided request/response formats
3. Include validation checklist items
4. Monitor performance benchmarks

### For Documentation

1. Share guide with frontend team for integration
2. Reference for onboarding new developers
3. Use for API documentation in wiki
4. Include in development training

---

## 📝 Notes

- **Base URL**: `http://localhost:5000/api/`
- **Response Format**: All endpoints return standard JSON response with `success`, `statusCode`, `message`, `data`
- **Error Handling**: Comprehensive error responses with validation details
- **Security**: All authenticated endpoints require SESSION-BASED authentication with connect.sid cookie
- **Session Storage**: MongoDB (connect-mongo) stores all session data
- **Cookie**: connect.sid set with HttpOnly, Secure (production), SameSite=Strict flags
- **Database**: MongoDB required for all operations
- **File Uploads**: Cloudinary integration for image/document storage

---

## 🔄 Workflow Examples

### Admin Account Creation Flow

1. Admin logs in via `POST /api/admin/auth/login`
2. Super admin creates branch admin via `POST /api/admin/users/admin`
3. New admin receives credentials via email
4. New admin logs in via `POST /api/admin/auth/login`

### Doctor Onboarding Flow

1. Doctor registers via `POST /api/doctor/auth/register`
2. Doctor verifies email via `POST /api/doctor/auth/verify-email`
3. Doctor logs in via `POST /api/doctor/auth/login`
4. Doctor submits application via `POST /api/doctor/auth/submit-application`
5. Admin reviews documents (backend process)
6. Doctor completes profile via `POST /api/doctor/auth/complete-profile`
7. Doctor profile becomes active and visible

### Salesperson Account Flow

1. Super admin creates salesperson via `POST /api/admin/users/salesperson`
2. Salesperson receives credentials via email
3. Salesperson logs in via `POST /api/salesperson/auth/login`
4. Super admin manages salesperson via `/api/admin/users/salesperson` endpoints

---

## 📞 Support & Questions

For issues or questions regarding specific endpoints:

1. Check the relevant guide's "Common Issues" section
2. Review error response examples
3. Verify validation rules are met
4. Check server logs for detailed errors

---

**Last Updated:** December 18, 2025
**Version:** 2.0
**Status:** Complete & Production Ready
