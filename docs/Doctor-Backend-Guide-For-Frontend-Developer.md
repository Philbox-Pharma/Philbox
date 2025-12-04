# Doctor Backend Integration Documentation

This documentation details the API endpoints, request formats, and response structures based on the provided backend code.

## 🌍 Base Configuration

- **Base URL:** `https://localhost:5000/api/doctor/auth`
- **Authentication Method:** Session-based (Cookies).
- **CORS/cookies:** All requests **must** include credentials to persist the session.
  - **Axios:** `withCredentials: true`
  - **Fetch:** `credentials: 'include'`

---

## 🧭 Navigation Logic (`nextStep`)

Most authentication responses return a `nextStep` field. The Frontend **must** route the user based on this value:

| `nextStep` Value       | Action / Redirect                                                |
| :--------------------- | :--------------------------------------------------------------- |
| `verify-email`         | Redirect to **Email Verification Page**.                         |
| `submit-application`   | Redirect to **Onboarding Step 1** (Document Upload).             |
| `waiting-approval`     | Redirect to **Status Page** (Message: "Documents under review"). |
| `resubmit-application` | Redirect to **Onboarding Step 1** (Previous docs rejected).      |
| `complete-profile`     | Redirect to **Onboarding Step 2** (Details & Education).         |
| `dashboard`            | Redirect to **Doctor Dashboard** (Login complete).               |
| `login`                | Redirect to **Login Page**.                                      |
| `check-email`          | Show message: "Check your email for the reset link".             |

---

## 🔐 Authentication Endpoints

### 1. Register

- **Page:** Registration Page
- **Method:** `POST`
- **Endpoint:** `/register`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "gender": "Male",
  "dateOfBirth": "1990-05-20",
  "contactNumber": "+1234567890"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "nextStep": "verify-email"
  }
}
```

**Error Responses:**

- **409 Conflict:** `{"success": false, "statusCode": 409, "message": "Email already exists"}`
- **500 Server Error:** `{"success": false, "statusCode": 500, "message": "Server Error", ...}`

---

### 2. Verify Email

- **Page:** Verify Email Page (Link from email: `/verify-email/:token`)
- **Method:** `POST`
- **Endpoint:** `/verify-email`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "token": "38475928347592834..." // Extracted from URL parameter
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "nextStep": "login"
  }
}
```

**Error Responses:**

- **400 Bad Request:** `{"message": "Invalid or expired verification token"}`

---

### 3. Login

- **Page:** Login Page
- **Method:** `POST`
- **Endpoint:** `/login`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "doctor": {
      "_id": "...",
      "email": "...",
      "fullName": "..."
    },
    "accountStatus": "active", // or 'suspended/freezed'
    "nextStep": "dashboard" // OR 'submit-application', 'waiting-approval', etc.
  }
}
```

**Error Responses:**

- **401 Unauthorized:** `{"message": "Invalid Credentials"}`
- **403 Forbidden:** `{"message": "Please verify your email first"}`
- **403 Forbidden:** `{"message": "Your account has been blocked"}`

---

### 4. Logout

- **Page:** Dashboard / Navbar
- **Method:** `POST`
- **Endpoint:** `/logout`
- **Headers:** Cookie required.

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful",
  "data": {
    "nextStep": "login"
  }
}
```

---

## 🚀 Google OAuth

### 1. Initiate Login

- **Method:** `GET`
- **Endpoint:** `/google`
- **Action:** Redirect the browser window to this URL.

### 2. Callback (Handled by Backend)

The backend handles the callback. Based on success or failure, it will **redirect** the browser to the Frontend URL (defined in `process.env.FRONTEND_URL`).

**Success Redirect:**
`[FRONTEND_URL]/auth/oauth/success?nextStep=dashboard&isNewUser=false`

**Error Redirect:**
`[FRONTEND_URL]/auth/oauth/error?message=ErrorDescription`

---

## 📄 Onboarding Flows

### 1. Submit Application (Step 1)

- **Condition:** User lands here if `nextStep` is `submit-application` or `resubmit-application`.
- **Method:** `POST`
- **Endpoint:** `/submit-application`
- **Content-Type:** `multipart/form-data`
- **Headers:** Cookie required.

**Request Body (FormData):**

- `cnic`: File (Required, Max 1)
- `medical_license`: File (Required, Max 1)
- `mbbs_md_degree`: File (Required, Max 1)
- `specialist_license`: File (Optional, Max 1)
- `experience_letters`: File (Optional, Max 1)

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application submitted successfully. Please wait for admin approval.",
  "data": {
    "success": true,
    "message": "...",
    "documentId": "...",
    "nextStep": "waiting-approval"
  }
}
```

**Error Responses:**

- **401 Unauthorized:** `{"message": "Unauthorized", "details": "Doctor authentication required"}`
- **400 Bad Request:** `{"message": "No files uploaded..."}`
- **400 Missing Files:**
  ```json
  {
    "message": "Missing Required Documents",
    "data": { "missingFiles": ["CNIC", "MEDICAL LICENSE"] }
  }
  ```
- **400 Already Submitted:** `{"message": "Application Already Submitted"}`

---

### 2. Complete Profile (Step 2)

- **Condition:** User lands here if `nextStep` is `complete-profile` (Admin approved docs).
- **Method:** `POST`
- **Endpoint:** `/complete-profile`
- **Content-Type:** `multipart/form-data`
- **Headers:** Cookie required.

**Request Body (FormData):**

**⚠️ IMPORTANT:** The backend parses `educational_details`, `specialization`, and `experience_details` using `JSON.parse()`. You must **JSON.stringify** these arrays before appending them to FormData.

- **Text/Data Fields:**
  - `educational_details`: Stringified Array of objects.
  - `specialization`: Stringified Array.
  - `experience_details`: Stringified Array of objects.
  - `license_number`: String
  - `affiliated_hospital`: String
  - `consultation_type`: String
  - `consultation_fee`: String/Number
  - `onlineProfileURL`: String
- **File Fields:**
  - `profile_img`: File (Max 1)
  - `cover_img`: File (Max 1)
  - `digital_signature`: File (Max 1)
  - `education_files`: Files (Max 5, Multiple) - Corresponds to education array order.
  - `experience_files`: Files (Max 10, Multiple) - Corresponds to experience array order.

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile completed successfully. Welcome to PhilBox!",
  "data": {
    "success": true,
    "nextStep": "dashboard"
  }
}
```

**Error Responses:**

- **403 Forbidden:** `{"message": "Application Not Approved"}` (If user tries to skip Step 1 or Admin hasn't approved yet).
- **400 Bad Request:** `{"message": "Profile Already Completed"}`.
- **400 Validation:** `{"message": "Validation Failed"}` (Joi validation errors).

---

## 🔑 Password Management

### 1. Forget Password

- **Page:** Forgot Password Page
- **Method:** `POST`
- **Endpoint:** `/forget-password`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "check-email"
  }
}
```

**Error Responses:**

- **404 Not Found:** `{"message": "User not found"}`

---

### 2. Reset Password

- **Page:** Reset Password Page (Link from email: `/reset-password/:token`)
- **Method:** `POST`
- **Endpoint:** `/reset-password`
- **Content-Type:** `application/json`

**Request Body:**

```json
{
  "token": "token_from_url",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "login"
  }
}
```

**Error Responses:**

- **400 Bad Request:** `{"message": "Invalid token"}` (Token expired or incorrect).
