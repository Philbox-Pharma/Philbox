```
BASE URL: http://localhost:5000/api/doctor/auth
```

I’ve included:

✅ Endpoint
✅ **Request body (mock request data)**
✅ **Mock success response**
❗ File upload endpoints included
❗ Token-based endpoints included
❗ Google OAuth endpoints included

---

# ✅ **1. Registration — `/register`**

### **POST** `http://localhost:5000/api/doctor/auth/register`

### ✔ **Request Body (Mock)**

```json
{
  "fullName": "Dr. John Doe",
  "email": "johndoe@example.com",
  "password": "SecurePass123",
  "contactNumber": "03001234567",
  "gender": "Male",
  "dateOfBirth": "1990-05-15"
}
```

### ✔ **Mock Success Response**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "nextStep": "VERIFY_EMAIL"
  }
}
```

---

# ✅ **2. Verify Email — `/verify-email`**

### **POST** `http://localhost:5000/api/doctor/auth/verify-email`

### ✔ **Request Body (Mock)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "nextStep": "LOGIN"
  }
}
```

---

# ✅ **3. Login — `/login`**

### **POST** `http://localhost:5000/api/doctor/auth/login`

### ✔ **Request Body (Mock)**

```json
{
  "email": "johndoe@example.com",
  "password": "SecurePass123"
}
```

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token-here",
    "doctor": {
      "id": "67a2bc1234ff890a0b123cd9",
      "fullName": "Dr. John Doe",
      "email": "johndoe@example.com",
      "status": "PENDING_VERIFICATION"
    }
  }
}
```

---

# ✅ **4. Submit Application (Upload Docs) — `/submit-application`**

### **POST**

`http://localhost:5000/api/doctor/auth/submit-application`
🔐 Requires Authentication
📁 **multipart/form-data**

### ✔ **Form-Data Fields**

```
cnic: <file>
medical_license: <file>
specialist_license: <file>
mbbs_md_degree: <file>
experience_letters: <file>
```

Example via Postman form-data:

| Key                | Type | Value          |
| ------------------ | ---- | -------------- |
| cnic               | File | cnic.png       |
| medical_license    | File | license.pdf    |
| specialist_license | File | specialist.pdf |
| mbbs_md_degree     | File | degree.pdf     |
| experience_letters | File | exp_letter.pdf |

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application submitted successfully. Await admin approval.",
  "data": {
    "nextStep": "WAITING_FOR_ADMIN_APPROVAL"
  }
}
```

---

# ✅ **5. Complete Profile — `/complete-profile`**

### **POST**

`http://localhost:5000/api/doctor/auth/complete-profile`
🔐 Auth Required
📁 multipart/form-data
📌 JSON strings inside form-data

---

### ✔ **Form-Data (Mock)**

#### **educational_details (stringified JSON)**

```json
[
  {
    "degree": "MBBS",
    "institution": "XYZ Medical College",
    "yearOfCompletion": 2015,
    "specialization": "General Medicine"
  }
]
```

#### **specialization (stringified JSON)**

```json
["Cardiology", "Internal Medicine"]
```

#### **experience_details (stringified JSON)**

```json
[
  {
    "institution": "ABC Hospital",
    "starting_date": "2018-01-10",
    "ending_date": "2020-05-30",
    "is_going_on": false
  }
]
```

#### **Other fields**

```
license_number: ABCD-12345
affiliated_hospital: XYZ Hospital
consultation_type: both
consultation_fee: 1500
onlineProfileURL: https://linkedin.com/in/dr-john-doe
```

#### **Files**

```
education_files[]: file1.pdf, file2.pdf
experience_files[]: exp1.jpg, exp2.jpg
digital_signature: signature.png
profile_img: profile.jpg
cover_img: cover.jpg
```

---

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile completed successfully.",
  "data": {
    "nextStep": "PROFILE_REVIEW_PENDING"
  }
}
```

---

# ✅ **6. Forget Password — `/forget-password`**

### **POST**

`http://localhost:5000/api/doctor/auth/forget-password`

### ✔ **Request Body**

```json
{
  "email": "johndoe@example.com"
}
```

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "CHECK_EMAIL"
  }
}
```

---

# ✅ **7. Reset Password — `/reset-password`**

### **POST**

`http://localhost:5000/api/doctor/auth/reset-password`

### ✔ **Request Body**

```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123"
}
```

### ✔ Mock Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "LOGIN"
  }
}
```

---

# ✅ **8. Logout — `/logout`**

### **POST**

`http://localhost:5000/api/doctor/auth/logout`
🔐 Auth Required

### ✔ **Request Body**

❌ No body
(cookie/session based logout)

### ✔ **Mock Response**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

# ✅ **9. Google OAuth — `/google`**

### **GET**

`http://localhost:5000/api/doctor/auth/google`

Redirects to Google Login.

---

# ✅ **10. Google OAuth Callback — `/google/callback`**

### **GET**

Handled by Passport.

### ✔ **Mock Response (after successful OAuth)**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Google authentication successful",
  "data": {
    "accessToken": "jwt-token-here",
    "doctor": {
      "id": "67a2bc1234ff890a0b123cd9",
      "fullName": "Dr. John Doe",
      "email": "john@gmail.com",
      "loginMethod": "GOOGLE"
    }
  }
}
```

---

# ✔ All Endpoints Covered
