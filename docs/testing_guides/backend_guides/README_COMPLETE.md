# Backend API Complete Reference

## Overview

This guide provides a complete reference for all backend APIs available in the Philbox application. Each API module has its own dedicated guide with detailed endpoint documentation.

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.philbox.com/api
```

---

## API Modules

### 1. Admin APIs

**Base Path:** `/api/super-admin`

Complete documentation for admin-related operations including authentication, branch management, and user management.

**Documentation:** [Admin API Complete Guide](./ADMIN_API_COMPLETE_GUIDE.md)

**Key Features:**

- Admin authentication with conditional 2FA
- Branch CRUD operations
- Branch assignment management
- Branch performance metrics
- Password reset functionality

---

### 2. User Management APIs

**Base Path:** `/api/super-admin`

Complete documentation for managing admins and salespersons (creation, updates, deletion, activation).

**Documentation:** [User Management API Guide](./USER_MANAGEMENT_API_GUIDE.md)

**Key Features:**

- Admin CRUD operations
- Salesperson CRUD operations
- User activation/deactivation
- User role assignment
- User statistics

---

### 3. Permissions & RBAC APIs

**Base Path:** `/api/super-admin`

Complete documentation for role-based access control, permissions, and role management.

**Documentation:** [Permissions & RBAC API Guide](./PERMISSIONS_RBAC_API_GUIDE.md)

**Key Features:**

- Role management
- Permission management
- User role assignment
- Permission assignment to roles
- Permission checking

---

### 4. Customer APIs

**Base Path:** `/api/customer/auth`

Complete documentation for customer authentication and profile management.

**Documentation:** [Customer Authentication API Guide](./CUSTOMER_AUTH_API_GUIDE.md)

**Key Features:**

- Customer registration & email verification
- Login (email/password & Google OAuth)
- Profile management with image uploads
- Password reset functionality
- Session management

---

### 5. Doctor APIs

**Base Path:** `/api/doctor/auth`

Complete documentation for doctor onboarding, authentication, and verification process.

**Documentation:** [Doctor Authentication & Onboarding API Guide](./DOCTOR_AUTH_API_GUIDE.md)

**Key Features:**

- Doctor registration & email verification
- Multi-step onboarding process
- Document submission for admin verification
- Profile completion (education, experience, specialization)
- Google OAuth authentication
- Password reset functionality

---

### 6. Salesperson APIs

**Base Path:** `/api/salesperson/auth`

Complete documentation for salesperson authentication with conditional 2FA.

**Documentation:** [Salesperson Authentication API Guide](./SALESPERSON_AUTH_API_GUIDE.md)

**Key Features:**

- Login with conditional 2FA
- OTP verification
- 2FA settings management
- Password reset functionality
- Session management

---

## Authentication

### Session-Based Authentication

All APIs use session-based authentication with cookies.

**Session Cookie Name:** `connect.sid`

**Frontend Configuration (Axios):**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // CRITICAL: Enables session cookies
});

export default api;
```

**Frontend Configuration (Fetch):**

```javascript
fetch("http://localhost:5000/api/super-admin/auth/login", {
  method: "POST",
  credentials: "include", // CRITICAL: Enables session cookies
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});
```

---

## User Roles

| Role             | Description             | Access Level                            |
| ---------------- | ----------------------- | --------------------------------------- |
| **Super Admin**  | Full system access      | All endpoints                           |
| **Branch Admin** | Branch-level management | Branch-specific operations              |
| **Salesperson**  | Sales operations        | Order management, customer interactions |
| **Doctor**       | Medical professional    | Patient consultations, prescriptions    |
| **Customer**     | End user                | Order placement, profile management     |

---

## RBAC (Role-Based Access Control)

### Permission Structure

Permissions follow a resource-action pattern:

- **Resource:** `branches`, `users`, `orders`, `complaints`, `reports`
- **Action:** `create`, `read`, `update`, `delete`, `export`

**Example Permissions:**

- `create_branches` - Create new branches
- `read_orders` - View orders
- `update_users` - Update user information
- `delete_complaints` - Delete complaints
- `export_reports` - Export system reports

**See:** [Permissions & RBAC API Guide](./PERMISSIONS_RBAC_API_GUIDE.md#available-permissions)

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message for end user",
  "error": "Detailed error for developers (dev environment only)"
}
```

### Pagination Response

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "docs": [
      // Array of documents
    ],
    "totalDocs": 100,
    "limit": 10,
    "page": 1,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

---

## Common Status Codes

| Code | Meaning               | Description                             |
| ---- | --------------------- | --------------------------------------- |
| 200  | OK                    | Request successful                      |
| 201  | Created               | Resource created successfully           |
| 400  | Bad Request           | Validation error or malformed request   |
| 401  | Unauthorized          | Not logged in or invalid credentials    |
| 403  | Forbidden             | Insufficient permissions                |
| 404  | Not Found             | Resource not found                      |
| 409  | Conflict              | Duplicate resource (e.g., email exists) |
| 500  | Internal Server Error | Server-side error                       |

---

## Common Query Parameters

### Pagination

Most list endpoints support pagination:

```
GET /api/super-admin/branches?page=1&limit=10
```

**Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Search & Filtering

```
GET /api/super-admin/admins?search=john&status=active&branch_id=64branch123
```

**Common Filters:**

- `search`: Text search across multiple fields
- `status`: `active`, `inactive`, `pending`, `approved`, `rejected`
- `branch_id`: Filter by branch
- `city`: Filter by city

### Sorting

```
GET /api/super-admin/branches?sort=-created_at
```

**Parameters:**

- `sort`: Field to sort by (prefix with `-` for descending)
- Examples: `sort=name` (ascending), `sort=-created_at` (newest first)

---

## File Upload Endpoints

### Content-Type

File uploads use `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append("name", "John Doe");
formData.append("profile_img", fileInput.files[0]);

await api.post("/customer/auth/profile", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### Image Storage

All images are stored on **Cloudinary** and returned as URLs:

```json
{
  "profile_img": "https://res.cloudinary.com/philbox/image/upload/v1234567890/profile.jpg"
}
```

---

## Rate Limiting

### Authentication Routes

Authentication routes are rate-limited to prevent brute-force attacks:

- **Limit:** 5 requests per 15 minutes per IP
- **Applies to:** `/login`, `/register`, `/verify-otp`, `/forget-password`, `/reset-password`

**Rate Limit Response:**

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## CORS Configuration

**Allowed Origins:**

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (React dev server)
- Production frontend URL

**Allowed Methods:**

- GET, POST, PUT, PATCH, DELETE

**Allowed Headers:**

- Content-Type, Authorization

**Credentials:** Enabled (for session cookies)

---

## Environment Variables

### Required Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/philbox

# Session
SESSION_SECRET=your-secret-key-here
SESSION_NAME=connect.sid

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/customer/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Testing APIs

### Using Postman

1. **Import Collection:**
   - Create a new collection
   - Add base URL: `http://localhost:5000/api`

2. **Enable Cookies:**
   - Settings → General → Enable "Automatically follow redirects"
   - Settings → Cookies → Enable cookie management

3. **Login First:**

   ```
   POST /api/super-admin/auth/login
   Body: { "email": "admin@philbox.com", "password": "password" }
   ```

4. **Session Cookie:**
   - Postman automatically stores the session cookie
   - All subsequent requests include the session cookie

### Using cURL

```bash
# Login and save cookies
curl -X POST http://localhost:5000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@philbox.com","password":"password"}' \
  -c cookies.txt

# Use session cookie for authenticated request
curl -X GET http://localhost:5000/api/super-admin/branches \
  -b cookies.txt
```

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create a new request
3. Set Environment variable for base URL
4. Login first to get session cookie
5. Thunder Client automatically manages cookies

---

## API Testing Guides

For detailed testing instructions including sample requests, responses, and test scenarios:

- [Admin Auth API Testing](./ADMIN_AUTH_API_TESTING.md)
- [Branch Management API Testing](./BRANCH_MANAGEMENT_API_TESTING.md)
- [User Management API Testing](./USER_MANAGEMENT_API_TESTING.md)
- [Permissions Management API Testing](./PERMISSIONS_MANAGEMENT_API_TESTING.md)
- [Customer Auth API Testing](./CUSTOMER_AUTH_API_TESTING.md)
- [Doctor Auth API Testing](./DOCTOR_AUTH_API_TESTING.md)
- [Salesperson Auth API Testing](./SALESPERSON_AUTH_API_TESTING.md)

---

## Quick Start Guide

### 1. Setup Development Environment

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
mongod

# Start server
npm run dev
```

### 2. Create First Admin

```bash
# Use seed script or manual MongoDB insert
npm run seed
```

### 3. Login as Admin

```bash
curl -X POST http://localhost:5000/api/super-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@philbox.com","password":"admin123"}' \
  -c cookies.txt
```

### 4. Test Protected Route

```bash
curl -X GET http://localhost:5000/api/super-admin/branches \
  -b cookies.txt
```

---

## Frontend Integration Examples

### Setup Axios Instance

```javascript
// src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add loading state here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
```

### Admin Service

```javascript
// src/services/adminService.js
import api from "../api/axiosInstance";

export const adminService = {
  // Auth
  login: (email, password) =>
    api.post("/super-admin/auth/login", { email, password }),

  verifyOTP: (otp) => api.post("/super-admin/auth/verify-otp", { otp }),

  logout: () => api.post("/super-admin/auth/logout"),

  // Branches
  getBranches: (params) => api.get("/super-admin/branches", { params }),

  createBranch: (data) => api.post("/super-admin/branches", data),

  updateBranch: (id, data) => api.put(`/super-admin/branches/${id}`, data),

  deleteBranch: (id) => api.delete(`/super-admin/branches/${id}`),

  // Users
  getAdmins: (params) => api.get("/super-admin/users/admins", { params }),

  createAdmin: (data) => api.post("/super-admin/users/admins", data),
};
```

### React Hook Example

```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { adminService } from "../services/adminService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await adminService.login(email, password);

    if (response.data.data.requiresOTP) {
      return { requires2FA: true };
    }

    setUser(response.data.data.admin);
    return { requires2FA: false };
  };

  const verifyOTP = async (otp) => {
    const response = await adminService.verifyOTP(otp);
    setUser(response.data.data.admin);
  };

  const logout = async () => {
    await adminService.logout();
    setUser(null);
  };

  return { user, loading, login, verifyOTP, logout };
};
```

---

## Support & Contact

For questions or issues:

- **Documentation Issues:** Create an issue in the repository
- **API Bugs:** Report via GitHub Issues
- **Feature Requests:** Submit via GitHub Discussions

---

## Version History

| Version | Date       | Changes                           |
| ------- | ---------- | --------------------------------- |
| 1.0.0   | 2025-12-18 | Initial API documentation release |
