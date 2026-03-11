# Doctor Complete API Guide

**Base URLs:**

- **Authentication:** `http://localhost:5000/api/doctor/auth`
- **Onboarding:** `http://localhost:5000/api/doctor/onboarding`
- **Profile:** `http://localhost:5000/api/doctor/profile`
- **Slots Management:** `http://localhost:5000/api/doctor/slots`
- **Appointment Requests:** `http://localhost:5000/api/doctor/appointments`
- **Reviews Management:** `http://localhost:5000/api/doctor/reviews`
- **Past Consultations:** `http://localhost:5000/api/doctor/consultations`

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Complete Registration Flow](#complete-registration-flow)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Onboarding Endpoints](#onboarding-endpoints)
5. [Profile Management Endpoints](#profile-management-endpoints)
6. [Slots Management Endpoints](#slots-management-endpoints)
7. [Appointment Request Management](#appointment-request-management)
8. [Reviews Management](#reviews-management)
9. [Past Consultations Management](#past-consultations-management)
10. [File Upload Requirements](#file-upload-requirements)
11. [Validation Rules](#validation-rules)
12. [Error Responses](#error-responses)
13. [Application Status Reference](#application-status-reference)
14. [Testing Guide](#testing-guide)

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

### 5. Appointment Request Management (`/api/doctor/appointments`)

Manages patient appointment requests - allows doctors to view pending requests, review details, accept or reject appointments with reasons, and send automated email notifications to patients.

### 6. Reviews Management (`/api/doctor/reviews`)

Provides doctors with read-only access to patient reviews and feedback. Doctors can view their average ratings, filter reviews by star rating (1-5), sentiment (positive/negative/neutral), and date ranges. Includes comprehensive statistics with rating distribution and sentiment analysis.

### 7. Past Consultations Management (`/api/doctor/consultations`)

Provides comprehensive access to completed appointments with full details including prescriptions, video recordings, patient messages, and notes. Doctors can review consultation history, track prescriptions with medicine details, analyze practice statistics, and filter by patient name or date range.

### Complete Journey:

```
Register → Verify Email → Login → Submit Documents →
Check Status → Wait for Approval (or Resubmit if Rejected) → Complete Profile →
Manage Profile → Create Availability Slots → Manage Appointment Requests →
View Patient Reviews → Review Past Consultations → Start Practice
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

---

## 🗓️ Appointment Request Management

Base URL: `/api/doctor/appointments`

### Overview

The appointment request management system allows doctors to:

- View pending appointment requests from patients
- Review request details including patient information and consultation reason
- Accept appointment requests (with optional time slot assignment and notes)
- Reject appointment requests with detailed reasons
- View accepted appointments in their schedule
- Automated email notifications to patients on decisions

---

### 📋 Endpoints Summary

| Method | Endpoint                          | Description                | Auth Required |
| ------ | --------------------------------- | -------------------------- | ------------- |
| GET    | `/requests`                       | Get pending requests       | ✅ Doctor     |
| GET    | `/requests/:appointmentId`        | Get request details        | ✅ Doctor     |
| POST   | `/requests/:appointmentId/accept` | Accept appointment request | ✅ Doctor     |
| POST   | `/requests/:appointmentId/reject` | Reject appointment request | ✅ Doctor     |
| GET    | `/accepted`                       | Get accepted appointments  | ✅ Doctor     |

---

### 1. Get Pending Appointment Requests

**GET** `/api/doctor/appointments/requests`

Retrieve all pending appointment requests with pagination and filtering.

#### Query Parameters

| Parameter        | Type   | Required | Default      | Description                                   |
| ---------------- | ------ | -------- | ------------ | --------------------------------------------- |
| page             | number | No       | 1            | Page number                                   |
| limit            | number | No       | 10           | Items per page (max 100)                      |
| status           | string | No       | 'processing' | Request status: processing/accepted/cancelled |
| appointment_type | string | No       | -            | Filter by type: in-person/online              |
| sort_by          | string | No       | 'created_at' | Sort field: created_at/preferred_date         |
| sort_order       | string | No       | 'desc'       | Sort order: asc/desc                          |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Pending appointment requests retrieved successfully",
  "data": {
    "appointments": [
      {
        "_id": "app123",
        "doctor_id": "doc123",
        "patient_id": {
          "_id": "cust123",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "phone_number": "+923001234567"
        },
        "slot_id": {
          "_id": "slot123",
          "date": "2026-01-15T00:00:00.000Z",
          "start_time": "09:00",
          "end_time": "09:30"
        },
        "appointment_type": "in-person",
        "consultation_reason": "Experiencing chest pain and shortness of breath for the past 2 days. Need urgent consultation.",
        "preferred_date": "2026-01-15T00:00:00.000Z",
        "preferred_time": "09:00",
        "appointment_request": "processing",
        "status": "pending",
        "created_at": "2026-01-10T10:30:00.000Z",
        "updated_at": "2026-01-10T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/requests?page=1&limit=10&status=processing" \
  -H "Cookie: your-session-cookie"
```

---

### 2. Get Appointment Request Details

**GET** `/api/doctor/appointments/requests/:appointmentId`

Get detailed information about a specific appointment request.

#### URL Parameters

| Parameter     | Type   | Required | Description    |
| ------------- | ------ | -------- | -------------- |
| appointmentId | string | Yes      | Appointment ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment request details retrieved successfully",
  "data": {
    "_id": "app123",
    "doctor_id": "doc123",
    "patient_id": {
      "_id": "cust123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+923001234567"
    },
    "slot_id": {
      "_id": "slot123",
      "date": "2026-01-15T00:00:00.000Z",
      "start_time": "09:00",
      "end_time": "09:30",
      "slot_duration": 30
    },
    "appointment_type": "in-person",
    "consultation_reason": "Experiencing chest pain and shortness of breath for the past 2 days. Need urgent consultation.",
    "preferred_date": "2026-01-15T00:00:00.000Z",
    "preferred_time": "09:00",
    "appointment_request": "processing",
    "status": "pending",
    "created_at": "2026-01-10T10:30:00.000Z",
    "updated_at": "2026-01-10T10:30:00.000Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Appointment request not found"
}
```

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/requests/app123" \
  -H "Cookie: your-session-cookie"
```

---

### 3. Accept Appointment Request

**POST** `/api/doctor/appointments/requests/:appointmentId/accept`

Accept a pending appointment request. Optionally assign a time slot and add notes for the patient.

#### URL Parameters

| Parameter     | Type   | Required | Description    |
| ------------- | ------ | -------- | -------------- |
| appointmentId | string | Yes      | Appointment ID |

#### Request Body

| Field   | Type   | Required | Description                                       |
| ------- | ------ | -------- | ------------------------------------------------- |
| slot_id | string | No       | Slot ID to assign (must be available)             |
| notes   | string | No       | Optional notes/instructions for patient (max 500) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment request accepted successfully",
  "data": {
    "_id": "app123",
    "doctor_id": {
      "_id": "doc123",
      "first_name": "Dr. Sarah",
      "last_name": "Ahmed",
      "consultation_fee": 3000
    },
    "patient_id": {
      "_id": "cust123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "slot_id": "slot123",
    "appointment_type": "in-person",
    "appointment_request": "accepted",
    "notes": "Please bring your previous medical reports and arrive 10 minutes early.",
    "status": "pending",
    "created_at": "2026-01-10T10:30:00.000Z",
    "updated_at": "2026-01-11T14:20:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**

```json
{
  "success": false,
  "message": "Appointment request not found or already processed"
}
```

**400 Bad Request**

```json
{
  "success": false,
  "message": "Selected time slot is not available"
}
```

#### Example Request

```bash
curl -X POST "http://localhost:5000/api/doctor/appointments/requests/app123/accept" \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "slot123",
    "notes": "Please bring your previous medical reports and arrive 10 minutes early."
  }'
```

#### Email Notification

When an appointment is accepted, the patient receives an automated email with:

- Doctor's name
- Confirmed date and time
- Appointment type (in-person/online)
- Consultation fee
- Doctor's notes (if provided)
- Link to patient dashboard

---

### 4. Reject Appointment Request

**POST** `/api/doctor/appointments/requests/:appointmentId/reject`

Reject a pending appointment request with a detailed reason.

#### URL Parameters

| Parameter     | Type   | Required | Description    |
| ------------- | ------ | -------- | -------------- |
| appointmentId | string | Yes      | Appointment ID |

#### Request Body

| Field            | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| rejection_reason | string | Yes      | Reason for rejection (10-500 characters) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Appointment request rejected successfully",
  "data": {
    "_id": "app123",
    "doctor_id": {
      "_id": "doc123",
      "first_name": "Dr. Sarah",
      "last_name": "Ahmed"
    },
    "patient_id": {
      "_id": "cust123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "appointment_type": "in-person",
    "appointment_request": "cancelled",
    "rejection_reason": "I specialize in cardiology, but your symptoms require immediate emergency care. Please visit the nearest ER or call emergency services.",
    "created_at": "2026-01-10T10:30:00.000Z",
    "updated_at": "2026-01-11T14:25:00.000Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Appointment request not found or already processed"
}
```

#### Example Request

```bash
curl -X POST "http://localhost:5000/api/doctor/appointments/requests/app123/reject" \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "I specialize in cardiology, but your symptoms require immediate emergency care. Please visit the nearest ER or call emergency services."
  }'
```

#### Email Notification

When an appointment is rejected, the patient receives an automated email with:

- Doctor's name
- Rejection reason
- Originally requested date/time
- Suggestions to find other doctors
- Link to doctor search page

---

### 5. Get Accepted Appointments

**GET** `/api/doctor/appointments/accepted`

Retrieve all accepted appointments (doctor's schedule) with pagination and filtering.

#### Query Parameters

| Parameter        | Type   | Required | Default      | Description                                  |
| ---------------- | ------ | -------- | ------------ | -------------------------------------------- |
| page             | number | No       | 1            | Page number                                  |
| limit            | number | No       | 10           | Items per page (max 100)                     |
| status           | string | No       | 'pending'    | Appointment status: pending/completed/missed |
| appointment_type | string | No       | -            | Filter by type: in-person/online             |
| sort_by          | string | No       | 'created_at' | Sort field                                   |
| sort_order       | string | No       | 'desc'       | Sort order: asc/desc                         |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Accepted appointments retrieved successfully",
  "data": {
    "appointments": [
      {
        "_id": "app123",
        "doctor_id": "doc123",
        "patient_id": {
          "_id": "cust123",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "phone_number": "+923001234567"
        },
        "slot_id": {
          "_id": "slot123",
          "date": "2026-01-15T00:00:00.000Z",
          "start_time": "09:00",
          "end_time": "09:30",
          "slot_duration": 30
        },
        "appointment_type": "in-person",
        "consultation_reason": "Regular checkup for diabetes management",
        "appointment_request": "accepted",
        "status": "pending",
        "notes": "Please bring your glucose monitor readings.",
        "created_at": "2026-01-10T10:30:00.000Z",
        "updated_at": "2026-01-11T14:20:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Example Request

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/accepted?page=1&limit=10&status=pending" \
  -H "Cookie: your-session-cookie"
```

---

### 📌 Important Notes

1. **Email Notifications**: Automated emails are sent to patients for all accept/reject actions
2. **Slot Assignment**: When accepting, if a slot_id is provided, the slot status changes to 'booked'
3. **Activity Logging**: All actions are logged in doctor activity logs for audit trails
4. **One-Time Actions**: Requests can only be accepted or rejected once
5. **Rejection Reasons**: Must be detailed (10-500 characters) to help patients understand
6. **Session Required**: All endpoints require active doctor session
7. **Ownership Validation**: Doctors can only manage requests assigned to them

---

### 🧪 Testing Workflow

**Step 23: View Pending Appointment Requests**

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/requests?status=processing" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 24: Get Appointment Request Details**

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/requests/app123" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 25: Accept Appointment Request**

```bash
curl -X POST "http://localhost:5000/api/doctor/appointments/requests/app123/accept" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "slot123",
    "notes": "Please bring your previous medical reports."
  }'
```

**Step 26: Reject Appointment Request**

```bash
curl -X POST "http://localhost:5000/api/doctor/appointments/requests/app456/reject" \
  -H "Cookie: $(cat cookies.txt)" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Unfortunately, I do not have availability for the requested date. Please consider booking with another doctor or selecting a different time slot."
  }'
```

**Step 27: View Accepted Appointments (Schedule)**

```bash
curl -X GET "http://localhost:5000/api/doctor/appointments/accepted?status=pending" \
  -H "Cookie: $(cat cookies.txt)"
```

---

\*\*Step 28:
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

## ⭐ Reviews Management

### Overview

The Reviews Management module allows doctors to view and analyze patient feedback. This is a **read-only** feature - doctors can view reviews but cannot reply to or modify them. The system provides comprehensive analytics including average ratings, rating distribution, and sentiment analysis.

**Key Features:**

- View all patient reviews with pagination
- Filter reviews by star rating (1-5)
- Filter by sentiment (positive, negative, neutral)
- Filter by date range
- View comprehensive statistics and analytics
- Sort by date or rating
- View individual review details

**Base URL:** `http://localhost:5000/api/doctor/reviews`

**Authentication:** All endpoints require doctor authentication (active session)

---

### 📋 Endpoints Summary

| Method | Endpoint                         | Description                         |
| ------ | -------------------------------- | ----------------------------------- |
| GET    | `/api/doctor/reviews`            | Get all reviews with filters        |
| GET    | `/api/doctor/reviews/statistics` | Get review statistics and analytics |
| GET    | `/api/doctor/reviews/:reviewId`  | Get single review details           |

---

### 1. Get All Reviews

Retrieve all reviews for the logged-in doctor with pagination and filtering options.

**Endpoint:** `GET /api/doctor/reviews`

**Authentication:** Required (Doctor session)

**Query Parameters:**

| Parameter  | Type   | Required | Default    | Description                                     |
| ---------- | ------ | -------- | ---------- | ----------------------------------------------- |
| page       | Number | No       | 1          | Page number                                     |
| limit      | Number | No       | 10         | Items per page (max: 100)                       |
| rating     | Number | No       | -          | Filter by specific rating (1-5)                 |
| sentiment  | String | No       | -          | Filter by sentiment (positive/negative/neutral) |
| start_date | Date   | No       | -          | Filter reviews from this date                   |
| end_date   | Date   | No       | -          | Filter reviews until this date                  |
| sort_by    | String | No       | created_at | Sort field (created_at, rating)                 |
| sort_order | String | No       | desc       | Sort order (asc, desc)                          |

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "60d5ec49eb1d8e3f4c8b4567",
        "message": "Dr. Smith was very professional and helpful. Explained everything clearly.",
        "rating": 5,
        "sentiment": "positive",
        "customer_id": {
          "_id": "60d5ec49eb1d8e3f4c8b4568",
          "first_name": "John",
          "last_name": "Doe",
          "profile_img_url": "https://example.com/profile.jpg"
        },
        "target_type": "doctor",
        "target_id": "60d5ec49eb1d8e3f4c8b4569",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "60d5ec49eb1d8e3f4c8b4570",
        "message": "Good experience overall, but waiting time was a bit long.",
        "rating": 4,
        "sentiment": "neutral",
        "customer_id": {
          "_id": "60d5ec49eb1d8e3f4c8b4571",
          "first_name": "Jane",
          "last_name": "Smith",
          "profile_img_url": "https://example.com/jane.jpg"
        },
        "target_type": "doctor",
        "target_id": "60d5ec49eb1d8e3f4c8b4569",
        "created_at": "2024-01-14T14:20:00.000Z",
        "updated_at": "2024-01-14T14:20:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Example Requests:**

```bash
# Get all reviews (default pagination)
curl -X GET "http://localhost:5000/api/doctor/reviews" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get 5-star reviews only
curl -X GET "http://localhost:5000/api/doctor/reviews?rating=5" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get positive sentiment reviews
curl -X GET "http://localhost:5000/api/doctor/reviews?sentiment=positive" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get reviews from last month
curl -X GET "http://localhost:5000/api/doctor/reviews?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get reviews sorted by rating (highest first)
curl -X GET "http://localhost:5000/api/doctor/reviews?sort_by=rating&sort_order=desc" \
  -H "Cookie: connect.sid=your-session-cookie"

# Combine filters: 5-star positive reviews from January, page 2
curl -X GET "http://localhost:5000/api/doctor/reviews?rating=5&sentiment=positive&start_date=2024-01-01&end_date=2024-01-31&page=2&limit=20" \
  -H "Cookie: connect.sid=your-session-cookie"
```

---

### 2. Get Review Statistics

Retrieve comprehensive statistics including average rating, rating distribution, and sentiment analysis.

**Endpoint:** `GET /api/doctor/reviews/statistics`

**Authentication:** Required (Doctor session)

**Query Parameters:**

| Parameter  | Type | Required | Description                    |
| ---------- | ---- | -------- | ------------------------------ |
| start_date | Date | No       | Get statistics from this date  |
| end_date   | Date | No       | Get statistics until this date |

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Review statistics retrieved successfully",
  "data": {
    "total_reviews": 47,
    "average_rating": 4.32,
    "rating_distribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 19
    },
    "sentiment_distribution": {
      "counts": {
        "positive": 28,
        "negative": 5,
        "neutral": 14
      },
      "percentages": {
        "positive": 59.57,
        "negative": 10.64,
        "neutral": 29.79
      }
    }
  }
}
```

**Example Requests:**

```bash
# Get overall statistics (all time)
curl -X GET "http://localhost:5000/api/doctor/reviews/statistics" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get statistics for January 2024
curl -X GET "http://localhost:5000/api/doctor/reviews/statistics?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: connect.sid=your-session-cookie"

# Get statistics for last 30 days
curl -X GET "http://localhost:5000/api/doctor/reviews/statistics?start_date=2024-01-01" \
  -H "Cookie: connect.sid=your-session-cookie"
```

**Statistics Explanation:**

- **total_reviews**: Total number of reviews received
- **average_rating**: Average star rating (0-5, rounded to 2 decimal places)
- **rating_distribution**: Count of reviews for each star rating (1-5)
- **sentiment_distribution**:
  - **counts**: Raw count for each sentiment type
  - **percentages**: Percentage of reviews for each sentiment (rounded to 2 decimal places)

---

### 3. Get Single Review

Retrieve detailed information about a specific review.

**Endpoint:** `GET /api/doctor/reviews/:reviewId`

**Authentication:** Required (Doctor session)

**Path Parameters:**

| Parameter | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| reviewId  | String | Yes      | MongoDB ObjectId of review |

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Review retrieved successfully",
  "data": {
    "_id": "60d5ec49eb1d8e3f4c8b4567",
    "message": "Dr. Smith was very professional and helpful. Explained everything clearly and answered all my questions. The consultation was thorough and I felt very comfortable throughout.",
    "rating": 5,
    "sentiment": "positive",
    "customer_id": {
      "_id": "60d5ec49eb1d8e3f4c8b4568",
      "first_name": "John",
      "last_name": "Doe",
      "profile_img_url": "https://example.com/profile.jpg",
      "email": "john.doe@example.com"
    },
    "target_type": "doctor",
    "target_id": "60d5ec49eb1d8e3f4c8b4569",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "status": 404,
  "message": "Review not found or does not belong to this doctor",
  "data": null
}
```

**Example Request:**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews/60d5ec49eb1d8e3f4c8b4567" \
  -H "Cookie: connect.sid=your-session-cookie"
```

---

### 📌 Important Notes

1. **Read-Only Access**: Doctors can only view reviews, not reply to or modify them
2. **Own Reviews Only**: Doctors can only access reviews written about them
3. **Pagination**: Use pagination for better performance when fetching large numbers of reviews
4. **Date Filters**: Date filters use ISO 8601 format (YYYY-MM-DD)
5. **Sentiment Analysis**: Sentiment is automatically calculated when reviews are created
6. **Statistics Calculation**: Statistics are calculated in real-time based on filters
7. **Customer Privacy**: Only basic customer information (name, profile image) is shown
8. **Rating Scale**: Ratings are on a scale of 1-5 stars
9. **Filter Combinations**: Multiple filters can be combined for precise filtering
10. **Session Required**: All endpoints require an active doctor session

---

### 🔍 Use Cases

**Monitor Service Quality:**

```bash
# Check recent reviews (last 7 days)
curl -X GET "http://localhost:5000/api/doctor/reviews?start_date=2024-01-08&sort_by=created_at&sort_order=desc" \
  -H "Cookie: connect.sid=your-session-cookie"
```

**Identify Areas for Improvement:**

```bash
# Get negative reviews to understand patient concerns
curl -X GET "http://localhost:5000/api/doctor/reviews?sentiment=negative" \
  -H "Cookie: connect.sid=your-session-cookie"
```

**Track Monthly Performance:**

```bash
# Get January statistics
curl -X GET "http://localhost:5000/api/doctor/reviews/statistics?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: connect.sid=your-session-cookie"
```

**Showcase Positive Feedback:**

```bash
# Get top-rated reviews
curl -X GET "http://localhost:5000/api/doctor/reviews?rating=5&sentiment=positive&limit=10" \
  -H "Cookie: connect.sid=your-session-cookie"
```

---

### 🧪 Testing Workflow

**Step 1: Login as Doctor**

```bash
curl -X POST http://localhost:5000/api/doctor/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "doctor@example.com",
    "password": "YourPassword123"
  }'
```

**Step 2: Get Review Statistics**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews/statistics" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 3: Get All Reviews (Paginated)**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews?page=1&limit=10" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 4: Filter by Rating**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews?rating=5" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 5: Filter by Sentiment**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews?sentiment=positive" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 6: Filter by Date Range**

```bash
curl -X GET "http://localhost:5000/api/doctor/reviews?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 7: Get Single Review Details**

```bash
# Replace reviewId with actual review ID from previous response
curl -X GET "http://localhost:5000/api/doctor/reviews/60d5ec49eb1d8e3f4c8b4567" \
  -H "Cookie: $(cat cookies.txt)"
```

**Step 8: Combined Filters**

```bash
# Get positive 5-star reviews from January
curl -X GET "http://localhost:5000/api/doctor/reviews?rating=5&sentiment=positive&start_date=2024-01-01&end_date=2024-01-31&page=1&limit=20" \
  -H "Cookie: $(cat cookies.txt)"
```

---

## � Past Consultations Management

The consultations module provides doctors with comprehensive access to their completed appointments, including prescription details, video recordings, patient messages, and statistics. This enables doctors to review previous consultations, track prescription history, and analyze their practice patterns.

**Base URL:** `http://localhost:5000/api/doctor/consultations`

### Features

- ✅ View all completed consultations with pagination
- ✅ Filter by patient name and date range
- ✅ Access full consultation details including prescriptions
- ✅ View prescription items with medicine details
- ✅ Access video recording URLs when available
- ✅ Read consultation messages and notes
- ✅ Get comprehensive consultation statistics
- ✅ Track prescription generation rates
- ✅ Analyze appointment type distribution

---

### 1. Get Past Consultations

Retrieve a paginated list of all completed consultations.

**Endpoint:** `GET /api/doctor/consultations`

**Authentication:** Required (Doctor session)

**Query Parameters:**

| Parameter      | Type   | Required | Default      | Description                            |
| -------------- | ------ | -------- | ------------ | -------------------------------------- |
| `page`         | number | No       | 1            | Page number (minimum: 1)               |
| `limit`        | number | No       | 10           | Items per page (1-100)                 |
| `patient_name` | string | No       | -            | Filter by patient name (partial match) |
| `start_date`   | date   | No       | -            | Filter consultations from this date    |
| `end_date`     | date   | No       | -            | Filter consultations until this date   |
| `sort_by`      | string | No       | `created_at` | Sort by: `created_at`, `updated_at`    |
| `sort_order`   | string | No       | `desc`       | Sort order: `asc`, `desc`              |

**Example Request:**

```bash
GET /api/doctor/consultations?page=1&limit=10&patient_name=John&sort_order=desc
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Past consultations retrieved successfully",
  "data": {
    "consultations": [
      {
        "_id": "60d5ec49eb1d8e3f4c8b4567",
        "appointment_type": "online",
        "appointment_request": "accepted",
        "status": "completed",
        "consultation_reason": "Follow-up checkup",
        "recording_url": "https://recordings.philbox.com/session-123.mp4",
        "notes": "Patient responded well to treatment",
        "preferred_date": "2024-02-15T00:00:00.000Z",
        "preferred_time": "10:00",
        "patient_id": {
          "_id": "60d5ec49eb1d8e3f4c8b4568",
          "fullName": "John Doe",
          "email": "john.doe@example.com",
          "contactNumber": "+1234567890",
          "profile_img_url": "https://example.com/profile.jpg",
          "blood_group": "A+",
          "weight": 75,
          "height": 175,
          "patient_status": "active"
        },
        "slot_id": {
          "_id": "60d5ec49eb1d8e3f4c8b4569",
          "date": "2024-02-15T00:00:00.000Z",
          "start_time": "10:00",
          "end_time": "10:30",
          "slot_duration": 30
        },
        "prescription_generated": {
          "_id": "60d5ec49eb1d8e3f4c8b456a",
          "diagnosis_reason": "Seasonal allergies",
          "file_url": "https://prescriptions.philbox.com/rx-123.pdf",
          "digital_verification_id": "RX-2024-001234",
          "special_instructions": "Take with food",
          "valid_till": "2024-03-15T00:00:00.000Z",
          "created_at": "2024-02-15T10:25:00.000Z"
        },
        "transaction_id": "60d5ec49eb1d8e3f4c8b456f",
        "created_at": "2024-02-15T09:45:00.000Z",
        "updated_at": "2024-02-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Error Responses:**

```json
// Unauthorized (401)
{
  "status": "error",
  "message": "Unauthorized"
}

// Invalid Query Parameters (400)
{
  "status": "error",
  "message": "Limit must be at least 1"
}

// Server Error (500)
{
  "status": "error",
  "message": "Failed to retrieve past consultations",
  "error": "Error details"
}
```

---

### 2. Get Consultation Details

Get comprehensive details about a specific consultation including prescription, messages, and patient information.

**Endpoint:** `GET /api/doctor/consultations/:consultationId`

**Authentication:** Required (Doctor session)

**Path Parameters:**

| Parameter        | Type   | Required | Description                      |
| ---------------- | ------ | -------- | -------------------------------- |
| `consultationId` | string | Yes      | ID of the consultation (MongoDB) |

**Example Request:**

```bash
GET /api/doctor/consultations/60d5ec49eb1d8e3f4c8b4567
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Consultation details retrieved successfully",
  "data": {
    "appointment": {
      "_id": "60d5ec49eb1d8e3f4c8b4567",
      "appointment_type": "online",
      "appointment_request": "accepted",
      "status": "completed",
      "consultation_reason": "Follow-up checkup for allergies",
      "recording_url": "https://recordings.philbox.com/session-123.mp4",
      "notes": "Patient shows significant improvement. Continue medication.",
      "preferred_date": "2024-02-15T00:00:00.000Z",
      "preferred_time": "10:00",
      "patient_id": {
        "_id": "60d5ec49eb1d8e3f4c8b4568",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "contactNumber": "+1234567890",
        "profile_img_url": "https://example.com/profile.jpg",
        "dateOfBirth": "1990-05-15T00:00:00.000Z",
        "gender": "Male",
        "blood_group": "A+",
        "weight": 75,
        "height": 175,
        "patient_status": "active"
      },
      "slot_id": {
        "_id": "60d5ec49eb1d8e3f4c8b4569",
        "date": "2024-02-15T00:00:00.000Z",
        "start_time": "10:00",
        "end_time": "10:30",
        "slot_duration": 30
      },
      "prescription_generated": {
        "_id": "60d5ec49eb1d8e3f4c8b456a",
        "diagnosis_reason": "Seasonal allergies",
        "file_url": "https://prescriptions.philbox.com/rx-123.pdf",
        "digital_verification_id": "RX-2024-001234",
        "special_instructions": "Take antihistamine with meals",
        "valid_till": "2024-03-15T00:00:00.000Z",
        "created_at": "2024-02-15T10:25:00.000Z"
      },
      "transaction_id": "60d5ec49eb1d8e3f4c8b456f",
      "created_at": "2024-02-15T09:45:00.000Z",
      "updated_at": "2024-02-15T10:30:00.000Z"
    },
    "prescription": {
      "_id": "60d5ec49eb1d8e3f4c8b456a",
      "diagnosis_reason": "Seasonal allergies with mild respiratory symptoms",
      "digital_verification_id": "RX-2024-001234",
      "file_url": "https://prescriptions.philbox.com/rx-123.pdf",
      "special_instructions": "Take antihistamine with food. Use inhaler as needed.",
      "valid_till": "2024-03-15T00:00:00.000Z",
      "patient_id": "60d5ec49eb1d8e3f4c8b4568",
      "appointment_id": "60d5ec49eb1d8e3f4c8b4567",
      "prescription_items_ids": [
        {
          "_id": "60d5ec49eb1d8e3f4c8b456b",
          "medicine_id": {
            "_id": "60d5ec49eb1d8e3f4c8b456c",
            "name": "Cetirizine",
            "generic_name": "Cetirizine Hydrochloride",
            "manufacturer": "PharmaCorp",
            "strength": "10mg"
          },
          "form": "tablet",
          "frequency": "once-daily",
          "duration_days": 14,
          "quantity_prescribed": 14,
          "dosage_instructions": "Take one tablet daily in the evening",
          "created_at": "2024-02-15T10:25:00.000Z"
        },
        {
          "_id": "60d5ec49eb1d8e3f4c8b456d",
          "medicine_id": {
            "_id": "60d5ec49eb1d8e3f4c8b456e",
            "name": "Albuterol",
            "generic_name": "Albuterol Sulfate",
            "manufacturer": "RespiraMed",
            "strength": "100mcg"
          },
          "form": "inhaler",
          "frequency": "as-needed",
          "duration_days": 30,
          "quantity_prescribed": 1,
          "dosage_instructions": "Use 1-2 puffs when needed for breathing difficulty",
          "created_at": "2024-02-15T10:25:00.000Z"
        }
      ],
      "special_instructions": "Take antihistamine with food. Use inhaler as needed.",
      "valid_till": "2024-03-15T00:00:00.000Z",
      "patient_id": "60d5ec49eb1d8e3f4c8b4568",
      "appointment_id": "60d5ec49eb1d8e3f4c8b4567",
      "created_at": "2024-02-15T10:25:00.000Z",
      "updated_at": "2024-02-15T10:25:00.000Z"
    },
    "messages": [
      {
        "_id": "60d5ec49eb1d8e3f4c8b456f",
        "appointment_id": "60d5ec49eb1d8e3f4c8b4567",
        "sender_type": "doctor",
        "sender_id": "60d5ec49eb1d8e3f4c8b4570",
        "message": "Patient reports improved symptoms since last visit. Continuing with antihistamine therapy.",
        "created_at": "2024-02-15T10:15:00.000Z"
      },
      {
        "_id": "60d5ec49eb1d8e3f4c8b4571",
        "appointment_id": "60d5ec49eb1d8e3f4c8b4567",
        "sender_type": "patient",
        "sender_id": "60d5ec49eb1d8e3f4c8b4568",
        "message": "Thank you doctor. Should I continue avoiding outdoor activities?",
        "created_at": "2024-02-15T10:18:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

```json
// Consultation Not Found (404)
{
  "status": "error",
  "message": "Consultation not found or does not belong to this doctor"
}

// Invalid Consultation ID (400)
{
  "status": "error",
  "message": "Consultation ID is required"
}

// Unauthorized (401)
{
  "status": "error",
  "message": "Unauthorized"
}
```

---

### 3. Get Prescription Details

Retrieve detailed prescription information including all medicine items.

**Endpoint:** `GET /api/doctor/consultations/prescription/:prescriptionId`

**Authentication:** Required (Doctor session)

**Path Parameters:**

| Parameter        | Type   | Required | Description                      |
| ---------------- | ------ | -------- | -------------------------------- |
| `prescriptionId` | string | Yes      | ID of the prescription (MongoDB) |

**Example Request:**

```bash
GET /api/doctor/consultations/prescription/60d5ec49eb1d8e3f4c8b456a
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Prescription details retrieved successfully",
  "data": {
    "_id": "60d5ec49eb1d8e3f4c8b456a",
    "diagnosis_reason": "Seasonal allergies with mild respiratory symptoms",
    "digital_verification_id": "RX-2024-001234",
    "file_url": "https://prescriptions.philbox.com/rx-123.pdf",
    "patient_id": {
      "_id": "60d5ec49eb1d8e3f4c8b4568",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "contactNumber": "+1234567890",
      "blood_group": "A+",
      "weight": 75,
      "height": 175,
      "patient_status": "active"
    },
    "appointment_id": {
      "_id": "60d5ec49eb1d8e3f4c8b4567",
      "appointment_type": "online",
      "consultation_reason": "Follow-up checkup for allergies"
    },
    "prescription_items_ids": [
      {
        "_id": "60d5ec49eb1d8e3f4c8b456b",
        "medicine_id": {
          "_id": "60d5ec49eb1d8e3f4c8b456c",
          "name": "Cetirizine",
          "generic_name": "Cetirizine Hydrochloride",
          "manufacturer": "PharmaCorp",
          "strength": "10mg",
          "form": "tablet"
        },
        "form": "tablet",
        "frequency": "once-daily",
        "duration_days": 14,
        "quantity_prescribed": 14,
        "dosage_instructions": "Take one tablet daily in the evening",
        "created_at": "2024-02-15T10:25:00.000Z"
      }
    ],
    "special_instructions": "Take antihistamine with food. Avoid alcohol.\",
    "valid_till": "2024-03-15T00:00:00.000Z",
    "created_at": "2024-02-15T10:25:00.000Z",
    "updated_at": "2024-02-15T10:25:00.000Z"
  }
}
```

**Error Responses:**

```json
// Prescription Not Found (404)
{
  "status": "error",
  "message": "Prescription not found or does not belong to this doctor"
}

// Invalid Prescription ID (400)
{
  "status": "error",
  "message": "Prescription ID is required"
}
```

---

### 4. Get Consultation Statistics

Get comprehensive statistics about completed consultations.

**Endpoint:** `GET /api/doctor/consultations/statistics`

**Authentication:** Required (Doctor session)

**Query Parameters:**

| Parameter    | Type | Required | Description                          |
| ------------ | ---- | -------- | ------------------------------------ |
| `start_date` | date | No       | Calculate statistics from this date  |
| `end_date`   | date | No       | Calculate statistics until this date |

**Example Request:**

```bash
GET /api/doctor/consultations/statistics?start_date=2024-01-01&end_date=2024-12-31
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Consultation statistics retrieved successfully",
  "data": {
    "total_consultations": 156,
    "with_prescriptions": 142,
    "with_recordings": 89,
    "appointment_types": {
      "in-person": 67,
      "online": 89
    }
  }
}
```

**Error Responses:**

```json
// Invalid Date Range (400)
{
  "status": "error",
  "message": "End date must be after start date"
}

// Unauthorized (401)
{
  "status": "error",
  "message": "Unauthorized"
}
```

---

### 📊 Data Models

#### Consultation (Appointment)

```javascript
{
  _id: ObjectId,
  appointment_type: 'online' | 'in-person',
  appointment_request: 'accepted',
  status: 'completed',
  consultation_reason: String,
  recording_url: String (optional),
  patient_id: ObjectId (ref: Customer),
  doctor_id: ObjectId (ref: Doctor),
  slot_id: ObjectId (ref: Slot),
  prescription_generated: ObjectId (ref: PrescriptionGeneratedByDoctor),
  created_at: Date,
  updated_at: Date
}
```

#### Prescription Generated By Doctor

```javascript
{
  _id: ObjectId,
  diagnosis_reason: String (required),
  digital_verification_id: String (unique),
  file_url: String (PDF link),
  prescription_items_ids: [ObjectId] (ref: PrescriptionItem),
  patient_id: ObjectId (ref: Customer),
  doctor_id: ObjectId (ref: Doctor),
  appointment_id: ObjectId (ref: Appointment),
  created_at: Date,
  updated_at: Date
}
```

#### Prescription Item

```javascript
{
  _id: ObjectId,
  medicine_id: ObjectId (ref: MedicineItem),
  prescription_id: ObjectId (ref: PrescriptionGeneratedByDoctor),
  form: 'tablet' | 'syrup' | 'injection' | 'inhaler' | 'ointment',
  frequency: 'once-daily' | 'twice-daily' | 'thrice-daily' | 'four-times-daily' | 'as-needed',
  duration_days: Number,
  quantity_prescribed: Number,
  dosage_instructions: String,
  created_at: Date,
  updated_at: Date
}
```

---

### 🔍 Common Use Cases

#### View Recent Consultations

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?page=1&limit=20&sort_order=desc" \
  -H "Cookie: connect.sid=your-session-cookie"
```

#### Search Consultations by Patient Name

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?patient_name=John%20Doe" \
  -H "Cookie: connect.sid=your-session-cookie"
```

#### Filter by Date Range

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Cookie: connect.sid=your-session-cookie"
```

#### Get Full Consultation Details

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations/60d5ec49eb1d8e3f4c8b4567" \
  -H "Cookie: connect.sid=your-session-cookie"
```

#### Review Prescription History

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations/prescription/60d5ec49eb1d8e3f4c8b456a" \
  -H "Cookie: connect.sid=your-session-cookie"
```

#### Analyze Practice Statistics

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations/statistics?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Cookie: connect.sid=your-session-cookie"
```

---

### 🧪 Testing Workflow

**Step 1: Login as Doctor**

```bash
curl -X POST http://localhost:5000/api/doctor/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "doctor@example.com",
    "password": "YourPassword123"
  }'
```

**Step 2: Get Consultation Statistics**

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations/statistics" \
  -b cookies.txt
```

**Step 3: Get Past Consultations (Paginated)**

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?page=1&limit=10" \
  -b cookies.txt
```

**Step 4: Filter by Patient Name**

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?patient_name=John" \
  -b cookies.txt
```

**Step 5: Filter by Date Range**

```bash
curl -X GET "http://localhost:5000/api/doctor/consultations?start_date=2024-01-01&end_date=2024-12-31" \
  -b cookies.txt
```

**Step 6: Get Consultation Details**

```bash
# Replace consultationId with actual ID from previous response
curl -X GET "http://localhost:5000/api/doctor/consultations/60d5ec49eb1d8e3f4c8b4567" \
  -b cookies.txt
```

**Step 7: Get Prescription Details**

```bash
# Replace prescriptionId with actual ID
curl -X GET "http://localhost:5000/api/doctor/consultations/prescription/60d5ec49eb1d8e3f4c8b456a" \
  -b cookies.txt
```

**Step 8: Combined Filters**

```bash
# Get recent consultations for a specific patient
curl -X GET "http://localhost:5000/api/doctor/consultations?patient_name=John%20Doe&start_date=2024-01-01&end_date=2024-12-31&page=1&limit=20&sort_order=desc" \
  -b cookies.txt
```

---

## �📞 Support & Notes

### Important Notes

1. **Email Verification Required**: Doctors must verify their email before logging in
2. **Document Quality**: Upload clear, high-quality scans of all documents
3. **Admin Approval**: Applications are typically reviewed within 24-48 hours
4. **Session Management**: Sessions expire after 7 days of inactivity
5. **File Size Limits**: Respect file size limits to avoid upload failures
6. **Resubmission**: Rejected applications can be resubmitted with corrected documents
7. **Profile Management**: Doctors can update their profile anytime after completing onboarding
8. **OAuth Accounts**: Cannot change password for Google OAuth accounts
9. **Reviews Access**: Doctors have read-only access to patient reviews and cannot reply or modify them
10. **Past Consultations**: Doctors can access completed appointments with full details including prescriptions, recordings, and messages
11. **Email Notifications**: Doctors receive emails for:

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

**Last Updated:** February 28, 2026
**API Version:** 1.3.0
**Modules:** Authentication, Onboarding, Profile Management, Slots Management, Appointments, Reviews, Past Consultations
