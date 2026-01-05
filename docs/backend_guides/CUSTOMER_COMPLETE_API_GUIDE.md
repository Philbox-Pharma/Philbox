# Customer Complete API Guide

**Base URL:** `http://localhost:5000/api`

---

## � Table of Contents

1. [🔐 Authentication Endpoints](#-authentication-endpoints)
2. [👤 Profile Endpoints](#-profile-endpoints)
3. [📊 Dashboard Endpoints](#-dashboard-endpoints)
4. [🔍 Search History Endpoints](#-search-history-endpoints)
5. [💊 Refill Reminders Endpoints](#-refill-reminders-endpoints)
6. [�️ Appointment Request Management](#-appointment-request-management)
7. [�📋 Validation Rules](#-validation-rules)
8. [❌ Error Responses](#-error-responses)
9. [🧪 Testing Guide](#-testing-guide)
10. [🔒 Authentication](#-authentication)
11. [📌 Notes](#-notes)
12. [🚀 Quick Start](#-quick-start)
13. [📞 Support](#-support)

---

## �🔐 AUTHENTICATION ENDPOINTS

### 1. Register Customer

**Endpoint:** `POST /api/customer/auth/register`
**Auth Required:** No

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "contactNumber": "1234567890",
  "gender": "Male",
  "dateOfBirth": "1990-01-15"
}
```

**Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "customer": {
      "_id": "67890abc123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "contactNumber": "1234567890",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "oauthId": null,
      "refreshTokens": [],
      "address_id": null,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=John Doe",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=John Doe",
      "account_status": "active",
      "last_login": null,
      "is_Verified": false,
      "verificationToken": "token_string_here",
      "verificationTokenExpiresAt": "2025-12-30T10:00:00.000Z",
      "roleId": "role_id_here",
      "resetPasswordToken": null,
      "resetPasswordExpiresAt": null,
      "created_at": "2025-12-29T10:00:00.000Z",
      "updated_at": "2025-12-29T10:00:00.000Z"
    },
    "nextStep": "verify-email"
  }
}
```

---

### 2. Verify Email

**Endpoint:** `POST /api/customer/auth/verify-email`
**Auth Required:** No

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Email verified successfully. Please login.",
  "data": null
}
```

---

### 3. Login

**Endpoint:** `POST /api/customer/auth/login`
**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "customer": {
      "_id": "67890abc123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "contactNumber": "1234567890",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "oauthId": null,
      "refreshTokens": [],
      "address_id": null,
      "profile_img_url": "https://res.cloudinary.com/.../profile.jpg",
      "cover_img_url": "https://res.cloudinary.com/.../cover.jpg",
      "account_status": "active",
      "last_login": "2025-12-29T10:30:00.000Z",
      "is_Verified": true,
      "verificationToken": null,
      "verificationTokenExpiresAt": null,
      "roleId": "role_id_here",
      "resetPasswordToken": null,
      "resetPasswordExpiresAt": null,
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-12-29T10:30:00.000Z"
    },
    "accountStatus": "active"
  }
}
```

---

### 4. Google OAuth Login

**Endpoint:** `GET /api/customer/auth/google`
**Auth Required:** No

**Description:** Redirects to Google OAuth consent screen

**Callback:** `GET /api/customer/auth/google/callback`
**Response:** Redirects to frontend with session

---

### 5. Forget Password

**Endpoint:** `POST /api/customer/auth/forget-password`
**Auth Required:** No

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password reset email sent",
  "data": null
}
```

---

### 6. Reset Password

**Endpoint:** `POST /api/customer/auth/reset-password`
**Auth Required:** No

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password reset successfully",
  "data": null
}
```

---

### 7. Get Current User

**Endpoint:** `GET /api/customer/auth/me`
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Current user fetched",
  "data": {
    "_id": "67890abc123",
    "id": "67890abc123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "roleId": "role_id_here"
  }
}
```

---

### 8. Logout

**Endpoint:** `POST /api/customer/auth/logout`
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Logout successful",
  "data": null
}
```

---

## 👤 PROFILE ENDPOINTS

### 9. Get Profile

**Endpoint:** `GET /api/customer/profile`
**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile fetched successfully",
  "data": {
    "customer": {
      "_id": "67890abc123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "contactNumber": "1234567890",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "oauthId": null,
      "address_id": {
        "_id": "67895xyz789",
        "street": "123 Main St",
        "town": "Downtown",
        "city": "New York",
        "province": "NY",
        "zip_code": "10001",
        "country": "USA",
        "google_map_link": "https://maps.google.com/...",
        "address_of_persons_id": "67890abc123",
        "created_at": "2025-01-15T08:00:00.000Z",
        "updated_at": "2025-12-29T10:30:00.000Z"
      },
      "profile_img_url": "https://res.cloudinary.com/.../profile.jpg",
      "cover_img_url": "https://res.cloudinary.com/.../cover.jpg",
      "account_status": "active",
      "last_login": "2025-12-29T10:30:00.000Z",
      "is_Verified": true,
      "roleId": {
        "_id": "role_id_here",
        "name": "customer",
        "permissions": []
      },
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-12-29T10:30:00.000Z"
    }
  }
}
```

---

### 10. Update Profile

**Endpoint:** `PUT /api/customer/profile`
**Auth Required:** Yes
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "fullName": "John Updated Doe",
  "contactNumber": "9876543210",
  "gender": "Male",
  "dateOfBirth": "1990-01-15",
  "street": "456 New Street",
  "town": "Uptown",
  "city": "Los Angeles",
  "province": "CA",
  "zip_code": "90001",
  "country": "USA",
  "google_map_link": "https://maps.google.com/..."
}
```

**Note:** All fields are optional. Send only what you want to update.

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "customer": {
      "_id": "67890abc123",
      "fullName": "John Updated Doe",
      "email": "john@example.com",
      "contactNumber": "9876543210",
      "gender": "Male",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "profile_img_url": "https://res.cloudinary.com/.../profile.jpg",
      "cover_img_url": "https://res.cloudinary.com/.../cover.jpg",
      "account_status": "active",
      "is_Verified": true,
      "address_id": {
        "_id": "67895xyz789",
        "street": "456 New Street",
        "town": "Uptown",
        "city": "Los Angeles",
        "province": "CA",
        "zip_code": "90001",
        "country": "USA",
        "google_map_link": "https://maps.google.com/..."
      },
      "roleId": {
        "_id": "role_id_here",
        "name": "customer"
      },
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-12-29T11:00:00.000Z"
    }
  }
}
```

---

### 11. Upload Profile Picture

**Endpoint:** `PUT /api/customer/profile/picture`
**Auth Required:** Yes
**Content-Type:** `multipart/form-data`

**Form Data:**

- `profile_img`: Image file (JPEG, JPG, PNG, WEBP)

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile picture updated successfully",
  "data": {
    "profile_img_url": "https://res.cloudinary.com/.../profile123.jpg"
  }
}
```

---

### 12. Upload Cover Image

**Endpoint:** `PUT /api/customer/profile/cover`
**Auth Required:** Yes
**Content-Type:** `multipart/form-data`

**Form Data:**

- `cover_img`: Image file (JPEG, JPG, PNG, WEBP)

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Cover image updated successfully",
  "data": {
    "cover_img_url": "https://res.cloudinary.com/.../cover123.jpg"
  }
}
```

---

### 13. Change Password

**Endpoint:** `PUT /api/customer/profile/password`
**Auth Required:** Yes
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## � DASHBOARD ENDPOINTS

### 14. Get Dashboard Data

**Endpoint:** `GET /api/customer/dashboard`
**Auth Required:** Yes

**Description:** Get personalized dashboard data including quick stats, recent orders, upcoming appointments, and medicine recommendations.

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Dashboard data fetched successfully",
  "data": {
    "stats": {
      "totalOrders": 15,
      "upcomingAppointments": 2
    },
    "recentOrders": [
      {
        "_id": "order_id_1",
        "total": 2500,
        "status": "completed",
        "created_at": "2025-12-28T10:00:00.000Z",
        "delivery_charges": 150,
        "branch": {
          "_id": "branch_id",
          "name": "Main Branch",
          "address": "123 Medical Street"
        },
        "items": [
          {
            "medicine": {
              "_id": "med_id_1",
              "Name": "Paracetamol",
              "img_url": "https://res.cloudinary.com/.../medicine.jpg",
              "sale_price": 500
            },
            "quantity": 2,
            "subtotal": 1000
          }
        ],
        "itemCount": 3
      }
    ],
    "upcomingAppointments": [
      {
        "_id": "appointment_id_1",
        "doctor": {
          "_id": "doctor_id",
          "fullName": "Dr. Sarah Johnson",
          "specialization": "Cardiologist",
          "profile_img_url": "https://res.cloudinary.com/.../doctor.jpg"
        },
        "slot": {
          "_id": "slot_id",
          "date": "2025-12-30T00:00:00.000Z",
          "start_time": "10:00 AM",
          "end_time": "10:30 AM"
        },
        "status": "pending",
        "appointment_type": "online",
        "created_at": "2025-12-29T08:00:00.000Z"
      }
    ],
    "medicineRecommendations": [
      {
        "_id": "med_id_1",
        "Name": "Paracetamol 500mg",
        "img_url": "https://res.cloudinary.com/.../medicine.jpg",
        "sale_price": 500,
        "description": "Pain reliever and fever reducer",
        "mgs": "500mg"
      }
    ]
  }
}
```

**Response Details:**

- **stats**: Quick overview statistics
  - `totalOrders`: Total number of orders placed by the customer
  - `upcomingAppointments`: Count of pending/in-progress appointments

- **recentOrders**: Last 5 orders with complete details
  - Includes order status, total amount, delivery charges
  - Branch information
  - Order items with medicine details
  - Item count

- **upcomingAppointments**: Next 3 upcoming appointments
  - Only includes accepted appointments with pending/in-progress status
  - Doctor information with specialization
  - Slot details (date and time)
  - Appointment type (online/in-person)

- **medicineRecommendations**: Top 5 recommended medicines
  - Based on frequently ordered medicines from past orders
  - Falls back to recent medicines if no order history
  - Includes medicine details, price, and description

---

## 🔍 SEARCH HISTORY ENDPOINTS

### 15. Save Search Query

**Endpoint:** `POST /api/customer/search-history`
**Auth Required:** Yes
**Content-Type:** `application/json`

**Description:** Save a search query to history. Prevents duplicate entries within 5 minutes.

**Request Body:**

```json
{
  "query": "Paracetamol",
  "filters": {
    "category": "Pain Relief",
    "brand": "Brand Name",
    "dosageForm": "Tablet",
    "prescriptionRequired": false
  }
}
```

**Note:** Only `query` is required. `filters` object is optional.

**Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Search saved to history",
  "data": {
    "_id": "search_id_123",
    "customer_id": "customer_id_456",
    "query": "Paracetamol",
    "searched_at": "2025-12-29T12:00:00.000Z",
    "filters": {
      "category": "Pain Relief",
      "brand": "Brand Name",
      "dosageForm": "Tablet",
      "prescriptionRequired": false
    },
    "created_at": "2025-12-29T12:00:00.000Z",
    "updated_at": "2025-12-29T12:00:00.000Z"
  }
}
```

---

### 16. Get Search History

**Endpoint:** `GET /api/customer/search-history`
**Auth Required:** Yes

**Description:** Retrieve last 20 searches for the customer, sorted by most recent first.

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Search history fetched successfully",
  "data": [
    {
      "_id": "search_id_123",
      "customer_id": "customer_id_456",
      "query": "Paracetamol",
      "searched_at": "2025-12-29T12:00:00.000Z",
      "filters": {
        "category": "Pain Relief",
        "brand": "Brand Name",
        "dosageForm": "Tablet",
        "prescriptionRequired": false
      },
      "created_at": "2025-12-29T12:00:00.000Z",
      "updated_at": "2025-12-29T12:00:00.000Z"
    },
    {
      "_id": "search_id_124",
      "customer_id": "customer_id_456",
      "query": "Amoxicillin",
      "searched_at": "2025-12-29T11:30:00.000Z",
      "filters": {},
      "created_at": "2025-12-29T11:30:00.000Z",
      "updated_at": "2025-12-29T11:30:00.000Z"
    }
  ]
}
```

---

### 17. Delete Search History Item

**Endpoint:** `DELETE /api/customer/search-history/:id`
**Auth Required:** Yes

**Description:** Delete a specific search history item.

**URL Parameters:**

- `id`: Search history item ID

**Example:** `DELETE /api/customer/search-history/search_id_123`

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Search history item deleted successfully",
  "data": null
}
```

**Error Response (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "Search history item not found",
  "data": null
}
```

---

### 18. Clear All Search History

**Endpoint:** `DELETE /api/customer/search-history/clear/all`
**Auth Required:** Yes

**Description:** Clear all search history for the customer.

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "All search history cleared successfully",
  "data": {
    "deletedCount": 15
  }
}
```

---

## 💊 REFILL REMINDERS ENDPOINTS

The Refill Reminders feature allows customers to set up automated reminders for medicine refills to ensure they never run out of their medications.

### Features

- ✅ Set reminders for multiple medicines
- ✅ Choose frequency (daily, weekly, monthly)
- ✅ Choose notification method (email, SMS, push)
- ✅ Automated scheduling with node-cron (runs every 5 minutes)
- ✅ Email notifications with beautiful templates
- ✅ SMS notifications via Twilio (optional)
- ✅ View, edit, delete, and mark reminders as completed

### 19. Create Refill Reminder

**Endpoint:** `POST /api/customer/refill-reminders`
**Auth Required:** Yes (Customer)

**Request Body:**

```json
{
  "medicines": ["medicineId1", "medicineId2"],
  "frequency": "daily",
  "timeOfDay": "08:00",
  "notificationMethod": "email"
}
```

**Validation Rules:**

- `medicines`: Array of valid medicine IDs (minimum 1)
- `frequency`: Must be one of: "daily", "weekly", "monthly"
- `timeOfDay`: 24-hour format (HH:MM), e.g., "08:00" or "18:30"
- `notificationMethod`: Must be one of: "email", "sms", "push"

**Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Refill reminder created successfully",
  "data": {
    "_id": "reminder123",
    "medicines": [
      {
        "_id": "med1",
        "tradeName": "Paracetamol",
        "genericName": "Acetaminophen",
        "strength": "500mg"
      }
    ],
    "patient_id": "customer123",
    "frequency": "daily",
    "timeOfDay": "08:00",
    "notificationMethod": "email",
    "isActive": true,
    "nextNotificationDate": "2025-12-31T08:00:00.000Z",
    "createdAt": "2025-12-30T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  }
}
```

---

### 20. Get All Reminders

**Endpoint:** `GET /api/customer/refill-reminders`
**Auth Required:** Yes (Customer)

**Query Parameters:**

- `isActive` (optional): Filter by active status (true/false)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `GET /api/customer/refill-reminders?isActive=true&page=1&limit=10`

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Reminders fetched successfully",
  "data": {
    "reminders": [
      {
        "_id": "reminder123",
        "medicines": [
          {
            "_id": "med1",
            "tradeName": "Paracetamol",
            "genericName": "Acetaminophen",
            "strength": "500mg",
            "dosageForm": "Tablet"
          }
        ],
        "patient_id": "customer123",
        "frequency": "daily",
        "timeOfDay": "08:00",
        "notificationMethod": "email",
        "isActive": true,
        "lastNotificationSent": "2025-12-30T08:00:00.000Z",
        "nextNotificationDate": "2025-12-31T08:00:00.000Z",
        "createdAt": "2025-12-29T10:00:00.000Z",
        "updatedAt": "2025-12-30T10:00:00.000Z"
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

### 21. Get Single Reminder

**Endpoint:** `GET /api/customer/refill-reminders/:id`
**Auth Required:** Yes (Customer)

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Reminder fetched successfully",
  "data": {
    "_id": "reminder123",
    "medicines": [
      {
        "_id": "med1",
        "tradeName": "Paracetamol",
        "genericName": "Acetaminophen",
        "strength": "500mg",
        "dosageForm": "Tablet"
      }
    ],
    "patient_id": "customer123",
    "frequency": "daily",
    "timeOfDay": "08:00",
    "notificationMethod": "email",
    "isActive": true,
    "lastNotificationSent": "2025-12-30T08:00:00.000Z",
    "nextNotificationDate": "2025-12-31T08:00:00.000Z",
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-30T10:00:00.000Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "Reminder not found"
}
```

---

### 22. Update Reminder

**Endpoint:** `PUT /api/customer/refill-reminders/:id`
**Auth Required:** Yes (Customer)

**Request Body (all fields optional):**

```json
{
  "medicines": ["medicineId1"],
  "frequency": "weekly",
  "timeOfDay": "18:30",
  "notificationMethod": "sms",
  "isActive": true
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Refill reminder updated successfully",
  "data": {
    "_id": "reminder123",
    "medicines": [
      {
        "_id": "med1",
        "tradeName": "Aspirin",
        "genericName": "Acetylsalicylic Acid",
        "strength": "100mg"
      }
    ],
    "patient_id": "customer123",
    "frequency": "weekly",
    "timeOfDay": "18:30",
    "notificationMethod": "sms",
    "isActive": true,
    "nextNotificationDate": "2026-01-06T18:30:00.000Z",
    "createdAt": "2025-12-29T10:00:00.000Z",
    "updatedAt": "2025-12-30T11:00:00.000Z"
  }
}
```

---

### 23. Mark Reminder as Completed

**Endpoint:** `PATCH /api/customer/refill-reminders/:id/complete`
**Auth Required:** Yes (Customer)

**Request Body:**

```json
{
  "isActive": false
}
```

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Reminder marked as completed",
  "data": {
    "_id": "reminder123",
    "isActive": false,
    "updatedAt": "2025-12-30T11:00:00.000Z"
  }
}
```

---

### 24. Delete Reminder

**Endpoint:** `DELETE /api/customer/refill-reminders/:id`
**Auth Required:** Yes (Customer)

**Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Refill reminder deleted successfully"
}
```

---

## �️ APPOINTMENT REQUEST MANAGEMENT

Base URL: `/api/customer/appointments`

### Overview

The appointment request management system allows customers to:

- Create new appointment requests with doctors
- View all their appointment requests with status
- Check details of specific appointment requests
- Cancel pending appointment requests
- View accepted appointments
- Receive automated email notifications

---

### 📋 Endpoints Summary

| Method | Endpoint                          | Description                 | Auth Required |
| ------ | --------------------------------- | --------------------------- | ------------- |
| POST   | `/requests`                       | Create appointment request  | ✅ Customer   |
| GET    | `/requests`                       | Get my appointment requests | ✅ Customer   |
| GET    | `/requests/:appointmentId`        | Get request status/details  | ✅ Customer   |
| POST   | `/requests/:appointmentId/cancel` | Cancel appointment request  | ✅ Customer   |
| GET    | `/`                               | Get accepted appointments   | ✅ Customer   |

---

### 25. Create Appointment Request

**Endpoint:** `POST /api/customer/appointments/requests`
**Auth Required:** Yes (Customer)

Create a new appointment request with a doctor.

**Request Body:**

```json
{
  "doctor_id": "doc123",
  "slot_id": "slot456",
  "appointment_type": "in-person",
  "consultation_reason": "I have been experiencing chest pain and shortness of breath for the past 2 days. Need urgent consultation.",
  "preferred_date": "2026-01-15",
  "preferred_time": "09:00"
}
```

**Field Descriptions:**

| Field               | Type   | Required | Description                                             |
| ------------------- | ------ | -------- | ------------------------------------------------------- |
| doctor_id           | string | Yes      | Doctor's unique ID                                      |
| slot_id             | string | No       | Specific time slot ID (if available)                    |
| appointment_type    | string | Yes      | Type: 'in-person' or 'online'                           |
| consultation_reason | string | Yes      | Detailed reason (10-500 characters)                     |
| preferred_date      | string | No       | Preferred date (YYYY-MM-DD format, must be future date) |
| preferred_time      | string | No       | Preferred time (HH:mm format, 24-hour)                  |

**Response (201):**

```json
{
  "success": true,
  "message": "Appointment request created successfully",
  "data": {
    "_id": "app123",
    "doctor_id": {
      "_id": "doc123",
      "first_name": "Sarah",
      "last_name": "Ahmed",
      "email": "sarah.ahmed@philbox.com",
      "consultation_fee": 3000,
      "specialization": "Cardiologist"
    },
    "patient_id": "cust123",
    "slot_id": {
      "_id": "slot456",
      "date": "2026-01-15T00:00:00.000Z",
      "start_time": "09:00",
      "end_time": "09:30"
    },
    "appointment_type": "in-person",
    "consultation_reason": "I have been experiencing chest pain and shortness of breath for the past 2 days. Need urgent consultation.",
    "preferred_date": "2026-01-15T00:00:00.000Z",
    "preferred_time": "09:00",
    "appointment_request": "processing",
    "status": "pending",
    "created_at": "2026-01-10T10:30:00.000Z",
    "updated_at": "2026-01-10T10:30:00.000Z"
  }
}
```

**Error Responses:**

**404 Not Found - Doctor Not Active**

```json
{
  "success": false,
  "message": "Doctor not found or inactive"
}
```

**400 Bad Request - Slot Not Available**

```json
{
  "success": false,
  "message": "Selected time slot is not available"
}
```

**Email Notifications:**

- Customer receives confirmation email with request details
- Doctor receives notification email about new request

---

### 26. Get My Appointment Requests

**Endpoint:** `GET /api/customer/appointments/requests`
**Auth Required:** Yes (Customer)

Retrieve all your appointment requests with pagination and filtering.

**Query Parameters:**

| Parameter        | Type   | Default      | Description                           |
| ---------------- | ------ | ------------ | ------------------------------------- |
| page             | number | 1            | Page number                           |
| limit            | number | 10           | Items per page (max 100)              |
| status           | string | 'processing' | Filter: processing/accepted/cancelled |
| appointment_type | string | -            | Filter by type: in-person/online      |
| sort_by          | string | 'created_at' | Sort field                            |
| sort_order       | string | 'desc'       | Sort order: asc/desc                  |

**Response (200):**

```json
{
  "success": true,
  "message": "Appointment requests retrieved successfully",
  "data": {
    "appointments": [
      {
        "_id": "app123",
        "doctor_id": {
          "_id": "doc123",
          "first_name": "Sarah",
          "last_name": "Ahmed",
          "email": "sarah.ahmed@philbox.com",
          "consultation_fee": 3000,
          "specialization": "Cardiologist",
          "profile_picture": "https://cloudinary.com/..."
        },
        "patient_id": "cust123",
        "slot_id": {
          "_id": "slot456",
          "date": "2026-01-15T00:00:00.000Z",
          "start_time": "09:00",
          "end_time": "09:30"
        },
        "appointment_type": "in-person",
        "consultation_reason": "Experiencing chest pain",
        "appointment_request": "processing",
        "status": "pending",
        "created_at": "2026-01-10T10:30:00.000Z",
        "updated_at": "2026-01-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### 27. Get Appointment Request Details

**Endpoint:** `GET /api/customer/appointments/requests/:appointmentId`
**Auth Required:** Yes (Customer)

Get detailed information about a specific appointment request.

**Response (200):**

```json
{
  "success": true,
  "message": "Appointment request details retrieved successfully",
  "data": {
    "_id": "app123",
    "doctor_id": {
      "_id": "doc123",
      "first_name": "Sarah",
      "last_name": "Ahmed",
      "email": "sarah.ahmed@philbox.com",
      "consultation_fee": 3000,
      "specialization": "Cardiologist",
      "profile_picture": "https://cloudinary.com/..."
    },
    "patient_id": "cust123",
    "slot_id": {
      "_id": "slot456",
      "date": "2026-01-15T00:00:00.000Z",
      "start_time": "09:00",
      "end_time": "09:30"
    },
    "appointment_type": "in-person",
    "consultation_reason": "Experiencing chest pain and shortness of breath",
    "preferred_date": "2026-01-15T00:00:00.000Z",
    "preferred_time": "09:00",
    "appointment_request": "processing",
    "status": "pending",
    "notes": "Please bring previous medical reports",
    "rejection_reason": null,
    "created_at": "2026-01-10T10:30:00.000Z",
    "updated_at": "2026-01-10T10:30:00.000Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "Appointment request not found"
}
```

---

### 28. Cancel Appointment Request

**Endpoint:** `POST /api/customer/appointments/requests/:appointmentId/cancel`
**Auth Required:** Yes (Customer)

Cancel a pending appointment request.

**Request Body:**

```json
{
  "cancellation_reason": "Found another doctor with earlier availability"
}
```

**Field Descriptions:**

| Field               | Type   | Required | Description                      |
| ------------------- | ------ | -------- | -------------------------------- |
| cancellation_reason | string | No       | Optional reason for cancellation |

**Response (200):**

```json
{
  "success": true,
  "message": "Appointment request cancelled successfully",
  "data": {
    "_id": "app123",
    "doctor_id": {
      "_id": "doc123",
      "first_name": "Sarah",
      "last_name": "Ahmed",
      "email": "sarah.ahmed@philbox.com"
    },
    "patient_id": {
      "_id": "cust123",
      "first_name": "John",
      "last_name": "Doe"
    },
    "appointment_request": "cancelled",
    "cancellation_reason": "Found another doctor with earlier availability",
    "updated_at": "2026-01-11T10:00:00.000Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "Appointment request not found or already processed"
}
```

---

### 29. Get Accepted Appointments

**Endpoint:** `GET /api/customer/appointments`
**Auth Required:** Yes (Customer)

Retrieve all your accepted appointments (confirmed consultations).

**Query Parameters:**

| Parameter        | Type   | Default      | Description                                  |
| ---------------- | ------ | ------------ | -------------------------------------------- |
| page             | number | 1            | Page number                                  |
| limit            | number | 10           | Items per page (max 100)                     |
| status           | string | 'pending'    | Filter: pending/completed/missed/in-progress |
| appointment_type | string | -            | Filter by type: in-person/online             |
| sort_by          | string | 'created_at' | Sort field                                   |
| sort_order       | string | 'desc'       | Sort order: asc/desc                         |

**Response (200):**

```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": {
    "appointments": [
      {
        "_id": "app123",
        "doctor_id": {
          "_id": "doc123",
          "first_name": "Sarah",
          "last_name": "Ahmed",
          "email": "sarah.ahmed@philbox.com",
          "consultation_fee": 3000,
          "specialization": "Cardiologist",
          "profile_picture": "https://cloudinary.com/..."
        },
        "patient_id": "cust123",
        "slot_id": {
          "_id": "slot456",
          "date": "2026-01-15T00:00:00.000Z",
          "start_time": "09:00",
          "end_time": "09:30"
        },
        "appointment_type": "in-person",
        "consultation_reason": "Regular checkup for diabetes management",
        "appointment_request": "accepted",
        "status": "pending",
        "notes": "Please bring glucose monitor readings",
        "created_at": "2026-01-10T10:30:00.000Z",
        "updated_at": "2026-01-11T14:20:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 28,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

### 📌 Important Notes for Appointments

1. **Consultation Reason**: Must be between 10-500 characters, provide detailed information
2. **Preferred Date**: Must be a future date, cannot book appointments in the past
3. **Slot Booking**: If slot_id provided, it will be validated for availability
4. **Email Notifications**:
   - Request submitted: Confirmation to customer + notification to doctor
   - Request accepted: Confirmation email with appointment details
   - Request rejected: Email with rejection reason and suggestions
5. **Cancellation**: Only processing requests can be cancelled
6. **Activity Logging**: All actions are logged for audit purposes
7. **Request Status**:
   - `processing`: Waiting for doctor's response
   - `accepted`: Doctor confirmed the appointment
   - `cancelled`: Rejected by doctor or cancelled by customer

---

## �📋 VALIDATION RULES

### Register

- `fullName`: Required, 3-50 characters
- `email`: Required, valid email format
- `password`: Required, alphanumeric 3-30 characters (letters and numbers only)
- `contactNumber`: Optional, 10-15 digits, numeric only (pattern: /^[0-9]+$/)
- `gender`: Optional, "Male" or "Female"
- `dateOfBirth`: Optional, valid date

### Update Profile

- `fullName`: Optional, min 3 characters, max 50 characters
- `contactNumber`: Optional, 10-15 digits, numeric only (pattern: /^[0-9]+$/)
- `gender`: Optional, "Male" or "Female"
- `dateOfBirth`: Optional, valid date
- `street`: Optional, string
- `town`: Optional, string
- `city`: Optional, string
- `province`: Optional, string
- `zip_code`: Optional, string
- `country`: Optional, string
- `google_map_link`: Optional, valid URI

### Change Password

- `currentPassword`: Required
- `newPassword`: Required, min 6 characters
- `confirmPassword`: Required, must match newPassword

### Save Search Query

- `query`: Required, min 1 character, trimmed
- `filters`: Optional object
  - `category`: Optional, string
  - `brand`: Optional, string
  - `dosageForm`: Optional, string
  - `prescriptionRequired`: Optional, boolean

### Refill Reminders

**Create Reminder:**

- `medicines`: Required, array of valid medicine IDs (minimum 1 medicine)
- `frequency`: Required, must be one of: "daily", "weekly", "monthly"
- `timeOfDay`: Required, 24-hour format HH:MM (e.g., "08:00", "18:30")
- `notificationMethod`: Required, must be one of: "email", "sms", "push"

**Update Reminder:**

- All fields optional
- `medicines`: Array of valid medicine IDs
- `frequency`: Must be one of: "daily", "weekly", "monthly"
- `timeOfDay`: 24-hour format HH:MM
- `notificationMethod`: Must be one of: "email", "sms", "push"
- `isActive`: Boolean

**Mark as Completed:**

- `isActive`: Required, must be false

### Image Upload

- File types: JPEG, JPG, PNG, WEBP only
- Single file per request

---

## ❌ ERROR RESPONSES

### Authentication Errors (401)

```json
{
  "success": false,
  "status": 401,
  "message": "No session, authorization denied",
  "data": null
}
```

### Validation Errors (400)

```json
{
  "success": false,
  "status": 400,
  "message": "Validation error message",
  "data": null
}
```

### Not Found (404)

```json
{
  "success": false,
  "status": 404,
  "message": "User not found",
  "data": null
}
```

### Conflict (409)

```json
{
  "success": false,
  "status": 409,
  "message": "Email already exists",
  "data": null
}
```

### Forbidden (403)

```json
{
  "success": false,
  "status": 403,
  "message": "Your account has been blocked or suspended",
  "data": null
}
```

### Server Error (500)

```json
{
  "success": false,
  "status": 500,
  "message": "Server Error",
  "data": null,
  "error": "Detailed error message"
}
```

---

## 🧪 TESTING GUIDE

### 1. Complete Flow Test

```bash
# 1. Register
POST /api/customer/auth/register
Body: { "fullName": "Test User", "email": "test@example.com", "password": "test123" }

# 2. Verify Email (use token from email)
POST /api/customer/auth/verify-email
Body: { "token": "verification-token" }

# 3. Login
POST /api/customer/auth/login
Body: { "email": "test@example.com", "password": "test123" }

# 4. Get Profile
GET /api/customer/profile

# 5. Update Profile
PUT /api/customer/profile
Body: { "fullName": "Updated Name", "city": "New York" }

# 6. Upload Profile Picture
PUT /api/customer/profile/picture
Form-data: profile_img = [file]

# 7. Upload Cover Image
PUT /api/customer/profile/cover
Form-data: cover_img = [file]

# 8. Change Password
PUT /api/customer/profile/password
Body: { "currentPassword": "test123", "newPassword": "newpass456", "confirmPassword": "newpass456" }

# 9. Get Dashboard
GET /api/customer/dashboard

# 10. Save Search Query
POST /api/customer/search-history
Body: { "query": "Paracetamol", "filters": { "category": "Pain Relief" } }

# 11. Get Search History
GET /api/customer/search-history

# 12. Delete Search History Item
DELETE /api/customer/search-history/search_id_123

# 13. Clear All Search History
DELETE /api/customer/search-history/clear/all

# 14. Logout
POST /api/customer/auth/logout
```

---

## 🔒 AUTHENTICATION

All endpoints marked with "Auth Required: Yes" need a valid session cookie.

**Session Cookie:** `connect.sid=<session-cookie-value>`

The session is created automatically on login and destroyed on logout.

**In Postman/Thunder Client:**

- After login, the session cookie is automatically saved
- It will be sent with subsequent requests
- Ensure "Send cookies" option is enabled

---

## 📌 NOTES

1. **Image Upload:** Images are uploaded to Cloudinary. Old local temporary files are auto-deleted.

2. **Address Management:**
   - If customer has no address, a new one is created
   - If customer has address, it's updated with new values

3. **OAuth Users:**
   - OAuth users may not have passwords initially
   - They need to set a password before using change password feature

4. **Activity Logging:**
   - All operations are logged for audit purposes
   - Logs include: register, login, logout, update_profile, change_password, search_medicine, view_search_history, delete_search_history, clear_search_history, etc.

5. **Search History:**
   - Stores last 20 searches per customer
   - Prevents duplicate entries within 5 minutes (updates timestamp instead)
   - Can be cleared individually or all at once
   - Includes optional filters (category, brand, dosageForm, prescriptionRequired)

6. **Account Status:**
   - Active accounts can access all features
   - Blocked/suspended accounts are denied access

7. **Email Verification:**
   - Required before login
   - Token expires after 24 hours

8. **Password Reset:**
   - Token expires after 10 minutes
   - One-time use only

---

## 🚀 QUICK START

1. Start server: `npm run dev`
2. Server runs on: `http://localhost:5000`
3. Use Postman/Thunder Client for testing
4. Enable cookies in your HTTP client
5. Follow the complete flow test above

---

## 📞 SUPPORT

For issues:

1. Check error response messages
2. Verify session cookies are sent
3. Check server console for detailed errors
4. Ensure MongoDB and Cloudinary are configured
