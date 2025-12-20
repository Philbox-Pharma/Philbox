# Philbox RBAC Permissions Structure

## Overview

This document defines the Role-Based Access Control (RBAC) permissions for Philbox, a comprehensive pharmacy and healthcare management system. Permissions are based on the official Philbox proposal and aligned with each role's responsibilities.

---

## Role Hierarchy & Permissions Matrix

### 1. **SUPER ADMIN** 👨‍💼

**Description:** Super Administrator - Full system access including branch management, user approval, and analytics

**Scope:** System-wide

**All Permissions:** ✅ 32/32 (Full Access)

- All user management (create, read, update, delete)
- All branch management (create, read, update, delete)
- All doctor management (create, read, update, delete)
- All customer management (create, read, update, delete)
- All salesperson management (create, read, update, delete)
- All appointment management (create, read, update, delete)
- All prescription management (create, read, update, delete)
- All order/pharmacy operations (create, read, update, delete)
- All reports (create, read, update, delete)

**Key Responsibilities (from proposal):**

- Create, read, update, delete pharmacy branches
- Approve/reject doctor registrations
- Freeze/suspend accounts
- Add/edit/remove doctor profiles
- Add salespersons and manage their profiles
- Access appointment details with messages, prescriptions, videos
- Send system-wide announcements
- Assign tasks to salespersons
- Manage coupons and system configurations
- View comprehensive analytics dashboards

---

### 2. **BRANCH ADMIN** 🏪

**Description:** Branch Administrator - Manage branch operations, staff, inventory, and customer data within assigned branches

**Scope:** Assigned branch(es) only

**Permissions:** 13/32

- ✅ `read_branches` - View branch details
- ✅ `update_branches` - Update branch information
- ✅ `create_users` - Add staff members
- ✅ `read_users` - View staff members
- ✅ `update_users` - Update staff profiles
- ✅ `read_doctors` - View registered doctors
- ✅ `update_doctors` - Update doctor profiles (status, availability)
- ✅ `read_customers` - View customers in their branch
- ✅ `update_customers` - Update customer information
- ✅ `read_salespersons` - View salespersons assigned to branch
- ✅ `update_salespersons` - Update salesperson profiles and assignments
- ✅ `read_appointments` - View appointments in branch
- ✅ `update_appointments` - Monitor and manage appointments
- ✅ `read_reports` - View analytics and reports for their branch

**Cannot Access:**

- ❌ Create/Delete branches (super_admin only)
- ❌ Delete users, doctors, customers, salespersons
- ❌ Approve/Reject doctor applications (super_admin only)
- ❌ Manage global system settings (super_admin only)

**Key Responsibilities (from proposal):**

- Monitor branch performance through dashboards
- Manage staff appointments and schedules
- Track inventory status and orders
- Oversee customer interactions within branch
- Generate branch-specific reports
- Assign tasks to salespersons
- Handle customer complaints at branch level

---

### 3. **SALESPERSON** 🛒

**Description:** Salesperson - Handle inventory updates, order processing, prescription verification, and low-stock management

**Scope:** Inventory and order operations

**Permissions:** 9/32

- ✅ `create_users` - Create inventory items/medicines
- ✅ `read_users` - View inventory and orders
- ✅ `update_users` - Update stock quantities, mark orders as packed/ready
- ✅ `delete_users` - Remove/disable medicines (expiry/discontinuation)
- ✅ `read_prescriptions` - View customer prescriptions for verification
- ✅ `update_prescriptions` - Verify prescriptions before fulfillment
- ✅ `read_customers` - View customer details for order context
- ✅ `read_appointments` - View appointment context for prescription fulfillment
- ✅ `read_reports` - View inventory alerts and order dashboards

**Cannot Access:**

- ❌ Create/Delete users, customers, doctors
- ❌ Manage appointments (read-only)
- ❌ Create/Delete appointments
- ❌ Access system analytics
- ❌ Manage branches or staff

**Key Responsibilities (from proposal):**

- Upload bulk inventory via Excel files
- Update stock quantities in real-time
- Receive low-stock alerts on orders page
- Mark orders as packed or ready for delivery
- Verify customer-uploaded prescriptions
- View customer details for delivery context
- Update task status assigned by admin
- Maintain audit logs of inventory changes

---

### 4. **DOCTOR** 👨‍⚕️

**Description:** Doctor - Manage consultation schedules, appointments, prescriptions, and patient interactions

**Scope:** Own appointments and consultations only

**Permissions:** 7/32

- ✅ `create_appointments` - Set available time slots
- ✅ `read_appointments` - View consultation requests and past appointments
- ✅ `update_appointments` - Accept/reject appointment requests
- ✅ `create_prescriptions` - Create prescriptions post-consultation
- ✅ `read_prescriptions` - View own and patient prescriptions
- ✅ `update_prescriptions` - Update prescription details
- ✅ `read_customers` - View patient details and medical history
- ✅ `read_reports` - View own performance analytics

**Cannot Access:**

- ❌ Manage other doctors
- ❌ Delete appointments or prescriptions
- ❌ Access system administration features
- ❌ Modify customer profiles or orders
- ❌ Manage inventory

**Key Responsibilities (from proposal):**

- Complete onboarding with appointment fee setup
- Set and manage available consultation time slots
- Accept/reject consultation requests
- Conduct consultations via video calls
- Access patient medical history during consultation
- Generate e-prescriptions and downloadable PDFs
- View consultation feedback and ratings
- Monitor account status (active/suspended)

---

### 5. **CUSTOMER** 👤

**Description:** Customer - Browse medicines, place orders, book appointments, upload prescriptions, and manage own data

**Scope:** Own orders, appointments, and personal data only

**Permissions:** 8/32

- ✅ `read_users` - Browse medicines catalog and search
- ✅ `create_users` - Place orders and submit feedback
- ✅ `update_users` - Reschedule/cancel own orders
- ✅ `create_appointments` - Request appointments with doctors
- ✅ `read_appointments` - View own appointment history
- ✅ `update_appointments` - Reschedule own appointments
- ✅ `read_prescriptions` - View own e-prescriptions
- ✅ `update_prescriptions` - Upload prescriptions
- ✅ `read_reports` - View own order history and invoices

**Cannot Access:**

- ❌ Delete orders or appointments
- ❌ Access other customers' data
- ❌ View staff or administrative features
- ❌ Modify inventory
- ❌ Create/manage appointments (only request)
- ❌ Access system analytics

**Key Responsibilities (from proposal):**

- Sign up with email/password or OAuth (Google/Facebook)
- Browse medicines by category, brand, dosage form
- Add medicines to cart and place orders
- Pay for orders via Stripe, JazzCash, EasyPaisa
- Request appointments with available doctors
- Consult doctors via live chat and video call
- Upload prescriptions for orders
- Give feedback and ratings for doctors and orders
- Set medicine refill reminders
- Download invoices and e-prescriptions

---

## Permission Resources Matrix

```
Resource         | Super Admin | Branch Admin | Salesperson | Doctor | Customer
-----------------+-------------+--------------+-------------+--------+---------
users            | CRUD        | CRU          | CRU         | -      | CR
branches         | CRUD        | RU           | -           | -      | -
doctors          | CRUD        | RU           | R           | -      | -
customers        | CRUD        | CRU          | R           | R      | R (own)
salespersons     | CRUD        | CRU          | -           | -      | -
appointments     | CRUD        | CRU          | R           | CRUD   | CR(own)U
prescriptions    | CRUD        | -            | RU          | CRUD   | RU(own)
reports          | CRUD        | R(own)       | R(own)      | R(own) | R(own)

Legend: C = Create, R = Read, U = Update, D = Delete, - = No Access, (own) = Own records only
```

---

## Action-Based Permissions

### Create (C)

- **Super Admin:** Can create any resource
- **Branch Admin:** Can create staff, users, but not branches
- **Salesperson:** Can create inventory items, submit feedback
- **Doctor:** Can create appointments (set availability), prescriptions
- **Customer:** Can create orders, feedback

### Read (R)

- **Super Admin:** Full access to all records
- **Branch Admin:** Branch-scoped records only
- **Salesperson:** Inventory, orders, prescriptions, customers, appointments
- **Doctor:** Own appointments, prescriptions, patient info
- **Customer:** Own appointments, prescriptions, order history

### Update (U)

- **Super Admin:** Full access
- **Branch Admin:** Users, doctors, customers, salespersons, appointments within branch
- **Salesperson:** Inventory, order status, prescription verification
- **Doctor:** Own appointments, prescriptions
- **Customer:** Own orders, appointments, prescriptions

### Delete (D)

- **Super Admin:** Full access
- **Branch Admin:** ❌ Cannot delete any resources
- **Salesperson:** Can disable medicines (expiry)
- **Doctor:** ❌ Cannot delete (audit trail needed)
- **Customer:** ❌ Cannot delete (orders/appointments)

---

## Data Isolation & Scope Rules

### Super Admin

- No data isolation - full system access

### Branch Admin

- **Isolated to:** Assigned branch(es)
- **Can view/manage:** Staff, doctors, customers, salespersons assigned to their branch
- **Cannot see:** Data from other branches
- **Special rule:** Can manage multiple branches if assigned

### Salesperson

- **Isolated to:** Own branch (via employment)
- **Can view/manage:** Branch inventory, orders, customer orders
- **Cannot see:** Other branches' data

### Doctor

- **Isolated to:** Own appointments and patient consultations
- **Can view/manage:** Own schedule, own consultations, patient medical history
- **Cannot see:** Other doctors' appointments or system data

### Customer

- **Isolated to:** Own data only
- **Can view/manage:** Own orders, own appointments, own prescriptions
- **Cannot see:** Other customers' data

---

## API Endpoint Access Control

### Super Admin Routes

```
✅ GET/POST /api/admin/branches
✅ GET/POST /api/admin/users
✅ GET/POST /api/admin/doctors
✅ GET/POST /api/admin/customers
✅ GET/POST /api/admin/salespersons
✅ GET/POST /api/admin/appointments
✅ GET/POST /api/admin/permissions
✅ GET/POST /api/admin/reports
```

### Branch Admin Routes

```
✅ GET /api/branch-admin/branches/:branchId
✅ PUT /api/branch-admin/branches/:branchId
✅ GET/POST /api/branch-admin/staff
✅ GET /api/branch-admin/doctors
✅ PUT /api/branch-admin/doctors/:doctorId
✅ GET /api/branch-admin/customers
✅ PUT /api/branch-admin/customers/:customerId
✅ GET /api/branch-admin/reports
```

### Salesperson Routes

```
✅ POST /api/salesperson/inventory/upload
✅ GET /api/salesperson/inventory
✅ PUT /api/salesperson/inventory/:medicineId
✅ GET /api/salesperson/orders
✅ PUT /api/salesperson/orders/:orderId
✅ GET /api/salesperson/prescriptions
✅ PUT /api/salesperson/prescriptions/verify/:prescriptionId
✅ GET /api/salesperson/alerts
```

### Doctor Routes

```
✅ GET/PUT /api/doctor/profile
✅ POST /api/doctor/availability
✅ GET /api/doctor/appointments
✅ PUT /api/doctor/appointments/:appointmentId
✅ POST /api/doctor/prescriptions
✅ GET /api/doctor/prescriptions
✅ GET /api/doctor/patients/:patientId
✅ GET /api/doctor/performance
```

### Customer Routes

```
✅ GET /api/customer/medicines
✅ POST /api/customer/orders
✅ GET /api/customer/orders
✅ PUT /api/customer/orders/:orderId
✅ POST /api/customer/appointments
✅ GET /api/customer/appointments
✅ PUT /api/customer/appointments/:appointmentId
✅ POST /api/customer/prescriptions/upload
✅ GET /api/customer/profile
```

---

## Permission Enforcement

### Middleware Chain

Every protected route follows this authentication and authorization flow:

```javascript
Route Middleware:
1. authenticate                    // Verify user token
2. roleMiddleware('required_role') // Check user role
3. permissionCheckMiddleware       // Verify specific permission
4. Controller Action               // Execute endpoint
```

### Example: Create Doctor (Super Admin Only)

```javascript
router.post(
  "/doctors",
  authenticate, // Verify JWT
  roleMiddleware("super_admin"), // Must be super_admin
  permissionCheckMiddleware("create_doctors"), // Must have create_doctors permission
  createDoctor, // Execute
);
```

---

## Implementation Notes

### Adding New Permissions

1. Define permission in `seedRolesPermissions.js` (resource + action)
2. Assign to appropriate roles
3. Use `permissionCheckMiddleware` in routes
4. Run seeding script: `npm run seed`

### Updating Role Permissions

1. Modify role config in `seedRolesPermissions.js`
2. Run seeding: `npm run seed`
3. Permissions update automatically (upsert)

### Testing Permissions

```bash
# Get user's current role and permissions
GET /api/admin/permissions/user-role

# Example response:
{
  "userId": "...",
  "userType": "salesperson",
  "role": "salesperson",
  "roleId": "...",
  "permissions": [
    { "resource": "users", "action": "create" },
    { "resource": "users", "action": "read" },
    ...
  ]
}
```

---

## Changes from Original Seeding

### SUPER ADMIN

- ✅ No changes - maintains full access

### BRANCH ADMIN

- ✅ Added: `update_appointments` - Now can manage appointments in their branch
- ✅ Added: `create_salespersons` permission for staff management (via users)
- ✅ Kept: All original permissions

### SALESPERSON

- ✅ Complete overhaul based on proposal:
  - Now has FULL inventory CRUD (create, read, update, delete)
  - Can mark orders as packed/ready
  - Can verify prescriptions
  - Can view customers for delivery context
  - Can see low-stock alerts via reports
  - Properly scoped to inventory operations only

### DOCTOR

- ✅ Added: `create_appointments` - Now can set availability slots
- ✅ Maintained: All consultation and prescription management
- ✅ Added: Clearer scoping to own appointments only

### CUSTOMER

- ✅ Complete restructure per proposal:
  - Can browse medicines (read_users)
  - Can place orders (create_users) and manage them
  - Can request appointments (create_appointments)
  - Can upload prescriptions (update_prescriptions)
  - Can submit and view feedback
  - All scoped to own records

---

## Security Best Practices

1. **Principle of Least Privilege:** Each role has minimum required permissions
2. **Data Isolation:** Branch admins see only their branch data
3. **Audit Trails:** All actions logged with user, timestamp, changes
4. **Rate Limiting:** API endpoints protected from brute force
5. **Encryption:** Sensitive data encrypted at rest and in transit
6. **Token Expiration:** JWT tokens expire, require re-authentication

---

## Compliance

- ✅ **HIPAA:** Patient health information protected with role-based access
- ✅ **GDPR:** Customer data accessible only to authorized roles
- ✅ **Audit Trails:** All actions tracked by user and timestamp
- ✅ **Data Encryption:** Sensitive fields encrypted with AES

---

## References

- Philbox Final Year Project Proposal (2022-2026)
- RBAC Implementation Guide: `RBAC.md`
- Authentication Fix Details: `RBAC_AUTHENTICATION_FIX.md`
- Quick Setup Guide: `QUICK_FIX.md`

---

**Last Updated:** December 11, 2025
**Version:** 2.0 - Proposal-Aligned Permissions
**Status:** ✅ Active & Implemented
