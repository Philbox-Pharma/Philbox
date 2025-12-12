# Branch Management API Testing Guide

## Overview

Complete testing guide for Branch Management endpoints. All endpoints require SESSION-BASED authentication and `super_admin` role authorization.

---

## Base URL

```
http://localhost:5000/api/super-admin/branches
```

---

## Authentication & Authorization

**Session-Based Authentication:**

- All endpoints require valid session cookie (`connect.sid`)
- Session created after successful super-admin login
- Cookie must be sent automatically with each request
- Session expires after 7 days of inactivity

**Required Role:** `super_admin`

---

## Endpoints

---

### 1. Create Branch

**Endpoint:** `POST /branches`

**Description:** Create new branch with address details.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Headers:**

```json
{
  "Content-Type": "application/json",
  "Cookie": "connect.sid=s%3Axxxxx"
}
```

**Request Body:**

```json
{
  "name": "Main Branch",
  "city": "Karachi",
  "province": "Sindh",
  "country": "Pakistan",
  "street": "123 Main Street",
  "town": "Gulshan",
  "zip_code": "75290",
  "google_map_link": "https://maps.google.com/?q=Main+Branch",
  "under_administration_of": ["65a1b2c3d4e5f6g7h8i9j0"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Branch created successfully",
  "data": {
    "_id": "65a5b6c7d8e9f0g1h2i3j4",
    "name": "Main Branch",
    "code": "MB001",
    "city": "Karachi",
    "province": "Sindh",
    "country": "Pakistan",
    "street": "123 Main Street",
    "town": "Gulshan",
    "zip_code": "75290",
    "google_map_link": "https://maps.google.com/?q=Main+Branch",
    "status": "Active",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Main Branch",
    "under_administration_of": ["65a1b2c3d4e5f6g7h8i9j0"],
    "address_id": "65a0b1c2d3e4f5g6h7i8j9",
    "created_at": "2025-12-12T10:40:00Z"
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Branch name is required"
}
```

**Validation Rules (from createBranchDTO):**

- name: required, string (trimmed)
- city: optional, string
- province: optional, string
- country: optional, string
- street: optional, string
- town: optional, string
- zip_code: optional, string
- google_map_link: optional, valid URI format
- under_administration_of: optional, array of valid Admin ObjectIds

---

### 2. Get All Branches (with Pagination & Search)

**Endpoint:** `GET /branches?page=1&limit=10&search=main&status=Active`

**Description:** List all branches with pagination and optional filtering.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Query Parameters:**

```
page: 1 (default, minimum 1)
limit: 10 (default, maximum 100)
search: "main" (optional, searches name)
status: "Active" (optional, Active|Inactive)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Branches fetched successfully",
  "data": {
    "branches": [
      {
        "_id": "65a5b6c7d8e9f0g1h2i3j4",
        "name": "Main Branch",
        "code": "MB001",
        "city": "Karachi",
        "country": "Pakistan",
        "status": "Active",
        "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Main Branch"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 3. Get Single Branch by ID

**Endpoint:** `GET /branches/:id`

**Description:** Retrieve specific branch details by ID.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**URL Parameters:**

```
id: 65a5b6c7d8e9f0g1h2i3j4
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Branch fetched successfully",
  "data": {
    "_id": "65a5b6c7d8e9f0g1h2i3j4",
    "name": "Main Branch",
    "code": "MB001",
    "city": "Karachi",
    "province": "Sindh",
    "country": "Pakistan",
    "street": "123 Main Street",
    "town": "Gulshan",
    "zip_code": "75290",
    "google_map_link": "https://maps.google.com/?q=Main+Branch",
    "status": "Active",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Main Branch",
    "under_administration_of": ["65a1b2c3d4e5f6g7h8i9j0"],
    "address_id": "65a0b1c2d3e4f5g6h7i8j9",
    "created_at": "2025-12-12T10:40:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Branch not found"
}
```

---

### 4. Update Branch

**Endpoint:** `PUT /branches/:id`

**Description:** Update branch information.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "name": "Main Branch Updated",
  "city": "Lahore",
  "province": "Punjab",
  "status": "Inactive",
  "under_administration_of": [
    "65a1b2c3d4e5f6g7h8i9j0",
    "65a2b3c4d5e6f7g8h9i0j1"
  ]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Branch updated successfully",
  "data": {
    "_id": "65a5b6c7d8e9f0g1h2i3j4",
    "name": "Main Branch Updated",
    "code": "MB001",
    "city": "Lahore",
    "province": "Punjab",
    "country": "Pakistan",
    "status": "Inactive",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Main Branch Updated",
    "under_administration_of": [
      "65a1b2c3d4e5f6g7h8i9j0",
      "65a2b3c4d5e6f7g8h9i0j1"
    ]
  }
}
```

**Validation Rules (from updateBranchDTO):**

- name: optional, string
- city: optional, string
- province: optional, string
- country: optional, string
- street: optional, string
- town: optional, string
- zip_code: optional, string
- google_map_link: optional, valid URI
- status: optional, Active|Inactive
- under_administration_of: optional, array of Admin ObjectIds

---

### 5. Delete Branch

**Endpoint:** `DELETE /branches/:id`

**Description:** Delete branch.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Branch deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Branch not found"
}
```

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Valid super-admin session
- [ ] Session cookie (connect.sid) is set

### Branch Creation Tests

- [ ] Create branch with valid data succeeds (201)
- [ ] Create branch with only name succeeds (minimal)
- [ ] Get all branches with pagination works (200)
- [ ] Get single branch by ID returns correct fields
- [ ] Get non-existent branch returns 404
- [ ] Search branch by name returns results
- [ ] Filter branches by status works
- [ ] Pagination limits respected (limit max 100)

### Branch Update Tests

- [ ] Update branch name successfully (200)
- [ ] Update branch status from Active to Inactive (200)
- [ ] Update branch city/province successfully (200)
- [ ] Update branch administrators successfully (200)
- [ ] Partial update (only some fields) works correctly
- [ ] Invalid status value fails (400)

### Branch Delete Tests

- [ ] Delete existing branch succeeds (200)
- [ ] Delete non-existent branch returns 404
- [ ] Deleted branch no longer appears in list

### Session-Based Authorization Tests

- [ ] Requests without session cookie return 401
- [ ] Requests with invalid session return 401
- [ ] Requests with non-super_admin role return 403
- [ ] Session cookie persists across requests

### Validation Tests

- [ ] Missing required fields fail validation (400)
- [ ] Invalid ObjectId format fails (400)
- [ ] Invalid URI format for google_map_link fails (400)
- [ ] Invalid status enum value fails (400)

---

## Session Management

```bash
# Login (creates session)
curl -c cookies.txt -X POST http://localhost:5000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Use session in subsequent requests
curl -b cookies.txt -X GET http://localhost:5000/api/super-admin/branches
```

---

## Common Issues & Solutions

### "Unauthorized - No valid session"

**Cause:** Session not created or expired
**Solution:**

- Ensure super-admin login was successful
- Verify connect.sid cookie is present
- Check MongoDB session store is running
- Re-login to create new session

### "Branch not found"

**Cause:** Invalid or non-existent branch ID
**Solution:**

- Verify branch ID is valid 24-character ObjectId
- Use GET /branches endpoint to list existing branches
- Check if branch was deleted

### "Invalid URI for google_map_link"

**Cause:** Malformed URL provided
**Solution:**

- Ensure URL starts with http:// or https://
- Use proper URL encoding for spaces (+ or %20)

---

## Performance Benchmarks

| Endpoint         | Method | Expected Response Time |
| ---------------- | ------ | ---------------------- |
| Create Branch    | POST   | < 400ms                |
| Get All Branches | GET    | < 200ms                |
| Get Branch by ID | GET    | < 100ms                |
| Update Branch    | PUT    | < 300ms                |
| Delete Branch    | DELETE | < 200ms                |
