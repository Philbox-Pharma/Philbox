# Salesperson Performance Analytics API Complete Guide

## Overview

This guide covers the Salesperson Performance Analytics API that provides comprehensive insights into salesperson productivity and task completion rates. The API enables administrators to evaluate and track salesperson performance through task-related metrics and visualizations.

**Note:** This API focuses exclusively on task performance metrics. Order and revenue data are tracked separately in the Orders Analytics API.

## Base URL

```
http://localhost:3000/api/admin/salesperson-performance
```

## Authentication

All endpoints require admin authentication via session cookies. You must be logged in as either:

- **Super Admin** (access to all branches)
- **Branch Admin** (access limited to their managed branches - can manage multiple branches)

---

## API Endpoints

### 1. Get Performance Overview

Provides a comprehensive snapshot of overall task performance metrics and active salespersons.

**Endpoint:** `GET /overview`

**Permissions:** Super-admin (all branches), Branch-admin (all managed branches from `branches_managed` array)

**Query Parameters (all optional):**

- `branch_id`: Filter by specific branch (MongoDB ObjectId)
- `startDate`: Filter data from this date onwards (ISO 8601 format)
- `endDate`: Filter data up to this date (ISO 8601 format)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Performance overview retrieved successfully",
  "data": {
    "overview": {
      "tasks": {
        "totalTasks": 150,
        "completedTasks": 95,
        "pendingTasks": 30,
        "inProgressTasks": 20,
        "overdueTasks": 5,
        "completionRate": 63.33
      },
      "activeSalespersons": 12
    }
  }
}
```

**Field Descriptions:**

- `tasks.totalTasks`: Total number of non-deleted tasks
- `tasks.completedTasks`: Number of completed tasks
- `tasks.pendingTasks`: Number of pending tasks
- `tasks.inProgressTasks`: Number of in-progress tasks
- `tasks.overdueTasks`: Tasks past deadline but not completed
- `tasks.completionRate`: Percentage of completed tasks (rounded to 2 decimals)
- `activeSalespersons`: Count of non-deleted salespersons

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Failed to retrieve performance overview",
  "error": "Invalid date format"
}
```

**cURL Examples:**

_Get overall overview:_

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-performance/overview \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by branch:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/overview?branch_id=60d5ec49f1b2c8b1f8e4e1a2" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by date range:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/overview?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 2. Get Tasks Completion Statistics

Shows completed vs assigned tasks per salesperson with completion rates.

**Endpoint:** `GET /tasks-completion`

**Permissions:** Super-admin (all branches), Branch-admin (all managed branches from `branches_managed` array)

**Query Parameters (all optional):**

- `branch_id`: Filter by specific branch (MongoDB ObjectId)
- `salesperson_id`: Filter by specific salesperson (MongoDB ObjectId)
- `startDate`: Filter tasks created from this date (ISO 8601 format)
- `endDate`: Filter tasks created up to this date (ISO 8601 format)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Tasks completion statistics retrieved successfully",
  "data": {
    "stats": [
      {
        "salesperson_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "salesperson": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a1",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        },
        "branch": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a2",
          "name": "Downtown Branch",
          "city": "New York"
        },
        "totalAssigned": 25,
        "completed": 18,
        "pending": 3,
        "inProgress": 3,
        "cancelled": 1,
        "completionRate": 72.0
      },
      {
        "salesperson_id": "60d5ec49f1b2c8b1f8e4e1b1",
        "salesperson": {
          "_id": "60d5ec49f1b2c8b1f8e4e1b1",
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane.smith@example.com"
        },
        "branch": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a2",
          "name": "Downtown Branch",
          "city": "New York"
        },
        "totalAssigned": 30,
        "completed": 25,
        "pending": 2,
        "inProgress": 2,
        "cancelled": 1,
        "completionRate": 83.33
      }
    ]
  }
}
```

**Use Case - Bar/Pie Chart Data:**
This endpoint provides perfect data for visualizing:

- **Bar Chart**: X-axis = Salesperson names, Y-axis = Task counts (completed vs total)
- **Pie Chart**: Show distribution of task statuses for individual salespersons

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"salesperson_id\" must be a valid MongoDB ObjectId"
}
```

**cURL Examples:**

_Get all salespersons' stats:_

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-performance/tasks-completion \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by specific salesperson:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/tasks-completion?salesperson_id=60d5ec49f1b2c8b1f8e4e1a1" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by branch and date range:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/tasks-completion?branch_id=60d5ec49f1b2c8b1f8e4e1a2&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 3. Get Salesperson Leaderboard

Ranks salespersons by task completion performance.

**Endpoint:** `GET /leaderboard`

**Permissions:** Super-admin (all branches), Branch-admin (all managed branches from `branches_managed` array)

**Query Parameters (all optional):**

- `branch_id`: Filter by specific branch (MongoDB ObjectId)
- `startDate`: Filter tasks from this date (ISO 8601 format)
- `endDate`: Filter tasks up to this date (ISO 8601 format)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Salesperson leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "salesperson_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "salesperson": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a1",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com",
          "phone_number": "+1234567890"
        },
        "branch": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a2",
          "name": "Downtown Branch",
          "city": "New York",
          "state": "NY"
        },
        "totalTasks": 85,
        "completedTasks": 72,
        "pendingTasks": 8,
        "inProgressTasks": 5,
        "completionRate": 84.71
      },
      {
        "rank": 2,
        "salesperson_id": "60d5ec49f1b2c8b1f8e4e1b1",
        "salesperson": {
          "_id": "60d5ec49f1b2c8b1f8e4e1b1",
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane.smith@example.com",
          "phone_number": "+1234567891"
        },
        "branch": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a2",
          "name": "Downtown Branch",
          "city": "New York",
          "state": "NY"
        },
        "totalTasks": 78,
        "completedTasks": 65,
        "pendingTasks": 7,
        "inProgressTasks": 6,
        "completionRate": 83.33
      },
      {
        "rank": 3,
        "salesperson_id": "60d5ec49f1b2c8b1f8e4e1c1",
        "salesperson": {
          "_id": "60d5ec49f1b2c8b1f8e4e1c1",
          "first_name": "Bob",
          "last_name": "Johnson",
          "email": "bob.johnson@example.com",
          "phone_number": "+1234567892"
        },
        "branch": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a3",
          "name": "Uptown Branch",
          "city": "Los Angeles",
          "state": "CA"
        },
        "totalTasks": 72,
        "completedTasks": 58,
        "pendingTasks": 9,
        "inProgressTasks": 5,
        "completionRate": 80.56
      }
    ]
  }
}
```

**Use Case - Leaderboard Component:**
This endpoint provides ranked data perfect for:

- **Leaderboard Table**: Display rank, name, completed tasks, completion rate
- **Top Performers**: Highlight top 3 or top 5 salespersons
- **Branch Comparison**: Compare task performance across branches

**Sorting:**

- Primary sort: Completed tasks (descending)
- Secondary sort: Completion rate (descending)

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"endDate\" must be greater than or equal to startDate"
}
```

**cURL Examples:**

_Get full leaderboard:_

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-performance/leaderboard \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by specific branch:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?branch_id=60d5ec49f1b2c8b1f8e4e1a2" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Monthly leaderboard (January 2024):_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 4. Get Task Performance Trends

Shows task creation and status distribution over time, grouped by date.

**Endpoint:** `GET /trends`

**Permissions:** Super-admin (all branches), Branch-admin (all managed branches from `branches_managed` array)

**Query Parameters (all optional):**

- `branch_id`: Filter by specific branch (MongoDB ObjectId)
- `salesperson_id`: Filter by specific salesperson (MongoDB ObjectId)
- `startDate`: Filter tasks created from this date (ISO 8601 format)
- `endDate`: Filter tasks created up to this date (ISO 8601 format)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task performance trends retrieved successfully",
  "data": {
    "trends": [
      {
        "date": "2024-01-15",
        "totalTasks": 12,
        "completed": 8,
        "pending": 2,
        "inProgress": 2,
        "cancelled": 0
      },
      {
        "date": "2024-01-16",
        "totalTasks": 15,
        "completed": 10,
        "pending": 3,
        "inProgress": 1,
        "cancelled": 1
      },
      {
        "date": "2024-01-17",
        "totalTasks": 18,
        "completed": 12,
        "pending": 4,
        "inProgress": 2,
        "cancelled": 0
      },
      {
        "date": "2024-01-18",
        "totalTasks": 14,
        "completed": 9,
        "pending": 3,
        "inProgress": 2,
        "cancelled": 0
      }
    ]
  }
}
```

**Use Case - Line Chart Data:**
This endpoint provides time-series data perfect for:

- **Line Chart**: X-axis = Dates, Y-axis = Task counts
- **Multi-line Chart**: Show trends for each status (completed, pending, in-progress)
- **Area Chart**: Visualize stacked task statuses over time
- **Trend Analysis**: Identify patterns in task creation and completion

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Failed to retrieve task performance trends",
  "error": "Invalid date range"
}
```

**cURL Examples:**

_Get trends for last 30 days:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/trends?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Get trends for specific salesperson:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/trends?salesperson_id=60d5ec49f1b2c8b1f8e4e1a1&startDate=2024-01-01" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Get branch-specific trends:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/trends?branch_id=60d5ec49f1b2c8b1f8e4e1a2" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 5. Get Average Completion Time by Priority

Shows average time taken to complete tasks based on their priority level.

**Endpoint:** `GET /completion-time`

**Permissions:** Super-admin (all branches), Branch-admin (all managed branches from `branches_managed` array)

**Query Parameters (all optional):**

- `branch_id`: Filter by specific branch (MongoDB ObjectId)
- `salesperson_id`: Filter by specific salesperson (MongoDB ObjectId)
- `startDate`: Filter completed tasks from this date (ISO 8601 format)
- `endDate`: Filter completed tasks up to this date (ISO 8601 format)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Average completion time by priority retrieved successfully",
  "data": {
    "completionTimes": [
      {
        "priority": "low",
        "averageCompletionTimeHours": 168.5,
        "averageCompletionTimeDays": 7.02,
        "totalTasks": 15,
        "minCompletionTimeHours": 48.0,
        "maxCompletionTimeHours": 336.0
      },
      {
        "priority": "medium",
        "averageCompletionTimeHours": 96.25,
        "averageCompletionTimeDays": 4.01,
        "totalTasks": 28,
        "minCompletionTimeHours": 24.0,
        "maxCompletionTimeHours": 192.0
      },
      {
        "priority": "high",
        "averageCompletionTimeHours": 48.75,
        "averageCompletionTimeDays": 2.03,
        "totalTasks": 35,
        "minCompletionTimeHours": 12.0,
        "maxCompletionTimeHours": 96.0
      },
      {
        "priority": "urgent",
        "averageCompletionTimeHours": 18.5,
        "averageCompletionTimeDays": 0.77,
        "totalTasks": 12,
        "minCompletionTimeHours": 4.0,
        "maxCompletionTimeHours": 48.0
      }
    ]
  }
}
```

**Field Descriptions:**

- `priority`: Task priority level (low, medium, high, urgent)
- `averageCompletionTimeHours`: Mean time to complete in hours (rounded to 2 decimals)
- `averageCompletionTimeDays`: Mean time to complete in days (rounded to 2 decimals)
- `totalTasks`: Number of completed tasks for this priority
- `minCompletionTimeHours`: Fastest completion time for this priority
- `maxCompletionTimeHours`: Slowest completion time for this priority

**Use Case - Bar Chart Data:**
This endpoint provides data perfect for:

- **Bar Chart**: X-axis = Priority levels, Y-axis = Average completion time
- **Comparison Chart**: Compare completion times across priorities
- **Performance Metrics**: Identify if urgent tasks are being handled faster
- **SLA Tracking**: Monitor if tasks are completed within expected timeframes

**Note:** All priorities are returned even if no tasks exist (will show 0 values).

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Failed to retrieve average completion time",
  "error": "Invalid date format"
}
```

**cURL Examples:**

_Get completion times for all priorities:_

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-performance/completion-time \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by specific salesperson:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/completion-time?salesperson_id=60d5ec49f1b2c8b1f8e4e1a1" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by date range (Q1 2024):_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/completion-time?startDate=2024-01-01&endDate=2024-03-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

## Complete Testing Workflow

### Step 1: Admin Login

```bash
# Login as super-admin or branch-admin
curl -X POST http://localhost:3000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "superadmin@example.com",
    "password": "yourPassword123"
  }'
```

### Step 2: Get Performance Overview

```bash
# Get overall performance snapshot
curl -X GET http://localhost:3000/api/admin/salesperson-performance/overview \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Output:**

- Total tasks, completion rate, overdue count
- Total orders, revenue, average order value
- Active salespersons count

### Step 3: View Tasks Completion Stats

```bash
# See how each salesperson is performing on tasks
curl -X GET http://localhost:3000/api/admin/salesperson-performance/tasks-completion \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Output:**

- Per-salesperson breakdown of assigned vs completed tasks
- Completion rate percentage for each salesperson
- Sorted by completion rate (highest first)

### Step 4: Check Leaderboard

```bash
# See top performers by revenue
curl -X GET http://localhost:3000/api/admin/salesperson-performance/leaderboard \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Output:**

- Ranked list of salespersons
- Total orders and revenue per salesperson
- Average order value
- Branch information

### Step 5: Analyze Trends

```bash
# View task trends for last 30 days
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/trends?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Output:**

- Daily breakdown of task creation and completion
- Status distribution per date
- Time-series data for trend analysis

### Step 6: Check Completion Times

```bash
# See average time to complete tasks by priority
curl -X GET http://localhost:3000/api/admin/salesperson-performance/completion-time \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Expected Output:**

- Average hours/days to complete for each priority
- Min and max completion times
- Total tasks completed per priority

### Step 7: Filter by Branch (Branch-Admin Context)

```bash
# Branch-admin automatically sees data from all their managed branches
curl -X GET http://localhost:3000/api/admin/salesperson-performance/overview \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Step 8: Filter by Date Range (Monthly Report)

```bash
# Get January 2024 performance
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Use Cases & Chart Mappings

### Use Case 1: Tasks Completed vs Assigned (Bar/Pie Chart)

**Endpoint:** `GET /tasks-completion`

**Bar Chart Implementation:**

```javascript
// X-axis: Salesperson names
// Y-axis: Task counts
// Data series: [Completed, Pending, In-Progress, Cancelled]

const chartData = stats.map((s) => ({
  name: `${s.salesperson.first_name} ${s.salesperson.last_name}`,
  completed: s.completed,
  pending: s.pending,
  inProgress: s.inProgress,
  cancelled: s.cancelled,
  total: s.totalAssigned,
}));
```

**Pie Chart Implementation (Individual Salesperson):**

```javascript
// Show status distribution for one salesperson
const pieData = [
  { name: "Completed", value: stats[0].completed },
  { name: "Pending", value: stats[0].pending },
  { name: "In Progress", value: stats[0].inProgress },
  { name: "Cancelled", value: stats[0].cancelled },
];
```

### Use Case 2: Salesperson Leaderboard (Ranked by Task Completion)

**Endpoint:** `GET /leaderboard`

**Leaderboard Table Implementation:**

```javascript
// Display ranked table with medals for top 3
leaderboard.forEach((entry) => {
  console.log(
    `${entry.rank}. ${entry.salesperson.first_name} ${entry.salesperson.last_name}`,
  );
  console.log(
    `   Completed: ${entry.completedTasks}/${entry.totalTasks} | Rate: ${entry.completionRate}%`,
  );
});
```

**Task Completion Bar Chart:**

```javascript
// Compare task completion across salespersons
const taskChart = leaderboard.map((entry) => ({
  name: `${entry.salesperson.first_name} ${entry.salesperson.last_name}`,
  completedTasks: entry.completedTasks,
  totalTasks: entry.totalTasks,
  completionRate: entry.completionRate,
}));
```

### Use Case 3: Task Performance Over Time (Line Chart)

**Endpoint:** `GET /trends`

**Line Chart Implementation:**

```javascript
// Time-series visualization
const lineChartData = {
  labels: trends.map((t) => t.date),
  datasets: [
    {
      label: "Completed",
      data: trends.map((t) => t.completed),
      borderColor: "green",
    },
    {
      label: "In Progress",
      data: trends.map((t) => t.inProgress),
      borderColor: "blue",
    },
    {
      label: "Pending",
      data: trends.map((t) => t.pending),
      borderColor: "orange",
    },
  ],
};
```

### Use Case 4: Average Task Completion Time by Priority (Bar Chart)

**Endpoint:** `GET /completion-time`

**Bar Chart Implementation:**

```javascript
// Compare completion times across priorities
const completionChart = completionTimes.map((ct) => ({
  priority: ct.priority.toUpperCase(),
  hours: ct.averageCompletionTimeHours,
  days: ct.averageCompletionTimeDays,
  taskCount: ct.totalTasks,
}));

// Sort by priority level (urgent -> high -> medium -> low)
completionChart.reverse();
```

### Use Case 5: Filter by Branch, Date Range

**All Endpoints Support:**

```bash
# Filter by branch
?branch_id=60d5ec49f1b2c8b1f8e4e1a2

# Filter by date range
?startDate=2024-01-01&endDate=2024-01-31

# Combine filters
?branch_id=60d5ec49f1b2c8b1f8e4e1a2&startDate=2024-01-01&endDate=2024-01-31
```

### Use Case 6: Export to PDF

**Recommended Approach:**

1. Fetch all required data from endpoints
2. Use frontend PDF library (jsPDF, pdfmake, or react-pdf)
3. Generate PDF with charts and tables
4. Include filters, date ranges in PDF header

**Data Collection for PDF:**

```javascript
// Fetch all performance data
const overview = await fetch("/api/admin/salesperson-performance/overview?...");
const tasksCompletion = await fetch(
  "/api/admin/salesperson-performance/tasks-completion?...",
);
const leaderboard = await fetch(
  "/api/admin/salesperson-performance/leaderboard?...",
);
const trends = await fetch("/api/admin/salesperson-performance/trends?...");
const completionTime = await fetch(
  "/api/admin/salesperson-performance/completion-time?...",
);

// Generate PDF with all data and charts
generatePDF({
  overview: overview.data,
  tasksCompletion: tasksCompletion.data,
  leaderboard: leaderboard.data,
  trends: trends.data,
  completionTime: completionTime.data,
  filters: { branch, startDate, endDate },
});
```

---

## Branch-Level Permission Examples

### Super-Admin (Full Access)

```bash
# Can view all branches
curl -X GET http://localhost:3000/api/admin/salesperson-performance/overview \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Can filter by specific branch
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?branch_id=BRANCH_A_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Can view another branch
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?branch_id=BRANCH_B_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Branch-Admin (Restricted to Managed Branches)

```bash
# Automatically filtered to all managed branches from branches_managed array
curl -X GET http://localhost:3000/api/admin/salesperson-performance/overview \
  -H "Content-Type: application/json" \
  -b cookies.txt
# Returns data for all branches the admin manages (e.g., branches A, B, C)

# Can further filter by one of their managed branches
curl -X GET "http://localhost:3000/api/admin/salesperson-performance/leaderboard?branch_id=MANAGED_BRANCH_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt
# Returns data only for the specified branch (if it's in their branches_managed array)
```

---

## Common Error Scenarios

### 1. Invalid ObjectId Format

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"salesperson_id\" must be a valid MongoDB ObjectId"
}
```

### 2. Invalid Date Format

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"startDate\" must be in ISO 8601 format"
}
```

### 3. End Date Before Start Date

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"endDate\" must be greater than or equal to startDate"
}
```

### 4. No Data Found

```json
{
  "status": 200,
  "message": "Tasks completion statistics retrieved successfully",
  "data": {
    "stats": []
  }
}
```

### 5. Unauthenticated Request

```json
{
  "status": 401,
  "message": "Unauthorized",
  "error": "No valid session found"
}
```

---

## Testing Checklist

### Functionality Tests

- [ ] Get performance overview with no filters
- [ ] Get performance overview with branch filter
- [ ] Get performance overview with date range
- [ ] Get tasks completion stats for all salespersons
- [ ] Get tasks completion stats for specific salesperson
- [ ] Get leaderboard with no filters
- [ ] Get leaderboard for specific branch
- [ ] Get leaderboard for date range
- [ ] Get task trends with no filters
- [ ] Get task trends for specific salesperson
- [ ] Get task trends with date range
- [ ] Get completion time by priority
- [ ] Get completion time for specific branch

### Permission Tests

- [ ] Super-admin can view all branches' data
- [ ] Branch-admin sees data from all their managed branches
- [ ] Branch-admin's managed branches filter is automatically applied
- [ ] Super-admin can filter by any branch
- [ ] Branch-admin can filter by one of their managed branches
- [ ] Branch-admin cannot see data from branches they don't manage

### Validation Tests

- [ ] Invalid branch_id is rejected
- [ ] Invalid salesperson_id is rejected
- [ ] Invalid startDate format is rejected
- [ ] Invalid endDate format is rejected
- [ ] endDate before startDate is rejected

### Edge Case Tests

- [ ] No tasks exist for date range (returns empty array)
- [ ] No salespersons assigned to branch (returns empty)
- [ ] Very large date range (performance check)
- [ ] Future date range (returns empty)
- [ ] Single day date range (startDate = endDate)

### Data Accuracy Tests

- [ ] Completion rate calculation is correct
- [ ] Task counts match by status
- [ ] Leaderboard ranking is correct (by completed tasks)
- [ ] Completion time is in correct units (hours/days)
- [ ] Overdue tasks count is accurate

---

## Performance Considerations

### Optimization Tips

1. **Use Date Range Filters:**
   - Always specify date ranges for better query performance
   - Avoid fetching entire historical data unless necessary

2. **Branch Filtering:**
   - Filter by branch when possible to reduce dataset size
   - Branch-admin queries are automatically optimized

3. **Caching Recommendations:**
   - Cache overview data (5-10 minutes)
   - Cache leaderboard data (15-30 minutes)
   - Cache trends data daily (can be pre-generated)
   - Completion time stats can be cached hourly

4. **Query Optimization:**
   - Indexes on: `branch_id`, `salesperson_id`, `createdAt`, `status`
   - Compound index on: `(branch_id, salesperson_id, createdAt)`

5. **Pagination:**
   - Currently not paginated (returns all results)
   - For very large datasets, consider adding pagination

---

## Dashboard Integration Examples

### Dashboard Layout Recommendation

**Section 1: Overview Cards (Top)**

- Use `GET /overview` endpoint
- Display 3 cards: Total Tasks, Completion Rate, Active Salespersons

**Section 2: Leaderboard (Left)**

- Use `GET /leaderboard` endpoint
- Show top 5 or top 10 salespersons
- Display rank, name, completed tasks, completion rate

**Section 3: Tasks Completion Chart (Center)**

- Use `GET /tasks-completion` endpoint
- Bar chart showing completed vs assigned per salesperson

**Section 4: Trends Chart (Center-Bottom)**

- Use `GET /trends` endpoint
- Line chart showing task completion trends over time

**Section 5: Completion Time Chart (Right)**

- Use `GET /completion-time` endpoint
- Bar chart showing average completion time by priority

**Filters (Top Bar)**

- Branch dropdown (super-admin only)
- Date range picker (start/end date)
- Salesperson dropdown (optional)
- Export to PDF button

---

## Notes

1. **Session Management:** All endpoints require valid admin session. Session expires after inactivity.

2. **Branch Scoping:** Branch-admin users have automatic branch filtering applied. Cannot be overridden.

3. **Date Filtering:** All dates are in ISO 8601 format (YYYY-MM-DD or full timestamp).

4. **Revenue Calculation:** Only includes completed orders with assigned salesperson.

5. **Task Completion Time:** Calculated as time between task creation (`createdAt`) and last update (`updatedAt`) when status changed to completed.

6. **Leaderboard Ranking:** Sorted first by total revenue (descending), then by total orders (descending).

7. **Trends Grouping:** Tasks are grouped by date of creation, not completion.

8. **All Priorities Included:** Completion time endpoint returns all 4 priorities even if no tasks exist (shows 0).

9. **Empty Results:** Endpoints return empty arrays when no data matches filters, not errors.

10. **Data Consistency:** Ensure tasks have valid salesperson_id and branch_id for accurate statistics.

---

## Support & Troubleshooting

### Common Issues

**Issue:** Leaderboard shows no salespersons

- **Solution:** Ensure tasks exist with valid `salesperson_id` and match the filter criteria

**Issue:** Completion rate is 0% despite completed tasks

- **Solution:** Check that tasks have `status: 'completed'`, not 'complete' or other variants

**Issue:** Trends show no data for recent dates

- **Solution:** Tasks are grouped by `createdAt`, not `updatedAt`. Check task creation dates.

**Issue:** Branch-admin sees data from other branches

- **Solution:** Verify admin's `branches_managed` array is correctly populated in the Admin model. Branch-admins will see data from ALL branches in this array.

**Issue:** Completion time shows 0 for all priorities

- **Solution:** Ensure tasks exist with `status: 'completed'` and valid date range

---

## API Response Structure Summary

**Success Response Pattern:**

```json
{
  "status": 200,
  "message": "Operation successful",
  "data": {
    "keyName": { ... }
  }
}
```

**Error Response Pattern:**

```json
{
  "status": 400,
  "message": "Error type",
  "error": "Detailed error message"
}
```

**Status Codes Used:**

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no valid session)
- `500` - Internal Server Error

---

## Activity Logging

All performance analytics endpoints automatically log admin activity for audit and compliance purposes.

**Logged Actions:**

- `view_tasks_completion_stats` - When tasks completion statistics are viewed
- `view_salesperson_leaderboard` - When leaderboard is accessed
- `view_task_performance_trends` - When performance trends are viewed
- `view_completion_time_by_priority` - When completion time analysis is accessed
- `view_performance_overview` - When performance overview is retrieved

**Log Entry Details:**

```json
{
  "admin_id": "60d5ec49f1b2c8b1f8e4e1a0",
  "action_type": "view_performance_overview",
  "description": "Viewed performance overview (150 tasks, 12 salespersons)",
  "target_collection": "salespersontasks",
  "target_id": null,
  "changes": {
    "filters": {
      "branch_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  },
  "ip_address": "192.168.1.100",
  "device_info": "Mozilla/5.0...",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Benefits:**

- Track which admins are viewing performance data
- Audit trail for compliance requirements
- Monitor filter usage patterns
- Identify peak usage times

---

## Conclusion

This API provides comprehensive analytics for evaluating salesperson performance through task completion metrics and trend analysis. All endpoints support branch-level filtering and date range queries, with automatic branch scoping for branch-admin users.

**Key Features:**

- Task-focused performance metrics
- Completion rate tracking
- Leaderboard rankings by task performance
- Time-series trend analysis
- Priority-based completion time analysis
- Automatic activity logging
- Branch-level access control with support for multiple branches per admin

The data returned is optimized for visualization in various chart types (bar, pie, line) and can be easily exported to PDF format for reporting purposes.

**Note:** For order and revenue analytics, refer to the Orders Analytics API documentation.

For additional features or support, contact the development team.
