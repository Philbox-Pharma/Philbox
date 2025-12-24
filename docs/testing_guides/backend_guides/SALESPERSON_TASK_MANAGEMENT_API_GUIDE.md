# Salesperson Task Management API Complete Guide

## Overview

This guide covers the Salesperson Task Management API that allows administrators (super-admin and branch-admin) to assign, track, and manage tasks for salespersons. The API includes task creation, updates, progress tracking, and comprehensive statistics.

## Base URL

```
http://localhost:3000/api/admin/salesperson-tasks
```

## Authentication

All endpoints require admin authentication via session cookies. You must be logged in as either:

- **Super Admin** (full access to all tasks across all branches)
- **Branch Admin** (access limited to tasks within their assigned branch)

---

## API Endpoints

### 1. Create Task

Assign a new task to a salesperson.

**Endpoint:** `POST /`

**Permissions:** Super-admin (any branch), Branch-admin (own branch only)

**Request Body:**

```json
{
  "salesperson_id": "60d5ec49f1b2c8b1f8e4e1a1",
  "branch_id": "60d5ec49f1b2c8b1f8e4e1a2",
  "title": "Follow up with pending orders",
  "description": "Contact customers with orders pending delivery confirmation",
  "priority": "high",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

**Validation Rules:**

- `salesperson_id`: Required, valid MongoDB ObjectId
- `branch_id`: Required, valid MongoDB ObjectId
- `title`: Required, 3-200 characters
- `description`: Optional, max 1000 characters
- `priority`: Required, one of: `low`, `medium`, `high`, `urgent`
- `deadline`: Required, must be a future date

**Success Response (201):**

```json
{
  "status": 201,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2c8b1f8e4e1a3",
      "assigned_by_admin_id": "60d5ec49f1b2c8b1f8e4e1a0",
      "assigned_by_role": "super-admin",
      "salesperson_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "branch_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "name": "Downtown Branch",
        "city": "New York"
      },
      "title": "Follow up with pending orders",
      "description": "Contact customers with orders pending delivery confirmation",
      "priority": "high",
      "status": "pending",
      "deadline": "2024-12-31T23:59:59.000Z",
      "updates": [],
      "is_deleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**

_Validation Error (400):_

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"deadline\" must be greater than \"now\""
}
```

_Salesperson Not Found (404):_

```json
{
  "status": 404,
  "message": "Salesperson not found",
  "error": "No active salesperson found with the given ID"
}
```

_Branch Mismatch (400):_

```json
{
  "status": 400,
  "message": "Salesperson does not belong to the specified branch",
  "error": "Cannot assign task - branch mismatch"
}
```

_Permission Denied (403):_

```json
{
  "status": 403,
  "message": "You do not have permission to assign tasks to this branch",
  "error": "Branch-admin can only assign tasks within their own branch"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie" \
  -d '{
    "salesperson_id": "60d5ec49f1b2c8b1f8e4e1a1",
    "branch_id": "60d5ec49f1b2c8b1f8e4e1a2",
    "title": "Follow up with pending orders",
    "description": "Contact customers with orders pending delivery confirmation",
    "priority": "high",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

---

### 2. Get All Tasks (with Filters)

Retrieve a list of tasks with optional filtering and pagination.

**Endpoint:** `GET /`

**Permissions:** Super-admin (all tasks), Branch-admin (branch-scoped tasks)

**Query Parameters:**

- `salesperson_id` (optional): Filter by salesperson ObjectId
- `branch_id` (optional): Filter by branch ObjectId
- `status` (optional): Filter by status - `pending`, `in-progress`, `completed`, `cancelled`
- `priority` (optional): Filter by priority - `low`, `medium`, `high`, `urgent`
- `startDate` (optional): Filter tasks created on or after this date (ISO 8601)
- `endDate` (optional): Filter tasks created on or before this date (ISO 8601)
- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "60d5ec49f1b2c8b1f8e4e1a3",
        "assigned_by_admin_id": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a0",
          "first_name": "Admin",
          "last_name": "User",
          "email": "admin@example.com",
          "role": "super-admin"
        },
        "assigned_by_role": "super-admin",
        "salesperson_id": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a1",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com",
          "phone_number": "+1234567890"
        },
        "branch_id": {
          "_id": "60d5ec49f1b2c8b1f8e4e1a2",
          "name": "Downtown Branch",
          "city": "New York",
          "state": "NY"
        },
        "title": "Follow up with pending orders",
        "description": "Contact customers with orders pending delivery confirmation",
        "priority": "high",
        "status": "in-progress",
        "deadline": "2024-12-31T23:59:59.000Z",
        "updates": [
          {
            "message": "Called 5 customers, 3 confirmed delivery",
            "updated_at": "2024-01-16T14:20:00.000Z",
            "_id": "60d5ec49f1b2c8b1f8e4e1a4"
          }
        ],
        "is_deleted": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"endDate\" must be greater than or equal to \"ref:startDate\""
}
```

**cURL Examples:**

_Get all tasks (first page):_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by status and priority:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks?status=in-progress&priority=high&page=1&limit=20" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Filter by salesperson and date range:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks?salesperson_id=60d5ec49f1b2c8b1f8e4e1a1&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 3. Get Task by ID

Retrieve detailed information about a specific task.

**Endpoint:** `GET /:id`

**Permissions:** Super-admin (any task), Branch-admin (tasks in their branch only)

**URL Parameters:**

- `id`: Task ObjectId

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task retrieved successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2c8b1f8e4e1a3",
      "assigned_by_admin_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a0",
        "first_name": "Admin",
        "last_name": "User",
        "email": "admin@example.com",
        "role": "super-admin"
      },
      "assigned_by_role": "super-admin",
      "salesperson_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone_number": "+1234567890",
        "branch_id": "60d5ec49f1b2c8b1f8e4e1a2"
      },
      "branch_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "name": "Downtown Branch",
        "city": "New York",
        "state": "NY",
        "address": "123 Main St"
      },
      "title": "Follow up with pending orders",
      "description": "Contact customers with orders pending delivery confirmation",
      "priority": "high",
      "status": "in-progress",
      "deadline": "2024-12-31T23:59:59.000Z",
      "updates": [
        {
          "message": "Called 5 customers, 3 confirmed delivery",
          "updated_at": "2024-01-16T14:20:00.000Z",
          "_id": "60d5ec49f1b2c8b1f8e4e1a4"
        },
        {
          "message": "Remaining 2 customers rescheduled for tomorrow",
          "updated_at": "2024-01-16T16:45:00.000Z",
          "_id": "60d5ec49f1b2c8b1f8e4e1a5"
        }
      ],
      "is_deleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T16:45:00.000Z"
    }
  }
}
```

**Error Responses:**

_Task Not Found (404):_

```json
{
  "status": 404,
  "message": "Task not found",
  "error": "No task found with the given ID"
}
```

_Permission Denied (403):_

```json
{
  "status": 403,
  "message": "You do not have permission to view this task",
  "error": "This task belongs to a different branch"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-tasks/60d5ec49f1b2c8b1f8e4e1a3 \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 4. Update Task

Update task details such as title, description, priority, deadline, or status.

**Endpoint:** `PUT /:id`

**Permissions:** Super-admin (any task), Branch-admin (tasks in their branch only)

**URL Parameters:**

- `id`: Task ObjectId

**Request Body (all fields optional, but at least one required):**

```json
{
  "title": "Updated: Follow up with VIP customers",
  "description": "Prioritize high-value customer orders",
  "priority": "urgent",
  "status": "in-progress",
  "deadline": "2024-12-25T23:59:59.000Z"
}
```

**Validation Rules:**

- `title` (optional): 3-200 characters
- `description` (optional): max 1000 characters
- `priority` (optional): one of `low`, `medium`, `high`, `urgent`
- `status` (optional): one of `pending`, `in-progress`, `completed`, `cancelled`
- `deadline` (optional): must be a future date
- At least one field must be provided

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2c8b1f8e4e1a3",
      "assigned_by_admin_id": "60d5ec49f1b2c8b1f8e4e1a0",
      "assigned_by_role": "super-admin",
      "salesperson_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "branch_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "name": "Downtown Branch",
        "city": "New York"
      },
      "title": "Updated: Follow up with VIP customers",
      "description": "Prioritize high-value customer orders",
      "priority": "urgent",
      "status": "in-progress",
      "deadline": "2024-12-25T23:59:59.000Z",
      "updates": [],
      "is_deleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-17T09:15:00.000Z"
    }
  }
}
```

**Error Responses:**

_No Fields Provided (400):_

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "At least one field must be provided for update"
}
```

_Task Not Found (404):_

```json
{
  "status": 404,
  "message": "Task not found",
  "error": "No task found with the given ID"
}
```

_Permission Denied (403):_

```json
{
  "status": 403,
  "message": "You do not have permission to update this task",
  "error": "This task belongs to a different branch"
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/admin/salesperson-tasks/60d5ec49f1b2c8b1f8e4e1a3 \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie" \
  -d '{
    "title": "Updated: Follow up with VIP customers",
    "priority": "urgent",
    "status": "in-progress"
  }'
```

---

### 5. Add Task Update (Progress Comment)

Add a progress update or comment to track task progress over time.

**Endpoint:** `POST /:id/updates`

**Permissions:** Super-admin (any task), Branch-admin (tasks in their branch only)

**URL Parameters:**

- `id`: Task ObjectId

**Request Body:**

```json
{
  "message": "Contacted 10 customers today. 8 confirmed, 2 require follow-up tomorrow."
}
```

**Validation Rules:**

- `message`: Required, 1-500 characters

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task update added successfully",
  "data": {
    "task": {
      "_id": "60d5ec49f1b2c8b1f8e4e1a3",
      "assigned_by_admin_id": "60d5ec49f1b2c8b1f8e4e1a0",
      "assigned_by_role": "super-admin",
      "salesperson_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "branch_id": {
        "_id": "60d5ec49f1b2c8b1f8e4e1a2",
        "name": "Downtown Branch",
        "city": "New York"
      },
      "title": "Follow up with pending orders",
      "description": "Contact customers with orders pending delivery confirmation",
      "priority": "high",
      "status": "in-progress",
      "deadline": "2024-12-31T23:59:59.000Z",
      "updates": [
        {
          "message": "Called 5 customers, 3 confirmed delivery",
          "updated_at": "2024-01-16T14:20:00.000Z",
          "_id": "60d5ec49f1b2c8b1f8e4e1a4"
        },
        {
          "message": "Contacted 10 customers today. 8 confirmed, 2 require follow-up tomorrow.",
          "updated_at": "2024-01-17T15:30:00.000Z",
          "_id": "60d5ec49f1b2c8b1f8e4e1a6"
        }
      ],
      "is_deleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-17T15:30:00.000Z"
    }
  }
}
```

**Error Responses:**

_Task Not Found (404):_

```json
{
  "status": 404,
  "message": "Task not found",
  "error": "No task found with the given ID"
}
```

_Permission Denied (403):_

```json
{
  "status": 403,
  "message": "You do not have permission to update this task",
  "error": "This task belongs to a different branch"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/admin/salesperson-tasks/60d5ec49f1b2c8b1f8e4e1a3/updates \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie" \
  -d '{
    "message": "Contacted 10 customers today. 8 confirmed, 2 require follow-up tomorrow."
  }'
```

---

### 6. Delete Task (Soft Delete)

Soft delete a task by marking it as deleted without removing it from the database.

**Endpoint:** `DELETE /:id`

**Permissions:** Super-admin (any task), Branch-admin (tasks in their branch only)

**URL Parameters:**

- `id`: Task ObjectId

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task deleted successfully",
  "data": null
}
```

**Error Responses:**

_Task Not Found (404):_

```json
{
  "status": 404,
  "message": "Task not found",
  "error": "No task found with the given ID"
}
```

_Permission Denied (403):_

```json
{
  "status": 403,
  "message": "You do not have permission to delete this task",
  "error": "This task belongs to a different branch"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/admin/salesperson-tasks/60d5ec49f1b2c8b1f8e4e1a3 \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

### 7. Get Task Statistics

Retrieve comprehensive statistics about tasks including counts by status, priority, overdue tasks, and more.

**Endpoint:** `GET /statistics`

**Permissions:** Super-admin (all branches), Branch-admin (their branch only)

**Query Parameters (all optional):**

- `salesperson_id`: Filter stats by specific salesperson
- `branch_id`: Filter stats by specific branch
- `startDate`: Include tasks created on or after this date
- `endDate`: Include tasks created on or before this date

**Success Response (200):**

```json
{
  "status": 200,
  "message": "Task statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalTasks": 45,
      "byStatus": {
        "pending": 12,
        "in-progress": 18,
        "completed": 13,
        "cancelled": 2
      },
      "byPriority": {
        "low": 8,
        "medium": 15,
        "high": 17,
        "urgent": 5
      },
      "overdueTasks": 6,
      "completionRate": 28.89
    }
  }
}
```

**Field Descriptions:**

- `totalTasks`: Total number of non-deleted tasks matching filters
- `byStatus`: Breakdown of tasks by current status
- `byPriority`: Breakdown of tasks by priority level
- `overdueTasks`: Count of tasks past their deadline but not completed
- `completionRate`: Percentage of tasks marked as completed (rounded to 2 decimals)

**Error Response (400):**

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"endDate\" must be greater than or equal to \"ref:startDate\""
}
```

**cURL Examples:**

_Get overall statistics:_

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-tasks/statistics \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Get statistics for specific branch:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks/statistics?branch_id=60d5ec49f1b2c8b1f8e4e1a2" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

_Get statistics for date range:_

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks/statistics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Content-Type: application/json" \
  -b "connect.sid=your-session-cookie"
```

---

## Complete Testing Workflow

### Step 1: Admin Login

```bash
# Login as super-admin
curl -X POST http://localhost:3000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "superadmin@example.com",
    "password": "yourPassword123"
  }'
```

### Step 2: Get Branch and Salesperson IDs

```bash
# Get branch list
curl -X GET http://localhost:3000/api/admin/branches \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Get salesperson list
curl -X GET http://localhost:3000/api/admin/salespersons \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Step 3: Create a Task

```bash
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "salesperson_id": "SALESPERSON_ID_HERE",
    "branch_id": "BRANCH_ID_HERE",
    "title": "Test Task - Customer Follow-up",
    "description": "Contact all customers who placed orders last week",
    "priority": "high",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

### Step 4: Retrieve All Tasks

```bash
curl -X GET "http://localhost:3000/api/admin/salesperson-tasks?page=1&limit=10" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Step 5: Update Task Status

```bash
curl -X PUT http://localhost:3000/api/admin/salesperson-tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "in-progress"
  }'
```

### Step 6: Add Progress Update

```bash
curl -X POST http://localhost:3000/api/admin/salesperson-tasks/TASK_ID_HERE/updates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "message": "Called 15 customers, 12 responded positively"
  }'
```

### Step 7: Check Statistics

```bash
curl -X GET http://localhost:3000/api/admin/salesperson-tasks/statistics \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Step 8: Complete the Task

```bash
curl -X PUT http://localhost:3000/api/admin/salesperson-tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "completed"
  }'
```

### Step 9: Delete Task (if needed)

```bash
curl -X DELETE http://localhost:3000/api/admin/salesperson-tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Use Cases

### Use Case 1: Daily Task Assignment

**Scenario:** Branch admin wants to assign daily customer follow-up tasks to salespersons.

1. Create task with today's deadline
2. Set priority based on customer value
3. Salesperson can view task in their portal
4. Track progress via updates throughout the day
5. Mark as completed at end of day

### Use Case 2: High-Priority Campaign

**Scenario:** Super-admin launches a promotional campaign requiring all branches to participate.

1. Create urgent tasks for all salespersons across branches
2. Set specific deadlines for campaign duration
3. Monitor progress via statistics endpoint
4. Filter by branch to identify underperforming teams
5. Add updates to provide guidance or feedback

### Use Case 3: Performance Tracking

**Scenario:** Admin wants to review salesperson task completion rates.

1. Use statistics endpoint with date range filters
2. Filter by specific salesperson_id to view individual performance
3. Check overdue tasks count to identify bottlenecks
4. Review completion rate percentage
5. Generate reports for management review

### Use Case 4: Task Reassignment

**Scenario:** Salesperson is unavailable, task needs to be reassigned.

1. Cancel original task
2. Create new task for different salesperson
3. Copy description and requirements from original
4. Adjust deadline if necessary
5. Log activity for audit trail

---

## Branch-Level Permission Examples

### Super-Admin (Full Access)

```bash
# Can create tasks in any branch
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "salesperson_id": "SALESPERSON_ID_BRANCH_A",
    "branch_id": "BRANCH_A_ID",
    "title": "Task in Branch A",
    "priority": "high",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'

# Can also create tasks in different branch
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "salesperson_id": "SALESPERSON_ID_BRANCH_B",
    "branch_id": "BRANCH_B_ID",
    "title": "Task in Branch B",
    "priority": "medium",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'

# Can view statistics across all branches
curl -X GET http://localhost:3000/api/admin/salesperson-tasks/statistics \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Branch-Admin (Restricted to Own Branch)

```bash
# Can only create tasks in their assigned branch
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "salesperson_id": "SALESPERSON_ID_OWN_BRANCH",
    "branch_id": "OWN_BRANCH_ID",
    "title": "Task in own branch",
    "priority": "high",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'

# Attempting to create task in different branch will fail (403)
curl -X POST http://localhost:3000/api/admin/salesperson-tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "salesperson_id": "SALESPERSON_ID_OTHER_BRANCH",
    "branch_id": "OTHER_BRANCH_ID",
    "title": "Task in other branch",
    "priority": "high",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
# Response: 403 Forbidden - "You do not have permission to assign tasks to this branch"

# Statistics are automatically filtered to own branch
curl -X GET http://localhost:3000/api/admin/salesperson-tasks/statistics \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Activity Logging

All task operations are automatically logged in the admin activity log system:

**Logged Actions:**

- `create_salesperson_task` - When a new task is created
- `update_salesperson_task` - When task details are updated
- `add_salesperson_task_update` - When progress update is added
- `delete_salesperson_task` - When task is soft deleted

**Log Entry Example:**

```json
{
  "admin_id": "60d5ec49f1b2c8b1f8e4e1a0",
  "action_type": "create_salesperson_task",
  "description": "Created task 'Follow up with pending orders' for salesperson John Doe",
  "target_collection": "salespersontasks",
  "target_id": "60d5ec49f1b2c8b1f8e4e1a3",
  "changes": {
    "salesperson_id": "60d5ec49f1b2c8b1f8e4e1a1",
    "title": "Follow up with pending orders",
    "priority": "high",
    "status": "pending",
    "deadline": "2024-12-31T23:59:59.000Z"
  },
  "ip_address": "192.168.1.100",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Common Error Scenarios

### 1. Invalid ObjectId Format

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"salesperson_id\" must be a valid ObjectId"
}
```

### 2. Past Deadline Date

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"deadline\" must be greater than \"now\""
}
```

### 3. Missing Required Fields

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"title\" is required"
}
```

### 4. Invalid Status Value

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"status\" must be one of [pending, in-progress, completed, cancelled]"
}
```

### 5. Pagination Out of Range

```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "\"page\" must be greater than or equal to 1"
}
```

### 6. Salesperson-Branch Mismatch

```json
{
  "status": 400,
  "message": "Salesperson does not belong to the specified branch",
  "error": "Cannot assign task - branch mismatch"
}
```

---

## Testing Checklist

### Functionality Tests

- [ ] Create task with all required fields
- [ ] Create task with optional description
- [ ] Retrieve task list with pagination
- [ ] Filter tasks by status
- [ ] Filter tasks by priority
- [ ] Filter tasks by date range
- [ ] Get single task by ID
- [ ] Update task title
- [ ] Update task status
- [ ] Update task priority
- [ ] Update task deadline
- [ ] Add progress update to task
- [ ] Delete task (soft delete)
- [ ] Get overall statistics
- [ ] Get statistics with filters

### Permission Tests

- [ ] Super-admin can create task in any branch
- [ ] Branch-admin can create task in own branch
- [ ] Branch-admin cannot create task in different branch
- [ ] Branch-admin can only view tasks from own branch
- [ ] Super-admin can view all tasks
- [ ] Branch-admin statistics are automatically filtered

### Validation Tests

- [ ] Deadline must be in future
- [ ] Title must be 3-200 characters
- [ ] Priority must be valid enum value
- [ ] Status must be valid enum value
- [ ] Update requires at least one field
- [ ] Progress message must be 1-500 characters
- [ ] Invalid ObjectId is rejected
- [ ] endDate must be >= startDate

### Edge Case Tests

- [ ] Create task with deadline exactly 1 minute in future
- [ ] Update task with multiple fields at once
- [ ] Add very long progress update (max 500 chars)
- [ ] Filter with empty result set
- [ ] Get statistics with no tasks
- [ ] Retrieve deleted task (should return 404)
- [ ] Update task to completed status
- [ ] Create task for inactive salesperson (should fail)

---

## Notes

1. **Session Management:** All endpoints require valid admin session. Session expires after inactivity period.

2. **Branch Scoping:** Branch-admin users automatically have their queries filtered to their assigned branch. No need to pass branch_id explicitly.

3. **Soft Delete:** Deleted tasks are marked with `is_deleted: true` but remain in database for audit purposes. They won't appear in list/retrieve endpoints.

4. **Activity Logging:** All task operations are logged with admin details, action type, and changes for compliance and audit trails.

5. **Deadline Validation:** Deadlines must always be in the future. Past dates are rejected at validation level.

6. **Pagination Limits:** Maximum 100 items per page to prevent performance issues. Default is 10 items per page.

7. **Statistics Calculation:** Completion rate is calculated as (completed tasks / total tasks) \* 100, rounded to 2 decimal places.

8. **Overdue Detection:** Tasks are considered overdue if deadline has passed and status is not 'completed' or 'cancelled'.

9. **Population:** Related entities (admin, salesperson, branch) are populated in responses with select fields to provide context.

10. **Date Handling:** All dates should be in ISO 8601 format. Timezone handling is server-side based on UTC.

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Task not found" error when task ID is correct

- **Solution:** Task may be soft-deleted. Check `is_deleted` flag or verify you have permission to view it.

**Issue:** Statistics show 0 tasks despite creating tasks

- **Solution:** Branch-admin users only see stats for their branch. Verify branch assignment.

**Issue:** Cannot create task - salesperson not found

- **Solution:** Ensure salesperson is active and not deleted. Check `is_deleted` flag on Salesperson model.

**Issue:** Permission denied errors

- **Solution:** Branch-admin can only manage tasks within their assigned branch. Contact super-admin for cross-branch operations.

**Issue:** Deadline validation failing

- **Solution:** Ensure deadline is formatted as ISO 8601 string and is in the future. Check server timezone.

---

## API Response Structure Summary

**Success Response Pattern:**

```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { ... }
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

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, business logic errors)
- `403` - Forbidden (permission denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (unexpected errors)

---

## Conclusion

This API provides comprehensive task management capabilities for administrators to assign, track, and manage salesperson tasks with proper role-based access control. All operations are logged for audit purposes, and branch-level permissions ensure data isolation for branch-admin users.

For additional support or feature requests, contact the development team.
