# Salesperson Complete API Guide

**Base URL:** `http://localhost:5000/api/salesperson`

---

## 1. Authentication APIs

#### 1.1 Login

**Endpoint:** `POST /api/salesperson/auth/login`

**Request Body:**

```json
{
  "email": "salesperson@philbox.com",
  "password": "SecurePass123!"
}
```

**Response (2FA Disabled):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "fullName": "John Sales",
      "email": "salesperson@philbox.com",
      "contactNumber": "+923001234567",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "branches_to_be_managed": [
        {
          "_id": "64branch123...",
          "name": "Karachi Branch"
        }
      ],
      "status": "active",
      "isTwoFactorEnabled": false,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John Sales",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John Sales",
      "roleId": {
        "_id": "64role1...",
        "name": "Salesperson"
      }
    }
  }
}
```

**Response (2FA Enabled):**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "data": {
    "requiresOTP": true,
    "email": "salesperson@philbox.com"
  }
}
```

---

#### 1.2 Verify OTP

**Endpoint:** `POST /api/salesperson/auth/verify-otp`

**Request Body:**

```json
{
  "email": "salesperson@philbox.com",
  "otp": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP verified successfully. Login complete.",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "fullName": "John Sales",
      "email": "salesperson@philbox.com",
      "contactNumber": "+923001234567",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "branches_to_be_managed": [
        {
          "_id": "64branch123...",
          "name": "Karachi Branch",
          "code": "KHI-001",
          "phone": "+922134567890",
          "address_id": {
            "_id": "64addr123...",
            "street": "Main Boulevard",
            "city": "Karachi",
            "province": "Sindh"
          }
        }
      ],
      "status": "active",
      "isTwoFactorEnabled": true,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John Sales",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John Sales",
      "address_id": {
        "_id": "64addr456...",
        "street": "456 Street",
        "city": "Karachi",
        "province": "Sindh"
      },
      "roleId": {
        "_id": "64role1...",
        "name": "Salesperson",
        "permissions": [
          {
            "_id": "64perm1...",
            "name": "read_orders",
            "resource": "orders",
            "action": "read"
          },
          {
            "_id": "64perm2...",
            "name": "create_orders",
            "resource": "orders",
            "action": "create"
          }
        ]
      }
    }
  }
}
```

---

#### 1.3 Forget Password

**Endpoint:** `POST /api/salesperson/auth/forget-password`

**Request Body:**

```json
{
  "email": "salesperson@philbox.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": null
}
```

---

#### 1.4 Reset Password

**Endpoint:** `POST /api/salesperson/auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

---

#### 1.5 Update 2FA Settings

**Endpoint:** `PATCH /api/salesperson/auth/2fa-settings`

**Request Body:**

```json
{
  "isTwoFactorEnabled": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Two-factor authentication settings updated successfully",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "fullName": "John Sales",
      "email": "salesperson@philbox.com",
      "isTwoFactorEnabled": true,
      "updated_at": "2025-12-18T12:00:00.000Z"
    }
  }
}
```

---

#### 1.6 Get Current User

**Endpoint:** `GET /api/salesperson/auth/me`

**Response:**

```json
{
  "success": true,
  "message": "Salesperson fetched successfully",
  "data": {
    "salesperson": {
      "_id": "64sales123...",
      "fullName": "John Sales",
      "email": "salesperson@philbox.com",
      "contactNumber": "+923001234567",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "branches_to_be_managed": [
        {
          "_id": "64branch123...",
          "name": "Karachi Branch",
          "code": "KHI-001"
        }
      ],
      "status": "active",
      "isTwoFactorEnabled": true,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John Sales",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John Sales",
      "address_id": {
        "_id": "64addr456...",
        "street": "456 Street",
        "city": "Karachi",
        "province": "Sindh"
      },
      "roleId": {
        "_id": "64role1...",
        "name": "Salesperson"
      }
    }
  }
}
```

---

#### 1.7 Logout

**Endpoint:** `POST /api/salesperson/auth/logout`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Task Management APIs

**Base Route:** `/api/salesperson/tasks`

#### 2.1 Get My Tasks

**Endpoint:** `GET /api/salesperson/tasks`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status - `pending`, `in-progress`, `completed`, `cancelled`
- `priority` (optional): Filter by priority - `low`, `medium`, `high`, `urgent`
- `startDate` (optional): Filter by creation start date (ISO format)
- `endDate` (optional): Filter by creation end date (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "64task123...",
        "title": "Visit Karachi Branch Pharmacy",
        "description": "Check inventory levels and submit report",
        "priority": "high",
        "status": "pending",
        "deadline": "2025-12-30T23:59:59.999Z",
        "assigned_by_admin_id": {
          "_id": "64admin123...",
          "name": "Admin Name",
          "email": "admin@philbox.com",
          "category": "super-admin"
        },
        "branch_id": {
          "_id": "64branch123...",
          "name": "Karachi Branch",
          "code": "KHI-001"
        },
        "updates": [
          {
            "updated_by": "64admin123...",
            "role": "admin",
            "message": "Please prioritize this task",
            "updated_at": "2025-12-28T10:00:00.000Z"
          }
        ],
        "created_at": "2025-12-28T09:00:00.000Z",
        "updated_at": "2025-12-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

#### 2.2 Get Task Statistics

**Endpoint:** `GET /api/salesperson/tasks/statistics`

**Query Parameters:**

- `startDate` (optional): Start date for statistics (ISO format)
- `endDate` (optional): End date for statistics (ISO format)

**Response:**

```json
{
  "success": true,
  "message": "Task statistics retrieved successfully",
  "data": {
    "totalTasks": 25,
    "overdueTasks": 1,
    "byStatus": {
      "pending": 2,
      "in-progress": 5,
      "completed": 18
    },
    "byPriority": {
      "low": 5,
      "medium": 10,
      "high": 8,
      "urgent": 2
    }
  }
}
```

---

#### 2.3 Get Task by ID

**Endpoint:** `GET /api/salesperson/tasks/:taskId`

**Params:**

- `taskId`: Task ID

**Response:**

```json
{
  "success": true,
  "message": "Task fetched successfully",
  "data": {
    "task": {
      "_id": "64task123...",
      "title": "Visit Karachi Branch Pharmacy",
      "description": "Check inventory levels and submit detailed report with photos",
      "priority": "high",
      "status": "in-progress",
      "deadline": "2025-12-30T23:59:59.999Z",
      "assigned_by_admin_id": {
        "_id": "64admin123...",
        "name": "Admin Name",
        "email": "admin@philbox.com",
        "category": "super-admin"
      },
      "branch_id": {
        "_id": "64branch123...",
        "name": "Karachi Branch",
        "code": "KHI-001"
      },
      "updates": [
        {
          "_id": "64update1...",
          "updated_by": "64admin123...",
          "role": "admin",
          "message": "Please prioritize this task",
          "updated_at": "2025-12-28T10:00:00.000Z"
        },
        {
          "_id": "64update2...",
          "updated_by": "64sales123...",
          "role": "salesperson",
          "message": "Started inventory check. Will complete by EOD.",
          "updated_at": "2025-12-28T14:30:00.000Z"
        }
      ],
      "created_at": "2025-12-28T09:00:00.000Z",
      "updated_at": "2025-12-28T14:30:00.000Z"
    }
  }
}
```

---

#### 2.4 Update Task Status

**Endpoint:** `PUT /api/salesperson/tasks/:taskId/status`

**Params:**

- `taskId`: Task ID

**Request Body:**

```json
{
  "status": "in-progress"
}
```

_Valid status values: `pending`, `in-progress`, `completed`, `cancelled`_

**Response:**

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {
      "_id": "64task123...",
      "title": "Visit Karachi Branch Pharmacy",
      "description": "Check inventory levels and submit report",
      "priority": "high",
      "status": "in-progress",
      "deadline": "2025-12-30T23:59:59.999Z",
      "assigned_by_admin_id": {
        "_id": "64admin123...",
        "name": "Admin Name",
        "email": "admin@philbox.com",
        "category": "super-admin"
      },
      "branch_id": {
        "_id": "64branch123...",
        "name": "Karachi Branch",
        "code": "KHI-001"
      },
      "updated_at": "2025-12-28T15:00:00.000Z"
    }
  }
}
```

_Emits socket event: `task:status_updated`_

---

#### 2.5 Add Task Comment

**Endpoint:** `POST /api/salesperson/tasks/:taskId/updates`

**Params:**

- `taskId`: Task ID

**Request Body:**

```json
{
  "message": "Completed inventory check. Found 5 items low on stock. Report uploaded to system."
}
```

_Message must be 1-1000 characters_

**Response:**

```json
{
  "success": true,
  "message": "Task update added successfully",
  "data": {
    "task": {
      "_id": "64task123...",
      "title": "Visit Karachi Branch Pharmacy",
      "updates": [
        {
          "_id": "64update1...",
          "updated_by": "64admin123...",
          "role": "admin",
          "message": "Please prioritize this task",
          "updated_at": "2025-12-28T10:00:00.000Z"
        },
        {
          "_id": "64update2...",
          "updated_by": "64sales123...",
          "role": "salesperson",
          "message": "Completed inventory check. Found 5 items low on stock. Report uploaded to system.",
          "updated_at": "2025-12-28T16:00:00.000Z"
        }
      ],
      "updated_at": "2025-12-28T16:00:00.000Z"
    }
  }
}
```

_Emits socket event: `task:comment_added`_

---

## 3. Socket.IO Events

**Server:** `http://localhost:5000`

### Events Received by Salesperson

#### 3.1 task:created

When admin creates a new task assigned to you.

**Payload:**

```json
{
  "taskId": "64task123...",
  "title": "Visit Karachi Branch Pharmacy",
  "priority": "high",
  "deadline": "2025-12-30T23:59:59.999Z",
  "assignedBy": {
    "_id": "64admin123...",
    "name": "Admin Name",
    "category": "super-admin"
  },
  "timestamp": "2025-12-28T09:00:00.000Z"
}
```

---

#### 3.2 task:updated

When admin updates task details.

**Payload:**

```json
{
  "taskId": "64task123...",
  "title": "Updated: Visit Karachi Branch Pharmacy",
  "changes": {
    "priority": "urgent",
    "deadline": "2025-12-29T23:59:59.999Z",
    "description": "Updated description - URGENT"
  },
  "updatedBy": {
    "_id": "64admin123...",
    "name": "Admin Name",
    "category": "super-admin"
  },
  "timestamp": "2025-12-28T11:00:00.000Z"
}
```

---

#### 3.3 task:comment_added

When admin adds a comment to your task.

**Payload:**

```json
{
  "taskId": "64task123...",
  "message": "Please prioritize customers with orders over $500",
  "addedBy": {
    "_id": "64admin123...",
    "name": "Admin Name",
    "category": "super-admin"
  },
  "timestamp": "2025-12-28T12:00:00.000Z"
}
```

---

#### 3.4 task:deleted

When admin deletes a task.

**Payload:**

```json
{
  "taskId": "64task123...",
  "title": "Visit Karachi Branch Pharmacy",
  "deletedBy": {
    "_id": "64admin123...",
    "name": "Admin Name",
    "category": "super-admin"
  },
  "timestamp": "2025-12-28T13:00:00.000Z"
}
```
