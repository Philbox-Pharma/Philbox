# User Management API Testing Guide

## Overview

Complete testing guide for Admin and Salesperson user management endpoints. All endpoints require SESSION-BASED authentication and `super_admin` role authorization.

---

## Base URL

```
http://localhost:5000/api/super-admin/users
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

### ADMIN MANAGEMENT ENDPOINTS

---

### 1. Create Admin

**Endpoint:** `POST /admin`

**Description:** Create new branch admin with optional profile image.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Headers:**

```json
{
  "Content-Type": "multipart/form-data",
  "Cookie": "connect.sid=s%3Axxxxx"
}
```

**Request Body (Form Data):**

```
name: "John Doe"
email: "john.doe@example.com"
password: "SecurePassword123!"
phone_number: "+1234567890"
branches_managed: ["65a1b2c3d4e5f6g7h8i9j0"]
profile_img: <file> (optional)
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Admin created successfully",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://cloudinary.com/admin/profile/john-doe.jpg",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000",
    "branches_managed": ["65a1b2c3d4e5f6g7h8i9j0"],
    "roleId": "65a0b1c2d3e4f5g6h7i8j9",
    "createdAt": "2025-12-12T10:30:00Z"
  }
}
```

**Error Response (400 - Email Exists):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Email already exists"
}
```

**Error Response (401 - No Session):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized - No valid session"
}
```

**Validation Rules (from createBranchAdminSchema DTO):**

- name: required, string
- email: required, valid email format
- password: required, minimum 8 characters
- phone_number: optional, string
- branches_managed: optional, array of valid Branch ObjectIds

---

### 2. Get All Admins (with Pagination)

**Endpoint:** `GET /admin?page=1&limit=10`

**Description:** List all branch admins with pagination.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Query Parameters:**

```
page: 1 (default, minimum 1)
limit: 10 (default, maximum 100)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admins fetched successfully",
  "data": {
    "admins": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0",
        "name": "Admin One",
        "email": "admin1@example.com",
        "phone_number": "+1111111111",
        "category": "branch-admin",
        "status": "active",
        "branches_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
        "profile_img_url": "https://cloudinary.com/admin/profile/admin1.jpg"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 3. Get Single Admin by ID

**Endpoint:** `GET /admin/:id`

**Description:** Retrieve specific admin details by ID.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**URL Parameters:**

```
id: 65a1b2c3d4e5f6g7h8i9j0
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin details fetched successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://cloudinary.com/admin/profile/john-doe.jpg",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000",
    "branches_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
    "addresses": [
      {
        "_id": "65a3b4c5d6e7f8g9h0i1j2",
        "street": "123 Main St",
        "city": "New York",
        "country": "USA",
        "postal_code": "10001"
      }
    ],
    "roleId": "65a0b1c2d3e4f5g6h7i8j9",
    "createdAt": "2025-12-12T10:30:00Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Admin not found"
}
```

---

### 4. Search Admin

**Endpoint:** `GET /admin/search?query=john&field=name`

**Description:** Search admins by name, email, or phone number.

**Query Parameters:**

```
query: "john" (search term, required)
field: "name" (optional: name, email, phone_number)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin found successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "category": "branch-admin",
    "status": "active",
    "profile_img_url": "https://cloudinary.com/admin/profile/john-doe.jpg"
  }
}
```

---

### 5. Update Admin

**Endpoint:** `PUT /admin/:id`

**Description:** Update admin information.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "name": "John Updated",
  "phone_number": "+9876543210",
  "branches_managed": ["65a0b1c2d3e4f5g6h7i8j9"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "name": "John Updated",
    "email": "john.doe@example.com",
    "phone_number": "+9876543210",
    "category": "branch-admin",
    "status": "active",
    "branches_managed": ["65a0b1c2d3e4f5g6h7i8j9"]
  }
}
```

---

### 6. Delete Admin

**Endpoint:** `DELETE /admin/:id`

**Description:** Delete admin account.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admin deleted successfully"
}
```

---

## SALESPERSON MANAGEMENT ENDPOINTS

---

### 7. Create Salesperson

**Endpoint:** `POST /salesperson`

**Description:** Create new salesperson.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane.smith@sales.com",
  "password": "SecurePassword123!",
  "contactNumber": "03001234567",
  "gender": "Male",
  "dateOfBirth": "1990-05-15",
  "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Salesperson created successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Smith",
    "email": "jane.smith@sales.com",
    "contactNumber": "03001234567",
    "gender": "Male",
    "dateOfBirth": "1990-05-15",
    "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
    "status": "active",
    "profile_img_url": "https://placehold.co/400x400/EAEAEA/000000",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000",
    "roleId": "65a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2025-12-12T10:35:00Z"
  }
}
```

**Validation Rules (from createSalespersonDTO):**

- fullName: required, 3-50 characters
- email: required, valid email format, unique
- password: required, minimum 8 characters
- contactNumber: required, 10-15 digits
- gender: required, Male|Female
- dateOfBirth: optional, ISO date format
- branches_to_be_managed: required, array of valid Branch ObjectIds, minimum 1 branch

---

### 8. Get All Salespersons (with Pagination)

**Endpoint:** `GET /salesperson?page=1&limit=10`

**Description:** List all salespersons with pagination.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Query Parameters:**

```
page: 1 (default, minimum 1)
limit: 10 (default, maximum 100)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salespersons fetched successfully",
  "data": {
    "salespersons": [
      {
        "_id": "65a4b5c6d7e8f9g0h1i2j3",
        "fullName": "Jane Smith",
        "email": "jane.smith@sales.com",
        "contactNumber": "03001234567",
        "status": "active",
        "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
        "profile_img_url": "https://placehold.co/400x400/EAEAEA/000000"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

---

### 9. Get Single Salesperson by ID

**Endpoint:** `GET /salesperson/:id`

**Description:** Retrieve specific salesperson details by ID.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salesperson details fetched successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Smith",
    "email": "jane.smith@sales.com",
    "contactNumber": "03001234567",
    "gender": "Male",
    "dateOfBirth": "1990-05-15",
    "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"],
    "status": "active",
    "profile_img_url": "https://placehold.co/400x400/EAEAEA/000000",
    "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000",
    "roleId": "65a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2025-12-12T10:35:00Z"
  }
}
```

---

### 10. Search Salesperson

**Endpoint:** `GET /salesperson/search?query=jane&field=fullName`

**Description:** Search salespersons by full name, email, or contact number.

**Query Parameters:**

```
query: "jane" (search term, required)
field: "fullName" (optional: fullName, email, contactNumber)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salesperson found successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Smith",
    "email": "jane.smith@sales.com",
    "contactNumber": "03001234567",
    "status": "active",
    "profile_img_url": "https://placehold.co/400x400/EAEAEA/000000"
  }
}
```

---

### 11. Update Salesperson

**Endpoint:** `PUT /salesperson/:id`

**Description:** Update salesperson information.

**Request Body:**

```json
{
  "fullName": "Jane Updated",
  "contactNumber": "03009876543",
  "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salesperson updated successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Updated",
    "email": "jane.smith@sales.com",
    "contactNumber": "03009876543",
    "status": "active",
    "branches_to_be_managed": ["65a0b1c2d3e4f5g6h7i8j9"]
  }
}
```

**Validation Rules (from updateSalespersonDTO):**

- fullName: optional, 3-50 characters
- contactNumber: optional, 10-15 digits
- gender: optional, Male|Female
- dateOfBirth: optional, ISO date
- branches_to_be_managed: optional, array of valid Branch ObjectIds

---

### 12. Change Salesperson Status

**Endpoint:** `PATCH /salesperson/:id/status`

**Description:** Activate, suspend, or block salesperson.

**Request Body:**

```json
{
  "status": "suspended"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salesperson status updated successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3",
    "fullName": "Jane Smith",
    "email": "jane.smith@sales.com",
    "status": "suspended"
  }
}
```

**Validation Rules (from changeStatusDTO):**

- status: required, enum: active|suspended|blocked (case-insensitive)

---

### 13. Delete Salesperson

**Endpoint:** `DELETE /salesperson/:id`

**Description:** Delete salesperson account.

**Authentication:** ✅ Required (Session)
**Authorization:** ✅ super_admin only

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Salesperson deleted successfully"
}
```

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Valid super-admin session (created after login)
- [ ] At least one branch exists in database
- [ ] Session cookie (connect.sid) is set

### Admin Management Tests

- [ ] Create admin with valid data succeeds (201)
- [ ] Create admin with duplicate email fails (400)
- [ ] Get all admins with pagination works (200)
- [ ] Pagination limits respected (limit max 100)
- [ ] Get single admin by ID returns correct model fields
- [ ] Get non-existent admin returns 404
- [ ] Search admin by name returns results
- [ ] Update admin details successfully changes data
- [ ] Delete admin removes from database (200)

### Salesperson Management Tests

- [ ] Create salesperson with valid data succeeds (201)
- [ ] Create salesperson with duplicate email fails (400)
- [ ] Create salesperson fails with invalid branch IDs (400)
- [ ] Get all salespersons with pagination works (200)
- [ ] Get single salesperson by ID returns correct model fields
- [ ] Search salesperson by fullName returns results
- [ ] Update salesperson details successfully changes data
- [ ] Change status from active to suspended works (200)
- [ ] Invalid status value fails validation (400)
- [ ] Delete salesperson removes from database (200)

### Session-Based Authorization Tests

- [ ] Requests without session cookie return 401
- [ ] Requests with invalid session return 401
- [ ] Requests with non-super_admin role return 403
- [ ] Session cookie persists across requests

### Validation Tests

- [ ] Empty email fails validation (400)
- [ ] Invalid email format fails validation (400)
- [ ] Short password (< 8 chars) fails validation (400)
- [ ] Missing required fields fail validation (400)
- [ ] Invalid ObjectId format fails validation (400)

---

## Session Management

All requests require active session:

```bash
# Login (creates session)
curl -c cookies.txt -X POST http://localhost:5000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Use session in subsequent requests
curl -b cookies.txt -X GET http://localhost:5000/api/super-admin/users/admin
```

---

## Environment Variables

```env
# Session Configuration
SESSION_SECRET=your_session_secret_key_min_32_chars
SESSION_TIMEOUT=604800000  # 7 days in milliseconds

# MongoDB
MONGODB_URI=mongodb://localhost:27017/philbox
```

---

## Common Issues & Solutions

### "Unauthorized - No valid session"

**Cause:** Session not created or expired
**Solution:**

- Ensure super-admin login was successful (status 200)
- Verify connect.sid cookie is present in response
- Check MongoDB session store is running
- Re-login to create new session

### "Email already exists"

**Cause:** Attempting to create user with duplicate email
**Solution:**

- Use unique email for each user
- Check database for existing user

### "Invalid branch IDs provided"

**Cause:** Branch ObjectIds are invalid or don't exist
**Solution:**

- Verify branch IDs are valid 24-character ObjectIds
- Ensure branches exist in database

---

## Performance Benchmarks

| Endpoint             | Method | Expected Response Time |
| -------------------- | ------ | ---------------------- |
| Create Admin         | POST   | < 500ms                |
| Get All Admins       | GET    | < 200ms                |
| Create Salesperson   | POST   | < 400ms                |
| Get All Salespersons | GET    | < 200ms                |
| Update Salesperson   | PUT    | < 300ms                |
| Change Status        | PATCH  | < 200ms                |
