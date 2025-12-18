# Salesperson Authentication API Guide

## Base URL

```
http://localhost:5000/api/salesperson/auth
```

## Rate Limiting

All authentication routes are rate-limited to prevent abuse.

---

## Authentication Flow

Salesperson accounts are created by Super Admins or Branch Admins. Salespersons cannot self-register.

### Conditional 2FA

- Each salesperson can enable/disable Two-Factor Authentication (2FA)
- If `isTwoFactorEnabled: true`, OTP verification is required after login
- If `isTwoFactorEnabled: false`, login is completed immediately

---

## 1. Login & 2FA

### 1.1 Login with Email & Password

**Endpoint:** `POST /api/salesperson/auth/login`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "salesperson@philbox.com",
  "password": "SecurePass123!"
}
```

**Success Response (2FA Disabled):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "name": "John Sales",
      "email": "salesperson@philbox.com",
      "branch_id": "64branch123...",
      "is_active": true,
      "isTwoFactorEnabled": false,
      "role": {
        "_id": "64role1...",
        "name": "Salesperson"
      }
    }
  }
}
```

**Success Response (2FA Enabled):**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "data": {
    "requiresOTP": true,
    "email": "salesperson@philbox.com"
  }
}
```

**Session (Partial - 2FA Enabled):**
When 2FA is enabled, session is created with:

- `req.session.tempSalespersonId`: Temporary salesperson ID
- `req.session.requiresOTP`: true
- `req.session.role`: "salesperson"

Full session access is granted only after OTP verification.

---

### 1.2 Verify OTP (2FA)

**Endpoint:** `POST /api/salesperson/auth/verify-otp`
**Authentication:** Not Required (but tempSalespersonId in session required)

**Request Body:**

```json
{
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully. Login complete.",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "name": "John Sales",
      "email": "salesperson@philbox.com",
      "branch_id": {
        "_id": "64branch123...",
        "name": "Karachi Branch",
        "city": "Karachi"
      },
      "is_active": true,
      "isTwoFactorEnabled": true,
      "role": {
        "_id": "64role1...",
        "name": "Salesperson",
        "permissions": [
          {
            "name": "read_orders",
            "resource": "orders",
            "action": "read"
          },
          {
            "name": "create_orders",
            "resource": "orders",
            "action": "create"
          }
        ]
      }
    }
  }
}
```

**Session (Full Access):**
After OTP verification:

- `req.session.salespersonId`: Salesperson ID
- `req.session.role`: "salesperson"
- `req.session.tempSalespersonId`: Removed
- `req.session.requiresOTP`: Removed

---

## 2. Password Management

### 2.1 Forget Password

**Endpoint:** `POST /api/salesperson/auth/forget-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "salesperson@philbox.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

---

### 2.2 Reset Password

**Endpoint:** `POST /api/salesperson/auth/reset-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "salesperson@philbox.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

---

## 3. 2FA Settings Management

### 3.1 Update 2FA Settings

**Endpoint:** `PATCH /api/salesperson/auth/2fa-settings`
**Authentication:** Required

**Request Body:**

```json
{
  "isTwoFactorEnabled": true
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Two-factor authentication settings updated successfully",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "name": "John Sales",
      "email": "salesperson@philbox.com",
      "isTwoFactorEnabled": true,
      "updated_at": "2025-12-18T12:00:00.000Z"
    }
  }
}
```

**Frontend Usage:**

```javascript
// Enable 2FA
const enable2FA = async () => {
  const response = await api.patch("/salesperson/auth/2fa-settings", {
    isTwoFactorEnabled: true,
  });
  return response.data;
};

// Disable 2FA
const disable2FA = async () => {
  const response = await api.patch("/salesperson/auth/2fa-settings", {
    isTwoFactorEnabled: false,
  });
  return response.data;
};
```

---

## 4. Session Management

### 4.1 Logout

**Endpoint:** `POST /api/salesperson/auth/logout`
**Authentication:** Required

**Success Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Session Destroyed:**

- Clears all session data
- Invalidates session cookie

---

## Salesperson Account Management

Salesperson accounts are created through the User Management API by Super Admins or Branch Admins.

**See:** [User Management API Guide](./USER_MANAGEMENT_API_GUIDE.md#2-salesperson-management)

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

**Common Status Codes:**

- `200` - Success
- `400` - Bad Request (validation error, invalid OTP)
- `401` - Unauthorized (not logged in, invalid credentials)
- `403` - Forbidden (account inactive)
- `404` - Not Found (salesperson doesn't exist)
- `500` - Server Error

---

## Frontend Integration Notes

### Login Flow with Conditional 2FA

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Step 1: Login
const login = async (email, password) => {
  const response = await api.post("/salesperson/auth/login", {
    email,
    password,
  });

  if (response.data.data.requiresOTP) {
    // Show OTP input screen
    return { requires2FA: true };
  } else {
    // Login complete, redirect to dashboard
    return { requires2FA: false, user: response.data.data.salesperson };
  }
};

// Step 2: Verify OTP (if required)
const verifyOTP = async (otp) => {
  const response = await api.post("/salesperson/auth/verify-otp", { otp });
  return response.data.data.salesperson;
};

// Usage
const handleLogin = async (email, password) => {
  try {
    const result = await login(email, password);

    if (result.requires2FA) {
      // Show OTP modal
      const otp = await showOTPModal();
      const user = await verifyOTP(otp);
      redirectToDashboard(user);
    } else {
      redirectToDashboard(result.user);
    }
  } catch (error) {
    console.error("Login failed:", error.response.data.message);
  }
};
```

### 2FA Toggle Component

```javascript
const TwoFactorAuthToggle = () => {
  const [enabled, setEnabled] = useState(user.isTwoFactorEnabled);

  const toggle2FA = async () => {
    try {
      const response = await api.patch("/salesperson/auth/2fa-settings", {
        isTwoFactorEnabled: !enabled,
      });
      setEnabled(response.data.data.salesperson.isTwoFactorEnabled);
      showSuccessMessage("2FA settings updated");
    } catch (error) {
      showErrorMessage("Failed to update 2FA settings");
    }
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={enabled} onChange={toggle2FA} />
        Enable Two-Factor Authentication
      </label>
      <p>
        {enabled
          ? "You will receive an OTP via email during login"
          : "Login with email and password only"}
      </p>
    </div>
  );
};
```

### Session Check

```javascript
// Check if salesperson is logged in
const checkAuth = async () => {
  try {
    const response = await api.get("/salesperson/auth/me"); // This route may not exist yet
    return response.data.data.salesperson;
  } catch (error) {
    return null;
  }
};
```

### OTP Resend (Not Yet Implemented)

If needed, you can implement an OTP resend endpoint:

```
POST /api/salesperson/auth/resend-otp
```

This would resend the OTP to the email in `req.session.tempSalespersonId`.
