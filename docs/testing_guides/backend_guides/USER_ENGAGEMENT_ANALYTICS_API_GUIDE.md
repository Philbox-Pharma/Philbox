# 📊 User Engagement Analytics API Guide

Complete guide for the User Engagement Analytics API endpoints. These endpoints provide insights into customer behavior, doctor activity, and user retention metrics.

---

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Endpoints Overview](#endpoints-overview)
4. [Detailed Endpoints](#detailed-endpoints)
5. [Common Query Parameters](#common-query-parameters)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)
8. [Testing Examples](#testing-examples)

---

## 🌐 Base URL

```
http://localhost:5000/api/admin/user-engagement-analytics
```

All endpoints require the `/api/admin/user-engagement-analytics` prefix.

---

## 🔒 Authentication

All endpoints require **Admin Authentication** via session cookies.

**Login first:**

```bash
POST /api/admin-auth/login
Content-Type: application/json

{
  "email": "superadmin@philbox.com",
  "password": "SuperAdmin@123"
}
```

**Session Cookie:** Automatically included in subsequent requests.

---

## 📊 Endpoints Overview

| Method | Endpoint               | Description                   | Chart Type    |
| ------ | ---------------------- | ----------------------------- | ------------- |
| GET    | `/overview`            | All analytics in one call     | Dashboard     |
| GET    | `/new-customers`       | New customers over time       | Line Chart    |
| GET    | `/customer-status`     | Active vs Inactive customers  | Pie Chart     |
| GET    | `/doctor-applications` | Doctor applications breakdown | Bar Chart     |
| GET    | `/doctor-activity`     | Doctor activity trends        | Heatmap/Table |
| GET    | `/top-customers`       | Top customers by engagement   | Ranked List   |
| GET    | `/retention-rate`      | Customer retention metrics    | KPI Card      |

---

## 📝 Detailed Endpoints

### 1️⃣ **GET** `/overview` - Dashboard Overview

Get all user engagement analytics in a single API call.

**Query Parameters:**

- `startDate` (optional): ISO date string (e.g., `2024-01-01`)
- `endDate` (optional): ISO date string (e.g., `2024-12-31`)
- `period` (optional): `daily` | `weekly` | `monthly` (default: `daily`)
- `branchId` (optional): Filter by specific branch
- `limit` (optional): Number of results (1-100, default: 20)

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/overview?startDate=2024-01-01&endDate=2024-12-31&period=monthly
```

**Example Response:**

```json
{
  "status": 200,
  "message": "User engagement dashboard overview retrieved successfully",
  "data": {
    "newCustomersTrends": { ... },
    "customerActivityStatus": { ... },
    "doctorApplications": { ... },
    "doctorActivityTrends": { ... },
    "topCustomers": { ... },
    "retentionRate": { ... }
  }
}
```

---

### 2️⃣ **GET** `/new-customers` - New Customers Trends

Track new customer registrations over time (Line Chart).

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `period` (optional): `daily` | `weekly` | `monthly`

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/new-customers?startDate=2024-01-01&endDate=2024-03-31&period=weekly
```

**Example Response:**

```json
{
  "status": 200,
  "message": "New customers trends retrieved successfully",
  "data": {
    "trends": [
      {
        "_id": { "year": 2024, "week": 1 },
        "newCustomers": 45,
        "activeCustomers": 42
      },
      {
        "_id": { "year": 2024, "week": 2 },
        "newCustomers": 38,
        "activeCustomers": 35
      }
    ],
    "period": "weekly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-03-31T23:59:59.999Z"
  }
}
```

**Chart Implementation:**

```javascript
// Example for Chart.js
const labels = data.trends.map(t => `Week ${t._id.week}`);
const newCustomersData = data.trends.map(t => t.newCustomers);

{
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'New Customers',
      data: newCustomersData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }
}
```

---

### 3️⃣ **GET** `/customer-status` - Customer Activity Status

Get distribution of active vs inactive customers (Pie Chart).

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/customer-status?startDate=2024-01-01&endDate=2024-12-31
```

**Example Response:**

```json
{
  "status": 200,
  "message": "Customer activity status retrieved successfully",
  "data": {
    "active": 1250,
    "suspended/freezed": 45,
    "blocked/removed": 12,
    "total": 1307,
    "activePercentage": "95.64",
    "suspended/freezedPercentage": "3.44",
    "blocked/removedPercentage": "0.92"
  }
}
```

**Chart Implementation:**

```javascript
// Example for Chart.js
{
  type: 'pie',
  data: {
    labels: ['Active', 'Suspended/Freezed', 'Blocked/Removed'],
    datasets: [{
      data: [
        data.active,
        data['suspended/freezed'],
        data['blocked/removed']
      ],
      backgroundColor: [
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)'
      ]
    }]
  }
}
```

---

### 4️⃣ **GET** `/doctor-applications` - Doctor Applications Breakdown

Analyze doctor application statuses: pending, approved, rejected (Bar Chart - Super Admin Only).

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `period` (optional): `daily` | `weekly` | `monthly`

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/doctor-applications?startDate=2024-01-01&endDate=2024-12-31&period=monthly
```

**Example Response:**

```json
{
  "status": 200,
  "message": "Doctor applications breakdown retrieved successfully",
  "data": {
    "trends": [
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "status": "approved"
        },
        "count": 15
      },
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "status": "rejected"
        },
        "count": 3
      },
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "status": "pending"
        },
        "count": 8
      }
    ],
    "summary": {
      "pending": 25,
      "processing": 12,
      "approved": 145,
      "rejected": 18,
      "total": 200
    },
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  }
}
```

**Chart Implementation:**

```javascript
// Example for Chart.js - Stacked Bar Chart
{
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', ...],
    datasets: [
      {
        label: 'Approved',
        data: approvedData,
        backgroundColor: 'rgb(34, 197, 94)'
      },
      {
        label: 'Rejected',
        data: rejectedData,
        backgroundColor: 'rgb(239, 68, 68)'
      },
      {
        label: 'Pending',
        data: pendingData,
        backgroundColor: 'rgb(251, 191, 36)'
      }
    ]
  },
  options: {
    scales: { x: { stacked: true }, y: { stacked: true } }
  }
}
```

---

### 5️⃣ **GET** `/doctor-activity` - Doctor Activity Trends

Analyze doctor activity patterns and engagement (Heatmap/Table).

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Number of top doctors (1-100, default: 20)

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/doctor-activity?startDate=2024-01-01&endDate=2024-01-31&limit=10
```

**Example Response:**

```json
{
  "status": 200,
  "message": "Doctor activity trends retrieved successfully",
  "data": {
    "topActiveDoctors": [
      {
        "doctorId": "64f5a1b2c3d4e5f6g7h8i9j0",
        "doctorName": "Dr. John Smith",
        "doctorEmail": "john.smith@example.com",
        "specialization": ["Cardiology", "Internal Medicine"],
        "actions": [
          { "action_type": "view_appointment", "count": 145 },
          { "action_type": "update_prescription", "count": 89 },
          { "action_type": "send_message", "count": 67 }
        ],
        "totalActivities": 301,
        "lastActivity": "2024-01-31T15:30:00.000Z"
      },
      {
        "doctorId": "64f5a1b2c3d4e5f6g7h8i9j1",
        "doctorName": "Dr. Sarah Johnson",
        "doctorEmail": "sarah.johnson@example.com",
        "specialization": ["Pediatrics"],
        "actions": [
          { "action_type": "view_appointment", "count": 132 },
          { "action_type": "update_prescription", "count": 78 }
        ],
        "totalActivities": 210,
        "lastActivity": "2024-01-31T14:20:00.000Z"
      }
    ],
    "dailyTrends": [
      {
        "_id": { "year": 2024, "month": 1, "day": 1 },
        "totalActivities": 450,
        "uniqueDoctorsCount": 25
      },
      {
        "_id": { "year": 2024, "month": 1, "day": 2 },
        "totalActivities": 523,
        "uniqueDoctorsCount": 28
      }
    ],
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  }
}
```

**Table Implementation:**

```javascript
// Example table structure
<table>
  <thead>
    <tr>
      <th>Doctor Name</th>
      <th>Email</th>
      <th>Specialization</th>
      <th>Total Activities</th>
      <th>Last Activity</th>
    </tr>
  </thead>
  <tbody>
    {topActiveDoctors.map((doctor) => (
      <tr key={doctor.doctorId}>
        <td>{doctor.doctorName}</td>
        <td>{doctor.doctorEmail}</td>
        <td>{doctor.specialization.join(", ")}</td>
        <td>{doctor.totalActivities}</td>
        <td>{new Date(doctor.lastActivity).toLocaleDateString()}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 6️⃣ **GET** `/top-customers` - Top Customers by Engagement

Get ranked list of top customers by appointments, orders, or both.

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `metric` (optional): `appointments` | `orders` | `both` (default: `both`)
- `limit` (optional): Number of results (1-50, default: 10)
- `branchId` (optional): Filter by branch

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/top-customers?startDate=2024-01-01&endDate=2024-12-31&metric=both&limit=10
```

**Example Response:**

```json
{
  "status": 200,
  "message": "Top customers retrieved successfully",
  "data": {
    "topCustomers": [
      {
        "customerId": "64f5a1b2c3d4e5f6g7h8i9j2",
        "customerName": "Alice Johnson",
        "customerEmail": "alice.johnson@example.com",
        "profileImg": "https://avatar.iran.liara.run/username?username=Alice+Johnson",
        "appointmentCount": 12,
        "orderCount": 8,
        "totalSpent": 4500.0,
        "completedAppointments": 11,
        "metric": "both"
      },
      {
        "customerId": "64f5a1b2c3d4e5f6g7h8i9j3",
        "customerName": "Bob Williams",
        "customerEmail": "bob.williams@example.com",
        "profileImg": "https://avatar.iran.liara.run/username?username=Bob+Williams",
        "appointmentCount": 10,
        "orderCount": 15,
        "totalSpent": 5200.0,
        "completedAppointments": 9,
        "metric": "both"
      }
    ],
    "metric": "both",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  }
}
```

**Ranked List Implementation:**

```javascript
// Example ranked list component
<div className="top-customers-list">
  {topCustomers.map((customer, index) => (
    <div key={customer.customerId} className="customer-card">
      <div className="rank">#{index + 1}</div>
      <img src={customer.profileImg} alt={customer.customerName} />
      <div className="details">
        <h3>{customer.customerName}</h3>
        <p>{customer.customerEmail}</p>
        <div className="stats">
          {customer.appointmentCount && (
            <span>🏥 {customer.appointmentCount} appointments</span>
          )}
          {customer.orderCount && <span>📦 {customer.orderCount} orders</span>}
          <span>💰 ${customer.totalSpent.toFixed(2)}</span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

### 7️⃣ **GET** `/retention-rate` - Customer Retention Rate

Calculate customer retention metrics (KPI Card).

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `branchId` (optional): Filter by branch

**Example Request:**

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/retention-rate?startDate=2024-07-01&endDate=2024-12-31
```

**Example Response:**

```json
{
  "status": 200,
  "message": "Customer retention rate retrieved successfully",
  "data": {
    "retentionRate": 78.5,
    "churnRate": 21.5,
    "period1Customers": 850,
    "period2Customers": 920,
    "retainedCustomers": 667,
    "newCustomers": 253,
    "lostCustomers": 183,
    "period1": {
      "start": "2023-12-31T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    },
    "period2": {
      "start": "2024-07-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.999Z"
    }
  }
}
```

**KPI Card Implementation:**

```javascript
// Example KPI cards
<div className="kpi-cards">
  <div className="kpi-card retention">
    <h3>Retention Rate</h3>
    <div className="value">{data.retentionRate}%</div>
    <div className="subtitle">Customers who returned</div>
  </div>

  <div className="kpi-card churn">
    <h3>Churn Rate</h3>
    <div className="value">{data.churnRate}%</div>
    <div className="subtitle">Customers lost</div>
  </div>

  <div className="kpi-card retained">
    <h3>Retained Customers</h3>
    <div className="value">{data.retainedCustomers}</div>
    <div className="subtitle">Out of {data.period1Customers}</div>
  </div>

  <div className="kpi-card new">
    <h3>New Customers</h3>
    <div className="value">{data.newCustomers}</div>
    <div className="subtitle">In current period</div>
  </div>
</div>
```

---

## 🔧 Common Query Parameters

| Parameter   | Type     | Description         | Valid Values                     | Default        |
| ----------- | -------- | ------------------- | -------------------------------- | -------------- |
| `startDate` | ISO Date | Start of date range | ISO 8601 date string             | 30-90 days ago |
| `endDate`   | ISO Date | End of date range   | ISO 8601 date string             | Today          |
| `period`    | String   | Aggregation period  | `daily`, `weekly`, `monthly`     | `daily`        |
| `branchId`  | String   | Filter by branch    | Valid MongoDB ObjectId           | All branches   |
| `limit`     | Number   | Max results         | 1-100                            | 10-20          |
| `metric`    | String   | Measurement type    | `appointments`, `orders`, `both` | `both`         |

---

## 📤 Response Format

### Success Response

```json
{
  "status": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": 400 | 401 | 403 | 500,
  "message": "Error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

---

## ❌ Error Handling

### Common Errors

**1. Authentication Error**

```json
{
  "status": 401,
  "message": "No session, authorization denied"
}
```

**Solution:** Login first at `/api/admin-auth/login`

**2. Validation Error**

```json
{
  "status": 400,
  "message": "Validation failed",
  "details": ["\"endDate\" must be greater than \"ref:startDate\""]
}
```

**Solution:** Fix query parameters according to validation rules

**3. Permission Error**

```json
{
  "status": 403,
  "message": "Access denied: Super-admin only"
}
```

**Solution:** Ensure you have appropriate admin privileges

---

## 🧪 Testing Examples

### Test 1: Get Dashboard Overview

```bash
# Using curl
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/overview?startDate=2024-01-01&endDate=2024-12-31&period=monthly' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'

# Using Thunder Client / Postman
GET http://localhost:5000/api/admin/user-engagement-analytics/overview
Query Params:
  - startDate: 2024-01-01
  - endDate: 2024-12-31
  - period: monthly
```

### Test 2: Get New Customers Trends (Weekly)

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/new-customers?startDate=2024-01-01&endDate=2024-03-31&period=weekly' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 3: Get Customer Activity Status

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/customer-status?startDate=2024-01-01&endDate=2024-12-31' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 4: Get Doctor Applications (Super Admin Only)

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/doctor-applications?startDate=2024-01-01&endDate=2024-12-31&period=monthly' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 5: Get Doctor Activity Trends

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/doctor-activity?startDate=2024-01-01&endDate=2024-01-31&limit=10' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 6: Get Top Customers by Appointments

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/top-customers?startDate=2024-01-01&endDate=2024-12-31&metric=appointments&limit=10' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 7: Get Top Customers by Orders

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/top-customers?startDate=2024-01-01&endDate=2024-12-31&metric=orders&limit=10' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 8: Get Top Customers by Both

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/top-customers?startDate=2024-01-01&endDate=2024-12-31&metric=both&limit=10' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 9: Get Customer Retention Rate

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/retention-rate?startDate=2024-07-01&endDate=2024-12-31' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### Test 10: Filter by Branch

```bash
curl -X GET \
  'http://localhost:5000/api/admin/user-engagement-analytics/top-customers?branchId=64f5a1b2c3d4e5f6g7h8i9j4&metric=both&limit=10' \
  -H 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

---

## 📊 Data Models

### Customer Model Fields

- `fullName`: String
- `email`: String
- `account_status`: "active" | "suspended/freezed" | "blocked/removed"
- `created_at`: Date
- `last_login`: Date

### Doctor Model Fields

- `fullName`: String
- `email`: String
- `specialization`: String[]
- `account_status`: String
- `created_at`: Date

### DoctorApplication Model Fields

- `doctor_id`: ObjectId (ref: Doctor)
- `status`: "pending" | "processing" | "approved" | "rejected"
- `reviewed_by_admin_id`: ObjectId (ref: Admin)
- `created_at`: Date

### DoctorActivityLog Model Fields

- `doctor_id`: ObjectId (ref: Doctor)
- `action_type`: String
- `description`: String
- `target_collection`: String
- `created_at`: Date

### Appointment Model Fields

- `customer_id`: ObjectId (ref: Customer)
- `doctor_id`: ObjectId (ref: Doctor)
- `branch_id`: ObjectId (ref: Branch)
- `appointment_date`: Date
- `status`: String
- `consultation_fee`: Number

### Order Model Fields

- `customer_id`: ObjectId (ref: Customer)
- `branch_id`: ObjectId (ref: Branch)
- `total_amount`: Number
- `status`: String
- `created_at`: Date

---

## 🎯 Use Cases

### 1. Marketing Dashboard

Track customer acquisition trends to measure marketing campaign effectiveness.

### 2. Customer Health Monitoring

Identify inactive customers for re-engagement campaigns.

### 3. Doctor Performance Review

Analyze doctor activity patterns and engagement levels.

### 4. Recruitment Planning

Monitor doctor application trends to plan hiring needs.

### 5. Retention Strategy

Measure retention rates to improve customer loyalty programs.

### 6. VIP Customer Identification

Identify high-value customers for personalized services.

---

## 🔐 Admin Activity Logging

All analytics views are automatically logged in the `AdminActivityLog` collection:

- `action_type`: "view_new_customers_trends", "view_customer_activity_status", etc.
- `description`: Human-readable description
- `admin_id`: ID of the admin who viewed the analytics
- `ip_address`: Request IP
- `device_info`: User agent string
- `created_at`: Timestamp

---

## 📈 Performance Tips

1. **Use Date Ranges**: Always specify `startDate` and `endDate` to limit data scope
2. **Limit Results**: Use `limit` parameter for large datasets
3. **Cache Dashboard**: Consider caching `/overview` endpoint on frontend
4. **Branch Filtering**: Use `branchId` for branch-specific analytics
5. **Appropriate Period**: Use `monthly` for long date ranges, `daily` for short ranges

---

## 🆘 Support

For issues or questions:

1. Check the error message and status code
2. Verify authentication credentials
3. Validate query parameters
4. Check server logs for detailed error traces

---

## 📝 Changelog

### Version 1.0.0 (December 21, 2025)

- Initial release
- 7 analytics endpoints
- Full CRUD functionality
- Activity logging
- Session-based authentication
- Comprehensive data validation

---

**Last Updated:** December 21, 2025
**API Version:** 1.0.0
**Status:** ✅ Production Ready
