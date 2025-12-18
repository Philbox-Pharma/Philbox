# Doctor Authentication & API Integration Guide

**Frontend Integration Guide for Doctor Portal Developers**

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Session Management](#session-management)
4. [Onboarding Process](#onboarding-process)
5. [Google OAuth Integration](#google-oauth-integration)
6. [Error Handling](#error-handling)
7. [Frontend Pages & Integration Points](#frontend-pages--integration-points)

---

## Base Configuration

### Base URL

```
http://localhost:5000/api/doctor
```

### Authentication Method

- **Type**: Session-based (OAuth2 and traditional)
- **Cookie**: `connect.sid` (automatically handled by browser)
- **Headers**: Include `credentials: 'include'` in fetch requests

### Request Headers

```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

### Frontend Fetch Configuration

```javascript
const fetchOptions = {
  method: "POST",
  credentials: "include", // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
};
```

---

## Authentication Endpoints

### 1. Register

**Endpoint:** `POST /auth/register`

**Purpose**: Initial doctor registration with basic information

**Page Integration**: Doctor Registration Page (Step 1)

#### Request Body

```json
{
  "fullName": "Dr. Ahmed Hassan",
  "email": "dr.ahmed@philbox.com",
  "password": "SecurePass123",
  "gender": "Male",
  "dateOfBirth": "1990-05-15",
  "contactNumber": "03001234567"
}
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "nextStep": "verify-email"
  }
}
```

#### Error Response (409)

```json
{
  "status": 409,
  "message": "Email already exists"
}
```

#### Frontend Implementation

```javascript
// pages/Doctor/Registration/Step1RegistrationPage.jsx
const handleRegister = async (formData) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/doctor/auth/register",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Store email in state for OTP step
      setStoredEmail(formData.email);
      // Navigate to email verification
      navigate("/doctor/register/verify-email");
      showNotification(
        "Please check your email for verification link",
        "success",
      );
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    showNotification("Registration failed", "error");
  }
};
```

---

### 2. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Purpose**: Verifies doctor's email with token from email link

**Page Integration**: Email Verification Page (Step 2)

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Token Source

- **Email Link**: Doctor receives email with verification link like:
  ```
  http://localhost:3000/doctor/register/verify?token=eyJhbGc...
  ```
- Token is automatically extracted from URL query parameter

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Email verified successfully. You can now login.",
  "data": {
    "nextStep": "login"
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid or expired verification token"
}
```

#### Frontend Implementation

```javascript
// pages/Doctor/Registration/EmailVerificationPage.jsx
import { useSearchParams } from "react-router-dom";

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      showNotification("No verification token provided", "error");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/doctor/auth/verify-email",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        showNotification(
          "Email verified successfully! Redirecting to login...",
          "success",
        );
        setTimeout(() => navigate("/doctor/login"), 2000);
      } else {
        showNotification(result.message, "error");
        // Show resend email option
      }
    } catch (error) {
      showNotification("Verification failed", "error");
    }
  };

  return (
    <div>
      <p>Verifying your email...</p>
      <Spinner />
    </div>
  );
};
```

---

### 3. Login

**Endpoint:** `POST /auth/login`

**Purpose**: Doctor login with email and password

**Page Integration**: Doctor Login Page

#### Request Body

```json
{
  "email": "dr.ahmed@philbox.com",
  "password": "SecurePass123"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "doctor": {
      "_id": "507f1f77bcf86cd799439041",
      "fullName": "Dr. Ahmed Hassan",
      "email": "dr.ahmed@philbox.com",
      "gender": "Male",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": true,
      "profile_completion_status": "pending",
      "specialization": null,
      "bio": null,
      "consultation_fee": null,
      "experience_years": null,
      "role": {
        "_id": "507f1f77bcf86cd799439005",
        "name": "doctor",
        "permissions": ["read_appointments", "read_prescriptions"]
      },
      "created_at": "2025-12-06T10:00:00.000Z"
    },
    "accountStatus": "pending",
    "nextStep": "submit-application"
  }
}
```

#### Error Responses

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

#### nextStep Values

| Value                | Meaning                          | What to do                    |
| -------------------- | -------------------------------- | ----------------------------- |
| `submit-application` | Documents pending                | Show document submission page |
| `complete-profile`   | Documents approved, fill profile | Show profile completion form  |
| `dashboard`          | Profile complete                 | Redirect to dashboard         |

#### Frontend Implementation

```javascript
// pages/Doctor/LoginPage.jsx
const handleLogin = async (email, password) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/doctor/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      // Store doctor info in context
      setDoctor(result.data.doctor);
      setPermissions(result.data.doctor.role.permissions);

      // Route based on nextStep
      switch (result.data.nextStep) {
        case "submit-application":
          navigate("/doctor/onboarding/submit-documents");
          break;
        case "complete-profile":
          navigate("/doctor/onboarding/complete-profile");
          break;
        case "dashboard":
          navigate("/doctor/dashboard");
          break;
        default:
          navigate("/doctor/dashboard");
      }
    } else {
      showNotification(result.message, "error");
    }
  } catch (error) {
    showNotification("Login failed", "error");
  }
};
```

---

### 4. Forget Password

**Endpoint:** `POST /auth/forget-password`

**Purpose**: Sends password reset link to doctor's email

**Page Integration**: Forget Password Page

#### Request Body

```json
{
  "email": "dr.ahmed@philbox.com"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent",
  "data": {
    "nextStep": "check-email"
  }
}
```

#### Error Response (404)

```json
{
  "status": 404,
  "message": "User not found"
}
```

---

### 5. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Purpose**: Sets new password using token from email

**Page Integration**: Reset Password Page (from email link)

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass456"
}
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Password reset successfully",
  "data": {
    "nextStep": "login"
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Invalid token"
}
```

---

### 6. Logout

**Endpoint:** `POST /auth/logout`

**Purpose**: Destroys doctor session and clears cookies

**Page Integration**: Navigation Bar (Logout Button)

#### Request Body

```json
{}
```

#### Success Response (200)

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

## Session Management

### Session Overview

After successful login, a session is automatically created via `connect.sid` cookie. Doctor accounts start in a suspended state pending admin verification.

**Session Properties:**

- **Cookie Name**: `connect.sid`
- **Type**: HttpOnly (cannot be accessed via JavaScript)
- **Duration**: 7 days
- **Auto-Renewal**: Renewed on each request
- **Status Tracking**: Account status (suspended/pending/active) included in session

### Session Storage with Status Tracking

Store doctor data including account status in React Context:

```javascript
// Context/DoctorContext.jsx
import { createContext, useState, useCallback } from "react";

export const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null); // suspended|pending|active
  const [onboardingStep, setOnboardingStep] = useState(null); // submit-application|submit-profile|complete
  const [isLoading, setIsLoading] = useState(true);

  // After login success
  const handleLoginSuccess = useCallback((doctorData) => {
    setDoctor(doctorData);
    setAccountStatus(doctorData.account_status);
    setOnboardingStep(doctorData.profile_completion_status);
    localStorage.setItem("doctorEmail", doctorData.email);
  }, []);

  // Update onboarding step
  const updateOnboardingStep = useCallback((step) => {
    setOnboardingStep(step);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    setDoctor(null);
    setAccountStatus(null);
    setOnboardingStep(null);
    localStorage.removeItem("doctorEmail");
  }, []);

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        accountStatus,
        onboardingStep,
        isLoading,
        handleLoginSuccess,
        updateOnboardingStep,
        handleLogout,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};
```

### Account Status Management

Doctor accounts have special status handling:

```javascript
// useAccountStatusCheck.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctor } from "./useDoctor";

export const useAccountStatusCheck = () => {
  const navigate = useNavigate();
  const { doctor, accountStatus } = useDoctor();

  useEffect(() => {
    if (!doctor || !accountStatus) return;

    // Handle different account statuses
    if (accountStatus === "suspended") {
      // Account suspended by admin - cannot proceed
      showNotification(
        "Your account has been suspended. Please contact support.",
        "error",
      );
      navigate("/doctor/account-suspended");
    } else if (accountStatus === "pending") {
      // Normal state - awaiting admin verification
      navigate("/doctor/application-pending");
    } else if (accountStatus === "active") {
      // Account verified - can proceed to dashboard or onboarding
      navigate("/doctor/dashboard");
    }
  }, [accountStatus]);
};
```

### Onboarding Status Routing

Doctor routing depends on both account status and onboarding completion:

```javascript
// DoctorRouter.jsx
export const DoctorRouter = () => {
  const { doctor, accountStatus, onboardingStep } = useDoctor();

  if (!doctor) {
    return <Navigate to="/doctor/login" />;
  }

  // First check account status
  if (accountStatus === "suspended") {
    return <AccountSuspendedPage />;
  }

  if (accountStatus === "pending") {
    // Doctor can login but account awaits admin verification
    if (onboardingStep === "pending") {
      // Step 1: Submit application documents
      return <SubmitApplicationPage />;
    } else if (onboardingStep === "processing") {
      // Awaiting admin review
      return <ApplicationReviewPage />;
    }
  }

  if (accountStatus === "active") {
    // Account verified, check onboarding completion
    if (onboardingStep === "pending" || onboardingStep === "processing") {
      // Step 2: Complete profile
      return <CompleteProfilePage />;
    }
    // Fully onboarded
    return <DoctorDashboard />;
  }

  return <LoadingSpinner />;
};
```

### Session with OAuth2 (Google Sign-in)

Google OAuth also creates a session and follows same onboarding:

```javascript
// GoogleOAuthCallback.jsx
useEffect(() => {
  // After OAuth redirect, session is created
  verifyDoctorSession().then((result) => {
    if (result.valid) {
      handleLoginSuccess(result.doctor);
      // Status management is automatic via useAccountStatusCheck hook
    } else {
      navigate("/doctor/login");
    }
  });
}, []);
```

### Session Verification Endpoint

**Endpoint:** `GET /auth/me`

**Purpose:** Verify session and get current doctor profile with status

```javascript
const verifyDoctorSession = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/doctor/auth/me", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const result = await response.json();
      return {
        valid: true,
        doctor: result.data.doctor,
        accountStatus: result.data.doctor.account_status,
        onboardingStep: result.data.doctor.profile_completion_status,
      };
    } else if (response.status === 401) {
      return { valid: false, reason: "not_authenticated" };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return { valid: false, reason: "network_error" };
  }
};

// Use on app initialization
useEffect(() => {
  verifyDoctorSession().then((result) => {
    if (result.valid) {
      handleLoginSuccess(result.doctor);
      // useAccountStatusCheck will handle routing
    } else {
      navigate("/doctor/login");
    }
  });
}, []);
```

### Protected Route for Doctors

```javascript
// ProtectedDoctorRoute.jsx
import { Navigate } from "react-router-dom";
import { useDoctor } from "./hooks/useDoctor";

export const ProtectedDoctorRoute = ({
  children,
  requiredStatus = null,
  requiredOnboardingStep = null,
}) => {
  const { doctor, accountStatus, onboardingStep, isLoading } = useDoctor();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!doctor) {
    return <Navigate to="/doctor/login" replace />;
  }

  if (requiredStatus && accountStatus !== requiredStatus) {
    return <Navigate to="/doctor/account-status" replace />;
  }

  if (requiredOnboardingStep && onboardingStep !== requiredOnboardingStep) {
    return <Navigate to="/doctor/onboarding-step" replace />;
  }

  return children;
};

// Usage
<Routes>
  <Route
    path="/submit-documents"
    element={
      <ProtectedDoctorRoute requiredOnboardingStep="pending">
        <SubmitDocumentsPage />
      </ProtectedDoctorRoute>
    }
  />
  <Route
    path="/complete-profile"
    element={
      <ProtectedDoctorRoute requiredOnboardingStep="processing">
        <CompleteProfilePage />
      </ProtectedDoctorRoute>
    }
  />
  <Route
    path="/dashboard"
    element={
      <ProtectedDoctorRoute requiredStatus="active">
        <DoctorDashboard />
      </ProtectedDoctorRoute>
    }
  />
</Routes>;
```

### Session Recovery and Suspension Handling

```javascript
// useDoctorSessionRecovery.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDoctor } from "./useDoctor";

export const useDoctorSessionRecovery = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess, handleLogout } = useDoctor();

  useEffect(() => {
    const handleOnline = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/doctor/auth/me",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (response.ok) {
          const result = await response.json();
          handleLoginSuccess(result.data.doctor);

          // Check if account was suspended while offline
          if (result.data.doctor.account_status === "suspended") {
            showNotification("Your account has been suspended", "error");
            navigate("/doctor/account-suspended");
          }

          showNotification("Connection restored", "success");
        } else if (response.status === 401) {
          // Session expired
          handleLogout();
          navigate("/doctor/login");
        }
      } catch (error) {
        console.error("Session recovery failed:", error);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [handleLoginSuccess, handleLogout, navigate]);
};
```

---

## Onboarding Process

Doctor onboarding has **2 steps** that happen sequentially:

```
Registration → Email Verification → Login →
Step 1: Submit Application (Documents) →
[Admin Verification] →
Step 2: Complete Profile (Education, Experience) →
Dashboard
```

### Step 1: Submit Application (Document Upload)

**Endpoint:** `POST /auth/submit-application`

**Required**: Authenticated (logged in)

**Purpose**: Doctor submits required documents for admin verification

**Page Integration**: Document Submission Page (Step 1 of Onboarding)

#### Required Files

All files must be uploaded as multipart/form-data:

| Field                | Type | Description                            | Max Size |
| -------------------- | ---- | -------------------------------------- | -------- |
| `cnic`               | File | CNIC/ID card                           | 5MB      |
| `medical_license`    | File | Medical license certificate            | 5MB      |
| `specialist_license` | File | Specialist certificate (if applicable) | 5MB      |
| `mbbs_md_degree`     | File | MBBS/MD degree certificate             | 5MB      |
| `experience_letters` | File | Experience letters from hospitals      | 5MB      |

#### Request Example

```javascript
const formData = new FormData();
formData.append("cnic", cnicFile);
formData.append("medical_license", licenseFile);
formData.append("specialist_license", specialistFile);
formData.append("mbbs_md_degree", degreeFile);
formData.append("experience_letters", experienceFile);

const response = await fetch(
  "http://localhost:5000/api/doctor/auth/submit-application",
  {
    method: "POST",
    credentials: "include",
    body: formData,
  },
);
```

#### Success Response (201)

```json
{
  "status": 201,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439051",
      "doctor_id": "507f1f77bcf86cd799439041",
      "cnic_url": "https://res.cloudinary.com/.../cnic.pdf",
      "medical_license_url": "https://res.cloudinary.com/.../license.pdf",
      "specialist_license_url": "https://res.cloudinary.com/.../specialist.pdf",
      "mbbs_md_degree_url": "https://res.cloudinary.com/.../degree.pdf",
      "experience_letters_url": "https://res.cloudinary.com/.../letters.pdf",
      "application_status": "pending",
      "admin_notes": null,
      "submitted_at": "2025-12-06T10:00:00.000Z"
    },
    "nextStep": "wait-for-approval"
  }
}
```

#### Error Responses

```json
// No files uploaded (400)
{
  "status": 400,
  "message": "No files uploaded. Please upload required documents."
}

// File too large (413)
{
  "status": 413,
  "message": "File size exceeds 5MB limit"
}

// Unauthorized (401)
{
  "status": 401,
  "message": "Unauthorized"
}
```

#### Frontend Implementation

```javascript
// pages/Doctor/Onboarding/DocumentSubmissionPage.jsx
import { useState } from "react";

export const DocumentSubmissionPage = () => {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const requiredDocuments = [
    {
      name: "cnic",
      label: "CNIC/ID Card",
      description: "Your national ID card",
    },
    {
      name: "medical_license",
      label: "Medical License",
      description: "Your medical degree",
    },
    {
      name: "specialist_license",
      label: "Specialist License",
      description: "If you have specialization",
    },
    {
      name: "mbbs_md_degree",
      label: "MBBS/MD Degree",
      description: "Your degree certificate",
    },
    {
      name: "experience_letters",
      label: "Experience Letters",
      description: "Letters from previous employers",
    },
  ];

  const handleFileChange = (docName, file) => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size should be less than 5MB", "error");
      return;
    }

    setFiles((prev) => ({ ...prev, [docName]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Append all files
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const response = await fetch(
        "http://localhost:5000/api/doctor/auth/submit-application",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const result = await response.json();

      if (response.ok) {
        showNotification(
          "Documents submitted successfully! Admin will verify shortly.",
          "success",
        );
        navigate("/doctor/onboarding/waiting");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit Your Documents</h2>
      <p>Please upload the following documents for verification</p>

      {requiredDocuments.map((doc) => (
        <div key={doc.name} className="document-upload">
          <label>{doc.label}</label>
          <p className="help-text">{doc.description}</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => handleFileChange(doc.name, e.target.files[0])}
            required
          />
          {files[doc.name] && (
            <p className="file-selected">✓ {files[doc.name].name}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading || Object.keys(files).length === 0}
      >
        {loading ? "Uploading..." : "Submit Documents"}
      </button>
    </form>
  );
};
```

---

### Step 2: Complete Profile (After Admin Approval)

**Endpoint:** `POST /auth/complete-profile`

**Required**: Authenticated + Admin approved application

**Purpose**: Doctor completes profile with education, experience, and specialization

**Page Integration**: Profile Completion Page (Step 2 of Onboarding)

#### Request Body (multipart/form-data)

```javascript
const formData = new FormData();

// Text fields
formData.append("specialization", "Cardiology");
formData.append("bio", "I am a cardiologist with 10 years of experience...");
formData.append("experience_years", 10);
formData.append("consultation_fee", 2000);
formData.append(
  "education_details",
  JSON.stringify([
    {
      degree: "MBBS",
      institution: "Aga Khan University",
      year: 2015,
    },
    {
      degree: "Cardiology Specialization",
      institution: "PIMS Islamabad",
      year: 2018,
    },
  ]),
);

formData.append(
  "experience_details",
  JSON.stringify([
    {
      position: "Cardiologist",
      institution: "Aga Khan Hospital",
      startYear: 2018,
      endYear: 2022,
    },
  ]),
);

// Files
formData.append("education_files", educationFile1);
formData.append("education_files", educationFile2);
formData.append("experience_files", experienceFile);
formData.append("digital_signature", signatureFile);
formData.append("profile_img", profileImageFile);
formData.append("cover_img", coverImageFile);
```

#### Success Response (200)

```json
{
  "status": 200,
  "message": "Profile completed successfully",
  "data": {
    "doctor": {
      "_id": "507f1f77bcf86cd799439041",
      "fullName": "Dr. Ahmed Hassan",
      "email": "dr.ahmed@philbox.com",
      "specialization": "Cardiology",
      "bio": "I am a cardiologist with 10 years of experience...",
      "experience_years": 10,
      "consultation_fee": 2000,
      "profile_img_url": "https://res.cloudinary.com/.../profile.jpg",
      "cover_img_url": "https://res.cloudinary.com/.../cover.jpg",
      "digital_signature_url": "https://res.cloudinary.com/.../signature.pdf",
      "profile_completion_status": "completed",
      "account_status": "active",
      "role": {
        "name": "doctor",
        "permissions": ["read_appointments", "create_prescriptions"]
      },
      "created_at": "2025-12-06T10:00:00.000Z"
    },
    "nextStep": "dashboard"
  }
}
```

#### Error Response (400)

```json
{
  "status": 400,
  "message": "Profile incomplete. Please fill all required fields."
}
```

#### Frontend Implementation

```javascript
// pages/Doctor/Onboarding/ProfileCompletionPage.jsx
export const ProfileCompletionPage = () => {
  const [formData, setFormData] = useState({
    specialization: "",
    bio: "",
    experience_years: "",
    consultation_fee: "",
    education_details: [],
    experience_details: [],
  });

  const [files, setFiles] = useState({
    education_files: [],
    experience_files: [],
    digital_signature: null,
    profile_img: null,
    cover_img: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitFormData = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        submitFormData.append(key, JSON.stringify(value));
      } else {
        submitFormData.append(key, value);
      }
    });

    // Append files
    files.education_files.forEach((file) => {
      submitFormData.append("education_files", file);
    });
    files.experience_files.forEach((file) => {
      submitFormData.append("experience_files", file);
    });

    if (files.digital_signature) {
      submitFormData.append("digital_signature", files.digital_signature);
    }
    if (files.profile_img) {
      submitFormData.append("profile_img", files.profile_img);
    }
    if (files.cover_img) {
      submitFormData.append("cover_img", files.cover_img);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/doctor/auth/complete-profile",
        {
          method: "POST",
          credentials: "include",
          body: submitFormData,
        },
      );

      const result = await response.json();

      if (response.ok) {
        showNotification("Profile completed successfully!", "success");
        navigate("/doctor/dashboard");
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to complete profile", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Complete Your Profile</h2>

      <div className="form-section">
        <label>Specialization *</label>
        <input
          type="text"
          value={formData.specialization}
          onChange={(e) =>
            setFormData({ ...formData, specialization: e.target.value })
          }
          placeholder="e.g., Cardiology, Neurology"
          required
        />
      </div>

      <div className="form-section">
        <label>Bio *</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell patients about yourself..."
          rows="4"
          required
        />
      </div>

      <div className="form-section">
        <label>Years of Experience *</label>
        <input
          type="number"
          value={formData.experience_years}
          onChange={(e) =>
            setFormData({ ...formData, experience_years: e.target.value })
          }
          placeholder="e.g., 10"
          required
        />
      </div>

      <div className="form-section">
        <label>Consultation Fee (PKR) *</label>
        <input
          type="number"
          value={formData.consultation_fee}
          onChange={(e) =>
            setFormData({ ...formData, consultation_fee: e.target.value })
          }
          placeholder="e.g., 2000"
          required
        />
      </div>

      <div className="form-section">
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFiles({ ...files, profile_img: e.target.files[0] })
          }
        />
      </div>

      <button type="submit">Complete Profile</button>
    </form>
  );
};
```

---

## Google OAuth Integration

### OAuth Flow

```
Click "Login with Google" →
Google Login →
Backend receives token →
Create/Update doctor account →
Auto-assign role →
Redirect to dashboard
```

### 1. Login Button (Frontend)

**Redirect URL:**

```html
<a href="http://localhost:5000/api/doctor/auth/google">
  <button>Login with Google</button>
</a>
```

### 2. Google Callback (Backend)

**URL:** `GET /auth/google/callback`

**Backend handles:**

- Google authentication verification
- Check if doctor exists
- Create new doctor if doesn't exist
- Auto-assign doctor role and permissions
- Create session
- Redirect to frontend

### 3. Frontend OAuth Success Page

**Redirect URL from Backend:**

```
http://localhost:3000/auth/oauth/success?role=doctor&isNewUser=true
```

#### Success Page Implementation

```javascript
// pages/Auth/OAuthSuccessPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role");
  const isNewUser = searchParams.get("isNewUser") === "true";

  useEffect(() => {
    // Verify session is established
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      // Call a protected endpoint to verify session
      const response = await fetch("http://localhost:5000/api/doctor/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        // Store doctor info
        setDoctor(data.data);

        // Redirect based on profile status
        if (isNewUser) {
          navigate("/doctor/onboarding/submit-documents");
        } else {
          navigate("/doctor/dashboard");
        }
      } else {
        navigate("/doctor/login");
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      navigate("/doctor/login");
    }
  };

  return (
    <div>
      <p>Authenticating with Google...</p>
      <Spinner />
    </div>
  );
};
```

### 4. OAuth Error Page

**Redirect URL from Backend (on error):**

```
http://localhost:3000/auth/oauth/error?message=Authentication%20failed
```

#### Error Page Implementation

```javascript
// pages/Auth/OAuthErrorPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";

export const OAuthErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get("message");

  return (
    <div>
      <h2>Authentication Failed</h2>
      <p>{message || "Something went wrong during Google authentication"}</p>
      <button onClick={() => navigate("/doctor/login")}>Back to Login</button>
    </div>
  );
};
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": <HTTP_STATUS>,
  "message": "<User-friendly error message>",
  "data": null,
  "error": "<Technical error details>"
}
```

### Common HTTP Status Codes

| Status | Meaning           | Example                             |
| ------ | ----------------- | ----------------------------------- |
| 200    | Success           | Login, profile retrieved            |
| 201    | Created           | Registration successful             |
| 400    | Bad Request       | Invalid data, incomplete form       |
| 401    | Unauthorized      | No session, authentication required |
| 403    | Forbidden         | Account blocked, email not verified |
| 404    | Not Found         | User not found                      |
| 409    | Conflict          | Email already exists                |
| 413    | Payload Too Large | File size exceeds limit             |
| 429    | Too Many Requests | Rate limit exceeded                 |
| 500    | Server Error      | Internal server error               |

---

## Frontend Pages & Integration Points

### 1. Authentication Pages

#### Registration Page

- **Path**: `/doctor/register`
- **Endpoints**: `POST /auth/register`
- **Form Fields**:
  - Full Name
  - Email
  - Password
  - Confirm Password
  - Gender
  - Date of Birth
  - Contact Number
- **Actions**: Register button, Login link
- **Validation**: Email format, password strength

#### Email Verification Page

- **Path**: `/doctor/register/verify`
- **Endpoints**: `POST /auth/verify-email`
- **Auto-process**: Extract token from URL, auto-verify
- **Display**: Status message, resend option
- **Redirect**: To login on success

#### Login Page

- **Path**: `/doctor/login`
- **Endpoints**: `POST /auth/login`
- **Form Fields**: Email, Password
- **Actions**: Login button, "Forgot Password?" link, "Login with Google"
- **Routes based on nextStep**:
  - `submit-application` → Document submission page
  - `complete-profile` → Profile completion page
  - `dashboard` → Doctor dashboard

#### OAuth Handling

- **Google Login Button**: Redirect to `/api/doctor/auth/google`
- **Success Page**: Handle `?role=doctor&isNewUser=`
- **Error Page**: Show message and allow retry

#### Forget Password Page

- **Path**: `/doctor/forgot-password`
- **Endpoints**: `POST /auth/forget-password`
- **Form**: Email input
- **Display**: Confirmation message

#### Reset Password Page

- **Path**: `/doctor/reset-password?token=<token>`
- **Endpoints**: `POST /auth/reset-password`
- **Form Fields**: New password, Confirm password
- **Redirect**: To login on success

---

### 2. Onboarding Pages

#### Step 1: Document Submission

- **Path**: `/doctor/onboarding/submit-documents`
- **Endpoints**: `POST /auth/submit-application`
- **Upload Fields**:
  - CNIC/ID Card
  - Medical License
  - Specialist License
  - MBBS/MD Degree
  - Experience Letters
- **File Types**: PDF, JPG, PNG
- **Max File Size**: 5MB each
- **Actions**: Submit, Save as draft (optional)
- **Display**: Upload progress, file preview

#### Step 1b: Waiting for Approval

- **Path**: `/doctor/onboarding/waiting`
- **Purpose**: Show waiting message while admin reviews
- **Display**:
  - "Your documents are being reviewed"
  - Timeline (optional)
  - Can check back later
- **Auto-redirect**: To Step 2 when approved (or manual page refresh)

#### Step 2: Profile Completion

- **Path**: `/doctor/onboarding/complete-profile`
- **Endpoints**: `POST /auth/complete-profile`
- **Form Fields**:
  - Specialization (dropdown or text)
  - Bio (text area)
  - Years of Experience
  - Consultation Fee
  - Education Details (can add multiple)
  - Experience Details (can add multiple)
  - Digital Signature (file)
  - Profile Image
  - Cover Image
- **Actions**: Submit, Save as draft
- **Validation**: All required fields must be filled

---

### 3. Dashboard Page

#### Doctor Dashboard

- **Path**: `/doctor/dashboard`
- **Endpoints**:
  - `GET /auth/me` or `GET /profile` (to fetch profile)
- **Key Sections**:
  - Welcome greeting with doctor name
  - Profile completion status
  - Quick action buttons
  - Upcoming appointments (when available)
  - Recent patient interactions
  - Consultation statistics (optional)
- **Navigation**: To other doctor features

---

## Frontend Implementation Checklist

### Setup

- [ ] Configure API base URL
- [ ] Setup error handling middleware
- [ ] Create API service layer
- [ ] Setup authentication context/store
- [ ] Setup route guards (ProtectedRoute component)

### Authentication Flow

- [ ] Create Registration page
- [ ] Create Email Verification page (auto-redirect from link)
- [ ] Create Login page with form validation
- [ ] Create Google OAuth button
- [ ] Create OAuth success/error pages
- [ ] Create Forget Password page
- [ ] Create Reset Password page
- [ ] Implement session management
- [ ] Add logout functionality

### Onboarding Flow

- [ ] Create Document Submission page
  - [ ] Multi-file upload
  - [ ] File validation
  - [ ] Upload progress indicator
- [ ] Create Waiting for Approval page
- [ ] Create Profile Completion page
  - [ ] Multi-field form with validation
  - [ ] Image upload (profile, cover)
  - [ ] Dynamic education/experience fields
- [ ] Implement nextStep routing logic

### General

- [ ] Add loading spinners
- [ ] Add error notifications/toasts
- [ ] Add success notifications/toasts
- [ ] Add confirmation dialogs
- [ ] Implement proper error handling
- [ ] Setup protected routes with session check
- [ ] Add session expiry handling
- [ ] Add file upload validation

---

## Tips & Best Practices

### 1. File Upload Handling

```javascript
// Validate file before upload
const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (file.size > maxSize) {
    throw new Error("File size exceeds 5MB");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  return true;
};
```

### 2. Session Check on App Load

```javascript
// Check session when app loads
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doctor/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        // No valid session, redirect to login
        navigate("/doctor/login");
      } else {
        const data = await response.json();
        setDoctor(data.data);
      }
    } catch (error) {
      navigate("/doctor/login");
    }
  };

  checkSession();
}, []);
```

### 3. NextStep Routing

```javascript
// Route based on nextStep from API response
const routeByNextStep = (nextStep) => {
  const routes = {
    "verify-email": "/doctor/register/verify",
    login: "/doctor/login",
    "submit-application": "/doctor/onboarding/submit-documents",
    "wait-for-approval": "/doctor/onboarding/waiting",
    "complete-profile": "/doctor/onboarding/complete-profile",
    dashboard: "/doctor/dashboard",
  };

  return routes[nextStep] || "/doctor/dashboard";
};
```

### 4. Multipart Form Data

```javascript
// Always use FormData for file uploads
const submitWithFiles = async (textData, files) => {
  const formData = new FormData();

  // Append text data
  Object.entries(textData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Append files
  Object.entries(files).forEach(([key, file]) => {
    if (file) formData.append(key, file);
  });

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Don't set Content-Type header, browser will set it automatically
  });
};
```

### 5. Loading States

```javascript
// Show loading during async operations
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};

// In JSX
<button disabled={loading}>{loading ? "Loading..." : "Submit"}</button>;
```

---

## Frontend Integration Sequence

**Recommended order to develop:**

1. **Login/Registration** (dependencies)
   - Registration → Email verification → Login
   - Forget/Reset Password

2. **OAuth Integration** (dependencies)
   - Google login buttons
   - OAuth success/error pages

3. **Onboarding** (depends on: Login)
   - Document submission
   - Waiting page
   - Profile completion

4. **Dashboard** (depends on: Onboarding complete)
   - Profile display
   - Navigation to other features

---

## Support & Questions

For backend implementation details, refer to:

- `RBAC.md` - Role-Based Access Control documentation
- `PHILBOX_RBAC_PERMISSIONS.md` - Complete permission matrix
- `Doctor-Backend-Guide-For-Frontend-Developer.md` - Detailed backend setup

For issues during integration:

- Check Network tab in browser DevTools
- Review Browser console for errors
- Check backend logs for server-side issues
- Verify credentials: 'include' is set in fetch calls
- Ensure token is being passed in URL query params

---

**Last Updated**: December 2025
**API Version**: 1.0
**Frontend Framework**: React (Example shown, applicable to any framework)
