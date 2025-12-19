# Doctor Management API Guide

Complete guide for managing doctor profiles, including viewing, editing, suspending, activating, and monitoring doctor performance metrics.

## Base URL

```
http://localhost:5000/api/super-admin/doctors
```

## Authentication

All routes require admin authentication. Include session cookie in requests after logging in as an admin.

---

## Table of Contents

1. [Doctor Applications Management](#doctor-applications-management)
2. [Doctor Profile Management](#doctor-profile-management)
3. [Doctor Status Management](#doctor-status-management)
4. [Doctor Performance Metrics](#doctor-performance-metrics)

---

## Doctor Applications Management

### 1.1 Get All Doctor Applications

Fetch all doctor applications with filtering options.

**Endpoint:** `GET /api/super-admin/doctors/applications`

**Query Parameters:**

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| page      | Number | No       | Page number (default: 1)                            |
| limit     | Number | No       | Items per page (default: 10, max: 100)              |
| search    | String | No       | Search by doctor name or email                      |
| status    | String | No       | Filter by status: `pending`, `approved`, `rejected` |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/super-admin/doctors/applications?page=1&limit=10&status=pending' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctor applications fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "67890abc123def456",
        "doctor_id": {
          "_id": "12345abc678def901",
          "fullName": "Dr. Sarah Johnson",
          "email": "sarah.johnson@example.com",
          "contactNumber": "+1234567890",
          "profile_img_url": "https://avatar.iran.liara.run/username?username=Sarah+Johnson",
          "account_status": "suspended/freezed",
          "created_at": "2025-01-10T08:30:00.000Z"
        },
        "status": "pending",
        "admin_comment": null,
        "created_at": "2025-01-10T08:35:00.000Z"
      }
    ],
    "totalDocs": 15,
    "limit": 10,
    "totalPages": 2,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

---

### 1.2 Get Single Doctor Application

Fetch detailed information about a specific doctor application.

**Endpoint:** `GET /api/super-admin/doctors/applications/:id`

**Path Parameters:**

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| id        | String | Yes      | Application ID |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/super-admin/doctors/applications/67890abc123def456' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctor application fetched successfully",
  "data": {
    "_id": "67890abc123def456",
    "doctor_id": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "contactNumber": "+1234567890",
      "gender": "Female",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Sarah+Johnson",
      "account_status": "suspended/freezed",
      "license_number": "MD123456",
      "created_at": "2025-01-10T08:30:00.000Z"
    },
    "applications_documents_id": {
      "_id": "doc123456",
      "CNIC": "https://cloudinary.com/cnic.pdf",
      "medical_license": "https://cloudinary.com/license.pdf",
      "mbbs_md_degree": "https://cloudinary.com/degree.pdf"
    },
    "status": "pending",
    "created_at": "2025-01-10T08:35:00.000Z"
  }
}
```

---

### 1.3 Approve Doctor Application

Approve a pending doctor application and activate the account.

**Endpoint:** `PATCH /api/super-admin/doctors/applications/:id/approve`

**Request Body:**

```json
{
  "comment": "All credentials verified. Welcome to Philbox!"
}
```

**Request Example:**

```bash
curl --location --request PATCH 'http://localhost:5000/api/super-admin/doctors/applications/67890abc123def456/approve' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "comment": "All credentials verified. Welcome to Philbox!"
}'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "application": {
      "_id": "67890abc123def456",
      "status": "approved",
      "admin_comment": "All credentials verified. Welcome to Philbox!",
      "reviewed_at": "2025-01-10T10:00:00.000Z"
    },
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "account_status": "active"
    }
  }
}
```

---

### 1.4 Reject Doctor Application

Reject a pending doctor application.

**Endpoint:** `PATCH /api/super-admin/doctors/applications/:id/reject`

**Request Body:**

```json
{
  "reason": "Incomplete medical license documentation. Please resubmit with valid documents."
}
```

**Request Example:**

```bash
curl --location --request PATCH 'http://localhost:5000/api/super-admin/doctors/applications/67890abc123def456/reject' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "reason": "Incomplete medical license documentation."
}'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "application": {
      "_id": "67890abc123def456",
      "status": "rejected",
      "admin_comment": "Incomplete medical license documentation."
    }
  }
}
```

---

## Doctor Profile Management

### 2.1 Get All Doctors

Fetch all doctors with advanced filtering and search capabilities.

**Endpoint:** `GET /api/super-admin/doctors`

**Query Parameters:**

| Parameter      | Type   | Required | Description                                                               |
| -------------- | ------ | -------- | ------------------------------------------------------------------------- |
| page           | Number | No       | Page number (default: 1)                                                  |
| limit          | Number | No       | Items per page (default: 10, max: 100)                                    |
| search         | String | No       | Search by name, email, or license number                                  |
| specialization | String | No       | Filter by specialization                                                  |
| account_status | String | No       | Filter by status: `active`, `suspended/freezed`, `blocked/removed`        |
| sortBy         | String | No       | Sort field: `fullName`, `created_at`, `averageRating`, `consultation_fee` |
| sortOrder      | String | No       | Sort order: `asc`, `desc` (default: desc)                                 |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/super-admin/doctors?page=1&limit=20&account_status=active&specialization=Cardiology&sortBy=averageRating&sortOrder=desc' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": {
    "docs": [
      {
        "_id": "12345abc678def901",
        "fullName": "Dr. Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "contactNumber": "+1234567890",
        "gender": "Female",
        "dateOfBirth": "1990-05-15T00:00:00.000Z",
        "specialization": ["Cardiology", "Internal Medicine"],
        "license_number": "MD123456",
        "affiliated_hospital": "City General Hospital",
        "consultation_type": "both",
        "consultation_fee": 150,
        "account_status": "active",
        "averageRating": 4.8,
        "profile_img_url": "https://avatar.iran.liara.run/username?username=Sarah+Johnson",
        "last_login": "2025-01-09T14:30:00.000Z",
        "created_at": "2025-01-10T08:30:00.000Z"
      },
      {
        "_id": "67890def123abc456",
        "fullName": "Dr. Michael Chen",
        "email": "michael.chen@example.com",
        "contactNumber": "+1234567891",
        "gender": "Male",
        "specialization": ["Cardiology"],
        "consultation_fee": 200,
        "account_status": "active",
        "averageRating": 4.6,
        "created_at": "2025-01-08T10:00:00.000Z"
      }
    ],
    "totalDocs": 45,
    "limit": 20,
    "totalPages": 3,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

---

### 2.2 Get Single Doctor Details

Fetch detailed information about a specific doctor including performance metrics.

**Endpoint:** `GET /api/super-admin/doctors/:id`

**Path Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | String | Yes      | Doctor ID   |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/super-admin/doctors/12345abc678def901' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctor details fetched successfully",
  "data": {
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "contactNumber": "+1234567890",
      "gender": "Female",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "educational_details": [
        {
          "degree": "MBBS",
          "institution": "Harvard Medical School",
          "yearOfCompletion": 2015,
          "specialization": "Medicine"
        },
        {
          "degree": "MD",
          "institution": "Johns Hopkins University",
          "yearOfCompletion": 2018,
          "specialization": "Cardiology"
        }
      ],
      "specialization": ["Cardiology", "Internal Medicine"],
      "experience_details": [
        {
          "institution": "City General Hospital",
          "starting_date": "2018-07-01T00:00:00.000Z",
          "ending_date": null,
          "is_going_on": true
        }
      ],
      "license_number": "MD123456",
      "affiliated_hospital": "City General Hospital",
      "consultation_type": "both",
      "consultation_fee": 150,
      "account_status": "active",
      "averageRating": 4.8,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Sarah+Johnson",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Sarah+Johnson",
      "last_login": "2025-01-09T14:30:00.000Z",
      "is_Verified": true,
      "oauth_provider": "local",
      "roleId": {
        "_id": "role123",
        "name": "Doctor"
      },
      "created_at": "2025-01-10T08:30:00.000Z",
      "updated_at": "2025-01-10T08:30:00.000Z"
    },
    "metrics": {
      "totalReviews": 125,
      "averageRating": 4.8,
      "totalAppointments": 245,
      "completedAppointments": 220,
      "missedAppointments": 15,
      "totalConsultations": 185,
      "responseRate": 98,
      "availabilityRate": 87,
      "completionRate": 90,
      "noShowRate": 6,
      "accountCreatedAt": "2025-01-10T08:30:00.000Z",
      "lastLogin": "2025-01-09T14:30:00.000Z",
      "currentStatus": "active"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found",
  "data": null
}
```

---

### 2.3 Update Doctor Profile

Update specific fields of a doctor's profile.

**Endpoint:** `PUT /api/super-admin/doctors/:id`

**Path Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | String | Yes      | Doctor ID   |

**Request Body:**

```json
{
  "specialization": ["Cardiology", "Internal Medicine", "Preventive Medicine"],
  "consultation_fee": 175,
  "consultation_type": "both",
  "affiliated_hospital": "University Medical Center",
  "contactNumber": "1234567890"
}
```

**Allowed Fields:**

- `specialization` (Array of strings)
- `consultation_fee` (Number, minimum: 0)
- `consultation_type` (String: `in-person`, `online`, `both`)
- `affiliated_hospital` (String)
- `contactNumber` (String, 10-15 digits)

**Request Example:**

```bash
curl --location --request PUT 'http://localhost:5000/api/super-admin/doctors/12345abc678def901' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "consultation_fee": 175,
  "specialization": ["Cardiology", "Internal Medicine", "Preventive Medicine"]
}'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "data": {
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "specialization": [
        "Cardiology",
        "Internal Medicine",
        "Preventive Medicine"
      ],
      "consultation_fee": 175,
      "consultation_type": "both",
      "affiliated_hospital": "University Medical Center",
      "updated_at": "2025-01-10T12:00:00.000Z"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Doctor not found",
  "data": null
}
```

---

## Doctor Status Management

### 3.1 Update Doctor Account Status

Suspend, activate, or block a doctor's account.

**Endpoint:** `PATCH /api/super-admin/doctors/:id/status`

**Path Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | String | Yes      | Doctor ID   |

**Request Body:**

```json
{
  "status": "suspended/freezed",
  "reason": "Multiple patient complaints regarding unprofessional behavior. Account suspended pending investigation.",
  "sendNotification": true
}
```

**Body Parameters:**

| Parameter        | Type    | Required    | Description                                         |
| ---------------- | ------- | ----------- | --------------------------------------------------- |
| status           | String  | Yes         | `active`, `suspended/freezed`, or `blocked/removed` |
| reason           | String  | Conditional | Required when suspending or blocking                |
| sendNotification | Boolean | No          | Send email notification (default: true)             |

**Request Example (Suspend):**

```bash
curl --location --request PATCH 'http://localhost:5000/api/super-admin/doctors/12345abc678def901/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "status": "suspended/freezed",
  "reason": "Multiple patient complaints. Account suspended pending investigation.",
  "sendNotification": true
}'
```

**Success Response (200) - Suspend:**

```json
{
  "success": true,
  "message": "Doctor account suspended successfully",
  "data": {
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "account_status": "suspended/freezed"
    },
    "message": "Doctor account suspended successfully"
  }
}
```

**Request Example (Activate):**

```bash
curl --location --request PATCH 'http://localhost:5000/api/super-admin/doctors/12345abc678def901/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "status": "active",
  "sendNotification": true
}'
```

**Success Response (200) - Activate:**

```json
{
  "success": true,
  "message": "Doctor account activated successfully",
  "data": {
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "account_status": "active"
    },
    "message": "Doctor account activated successfully"
  }
}
```

**Request Example (Block/Remove):**

```bash
curl --location --request PATCH 'http://localhost:5000/api/super-admin/doctors/12345abc678def901/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "status": "blocked/removed",
  "reason": "Fraudulent medical credentials detected. Account permanently blocked.",
  "sendNotification": true
}'
```

**Success Response (200) - Block:**

```json
{
  "success": true,
  "message": "Doctor account blocked successfully",
  "data": {
    "doctor": {
      "_id": "12345abc678def901",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "account_status": "blocked/removed"
    },
    "message": "Doctor account blocked successfully"
  }
}
```

---

## Doctor Performance Metrics

### 4.1 Get Doctor Performance Metrics

Fetch performance metrics for a specific doctor.

**Endpoint:** `GET /api/super-admin/doctors/:id/metrics`

**Path Parameters:**

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | String | Yes      | Doctor ID   |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/super-admin/doctors/12345abc678def901/metrics' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Doctor performance metrics fetched successfully",
  "data": {
    "totalReviews": 125,
    "averageRating": 4.8,
    "totalAppointments": 245,
    "completedAppointments": 220,
    "missedAppointments": 15,
    "totalConsultations": 185,
    "responseRate": 98,
    "availabilityRate": 87,
    "completionRate": 90,
    "noShowRate": 6,
    "accountCreatedAt": "2025-01-10T08:30:00.000Z",
    "lastLogin": "2025-01-09T14:30:00.000Z",
    "currentStatus": "active"
  }
}
```

**Metrics Explanation:**

- **totalReviews**: Total number of reviews received from patients for the doctor
- **averageRating**: Average rating from patient reviews (1-5 scale)
- **totalAppointments**: Total count of completed and in-progress appointments from Appointment model
- **completedAppointments**: Count of successfully completed appointments
- **missedAppointments**: Count of appointments that were missed
- **totalConsultations**: Count of consultation sessions (tracked as 'meeting' type in reviews)
- **responseRate**: Percentage of appointment requests responded to (accepted or cancelled vs processing)
  - Formula: (responded requests / total requests) × 100
  - Returns 100% if no requests received yet
- **availabilityRate**: Doctor's activity rate over the last 30 days based on appointments
  - Formula: (days with appointments / 30 days) × 100
- **completionRate**: Percentage of appointments successfully completed
  - Formula: (completed appointments / total appointments) × 100
- **noShowRate**: Percentage of appointments that were missed
  - Formula: (missed appointments / total appointments) × 100
- **accountCreatedAt**: Account creation timestamp
- **lastLogin**: Last login timestamp
- **currentStatus**: Current account status (active/suspended/blocked)

---

## Status Codes

| Code | Description                                    |
| ---- | ---------------------------------------------- |
| 200  | Success                                        |
| 400  | Bad Request (validation error, missing fields) |
| 401  | Unauthorized (not authenticated)               |
| 403  | Forbidden (insufficient permissions)           |
| 404  | Not Found (doctor/application not found)       |
| 500  | Internal Server Error                          |

---

## Email Notifications

### Notification Types:

1. **Account Activated**: Sent when doctor account is activated
2. **Account Suspended**: Sent when doctor account is suspended with reason
3. **Account Blocked**: Sent when doctor account is permanently blocked

All emails include:

- Professional greeting with doctor's title
- Clear explanation of status change
- Login link (for activations)
- Support contact information

---

## Admin Activity Logging

All doctor management actions are automatically logged:

- `view_doctors_list` - Viewing doctors list
- `view_doctor_profile` - Viewing single doctor profile
- `update_doctor_profile` - Updating doctor profile fields
- `update_doctor_status` - Changing account status
- `approve_doctor_application` - Approving application
- `reject_doctor_application` - Rejecting application

Each log entry includes:

- Admin who performed the action
- Timestamp
- Action type
- Target doctor ID
- Action details (previous/new values, reasons, etc.)

---

## Testing Workflow

### 1. Test Doctor Applications Flow

```bash
# Step 1: Get pending applications
GET /api/super-admin/doctors/applications?status=pending

# Step 2: View specific application details
GET /api/super-admin/doctors/applications/{applicationId}

# Step 3: Approve or reject
PATCH /api/super-admin/doctors/applications/{applicationId}/approve
# OR
PATCH /api/super-admin/doctors/applications/{applicationId}/reject
```

### 2. Test Doctor Management Flow

```bash
# Step 1: Get all active doctors
GET /api/super-admin/doctors?account_status=active

# Step 2: View specific doctor details
GET /api/super-admin/doctors/{doctorId}

# Step 3: Update doctor profile
PUT /api/super-admin/doctors/{doctorId}

# Step 4: View performance metrics
GET /api/super-admin/doctors/{doctorId}/metrics

# Step 5: Suspend doctor account
PATCH /api/super-admin/doctors/{doctorId}/status
```

### 3. Test Search and Filter

```bash
# Search by name
GET /api/super-admin/doctors?search=sarah

# Filter by specialization
GET /api/super-admin/doctors?specialization=Cardiology

# Filter by status
GET /api/super-admin/doctors?account_status=suspended/freezed

# Combined filters with sorting
GET /api/super-admin/doctors?specialization=Cardiology&account_status=active&sortBy=averageRating&sortOrder=desc
```

---

## Common Use Cases

### Use Case 1: Review and Approve New Doctor

1. Get pending applications list
2. Review specific application details and documents
3. Approve application (account automatically activated)
4. Doctor receives email with login credentials

### Use Case 2: Suspend Problematic Doctor

1. Search for doctor by name or email
2. View doctor profile and performance metrics
3. Update status to `suspended/freezed` with reason
4. Doctor receives email notification
5. Action logged in admin activity log

### Use Case 3: Update Doctor Information

1. Find doctor in listing
2. View full doctor profile
3. Update consultation fee or specializations
4. Changes reflected immediately
5. Action logged for audit trail

### Use Case 4: Monitor Doctor Performance

1. Access doctor profile
2. View performance metrics (ratings, reviews, appointments)
3. Make informed decisions about account status
4. Track doctor activity and engagement

---

## Best Practices

1. **Always provide reasons** when suspending or blocking accounts for transparency and audit trails

2. **Use pagination** when fetching large lists to improve performance

3. **Combine filters** effectively to narrow down search results

4. **Enable notifications** when changing account status to keep doctors informed

5. **Review performance metrics** before making status changes

6. **Use appropriate status values**:
   - `active` - Doctor can login and provide services
   - `suspended/freezed` - Temporary suspension (reversible)
   - `blocked/removed` - Permanent block (serious violations)

7. **Validate data** before sending updates (DTOs handle this automatically)

8. **Check error responses** and handle them appropriately in your frontend

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Passwords and sensitive tokens are never exposed in responses
- Admin session is required for all endpoints
- Rate limiting may apply to prevent abuse
- All actions are logged for security and audit purposes

---

## Future Enhancements

The following features are planned for future updates:

1. **Advanced Appointment Tracking**
   - Full appointment management system integration
   - Real-time appointment status updates
   - Appointment cancellation analytics

2. **Revenue Analytics**
   - Revenue generated per doctor
   - Payment collection tracking
   - Consultation fee analytics

3. **Advanced Performance Metrics**
   - Patient satisfaction trends over time
   - Peak consultation hours analysis
   - Performance benchmarking against peers

---

## Support

For questions or issues with this API:

- Check server logs for detailed error messages
- Verify session authentication is working
- Ensure request body matches validation schemas
- Contact backend team for assistance

---

**Last Updated:** December 19, 2025
**API Version:** 1.0
**Maintained by:** Philbox Backend Team
