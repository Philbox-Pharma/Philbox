# Doctor Complete API Guide

**Base URLs:**

- **Authentication:** `http://localhost:5000/api/doctor/auth`
- **Onboarding:** `http://localhost:5000/api/doctor/onboarding`
- **Profile:** `http://localhost:5000/api/doctor/profile`
- **Slots Management:** `http://localhost:5000/api/doctor/slots`

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Complete Registration Flow](#complete-registration-flow)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Onboarding Endpoints](#onboarding-endpoints)
5. [Profile Management Endpoints](#profile-management-endpoints)
6. [Slots Management Endpoints](#slots-management-endpoints)
7. [File Upload Requirements](#file-upload-requirements)
8. [Validation Rules](#validation-rules)
9. [Error Responses](#error-responses)
10. [Application Status Reference](#application-status-reference)
11. [Testing Guide](#testing-guide)

---

## 🎯 Overview

The PhilBox doctor system consists of three main modules:

### 1. Authentication Module (`/api/doctor/auth`)

Handles account creation, login, email verification, and password management.

### 2. Onboarding Module (`/api/doctor/onboarding`)

Manages document submission, application status tracking, and profile completion.

### 3. Profile Management Module (`/api/doctor/profile`)

Allows doctors to view and update their profile information, images, consultation settings, and password.

### 4. Slots Management Module (`/api/doctor/slots`)

Enables doctors to create, manage, and organize their availability slots for patient appointments. Supports single slots, recurring slots (daily/weekly/monthly), calendar view, and CRUD operations.

### Complete Journey:

```
Register → Verify Email → Login → Submit Documents →
Check Status → Wait for Approval (or Resubmit if Rejected) → Complete Profile →
Manage Profile → Create Availability Slots → Start Practice
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
       ├─→ If Rejected ───────────┐
       │                           ▼
       │                  ┌─────────────────────────────┐
       │                  │  5a. Resubmit Application  │ POST /onboarding/resubmit-application
       │                  │  (Upload Corrected Docs)   │ → Status reset to Pending
       │                  └──────┬──────────────────────┘
       │                         │
       │                         └──────┐
       │                                │
       ▼ If Approved                    ▼
┌─────────────────────────────┐  (Back to Check Status)
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

### 3. Resubmit Application (For Rejected Applications)

**Endpoint:** `POST /api/doctor/onboarding/resubmit-application`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Purpose:** Allows doctors to resubmit documents after their application has been rejected by admin.

**Prerequisites:**

- Previous application must exist
- Application status must be "rejected"

**Required Files:**

- `cnic` - Updated CNIC image (front/back)
- `medical_license` - Updated medical license certificate
- `mbbs_md_degree` - Updated MBBS/MD degree certificate

**Optional Files:**

- `specialist_license` - Updated specialist certification
- `experience_letters` - Updated experience/employment letters

**Request (multipart/form-data):**

```javascript
const formData = new FormData();
formData.append("cnic", updatedCnicFile);
formData.append("medical_license", updatedLicenseFile);
formData.append("mbbs_md_degree", updatedDegreeFile);
formData.append("specialist_license", updatedSpecialistFile); // optional
formData.append("experience_letters", updatedExperienceFile); // optional

await fetch("/api/doctor/onboarding/resubmit-application", {
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
  "message": "Application resubmitted successfully. Please wait for admin review.",
  "data": {
    "success": true,
    "message": "Application resubmitted successfully. Please wait for admin review.",
    "documentId": "doc123",
    "nextStep": "waiting-approval"
  }
}
```

**What Happens:**

1. Uploads new documents to Cloudinary (replacing old ones)
2. Updates existing DoctorDocuments record
3. Resets application status to "pending"
4. Clears previous admin_comment, reviewed_by, and reviewed_at
5. Updates doctor `onboarding_status` to "documents-submitted"
6. Updates doctor `account_status` to "suspended/freezed"
7. Logs resubmission activity

**Error Responses:**

**Application Not Rejected (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Application Not Rejected",
  "error": "You can only resubmit if your application was rejected. Current status does not allow resubmission."
}
```

**No Application Found (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "No Application Found",
  "error": "No previous application found. Please submit a new application instead."
}
```

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

---

### 4. Complete Profile

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

## � Profile Management Endpoints

### 1. Get My Profile

**Endpoint:** `GET /api/doctor/profile`
**Authentication:** Required
**Rate Limited:** No

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "doc123",
    "fullName": "Dr. Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "contactNumber": "+923001234567",
    "gender": "Female",
    "dateOfBirth": "1988-05-15T00:00:00.000Z",
    "specialization": ["Cardiologist", "Internal Medicine"],
    "educational_details": [
      {
        "degree": "MBBS",
        "institution": "Aga Khan University",
        "yearOfCompletion": 2012,
        "specialization": "General Medicine",
        "fileUrl": "https://cloudinary.com/..."
      }
    ],
    "experience_details": [
      {
        "institution": "Aga Khan Hospital",
        "starting_date": "2017-06-01T00:00:00.000Z",
        "ending_date": "2022-12-31T00:00:00.000Z",
        "is_going_on": false,
        "institution_img_url": "https://cloudinary.com/..."
      }
    ],
    "license_number": "PMC-12345",
    "affiliated_hospital": "Aga Khan Hospital",
    "consultation_type": "both",
    "consultation_fee": 3000,
    "onlineProfileURL": "https://linkedin.com/in/drsarah",
    "profile_img_url": "https://cloudinary.com/...",
    "cover_img_url": "https://cloudinary.com/...",
    "digital_signature": "https://cloudinary.com/...",
    "account_status": "active",
    "onboarding_status": "completed",
    "is_Verified": true,
    "averageRating": 4.5,
    "roleId": {
      "_id": "role123",
      "name": "doctor"
    },
    "created_at": "2025-12-01T10:00:00.000Z",
    "updated_at": "2025-12-31T15:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `404` - Doctor not found

---

### 2. Update Profile Details

**Endpoint:** `PUT /api/doctor/profile`
**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "fullName": "Dr. Sarah Ahmed Khan",
  "contactNumber": "+923001234567",
  "specialization": [
    "Cardiologist",
    "Internal Medicine",
    "Preventive Cardiology"
  ],
  "affiliated_hospital": "Aga Khan Hospital",
  "educational_details": [
    {
      "degree": "MBBS",
      "institution": "Aga Khan University",
      "yearOfCompletion": 2012,
      "specialization": "General Medicine"
    },
    {
      "degree": "MD (Cardiology)",
      "institution": "Harvard Medical School",
      "yearOfCompletion": 2017,
      "specialization": "Cardiology"
    }
  ],
  "experience_details": [
    {
      "institution": "Aga Khan Hospital",
      "starting_date": "2017-06-01",
      "ending_date": "2022-12-31",
      "is_going_on": false
    },
    {
      "institution": "Liaquat National Hospital",
      "starting_date": "2023-01-01",
      "is_going_on": true
    }
  ],
  "onlineProfileURL": "https://linkedin.com/in/drsarahkhan"
}
```

**Allowed Fields:**

- `fullName` - Doctor's full name
- `contactNumber` - Contact phone number
- `specialization` - Array of specializations
- `affiliated_hospital` - Current hospital affiliation
- `educational_details` - Array of education records
- `experience_details` - Array of experience records
- `onlineProfileURL` - LinkedIn or professional profile URL

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "_id": "doc123",
    "fullName": "Dr. Sarah Ahmed Khan",
    "contactNumber": "+923001234567",
    "specialization": [
      "Cardiologist",
      "Internal Medicine",
      "Preventive Cardiology"
    ]
    // ... full updated profile
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `404` - Doctor not found
- `400` - Invalid data (e.g., specialization not an array)

---

### 3. Update Profile Image

**Endpoint:** `PUT /api/doctor/profile/profile-image`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body:**

```javascript
const formData = new FormData();
formData.append("profile_image", profileImageFile);

await fetch("/api/doctor/profile/profile-image", {
  method: "PUT",
  body: formData,
  credentials: "include",
});
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Profile image updated successfully",
  "data": {
    "profile_img_url": "https://res.cloudinary.com/.../doctor_profiles/profile_images/..."
  }
}
```

**File Requirements:**

- Format: JPG, PNG, WEBP
- Max Size: 2MB
- Automatically uploaded to Cloudinary
- Previous image replaced

**Error Responses:**

- `401` - Unauthorized
- `400` - No image file provided
- `404` - Doctor not found
- `500` - File upload failed

---

### 4. Update Cover Image

**Endpoint:** `PUT /api/doctor/profile/cover-image`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body:**

```javascript
const formData = new FormData();
formData.append("cover_image", coverImageFile);

await fetch("/api/doctor/profile/cover-image", {
  method: "PUT",
  body: formData,
  credentials: "include",
});
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Cover image updated successfully",
  "data": {
    "cover_img_url": "https://res.cloudinary.com/.../doctor_profiles/cover_images/..."
  }
}
```

**File Requirements:**

- Format: JPG, PNG, WEBP
- Max Size: 5MB
- Automatically uploaded to Cloudinary
- Previous image replaced

**Error Responses:**

- `401` - Unauthorized
- `400` - No image file provided
- `404` - Doctor not found
- `500` - File upload failed

---

### 5. Update Consultation Type

**Endpoint:** `PUT /api/doctor/profile/consultation-type`
**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "consultation_type": "both"
}
```

**Valid Values:**

- `"in-person"` - Only face-to-face consultations
- `"online"` - Only video/telemedicine consultations
- `"both"` - Both in-person and online

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Consultation type updated successfully",
  "data": {
    "consultation_type": "both"
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `400` - Consultation type is required
- `400` - Invalid consultation type (must be: in-person, online, or both)
- `404` - Doctor not found

---

### 6. Update Consultation Fee

**Endpoint:** `PUT /api/doctor/profile/consultation-fee`
**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "consultation_fee": 3500
}
```

**Validation:**

- Must be a positive number
- Can be integer or float
- No maximum limit

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Consultation fee updated successfully",
  "data": {
    "consultation_fee": 3500
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `400` - Consultation fee is required
- `400` - Consultation fee must be a positive number
- `404` - Doctor not found

---

### 7. Change Password

**Endpoint:** `PUT /api/doctor/profile/change-password`
**Authentication:** Required
**Content-Type:** `application/json`

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass456!"
}
```

**Validation:**

- `currentPassword`: Required, must match existing password
- `newPassword`: Required, minimum 8 characters
- Not available for OAuth accounts (Google login)

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Responses:**

- `401` - Unauthorized
- `401` - Current password is incorrect
- `400` - Current password and new password are required
- `400` - New password must be at least 8 characters
- `400` - Cannot change password for OAuth accounts
- `404` - Doctor not found

---

## 📅 Slots Management Endpoints

### Overview

The Slots Management system allows doctors to define their availability for patient appointments. Doctors can:

- Create single time slots for specific dates
- Create recurring slots (daily, weekly, or monthly patterns)
- View slots in a calendar format
- Edit or delete unbooked future slots
- Mark slots as unavailable
- Filter slots by date range and status

**Key Features:**

- **Slot Duration Options:** 15, 30, or 60 minutes
- **Overlap Prevention:** System prevents overlapping time slots
- **Booking Protection:** Booked slots cannot be edited or deleted
- **Past Slot Protection:** Past slots cannot be modified
- **Activity Logging:** All slot operations are logged for tracking

---

### 1. Create Single Slot

**Endpoint:** `POST /api/doctor/slots`
**Authentication:** Required (Doctor)
**Content-Type:** `application/json`

**Purpose:** Create a single availability slot for a specific date and time.

**Request Body:**

```json
{
  "date": "2026-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 30,
  "notes": "Available for general consultations"
}
```

**Field Descriptions:**

- `date` (required): Date in ISO format (YYYY-MM-DD), must be today or future
- `start_time` (required): Start time in HH:mm format (24-hour)
- `end_time` (required): End time in HH:mm format (24-hour)
- `slot_duration` (optional): Duration in minutes - 15, 30, or 60 (default: 30)
- `notes` (optional): Additional notes about the slot (max 500 characters)

**Success Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Slot created successfully",
  "data": {
    "_id": "slot123",
    "doctor_id": "doc123",
    "date": "2026-01-15T00:00:00.000Z",
    "start_time": "09:00",
    "end_time": "17:00",
    "slot_duration": 30,
    "status": "available",
    "is_recurring": false,
    "notes": "Available for general consultations",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**Validation Error (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error",
  "error": "Start time must be in HH:mm format (e.g., 09:00)"
}
```

**End Time Before Start Time (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Invalid Time Range",
  "error": "End time must be after start time"
}
```

**Overlapping Slot (409):**

```json
{
  "success": false,
  "status": 409,
  "message": "Slot Overlap",
  "error": "This time slot overlaps with an existing slot. Please choose a different time."
}
```

---

### 2. Create Recurring Slots

**Endpoint:** `POST /api/doctor/slots/recurring`
**Authentication:** Required (Doctor)
**Content-Type:** `application/json`

**Purpose:** Create multiple recurring slots based on a pattern (daily, weekly, or monthly).

**Request Body - Daily Pattern:**

```json
{
  "start_time": "09:00",
  "end_time": "17:00",
  "slot_duration": 30,
  "recurring_pattern": {
    "frequency": "daily",
    "start_date": "2026-01-10",
    "end_date": "2026-01-31"
  },
  "notes": "Daily morning slots"
}
```

**Request Body - Weekly Pattern:**

```json
{
  "start_time": "10:00",
  "end_time": "16:00",
  "slot_duration": 60,
  "recurring_pattern": {
    "frequency": "weekly",
    "days_of_week": [1, 3, 5],
    "start_date": "2026-01-10",
    "end_date": "2026-03-31"
  },
  "notes": "Monday, Wednesday, Friday availability"
}
```

**Request Body - Monthly Pattern:**

```json
{
  "start_time": "14:00",
  "end_time": "18:00",
  "slot_duration": 45,
  "recurring_pattern": {
    "frequency": "monthly",
    "start_date": "2026-01-15",
    "end_date": "2026-12-15"
  },
  "notes": "Monthly special consultation day"
}
```

**Field Descriptions:**

- `start_time` (required): Start time in HH:mm format
- `end_time` (required): End time in HH:mm format
- `slot_duration` (optional): 15, 30, or 60 minutes (default: 30)
- `recurring_pattern` (required):
  - `frequency` (required): "daily", "weekly", or "monthly"
  - `days_of_week` (required for weekly): Array of numbers 0-6 (0=Sunday, 6=Saturday)
  - `start_date` (required): Start date in ISO format
  - `end_date` (required): End date in ISO format
- `notes` (optional): Notes for all recurring slots

**Success Response (201):**

```json
{
  "success": true,
  "status": 201,
  "message": "Recurring slots created successfully",
  "data": {
    "totalCreated": 12,
    "pattern": {
      "frequency": "weekly",
      "days_of_week": [1, 3, 5],
      "start_date": "2026-01-10T00:00:00.000Z",
      "end_date": "2026-03-31T00:00:00.000Z"
    },
    "slots": [
      {
        "_id": "slot124",
        "date": "2026-01-13T00:00:00.000Z",
        "start_time": "10:00",
        "end_time": "16:00",
        "slot_duration": 60,
        "status": "available",
        "is_recurring": true
      }
      // ... more slots
    ]
  }
}
```

**Error Responses:**

**Invalid Frequency (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error",
  "error": "Frequency must be daily, weekly, or monthly"
}
```

**Missing Days for Weekly (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error",
  "error": "Days of week is required for weekly frequency"
}
```

---

### 3. Get All Slots

**Endpoint:** `GET /api/doctor/slots`
**Authentication:** Required (Doctor)

**Purpose:** Retrieve all slots with optional filtering by date range and status.

**Query Parameters:**

- `start_date` (optional): Filter slots from this date (ISO format)
- `end_date` (optional): Filter slots until this date (ISO format)
- `status` (optional): Filter by status - "available", "booked", or "unavailable"

**Example Requests:**

```
GET /api/doctor/slots
GET /api/doctor/slots?start_date=2026-01-01&end_date=2026-01-31
GET /api/doctor/slots?status=available
GET /api/doctor/slots?start_date=2026-01-10&status=booked
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Slots fetched successfully",
  "data": {
    "count": 25,
    "slots": [
      {
        "_id": "slot123",
        "doctor_id": "doc123",
        "date": "2026-01-15T00:00:00.000Z",
        "start_time": "09:00",
        "end_time": "17:00",
        "slot_duration": 30,
        "status": "available",
        "is_recurring": false,
        "notes": "General availability",
        "appointment_id": null,
        "created_at": "2026-01-01T10:00:00.000Z",
        "updated_at": "2026-01-01T10:00:00.000Z"
      },
      {
        "_id": "slot124",
        "doctor_id": "doc123",
        "date": "2026-01-16T00:00:00.000Z",
        "start_time": "10:00",
        "end_time": "16:00",
        "slot_duration": 60,
        "status": "booked",
        "is_recurring": true,
        "appointment_id": "appt456",
        "recurring_pattern": {
          "frequency": "weekly",
          "days_of_week": [1, 3, 5],
          "end_date": "2026-03-31T00:00:00.000Z"
        },
        "created_at": "2026-01-01T10:00:00.000Z",
        "updated_at": "2026-01-10T14:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

**Invalid Date Format (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error",
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

---

### 4. Get Calendar View

**Endpoint:** `GET /api/doctor/slots/calendar/:year/:month`
**Authentication:** Required (Doctor)

**Purpose:** Get a calendar view of slots for a specific month, grouped by date.

**Example Requests:**

```
GET /api/doctor/slots/calendar/2026/1
GET /api/doctor/slots/calendar/2026/12
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Calendar view fetched successfully",
  "data": {
    "year": 2026,
    "month": 1,
    "totalSlots": 45,
    "calendar": {
      "2026-01-15": [
        {
          "_id": "slot123",
          "start_time": "09:00",
          "end_time": "17:00",
          "slot_duration": 30,
          "status": "available",
          "is_recurring": false,
          "notes": "General availability"
        }
      ],
      "2026-01-16": [
        {
          "_id": "slot124",
          "start_time": "10:00",
          "end_time": "14:00",
          "slot_duration": 60,
          "status": "booked",
          "is_recurring": true
        },
        {
          "_id": "slot125",
          "start_time": "15:00",
          "end_time": "18:00",
          "slot_duration": 30,
          "status": "available",
          "is_recurring": false
        }
      ]
    }
  }
}
```

**Error Responses:**

**Invalid Month (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Validation Error",
  "error": "Month must be between 1 and 12"
}
```

---

### 5. Get Single Slot

**Endpoint:** `GET /api/doctor/slots/:slotId`
**Authentication:** Required (Doctor)

**Purpose:** Retrieve detailed information about a specific slot.

**Example Request:**

```
GET /api/doctor/slots/slot123
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Slot fetched successfully",
  "data": {
    "_id": "slot123",
    "doctor_id": "doc123",
    "date": "2026-01-15T00:00:00.000Z",
    "start_time": "09:00",
    "end_time": "17:00",
    "slot_duration": 30,
    "status": "available",
    "is_recurring": false,
    "recurring_pattern": {
      "frequency": null,
      "days_of_week": [],
      "end_date": null
    },
    "appointment_id": null,
    "notes": "Available for general consultations",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

**Error Responses:**

**Slot Not Found (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "Slot Not Found",
  "error": "The requested slot does not exist"
}
```

**Unauthorized Access (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Access Denied",
  "error": "You can only access your own slots"
}
```

---

### 6. Update Slot

**Endpoint:** `PUT /api/doctor/slots/:slotId`
**Authentication:** Required (Doctor)
**Content-Type:** `application/json`

**Purpose:** Update slot details. Only unbooked, future slots can be updated.

**Request Body:**

```json
{
  "start_time": "10:00",
  "end_time": "18:00",
  "slot_duration": 60,
  "notes": "Updated availability - Longer sessions"
}
```

**Allowed Fields:**

- `start_time` (optional): New start time
- `end_time` (optional): New end time
- `slot_duration` (optional): 15, 30, or 60 minutes
- `notes` (optional): Updated notes

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Slot updated successfully",
  "data": {
    "_id": "slot123",
    "doctor_id": "doc123",
    "date": "2026-01-15T00:00:00.000Z",
    "start_time": "10:00",
    "end_time": "18:00",
    "slot_duration": 60,
    "status": "available",
    "notes": "Updated availability - Longer sessions",
    "updated_at": "2026-01-02T14:30:00.000Z"
  }
}
```

**Error Responses:**

**Cannot Update Booked Slot (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Cannot Update Booked Slot",
  "error": "This slot is already booked and cannot be modified. Please contact the patient to reschedule."
}
```

**Cannot Update Past Slot (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Cannot Update Past Slot",
  "error": "Past slots cannot be modified"
}
```

**Slot Overlap After Update (409):**

```json
{
  "success": false,
  "status": 409,
  "message": "Slot Overlap",
  "error": "The updated time range overlaps with another existing slot"
}
```

---

### 7. Mark Slot as Unavailable

**Endpoint:** `PATCH /api/doctor/slots/:slotId/unavailable`
**Authentication:** Required (Doctor)

**Purpose:** Mark a slot as unavailable without deleting it. Useful for temporary unavailability.

**Example Request:**

```
PATCH /api/doctor/slots/slot123/unavailable
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Slot marked as unavailable",
  "data": {
    "_id": "slot123",
    "doctor_id": "doc123",
    "date": "2026-01-15T00:00:00.000Z",
    "start_time": "09:00",
    "end_time": "17:00",
    "status": "unavailable",
    "updated_at": "2026-01-02T15:00:00.000Z"
  }
}
```

**Error Responses:**

**Slot Already Booked (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Cannot Mark Booked Slot",
  "error": "This slot is already booked and cannot be marked unavailable"
}
```

**Slot Not Found (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "Slot Not Found",
  "error": "The requested slot does not exist"
}
```

---

### 8. Delete Slot

**Endpoint:** `DELETE /api/doctor/slots/:slotId`
**Authentication:** Required (Doctor)

**Purpose:** Permanently delete a slot. Only unbooked, future slots can be deleted.

**Example Request:**

```
DELETE /api/doctor/slots/slot123
```

**Success Response (200):**

```json
{
  "success": true,
  "status": 200,
  "message": "Slot deleted successfully",
  "data": null
}
```

**Error Responses:**

**Cannot Delete Booked Slot (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Cannot Delete Booked Slot",
  "error": "This slot is already booked and cannot be deleted. Please contact the patient to cancel the appointment first."
}
```

**Cannot Delete Past Slot (403):**

```json
{
  "success": false,
  "status": 403,
  "message": "Cannot Delete Past Slot",
  "error": "Past slots cannot be deleted"
}
```

**Slot Not Found (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "Slot Not Found",
  "error": "The requested slot does not exist"
}
```

---

### Slot Status Reference

| Status        | Description                          | Can Edit? | Can Delete? |
| ------------- | ------------------------------------ | --------- | ----------- |
| `available`   | Slot is open for booking             | ✅ Yes    | ✅ Yes      |
| `booked`      | Slot has an active appointment       | ❌ No     | ❌ No       |
| `unavailable` | Slot is marked unavailable by doctor | ✅ Yes    | ✅ Yes      |

### Slot Duration Options

| Duration | Description            | Use Case                           |
| -------- | ---------------------- | ---------------------------------- |
| 15 min   | Quick consultations    | Follow-ups, prescription renewals  |
| 30 min   | Standard consultations | General check-ups (default)        |
| 60 min   | Extended consultations | Initial consultations, diagnostics |

### Recurring Pattern Reference

**Frequency Types:**

1. **Daily**: Creates slots every day within the date range
2. **Weekly**: Creates slots on specific days of the week (requires `days_of_week`)
3. **Monthly**: Creates slots on the same date each month

**Days of Week (for weekly pattern):**

- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

**Example Patterns:**

- Monday to Friday: `[1, 2, 3, 4, 5]`
- Weekends only: `[0, 6]`
- Mon, Wed, Fri: `[1, 3, 5]`

---

## �📂 File Upload Requirements

### Document Uploads (Submit Application & Resubmit)

| Field                | Required    | Format        | Max Size | Description                   |
| -------------------- | ----------- | ------------- | -------- | ----------------------------- |
| `cnic`               | ✅ Yes      | JPG, PNG, PDF | 5MB      | National Identity Card (CNIC) |
| `medical_license`    | ✅ Yes      | JPG, PNG, PDF | 5MB      | PMC Registration Certificate  |
| `mbbs_md_degree`     | ✅ Yes      | JPG, PNG, PDF | 5MB      | Medical Degree Certificate    |
| `specialist_license` | ⚠️ Optional | JPG, PNG, PDF | 5MB      | Specialist Certification      |
| `experience_letters` | ⚠️ Optional | JPG, PNG, PDF | 5MB      | Employment/Experience Letters |

**Note:** These same requirements apply to both initial submission and resubmission of rejected applications.

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

### Slots Management

**Create Single Slot**:

- `date`: Required, ISO date string, must be today or future
- `start_time`: Required, HH:mm format (e.g., "09:00")
- `end_time`: Required, HH:mm format (e.g., "17:00")
- `slot_duration`: Optional, 15, 30, or 60 (default: 30)
- `notes`: Optional, max 500 characters

**Create Recurring Slots**:

- `start_time`: Required, HH:mm format
- `end_time`: Required, HH:mm format
- `slot_duration`: Optional, 15, 30, or 60 (default: 30)
- `recurring_pattern`: Required object:
  - `frequency`: Required, "daily", "weekly", or "monthly"
  - `days_of_week`: Required for weekly, array of 0-6
  - `start_date`: Required, ISO date string, must be today or future
  - `end_date`: Required, ISO date string, must be after start_date
- `notes`: Optional, max 500 characters

**Update Slot**:

- All fields optional
- Only unbooked, future slots can be updated
- Same format as create slot

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

**Application Not Rejected (400):**

```json
{
  "success": false,
  "status": 400,
  "message": "Application Not Rejected",
  "error": "You can only resubmit if your application was rejected. Current status does not allow resubmission."
}
```

**No Application Found (404):**

```json
{
  "success": false,
  "status": 404,
  "message": "No Application Found",
  "error": "No previous application found. Please submit a new application instead."
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

**Step 8: Get My Profile**

```bash
curl -X GET http://localhost:5000/api/doctor/profile \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 9: Update Profile Details**

```bash
curl -X PUT http://localhost:5000/api/doctor/profile \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. Test Doctor Updated",
    "contactNumber": "+923009876543",
    "specialization": ["Cardiologist", "Internal Medicine"]
  }'
```

**Step 10: Update Profile Image**

```bash
curl -X PUT http://localhost:5000/api/doctor/profile/profile-image \
  -H "Cookie: $(cat cookies.txt)" \
  -F "profile_image=@/path/to/profile.jpg"
```

**Step 11: Update Consultation Type**

````bash
curl -X PUT http://localhost:5000/api/doctor/profile/consultation-type \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{Change Password**

```bash
curl -X PUT http://localhost:5000/api/doctor/profile/change-password \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123",
    "newPassword": "NewTestPass456"
  }'
````

**Step 15: Create Single Slot**

```bash
curl -X POST http://localhost:5000/api/doctor/slots \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "slot_duration": 30,
    "notes": "Available for consultations"
  }'
```

10. **Slot Management**: Doctors can manage availability after profile completion
11. **Overlap Prevention**: System automatically prevents conflicting time slots
12. **Activity Logging**: All slot operations (create, update, delete) are logged

**Step 16: Create Recurring Slots (Weekly)**

```bash
curl -X POST http://localhost:5000/api/doctor/slots/recurring \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "10:00",
    "end_time": "16:00",
    "slot_duration": 60,
    "recurring_pattern": {
      "frequency": "weekly",
      "days_of_week": [1, 3, 5],
      "start_date": "2026-01-10",
      "end_date": "2026-03-31"
    },
    "notes": "Monday, Wednesday, Friday availability"
  }'
```

**Step 17: Get All Slots**

```bash
curl -X GET "http://localhost:5000/api/doctor/slots?start_date=2026-01-01&end_date=2026-01-31&status=available" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 18: Get Calendar View**

```bash
curl -X GET http://localhost:5000/api/doctor/slots/calendar/2026/1 \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 19: Get Single Slot**

```bash
curl -X GET http://localhost:5000/api/doctor/slots/slot123 \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 20: Update Slot**

```bash
curl -X PUT http://localhost:5000/api/doctor/slots/slot123 \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "10:00",
    "end_time": "18:00",
    "slot_duration": 60,
    "notes": "Extended hours"
  }'

// Handle slot creation with validation
const createSlot = async (slotData) => {
  try {
    const response = await fetch('/api/doctor/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(slotData),
    });

    const result = await response.json();
2.0
**Modules:** Authentication, Onboarding, Profile Management, Slots
      if (result.status === 409) {
        // Handle overlap error
        return { error: 'Time slot overlaps with existing slot' };
      }
      return { error: result.error };
    }

    return { success: true, slot: result.data };
  } catch (error) {
    return { error: 'Failed to create slot' };
  }
};

// Create recurring slots
const createRecurringSlots = async (pattern) => {
  try {
    const response = await fetch('/api/doctor/slots/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(pattern),
    });

    const result = await response.json();

    if (!result.success) {
      return { error: result.error };
    }

    return {
      success: true,
      totalCreated: result.data.totalCreated,
      slots: result.data.slots
    };
  } catch (error) {
    return { error: 'Failed to create recurring slots' };
  }
};

// Get calendar view
const getCalendarView = async (year, month) => {
  try {
    const response = await fetch(
      `/api/doctor/slots/calendar/${year}/${month}`,
      { credentials: 'include' }
    );

    const result = await response.json();

    if (!result.success) {
      return { error: result.error };
    }

    return { success: true, calendar: result.data.calendar };
  } catch (error) {
    return { error: 'Failed to fetch calendar' };
  }
};
```

**Step 21: Mark Slot Unavailable**

```bash
curl -X PATCH http://localhost:5000/api/doctor/slots/slot123/unavailable \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 22: Delete Slot**

```bash
curl -X DELETE http://localhost:5000/api/doctor/slots/slot123 \
  -H "Cookie: $(cat cookies.txt)"
```

\*\*Step 23:
"consultation_type": "both"
}'

````

**Step 12: Update Consultation Fee**

```bash
curl -X PUT http://localhost:5000/api/doctor/profile/consultation-fee \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_fee": 3500
  }'
````

**Step 13: Change Password**

```bash
curl -X PUT http://localhost:5000/api/doctor/profile/change-password \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123",
    "newPassword": "NewTestPass456"
  }'
```

**Step 14: Logout**

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
7. **Profile Management**: Doctors can update their profile anytime after completing onboarding
8. **OAuth Accounts**: Cannot change password for Google OAuth accounts
9. **Email Notifications**: Doctors receive emails for:
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

**Last Updated:** January 1, 2026
**API Version:** 1.1.0
**Modules:** Authentication, Onboarding, Profile Management
