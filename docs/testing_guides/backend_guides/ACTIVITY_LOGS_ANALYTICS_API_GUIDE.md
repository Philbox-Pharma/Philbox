# Activity Logs Analytics API - Complete Testing Guide

## Overview

This API allows Super Admins to monitor and audit all admin and salesperson activities in the system. It provides comprehensive analytics including action timelines, frequent actions, login attempts, and suspicious activity alerts.

---

## Authentication

All endpoints require session-based authentication. First authenticate by logging in:

```bash
# Login as Admin (Cookie will be stored)
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourPassword"
  }' \
  -c cookie.txt

# Use the stored cookie in subsequent requests
curl -X GET http://localhost:8000/api/admin/activity-logs-analytics/overview \
  -b cookie.txt
```

---

## Base URL

```
http://localhost:8000/api/admin/activity-logs-analytics
```

---

## Endpoints

### 1. Get Actions Timeline

**Chronological list of all admin and salesperson activities**

**Endpoint:** `GET /timeline`

**Purpose:** Retrieve a paginated timeline of all system activities for audit purposes

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | ISO Date | No | - | Filter activities from this date |
| endDate | ISO Date | No | - | Filter activities until this date |
| userId | String | No | - | Filter by specific admin or salesperson ID |
| actionType | String | No | - | Filter by action type (e.g., "login", "create_user") |
| userRole | String | No | - | Filter by role: "admin" or "salesperson" |
| page | Number | No | 1 | Page number for pagination |
| limit | Number | No | 50 | Number of records per page (max 100) |

**Example Request:**

```bash
# Get recent activities (last 50)
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline" \
  -b cookie.txt

# Get activities from a specific date range
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?startDate=2024-01-01&endDate=2024-01-31" \
  -b cookie.txt

# Get activities by specific admin
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?userId=60d5f60f5f1b2c1a4c8b4567&userRole=admin" \
  -b cookie.txt

# Get login activities only
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?actionType=login" \
  -b cookie.txt

# Get page 2 with 20 records per page
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?page=2&limit=20" \
  -b cookie.txt
```

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Activity timeline retrieved successfully",
  "data": {
    "timeline": [
      {
        "_id": "694940c8e4be532e4ba11d48",
        "admin_id": {
          "_id": "693ac1067ad05bf2c11cda6b",
          "name": "John Smith",
          "email": "john.smith@example.com",
          "category": "super-admin"
        },
        "action_type": "create_user",
        "description": "Created new admin user",
        "target_collection": "admins",
        "target_id": "60d5f60f5f1b2c1a4c8b4568",
        "changes": null,
        "ip_address": "192.168.1.1",
        "device_info": "Mozilla/5.0...",
        "created_at": "2024-01-15T10:30:00.000Z",
        "__v": 0,
        "userRole": "admin",
        "userName": "John Smith",
        "userEmail": "john.smith@example.com",
        "userCategory": "super-admin"
      },
      {
        "_id": "60d5f60f5f1b2c1a4c8b4569",
        "salesperson_id": {
          "_id": "693ac1067ad05bf2c11cda6c",
          "fullName": "Jane Doe",
          "email": "jane.doe@example.com",
          "status": "active"
        },
        "action_type": "update_order",
        "description": "Updated order status to delivered",
        "target_collection": "orders",
        "target_id": "60d5f60f5f1b2c1a4c8b4570",
        "changes": null,
        "ip_address": "192.168.1.2",
        "device_info": "Mozilla/5.0...",
        "created_at": "2024-01-15T09:15:00.000Z",
        "__v": 0,
        "userRole": "salesperson",
        "userName": "Jane Doe",
        "userEmail": "jane.doe@example.com",
        "userCategory": "salesperson"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "pages": 5
    }
  }
}
```

**Use Cases:**

- Audit trail for compliance
- Investigate specific user actions
- Monitor system activity in real-time
- Track changes made by specific admins

---

### 2. Get Most Frequent Actions

**Pie chart data showing most common actions**

**Endpoint:** `GET /frequent-actions`

**Purpose:** Identify the most frequently performed actions for operational insights

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | ISO Date | No | - | Filter from this date |
| endDate | ISO Date | No | - | Filter until this date |
| userRole | String | No | - | Filter by "admin" or "salesperson" |
| topN | Number | No | 10 | Number of top actions to return (max 50) |

**Example Request:**

```bash
# Get top 10 most frequent actions
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/frequent-actions" \
  -b cookie.txt

# Get top 15 admin actions from last month
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/frequent-actions?userRole=admin&topN=15&startDate=2024-01-01&endDate=2024-01-31" \
  -b cookie.txt

# Get top 20 salesperson actions
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/frequent-actions?userRole=salesperson&topN=20" \
  -b cookie.txt
```

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Frequent actions retrieved successfully",
  "data": {
    "totalActions": 1250,
    "frequentActions": [
      {
        "actionType": "login",
        "count": 450,
        "userRole": "admin",
        "percentage": 36.0
      },
      {
        "actionType": "update_order",
        "count": 280,
        "userRole": "salesperson",
        "percentage": 22.4
      },
      {
        "actionType": "create_user",
        "count": 150,
        "userRole": "admin",
        "percentage": 12.0
      },
      {
        "actionType": "view_dashboard",
        "count": 120,
        "userRole": "admin",
        "percentage": 9.6
      },
      {
        "actionType": "update_customer",
        "count": 100,
        "userRole": "salesperson",
        "percentage": 8.0
      }
    ]
  }
}
```

**Use Cases:**

- Understand common workflows
- Optimize frequently used features
- Identify bottlenecks in operations
- Create pie charts for management reports

---

### 3. Get Login Attempts by Role

**Bar chart data showing login statistics per role**

**Endpoint:** `GET /login-attempts`

**Purpose:** Monitor login patterns and security across different user roles

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | ISO Date | No | - | Filter from this date |
| endDate | ISO Date | No | - | Filter until this date |

**Example Request:**

```bash
# Get all-time login attempts
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/login-attempts" \
  -b cookie.txt

# Get login attempts for last week
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/login-attempts?startDate=2024-01-08&endDate=2024-01-15" \
  -b cookie.txt

# Get login attempts for specific month
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/login-attempts?startDate=2024-01-01&endDate=2024-01-31" \
  -b cookie.txt
```

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Login attempts by role retrieved successfully",
  "data": {
    "loginAttempts": [
      {
        "role": "super-admin",
        "totalAttempts": 150,
        "successfulLogins": 145,
        "failedLogins": 5
      },
      {
        "role": "admin",
        "totalAttempts": 320,
        "successfulLogins": 305,
        "failedLogins": 15
      },
      {
        "role": "branch-admin",
        "totalAttempts": 280,
        "successfulLogins": 270,
        "failedLogins": 10
      },
      {
        "role": "salesperson",
        "totalAttempts": 450,
        "successfulLogins": 430,
        "failedLogins": 20
      }
    ]
  }
}
```

**Use Cases:**

- Security monitoring
- Identify potential brute force attempts
- Track login success rates
- Create bar charts for security reports

---

### 4. Get Suspicious Activities

**Table data showing potentially malicious or unusual activities**

**Endpoint:** `GET /suspicious-activities`

**Purpose:** Identify and investigate suspicious activities for security monitoring

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | ISO Date | No | - | Filter from this date |
| endDate | ISO Date | No | - | Filter until this date |
| page | Number | No | 1 | Page number for pagination |
| limit | Number | No | 20 | Records per page (max 100) |

**Suspicious Patterns Detected:**

- Actions containing: "delete", "suspend", "block", "failed", "unauthorized", "security", "breach"
- Multiple failed login attempts
- Unusual action frequency

**Severity Levels:**

- **critical**: delete, block, breach
- **high**: suspend, failed, unauthorized
- **medium**: security, warning
- **low**: other

**Example Request:**

```bash
# Get all suspicious activities
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/suspicious-activities" \
  -b cookie.txt

# Get suspicious activities from last 7 days
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/suspicious-activities?startDate=2024-01-08" \
  -b cookie.txt

# Get page 2 with 10 records
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/suspicious-activities?page=2&limit=10" \
  -b cookie.txt
```

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Suspicious activities retrieved successfully",
  "data": {
    "suspiciousActivities": [
      {
        "_id": "60d5f60f5f1b2c1a4c8b4567",
        "userRole": "admin",
        "userId": "60d5f60f5f1b2c1a4c8b4568",
        "userName": "John Smith",
        "userEmail": "john.smith@example.com",
        "actionType": "delete_user",
        "description": "Deleted admin user account",
        "targetCollection": "admins",
        "targetId": "60d5f60f5f1b2c1a4c8b4569",
        "ipAddress": "192.168.1.1",
        "deviceInfo": "Mozilla/5.0...",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "severity": "critical"
      },
      {
        "_id": "60d5f60f5f1b2c1a4c8b4570",
        "userRole": "salesperson",
        "userId": "60d5f60f5f1b2c1a4c8b4571",
        "userName": "Jane Doe",
        "userEmail": "jane.doe@example.com",
        "actionType": "login_failed",
        "description": "Failed login attempt - incorrect password",
        "targetCollection": null,
        "targetId": null,
        "ipAddress": "192.168.1.2",
        "deviceInfo": "Mozilla/5.0...",
        "createdAt": "2024-01-15T09:45:00.000Z",
        "severity": "high"
      },
      {
        "_id": "60d5f60f5f1b2c1a4c8b4572",
        "userRole": "admin",
        "userId": "60d5f60f5f1b2c1a4c8b4573",
        "userName": "Mike Johnson",
        "userEmail": "mike.johnson@example.com",
        "actionType": "suspend_account",
        "description": "Suspended customer account",
        "targetCollection": "customers",
        "targetId": "60d5f60f5f1b2c1a4c8b4574",
        "ipAddress": "192.168.1.3",
        "deviceInfo": "Mozilla/5.0...",
        "createdAt": "2024-01-15T08:20:00.000Z",
        "severity": "high"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Use Cases:**

- Security incident response
- Compliance auditing
- Investigate unauthorized actions
- Monitor for policy violations

---

### 5. Get Activity Overview

**Summary statistics of all system activities**

**Endpoint:** `GET /overview`

**Purpose:** Get high-level metrics for dashboard KPIs

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| startDate | ISO Date | No | - | Filter from this date |
| endDate | ISO Date | No | - | Filter until this date |

**Example Request:**

```bash
# Get all-time overview
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/overview" \
  -b cookie.txt

# Get overview for last month
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/overview?startDate=2024-01-01&endDate=2024-01-31" \
  -b cookie.txt

# Get overview for today
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/overview?startDate=2024-01-15T00:00:00.000Z&endDate=2024-01-15T23:59:59.999Z" \
  -b cookie.txt
```

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Activity overview retrieved successfully",
  "data": {
    "totalAdminActions": 1540,
    "totalSalespersonActions": 2380,
    "totalActions": 3920,
    "uniqueAdmins": 25,
    "uniqueSalespersons": 48,
    "suspiciousActivitiesCount": 12
  }
}
```

**Use Cases:**

- Dashboard KPI cards
- Quick health check
- Executive summary reports
- System activity monitoring

---

## Error Responses

### 400 Bad Request

```json
{
  "status": 400,
  "message": "\"endDate\" must be greater than or equal to \"ref:startDate\""
}
```

### 401 Unauthorized

```json
{
  "status": 401,
  "message": "Unauthorized - Please login first"
}
```

### 500 Internal Server Error

```json
{
  "status": 500,
  "message": "Error message here",
  "error": "Detailed error message"
}
```

---

## Testing Workflow

### Step 1: Authentication

```bash
# Login and save session cookie
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourPassword"
  }' \
  -c cookie.txt
```

### Step 2: Get Overview

```bash
# Check overall statistics
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/overview" \
  -b cookie.txt
```

### Step 3: View Timeline

```bash
# Get recent activities
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?limit=20" \
  -b cookie.txt
```

### Step 4: Analyze Frequent Actions

```bash
# See what actions are most common
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/frequent-actions?topN=10" \
  -b cookie.txt
```

### Step 5: Check Login Security

```bash
# Monitor login attempts
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/login-attempts" \
  -b cookie.txt
```

### Step 6: Review Suspicious Activities

```bash
# Check for security concerns
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/suspicious-activities" \
  -b cookie.txt
```

---

## Common Use Cases

### 1. Security Audit

```bash
# Get last 30 days of suspicious activities
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/suspicious-activities?startDate=2024-01-01&endDate=2024-01-31&limit=100" \
  -b cookie.txt
```

### 2. User Investigation

```bash
# Track all actions by specific admin
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?userId=60d5f60f5f1b2c1a4c8b4567&userRole=admin" \
  -b cookie.txt
```

### 3. Login Analysis

```bash
# Check failed logins
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/timeline?actionType=login_failed" \
  -b cookie.txt
```

### 4. Operational Insights

```bash
# Find most common workflows
curl -X GET "http://localhost:8000/api/admin/activity-logs-analytics/frequent-actions?topN=20" \
  -b cookie.txt
```

---

## Notes

- **Authentication**: All endpoints require session-based authentication via cookies
- **Pagination**: Use `page` and `limit` parameters for large datasets
- **Date Filters**: All dates should be in ISO 8601 format
- **Performance**: Add indexes on `created_at`, `admin_id`, `salesperson_id`, `action_type` for better performance
- **Activity Logging**: All analytics endpoints automatically log their own access for audit purposes

---

## Frontend Integration

### Timeline Component

```javascript
// Fetch timeline with filters
const response = await fetch(
  `/api/admin/activity-logs-analytics/timeline?startDate=${startDate}&endDate=${endDate}&page=${page}`,
  { credentials: "include" },
);
const { data } = await response.json();
// Render data.timeline as a table or list
```

### Pie Chart - Frequent Actions

```javascript
// Fetch top actions
const response = await fetch(
  "/api/admin/activity-logs-analytics/frequent-actions?topN=10",
  { credentials: "include" },
);
const { data } = await response.json();
// Use data.frequentActions for pie chart
```

### Bar Chart - Login Attempts

```javascript
// Fetch login stats
const response = await fetch(
  "/api/admin/activity-logs-analytics/login-attempts",
  { credentials: "include" },
);
const { data } = await response.json();
// Use data.loginAttempts for bar chart
```

### Suspicious Activities Table

```javascript
// Fetch suspicious activities
const response = await fetch(
  "/api/admin/activity-logs-analytics/suspicious-activities?page=1&limit=20",
  { credentials: "include" },
);
const { data } = await response.json();
// Render data.suspiciousActivities with severity badges
```

---

## Database Indexes Recommendation

Add these indexes for optimal performance:

```javascript
// AdminActivityLog indexes
db.adminActivityLogs.createIndex({ created_at: -1 });
db.adminActivityLogs.createIndex({ admin_id: 1, created_at: -1 });
db.adminActivityLogs.createIndex({ action_type: 1, created_at: -1 });

// SalespersonActivityLog indexes
db.salespersonActivityLogs.createIndex({ created_at: -1 });
db.salespersonActivityLogs.createIndex({ salesperson_id: 1, created_at: -1 });
db.salespersonActivityLogs.createIndex({ action_type: 1, created_at: -1 });
```

---

## Support

For issues or questions, contact the backend team or create a ticket in the project management system.
