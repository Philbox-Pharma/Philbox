# Quick Start Testing Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Choose Your Guide

Based on what you want to test, select from:

- **Admin Operations** → `ADMIN_API_COMPLETE_GUIDE.md`
- **Create Admin/Salesperson** → `USER_MANAGEMENT_API_GUIDE.md`
- **Manage Roles/Permissions** → `PERMISSIONS_RBAC_API_GUIDE.md`
- **Customer Authentication** → `CUSTOMER_AUTH_API_GUIDE.md`
- **Doctor Onboarding** → `DOCTOR_AUTH_API_GUIDE.md`
- **Salesperson Authentication** → `SALESPERSON_AUTH_API_GUIDE.md`
- **Complete Reference** → `README_COMPLETE.md`

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

### Authentication Endpoints

```
POST   /api/admin/auth/login
POST   /api/admin/auth/verify-otp
PATCH  /api/admin/auth/2fa-settings
POST   /api/customer/auth/register
POST   /api/customer/auth/login
POST   /api/doctor/auth/register
POST   /api/doctor/auth/login
POST   /api/salesperson/auth/login
POST   /api/salesperson/auth/verify-otp
```

### User Management

```
POST   /api/admin/users/admins                   # Create admin
GET    /api/admin/users/admins                   # List admins
GET    /api/admin/users/admins/:id               # Get admin
POST   /api/admin/users/salespersons             # Create salesperson
GET    /api/admin/users/salespersons             # List salespersons
```

### Branch Management

```
POST   /api/admin/branches                       # Create branch
GET    /api/admin/branches                       # List branches
GET    /api/admin/branches/:id                   # Get branch
PUT    /api/admin/branches/:id                   # Update branch
DELETE /api/admin/branches/:id                   # Delete branch
GET    /api/admin/branches/:id/performance       # Branch metrics
```

### Permissions Management

```
GET    /api/admin/roles                          # Get all roles
GET    /api/admin/permissions                    # Get all permissions
POST   /api/admin/permissions                    # Create permission
PUT    /api/admin/roles/:roleId                  # Update role
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

- **README.md** - Complete API map and overview
- **README_COMPLETE.md** - Complete API reference with frontend integration
- **ADMIN_API_COMPLETE_GUIDE.md** - Admin authentication and branch management
- **USER_MANAGEMENT_API_GUIDE.md** - User CRUD operations
- **PERMISSIONS_RBAC_API_GUIDE.md** - RBAC system
- **CUSTOMER_AUTH_API_GUIDE.md** - Customer authentication
- **DOCTOR_AUTH_API_GUIDE.md** - Doctor onboarding and authentication
- **SALESPERSON_AUTH_API_GUIDE.md** - Salesperson authentication with 2FA

---

## 💡 Pro Tips

1. **Save your token** in Postman environment variable for reuse
2. **Use Postman collections** provided in each guide
3. **Test auth first** - get token before testing protected endpoints
4. **Follow the order** - auth → create → read → update → delete
5. **Check error cases** - test with invalid data
6. **Monitor response times** - ensure they meet benchmarks
7. **Save test results** - document what you tested and results

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

**Happy Testing! 🎉**
