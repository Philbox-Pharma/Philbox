# 🚀 User Engagement Analytics - Quick Start

## Start the Server

```bash
cd server
npm run dev
```

## Test All Endpoints

### 1. Login First

```bash
POST http://localhost:5000/api/admin-auth/login
Content-Type: application/json

{
  "email": "superadmin@philbox.com",
  "password": "SuperAdmin@123"
}
```

### 2. Dashboard Overview

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/overview?startDate=2024-01-01&endDate=2024-12-31
```

### 3. New Customers Trends

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/new-customers?startDate=2024-01-01&endDate=2024-12-31&period=monthly
```

### 4. Customer Activity Status

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/customer-status
```

### 5. Doctor Applications

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/doctor-applications?period=monthly
```

### 6. Doctor Activity

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/doctor-activity?limit=10
```

### 7. Top Customers

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/top-customers?metric=both&limit=10
```

### 8. Retention Rate

```bash
GET http://localhost:5000/api/admin/user-engagement-analytics/retention-rate
```

## Files Created

✅ `server/src/dto/admin/userEngagementAnalytics.dto.js`
✅ `server/src/modules/admin/features/dashboard_management/user_engagement_analytics/services/userEngagementAnalytics.service.js`
✅ `server/src/modules/admin/features/dashboard_management/user_engagement_analytics/controller/userEngagementAnalytics.controller.js`
✅ `server/src/modules/admin/features/dashboard_management/user_engagement_analytics/routes/userEngagementAnalytics.routes.js`
✅ `docs/testing_guides/backend_guides/USER_ENGAGEMENT_ANALYTICS_API_GUIDE.md`
✅ `docs/features_guide/USER_ENGAGEMENT_ANALYTICS_IMPLEMENTATION.md`

## Files Modified

✅ `server/src/server.js` - Added routes

## Status

✅ **READY FOR TESTING**
