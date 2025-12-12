# Doctor Authentication API Testing Guide

## Overview

Complete testing guide for Doctor Authentication and Onboarding endpoints. Uses **SESSION-BASED** authentication with email verification and 2-step onboarding. All endpoints are rate-limited via `authRoutesLimiter` middleware.

---

## Base URL

```
http://localhost:5000/api/doctor/auth
```

---

## Authentication Method

- **Type:** Session-Based (NOT JWT)
- **Session Storage:** MongoDB (connect-mongo)
- **Cookie:** `connect.sid` (HttpOnly, Secure in production)

## Doctor Onboarding Flow (2-Step Process)

**Step 1: Registration & Email Verification**

1. Doctor registers with basic info (email, password, fullName, contactNumber, gender, dateOfBirth)
2. Account created with `account_status = 'suspended/freezed'` (default, cannot login until complete)
3. Verification email sent with token
4. Doctor verifies email

**Step 2: Application Submission & Admin Approval**

1. Doctor submits application with documents (license, hospital affiliation, etc.)
2. System checks admin approval
3. If approved: Doctor can complete profile (education, experience, specialization)
4. Doctor completes profile and gets full account access

**Status States During Onboarding:**

- `register` → Initial state
- `submit-application` → Ready to submit documents
- `waiting-approval` → Documents submitted, awaiting admin review
- `resubmit-application` → Admin rejected, can resubmit
- `complete-profile` → Admin approved, must complete education/experience/specialization
- `dashboard` → Fully onboarded, can login and use system

---

## Endpoints

### 1. Doctor Registration

**Endpoint:** `POST /register`

**Description:** Create new doctor account. Account starts in suspended state until onboarding completes.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "fullName": "Dr. Sarah Johnson",
  "contactNumber": "+1234567890",
  "gender": "female",
  "dateOfBirth": "1985-06-20"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "doctor": {
      "_id": "65a9bcdefghijklmnopqrs",
      "fullName": "Dr. Sarah Johnson",
      "email": "doctor@example.com",
      "contactNumber": "+1234567890",
      "gender": "female",
      "dateOfBirth": "1985-06-20",
      "isVerified": "no",
      "account_status": "suspended/freezed",
      "onboarding_status": "register"
    }
  }
}
```

**Email Sent to Doctor:**

```
Subject: Verify your Email
Body: Click the verification link with token: abc123def456...
Link expires in: 24 hours
```

**Error Response (409):**

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already registered"
}
```

**Validation Rules:**

- Email must be valid format and unique
- Password must be at least 8 characters
- Passwords must match (password === confirmPassword)
- fullName is required
- contactNumber must be valid format
- gender is required
- dateOfBirth is required

---

### 2. Verify Email

**Endpoint:** `GET /verify-email?token=abc123def456`

**Description:** Verify doctor email using token sent in registration email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Query Parameters:**

```
token: verification_token_from_email (required)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "doctor": {
      "_id": "65a9bcdefghijklmnopqrs",
      "fullName": "Dr. Sarah Johnson",
      "email": "doctor@example.com",
      "isVerified": "yes",
      "onboarding_status": "submit-application"
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired verification token"
}
```

**Validation Rules:**

- Token must be valid
- Token must not be expired (24 hour expiry)
- Doctor must exist in database

---

### 3. Doctor Login

**Endpoint:** `POST /login`

**Description:** Authenticate doctor with email and password. Creates session. Doctor must complete onboarding before full access.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "doctor@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "nextStep": "complete-profile",
    "doctor": {
      "_id": "65a9bcdefghijklmnopqrs",
      "fullName": "Dr. Sarah Johnson",
      "email": "doctor@example.com",
      "contactNumber": "+1234567890",
      "isVerified": "yes",
      "account_status": "suspended/freezed",
      "onboarding_status": "complete-profile",
      "profile_img_url": null
    }
  }
}
```

**Session Created:**

```
Header: Set-Cookie: connect.sid=<session_id>; Path=/; HttpOnly; Secure
Session Data Stored:
  - session.doctorId = doctor._id
  - session.role = "doctor"
  - session.status = doctor.account_status
```

**Important Notes:**

- Doctor account_status defaults to 'suspended/freezed' until onboarding completes
- Doctor cannot fully use system until onboarding_status = 'dashboard'
- nextStep indicates where doctor is in onboarding process:
  - `submit-application`: Doctor must submit documents
  - `waiting-approval`: Documents submitted, waiting for admin review
  - `resubmit-application`: Admin rejected, needs to resubmit
  - `complete-profile`: Admin approved, doctor must complete education/experience/specialization
  - `dashboard`: Fully onboarded, can access full system

**Error Response (403 - Account Suspended):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Account is suspended. Please complete your profile first."
}
```

**Error Response (401 - Invalid Credentials):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

**Validation Rules:**

- Email must be valid format
- Password must be provided
- Email must be registered
- Password must match stored password hash
- Email must be verified
- Account must be in valid state (not suspended for other reasons)

---

### 4. Submit Application (Document Upload) - Step 1 of Onboarding

**Endpoint:** `POST /submit-application`

**Description:** Submit required medical documents for admin verification. Doctor must have verified email first.

**Authentication:** ✅ Required (Session-Based)

**Request Headers:**

```json
{
  "Content-Type": "multipart/form-data",
  "Cookie": "connect.sid=<session_id>"
}
```

**Request Body (Form Data):**

```
cnic: <file> (national ID document)
medical_license: <file> (current medical license)
specialist_license: <file> (specialist certification if applicable)
mbbs_md_degree: <file> (medical degree certificate)
experience_letters: <file> (letters from previous institutions)
```

**Success Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Application submitted successfully. Awaiting admin review.",
  "data": {
    "application": {
      "_id": "65a9bcdefghijklmnopqrs1",
      "doctorId": "65a9bcdefghijklmnopqrs",
      "status": "pending",
      "documents": {
        "cnic": "https://cloudinary.com/doctor/docs/cnic.pdf",
        "medical_license": "https://cloudinary.com/doctor/docs/license.pdf",
        "specialist_license": "https://cloudinary.com/doctor/docs/specialist.pdf",
        "mbbs_md_degree": "https://cloudinary.com/doctor/docs/degree.pdf",
        "experience_letters": "https://cloudinary.com/doctor/docs/experience.pdf"
      },
      "submittedAt": "2025-12-12T14:30:00Z"
    }
  }
}
```

**Doctor's onboarding_status changes to:** `waiting-approval`

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "All required documents must be submitted"
}
```

**Error Response (403):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Email must be verified before submitting application"
}
```

**File Requirements:**

- CNIC: PDF, JPG, PNG (max 5MB)
- Medical License: PDF (max 10MB)
- Specialist License: PDF (optional, max 10MB)
- MBBS/MD Degree: PDF (max 10MB)
- Experience Letters: PDF (max 10MB)

---

### 5. Complete Profile (Step 2 of Onboarding) - After Admin Approval

**Endpoint:** `POST /complete-profile`

**Description:** Complete doctor profile with education, experience, and specialization details. Only available after admin approves application.

**Authentication:** ✅ Required (Session-Based)

**Request Headers:**

```json
{
  "Content-Type": "multipart/form-data",
  "Cookie": "connect.sid=<session_id>"
}
```

**Request Body (Form Data):**

```
specialization: "Cardiology" (required, from array of options)
consultation_fee: 2500 (required, positive number)
license_number: "LIC123456" (required)
affiliated_hospital: "City Medical Center" (required)
consultation_type: "online" or "in-person" (required)

educational_details: JSON array
[
  {
    "degree": "MBBS",
    "institution": "Medical College University",
    "yearOfCompletion": 2010,
    "specialization": "General",
    "fileUrl": <file>
  },
  {
    "degree": "MD",
    "institution": "Specialized Medical Institute",
    "yearOfCompletion": 2013,
    "specialization": "Cardiology",
    "fileUrl": <file>
  }
]

experience_details: JSON array
[
  {
    "institution": "City Hospital",
    "starting_date": "2013-01-15",
    "ending_date": "2018-12-31",
    "institution_img_url": <file>,
    "is_going_on": false
  },
  {
    "institution": "National Heart Center",
    "starting_date": "2019-01-01",
    "ending_date": null,
    "institution_img_url": <file>,
    "is_going_on": true
  }
]

profile_img: <file> (profile picture)
digital_signature: <file> (signature image)
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile completed successfully. You are now active.",
  "data": {
    "doctor": {
      "_id": "65a9bcdefghijklmnopqrs",
      "fullName": "Dr. Sarah Johnson",
      "email": "doctor@example.com",
      "specialization": ["Cardiology"],
      "license_number": "LIC123456",
      "affiliated_hospital": "City Medical Center",
      "consultation_type": "online",
      "consultation_fee": 2500,
      "educational_details": [
        {
          "degree": "MBBS",
          "institution": "Medical College University",
          "yearOfCompletion": 2010,
          "specialization": "General",
          "fileUrl": "https://cloudinary.com/doctor/education/mbbs.pdf"
        }
      ],
      "experience_details": [
        {
          "institution": "City Hospital",
          "starting_date": "2013-01-15",
          "ending_date": "2018-12-31",
          "institution_img_url": "https://cloudinary.com/doctor/experience/hospital.jpg",
          "is_going_on": false
        }
      ],
      "profile_img_url": "https://cloudinary.com/doctor/profile/sarah.jpg",
      "digital_signature": "https://cloudinary.com/doctor/signature/sarah.jpg",
      "account_status": "active",
      "onboarding_status": "dashboard",
      "isVerified": "yes",
      "completedAt": "2025-12-12T15:00:00Z"
    }
  }
}
```

**Account Changes After Completion:**

```
account_status: 'suspended/freezed' → 'active'
onboarding_status: 'complete-profile' → 'dashboard'
isVerified: 'no' → 'yes'
Profile fully accessible and can accept appointments
```

**Error Response (403 - Not Approved):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Your application is still pending admin review"
}
```

**Error Response (403 - Rejected):**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Your application was rejected. Please resubmit application."
}
```

**Error Response (400 - Validation):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "At least one education record is required"
}
```

**Validation Rules:**

- Specialization is required (array with at least 1 item)
- Consultation fee is required (positive number)
- License number is required
- Affiliated hospital is required
- Consultation type must be 'online' or 'in-person'
- At least 1 education record required
- Educational details must have: degree, institution, yearOfCompletion, specialization, fileUrl
- At least 1 experience record required
- Experience details must have: institution, starting_date, institution_img_url, is_going_on
- Profile image is required
- Digital signature is required

---

### 6. Forget Password

**Endpoint:** `POST /forget-password`

**Description:** Request password reset. Doctor will receive reset token via email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "doctor@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset link sent to your email"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Doctor not found with this email"
}
```

**Validation Rules:**

- Email must be valid format
- Email must exist in database

---

### 7. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset password using token sent to email.

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "email": "doctor@example.com",
  "resetToken": "abc123def456ghi789",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "doctor": {
      "_id": "65a9bcdefghijklmnopqrs",
      "email": "doctor@example.com",
      "fullName": "Dr. Sarah Johnson"
    }
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid or expired reset token"
}
```

**Validation Rules:**

- Email must be valid
- Reset token must be valid
- Reset token must not be expired (30 minute expiry)
- Passwords must match
- New password must be different from old password

---

### 8. Logout

**Endpoint:** `POST /logout`

**Description:** Logout doctor and invalidate session. Clears session cookie.

**Authentication:** ✅ Required (Session-Based)

**Request Headers:**

```json
{
  "Content-Type": "application/json",
  "Cookie": "connect.sid=<session_id>"
}
```

**Request Body:**

```json
{}
```

**Success Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

**Session Cleared:**

```
Header: Set-Cookie: connect.sid=; Path=/; Expires=<past_date>
Session Data: All session data deleted from MongoDB
```

**Error Response (401):**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Not authenticated - No valid session"
}
```

---

## Doctor Onboarding Status Flow

```
┌─────────────────┐
│   Registered    │ ◄── Doctor creates account with email/password
│ account_status: │
│ suspended/freezed
└────────┬────────┘
         │
    [Email Verification]
         │
         ▼
┌──────────────────────┐
│  Email Verified      │ ◄── Doctor verifies email with token
│  isVerified: "yes"   │
│  onboarding_status:  │
│  "submit-application"│
└────────┬─────────────┘
         │
  [Submit Application]
  (Upload Documents)
         │
         ▼
┌──────────────────────┐
│ Application Pending  │
│  onboarding_status:  │
│ "waiting-approval"   │ ◄── Admin reviews documents
└────────┬─────────────┘
         │
    ┌────┴────────┐
    │             │
    ▼             ▼
REJECTED    APPROVED
    │             │
    │         [Complete Profile]
    │         (Add Education/
    │          Experience/
    │          Specialization)
    │             │
    │             ▼
    │    ┌──────────────────┐
    │    │ Profile Complete │
    │    │ account_status:  │
    │    │ "active"         │ ◄── Doctor fully onboarded
    │    │ onboarding_status│
    │    │ "dashboard"      │
    │    └──────────────────┘
    │
    ▼
┌──────────────────┐
│ Can Resubmit     │ ◄── Back to submit-application
│ onboarding_status
│ "resubmit-appli."│
└──────────────────┘
```

---

## Testing Checklist

### Prerequisites

- [ ] Server running on port 5000
- [ ] MongoDB connected and session store available
- [ ] Email service configured for verification and reset
- [ ] Cloudinary configured for document uploads
- [ ] Session middleware with connect-mongo enabled
- [ ] Admin backend ready to approve/reject applications

### Registration & Email Verification

- [ ] Register with valid data creates account (account_status = suspended/freezed)
- [ ] Registration sends verification email with token
- [ ] Verify email with valid token marks doctor as verified
- [ ] Verify email fails with expired token (>24 hours)
- [ ] Register fails with duplicate email
- [ ] Register fails with invalid email format
- [ ] Register fails with mismatched passwords
- [ ] Doctor cannot login until email verified

### Login & Session Management

- [ ] Login with verified email creates session
- [ ] Session cookie (connect.sid) is set
- [ ] Session contains doctorId, role, status
- [ ] Login fails with unverified email
- [ ] Login fails with suspended account
- [ ] nextStep correctly shows current onboarding state
- [ ] Logout destroys session
- [ ] Subsequent requests after logout fail

### Application Submission

- [ ] Submit application uploads all documents
- [ ] Documents are uploaded to Cloudinary
- [ ] onboarding_status changes to "waiting-approval"
- [ ] Submit fails without verified email
- [ ] Submit fails if documents missing
- [ ] Admin can review submitted documents

### Profile Completion

- [ ] Cannot complete profile while "waiting-approval"
- [ ] Cannot complete profile if application rejected
- [ ] Can complete profile after admin approval
- [ ] Profile completion accepts arrays for education/experience
- [ ] account_status changes to "active" after completion
- [ ] onboarding_status changes to "dashboard" after completion
- [ ] Doctor can login with full access after completion

### Password Reset

- [ ] Forget password sends reset email
- [ ] Reset password with valid token updates password
- [ ] Reset password fails with invalid token
- [ ] Reset password fails with expired token (>30 minutes)
- [ ] Reset password fails with mismatched passwords

### Security Tests

- [ ] Rate limiting on register
- [ ] Rate limiting on login
- [ ] Rate limiting on forget-password
- [ ] Password never returned in responses
- [ ] Documents securely stored in Cloudinary
- [ ] Reset token is single-use
- [ ] Session expires after 7 days
- [ ] HttpOnly flag prevents JavaScript access
- [ ] Secure flag set in HTTPS (production)
- [ ] SameSite attribute set to Strict
- [ ] Cannot submit application twice

### Profile Completion

- [ ] Cannot complete profile before admin approval
- [ ] Complete profile after approval succeeds
- [ ] Profile completion with all required fields succeeds
- [ ] Profile completion with image uploads succeeds
- [ ] Status changes to active after completion
- [ ] Cannot complete profile twice

### Password Reset

- [ ] Forget password sends reset email
- [ ] Reset password with valid token succeeds
- [ ] Reset password fails with invalid token

### Session Management

- [ ] Logout invalidates token
- [ ] Requests after logout return 401

---

## Performance Benchmarks

| Endpoint           | Method | Expected Response Time       |
| ------------------ | ------ | ---------------------------- |
| Register           | POST   | < 500ms                      |
| Verify Email       | POST   | < 300ms                      |
| Login              | POST   | < 400ms                      |
| Submit Application | POST   | < 3000ms (with file uploads) |
| Complete Profile   | POST   | < 3000ms (with file uploads) |
| Logout             | POST   | < 100ms                      |

---

## File Upload Limits

| Document Type      | Max Size | Allowed Formats |
| ------------------ | -------- | --------------- |
| CNIC               | 5MB      | PDF, JPG, PNG   |
| Medical License    | 10MB     | PDF             |
| Specialist License | 10MB     | PDF             |
| MBBS/MD Degree     | 10MB     | PDF             |
| Experience Letters | 10MB     | PDF             |
| Education Files    | 50MB     | PDF, JPG, PNG   |
| Profile Image      | 5MB      | JPG, PNG        |
