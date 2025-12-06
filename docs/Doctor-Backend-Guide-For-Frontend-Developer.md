# Doctor Authentication API - Mock Data

## Base URL

```
http://localhost:5000/api/doctor/auth
```

---

## 1. Register

**Endpoint:** `POST /register`

### Request Body

```json
{
  "fullName": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@example.com",
  "password": "SecurePass123!",
  "contactNumber": "+923001234567",
  "gender": "Male",
  "dateOfBirth": "1985-03-15"
}
```

### Response (201)

```json
{
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "nextStep": "verify-email"
  }
}
```

### Error Response (409)

```json
{
  "status": 409,
  "message": "Email already exists"
}
```

---

## 2. Verify Email

**Endpoint:** `POST /verify-email`

### Request Body

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "nextStep": "login"
  }
}
```

### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid or expired verification token"
}
```

---

## 3. Login

**Endpoint:** `POST /login`

### Request Body

```json
{
  "email": "ahmed.hassan@example.com",
  "password": "SecurePass123!"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "doctor": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Dr. Ahmed Hassan",
      "email": "ahmed.hassan@example.com",
      "gender": "Male",
      "dateOfBirth": "1985-03-15T00:00:00.000Z",
      "contactNumber": "+923001234567",
      "account_status": "suspended/freezed",
      "is_Verified": true,
      "onboarding_status": "pending",
      "profile_img_url": "https://avatar.iran.liara.run/username?username=Dr. Ahmed Hassan",
      "cover_img_url": "https://placehold.co/1920x480/EAEAEA/000000?text=Dr. Ahmed Hassan",
      "averageRating": 0,
      "educational_details": [],
      "specialization": [],
      "experience_details": [],
      "oauth_provider": "local",
      "created_at": "2025-12-01T10:30:00.000Z",
      "updated_at": "2025-12-06T08:15:00.000Z"
    },
    "accountStatus": "suspended/freezed",
    "nextStep": "submit-application"
  }
}
```

### Error Responses

```json
// Invalid credentials (401)
{
  "status": 401,
  "message": "Invalid Credentials"
}

// Email not verified (403)
{
  "status": 403,
  "message": "Please verify your email first"
}

// Account blocked (403)
{
  "status": 403,
  "message": "Your account has been blocked"
}
```

---

## 4. Submit Application (Document Upload)

**Endpoint:** `POST /submit-application`

**Note:** Requires authentication. Include session cookie.

### Request Body (multipart/form-data)

```
cnic: [File - image/pdf]
medical_license: [File - image/pdf]
specialist_license: [File - image/pdf] (optional)
mbbs_md_degree: [File - image/pdf]
experience_letters: [File - image/pdf] (optional)
```

### Response (200)

```json
{
  "status": 200,
  "message": "Application submitted successfully. Please wait for admin approval.",
  "data": {
    "success": true,
    "message": "Application submitted successfully. Please wait for admin approval.",
    "documentId": "507f1f77bcf86cd799439012",
    "nextStep": "waiting-approval"
  }
}
```

### Error Responses

```json
// Missing files (400)
{
  "status": 400,
  "message": "Missing Required Documents",
  "data": {
    "missingFiles": ["MEDICAL LICENSE", "MBBS MD DEGREE"]
  },
  "error": "Missing required documents: MEDICAL LICENSE, MBBS MD DEGREE"
}

// Already submitted (400)
{
  "status": 400,
  "message": "Application Already Submitted",
  "error": "Your documents are already pending review. Please wait for admin approval."
}

// Unauthorized (401)
{
  "status": 401,
  "message": "Unauthorized",
  "error": "Doctor authentication required"
}
```

---

## 5. Complete Profile

**Endpoint:** `POST /complete-profile`

**Note:** Requires authentication. Include session cookie. Only available after admin approves documents.

### Request Body (multipart/form-data)

```
educational_details: '[{"degree":"MBBS","institution":"King Edward Medical University","yearOfCompletion":2010,"specialization":"General Medicine"}]'

specialization: '["Cardiology","Internal Medicine"]'

experience_details: '[{"institution":"Jinnah Hospital","starting_date":"2011-01-15","ending_date":"2015-12-31","is_going_on":false},{"institution":"Shaukat Khanum Hospital","starting_date":"2016-01-01","ending_date":null,"is_going_on":true}]'

license_number: "PMC-12345-A"

affiliated_hospital: "Shaukat Khanum Memorial Cancer Hospital"

consultation_type: "both"

consultation_fee: 3000

onlineProfileURL: "https://linkedin.com/in/dr-ahmed-hassan"

education_files: [File, File] (multiple files)
experience_files: [File, File] (multiple files)
digital_signature: [File] (single file)
profile_img: [File] (single file)
cover_img: [File] (single file)
```

### Response (200)

```json
{
  "status": 200,
  "message": "Profile completed successfully. Welcome to PhilBox!",
  "data": {
    "success": true,
    "message": "Profile completed successfully. Welcome to PhilBox!",
    "nextStep": "dashboard"
  }
}
```

### Error Responses

```json
// Not approved yet (403)
{
  "status": 403,
  "message": "Application Not Approved",
  "error": "Your document verification is still pending. Please wait for admin approval before completing your profile."
}

// Profile already completed (400)
{
  "status": 400,
  "message": "Profile Already Completed",
  "error": "Your profile has already been completed."
}

// Validation error (400)
{
  "status": 400,
  "message": "Validation Failed",
  "error": "Educational details must be valid JSON"
}
```

---

## 6. Forget Password

**Endpoint:** `POST /forget-password`

### Request Body

```json
{
  "email": "ahmed.hassan@example.com"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "check-email"
  }
}
```

### Error Response (404)

```json
{
  "status": 404,
  "message": "User not found"
}
```

---

## 7. Reset Password

**Endpoint:** `POST /reset-password`

### Request Body

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "NewSecurePass456!"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "login"
  }
}
```

### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid token"
}
```

---

## 8. Logout

**Endpoint:** `POST /logout`

**Note:** Requires authentication. Include session cookie.

### Request Body

```json
{}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Logout successful",
  "data": {
    "nextStep": "login"
  }
}
```

---

## 9. Google OAuth - Initiate

**Endpoint:** `GET /google`

**Note:** This redirects to Google OAuth. No JSON response.

### URL

```
http://localhost:5000/api/doctor/auth/google
```

---

## 10. Google OAuth - Callback

**Endpoint:** `GET /google/callback`

**Note:** This is called by Google after authentication. Redirects to frontend.

### Success Redirect

```
http://localhost:3000/auth/oauth/success?nextStep=submit-application&isNewUser=true
```

### Error Redirect

```
http://localhost:3000/auth/oauth/error?message=Authentication%20failed
```

---

## Complete Doctor Object (After Profile Completion)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "fullName": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@example.com",
  "gender": "Male",
  "dateOfBirth": "1985-03-15T00:00:00.000Z",
  "contactNumber": "+923001234567",
  "educational_details": [
    {
      "degree": "MBBS",
      "institution": "King Edward Medical University",
      "yearOfCompletion": 2010,
      "specialization": "General Medicine",
      "fileUrl": "https://res.cloudinary.com/example/doctor_education/mbbs_cert.pdf",
      "_id": "507f1f77bcf86cd799439013"
    },
    {
      "degree": "FCPS",
      "institution": "College of Physicians and Surgeons Pakistan",
      "yearOfCompletion": 2015,
      "specialization": "Cardiology",
      "fileUrl": "https://res.cloudinary.com/example/doctor_education/fcps_cert.pdf",
      "_id": "507f1f77bcf86cd799439014"
    }
  ],
  "specialization": ["Cardiology", "Internal Medicine"],
  "experience_details": [
    {
      "institution": "Jinnah Hospital",
      "starting_date": "2011-01-15T00:00:00.000Z",
      "ending_date": "2015-12-31T00:00:00.000Z",
      "institution_img_url": "https://res.cloudinary.com/example/doctor_experience/jinnah_hospital.jpg",
      "is_going_on": false,
      "_id": "507f1f77bcf86cd799439015"
    },
    {
      "institution": "Shaukat Khanum Hospital",
      "starting_date": "2016-01-01T00:00:00.000Z",
      "ending_date": null,
      "institution_img_url": "https://res.cloudinary.com/example/doctor_experience/shaukat_khanum.jpg",
      "is_going_on": true,
      "_id": "507f1f77bcf86cd799439016"
    }
  ],
  "license_number": "PMC-12345-A",
  "affiliated_hospital": "Shaukat Khanum Memorial Cancer Hospital",
  "consultation_type": "both",
  "consultation_fee": 3000,
  "onlineProfileURL": "https://linkedin.com/in/dr-ahmed-hassan",
  "digital_signature": "https://res.cloudinary.com/example/doctor_signatures/signature.png",
  "account_status": "active",
  "isVerified": "yes",
  "is_Verified": true,
  "averageRating": 4.7,
  "profile_img_url": "https://res.cloudinary.com/example/doctor_profiles/ahmed_hassan.jpg",
  "cover_img_url": "https://res.cloudinary.com/example/doctor_covers/ahmed_hassan_cover.jpg",
  "last_login": "2025-12-06T08:15:00.000Z",
  "oauth_provider": "local",
  "onboarding_status": "completed",
  "created_at": "2025-12-01T10:30:00.000Z",
  "updated_at": "2025-12-06T08:15:00.000Z"
}
```

---

## Authentication Notes

1. **Session-based authentication**: After login, the backend sets a session cookie (`connect.sid`)
2. **Protected routes**: `/submit-application`, `/complete-profile`, and `/logout` require authentication
3. **Include credentials**: Frontend should send requests with `credentials: 'include'` to maintain session
4. **nextStep values**:
   - `verify-email`: User needs to verify email
   - `login`: User should login
   - `submit-application`: User needs to submit documents
   - `waiting-approval`: Documents submitted, waiting for admin
   - `resubmit-application`: Documents rejected
   - `complete-profile`: Documents approved, complete profile
   - `dashboard`: Onboarding complete, go to dashboard
   - `check-email`: Check email for reset link
