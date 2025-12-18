# Permissions & RBAC API Guide

## Base URL

```
http://localhost:5000/api/super-admin
```

## Authentication

All routes require:

- Session-based authentication
- Super Admin role

---

## 1. Roles Management

### 1.1 Get All Roles

**Endpoint:** `GET /api/super-admin/roles`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Roles fetched successfully",
  "data": [
    {
      "_id": "64role1...",
      "name": "Super Admin",
      "description": "Full system access",
      "permissions": [
        {
          "_id": "64perm1...",
          "name": "create_branches",
          "resource": "branches",
          "action": "create",
          "description": "Can create new branches"
        },
        {
          "_id": "64perm2...",
          "name": "read_branches",
          "resource": "branches",
          "action": "read",
          "description": "Can view branches"
        }
      ],
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "64role2...",
      "name": "Branch Admin",
      "description": "Branch-level management",
      "permissions": [
        {
          "_id": "64perm2...",
          "name": "read_branches",
          "resource": "branches",
          "action": "read"
        }
      ],
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 1.2 Get Role by ID

**Endpoint:** `GET /api/super-admin/roles/:roleId`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Role fetched successfully",
  "data": {
    "_id": "64role1...",
    "name": "Branch Admin",
    "description": "Manages branch operations",
    "permissions": [
      {
        "_id": "64perm1...",
        "name": "read_branches",
        "resource": "branches",
        "action": "read",
        "description": "Can view branches"
      },
      {
        "_id": "64perm2...",
        "name": "update_branches",
        "resource": "branches",
        "action": "update",
        "description": "Can update branches"
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 1.3 Update Role Permissions

**Endpoint:** `PUT /api/super-admin/roles/:roleId`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "permissionIds": ["64perm1...", "64perm2...", "64perm3..."]
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Role permissions updated successfully",
  "data": {
    "_id": "64role1...",
    "name": "Branch Admin",
    "permissions": [
      {
        "_id": "64perm1...",
        "name": "read_branches"
      },
      {
        "_id": "64perm2...",
        "name": "update_branches"
      },
      {
        "_id": "64perm3...",
        "name": "create_orders"
      }
    ],
    "updated_at": "2025-12-18T11:00:00.000Z"
  }
}
```

---

### 1.4 Add Permission to Role

**Endpoint:** `POST /api/super-admin/roles/:roleId/permissions`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "permissionId": "64perm5..."
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Permission added to role successfully",
  "data": {
    "_id": "64role1...",
    "name": "Branch Admin",
    "permissions": [
      {
        "_id": "64perm5...",
        "name": "delete_orders"
      }
    ]
  }
}
```

---

### 1.5 Remove Permission from Role

**Endpoint:** `DELETE /api/super-admin/roles/:roleId/permissions`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "permissionId": "64perm5..."
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Permission removed from role successfully",
  "data": {
    "_id": "64role1...",
    "name": "Branch Admin",
    "permissions": []
  }
}
```

---

## 2. Permissions Management

### 2.1 Get All Permissions

**Endpoint:** `GET /api/super-admin/permissions`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Permissions fetched successfully",
  "data": [
    {
      "_id": "64perm1...",
      "name": "create_branches",
      "resource": "branches",
      "action": "create",
      "description": "Can create new branches",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "64perm2...",
      "name": "read_branches",
      "resource": "branches",
      "action": "read",
      "description": "Can view branches",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "64perm3...",
      "name": "update_branches",
      "resource": "branches",
      "action": "update",
      "description": "Can update branch information",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "64perm4...",
      "name": "delete_branches",
      "resource": "branches",
      "action": "delete",
      "description": "Can delete branches",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2.2 Create Permission

**Endpoint:** `POST /api/super-admin/permissions`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "name": "export_reports",
  "resource": "reports",
  "action": "export",
  "description": "Can export system reports"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "_id": "64perm10...",
    "name": "export_reports",
    "resource": "reports",
    "action": "export",
    "description": "Can export system reports",
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

## 3. User Role Assignment

### 3.1 Assign Role to User

**Endpoint:** `POST /api/super-admin/users/assign-role`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "userId": "64user123...",
  "userType": "admin",
  "roleId": "64role1..."
}
```

**Allowed `userType` Values:**

- `admin`
- `customer`
- `doctor`
- `salesperson`

**Success Response:**

```json
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": {
    "_id": "64user123...",
    "name": "John Doe",
    "email": "johndoe@philbox.com",
    "role": {
      "_id": "64role1...",
      "name": "Branch Admin"
    }
  }
}
```

---

### 3.2 Get User Role and Permissions

**Endpoint:** `GET /api/super-admin/user-role`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `userId`: User ID
- `userType`: User type (admin, customer, doctor, salesperson)

**Example Request:**

```
GET /api/super-admin/user-role?userId=64user123...&userType=admin
```

**Success Response:**

```json
{
  "success": true,
  "message": "User role and permissions fetched successfully",
  "data": {
    "user": {
      "_id": "64user123...",
      "name": "John Doe",
      "email": "johndoe@philbox.com",
      "userType": "admin"
    },
    "role": {
      "_id": "64role1...",
      "name": "Branch Admin",
      "description": "Manages branch operations"
    },
    "permissions": [
      {
        "_id": "64perm1...",
        "name": "read_branches",
        "resource": "branches",
        "action": "read",
        "description": "Can view branches"
      },
      {
        "_id": "64perm2...",
        "name": "update_branches",
        "resource": "branches",
        "action": "update",
        "description": "Can update branches"
      },
      {
        "_id": "64perm3...",
        "name": "read_orders",
        "resource": "orders",
        "action": "read",
        "description": "Can view orders"
      }
    ]
  }
}
```

---

## Available Permissions

### Branch Permissions

- `create_branches` - Create new branches
- `read_branches` - View branches
- `update_branches` - Update branch information
- `delete_branches` - Delete branches

### User Permissions

- `create_users` - Create new users
- `read_users` - View users
- `update_users` - Update user information
- `delete_users` - Delete users

### Order Permissions

- `create_orders` - Create new orders
- `read_orders` - View orders
- `update_orders` - Update order status
- `delete_orders` - Delete orders
- `refund_orders` - Process refunds

### Complaint Permissions

- `read_complaints` - View complaints
- `update_complaints` - Handle complaints
- `resolve_complaints` - Resolve complaints

### Report Permissions

- `read_reports` - View reports
- `export_reports` - Export reports

---

## RBAC Middleware Usage

When making API calls to protected endpoints, ensure the user has the required permission.

**Example Protected Endpoint:**

```javascript
// This endpoint requires 'read_branches' permission
GET /api/super-admin/branches
```

**If user lacks permission, response will be:**

```json
{
  "success": false,
  "message": "Access denied: Insufficient permissions",
  "requiredPermission": "read_branches"
}
```

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
- `403` - Forbidden (insufficient permissions or not super admin)
- `404` - Not Found
- `500` - Server Error
