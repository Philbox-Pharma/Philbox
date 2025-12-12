# Admin Authentication & API Integration Guide

**Frontend Integration Guide for Admin Portal Developers**

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Session Management](#session-management)
4. [Staff Management Endpoints](#staff-management-endpoints)
5. [Branch Management Endpoints](#branch-management-endpoints)
6. [Permissions Management Endpoints](#permissions-management-endpoints)
7. [Error Handling](#error-handling)
8. [Frontend Pages & Integration Points](#frontend-pages--integration-points)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api/admin
```

### Authentication Method

- **Type**: Session-based with 2FA (Two-Factor Authentication)
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
  method: "POST", // or GET, PUT, DELETE
  credentials: "include", // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
};
```

---

## Authentication Endpoints

### 1. Login (Step 1 of 2FA)

**Endpoint:** `POST /auth/login`

**Purpose**: Initial login step - sends OTP to admin's email

**Page Integration**: Login Page

#### Request Body

```json
{
  "email": "admin@philbox.com",
  "password": "AdminSecurePass123"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "OTP sent to email",
  "data": null
}
```

#### Error Responses

```json
// Email not found (404)
{
  "status": 404,
  "message": "Invalid email"
}

// Wrong password (401)
{
  "status": 401,
  "message": "Invalid Credentials"
}

// Too many attempts (429)
{
  "status": 429,
  "message": "Too many login attempts. Please try again later."
}
```

#### Frontend Implementation

```javascript
// pages/Auth/LoginPage.jsx
const handleLogin = async (email, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // Show OTP verification page
      setShowOtpVerification(true);
      showNotification("OTP sent to your email", "success");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Network error", "error");
  }
};
```

---

### 2. Verify OTP (Step 2 of 2FA)

**Endpoint:** `POST /auth/verify-otp`

**Purpose**: Second step of 2FA - verifies OTP sent to email and creates session

**Page Integration**: OTP Verification Page

#### Request Body

```json
{
  "email": "admin@philbox.com",
  "otp": "123456"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "2FA Verified",
  "data": {
    "admin": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Ahmed Hassan",
      "email": "admin@philbox.com",
      "admin_category": "super_admin",
      "account_status": "active",
      "is_Verified": true,
      "branch_id": "507f1f77bcf86cd799439010",
      "role": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "super_admin",
        "permissions": [
          "create_users",
          "read_users",
          "update_users",
          "delete_users"
          // ... more permissions
        ]
      },
      "created_at": "2025-12-06T10:00:00.000Z",
      "updated_at": "2025-12-06T10:00:00.000Z"
    }
  }
}
```

#### Error Responses

```json
// Invalid OTP (400)
{
  "status": 400,
  "message": "Invalid or expired OTP"
}

// Session expired (400)
{
  "status": 400,
  "message": "Invalid session"
}

// Missing required fields (400)
{
  "status": 400,
  "message": "Invalid Request"
}
```

#### Frontend Implementation

```javascript
// pages/Auth/OtpVerificationPage.jsx
const handleOtpVerification = async (email, otp) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/auth/verify-otp",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Store admin info in context/state
      setAdmin(result.data.admin);
      // Store permissions for RBAC
      setPermissions(result.data.admin.role.permissions);
      // Redirect to dashboard
      navigate("/admin/dashboard");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
  }
};
```

---

### 3. Forget Password

**Endpoint:** `POST /auth/forget-password`

**Purpose**: Sends password reset link to admin's email

**Page Integration**: Forget Password Page

#### Request Body

```json
{
  "email": "admin@philbox.com"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent successfully",
  "data": null
}
```

#### Error Response

```json
// Admin not found (404)
{
  "status": 404,
  "message": "Admin not found"
}
```

#### Frontend Implementation

```javascript
// pages/Auth/ForgetPasswordPage.jsx
const handleForgetPassword = async (email) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/auth/forget-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      showNotification("Password reset email sent", "success");
      // Show message to check email
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Forget password error:", error);
  }
};
```

---

### 4. Reset Password

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
  "data": null
}
```

#### Error Response

```json
// Invalid token (400)
{
  "status": 400,
  "message": "Invalid or expired token"
}
```

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Purpose**: Destroys admin session and clears cookies

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
// hooks/useLogout.js
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        // Clear user context
        setAdmin(null);
        setPermissions([]);
        // Redirect to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return logout;
};
```

---

## Session Management

### Session Overview

After successful OTP verification (Step 2 of 2FA), a session is automatically created and maintained via `connect.sid` cookie. This section explains session handling patterns and best practices.

**Session Properties:**

- **Cookie Name**: `connect.sid`
- **Type**: HttpOnly (cannot be accessed via JavaScript)
- **Duration**: 7 days
- **Auto-Renewal**: Renewed on each request
- **Auto-Expiration**: Clears on browser close or after 7 days

### Session Storage (Context/Redux Pattern)

After OTP verification, store admin data in Context or Redux:

```javascript
// Context/AdminContext.jsx
import { createContext, useState, useCallback } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // After OTP verification (from verify-otp response)
  const handleLoginSuccess = useCallback((adminData, adminPermissions) => {
    setAdmin(adminData);
    setPermissions(adminPermissions);
    localStorage.setItem("adminEmail", adminData.email);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setAdmin(null);
    setPermissions([]);
    localStorage.removeItem("adminEmail");
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        permissions,
        isLoading,
        handleLoginSuccess,
        handleLogout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
```

### Session Verification Endpoint

**Endpoint:** `GET /auth/verify-session`

**Purpose:** Check if current session is valid

**Use Cases:**

- Page refresh - verify session still active
- Navigate to protected route - check authorization
- Recover from network error - revalidate session

```javascript
const verifySession = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/auth/verify-session",
      {
        method: "GET",
        credentials: "include", // Send session cookie
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.ok) {
      const result = await response.json();
      // Session is valid, update admin context if needed
      return { valid: true, admin: result.data.admin };
    } else if (response.status === 401) {
      // Session expired or not authenticated
      return { valid: false, reason: "not_authenticated" };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return { valid: false, reason: "network_error" };
  }
};

// Use in App.jsx or Protected Route component
useEffect(() => {
  verifySession().then((result) => {
    if (result.valid) {
      setIsAuthenticated(true);
    } else {
      navigate("/admin/login");
    }
  });
}, []);
```

### Protected Route Pattern

```javascript
// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAdmin } from "./hooks/useAdmin";

export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { admin, permissions, isLoading } = useAdmin();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
};

// Usage
<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute requiredPermission="read_dashboard">
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/staff"
    element={
      <ProtectedRoute requiredPermission="read_users">
        <StaffManagement />
      </ProtectedRoute>
    }
  />
</Routes>;
```

### Session Recovery (Network Errors)

When network connectivity is restored after a disconnection:

```javascript
// useSessionRecovery.js
import { useEffect } from "react";
import { useAdmin } from "./useAdmin";

export const useSessionRecovery = () => {
  const { handleLoginSuccess } = useAdmin();

  useEffect(() => {
    // Listen for online event
    const handleOnline = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/auth/verify-session",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.ok) {
          const result = await response.json();
          // Session recovered, update context
          handleLoginSuccess(
            result.data.admin,
            result.data.admin.role.permissions,
          );
          showNotification("Connection restored", "success");
        }
      } catch (error) {
        console.error("Session recovery failed:", error);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [handleLoginSuccess]);
};
```

### Session Timeout Handling

```javascript
// useSessionTimeout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useSessionTimeout = (timeoutMinutes = 420) => {
  const navigate = useNavigate();
  let timeoutId;

  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(
      () => {
        // Session likely expired
        console.warn("Session timeout");
        navigate("/admin/login");
      },
      timeoutMinutes * 60 * 1000,
    );
  };

  useEffect(() => {
    // Reset timeout on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(timeoutId);
    };
  }, [navigate, timeoutMinutes]);
};
```

### Cookie Handling Best Practices

1. **Automatic Cookie Management**: Browsers automatically send `connect.sid` cookie with credentials option

   ```javascript
   // Correct - cookie is sent automatically
   fetch(url, { credentials: "include" });
   ```

2. **Never Manual Cookie Handling**: Do NOT try to manually handle the session cookie

   ```javascript
   // ❌ WRONG - Do not do this
   const cookie = document.cookie;
   headers["Cookie"] = cookie;
   ```

3. **Session Available On Every Request**: Once authenticated, session is available on all subsequent requests
   ```javascript
   // Session cookie is automatically included in all these requests
   fetch("/api/admin/staff-management/admins", { credentials: "include" });
   fetch("/api/admin/branch-management/branches", { credentials: "include" });
   ```

---

## Staff Management Endpoints

### 1. Get All Admins

**Endpoint:** `GET /staff-management/admins`

**Required Permission:** `read_users`

**Page Integration**: Admins Management Page / List View

#### Query Parameters

```
?page=1&limit=10&search=ahmed&sortBy=created_at&order=desc
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Admins retrieved",
  "data": {
    "admins": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "Ahmed Hassan",
        "email": "admin@philbox.com",
        "admin_category": "super_admin",
        "branch_id": "507f1f77bcf86cd799439010",
        "account_status": "active",
        "is_Verified": true,
        "role": {
          "_id": "507f1f77bcf86cd799439001",
          "name": "super_admin"
        },
        "created_at": "2025-12-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 45,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. Get Salespersons

**Endpoint:** `GET /staff-management/salespersons`

**Required Permission:** `read_users`

**Page Integration**: Salespersons Management Page

#### Query Parameters

```
?page=1&limit=10&status=active&branch_id=<branchId>
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Salespersons retrieved",
  "data": {
    "salespersons": [
      {
        "_id": "507f1f77bcf86cd799439031",
        "fullName": "Ali Khan",
        "email": "ali.khan@philbox.com",
        "contactNumber": "03001234567",
        "account_status": "active",
        "is_Verified": true,
        "branch_id": "507f1f77bcf86cd799439010",
        "role": {
          "_id": "507f1f77bcf86cd799439003",
          "name": "salesperson"
        },
        "created_at": "2025-12-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 25
    }
  }
}
```

---

### 3. Create Salesperson

**Endpoint:** `POST /staff-management/salespersons`

**Required Permission:** `create_users`

**Page Integration**: Add New Salesperson Modal/Page

#### Request Body

```json
{
  "fullName": "Ali Khan",
  "email": "ali.khan@philbox.com",
  "password": "SecurePass123",
  "contactNumber": "03001234567",
  "branch_id": "507f1f77bcf86cd799439010"
}
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Salesperson created successfully",
  "data": {
    "salesperson": {
      "_id": "507f1f77bcf86cd799439031",
      "fullName": "Ali Khan",
      "email": "ali.khan@philbox.com",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": true,
      "branch_id": "507f1f77bcf86cd799439010",
      "role": {
        "_id": "507f1f77bcf86cd799439003",
        "name": "salesperson"
      },
      "created_at": "2025-12-06T10:00:00.000Z"
    }
  }
}
```

---

### 4. Update Salesperson

**Endpoint:** `PUT /staff-management/salespersons/:salespersonId`

**Required Permission:** `update_users`

**Page Integration**: Edit Salesperson Details Modal

#### Request Body

```json
{
  "fullName": "Ali Khan Updated",
  "contactNumber": "03009876543",
  "account_status": "active"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Salesperson updated successfully",
  "data": {
    "salesperson": {
      "_id": "507f1f77bcf86cd799439031",
      "fullName": "Ali Khan Updated",
      "email": "ali.khan@philbox.com",
      "contactNumber": "03009876543",
      "account_status": "active",
      "is_Verified": true,
      "branch_id": "507f1f77bcf86cd799439010"
    }
  }
}
```

---

### 5. Delete Salesperson

**Endpoint:** `DELETE /staff-management/salespersons/:salespersonId`

**Required Permission:** `delete_users`

**Page Integration**: Salespersons List (Delete Action)

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Salesperson deleted successfully",
  "data": null
}
```

---

## Branch Management Endpoints

### 1. Get All Branches

**Endpoint:** `GET /branch-management/branches`

**Required Permission:** `read_branches`

**Page Integration**: Branches Management Page

#### Query Parameters

```
?page=1&limit=10&status=active
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Branches retrieved successfully",
  "data": {
    "branches": [
      {
        "_id": "507f1f77bcf86cd799439010",
        "name": "Lahore Main Branch",
        "city": "Lahore",
        "province": "Punjab",
        "country": "Pakistan",
        "contact_number": "042-1234567",
        "email": "lahore@philbox.com",
        "status": "active",
        "manager_name": "Hassan Ali",
        "created_at": "2025-12-06T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRecords": 15
    }
  }
}
```

---

### 2. Create Branch

**Endpoint:** `POST /branch-management/branches`

**Required Permission:** `create_branches`

**Page Integration**: Add New Branch Modal

#### Request Body

```json
{
  "name": "Karachi Branch",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "contact_number": "021-1234567",
  "email": "karachi@philbox.com",
  "manager_name": "Fatima Khan"
}
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Branch created successfully",
  "data": {
    "branch": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Karachi Branch",
      "city": "Karachi",
      "province": "Sindh",
      "country": "Pakistan",
      "contact_number": "021-1234567",
      "email": "karachi@philbox.com",
      "status": "active",
      "manager_name": "Fatima Khan",
      "created_at": "2025-12-06T10:00:00.000Z"
    }
  }
}
```

---

### 3. Update Branch

**Endpoint:** `PUT /branch-management/branches/:branchId`

**Required Permission:** `update_branches`

**Page Integration**: Edit Branch Details Modal

#### Request Body

```json
{
  "name": "Karachi Branch Updated",
  "manager_name": "Sara Ahmed",
  "contact_number": "021-9876543"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Branch updated successfully",
  "data": {
    "branch": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Karachi Branch Updated",
      "city": "Karachi",
      "manager_name": "Sara Ahmed",
      "contact_number": "021-9876543",
      "status": "active"
    }
  }
}
```

---

### 4. Delete Branch

**Endpoint:** `DELETE /branch-management/branches/:branchId`

**Required Permission:** `delete_branches`

**Page Integration**: Branches List (Delete Action)

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Branch deleted successfully",
  "data": null
}
```

---

## Permissions Management Endpoints

### 1. Get All Roles

**Endpoint:** `GET /permissions-management/roles`

**Required Permission:** `read_users`

**Page Integration**: Roles & Permissions Management Page

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Roles retrieved successfully",
  "data": {
    "roles": [
      {
        "_id": "507f1f77bcf86cd799439001",
        "name": "super_admin",
        "description": "Full system access",
        "permissions": [
          {
            "_id": "507f1f77bcf86cd799439101",
            "name": "create_users",
            "resource": "users",
            "action": "create",
            "description": "Create new users"
          }
        ],
        "created_at": "2025-12-06T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Get All Permissions

**Endpoint:** `GET /permissions-management/permissions`

**Required Permission:** `read_users`

**Page Integration**: Permissions List / Reference

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Permissions retrieved successfully",
  "data": {
    "permissions": [
      {
        "_id": "507f1f77bcf86cd799439101",
        "name": "create_users",
        "resource": "users",
        "action": "create",
        "description": "Create new users"
      },
      {
        "_id": "507f1f77bcf86cd799439102",
        "name": "read_users",
        "resource": "users",
        "action": "read",
        "description": "Read user information"
      }
    ]
  }
}
```

---

### 3. Get User's Role & Permissions

**Endpoint:** `GET /permissions-management/user-role`

**Query Parameters** (Choose one option):

**Option 1**: Get your own role (no parameters needed)

```
?userId=<userId>&userType=<userType>
```

**Option 2**: Get specific user's role (both required)

```
?userId=507f1f77bcf86cd799439031&userType=salesperson
```

**Success Response (200)** - Own User

```json
{
  "status": 200,
  "message": "User role and permissions retrieved",
  "data": {
    "role": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "super_admin",
      "permissions": [
        "create_users",
        "read_users",
        "update_users",
        "delete_users",
        "create_branches",
        "read_branches",
        "update_branches",
        "delete_branches"
      ]
    }
  }
}
```

**Success Response (200)** - Other User

```json
{
  "status": 200,
  "message": "User role and permissions retrieved",
  "data": {
    "role": {
      "_id": "507f1f77bcf86cd799439003",
      "name": "salesperson",
      "permissions": [
        "read_medicines",
        "create_orders",
        "read_orders",
        "update_orders"
      ]
    }
  }
}
```

---

### 4. Create New Permission

**Endpoint:** `POST /permissions-management/permissions`

**Required Permission:** `create_users` (Super Admin Only)

**Page Integration**: Add Custom Permission Modal (Admin Only)

#### Request Body

```json
{
  "resource": "custom_resource",
  "action": "read",
  "description": "Read custom resource"
}
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Permission created successfully",
  "data": {
    "permission": {
      "_id": "507f1f77bcf86cd799439105",
      "name": "read_custom_resource",
      "resource": "custom_resource",
      "action": "read",
      "description": "Read custom resource"
    }
  }
}
```

#### Error Response (400)

```json
// Duplicate permission (400)
{
  "status": 400,
  "message": "This permission already exists"
}

// Missing fields (400)
{
  "status": 400,
  "message": "resource and action are required"
}
```

---

### 5. Assign Role to User

**Endpoint:** `POST /permissions-management/users/assign-role`

**Required Permission:** `update_users`

**Page Integration**: User Management / Edit User Modal

#### Request Body

```json
{
  "userId": "507f1f77bcf86cd799439031",
  "userType": "salesperson",
  "roleId": "507f1f77bcf86cd799439003"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Role assigned successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439031",
      "fullName": "Ali Khan",
      "email": "ali.khan@philbox.com",
      "roleId": "507f1f77bcf86cd799439003",
      "role": {
        "name": "salesperson",
        "permissions": ["read_medicines", "create_orders"]
      }
    }
  }
}
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

| Status | Meaning           | Example                               |
| ------ | ----------------- | ------------------------------------- |
| 200    | Success           | OTP verified, data retrieved          |
| 201    | Created           | New user/branch created               |
| 400    | Bad Request       | Missing required fields, invalid data |
| 401    | Unauthorized      | Invalid credentials, no session       |
| 403    | Forbidden         | Insufficient permissions              |
| 404    | Not Found         | User/branch not found                 |
| 409    | Conflict          | Email already exists                  |
| 429    | Too Many Requests | Rate limit exceeded                   |
| 500    | Server Error      | Internal server error                 |

### Frontend Error Handling Pattern

```javascript
// utils/apiClient.js
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 401:
          // Redirect to login
          window.location.href = "/login";
          break;
        case 403:
          // Show permission error
          throw new Error("You do not have permission to perform this action");
        case 404:
          throw new Error(data.message || "Resource not found");
        default:
          throw new Error(data.message || "An error occurred");
      }
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

---

## Frontend Pages & Integration Points

### 1. Authentication Pages

#### Login Page

- **Path**: `/login` or `/admin/login`
- **Endpoints**: `POST /auth/login`
- **Components**:
  - Email input field
  - Password input field
  - "Forgot Password?" link
  - Submit button
  - Error message display

#### OTP Verification Page

- **Path**: `/auth/verify-otp`
- **Endpoints**: `POST /auth/verify-otp`
- **Components**:
  - OTP input field (6 digits)
  - Resend OTP button
  - Submit button
  - Timer (optional, 5 minutes)

#### Forget Password Page

- **Path**: `/auth/forgot-password`
- **Endpoints**: `POST /auth/forget-password`
- **Components**:
  - Email input field
  - Submit button
  - Success message

#### Reset Password Page

- **Path**: `/auth/reset-password?token=<token>`
- **Endpoints**: `POST /auth/reset-password`
- **Components**:
  - New password input
  - Confirm password input
  - Submit button

---

### 2. Dashboard

#### Admin Dashboard

- **Path**: `/admin/dashboard`
- **Data Needed**:
  - Total users count
  - Total branches count
  - Recent activities
  - Quick statistics
- **Key Sections**:
  - Welcome message with admin name
  - Quick action buttons
  - Recent activity feed
  - System stats

---

### 3. Staff Management Pages

#### Admins List

- **Path**: `/admin/staff/admins`
- **Endpoints**:
  - `GET /staff-management/admins`
- **Features**:
  - Search by name/email
  - Pagination
  - Sort by date
  - View admin details
- **Actions**:
  - Edit admin
  - View permissions

#### Salespersons Management

- **Path**: `/admin/staff/salespersons`
- **Endpoints**:
  - `GET /staff-management/salespersons`
  - `POST /staff-management/salespersons`
  - `PUT /staff-management/salespersons/:id`
  - `DELETE /staff-management/salespersons/:id`
- **Features**:
  - List with pagination
  - Search & filter by branch
  - Add new salesperson
  - Edit salesperson details
  - Delete salesperson
  - View assigned branch
- **Add/Edit Modal Form**:
  - Full Name
  - Email
  - Contact Number
  - Password (on create only)
  - Branch selection
  - Account status

---

### 4. Branch Management Pages

#### Branches List

- **Path**: `/admin/branches`
- **Endpoints**:
  - `GET /branch-management/branches`
  - `POST /branch-management/branches`
  - `PUT /branch-management/branches/:id`
  - `DELETE /branch-management/branches/:id`
- **Features**:
  - List all branches with pagination
  - Search by name/city
  - Filter by status
  - Add new branch
  - Edit branch details
  - Delete branch
- **Add/Edit Modal Form**:
  - Branch name
  - City
  - Province
  - Country
  - Contact number
  - Email
  - Manager name
  - Status dropdown

---

### 5. Permissions & Roles Pages

#### Roles & Permissions Management

- **Path**: `/admin/permissions`
- **Endpoints**:
  - `GET /permissions-management/roles`
  - `GET /permissions-management/permissions`
  - `GET /permissions-management/user-role`
- **Sections**:

  **Roles Tab**:
  - Display all roles with permission count
  - Expandable permission list for each role
  - View which users have each role

  **Permissions Tab**:
  - List all available permissions
  - Group by resource (users, branches, etc.)
  - Show action type (create, read, update, delete)
  - Add custom permission option (Super Admin only)

#### User Roles Assignment

- **Path**: `/admin/staff/[staff-type]/[id]/assign-role`
- **Endpoints**:
  - `GET /permissions-management/user-role?userId=x&userType=y`
  - `POST /permissions-management/users/assign-role`
- **Components**:
  - Current role display
  - Role selection dropdown
  - Permissions preview
  - Save button

---

### 6. Activity & Audit Pages

#### Activity Logs

- **Path**: `/admin/activity-logs`
- **Purpose**: View audit trail of all admin actions
- **Display**:
  - Admin name
  - Action type
  - Timestamp
  - Details/Description
  - IP address (optional)
  - Filter by date range
  - Filter by action type

---

## Frontend Implementation Checklist

### Setup

- [ ] Configure API base URL
- [ ] Set up error handling middleware
- [ ] Create API service layer
- [ ] Setup authentication context/store

### Authentication Flow

- [ ] Create Login page
- [ ] Create OTP Verification page
- [ ] Create Forget Password page
- [ ] Create Reset Password page
- [ ] Implement session management
- [ ] Add logout functionality
- [ ] Setup route protection (redirect to login if no session)

### Staff Management

- [ ] Create Admins list view
- [ ] Create Salespersons list view
- [ ] Create Add Salesperson modal/form
- [ ] Create Edit Salesperson modal/form
- [ ] Implement delete with confirmation
- [ ] Add search & filter
- [ ] Add pagination

### Branch Management

- [ ] Create Branches list view
- [ ] Create Add Branch modal/form
- [ ] Create Edit Branch modal/form
- [ ] Implement delete with confirmation
- [ ] Add search functionality

### Permissions

- [ ] Create Roles display component
- [ ] Create Permissions list component
- [ ] Create Role Assignment component
- [ ] Display user permissions in profile

### General

- [ ] Add loading states
- [ ] Add error notifications
- [ ] Add success notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement proper error handling
- [ ] Add activity logging display (optional)

---

## Tips & Best Practices

### 1. Session Management

```javascript
// Always include credentials in fetch
credentials: "include";

// Check session on app load
const checkSession = async () => {
  // Try calling a protected endpoint
  // If 401, redirect to login
};
```

### 2. Permission Checking

```javascript
// Store user permissions in context
const hasPermission = (permission) => {
  return userPermissions.includes(permission);
};

// Hide/disable buttons based on permissions
{
  hasPermission("create_users") && <AddButton />;
}
```

### 3. Error Messages

- Show user-friendly messages from response
- Log technical errors for debugging
- Don't expose sensitive information

### 4. Loading States

- Show spinners during API calls
- Disable buttons while loading
- Show loading skeletons for lists

### 5. Validation

- Client-side validation before sending
- Show field errors clearly
- Validate file uploads before sending

---

## Example: Complete Authentication Flow

```javascript
// pages/Auth/LoginFlow.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginFlow = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login"); // login | otp | success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth/login",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth/verify-otp",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "login") {
    return (
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpVerification}>
        <p>Enter the OTP sent to {email}</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    );
  }

  if (step === "success") {
    return (
      <div>
        <p>Login successful! Redirecting...</p>
      </div>
    );
  }
};
```

---

## Support & Questions

For backend implementation details, refer to:

- `RBAC.md` - Role-Based Access Control documentation
- `PHILBOX_RBAC_PERMISSIONS.md` - Complete permission matrix

For issues during integration, check:

- Network tab in browser DevTools
- Browser console for errors
- Backend logs for server-side errors

---

**Last Updated**: December 2025
**API Version**: 1.0
**Frontend Framework**: React (Example shown, applicable to any framework)
