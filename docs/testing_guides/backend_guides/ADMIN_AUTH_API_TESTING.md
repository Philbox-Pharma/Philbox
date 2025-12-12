# Admin Authentication API Testing Guide

## Overview

Complete testing guide for Admin Authentication endpoints. Uses **SESSION-BASED** authentication with OTP verification. All endpoints are rate-limited via `authRoutesLimiter` middleware.

---

## Base URL

```
http://localhost:5000/api/admin/auth
```

---

## Authentication Method

- **Type:** Session-Based (NOT JWT)
- **Session Storage:** MongoDB (connect-mongo)
- **Cookie:** `connect.sid` (HttpOnly, Secure in production)
- **Login Flow:** Email/Password → OTP sent to email → Verify OTP → Session created

---

## Endpoints

### 1. Admin Login (Step 1: Email & Password)

**Endpoint:** `POST /login`

**Description:** Authenticate admin with email and password. Sends OTP to registered email address.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent to email",
  "data": null
}
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly
Session Data Stored:
  - session.pendingAdminId = admin._id (for OTP verification step)
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid email or password format"
}
```

**Error Response (401 - Unauthorized):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

**Validation Rules:**

- Email must be valid format
- Password must be at least 8 characters
- Email is required
- Password is required

---

### 2. Verify OTP (Step 2: Complete Login)

**Endpoint:** `POST /verify-otp`

**Description:** Verify OTP sent to admin email. Completes the login process and creates authenticated session.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified successfully",
  "data": {
    "admin": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "name": "Admin Name",
      "email": "admin@example.com",
      "category": "super-admin",
      "status": "active",
      "phone_number": "+1234567890",
      "profile_img_url": "https://cloudinary.com/image.jpg"
    }
  }
}
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly; Secure
Session Data Stored:
  - session.adminId = admin._id
  - session.adminCategory = admin.category (super-admin|branch-admin)
  - session.adminEmail = admin.email
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired OTP"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Session expired. Please login again"
}
```

**Validation Rules:**

- Email is required
- OTP must be 6 digits
- OTP must match the one sent to email
- OTP must not be expired (typically 10 minutes)
- Session must still be valid (pendingAdminId must exist)

---

### 3. Forget Password

**Endpoint:** `POST /forget-password`

**Description:** Request password reset. Admin will receive password reset token via email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "admin@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset link sent to your email"
}
```

**Email Sent to Admin:**

```
Subject: Password Reset Request
Body: Click the link with token: abc123def456... to reset your password
Link expires in: 30 minutes
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Admin not found with this email"
}
```

**Validation Rules:**

- Email must be valid format
- Email must exist in database
- Admin account must be active (not suspended/blocked)

---

### 4. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset password using token sent to email. Creates new password for admin account.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "resetToken": "abc123def456ghi789",
  "newPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "admin": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "email": "admin@example.com",
      "name": "Admin Name",
      "status": "active"
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired reset token"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Admin not found"
}
```

**Validation Rules:**

- Email must be valid
- Reset token must be valid
- Reset token must not be expired (30 minute expiry)
- New password must be at least 8 characters
- New password must contain uppercase, lowercase, number, and special character
- New password must be different from old password

---

### 5. Logout

**Endpoint:** `POST /logout`

**Description:** Logout admin and invalidate session. Clears session cookie.

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

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

**Session Cleared:**

```
Header: Set-Cookie: connect.sid=; Path=/; Expires=<past_date>
Session Data: All session data deleted from MongoDB
```

**Error Response (401):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authenticated - No valid session"
}
```

**Validation Rules:**

- Valid session must exist (req.session.adminId)
- Session must not be already destroyed
- Admin must be in database

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Valid admin account exists with verified email
- [ ] Email service (Nodemailer) configured for OTP and reset emails
- [ ] Session middleware configured with connect-mongo

### Happy Path Tests (2-Step Login)

- [ ] Step 1: Login with valid credentials sends OTP to email
- [ ] Step 2: Verify OTP creates session and returns admin data
- [ ] Session cookie (connect.sid) is set correctly
- [ ] Session contains adminId, adminCategory, adminEmail
- [ ] Forget password sends reset email with token
- [ ] Reset password with valid token updates password
- [ ] Logout destroys session and clears cookie
- [ ] Subsequent requests without session are rejected

### Error Cases

- [ ] Login fails with invalid email format
- [ ] Login fails with wrong password
- [ ] Login fails with non-existent email
- [ ] Verify OTP fails with invalid OTP
- [ ] Verify OTP fails with expired OTP (>10 minutes)
- [ ] Verify OTP fails if login step was skipped
- [ ] Forget password fails with non-existent email
- [ ] Reset password fails with invalid token
- [ ] Reset password fails with expired token (>30 minutes)
- [ ] Logout fails without session
- [ ] Logout succeeds and subsequent calls fail (session destroyed)

### Security Tests

- [ ] Rate limiting on login (max 5 attempts per minute per IP)
- [ ] Rate limiting on verify-otp (max 5 attempts per minute)
- [ ] Rate limiting on forget-password
- [ ] Password is never returned in any response
- [ ] Reset token is one-time use only
- [ ] OTP is cleared after successful verification
- [ ] Session expires after 7 days
- [ ] HttpOnly flag on cookie prevents JavaScript access
- [ ] Secure flag on cookie in HTTPS (production)
- [ ] SameSite attribute set to Strict

---

## Postman Collection Example

```json
{
  "info": {
    "name": "Admin Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin Login",
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
          "raw": "{\"email\": \"admin@example.com\", \"password\": \"SecurePassword123!\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/admin/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "admin", "auth", "login"]
        }
      }
    }
  ]
}
```

---

## Environment Variables

Ensure these are set in `.env` file:

```env
# Database
MONGO_URI=mongodb://localhost:27017/philbox

# Session
SESSION_SECRET=your_session_secret_key_min_32_chars
SESSION_TIMEOUT=7d

# Authentication
OTP_EXPIRY_MINUTES=10
RESET_TOKEN_EXPIRY_MINUTES=30

# Email
NODEMAILER_SERVICE=gmail
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password

# Server
NODE_ENV=development
PORT=5000
```

---

## Common Issues

### Rate Limit Error

**Problem:** Getting 429 Too Many Requests
**Solution:** Wait at least 1 minute before retrying (rate limit resets per minute). Check `authRoutesLimiter` configuration in code.

### Session Not Found

**Problem:** Getting 401 "No valid session" after login
**Solution:** Ensure connect.sid cookie is sent in subsequent requests. Check browser/client is storing and sending cookies.

### OTP Invalid After 10 Minutes

**Problem:** Previously valid OTP now fails
**Solution:** This is expected behavior. OTP expires after 10 minutes. Request new OTP by logging in again.

### Email Not Received

**Problem:** OTP or reset email not arriving
**Solution:**

1. Check email configuration in `.env` file
2. Verify Nodemailer SMTP credentials are correct
3. Check spam/junk folder
4. Check server logs for email sending errors

### Session Lost on Page Refresh

**Problem:** Session exists but is lost after page refresh in frontend
**Solution:** Ensure cookies are being persisted. Check browser cookie settings and CORS configuration.

### Reset Token Invalid

**Problem:** Token is expired or doesn't match
**Solution:** Token expires after 30 minutes. Request new password reset. Each reset email generates unique token.

---

## Performance Notes

- Login (Step 1) should respond within 500ms
- OTP sending is asynchronous (non-blocking)
- Verify OTP (Step 2) should complete within 300ms
- Session lookup should be <100ms
- Email sending runs in background (doesn't block response)
- Reset token validation <50ms
- Session destruction (logout) <100ms
