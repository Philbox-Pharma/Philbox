# Admin Authentication API - Mock Data

## Base URL

```
http://localhost:5000/api/admin/auth
```

---

## 1. Login (Step 1 - Send OTP)

**Endpoint:** `POST /login`

### Request Body

```json
{
  "email": "admin@philbox.com",
  "password": "Admin123456"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "OTP sent to email"
}
```

**Note:** After this step, the backend stores `pendingAdminId` in the session and sends an OTP to the admin's email.

### Error Responses

```json
// Invalid email (404)
{
  "status": 404,
  "message": "Invalid email"
}

// Invalid credentials (401)
{
  "status": 401,
  "message": "Invalid Credentials"
}
```

---

## 2. Verify OTP (Step 2 - Complete Login)

**Endpoint:** `POST /verify-otp`

### Request Body

```json
{
  "email": "admin@philbox.com",
  "otp": "123456"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "2FA Verified",
  "data": {
    "admin": {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Super Admin",
      "email": "admin@philbox.com",
      "phone_number": "+923001234567",
      "category": "super-admin",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Super Admin",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Super Admin",
      "isTwoFactorEnabled": false,
      "addresses": [],
      "branches_managed": [],
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-12-06T12:30:00.000Z"
    }
  }
}
```

**Note:** After successful OTP verification, the session is fully created with `adminId`, `adminCategory`, and `adminEmail`.

### Error Responses

```json
// Invalid request (400)
{
  "status": 400,
  "message": "Invalid Request"
}

// Invalid session (400)
{
  "status": 400,
  "message": "Invalid session"
}

// Invalid or expired OTP (400)
{
  "status": 400,
  "message": "Invalid or expired OTP"
}
```

---

## 3. Forget Password

**Endpoint:** `POST /forget-password`

### Request Body

```json
{
  "email": "admin@philbox.com"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent successfully"
}
```

### Error Response (404)

```json
{
  "status": 404,
  "message": "Admin not found"
}
```

---

## 4. Reset Password

**Endpoint:** `POST /reset-password`

### Request Body

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "NewAdmin123456"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset successfully"
}
```

### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid or expired token"
}
```

---

## 5. Logout

**Endpoint:** `POST /logout`

**Note:** Requires authentication. Include session cookie.

### Request Body

```json
{}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Logout successful"
}
```

### Error Response (500)

```json
{
  "status": 500,
  "message": "Could not log out"
}
```

---

## Complete Admin Objects

### Super Admin

```json
{
  "_id": "507f1f77bcf86cd799439031",
  "name": "Super Admin",
  "email": "admin@philbox.com",
  "phone_number": "+923001234567",
  "category": "super-admin",
  "profile_img_url": "https://avatar.iran.liara.run/username?username=Super Admin",
  "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Super Admin",
  "isTwoFactorEnabled": false,
  "otpCode": null,
  "otpExpiresAt": null,
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  "addresses": [],
  "branches_managed": [],
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-12-06T12:30:00.000Z"
}
```

### Branch Admin

```json
{
  "_id": "507f1f77bcf86cd799439032",
  "name": "Branch Admin Lahore",
  "email": "branch.admin.lahore@philbox.com",
  "phone_number": "+923009876543",
  "category": "branch-admin",
  "status": "active",
  "profile_img_url": "https://avatar.iran.liara.run/username?username=Branch Admin Lahore",
  "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Branch Admin Lahore",
  "isTwoFactorEnabled": false,
  "otpCode": null,
  "otpExpiresAt": null,
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  "addresses": ["507f1f77bcf86cd799439033"],
  "branches_managed": ["507f1f77bcf86cd799439034"],
  "created_at": "2025-02-15T10:00:00.000Z",
  "updated_at": "2025-12-06T12:30:00.000Z"
}
```

---

## Admin Activity Log Sample

```json
{
  "_id": "507f1f77bcf86cd799439035",
  "admin_id": "507f1f77bcf86cd799439031",
  "action_type": "verify_otp",
  "description": "Admin (admin@philbox.com) verified OTP successfully",
  "target_collection": "admins",
  "target_id": "507f1f77bcf86cd799439031",
  "changes": null,
  "ip_address": "192.168.1.100",
  "device_info": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "created_at": "2025-12-06T12:30:00.000Z"
}
```

---

## Authentication Flow

### Two-Factor Authentication Flow:

1. **Step 1**: User submits email and password via `/login`
   - Backend validates credentials
   - Generates 6-digit OTP
   - Stores OTP in database with expiration (typically 5-10 minutes)
   - Sends OTP to admin's email
   - Stores `pendingAdminId` in session
   - Returns: `"OTP sent to email"`

2. **Step 2**: User submits email and OTP via `/verify-otp`
   - Backend validates OTP against stored value
   - Checks OTP hasn't expired
   - Verifies session's `pendingAdminId` matches
   - Clears OTP from database
   - Creates full session with `adminId`, `adminCategory`, `adminEmail`
   - Returns: Admin object and success message

### Session Data:

After successful login (after OTP verification):

```javascript
req.session = {
  adminId: "507f1f77bcf86cd799439031",
  adminCategory: "super-admin",
  adminEmail: "admin@philbox.com",
};
```

During OTP pending:

```javascript
req.session = {
  pendingAdminId: "507f1f77bcf86cd799439031",
};
```

---

## Authentication Notes

1. **Two-Factor Authentication**: Admin login requires OTP verification
2. **Session-based authentication**: After successful OTP verification, session is created
3. **Protected routes**: `/logout` requires authentication
4. **Include credentials**: Frontend should send requests with `credentials: 'include'`
5. **OTP Expiration**: OTP typically expires in 5-10 minutes (check `otpExpiresAt`)
6. **Admin Categories**:
   - `super-admin`: Full system access, no status field
   - `branch-admin`: Branch-specific access, has `status` field (active/suspended/blocked)

7. **nextStep values** (from service):
   - `verify-otp`: User needs to verify OTP after login
   - `check-email`: Check email for reset link
   - `login`: User should login
   - `dashboard`: Logged in successfully, go to dashboard

---

## Sample OTP Email Content

The OTP sent to admin's email would look like:

```
Subject: Your PhilBox Admin Login OTP

Dear Super Admin,

Your OTP code is: 123456

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
PhilBox Team
```

---

## Password Reset Flow

1. Admin requests password reset via `/forget-password`
2. Backend generates reset token and sends email with reset link
3. Reset link format: `http://localhost:3000/admin/auth/reset-password/{token}`
4. Admin clicks link and submits new password via `/reset-password`
5. Backend validates token, updates password, and clears reset token

---

## Error Handling Best Practices

For the frontend developer:

- Always check `status` code in response
- Handle 400-level errors with user-friendly messages
- For OTP errors, allow user to request new OTP (would need additional endpoint)
- Store `pendingAdminId` state in frontend during OTP flow
- Clear any pending state on successful login or logout
- Implement OTP input UI with 6-digit input fields
- Add countdown timer for OTP expiration (typically 10 minutes)
