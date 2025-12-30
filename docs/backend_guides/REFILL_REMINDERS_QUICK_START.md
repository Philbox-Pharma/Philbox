# Quick Setup Guide - Refill Reminders Feature

## Step 1: Install Dependencies

Run the following command in the server directory:

```bash
cd server
npm install node-cron twilio
```

## Step 2: Update Environment Variables

Add these to your `server/.env` file:

```env
# Twilio Configuration (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Note**: Email is already configured. SMS requires Twilio credentials.

## Step 3: Start the Server

```bash
npm run dev
```

You should see:

```
✅ Socket.IO initialized
✅ Reminder scheduler started (runs every 5 minutes)
Server running on the port 5000
```

## Step 4: Test the API

### Get a Customer Auth Token

Login as a customer first to get the authentication token.

### Create a Test Reminder

**Using curl:**

```bash
curl -X POST http://localhost:5000/api/customer/refill-reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -d '{
    "medicines": ["VALID_MEDICINE_ID"],
    "frequency": "daily",
    "timeOfDay": "09:00",
    "notificationMethod": "email"
  }'
```

**Using Postman:**

1. Method: POST
2. URL: `http://localhost:5000/api/customer/refill-reminders`
3. Headers:
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer YOUR_CUSTOMER_TOKEN`
4. Body (raw JSON):

```json
{
  "medicines": ["VALID_MEDICINE_ID"],
  "frequency": "daily",
  "timeOfDay": "09:00",
  "notificationMethod": "email"
}
```

### Get All Reminders

```bash
curl -X GET http://localhost:5000/api/customer/refill-reminders \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

## API Endpoints Summary

| Method | Endpoint                                      | Description         |
| ------ | --------------------------------------------- | ------------------- |
| POST   | `/api/customer/refill-reminders`              | Create new reminder |
| GET    | `/api/customer/refill-reminders`              | Get all reminders   |
| GET    | `/api/customer/refill-reminders/:id`          | Get single reminder |
| PUT    | `/api/customer/refill-reminders/:id`          | Update reminder     |
| PATCH  | `/api/customer/refill-reminders/:id/complete` | Mark as completed   |
| DELETE | `/api/customer/refill-reminders/:id`          | Delete reminder     |

## Features Implemented ✅

- ✅ Create refill reminders for medicines
- ✅ Choose frequency (daily, weekly, monthly)
- ✅ Set notification time (24-hour format)
- ✅ Choose notification method (email, SMS, push)
- ✅ View list of active reminders
- ✅ Edit/Update reminders
- ✅ Delete reminders
- ✅ Mark reminders as completed
- ✅ Automated scheduling with node-cron
- ✅ Email notifications
- ✅ SMS notifications (with Twilio)
- ✅ Push notifications (placeholder)
- ✅ Activity logging

## What's Next?

The backend is complete! Next steps:

1. Build the frontend UI for reminder management
2. Integrate with the medicine catalog
3. Add push notification service (Firebase/OneSignal)
4. Test end-to-end functionality

For detailed documentation, see [REFILL_REMINDERS_API_GUIDE.md](REFILL_REMINDERS_API_GUIDE.md)
