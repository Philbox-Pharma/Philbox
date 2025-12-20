# Appointment Analytics API Guide

Complete guide for viewing appointment analytics including trends, completion rates, top doctors, appointment types, and revenue metrics.

## Base URL

```
http://localhost:5000/api/admin/appointment-analytics
```

## Authentication

All routes require super admin authentication. Include session cookie in requests after logging in as a super admin.

**Note:** These analytics endpoints are accessible only to super admins, not branch admins.

---

## Table of Contents

1. [Overview Endpoint](#overview-endpoint)
2. [Appointment Trends](#appointment-trends)
3. [Completion & Missed Rates](#completion--missed-rates)
4. [Top Doctors Analytics](#top-doctors-analytics)
5. [Appointment Types Distribution](#appointment-types-distribution)
6. [Revenue Analytics](#revenue-analytics)
7. [Data Aggregation](#data-aggregation)

---

## Common Query Parameters

All analytics endpoints support these optional query parameters:

| Parameter | Type | Description                                | Default     |
| --------- | ---- | ------------------------------------------ | ----------- |
| startDate | Date | Start date for filtering (ISO 8601 format) | 30 days ago |
| endDate   | Date | End date for filtering (ISO 8601 format)   | Today       |

---

## Overview Endpoint

### Get Dashboard Overview

Get all analytics data in a single API call for dashboard rendering.

**Endpoint:** `GET /api/admin/appointment-analytics/overview`

**Query Parameters:** See common parameters above

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/overview?startDate=2025-01-01&endDate=2025-01-31' \
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
    "completionRate": {
      "completed": 220,
      "missed": 15,
      "total": 245,
      "completionRate": 89.8,
      "missedRate": 6.12
    },
    "topDoctorsByAppointments": [...],
    "topDoctorsByRevenue": [...],
    "appointmentTypes": {
      "in-person": 145,
      "online": 100,
      "total": 245,
      "inPersonPercentage": "59.18",
      "onlinePercentage": "40.82"
    },
    "averageRevenue": {
      "totalRevenue": 33000,
      "totalAppointments": 220,
      "averageRevenue": 150.0
    }
  }
}
```

---

## Appointment Trends

### Get Appointment Trends (Line Chart Data)

Fetch daily, weekly, or monthly appointment trends.

**Endpoint:** `GET /api/admin/appointment-analytics/trends`

**Query Parameters:**

| Parameter | Type   | Description                            | Default     |
| --------- | ------ | -------------------------------------- | ----------- |
| startDate | Date   | Start date (ISO 8601)                  | 30 days ago |
| endDate   | Date   | End date (ISO 8601)                    | Today       |
| period    | String | Grouping: `daily`, `weekly`, `monthly` | daily       |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/trends?period=weekly&startDate=2025-01-01&endDate=2025-01-31' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Appointment trends fetched successfully",
  "data": {
    "trends": [
      {
        "_id": {
          "year": 2025,
          "week": 1
        },
        "totalAppointments": 45,
        "completed": 40,
        "missed": 3,
        "inProgress": 1,
        "pending": 1
      },
      {
        "_id": {
          "year": 2025,
          "week": 2
        },
        "totalAppointments": 52,
        "completed": 48,
        "missed": 2,
        "inProgress": 2,
        "pending": 0
      }
    ],
    "period": "weekly",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z"
  }
}
```

**Daily Response Format:**

```json
{
  "_id": {
    "year": 2025,
    "month": 1,
    "day": 15
  },
  "totalAppointments": 12,
  "completed": 10,
  "missed": 1,
  "inProgress": 1,
  "pending": 0
}
```

**Monthly Response Format:**

```json
{
  "_id": {
    "year": 2025,
    "month": 1
  },
  "totalAppointments": 245,
  "completed": 220,
  "missed": 15,
  "inProgress": 5,
  "pending": 5
}
```

---

## Completion & Missed Rates

### Get Completion vs Missed Rate (Pie Chart Data)

**Endpoint:** `GET /api/admin/appointment-analytics/completion-rate`

**Query Parameters:** See common parameters

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/completion-rate?startDate=2025-01-01' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Completion rate fetched successfully",
  "data": {
    "completed": 220,
    "missed": 15,
    "total": 245,
    "completionRate": 89.8,
    "missedRate": 6.12
  }
}
```

**Field Descriptions:**

- `completed`: Number of successfully completed appointments
- `missed`: Number of missed appointments (no-shows)
- `total`: Total appointments (completed + missed + in-progress + pending)
- `completionRate`: Percentage of completed appointments
- `missedRate`: Percentage of missed appointments

---

## Top Doctors Analytics

### Get Top 5 Doctors by Appointments (Bar Chart Data)

**Endpoint:** `GET /api/admin/appointment-analytics/top-doctors/appointments`

**Query Parameters:**

| Parameter | Type   | Description           | Default     |
| --------- | ------ | --------------------- | ----------- |
| startDate | Date   | Start date            | 30 days ago |
| endDate   | Date   | End date              | Today       |
| limit     | Number | Number of top doctors | 5           |

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/top-doctors/appointments?limit=5' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Top doctors by appointments fetched successfully",
  "data": [
    {
      "_id": "67890abc123def456",
      "totalAppointments": 58,
      "doctorName": "Dr. Sarah Johnson",
      "doctorEmail": "sarah.johnson@example.com",
      "specialization": ["Cardiology", "Internal Medicine"],
      "profileImage": "https://avatar.iran.liara.run/username?username=Sarah+Johnson"
    },
    {
      "_id": "12345def678abc901",
      "totalAppointments": 52,
      "doctorName": "Dr. Michael Chen",
      "doctorEmail": "michael.chen@example.com",
      "specialization": ["Pediatrics"],
      "profileImage": "https://avatar.iran.liara.run/username?username=Michael+Chen"
    }
  ]
}
```

---

### Get Top 5 Doctors by Revenue (Bar Chart Data)

**Endpoint:** `GET /api/admin/appointment-analytics/top-doctors/revenue`

**Query Parameters:** Same as top doctors by appointments

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/top-doctors/revenue?limit=5' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Top doctors by revenue fetched successfully",
  "data": [
    {
      "_id": "67890abc123def456",
      "totalRevenue": 8700,
      "totalAppointments": 58,
      "doctorName": "Dr. Sarah Johnson",
      "doctorEmail": "sarah.johnson@example.com",
      "specialization": ["Cardiology", "Internal Medicine"],
      "profileImage": "https://avatar.iran.liara.run/username?username=Sarah+Johnson",
      "consultationFee": 150
    },
    {
      "_id": "12345def678abc901",
      "totalRevenue": 7800,
      "totalAppointments": 52,
      "doctorName": "Dr. Michael Chen",
      "doctorEmail": "michael.chen@example.com",
      "specialization": ["Pediatrics"],
      "profileImage": "https://avatar.iran.liara.run/username?username=Michael+Chen",
      "consultationFee": 150
    }
  ]
}
```

**Note:** Revenue is calculated only from **completed** appointments.

---

## Appointment Types Distribution

### Get Appointment Types (Pie Chart Data)

Get distribution of in-person vs online appointments.

**Endpoint:** `GET /api/admin/appointment-analytics/appointment-types`

**Query Parameters:** See common parameters

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/appointment-types' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Appointment types distribution fetched successfully",
  "data": {
    "in-person": 145,
    "online": 100,
    "total": 245,
    "inPersonPercentage": "59.18",
    "onlinePercentage": "40.82"
  }
}
```

---

## Revenue Analytics

### Get Average Appointment Revenue (KPI Card Data)

**Endpoint:** `GET /api/admin/appointment-analytics/average-revenue`

**Query Parameters:** See common parameters

**Request Example:**

```bash
curl --location 'http://localhost:5000/api/admin/appointment-analytics/average-revenue?startDate=2025-01-01' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Average revenue fetched successfully",
  "data": {
    "totalRevenue": 33000,
    "totalAppointments": 220,
    "averageRevenue": 150.0
  }
}
```

**Field Descriptions:**

- `totalRevenue`: Total revenue from all completed appointments in the period
- `totalAppointments`: Number of completed appointments
- `averageRevenue`: Average revenue per appointment (totalRevenue / totalAppointments)

**Note:** Only **completed** appointments are included in revenue calculations.

---

## Data Aggregation

### Aggregate Appointment Data (Admin Utility)

Manually trigger data aggregation for a specific date. This is typically run as a scheduled job but can be triggered manually.

**Endpoint:** `POST /api/admin/appointment-analytics/aggregate`

**Request Body:**

```json
{
  "date": "2025-01-15"
}
```

**Request Example:**

```bash
curl --location --request POST 'http://localhost:5000/api/admin/appointment-analytics/aggregate' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "date": "2025-01-15"
}'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Data aggregated successfully",
  "data": {
    "date": "2025-01-15T00:00:00.000Z",
    "totalAppointments": 12,
    "completionRate": 91.67,
    "noShowRate": 8.33,
    "totalRevenue": 1650
  }
}
```

**What This Does:**

- Aggregates all appointments for the specified date
- Calculates completion and no-show rates
- Identifies top doctors by appointments and revenue
- Stores results in `DailyAppointmentsAnalytics` collection
- Useful for historical data processing or fixing missing aggregations

---

## Access Control

Appointment analytics are available only to super admins.

**Authorization:**

- ✅ Super Admin: Full access to all appointment analytics
- ❌ Branch Admin: No access to appointment analytics endpoints
- ❌ Other Roles: No access

**Note:** Since doctors are not associated with branches, all analytics show system-wide data.

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

- `view_appointment_trends` - Viewing appointment trends
- `view_completion_rate` - Viewing completion rate
- `view_top_doctors_appointments` - Viewing top doctors by appointments
- `view_top_doctors_revenue` - Viewing top doctors by revenue
- `view_appointment_types` - Viewing appointment types
- `view_average_revenue` - Viewing average revenue

Each log entry includes:

- Admin who performed the action
- Timestamp
- Action type
- Target collection

---

## Frontend Integration Tips

### 1. Line Chart (Appointment Trends)

```javascript
const response = await fetch(
  "/api/admin/appointment-analytics/trends?period=daily",
);
const { data } = await response.json();

// Transform for Chart.js
const labels = data.trends.map(
  (t) => `${t._id.year}-${t._id.month}-${t._id.day}`,
);
const datasets = [
  {
    label: "Total Appointments",
    data: data.trends.map((t) => t.totalAppointments),
  },
];
```

### 2. Pie Chart (Completion Rate)

```javascript
const response = await fetch(
  "/api/admin/appointment-analytics/completion-rate",
);
const { data } = await response.json();

// Transform for Chart.js
const pieData = {
  labels: ["Completed", "Missed"],
  datasets: [
    {
      data: [data.completed, data.missed],
    },
  ],
};
```

### 3. Bar Chart (Top Doctors)

```javascript
const response = await fetch(
  "/api/admin/appointment-analytics/top-doctors/appointments",
);
const { data } = await response.json();

// Transform for Chart.js
const barData = {
  labels: data.map((d) => d.doctorName),
  datasets: [
    {
      label: "Appointments",
      data: data.map((d) => d.totalAppointments),
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
5. **Handle empty data gracefully** (no appointments in range)
6. **Format currencies** properly in the UI
7. **Use appropriate chart libraries** (Chart.js, Recharts, etc.)
8. **Restrict access** to super admin users only in the frontend

---

## Common Use Cases

### Use Case 1: Monthly Performance Report

```bash
GET /api/admin/appointment-analytics/overview?period=monthly&startDate=2025-01-01&endDate=2025-01-31
```

### Use Case 2: Weekly Trend Analysis

```bash
GET /api/admin/appointment-analytics/trends?period=weekly&startDate=2025-01-01&endDate=2025-01-31
```

### Use Case 3: Doctor Performance Review

```bash
GET /api/admin/appointment-analytics/top-doctors/revenue?limit=10
```

---

## Notes

- All dates are in UTC timezone
- Revenue calculations include only completed appointments
- Top doctors lists are based on the specified date range
- Percentages are rounded to 2 decimal places
- Admin activity is logged for audit purposes

---

**Last Updated:** December 19, 2025
**API Version:** 1.0
**Maintained by:** Philbox Backend Team
