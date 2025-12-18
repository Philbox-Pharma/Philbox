# Customer Management API Guide

## Base URL

```
http://localhost:5000/api/super-admin/customers
```

## Authentication

All routes require:

- Session-based authentication
- Super Admin or Branch Admin role

## Important Notes

- **Branch Admin Restrictions**: Branch admins can only view customers who have placed orders from their managed branches
- **Super Admin**: Has access to all customers across all branches
- **Password Security**: Customer passwords are never exposed in any response

---

## Table of Contents

1. [Get All Customers](#1-get-all-customers)
2. [Get Customer Details](#2-get-customer-details)
3. [Toggle Customer Status](#3-toggle-customer-status)
4. [Get Customer Metrics](#4-get-customer-metrics)
5. [Error Codes](#5-error-codes)

---

## 1. Get All Customers

**Endpoint:** `GET /api/super-admin/customers`
**Authentication:** Required (Super Admin / Branch Admin)

### Query Parameters

| Parameter        | Type   | Required | Description                                  | Valid Values                               |
| ---------------- | ------ | -------- | -------------------------------------------- | ------------------------------------------ |
| `page`           | Number | No       | Page number (default: 1)                     | Min: 1                                     |
| `limit`          | Number | No       | Items per page (default: 10)                 | Min: 1, Max: 100                           |
| `search`         | String | No       | Search by name, email, or phone              | Any string                                 |
| `account_status` | String | No       | Filter by account status                     | active, suspended/freezed, blocked/removed |
| `is_Verified`    | String | No       | Filter by verification status                | true, false                                |
| `startDate`      | String | No       | Filter customers registered after this date  | ISO 8601 format (e.g., 2025-01-01)         |
| `endDate`        | String | No       | Filter customers registered before this date | ISO 8601 format (e.g., 2025-12-31)         |
| `branchId`       | String | No       | Filter by specific branch (Super Admin only) | MongoDB ObjectId (24 hex characters)       |

### Example Requests

#### Get first page of customers

```bash
GET /api/super-admin/customers?page=1&limit=10
```

#### Search for customer by email

```bash
GET /api/super-admin/customers?search=john@example.com
```

#### Filter by status and verification

```bash
GET /api/super-admin/customers?account_status=active&is_Verified=true
```

#### Filter by date range

```bash
GET /api/super-admin/customers?startDate=2025-01-01&endDate=2025-12-31
```

#### Filter by branch (Super Admin only)

```bash
GET /api/super-admin/customers?branchId=64abc123def456789012abcd
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "docs": [
      {
        "_id": "64customer123...",
        "fullName": "John Smith",
        "email": "john.smith@example.com",
        "contactNumber": "+92-300-1234567",
        "gender": "Male",
        "dateOfBirth": "1990-05-15T00:00:00.000Z",
        "account_status": "active",
        "is_Verified": true,
        "profile_img_url": "https://cloudinary.com/...",
        "cover_img_url": "https://cloudinary.com/...",
        "last_login": "2025-12-18T10:30:00.000Z",
        "created_at": "2025-01-15T08:00:00.000Z",
        "updated_at": "2025-12-18T10:30:00.000Z",
        "address_id": {
          "_id": "64address123...",
          "street": "123 Main Street",
          "city": "Karachi",
          "state": "Sindh",
          "country": "Pakistan",
          "zipCode": "75500"
        },
        "roleId": {
          "_id": "64role123...",
          "name": "Customer",
          "permissions": []
        }
      }
    ],
    "totalDocs": 150,
    "limit": 10,
    "page": 1,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### Error Responses

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to retrieve customers",
  "error": "Error details..."
}
```

---

## 2. Get Customer Details

**Endpoint:** `GET /api/super-admin/customers/:id`
**Authentication:** Required (Super Admin / Branch Admin)

### URL Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `id`      | String | Yes      | Customer MongoDB ID |

### Example Request

```bash
GET /api/super-admin/customers/64customer123def456789012abcd
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Customer details retrieved successfully",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "contactNumber": "+92-300-1234567",
      "gender": "Male",
      "dateOfBirth": "1990-05-15T00:00:00.000Z",
      "account_status": "active",
      "is_Verified": true,
      "profile_img_url": "https://cloudinary.com/...",
      "cover_img_url": "https://cloudinary.com/...",
      "last_login": "2025-12-18T10:30:00.000Z",
      "created_at": "2025-01-15T08:00:00.000Z",
      "updated_at": "2025-12-18T10:30:00.000Z",
      "address_id": {
        "_id": "64address123...",
        "street": "123 Main Street",
        "city": "Karachi",
        "state": "Sindh",
        "country": "Pakistan",
        "zipCode": "75500"
      },
      "roleId": {
        "_id": "64role123...",
        "name": "Customer",
        "permissions": []
      }
    },
    "orders": [
      {
        "_id": "64order123...",
        "customer_id": "64customer123...",
        "total": 15000,
        "delivery_charges": 200,
        "status": "completed",
        "refund_status": "not-refunded",
        "created_at": "2025-12-10T14:20:00.000Z",
        "updated_at": "2025-12-11T16:30:00.000Z",
        "branch_id": {
          "_id": "64branch123...",
          "name": "Philbox Karachi",
          "location": "Gulshan-e-Iqbal",
          "contactNumber": "+92-21-34567890"
        },
        "salesperson_id": {
          "_id": "64sales123...",
          "fullName": "Ahmed Ali",
          "email": "ahmed@philbox.com",
          "contactNumber": "+92-300-9876543"
        },
        "order_items": [
          {
            "_id": "64item123...",
            "product_name": "Blood Pressure Monitor",
            "quantity": 2,
            "price": 7000,
            "total": 14000
          },
          {
            "_id": "64item124...",
            "product_name": "Thermometer",
            "quantity": 1,
            "price": 1000,
            "total": 1000
          }
        ]
      }
    ],
    "reviews": [
      {
        "_id": "64review123...",
        "customer_id": "64customer123...",
        "message": "Excellent service! Very professional and timely delivery.",
        "rating": 5,
        "target_type": "order",
        "target_id": "64order123...",
        "sentiment": "positive",
        "created_at": "2025-12-11T18:00:00.000Z",
        "updated_at": "2025-12-11T18:00:00.000Z"
      },
      {
        "_id": "64review124...",
        "customer_id": "64customer123...",
        "message": "Doctor was very helpful and knowledgeable.",
        "rating": 4,
        "target_type": "doctor",
        "target_id": "64doctor123...",
        "sentiment": "positive",
        "created_at": "2025-12-05T10:15:00.000Z",
        "updated_at": "2025-12-05T10:15:00.000Z"
      }
    ],
    "complaints": [
      {
        "_id": "64complaint123...",
        "customer_id": "64customer123...",
        "title": "Late Delivery",
        "description": "Order was delivered 2 days late without prior notice.",
        "category": "Delivery Issue",
        "priority": "medium",
        "status": "resolved",
        "messages": [
          {
            "_id": "64msg123...",
            "sender_role": "customer",
            "sender_id": "64customer123...",
            "message": "Order was delivered 2 days late",
            "sent_at": "2025-12-08T09:00:00.000Z"
          },
          {
            "_id": "64msg124...",
            "sender_role": "branch-admin",
            "sender_id": "64admin123...",
            "message": "We apologize for the delay. Delivery personnel had an emergency.",
            "sent_at": "2025-12-08T11:30:00.000Z"
          }
        ],
        "created_at": "2025-12-08T09:00:00.000Z",
        "updated_at": "2025-12-09T15:00:00.000Z",
        "branch_admin_id": [
          {
            "_id": "64admin123...",
            "name": "Ali Hassan",
            "email": "ali.hassan@philbox.com"
          }
        ],
        "super_admin_id": null
      }
    ],
    "activityLogs": [
      {
        "_id": "64log123...",
        "customer_id": "64customer123...",
        "action": "login",
        "description": "Customer logged in successfully",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2025-12-18T10:30:00.000Z"
      },
      {
        "_id": "64log124...",
        "customer_id": "64customer123...",
        "action": "order_placed",
        "description": "Placed order #ORD-2025-001",
        "timestamp": "2025-12-10T14:20:00.000Z"
      }
    ],
    "metrics": {
      "totalOrders": 8,
      "totalSpent": 125000.0,
      "totalReviews": 6,
      "averageRating": 4.5,
      "totalComplaints": 2,
      "openComplaints": 0
    }
  }
}
```

### Error Responses

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Customer not found",
  "error": "CUSTOMER_NOT_FOUND"
}
```

**Status Code:** `403 Forbidden`

```json
{
  "success": false,
  "message": "You do not have access to this customer",
  "error": "UNAUTHORIZED_ACCESS"
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to retrieve customer details",
  "error": "Error details..."
}
```

---

## 3. Toggle Customer Status

**Endpoint:** `PATCH /api/super-admin/customers/:id/status`
**Authentication:** Required (Super Admin / Branch Admin)

### URL Parameters

| Parameter | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| `id`      | String | Yes      | Customer MongoDB ID |

### Request Body

| Field    | Type   | Required | Description              | Valid Values                               |
| -------- | ------ | -------- | ------------------------ | ------------------------------------------ |
| `status` | String | Yes      | New account status       | active, suspended/freezed, blocked/removed |
| `reason` | String | No       | Reason for status change | String (10-500 characters)                 |

### Example Request

```bash
PATCH /api/super-admin/customers/64customer123def456789012abcd
Content-Type: application/json

{
  "status": "suspended/freezed",
  "reason": "Multiple complaints about fraudulent activities"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Customer status updated successfully",
  "data": {
    "customer": {
      "_id": "64customer123...",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "account_status": "suspended/freezed"
    },
    "message": "Customer account status updated to suspended/freezed"
  }
}
```

### Error Responses

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Customer not found",
  "error": "CUSTOMER_NOT_FOUND"
}
```

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid status value",
  "error": "INVALID_STATUS"
}
```

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to update customer status",
  "error": "Error details..."
}
```

---

## 4. Get Customer Metrics

**Endpoint:** `GET /api/super-admin/customers/metrics/analytics`
**Authentication:** Required (Super Admin / Branch Admin)

### Query Parameters

| Parameter  | Type   | Required | Description                                          | Valid Values                         |
| ---------- | ------ | -------- | ---------------------------------------------------- | ------------------------------------ |
| `branchId` | String | No       | Filter metrics by specific branch (Super Admin only) | MongoDB ObjectId (24 hex characters) |

### Example Requests

#### Get overall metrics (Super Admin)

```bash
GET /api/super-admin/customers/metrics/analytics
```

#### Get metrics for specific branch

```bash
GET /api/super-admin/customers/metrics/analytics?branchId=64branch123def456789012abcd
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Customer metrics retrieved successfully",
  "data": {
    "customers": {
      "total": 1250,
      "active": 1100,
      "verified": 950,
      "new": 85
    },
    "orders": {
      "total": 5420,
      "totalRevenue": 12500000.0,
      "averageOrderValue": 2306.27
    },
    "reviews": {
      "total": 3200,
      "averageRating": 4.3
    },
    "complaints": {
      "total": 145,
      "open": 12,
      "resolved": 133
    }
  }
}
```

### Field Descriptions

#### Customers Metrics

- **total**: Total number of customers
- **active**: Customers with active account status
- **verified**: Customers who have verified their email
- **new**: Customers registered in the last 30 days

#### Orders Metrics

- **total**: Total number of orders placed
- **totalRevenue**: Sum of all order totals
- **averageOrderValue**: Average amount spent per order

#### Reviews Metrics

- **total**: Total number of reviews submitted
- **averageRating**: Average rating across all reviews (1-5 scale)

#### Complaints Metrics

- **total**: Total number of complaints submitted
- **open**: Complaints with status 'pending' or 'in_progress'
- **resolved**: Complaints that have been resolved or closed

### Error Responses

**Status Code:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to retrieve customer metrics",
  "error": "Error details..."
}
```

---

## 5. Error Codes

### Common Error Codes

| Error Code            | HTTP Status | Description                                         |
| --------------------- | ----------- | --------------------------------------------------- |
| `CUSTOMER_NOT_FOUND`  | 404         | The requested customer does not exist               |
| `UNAUTHORIZED_ACCESS` | 403         | Branch admin trying to access unauthorized customer |
| `INVALID_STATUS`      | 400         | Invalid account status value provided               |

### Validation Errors

The API uses Joi for request validation. Validation errors return:

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation error",
  "error": "\"status\" must be one of [active, suspended/freezed, blocked/removed]"
}
```

---

## Testing Checklist

### Pre-requisites

- [ ] Server is running on `http://localhost:5000`
- [ ] MongoDB is connected
- [ ] Super admin session is authenticated
- [ ] At least one customer exists in the database
- [ ] At least one order, review, and complaint exist for testing

### Test Cases

#### 1. Get All Customers

- [ ] Fetch first page with default pagination
- [ ] Test pagination with different page numbers
- [ ] Search by customer name
- [ ] Search by email
- [ ] Search by phone number
- [ ] Filter by account status (active)
- [ ] Filter by account status (suspended)
- [ ] Filter by verification status (verified)
- [ ] Filter by date range
- [ ] Test as super admin with branchId filter
- [ ] Test as branch admin (should only see their branch customers)
- [ ] Test with multiple filters combined

#### 2. Get Customer Details

- [ ] Get existing customer details
- [ ] Verify orders are populated
- [ ] Verify reviews are populated
- [ ] Verify complaints are populated
- [ ] Verify activity logs are populated
- [ ] Verify metrics are calculated correctly
- [ ] Test with non-existent customer ID (should return 404)
- [ ] Test as branch admin accessing unauthorized customer (should return 403)
- [ ] Verify passwordHash is not in response

#### 3. Toggle Customer Status

- [ ] Change status from active to suspended
- [ ] Change status from active to blocked
- [ ] Change status from suspended to active
- [ ] Provide reason for status change
- [ ] Test without reason (should work)
- [ ] Test with invalid status (should return 400)
- [ ] Test with non-existent customer ID (should return 404)
- [ ] Verify admin activity is logged

#### 4. Get Customer Metrics

- [ ] Get overall metrics as super admin
- [ ] Get metrics filtered by branch
- [ ] Test as branch admin (should only see their branch metrics)
- [ ] Verify customer counts are correct
- [ ] Verify order statistics are calculated correctly
- [ ] Verify review statistics are calculated correctly
- [ ] Verify complaint statistics are calculated correctly

### Security Tests

- [ ] Verify unauthenticated requests are rejected
- [ ] Verify passwordHash is never exposed
- [ ] Verify refreshTokens are never exposed
- [ ] Verify verification tokens are never exposed
- [ ] Verify reset password tokens are never exposed
- [ ] Verify branch admin can only access their branch customers

### Performance Tests

- [ ] Test with large datasets (1000+ customers)
- [ ] Test pagination performance
- [ ] Test search performance

---

## Notes

1. **Branch Admin Restrictions**: Branch admins can only see customers who have placed orders from their managed branches. This is enforced at the service level.

2. **Password Security**: Customer passwords (passwordHash) are explicitly excluded from all responses using Mongoose select operators.

3. **Activity Logging**: All admin actions (viewing customers, updating status, viewing details) are automatically logged for audit trails.

4. **Pagination**: The API uses the `paginate` utility which provides consistent pagination across all list endpoints.

5. **Metrics Calculation**: Customer metrics are calculated in real-time from the database, ensuring always-current statistics.

6. **Related Data Population**: When viewing customer details, all related data (orders, reviews, complaints, activity logs) are populated with their referenced documents for complete information.

7. **Date Filtering**: All date filters use ISO 8601 format and support both startDate and endDate for flexible date range queries.

---

## Sample Testing Flow

### 1. Login as Super Admin

```bash
POST /api/super-admin/login
Content-Type: application/json

{
  "email": "superadmin@philbox.com",
  "password": "your-password"
}
```

### 2. Get All Customers

```bash
GET /api/super-admin/customers?page=1&limit=10
Cookie: connect.sid=<session-cookie>
```

### 3. Get Specific Customer Details

```bash
GET /api/super-admin/customers/64customer123def456789012abcd
Cookie: connect.sid=<session-cookie>
```

### 4. Update Customer Status

```bash
PATCH /api/super-admin/customers/64customer123def456789012abcd/status
Content-Type: application/json
Cookie: connect.sid=<session-cookie>

{
  "status": "suspended/freezed",
  "reason": "Violation of terms of service"
}
```

### 5. Get Metrics

```bash
GET /api/super-admin/customers/metrics/analytics
Cookie: connect.sid=<session-cookie>
```

---

## Troubleshooting

### Issue: "Failed to retrieve customers"

**Solution**: Check MongoDB connection and ensure Customer model is properly imported.

### Issue: "You do not have access to this customer" (Branch Admin)

**Solution**: Verify the customer has placed at least one order from the branch admin's managed branches.

### Issue: Metrics showing zero

**Solution**: Ensure there is data in the database (customers, orders, reviews, complaints).

### Issue: Pagination not working

**Solution**: Verify page and limit parameters are positive integers.

---

## Frontend Integration Notes

### Excel Export

Excel export functionality should be implemented on the frontend using libraries like:

- `xlsx` or `exceljs` for browser-based Excel generation
- Use the GET /api/super-admin/customers endpoint to fetch data
- Apply client-side formatting and styling as needed
- Generate and download Excel file directly in the browser

This approach provides better user experience and reduces server load.

---

## Additional Resources

- [Customer Model Schema](../../../server/src/models/Customer.js)
- [Order Model Schema](../../../server/src/models/Order.js)
- [Review Model Schema](../../../server/src/models/Review.js)
- [Complaint Model Schema](../../../server/src/models/Complaint.js)
- [Admin Authentication Guide](./ADMIN_API_COMPLETE_GUIDE.md)

---

**Last Updated:** December 19, 2025
**API Version:** 1.0
**Author:** Philbox Development Team
