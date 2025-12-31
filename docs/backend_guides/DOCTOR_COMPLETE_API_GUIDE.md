# Doctor Complete API Guide

**Base URLs:**

- **Authentication:** `http://localhost:5000/api/doctor/auth`
- **Onboarding:** `http://localhost:5000/api/doctor/onboarding`

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Complete Registration Flow](#complete-registration-flow)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Onboarding Endpoints](#onboarding-endpoints)
5. [File Upload Requirements](#file-upload-requirements)
6. [Validation Rules](#validation-rules)
7. [Error Responses](#error-responses)
8. [Application Status Reference](#application-status-reference)
9. [Testing Guide](#testing-guide)

---

## 🎯 Overview

The PhilBox doctor system consists of two main modules:

### 1. Authentication Module (`/api/doctor/auth`)

Handles account creation, login, email verification, and password management.

### 2. Onboarding Module (`/api/doctor/onboarding`)

Manages document submission, application status tracking, and profile completion.

### Complete Journey:

```
Register → Verify Email → Login → Submit Documents →
Check Status → Wait for Approval → Complete Profile → Start Practice
```

---

## 🔄 Complete Registration Flow

```
┌─────────────────────┐
│  1. Register        │ POST /auth/register
│  (Basic Info)       │ → Email verification sent
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  2. Verify Email    │ POST /auth/verify-email
│  (Confirm Email)    │ → Account activated
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  3. Login           │ POST /auth/login
│  (Access Account)   │ → Session created
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│  4. Submit Application      │ POST /onboarding/submit-application
│  (Upload Documents)         │ → CNIC, License, Degree
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  5. Check Status           │ GET /onboarding/application-status
│  (Monitor Progress)        │ → Pending/Processing/Approved/Rejected
└──────┬─────────────────────┘
       │
       ├─→ If Rejected → Re-submit Documents
       │
       ▼ If Approved
┌─────────────────────────────┐
│  6. Complete Profile        │ POST /onboarding/complete-profile
│  (Education, Experience)    │ → Education, Specialization, Fee
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────┐
│  7. Dashboard       │
│  (Start Practice)   │ → Account Status: Active
└─────────────────────┘
```

---

## 🔐 Authentication Endpoints

### 1. Register Doctor

**Endpoint:** `POST /api/doctor/auth/register`
**Authentication:** Not Required
**Rate Limited:** Yes (5 requests/15 minutes)

**Request Body:**

```json
{
  "fullName": "Dr. Sarah Ahmed",
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123!",
  "contactNumber": "+923001234567",
  "gender": "Female",
  "dateOfBirth": "1988-05-15"
}
```

**Validation Rules:**

- `fullName`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `contactNumber`: Required, Pakistani format (+92...)
- `gender`: Required, "Male" or "Female"
- `dateOfBirth`: Required, must be in the past

**Success Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "nextStep": "verify-email"
  }
}
```

**Email Sent:**

- Verification link valid for 24 hours
- Format: `{FRONTEND_URL}/doctor/auth/verify-email/{token}`

---

### 2. Verify Email

**Endpoint:** `POST /api/doctor/auth/verify-email`
**Authentication:** Not Required
**Rate Limited:** Yes

**Request Body:**

```json
{
  "token": "abc123def456..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "nextStep": "login"
  }
}
```

**Error Responses:**

- `400` - Invalid or expired verification token

---

### 3. Login

**Endpoint:** `POST /api/doctor/auth/login`
**Authentication:** Not Required
**Rate Limited:** Yes

**Request Body:**

```json
{
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "doctor": {
      "_id": "doc123",
      "fullName": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "account_status": "suspended/freezed",
      "onboarding_status": "pending",
      "is_Verified": true,
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Dr.%20Sarah%20Ahmed",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Dr.%20Sarah%20Ahmed",
      "gender": "Female",
      "dateOfBirth": "1988-05-15T00:00:00.000Z",
      "contactNumber": "+923001234567"
    },
    "accountStatus": "suspended/freezed",
    "nextStep": "submit-application"
  }
}
```

**Session Created:**

- `req.session.doctorId`: Doctor ID
- `req.session.role`: "doctor"
- `req.session.status`: Account status

**Error Responses:**

- `401` - Invalid credentials
- `403` - Email not verified / Account blocked

---

### 4. Google OAuth Login

**Endpoint:** `GET /api/doctor/auth/google`
**Authentication:** Not Required
**Rate Limited:** Yes

Redirects to Google OAuth consent screen.

**Callback:** `GET /api/doctor/auth/google/callback`

---

### 5. Forget Password

**Endpoint:** `POST /api/doctor/auth/forget-password`
**Authentication:** Not Required
**Rate Limited:** Yes

**Request Body:**

```json
{
  "email": "sarah.ahmed@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "check-email"
  }
}
```

**Email Sent:**

- Reset link valid for 10 minutes
- Format: `{FRONTEND_URL}/doctor/auth/reset-password/{token}`

---

### 6. Reset Password

**Endpoint:** `POST /api/doctor/auth/reset-password`
**Authentication:** Not Required
**Rate Limited:** Yes

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "login"
  }
}
```

---

### 7. Get Current Doctor

**Endpoint:** `GET /api/doctor/auth/me`
**Authentication:** Required
**Rate Limited:** No

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Current doctor fetched",
  "data": {
    "_id": "doc123",
    "fullName": "Dr. Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "account_status": "active",
    "onboarding_status": "completed",
    "is_Verified": true
  }
}
```

---

### 8. Logout

**Endpoint:** `POST /api/doctor/auth/logout`
**Authentication:** Required
**Rate Limited:** No

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Logout successful",
  "data": {
    "nextStep": "login"
  }
}
```

---

## 📋 Onboarding Endpoints

### 1. Submit Application (Upload Documents)

**Endpoint:** `POST /api/doctor/onboarding/submit-application`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Required Files:**

- `cnic` - CNIC image (front/back)
- `medical_license` - Medical license certificate
- `mbbs_md_degree` - MBBS/MD degree certificate

**Optional Files:**

- `specialist_license` - Specialist certification
- `experience_letters` - Experience/employment letters

**Request (multipart/form-data):**

```javascript
const formData = new FormData();
formData.append("cnic", cnicFile);
formData.append("medical_license", licenseFile);
formData.append("mbbs_md_degree", degreeFile);
formData.append("specialist_license", specialistFile); // optional
formData.append("experience_letters", experienceFile); // optional

await fetch("/api/doctor/onboarding/submit-application", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Application submitted successfully. Please wait for admin approval.",
  "data": {
    "success": true,
    "message": "Application submitted successfully. Please wait for admin approval.",
    "documentId": "doc123",
    "nextStep": "waiting-approval"
  }
}
```

**Doctor Status Updated:**

- `account_status`: "suspended/freezed"
- `onboarding_status`: "documents-submitted"

**Error Responses:**

- `400` - Missing required documents
- `400` - Application already submitted (pending review)
- `401` - Unauthorized (not logged in)
- `500` - File upload failed

---

### 2. Get Application Status

**Endpoint:** `GET /api/doctor/onboarding/application-status`
**Authentication:** Required

**Success Response - Not Submitted (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Application status fetched successfully",
  "data": {
    "status": "not_submitted",
    "message": "No application submitted yet",
    "nextStep": "submit-application",
    "doctor": {
      "fullName": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "account_status": "suspended/freezed",
      "is_Verified": true
    }
  }
}
```

**Success Response - Pending (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Application status fetched successfully",
  "data": {
    "status": "pending",
    "message": "Your application is pending review. We will notify you once an admin reviews your documents.",
    "nextStep": "waiting-approval",
    "application": {
      "status": "pending",
      "admin_comment": null,
      "reviewed_at": null,
      "reviewed_by": null,
      "submitted_at": "2025-12-31T10:00:00.000Z"
    },
    "doctor": {
      "fullName": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "account_status": "suspended/freezed",
      "onboarding_status": "documents-submitted",
      "is_Verified": true
    }
  }
}
```

**Success Response - Approved (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Application status fetched successfully",
  "data": {
    "status": "approved",
    "message": "Congratulations! Your application has been approved. You can now complete your profile.",
    "nextStep": "complete-profile",
    "application": {
      "status": "approved",
      "admin_comment": "All credentials verified successfully.",
      "reviewed_at": "2025-12-31T15:00:00.000Z",
      "reviewed_by": {
        "_id": "admin123",
        "name": "Admin User",
        "email": "admin@philbox.com"
      },
      "submitted_at": "2025-12-31T10:00:00.000Z"
    },
    "doctor": {
      "fullName": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "account_status": "active",
      "onboarding_status": "documents-approved",
      "is_Verified": true
    }
  }
}
```

**Success Response - Rejected (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Application status fetched successfully",
  "data": {
    "status": "rejected",
    "message": "Your application has been rejected. Please review the admin comments and resubmit with correct documents.",
    "nextStep": "resubmit-application",
    "application": {
      "status": "rejected",
      "admin_comment": "Medical license is not clear. Please upload a high-quality scan.",
      "reviewed_at": "2025-12-31T12:00:00.000Z",
      "reviewed_by": {
        "_id": "admin123",
        "name": "Admin User",
        "email": "admin@philbox.com"
      },
      "submitted_at": "2025-12-31T10:00:00.000Z"
    },
    "doctor": {
      "fullName": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "account_status": "suspended/freezed",
      "onboarding_status": "documents-rejected",
      "is_Verified": true
    }
  }
}
```

---

### 3. Complete Profile

**Endpoint:** `POST /api/doctor/onboarding/complete-profile`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Prerequisites:** Application must be approved

**Request Body (multipart/form-data):**

```javascript
const formData = new FormData();

// Educational Details (JSON string)
formData.append(
  "educational_details",
  JSON.stringify([
    {
      degree: "MBBS",
      institution: "Aga Khan University",
      yearOfCompletion: 2012,
      specialization: "General Medicine",
    },
    {
      degree: "MD (Cardiology)",
      institution: "Harvard Medical School",
      yearOfCompletion: 2017,
      specialization: "Cardiology",
    },
  ]),
);

// Specialization (JSON array as string)
formData.append(
  "specialization",
  JSON.stringify(["Cardiologist", "Internal Medicine"]),
);

// Experience Details (JSON string)
formData.append(
  "experience_details",
  JSON.stringify([
    {
      institution: "Aga Khan Hospital",
      starting_date: "2017-06-01",
      ending_date: "2022-12-31",
      is_going_on: false,
    },
    {
      institution: "Liaquat National Hospital",
      starting_date: "2023-01-01",
      is_going_on: true,
    },
  ]),
);

// Professional Details
formData.append("license_number", "PMC-12345");
formData.append("affiliated_hospital", "Aga Khan Hospital");
formData.append("consultation_type", "both"); // 'online', 'in-person', 'both'
formData.append("consultation_fee", "3000");
formData.append("onlineProfileURL", "https://linkedin.com/in/drsarah");

// Optional Files
formData.append("education_files", educationFile1); // up to 5 files
formData.append("education_files", educationFile2);
formData.append("experience_files", experienceFile1); // up to 10 files
formData.append("digital_signature", signatureFile);
formData.append("profile_img", profileImageFile);
formData.append("cover_img", coverImageFile);
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile completed successfully. Welcome to PhilBox!",
  "data": {
    "success": true,
    "message": "Profile completed successfully. Welcome to PhilBox!",
    "nextStep": "dashboard"
  }
}
```

**Doctor Status Updated:**

- `account_status`: "active"
- `onboarding_status`: "completed"

**Error Responses:**

- `401` - Unauthorized
- `403` - Application not approved yet
- `400` - Validation failed
- `500` - File upload failed

---

## 📂 File Upload Requirements

### Document Uploads (Submit Application)

| Field                | Required    | Format        | Max Size | Description                   |
| -------------------- | ----------- | ------------- | -------- | ----------------------------- |
| `cnic`               | ✅ Yes      | JPG, PNG, PDF | 5MB      | National Identity Card (CNIC) |
| `medical_license`    | ✅ Yes      | JPG, PNG, PDF | 5MB      | PMC Registration Certificate  |
| `mbbs_md_degree`     | ✅ Yes      | JPG, PNG, PDF | 5MB      | Medical Degree Certificate    |
| `specialist_license` | ⚠️ Optional | JPG, PNG, PDF | 5MB      | Specialist Certification      |
| `experience_letters` | ⚠️ Optional | JPG, PNG, PDF | 5MB      | Employment/Experience Letters |

### Profile Files (Complete Profile)

| Field               | Required    | Format         | Max Size | Count    |
| ------------------- | ----------- | -------------- | -------- | -------- |
| `education_files`   | ⚠️ Optional | JPG, PNG, PDF  | 5MB each | Up to 5  |
| `experience_files`  | ⚠️ Optional | JPG, PNG, PDF  | 5MB each | Up to 10 |
| `digital_signature` | ⚠️ Optional | JPG, PNG       | 2MB      | 1        |
| `profile_img`       | ⚠️ Optional | JPG, PNG, WEBP | 2MB      | 1        |
| `cover_img`         | ⚠️ Optional | JPG, PNG, WEBP | 5MB      | 1        |

**File Storage:**

- All files uploaded to Cloudinary
- Automatic compression and optimization
- Secure URLs returned

---

## 📋 Validation Rules

### Registration

- `fullName`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `contactNumber`: Required, Pakistani format (+923001234567)
- `gender`: Required, "Male" or "Female"
- `dateOfBirth`: Required, must be in the past, doctor must be at least 18 years old

### Complete Profile

**Educational Details** (Array of Objects):

- `degree`: Required, string
- `institution`: Required, string
- `yearOfCompletion`: Required, number (1950 - current year)
- `specialization`: Optional, string

**Specialization**: Array of strings (at least 1)

**Experience Details** (Array of Objects):

- `institution`: Required, string
- `starting_date`: Required, ISO date string
- `ending_date`: Optional, ISO date string (required if not ongoing)
- `is_going_on`: Required, boolean

**Professional Details**:

- `license_number`: Required, string (e.g., "PMC-12345")
- `affiliated_hospital`: Optional, string
- `consultation_type`: Required, "online", "in-person", or "both"
- `consultation_fee`: Required, positive number
- `onlineProfileURL`: Optional, valid URL

---

## ❌ Error Responses

### Common Error Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "data": null,
  "error": "Detailed error description"
}
```

### Registration Errors

**Email Already Exists (409):**

```json
{
  "success": false,
  "status": 409,
  "message": "Email already exists"
}
```

### Authentication Errors

**Unauthorized (401):**

```json
{
  "success": false,
  "status": 401,
  "message": "Unauthorized",
  "error": "Doctor authentication required"
}
```

**Invalid Credentials (401):**

```json
{
  "success": false,
  "status": 401,
  "message": "Invalid Credentials"
}
```

**Email Not Verified (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Please verify your email first"
}
```

**Account Blocked (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Your account has been blocked"
}
```

### Application Errors

**Missing Required Documents (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Missing Required Documents",
  "data": {
    "missingFiles": ["CNIC", "MEDICAL LICENSE"]
  },
  "error": "Please upload the following required documents: CNIC, MEDICAL LICENSE"
}
```

**Application Already Submitted (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Application Already Submitted",
  "error": "Your documents are already pending review. Please wait for admin approval."
}
```

**Application Not Approved (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Application Not Approved",
  "error": "Your document verification is still pending. Please wait for admin approval before completing your profile."
}
```

**File Upload Failed (500):**

```json
{
  "success": false,
  "status": 500,
  "message": "File Upload Failed",
  "error": "There was an error uploading your documents. Please try again."
}
```

---

## 🎯 Application Status Reference

### Status Values

| Status          | Description                                | Next Step              | Account Status    |
| --------------- | ------------------------------------------ | ---------------------- | ----------------- |
| `not_submitted` | No documents uploaded yet                  | `submit-application`   | suspended/freezed |
| `pending`       | Documents submitted, awaiting admin review | `waiting-approval`     | suspended/freezed |
| `processing`    | Admin is actively reviewing documents      | `waiting-approval`     | suspended/freezed |
| `approved`      | Documents verified successfully            | `complete-profile`     | active            |
| `rejected`      | Documents rejected by admin                | `resubmit-application` | suspended/freezed |

### Onboarding Status Values

| Status                | Description                                |
| --------------------- | ------------------------------------------ |
| `pending`             | Just registered, no documents submitted    |
| `documents-submitted` | Application submitted, awaiting review     |
| `documents-approved`  | Application approved by admin              |
| `documents-rejected`  | Application rejected by admin              |
| `completed`           | Profile fully completed, ready to practice |

### Account Status Values

| Status              | Description                            | Can Login? |
| ------------------- | -------------------------------------- | ---------- |
| `suspended/freezed` | Temporary suspension during onboarding | ✅ Yes     |
| `active`            | Fully active, can offer consultations  | ✅ Yes     |
| `blocked/removed`   | Account permanently blocked            | ❌ No      |

---

## 🧪 Testing Guide

### Complete Registration Flow Test

**Step 1: Register**

```bash
curl -X POST http://localhost:5000/api/doctor/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Test Doctor",
    "email": "test.doctor@example.com",
    "password": "TestPass123",
    "contactNumber": "+923001234567",
    "gender": "Male",
    "dateOfBirth": "1985-06-15"
  }'
```

**Step 2: Verify Email**

```bash
# Check email for verification link
curl -X POST http://localhost:5000/api/doctor/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_verification_token_here"
  }'
```

**Step 3: Login**

```bash
curl -X POST http://localhost:5000/api/doctor/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.doctor@example.com",
    "password": "TestPass123"
  }' \
  -c cookies.txt
```

**Step 4: Submit Application**

```bash
curl -X POST http://localhost:5000/api/doctor/onboarding/submit-application \
  -H "Cookie: $(cat cookies.txt)" \
  -F "cnic=@/path/to/cnic.jpg" \
  -F "medical_license=@/path/to/license.jpg" \
  -F "mbbs_md_degree=@/path/to/degree.jpg"
```

**Step 5: Check Application Status**

```bash
curl -X GET http://localhost:5000/api/doctor/onboarding/application-status \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 6: Complete Profile (After Admin Approval)**

```bash
curl -X POST http://localhost:5000/api/doctor/onboarding/complete-profile \
  -H "Cookie: $(cat cookies.txt)" \
  -F 'educational_details=[{"degree":"MBBS","institution":"AKU","yearOfCompletion":2012,"specialization":"General Medicine"}]' \
  -F 'specialization=["Cardiologist"]' \
  -F 'experience_details=[{"institution":"City Hospital","starting_date":"2015-01-01","ending_date":"2020-12-31","is_going_on":false}]' \
  -F 'license_number=PMC-12345' \
  -F 'consultation_type=both' \
  -F 'consultation_fee=2000'
```

**Step 7: Get Current Doctor**

```bash
curl -X GET http://localhost:5000/api/doctor/auth/me \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 8: Logout**

```bash
curl -X POST http://localhost:5000/api/doctor/auth/logout \
  -H "Cookie: $(cat cookies.txt)"
```

---

## 📞 Support & Notes

### Important Notes

1. **Email Verification Required**: Doctors must verify their email before logging in
2. **Document Quality**: Upload clear, high-quality scans of all documents
3. **Admin Approval**: Applications are typically reviewed within 24-48 hours
4. **Session Management**: Sessions expire after 7 days of inactivity
5. **File Size Limits**: Respect file size limits to avoid upload failures
6. **Resubmission**: Rejected applications can be resubmitted with corrected documents
7. **Email Notifications**: Doctors receive emails for:
   - Email verification
   - Application approval
   - Application rejection
   - Password reset

### Frontend Integration Example

```javascript
// Check doctor status and redirect accordingly
const checkDoctorStatus = (doctor) => {
  if (!doctor.is_Verified) {
    return {
      route: "/doctor/auth/verify-email",
      message: "Please verify your email",
    };
  }

  if (doctor.onboarding_status === "pending") {
    return {
      route: "/doctor/onboarding/submit-application",
      message: "Submit your documents",
    };
  }

  if (doctor.onboarding_status === "documents-submitted") {
    return {
      route: "/doctor/onboarding/status",
      message: "Awaiting admin approval",
    };
  }

  if (doctor.onboarding_status === "documents-rejected") {
    return {
      route: "/doctor/onboarding/resubmit",
      message: "Resubmit your documents",
    };
  }

  if (doctor.onboarding_status === "documents-approved") {
    return {
      route: "/doctor/onboarding/complete-profile",
      message: "Complete your profile",
    };
  }

  if (
    doctor.onboarding_status === "completed" &&
    doctor.account_status === "active"
  ) {
    return { route: "/doctor/dashboard", message: "Welcome to your dashboard" };
  }

  if (doctor.account_status === "blocked/removed") {
    return {
      route: "/doctor/account-blocked",
      message: "Your account has been blocked",
    };
  }

  return { route: "/doctor/dashboard", message: "Welcome" };
};
```

### Contact

For technical issues or questions:

- **Email**: support@philbox.com
- **Developer Contact**: dev@philbox.com

---

**Last Updated:** December 31, 2025
**API Version:** 1.0.0
**Modules:** Authentication, Onboarding
