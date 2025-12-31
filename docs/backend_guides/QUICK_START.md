# Quick Start Testing Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Choose Your Guide

Based on what you want to test, select from:

- **Admin Operations** → `ADMIN_API_COMPLETE_GUIDE.md` (includes Socket.IO events)
- **Customer Operations** → `CUSTOMER_COMPLETE_API_GUIDE.md` (auth, profile, dashboard, addresses, search, reminders)
- **Doctor Operations** → `DOCTOR_COMPLETE_API_GUIDE.md` (auth, onboarding, application tracking, resubmit)
- **Salesperson Operations** → `SALESPERSON_COMPLETE_API_GUIDE.md` (includes task management & Socket.IO events)

### Step 2: Open Postman

1. Create new request
2. Select method (GET, POST, PUT, DELETE, PATCH)
3. Copy endpoint URL from guide
4. Copy request body from guide
5. Send request

### Step 3: Verify Response

1. Check status code matches expected
2. Verify response structure matches guide
3. Check error messages for validation errors
4. Compare with examples in guide

---

## 🔗 Quick Endpoint Reference

### Admin Authentication

```
POST   /api/admin/auth/login                    # Login with email/password
POST   /api/admin/auth/verify-otp               # Verify OTP (if 2FA enabled)
POST   /api/admin/auth/forget-password          # Request password reset
POST   /api/admin/auth/reset-password           # Reset password with token
POST   /api/admin/auth/logout                   # Logout and destroy session
PATCH  /api/admin/auth/2fa-settings             # Enable/disable 2FA
GET    /api/admin/auth/me                       # Get current admin profile
```

### Customer Authentication

```
POST   /api/customer/auth/register              # Register new customer
POST   /api/customer/auth/verify-email          # Verify email with token
POST   /api/customer/auth/login                 # Login with email/password
GET    /api/customer/auth/google                # Google OAuth login
GET    /api/customer/auth/google/callback       # Google OAuth callback
POST   /api/customer/auth/forget-password       # Request password reset
POST   /api/customer/auth/reset-password        # Reset password with token
POST   /api/customer/auth/logout                # Logout and destroy session
GET    /api/customer/auth/me                    # Get current customer profile
PUT    /api/customer/auth/profile               # Update customer profile
```

### Doctor Authentication & Onboarding

```
POST   /api/doctor/auth/register                        # Register new doctor
POST   /api/doctor/auth/verify-email                    # Verify email with token
POST   /api/doctor/auth/login                           # Login with email/password
GET    /api/doctor/auth/google                          # Google OAuth login
GET    /api/doctor/auth/google/callback                 # Google OAuth callback
POST   /api/doctor/auth/forget-password                 # Request password reset
POST   /api/doctor/auth/reset-password                  # Reset password with token
POST   /api/doctor/auth/logout                          # Logout and destroy session
GET    /api/doctor/auth/me                              # Get current doctor profile

POST   /api/doctor/onboarding/submit-application        # Submit documents for verification
GET    /api/doctor/onboarding/application-status        # Check application status
POST   /api/doctor/onboarding/resubmit-application      # Resubmit after rejection
POST   /api/doctor/onboarding/complete-profile          # Complete profile after approval
```

### Salesperson Authentication

```
POST   /api/salesperson/auth/login              # Login with email/password
POST   /api/salesperson/auth/verify-otp         # Verify OTP (if 2FA enabled)
POST   /api/salesperson/auth/forget-password    # Request password reset
POST   /api/salesperson/auth/reset-password     # Reset password with token
POST   /api/salesperson/auth/logout             # Logout and destroy session
PATCH  /api/salesperson/auth/2fa-settings       # Enable/disable 2FA
GET    /api/salesperson/auth/me                 # Get current salesperson profile
```

### Salesperson Task Management

```
GET    /api/salesperson/tasks                   # Get my assigned tasks
GET    /api/salesperson/tasks/statistics        # Get my task statistics
GET    /api/salesperson/tasks/:id               # Get task details by ID
PUT    /api/salesperson/tasks/:id/status        # Update task status
POST   /api/salesperson/tasks/:id/updates       # Add comment to task
```

### Admin Task Management

```
POST   /api/admin/salesperson-tasks             # Create new task for salesperson
GET    /api/admin/salesperson-tasks             # Get all tasks with filters
GET    /api/admin/salesperson-tasks/statistics  # Get task statistics
GET    /api/admin/salesperson-tasks/:id         # Get task details by ID
PUT    /api/admin/salesperson-tasks/:id         # Update task details
DELETE /api/admin/salesperson-tasks/:id         # Delete task
POST   /api/admin/salesperson-tasks/:id/updates # Add comment to task
```

### Admin User Management

```
POST   /api/admin/users/admins                  # Create new admin
GET    /api/admin/users/admins                  # List all admins with pagination
GET    /api/admin/users/admins/:id              # Get admin details by ID
PUT    /api/admin/users/admins/:id              # Update admin details
DELETE /api/admin/users/admins/:id              # Delete admin
PATCH  /api/admin/users/admins/:id/status       # Activate/suspend admin
GET    /api/admin/users/admins/stats            # Get admin statistics
POST   /api/admin/users/salespersons            # Create new salesperson
GET    /api/admin/users/salespersons            # List all salespersons
GET    /api/admin/users/salespersons/:id        # Get salesperson details by ID
PUT    /api/admin/users/salespersons/:id        # Update salesperson details
DELETE /api/admin/users/salespersons/:id        # Delete salesperson
PATCH  /api/admin/users/salespersons/:id/status # Activate/suspend salesperson
GET    /api/admin/users/salespersons/stats      # Get salesperson statistics
GET    /api/admin/users/salesperson-tasks/performance # Salesperson task performance
```

### Admin Customer Management

```
GET    /api/admin/customers                     # List all customers with filters
GET    /api/admin/customers/:id                 # Get customer details by ID
PUT    /api/admin/customers/:id                 # Update customer details
DELETE /api/admin/customers/:id                 # Delete customer
PATCH  /api/admin/customers/:id/status          # Activate/suspend customer
GET    /api/admin/customers/stats               # Get customer statistics
```

### Admin Doctor Management

```
GET    /api/admin/doctors/applications          # List doctor applications
GET    /api/admin/doctors/applications/:id      # Get application details
PATCH  /api/admin/doctors/applications/:id/approve # Approve doctor application
PATCH  /api/admin/doctors/applications/:id/reject  # Reject doctor application
GET    /api/admin/doctors                       # List all doctors
GET    /api/admin/doctors/:id                   # Get doctor details by ID
PUT    /api/admin/doctors/:id                   # Update doctor details
DELETE /api/admin/doctors/:id                   # Delete doctor
PATCH  /api/admin/doctors/:id/status            # Activate/suspend doctor
GET    /api/admin/doctors/stats                 # Get doctor statistics
```

### Branch Management

```
POST   /api/admin/branches                      # Create new branch
GET    /api/admin/branches                      # List all branches with pagination
GET    /api/admin/branches/:id                  # Get branch details by ID
PUT    /api/admin/branches/:id                  # Update branch details
DELETE /api/admin/branches/:id                  # Delete branch
POST   /api/admin/branches/:id/assign-admin     # Assign admin to branch
POST   /api/admin/branches/:id/assign-salesperson # Assign salesperson to branch
DELETE /api/admin/branches/:id/remove-admin     # Remove admin from branch
DELETE /api/admin/branches/:id/remove-salesperson # Remove salesperson from branch
GET    /api/admin/branches/stats                # Get branch statistics
GET    /api/admin/branches/:id/performance      # Get branch performance metrics
```

### Permissions & RBAC Management

```
GET    /api/admin/roles                         # Get all roles
GET    /api/admin/roles/:roleId                 # Get role details by ID
PUT    /api/admin/roles/:roleId                 # Update role details
POST   /api/admin/roles/:roleId/permissions     # Add permissions to role
DELETE /api/admin/roles/:roleId/permissions     # Remove permissions from role
GET    /api/admin/permissions                   # Get all permissions
POST   /api/admin/permissions                   # Create new permission
POST   /api/admin/users/assign-role             # Assign role to user
GET    /api/admin/users/:userId/role            # Get user's role
```

---

## 📝 Test Template

**1. Test Name:** [What you're testing]

**2. Request:**

```
Method: POST
URL: http://localhost:5000/api/...
Headers:
  Content-Type: application/json
  Cookie: connect.sid=<session_value> (if authenticated)

Body:
{
  "field": "value"
}
```

**3. Expected Response:**

```
Status: 200
Headers:
  Set-Cookie: connect.sid=<session_value>; Path=/; HttpOnly; Secure
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

---

## 🔒 Session-Based Authentication

All endpoints use SESSION-BASED authentication, NOT JWT tokens:

```
1. Login/Register endpoint creates session
2. Server sends back: Set-Cookie: connect.sid=<session_value>
3. Client stores cookie automatically
4. Client sends back: Cookie: connect.sid=<session_value> in subsequent requests
5. Session stored in MongoDB via connect-mongo
6. Session expires after 7 days by default
```

**Important:** In Postman, enable "Automatically follow redirects" and ensure cookies are being stored.

---

## 📋 Common Request/Response Patterns

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    "user": {
      /* user object */
    },
    "nextStep": "dashboard"
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "data": null
}
```

### Authentication Required

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authenticated - No valid session",
  "data": null
}
```

---

## ⚡ Testing Tips

1. **Session Expiry**: Sessions last 7 days. After that, you need to login again.
2. **Cookie Handling**: Your HTTP client (Postman, curl, browser) should automatically handle cookies. Make sure it's enabled.
3. **CORS**: The frontend and backend must have matching CORS configuration to allow credentials.
4. **Reset Session**: Clear cookies between test scenarios using Postman's cookie manager.
5. **Check Response Data**: Each endpoint returns the actual model fields (not a generic "user" object).
6. **Activity Logs**: Admin actions are logged in AdminActivityLog collection for audit trail.

**4. Actual Response:**
[Paste actual response here]

**5. Pass/Fail:** ✅ Pass / ❌ Fail

---

## 🔑 Common Headers

### No Authentication Required

```json
{
  "Content-Type": "application/json"
}
```

### With Session Cookie

```json
{
  "Content-Type": "application/json",
  "Cookie": "connect.sid=s%3Axxxxx"
}
```

### File Upload with Session

```json
{
  "Content-Type": "multipart/form-data",
  "Cookie": "connect.sid=s%3Axxxxx"
}
```

---

## 🔐 Creating a Session

### 1. Login First

```
POST http://localhost:5000/api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

### 2. Server Responds with Session Cookie

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "nextStep": "verify-otp"
  }
}
Set-Cookie: connect.sid=s%3Axxxxx; Path=/; HttpOnly; Secure; SameSite=Strict
```

### 3. Cookie Automatically Sent in Subsequent Requests

Cookie is automatically stored by browser/client and sent with all requests to same origin.

---

## 🧪 First Test Flow

### Test 1: Admin Login + Verify OTP

```
POST /api/admin/auth/login
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
Expected: 200 with OTP sent (if 2FA enabled)

POST /api/admin/auth/verify-otp
{
  "otp": "123456"
}
Expected: 200 with session created (Set-Cookie header)
```

### Test 2: Create Branch (Session Auto-Sent)

```
POST /api/admin/branches
{
  "name": "Test Branch",
  "city": "Karachi",
  "country": "Pakistan",
  "street": "123 Main St",
  "phone_number": "+1234567890",
  "email": "branch@example.com"
}
Expected: 201 with branch data
```

### Test 3: Get All Branches (Session Auto-Sent)

```
GET /api/admin/branches?page=1&limit=10
Expected: 200 with branch list
(Session cookie sent automatically)
```

---

## ⚠️ Common Errors & Solutions

| Error                 | Solution                              |
| --------------------- | ------------------------------------- |
| 401 Unauthorized      | No valid session - login again        |
| 403 Forbidden         | User lacks required role/permissions  |
| 400 Bad Request       | Invalid data in request body          |
| 404 Not Found         | Resource doesn't exist                |
| 429 Too Many Requests | Rate limit exceeded - wait 15 minutes |
| 429 Too Many Requests | Rate limited - wait and retry         |
| 500 Server Error      | Server issue - check logs             |

---

## 📊 Testing Priorities

### Must Test (Critical Path)

1. Admin login
2. Create admin/salesperson
3. Create branch
4. List and get operations

### Should Test (Important)

1. Update operations
2. Delete operations
3. Search functionality
4. Pagination

### Nice to Test (Edge Cases)

1. Validation errors
2. Duplicate entries
3. Rate limiting
4. Permission denied

---

## 🎯 Performance Expectations

| Operation            | Time     |
| -------------------- | -------- |
| Login                | < 400ms  |
| Get by ID            | < 100ms  |
| List with pagination | < 300ms  |
| Create               | < 500ms  |
| Update               | < 300ms  |
| Delete               | < 200ms  |
| File upload          | < 3000ms |

---

## 📚 Full Documentation

For complete details, refer to specific guides:

### Core API Guides

- **README.md** - Complete API map and overview of all guides
- **ADMIN_API_COMPLETE_GUIDE.md** - Admin auth, user management, branch management, permissions & RBAC, task management, Socket.IO events (49 endpoints)
- **CUSTOMER_AUTH_API_GUIDE.md** - Customer registration, authentication, profile management (10 endpoints)
- **DOCTOR_AUTH_API_GUIDE.md** - Doctor registration, onboarding, document submission, authentication (9 endpoints)
- **SALESPERSON_COMPLETE_API_GUIDE.md** - Salesperson auth with 2FA, task management, Socket.IO events (12 endpoints)

### Additional Resources

- **IMPLEMENTATION_NEXT_STEPS.md** - Next steps for backend implementation and feature development
- **Overview.txt** - High-level overview of backend architecture and features
- **socket-test-client.html** - HTML test client for Socket.IO real-time events testing

---

## 💡 Pro Tips

1. **Save your session** - In Postman, cookies are saved automatically for reuse
2. **Use Postman collections** - Organize your tests by guide/feature
3. **Test auth first** - Login and establish session before testing protected endpoints
4. **Follow the order** - auth → create → read → update → delete
5. **Check error cases** - Test with invalid data to verify validation
6. **Monitor response times** - Ensure they meet benchmarks above
7. **Save test results** - Document what you tested and results for regression testing

---

## ✅ Pre-Testing Checklist

- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] Sample data exists (at least 1 admin account)
- [ ] Email service configured
- [ ] Cloudinary configured (for file uploads)
- [ ] Postman installed
- [ ] All required headers known

---

## 🚦 Traffic Light System

🟢 **Green:** Testing complete, all tests pass
🟡 **Yellow:** Testing in progress, some tests fail
🔴 **Red:** Testing blocked, critical failure

---

## 📅 Version History

**Version 2.1** (December 28, 2025)

- ✅ Verified all request bodies against DTO validation schemas
- ✅ Verified all response structures against mongoose models
- ✅ Fixed service populate() bugs to match model field names
- ✅ All guides now 100% accurate to actual codebase

**Version 2.0** (December 18, 2025)

- Initial comprehensive guide consolidation
- Unified admin and salesperson guides
- Removed redundant sections

---

**Happy Testing! 🎉**
