# Doctor Authentication & Onboarding API Guide

## Base URL

```
http://localhost:5000/api/doctor/auth
```

## Rate Limiting

All authentication routes are rate-limited to prevent abuse.

---

## Doctor Onboarding Flow

The doctor onboarding process involves multiple steps:

1. **Registration** - Basic account creation with email/password
2. **Email Verification** - Verify email with OTP
3. **Login** - Access account
4. **Submit Application** - Upload required documents for admin verification
5. **Admin Verification** - Admin reviews and approves documents
6. **Complete Profile** - Add education, experience, and specialization details

---

## 1. Registration & Email Verification

### 1.1 Register New Doctor

**Endpoint:** `POST /api/doctor/auth/register`
**Authentication:** Not Required

**Request Body:**

```json
{
  "name": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@doctormail.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "gender": "male",
  "date_of_birth": "1985-03-20",
  "contact_number": "+923001234567"
}
```

**Validation Rules:**

- `name`: Required, 3-50 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must include uppercase, lowercase, number, special character
- `password_confirmation`: Must match password
- `gender`: Required, must be "male", "female", or "other"
- `date_of_birth`: Required, must be 23+ years old (minimum age for medical professionals)
- `contact_number`: Required, valid phone format

**Success Response:**

```json
{
  "success": true,
  "message": "Doctor registered successfully. Please check your email to verify your account.",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "gender": "male",
      "date_of_birth": "1985-03-20T00:00:00.000Z",
      "contact_number": "+923001234567",
      "email_verified": false,
      "is_active": false,
      "verification_status": "pending",
      "profile_completed": false,
      "onboarding_step": 1,
      "created_at": "2025-12-18T10:00:00.000Z"
    }
  }
}
```

**Onboarding Steps:**

- `1`: Email verification pending
- `2`: Document submission pending
- `3`: Admin verification pending
- `4`: Profile completion pending
- `5`: Fully onboarded

---

### 1.2 Verify Email

**Endpoint:** `POST /api/doctor/auth/verify-email`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "ahmed.hassan@doctormail.com",
  "otp": "123456"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "email_verified": true,
      "onboarding_step": 2
    }
  }
}
```

---

## 2. Doctor Login

### 2.1 Login with Email & Password

**Endpoint:** `POST /api/doctor/auth/login`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "ahmed.hassan@doctormail.com",
  "password": "SecurePass123!"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "email_verified": true,
      "is_active": true,
      "verification_status": "pending",
      "profile_completed": false,
      "onboarding_step": 2,
      "profile_img": null,
      "cover_img": null,
      "gender": "male",
      "date_of_birth": "1985-03-20T00:00:00.000Z",
      "contact_number": "+923001234567"
    }
  }
}
```

**Session Created:**

- `req.session.doctorId`: Doctor ID
- `req.session.role`: "doctor"

---

### 2.2 Google OAuth Login

**Endpoint:** `GET /api/doctor/auth/google`
**Authentication:** Not Required

Redirects to Google OAuth consent screen.

**OAuth Callback:**
`GET /api/doctor/auth/google/callback`

---

## 3. Document Submission (Onboarding Step 2)

### 3.1 Submit Application Documents

**Endpoint:** `POST /api/doctor/auth/submit-application`
**Authentication:** Required (Doctor must be logged in)
**Content-Type:** `multipart/form-data`

**Required Documents:**

- `cnic`: CNIC/National ID Card (front & back scan)
- `medical_license`: Medical practice license
- `specialist_license`: Specialist certification (if applicable)
- `mbbs_md_degree`: MBBS/MD degree certificate
- `experience_letters`: Experience/recommendation letters

**Request Body (Form Data):**

```
cnic: [File]
medical_license: [File]
specialist_license: [File]
mbbs_md_degree: [File]
experience_letters: [File]
```

**Success Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully. Your documents are under review by admin.",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "verification_status": "pending",
      "onboarding_step": 3,
      "application": {
        "_id": "64app123...",
        "doctor_id": "64doctor123...",
        "status": "pending",
        "submission_date": "2025-12-18T10:30:00.000Z"
      },
      "documents": {
        "_id": "64doc123...",
        "cnic": "https://cloudinary.com/.../cnic.pdf",
        "medical_license": "https://cloudinary.com/.../license.pdf",
        "specialist_license": "https://cloudinary.com/.../specialist.pdf",
        "mbbs_md_degree": "https://cloudinary.com/.../degree.pdf",
        "experience_letters": "https://cloudinary.com/.../experience.pdf"
      }
    }
  }
}
```

**Admin Verification Process:**
After submission, an admin will:

- Review all uploaded documents
- Approve or reject the application
- Update `verification_status` to "approved" or "rejected"

---

## 4. Complete Profile (Onboarding Step 4)

### 4.1 Complete Doctor Profile

**Endpoint:** `POST /api/doctor/auth/complete-profile`
**Authentication:** Required (Doctor must be logged in and documents approved)
**Content-Type:** `multipart/form-data`

**Required Fields:**

- Education history
- Work experience
- Specializations
- Biography
- Profile and cover images
- Digital signature

**Request Body (Form Data):**

```
education[0][degree]: MBBS
education[0][institution]: Aga Khan University
education[0][year]: 2010
education[1][degree]: MD (Cardiology)
education[1][institution]: Dow University
education[1][year]: 2015

experience[0][institution]: Aga Khan University Hospital
experience[0][designation]: Cardiologist
experience[0][years]: 5

specialization[0]: Cardiology
specialization[1]: Interventional Cardiology

biography: Experienced cardiologist with 8 years of practice...

education_files: [File, File, ...]
experience_files: [File, File, ...]
digital_signature: [File]
profile_img: [File]
cover_img: [File]
```

**Success Response:**

```json
{
  "success": true,
  "message": "Profile completed successfully. You are now fully onboarded!",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "name": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "email_verified": true,
      "is_active": true,
      "verification_status": "approved",
      "profile_completed": true,
      "onboarding_step": 5,
      "profile_img": "https://cloudinary.com/.../profile.jpg",
      "cover_img": "https://cloudinary.com/.../cover.jpg",
      "digital_signature": "https://cloudinary.com/.../signature.png",
      "biography": "Experienced cardiologist with 8 years of practice...",
      "education": [
        {
          "degree": "MBBS",
          "institution": "Aga Khan University",
          "year": 2010,
          "certificate_url": "https://cloudinary.com/.../degree1.pdf"
        },
        {
          "degree": "MD (Cardiology)",
          "institution": "Dow University",
          "year": 2015,
          "certificate_url": "https://cloudinary.com/.../degree2.pdf"
        }
      ],
      "experience": [
        {
          "institution": "Aga Khan University Hospital",
          "designation": "Cardiologist",
          "years": 5,
          "institution_image_url": "https://cloudinary.com/.../hospital.jpg"
        }
      ],
      "specialization": ["Cardiology", "Interventional Cardiology"]
    }
  }
}
```

---

## 5. Password Management

### 5.1 Forget Password

**Endpoint:** `POST /api/doctor/auth/forget-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "ahmed.hassan@doctormail.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email"
}
```

---

### 5.2 Reset Password

**Endpoint:** `POST /api/doctor/auth/reset-password`
**Authentication:** Not Required

**Request Body:**

```json
{
  "email": "ahmed.hassan@doctormail.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Password reset successful. You can now log in with your new password."
}
```

---

## 6. Session Management

### 6.1 Logout

**Endpoint:** `POST /api/doctor/auth/logout`
**Authentication:** Required

**Success Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Doctor Onboarding States

### Verification Status

- `pending`: Application submitted, awaiting admin review
- `approved`: Documents verified by admin
- `rejected`: Application rejected by admin

### Onboarding Steps

| Step | Description         | Status                                     |
| ---- | ------------------- | ------------------------------------------ |
| 1    | Email Verification  | `email_verified: false`                    |
| 2    | Document Submission | `verification_status: null`                |
| 3    | Admin Verification  | `verification_status: pending`             |
| 4    | Profile Completion  | `profile_completed: false`                 |
| 5    | Fully Onboarded     | `profile_completed: true, is_active: true` |

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
- `403` - Forbidden (documents not approved)
- `404` - Not Found (user doesn't exist)
- `409` - Conflict (email already exists)
- `500` - Server Error

---

## Frontend Integration Notes

### Onboarding Flow UI

```javascript
const getOnboardingStep = (doctor) => {
  if (!doctor.email_verified) return "verify-email";
  if (doctor.onboarding_step === 2) return "submit-documents";
  if (doctor.onboarding_step === 3) return "pending-verification";
  if (doctor.onboarding_step === 4) return "complete-profile";
  if (doctor.onboarding_step === 5) return "dashboard";
};
```

### Document Upload Example

```javascript
const submitApplication = async (files) => {
  const formData = new FormData();
  formData.append("cnic", files.cnic);
  formData.append("medical_license", files.medicalLicense);
  formData.append("specialist_license", files.specialistLicense);
  formData.append("mbbs_md_degree", files.degree);
  formData.append("experience_letters", files.experienceLetters);

  const response = await api.post("/doctor/auth/submit-application", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
```

### Profile Completion Example

```javascript
const completeProfile = async (data) => {
  const formData = new FormData();

  // Education
  data.education.forEach((edu, idx) => {
    formData.append(`education[${idx}][degree]`, edu.degree);
    formData.append(`education[${idx}][institution]`, edu.institution);
    formData.append(`education[${idx}][year]`, edu.year);
  });

  // Experience
  data.experience.forEach((exp, idx) => {
    formData.append(`experience[${idx}][institution]`, exp.institution);
    formData.append(`experience[${idx}][designation]`, exp.designation);
    formData.append(`experience[${idx}][years]`, exp.years);
  });

  // Specializations
  data.specializations.forEach((spec, idx) => {
    formData.append(`specialization[${idx}]`, spec);
  });

  // Biography
  formData.append("biography", data.biography);

  // Files
  data.educationFiles.forEach((file) =>
    formData.append("education_files", file),
  );
  data.experienceFiles.forEach((file) =>
    formData.append("experience_files", file),
  );
  formData.append("digital_signature", data.digitalSignature);
  formData.append("profile_img", data.profileImg);
  formData.append("cover_img", data.coverImg);

  const response = await api.post("/doctor/auth/complete-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
```
