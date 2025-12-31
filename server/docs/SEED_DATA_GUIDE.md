# Database Seed Script Documentation

## Overview

Comprehensive database seeding script that populates all 35+ models with realistic test data including proper relationships and referential integrity.

## 🚀 Quick Start

### Prerequisites

- MongoDB connection configured in `.env` file
- Node.js and npm installed
- All dependencies installed (`npm install`)

### Running the Script

```bash
npm run seed:data
```

## ⚠️ Important Notes

### Data Destruction Warning

**This script will DELETE ALL existing data in your database before seeding new data.**

Make sure you:

- Are NOT running this on a production database
- Have backed up any important data
- Are using a development/testing database

### Environment Variables Required

Ensure your `.env` file contains:

```env
MONGODB_URI=your_mongodb_connection_string
```

## 📊 Seeded Data Summary

The script seeds the following models in dependency order:

### 1. Foundation Data (No Dependencies)

- **Roles**: 5 roles (super_admin, branch_admin, doctor, salesperson, customer)
- **Permissions**: 12 permissions (users, orders, inventory with CRUD operations)
- **Currencies**: 2 currencies (PKR, USD)
- **Addresses**: 5 addresses across major Pakistani cities

### 2. User Data

- **Admins**: 3 admins (1 super admin, 2 branch admins)
- **Customers**: 3 customers with verified accounts
- **Doctors**: 2 doctors with complete profiles and credentials
- **Salespersons**: 2 salespersons assigned to branches

### 3. Infrastructure

- **Branches**: 2 branches (Lahore Main, Karachi DHA) with assigned staff

### 4. Inventory System

- **Manufacturers**: 4 pharmaceutical manufacturers
- **Item Classes**: 5 medicine classes (Tablet, Capsule, Syrup, Injection, Ointment)
- **Medicine Items**: 5 medicines with pricing and availability
- **Medicine Batches**: 5 batches with expiry dates
- **Stock Records**: 5 stock-in-hand records

### 5. Business Operations

- **Appointments**: 3 appointments (2 completed, 1 scheduled)
- **Orders**: 3 orders with various statuses
- **Order Items**: 4 order items linked to medicines
- **Transactions**: 5 transactions (2 appointment payments, 3 order payments)

### 6. Customer Engagement

- **Reviews**: 3 reviews (2 doctor reviews, 1 order review)
- **Feedbacks**: 2 general feedback entries
- **Complaints**: 1 open complaint

### 7. Additional Features

- **Refill Reminders**: 2 active medication reminders
- **Search History**: 3 customer search records
- **Salesperson Tasks**: 2 tasks assigned by admins
- **Appointment Messages**: 3 doctor-patient messages

### 8. Activity Logs

- **Admin Activity Logs**: 2 records
- **Doctor Activity Logs**: 2 records
- **Customer Activity Logs**: 2 records
- **Salesperson Activity Logs**: 2 records

### 9. Analytics

- **Daily Appointments Analytics**: 1 record
- **Appointments Analytics History**: 1 record
- **Medicine Sales Analytics**: 2 records
- **Branch Performance Summary**: 2 records

### 10. File Management

- **Uploaded Inventory Files**: 2 file upload records
- **Inventory Files Log**: 1 file processing log

### 11. Doctor Onboarding

- **Doctor Documents**: 2 document sets (CNIC, licenses, degrees)
- **Doctor Applications**: 2 approved applications

## 🔐 Test Credentials

### Admin Accounts

| Role                   | Email                     | Password     |
| ---------------------- | ------------------------- | ------------ |
| Super Admin            | superadmin@philbox.com    | Password123! |
| Branch Admin (Lahore)  | admin.lahore@philbox.com  | Password123! |
| Branch Admin (Karachi) | admin.karachi@philbox.com | Password123! |

### Doctor Accounts

| Name               | Email                | Password     | Specialization                |
| ------------------ | -------------------- | ------------ | ----------------------------- |
| Dr. Sarah Ahmed    | dr.sarah@philbox.com | Password123! | Cardiology, Internal Medicine |
| Dr. Muhammad Bilal | dr.bilal@philbox.com | Password123! | Dermatology                   |

### Customer Accounts

| Name         | Email                  | Password     |
| ------------ | ---------------------- | ------------ |
| Ahmed Hassan | ahmed.hassan@gmail.com | Password123! |
| Fatima Ali   | fatima.ali@gmail.com   | Password123! |
| Usman Khan   | usman.khan@gmail.com   | Password123! |

### Salesperson Accounts

| Name        | Email                   | Password     | Branch  |
| ----------- | ----------------------- | ------------ | ------- |
| Ali Raza    | ali.raza@philbox.com    | Password123! | Lahore  |
| Ayesha Khan | ayesha.khan@philbox.com | Password123! | Karachi |

## 🏗️ Data Relationships

### User-Branch Relationships

- **Lahore Branch**:
  - Admin: Branch Admin Lahore
  - Salesperson: Ali Raza
  - Medicine Items: Panadol, Augmentin, Brufen

- **Karachi Branch**:
  - Admin: Branch Admin Karachi
  - Salesperson: Ayesha Khan
  - Medicine Items: Amoxil Syrup, Lipitor

### Order-Customer Relationships

- **Ahmed Hassan**: 2 completed orders (medicines + appointment)
- **Fatima Ali**: 1 processing order
- **Usman Khan**: 1 delivered order

### Appointment-Doctor Relationships

- **Dr. Sarah Ahmed**: 2 appointments (1 completed, 1 scheduled)
- **Dr. Muhammad Bilal**: 1 completed appointment

## 🔄 Dependency Order

The script follows this insertion order to maintain referential integrity:

1. Foundation (Roles, Permissions, Currencies)
2. Addresses
3. Users (Admins, Customers, Doctors, Salespersons)
4. Branches
5. Manufacturers & Item Classes
6. Medicine Items
7. Medicine Batches & Stock
8. Appointments
9. Transactions (for appointments)
10. Orders & Order Items
11. Transactions (for orders)
12. Reviews, Feedback, Complaints
13. Additional Features (Reminders, Search, Tasks, Messages)
14. Activity Logs
15. Analytics
16. File Management
17. Doctor Documents & Applications

## 🧪 Testing Use Cases

### E-commerce Flow

1. Browse medicines as customer (ahmed.hassan@gmail.com)
2. Search for medicine (check SearchHistory)
3. Place order (creates Order, OrderItem, Transaction)
4. Track order status
5. Leave review after delivery

### Appointment Flow

1. Book appointment as customer with Dr. Sarah
2. Doctor views appointment
3. Conduct online consultation
4. Exchange messages (AppointmentMessage)
5. Complete appointment and process payment
6. Customer leaves review

### Admin Management

1. Login as super admin
2. View branch performance analytics
3. Create and assign tasks to salespersons
4. Review doctor applications
5. Check activity logs

### Salesperson Tasks

1. Login as salesperson
2. View assigned tasks
3. Update inventory (upload files)
4. Process orders for branch
5. Update stock levels

## 📝 Modification Guide

### Adding More Records

To add more seed data, edit [seedData.js](../scripts/seedData.js):

```javascript
// Example: Adding more customers
const customers = await Customer.insertMany([
  // ... existing customers
  {
    fullName: 'New Customer',
    email: 'new.customer@gmail.com',
    passwordHash: hashedPassword,
    address_id: addresses[0]._id,
    is_Verified: true,
    roleId: roles[4]._id,
  },
]);
```

### Changing Default Password

Update the password hash generation:

```javascript
const hashedPassword = await bcrypt.hash('YourNewPassword', 10);
```

### Adding Custom Data

Follow the pattern of:

1. Check dependencies (what ObjectIds are needed)
2. Insert data using `Model.insertMany([...])`
3. Store returned documents if needed for references
4. Update related documents if necessary

## 🐛 Troubleshooting

### Connection Issues

**Error**: `MongoDB connection error`

- Check MONGODB_URI in .env file
- Ensure MongoDB server is running
- Verify network connectivity

### Validation Errors

**Error**: `Validation failed`

- Check required fields are provided
- Verify enum values match model definitions
- Ensure ObjectId references exist

### Duplicate Key Errors

**Error**: `E11000 duplicate key error`

- Script should clear database first
- Check if clearDatabase() is running
- Verify unique constraints in models

### Memory Issues

**Error**: `JavaScript heap out of memory`

- Reduce batch sizes in insertMany calls
- Process data in smaller chunks
- Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096 npm run seed:data`

## 📊 Console Output

The script provides detailed progress output:

```
✅ MongoDB connected successfully

🗑️  Clearing existing data...
✅ Database cleared

🌱 Starting data seeding...

📦 Seeding foundation data...
  ✓ Created 5 roles
  ✓ Created 12 permissions
  ✓ Created 2 currencies

📍 Seeding addresses...
  ✓ Created 5 addresses

👥 Seeding users...
  ✓ Created 3 admins
  ✓ Created 3 customers
  ✓ Created 2 doctors
  ✓ Created 2 salespersons

[... more output ...]

✅ Data seeding completed successfully!

============================================================
SUMMARY:
============================================================
✓ Roles: 5
✓ Permissions: 12
✓ Currencies: 2
[... complete summary ...]
============================================================

💡 Test Credentials:
  Super Admin: superadmin@philbox.com / Password123!
  [... all credentials ...]
============================================================

🎉 All operations completed successfully!
```

## 🔒 Security Notes

1. **Never run this script on production databases**
2. **Change default passwords in production**
3. **Use strong passwords and proper hashing**
4. **Restrict access to seed script execution**
5. **Remove or secure test credentials before deployment**

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Seed Test Database
  run: npm run seed:data
  env:
    MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}
```

### Docker Compose

```yaml
services:
  mongodb:
    image: mongo:latest
    # ... mongo config

  app:
    # ... app config
    command: |
      npm install
      npm run seed:data
      npm start
```

## 📚 Related Documentation

- [Backend API Guide](../docs/backend_guides/README.md)
- [Database Models](../models/)
- [Environment Setup](../README.md)

## 🤝 Contributing

When adding new models:

1. Import the model at the top of seedData.js
2. Add seed data in appropriate dependency order
3. Update this documentation
4. Add to summary output
5. Test the complete seeding process

---

**Last Updated**: February 2024
**Script Version**: 1.0.0
**Compatibility**: Node.js 18+, MongoDB 6+
