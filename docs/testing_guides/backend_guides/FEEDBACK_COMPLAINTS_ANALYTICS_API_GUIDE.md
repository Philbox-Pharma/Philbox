# Feedback & Complaints Analytics API Guide

## 🎯 Overview

The Feedback & Complaints Analytics API provides comprehensive endpoints for monitoring service quality through reviews, feedback, and complaints data. This guide covers all available endpoints for analyzing customer feedback patterns, complaint resolution metrics, and service quality trends.

**Base URL**: `/api/admin/feedback-complaints-analytics`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
   - [Overall Summary](#1-overall-summary)
   - [Review Sentiment Analysis](#2-review-sentiment-analysis)
   - [Complaint Resolution Time](#3-complaint-resolution-time)
   - [Complaints by Category](#4-complaints-by-category)
   - [Feedback by Category](#5-feedback-by-category)
   - [Complaint Resolution Status](#6-complaint-resolution-status)
   - [Feedback Trends](#7-feedback-trends)
   - [Complaint Trends](#8-complaint-trends)
   - [Export Report Data](#9-export-report-data)
3. [Query Parameters](#query-parameters)
4. [Response Formats](#response-formats)
5. [Testing Examples](#testing-examples)
6. [Error Handling](#error-handling)

---

## 🔐 Authentication

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

## 🚀 API Endpoints

### 1. Overall Summary

Get a comprehensive summary of all feedback and complaints metrics.

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/summary`

#### Query Parameters:

- `startDate` (optional): ISO date string (e.g., `2024-01-01`)
- `endDate` (optional): ISO date string (e.g., `2024-12-31`)

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/summary?startDate=2024-01-01&endDate=2024-12-31" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Overall feedback and complaints summary retrieved successfully",
  "data": {
    "totalReviews": 1250,
    "totalComplaints": 87,
    "totalFeedback": 342,
    "resolvedComplaints": 75,
    "pendingComplaints": 12,
    "averageRating": 4.3,
    "resolutionRate": 86.21
  }
}
```

---

### 2. Review Sentiment Analysis

Get sentiment distribution of customer reviews (pie chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/sentiment-analysis`

#### Query Parameters:

- `startDate` (optional): Filter reviews from this date
- `endDate` (optional): Filter reviews until this date

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/sentiment-analysis?startDate=2024-01-01" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Review sentiment analysis retrieved successfully",
  "data": {
    "totalReviews": 1250,
    "sentimentBreakdown": [
      {
        "sentiment": "positive",
        "count": 875,
        "percentage": 70.0
      },
      {
        "sentiment": "neutral",
        "count": 250,
        "percentage": 20.0
      },
      {
        "sentiment": "negative",
        "count": 125,
        "percentage": 10.0
      }
    ]
  }
}
```

---

### 3. Complaint Resolution Time

Calculate average complaint resolution time (KPI metric).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/resolution-time`

#### Query Parameters:

- `startDate` (optional): Filter complaints from this date
- `endDate` (optional): Filter complaints until this date

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/resolution-time" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Complaint resolution time retrieved successfully",
  "data": {
    "averageResolutionDays": 2.45,
    "minResolutionDays": 0.5,
    "maxResolutionDays": 15.3,
    "totalResolvedComplaints": 75
  }
}
```

---

### 4. Complaints by Category

Get complaint distribution across different categories (bar chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/complaints-by-category`

#### Query Parameters:

- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/complaints-by-category?startDate=2024-06-01&endDate=2024-12-31" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Complaints by category retrieved successfully",
  "data": {
    "totalComplaints": 87,
    "categoryBreakdown": [
      {
        "category": "delivery-service",
        "count": 35,
        "percentage": 40.23
      },
      {
        "category": "order",
        "count": 28,
        "percentage": 32.18
      },
      {
        "category": "doctors",
        "count": 15,
        "percentage": 17.24
      },
      {
        "category": "system",
        "count": 6,
        "percentage": 6.9
      },
      {
        "category": "other",
        "count": 3,
        "percentage": 3.45
      }
    ]
  }
}
```

---

### 5. Feedback by Category

Get feedback distribution across different categories (bar chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/feedback-by-category`

#### Query Parameters:

- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/feedback-by-category" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Feedback by category retrieved successfully",
  "data": {
    "totalFeedback": 342,
    "categoryBreakdown": [
      {
        "category": "doctors",
        "count": 145,
        "percentage": 42.4
      },
      {
        "category": "delivery-service",
        "count": 98,
        "percentage": 28.65
      },
      {
        "category": "order",
        "count": 67,
        "percentage": 19.59
      },
      {
        "category": "system",
        "count": 22,
        "percentage": 6.43
      },
      {
        "category": "other",
        "count": 10,
        "percentage": 2.92
      }
    ]
  }
}
```

---

### 6. Complaint Resolution Status

Get the distribution of resolved vs unresolved complaints (donut chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/resolution-status`

#### Query Parameters:

- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/resolution-status" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Complaint resolution status retrieved successfully",
  "data": {
    "total": 87,
    "resolved": 75,
    "unresolved": 12,
    "resolvedPercentage": 86.21,
    "unresolvedPercentage": 13.79,
    "statusDetails": [
      {
        "status": "resolved",
        "count": 65
      },
      {
        "status": "closed",
        "count": 10
      },
      {
        "status": "pending",
        "count": 7
      },
      {
        "status": "in_progress",
        "count": 5
      }
    ]
  }
}
```

---

### 7. Feedback Trends

Get feedback, complaints, and reviews trends over time (line chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/feedback-trends`

#### Query Parameters:

- `startDate` (optional): Start date for trend analysis (default: 30 days ago)
- `endDate` (optional): End date for trend analysis (default: today)
- `period` (optional): Aggregation period - `daily`, `weekly`, or `monthly` (default: `daily`)

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/feedback-trends?period=weekly&startDate=2024-01-01&endDate=2024-12-31" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Feedback trends retrieved successfully",
  "data": {
    "period": "weekly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "trends": [
      {
        "period": "2024-W01",
        "feedbackCount": 25,
        "complaintCount": 6,
        "reviewCount": 87
      },
      {
        "period": "2024-W02",
        "feedbackCount": 32,
        "complaintCount": 4,
        "reviewCount": 95
      },
      {
        "period": "2024-W03",
        "feedbackCount": 28,
        "complaintCount": 8,
        "reviewCount": 102
      }
    ]
  }
}
```

---

### 8. Complaint Trends

Get detailed complaint trends over time with status breakdown (line chart data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/complaint-trends`

#### Query Parameters:

- `startDate` (optional): Start date (default: 30 days ago)
- `endDate` (optional): End date (default: today)
- `period` (optional): `daily`, `weekly`, or `monthly` (default: `daily`)

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/complaint-trends?period=monthly" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Complaint trends retrieved successfully",
  "data": {
    "period": "monthly",
    "startDate": "2024-11-22T00:00:00.000Z",
    "endDate": "2024-12-22T23:59:59.999Z",
    "trends": [
      {
        "period": "2024-11",
        "totalComplaints": 42,
        "resolved": 38,
        "pending": 2,
        "inProgress": 2
      },
      {
        "period": "2024-12",
        "totalComplaints": 45,
        "resolved": 37,
        "pending": 5,
        "inProgress": 3
      }
    ]
  }
}
```

---

### 9. Export Report Data

Export comprehensive report data for PDF generation (includes all analytics data).

**Endpoint**: `GET /api/admin/feedback-complaints-analytics/export`

#### Query Parameters:

- `startDate` (optional): Start date for report
- `endDate` (optional): End date for report
- `period` (optional): Aggregation period - `daily`, `weekly`, or `monthly` (default: `daily`)

#### Request Example:

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/export?startDate=2024-01-01&endDate=2024-12-31&period=monthly" \
  -b cookie.txt
```

#### Response Example:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Report data exported successfully",
  "data": {
    "reportMetadata": {
      "generatedAt": "2024-12-22T10:30:00.000Z",
      "generatedBy": "admin@philbox.com",
      "dateRange": {
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
      }
    },
    "overallSummary": {
      "totalReviews": 1250,
      "totalComplaints": 87,
      "totalFeedback": 342,
      "resolvedComplaints": 75,
      "pendingComplaints": 12,
      "averageRating": 4.3,
      "resolutionRate": 86.21
    },
    "sentimentAnalysis": {
      /* ... */
    },
    "resolutionTime": {
      /* ... */
    },
    "complaintsByCategory": {
      /* ... */
    },
    "feedbackByCategory": {
      /* ... */
    },
    "resolutionStatus": {
      /* ... */
    },
    "feedbackTrends": {
      /* ... */
    },
    "complaintTrends": {
      /* ... */
    }
  }
}
```

---

## 📝 Query Parameters

### Common Parameters

| Parameter   | Type   | Required | Default      | Description                                    |
| ----------- | ------ | -------- | ------------ | ---------------------------------------------- |
| `startDate` | String | No       | Varies       | ISO 8601 date string (e.g., `2024-01-01`)      |
| `endDate`   | String | No       | Current date | ISO 8601 date string (e.g., `2024-12-31`)      |
| `period`    | String | No       | `daily`      | Time aggregation: `daily`, `weekly`, `monthly` |

### Validation Rules:

- `endDate` must be greater than `startDate`
- Valid `period` values: `daily`, `weekly`, `monthly`
- Dates must be in ISO 8601 format

---

## 📊 Response Formats

### Success Response Structure:

```json
{
  "status": 200,
  "statusCode": 200,
  "message": "Description of the operation",
  "data": {
    /* Response data */
  }
}
```

### Error Response Structure:

```json
{
  "status": 400,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing Examples

### Using cURL

#### Step 1: Login and Save Session Cookie

```bash
curl -X POST "http://localhost:5000/api/admin-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@philbox.com","password":"SuperAdmin@123"}' \
  -c cookie.txt
```

#### Test 1: Get Overall Summary

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/summary" \
  -b cookie.txt
```

#### Test 2: Get Sentiment Analysis with Date Range

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/sentiment-analysis?startDate=2024-01-01&endDate=2024-12-31" \
  -b cookie.txt
```

#### Test 3: Get Weekly Feedback Trends

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/feedback-trends?period=weekly&startDate=2024-01-01" \
  -b cookie.txt
```

### Using Postman

1. **Login First**:
   - Create POST request to `/api/admin-auth/login`
   - Set body (JSON): `{"email":"superadmin@philbox.com","password":"SuperAdmin@123"}`
   - Session cookie will be automatically saved

2. **Test Endpoints**:
   - Create a new collection for Feedback & Complaints Analytics
   - Add requests for each endpoint
   - Session cookie is automatically included
   - Set query parameters as needed

### Using Thunder Client (VS Code)

1. Create a new collection: "Feedback & Complaints Analytics"
2. Add environment variables:
   ```json
   {
     "baseUrl": "http://localhost:5000",
     "adminEmail": "superadmin@philbox.com",
     "adminPassword": "SuperAdmin@123"
   }
   ```
3. Login first to establish session
4. Create requests using `{{baseUrl}}`

---

## 🔧 Testing Workflow

### Prerequisites:

1. Server running on `http://localhost:5000`
2. Database populated with sample data (reviews, complaints, feedback)

### Step-by-Step Testing:

#### Step 1: Authenticate as Admin

```bash
curl -X POST "http://localhost:5000/api/admin-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@philbox.com","password":"SuperAdmin@123"}' \
  -c cookie.txt
```

#### Step 2: Test Overall Summary

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/summary" \
  -b cookie.txt
```

#### Step 3: Test Sentiment Analysis

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/sentiment-analysis" \
  -b cookie.txt
```

#### Step 4: Test Complaint Resolution Time

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/resolution-time" \
  -b cookie.txt
```

#### Step 5: Test Complaints by Category

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/complaints-by-category" \
  -b cookie.txt
```

#### Step 6: Test Feedback by Category

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/feedback-by-category" \
  -b cookie.txt
```

#### Step 7: Test Resolution Status

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/resolution-status" \
  -b cookie.txt
```

#### Step 8: Test Feedback Trends (Daily)

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/feedback-trends?period=daily" \
  -b cookie.txt
```

#### Step 9: Test Complaint Trends (Weekly)

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/complaint-trends?period=weekly" \
  -b cookie.txt
```

#### Step 10: Test Export Report Data

```bash
curl -X GET "http://localhost:5000/api/admin/feedback-complaints-analytics/export?period=monthly" \
  -b cookie.txt
```

---

## ❌ Error Handling

### Common Error Codes:

| Status Code | Description                        | Solution                                     |
| ----------- | ---------------------------------- | -------------------------------------------- |
| 400         | Bad Request - Invalid parameters   | Check query parameters format                |
| 401         | Unauthorized - No session          | Login first to establish session             |
| 403         | Forbidden - Account suspended      | Contact administrator                        |
| 404         | Not Found - Resource doesn't exist | Verify endpoint URL                          |
| 500         | Internal Server Error              | Check server logs for detailed error message |

### Validation Errors Example:

```json
{
  "status": 400,
  "message": "\"endDate\" must be greater than \"ref:startDate\""
}
```

---

## 📌 Notes

### Data Models:

#### Feedback Model:

```javascript
{
  _id: ObjectId,
  customer_id: ObjectId (optional),
  category: "delivery-service" | "order" | "doctors" | "system" | "other",
  comment: String,
  created_at: Date,
  updated_at: Date
}
```

#### Complaint Model:

```javascript
{
  _id: ObjectId,
  customer_id: ObjectId,
  customer_address_id: ObjectId,
  branch_admin_id: [ObjectId],
  super_admin_id: ObjectId,
  title: String,
  description: String,
  category: String,
  priority: "low" | "medium" | "high",
  messages: Array,
  status: "pending" | "in_progress" | "resolved" | "closed",
  created_at: Date,
  updated_at: Date
}
```

#### Review Model:

```javascript
{
  _id: ObjectId,
  message: String,
  rating: Number (1-5),
  customer_id: ObjectId,
  target_type: "doctor" | "meeting" | "order",
  target_id: ObjectId,
  sentiment: "positive" | "negative" | "neutral",
  created_at: Date,
  updated_at: Date
}
```

### Best Practices:

1. **Authentication**: Always login first and maintain session throughout testing
2. **Date Filtering**: Always specify date ranges for large datasets to improve performance
3. **Period Selection**: Use appropriate period (`daily`/`weekly`/`monthly`) based on date range
4. **Error Handling**: Always check response status and handle errors gracefully
5. **Session Management**: Session cookies expire after inactivity; re-login if needed

### Performance Tips:

- Use date ranges to limit data queried
- Choose appropriate aggregation periods
- Consider pagination for large result sets
- Monitor query execution times

---

## 🔗 Related Documentation

- [ADMIN_API_COMPLETE_GUIDE.md](./ADMIN_API_COMPLETE_GUIDE.md)
- [USER_ENGAGEMENT_ANALYTICS_API_GUIDE.md](./USER_ENGAGEMENT_ANALYTICS_API_GUIDE.md)
- [ORDERS_ANALYTICS_API_GUIDE.md](./ORDERS_ANALYTICS_API_GUIDE.md)
- [REVENUE_ANALYTICS_API_GUIDE.md](./REVENUE_ANALYTICS_API_GUIDE.md)

---

## 📞 Support

For issues or questions:

- Check server logs for detailed error messages
- Ensure you are logged in with valid session
- Ensure database contains test data
- Review query parameter validation rules

---

**Last Updated**: December 22, 2024
**API Version**: 1.0.0
