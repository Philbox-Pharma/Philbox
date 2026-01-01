import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all models
import Role from '../main/models/Role.js';
import Permission from '../main/models/Permission.js';
import Currency from '../main/models/Currency.js';
import Address from '../main/models/Address.js';
import Admin from '../main/models/Admin.js';
import Customer from '../main/models/Customer.js';
import Doctor from '../main/models/Doctor.js';
import Salesperson from '../main/models/Salesperson.js';
import Branch from '../main/models/Branch.js';
import Manufacturer from '../main/models/Manufacturer.js';
import ItemClass from '../main/models/ItemClass.js';
import MedicineItem from '../main/models/MedicineItem.js';
import MedicineBatch from '../main/models/MedicineBatch.js';
import StockInHand from '../main/models/StockInHand.js';
import Appointment from '../main/models/Appointment.js';
import Order from '../main/models/Order.js';
import OrderItem from '../main/models/OrderItem.js';
import Transaction from '../main/models/Transaction.js';
import Review from '../main/models/Review.js';
import Feedback from '../main/models/Feedback.js';
import Complaint from '../main/models/Complaint.js';
import RefillReminder from '../main/models/RefillReminder.js';
import SearchHistory from '../main/models/SearchHistory.js';
import SalespersonTask from '../main/models/SalespersonTask.js';
import AppointmentMessage from '../main/models/AppointmentMessage.js';
import AdminActivityLog from '../main/models/AdminActivityLog.js';
import DoctorActivityLog from '../main/models/DoctorActivityLog.js';
import CustomerActivityLog from '../main/models/CustomerActivityLog.js';
import SalespersonActivityLog from '../main/models/SalespersonActivityLog.js';
import DailyAppointmentsAnalytics from '../main/models/DailyAppointmentsAnalytics.js';
import AppointmentsAnalyticsHistory from '../main/models/AppointmentsAnalyticsHistory.js';
import MedicineSalesAnalytics from '../main/models/MedicineSalesAnalytics.js';
import BranchPerformanceSummary from '../main/models/BranchPerformanceSummary.js';
import InventoryFilesLog from '../main/models/InventoryFilesLog.js';
import UploadedInventoryFile from '../main/models/UploadedInventoryFile.js';
import DoctorApplication from '../main/models/DoctorApplication.js';
import DoctorDocuments from '../main/models/DoctorDocuments.js';
import DoctorSlot from '../main/models/DoctorSlot.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Roles and Permissions
const seedRolesAndPermissions = async () => {
  console.log('🔐 Seeding roles and permissions...');

  // Define all permissions by resource and action
  const permissionsList = [
    // User Management Permissions
    { resource: 'users', action: 'create', description: 'Create users' },
    { resource: 'users', action: 'read', description: 'Read users' },
    { resource: 'users', action: 'update', description: 'Update users' },
    { resource: 'users', action: 'delete', description: 'Delete users' },

    // Branch Management Permissions
    { resource: 'branches', action: 'create', description: 'Create branches' },
    { resource: 'branches', action: 'read', description: 'Read branches' },
    { resource: 'branches', action: 'update', description: 'Update branches' },
    { resource: 'branches', action: 'delete', description: 'Delete branches' },

    // Doctor Management Permissions
    { resource: 'doctors', action: 'create', description: 'Create doctors' },
    { resource: 'doctors', action: 'read', description: 'Read doctors' },
    { resource: 'doctors', action: 'update', description: 'Update doctors' },
    { resource: 'doctors', action: 'delete', description: 'Delete doctors' },

    // Customer Management Permissions
    {
      resource: 'customers',
      action: 'create',
      description: 'Create customers',
    },
    { resource: 'customers', action: 'read', description: 'Read customers' },
    {
      resource: 'customers',
      action: 'update',
      description: 'Update customers',
    },
    {
      resource: 'customers',
      action: 'delete',
      description: 'Delete customers',
    },

    // Salesperson Management Permissions
    {
      resource: 'salespersons',
      action: 'create',
      description: 'Create salespersons',
    },
    {
      resource: 'salespersons',
      action: 'read',
      description: 'Read salespersons',
    },
    {
      resource: 'salespersons',
      action: 'update',
      description: 'Update salespersons',
    },
    {
      resource: 'salespersons',
      action: 'delete',
      description: 'Delete salespersons',
    },

    // Appointment Permissions
    {
      resource: 'appointments',
      action: 'create',
      description: 'Create appointments',
    },
    {
      resource: 'appointments',
      action: 'read',
      description: 'Read appointments',
    },
    {
      resource: 'appointments',
      action: 'update',
      description: 'Update appointments',
    },
    {
      resource: 'appointments',
      action: 'delete',
      description: 'Delete appointments',
    },

    // Prescription Permissions
    {
      resource: 'prescriptions',
      action: 'create',
      description: 'Create prescriptions',
    },
    {
      resource: 'prescriptions',
      action: 'read',
      description: 'Read prescriptions',
    },
    {
      resource: 'prescriptions',
      action: 'update',
      description: 'Update prescriptions',
    },
    {
      resource: 'prescriptions',
      action: 'delete',
      description: 'Delete prescriptions',
    },

    // Reports Permissions
    { resource: 'reports', action: 'create', description: 'Create reports' },
    { resource: 'reports', action: 'read', description: 'Read reports' },
    { resource: 'reports', action: 'update', description: 'Update reports' },
    { resource: 'reports', action: 'delete', description: 'Delete reports' },

    // Inventory Permissions
    {
      resource: 'inventory',
      action: 'create',
      description: 'Create inventory',
    },
    { resource: 'inventory', action: 'read', description: 'Read inventory' },
    {
      resource: 'inventory',
      action: 'update',
      description: 'Update inventory',
    },
    {
      resource: 'inventory',
      action: 'delete',
      description: 'Delete inventory',
    },

    // Order Permissions
    { resource: 'orders', action: 'create', description: 'Create orders' },
    { resource: 'orders', action: 'read', description: 'Read orders' },
    { resource: 'orders', action: 'update', description: 'Update orders' },
    { resource: 'orders', action: 'delete', description: 'Delete orders' },
  ];

  // Create permissions
  const permissions = {};
  for (const permData of permissionsList) {
    const permissionName = `${permData.action}_${permData.resource}`;
    const permission = await Permission.findOneAndUpdate(
      { resource: permData.resource, action: permData.action },
      { name: permissionName, ...permData },
      { upsert: true, new: true }
    );
    permissions[permissionName] = permission._id;
  }
  console.log(
    '  ✓ Created/updated',
    Object.keys(permissions).length,
    'permissions'
  );

  // Define roles with their permissions
  const rolesConfig = [
    {
      name: 'super_admin',
      description: 'Super Administrator - Full system access',
      permissions: Object.values(permissions),
    },
    {
      name: 'branch_admin',
      description: 'Branch Administrator - Manage branch operations',
      permissions: [
        permissions['read_branches'],
        permissions['update_branches'],
        permissions['create_users'],
        permissions['read_users'],
        permissions['update_users'],
        permissions['read_doctors'],
        permissions['update_doctors'],
        permissions['read_customers'],
        permissions['update_customers'],
        permissions['read_salespersons'],
        permissions['update_salespersons'],
        permissions['read_appointments'],
        permissions['update_appointments'],
        permissions['read_reports'],
        permissions['read_inventory'],
        permissions['update_inventory'],
        permissions['read_orders'],
        permissions['update_orders'],
      ].filter(Boolean),
    },
    {
      name: 'salesperson',
      description: 'Salesperson - Handle inventory and orders',
      permissions: [
        permissions['create_inventory'],
        permissions['read_inventory'],
        permissions['update_inventory'],
        permissions['delete_inventory'],
        permissions['read_orders'],
        permissions['update_orders'],
        permissions['read_prescriptions'],
        permissions['update_prescriptions'],
        permissions['read_customers'],
        permissions['read_appointments'],
        permissions['read_reports'],
      ].filter(Boolean),
    },
    {
      name: 'doctor',
      description: 'Doctor - Manage consultations and appointments',
      permissions: [
        permissions['read_appointments'],
        permissions['update_appointments'],
        permissions['create_appointments'],
        permissions['create_prescriptions'],
        permissions['read_prescriptions'],
        permissions['update_prescriptions'],
        permissions['read_customers'],
        permissions['read_reports'],
      ].filter(Boolean),
    },
    {
      name: 'customer',
      description: 'Customer - Browse, order, and book appointments',
      permissions: [
        permissions['read_inventory'],
        permissions['create_orders'],
        permissions['read_orders'],
        permissions['update_orders'],
        permissions['create_appointments'],
        permissions['read_appointments'],
        permissions['update_appointments'],
        permissions['read_prescriptions'],
        permissions['update_prescriptions'],
        permissions['read_reports'],
      ].filter(Boolean),
    },
  ];

  // Create/update roles
  const createdRoles = [];
  for (const roleConfig of rolesConfig) {
    const role = await Role.findOneAndUpdate(
      { name: roleConfig.name },
      roleConfig,
      { upsert: true, new: true }
    );
    createdRoles.push(role);
  }
  console.log('  ✓ Created/updated 5 roles\n');

  return createdRoles;
};

// Seed Super Admin
const seedSuperAdmin = async superAdminRole => {
  console.log('👑 Seeding super admin...');

  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@philbox.com';
  const rawPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  // Check if super admin already exists
  const existing = await Admin.findOne({ category: 'super-admin' });
  if (existing) {
    console.log('  ⚠️  Super admin already exists:', existing.email);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const superAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    category: 'super-admin',
    branches_managed: [],
    roleId: superAdminRole._id,
    is_Verified: true,
  });

  console.log('  ✓ Super admin created:', email);
  console.log('  ✓ Password:', rawPassword, '\n');

  return superAdmin;
};

// Clear all collections
const clearDatabase = async () => {
  console.log('\n🗑️  Clearing existing data...');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  console.log('✅ Database cleared');
};

// Seed data
const seedData = async () => {
  try {
    console.log('\n🌱 Starting data seeding...\n');

    // ==================== 1. ROLES & PERMISSIONS ====================
    const roles = await seedRolesAndPermissions();
    const superAdminRole = roles.find(r => r.name === 'super_admin');
    const branchAdminRole = roles.find(r => r.name === 'branch_admin');
    const doctorRole = roles.find(r => r.name === 'doctor');
    const salespersonRole = roles.find(r => r.name === 'salesperson');
    const customerRole = roles.find(r => r.name === 'customer');

    // ==================== 2. SUPER ADMIN ====================

    const superAdmin = await seedSuperAdmin(superAdminRole);

    // ==================== 3. FOUNDATION DATA ====================
    console.log('📦 Seeding foundation data...');

    // Currencies
    const currencies = await Currency.insertMany([
      { code: 'PKR' },
      { code: 'USD' },
    ]);
    console.log('  ✓ Created 2 currencies');

    // ==================== 2. ADDRESSES ====================
    console.log('\n📍 Seeding addresses...');
    const addresses = await Address.insertMany([
      {
        street: '123 Main Street',
        town: 'Gulberg',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
        google_map_link: 'https://maps.google.com/?q=123+Main+St+Lahore',
      },
      {
        street: '456 Park Avenue',
        town: 'DHA Phase 5',
        city: 'Karachi',
        province: 'Sindh',
        country: 'Pakistan',
        google_map_link: 'https://maps.google.com/?q=456+Park+Ave+Karachi',
      },
      {
        street: '789 Garden Road',
        town: 'F-7',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        country: 'Pakistan',
        google_map_link: 'https://maps.google.com/?q=789+Garden+Rd+Islamabad',
      },
      {
        street: '321 University Road',
        town: 'Saddar',
        city: 'Peshawar',
        province: 'Khyber Pakhtunkhwa',
        country: 'Pakistan',
        google_map_link:
          'https://maps.google.com/?q=321+University+Rd+Peshawar',
      },
      {
        street: '654 Mall Road',
        town: 'Cantt',
        city: 'Rawalpindi',
        province: 'Punjab',
        country: 'Pakistan',
        google_map_link: 'https://maps.google.com/?q=654+Mall+Rd+Rawalpindi',
      },
    ]);
    console.log('  ✓ Created 5 addresses');

    // ==================== 3. USERS ====================
    console.log('\n👥 Seeding users...');

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Admins (branch admins, super admin already created)
    const admins = await Admin.insertMany([
      {
        name: 'Branch Admin Lahore',
        email: 'admin.lahore@philbox.com',
        password: hashedPassword,
        category: 'branch-admin',
        branches_managed: [],
        roleId: branchAdminRole._id,
        is_Verified: true,
      },
      {
        name: 'Branch Admin Karachi',
        email: 'admin.karachi@philbox.com',
        password: hashedPassword,
        category: 'branch-admin',
        branches_managed: [],
        roleId: branchAdminRole._id,
        is_Verified: true,
      },
    ]);
    console.log(
      '  ✓ Created 2 branch admins (+ 1 super admin already created)'
    );

    // Customers
    const customers = await Customer.insertMany([
      {
        fullName: 'Ahmed Hassan',
        email: 'ahmed.hassan@gmail.com',
        passwordHash: hashedPassword,
        address_id: addresses[0]._id,
        is_Verified: true,
        roleId: customerRole._id,
      },
      {
        fullName: 'Fatima Ali',
        email: 'fatima.ali@gmail.com',
        passwordHash: hashedPassword,
        address_id: addresses[1]._id,
        is_Verified: true,
        roleId: customerRole._id,
      },
      {
        fullName: 'Usman Khan',
        email: 'usman.khan@gmail.com',
        passwordHash: hashedPassword,
        address_id: addresses[2]._id,
        is_Verified: true,
        roleId: customerRole._id,
      },
    ]);
    console.log('  ✓ Created 3 customers');

    // Doctors
    const doctors = await Doctor.insertMany([
      {
        fullName: 'Dr. Sarah Ahmed',
        email: 'dr.sarah@philbox.com',
        gender: 'Female',
        dateOfBirth: new Date('1985-05-15'),
        contactNumber: '+92-300-1234567',
        passwordHash: hashedPassword,
        educational_details: [
          {
            degree: 'MBBS',
            institution: 'King Edward Medical University',
            yearOfCompletion: 2008,
            specialization: 'Medicine',
          },
        ],
        specialization: ['Cardiology', 'Internal Medicine'],
        experience_details: [
          {
            institution: 'Lahore General Hospital',
            starting_date: new Date('2010-01-01'),
            ending_date: new Date('2015-12-31'),
            is_going_on: false,
          },
        ],
        license_number: 'PMC-12345',
        consultation_type: 'both',
        consultation_fee: 2000,
        account_status: 'active',
        onboarding_status: 'completed',
        roleId: doctorRole._id,
        is_Verified: true,
        averageRating: 4.5,
      },
      {
        fullName: 'Dr. Muhammad Bilal',
        email: 'dr.bilal@philbox.com',
        gender: 'Male',
        dateOfBirth: new Date('1988-08-20'),
        contactNumber: '+92-321-9876543',
        passwordHash: hashedPassword,
        educational_details: [
          {
            degree: 'MBBS',
            institution: 'Dow Medical College',
            yearOfCompletion: 2011,
            specialization: 'General Medicine',
          },
        ],
        specialization: ['Dermatology'],
        experience_details: [
          {
            institution: 'Aga Khan Hospital',
            starting_date: new Date('2012-06-01'),
            is_going_on: true,
          },
        ],
        license_number: 'PMC-67890',
        consultation_type: 'online',
        consultation_fee: 1500,
        account_status: 'under_consideration',
        onboarding_status: 'documents-submitted',
        roleId: doctorRole._id,
        is_Verified: false,
        averageRating: 0,
      },
    ]);
    console.log('  ✓ Created 2 doctors');

    // Salespersons
    const salespersons = await Salesperson.insertMany([
      {
        fullName: 'Ali Raza',
        email: 'ali.raza@philbox.com',
        contactNumber: '+92-333-1111111',
        passwordHash: hashedPassword,
        branches_to_be_managed: [],
        roleId: salespersonRole._id,
        is_Verified: true,
      },
      {
        fullName: 'Ayesha Khan',
        email: 'ayesha.khan@philbox.com',
        contactNumber: '+92-333-2222222',
        passwordHash: hashedPassword,
        branches_to_be_managed: [],
        roleId: salespersonRole._id,
        is_Verified: true,
      },
    ]);
    console.log('  ✓ Created 2 salespersons');

    // ==================== 4. BRANCHES ====================
    console.log('\n🏢 Seeding branches...');
    const branches = await Branch.insertMany([
      {
        name: 'Philbox Lahore Main',
        code: 'LHR-001',
        phone: '+92-42-1234567',
        under_administration_of: [admins[0]._id],
        salespersons_assigned: [salespersons[0]._id],
        address_id: addresses[0]._id,
        status: 'Active',
      },
      {
        name: 'Philbox Karachi DHA',
        code: 'KHI-001',
        phone: '+92-21-9876543',
        under_administration_of: [admins[1]._id],
        salespersons_assigned: [salespersons[1]._id],
        address_id: addresses[1]._id,
        status: 'Active',
      },
    ]);
    console.log('  ✓ Created 2 branches');

    // Update super admin with all branches
    await Admin.findByIdAndUpdate(superAdmin._id, {
      branches_managed: branches.map(b => b._id),
    });

    // Update branch admins with their respective branches
    await Admin.findByIdAndUpdate(admins[0]._id, {
      branches_managed: [branches[0]._id],
    });
    await Admin.findByIdAndUpdate(admins[1]._id, {
      branches_managed: [branches[1]._id],
    });
    await Salesperson.findByIdAndUpdate(salespersons[0]._id, {
      branches_to_be_managed: [branches[0]._id],
    });
    await Salesperson.findByIdAndUpdate(salespersons[1]._id, {
      branches_to_be_managed: [branches[1]._id],
    });

    // ==================== 5. INVENTORY ====================
    console.log('\n💊 Seeding inventory data...');

    // Manufacturers
    const manufacturers = await Manufacturer.insertMany([
      { name: 'GlaxoSmithKline Pakistan' },
      { name: 'Getz Pharma' },
      { name: 'Abbott Laboratories' },
      { name: 'Pfizer Pakistan' },
    ]);
    console.log('  ✓ Created 4 manufacturers');

    // Item Classes
    const itemClasses = await ItemClass.insertMany([
      { name: 'Tablet' },
      { name: 'Capsule' },
      { name: 'Syrup' },
      { name: 'Injection' },
      { name: 'Ointment' },
    ]);
    console.log('  ✓ Created 5 item classes');

    // Medicine Items
    const medicineItems = await MedicineItem.insertMany([
      {
        Name: 'Panadol 500mg',
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        manufacturer: manufacturers[0]._id,
        class: itemClasses[0]._id,
        sale_price: 5.0,
        purchase_price: 3.0,
        is_available: true,
      },
      {
        Name: 'Augmentin 625mg',
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        manufacturer: manufacturers[0]._id,
        class: itemClasses[0]._id,
        sale_price: 280.0,
        purchase_price: 220.0,
        is_available: true,
      },
      {
        Name: 'Brufen 400mg',
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        manufacturer: manufacturers[1]._id,
        class: itemClasses[0]._id,
        sale_price: 8.0,
        purchase_price: 5.5,
        is_available: true,
      },
      {
        Name: 'Amoxil Syrup 125mg',
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        manufacturer: manufacturers[0]._id,
        class: itemClasses[2]._id,
        sale_price: 150.0,
        purchase_price: 110.0,
        is_available: true,
      },
      {
        Name: 'Lipitor 20mg',
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        manufacturer: manufacturers[3]._id,
        class: itemClasses[0]._id,
        sale_price: 320.0,
        purchase_price: 270.0,
        is_available: true,
      },
    ]);
    console.log('  ✓ Created 5 medicine items');

    // Medicine Batches
    const medicineBatches = await MedicineBatch.insertMany([
      {
        medicine_id: medicineItems[0]._id,
        expiry: new Date('2025-12-31'),
        quantity: 1000,
      },
      {
        medicine_id: medicineItems[1]._id,
        expiry: new Date('2025-06-30'),
        quantity: 500,
      },
      {
        medicine_id: medicineItems[2]._id,
        expiry: new Date('2026-03-31'),
        quantity: 750,
      },
      {
        medicine_id: medicineItems[3]._id,
        expiry: new Date('2025-09-30'),
        quantity: 300,
      },
      {
        medicine_id: medicineItems[4]._id,
        expiry: new Date('2025-11-30'),
        quantity: 200,
      },
    ]);
    console.log('  ✓ Created 5 medicine batches');

    // Stock in Hand
    const stockInHand = await StockInHand.insertMany([
      { medicine_id: medicineItems[0]._id, quantity: 1000 },
      { medicine_id: medicineItems[1]._id, quantity: 500 },
      { medicine_id: medicineItems[2]._id, quantity: 750 },
      { medicine_id: medicineItems[3]._id, quantity: 300 },
      { medicine_id: medicineItems[4]._id, quantity: 200 },
    ]);
    console.log('  ✓ Created 5 stock records');

    // ==================== 6. APPOINTMENTS ====================
    console.log('\n📅 Seeding appointments...');
    const appointments = await Appointment.insertMany([
      {
        doctor_id: doctors[0]._id,
        patient_id: customers[0]._id,
        status: 'completed',
        appointment_type: 'online',
        appointment_request: 'accepted',
      },
      {
        doctor_id: doctors[0]._id,
        patient_id: customers[1]._id,
        status: 'pending',
        appointment_type: 'in-person',
        appointment_request: 'processing',
      },
      {
        doctor_id: doctors[1]._id,
        patient_id: customers[2]._id,
        status: 'completed',
        appointment_type: 'online',
        appointment_request: 'accepted',
      },
    ]);
    console.log('  ✓ Created 3 appointments');

    // ==================== 7. TRANSACTIONS ====================
    console.log('\n💰 Seeding transactions...');
    const transactions = await Transaction.insertMany([
      {
        target_class: 'appointment',
        target_id: appointments[0]._id,
        total_bill: 2000,
        transaction_type: 'pay',
        payment_method: 'Stripe-Card',
        payment_status: 'successful',
        currency: currencies[0]._id,
      },
      {
        target_class: 'appointment',
        target_id: appointments[2]._id,
        total_bill: 1500,
        transaction_type: 'pay',
        payment_method: 'JazzCash-Wallet',
        payment_status: 'successful',
        currency: currencies[0]._id,
      },
    ]);
    console.log('  ✓ Created 2 transactions');

    // Update appointments with transaction references
    await Appointment.findByIdAndUpdate(appointments[0]._id, {
      transaction_id: transactions[0]._id,
    });
    await Appointment.findByIdAndUpdate(appointments[2]._id, {
      transaction_id: transactions[1]._id,
    });

    // ==================== 8. ORDERS ====================
    console.log('\n🛒 Seeding orders...');
    const orders = await Order.insertMany([
      {
        customer_id: customers[0]._id,
        branch_id: branches[0]._id,
        total: 560.0,
        status: 'completed',
        salesperson_id: salespersons[0]._id,
      },
      {
        customer_id: customers[1]._id,
        branch_id: branches[1]._id,
        total: 470.0,
        status: 'processing',
        salesperson_id: salespersons[1]._id,
      },
      {
        customer_id: customers[2]._id,
        branch_id: branches[0]._id,
        total: 24.0,
        status: 'on-the-way',
        salesperson_id: salespersons[0]._id,
      },
    ]);
    console.log('  ✓ Created 3 orders');

    // Order Items
    const orderItems = await OrderItem.insertMany([
      {
        order_id: orders[0]._id,
        medicine_id: medicineItems[1]._id,
        quantity: 2,
        subtotal: 560.0,
      },
      {
        order_id: orders[1]._id,
        medicine_id: medicineItems[3]._id,
        quantity: 1,
        subtotal: 150.0,
      },
      {
        order_id: orders[1]._id,
        medicine_id: medicineItems[4]._id,
        quantity: 1,
        subtotal: 320.0,
      },
      {
        order_id: orders[2]._id,
        medicine_id: medicineItems[2]._id,
        quantity: 3,
        subtotal: 24.0,
      },
    ]);
    console.log('  ✓ Created 4 order items');

    // Order transactions
    const orderTransactions = await Transaction.insertMany([
      {
        target_class: 'order',
        target_id: orders[0]._id,
        total_bill: 560.0,
        transaction_type: 'pay',
        payment_method: 'Stripe-Card',
        payment_status: 'successful',
        currency: currencies[0]._id,
      },
      {
        target_class: 'order',
        target_id: orders[1]._id,
        total_bill: 470.0,
        transaction_type: 'pay',
        payment_method: 'Stripe-Card',
        payment_status: 'pending',
        currency: currencies[0]._id,
      },
      {
        target_class: 'order',
        target_id: orders[2]._id,
        total_bill: 24.0,
        transaction_type: 'pay',
        payment_method: 'EasyPaisa-Wallet',
        payment_status: 'successful',
        currency: currencies[0]._id,
      },
    ]);
    console.log('  ✓ Created 3 order transactions');

    // ==================== 9. FEEDBACK & REVIEWS ====================
    console.log('\n⭐ Seeding feedback and reviews...');

    // Reviews
    const reviews = await Review.insertMany([
      {
        customer_id: customers[0]._id,
        target_id: doctors[0]._id,
        target_type: 'doctor',
        rating: 5,
        message: 'Excellent consultation! Very professional and caring.',
        sentiment: 'positive',
      },
      {
        customer_id: customers[2]._id,
        target_id: doctors[1]._id,
        target_type: 'doctor',
        rating: 5,
        message: 'Great doctor, solved my skin problem effectively.',
        sentiment: 'positive',
      },
      {
        customer_id: customers[0]._id,
        target_id: orders[0]._id,
        target_type: 'order',
        rating: 4,
        message: 'Fast delivery, medicines were well packaged.',
        sentiment: 'positive',
      },
    ]);
    console.log('  ✓ Created 3 reviews');

    // Feedback
    const feedbacks = await Feedback.insertMany([
      {
        customer_id: customers[1]._id,
        category: 'system',
        comment: 'The mobile app is very user-friendly and easy to navigate.',
      },
      {
        customer_id: customers[2]._id,
        category: 'delivery-service',
        comment: 'Delivery was on time, very satisfied with the service.',
      },
    ]);
    console.log('  ✓ Created 2 feedbacks');

    // Complaints
    const complaints = await Complaint.insertMany([
      {
        customer_id: customers[1]._id,
        customer_address_id: addresses[1]._id,
        title: 'Expired Medicine Received',
        description:
          'I received medicine that was past its expiry date in my last order. This is very concerning for customer safety.',
        category: 'product-quality',
        priority: 'high',
        status: 'pending',
        messages: [
          {
            sender_role: 'customer',
            sender_id: customers[1]._id,
            message: 'Received expired medicine in my last order.',
            sent_at: new Date(),
          },
        ],
      },
    ]);
    console.log('  ✓ Created 1 complaint');

    // ==================== 10. ADDITIONAL FEATURES ====================
    console.log('\n🔔 Seeding additional features...');

    // Refill Reminders
    const refillReminders = await RefillReminder.insertMany([
      {
        medicines: [medicineItems[4]._id],
        patient_id: customers[0]._id,
        frequency: 'monthly',
        timeOfDay: '08:00',
        notificationMethod: 'email',
        isActive: true,
        nextNotificationDate: new Date('2024-03-01'),
      },
      {
        medicines: [medicineItems[0]._id, medicineItems[2]._id],
        patient_id: customers[2]._id,
        frequency: 'weekly',
        timeOfDay: '09:00',
        notificationMethod: 'push',
        isActive: true,
        nextNotificationDate: new Date('2024-02-15'),
      },
    ]);
    console.log('  ✓ Created 2 refill reminders');

    // Search History
    const searchHistory = await SearchHistory.insertMany([
      {
        customer_id: customers[0]._id,
        query: 'paracetamol',
        searched_at: new Date('2024-01-20'),
      },
      {
        customer_id: customers[1]._id,
        query: 'antibiotic',
        searched_at: new Date('2024-01-22'),
      },
      {
        customer_id: customers[2]._id,
        query: 'pain killer',
        searched_at: new Date('2024-01-23'),
      },
    ]);
    console.log('  ✓ Created 3 search history records');

    // Salesperson Tasks
    const salespersonTasks = await SalespersonTask.insertMany([
      {
        assigned_by_admin_id: admins[1]._id,
        assigned_by_role: 'branch-admin',
        salesperson_id: salespersons[0]._id,
        branch_id: branches[0]._id,
        title: 'Update inventory for Panadol stock',
        description: 'Check and update the current stock levels for Panadol.',
        priority: 'high',
        deadline: new Date('2024-02-28'),
        status: 'pending',
      },
      {
        assigned_by_admin_id: admins[1]._id,
        assigned_by_role: 'branch-admin',
        salesperson_id: salespersons[1]._id,
        branch_id: branches[1]._id,
        title: 'Customer follow-up calls',
        description: 'Follow up with customers who ordered last week.',
        priority: 'medium',
        deadline: new Date('2024-02-25'),
        status: 'in-progress',
      },
    ]);
    console.log('  ✓ Created 2 salesperson tasks');

    // Appointment Messages
    const appointmentMessages = await AppointmentMessage.insertMany([
      {
        text: 'Hello Doctor, I am experiencing chest pain.',
        from: 'patient',
        to: 'doctor',
        appointment_id: appointments[0]._id,
      },
      {
        text: 'Please describe the pain in detail.',
        from: 'doctor',
        to: 'patient',
        appointment_id: appointments[0]._id,
      },
      {
        text: 'Can you suggest some remedies for my skin condition?',
        from: 'patient',
        to: 'doctor',
        appointment_id: appointments[2]._id,
      },
    ]);
    console.log('  ✓ Created 3 appointment messages');

    // ==================== 11. ACTIVITY LOGS ====================
    console.log('\n📝 Seeding activity logs...');

    // Admin Activity Logs
    const adminActivityLogs = await AdminActivityLog.insertMany([
      {
        admin_id: admins[0]._id,
        action_type: 'create_branch',
        description: 'Created new branch in Lahore',
        target_collection: 'branches',
        target_id: branches[0]._id,
        ip_address: '192.168.1.1',
        created_at: new Date('2024-01-01'),
      },
      {
        admin_id: admins[1]._id,
        action_type: 'assign_salesperson',
        description: 'Assigned salesperson to Lahore branch',
        target_collection: 'salespersons',
        target_id: salespersons[0]._id,
        ip_address: '192.168.1.10',
        created_at: new Date('2024-01-05'),
      },
    ]);
    console.log('  ✓ Created 2 admin activity logs');

    // Doctor Activity Logs
    const doctorActivityLogs = await DoctorActivityLog.insertMany([
      {
        doctor_id: doctors[0]._id,
        action_type: 'complete_appointment',
        description: 'Completed appointment with patient',
        target_collection: 'appointments',
        target_id: appointments[0]._id,
        ip_address: '192.168.2.5',
      },
      {
        doctor_id: doctors[1]._id,
        action_type: 'update_profile',
        description: 'Updated consultation fee',
        target_collection: 'doctors',
        target_id: doctors[1]._id,
        ip_address: '192.168.2.10',
      },
    ]);
    console.log('  ✓ Created 2 doctor activity logs');

    // Customer Activity Logs
    const customerActivityLogs = await CustomerActivityLog.insertMany([
      {
        customer_id: customers[0]._id,
        action_type: 'place_order',
        description: 'Placed order for medicines',
        target_collection: 'orders',
        target_id: orders[0]._id,
        ip_address: '192.168.3.20',
      },
      {
        customer_id: customers[1]._id,
        action_type: 'book_appointment',
        description: 'Booked appointment with doctor',
        target_collection: 'appointments',
        target_id: appointments[1]._id,
        ip_address: '192.168.3.25',
      },
    ]);
    console.log('  ✓ Created 2 customer activity logs');

    // Salesperson Activity Logs
    const salespersonActivityLogs = await SalespersonActivityLog.insertMany([
      {
        salesperson_id: salespersons[0]._id,
        branch_id: branches[0]._id,
        action_type: 'add_medicine',
        description: 'Added new medicine to inventory',
        target_collection: 'medicine_items',
        target_id: medicineItems[0]._id,
        ip_address: '192.168.4.15',
        created_at: new Date(),
      },
      {
        salesperson_id: salespersons[1]._id,
        branch_id: branches[1]._id,
        action_type: 'update_stock',
        description: 'Updated stock levels',
        target_collection: 'stock_in_hand',
        target_id: stockInHand[3]._id,
        ip_address: '192.168.4.20',
        created_at: new Date(),
      },
    ]);
    console.log('  ✓ Created 2 salesperson activity logs');

    // ==================== 12. ANALYTICS ====================
    console.log('\n📊 Seeding analytics data...');

    // Daily Appointments Analytics
    const dailyAppointmentsAnalytics =
      await DailyAppointmentsAnalytics.insertMany([
        {
          date: new Date('2024-01-15'),
          todays_appointments: [appointments[0]._id],
          completed_appointments: [appointments[0]._id],
          missed_appointments: [],
          upcoming_appointments: [],
          completion_rate: 100,
          no_show_rate: 0,
          top_doctor_by_appointments: doctors[0]._id,
          top_doctor_by_revenue: doctors[0]._id,
          total_revenue_today: 2000,
          average_charge_per_appointment: 2000,
        },
      ]);
    console.log('  ✓ Created 1 daily appointments analytics');

    // Appointments Analytics History
    const appointmentsAnalyticsHistory =
      await AppointmentsAnalyticsHistory.insertMany([
        {
          date: new Date('2024-01-10'),
          todays_appointments: [appointments[2]._id],
          completed_appointments: [appointments[2]._id],
          missed_appointments: [],
          upcoming_appointments: [],
          total_appointments_count: 1,
          completed_appointments_count: 1,
          missed_appointments_count: 0,
          upcoming_appointments_count: 0,
          completion_rate: 100,
          no_show_rate: 0,
        },
      ]);
    console.log('  ✓ Created 1 appointments analytics history');

    // Medicine Sales Analytics
    const medicineSalesAnalytics = await MedicineSalesAnalytics.insertMany([
      {
        medicine_id: orderItems[0]._id,
        branch_id: branches[0]._id,
        date: new Date('2024-01-20'),
        total_sold: 2,
        revenue_generated: 560.0,
        refunds_count: 0,
      },
      {
        medicine_id: orderItems[3]._id,
        branch_id: branches[0]._id,
        date: new Date('2024-01-22'),
        total_sold: 3,
        revenue_generated: 24.0,
        refunds_count: 0,
      },
    ]);
    console.log('  ✓ Created 2 medicine sales analytics');

    // Branch Performance Summary
    const branchPerformanceSummary = await BranchPerformanceSummary.insertMany([
      {
        branch_id: branches[0]._id,
        date: new Date('2024-01-31'),
        total_orders: 2,
        completed_orders: 2,
        cancelled_orders: 0,
        revenue_from_orders: 584.0,
        refunded_orders: 0,
        refund_amount: 0,
        new_complaints: 0,
        resolved_complaints: 0,
      },
      {
        branch_id: branches[1]._id,
        date: new Date('2024-01-31'),
        total_orders: 1,
        completed_orders: 0,
        cancelled_orders: 0,
        revenue_from_orders: 470.0,
        refunded_orders: 0,
        refund_amount: 0,
        new_complaints: 0,
        resolved_complaints: 0,
      },
    ]);
    console.log('  ✓ Created 2 branch performance summaries');

    // ==================== 13. INVENTORY FILES ====================
    console.log('\n📁 Seeding inventory files data...');

    // Uploaded Inventory Files
    const uploadedInventoryFiles = await UploadedInventoryFile.insertMany([
      {
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        file_type: 'batch_wise_file',
        file_url: 'https://cloudinary.com/files/batch_jan_2024.xlsx',
        status: 'synced',
      },
      {
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        file_type: 'stock_in_hand',
        file_url: 'https://cloudinary.com/files/stock_jan_2024.xlsx',
        status: 'pending',
      },
    ]);
    console.log('  ✓ Created 2 uploaded inventory files');

    // Inventory Files Log
    const inventoryFilesLog = await InventoryFilesLog.insertMany([
      {
        uploaded_inventory_file: uploadedInventoryFiles[0]._id,
        status: 'resolved',
        target_medicine: medicineItems[0]._id,
        stock: stockInHand[0]._id,
        issue: 'Batch expiry date mismatch',
        action: 'retry',
        retryCount: 1,
        last_attempt: new Date(),
      },
    ]);
    console.log('  ✓ Created 1 inventory files log');

    // ==================== 14. DOCTOR DOCUMENTS ====================
    console.log('\n📄 Seeding doctor documents...');

    // Doctor Documents
    const doctorDocuments = await DoctorDocuments.insertMany([
      {
        CNIC: 'https://cloudinary.com/docs/cnic_sarah.jpg',
        medical_license: 'https://cloudinary.com/docs/license_sarah.pdf',
        mbbs_md_degree: 'https://cloudinary.com/docs/degree_sarah.pdf',
        experience_letters: 'https://cloudinary.com/docs/experience_sarah.pdf',
        doctor_id: doctors[0]._id,
      },
      {
        CNIC: 'https://cloudinary.com/docs/cnic_bilal.jpg',
        medical_license: 'https://cloudinary.com/docs/license_bilal.pdf',
        mbbs_md_degree: 'https://cloudinary.com/docs/degree_bilal.pdf',
        doctor_id: doctors[1]._id,
      },
    ]);
    console.log('  ✓ Created 2 doctor documents');

    // Doctor Applications (mix of pending, approved, and rejected)
    const doctorApplications = await DoctorApplication.insertMany([
      {
        applications_documents_id: doctorDocuments[0]._id,
        doctor_id: doctors[0]._id,
        status: 'approved',
        reviewed_by_admin_id: admins[0]._id,
        admin_comment: 'All documents verified and approved.',
        reviewed_at: new Date('2024-01-05'),
      },
      {
        applications_documents_id: doctorDocuments[1]._id,
        doctor_id: doctors[1]._id,
        status: 'pending',
      },
    ]);
    console.log('  ✓ Created 2 doctor applications (1 approved, 1 pending)');

    // ==================== 15. DOCTOR SLOTS ====================
    console.log('\n📅 Seeding doctor slots...');

    // Helper function to generate dates
    const generateDateRange = (
      startDate,
      endDate,
      frequency,
      daysOfWeek = []
    ) => {
      const dates = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        if (frequency === 'daily') {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        } else if (frequency === 'weekly' && daysOfWeek.length > 0) {
          if (daysOfWeek.includes(current.getDay())) {
            dates.push(new Date(current));
          }
          current.setDate(current.getDate() + 1);
        } else if (frequency === 'monthly') {
          dates.push(new Date(current));
          current.setMonth(current.getMonth() + 1);
        }
      }
      return dates;
    };

    // Doctor 1 (Dr. Sarah Ahmed) - Active doctor with various slots
    const sarahSlots = [];

    // Single slots for next week (various durations)
    sarahSlots.push(
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-10'),
        start_time: '09:00',
        end_time: '12:00',
        slot_duration: 30,
        status: 'available',
        is_recurring: false,
        notes: 'Morning consultation - General checkups',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-10'),
        start_time: '14:00',
        end_time: '17:00',
        slot_duration: 60,
        status: 'available',
        is_recurring: false,
        notes: 'Afternoon consultation - Extended sessions',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-11'),
        start_time: '10:00',
        end_time: '13:00',
        slot_duration: 30,
        status: 'booked',
        is_recurring: false,
        appointment_id: appointments[0]._id,
        notes: 'Booked for patient consultation',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-12'),
        start_time: '09:00',
        end_time: '11:00',
        slot_duration: 15,
        status: 'available',
        is_recurring: false,
        notes: 'Quick consultations - Follow-ups',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-13'),
        start_time: '15:00',
        end_time: '18:00',
        slot_duration: 30,
        status: 'unavailable',
        is_recurring: false,
        notes: 'Unavailable - Personal appointment',
      }
    );

    // Recurring weekly slots (Mon, Wed, Fri) for next 2 months
    const weeklyDates = generateDateRange(
      new Date('2026-01-15'),
      new Date('2026-03-15'),
      'weekly',
      [1, 3, 5] // Monday, Wednesday, Friday
    );

    weeklyDates.forEach(date => {
      sarahSlots.push({
        doctor_id: doctors[0]._id,
        date: date,
        start_time: '10:00',
        end_time: '16:00',
        slot_duration: 60,
        status: 'available',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'weekly',
          days_of_week: [1, 3, 5],
          end_date: new Date('2026-03-15'),
        },
        notes: 'Regular weekly availability - Mon/Wed/Fri',
      });
    });

    // Recurring monthly slots (15th of each month)
    const monthlyDates = generateDateRange(
      new Date('2026-01-15'),
      new Date('2026-06-15'),
      'monthly'
    );

    monthlyDates.forEach(date => {
      sarahSlots.push({
        doctor_id: doctors[0]._id,
        date: date,
        start_time: '14:00',
        end_time: '18:00',
        slot_duration: 60,
        status: 'available',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'monthly',
          days_of_week: [],
          end_date: new Date('2026-06-15'),
        },
        notes: 'Monthly special consultation day',
      });
    });

    // Doctor 2 (Dr. Bilal) - Pending doctor with limited slots
    const bilalSlots = [];

    // Daily slots for next week
    const dailyDates = generateDateRange(
      new Date('2026-01-10'),
      new Date('2026-01-17'),
      'daily'
    );

    dailyDates.forEach(date => {
      bilalSlots.push({
        doctor_id: doctors[1]._id,
        date: date,
        start_time: '11:00',
        end_time: '15:00',
        slot_duration: 30,
        status: 'available',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'daily',
          days_of_week: [],
          end_date: new Date('2026-01-17'),
        },
        notes: 'Daily availability - Dermatology consultations',
      });
    });

    // Weekend slots (Sat, Sun)
    const weekendDates = generateDateRange(
      new Date('2026-01-11'),
      new Date('2026-02-28'),
      'weekly',
      [0, 6] // Sunday, Saturday
    );

    weekendDates.forEach(date => {
      bilalSlots.push({
        doctor_id: doctors[1]._id,
        date: date,
        start_time: '09:00',
        end_time: '13:00',
        slot_duration: 60,
        status: 'available',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'weekly',
          days_of_week: [0, 6],
          end_date: new Date('2026-02-28'),
        },
        notes: 'Weekend availability - Extended sessions',
      });
    });

    // Insert all slots
    const doctorSlots = await DoctorSlot.insertMany([
      ...sarahSlots,
      ...bilalSlots,
    ]);
    console.log(
      `  ✓ Created ${doctorSlots.length} doctor slots (${sarahSlots.length} for Dr. Sarah, ${bilalSlots.length} for Dr. Bilal)`
    );

    console.log('\n✅ Data seeding completed successfully!\n');
    console.log('='.repeat(60));
    console.log('SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✓ Roles: ${roles.length}`);
    console.log(`✓ Currencies: ${currencies.length}`);
    console.log(`✓ Addresses: ${addresses.length}`);
    console.log(`✓ Admins: ${admins.length + 1} (including super admin)`);
    console.log(`✓ Customers: ${customers.length}`);
    console.log(`✓ Doctors: ${doctors.length}`);
    console.log(`✓ Salespersons: ${salespersons.length}`);
    console.log(`✓ Branches: ${branches.length}`);
    console.log(`✓ Manufacturers: ${manufacturers.length}`);
    console.log(`✓ Item Classes: ${itemClasses.length}`);
    console.log(`✓ Medicine Items: ${medicineItems.length}`);
    console.log(`✓ Medicine Batches: ${medicineBatches.length}`);
    console.log(`✓ Stock Records: ${stockInHand.length}`);
    console.log(`✓ Appointments: ${appointments.length}`);
    console.log(`✓ Orders: ${orders.length}`);
    console.log(`✓ Order Items: ${orderItems.length}`);
    console.log(
      `✓ Transactions: ${transactions.length + orderTransactions.length}`
    );
    console.log(`✓ Reviews: ${reviews.length}`);
    console.log(`✓ Feedbacks: ${feedbacks.length}`);
    console.log(`✓ Complaints: ${complaints.length}`);
    console.log(`✓ Refill Reminders: ${refillReminders.length}`);
    console.log(`✓ Search History: ${searchHistory.length}`);
    console.log(`✓ Salesperson Tasks: ${salespersonTasks.length}`);
    console.log(`✓ Appointment Messages: ${appointmentMessages.length}`);
    console.log(
      `✓ Activity Logs: ${adminActivityLogs.length + doctorActivityLogs.length + customerActivityLogs.length + salespersonActivityLogs.length}`
    );
    console.log(
      `✓ Analytics Records: ${dailyAppointmentsAnalytics.length + appointmentsAnalyticsHistory.length + medicineSalesAnalytics.length + branchPerformanceSummary.length}`
    );
    console.log(`✓ Inventory Files: ${uploadedInventoryFiles.length}`);
    console.log(`✓ Inventory Logs: ${inventoryFilesLog.length}`);
    console.log(`✓ Doctor Documents: ${doctorDocuments.length}`);
    console.log(`✓ Doctor Applications: ${doctorApplications.length}`);
    console.log(`✓ Doctor Slots: ${doctorSlots.length}`);
    console.log('='.repeat(60));
    console.log('\n💡 Test Credentials:');
    console.log(
      `  Super Admin: ${process.env.SUPERADMIN_EMAIL || 'superadmin@philbox.com'} / ${process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!'}`
    );
    console.log(
      '  Branch Admin (Lahore): admin.lahore@philbox.com / Password123!'
    );
    console.log(
      '  Branch Admin (Karachi): admin.karachi@philbox.com / Password123!'
    );
    console.log('  Doctor 1: dr.sarah@philbox.com / Password123!');
    console.log('  Doctor 2: dr.bilal@philbox.com / Password123!');
    console.log('  Customer 1: ahmed.hassan@gmail.com / Password123!');
    console.log('  Customer 2: fatima.ali@gmail.com / Password123!');
    console.log('  Customer 3: usman.khan@gmail.com / Password123!');
    console.log('  Salesperson 1: ali.raza@philbox.com / Password123!');
    console.log('  Salesperson 2: ayesha.khan@philbox.com / Password123!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await seedData();
    console.log('\n🎉 All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
};

main();
