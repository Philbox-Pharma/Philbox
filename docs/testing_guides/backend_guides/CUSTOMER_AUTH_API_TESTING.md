# Customer Authentication API Testing Guide

## Overview

Complete testing guide for Customer Authentication endpoints. Uses **SESSION-BASED** authentication with email verification. All endpoints are rate-limited via `authRoutesLimiter` middleware.

---

## Base URL

```
http://localhost:5000/api/customer/auth
```

---

## Authentication Method

- **Type:** Session-Based (NOT JWT)
- **Session Storage:** MongoDB (connect-mongo)
- **Cookie:** `connect.sid` (HttpOnly, Secure in production)
- **Registration Flow:** Email/Password → Email verification token → Login → Session created
- **OAuth:** Google OAuth with redirect flow (creates session after callback)

---

## Endpoints

### 1. Register Customer

**Endpoint:** `POST /register`

**Description:** Register new customer account. Sends verification email with token.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "fullName": "John Doe",
  "contactNumber": "+1234567890"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Customer registered successfully. Please check your email to verify account.",
  "data": {
    "customer": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "fullName": "John Doe",
      "email": "customer@example.com",
      "contactNumber": "+1234567890",
      "is_Verified": false,
      "account_status": "active",
      "profile_img_url": null
    }
  }
}
```

**Email Sent to Customer:**

```
Subject: Verify your Email
Body: Click the verification link with token: abc123def456...
Link expires in: 24 hours
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Passwords do not match"
}
```

**Error Response (409 - Conflict):**

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered"
}
```

**Validation Rules:**

- Email must be valid format and unique
- Password must be at least 8 characters
- Passwords must match (password === confirmPassword)
- fullName is required (2-50 characters)
- contactNumber must be valid format
- Password must contain uppercase, lowercase, number, special character

---

### 2. Verify Email

**Endpoint:** `GET /verify-email?token=abc123def456`

**Description:** Verify customer email using token sent in registration email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Query Parameters:**

```
token: verification_token_from_email (required)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "customer": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "fullName": "John Doe",
      "email": "customer@example.com",
      "is_Verified": true,
      "account_status": "active"
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired verification token"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Customer not found"
}
```

**Validation Rules:**

- Token must be valid
- Token must not be expired (24 hour expiry)
- Customer must exist in database
- Email must not be already verified

---

### 3. Resend Verification Email

**Endpoint:** `POST /resend-verification-email`

**Description:** Request new verification email with fresh token.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "customer@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verification email sent. Please check your email.",
  "data": null
}
```

**Email Sent to Customer:**

```
Subject: Verify your Email
Body: New verification link with token: xyz789abc123...
Link expires in: 24 hours
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Customer not found"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Email already verified"
}
```

**Validation Rules:**

- Email must be valid format
- Customer with email must exist
- Email must not be already verified

---

### 4. Login Customer

**Endpoint:** `POST /login`

**Description:** Authenticate customer with email and password. Creates session.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "nextStep": "address-setup",
    "customer": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "fullName": "John Doe",
      "email": "customer@example.com",
      "contactNumber": "+1234567890",
      "is_Verified": true,
      "account_status": "active",
      "profile_img_url": "https://cloudinary.com/image.jpg"
    }
  }
}
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly; Secure
Session Data Stored:
  - session.customerId = customer._id
  - session.role = "customer"
  - session.status = customer.account_status
```

**Next Step Determination:**

- If `is_Verified = false`: Customer must verify email first
- If no address set: `nextStep = "address-setup"`
- If address set: `nextStep = "dashboard"`

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

**Error Response (403 - Account Status):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Account is suspended. Please contact support."
}
```

**Validation Rules:**

- Email must be valid format
- Password must be provided
- Email must be registered
- Password must match stored password hash
- Account must be verified
- Account status must be "active" (not suspended or blocked)

---

### 5. Forget Password

**Endpoint:** `POST /forget-password`

**Description:** Request password reset. Customer will receive reset token via email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "customer@example.com"
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

**Email Sent to Customer:**

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
  "message": "Customer not found with this email"
}
```

**Validation Rules:**

- Email must be valid format
- Email must exist in database
- Customer account must be verified

---

### 6. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset password using token sent to email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "customer@example.com",
  "resetToken": "abc123def456ghi789",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "customer": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "email": "customer@example.com",
      "fullName": "John Doe"
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
  "message": "Customer not found"
}
```

**Validation Rules:**

- Email must be valid
- Reset token must be valid
- Reset token must not be expired (30 minute expiry)
- Passwords must match
- New password must be at least 8 characters
- New password must be different from old password

---

### 7. Google OAuth Callback

**Endpoint:** `GET /auth/google/callback?code=auth_code`

**Description:** Google OAuth callback. Handles OAuth authentication and creates/updates customer.

**Request Parameters:**

```
code: authorization_code_from_google (required)
state: state_parameter_for_security (required)
```

**Success Response (302 Redirect):**

```
Redirect to: http://frontend:3000/auth/callback?sessionId=<session_id>&status=success
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly; Secure
Session Data Stored:
  - session.customerId = customer._id
  - session.role = "customer"
  - session.status = "active"
```

**If New Customer (First OAuth Login):**

- Customer account created with Google profile data
- Account is automatically verified
- Awaits address setup for first login

**If Existing Customer:**

- OAuth ID linked to account
- Session created
- Login completes

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid authorization code"
}
```

---

### 8. Logout Customer

**Endpoint:** `POST /logout`

**Description:** Logout customer and invalidate session. Clears session cookie.

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

- Valid session must exist (req.session.customerId)
- Session must not be already destroyed

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Email service (Nodemailer) configured
- [ ] Google OAuth credentials configured
- [ ] Session middleware with connect-mongo enabled

### Registration Flow Tests

- [ ] Register with valid data creates account (is_Verified = false)
- [ ] Registration sends verification email
- [ ] Verify email with valid token marks account as verified
- [ ] Verify email fails with expired token (>24 hours)
- [ ] Register fails with duplicate email
- [ ] Register fails with invalid email format
- [ ] Register fails with mismatched passwords
- [ ] Resend verification email sends new token
- [ ] Resend fails if already verified

### Login Flow Tests

- [ ] Login with valid credentials creates session
- [ ] Session cookie (connect.sid) is set
- [ ] Session contains customerId, role, status
- [ ] Login fails with wrong password
- [ ] Login fails with non-existent email
- [ ] Login fails if email not verified
- [ ] Login fails if account suspended
- [ ] Login succeeds with verified account
- [ ] nextStep correctly determined (address-setup or dashboard)

### Password Reset Tests

- [ ] Forget password sends reset email
- [ ] Reset password with valid token updates password
- [ ] Reset password fails with invalid token
- [ ] Reset password fails with expired token (>30 minutes)
- [ ] Reset password fails with mismatched passwords
- [ ] Old password cannot be used after reset

### OAuth Tests

- [ ] Google OAuth callback with valid code creates session
- [ ] Google OAuth with new user creates customer account
- [ ] Google OAuth with existing user links oauthId
- [ ] Google OAuth sets is_Verified = true
- [ ] Google OAuth creates proper session

### Logout Tests

- [ ] Logout destroys session
- [ ] Logout clears connect.sid cookie
- [ ] Logout succeeds and subsequent calls fail (session destroyed)

### Security Tests

- [ ] Rate limiting on register (max 5 per minute per IP)
- [ ] Rate limiting on login (max 5 per minute per IP)
- [ ] Rate limiting on forget-password
- [ ] Password never returned in responses
- [ ] Password hash not exposed
- [ ] Verification token is single-use
- [ ] Reset token is single-use
- [ ] Session expires after 7 days
- [ ] HttpOnly flag prevents JavaScript access to cookie
- [ ] Secure flag set in HTTPS (production)
- [ ] SameSite attribute set to Strict
- [ ] Suspended/blocked accounts cannot login

---

## Postman Collection Example

```json
{
  "info": {
    "name": "Customer Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register Customer",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"customer@example.com\", \"password\": \"SecurePassword123!\", \"confirmPassword\": \"SecurePassword123!\", \"fullName\": \"John Doe\", \"contactNumber\": \"+1234567890\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/customer/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "customer", "auth", "register"]
        }
      }
    },
    {
      "name": "Login Customer",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"customer@example.com\", \"password\": \"SecurePassword123!\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/customer/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "customer", "auth", "login"]
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
VERIFICATION_TOKEN_EXPIRY_HOURS=24
RESET_TOKEN_EXPIRY_MINUTES=30

# Email
NODEMAILER_SERVICE=gmail
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/customer/auth/google/callback

# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Common Issues

### Email Not Received

**Problem:** Verification or reset email not arriving
**Solution:**

1. Check email configuration in `.env`
2. Verify Nodemailer SMTP credentials
3. Check spam/junk folder
4. Check server logs for email errors

### Verification Token Expired

**Problem:** Token expired before clicking link
**Solution:** Token expires after 24 hours. Use "Resend Verification Email" to get new token.

### Reset Token Expired

**Problem:** Reset link expired before resetting
**Solution:** Token expires after 30 minutes. Request new password reset.

### Session Lost

**Problem:** Session lost after page refresh
**Solution:** Ensure cookies are persisted in browser. Check CORS and cookie settings.

### Google OAuth Fails

**Problem:** Getting error from Google callback
**Solution:**

1. Verify Google OAuth credentials in `.env`
2. Check redirect URL matches Google Console settings
3. Ensure authorization code is valid
4. Check server logs for OAuth errors

---

## Performance Notes

- Register should respond within 500ms
- Email sending is asynchronous (non-blocking)
- Verify email should complete within 300ms
- Login should complete within 300ms
- Session lookup <100ms
- Reset token validation <50ms
- OAuth callback <1000ms (includes Google API call)
- Logout <100ms
