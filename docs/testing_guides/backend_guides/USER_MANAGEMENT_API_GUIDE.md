# User Management API Guide

## Base URL

```
http://localhost:5000/api/super-admin
```

## Authentication

All routes require:

- Session-based authentication
- Super Admin role

---

## 1. Admin Management APIs

### 1.1 Create Admin

**Endpoint:** `POST /api/super-admin/admin`
**Authentication:** Required (Super Admin only)

**Request Body (multipart/form-data):**

```
name: "John Doe"
email: "johndoe@philbox.com"
password: "securePassword123"
phone_number: "+92-300-1234567"
category: "branch-admin"
profile_img: [File] (optional)
cover_img: [File] (optional)
```

**Success Response:**

```json
{
  "success": true,
  "message": "Admin created successfully and email sent with credentials",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "johndoe@philbox.com",
    "phone_number": "+92-300-1234567",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://avatar.iran.liara.run/...",
    "roleId": "64role123...",
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 1.2 Get All Admins

**Endpoint:** `GET /api/super-admin/admin`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Example Request:**

```
GET /api/super-admin/admin?page=1&limit=10&search=john
```

**Success Response:**

```json
{
  "success": true,
  "message": "Admins fetched successfully",
  "data": {
    "admins": [
      {
        "_id": "64abc123...",
        "name": "John Doe",
        "email": "johndoe@philbox.com",
        "phone_number": "+92-300-1234567",
        "category": "branch-admin",
        "status": "active",
        "branches_managed": [
          {
            "_id": "64branch1...",
            "name": "Philbox Karachi",
            "code": "PHIL25#001"
          }
        ],
        "role": {
          "_id": "64role123...",
          "name": "Branch Admin"
        },
        "created_at": "2025-12-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### 1.3 Get Admin by ID

**Endpoint:** `GET /api/super-admin/admin/:id`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Admin fetched successfully",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "johndoe@philbox.com",
    "phone_number": "+92-300-1234567",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://avatar.iran.liara.run/...",
    "cover_img_url": "https://placehold.co/...",
    "branches_managed": [
      {
        "_id": "64branch1...",
        "name": "Philbox Karachi",
        "code": "PHIL25#001",
        "status": "Active"
      }
    ],
    "role": {
      "_id": "64role123...",
      "name": "Branch Admin",
      "permissions": ["read_branches", "update_branches"]
    },
    "isTwoFactorEnabled": false,
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 1.4 Update Admin

**Endpoint:** `PUT /api/super-admin/admin/:id`
**Authentication:** Required (Super Admin only)

**Request Body (multipart/form-data):**

```
name: "John Doe Updated" (optional)
phone_number: "+92-300-9999999" (optional)
status: "suspended" (optional)
profile_img: [File] (optional)
cover_img: [File] (optional)
```

**Success Response:**

```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "_id": "64abc123...",
    "name": "John Doe Updated",
    "phone_number": "+92-300-9999999",
    "status": "active",
    "updated_at": "2025-12-18T11:00:00.000Z"
  }
}
```

---

### 1.5 Delete Admin

**Endpoint:** `DELETE /api/super-admin/admin/:id`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Cannot delete Super Admin"
}
```

---

### 1.6 Search Admin

**Endpoint:** `GET /api/super-admin/admin/search`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `q`: Search query

**Example Request:**

```
GET /api/super-admin/admin/search?q=john
```

**Success Response:**

```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "johndoe@philbox.com",
      "category": "branch-admin",
      "status": "active"
    }
  ]
}
```

---

## 2. Salesperson Management APIs

### 2.1 Create Salesperson

**Endpoint:** `POST /api/super-admin/salesperson`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "janesmith@philbox.com",
  "password": "securePassword123",
  "contactNumber": "+92-300-7654321",
  "gender": "Female",
  "dateOfBirth": "1995-05-15",
  "street": "Sample Street",
  "town": "Sample Town",
  "city": "Karachi",
  "province": "Sindh",
  "zip_code": "75300",
  "country": "Pakistan"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson created successfully and email sent with credentials",
  "data": {
    "_id": "64sales123...",
    "fullName": "Jane Smith",
    "email": "janesmith@philbox.com",
    "contactNumber": "+92-300-7654321",
    "gender": "Female",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "status": "active",
    "address_id": "64addr123...",
    "branches_to_be_managed": [],
    "isTwoFactorEnabled": false,
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 2.2 Get All Salespersons

**Endpoint:** `GET /api/super-admin/salesperson`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Example Request:**

```
GET /api/super-admin/salesperson?page=1&limit=10&search=jane
```

**Success Response:**

```json
{
  "success": true,
  "message": "Salespersons fetched successfully",
  "data": {
    "salespersons": [
      {
        "_id": "64sales123...",
        "fullName": "Jane Smith",
        "email": "janesmith@philbox.com",
        "contactNumber": "+92-300-7654321",
        "gender": "Female",
        "status": "active",
        "branches_to_be_managed": [
          {
            "_id": "64branch1...",
            "name": "Philbox Karachi",
            "code": "PHIL25#001"
          }
        ],
        "address": {
          "city": "Karachi",
          "province": "Sindh"
        },
        "created_at": "2025-12-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### 2.3 Get Salesperson by ID

**Endpoint:** `GET /api/super-admin/salesperson/:id`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson fetched successfully",
  "data": {
    "_id": "64sales123...",
    "fullName": "Jane Smith",
    "email": "janesmith@philbox.com",
    "contactNumber": "+92-300-7654321",
    "gender": "Female",
    "dateOfBirth": "1995-05-15T00:00:00.000Z",
    "status": "active",
    "branches_to_be_managed": [
      {
        "_id": "64branch1...",
        "name": "Philbox Karachi",
        "code": "PHIL25#001",
        "status": "Active"
      }
    ],
    "address": {
      "_id": "64addr123...",
      "street": "Sample Street",
      "city": "Karachi",
      "province": "Sindh"
    },
    "isTwoFactorEnabled": false,
    "created_at": "2025-12-18T10:00:00.000Z"
  }
}
```

---

### 2.4 Update Salesperson

**Endpoint:** `PUT /api/super-admin/salesperson/:id`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "fullName": "Jane Smith Updated",
  "contactNumber": "+92-300-1111111",
  "gender": "Female"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson updated successfully",
  "data": {
    "_id": "64sales123...",
    "fullName": "Jane Smith Updated",
    "contactNumber": "+92-300-1111111",
    "updated_at": "2025-12-18T11:00:00.000Z"
  }
}
```

---

### 2.5 Change Salesperson Status

**Endpoint:** `PATCH /api/super-admin/salesperson/:id/status`
**Authentication:** Required (Super Admin only)

**Request Body:**

```json
{
  "status": "suspended"
}
```

**Allowed Status Values:**

- `active`
- `suspended`
- `blocked`

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson status updated successfully",
  "data": {
    "_id": "64sales123...",
    "status": "suspended"
  }
}
```

---

### 2.6 Delete Salesperson

**Endpoint:** `DELETE /api/super-admin/salesperson/:id`
**Authentication:** Required (Super Admin only)

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson deleted successfully"
}
```

---

### 2.7 Search Salesperson

**Endpoint:** `GET /api/super-admin/salesperson/search`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `q`: Search query

**Example Request:**

```
GET /api/super-admin/salesperson/search?q=jane
```

**Success Response:**

```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "_id": "64sales123...",
      "fullName": "Jane Smith",
      "email": "janesmith@philbox.com",
      "status": "active"
    }
  ]
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
- `403` - Forbidden (not super admin)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `500` - Server Error
