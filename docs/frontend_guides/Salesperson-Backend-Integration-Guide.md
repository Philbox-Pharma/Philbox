# Salesperson Authentication & API Integration Guide

**Frontend Integration Guide for Salesperson Portal Developers**

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Session Management](#session-management)
4. [Salesperson Operations](#salesperson-operations)
5. [Error Handling](#error-handling)
6. [Frontend Pages & Integration Points](#frontend-pages--integration-points)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api/salesperson
```

### Authentication Method

- **Type**: Session-based with OTP verification (created by admin only)
- **Cookie**: `connect.sid` (automatically handled by browser)
- **Headers**: Include `credentials: 'include'` in fetch requests
- **Registration**: NO self-registration - admin creates salesperson accounts

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

**Purpose**: Initial login step - sends OTP to salesperson's email

**Page Integration**: Salesperson Login Page

**Note**: Salesperson accounts are created by admin. Salesperson receives login credentials via email.

#### Request Body

```json
{
  "email": "john.doe@philbox.com",
  "password": "SalespersonPass123"
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

// Account suspended (403)
{
  "status": 403,
  "message": "Your account has been suspended"
}

// Too many attempts (429)
{
  "status": 429,
  "message": "Too many login attempts. Please try again later."
}
```

#### Frontend Implementation

```javascript
// pages/Auth/SalespersonLoginPage.jsx
const handleLogin = async (email, password) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/salesperson/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Show OTP verification page
      setShowOtpVerification(true);
      setLoginEmail(email);
      showNotification("OTP sent to your email", "success");
    } else if (response.status === 403) {
      showNotification("Your account has been suspended by admin", "error");
    } else if (response.status === 401) {
      showNotification("Invalid email or password", "error");
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
  "email": "john.doe@philbox.com",
  "otp": "123456"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "2FA Verified",
  "data": {
    "salesperson": {
      "_id": "507f1f77bcf86cd799439050",
      "fullName": "John Doe",
      "email": "john.doe@philbox.com",
      "contactNumber": "03001234567",
      "gender": "Male",
      "dateOfBirth": "1995-06-15T00:00:00.000Z",
      "account_status": "active",
      "is_Verified": true,
      "branches_managed": [
        "507f1f77bcf86cd799439010",
        "507f1f77bcf86cd799439011"
      ],
      "role": {
        "_id": "507f1f77bcf86cd799439004",
        "name": "salesperson",
        "permissions": [
          "create_orders",
          "read_orders",
          "update_orders",
          "read_customers"
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
      "http://localhost:5000/api/salesperson/auth/verify-otp",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Store salesperson info in context/state
      setSalesperson(result.data.salesperson);
      // Store permissions for RBAC
      setPermissions(result.data.salesperson.role.permissions);
      // Store managed branches
      setManagedBranches(result.data.salesperson.branches_managed);
      // Redirect to dashboard
      navigate("/salesperson/dashboard");
      showNotification("Login successful", "success");
    } else if (response.status === 400) {
      showNotification("Invalid or expired OTP", "error");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    showNotification("Verification failed. Please try again.", "error");
  }
};
```

---

### 3. Forget Password

**Endpoint:** `POST /auth/forget-password`

**Purpose**: Sends password reset link to salesperson's email

**Page Integration**: Forget Password Page

#### Request Body

```json
{
  "email": "john.doe@philbox.com"
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
// Salesperson not found (404)
{
  "status": 404,
  "message": "Salesperson not found"
}
```

#### Frontend Implementation

```javascript
// pages/Auth/ForgetPasswordPage.jsx
const handleForgetPassword = async (email) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/salesperson/auth/forget-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      showNotification(
        "Password reset email sent successfully. Please check your email.",
        "success",
      );
      setTimeout(() => navigate("/salesperson/login"), 2000);
    } else if (response.status === 404) {
      showNotification("Email not found in our system", "error");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Forget password error:", error);
    showNotification("Request failed. Please try again.", "error");
  }
};
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
  "password": "NewSalespersonPass123"
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
// Invalid or expired token (400)
{
  "status": 400,
  "message": "Invalid or expired token"
}
```

#### Frontend Implementation

```javascript
// pages/Auth/ResetPasswordPage.jsx
import { useSearchParams } from "react-router-dom";

const handleResetPassword = async (newPassword) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  try {
    const response = await fetch(
      "http://localhost:5000/api/salesperson/auth/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      showNotification(
        "Password reset successfully. Please login with new password.",
        "success",
      );
      navigate("/salesperson/login");
    } else if (response.status === 400) {
      showNotification("Invalid or expired reset link", "error");
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    console.error("Reset password error:", error);
  }
};
```

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Purpose**: Destroys session and clears session cookie

**Page Integration**: Any page with logout button (Header, Settings, etc.)

#### Request Body

```json
{}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Logged out successfully",
  "data": null
}
```

#### Frontend Implementation

```javascript
// hooks/useLogout.js
export const useLogout = () => {
  const navigate = useNavigate();
  const { handleLogout } = useSalesperson();

  const logout = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/salesperson/auth/logout",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        // Clear local state
        handleLogout();
        // Clear any cached data
        sessionStorage.clear();
        // Redirect to login
        navigate("/salesperson/login");
        showNotification("Logged out successfully", "success");
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

After successful OTP verification, a session is automatically created and maintained via `connect.sid` cookie. Salesperson sessions include branch management information.

**Session Properties:**

- **Cookie Name**: `connect.sid`
- **Type**: HttpOnly (cannot be accessed via JavaScript)
- **Duration**: 7 days
- **Auto-Renewal**: Renewed on each request
- **Branches Scope**: Session includes array of managed branch IDs

### Session Storage with Branch Management

Store salesperson data including managed branches in Context:

```javascript
// Context/SalespersonContext.jsx
import { createContext, useState, useCallback } from "react";

export const SalespersonContext = createContext();

export const SalespersonProvider = ({ children }) => {
  const [salesperson, setSalesperson] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [managedBranches, setManagedBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // After OTP verification (from verify-otp response)
  const handleLoginSuccess = useCallback(
    (salespersonData, salespersonPermissions) => {
      setSalesperson(salespersonData);
      setPermissions(salespersonPermissions);
      setManagedBranches(salespersonData.branches_managed || []);
      localStorage.setItem("salespersonEmail", salespersonData.email);
    },
    [],
  );

  // Check if salesperson manages specific branch
  const managesBranch = useCallback(
    (branchId) => {
      return managedBranches.includes(branchId);
    },
    [managedBranches],
  );

  // Logout
  const handleLogout = useCallback(() => {
    setSalesperson(null);
    setPermissions([]);
    setManagedBranches([]);
    localStorage.removeItem("salespersonEmail");
  }, []);

  return (
    <SalespersonContext.Provider
      value={{
        salesperson,
        permissions,
        managedBranches,
        isLoading,
        managesBranch,
        handleLoginSuccess,
        handleLogout,
      }}
    >
      {children}
    </SalespersonContext.Provider>
  );
};
```

### Session Verification Endpoint

**Endpoint:** `GET /auth/verify-session`

**Purpose:** Check if current session is valid and get current salesperson data

```javascript
const verifySalespersonSession = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/salesperson/auth/verify-session",
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.ok) {
      const result = await response.json();
      return {
        valid: true,
        salesperson: result.data.salesperson,
        managedBranches: result.data.salesperson.branches_managed,
      };
    } else if (response.status === 401) {
      return { valid: false, reason: "not_authenticated" };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return { valid: false, reason: "network_error" };
  }
};

// Use in App.jsx on mount
useEffect(() => {
  verifySalespersonSession().then((result) => {
    if (result.valid) {
      handleLoginSuccess(
        result.salesperson,
        result.salesperson.role.permissions,
      );
    } else {
      navigate("/salesperson/login");
    }
  });
}, []);
```

### Protected Route Pattern

```javascript
// ProtectedSalespersonRoute.jsx
import { Navigate } from "react-router-dom";
import { useSalesperson } from "./hooks/useSalesperson";

export const ProtectedSalespersonRoute = ({
  children,
  requiredPermission,
  requiredBranch,
}) => {
  const {
    salesperson,
    permissions,
    managedBranches,
    isLoading,
    managesBranch,
  } = useSalesperson();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!salesperson) {
    return <Navigate to="/salesperson/login" replace />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/salesperson/unauthorized" replace />;
  }

  if (requiredBranch && !managesBranch(requiredBranch)) {
    return <Navigate to="/salesperson/forbidden" replace />;
  }

  return children;
};

// Usage
<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedSalespersonRoute>
        <Dashboard />
      </ProtectedSalespersonRoute>
    }
  />
  <Route
    path="/orders/:branchId"
    element={
      <ProtectedSalespersonRoute
        requiredPermission="read_orders"
        requiredBranch={useParams().branchId}
      >
        <OrderManagement />
      </ProtectedSalespersonRoute>
    }
  />
</Routes>;
```

### Branch Access Control

Validate branch access before making requests:

```javascript
// useBranchAccess.js
export const useBranchAccess = (branchId) => {
  const { managesBranch } = useSalesperson();

  const hasAccessToBranch = useCallback(() => {
    return managesBranch(branchId);
  }, [branchId, managesBranch]);

  const checkAndFetch = useCallback(
    async (endpoint) => {
      if (!hasAccessToBranch()) {
        throw new Error("Access denied to this branch");
      }
      // Proceed with fetch
      return fetch(endpoint, { credentials: "include" });
    },
    [hasAccessToBranch],
  );

  return { hasAccessToBranch, checkAndFetch };
};
```

### Session Recovery

```javascript
// useSalespersonSessionRecovery.js
import { useEffect } from "react";
import { useSalesperson } from "./useSalesperson";

export const useSalespersonSessionRecovery = () => {
  const { handleLoginSuccess } = useSalesperson();

  useEffect(() => {
    const handleOnline = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/salesperson/auth/verify-session",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.ok) {
          const result = await response.json();
          handleLoginSuccess(
            result.data.salesperson,
            result.data.salesperson.role.permissions,
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

---

## Salesperson Operations

### Key Endpoints Structure

Salesperson can perform the following operations:

1. **Order Management**
   - Create orders
   - View orders in managed branches
   - Update order status

2. **Customer Management**
   - View customers in managed branches
   - Create customer records
   - Update customer information

3. **Branch Information**
   - View branch details for managed branches
   - Access branch-specific data

**Note**: All endpoints automatically scope data to salesperson's managed branches.

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": 400,
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes

| Status | Meaning           | Action                                     |
| ------ | ----------------- | ------------------------------------------ |
| 200    | Success           | Proceed normally                           |
| 201    | Created           | Resource created successfully              |
| 400    | Bad Request       | Check request format and required fields   |
| 401    | Unauthorized      | Not authenticated - redirect to login      |
| 403    | Forbidden         | Account suspended or lacking permissions   |
| 404    | Not Found         | Resource doesn't exist                     |
| 429    | Too Many Requests | Rate limit exceeded - wait before retrying |
| 500    | Server Error      | Try again later                            |

### Client-Side Error Handling Pattern

```javascript
// utils/errorHandler.js
export const handleApiError = (error, status) => {
  switch (status) {
    case 401:
      // Clear session and redirect to login
      localStorage.removeItem("salespersonEmail");
      window.location.href = "/salesperson/login";
      break;
    case 403:
      return "Your account has been suspended. Please contact administration.";
    case 404:
      return "Requested resource not found.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return error.message || "An error occurred";
  }
};

// Usage in components
const handleRequest = async (endpoint) => {
  try {
    const response = await fetch(endpoint, { credentials: "include" });
    const result = await response.json();

    if (!response.ok) {
      const errorMsg = handleApiError(result, response.status);
      showNotification(errorMsg, "error");
    }
    return result;
  } catch (error) {
    showNotification("Network error occurred", "error");
  }
};
```

---

## Frontend Pages & Integration Points

### 1. Authentication Pages

#### Login Page

- **Route**: `/salesperson/login`
- **Purpose**: Initial email/password entry
- **Integration**: Calls `POST /auth/login`
- **Next Step**: OTP Verification Page

#### OTP Verification Page

- **Route**: `/salesperson/verify-otp`
- **Purpose**: Second factor authentication
- **Integration**: Calls `POST /auth/verify-otp`
- **Success Redirect**: Dashboard
- **Data Stored**: Salesperson info, permissions, managed branches

#### Forget Password Page

- **Route**: `/salesperson/forgot-password`
- **Purpose**: Request password reset
- **Integration**: Calls `POST /auth/forget-password`
- **User Action**: Check email for reset link

#### Reset Password Page

- **Route**: `/salesperson/reset-password?token=<token>`
- **Purpose**: Set new password
- **Integration**: Calls `POST /auth/reset-password`
- **Token Source**: Email link parameter

---

### 2. Dashboard

#### Salesperson Dashboard

- **Route**: `/salesperson/dashboard`
- **Purpose**: Main portal after login
- **Data Required**:
  - Salesperson info (name, email, contact)
  - Managed branches list
  - Quick stats (orders, customers)
  - Recent activity
- **Protected**: Yes - requires valid session

#### Page Layout

```
┌─────────────────────────────────────┐
│          SALESPERSON PORTAL         │
├─────────────────────────────────────┤
│  Welcome, John Doe                  │
│  ✉ john.doe@philbox.com             │
├─────────────────────────────────────┤
│                                     │
│  Managed Branches:                  │
│  • Branch 1 (Karachi)              │
│  • Branch 2 (Lahore)               │
│                                     │
│  Quick Stats:                       │
│  Orders: 45  |  Customers: 120     │
│                                     │
│  Recent Orders [List View]          │
│  Recent Customers [List View]       │
│                                     │
└─────────────────────────────────────┘
```

---

### 3. Order Management

#### Orders List

- **Route**: `/salesperson/orders`
- **Purpose**: View and manage orders in managed branches
- **Filtering**: By branch, date range, status
- **Features**: Create, view, update order status
- **Pagination**: Yes - 10 items per page

#### Order Details

- **Route**: `/salesperson/orders/:orderId`
- **Purpose**: View complete order information
- **Features**: Edit order details, update status, add notes

---

### 4. Customer Management

#### Customers List

- **Route**: `/salesperson/customers`
- **Purpose**: View customers in managed branches
- **Filtering**: By branch, name, contact
- **Pagination**: Yes

#### Customer Details

- **Route**: `/salesperson/customers/:customerId`
- **Purpose**: View full customer profile
- **Features**: Edit customer info, view order history

---

### 5. Settings & Profile

#### Profile Settings

- **Route**: `/salesperson/settings/profile`
- **Purpose**: View and edit personal information
- **Editable Fields**: Full name, contact number, date of birth, gender
- **Protected**: Own profile only

#### Change Password

- **Route**: `/salesperson/settings/change-password`
- **Purpose**: Change account password
- **Features**: Current password verification, new password confirmation

#### Logout

- **Location**: Header menu
- **Purpose**: End session
- **Integration**: Calls `POST /auth/logout`
- **Result**: Clears session and redirects to login page

---

### 6. Branch-Specific Views

#### Branch Dashboard

- **Route**: `/salesperson/branch/:branchId/dashboard`
- **Purpose**: View metrics for specific branch
- **Data**: Branch-specific orders, customers, stats
- **Protection**: Salesperson must manage this branch

#### Branch Orders

- **Route**: `/salesperson/branch/:branchId/orders`
- **Purpose**: Orders for specific branch only
- **Features**: Filter, search, create, update

#### Branch Customers

- **Route**: `/salesperson/branch/:branchId/customers`
- **Purpose**: Customers in specific branch
- **Features**: View, create, edit customer info

---

## Implementation Checklist

### Initial Setup

- [ ] Configure Context Provider with SalespersonProvider
- [ ] Set up routing structure with protected routes
- [ ] Implement loading states and error handling
- [ ] Set up notification/toast system

### Authentication Flow

- [ ] Implement Login page (email/password)
- [ ] Implement OTP verification page
- [ ] Implement Forget Password flow
- [ ] Implement Reset Password with token
- [ ] Test logout functionality

### Session Management

- [ ] Implement session verification on app mount
- [ ] Store salesperson data in context
- [ ] Handle session expiration
- [ ] Implement session recovery on network restore
- [ ] Add timeout handler for inactivity

### Protected Routes

- [ ] Create ProtectedSalespersonRoute component
- [ ] Implement permission checking
- [ ] Implement branch access control
- [ ] Handle unauthorized access

### Dashboard

- [ ] Display salesperson welcome info
- [ ] Show managed branches list
- [ ] Display quick statistics
- [ ] Show recent activity

### Error Handling

- [ ] Implement error boundary component
- [ ] Handle 401 unauthorized errors
- [ ] Handle 403 forbidden errors
- [ ] Handle 429 rate limit errors
- [ ] Show user-friendly error messages

### Testing

- [ ] Test full login flow
- [ ] Test OTP verification
- [ ] Test session recovery
- [ ] Test permission validation
- [ ] Test branch access control
- [ ] Test logout flow

---

## Common Integration Patterns

### Using the Session in Components

```javascript
// pages/Orders.jsx
import { useSalesperson } from "../hooks/useSalesperson";

export const OrdersPage = () => {
  const { salesperson, managedBranches, managesBranch } = useSalesperson();

  const fetchOrders = async (branchId) => {
    // Verify access before fetching
    if (!managesBranch(branchId)) {
      showNotification("Access denied to this branch", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/salesperson/orders?branchId=${branchId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  return (
    <div>
      <h1>Orders - {salesperson?.fullName}</h1>
      {managedBranches.map((branchId) => (
        <BranchOrders
          key={branchId}
          branchId={branchId}
          onFetch={fetchOrders}
        />
      ))}
    </div>
  );
};
```

### Creating Orders

```javascript
const handleCreateOrder = async (orderData) => {
  const { managesBranch } = useSalesperson();

  // Verify branch access
  if (!managesBranch(orderData.branchId)) {
    showNotification("Cannot create order in this branch", "error");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/salesperson/orders",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      },
    );

    if (response.ok) {
      const result = await response.json();
      showNotification("Order created successfully", "success");
      return result.data.order;
    } else {
      showNotification("Failed to create order", "error");
    }
  } catch (error) {
    console.error("Create order error:", error);
  }
};
```

---

## Performance Tips

1. **Minimize API Calls**: Cache branch and salesperson data
2. **Lazy Load**: Load customer and order lists with pagination
3. **Debounce Search**: Implement debounce on search inputs
4. **Session Verification**: Only verify session on app mount and on 401 errors
5. **Error Recovery**: Don't retry failed requests excessively

---

## Security Best Practices

1. **Always use `credentials: 'include'`**: Ensures session cookie is sent
2. **Never expose tokens in logs**: Session cookies are HttpOnly by design
3. **Validate user input**: Sanitize all form inputs before sending
4. **Check permissions before actions**: Don't rely on backend only
5. **Handle 401 errors immediately**: Clear session and redirect to login
6. **Never store sensitive data in localStorage**: Use context/state only
7. **Verify branch access**: Always check managesBranch() before operations
