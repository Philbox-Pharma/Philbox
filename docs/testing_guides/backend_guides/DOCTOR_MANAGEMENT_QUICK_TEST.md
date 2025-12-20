# Doctor Management Quick Test Guide

Quick reference for testing doctor management endpoints.

## Prerequisites

- Admin authentication required
- Use session cookie from admin login

## Quick Test Commands

### 1. List All Doctors

```bash
curl --location 'http://localhost:5000/api/admin/doctors?page=1&limit=10' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### 2. Search Doctors by Name

```bash
curl --location 'http://localhost:5000/api/admin/doctors?search=sarah' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### 3. Filter by Specialization

```bash
curl --location 'http://localhost:5000/api/admin/doctors?specialization=Cardiology' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### 4. Filter Active Doctors

```bash
curl --location 'http://localhost:5000/api/admin/doctors?account_status=active' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### 5. Get Doctor Details

```bash
curl --location 'http://localhost:5000/api/admin/doctors/DOCTOR_ID' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

### 6. Update Doctor Profile

```bash
curl --location --request PUT 'http://localhost:5000/api/admin/doctors/DOCTOR_ID' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "consultation_fee": 175,
  "specialization": ["Cardiology", "Internal Medicine"]
}'
```

### 7. Suspend Doctor

```bash
curl --location --request PATCH 'http://localhost:5000/api/admin/doctors/DOCTOR_ID/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "status": "suspended/freezed",
  "reason": "Multiple patient complaints",
  "sendNotification": true
}'
```

### 8. Activate Doctor

```bash
curl --location --request PATCH 'http://localhost:5000/api/admin/doctors/DOCTOR_ID/status' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE' \
--data '{
  "status": "active",
  "sendNotification": true
}'
```

### 9. Get Performance Metrics

```bash
curl --location 'http://localhost:5000/api/admin/doctors/DOCTOR_ID/metrics' \
--header 'Cookie: connect.sid=YOUR_SESSION_COOKIE'
```

## Status Codes

- ✅ `200` - Success
- ⚠️ `400` - Bad Request / Validation Error
- 🔒 `401` - Unauthorized
- ❌ `404` - Doctor Not Found
- 💥 `500` - Server Error

## Common Test Scenarios

### Scenario 1: Complete Doctor Management Flow

```bash
# 1. List all active doctors
GET /api/admin/doctors?account_status=active

# 2. Get specific doctor details
GET /api/admin/doctors/DOCTOR_ID

# 3. Update consultation fee
PUT /api/admin/doctors/DOCTOR_ID
Body: { "consultation_fee": 200 }

# 4. Suspend doctor
PATCH /api/admin/doctors/DOCTOR_ID/status
Body: { "status": "suspended/freezed", "reason": "Under investigation" }

# 5. Reactivate doctor
PATCH /api/admin/doctors/DOCTOR_ID/status
Body: { "status": "active" }
```

### Scenario 2: Search and Filter

```bash
# Search by name
GET /api/admin/doctors?search=john

# Filter by specialization
GET /api/admin/doctors?specialization=Pediatrics

# Combined filters
GET /api/admin/doctors?specialization=Cardiology&account_status=active&sortBy=averageRating&sortOrder=desc
```

## Expected Responses

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Notes

- Replace `DOCTOR_ID` with actual MongoDB ObjectId
- Replace `YOUR_SESSION_COOKIE` with actual session cookie from login
- All timestamps in ISO 8601 format (UTC)
- Email notifications sent for status changes

## Troubleshooting

- **401 Unauthorized**: Login first and get session cookie
- **404 Not Found**: Check if doctor ID exists
- **400 Bad Request**: Check request body format and required fields
- **500 Server Error**: Check server logs for details
