# Revenue Analytics API Guide

Complete guide for viewing revenue analytics including trends, revenue split, top branches, refund statistics, and payment method breakdowns.

## Base URL

```
http://localhost:5000/api/admin/revenue-analytics
```

## Authentication

All routes require admin authentication. Include session cookie in requests after logging in as an admin (super admin or branch admin).

**Note:** Some endpoints like "Top Branches by Revenue" are accessible only to super admins.

---

## Table of Contents

1. [Overview Endpoint](#overview-endpoint)
2. [Revenue Trends](#revenue-trends)
3. [Revenue Split](#revenue-split)
4. [Top Branches by Revenue](#top-branches-by-revenue)
5. [Refund Statistics](#refund-statistics)
6. [Average Revenue Per Customer](#average-revenue-per-customer)
7. [Payment Method Breakdown](#payment-method-breakdown)

---

## Common Query Parameters

All analytics endpoints support these optional query parameters:

| Parameter | Type   | Description                                | Default      |
| --------- | ------ | ------------------------------------------ | ------------ |
| startDate | Date   | Start date for filtering (ISO 8601 format) | 30 days ago  |
| endDate   | Date   | End date for filtering (ISO 8601 format)   | Today        |
| branchId  | String | Filter by branch (for branch admin users)  | All branches |

---

## Overview Endpoint

### Get Dashboard Overview

Get all revenue analytics data in a single API call for dashboard rendering.

**Endpoint:** `GET /api/admin/revenue-analytics/overview`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/overview?startDate=2025-01-01&endDate=2025-01-31' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "trends": {
      "trends": [...],
      "period": "daily",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.999Z"
    },
    "revenueSplit": {
      "appointment": {
        "revenue": 150000,
        "count": 200,
        "percentage": "45.45"
      },
      "order": {
        "revenue": 180000,
        "count": 150,
        "percentage": "54.55"
      },
      "total": {
        "revenue": 330000,
        "count": 350
      }
    },
    "topBranches": [...],
    "refundStats": {...},
    "avgRevenuePerCustomer": {...},
    "paymentMethodBreakdown": {...}
  }
}
```

---

## Revenue Trends

### Get Revenue Trends (Line Chart)

Fetch revenue trends grouped by day, week, or month.

**Endpoint:** `GET /api/admin/revenue-analytics/trends`

**Query Parameters:**

| Parameter | Type   | Description                            | Default     |
| --------- | ------ | -------------------------------------- | ----------- |
| startDate | Date   | Start date (ISO 8601)                  | 30 days ago |
| endDate   | Date   | End date (ISO 8601)                    | Today       |
| period    | String | Grouping: `daily`, `weekly`, `monthly` | daily       |
| branchId  | String | Filter by branch                       | All         |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/trends?period=weekly&startDate=2025-01-01&endDate=2025-01-31' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue trends fetched successfully",
  "data": {
    "trends": [
      {
        "_id": {
          "year": 2025,
          "week": 1
        },
        "totalRevenue": 85000,
        "transactionCount": 95,
        "appointmentRevenue": 40000,
        "orderRevenue": 45000
      },
      {
        "_id": {
          "year": 2025,
          "week": 2
        },
        "totalRevenue": 92000,
        "transactionCount": 105,
        "appointmentRevenue": 45000,
        "orderRevenue": 47000
      }
    ],
    "period": "weekly",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  }
}
```

---

## Revenue Split

### Get Revenue Split: Appointments vs Orders (Pie Chart)

Fetch revenue distribution between appointments and orders.

**Endpoint:** `GET /api/admin/revenue-analytics/split`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/split?startDate=2025-01-01' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Revenue split fetched successfully",
  "data": {
    "appointment": {
      "revenue": 150000,
      "count": 200,
      "percentage": "45.45"
    },
    "order": {
      "revenue": 180000,
      "count": 150,
      "percentage": "54.55"
    },
    "total": {
      "revenue": 330000,
      "count": 350
    }
  }
}
```

---

## Top Branches by Revenue

### Get Top Branches by Revenue (Bar Chart - Super Admin Only)

Fetch top performing branches ranked by revenue.

**Endpoint:** `GET /api/admin/revenue-analytics/top-branches`

**Authorization:** Super Admin Only

**Query Parameters:**

| Parameter | Type   | Description            | Default     |
| --------- | ------ | ---------------------- | ----------- |
| startDate | Date   | Start date             | 30 days ago |
| endDate   | Date   | End date               | Today       |
| limit     | Number | Number of top branches | 5           |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/top-branches?limit=5' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Top branches by revenue fetched successfully",
  "data": [
    {
      "branchId": "64abc123def456789012abcd",
      "branchName": "Karachi Main Branch",
      "address": "64addr123...",
      "totalRevenue": 250000,
      "transactionCount": 320
    },
    {
      "branchId": "64abc123def456789012abce",
      "branchName": "Lahore Branch",
      "address": "64addr124...",
      "totalRevenue": 180000,
      "transactionCount": 245
    }
  ]
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Access denied. Super admin only."
}
```

---

## Refund Statistics

### Get Refund Statistics (Bar Chart)

Fetch refund statistics grouped by appointments and orders.

**Endpoint:** `GET /api/admin/revenue-analytics/refunds`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/refunds' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Refund statistics fetched successfully",
  "data": {
    "appointment": {
      "amount": 12000,
      "count": 15
    },
    "order": {
      "amount": 8500,
      "count": 12
    },
    "total": {
      "amount": 20500,
      "count": 27
    }
  }
}
```

---

## Average Revenue Per Customer

### Get Average Revenue Per Customer (KPI)

Calculate average revenue generated per unique customer.

**Endpoint:** `GET /api/admin/revenue-analytics/average-per-customer`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/average-per-customer?startDate=2025-01-01' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Average revenue per customer fetched successfully",
  "data": {
    "totalRevenue": 330000,
    "totalCustomers": 250,
    "averageRevenue": 1320.0
  }
}
```

---

## Payment Method Breakdown

### Get Payment Method Breakdown (Pie Chart)

Fetch revenue distribution by payment method.

**Endpoint:** `GET /api/admin/revenue-analytics/payment-methods`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/revenue-analytics/payment-methods' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment method breakdown fetched successfully",
  "data": {
    "Stripe-Card": {
      "revenue": 180000,
      "count": 200,
      "percentage": "54.55"
    },
    "JazzCash-Wallet": {
      "revenue": 95000,
      "count": 120,
      "percentage": "28.79"
    },
    "EasyPaisa-Wallet": {
      "revenue": 55000,
      "count": 80,
      "percentage": "16.67"
    },
    "total": {
      "revenue": 330000,
      "count": 400
    }
  }
}
```

---

## Access Control

### Super Admin

- ✅ Full access to all revenue analytics endpoints
- ✅ Can view all branches
- ✅ Can access "Top Branches by Revenue" endpoint

### Branch Admin

- ✅ Access to revenue analytics for their assigned branch
- ✅ Must provide `branchId` parameter or will see only their branch data
- ❌ Cannot access "Top Branches by Revenue" endpoint

---

## Date Range Filtering

All endpoints support flexible date range filtering:

### Last 7 Days:

```
?startDate=2025-01-12&endDate=2025-01-19
```

### Current Month:

```
?startDate=2025-01-01&endDate=2025-01-31
```

### Custom Range:

```
?startDate=2024-12-01&endDate=2025-01-31
```

### Default (No dates specified):

Returns data for the last 30 days.

---

## Status Codes

| Code | Description                                    |
| ---- | ---------------------------------------------- |
| 200  | Success                                        |
| 400  | Bad Request (validation error, missing fields) |
| 401  | Unauthorized (not authenticated)               |
| 403  | Forbidden (insufficient permissions)           |
| 500  | Internal Server Error                          |

---

## Activity Logging

All analytics views are automatically logged:

- `view_revenue_trends` - Viewing revenue trends
- `view_revenue_split` - Viewing revenue split
- `view_top_branches_revenue` - Viewing top branches by revenue
- `view_refund_statistics` - Viewing refund statistics
- `view_average_revenue_per_customer` - Viewing average revenue per customer
- `view_payment_method_breakdown` - Viewing payment method breakdown

Each log entry includes:

- Admin who performed the action
- Timestamp
- Action type
- Target collection

---

## Frontend Integration Tips

### 1. Line Chart (Revenue Trends)

```javascript
const response = await fetch(
  "/api/admin/revenue-analytics/trends?period=daily",
);
const { data } = await response.json();

// Transform for Chart.js
const labels = data.trends.map(
  (t) => `${t._id.year}-${t._id.month}-${t._id.day}`,
);
const datasets = [
  {
    label: "Total Revenue",
    data: data.trends.map((t) => t.totalRevenue),
  },
  {
    label: "Appointment Revenue",
    data: data.trends.map((t) => t.appointmentRevenue),
  },
  {
    label: "Order Revenue",
    data: data.trends.map((t) => t.orderRevenue),
  },
];
```

### 2. Pie Chart (Revenue Split)

```javascript
const response = await fetch("/api/admin/revenue-analytics/split");
const { data } = await response.json();

// Transform for Chart.js
const pieData = {
  labels: ["Appointments", "Orders"],
  datasets: [
    {
      data: [data.appointment.revenue, data.order.revenue],
    },
  ],
};
```

### 3. Bar Chart (Top Branches)

```javascript
const response = await fetch("/api/admin/revenue-analytics/top-branches");
const { data } = await response.json();

// Transform for Chart.js
const barData = {
  labels: data.map((b) => b.branchName),
  datasets: [
    {
      label: "Revenue",
      data: data.map((b) => b.totalRevenue),
    },
  ],
};
```

### 4. Pie Chart (Payment Methods)

```javascript
const response = await fetch("/api/admin/revenue-analytics/payment-methods");
const { data } = await response.json();

// Transform for Chart.js
const pieData = {
  labels: ["Stripe Card", "JazzCash", "EasyPaisa"],
  datasets: [
    {
      data: [
        data["Stripe-Card"].revenue,
        data["JazzCash-Wallet"].revenue,
        data["EasyPaisa-Wallet"].revenue,
      ],
    },
  ],
};
```

---

## Best Practices

1. **Use the Overview Endpoint** for initial dashboard load to reduce API calls
2. **Cache results** on the frontend for 5-10 minutes
3. **Provide date pickers** for custom date range filtering
4. **Show loading states** while fetching analytics
5. **Handle empty data gracefully** (no transactions in range)
6. **Format currencies** properly in the UI (PKR/USD)
7. **Use appropriate chart libraries** (Chart.js, Recharts, etc.)
8. **Implement branch filtering UI** for branch admins
9. **Hide "Top Branches" chart** for branch admins
10. **Validate user permissions** before rendering super admin only features

---

## Common Use Cases

### Use Case 1: Monthly Performance Report

```bash
GET /api/admin/revenue-analytics/overview?period=monthly&startDate=2025-01-01&endDate=2025-01-31
```

### Use Case 2: Branch-Specific Analytics

```bash
# Branch admin or filtered view
GET /api/admin/revenue-analytics/trends?branchId=64abc123def456789012abcd
```

### Use Case 3: Refund Analysis

```bash
GET /api/admin/revenue-analytics/refunds?startDate=2025-01-01&endDate=2025-01-31
```

### Use Case 4: Payment Method Performance

```bash
GET /api/admin/revenue-analytics/payment-methods?period=monthly
```

---

## Models Used

### Transaction Model

- Stores all payment transactions (appointments and orders)
- Supports both payments and refunds
- Tracks payment methods (Stripe, JazzCash, EasyPaisa)
- Records transaction status and metadata

### Currency Model

- Supports PKR and USD currencies
- Used for multi-currency transaction tracking

### Related Models

- **Appointment**: Linked via `target_id` when `target_class` is 'appointment'
- **Order**: Linked via `target_id` when `target_class` is 'order'
- **Branch**: Used for branch-specific filtering
- **OrderItem**: Referenced for partial refunds

---

## Notes

- All dates are in UTC timezone
- Revenue calculations include only successful payment transactions
- Refund statistics include only successful refund transactions
- Percentages are rounded to 2 decimal places
- Admin activity is logged for audit purposes
- Branch filtering works by checking appointments and orders associated with branches
- Super admin restriction is enforced at controller level

---

**Last Updated:** December 20, 2025
**API Version:** 1.0
**Maintained by:** Philbox Backend Team
