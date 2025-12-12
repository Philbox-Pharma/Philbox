# Salesperson Authentication API Testing Guide

## Overview

Complete testing guide for Salesperson Authentication endpoints. Uses **SESSION-BASED** authentication. Salespersons are created by super-admin via User Management API (no self-registration).

---

## Base URL

```
http://localhost:5000/api/salesperson/auth
```

---

## Authentication Method

- **Type:** Session-Based (NOT JWT)
- **Session Storage:** MongoDB (connect-mongo)
- **Cookie:** `connect.sid` (HttpOnly, Secure in production)

## Key Points

- **Creation**: Salespersons are created by super-admin via `/api/super-admin/users/salesperson` endpoint
- **Initial Access**: Salespersons receive credentials via email from admin
- **Authentication**: Uses SESSION-BASED authentication with connect.sid cookie
- **No Self-Registration**: Salespersons cannot register themselves

---

## Endpoints

### 1. Salesperson Login

**Endpoint:** `POST /login`

**Description:** Authenticate salesperson with email and password (provided by admin during creation).

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "jane.smith@sales.com",
  "password": "InitialPassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "salesperson": {
      "_id": "65a4b5c6d7e8f9g0h1i2j3",
      "fullName": "Jane Smith",
      "email": "jane.smith@sales.com",
      "contactNumber": "+1234567890",
      "gender": "Female",
      "status": "active",
      "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane+Smith",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Jane+Smith",
      "roleId": "65a0b1c2d3e4f5g6h7i8j9"
    },
    "nextStep": "dashboard"
  }
}
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly; Secure
Session Data Stored:
  - session.salespersonId = salesperson._id
  - session.role = "salesperson"
  - session.status = salesperson.status
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Email and password are required"
}
```

**Error Response (401 - Unauthorized):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid Credentials"
}
```

**Error Response (403 - Account Suspended):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Your account is suspended. Contact Admin."
}
```

**Error Response (403 - Account Blocked):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Your account is blocked."
}
```

**Validation Rules:**

- Email is required and must be valid format
- Password is required
- Account status must be "active" (not suspended or blocked)
- Email must exist in database
- Password must match stored passwordHash

---

### 2. Forget Password

**Endpoint:** `POST /forget-password`

**Description:** Request password reset. Salesperson will receive reset email with token.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "jane.smith@sales.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully"
}
```

**Email Sent to Salesperson:**

```
Subject: Password Reset Request
Body: Click the link with token: abc123def456... to reset your password
Link expires in: 10 minutes
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

**Validation Rules:**

- Email is required and must be valid format
- Email must exist in database
- Salesperson must be registered

---

### 3. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset password using token sent in reset email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "token": "abc123def456ghi789",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully"
}
```

**Error Response (400 - Invalid Token):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired token"
}
```

**Validation Rules:**

- Token is required
- New password must be at least 8 characters
- New password must be different from old password
- Token must not be expired (10 minute expiry)
- Token must be valid hash

---

### 4. Logout

**Endpoint:** `POST /logout`

**Description:** Logout salesperson and destroy session.

**Authentication:** ✅ Required (Session-Based)

**Request Headers:**

```json
{
  "Content-Type": "application/json",
  "Cookie": "connect.sid=<session_id>"
}
```

**Request Body:**

```json
{}
```

**Success Response (200):**

````json
{
**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful"
}
````

**Error Response (401 - Missing Session):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authenticated - No valid session"
}
```

---

## Account Management Flow

```
┌──────────────────────────────────────────────────┐
│ 1. Admin Creates Salesperson Account             │
│    via POST /api/super-admin/users/salesperson   │
│    - Generates initial password                  │
│    - Sends credentials via email                 │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 2. Salesperson Receives Email                    │
│    - Email contains username/password            │
│    - Email contains login instructions           │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 3. Salesperson First Login                       │
│    POST /api/salesperson/auth/login              │
│    - Uses credentials from email                 │
│    - Creates SESSION (connect.sid cookie)        │
│    - Account status checked (must be active)     │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│ 4. Ongoing Operations                            │
│    - Use SESSION cookie for authenticated requests
│    - Can reset password anytime                  │
│    - Can logout (session destroyed)              │
│    - Session expires after 7 days                │
└──────────────────────────────────────────────────┘
```

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Valid salesperson account created via super-admin
- [ ] Email service configured for password reset notifications
- [ ] Salesperson account status is "active"
- [ ] Session middleware configured with connect-mongo
- [ ] SESSION_SECRET configured in .env

### Login Tests

- [ ] Login with correct email and password succeeds
- [ ] Login returns session cookie (connect.sid)
- [ ] Login sets HttpOnly cookie flag
- [ ] Login fails with incorrect password
- [ ] Login fails with non-existent email
- [ ] Login fails with inactive/suspended account
- [ ] Login fails with missing email
- [ ] Login fails with missing password
- [ ] Session contains correct salespersonId
- [ ] Session contains role='salesperson'
- [ ] Session contains status field

### Password Reset Tests

- [ ] Forget password with valid email succeeds
- [ ] Forget password sends reset email
- [ ] Forget password fails with non-existent email
- [ ] Forget password fails with invalid email format
- [ ] Reset password with valid token succeeds
- [ ] Reset password fails with invalid token
- [ ] Reset password fails with expired token (>10 minutes)
- [ ] New password is different from old password
- [ ] New password validates minimum length (8 chars)
- [ ] Can login with new password after reset
- [ ] Reset token is single-use (cannot reuse)

### Logout Tests

- [ ] Logout with valid session succeeds
- [ ] Logout fails without session (401)
- [ ] Logout fails with expired session (401)
- [ ] Session destroyed after logout
- [ ] Subsequent requests after logout return 401
- [ ] Session cookie cleared after logout

### Security Tests

- [ ] Rate limiting on login (prevent brute force)
- [ ] Rate limiting on forget-password
- [ ] Rate limiting on reset-password
- [ ] Password not returned in responses
- [ ] Password hash not exposed
- [ ] Reset token is single-use
- [ ] Session expires after 7 days
- [ ] HttpOnly flag prevents JavaScript access
- [ ] Secure flag set in HTTPS (production)
- [ ] SameSite attribute set to Strict

### Account Status Tests

- [ ] Login succeeds with "active" status
- [ ] Login fails with "suspended" status
- [ ] Login fails with "blocked" status
- [ ] Admin can change status and affect login

### Session Tests

- [ ] Login creates valid session (connect.sid cookie)
- [ ] Session cookie is set with HttpOnly flag
- [ ] Session contains salespersonId, role, status
- [ ] Session stored in MongoDB
- [ ] Logout destroys session
- [ ] Subsequent requests without session are rejected (401)
- [ ] Session persists across multiple requests
- [ ] Session expires after 7 days

### Cookie Tests

- [ ] connect.sid cookie set on successful login
- [ ] Cookie path is "/"
- [ ] Cookie has HttpOnly flag
- [ ] Cookie not accessible via JavaScript
- [ ] Cookie sent in subsequent requests automatically
- [ ] Cookie cleared on logout

### Edge Cases

- [ ] Login with email in different case works
- [ ] Login with extra whitespace in email fails
- [ ] Very long password accepted if valid
- [ ] Concurrent login requests handled correctly
- [ ] Session reuse on same browser works
- [ ] Session reuse on different browser not allowed

---

## Postman Collection Example

```json
{
  "info": {
    "name": "Salesperson Authentication API"
  },
  "item": [
    {
      "name": "Salesperson Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"jane.smith@sales.com\", \"password\": \"InitialPassword123!\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/salesperson/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "salesperson", "auth", "login"]
        }
      }
    },
    {
      "name": "Forget Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"jane.smith@sales.com\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/salesperson/auth/forget-password",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "salesperson", "auth", "forget-password"]
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:5000/api/salesperson/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "salesperson", "auth", "logout"]
        }
      }
    }
  ]
}
```

]
}

````

---

## Performance Benchmarks

| Endpoint | Method | Expected Response Time |
|----------|--------|----------------------|
| Login | POST | < 400ms |
| Forget Password | POST | < 300ms (async email) |
| Reset Password | POST | < 300ms |
| Logout | POST | < 100ms |

---

## Rate Limiting

All endpoints are protected with rate limiting via `authRoutesLimiter` middleware:

- **Login**: 5 attempts per 15 minutes per IP
- **Forget Password**: 3 attempts per hour per email
- **Reset Password**: 3 attempts per hour per email
- **Logout**: No rate limit (always allowed)

---

## Response Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Successful authentication |
| 400 | Bad Request | Validation error or invalid token |
| 401 | Unauthorized | Missing/invalid token or wrong credentials |
| 403 | Forbidden | Account inactive/suspended |
| 404 | Not Found | Salesperson email not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Common Issues

### "Invalid email or password"
**Problem:** Login fails even with correct credentials
**Solutions:**
1. Check email format (should be lowercase)
2. Verify password length (at least 8 characters)
3. Confirm account status is "active"
4. Check email exists in database
5. Verify session store (MongoDB) is running
6. Check SESSION_SECRET is configured

### "Your account is inactive"
**Problem:** Login fails with status 403
**Solution:** Contact admin to reactivate account or change status

### "Invalid or expired reset token"
**Problem:** Password reset fails
**Solutions:**
1. Check token hasn't expired (10-minute window)
2. Request new token via forget-password endpoint
3. Verify email matches
4. Token is single-use - cannot reuse

### Rate Limit Exceeded
**Problem:** Getting 429 Too Many Requests
**Solution:** Wait 15 minutes before retrying login attempts

### "Unauthorized - No valid session"
**Cause:** Session not created or expired
**Solution:**
- Ensure login was successful and status code is 200
- Check that connect.sid cookie is present in response headers
- Verify session storage is configured correctly
- Check MongoDB connection for session store

### "Cookie not being set"
**Cause:** Session configuration issue or protocol mismatch
**Solution:**
- Ensure NODE_ENV is "development" or COOKIE_SECURE=false
- Verify Postman "Send cookies with requests" is enabled
- Check that Content-Type header is application/json
- Ensure SESSION_SECRET is configured

### "Session lost between requests"
**Cause:** Cookie not being sent with subsequent requests
**Solution:**
- In Postman: Add "Cookie" header manually from login response
- Or: Enable automatic cookie handling in Postman
- Verify "Cookie" header is sent with each authenticated request

---

## Environment Variables

Configure these in `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/philbox

# Session Configuration
SESSION_SECRET=your_session_secret_key_min_32_chars
SESSION_TIMEOUT=604800000  # 7 days in milliseconds
COOKIE_SAME_SITE=Strict
COOKIE_SECURE=false  # Set to true in production (HTTPS only)
COOKIE_HTTP_ONLY=true

# Email Configuration
SENDER_EMAIL=no-reply@philbox.com
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for redirects)
CLIENT_URL=http://localhost:3000

# Rate Limiting
AUTH_RATE_LIMIT_WINDOW=15  # minutes
AUTH_RATE_LIMIT_MAX_REQUESTS=5
````

---

## Performance Notes

- **Session Load:** Each login stores ~1KB in MongoDB session store
- **Email Verification:** Asynchronous, does not block request
- **Rate Limiting:** 5 attempts per 15 minutes per IP address
- **Session Lifetime:** 7 days, renewed on activity
- **Recommended Concurrent Users:** Session-based suitable for 50-100 concurrent users
- **For Scaling:** Consider Redis for session storage instead of MongoDB

---

## Integration Example (cURL)

### Login and Save Cookie

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/salesperson/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.smith@sales.com","password":"InitialPassword123!"}'
```

### Use Saved Cookie in Subsequent Request

```bash
curl -b cookies.txt -X GET http://localhost:5000/api/salesperson/profile
```

### Logout

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/salesperson/auth/logout
```

---

## Troubleshooting Checklist

- [ ] MongoDB is running and accessible
- [ ] Salesperson credentials exist in database (created by admin)
- [ ] Network request is being made to correct endpoint
- [ ] Content-Type is application/json
- [ ] Email notifications are working
- [ ] Session cookie is being set in response
- [ ] Subsequent requests include session cookie
- [ ] reset-password token hasn't expired (10 minutes)
- [ ] Account status is "active"
- [ ] Browser/Postman is configured to accept cookies

### Token Invalid After Logout

**Problem:** Token still works after logout
**Solution:** Token has expiration - can still be used until it expires. Implement token blacklist on backend if needed.
