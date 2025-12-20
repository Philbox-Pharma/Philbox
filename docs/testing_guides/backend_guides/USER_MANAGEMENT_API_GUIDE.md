# User Management API Guide

## Base URL

```
http://localhost:5000/api/admin
```

## Authentication

All routes require:

- Session-based authentication
- Super Admin role

---

## 1. Admin Management APIs

### 1.1 Create Admin

**Endpoint:** `POST /api/admin/admin`
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

**Endpoint:** `GET /api/admin/admin`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Example Request:**

```
GET /api/admin/admin?page=1&limit=10&search=john
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

**Endpoint:** `GET /api/admin/admin/:id`
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

**Endpoint:** `PUT /api/admin/admin/:id`
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

**Endpoint:** `DELETE /api/admin/admin/:id`
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

**Endpoint:** `GET /api/admin/admin/search`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `q`: Search query

**Example Request:**

```
GET /api/admin/admin/search?q=john
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

**Endpoint:** `POST /api/admin/salesperson`
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

**Endpoint:** `GET /api/admin/salesperson`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Example Request:**

```
GET /api/admin/salesperson?page=1&limit=10&search=jane
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

**Endpoint:** `GET /api/admin/salesperson/:id`
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

**Endpoint:** `PUT /api/admin/salesperson/:id`
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

**Endpoint:** `PATCH /api/admin/salesperson/:id/status`
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

**Endpoint:** `DELETE /api/admin/salesperson/:id`
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

**Endpoint:** `GET /api/admin/salesperson/search`
**Authentication:** Required (Super Admin only)

**Query Parameters:**

- `q`: Search query

**Example Request:**

```
GET /api/admin/salesperson/search?q=jane
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

## 3. Salesperson Task Performance

### 3.1 Get Salesperson Task Performance

**Endpoint:** `GET /api/admin/users/salesperson-tasks/performance`
**Authentication:** Required (Super Admin or Branch Admin)

**Access Control:**

- **Super Admin**: Can view tasks for all salespersons across all branches
- **Branch Admin**: Can only view tasks for salespersons in their managed branches

**Query Parameters:**

| Parameter        | Type     | Description                                                                | Required |
| ---------------- | -------- | -------------------------------------------------------------------------- | -------- |
| `salesperson_id` | ObjectId | Filter by specific salesperson                                             | No       |
| `branch_id`      | ObjectId | Filter by branch                                                           | No       |
| `status`         | String   | Filter by task status (`pending`, `in_progress`, `completed`, `cancelled`) | No       |
| `priority`       | String   | Filter by priority (`low`, `medium`, `high`)                               | No       |
| `from_date`      | Date     | Filter tasks created after this date (ISO 8601)                            | No       |
| `to_date`        | Date     | Filter tasks created before this date (ISO 8601)                           | No       |
| `page`           | Number   | Page number for pagination (default: 1)                                    | No       |
| `limit`          | Number   | Items per page (default: 10)                                               | No       |

**Example Requests:**

```
# Get all tasks (Super Admin)
GET /api/admin/users/salesperson-tasks/performance

# Get tasks for specific salesperson
GET /api/admin/users/salesperson-tasks/performance?salesperson_id=64sales123

# Get pending tasks for a branch
GET /api/admin/users/salesperson-tasks/performance?branch_id=64branch123&status=pending

# Get high priority tasks
GET /api/admin/users/salesperson-tasks/performance?priority=high

# Get tasks within date range
GET /api/admin/users/salesperson-tasks/performance?from_date=2025-01-01&to_date=2025-12-31

# Paginated results
GET /api/admin/users/salesperson-tasks/performance?page=2&limit=20
```

**Success Response:**

```json
{
  "success": true,
  "message": "Salesperson task performance retrieved successfully",
  "data": {
    "tasks": {
      "docs": [
        {
          "_id": "64task123...",
          "title": "Follow up with 3 new leads",
          "description": "Contact leads from yesterday's campaign",
          "priority": "high",
          "status": "in_progress",
          "deadline": "2025-12-20T23:59:59.000Z",
          "assigned_by_admin_id": {
            "_id": "64admin123...",
            "name": "Admin User",
            "email": "admin@philbox.com"
          },
          "assigned_by_role": "super_admin",
          "salesperson_id": {
            "_id": "64sales123...",
            "fullName": "Jane Smith",
            "email": "jane@philbox.com",
            "phone_number": "+923001234567"
          },
          "branch_id": {
            "_id": "64branch123...",
            "name": "Karachi Branch",
            "city": "Karachi"
          },
          "updates": [
            {
              "updated_by": "64sales123...",
              "role": "salesperson",
              "message": "Contacted 2 out of 3 leads",
              "updated_at": "2025-12-18T10:30:00.000Z"
            }
          ],
          "created_at": "2025-12-15T09:00:00.000Z",
          "updated_at": "2025-12-18T10:30:00.000Z"
        }
      ],
      "totalDocs": 50,
      "limit": 10,
      "page": 1,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false,
      "nextPage": 2,
      "prevPage": null
    },
    "metrics": {
      "totalTasks": 50,
      "statusBreakdown": {
        "pending": 15,
        "in_progress": 10,
        "completed": 20,
        "cancelled": 5
      },
      "priorityBreakdown": {
        "low": 10,
        "medium": 25,
        "high": 15
      },
      "completionRate": "40.00%",
      "overdueTasks": 3,
      "averageCompletionDays": 4.5
    }
  }
}
```

**Performance Metrics Explained:**

- **totalTasks**: Total number of tasks matching the filters
- **statusBreakdown**: Count of tasks by status
  - `pending`: Tasks not yet started
  - `in_progress`: Tasks currently being worked on
  - `completed`: Successfully completed tasks
  - `cancelled`: Tasks that were cancelled
- **priorityBreakdown**: Count of tasks by priority level
  - `low`: Low priority tasks
  - `medium`: Medium priority tasks
  - `high`: High priority tasks
- **completionRate**: Percentage of completed tasks out of total tasks
- **overdueTasks**: Number of tasks past their deadline and not completed
- **averageCompletionDays**: Average number of days to complete a task

**Error Responses:**

```json
// Branch admin with no managed branches
{
  "success": false,
  "message": "You do not manage any branches"
}
```

```json
// Branch admin trying to access another branch's data
{
  "success": false,
  "message": "You do not have access to this branch"
}
```

```json
// Admin not found
{
  "success": false,
  "message": "Admin not found"
}
```

**Use Cases:**

1. **Super Admin Dashboard**: View overall task performance across all branches
2. **Branch Admin Dashboard**: Monitor tasks for their specific branch salespersons
3. **Salesperson Performance Review**: Filter by specific salesperson to evaluate individual performance
4. **Task Management**: Track pending, overdue, and completed tasks
5. **Priority Management**: Identify high-priority tasks that need attention
6. **Deadline Monitoring**: Find overdue tasks using the metrics

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
- `403` - Forbidden (not super admin or unauthorized branch access)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `500` - Server Error

---

## 4. Doctor Application Management APIs

### 4.1 Get All Doctor Applications

**Endpoint:** `GET /api/admin/doctors/applications`
**Authentication:** Required (Super Admin & Branch Admin)

**Query Parameters:**

| Parameter | Type   | Required | Default   | Description                                   |
| --------- | ------ | -------- | --------- | --------------------------------------------- |
| `page`    | Number | No       | `1`       | Page number for pagination                    |
| `limit`   | Number | No       | `10`      | Number of applications per page (max: 100)    |
| `search`  | String | No       | -         | Search by doctor name or email                |
| `status`  | String | No       | `pending` | Filter by status: pending, approved, rejected |

**Example Request:**

```bash
GET /api/admin/doctors/applications?status=pending&page=1&limit=10
```

**Success Response:**

```json
{
  "success": true,
  "message": "Doctor applications fetched successfully",
  "data": {
    "data": [
      {
        "_id": "64abc123...",
        "doctor_id": {
          "_id": "64def456...",
          "fullName": "Dr. Jane Smith",
          "email": "jane.smith@example.com",
          "contactNumber": "+92-301-1234567",
          "profile_img_url": "https://...",
          "account_status": "suspended/freezed",
          "created_at": "2024-01-15T10:30:00.000Z"
        },
        "applications_documents_id": {
          "_id": "64ghi789...",
          "CNIC": "https://cloudinary.com/.../cnic.jpg",
          "medical_license": "https://cloudinary.com/.../license.pdf",
          "specialist_license": "https://cloudinary.com/.../specialist.pdf",
          "mbbs_md_degree": "https://cloudinary.com/.../degree.pdf",
          "experience_letters": "https://cloudinary.com/.../experience.pdf"
        },
        "status": "pending",
        "created_at": "2024-01-15T11:00:00.000Z",
        "updated_at": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 4.2 Get Single Doctor Application

**Endpoint:** `GET /api/admin/doctors/applications/:id`
**Authentication:** Required (Super Admin & Branch Admin)

**Example Request:**

```bash
GET /api/admin/doctors/applications/64abc123...
```

**Success Response:**

```json
{
  "success": true,
  "message": "Doctor application fetched successfully",
  "data": {
    "_id": "64abc123...",
    "doctor_id": {
      "_id": "64def456...",
      "fullName": "Dr. Jane Smith",
      "email": "jane.smith@example.com",
      "contactNumber": "+92-301-1234567",
      "gender": "Female",
      "dateOfBirth": "1985-05-15T00:00:00.000Z",
      "profile_img_url": "https://...",
      "account_status": "suspended/freezed",
      "license_number": "PMC-12345",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "applications_documents_id": {
      "_id": "64ghi789...",
      "CNIC": "https://cloudinary.com/.../cnic.jpg",
      "medical_license": "https://cloudinary.com/.../license.pdf",
      "specialist_license": "https://cloudinary.com/.../specialist.pdf",
      "mbbs_md_degree": "https://cloudinary.com/.../degree.pdf",
      "experience_letters": "https://cloudinary.com/.../experience.pdf",
      "created_at": "2024-01-15T10:45:00.000Z"
    },
    "status": "pending",
    "reviewed_by_admin_id": null,
    "admin_comment": null,
    "reviewed_at": null,
    "created_at": "2024-01-15T11:00:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "message": "Application not found"
}
```

---

### 4.3 Approve Doctor Application

**Endpoint:** `PATCH /api/admin/doctors/applications/:id/approve`
**Authentication:** Required (Super Admin & Branch Admin)

**Request Body:**

```json
{
  "comment": "All credentials verified. Welcome to Philbox!"
}
```

| Field     | Type   | Required | Description                             |
| --------- | ------ | -------- | --------------------------------------- |
| `comment` | String | No       | Admin's approval notes (max: 500 chars) |

**Example Request:**

```bash
PATCH /api/admin/doctors/applications/64abc123.../approve
Content-Type: application/json

{
  "comment": "All credentials verified. Welcome to Philbox!"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "application": {
      "_id": "64abc123...",
      "doctor_id": "64def456...",
      "status": "approved",
      "admin_comment": "All credentials verified. Welcome to Philbox!",
      "reviewed_by_admin_id": "64admin789...",
      "reviewed_at": "2024-01-16T09:30:00.000Z",
      "updated_at": "2024-01-16T09:30:00.000Z"
    },
    "doctor": {
      "_id": "64def456...",
      "fullName": "Dr. Jane Smith",
      "email": "jane.smith@example.com",
      "account_status": "active",
      "onboarding_status": "approved"
    },
    "message": "Application approved successfully"
  }
}
```

**What Happens:**

1. Application status changed to `approved`
2. Doctor account status changed to `active`
3. Doctor onboarding status changed to `approved`
4. Email notification sent to doctor with approval message
5. Admin activity logged

**Error Responses:**

```json
// Application not found
{
  "success": false,
  "message": "Application not found"
}

// Already approved
{
  "success": false,
  "message": "Application already approved"
}
```

---

### 4.4 Reject Doctor Application

**Endpoint:** `PATCH /api/admin/doctors/applications/:id/reject`
**Authentication:** Required (Super Admin & Branch Admin)

**Request Body:**

```json
{
  "reason": "Medical license verification failed. Please upload a valid PMC license."
}
```

| Field    | Type   | Required | Description                                    |
| -------- | ------ | -------- | ---------------------------------------------- |
| `reason` | String | Yes      | Reason for rejection (min: 10, max: 500 chars) |

**Example Request:**

```bash
PATCH /api/admin/doctors/applications/64abc123.../reject
Content-Type: application/json

{
  "reason": "Medical license verification failed. Please upload a valid PMC license."
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "application": {
      "_id": "64abc123...",
      "doctor_id": "64def456...",
      "status": "rejected",
      "admin_comment": "Medical license verification failed. Please upload a valid PMC license.",
      "reviewed_by_admin_id": "64admin789...",
      "reviewed_at": "2024-01-16T09:30:00.000Z",
      "updated_at": "2024-01-16T09:30:00.000Z"
    },
    "doctor": {
      "_id": "64def456...",
      "fullName": "Dr. Jane Smith",
      "email": "jane.smith@example.com",
      "account_status": "suspended/freezed",
      "onboarding_status": "rejected"
    },
    "message": "Application rejected"
  }
}
```

**What Happens:**

1. Application status changed to `rejected`
2. Doctor account status remains `suspended/freezed`
3. Doctor onboarding status changed to `rejected`
4. Email notification sent to doctor with rejection reason
5. Admin activity logged

**Error Responses:**

```json
// Application not found
{
  "success": false,
  "message": "Application not found"
}

// Missing reason
{
  "success": false,
  "message": "Reason for rejection is required"
}

// Cannot reject approved application
{
  "success": false,
  "message": "Cannot reject an already approved application"
}
```

---

### 4.5 Doctor Application Workflow

```
Doctor Registers → Email Verification → Submits Documents
                                              ↓
                                    Application Created (pending)
                                              ↓
                                    Admin Reviews Application
                                         ↙         ↘
                                  APPROVE          REJECT
                                     ↓               ↓
                        Status: approved    Status: rejected
                        Account: active     Account: suspended
                        Email: Approved     Email: Rejected
                        Can Login ✅        Cannot Login ❌
```

---

### 4.6 Use Cases

**1. Super Admin views all pending applications:**

```bash
GET /api/admin/doctors/applications?status=pending
```

**2. Search for specific doctor application:**

```bash
GET /api/admin/doctors/applications?search=jane.smith
```

**3. View application details and documents:**

```bash
GET /api/admin/doctors/applications/64abc123...
```

**4. Approve application with comment:**

```bash
PATCH /api/admin/doctors/applications/64abc123.../approve
{
  "comment": "Verified credentials. Welcome aboard!"
}
```

**5. Reject application with specific reason:**

```bash
PATCH /api/admin/doctors/applications/64abc123.../reject
{
  "reason": "Invalid medical license. Please provide PMC-registered license."
}
```

**6. View all approved applications:**

```bash
GET /api/admin/doctors/applications?status=approved
```

**7. View all rejected applications:**

```bash
GET /api/admin/doctors/applications?status=rejected
```

---
