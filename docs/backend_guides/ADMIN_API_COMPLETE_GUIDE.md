# Philbox Admin API — Complete Guide

**Base URL:** `http://localhost:5000/api/admin`

**Last Updated:** December 28, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Admin Authentication APIs](#1-admin-authentication-apis)
3. [Branch Management APIs](#2-branch-management-apis)
4. [User Management (Admins & Salespersons)](#3-user-management-apis)
5. [Permissions & RBAC](#4-permissions--rbac-apis)
6. [Customer Management](#5-customer-management-apis)
7. [Doctor Management](#6-doctor-management-apis)
8. [Salesperson Task Management](#7-salesperson-task-management-apis)
9. [Dashboard Analytics](#8-dashboard-analytics-apis)
10. [Socket.IO Real-Time Events](#9-socketio-real-time-events)
11. [Models Reference](#models-reference)
12. [Error Response Format](#error-response-format)

---

## Overview

This guide covers all Admin APIs for the Philbox healthcare platform. All endpoints use a standardized response envelope:

```json
{
  "status": <HTTP status code>,
  "message": "<human readable message>",
  "data": <optional payload>
}
```

**Authentication:** Session-based (express-session). RBAC checks via `roleMiddleware` or `rbacMiddleware`. Sensitive endpoints restricted to super-admin.

**Base URL:** `http://localhost:5000/api/admin`

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
      "phone_number": \"+92-300-1234567\",
      "category\": \"super-admin\",
      "status": "active",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John+Doe",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John+Doe",
      "branches_managed": [],
      "addresses": [],
      "roleId": "64def456...",
      "isTwoFactorEnabled": false,
      "created_at": "2025-01-15T10:00:00.000Z"
    },
    "nextStep": "dashboard"
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
      "phone_number": "+92-300-1234567",
      "category": "super-admin",
      "status": "active",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John+Doe",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John+Doe",
      "branches_managed": [],
      "addresses": [],
      "roleId": "64role123...",
      "isTwoFactorEnabled": true,
      "created_at": "2025-01-15T10:00:00.000Z"
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

### 1.6 Get Current Admin

**Endpoint:** `GET /api/admin/auth/me`
**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Admin fetched successfully",
  "data": {
    "admin": {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "admin@philbox.com",
      "phone_number": "+92-300-1234567",
      "category": "super-admin",
      "status": "active",
      "branches_managed": [],
      "roleId": {
        "_id": "64role123...",
        "name": "super_admin"
      },
      "isTwoFactorEnabled": true
    }
  }
}
```

---

### 1.7 Logout

**Endpoint:** `POST /api/admin/auth/logout`
**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. Branch Management APIs

### 2.1 Create Branch

**Endpoint:** `POST /api/admin/branches`
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

**Endpoint:** `GET /api/admin/branches`
**Authentication:** Required
**Permission:** `read_branches`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or code
- `status` (optional): Filter by status (`Active` or `Inactive`)

**Example Request:**

```
GET /api/admin/branches?page=1&limit=10&status=Active&search=karachi
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

**Endpoint:** `GET /api/admin/branches/:id`
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

**Endpoint:** `PUT /api/admin/branches/:id`
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

**Endpoint:** `PATCH /api/admin/branches/:id/toggle-status`
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

**Endpoint:** `PATCH /api/admin/branches/:id/assign-admins`
**Authentication:** Required
**Permission:** `update_branches`

**Request Body:**

```json
{
  "under_administration_of": ["64abc123...", "64def456..."]
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

**Endpoint:** `PATCH /api/admin/branches/:id/assign-salespersons`
**Authentication:** Required
**Permission:** `update_branches`

**Request Body:**

```json
{
  "salespersons_assigned": ["64ghi789...", "64jkl012..."]
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

**Endpoint:** `DELETE /api/admin/branches/:id`
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

**Endpoint:** `GET /api/admin/branches/statistics/all`
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

**Endpoint:** `GET /api/admin/branches/:id/performance`
**Authentication:** Required
**Permission:** `read_branches`

**Query Parameters:**

- `startDate` (optional): ISO date string (default: 30 days ago)
- `endDate` (optional): ISO date string (default: today)
- `period` (optional): 'daily', 'weekly', 'monthly'

**Example Request:**

```
GET /api/admin/branches/64xyz123.../performance?startDate=2025-11-01&endDate=2025-12-18
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
          "fullName": "Sales Person",
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

## 3. User Management APIs

### Admin Management

**Base Route:** `/api/admin/users/admin`
**Authorization:** All endpoints require `super_admin` role

#### 3.1 Create Branch Admin

**Endpoint:** `POST /api/admin/users/admin`

**Content-Type:** `multipart/form-data` (for file uploads)

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@philbox.com",
  "password": "SecurePass123",
  "phone_number": "+92-300-1234567",
  "category": "branch-admin",
  "status": "active",
  "branches_managed": ["64abc123..."],
  "isTwoFactorEnabled": false,
  "addresses": [
    {
      "street": "Main Street",
      "city": "Karachi",
      "province": "Sindh",
      "country": "Pakistan",
      "zip_code": "75300"
    }
  ]
}
```

**File Fields (optional):**

- `profile_img` - Admin profile image
- `cover_img` - Admin cover image

**Response:**

```json
{
  "success": true,
  "message": "Branch admin created successfully",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "john@philbox.com",
    "phone_number": "+92-300-1234567",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://avatar.iran.liara.run/username?username=John+Doe",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John+Doe",
    "branches_managed": ["64abc123..."],
    "addresses": ["64addr123..."],
    "roleId": "64def456...",
    "isTwoFactorEnabled": false,
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

#### 3.2 Get All Admins

**Endpoint:** `GET /api/admin/users/admin`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active`, `suspended`, `blocked`)
- `branch` (optional): Filter by branch ID

**Response:**

```json
{
  "success": true,
  "message": "Admins fetched successfully",
  "data": {
    "admins": [
      {
        "_id": "64abc123...",
        "name": "John Doe",
        "email": "john@philbox.com",
        "category": "branch-admin",
        "status": "active",
        "phone_number": "+92-300-1234567",
        "branches_managed": [
          {
            "_id": "64xyz123...",
            "name": "Philbox Karachi",
            "code": "PHIL25#001"
          }
        ],
        "roleId": {
          "_id": "64role123...",
          "name": "branch_admin",
          "description": "Branch administrator role"
        },
        "isTwoFactorEnabled": false,
        "created_at": "2025-12-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    }
  }
}
```

---

#### 3.3 Get Admin by ID

**Endpoint:** `GET /api/admin/users/admin/:id`

**Response:**

```json
{
  "success": true,
  "message": "Admin details fetched successfully",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "john@philbox.com",
    "category": "branch-admin",
    "status": "active",
    "phone_number": "+92-300-1234567",
    "roleId": {
      "_id": "64def456...",
      "name": "branch_admin",
      "description": "Branch administrator role",
      "permissions": []
    },
    "branches_managed": [
      {
        "_id": "64branch123...",
        "name": "Philbox Karachi",
        "code": "PHIL25#001"
      }
    ],
    "addresses": [
      {
        "_id": "64addr123...",
        "street": "Main Street",
        "town": "Block 5",
        "city": "Karachi",
        "province": "Sindh",
        "zip_code": "75300",
        "country": "Pakistan",
        "google_map_link": "https://maps.google.com/..."
      }
    ],
    "isTwoFactorEnabled": false,
    "profile_img_url": "https://avatar.iran.liara.run/username?username=John+Doe",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John+Doe",
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

#### 3.4 Update Admin

**Endpoint:** `PUT /api/admin/users/admin/:id`

**Content-Type:** `multipart/form-data`

**Request Body (at least one field required):**

```json
{
  "name": "John Doe Updated",
  "phone_number": "+92-300-9999999",
  "status": "active",
  "branches_managed": ["64abc123...", "64def456..."]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe Updated",
    "email": "john@philbox.com",
    "updated_at": "2025-12-28T11:00:00.000Z"
  }
}
```

---

#### 3.5 Delete Admin

**Endpoint:** `DELETE /api/admin/users/admin/:id`

**Response:**

```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

---

### Salesperson Management

**Base Route:** `/api/admin/users/salesperson`
**Authorization:** All endpoints require `super_admin` role

#### 3.6 Create Salesperson

**Endpoint:** `POST /api/admin/users/salesperson`

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane@philbox.com",
  "password": "SecurePass123",
  "contactNumber": "3001234567",
  "gender": "Female",
  "dateOfBirth": "1995-05-15",
  "branches_to_be_managed": ["64abc123..."]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Salesperson created successfully",
  "data": {
    "_id": "64ghi789...",
    "fullName": "Jane Smith",
    "email": "jane@philbox.com",
    "contactNumber": "3001234567",
    "gender": "Female",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "status": "active",
    "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane+Smith",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Jane+Smith",
    "branches_to_be_managed": ["64abc123..."],
    "address_id": null,
    "roleId": "64role123...",
    "isTwoFactorEnabled": false,
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

#### 3.7 Get All Salespersons

**Endpoint:** `GET /api/admin/users/salesperson`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by fullName or email
- `status` (optional): Filter by status (`active`, `suspended`, `blocked`)
- `branch` (optional): Filter by branch ID

**Response:**

```json
{
  "success": true,
  "message": "Salespersons fetched successfully",
  "data": {
    "salespersons": [
      {
        "_id": "64ghi789...",
        "fullName": "Jane Smith",
        "email": "jane@philbox.com",
        "contactNumber": "3001234567",
        "gender": "Female",
        "dateOfBirth": "1995-05-15T00:00:00.000Z",
        "status": "active",
        "branches_to_be_managed": [
          {
            "_id": "64abc123...",
            "name": "Philbox Karachi",
            "code": "PHIL25#001",
            "status": "Active"
          }
        ],
        "roleId": {
          "_id": "64role123...",
          "name": "salesperson",
          "description": "Salesperson role"
        },
        "profile_img_url": "https://avatar.iran.liara.run/...",
        "created_at": "2025-12-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 10
    }
  }
}
```

---

#### 3.8 Get Salesperson by ID

**Endpoint:** `GET /api/admin/users/salesperson/:id`

**Response:**

```json
{
  "success": true,
  "message": "Salesperson details fetched successfully",
  "data": {
    "_id": "64ghi789...",
    "fullName": "Jane Smith",
    "email": "jane@philbox.com",
    "contactNumber": "3001234567",
    "gender": "Female",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "status": "active",
    "branches_to_be_managed": [
      {
        "_id": "64abc123...",
        "name": "Philbox Karachi",
        "code": "PHIL25#001",
        "status": "Active"
      }
    ],
    "roleId": {
      "_id": "64role123...",
      "name": "salesperson",
      "description": "Salesperson role",
      "permissions": []
    },
    "profile_img_url": "https://avatar.iran.liara.run/username?username=Jane+Smith",
    "last_login": "2025-12-27T15:30:00.000Z",
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

#### 3.9 Update Salesperson

**Endpoint:** `PUT /api/admin/users/salesperson/:id`

**Request Body (at least one field required):**

```json
{
  "fullName": "Jane Smith Updated",
  "contactNumber": "3009999999",
  "branches_to_be_managed": ["64abc123...", "64def456..."]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Salesperson updated successfully",
  "data": {
    "_id": "64ghi789...",
    "fullName": "Jane Smith Updated",
    "contactNumber": "3009999999",
    "updated_at": "2025-12-28T11:00:00.000Z"
  }
}
```

---

#### 3.10 Update Salesperson Status

**Endpoint:** `PATCH /api/admin/users/salesperson/:id/status`

**Request Body:**

```json
{
  "status": "suspended"
}
```

**Allowed Values:** `active`, `suspended`, `blocked`

**Response:**

```json
{
  "success": true,
  "message": "Salesperson status updated successfully",
  "data": {
    "_id": "64ghi789...",
    "status": "suspended"
  }
}
```

---

#### 3.11 Delete Salesperson

**Endpoint:** `DELETE /api/admin/users/salesperson/:id`

**Response:**

```json
{
  "success": true,
  "message": "Salesperson deleted successfully"
}
```

---

## 4. Permissions & RBAC APIs

**Base Route:** `/api/admin/permissions`
**Authorization:** All endpoints require `super_admin` role

### 4.1 Get All Roles

**Endpoint:** `GET /api/admin/permissions/roles`

**Response:**

```json
{
  "success": true,
  "message": "Roles fetched successfully",
  "data": [
    {
      "_id": "64role123...",
      "name": "Super Admin",
      "description": "Full system access",
      "permissions": [
        {
          "_id": "64perm1...",
          "resource": "branches",
          "action": "create",
          "description": "Create branches"
        }
      ]
    }
  ]
}
```

---

### 4.2 Get Role by ID

**Endpoint:** `GET /api/admin/permissions/roles/:roleId`

**Response:**

```json
{
  "success": true,
  "message": "Role fetched successfully",
  "data": {
    "_id": "64role123...",
    "name": "Branch Admin",
    "description": "Branch-level management",
    "permissions": []
  }
}
```

---

### 4.3 Get All Permissions

**Endpoint:** `GET /api/admin/permissions/permissions`

**Response:**

```json
{
  "success": true,
  "message": "Permissions fetched successfully",
  "data": [
    {
      "_id": "64perm1...",
      "resource": "branches",
      "action": "create",
      "description": "Create new branches"
    },
    {
      "_id": "64perm2...",
      "resource": "branches",
      "action": "read",
      "description": "View branch information"
    }
  ]
}
```

---

### 4.4 Create Permission

**Endpoint:** `POST /api/admin/permissions/permissions`

**Request Body:**

```json
{
  "resource": "branches",
  "action": "create",
  "description": "Create new branches"
}
```

**Action Values:** `create`, `read`, `update`, `delete`

**Response:**

```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "_id": "64perm1...",
    "resource": "branches",
    "action": "create",
    "description": "Create new branches"
  }
}
```

---

### 4.5 Update Role Permissions

**Endpoint:** `PUT /api/admin/permissions/roles/:roleId`

**Request Body:**

```json
{
  "permissionIds": ["64perm1...", "64perm2...", "64perm3..."]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Role permissions updated successfully",
  "data": {
    "_id": "64role123...",
    "name": "Branch Admin",
    "permissions": ["64perm1...", "64perm2...", "64perm3..."]
  }
}
```

---

### 4.6 Add Permission to Role

**Endpoint:** `POST /api/admin/permissions/roles/:roleId/permissions`

**Request Body:**

```json
{
  "roleId": "64role123...",
  "permissionId": "64perm1..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Permission added to role successfully",
  "data": {
    "_id": "64role123...",
    "permissions": ["64perm1..."]
  }
}
```

---

### 4.7 Remove Permission from Role

**Endpoint:** `DELETE /api/admin/permissions/roles/:roleId/permissions`

**Request Body:**

```json
{
  "roleId": "64role123...",
  "permissionId": "64perm1..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Permission removed from role successfully",
  "data": {
    "_id": "64role123...",
    "permissions": []
  }
}
```

---

### 4.8 Assign Role to User

**Endpoint:** `POST /api/admin/permissions/users/assign-role`

**Request Body:**

```json
{
  "userId": "64user123...",
  "userType": "admin",
  "roleId": "64role123..."
}
```

**User Types:** `admin`, `customer`, `doctor`, `salesperson`

**Response:**

```json
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": {
    "_id": "64user123...",
    "roleId": "64role123..."
  }
}
```

---

### 4.9 Get User Role

**Endpoint:** `GET /api/admin/permissions/user-role`

**Query Parameters:**

- `userId` (optional): User ID to check
- `userType` (optional): Type of user

**Note:** If no parameters provided, returns authenticated admin's role

**Response:**

```json
{
  "success": true,
  "message": "User role fetched successfully",
  "data": {
    "role": {
      "_id": "64role123...",
      "name": "Super Admin",
      "description": "Full system access"
    },
    "permissions": [
      {
        "_id": "64perm1...",
        "resource": "branches",
        "action": "create"
      }
    ]
  }
}
```

---

## 5. Customer Management APIs

**Base Route:** `/api/admin/customers`
**Authorization:** Authenticated admin (super-admin or branch-admin)

### 5.1 Get Customer Analytics

**Endpoint:** `GET /api/admin/customers/metrics/analytics`

**Query Parameters:**

- `branchId` (optional): Filter by specific branch
- `startDate` (optional): Start date for metrics
- `endDate` (optional): End date for metrics

**Response:**

```json
{
  "success": true,
  "message": "Customer metrics fetched successfully",
  "data": {
    "totalCustomers": 1250,
    "activeCustomers": 1100,
    "newCustomersThisMonth": 85,
    "customerGrowthRate": 7.3,
    "averageOrderValue": 2500,
    "topCustomers": []
  }
}
```

---

### 5.2 Get All Customers

**Endpoint:** `GET /api/admin/customers`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by fullName, email, or contactNumber
- `status` (optional): Filter by status - `active`, `suspended/freezed`, `blocked/removed`
- `is_Verified` (optional): Filter verified customers - `true` or `false`
- `startDate` (optional): Filter by registration start date
- `endDate` (optional): Filter by registration end date
- `branchId` (optional): Filter customers by branch (for super-admins)

**Note:** Branch admins only see customers who have placed orders in their branches.

**Response:**

```json
{
  "success": true,
  "message": "Customers fetched successfully",
  "data": {
    "list": [
      {
        "_id": "64cust123...",
        "fullName": "Ali Ahmed",
        "email": "ali@example.com",
        "contactNumber": "3001234567",
        "status": "active",
        "is_Verified": true,
        "address_id": {
          "_id": "64addr123...",
          "street": "Main Street",
          "city": "Karachi",
          "state": "Sindh",
          "country": "Pakistan",
          "zipCode": "75300"
        },
        "roleId": {
          "_id": "64role123...",
          "name": "customer",
          "permissions": []
        },
        "created_at": "2025-12-01T10:00:00.000Z"
      }
    ],
    "total": 150,
    "currentPage": 1,
    "totalPages": 15,
    "limit": 10
  }
}
```

---

### 5.3 Get Customer by ID

**Endpoint:** `GET /api/admin/customers/:id`

**Note:** Branch admins can only view customers who have placed orders in their branches.

**Response:**

```json
{
  "success": true,
  "message": "Customer details fetched successfully",
  "data": {
    "customer": {
      "_id": "64cust123...",
      "fullName": "Ali Ahmed",
      "email": "ali@example.com",
      "contactNumber": "3001234567",
      "gender": "Male",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "status": "active",
      "is_Verified": true,
      "address_id": {
        "_id": "64addr123...",
        "street": "Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "country": "Pakistan",
        "zipCode": "75300"
      },
      "roleId": {
        "_id": "64role123...",
        "name": "customer",
        "permissions": []
      },
      "profile_img_url": "https://avatar.iran.liara.run/...",
      "created_at": "2025-12-01T10:00:00.000Z"
    },
    "orders": [
      {
        "_id": "64order123...",
        "branch_id": {
          "_id": "64branch123...",
          "name": "Philbox Karachi",
          "location": "Karachi",
          "contactNumber": "+92-300-1234567"
        },
        "salesperson_id": {
          "_id": "64sales123...",
          "fullName": "Jane Smith",
          "email": "jane@philbox.com",
          "contactNumber": "3001234567"
        },
        "order_items": [
          {
            "_id": "64item123...",
            "product_name": "Medicine A",
            "quantity": 2,
            "price": 500,
            "total": 1000
          }
        ],
        "total": 1000,
        "created_at": "2025-12-15T10:00:00.000Z"
      }
    ],
    "reviews": [
      {
        "_id": "64review123...",
        "rating": 5,
        "comment": "Excellent service",
        "created_at": "2025-12-16T10:00:00.000Z"
      }
    ],
    "complaints": [
      {
        "_id": "64comp123...",
        "title": "Late delivery",
        "description": "Order arrived late",
        "status": "resolved",
        "branch_admin_id": {
          "_id": "64admin123...",
          "name": "John Doe",
          "email": "john@philbox.com"
        },
        "super_admin_id": null,
        "created_at": "2025-12-17T10:00:00.000Z"
      }
    ],
    "activityLogs": [
      {
        "_id": "64log123...",
        "action_type": "login",
        "description": "User logged in",
        "timestamp": "2025-12-28T08:00:00.000Z"
      }
    ],
    "metrics": {
      "totalOrders": 5,
      "totalSpent": 5000,
      "totalReviews": 3,
      "averageRating": 4.67,
      "totalComplaints": 1,
      "openComplaints": 0
    }
  }
}
```

---

### 5.4 Update Customer Status

**Endpoint:** `PATCH /api/admin/customers/:id/status`

**Request Body:**

```json
{
  "status": "suspended/freezed",
  "reason": "Multiple policy violations"
}
```

**Status Values:** `active`, `suspended/freezed`, `blocked/removed`

**Response:**

```json
{
  "success": true,
  "message": "Customer status updated successfully",
  "data": {
    "_id": "64cust123...",
    "status": "suspended",
    "updated_at": "2025-12-28T11:00:00.000Z"
  }
}
```

---

## 6. Doctor Management APIs

**Base Route:** `/api/admin/doctors`
**Authorization:** Authenticated admin

Doctor management allows admins to review applications, manage profiles, control account status, and monitor performance metrics.

### Doctor Applications

#### 6.1 Get All Doctor Applications

**Endpoint:** `GET /api/admin/doctors/applications`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by doctor's fullName or email
- `status` (optional): Filter by status - `pending`, `approved`, `rejected` (default: `pending`)

**Response:**

```json
{
  "success": true,
  "message": "Doctor applications fetched successfully",
  "data": {
    "list": [
      {
        "_id": "64app123...",
        "doctor_id": {
          "_id": "64doc123...",
          "fullName": "Dr. Ahmed Ali",
          "email": "ahmed@example.com",
          "contactNumber": "3001234567",
          "profile_img_url": "https://avatar.iran.liara.run/...",
          "status": "pending",
          "created_at": "2025-12-15T10:00:00.000Z"
        },
        "applications_documents_id": {
          "_id": "64docs123...",
          "CNIC": "https://cloudinary.com/cnic.pdf",
          "medical_license": "https://cloudinary.com/license.pdf",
          "specialist_license": "https://cloudinary.com/specialist.pdf",
          "mbbs_md_degree": "https://cloudinary.com/degree.pdf",
          "experience_letters": ["https://cloudinary.com/exp1.pdf"]
        },
        "status": "pending",
        "submitted_at": "2025-12-20T10:00:00.000Z",
        "reviewed_at": null,
        "reviewed_by_admin_id": null,
        "admin_comment": null,
        "created_at": "2025-12-20T10:00:00.000Z"
      }
    ],
    "total": 15,
    "currentPage": 1,
    "totalPages": 2,
    "limit": 10
  }
}
```

---

#### 6.2 Get Single Doctor Application

**Endpoint:** `GET /api/admin/doctors/applications/:id`

**Response:**

```json
{
  "success": true,
  "message": "Doctor application fetched successfully",
  "data": {
    "_id": "64app123...",
    "status": "pending",
    "admin_comment": null,
    "reviewed_at": null,
    "doctor_id": {
      "_id": "64doc123...",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah@doctor.com",
      "contactNumber": "3001234567",
      "gender": "Female",
      "dateOfBirth": "1985-03-15T00:00:00.000Z",
      "profile_img_url": "https://cloudinary.com/...",
      "status": "suspended/freezed",
      "license_number": "MED12345",
      "created_at": "2025-12-20T10:00:00.000Z"
    },
    "applications_documents_id": {
      "_id": "64docs123...",
      "CNIC": "https://cloudinary.com/cnic.pdf",
      "medical_license": "https://cloudinary.com/license.pdf",
      "specialist_license": "https://cloudinary.com/specialist.pdf",
      "mbbs_md_degree": "https://cloudinary.com/degree.pdf",
      "experience_letters": ["https://cloudinary.com/exp1.pdf"],
      "created_at": "2025-12-20T10:05:00.000Z"
    },
    "reviewed_by_admin_id": null
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Application not found"
}
```

---

#### 6.3 Approve Doctor Application

**Endpoint:** `PATCH /api/admin/doctors/applications/:id/approve`

**Request Body:**

```json
{
  "comment": "All credentials verified. Welcome to Philbox!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "application": {
      "_id": "64app123...",
      "status": "approved",
      "admin_comment": "All credentials verified. Welcome to Philbox!",
      "reviewed_by_admin_id": "64admin123...",
      "reviewed_at": "2025-12-28T11:00:00.000Z"
    },
    "doctor": {
      "_id": "64doc123...",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah@doctor.com",
      "status": "active"
    },
    "message": "Application approved successfully"
  }
}
```

**Side Effects:**

- Updates application status to `approved`
- Sets doctor `status` to `active`
- Sends approval email to doctor with login link
- Logs admin activity

**Error Responses:**

- `404` - Application not found
- `400` - Application already approved

---

#### 6.4 Reject Doctor Application

**Endpoint:** `PATCH /api/admin/doctors/applications/:id/reject`

**Request Body:**

```json
{
  "reason": "Incomplete medical license documentation. Please resubmit with valid documents."
}
```

**Validation:**

- `reason` field is required (min: 10 chars, max: 500 chars)

**Response:**

```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "application": {
      "_id": "64app123...",
      "status": "rejected",
      "admin_comment": "Incomplete medical license documentation. Please resubmit with valid documents.",
      "reviewed_by_admin_id": "64admin123...",
      "reviewed_at": "2025-12-28T11:00:00.000Z"
    },
    "doctor": {
      "_id": "64doc123...",
      "status": "suspended/freezed"
    },
    "message": "Application rejected"
  }
}
```

**Side Effects:**

- Updates application status to `rejected`
- Keeps doctor `status` as `suspended/freezed`
- Sends rejection email with reason
- Logs admin activity

**Error Responses:**

- `404` - Application not found
- `400` - Cannot reject already approved application

---

### Doctor Profile Management

#### 6.5 Get All Doctors

**Endpoint:** `GET /api/admin/doctors`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by fullName, email, or license_number
- `specialization` (optional): Filter by specialization
- `status` (optional): Filter by status - `active`, `suspended`, `blocked`
- `sortBy` (optional): Sort by field (default: `created_at`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Response:**

```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": {
    "list": [
      {
        "_id": "64doc123...",
        "fullName": "Dr. Ahmed Ali",
        "email": "ahmed@example.com",
        "contactNumber": "3001234567",
        "gender": "Male",
        "dateOfBirth": "1985-05-15T00:00:00.000Z",
        "specialization": ["Cardiology"],
        "license_number": "PMC12345",
        "status": "active",
        "consultation_fee": 2000,
        "consultation_type": "both",
        "profile_img_url": "https://avatar.iran.liara.run/...",
        "bio": "Experienced cardiologist with 10+ years",
        "years_of_experience": 10,
        "averageRating": 4.5,
        "affiliated_hospital": "City Hospital",
        "created_at": "2025-12-15T10:00:00.000Z"
      }
    ],
    "total": 50,
    "currentPage": 1,
    "totalPages": 5,
    "limit": 10
  }
}
```

**Note:** Response excludes sensitive fields (passwordHash, resetPasswordToken, verificationToken, etc.)

---

#### 6.6 Get Doctor by ID

**Endpoint:** `GET /api/admin/doctors/:id`

**Response:**

```json
{
  "success": true,
  "message": "Doctor details fetched successfully",
  "data": {
    "doctor": {
      "_id": "64doc123...",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah@doctor.com",
      "gender": "Female",
      "dateOfBirth": "1985-03-15T00:00:00.000Z",
      "contactNumber": "3001234567",
      "educational_details": [],
      "specialization": ["Cardiology", "Internal Medicine"],
      "experience_details": [],
      "license_number": "MED12345",
      "affiliated_hospital": "City Medical Center",
      "consultation_type": "both",
      "consultation_fee": 150,
      "status": "active",
      "averageRating": 4.5,
      "profile_img_url": "https://cloudinary.com/...",
      "cover_img_url": "https://cloudinary.com/...",
      "last_login": "2025-12-28T09:00:00.000Z",
      "roleId": "64role123...",
      "created_at": "2025-12-20T10:00:00.000Z"
    },
    "metrics": {
      "totalReviews": 125,
      "averageRating": 4.5,
      "totalAppointments": 200,
      "completedAppointments": 180,
      "missedAppointments": 10,
      "totalConsultations": 175,
      "responseRate": 95,
      "availabilityRate": 80,
      "completionRate": 90,
      "noShowRate": 5,
      "accountCreatedAt": "2025-12-20T10:00:00.000Z",
      "lastLogin": "2025-12-28T09:00:00.000Z",
      "currentStatus": "active"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found"
}
```

---

#### 6.7 Update Doctor Profile

**Endpoint:** `PUT /api/admin/doctors/:id`

**Request Body (at least one field required):**

```json
{
  "specialization": ["Cardiology", "Internal Medicine", "Preventive Medicine"],
  "consultation_fee": 175,
  "consultation_type": "both",
  "affiliated_hospital": "University Medical Center",
  "contactNumber": "3009999999"
}
```

**Allowed Fields:**

- `specialization` (array of strings)
- `consultation_fee` (number, min: 0)
- `consultation_type` (enum: `in-person`, `online`, `both`)
- `affiliated_hospital` (string)
- `contactNumber` (string, digits only, 10-15 length)

**Response:**

```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "_id": "64doc123...",
    "fullName": "Dr. Sarah Johnson",
    "specialization": [
      "Cardiology",
      "Internal Medicine",
      "Preventive Medicine"
    ],
    "consultation_fee": 175,
    "consultation_type": "both",
    "affiliated_hospital": "University Medical Center",
    "contactNumber": "3009999999",
    "updated_at": "2025-12-28T11:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found"
}
```

---

#### 6.8 Update Doctor Account Status

**Endpoint:** `PATCH /api/admin/doctors/:id/status`

**Request Body:**

```json
{
  "status": "suspended/freezed",
  "reason": "Multiple patient complaints regarding unprofessional behavior. Account suspended pending investigation.",
  "sendNotification": true
}
```

**Fields:**

- `status` (required): `active`, `suspended/freezed`, `blocked/removed`
- `reason` (conditional): Required when status is `suspended/freezed` or `blocked/removed`
- `sendNotification` (optional): Boolean, default: `true`

**Response - Suspend:**

```json
{
  "success": true,
  "message": "Doctor account suspended successfully",
  "data": {
    "doctor": {
      "_id": "64doc123...",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah@doctor.com",
      "status": "suspended/freezed"
    },
    "message": "Doctor account suspended successfully"
  }
}
```

**Response - Activate:**

```json
{
  "success": true,
  "message": "Doctor account activated successfully",
  "data": {
    "doctor": {
      "_id": "64doc123...",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah@doctor.com",
      "status": "active"
    },
    "message": "Doctor account activated successfully"
  }
}
```

**Side Effects:**

- Updates doctor account status
- Sends email notification if `sendNotification` is true
- Logs admin activity with status change reason

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found"
}
```

---

#### 6.9 Get Doctor Performance Metrics

**Endpoint:** `GET /api/admin/doctors/:id/metrics`

**Response:**

```json
{
  "success": true,
  "message": "Doctor performance metrics fetched successfully",
  "data": {
    "totalReviews": 125,
    "averageRating": 4.52,
    "totalAppointments": 200,
    "completedAppointments": 180,
    "missedAppointments": 10,
    "totalConsultations": 175,
    "responseRate": 95,
    "availabilityRate": 80,
    "completionRate": 90,
    "noShowRate": 5,
    "accountCreatedAt": "2025-12-20T10:00:00.000Z",
    "lastLogin": "2025-12-28T09:00:00.000Z",
    "currentStatus": "active"
  }
}
```

**Metrics Explanation:**

- **totalReviews**: Total reviews received from patients
- **averageRating**: Average rating (1-5 scale)
- **totalAppointments**: Completed + in-progress appointments
- **completedAppointments**: Successfully completed appointments
- **missedAppointments**: Appointments that were missed
- **totalConsultations**: Meeting/consultation sessions count
- **responseRate**: % of appointment requests responded to (accepted or cancelled vs processing)
- **availabilityRate**: % of days with appointments in last 30 days
- **completionRate**: % of appointments successfully completed
- **noShowRate**: % of appointments missed
- **accountCreatedAt**: Account creation date
- **lastLogin**: Last login timestamp
- **currentStatus**: Current account status

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found"
}
```

---

## 7. Salesperson Task Management APIs

**Base Route:** `/api/admin/salesperson-tasks`
**Authorization:** Authenticated admin

### 7.1 Get Task Statistics

**Endpoint:** `GET /api/admin/salesperson-tasks/statistics`

**Query Parameters:**

- `branch_id` (optional): Filter by branch
- `salesperson_id` (optional): Filter by salesperson
- `startDate` (optional): Start date for statistics
- `endDate` (optional): End date for statistics

**Response:**

```json
{
  "success": true,
  "message": "Task statistics fetched successfully",
  "data": {
    "totalTasks": 150,
    "completedTasks": 120,
    "pendingTasks": 20,
    "overdueTasks": 10,
    "completionRate": 80,
    "averageCompletionTime": 2.5
  }
}
```

---

### 7.2 Get All Tasks

**Endpoint:** `GET /api/admin/salesperson-tasks`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `salesperson_id` (optional): Filter by salesperson ID
- `branch_id` (optional): Filter by branch ID
- `status` (optional): Filter by status - `pending`, `in_progress`, `completed`, `cancelled`
- `priority` (optional): Filter by priority - `low`, `medium`, `high`, `urgent`
- `startDate` (optional): Filter by creation start date
- `endDate` (optional): Filter by creation end date

**Note:** Branch admins can only see tasks from branches they manage.

**Response:**

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "64task123...",
        "title": "Visit pharmacy",
        "description": "Check inventory",
        "assigned_by_admin_id": {
          "_id": "64admin123...",
          "name": "John Doe",
          "email": "john@philbox.com",
          "category": "branch-admin"
        },
        "salesperson_id": {
          "_id": "64sales123...",
          "fullName": "Jane Smith",
          "email": "jane@philbox.com",
          "phone": "3001234567"
        },
        "branch_id": {
          "_id": "64branch123...",
          "name": "Philbox Karachi",
          "code": "PHIL25#001"
        },
        "status": "pending",
        "priority": "high",
        "deadline": "2025-12-30T23:59:59.000Z",
        "created_at": "2025-12-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

---

### 7.3 Get Task by ID

**Endpoint:** `GET /api/admin/salesperson-tasks/:id`

**Response:**

```json
{
  "success": true,
  "message": "Task fetched successfully",
  "data": {
    "_id": "64task123...",
    "assigned_by_admin_id": {
      "_id": "64admin123...",
      "name": "Admin Name"
    },
    "salesperson_id": {
      "_id": "64sales123...",
      "fullName": "Sales Person"
    },
    "branch_id": {
      "_id": "64branch123...",
      "name": "Branch Name"
    },
    "title": "Monthly Inventory Check",
    "description": "Complete inventory audit for December",
    "priority": "high",
    "deadline": "2025-12-31T00:00:00.000Z",
    "status": "in-progress",
    "updates": [
      {
        "message": "Started inventory check",
        "created_at": "2025-12-28T10:00:00.000Z"
      }
    ],
    "created_at": "2025-12-20T10:00:00.000Z"
  }
}
```

---

### 7.4 Create Task

**Endpoint:** `POST /api/admin/salesperson-tasks`

**Request Body:**

```json
{
  "salesperson_id": "64sales123...",
  "branch_id": "64branch123...",
  "title": "Monthly Inventory Check",
  "description": "Complete inventory audit for December",
  "priority": "high",
  "deadline": "2025-12-31T00:00:00.000Z"
}
```

**Priority Values:** `low`, `medium`, `high`, `urgent`

**Response:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64task123...",
    "assigned_by_admin_id": "64admin123...",
    "salesperson_id": "64sales123...",
    "branch_id": "64branch123...",
    "title": "Monthly Inventory Check",
    "description": "Complete inventory audit for December",
    "priority": "high",
    "deadline": "2025-12-31T00:00:00.000Z",
    "status": "pending",
    "created_at": "2025-12-28T10:00:00.000Z"
  }
}
```

---

### 7.5 Update Task

**Endpoint:** `PUT /api/admin/salesperson-tasks/:id`

**Request Body (at least one field required):**

```json
{
  "title": "Updated Task Title",
  "priority": "urgent",
  "deadline": "2025-12-30T00:00:00.000Z",
  "status": "completed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64task123...",
    "title": "Updated Task Title",
    "priority": "urgent",
    "updated_at": "2025-12-28T11:00:00.000Z"
  }
}
```

---

### 7.6 Add Task Update

**Endpoint:** `POST /api/admin/salesperson-tasks/:id/updates`

**Request Body:**

```json
{
  "message": "Completed section A of the inventory check"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Task update added successfully",
  "data": {
    "_id": "64task123...",
    "updates": [
      {
        "message": "Completed section A of the inventory check",
        "created_at": "2025-12-28T11:00:00.000Z"
      }
    ]
  }
}
```

---

### 7.7 Delete Task

**Endpoint:** `DELETE /api/admin/salesperson-tasks/:id`

**Response:**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 8. Dashboard Analytics APIs

All analytics endpoints are mounted under `/api/admin` with feature-specific prefixes. They accept query filters like `branch_id`, `startDate`, `endDate`, `page`, `limit` where applicable.

### 8.1 Appointment Analytics

**Base Route:** `/api/admin/appointment-analytics`

**Endpoints:**

- `GET /trends` - Appointment trends over time
- `GET /completion-rate` - Appointment completion statistics
- `GET /top-doctors/appointments` - Doctors with most appointments
- `GET /top-doctors/revenue` - Doctors with highest revenue
- `GET /appointment-types` - Breakdown by type (in-person/online)
- `GET /average-revenue` - Average revenue per appointment
- `GET /overview` - Overall appointment metrics
- `POST /aggregate` - Aggregate appointments by date

---

### 8.2 Revenue Analytics

**Base Route:** `/api/admin/revenue-analytics`

**Endpoints:**

- `GET /overview` - Overall revenue metrics
- `GET /trends` - Revenue trends over time
- `GET /split` - Revenue breakdown by category
- `GET /top-branches` - Branches with highest revenue
- `GET /refunds` - Refund statistics
- `GET /average-per-customer` - Average customer spending
- `GET /payment-methods` - Payment method distribution

---

### 8.3 Orders Analytics

**Base Route:** `/api/admin/orders-analytics`

**Endpoints:**

- `GET /trends` - Order trends over time
- `GET /status-breakdown` - Orders by status
- `GET /top-medicines` - Best-selling medicines
- `GET /stock-alerts` - Low stock alerts
- `GET /revenue-by-category` - Revenue by product category
- `GET /refund-rate` - Order refund statistics
- `GET /overview` - Overall order metrics

---

### 8.4 Feedback & Complaints Analytics

**Base Route:** `/api/admin/feedback-complaints-analytics`

**Endpoints:**

- `GET /summary` - Overall feedback/complaints summary
- `GET /sentiment-analysis` - Sentiment analysis of feedback
- `GET /resolution-time` - Average complaint resolution time
- `GET /complaints-by-category` - Complaints categorized
- `GET /feedback-by-category` - Feedback categorized
- `GET /resolution-status` - Complaint resolution status
- `GET /feedback-trends` - Feedback trends over time
- `GET /complaint-trends` - Complaint trends over time
- `GET /export` - Export analytics data

---

### 8.5 Activity Logs Analytics

**Base Route:** `/api/admin/activity-logs-analytics`

**Endpoints:**

- `GET /timeline` - Activity timeline
- `GET /frequent-actions` - Most frequent actions
- `GET /login-attempts` - Login attempt statistics
- `GET /suspicious-activities` - Suspicious activity alerts
- `GET /overview` - Overall activity metrics

---

### 8.6 User Engagement Analytics

**Base Route:** `/api/admin/user-engagement-analytics`

**Endpoints:**

- `GET /overview` - Overall engagement metrics
- `GET /new-customers` - New customer registrations
- `GET /customer-status` - Customer status distribution
- `GET /doctor-applications` - Doctor application statistics
- `GET /doctor-activity` - Doctor activity metrics
- `GET /top-customers` - Most active customers
- `GET /retention-rate` - Customer retention rate

---

### 8.7 Salesperson Performance Analytics

**Base Route:** `/api/admin/salesperson-performance`

**Endpoints:**

- `GET /overview` - Overall performance metrics
- `GET /tasks-completion` - Task completion statistics
- `GET /leaderboard` - Salesperson rankings
- `GET /trends` - Performance trends over time
- `GET /completion-time` - Average task completion time

---

## 9. Socket.IO Real-Time Events

**Socket.IO Server:** `http://localhost:5000`
**Transport:** WebSocket (fallback to polling)

Admins receive real-time notifications when salespersons update task statuses or add comments.

### Connection Setup

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

// Join admin room after connection
socket.on("connect", () => {
  console.log("Connected:", socket.id);
  socket.emit("join", { room: `admin:${adminId}` });
});

socket.on("joined", (data) => {
  console.log("Joined room:", data.room);
});
```

---

### Events Received by Admins

#### 9.1 `task:status_updated`

**Triggered:** When a salesperson updates task status
**Payload:**

```json
{
  "taskId": "64task123...",
  "salespersonId": "64sales123...",
  "salespersonName": "John Sales",
  "oldStatus": "pending",
  "newStatus": "in-progress",
  "title": "Visit Karachi Branch Pharmacy",
  "timestamp": "2025-12-28T15:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:status_updated", (data) => {
  showNotification(
    `${data.salespersonName} updated task status`,
    `${data.oldStatus} → ${data.newStatus}`,
  );

  // Update task in dashboard
  updateTaskInList(data.taskId, { status: data.newStatus });

  // Refresh statistics
  refreshDashboardStats();
});
```

---

#### 9.2 `task:comment_added`

**Triggered:** When a salesperson adds a progress comment/update
**Payload:**

```json
{
  "taskId": "64task123...",
  "salespersonId": "64sales123...",
  "salespersonName": "John Sales",
  "message": "Completed inventory check. Found 5 items low on stock. Report uploaded to system.",
  "title": "Visit Karachi Branch Pharmacy",
  "timestamp": "2025-12-28T16:00:00.000Z"
}
```

**Client Handler:**

```javascript
socket.on("task:comment_added", (data) => {
  showNotification(
    `New comment from ${data.salespersonName}`,
    data.message.substring(0, 50),
  );

  // Add comment to task
  addCommentToTask(data.taskId, {
    updated_by: data.salespersonId,
    role: "salesperson",
    message: data.message,
    updated_at: data.timestamp,
  });
});
```

---

### Branch Room Monitoring

Branch admins can monitor all tasks within their branches by joining branch rooms.

```javascript
// Join branch room for monitoring
socket.emit("join", { room: `branch:${branchId}` });

// Listen for all task events in the branch
socket.on("task:created", (data) => {
  console.log("New task created in branch:", data);
});

socket.on("task:status_updated", (data) => {
  console.log("Task status updated in branch:", data);
});

socket.on("task:deleted", (data) => {
  console.log("Task deleted in branch:", data);
});
```

---

### React Hook for Admin Socket Events

```javascript
import { useEffect } from "react";

export function useAdminTaskSocket(socket, adminId, setTasks) {
  useEffect(() => {
    if (!socket) return;

    // Salesperson updated task status
    socket.on("task:status_updated", (data) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === data.taskId ? { ...task, status: data.newStatus } : task,
        ),
      );
      showNotification(
        `${data.salespersonName} updated task`,
        `${data.oldStatus} → ${data.newStatus}`,
        "info",
      );
    });

    // Salesperson added comment
    socket.on("task:comment_added", (data) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === data.taskId
            ? {
                ...task,
                updates: [
                  ...task.updates,
                  {
                    updated_by: data.salespersonId,
                    role: "salesperson",
                    message: data.message,
                    updated_at: data.timestamp,
                  },
                ],
              }
            : task,
        ),
      );
      showNotification(
        `New comment from ${data.salespersonName}`,
        data.message.substring(0, 50),
        "info",
      );
    });

    // Cleanup
    return () => {
      socket.off("task:status_updated");
      socket.off("task:comment_added");
    };
  }, [socket, adminId, setTasks]);
}
```

---

### Complete React Admin Dashboard Example

```javascript
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAdminTaskSocket } from "./hooks/useAdminTaskSocket";

function AdminDashboard() {
  const { admin } = useAuth(); // Get logged-in admin
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join", { room: `admin:${admin._id}` });

      // Branch admins also join branch rooms
      if (admin.category === "branch-admin" && admin.branches_managed) {
        admin.branches_managed.forEach((branchId) => {
          newSocket.emit("join", { room: `branch:${branchId}` });
        });
      }
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    newSocket.on("joined", (data) => {
      console.log("Joined room:", data.room);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [admin._id]);

  // Setup task event listeners
  useAdminTaskSocket(socket, admin._id, setTasks);

  // Fetch initial tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/admin/salesperson-tasks");
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const createTask = async (taskData) => {
    try {
      await api.post("/admin/salesperson-tasks", taskData);
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      await api.put(`/admin/salesperson-tasks/${taskId}`, updates);
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/admin/salesperson-tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div>
      <div className="connection-status">
        {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>

      <h1>Task Management Dashboard</h1>

      <button onClick={() => setShowCreateModal(true)}>Create New Task</button>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### Socket Event Flow Diagrams

**Task Status Update Flow:**

```
Salesperson → PUT /api/salesperson/tasks/:id/status
  ↓
Server updates status in DB
  ↓
Server emits "task:status_updated" → Admin Room + Branch Room
  ↓
Admin client receives event
  ↓
Dashboard updates task status and shows notification
```

**Task Comment Flow:**

```
Salesperson → POST /api/salesperson/tasks/:id/updates
  ↓
Server adds comment to DB
  ↓
Server emits "task:comment_added" → Admin Room + Branch Room
  ↓
Admin client receives event
  ↓
Dashboard adds comment to task and shows notification
```

---

## Models Reference

### Admin Model

**Fields:** `_id`, `name`, `email`, `password`, `category` ('super-admin'|'branch-admin'), `roleId`, `branches_managed`, `isTwoFactorEnabled`, `status`, `addresses`, `profile_img_url`, `created_at`

### Branch Model

**Fields:** `_id`, `name`, `code`, `phone`, `under_administration_of`, `salespersons_assigned`, `address_id`, `status`, `created_at`

### Salesperson Model

**Fields:** `_id`, `fullName`, `email`, `passwordHash`, `contactNumber`, `branches_to_be_managed`, `status`, `profile_img_url`

### Customer Model

**Fields:** `_id`, `fullName`, `email`, `contactNumber`, `status`, `is_Verified`, `created_at`

### Doctor Model

**Fields:** `_id`, `fullName`, `email`, `gender`, `dateOfBirth`, `contactNumber`, `educational_details[]`, `specialization[]`, `experience_details[]`, `license_number`, `affiliated_hospital`, `consultation_type`, `consultation_fee`, `status`, `averageRating`, `profile_img_url`, `cover_img_url`, `last_login`, `roleId`, `created_at`

### DoctorApplication Model

**Fields:** `_id`, `applications_documents_id`, `doctor_id`, `status` ('pending'|'processing'|'rejected'|'approved'), `reviewed_by_admin_id`, `admin_comment`, `reviewed_at`, `created_at`

### SalespersonTask Model

**Fields:** `_id`, `assigned_by_admin_id`, `salesperson_id`, `branch_id`, `title`, `description`, `priority`, `deadline`, `status`, `updates`

### Role & Permission Models

**Role:** `_id`, `name`, `description`, `permissions[]`
**Permission:** `_id`, `resource`, `action` ('create'|'read'|'update'|'delete'), `description`

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
