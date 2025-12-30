# Refill Reminders Feature - Backend Implementation

## Overview

The Refill Reminders feature allows customers to set up automated reminders for medicine refills to ensure they never run out of their medications.

## Features Implemented ✅

### 1. Database Model

- **File**: [server/src/models/RefillReminder.js](server/src/models/RefillReminder.js)
- Fields:
  - `medicines`: Array of medicine IDs (references MedicineItem)
  - `patient_id`: Customer/patient ID
  - `frequency`: daily, weekly, or monthly
  - `timeOfDay`: 24-hour format (HH:MM)
  - `notificationMethod`: email, SMS, or push
  - `isActive`: Boolean flag
  - `lastNotificationSent`: Timestamp
  - `nextNotificationDate`: Calculated next notification date
  - Auto timestamps: `createdAt`, `updatedAt`

### 2. API Endpoints

All endpoints require authentication (Customer only)

#### Create Reminder

- **POST** `/api/customer/refill-reminders`
- **Body**:

```json
{
  "medicines": ["medicineId1", "medicineId2"],
  "frequency": "daily",
  "timeOfDay": "08:00",
  "notificationMethod": "email"
}
```

#### Get All Reminders

- **GET** `/api/customer/refill-reminders`
- **Query Params**:
  - `isActive` (optional): true/false
  - `page` (optional): page number
  - `limit` (optional): items per page

#### Get Single Reminder

- **GET** `/api/customer/refill-reminders/:id`

#### Update Reminder

- **PUT** `/api/customer/refill-reminders/:id`
- **Body** (all fields optional):

```json
{
  "medicines": ["medicineId1"],
  "frequency": "weekly",
  "timeOfDay": "18:30",
  "notificationMethod": "sms",
  "isActive": true
}
```

#### Mark as Completed

- **PATCH** `/api/customer/refill-reminders/:id/complete`
- **Body**:

```json
{
  "isActive": false
}
```

#### Delete Reminder

- **DELETE** `/api/customer/refill-reminders/:id`

### 3. Notification Service

- **File**: [server/src/utils/notificationService.js](server/src/utils/notificationService.js)
- Supports:
  - ✅ **Email** (using Nodemailer)
  - ✅ **SMS** (using Twilio)
  - ⚠️ **Push** (placeholder - needs implementation)

### 4. Automated Scheduler

- **File**: [server/src/utils/reminderScheduler.js](server/src/utils/reminderScheduler.js)
- Uses `node-cron` to check reminders every 5 minutes
- Automatically sends notifications at scheduled times
- Updates `nextNotificationDate` after each notification

### 5. Service Layer

- **File**: [server/src/modules/customer/features/refill_reminder/service/refillReminder.service.js](server/src/modules/customer/features/refill_reminder/service/refillReminder.service.js)
- Business logic for CRUD operations
- Automatic calculation of next notification dates
- Validation of medicine IDs
- Activity logging

### 6. Validation (DTO)

- **File**: [server/src/dto/customer/refillReminder.dto.js](server/src/dto/customer/refillReminder.dto.js)
- Joi validation schemas for:
  - Create reminder
  - Update reminder
  - Mark as completed

## Installation & Setup

### 1. Install Required Dependencies

```bash
cd server
npm install node-cron twilio
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (already configured)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 3. Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate an App Password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

### 4. Twilio Setup (Optional - for SMS)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Add credentials to `.env`

## Testing the Feature

### 1. Start the Server

```bash
cd server
npm run dev
```

You should see:

```
✅ Socket.IO initialized
✅ Reminder scheduler started (runs every 5 minutes)
Server running on the port 5000
```

### 2. Test API Endpoints

#### Create a Reminder

```bash
curl -X POST http://localhost:5000/api/customer/refill-reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "medicines": ["MEDICINE_ID"],
    "frequency": "daily",
    "timeOfDay": "09:00",
    "notificationMethod": "email"
  }'
```

#### Get All Reminders

```bash
curl -X GET http://localhost:5000/api/customer/refill-reminders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a Reminder

```bash
curl -X PUT http://localhost:5000/api/customer/refill-reminders/REMINDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "timeOfDay": "18:00",
    "frequency": "weekly"
  }'
```

### 3. Test Notification Manually

You can manually trigger the scheduler for testing:

Add this endpoint to test notifications immediately (optional):

```javascript
// In server.js or a test route
app.get("/api/test/trigger-reminders", async (req, res) => {
  await reminderScheduler.triggerNow();
  res.json({ message: "Reminders triggered" });
});
```

## How It Works

### Notification Flow

1. Customer creates a reminder with specific time and frequency
2. System calculates `nextNotificationDate`
3. Cron job runs every 5 minutes checking for due reminders
4. When `nextNotificationDate` <= current time:
   - Sends notification via chosen method (email/SMS/push)
   - Updates `lastNotificationSent`
   - Calculates new `nextNotificationDate` based on frequency

### Frequency Calculation

- **Daily**: Next day at same time
- **Weekly**: 7 days later at same time
- **Monthly**: Next month same day at same time

### Activity Logging

All reminder actions are logged:

- `create_reminder`
- `update_reminder`
- `delete_reminder`
- `complete_reminder`

## File Structure

```
server/src/
├── models/
│   └── RefillReminder.js                    ✅ Database model
├── modules/customer/features/refill_reminder/
│   ├── controllers/
│   │   └── refillReminder.controller.js     ✅ HTTP handlers
│   ├── routes/
│   │   └── refillReminder.routes.js         ✅ API routes
│   └── service/
│       └── refillReminder.service.js        ✅ Business logic
├── dto/customer/
│   └── refillReminder.dto.js                ✅ Validation schemas
├── utils/
│   ├── notificationService.js               ✅ Email/SMS/Push service
│   └── reminderScheduler.js                 ✅ Cron job scheduler
└── server.js                                ✅ Updated with routes & scheduler
```

## Next Steps for Frontend Integration

1. **Create Reminder Form**
   - Medicine selector (multi-select)
   - Frequency dropdown (daily/weekly/monthly)
   - Time picker (24-hour format)
   - Notification method selector

2. **Reminders List Page**
   - Display active reminders
   - Show next notification time
   - Edit/Delete actions
   - Mark as completed button

3. **Notification Preferences**
   - Allow users to update notification method
   - Snooze/Pause reminders temporarily

## Troubleshooting

### Notifications Not Sending

1. Check scheduler is running: Look for "✅ Reminder scheduler started" in logs
2. Verify email credentials in `.env`
3. Check Twilio credentials if using SMS
4. Ensure `nextNotificationDate` is set correctly

### Time Zone Issues

- All times are stored in UTC
- Convert to user's local time in frontend
- Server calculates next notification in UTC

### Cron Job Not Running

- Check for errors in console
- Verify `node-cron` is installed
- Test manually using `reminderScheduler.triggerNow()`

## Additional Notes

- Push notifications require additional setup (Firebase, OneSignal, etc.)
- SMS requires Twilio paid account (trial has limitations)
- Email is free with Gmail
- Scheduler runs every 5 minutes by default (can be adjusted in [server/src/utils/reminderScheduler.js](server/src/utils/reminderScheduler.js#L18))

## Support

For issues or questions, check the logs or refer to:

- [Node-cron documentation](https://www.npmjs.com/package/node-cron)
- [Twilio documentation](https://www.twilio.com/docs)
- [Nodemailer documentation](https://nodemailer.com/)
