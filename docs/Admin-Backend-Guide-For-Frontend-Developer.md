# 🛡️ Admin Portal - Frontend Integration Guide

## 📌 Overview & Logic Flow

The Admin authentication system is **Session-Based** and strictly enforces **2-Step Verification (2FA)**. An admin cannot access the dashboard immediately after entering their password; they must verify an OTP sent to their email.

### 🔄 The "Next Step" Logic

The API returns a `nextStep` variable in the response data. The Frontend **must** handle these redirects:

1.  **Login Success** $\rightarrow$ Returns `nextStep: 'verify-otp'`. Redirect to **OTP Entry Page**.
2.  **OTP Success** $\rightarrow$ Returns `nextStep: 'dashboard'`. Redirect to **Admin Dashboard**.
3.  **Logout / Reset** $\rightarrow$ Returns `nextStep: 'login'`. Redirect to **Login Page**.

---

## 📂 1. Required Frontend Pages & Routes

Based on the backend logic, please create the following routes/pages:

| Page Name           | Suggested Route                | Description                               |
| :------------------ | :----------------------------- | :---------------------------------------- |
| **Admin Login**     | `/admin/login`                 | Email & Password form.                    |
| **Verify OTP**      | `/admin/verify-otp`            | Input for 6-digit OTP code.               |
| **Forgot Password** | `/admin/forgot-password`       | Form to input email.                      |
| **Reset Password**  | `/admin/reset-password/:token` | Form to input new password.               |
| **Dashboard**       | `/admin/dashboard`             | **(Protected)** Main Admin control panel. |

---

## 📡 2. API Integration Details

**Base URL:** `http://localhost:5000/api/admin/auth`
**Credentials:** All requests must include credentials (cookies).

- **Axios:** `axios.defaults.withCredentials = true;`
- **Fetch:** `credentials: 'include'`

### A. Authentication Flow (2FA)

#### 1. Login (Step 1)

- **Endpoint:** `POST /login`
- **Payload (JSON):**
  ```json
  {
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "OTP sent to email",
    "data": {
      "adminId": "...",
      "email": "admin@example.com",
      "nextStep": "verify-otp" // <--- Trigger Redirect
    }
  }
  ```
- **Frontend Action:**
  1.  Store the `email` temporarily (state/context) to pre-fill it on the next page.
  2.  Redirect to `/admin/verify-otp`.

#### 2. Verify OTP (Step 2)

- **Endpoint:** `POST /verify-otp`
- **Description:** Validates the OTP and establishes the full session.
- **Payload (JSON):**
  ```json
  {
    "email": "admin@example.com",
    "otp": "123456"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "2FA Verified",
    "data": {
      "admin": {
        "_id": "...",
        "name": "Super Admin",
        "email": "...",
        "category": "super-admin"
      },
      "nextStep": "dashboard" // <--- Trigger Redirect
    }
  }
  ```

---

### B. Password Recovery

#### 1. Forgot Password

- **Endpoint:** `POST /forget-password`
- **Payload:** `{ "email": "admin@example.com" }`
- **Success (200):** `{ "nextStep": "check-email" }`

#### 2. Reset Password

- **Endpoint:** `POST /reset-password`
- **Payload:**
  ```json
  {
    "token": "token_from_url_params",
    "newPassword": "NewSecurePassword123"
  }
  ```
- **Success (200):** `{ "nextStep": "login" }`

---

### C. Logout

- **Endpoint:** `POST /logout`
- **Action:** Clears cookies/session.
- **Success (200):** `{ "nextStep": "login" }`

---

## 🛠 Developer Notes

1.  **Session & Cookies:**
    - The "Login" step creates a **temporary session** (`pendingAdminId`).
    - The "Verify OTP" step converts that into a **full session** (`adminId`).
    - **Implication:** If the user refreshes the browser or closes the tab between Step 1 and Step 2, the temporary session might be lost depending on cookie persistence settings. Ensure the `verify-otp` page handles "Session Expired" errors gracefully (redirect back to login).

2.  **Validation:**
    - **Password:** Min 8 characters (as per Joi).
    - **OTP:** Must be exactly 6 digits.
    - API returns `400 Bad Request` if validation fails.

3.  **Error Handling:**
    - `INVALID_CREDENTIALS` (401): Wrong password.
    - `INVALID_OR_EXPIRED_OTP` (400): Wrong code or time ran out.
    - `INVALID_SESSION` (400): Trying to verify OTP without logging in first.

4.  **Admin Categories:**
    - The `admin` object returned in Verify OTP contains a `category` field (e.g., `super-admin`, `support`). Use this for frontend Role-Based Access Control (RBAC) to hide/show sidebar items.
