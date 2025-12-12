# Permissions Management API Testing Guide

## Overview

Complete testing guide for Role-Based Access Control (RBAC) and Permissions Management endpoints. All endpoints require SESSION-BASED authentication and `super_admin` role authorization.

---

## Base URL

```
http://localhost:5000/api/super-admin/permissions
```

---

## Authentication & Authorization

**Session-Based Authentication:**

- All endpoints require valid session cookie (`connect.sid`)
- Session created after successful super-admin login
- Cookie must be sent automatically with each request
- Session expires after 7 days of inactivity

**Required Role:** `super_admin`

**Available Roles:**

- super_admin (all permissions)
- branch_admin (branch management)
- doctor (own profile)
- salesperson (sales operations)
- customer (own profile)

**Permission Format:**

- Resource: users, branches, doctors, customers, salespersons, permissions
- Actions: create, read, update, delete

---

## Endpoints

### ROLE MANAGEMENT ENDPOINTS

---

### 1. Get All Roles

**Endpoint:** `GET /roles`

**Description:** Retrieve all available roles with their permissions.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Headers:**

```json
{
  "Cookie": "connect.sid=s%3Axxxxx"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Roles fetched successfully",
  "data": [
    {
      "_id": "65a0b1c2d3e4f5g6h7i8j9",
      "name": "super_admin",
      "description": "Super administrator with all permissions",
      "permissions": [
        {
          "_id": "65a1b2c3d4e5f6g7h8i9j0",
          "name": "users.create",
          "resource": "users",
          "action": "create",
          "description": "Create new user accounts"
        },
        {
          "_id": "65a2b3c4d5e6f7g8h9i0j1",
          "name": "users.read",
          "resource": "users",
          "action": "read",
          "description": "View user information"
        }
      ]
    },
    {
      "_id": "65a3b4c5d6e7f8g9h0i1j2",
      "name": "branch_admin",
      "description": "Branch administrator",
      "permissions": [
        {
          "_id": "65a4b5c6d7e8f9g0h1i2j3",
          "name": "branches.read",
          "resource": "branches",
          "action": "read"
        }
      ]
    }
  ]
}
```

---

### 2. Get Single Role with Permissions

**Endpoint:** `GET /roles/:roleId`

**Description:** Retrieve specific role with all assigned permissions.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**URL Parameters:**

```
roleId: 65a0b1c2d3e4f5g6h7i8j9
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role fetched successfully",
  "data": {
    "_id": "65a0b1c2d3e4f5g6h7i8j9",
    "name": "super_admin",
    "description": "Super administrator with all permissions",
    "permissions": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0",
        "name": "users.create",
        "resource": "users",
        "action": "create"
      },
      {
        "_id": "65a2b3c4d5e6f7g8h9i0j1",
        "name": "users.read",
        "resource": "users",
        "action": "read"
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Role not found"
}
```

---

### 3. Update Role Permissions

**Endpoint:** `PUT /roles/:roleId/permissions`

**Description:** Update permissions assigned to a role (replace all permissions).

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "permissionIds": [
    "65a1b2c3d4e5f6g7h8i9j0",
    "65a2b3c4d5e6f7g8h9i0j1",
    "65a3b4c5d6e7f8g9h0i1j2"
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role permissions updated successfully",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2",
    "name": "branch_admin",
    "description": "Branch administrator",
    "permissions": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0",
        "name": "users.create",
        "resource": "users",
        "action": "create"
      },
      {
        "_id": "65a2b3c4d5e6f7g8h9i0j1",
        "name": "users.read",
        "resource": "users",
        "action": "read"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "permissionIds must be an array"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Role not found"
}
```

**Validation Rules:**

- permissionIds: required, array of valid Permission ObjectIds

---

### PERMISSION MANAGEMENT ENDPOINTS

---

### 4. Get All Permissions

**Endpoint:** `GET /permissions`

**Description:** Retrieve all available permissions.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Permissions fetched successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "name": "users.create",
      "resource": "users",
      "action": "create",
      "description": "Create new user accounts",
      "createdAt": "2025-12-12T10:00:00Z"
    },
    {
      "_id": "65a2b3c4d5e6f7g8h9i0j1",
      "name": "users.read",
      "resource": "users",
      "action": "read",
      "description": "View user information",
      "createdAt": "2025-12-12T10:00:00Z"
    }
  ]
}
```

---

### 5. Create New Permission

**Endpoint:** `POST /permissions`

**Description:** Create new permission (super_admin only).

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "resource": "appointments",
  "action": "delete",
  "description": "Cancel/delete appointments"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Permission created successfully",
  "data": {
    "_id": "65a5b6c7d8e9f0g1h2i3j4",
    "name": "appointments.delete",
    "resource": "appointments",
    "action": "delete",
    "description": "Cancel/delete appointments",
    "createdAt": "2025-12-12T10:50:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "resource and action are required"
}
```

**Validation Rules:**

- resource: required, string
- action: required, enum: create|read|update|delete
- description: optional, string

---

### 6. Add Permission to Role

**Endpoint:** `POST /roles/:roleId/permissions`

**Description:** Add a single permission to a role.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "permissionId": "65a1b2c3d4e5f6g7h8i9j0"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Permission added to role successfully",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2",
    "name": "branch_admin",
    "permissions": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0",
        "name": "users.create",
        "resource": "users",
        "action": "create"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "This permission is already assigned to the role"
}
```

---

### 7. Remove Permission from Role

**Endpoint:** `DELETE /roles/:roleId/permissions`

**Description:** Remove a single permission from a role.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "permissionId": "65a1b2c3d4e5f6g7h8i9j0"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Permission removed from role successfully",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2",
    "name": "branch_admin",
    "permissions": []
  }
}
```

---

### USER ROLE ASSIGNMENT ENDPOINTS

---

### 8. Assign Role to User

**Endpoint:** `POST /assign-role`

**Description:** Assign a role to a user (admin, doctor, customer, or salesperson).

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "userId": "65a4b5c6d7e8f9g0h1i2j3",
  "userType": "salesperson",
  "roleId": "65a3b4c5d6e7f8g9h0i1j2"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Role assigned to salesperson successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Smith",
    "email": "jane.smith@sales.com",
    "roleId": "65a3b4c5d6e7f8g9h0i1j2",
    "status": "active"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "userId, userType, and roleId are required"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Salesperson not found"
}
```

**Validation Rules:**

- userId: required, valid ObjectId
- userType: required, enum: admin|customer|doctor|salesperson
- roleId: required, valid ObjectId

---

### 9. Get User Role and Permissions

**Endpoint:** `GET /user-role?userId=65a4b5c6d7e8f9g0h1i2j3&userType=salesperson`

**Description:** Get current role and permissions for a specific user, or for logged-in user if no params provided.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only (or user's own info)

**Query Parameters:**

```
userId: "65a4b5c6d7e8f9g0h1i2j3" (optional - if not provided, returns logged-in user's role)
userType: "salesperson" (optional - required if userId provided)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User role and permissions fetched successfully",
  "data": {
    "user": {
      "_id": "65a4b5c6d7e8f9g0h1i2j3",
      "fullName": "Jane Smith",
      "email": "jane.smith@sales.com",
      "userType": "salesperson"
    },
    "role": {
      "_id": "65a3b4c5d6e7f8g9h0i1j2",
      "name": "salesperson",
      "description": "Sales staff with sales operations permissions"
    },
    "permissions": [
      {
        "_id": "65a6b7c8d9e0f1g2h3i4j5",
        "name": "sales.create",
        "resource": "sales",
        "action": "create"
      },
      {
        "_id": "65a7b8c9d0e1f2g3h4i5j6",
        "name": "sales.read",
        "resource": "sales",
        "action": "read"
      }
    ]
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Either provide both userId and userType, or provide neither to get your own role"
}
```

**Validation Rules:**

- If userId is provided, userType is required
- userType: optional when getting own role, enum: admin|customer|doctor|salesperson

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Valid super-admin session
- [ ] Session cookie (connect.sid) is set
- [ ] Permissions exist in database (seeded)

### Role Management Tests

- [ ] Get all roles with permissions succeeds (200)
- [ ] Get single role by ID returns permissions (200)
- [ ] Get non-existent role returns 404
- [ ] Update role permissions with valid IDs succeeds (200)
- [ ] Update role with invalid permission IDs fails (400)
- [ ] Update role with non-array fails (400)

### Permission Management Tests

- [ ] Get all permissions succeeds (200)
- [ ] Create new permission with valid data succeeds (201)
- [ ] Create permission with missing action fails (400)
- [ ] Create permission with invalid action fails (400)
- [ ] Add valid permission to role succeeds (200)
- [ ] Add duplicate permission to role fails (400)
- [ ] Remove permission from role succeeds (200)
- [ ] Remove non-existent permission fails (404)

### Role Assignment Tests

- [ ] Assign role to salesperson succeeds (200)
- [ ] Assign role to admin succeeds (200)
- [ ] Assign role to doctor succeeds (200)
- [ ] Assign role to customer succeeds (200)
- [ ] Assign non-existent role fails (404)
- [ ] Assign with invalid userType fails (400)
- [ ] User role changes take effect immediately

### User Role Query Tests

- [ ] Get own role (no params) returns logged-in user's role (200)
- [ ] Get specific user role with userId and userType succeeds (200)
- [ ] Get with only userId (missing userType) fails (400)
- [ ] Get non-existent user fails (404)
- [ ] Permissions array returned with correct structure

### Session-Based Authorization Tests

- [ ] Requests without session cookie return 401
- [ ] Requests with invalid session return 401
- [ ] Requests with non-super_admin role return 403
- [ ] Session cookie persists across requests

### Validation Tests

- [ ] Missing required fields fail validation (400)
- [ ] Invalid ObjectId format fails (400)
- [ ] Invalid userType enum fails (400)
- [ ] Invalid action enum fails (400)

---

## Session Management

```bash
# Login (creates session)
curl -c cookies.txt -X POST http://localhost:5000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Use session in subsequent requests
curl -b cookies.txt -X GET http://localhost:5000/api/super-admin/permissions/roles
```

---

## Common Issues & Solutions

### "Unauthorized - No valid session"

**Cause:** Session not created or expired
**Solution:**

- Ensure super-admin login was successful
- Verify connect.sid cookie is present
- Check MongoDB session store is running

### "Role not found"

**Cause:** Invalid or non-existent role ID
**Solution:**

- Use GET /roles endpoint to list existing roles
- Verify role ID is valid 24-character ObjectId

### "This permission is already assigned to the role"

**Cause:** Attempting to add duplicate permission
**Solution:**

- Check role's current permissions with GET /roles/:roleId
- Only add permissions not already assigned

### "Invalid userType"

**Cause:** userType parameter not from enum
**Solution:**

- Use one of: admin, customer, doctor, salesperson
- Ensure correct spelling and case

---

## Role & Permission Structure

```
Roles (5 predefined):
├── super_admin (all permissions)
├── branch_admin (branch management)
├── doctor (own profile)
├── salesperson (sales operations)
└── customer (own profile)

Permissions (resource + action):
├── users (create, read, update, delete)
├── branches (create, read, update, delete)
├── doctors (create, read, update, delete)
├── customers (create, read, update, delete)
├── salespersons (create, read, update, delete)
└── permissions (create, read, update, delete)
```

---

## Performance Benchmarks

| Endpoint                | Method | Expected Response Time |
| ----------------------- | ------ | ---------------------- |
| Get All Roles           | GET    | < 200ms                |
| Get Single Role         | GET    | < 100ms                |
| Update Role Permissions | PUT    | < 300ms                |
| Get All Permissions     | GET    | < 200ms                |
| Create Permission       | POST   | < 300ms                |
| Assign Role to User     | POST   | < 300ms                |
| Get User Role           | GET    | < 150ms                |
