# Customer Authentication API - Mock Data

## Base URL

```
http://localhost:5000/api/customer/auth
```

---

## 1. Register

**Endpoint:** `POST /register`

### Request Body

```json
{
  "fullName": "Sarah Ahmed",
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123",
  "contactNumber": "03001234567",
  "gender": "Female",
  "dateOfBirth": "1995-08-20"
}
```

### Response (201)

```json
{
  "status": 201,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": false,
      "refreshTokens": [],
      "created_at": "2025-12-06T10:00:00.000Z",
      "updated_at": "2025-12-06T10:00:00.000Z"
    },
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
  "message": "Email verified successfully. Please login."
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
  "email": "sarah.ahmed@example.com",
  "password": "SecurePass123"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "contactNumber": "03001234567",
      "account_status": "active",
      "is_Verified": true,
      "refreshTokens": [],
      "last_login": "2025-12-06T11:30:00.000Z",
      "created_at": "2025-12-06T10:00:00.000Z",
      "updated_at": "2025-12-06T11:30:00.000Z"
    },
    "accountStatus": "active"
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
  "message": "Your account has been blocked or suspended"
}
```

---

## 4. Google OAuth - Initiate

**Endpoint:** `GET /google`

**Note:** This redirects to Google OAuth. No JSON response.

### URL

```
http://localhost:5000/api/customer/auth/google
```

---

## 5. Google OAuth - Callback

**Endpoint:** `GET /google/callback`

**Note:** This is called by Google after authentication. Redirects to frontend.

### Success Redirect

```
http://localhost:3000/auth/oauth/success?role=customer&isNewUser=true
```

### Error Redirect

```
http://localhost:3000/auth/oauth/error?message=Authentication%20failed
```

---

## 6. Forget Password

**Endpoint:** `POST /forget-password`

### Request Body

```json
{
  "email": "sarah.ahmed@example.com"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset email sent"
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
  "newPassword": "NewSecurePass456"
}
```

### Response (200)

```json
{
  "status": 200,
  "message": "Password reset successfully"
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

## 8. Get Current User (Me)

**Endpoint:** `GET /me`

**Note:** Requires authentication. Include session cookie.

### Response (200)

```json
{
  "status": 200,
  "message": "Current user fetched",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "fullName": "Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "gender": "Female",
    "dateOfBirth": "1995-08-20T00:00:00.000Z",
    "contactNumber": "03001234567",
    "account_status": "active",
    "is_Verified": true,
    "address_id": "507f1f77bcf86cd799439022",
    "profile_img_url": "https://res.cloudinary.com/example/customer_profiles/sarah_ahmed.jpg",
    "cover_img_url": "https://res.cloudinary.com/example/customer_covers/sarah_ahmed_cover.jpg",
    "refreshTokens": [],
    "last_login": "2025-12-06T11:30:00.000Z",
    "created_at": "2025-12-06T10:00:00.000Z",
    "updated_at": "2025-12-06T11:30:00.000Z"
  }
}
```

### Error Response (401)

```json
{
  "status": 401,
  "message": "No session, authorization denied"
}
```

---

## 9. Update Profile

**Endpoint:** `PUT /profile`

**Note:** Requires authentication. Include session cookie.

### Request Body (multipart/form-data)

```
fullName: "Sarah Ahmed Khan"
contactNumber: "03009876543"
gender: "Female"
dateOfBirth: "1995-08-20"
street: "123 Main Street, Block A"
city: "Lahore"
province: "Punjab"
zip_code: "54000"
country: "Pakistan"
google_map_link: "https://maps.google.com/?q=31.5204,74.3587"
profile_img: [File] (optional)
cover_img: [File] (optional)
```

### Response (200)

```json
{
  "status": 200,
  "message": "Profile updated successfully",
  "data": {
    "customer": {
      "_id": "507f1f77bcf86cd799439021",
      "fullName": "Sarah Ahmed Khan",
      "email": "sarah.ahmed@example.com",
      "gender": "Female",
      "dateOfBirth": "1995-08-20T00:00:00.000Z",
      "contactNumber": "03009876543",
      "account_status": "active",
      "is_Verified": true,
      "address_id": {
        "_id": "507f1f77bcf86cd799439022",
        "street": "123 Main Street, Block A",
        "city": "Lahore",
        "province": "Punjab",
        "zip_code": "54000",
        "country": "Pakistan",
        "google_map_link": "https://maps.google.com/?q=31.5204,74.3587",
        "customer_id": "507f1f77bcf86cd799439021",
        "created_at": "2025-12-06T11:45:00.000Z",
        "updated_at": "2025-12-06T12:00:00.000Z"
      },
      "profile_img_url": "https://res.cloudinary.com/example/customer_profiles/sarah_ahmed_new.jpg",
      "cover_img_url": "https://res.cloudinary.com/example/customer_covers/sarah_ahmed_cover_new.jpg",
      "refreshTokens": [],
      "last_login": "2025-12-06T11:30:00.000Z",
      "created_at": "2025-12-06T10:00:00.000Z",
      "updated_at": "2025-12-06T12:00:00.000Z"
    },
    "message": "Profile updated successfully",
    "nextStep": "dashboard"
  }
}
```

### Error Response (401)

```json
{
  "status": 401,
  "message": "No session, authorization denied"
}
```

---

## 10. Logout

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
  "message": "Logout successful"
}
```

### Error Response (500)

```json
{
  "status": 500,
  "message": "Could not log out"
}
```

---

## Complete Customer Object (With Address)

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "fullName": "Sarah Ahmed Khan",
  "email": "sarah.ahmed@example.com",
  "gender": "Female",
  "dateOfBirth": "1995-08-20T00:00:00.000Z",
  "contactNumber": "03009876543",
  "account_status": "active",
  "is_Verified": true,
  "oauthId": null,
  "address_id": {
    "_id": "507f1f77bcf86cd799439022",
    "street": "123 Main Street, Block A",
    "city": "Lahore",
    "province": "Punjab",
    "zip_code": "54000",
    "country": "Pakistan",
    "google_map_link": "https://maps.google.com/?q=31.5204,74.3587",
    "customer_id": "507f1f77bcf86cd799439021",
    "created_at": "2025-12-06T11:45:00.000Z",
    "updated_at": "2025-12-06T12:00:00.000Z"
  },
  "profile_img_url": "https://res.cloudinary.com/example/customer_profiles/sarah_ahmed.jpg",
  "cover_img_url": "https://res.cloudinary.com/example/customer_covers/sarah_ahmed_cover.jpg",
  "refreshTokens": [],
  "last_login": "2025-12-06T11:30:00.000Z",
  "created_at": "2025-12-06T10:00:00.000Z",
  "updated_at": "2025-12-06T12:00:00.000Z"
}
```

## Address Model (Standalone)

```json
{
  "_id": "507f1f77bcf86cd799439022",
  "street": "123 Main Street, Block A",
  "city": "Lahore",
  "province": "Punjab",
  "zip_code": "54000",
  "country": "Pakistan",
  "google_map_link": "https://maps.google.com/?q=31.5204,74.3587",
  "customer_id": "507f1f77bcf86cd799439021",
  "created_at": "2025-12-06T11:45:00.000Z",
  "updated_at": "2025-12-06T12:00:00.000Z"
}
```

---

## Authentication Notes

1. **Session-based authentication**: After login, the backend sets a session cookie (`connect.sid`)
2. **Protected routes**: `/me`, `/profile`, and `/logout` require authentication
3. **Include credentials**: Frontend should send requests with `credentials: 'include'` to maintain session
4. **nextStep values** (from service logic):
   - `verify-email`: User needs to verify email
   - `complete-profile`: User should add address information
   - `dashboard`: Profile is complete, go to dashboard
   - `check-email`: Check email for reset link
   - `login`: User should login

5. **Account Status**:
   - `active`: Normal functioning account
   - `suspended/freezed`: Temporarily suspended
   - `blocked/removed`: Permanently blocked

6. **Profile Completion**: Unlike doctors, customers don't have a complex onboarding process. They can optionally complete their profile by adding an address and uploading images.

---

## Customer Activity Log Sample

```json
{
  "_id": "507f1f77bcf86cd799439023",
  "customer_id": "507f1f77bcf86cd799439021",
  "action_type": "login",
  "description": "Customer logged in",
  "target_collection": "customers",
  "target_id": "507f1f77bcf86cd799439021",
  "changes": null,
  "ip_address": "192.168.1.100",
  "device_info": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "created_at": "2025-12-06T11:30:00.000Z"
}
```
