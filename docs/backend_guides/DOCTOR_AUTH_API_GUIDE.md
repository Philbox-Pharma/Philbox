# Doctor Authentication & Onboarding API Guide

**Base URL:** `http://localhost:5000/api/doctor/auth`

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
  "fullName": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@doctormail.com",
  "password": "SecurePass123!",
  "contactNumber": "+923001234567",
  "gender": "Male",
  "dateOfBirth": "1985-03-20"
}
```

**Validation Rules:**

- `fullName`: Required, 3-50 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters
- `contactNumber`: Required, valid Pakistani phone format (+92...)
- `gender`: Required, must be "Male", "Female", or "Other"
- `dateOfBirth`: Required, must be valid ISO date in the past

**Success Response:**

```json
{
  "success": true,
  "message": "Doctor registered successfully. Please check your email to verify your account.",
  "data": {
    "doctor": {
      "_id": "64doctor123...",
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "gender": "Male",
      "dateOfBirth": "1985-03-20T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "is_Verified": false,
      "status": "active",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Dr. Ahmed Hassan",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Dr. Ahmed Hassan",
      "created_at": "2025-12-18T10:00:00.000Z"
    }
  }
}
```

---

### 1.2 Verify Email

**Endpoint:** `POST /api/doctor/auth/verify-email`
**Authentication:** Not Required

**Request Body:**

```json
{
  "token": "verification-token-from-email"
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
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "is_Verified": true
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
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "is_Verified": true,
      "status": "active",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Dr. Ahmed Hassan",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Dr. Ahmed Hassan",
      "gender": "Male",
      "dateOfBirth": "1985-03-20T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "roleId": {
        "_id": "64role123...",
        "name": "Doctor"
      }
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
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "status": "active"
    },
    "documents": {
      "_id": "64doc123...",
      "doctor_id": "64doctor123...",
      "cnic": "https://cloudinary.com/.../cnic.pdf",
      "medical_license": "https://cloudinary.com/.../license.pdf",
      "specialist_license": "https://cloudinary.com/.../specialist.pdf",
      "mbbs_md_degree": "https://cloudinary.com/.../degree.pdf",
      "experience_letters": "https://cloudinary.com/.../experience.pdf"
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
educational_details: [{"degree":"MBBS","institution":"Aga Khan University","yearOfCompletion":2010,"specialization":"General Medicine"},{"degree":"MD (Cardiology)","institution":"Dow University","yearOfCompletion":2015,"specialization":"Cardiology"}]

experience_details: [{"institution":"Aga Khan University Hospital","starting_date":"2015-01-01","ending_date":"2020-12-31","is_going_on":false},{"institution":"Liaquat National Hospital","starting_date":"2021-01-01","is_going_on":true}]

specialization: ["Cardiology","Interventional Cardiology"]

license_number: PMC-12345
affiliated_hospital: Aga Khan University Hospital
consultation_type: both
consultation_fee: 3000
onlineProfileURL: https://doctor-profile.com/ahmed

education_files: [File, File]
experience_files: [File, File]
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
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@doctormail.com",
      "is_Verified": true,
      "status": "active",
      "profile_img_url": "https://cloudinary.com/.../profile.jpg",
      "cover_img_url": "https://cloudinary.com/.../cover.jpg",
      "digital_signature": "https://cloudinary.com/.../signature.png",
      "educational_details": [
        {
          "degree": "MBBS",
          "institution": "Aga Khan University",
          "yearOfCompletion": 2010,
          "specialization": "General Medicine",
          "fileUrl": "https://cloudinary.com/.../degree1.pdf"
        },
        {
          "degree": "MD (Cardiology)",
          "institution": "Dow University",
          "yearOfCompletion": 2015,
          "specialization": "Cardiology",
          "fileUrl": "https://cloudinary.com/.../degree2.pdf"
        }
      ],
      "experience_details": [
        {
          "institution": "Aga Khan University Hospital",
          "starting_date": "2015-01-01T00:00:00.000Z",
          "ending_date": "2020-12-31T00:00:00.000Z",
          "is_going_on": false,
          "institution_img_url": "https://cloudinary.com/.../hospital1.jpg"
        },
        {
          "institution": "Liaquat National Hospital",
          "starting_date": "2021-01-01T00:00:00.000Z",
          "is_going_on": true,
          "institution_img_url": "https://cloudinary.com/.../hospital2.jpg"
        }
      ],
      "specialization": ["Cardiology", "Interventional Cardiology"],
      "license_number": "PMC-12345",
      "affiliated_hospital": "Aga Khan University Hospital",
      "consultation_type": "both",
      "consultation_fee": 3000,
      "onlineProfileURL": "https://doctor-profile.com/ahmed",
      "averageRating": 0
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
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
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

## Doctor Account Status

### Account Status

- `active`: Doctor account is active and can use the platform
- `suspended/freezed`: Account temporarily suspended
- `blocked/removed`: Account permanently blocked

### Verification Flag

- `is_Verified`: Email verification status (true/false)

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

### Profile Status Check

```javascript
const checkProfileStatus = (doctor) => {
  if (!doctor.is_Verified) return "verify-email";
  if (!doctor.educational_details || doctor.educational_details.length === 0)
    return "complete-profile";
  if (doctor.status !== "active") return "account-suspended";
  return "dashboard";
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

  // Education (as JSON string)
  const educationData = data.education.map((edu) => ({
    degree: edu.degree,
    institution: edu.institution,
    yearOfCompletion: edu.year,
    specialization: edu.specialization,
  }));
  formData.append("educational_details", JSON.stringify(educationData));

  // Experience (as JSON string)
  const experienceData = data.experience.map((exp) => ({
    institution: exp.institution,
    starting_date: exp.startDate,
    ending_date: exp.endDate,
    is_going_on: exp.isOngoing,
  }));
  formData.append("experience_details", JSON.stringify(experienceData));

  // Specializations (as JSON string)
  formData.append("specialization", JSON.stringify(data.specializations));

  // Other fields
  formData.append("license_number", data.licenseNumber);
  formData.append("affiliated_hospital", data.affiliatedHospital);
  formData.append("consultation_type", data.consultationType);
  formData.append("consultation_fee", data.consultationFee);
  formData.append("onlineProfileURL", data.onlineProfileURL);

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
