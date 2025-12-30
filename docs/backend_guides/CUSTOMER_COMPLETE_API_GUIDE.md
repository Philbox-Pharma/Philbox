# Customer Complete API Guide

**Base URL:** `http://localhost:5000/api`

---

## 🔐 AUTHENTICATION ENDPOINTS

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
