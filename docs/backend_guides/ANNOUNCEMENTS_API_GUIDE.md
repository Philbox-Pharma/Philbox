# Admin Announcements Feature

## Overview

The Admin Announcements feature allows administrators to create, schedule, and send announcements to different user groups (customers, doctors, salespersons, or all) using multiple delivery methods (email, SMS, push, in-app).

## Features

- ✅ Create announcements with title and message
- ✅ Target specific audience or all users
- ✅ Select multiple delivery methods (email, SMS, push, in-app)
- ✅ Schedule announcements for future delivery
- ✅ Preview announcements before sending
- ✅ View announcement history
- ✅ Track delivery status and statistics
- ✅ Automatic scheduled announcement delivery via cron scheduler
- ✅ Cancel or delete announcements (draft and scheduled only)

## API Endpoints

### Base URL
```
/api/admin/announcements
```

### 1. Create Announcement
**POST** `/api/admin/announcements`

Create a new announcement (defaults to draft status).

**Request Body:**
```json
{
  "title": "System Maintenance Notice",
  "message": "We will be performing scheduled system maintenance on Sunday from 2-4 AM. Services will be temporarily unavailable during this period.",
  "target_audience": "all",
  "delivery_methods": ["email", "in-app"],
  "scheduled_at": "2024-12-15T10:00:00Z",
  "notes": "Important maintenance update"
}
```

**Parameters:**
- `title` (string, required): Announcement title (3-200 characters)
- `message` (string, required): Announcement message (10-5000 characters)
- `target_audience` (string, required): One of: `all`, `customers`, `doctors`, `salespersons`
- `delivery_methods` (array, required): One or more of: `email`, `sms`, `push`, `in-app`
- `scheduled_at` (date, required): Future date/time when announcement should be sent
- `notes` (string, optional): Admin notes about the announcement

**Response:**
```json
{
  "success": true,
  "message": "Announcement created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "System Maintenance Notice",
    "message": "...",
    "target_audience": "all",
    "delivery_methods": ["email", "in-app"],
    "scheduled_at": "2024-12-15T10:00:00Z",
    "status": "draft",
    "created_by": "507f1f77bcf86cd799439012",
    "delivery_status": {
      "total_recipients": 0,
      "sent": 0,
      "failed": 0,
      "pending": 0
    },
    "created_at": "2024-12-14T11:00:00Z"
  }
}
```

### 2. Get All Announcements
**GET** `/api/admin/announcements?status=draft&target_audience=customers&skip=0&limit=20`

Retrieve announcements with optional filters.

**Query Parameters:**
- `status` (string, optional): Filter by status - `draft`, `scheduled`, `sent`, `failed`, `cancelled`
- `target_audience` (string, optional): Filter by audience - `all`, `customers`, `doctors`, `salespersons`
- `skip` (number, optional): Number of records to skip (default: 0)
- `limit` (number, optional): Number of records to return (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Announcements retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "System Maintenance Notice",
      "message": "...",
      "target_audience": "all",
      "status": "scheduled",
      "scheduled_at": "2024-12-15T10:00:00Z",
      "created_by": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Admin Name",
        "email": "admin@philbox.com"
      },
      "delivery_status": {
        "total_recipients": 0,
        "sent": 0
      }
    }
  ],
  "pagination": {
    "total": 45,
    "skip": 0,
    "limit": 20,
    "pages": 3
  }
}
```

### 3. Get Announcement by ID
**GET** `/api/admin/announcements/:id`

Retrieve a specific announcement with full details.

**Response:**
```json
{
  "success": true,
  "message": "Announcement retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "System Maintenance Notice",
    "message": "...",
    "target_audience": "all",
    "delivery_methods": ["email", "in-app"],
    "status": "scheduled",
    "scheduled_at": "2024-12-15T10:00:00Z",
    "created_by": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Admin Name",
      "email": "admin@philbox.com"
    },
    "delivery_status": {
      "total_recipients": 0,
      "sent": 0,
      "failed": 0,
      "pending": 0,
      "by_method": {
        "email": { "sent": 0, "failed": 0, "pending": 0 },
        "in-app": { "sent": 0, "failed": 0, "pending": 0 }
      }
    }
  }
}
```

### 4. Update Announcement
**PUT** `/api/admin/announcements/:id`

Update an announcement (only draft announcements can be updated).

**Request Body:**
```json
{
  "title": "Updated Title",
  "message": "Updated message content",
  "scheduled_at": "2024-12-16T10:00:00Z"
}
```

**Note:** Pass only the fields you want to update. All fields except status are updatable for draft announcements.

**Response:**
```json
{
  "success": true,
  "message": "Announcement updated successfully",
  "data": { ... }
}
```

### 5. Send Announcement
**POST** `/api/admin/announcements/:id/send`

Send an announcement immediately or trigger sending of scheduled announcements.

**Request Body (optional):**
```json
{
  "send_immediately": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Announcement sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "sent",
    "sent_at": "2024-12-15T10:00:00Z",
    "delivery_status": {
      "total_recipients": 5432,
      "sent": 5400,
      "failed": 32,
      "pending": 0,
      "by_method": {
        "email": { "sent": 5400, "failed": 32, "pending": 0 },
        "in-app": { "sent": 5400, "failed": 0, "pending": 0 }
      }
    }
  },
  "delivery_results": {
    "email": { "sent": 5400, "failed": 32 },
    "in-app": { "sent": 5400, "failed": 0 },
    "sms": { "sent": 0, "failed": 0 },
    "push": { "sent": 0, "failed": 0 }
  }
}
```

### 6. Get Delivery History
**GET** `/api/admin/announcements/:id/delivery-history`

Get detailed delivery status for an announcement.

**Response:**
```json
{
  "success": true,
  "message": "Delivery history retrieved successfully",
  "data": {
    "announcement": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "System Maintenance Notice",
      "status": "sent",
      "sent_at": "2024-12-15T10:00:00Z"
    },
    "delivery_status": {
      "total_recipients": 5432,
      "sent": 5400,
      "failed": 32,
      "pending": 0,
      "by_method": {
        "email": { "sent": 5400, "failed": 32, "pending": 0 },
        "in-app": { "sent": 5400, "failed": 0, "pending": 0 }
      }
    },
    "sent_at": "2024-12-15T10:00:00Z"
  }
}
```

### 7. Cancel Announcement
**POST** `/api/admin/announcements/:id/cancel`

Cancel a scheduled or draft announcement.

**Response:**
```json
{
  "success": true,
  "message": "Announcement cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "cancelled"
  }
}
```

### 8. Delete Announcement
**DELETE** `/api/admin/announcements/:id`

Delete an announcement (only draft and cancelled announcements can be deleted).

**Response:**
```json
{
  "success": true,
  "message": "Announcement deleted successfully"
}
```

## Announcement Status Workflow

```
Draft
  ↓
[Scheduled via scheduled_at]
  ↓
Scheduled
  ↓
[Auto-send at scheduled_at or manual send]
  ↓
Sent (with delivery statistics)
  ├→ Failed (if sending fails)

Or:
Draft/Scheduled → Cancelled → (can be deleted)
Draft → (can be deleted)
```

## Delivery Methods

### Email
- Uses Brevo email service
- Sends HTML formatted emails with announcement title and message
- Tracks sent/failed delivery

### In-App Notifications
- Uses Socket.IO to emit real-time notifications
- Recipients see notifications in notification center
- Instant delivery to online users

### SMS
- Currently a placeholder (requires SMS service integration like Twilio)
- Will be marked as pending until service integration

### Push Notifications
- Currently a placeholder (requires push notification service integration)
- Will be marked as pending until service integration

## Automatic Scheduling

The announcement scheduler runs every minute and:

1. Checks for announcements with `status: 'scheduled'` and `scheduled_at <= now`
2. Automatically sends these announcements
3. Updates status to 'sent' with delivery statistics
4. On failure, marks status as 'failed' and logs error

**Location:** `utils/announcementScheduler.js`

## Recipient Selection

Recipients are determined by `target_audience`:

- **`all`**: All active customers, doctors, and salespersons
- **`customers`**: Only active customers (account_status: 'active')
- **`doctors`**: Only active doctors (account_status: 'active')
- **`salespersons`**: Only active salespersons (account_status: 'active')

Only users with `account_status: 'active'` receive announcements.

## Admin Activity Logging

All announcement operations are logged in `AdminActivityLog`:

- Create announcement
- Update announcement
- Send announcement
- Cancel announcement
- Delete announcement

## Error Handling

### Status Codes

- **201**: Announcement created successfully
- **200**: Operation successful (retrieve, update, send, cancel, delete)
- **400**: Invalid request (e.g., updating sent announcement, invalid data)
- **404**: Announcement not found
- **500**: Server error

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Can only update draft announcements" | Trying to update scheduled/sent announcement | Create new announcement or cancel old one |
| "Cannot send sent announcements" | Trying to resend already sent announcement | Create new announcement with same content |
| "No active recipients found" | No users match the target audience filter | Check user account status |
| "Cannot delete sent announcements" | Trying to delete sent announcement | Sent announcements cannot be deleted |

## Model Schema

```javascript
{
  title: String,                            // Required
  message: String,                          // Required
  target_audience: String,                  // 'all'|'customers'|'doctors'|'salespersons'
  delivery_methods: [String],               // ['email','sms','push','in-app']
  scheduled_at: Date,                       // Required, future date
  sent_at: Date,                            // Set when status changes to 'sent'
  status: String,                           // 'draft'|'scheduled'|'sent'|'failed'|'cancelled'
  created_by: ObjectId,                     // Reference to Admin
  delivery_status: {
    total_recipients: Number,
    sent: Number,
    failed: Number,
    pending: Number,
    by_method: {
      email: { sent, failed, pending },
      sms: { sent, failed, pending },
      push: { sent, failed, pending },
      'in-app': { sent, failed, pending }
    }
  },
  notes: String,                            // Optional admin notes
  created_at: Date,                         // Auto-generated
  updated_at: Date                          // Auto-generated
}
```

## Implementation Checklist

✅ Announcement Model
✅ Service with CRUD operations
✅ Controller with HTTP handlers
✅ Routes and DTOs with validation
✅ Email delivery via Brevo
✅ In-app notifications via Socket.IO
✅ Automatic scheduler for scheduled announcements
✅ Admin activity logging
✅ Delivery status tracking
✅ Error handling and validation

## TODO: Future Enhancements

- [ ] SMS service integration (Twilio/AWS SNS)
- [ ] Push notification service integration
- [ ] Analytics dashboard for announcement performance
- [ ] Recipient list preview
- [ ] HTML editor for rich message formatting
- [ ] Announcement templates
- [ ] Recurring announcements
- [ ] A/B testing for announcements
- [ ] Announcement search
- [ ] Bulk announcement management

## Example Usage Flow

### Example 1: Create and Send Announcement Immediately

```javascript
// 1. Create announcement with scheduled_at = now + 1 min
POST /api/admin/announcements
{
  "title": "Welcome Back!",
  "message": "We've added new features...",
  "target_audience": "customers",
  "delivery_methods": ["email", "in-app"],
  "scheduled_at": "2024-12-15T10:01:00Z"
}

// 2. Wait for scheduler or manually trigger send
POST /api/admin/announcements/{id}/send
```

### Example 2: Draft → Review → Schedule → Send

```javascript
// 1. Create as draft
POST /api/admin/announcements
{
  "title": "Maintenance Alert",
  "message": "...",
  "target_audience": "all",
  "delivery_methods": ["email", "in-app", "push"],
  "scheduled_at": "2024-12-20T02:00:00Z"
}

// 2. Review and update if needed
PUT /api/admin/announcements/{id}
{
  "message": "Updated message..."
}

// 3. Announcement status changes to 'scheduled' when scheduled_at is in future
// 4. Scheduler automatically sends at scheduled_at time
// 5. Check delivery history
GET /api/admin/announcements/{id}/delivery-history
```

## Environment Variables Required

No additional environment variables needed beyond existing setup. Uses:
- `BREVO_API_KEY` for email delivery
- `EMAIL_NAME` for sender name
- Socket.IO instance for in-app notifications

---

**Last Updated:** December 2024
**Feature Status:** Production Ready
