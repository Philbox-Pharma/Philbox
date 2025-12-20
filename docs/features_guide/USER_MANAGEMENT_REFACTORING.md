# User Management Refactoring - Staff Only (Admin & Salesperson)

## Overview

Refactored the unified user management system to focus **only on staff members**: **Admin** and **Salesperson**. The system now handles these two user types with proper separation of concerns and **type-specific attributes** from their respective models.

## Key Changes

✅ **Removed Support For**

- Customer management
- Doctor management

✅ **Focused Implementation**

- Admin management with admin-specific attributes
- Salesperson management with salesperson-specific attributes

✅ **Architecture Pattern**

- **NOT** generic parameterized methods (old pattern with `userType` parameter)
- **YES** type-specific methods with model-specific attribute handling
- Separate service methods for each user type
- Separate controller handlers for each user type
- Separate routes for each user type

## File Structure

### Current Structure

```
user_management/
├── controller/
│   └── user.controller.js          (14 specific handlers)
├── routes/
│   └── user.routes.js              (Admin & Salesperson routes separated)
└── services/
    └── user.service.js             (Type-specific business logic)
```

## Type-Specific Request Body Attributes

### Admin Attributes (from Admin Model)

```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "phone_number": "string (optional)",
  "branches_managed": ["ObjectId"] (optional),
  "addresses": [{ object }] (optional),
  "profile_img": "file (optional)"
}
```

### Salesperson Attributes (from Salesperson Model)

```json
{
  "fullName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "contactNumber": "string (required)",
  "gender": "enum['Male', 'Female'] (optional)",
  "dateOfBirth": "date (optional)",
  "branches_to_be_managed": ["ObjectId"] (optional)
}
```

## API Routes

### Admin Management

```
POST   /api/admin/users/admin              → Create Admin
GET    /api/admin/users/admin              → List Admins (with pagination)
GET    /api/admin/users/admin/:id          → Get Admin Details
GET    /api/admin/users/admin/search       → Search Admin
PUT    /api/admin/users/admin/:id          → Update Admin
DELETE /api/admin/users/admin/:id          → Delete Admin
```

### Salesperson Management

```
POST   /api/admin/users/salesperson              → Create Salesperson
GET    /api/admin/users/salesperson              → List Salespersons (with pagination)
GET    /api/admin/users/salesperson/:id          → Get Salesperson Details
GET    /api/admin/users/salesperson/search       → Search Salesperson
PUT    /api/admin/users/salesperson/:id          → Update Salesperson
PATCH  /api/admin/users/salesperson/:id/status   → Change Salesperson Status
DELETE /api/admin/users/salesperson/:id          → Delete Salesperson
PUT    /api/admin/branch-admin/:id          → Update Branch Admin
DELETE /api/admin/branch-admin/:id          → Delete Branch Admin

POST   /api/admin/salesperson               → Create Salesperson
GET    /api/admin/salesperson               → List Salespersons
GET    /api/admin/salesperson/:id           → Get Salesperson
PUT    /api/admin/salesperson/:id           → Update Salesperson
DELETE /api/admin/salesperson/:id           → Delete Salesperson
PATCH  /api/admin/salesperson/:id/status    → Change Status
```

### New Routes (Unified)

```
POST   /api/admin/users/:userType                    → Create User
GET    /api/admin/users/:userType                    → List Users
GET    /api/admin/users/:userType/:id                → Get User
GET    /api/admin/users/:userType/search             → Search User
PUT    /api/admin/users/:userType/:id                → Update User
DELETE /api/admin/users/:userType/:id                → Delete User
PATCH  /api/admin/users/:userType/:id/status         → Change Status
```

**Where `userType` can be**: `admin`, `salesperson`, `customer`, or `doctor`

### Example Usage

```
# Create a new admin
POST /api/admin/users/admin
Body: { name, email, password, phone_number, branches_managed }

# Create a new salesperson
POST /api/admin/users/salesperson
Body: { fullName, email, password, branches_to_be_managed }

# List all salespersons
GET /api/admin/users/salesperson?page=1&limit=10

# Get specific customer details
GET /api/admin/users/customer/64abc123def456

# Update doctor
PUT /api/admin/users/doctor/64abc123def456
Body: { name, email, phone_number }

# Change salesperson status
PATCH /api/admin/users/salesperson/64abc123def456/status
Body: { status: "suspended" }

# Delete admin
DELETE /api/admin/users/admin/64abc123def456
```

## Service Layer Methods

### Admin-Specific Methods

- `createAdmin(data, profileImage, req)` - Creates admin with name, email, password, phone_number, branches_managed, addresses
- `getAllAdmins(query)` - Paginated list with search, status, branch filters
- `getAdminById(adminId)` - Returns single admin with populated relationships
- `searchAdmin(searchParams)` - Searches by id, email, or name (case-insensitive)
- `updateAdmin(adminId, updateData, req)` - Updates admin-specific fields
- `deleteAdmin(adminId, req)` - Deletes admin and cleanup branch references

### Salesperson-Specific Methods

- `createSalesperson(data, req)` - Creates salesperson with fullName, email, password, contactNumber, gender, dateOfBirth, branches_to_be_managed
- `getAllSalespersons(query)` - Paginated list with search, status, branch filters
- `getSalespersonById(salespersonId)` - Returns single salesperson with populated relationships
- `searchSalesperson(searchParams)` - Searches by id, email, or fullName (case-insensitive)
- `updateSalesperson(salespersonId, updateData, req)` - Updates salesperson-specific fields
- `changeSalespersonStatus(salespersonId, status, req)` - Changes salesperson status only
- `deleteSalesperson(salespersonId, req)` - Deletes salesperson

## Features

### Admin Management

- ✅ Create branch admin with profile image upload
- ✅ Assign branches to admin
- ✅ Manage addresses
- ✅ List with pagination and search
- ✅ Update admin details
- ✅ Delete admin and cleanup branch references
- ✅ Activity logging
- ✅ RBAC role assignment (branch_admin)
- ✅ Welcome email on creation

### Salesperson Management

- ✅ Create salesperson with specific attributes
- ✅ Assign branches for management
- ✅ List with pagination, search, and filters
- ✅ Update salesperson details
- ✅ Change status (active/suspended/blocked)
- ✅ Delete salesperson
- ✅ Activity logging
- ✅ RBAC role assignment (salesperson)
- ✅ Welcome email on creation

## RBAC Integration

- **Admin users** automatically assigned `branch_admin` role
- **Salesperson users** automatically assigned `salesperson` role
- All endpoints require `super_admin` role and authentication
- Roles carry specific permissions managed via `/api/admin/permissions`

## Error Handling

Common error codes:

- `EMAIL_EXISTS` → Email already registered (400)
- `ADMIN_NOT_FOUND` → Admin with ID doesn't exist (404)
- `SALESPERSON_NOT_FOUND` → Salesperson with ID doesn't exist (404)
- `INVALID_BRANCH_IDS` → One or more branch IDs invalid (400)

## Activity Logging

All operations logged with:

- Action type (create, update, delete, change_status)
- Description of action
- User type (admin/salesperson)
- Affected user ID
- Before/after values for tracking changes

## Validation

Using Joi validation schemas:

- `createBranchAdminSchema` → Admin creation validation
- `updateBranchAdminSchema` → Admin update validation
- `createSalespersonDTO` → Salesperson creation validation
- `updateSalespersonDTO` → Salesperson update validation
- `changeStatusDTO` → Status change validation
- `paginationSchema` → Pagination query validation

## Migration Notes

### Files Deleted

- `staff_management/admin_management/` (entire directory)
- `staff_management/salesperson_management/` (entire directory)
- `staff_management/` (once both subdirectories removed)

### Files Updated

- `server.js` - Updated route imports and registrations
- `global.routes.constants.js` - Removed `SUPER_ADMIN_SALESPERSON_MANAGEMENT`

### Files Created

- `user_management/controller/user.controller.js`
- `user_management/routes/user.routes.js`
- `user_management/services/user.service.js`

## Testing Checklist

- [ ] Create admin user with branch assignment
- [ ] Create salesperson with branch assignment
- [ ] Create customer
- [ ] Create doctor
- [ ] List users with pagination
- [ ] Search users by email/name
- [ ] Update user details
- [ ] Change salesperson status
- [ ] Delete user
- [ ] Verify activity logs
- [ ] Verify role assignment on creation
- [ ] Verify email sending on creation
- [ ] Verify proper error handling

## Future Enhancements

1. Add customer and doctor creation DTOs
2. Add soft delete feature for audit trail
3. Implement bulk operations (bulk create, bulk update)
4. Add export functionality (CSV/Excel)
5. Add email verification for new users
6. Add two-factor authentication for admin accounts
