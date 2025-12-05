---

# 🛒 Customer Portal - Frontend Integration Guide

## 📌 Overview & Logic Flow

The Customer authentication system follows a session-based approach. While it is simpler than the Doctor flow, there is one critical logic check the frontend must perform after login: **Address Verification**.

### 🔄 The "Next Step" Logic

The backend Service calculates a "Next Step", but the Controller returns the `customer` object. The Frontend should use the following logic to determine where to redirect the user after login:

1.  **If `!customer.is_Verified`**: Redirect to **Verify Email Page** (This usually happens at login failure, but good to know).
2.  **If `!customer.address_id`** (Address is missing): Redirect to **Complete Profile / Address Form**.
3.  **Default**: Redirect to **Home / Dashboard**.

---

## 📂 1. Required Frontend Pages & Routes

Based on the backend logic, please create the following routes/pages:

| Page Name            | Suggested Route          | Description                                                               |
| :------------------- | :----------------------- | :------------------------------------------------------------------------ |
| **Login**            | `/login`                 | Email/Password form + Google Login button.                                |
| **Register**         | `/register`              | Basic info: Name, Email, Pass, Gender, Contact.                           |
| **Verify Email**     | `/verify-email/:token`   | Landing page from email link. Auto-triggers API.                          |
| **Forgot Password**  | `/forgot-password`       | Form to input email.                                                      |
| **Reset Password**   | `/reset-password/:token` | Form to input new password.                                               |
| **Complete Profile** | `/profile/edit`          | **(Protected)** Form to add Address (Street, City, etc.) & Upload Avatar. |
| **Dashboard/Home**   | `/` or `/dashboard`      | **(Protected)** Main shopping area.                                       |
| **OAuth Success**    | `/auth/oauth/success`    | Handles redirection after Google Login.                                   |
| **OAuth Error**      | `/auth/oauth/error`      | Displays error if Google Login fails.                                     |

---

## 📡 2. API Integration Details

**Base URL:** `http://localhost:5000/api/customer/auth`
**Credentials:** All requests must include credentials (cookies).

- **Axios:** `axios.defaults.withCredentials = true;`
- **Fetch:** `credentials: 'include'`

### A. Authentication

#### 1. Register

- **Endpoint:** `POST /register`
- **Payload (JSON):**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123",
    "contactNumber": "03001234567",
    "gender": "Female",
    "dateOfBirth": "1995-05-20"
  }
  ```
- **Success (201):**
  ```json
  {
    "success": true,
    "message": "Registration successful...",
    "data": { "nextStep": "verify-email" }
  }
  ```
- **Frontend Action:** Redirect to a "Check your email" confirmation page.

#### 2. Verify Email

- **Endpoint:** `POST /verify-email`
- **Payload (JSON):** `{ "token": "string_from_url" }`
- **Success (200):** Message confirming verification.
- **Frontend Action:** Redirect to **Login**.

#### 3. Login

- **Endpoint:** `POST /login`
- **Payload (JSON):**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```
- **Success (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "customer": {
        "_id": "...",
        "fullName": "...",
        "address_id": null, // <--- CHECK THIS
        ...
      },
      "accountStatus": "active"
    }
  }
  ```
- **Frontend Action (Critical):**
  1.  Check `response.data.customer.address_id`.
  2.  If **null** $\rightarrow$ Redirect to `/profile/edit` (User needs to set address).
  3.  If **exists** $\rightarrow$ Redirect to `/dashboard`.

#### 4. Google OAuth

- **Action:** Redirect user browser to `BACKEND_URL/google`
- **Callback Handling:**
  - Backend redirects to: `FRONTEND_URL/auth/oauth/success?role=customer&isNewUser=true`
  - **Frontend Logic:**
    1.  Parse URL params.
    2.  Call **Get Current User (`/me`)** to get the customer object.
    3.  Perform the "Address Check" logic (step 3 above) to decide where to send them.

---

### B. Profile & Address Management (Protected)

#### 1. Get Current User

- **Endpoint:** `GET /me`
- **Description:** Used to re-fetch user data or check session validity on page load.
- **Success (200):** Returns full customer object.

#### 2. Update Profile & Address

- **Endpoint:** `PUT /profile`
- **Content-Type:** `multipart/form-data`
- **Description:** Updates text info, creates/updates the Address, and uploads images.
- **Usage:** Use this for the "Complete Profile" step AND general profile editing.

- **Form Data - Files:**
  - `profile_img` (File)
  - `cover_img` (File)

- **Form Data - Text Fields:**
  - `fullName`: "Jane Doe"
  - `contactNumber`: "0300..."
  - `gender`: "Female"
  - `street`: "House 12, Street 5"
  - `city`: "Lahore"
  - `province`: "Punjab"
  - `zip_code`: "54000"
  - `country`: "Pakistan"
  - `google_map_link`: "https://maps.google..."

- **Success (200):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "customer": { ... } // Contains updated address_id
    }
  }
  ```

---

### C. Password Recovery

#### 1. Forgot Password

- **Endpoint:** `POST /forget-password`
- **Payload:** `{ "email": "jane@example.com" }`

#### 2. Reset Password

- **Endpoint:** `POST /reset-password`
- **Payload:** `{ "token": "...", "newPassword": "..." }`

---

### D. Logout

- **Endpoint:** `POST /logout`
- **Success:** Clears session. Redirect to Login.

---

## 🛠 Developer Notes

1.  **Address Object:** The customer object has an `address_id` field.
    - When you call `PUT /profile`, the backend creates an Address document and links it to the customer.
    - Subsequent calls to `GET /me` or `PUT /profile` response will show the `address_id` populated (or linked).
    - **Logic:** If `address_id` is missing, the user cannot receive deliveries. Force them to the profile page.

2.  **Validation:**
    - Passwords must be 3-30 chars and alphanumeric.
    - Contact numbers must be 10-15 digits.
    - The API returns `400` with specific messages if validation fails.

3.  **Images:**
    - `profile_img` and `cover_img` are handled by Cloudinary on the backend. You just need to send the file object in FormData.
