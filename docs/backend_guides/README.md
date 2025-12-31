# Backend API Testing Guides - Complete Index

## Overview

This folder contains comprehensive testing guides for all backend API endpoints in the PHILBOX system. Each guide includes detailed endpoint documentation, request/response examples, validation rules, error cases, testing checklists, and performance benchmarks.

**Authentication Method:** SESSION-BASED (connect-mongo) with connect.sid cookie. NOT JWT tokens.

---

## 🚀 Quick Start

For quick testing commands and endpoint reference, see **[QUICK_START.md](./QUICK_START.md)**

---

## 📚 Available Guides

### 1. **ADMIN_API_COMPLETE_GUIDE.md**

**Coverage:** Complete admin operations including authentication, branch management, user management, permissions, customers, and salesperson tasks

**Key Features:**

- Admin authentication with conditional 2FA
- Branch CRUD operations with permissions
- Admin and Salesperson management
- Role-Based Access Control (RBAC)
- Customer management and analytics
- Salesperson task management
- Socket.IO real-time events for task updates
- Password reset functionality
- Session-based authentication (connect.sid)

---

### 2. **CUSTOMER_COMPLETE_API_GUIDE.md**

**Coverage:** Complete customer authentication, profile, dashboard, and health management

**Key Features:**

- Customer registration with email verification
- Login (email/password + Google OAuth)
- Profile management with image uploads
- Address management (CRUD operations)
- Dashboard with order history and appointments
- Search history tracking
- Medicine refill reminders
- Password reset functionality
- Session management
- Frontend integration examples

---

### 3. **DOCTOR_COMPLETE_API_GUIDE.md**

**Coverage:** Complete doctor authentication, onboarding, application tracking, and profile management

**Key Features:**

- Doctor registration with email verification
- Multi-step onboarding process
- Document submission for admin verification (CNIC, medical license, degrees)
- Application status tracking (pending/processing/approved/rejected)
- Resubmit functionality for rejected applications
- Admin comments and feedback system
- Email notifications on application status changes
- Profile completion (education, experience, specialization, consultation fees)
- Google OAuth authentication
- Onboarding state management with status transitions
- Frontend integration examples

---

### 4. **SALESPERSON_COMPLETE_API_GUIDE.md**

**Coverage:** Complete salesperson operations including authentication and task management

**Key Features:**

- Login with conditional 2FA
- OTP verification flow
- 2FA settings management (enable/disable)
- Task management (view, update status, add comments)
- Task statistics and filtering
- Socket.IO real-time events for task assignments and updates
- Password reset functionality
- Session management
- Frontend integration examples with React hooks

---

## 🗺️ Complete API Map

```
http://localhost:5000/api/

├── admin/auth/                          [ADMIN_API_COMPLETE_GUIDE.md]
│   ├── POST /login
│   ├── POST /verify-otp
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   └── PATCH /2fa-settings
│
├── customer/auth/                       [CUSTOMER_COMPLETE_API_GUIDE.md]
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
├── customer/                            [CUSTOMER_COMPLETE_API_GUIDE.md]
│   ├── addresses/
│   │   ├── POST /
│   │   ├── GET /
│   │   ├── GET /:id
│   │   ├── PUT /:id
│   │   ├── DELETE /:id
│   │   └── PATCH /:id/default
│   ├── dashboard/
│   │   └── GET /
│   ├── search-history/
│   │   ├── POST /
│   │   ├── GET /
│   │   └── DELETE /:id
│   └── refill-reminders/
│       ├── POST /
│       ├── GET /
│       ├── PUT /:id
│       └── DELETE /:id
│
├── doctor/auth/                         [DOCTOR_COMPLETE_API_GUIDE.md]
│   ├── POST /register
│   ├── POST /verify-email
│   ├── POST /login
│   ├── GET /google
│   ├── GET /google/callback
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── POST /logout
│   └── GET /me
│
├── doctor/onboarding/                   [DOCTOR_COMPLETE_API_GUIDE.md]
│   ├── POST /submit-application
│   ├── GET /application-status
│   ├── POST /resubmit-application
│   └── POST /complete-profile
│
├── salesperson/auth/                    [SALESPERSON_COMPLETE_API_GUIDE.md]
│   ├── POST /login
│   ├── POST /verify-otp
│   ├── POST /forget-password
│   ├── POST /reset-password
│   ├── GET /me
│   ├── POST /logout
│   └── PATCH /2fa-settings
│
├── salesperson/tasks/                   [SALESPERSON_COMPLETE_API_GUIDE.md]
│   ├── GET /
│   ├── GET /statistics
│   ├── GET /:id
│   ├── PUT /:id/status
│   └── POST /:id/updates
│
└── admin/
    ├── users/                           [ADMIN_API_COMPLETE_GUIDE.md]
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
    ├── doctors/                         [ADMIN_API_COMPLETE_GUIDE.md]
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
    └── permissions/                     [ADMIN_API_COMPLETE_GUIDE.md]
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

| Metric                            | Count |
| --------------------------------- | ----- |
| **Total Guides**                  | 4     |
| **Total Endpoints**               | 100+  |
| **Admin Endpoints**               | 49    |
| **Customer Endpoints (Total)**    | 27    |
| **Customer Auth Endpoints**       | 10    |
| **Customer Feature Endpoints**    | 17    |
| **Doctor Endpoints (Total)**      | 13    |
| **Doctor Auth Endpoints**         | 9     |
| **Doctor Onboarding Endpoints**   | 4     |
| **Salesperson Endpoints (Total)** | 12    |
| **Salesperson Auth Endpoints**    | 7     |
| **Salesperson Task Endpoints**    | 5     |

---

## 🔐 Authentication & Authorization Summary

| Feature                | Auth Required | Auth Method | Authorization                          |
| ---------------------- | ------------- | ----------- | -------------------------------------- |
| Admin Auth             | ❌ No         | -           | -                                      |
| Admin Operations       | ✅ Yes        | SESSION     | RBAC with roles and permissions        |
| Customer Auth          | ❌ No         | -           | -                                      |
| Customer Operations    | ✅ Yes        | SESSION     | email verification + session           |
| Doctor Auth            | ❌ No         | -           | -                                      |
| Doctor Operations      | ✅ Yes        | SESSION     | email verification + 2-step onboarding |
| Salesperson Auth       | ❌ No         | -           | -                                      |
| Salesperson Operations | ✅ Yes        | SESSION     | admin-created accounts + session       |
| User Management        | ✅ Yes        | SESSION     | RBAC with roles and permissions        |
| Branch Management      | ✅ Yes        | SESSION     | RBAC with roles and permissions        |
| Permissions Management | ✅ Yes        | SESSION     | RBAC with roles and permissions        |

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
4. Doctor submits application via `POST /api/doctor/onboarding/submit-application`
5. Doctor checks status via `GET /api/doctor/onboarding/application-status`
6. Admin reviews and approves/rejects application
   - If approved: Email notification sent to doctor
   - If rejected: Email with admin comments sent to doctor
7. If rejected: Doctor resubmits via `POST /api/doctor/onboarding/resubmit-application`
8. After approval: Doctor completes profile via `POST /api/doctor/onboarding/complete-profile`
9. Doctor profile becomes active and visible

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

**Last Updated:** December 31, 2025
**Version:** 2.2
**Status:** Complete & Production Ready
