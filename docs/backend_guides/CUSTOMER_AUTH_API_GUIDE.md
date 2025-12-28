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
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "contactNumber": "+923001234567",
  "gender": "Male",
  "dateOfBirth": "1995-05-15"
}
```

**Validation Rules:**

- `fullName`: Required, 3-50 characters
- `email`: Required, valid email format
- `password`: Required, alphanumeric 3-30 characters
- `contactNumber`: Optional, 10-15 digits
- `gender`: Optional, must be "Male" or "Female"
- `dateOfBirth`: Optional, valid date

**Success Response:**

```json
{
  "success": true,
  "message": "Customer registered successfully. Please check your email to verify your account.",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "gender": "Male",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "is_Verified": false,
      "account_status": "active",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane Smith",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Jane Smith",
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
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "is_Verified": true
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
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "is_Verified": true,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane Smith",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Jane Smith",
      "address_id": {
        "_id": "64addr123...",
        "street": "123 Main Street",
        "town": "DHA",
        "city": "Karachi",
        "province": "Sindh",
        "zip_code": "74200",
        "country": "Pakistan",
        "google_map_link": "https://maps.google.com/..."
      },
      "gender": "Male",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "account_status": "active",
      "roleId": {
        "_id": "64role123...",
        "name": "Customer"
      }
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
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com",
      "is_Verified": true,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane Smith",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Jane Smith",
      "address_id": {
        "_id": "64addr123...",
        "street": "123 Main Street",
        "town": "DHA",
        "city": "Karachi",
        "province": "Sindh",
        "zip_code": "74200",
        "country": "Pakistan"
      },
      "gender": "Male",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "account_status": "active",
      "roleId": {
        "_id": "64role123...",
        "name": "Customer"
      }
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
fullName: Jane Smith Updated
contactNumber: +923009876543
gender: Female
dateOfBirth: 1995-05-15
street: 456 New Street
town: Gulberg
city: Lahore
province: Punjab
zip_code: 54000
country: Pakistan
google_map_link: https://maps.google.com/...
profile_img: [File]
cover_img: [File]
```

**Validation Rules:**

- `fullName`: Optional, 3-50 characters if provided
- `contactNumber`: Optional, valid phone format if provided
- `gender`: Optional, "Male" or "Female"
- `dateOfBirth`: Optional, valid date
- `street`: Optional
- `town`: Optional
- `city`: Optional
- `province`: Optional
- `zip_code`: Optional
- `country`: Optional
- `google_map_link`: Optional
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
      "fullName": "Jane Smith Updated",
      "email": "jane.smith@example.com",
      "contactNumber": "+923009876543",
      "gender": "Female",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "profile_img_url": "https://cloudinary.com/.../new-profile.jpg",
      "cover_img_url": "https://cloudinary.com/.../new-cover.jpg",
      "address_id": {
        "_id": "64addr123...",
        "street": "456 New Street",
        "town": "Gulberg",
        "city": "Lahore",
        "province": "Punjab",
        "zip_code": "54000",
        "country": "Pakistan",
        "google_map_link": "https://maps.google.com/..."
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
form.append("fullName", "Jane Smith");
form.append("contactNumber", "+923001234567");
form.append("city", "Karachi");
form.append("province", "Sindh");
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
