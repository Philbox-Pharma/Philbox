# Branch Admin Authentication & API Integration Guide

**Frontend Integration Guide for Branch Admin Portal Developers**

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Session Management](#session-management)
4. [Branch Admin Operations](#branch-admin-operations)
5. [Error Handling](#error-handling)
6. [Frontend Pages & Integration Points](#frontend-pages--integration-points)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api/admin
```

**Note:** Branch Admin uses same authentication endpoint as Super Admin. The distinction is made via `admin_category` field.

### Authentication Method

- **Type**: Session-based with 2FA (Two-Factor Authentication)
- **Cookie**: `connect.sid` (automatically handled by browser)
- **Headers**: Include `credentials: 'include'` in fetch requests
- **Admin Category**: `branch_admin` (vs `super_admin`)

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
  credentials: "include",
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

**Purpose**: Initial login - sends OTP to branch admin's email

**Page Integration**: Branch Admin Login Page

#### Request Body

```json
{
  "email": "branchadmin@philbox.com",
  "password": "BranchAdminPass123"
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
// Invalid credentials (401)
{
  "status": 401,
  "message": "Invalid Credentials"
}

// Email not found (404)
{
  "status": 404,
  "message": "Invalid email"
}
```

---

### 2. Verify OTP (Step 2 of 2FA)

**Endpoint:** `POST /auth/verify-otp`

**Purpose**: Verifies OTP and creates session

**Page Integration**: OTP Verification Page

#### Request Body

```json
{
  "email": "branchadmin@philbox.com",
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
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Hassan Ali",
      "email": "branchadmin@philbox.com",
      "admin_category": "branch_admin",
      "branch_id": "507f1f77bcf86cd799439010",
      "branch_name": "Lahore Main Branch",
      "account_status": "active",
      "is_Verified": true,
      "role": {
        "_id": "507f1f77bcf86cd799439002",
        "name": "branch_admin",
        "permissions": [
          "read_salespersons",
          "create_orders",
          "read_orders",
          "update_orders",
          "read_customers",
          "read_appointments",
          "read_prescriptions",
          "read_reports",
          "read_medicines",
          "read_branches",
          "update_branch_info"
        ]
      },
      "created_at": "2025-12-06T10:00:00.000Z"
    }
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid or expired OTP"
}
```

#### Frontend Implementation

```javascript
// pages/BranchAdmin/LoginFlow.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const BranchAdminLoginFlow = () => {
  const [step, setStep] = useState("login"); // login | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      const result = await response.json();

      if (response.ok) {
        setStep("otp");
        showNotification("OTP sent to your email", "info");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Login failed");
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

      const result = await response.json();

      if (response.ok) {
        const admin = result.data.admin;

        // Verify this is a branch admin
        if (admin.admin_category !== "branch_admin") {
          setError("Only branch admins can access this portal");
          return;
        }

        // Store branch admin info
        setBranchAdmin(admin);
        setPermissions(admin.role.permissions);

        // Redirect to dashboard
        navigate("/branch-admin/dashboard");
        showNotification("Login successful", "success");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "login") {
    return (
      <form onSubmit={handleLogin} className="login-form">
        <h2>Branch Admin Login</h2>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <a href="/branch-admin/forgot-password">Forgot Password?</a>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpVerification} className="otp-form">
        <h2>Verify OTP</h2>
        <p>Enter the 6-digit OTP sent to {email}</p>

        <div className="form-group">
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button type="button" onClick={() => setStep("login")}>
          Back to Login
        </button>
      </form>
    );
  }
};
```

---

### 3. Forget Password

**Endpoint:** `POST /auth/forget-password`

**Purpose**: Sends password reset link to branch admin's email

**Page Integration**: Forget Password Page

#### Request Body

```json
{
  "email": "branchadmin@philbox.com"
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

---

### 4. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Purpose**: Sets new password using token from email

**Page Integration**: Reset Password Page

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewBranchAdminPass456"
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

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Purpose**: Destroys branch admin session

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

---

## Session Management

### Session Overview

Branch Admin uses same authentication endpoint as Super Admin but with distinct `admin_category` field. Session creation and management follows similar patterns.

**Session Properties:**

- **Cookie Name**: `connect.sid`
- **Type**: HttpOnly (cannot be accessed via JavaScript)
- **Duration**: 7 days
- **Admin Category**: `branch_admin` (distinguishes from `super_admin`)
- **Branch Scope**: Permissions and access scoped to assigned branch

### Session Storage with Category Distinction

Store branch admin data with admin_category tracking:

```javascript
// Context/BranchAdminContext.jsx
import { createContext, useState, useCallback } from "react";

export const BranchAdminContext = createContext();

export const BranchAdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminCategory, setAdminCategory] = useState(null); // branch_admin|super_admin
  const [permissions, setPermissions] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // After OTP verification
  const handleLoginSuccess = useCallback((adminData, adminPermissions) => {
    setAdmin(adminData);
    setAdminCategory(adminData.admin_category);
    setPermissions(adminPermissions);
    setBranchId(adminData.branch_id);
    localStorage.setItem("adminEmail", adminData.email);
    localStorage.setItem("adminCategory", adminData.admin_category);
  }, []);

  // Check if current admin is branch admin
  const isBranchAdmin = adminCategory === "branch_admin";

  // Logout
  const handleLogout = useCallback(() => {
    setAdmin(null);
    setAdminCategory(null);
    setPermissions([]);
    setBranchId(null);
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminCategory");
  }, []);

  return (
    <BranchAdminContext.Provider
      value={{
        admin,
        adminCategory,
        permissions,
        branchId,
        isBranchAdmin,
        isLoading,
        handleLoginSuccess,
        handleLogout,
      }}
    >
      {children}
    </BranchAdminContext.Provider>
  );
};
```

### Branch-Scoped Permission Checking

Branch Admin permissions are automatically scoped to their assigned branch:

```javascript
// usePermissionCheck.js
import { useAdmin } from "./useAdmin";

export const usePermissionCheck = () => {
  const { permissions, isBranchAdmin, branchId } = useAdmin();

  // Check if branch admin has specific permission
  const hasPermission = useCallback(
    (permission) => {
      if (!isBranchAdmin) return false; // Non-branch admins shouldn't access these endpoints
      return permissions.includes(permission);
    },
    [permissions, isBranchAdmin],
  );

  // Permissions are automatically scoped to branchId
  const getBranchScopedEndpoint = useCallback(
    (endpoint) => {
      if (!isBranchAdmin || !branchId) return null;
      // All endpoints automatically filter by current branch
      return endpoint; // Backend handles branch filtering
    },
    [isBranchAdmin, branchId],
  );

  return { hasPermission, getBranchScopedEndpoint, isBranchAdmin, branchId };
};
```

### Session Verification with Category Check

Verify session and confirm branch admin category:

```javascript
const verifyBranchAdminSession = async () => {
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
      const admin = result.data.admin;

      // Verify this is a branch admin, not super admin
      if (admin.admin_category !== "branch_admin") {
        console.warn("Not a branch admin");
        return { valid: false, reason: "not_branch_admin" };
      }

      return {
        valid: true,
        admin: admin,
        isBranchAdmin: true,
        branchId: admin.branch_id,
      };
    } else if (response.status === 401) {
      return { valid: false, reason: "not_authenticated" };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return { valid: false, reason: "network_error" };
  }
};

// Use on app initialization
useEffect(() => {
  verifyBranchAdminSession().then((result) => {
    if (result.valid && result.isBranchAdmin) {
      handleLoginSuccess(result.admin, result.admin.role.permissions);
    } else {
      navigate("/admin/login");
    }
  });
}, []);
```

### Protected Route for Branch Admin

```javascript
// ProtectedBranchAdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAdmin } from "./hooks/useAdmin";

export const ProtectedBranchAdminRoute = ({
  children,
  requiredPermission = null,
}) => {
  const { admin, permissions, isBranchAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!admin || !isBranchAdmin) {
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
    path="/branch-dashboard"
    element={
      <ProtectedBranchAdminRoute>
        <BranchDashboard />
      </ProtectedBranchAdminRoute>
    }
  />
  <Route
    path="/salespersons"
    element={
      <ProtectedBranchAdminRoute requiredPermission="read_salespersons">
        <SalespersonManagement />
      </ProtectedBranchAdminRoute>
    }
  />
  <Route
    path="/branch-orders"
    element={
      <ProtectedBranchAdminRoute requiredPermission="read_orders">
        <OrderManagement />
      </ProtectedBranchAdminRoute>
    }
  />
</Routes>;
```

### Branch Scope Enforcement

All endpoints automatically scope data to branch admin's assigned branch:

```javascript
// Example: Get salespersons for current branch
const getSalespersons = async (page = 1, limit = 10) => {
  const { branchId } = useAdmin();

  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/user-management/salespersons?page=${page}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include", // Session automatically restricts to branch
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.ok) {
      const result = await response.json();
      // Result contains only salespersons from this branch admin's branch
      return result.data.salespersons;
    }
  } catch (error) {
    console.error("Failed to fetch salespersons:", error);
  }
};

// All other endpoints (branch-management, etc.) also automatically filtered
// by branch admin's branch_id from session
```

### Session Recovery for Branch Admin

```javascript
// useBranchAdminSessionRecovery.js
import { useEffect } from "react";
import { useAdmin } from "./useAdmin";

export const useBranchAdminSessionRecovery = () => {
  const { handleLoginSuccess } = useAdmin();

  useEffect(() => {
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
          const admin = result.data.admin;

          if (admin.admin_category === "branch_admin") {
            handleLoginSuccess(admin, admin.role.permissions);
            showNotification("Connection restored", "success");
          }
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

---

## Branch Admin Operations

### Branch Admin Permissions

Branch Admin role has **13 permissions** scoped to their branch:

- `read_salespersons` - View salespersons in branch
- `create_orders` - Create orders
- `read_orders` - View orders
- `update_orders` - Modify orders
- `read_customers` - View customer data
- `read_appointments` - View appointments
- `read_prescriptions` - View prescriptions
- `read_reports` - Generate reports
- `read_medicines` - View medicine catalog
- `read_branches` - View branch info
- `update_branch_info` - Update branch details
- `read_doctors` - View doctors
- `read_users` - View other admins in branch

### Key Endpoints Structure

Branch Admin can:

- View salespersons assigned to their branch
- Manage orders for their branch
- View customers in their branch
- View appointments and prescriptions
- Generate branch-specific reports
- Update branch information
- View branch inventory and medicines

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

| Status | Meaning           | Example                         |
| ------ | ----------------- | ------------------------------- |
| 200    | Success           | Login, data retrieved           |
| 400    | Bad Request       | Invalid data                    |
| 401    | Unauthorized      | Invalid credentials, no session |
| 403    | Forbidden         | Insufficient permissions        |
| 404    | Not Found         | Resource not found              |
| 429    | Too Many Requests | Rate limit exceeded             |
| 500    | Server Error      | Internal server error           |

---

## Frontend Pages & Integration Points

### 1. Authentication Pages

#### Login Page

- **Path**: `/branch-admin/login`
- **Endpoints**: `POST /auth/login`
- **Form Fields**: Email, Password
- **Actions**: Sign In button, Forgot Password link
- **Validation**: Email format, required fields
- **Next**: Redirect to OTP verification

#### OTP Verification Page

- **Path**: `/branch-admin/login/verify-otp`
- **Endpoints**: `POST /auth/verify-otp`
- **Form**: 6-digit OTP input
- **Display**: Email confirmation, timer (optional)
- **Actions**: Verify button, Back button
- **Validation**: Admin category must be branch_admin
- **Next**: Redirect to dashboard

#### Forget Password Page

- **Path**: `/branch-admin/forgot-password`
- **Endpoints**: `POST /auth/forget-password`
- **Form**: Email input
- **Actions**: Send Reset Link button
- **Display**: Confirmation message

#### Reset Password Page

- **Path**: `/branch-admin/reset-password?token=<token>`
- **Endpoints**: `POST /auth/reset-password`
- **Form Fields**: New password, Confirm password
- **Actions**: Reset Password button
- **Validation**: Passwords match, strong password
- **Next**: Redirect to login

---

### 2. Dashboard

#### Branch Admin Dashboard

- **Path**: `/branch-admin/dashboard`
- **Key Sections**:
  - Welcome message with branch name
  - Key metrics:
    - Total orders (this month)
    - Total revenue (this month)
    - Total customers
    - Total salespersons
  - Quick action buttons:
    - View Orders
    - View Salespersons
    - View Customers
    - Generate Report
  - Recent orders (last 5)
  - Branch information card
  - Salespersons performance summary

#### Page Layout

```
┌─────────────────────────────────────┐
│  Welcome to [Branch Name]           │
│  Branch Admin: [Name]               │
├─────────────────────────────────────┤
│  Key Metrics:                       │
│  Orders: 125  |  Revenue: 250K      │
│  Customers: 450 | Salespersons: 8   │
├─────────────────────────────────────┤
│  [Quick Action Buttons]             │
├─────────────────────────────────────┤
│  Recent Orders                      │
│  Recent Transactions                │
└─────────────────────────────────────┘
```

---

### 3. Branch Management

#### Branch Details

- **Path**: `/branch-admin/branch-info`
  - `GET /branches/:branchId`
  - `PUT /branches/:branchId`
- **Display**:
  - Branch name
  - Location details
  - Contact information
  - Branch manager info
  - Address
  - Status
- **Actions**:
  - Edit details (admin only)
  - View more info

#### Edit Branch Info

- **Path**: `/branch-admin/branch-info/edit`
- **Endpoints**: `PUT /branch-management/branches/:branchId`
- **Form Fields**:
  - Branch name
  - City
  - Province
  - Contact number
  - Email
  - Manager name
- **Permissions Required**: `update_branch_info`
- **Actions**: Save button, Cancel button

---

### 4. Salespersons Management

#### Salespersons List

- **Path**: `/branch-admin/salespersons`
  - `GET /salespersons?branch_id=<branchId>`
- **Permissions Required**: `read_salespersons`
- **Features**:
  - List of all salespersons in branch
  - Search by name/email
  - Filter by status
  - Pagination
  - Sort by date
- **Display per salesperson**:
  - Name
  - Email
  - Contact
  - Status
  - Join date
  - View button
- **Actions**:
  - View details
  - Edit (if admin)
  - Deactivate/Activate
  - View performance

#### Salesperson Details

- **Path**: `/branch-admin/salespersons/:id`
- **Display**:
  - Personal information
  - Contact details
  - Status
  - Join date
  - Total orders
  - Total revenue
  - Performance metrics
  - Recent orders
- **Actions**:
  - Edit profile
  - View all orders
  - Deactivate account

---

### 5. Orders Management

#### Orders List

- **Path**: `/branch-admin/orders`
  - `GET /orders?branch_id=<branchId>`
- **Permissions Required**: `read_orders`
- **Features**:
  - List of branch orders
  - Search by order ID/customer
  - Filter by status
  - Filter by date range
  - Pagination
  - Export to CSV (optional)
- **Display per order**:
  - Order ID
  - Customer name
  - Salesperson name
  - Date
  - Amount
  - Status
  - View button
- **Columns**:
  - Order #
  - Customer
  - Salesperson
  - Date
  - Total
  - Status

#### Order Details

- **Path**: `/branch-admin/orders/:id`
  - `GET /orders/:id`
  - `PUT /orders/:id` (if update_orders permission)
- **Display**:
  - Order number
  - Customer info
  - Salesperson info
  - Order items with prices
  - Total amount
  - Status
  - Timeline
- **Actions**:
  - Update status (if permission)
  - Print order
  - Contact salesperson

---

### 6. Customers Management

#### Customers List

- **Path**: `/branch-admin/customers`
  - `GET /customers?branch_id=<branchId>`
- **Permissions Required**: `read_customers`
- **Features**:
  - List of customers
  - Search by name/email
  - Filter by location
  - Pagination
- **Display per customer**:
  - Name
  - Email
  - Contact
  - Location
  - Total orders
  - Total spent
- **Actions**:
  - View profile
  - View order history

#### Customer Details

- **Path**: `/branch-admin/customers/:id`
- **Display**:
  - Personal information
  - Address
  - Contact details
  - Order history
  - Total purchases
  - Membership duration
- **Actions**:
  - View all orders
  - Contact info

---

### 7. Reports & Analytics

#### Branch Reports

- **Path**: `/branch-admin/reports`
- **Permissions Required**: `read_reports`
- **Report Types**:
  - Daily sales
  - Weekly sales
  - Monthly sales
  - Top salespersons
  - Top medicines
  - Top customers
  - Customer trends
- **Features**:
  - Date range filter
  - Export to CSV/PDF
  - Charts and graphs
  - Key metrics
- **Metrics Displayed**:
  - Total revenue
  - Total orders
  - Average order value
  - Customer acquisition
  - Salesperson performance

#### Report Details

- **Path**: `/branch-admin/reports/:type`
- **Display**:
  - Report title
  - Date range
  - Key metrics
  - Charts
  - Detailed data table
- **Actions**:
  - Download as PDF
  - Download as CSV
  - Print
  - Export data

---

### 8. Appointments & Prescriptions

#### Appointments List

- **Path**: `/branch-admin/appointments`
- **Permissions Required**: `read_appointments`
- **Features**:
  - List of branch appointments
  - Search by patient/doctor
  - Filter by date
  - Filter by status
  - Calendar view (optional)
- **Display**:
  - Patient name
  - Doctor name
  - Date & time
  - Status
  - View button

#### Prescriptions List

- **Path**: `/branch-admin/prescriptions`
- **Permissions Required**: `read_prescriptions`
- **Features**:
  - List of prescriptions
  - Search functionality
  - Filter by date
  - View prescription details
- **Display**:
  - Patient name
  - Doctor name
  - Date
  - Medicines count
  - View button

---

### 9. Settings & Profile

#### Admin Profile

- **Path**: `/branch-admin/profile`
- **Display**:
  - Personal information
  - Email
  - Contact number
  - Branch assigned
  - Role
  - Permissions list
  - Account status
- **Actions**: Edit profile, Change password

#### Change Password

- **Path**: `/branch-admin/settings/change-password`
- **Form Fields**:
  - Current password
  - New password
  - Confirm password
- **Actions**: Save, Cancel

---

## Frontend Implementation Checklist

### Setup

- [ ] Configure API base URL
- [ ] Setup error handling middleware
- [ ] Create API service layer
- [ ] Setup authentication context/store
- [ ] Setup route guards (ProtectedRoute)
- [ ] Admin category validation (must be branch_admin)

### Authentication

- [ ] Create Login page
- [ ] Create OTP verification page
- [ ] Create Forget password page
- [ ] Create Reset password page
- [ ] Implement 2FA flow
- [ ] Session management
- [ ] Logout functionality
- [ ] Route protection

### Dashboard

- [ ] Create Dashboard
- [ ] Display key metrics
- [ ] Recent orders list
- [ ] Branch info card
- [ ] Quick action buttons

### Branch Management

- [ ] View branch details
- [ ] Edit branch info (if admin)
- [ ] Branch settings

### Staff Management

- [ ] Salespersons list view
- [ ] Salesperson details
- [ ] View performance metrics

### Orders

- [ ] Orders list with filters
- [ ] Order details view
- [ ] Status management
- [ ] Print/export orders

### Customers

- [ ] Customers list
- [ ] Customer details
- [ ] Order history

### Reports

- [ ] Reports page with filters
- [ ] Charts and graphs
- [ ] Export functionality

### General

- [ ] Loading spinners
- [ ] Error notifications
- [ ] Success notifications
- [ ] Confirmation dialogs
- [ ] Error handling
- [ ] Session expiry handling

---

## Tips & Best Practices

### 1. Branch Admin Validation

```javascript
// After login, verify admin_category is 'branch_admin'
const handleOtpVerification = async (...) => {
  // ...
  const admin = result.data.admin;

  if (admin.admin_category !== 'branch_admin') {
    showError('Only branch admins can access this portal');
    return;
  }
  // Continue...
};
```

### 2. Branch-Scoped Queries

```javascript
// Always include branch_id in API calls
const fetchBranchData = async () => {
  const branchId = branchAdmin.branch_id;

  const response = await fetch(`/api/admin/orders?branch_id=${branchId}`, {
    credentials: "include",
  });
};
```

### 3. Session Check on App Load

```javascript
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        navigate("/branch-admin/login");
        return;
      }

      const data = await response.json();
      const admin = data.data.admin;

      // Verify branch admin
      if (admin.admin_category !== "branch_admin") {
        navigate("/branch-admin/login");
        return;
      }

      setBranchAdmin(admin);
    } catch (error) {
      navigate("/branch-admin/login");
    }
  };

  checkSession();
}, []);
```

### 4. Permission Checking

```javascript
const hasPermission = (permission) => {
  return branchAdmin?.role?.permissions?.includes(permission);
};

// Usage in JSX
{
  hasPermission("update_orders") && <EditButton />;
}
{
  hasPermission("read_reports") && <ReportsLink />;
}
```

### 5. Error Handling

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for permission error
      if (response.status === 403) {
        showNotification("You do not have permission for this action", "error");
      } else {
        showNotification(data.message, "error");
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    showNotification("Network error", "error");
    return null;
  }
};
```

---

## Support & Questions

For backend implementation details, refer to:

- `RBAC.md` - Role-Based Access Control documentation
- `PHILBOX_RBAC_PERMISSIONS.md` - Complete permission matrix
- `Admin-Backend-Guide-For-Frontend-Developer.md` - Super Admin guide

For integration issues:

- Check Network tab in DevTools
- Verify credentials: 'include' is set
- Check admin_category in response
- Review browser console
- Check backend logs

---

**Last Updated**: December 2025
**API Version**: 1.0
**Frontend Framework**: React (Examples shown, applicable to any framework)
