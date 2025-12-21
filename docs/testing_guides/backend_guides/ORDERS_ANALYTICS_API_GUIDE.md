# Orders Analytics API Guide

## Overview

The Orders Analytics API provides endpoints for comprehensive pharmacy and order analytics including orders trends, status breakdown, top selling medicines, stock alerts, revenue by category, refund rates, and a unified dashboard overview.

**Base URL**: `/api/admin/orders-analytics`

**Authentication**: All endpoints require authentication via session middleware (Super Admin or Branch Admin)

---

## Table of Contents

1. [Orders Trends](#1-orders-trends)
2. [Order Status Breakdown](#2-order-status-breakdown)
3. [Top Selling Medicines](#3-top-selling-medicines)
4. [Stock Alerts](#4-stock-alerts)
5. [Revenue By Category](#5-revenue-by-category)
6. [Order Refund Rate](#6-order-refund-rate)
7. [Dashboard Overview](#7-dashboard-overview)
8. [Common Patterns](#8-common-patterns)
9. [Frontend Integration](#9-frontend-integration)

---

## 1. Orders Trends

Get daily, weekly, or monthly orders trends including status breakdown over time.

**Endpoint**: `GET /api/admin/orders-analytics/trends`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                                              |
| ----------- | ------ | -------- | ------- | -------------------------------------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format: `2024-01-01`)               |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format: `2024-01-31`)                 |
| `period`    | String | No       | `daily` | Grouping period: `daily`, `weekly`, or `monthly`         |
| `branchId`  | String | No       | -       | Filter by specific branch (Branch Admins see own branch) |

### Example Request

```http
GET /api/admin/orders-analytics/trends?startDate=2024-01-01&endDate=2024-01-31&period=weekly HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Orders trends retrieved successfully",
  "data": {
    "trends": [
      {
        "_id": {
          "year": 2024,
          "week": 1
        },
        "totalOrders": 145,
        "pendingOrders": 12,
        "processingOrders": 45,
        "deliveredOrders": 78,
        "cancelledOrders": 10
      },
      {
        "_id": {
          "year": 2024,
          "week": 2
        },
        "totalOrders": 168,
        "pendingOrders": 18,
        "processingOrders": 52,
        "deliveredOrders": 89,
        "cancelledOrders": 9
      }
    ],
    "period": "weekly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  }
}
```

### Response Fields

- `trends`: Array of trend data points
  - `_id`: Date grouping (year/month/day or year/week based on period)
  - `totalOrders`: Total orders in the period
  - `pendingOrders`: Orders with status 'pending'
  - `processingOrders`: Orders with status 'processing'
  - `deliveredOrders`: Orders with status 'delivered'
  - `cancelledOrders`: Orders with status 'cancelled'
- `period`: Grouping period used
- `startDate`: Query start date
- `endDate`: Query end date

### Chart Usage

**Line Chart Example**:

- X-axis: Date/Week/Month from `_id`
- Y-axis: `totalOrders`
- Multiple lines: `pendingOrders`, `processingOrders`, `deliveredOrders`, `cancelledOrders`

---

## 2. Order Status Breakdown

Get the distribution of orders by status (pending, processing, delivered, cancelled).

**Endpoint**: `GET /api/admin/orders-analytics/status-breakdown`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                  |
| ----------- | ------ | -------- | ------- | ---------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format) |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format)   |
| `branchId`  | String | No       | -       | Filter by specific branch    |

### Example Request

```http
GET /api/admin/orders-analytics/status-breakdown?startDate=2024-01-01 HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Order status breakdown retrieved successfully",
  "data": {
    "pending": 45,
    "pendingPercentage": "10.00",
    "processing": 120,
    "processingPercentage": "26.67",
    "delivered": 260,
    "deliveredPercentage": "57.78",
    "cancelled": 25,
    "cancelledPercentage": "5.56",
    "total": 450
  }
}
```

### Response Fields

- `pending`: Count of pending orders
- `pendingPercentage`: Percentage of pending orders
- `processing`: Count of processing orders
- `processingPercentage`: Percentage of processing orders
- `delivered`: Count of delivered orders
- `deliveredPercentage`: Percentage of delivered orders
- `cancelled`: Count of cancelled orders
- `cancelledPercentage`: Percentage of cancelled orders
- `total`: Total orders

### Chart Usage

**Pie Chart Example**:

```javascript
const chartData = [
  { name: "Pending", value: data.pending, percentage: data.pendingPercentage },
  {
    name: "Processing",
    value: data.processing,
    percentage: data.processingPercentage,
  },
  {
    name: "Delivered",
    value: data.delivered,
    percentage: data.deliveredPercentage,
  },
  {
    name: "Cancelled",
    value: data.cancelled,
    percentage: data.cancelledPercentage,
  },
];
```

---

## 3. Top Selling Medicines

Get a ranked list of the best-selling medicines based on quantity sold.

**Endpoint**: `GET /api/admin/orders-analytics/top-medicines`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                               |
| ----------- | ------ | -------- | ------- | ----------------------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format)              |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format)                |
| `branchId`  | String | No       | -       | Filter by specific branch                 |
| `limit`     | Number | No       | 10      | Number of top medicines to return (1-100) |

### Example Request

```http
GET /api/admin/orders-analytics/top-medicines?limit=5 HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Top selling medicines retrieved successfully",
  "data": [
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a1",
      "medicineName": "Paracetamol 500mg",
      "medicineCategory": "surgical",
      "totalQuantitySold": 1250,
      "totalRevenue": 12500,
      "orderCount": 320,
      "imgUrl": "https://cloudinary.com/..."
    },
    {
      "_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "medicineName": "Aspirin 100mg",
      "medicineCategory": "Narcotics",
      "totalQuantitySold": 980,
      "totalRevenue": 19600,
      "orderCount": 245,
      "imgUrl": "https://cloudinary.com/..."
    }
  ]
}
```

### Response Fields

- `_id`: Medicine item ID
- `medicineName`: Name of the medicine
- `medicineCategory`: Category (`Narcotics` or `surgical`)
- `totalQuantitySold`: Total quantity sold
- `totalRevenue`: Total revenue generated
- `orderCount`: Number of orders containing this medicine
- `imgUrl`: Medicine image URL

### Table Usage

**Ranked List Example**:

```javascript
data.map((medicine, index) => ({
  rank: index + 1,
  name: medicine.medicineName,
  category: medicine.medicineCategory,
  quantitySold: medicine.totalQuantitySold,
  revenue: `Rs. ${medicine.totalRevenue}`,
  orders: medicine.orderCount,
}));
```

---

## 4. Stock Alerts

Get alerts for low stock and expiring medicines.

**Endpoint**: `GET /api/admin/orders-analytics/stock-alerts`

### Query Parameters

| Parameter  | Type   | Required | Default | Description                                |
| ---------- | ------ | -------- | ------- | ------------------------------------------ |
| `branchId` | String | No       | -       | Filter by specific branch                  |
| `limit`    | Number | No       | 20      | Max number of items per alert type (1-100) |

### Example Request

```http
GET /api/admin/orders-analytics/stock-alerts?limit=10 HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Stock alerts retrieved successfully",
  "data": {
    "lowStock": [
      {
        "medicineId": "60d5ec49f1b2c8b1f8e4e1a1",
        "medicineName": "Insulin Glargine",
        "category": "Narcotics",
        "currentStock": 5,
        "alertType": "low_stock",
        "imgUrl": "https://cloudinary.com/..."
      }
    ],
    "expiringStock": [
      {
        "medicineId": "60d5ec49f1b2c8b1f8e4e1a2",
        "medicineName": "Amoxicillin 250mg",
        "category": "surgical",
        "currentStock": 150,
        "expiryDate": "2024-02-15T00:00:00.000Z",
        "alertType": "expiring_soon",
        "daysUntilExpiry": 12,
        "imgUrl": "https://cloudinary.com/..."
      }
    ]
  }
}
```

### Response Fields

#### Low Stock Items

- `medicineId`: Medicine item ID
- `medicineName`: Name of the medicine
- `category`: Medicine category
- `currentStock`: Current quantity (< 10)
- `alertType`: Always `"low_stock"`
- `imgUrl`: Medicine image URL

#### Expiring Stock Items

- `medicineId`: Medicine item ID
- `medicineName`: Name of the medicine
- `category`: Medicine category
- `currentStock`: Current batch quantity
- `expiryDate`: Batch expiry date
- `alertType`: Always `"expiring_soon"`
- `daysUntilExpiry`: Days remaining until expiry
- `imgUrl`: Medicine image URL

### Table Usage

**Combined Alerts Table**:

```javascript
const allAlerts = [
  ...data.lowStock.map((item) => ({
    ...item,
    severity: "high",
    message: `Low stock: ${item.currentStock} units remaining`,
  })),
  ...data.expiringStock.map((item) => ({
    ...item,
    severity: item.daysUntilExpiry < 7 ? "critical" : "medium",
    message: `Expires in ${item.daysUntilExpiry} days`,
  })),
];
```

---

## 5. Revenue By Category

Get revenue breakdown by medicine category (Narcotics vs Surgical).

**Endpoint**: `GET /api/admin/orders-analytics/revenue-by-category`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                  |
| ----------- | ------ | -------- | ------- | ---------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format) |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format)   |
| `branchId`  | String | No       | -       | Filter by specific branch    |

### Example Request

```http
GET /api/admin/orders-analytics/revenue-by-category HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Revenue by medicine category retrieved successfully",
  "data": {
    "Narcotics": {
      "revenue": 250000,
      "itemCount": 450,
      "percentage": "65.79"
    },
    "surgical": {
      "revenue": 130000,
      "itemCount": 780,
      "percentage": "34.21"
    },
    "total": {
      "revenue": 380000,
      "itemCount": 1230
    }
  }
}
```

### Response Fields

- `Narcotics`: Narcotics category data
  - `revenue`: Total revenue from narcotics
  - `itemCount`: Number of narcotic items sold
  - `percentage`: Percentage of total revenue
- `surgical`: Surgical category data
  - `revenue`: Total revenue from surgical items
  - `itemCount`: Number of surgical items sold
  - `percentage`: Percentage of total revenue
- `total`: Combined totals
  - `revenue`: Total revenue across all categories
  - `itemCount`: Total items sold

### Chart Usage

**Pie Chart Example**:

```javascript
const chartData = [
  {
    name: "Narcotics",
    value: data.Narcotics.revenue,
    percentage: data.Narcotics.percentage,
  },
  {
    name: "Surgical",
    value: data.surgical.revenue,
    percentage: data.surgical.percentage,
  },
];
```

---

## 6. Order Refund Rate

Get order refund rate KPI with total refund statistics.

**Endpoint**: `GET /api/admin/orders-analytics/refund-rate`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                  |
| ----------- | ------ | -------- | ------- | ---------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format) |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format)   |
| `branchId`  | String | No       | -       | Filter by specific branch    |

### Example Request

```http
GET /api/admin/orders-analytics/refund-rate?startDate=2024-01-01 HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Order refund rate retrieved successfully",
  "data": {
    "totalOrders": 450,
    "refundedOrders": 23,
    "refundRate": 5.11,
    "totalRefundAmount": 45600
  }
}
```

### Response Fields

- `totalOrders`: Total orders in the period
- `refundedOrders`: Number of orders with refunds
- `refundRate`: Refund rate percentage (refundedOrders / totalOrders \* 100)
- `totalRefundAmount`: Total amount refunded

### KPI Display

**Dashboard Card Example**:

```javascript
<Card>
  <CardHeader>Order Refund Rate</CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">{data.refundRate}%</div>
    <div className="text-sm text-gray-500">
      {data.refundedOrders} / {data.totalOrders} orders refunded
    </div>
    <div className="text-sm text-red-500">
      Total Refunded: Rs. {data.totalRefundAmount}
    </div>
  </CardContent>
</Card>
```

---

## 7. Dashboard Overview

Get all analytics in a single API call for the dashboard overview page.

**Endpoint**: `GET /api/admin/orders-analytics/overview`

### Query Parameters

| Parameter   | Type   | Required | Default | Description                  |
| ----------- | ------ | -------- | ------- | ---------------------------- |
| `startDate` | String | No       | 30d ago | Start date (ISO 8601 format) |
| `endDate`   | String | No       | Today   | End date (ISO 8601 format)   |
| `period`    | String | No       | `daily` | Grouping period for trends   |
| `branchId`  | String | No       | -       | Filter by specific branch    |
| `limit`     | Number | No       | 10      | Limit for top medicines      |

### Example Request

```http
GET /api/admin/orders-analytics/overview?period=weekly&limit=5 HTTP/1.1
Host: localhost:5000
Cookie: connect.sid=...
```

### Example Response

```json
{
  "success": true,
  "message": "Dashboard overview retrieved successfully",
  "data": {
    "trends": {
      "trends": [...],
      "period": "weekly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "statusBreakdown": {
      "pending": 45,
      "pendingPercentage": "10.00",
      "processing": 120,
      "processingPercentage": "26.67",
      "delivered": 260,
      "deliveredPercentage": "57.78",
      "cancelled": 25,
      "cancelledPercentage": "5.56",
      "total": 450
    },
    "topMedicines": [...],
    "stockAlerts": {
      "lowStock": [...],
      "expiringStock": [...]
    },
    "revenueByCategory": {
      "Narcotics": {...},
      "surgical": {...},
      "total": {...}
    },
    "refundRate": {
      "totalOrders": 450,
      "refundedOrders": 23,
      "refundRate": 5.11,
      "totalRefundAmount": 45600
    }
  }
}
```

### Response Fields

All data from endpoints 1-6 combined into a single response object.

### Usage

This endpoint is optimized for dashboard pages that need to display all KPIs at once. Instead of making 6 separate API calls, use this single endpoint to reduce network overhead and improve page load performance.

---

## 8. Common Patterns

### Branch Filtering

**Super Admin**: Can view analytics for all branches or filter by specific branch
**Branch Admin**: Automatically filtered to their managed branch(es)

The backend automatically applies branch filtering based on the admin's role.

### Date Range Filtering

All endpoints support optional date range filtering:

```javascript
const params = new URLSearchParams({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
});

fetch(`/api/admin/orders-analytics/trends?${params}`);
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Failed to retrieve orders trends",
  "data": null
}
```

**HTTP Status Codes**:

- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `500`: Internal Server Error

---

## 9. Frontend Integration

### React Example

```javascript
import { useState, useEffect } from "react";

const OrdersAnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          ...dateRange,
          period: "weekly",
          limit: 10,
        });

        const response = await fetch(
          `/api/admin/orders-analytics/overview?${params}`,
          {
            credentials: "include", // Include session cookie
          },
        );

        const result = await response.json();

        if (result.success) {
          setOverview(result.data);
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [dateRange]);

  if (loading) return <Loader />;

  return (
    <div>
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Trends Chart */}
      <LineChart data={overview.trends.trends} />

      {/* Status Breakdown */}
      <PieChart data={overview.statusBreakdown} />

      {/* Top Medicines */}
      <RankedList data={overview.topMedicines} />

      {/* Stock Alerts */}
      <AlertsTable data={overview.stockAlerts} />

      {/* Revenue by Category */}
      <PieChart data={overview.revenueByCategory} />

      {/* Refund Rate KPI */}
      <KPICard data={overview.refundRate} />
    </div>
  );
};
```

### Axios Example

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api/admin/orders-analytics",
  withCredentials: true,
});

// Fetch orders trends
export const getOrdersTrends = (params) => api.get("/trends", { params });

// Fetch status breakdown
export const getStatusBreakdown = (params) =>
  api.get("/status-breakdown", { params });

// Fetch top medicines
export const getTopMedicines = (params) =>
  api.get("/top-medicines", { params });

// Fetch stock alerts
export const getStockAlerts = (params) => api.get("/stock-alerts", { params });

// Fetch revenue by category
export const getRevenueByCategory = (params) =>
  api.get("/revenue-by-category", { params });

// Fetch refund rate
export const getRefundRate = (params) => api.get("/refund-rate", { params });

// Fetch dashboard overview
export const getDashboardOverview = (params) =>
  api.get("/overview", { params });
```

### Usage in Component

```javascript
import { getDashboardOverview } from "./api/ordersAnalytics";

const fetchData = async () => {
  try {
    const { data } = await getDashboardOverview({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      period: "weekly",
      limit: 10,
    });

    if (data.success) {
      console.log("Overview:", data.data);
    }
  } catch (error) {
    console.error("API Error:", error);
  }
};
```

---

## Testing Checklist

### Functional Tests

- [ ] Orders trends with different periods (daily/weekly/monthly)
- [ ] Order status breakdown with date filters
- [ ] Top medicines with various limits
- [ ] Stock alerts for low stock and expiring items
- [ ] Revenue by category breakdown
- [ ] Refund rate calculations
- [ ] Dashboard overview aggregation

### Branch Filtering Tests

- [ ] Super Admin can see all branches
- [ ] Super Admin can filter by specific branch
- [ ] Branch Admin sees only their branch

### Date Range Tests

- [ ] Default date range (last 30 days)
- [ ] Custom date range
- [ ] Future dates (should return empty data)
- [ ] Invalid date formats (should return 400)

### Edge Cases

- [ ] No orders in date range
- [ ] No refunds in period
- [ ] Empty stock
- [ ] All medicines in one category
- [ ] Limit > total items

---

## Notes

1. **Performance**: The `/overview` endpoint makes 6 parallel database queries. For very large datasets, consider pagination or caching.

2. **Activity Logging**: All endpoints log admin activity for audit purposes.

3. **Branch Association**: Remember that orders are branch-associated (unlike appointments), so branch filtering works correctly.

4. **Stock Alerts**:
   - Low stock threshold: quantity < 10
   - Expiring threshold: expiry within 30 days

5. **Revenue Calculations**: Only delivered orders count towards revenue metrics.

6. **Refund Tracking**: Refunds are tracked via the Transaction model with `transaction_type: 'refund'` and `target_class: 'order'`.

---

## Support

For issues or questions, contact the backend team or refer to the main API documentation.
