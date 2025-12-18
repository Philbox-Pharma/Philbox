# Customer Authentication API Guide

## Base URL

```
http://localhost:5000/api/customer/auth
```

## Rate Limiting

All authentication routes are rate-limited to prevent abuse.

---

## 1. Customer Registration

### 1.1 Register New Customer

**Endpoint:** `POST /api/customer/auth/register`
**Authentication:** Not Required

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "gender": "female",
  "date_of_birth": "1995-05-15",
  "contact_number": "+923001234567",
  "address": {
    "street": "123 Main Street",
    "city": "Karachi",
    "state": "Sindh",
    "postal_code": "74200",
    "country": "Pakistan"
  }
}
```

**Validation Rules:**

- `name`: Required, 3-50 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must include uppercase, lowercase, number, special character
- `password_confirmation`: Must match password
- `gender`: Required, must be "male", "female", or "other"
- `date_of_birth`: Required, must be 18+ years old
- `contact_number`: Required, valid phone format
- `address.street`: Required
- `address.city`: Required
- `address.state`: Required
- `address.postal_code`: Required
- `address.country`: Required

**Success Response:**

```json
{
  "success": true,
  "message": "Customer registered successfully. Please check your email to verify your account.",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "gender": "female",
      "date_of_birth": "1995-05-15T00:00:00.000Z",
      "contact_number": "+923001234567",
      "email_verified": false,
      "is_active": true,
      "profile_completed": false,
      "address": {
        "_id": "64addr123...",
        "street": "123 Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "postal_code": "74200",
        "country": "Pakistan"
      },
      "created_at": "2025-12-18T10:00:00.000Z"
    }
  }
}
```

**Note:** An OTP will be sent to the provided email for verification.

---

### 1.2 Verify Email

**Endpoint:** `POST /api/customer/auth/verify-email`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "jane.smith@example.com",
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "email_verified": true
    }
  }
}
```

---

## 2. Customer Login

### 2.1 Login with Email & Password

**Endpoint:** `POST /api/customer/auth/login`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePass123!"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "email_verified": true,
      "profile_img": "https://cloudinary.com/.../profile.jpg",
      "cover_img": "https://cloudinary.com/.../cover.jpg",
      "address": {
        "street": "123 Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "postal_code": "74200",
        "country": "Pakistan"
      },
      "gender": "female",
      "date_of_birth": "1995-05-15T00:00:00.000Z",
      "contact_number": "+923001234567",
      "is_active": true
    }
  }
}
```

**Session Created:**
After successful login, a session is created with:

- `req.session.customerId`: Customer ID
- `req.session.role`: "customer"

---

### 2.2 Google OAuth Login

**Endpoint:** `GET /api/customer/auth/google`
**Authentication:** Not Required

Redirects to Google OAuth consent screen.

**OAuth Callback:**
`GET /api/customer/auth/google/callback`

After successful Google authentication, redirects to frontend with session created.

---

## 3. Password Management

### 3.1 Forget Password

**Endpoint:** `POST /api/customer/auth/forget-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "jane.smith@example.com"
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

### 3.2 Reset Password

**Endpoint:** `POST /api/customer/auth/reset-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "jane.smith@example.com",
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

## 4. Session Management

### 4.1 Get Current User (Me)

**Endpoint:** `GET /api/customer/auth/me`
**Authentication:** Required

**Success Response:**

```json
{
  "success": true,
  "message": "Customer fetched successfully",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "email_verified": true,
      "profile_img": "https://cloudinary.com/.../profile.jpg",
      "cover_img": "https://cloudinary.com/.../cover.jpg",
      "address": {
        "street": "123 Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "postal_code": "74200",
        "country": "Pakistan"
      },
      "gender": "female",
      "date_of_birth": "1995-05-15T00:00:00.000Z",
      "contact_number": "+923001234567",
      "is_active": true
    }
  }
}
```

---

### 4.2 Logout

**Endpoint:** `POST /api/customer/auth/logout`
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

## 5. Profile Management

### 5.1 Update Profile

**Endpoint:** `PUT /api/customer/auth/profile`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**

```
name: Jane Smith Updated
contact_number: +923009876543
address[street]: 456 New Street
address[city]: Lahore
address[state]: Punjab
address[postal_code]: 54000
address[country]: Pakistan
profile_img: [File]
cover_img: [File]
```

**Validation Rules:**

- `name`: Optional, 3-50 characters if provided
- `contact_number`: Optional, valid phone format if provided
- `address.street`: Optional
- `address.city`: Optional
- `address.state`: Optional
- `address.postal_code`: Optional
- `address.country`: Optional
- `profile_img`: Optional, image file (JPEG, PNG, GIF)
- `cover_img`: Optional, image file (JPEG, PNG, GIF)

**Success Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "name": "Jane Smith Updated",
      "email": "jane.smith@example.com",
      "contact_number": "+923009876543",
      "profile_img": "https://cloudinary.com/.../new-profile.jpg",
      "cover_img": "https://cloudinary.com/.../new-cover.jpg",
      "address": {
        "street": "456 New Street",
        "city": "Lahore",
        "state": "Punjab",
        "postal_code": "54000",
        "country": "Pakistan"
      },
      "updated_at": "2025-12-18T12:00:00.000Z"
    }
  }
}
```

**Note:** Images are uploaded to Cloudinary automatically.

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
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `404` - Not Found (user doesn't exist)
- `409` - Conflict (email already exists)
- `500` - Server Error

---

## Frontend Integration Notes

### Session-Based Authentication

After login, all subsequent requests must include the session cookie automatically sent by the browser.

**Axios Example:**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // Important: enables cookies
});

// Login
const login = async (email, password) => {
  const response = await api.post("/customer/auth/login", { email, password });
  return response.data;
};

// Get current user
const getMe = async () => {
  const response = await api.get("/customer/auth/me");
  return response.data;
};

// Logout
const logout = async () => {
  const response = await api.post("/customer/auth/logout");
  return response.data;
};
```

### Image Upload Example

```javascript
const updateProfile = async (formData) => {
  const response = await api.put("/customer/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Usage
const form = new FormData();
form.append("name", "Jane Smith");
form.append("contact_number", "+923001234567");
form.append("address[city]", "Karachi");
form.append("profile_img", fileInput.files[0]);

await updateProfile(form);
```

### Google OAuth Integration

```javascript
// Redirect to Google OAuth
window.location.href = "http://localhost:5000/api/customer/auth/google";

// After callback, check session
const checkAuth = async () => {
  try {
    const response = await api.get("/customer/auth/me");
    // User is logged in
    return response.data.data.customer;
  } catch (error) {
    // User is not logged in
    return null;
  }
};
```
