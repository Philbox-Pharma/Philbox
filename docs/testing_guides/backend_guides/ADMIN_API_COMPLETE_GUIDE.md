# Admin API Complete Guide

## Base URL

```
http://localhost:5000/api/super-admin
```

## Authentication

All routes except login require session-based authentication. Include session cookie in requests.

---

## 1. Admin Authentication APIs

### 1.1 Admin Login

**Endpoint:** `POST /api/admin/auth/login`

**Request Body:**

```json
{
  "email": "admin@philbox.com",
  "password": "password123"
}
```

**Success Response (with 2FA enabled):**

```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "admin@philbox.com",
    "nextStep": "verify-otp",
    "isTwoFactorEnabled": true
  }
}
```

**Success Response (without 2FA):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "admin@philbox.com",
      "category": "super-admin",
      "status": "active",
      "roleId": "64def456..."
    },
    "nextStep": "dashboard",
    "isTwoFactorEnabled": false
  }
}
```

**Error Responses:**

- `404` - Invalid email
- `401` - Invalid credentials
- `403` - Account suspended/blocked

---

### 1.2 Verify OTP (2FA)

**Endpoint:** `POST /api/admin/auth/verify-otp`

**Request Body:**

```json
{
  "email": "admin@philbox.com",
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "admin": {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "admin@philbox.com",
      "category": "super-admin"
    },
    "nextStep": "dashboard"
  }
}
```

**Error Responses:**

- `400` - Invalid or expired OTP
- `401` - Invalid session

---

### 1.3 Forget Password

**Endpoint:** `POST /api/admin/auth/forget-password`

**Request Body:**

```json
{
  "email": "admin@philbox.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.4 Reset Password

**Endpoint:** `POST /api/admin/auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.5 Update 2FA Settings

**Endpoint:** `PATCH /api/admin/auth/2fa-settings`
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
  "message": "Two-factor authentication enabled successfully",
  "data": {
    "isTwoFactorEnabled": true
  }
}
```

---

### 1.6 Logout

**Endpoint:** `POST /api/admin/auth/logout`
**Authentication:** Required

**Success Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. Branch Management APIs

### 2.1 Create Branch

**Endpoint:** `POST /api/super-admin/branches`
**Authentication:** Required
**Permission:** `create_branches`

**Request Body:**

```json
{
  "name": "Philbox Karachi",
  "phone": "+92-300-1234567",
  "street": "Main Boulevard",
  "town": "Gulshan-e-Iqbal",
  "city": "Karachi",
  "province": "Sindh",
  "zip_code": "75300",
  "country": "Pakistan",
  "google_map_link": "https://maps.google.com/...",
  "under_administration_of": ["64abc123...", "64def456..."],
  "salespersons_assigned": ["64ghi789..."]
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "_id": "64xyz123...",
    "name": "Philbox Karachi",
    "code": "PHIL25#001",
    "phone": "+92-300-1234567",
    "status": "Active",
    "address_id": "64addr123...",
    "under_administration_of": ["64abc123...", "64def456..."],
    "salespersons_assigned": ["64ghi789..."],
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 2.2 Get All Branches

**Endpoint:** `GET /api/super-admin/branches`
**Authentication:** Required
**Permission:** `read_branches`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or code
- `status` (optional): Filter by status (`Active` or `Inactive`)

**Example Request:**

```
GET /api/super-admin/branches?page=1&limit=10&status=Active&search=karachi
```

**Success Response:**

```json
{
  "success": true,
  "message": "Branches fetched successfully",
  "data": {
    "branches": [
      {
        "_id": "64xyz123...",
        "name": "Philbox Karachi",
        "code": "PHIL25#001",
        "phone": "+92-300-1234567",
        "status": "Active",
        "address": {
          "city": "Karachi",
          "province": "Sindh"
        },
        "under_administration_of": [
          {
            "_id": "64abc123...",
            "name": "Admin Name"
          }
        ],
        "created_at": "2025-12-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2.3 Get Branch by ID

**Endpoint:** `GET /api/super-admin/branches/:id`
**Authentication:** Required
**Permission:** `read_branches`

**Success Response:**

```json
{
  "success": true,
  "message": "Branch fetched successfully",
  "data": {
    "_id": "64xyz123...",
    "name": "Philbox Karachi",
    "code": "PHIL25#001",
    "phone": "+92-300-1234567",
    "status": "Active",
    "address": {
      "_id": "64addr123...",
      "street": "Main Boulevard",
      "town": "Gulshan-e-Iqbal",
      "city": "Karachi",
      "province": "Sindh",
      "zip_code": "75300",
      "country": "Pakistan"
    },
    "under_administration_of": [
      {
        "_id": "64abc123...",
        "name": "John Doe",
        "email": "admin@philbox.com",
        "status": "active"
      }
    ],
    "salespersons_assigned": [
      {
        "_id": "64ghi789...",
        "fullName": "Sales Person",
        "email": "sales@philbox.com",
        "status": "active"
      }
    ],
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 2.4 Update Branch

**Endpoint:** `PUT /api/super-admin/branches/:id`
**Authentication:** Required
**Permission:** `update_branches`

**Request Body:**

```json
{
  "name": "Philbox Karachi Updated",
  "phone": "+92-300-9999999",
  "street": "New Address",
  "city": "Karachi"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Branch updated successfully",
  "data": {
    "_id": "64xyz123...",
    "name": "Philbox Karachi Updated",
    "phone": "+92-300-9999999",
    "updated_at": "2025-12-18T11:00:00.000Z"
  }
}
```

---

### 2.5 Toggle Branch Status

**Endpoint:** `PATCH /api/super-admin/branches/:id/toggle-status`
**Authentication:** Required
**Permission:** `update_branches`

**Success Response:**

```json
{
  "success": true,
  "message": "Branch status updated to Inactive",
  "data": {
    "_id": "64xyz123...",
    "status": "Inactive"
  }
}
```

---

### 2.6 Assign Admins to Branch

**Endpoint:** `PATCH /api/super-admin/branches/:id/assign-admins`
**Authentication:** Required
**Permission:** `update_branches`

**Request Body:**

```json
{
  "adminIds": ["64abc123...", "64def456..."]
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Admins assigned to branch successfully",
  "data": {
    "_id": "64xyz123...",
    "name": "Philbox Karachi",
    "under_administration_of": [
      {
        "_id": "64abc123...",
        "name": "Admin 1",
        "email": "admin1@philbox.com"
      },
      {
        "_id": "64def456...",
        "name": "Admin 2",
        "email": "admin2@philbox.com"
      }
    ]
  }
}
```

---

### 2.7 Assign Salespersons to Branch

**Endpoint:** `PATCH /api/super-admin/branches/:id/assign-salespersons`
**Authentication:** Required
**Permission:** `update_branches`

**Request Body:**

```json
{
  "salespersonIds": ["64ghi789...", "64jkl012..."]
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Salespersons assigned to branch successfully",
  "data": {
    "_id": "64xyz123...",
    "name": "Philbox Karachi",
    "salespersons_assigned": [
      {
        "_id": "64ghi789...",
        "fullName": "Salesperson 1",
        "email": "sales1@philbox.com"
      }
    ]
  }
}
```

---

### 2.8 Delete Branch

**Endpoint:** `DELETE /api/super-admin/branches/:id`
**Authentication:** Required
**Permission:** `delete_branches`

**Success Response:**

```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

---

### 2.9 Get Branch Statistics

**Endpoint:** `GET /api/super-admin/branches/statistics/all`
**Authentication:** Required
**Permission:** `read_branches`

**Success Response:**

```json
{
  "success": true,
  "message": "Branch statistics fetched successfully",
  "data": {
    "total": 50,
    "active": 45,
    "inactive": 5
  }
}
```

---

### 2.10 Get Branch Performance Metrics

**Endpoint:** `GET /api/super-admin/branches/:id/performance`
**Authentication:** Required
**Permission:** `read_branches`

**Query Parameters:**

- `startDate` (optional): ISO date string (default: 30 days ago)
- `endDate` (optional): ISO date string (default: today)
- `period` (optional): 'daily', 'weekly', 'monthly'

**Example Request:**

```
GET /api/super-admin/branches/64xyz123.../performance?startDate=2025-11-01&endDate=2025-12-18
```

**Success Response:**

```json
{
  "success": true,
  "message": "Branch performance metrics fetched successfully",
  "data": {
    "branch_info": {
      "id": "64xyz123...",
      "name": "Philbox Karachi",
      "code": "PHIL25#001",
      "status": "Active"
    },
    "period": {
      "start_date": "2025-11-01T00:00:00.000Z",
      "end_date": "2025-12-18T23:59:59.999Z",
      "period_type": "daily",
      "days_count": 47
    },
    "orders": {
      "total": 250,
      "completed": 220,
      "cancelled": 15,
      "refunded": 15,
      "completion_rate": 88.0,
      "revenue": 450000,
      "refund_amount": 25000,
      "net_revenue": 425000
    },
    "complaints": {
      "total": 30,
      "new": 5,
      "resolved": 20,
      "pending": 5,
      "resolution_rate": 66.67
    },
    "customer_engagement": {
      "average_rating": 4.5,
      "feedback_count": 180,
      "new_customers": 75
    },
    "staff_performance": {
      "active_admins": 3,
      "total_admins": 3,
      "active_salespersons": 5,
      "total_salespersons": 6,
      "admins": [
        {
          "id": "64abc123...",
          "name": "Admin Name",
          "email": "admin@philbox.com",
          "status": "active"
        }
      ],
      "salespersons": [
        {
          "id": "64ghi789...",
          "name": "Sales Person",
          "email": "sales@philbox.com",
          "status": "active"
        }
      ]
    },
    "financial_summary": {
      "total_revenue": 450000,
      "net_revenue": 425000,
      "average_daily_revenue": 9574.47
    }
  }
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information (in development mode only)"
}
```

**Common Status Codes:**

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions or account blocked)
- `404` - Not Found
- `500` - Server Error
