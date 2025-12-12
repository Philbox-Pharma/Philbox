# Customer Authentication & API Integration Guide

**Frontend Integration Guide for Customer Portal Developers**

This guide covers all customer-facing endpoints, authentication flow, and page integration points.

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Customer Profile Endpoints](#customer-profile-endpoints)
4. [Google OAuth Integration](#google-oauth-integration)
5. [Error Handling](#error-handling)
6. [Frontend Pages & Integration Points](#frontend-pages--integration-points)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api/customer
```

### Authentication Method

- **Type**: Session-based (OAuth2 and traditional)
- **Cookie**: `connect.sid` (automatically handled by browser)
- **Headers**: Include `credentials: 'include'` in fetch requests

### Request Headers

```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Frontend Fetch Configuration

```javascript
const fetchOptions = {
  method: "POST",
  credentials: "include", // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
};
```

---

## Authentication Endpoints

### 1. Register

**Endpoint:** `POST /auth/register`

**Purpose**: Create new customer account with basic information

**Page Integration**: Customer Registration Page

#### Request Body

```json
{
  "fullName": "Sarah Ahmed",
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123",
  "contactNumber": "03001234567",
  "gender": "Female",
  "dateOfBirth": "1995-08-20"
}
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": false,
      "created_at": "2025-12-06T10:00:00.000Z"
    },
    "nextStep": "verify-email"
  }
}
```

#### Error Response (409)

```json
{
  "status": 409,
  "message": "Email already exists"
}
```

#### Frontend Implementation

```javascript
// pages/Customer/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const CustomerRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    contactNumber: "",
    gender: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/register",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (response.ok) {
        // Store email for verification step
        sessionStorage.setItem("registeredEmail", formData.email);

        showNotification(
          "Registration successful! Please check your email to verify.",
          "success",
        );
        navigate("/customer/verify-email");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
        <h2>Create Your Account</h2>

        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Create a strong password"
            required
          />
          <small>Password must be at least 8 characters</small>
        </div>

        <div className="form-group">
          <label>Contact Number *</label>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) =>
              setFormData({ ...formData, contactNumber: e.target.value })
            }
            placeholder="e.g., 03001234567"
            required
          />
        </div>

        <div className="form-group">
          <label>Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p>
          Already have an account? <a href="/customer/login">Login here</a>
        </p>
      </form>
    </div>
  );
};
```

---

### 2. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Purpose**: Confirms customer's email address

**Page Integration**: Email Verification Page

#### Request Body

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

#### Token Source

- Sent via email to customer
- Email contains verification link like:
  ```
  http://localhost:3000/customer/verify?token=a1b2c3d4...
  ```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Email verified successfully. Please login.",
  "data": {
    "nextStep": "login"
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid or expired verification token"
}
```

#### Frontend Implementation

```javascript
// pages/Customer/EmailVerificationPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const CustomerEmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/verify-email",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/customer/login"), 3000);
      } else {
        setStatus("error");
        setMessage(result.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
      console.error("Verification error:", error);
    }
  };

  return (
    <div className="verification-container">
      {status === "verifying" && (
        <div>
          <p>Verifying your email...</p>
          <Spinner />
        </div>
      )}

      {status === "success" && (
        <div className="success">
          <h2>✓ Email Verified</h2>
          <p>{message}</p>
          <p>Redirecting to login...</p>
        </div>
      )}

      {status === "error" && (
        <div className="error">
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <button onClick={() => navigate("/customer/login")}>
            Back to Login
          </button>
          <button onClick={() => navigate("/customer/resend-verification")}>
            Resend Verification Email
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### 3. Login

**Endpoint:** `POST /auth/login`

**Purpose**: Authenticate customer with email and password

**Page Integration**: Customer Login Page

#### Request Body

```json
{
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": true,
      "address_id": null,
      "profile_img_url": null,
      "cover_img_url": null,
      "last_login": "2025-12-06T11:30:00.000Z",
      "created_at": "2025-12-06T10:00:00.000Z"
    },
    "accountStatus": "active"
  }
}
```

#### Error Responses

```json
// Invalid credentials (401)
{
  "status": 401,
  "message": "Invalid Credentials"
}

// Email not verified (403)
{
  "status": 403,
  "message": "Please verify your email first"
}

// Account blocked (403)
{
  "status": 403,
  "message": "Your account has been blocked or suspended"
}
```

#### Frontend Implementation

```javascript
// pages/Customer/LoginPage.jsx
const handleLogin = async (email, password) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/customer/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Store customer info in context
      setCustomer(result.data.customer);

      // Redirect to dashboard
      navigate("/customer/dashboard");
      showNotification("Login successful", "success");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    showNotification("Login failed", "error");
  }
};
```

---

### 4. Forget Password

**Endpoint:** `POST /auth/forget-password`

**Purpose**: Sends password reset link to customer's email

**Page Integration**: Forget Password Page

#### Request Body

```json
{
  "email": "sarah.ahmed@example.com"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "check-email"
  }
}
```

#### Error Response (404)

```json
{
  "status": 404,
  "message": "User not found"
}
```

---

### 5. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Purpose**: Sets new password using token from email

**Page Integration**: Reset Password Page (from email link)

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass456"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "login"
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid token"
}
```

---

### 6. Logout

**Endpoint:** `POST /auth/logout`

**Purpose**: Destroys customer session and clears cookies

**Page Integration**: Navigation Bar (Logout Button)

#### Request Body

```json
{}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Logout successful",
  "data": null
}
```

#### Frontend Implementation

```javascript
// hooks/useCustomerLogout.js
export const useCustomerLogout = () => {
  const navigate = useNavigate();
  const { setCustomer } = useContext(AuthContext);

  const logout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        setCustomer(null);
        navigate("/customer/login");
        showNotification("Logged out successfully", "success");
      }
    } catch (error) {
      showNotification("Logout failed", "error");
    }
  };

  return logout;
};
```

---

## Customer Profile Endpoints

### 1. Get Current Customer Profile

**Endpoint:** `GET /auth/me`

**Required**: Authenticated

**Purpose**: Get logged-in customer's profile

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Current user fetched",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "fullName": "Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "gender": "Female",
    "dateOfBirth": "1995-08-20T00:00:00.000Z",
    "contactNumber": "03001234567",
    "account_status": "active",
    "is_Verified": true,
    "address_id": "507f1f77bcf86cd799439022",
    "profile_img_url": "https://res.cloudinary.com/customer_profiles/sarah.jpg",
    "cover_img_url": "https://res.cloudinary.com/customer_covers/sarah_cover.jpg",
    "last_login": "2025-12-06T11:30:00.000Z",
    "created_at": "2025-12-06T10:00:00.000Z"
  }
}
```

---

### 2. Update Customer Profile

**Endpoint:** `PUT /auth/profile`

**Required**: Authenticated

**Purpose**: Update customer profile information and images

**Page Integration**: Customer Profile Edit Page

#### Request Body (multipart/form-data)

```javascript
const formData = new FormData();

// Text fields
formData.append("fullName", "Sarah Ahmed Khan");
formData.append("contactNumber", "03009876543");
formData.append("gender", "Female");
formData.append("dateOfBirth", "1995-08-20");

// Address fields
formData.append("street", "123 Main Street, Block A");
formData.append("city", "Lahore");
formData.append("province", "Punjab");
formData.append("zip_code", "54000");
formData.append("country", "Pakistan");
formData.append(
  "google_map_link",
  "https://maps.google.com/?q=31.5204,74.3587",
);

// Files (optional)
formData.append("profile_img", profileImageFile);
formData.append("cover_img", coverImageFile);
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed Khan",
      "email": "sarah.ahmed@example.com",
      "contactNumber": "03009876543",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "account_status": "active",
      "is_Verified": true,
      "address_id": {
        "_id": "507f1f77bcf86cd799439022",
        "street": "123 Main Street, Block A",
        "city": "Lahore",
        "province": "Punjab",
        "zip_code": "54000",
        "country": "Pakistan",
        "google_map_link": "https://maps.google.com/?q=31.5204,74.3587"
      },
      "profile_img_url": "https://res.cloudinary.com/customer_profiles/sarah_new.jpg",
      "cover_img_url": "https://res.cloudinary.com/customer_covers/sarah_cover_new.jpg"
    },
    "message": "Profile updated successfully",
    "nextStep": "dashboard"
  }
}
```

#### Frontend Implementation

```javascript
// pages/Customer/EditProfilePage.jsx
export const CustomerEditProfilePage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    gender: "",
    dateOfBirth: "",
    street: "",
    city: "",
    province: "",
    zip_code: "",
    country: "",
    google_map_link: "",
  });

  const [files, setFiles] = useState({
    profile_img: null,
    cover_img: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitFormData = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });

    // Append files
    if (files.profile_img) {
      submitFormData.append("profile_img", files.profile_img);
    }
    if (files.cover_img) {
      submitFormData.append("cover_img", files.cover_img);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/profile",
        {
          method: "PUT",
          credentials: "include",
          body: submitFormData,
        },
      );

      const result = await response.json();

      if (response.ok) {
        showNotification("Profile updated successfully", "success");
        // Update context with new data
        setCustomer(result.data.customer);
        navigate("/customer/profile");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to update profile", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Your Profile</h2>

      <div className="form-section">
        <label>Full Name</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
      </div>

      <div className="form-section">
        <label>Contact Number</label>
        <input
          type="tel"
          value={formData.contactNumber}
          onChange={(e) =>
            setFormData({ ...formData, contactNumber: e.target.value })
          }
        />
      </div>

      <div className="form-section">
        <label>Street Address</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="123 Main Street, Block A"
        />
      </div>

      <div className="form-section">
        <label>City</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </div>

      <div className="form-section">
        <label>Province</label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) =>
            setFormData({ ...formData, province: e.target.value })
          }
        />
      </div>

      <div className="form-section">
        <label>Zip Code</label>
        <input
          type="text"
          value={formData.zip_code}
          onChange={(e) =>
            setFormData({ ...formData, zip_code: e.target.value })
          }
        />
      </div>

      <div className="form-section">
        <label>Country</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
        />
      </div>

      <div className="form-section">
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFiles({ ...files, profile_img: e.target.files[0] })
          }
        />
      </div>

      <div className="form-section">
        <label>Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, cover_img: e.target.files[0] })}
        />
      </div>

      <button type="submit">Save Changes</button>
    </form>
  );
};
```

---

## Google OAuth Integration

### OAuth Flow

```
Click "Login with Google" →
Google Login →
Backend receives token →
Create/Update customer account →
Auto-assign role →
Redirect to dashboard
```

### 1. Google Login Button

**Redirect to:**

```html
<a href="http://localhost:5000/api/customer/auth/google">
  <button>
    <img src="/google-icon.svg" alt="Google" />
    Login with Google
  </button>
</a>
```

### 2. Google Callback (Backend)

**URL:** `GET /auth/google/callback`

Backend handles:

- Google OAuth verification
- Check if customer exists
- Create new customer if needed
- Auto-assign customer role
- Create session
- Redirect to frontend

### 3. OAuth Success Page

**Redirect URL:**

```
http://localhost:3000/auth/oauth/success?role=customer&isNewUser=false
```

#### Success Page Implementation

```javascript
// pages/Auth/OAuthSuccessPage.jsx
import { useSearchParams, useNavigate, useEffect } from "react-router-dom";

export const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role");
  const isNewUser = searchParams.get("isNewUser") === "true";

  useEffect(() => {
    verifySessionAndRedirect();
  }, []);

  const verifySessionAndRedirect = async () => {
    try {
      // Verify session is established
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/me",
        {
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.data);
        navigate("/customer/dashboard");
      } else {
        navigate("/customer/login");
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      navigate("/customer/login");
    }
  };

  return (
    <div>
      <p>Authenticating...</p>
      <Spinner />
    </div>
  );
};
```

### 4. OAuth Error Page

**Redirect URL (on error):**

```
http://localhost:3000/auth/oauth/error?message=Authentication%20failed
```

#### Error Page Implementation

```javascript
// pages/Auth/OAuthErrorPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";

export const OAuthErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get("message");

  return (
    <div className="error-container">
      <h2>Authentication Failed</h2>
      <p>{message || "Something went wrong. Please try again."}</p>
      <button onClick={() => navigate("/customer/login")}>Back to Login</button>
    </div>
  );
};
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": <HTTP_STATUS>,
  "message": "<User-friendly error message>",
  "data": null,
  "error": "<Technical error details>"
}
```

### Common HTTP Status Codes

| Status | Meaning           | Example                             |
| ------ | ----------------- | ----------------------------------- |
| 200    | Success           | Login, profile retrieved            |
| 201    | Created           | Registration successful             |
| 400    | Bad Request       | Invalid data                        |
| 401    | Unauthorized      | Invalid credentials                 |
| 403    | Forbidden         | Account blocked, email not verified |
| 404    | Not Found         | User not found                      |
| 409    | Conflict          | Email already exists                |
| 413    | Payload Too Large | File too large                      |
| 500    | Server Error      | Internal server error               |

---

## Frontend Pages & Integration Points

### 1. Authentication Pages

#### Registration Page

- **Path**: `/customer/register`
- **Endpoints**: `POST /auth/register`
- **Form Fields**:
  - Full Name
  - Email
  - Password
  - Confirm Password
  - Contact Number
  - Gender (dropdown)
  - Date of Birth
- **Actions**: Register button, Login link
- **Validation**:
  - Email format
  - Password strength (min 8 chars)
  - Passwords match
  - Valid date format

#### Email Verification Page

- **Path**: `/customer/verify`
- **Endpoints**: `POST /auth/verify-email`
- **Auto-process**: Extract token from URL, auto-verify
- **Display**:
  - Status message
  - Loading spinner
  - Resend option if expired
- **Redirect**: To login on success

#### Login Page

- **Path**: `/customer/login`
- **Endpoints**: `POST /auth/login`
- **Form Fields**: Email, Password
- **Actions**:
  - Login button
  - "Forgot Password?" link
  - "Login with Google" button
  - "Create Account" link
- **Routing**:
  - Success → Dashboard
  - Not verified → Verification page
  - Blocked → Error message

#### Forget Password Page

- **Path**: `/customer/forgot-password`
- **Endpoints**: `POST /auth/forget-password`
- **Form**: Email input
- **Display**: Confirmation message
- **Action**: Submit button

#### Reset Password Page

- **Path**: `/customer/reset-password?token=<token>`
- **Endpoints**: `POST /auth/reset-password`
- **Form Fields**:
  - New password
  - Confirm password
- **Validation**: Passwords match, strong password
- **Redirect**: To login on success

---

### 2. Dashboard Page

#### Customer Dashboard

- **Path**: `/customer/dashboard`
- **Endpoints**: `GET /auth/me`
- **Key Sections**:
  - Welcome greeting (Hi, [Name]!)
  - Recent orders (last 5)
  - Favorite medicines
  - Quick action buttons:
    - Browse Medicines
    - New Order
    - View Prescriptions
    - Book Appointment
  - Account status
  - Notifications (if any)
- **Navigation**: Links to other sections

---

### 3. Profile Pages

#### View Profile

- **Path**: `/customer/profile`
- **Endpoints**: `GET /auth/me`
- **Display**:
  - Profile image
  - Cover image
  - Personal information:
    - Full name
    - Email
    - Contact number
    - Gender
    - Date of birth
  - Address information:
    - Street
    - City
    - Province
    - Zip code
    - Country
  - Account information:
    - Account status
    - Member since
    - Last login
- **Actions**: Edit Profile button

#### Edit Profile

- **Path**: `/customer/profile/edit`
- **Endpoints**: `PUT /auth/profile`
- **Form Fields**:
  - Full Name
  - Contact Number
  - Gender
  - Date of Birth
  - Street Address
  - City
  - Province
  - Zip Code
  - Country
  - Google Maps Link (optional)
  - Profile Image (file upload)
  - Cover Image (file upload)
- **Actions**:
  - Save Changes button
  - Cancel button
- **File Upload**:
  - Image preview
  - Max size: 5MB
  - Allowed formats: JPG, PNG

---

## Frontend Implementation Checklist

### Setup

- [ ] Configure API base URL
- [ ] Setup error handling middleware
- [ ] Create API service layer
- [ ] Setup authentication context/store
- [ ] Setup route guards (ProtectedRoute)
- [ ] Session check on app load

### Authentication

- [ ] Registration page with validation
- [ ] Email verification page (auto-redirect)
- [ ] Login page
- [ ] Forget password page
- [ ] Reset password page
- [ ] Google OAuth integration
- [ ] OAuth success/error pages
- [ ] Session management
- [ ] Logout functionality

### Profile

- [ ] View profile page
- [ ] Edit profile page
- [ ] Image upload with preview
- [ ] Address form
- [ ] Form validation

### General

- [ ] Loading spinners
- [ ] Error notifications
- [ ] Success notifications
- [ ] Confirmation dialogs
- [ ] Error handling
- [ ] Session expiry handling
- [ ] Mobile responsiveness

---

## Tips & Best Practices

### 1. Session Check on App Load

```javascript
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/me",
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        navigate("/customer/login");
      } else {
        const data = await response.json();
        setCustomer(data.data);
      }
    } catch (error) {
      navigate("/customer/login");
    }
  };

  checkSession();
}, []);
```

### 2. Form Data with Files

```javascript
const submitFormWithFiles = async (formData, files) => {
  const submitData = new FormData();

  // Append text fields
  Object.entries(formData).forEach(([key, value]) => {
    submitData.append(key, value);
  });

  // Append files
  Object.entries(files).forEach(([key, file]) => {
    if (file) submitData.append(key, file);
  });

  const response = await fetch(endpoint, {
    method: "PUT",
    credentials: "include",
    body: submitData,
    // Don't set Content-Type, browser sets it automatically
  });
};
```

### 3. Error Handling Pattern

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    showNotification(data.message, "error");
    return;
  }

  // Success handling
} catch (error) {
  console.error("Error:", error);
  showNotification("Network error", "error");
}
```

### 4. Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

---

## Support & Questions

For backend details, refer to:

- `RBAC.md` - Authentication and role documentation
- `Customer-Backend-Guide-For-Frontend.md` - Original guide (provided as reference)

For integration issues:

- Check Network tab in DevTools
- Verify credentials: 'include' is set
- Check browser console for errors
- Review backend logs

---

**Last Updated**: December 2025
**API Version**: 1.0
**Frontend Framework**: React (Examples shown, applicable to any framework)

- **Features**:
  - List of medicines
  - Search by name
  - Filter by category
  - Filter by price range
  - Sort options
  - Pagination
- **Display per medicine**:
  - Medicine name
  - Price
  - Stock status
  - Image
  - Rating
  - Quick view button
- **Actions**:
  - Add to cart
  - View details

#### Medicine Details

- **Path**: `/customer/medicines/:id`
- **Display**:
  - Medicine name
  - Description
  - Price
  - Dosage
  - Manufacturer
  - Expiry date
  - Stock quantity
  - Side effects
  - Precautions
  - Reviews/ratings
- **Actions**:
  - Add to cart
  - Back to catalog

---

### 5. Orders Pages

#### Orders History

- **Path**: `/customer/orders`
- **Features**:
  - List of past orders
  - Search by order ID
  - Filter by date range
  - Filter by status
  - Pagination
- **Display per order**:
  - Order ID
  - Date
  - Total amount
  - Status
  - Number of items
  - View button
- **Actions**: View details, Reorder, Download receipt

#### Order Details

- **Path**: `/customer/orders/:id`
- **Display**:
  - Order number
  - Order date
  - Delivery address
  - Order items:
    - Medicine name
    - Quantity
    - Unit price
    - Subtotal
  - Total amount
  - Order status
  - Estimated delivery date
  - Tracking information
- **Actions**:
  - Print order
  - Download invoice
  - Contact support

---

### 6. Prescriptions Pages

#### My Prescriptions

- **Path**: `/customer/prescriptions`
- **Features**:
  - List of prescriptions
  - Search functionality
  - Filter by date
  - Upload new prescription
- **Display per prescription**:
  - Prescription ID
  - Doctor name
  - Date issued
  - Medicines count
  - View button
- **Actions**: View, Download, Reorder

#### Prescription Details

- **Path**: `/customer/prescriptions/:id`
- **Display**:
  - Doctor information
  - Prescribed medicines:
    - Medicine name
    - Dosage
    - Duration
    - Quantity
  - Doctor notes
  - Issue date
- **Actions**:
  - Create order from prescription
  - Download prescription
  - Print

---

### 7. Appointments Pages

#### Book Appointment

- **Path**: `/customer/appointments/book`
- **Form Fields**:
  - Doctor selection
  - Appointment date
  - Appointment time
  - Reason for visit
  - Notes
- **Actions**: Book button, Cancel button

#### My Appointments

- **Path**: `/customer/appointments`
- **Display**:
  - Upcoming appointments
  - Past appointments
  - Calendar view (optional)
- **Display per appointment**:
  - Doctor name
  - Specialty
  - Date & time
  - Status
  - View button
- **Actions**: Reschedule, Cancel, View details

---

### 8. Settings & Account Pages

#### Account Settings

- **Path**: `/customer/settings`
- **Options**:
  - Change password
  - Email notifications
  - SMS notifications
  - Privacy settings
  - Two-factor authentication (if needed)
  - Account deletion

#### Change Password

- **Path**: `/customer/settings/change-password`
- **Form Fields**:
  - Current password
  - New password
  - Confirm new password
- **Validation**:
  - Current password correct
  - New password strong
  - Passwords match
- **Actions**: Save, Cancel

---

## Frontend Implementation Checklist

### Setup

- [ ] Configure API base URL
- [ ] Setup error handling middleware
- [ ] Create API service layer
- [ ] Setup authentication context/store
- [ ] Setup route guards (ProtectedRoute)
- [ ] Session check on app load

### Authentication

- [ ] Registration page with validation
- [ ] Email verification page (auto-redirect)
- [ ] Login page
- [ ] Forget password page
- [ ] Reset password page
- [ ] Google OAuth integration
- [ ] OAuth success/error pages
- [ ] Session management
- [ ] Logout functionality

### Profile

- [ ] View profile page
- [ ] Edit profile page
- [ ] Image upload with preview
- [ ] Address form
- [ ] Form validation

### Medicine Catalog

- [ ] Medicines list page
- [ ] Search functionality
- [ ] Filter options
- [ ] Medicine details page
- [ ] Pagination

### Orders

- [ ] Orders history page
- [ ] Order details page
- [ ] Status tracking
- [ ] Print/download receipts

### General

- [ ] Loading spinners
- [ ] Error notifications
- [ ] Success notifications
- [ ] Confirmation dialogs
- [ ] Error handling
- [ ] Session expiry handling
- [ ] Mobile responsiveness

---

## Tips & Best Practices

### 1. Session Check on App Load

```javascript
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/customer/auth/me",
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        navigate("/customer/login");
      } else {
        const data = await response.json();
        setCustomer(data.data);
      }
    } catch (error) {
      navigate("/customer/login");
    }
  };

  checkSession();
}, []);
```

### 2. Form Data with Files

```javascript
const submitFormWithFiles = async (formData, files) => {
  const submitData = new FormData();

  // Append text fields
  Object.entries(formData).forEach(([key, value]) => {
    submitData.append(key, value);
  });

  // Append files
  Object.entries(files).forEach(([key, file]) => {
    if (file) submitData.append(key, file);
  });

  const response = await fetch(endpoint, {
    method: "PUT",
    credentials: "include",
    body: submitData,
    // Don't set Content-Type, browser sets it automatically
  });
};
```

### 3. Error Handling Pattern

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    showNotification(data.message, "error");
    return;
  }

  // Success handling
} catch (error) {
  console.error("Error:", error);
  showNotification("Network error", "error");
}
```

### 4. Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

---

## Support & Questions

For backend details, refer to:

- `RBAC.md` - Authentication and role documentation
- `Customer-Backend-Guide-For-Frontend.md` - Original guide (provided as reference)

For integration issues:

- Check Network tab in DevTools
- Verify credentials: 'include' is set
- Check browser console for errors
- Review backend logs

---

**Last Updated**: December 2025
**API Version**: 1.0
**Frontend Framework**: React (Examples shown, applicable to any framework)
