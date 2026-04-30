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
import ItemClass from '../main/models/ItemClass.js';
import Medicine from '../main/models/Medicine.js';
import MedicineCategory from '../main/models/MedicineCategory.js';
import Manufacturer from '../main/models/Manufacturer.js';
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
import Patient from '../main/models/Patient.js';
import PrescriptionGeneratedByDoctor from '../main/models/PrescriptionGeneratedByDoctor.js';
import PrescriptionItem from '../main/models/PrescriptionItem.js';
import PrescriptionUploadedByCustomer from '../main/models/PrescriptionUploadedByCustomer.js';
import Coupon from '../main/models/Coupon.js';
import Delivery from '../main/models/Delivery.js';
import DeliveryFare from '../main/models/DeliveryFare.js';
import Cart from '../main/models/Cart.js';
import CartItem from '../main/models/CartItem.js';
import CustomerRefundRequest from '../main/models/CustomerRefundRequest.js';
import BranchRefundAllocation from '../main/models/BranchRefundAllocation.js';
import Report from '../main/models/Report.js';
import Announcement from '../main/models/Announcement.js';
import NotificationPreference from '../main/models/NotificationPreference.js';
import NotificationLog from '../main/models/NotificationLog.js';
import DeviceToken from '../main/models/DeviceToken.js';
import DailyMedicineRecommendations from '../main/models/DailyMedicineRecommendations.js';
import { resolveCoordinatesForAddress } from '../main/utils/proximityCalculator.js';

const SEEDED_MODELS = [
  Role,
  Permission,
  Currency,
  Address,
  Admin,
  Customer,
  Doctor,
  Salesperson,
  Branch,
  ItemClass,
  Medicine,
  MedicineCategory,
  Manufacturer,
  StockInHand,
  Appointment,
  Order,
  OrderItem,
  Transaction,
  Review,
  Feedback,
  Complaint,
  RefillReminder,
  SearchHistory,
  SalespersonTask,
  AppointmentMessage,
  AdminActivityLog,
  DoctorActivityLog,
  CustomerActivityLog,
  SalespersonActivityLog,
  DailyAppointmentsAnalytics,
  AppointmentsAnalyticsHistory,
  MedicineSalesAnalytics,
  BranchPerformanceSummary,
  InventoryFilesLog,
  UploadedInventoryFile,
  DoctorApplication,
  DoctorDocuments,
  DoctorSlot,
  Patient,
  PrescriptionGeneratedByDoctor,
  PrescriptionItem,
  PrescriptionUploadedByCustomer,
  Coupon,
  Delivery,
  DeliveryFare,
  Cart,
  CartItem,
  CustomerRefundRequest,
  BranchRefundAllocation,
  Report,
  Announcement,
  NotificationPreference,
  NotificationLog,
  DeviceToken,
  DailyMedicineRecommendations,
];

const isPlainObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const getNestedValue = (source, path) => {
  return path
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), source);
};

const setNestedValue = (target, path, value) => {
  const keys = path.split('.');
  let current = target;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
};

const shouldSkipBackfillPath = (path, schemaType) => {
  if (
    path === '_id' ||
    path === '__v' ||
    path === 'created_at' ||
    path === 'updated_at' ||
    path === 'createdAt' ||
    path === 'updatedAt'
  ) {
    return true;
  }

  if (path.includes('$') || path.includes('..')) {
    return true;
  }

  if (!schemaType) {
    return true;
  }

  return false;
};

const cloneDefaultValue = defaultValue => {
  if (defaultValue instanceof Date) {
    return new Date(defaultValue);
  }

  if (Array.isArray(defaultValue)) {
    return [...defaultValue];
  }

  if (isPlainObject(defaultValue)) {
    return { ...defaultValue };
  }

  return defaultValue;
};

const getPlaceholderValue = schemaType => {
  const defaultValue = schemaType?.options?.default;
  if (defaultValue !== undefined) {
    if (typeof defaultValue === 'function') {
      try {
        return defaultValue();
      } catch {
        // Ignore default function errors and fallback to type placeholders.
      }
    } else {
      return cloneDefaultValue(defaultValue);
    }
  }

  switch (schemaType.instance) {
    case 'String':
      return '';
    case 'Number':
      return 0;
    case 'Boolean':
      return false;
    case 'Date':
      return new Date('2026-01-01T00:00:00.000Z');
    case 'Array':
      return [];
    case 'Object':
      return {};
    case 'Map':
      return {};
    default:
      return null;
  }
};

const backfillMissingFieldsAcrossModels = async () => {
  console.log('\n🧩 Backfilling missing schema fields for seeded documents...');

  let totalUpdatedDocs = 0;

  for (const Model of SEEDED_MODELS) {
    const schemaPaths = Object.entries(Model.schema.paths);
    const docs = await Model.find({}).lean();

    if (!docs.length) {
      continue;
    }

    const operations = [];

    for (const doc of docs) {
      const setPayload = {};

      for (const [path, schemaType] of schemaPaths) {
        if (shouldSkipBackfillPath(path, schemaType)) {
          continue;
        }

        const existingValue = getNestedValue(doc, path);
        if (existingValue !== undefined) {
          continue;
        }

        const placeholder = getPlaceholderValue(schemaType);
        if (placeholder === undefined) {
          continue;
        }

        setNestedValue(setPayload, path, placeholder);
      }

      if (Object.keys(setPayload).length) {
        operations.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: setPayload },
          },
        });
      }
    }

    if (operations.length) {
      await Model.bulkWrite(operations, { ordered: false });
      totalUpdatedDocs += operations.length;
      console.log(
        `  ✓ ${Model.modelName}: backfilled ${operations.length} docs`
      );
    }
  }

  console.log(
    `✅ Backfill complete. Updated ${totalUpdatedDocs} document(s) across all models.`
  );
};

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

  const permissionsList = [
    { resource: 'users', action: 'create', description: 'Create users' },
    { resource: 'users', action: 'read', description: 'Read users' },
    { resource: 'users', action: 'update', description: 'Update users' },
    { resource: 'users', action: 'delete', description: 'Delete users' },
    { resource: 'branches', action: 'create', description: 'Create branches' },
    { resource: 'branches', action: 'read', description: 'Read branches' },
    { resource: 'branches', action: 'update', description: 'Update branches' },
    { resource: 'branches', action: 'delete', description: 'Delete branches' },
    { resource: 'doctors', action: 'create', description: 'Create doctors' },
    { resource: 'doctors', action: 'read', description: 'Read doctors' },
    { resource: 'doctors', action: 'update', description: 'Update doctors' },
    { resource: 'doctors', action: 'delete', description: 'Delete doctors' },
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
    {
      resource: 'profile',
      action: 'read',
      description: 'Read own profile',
    },
    {
      resource: 'profile',
      action: 'update',
      description: 'Update own profile',
    },
    {
      resource: 'application',
      action: 'submit',
      description: 'Submit doctor application',
    },
    {
      resource: 'application_status',
      action: 'check',
      description: 'Check doctor application status',
    },
    {
      resource: 'application',
      action: 'resubmit',
      description: 'Resubmit doctor application',
    },
    {
      resource: 'profile',
      action: 'complete',
      description: 'Complete doctor profile',
    },
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
    {
      resource: 'order_processing',
      action: 'read',
      description: 'Read order processing records',
    },
    {
      resource: 'order_processing',
      action: 'update',
      description: 'Update order processing records',
    },
    {
      resource: 'slots',
      action: 'create',
      description: 'Create slots',
    },
    {
      resource: 'slots',
      action: 'read',
      description: 'Read slots',
    },
    {
      resource: 'slots',
      action: 'update',
      description: 'Update slots',
    },
    {
      resource: 'slots',
      action: 'delete',
      description: 'Delete slots',
    },
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
    {
      resource: 'prescriptions',
      action: 'export',
      description: 'Export prescriptions to PDF',
    },
    {
      resource: 'consultations',
      action: 'read',
      description: 'Read consultations',
    },
    {
      resource: 'consultations',
      action: 'update',
      description: 'Update consultations',
    },
    {
      resource: 'consultation_history',
      action: 'export',
      description: 'Export consultation history to PDF',
    },
    {
      resource: 'medical_history',
      action: 'read',
      description: 'Read patient medical history',
    },
    { resource: 'patients', action: 'read', description: 'Read patients' },
    { resource: 'reviews', action: 'read', description: 'Read reviews' },
    { resource: 'reports', action: 'create', description: 'Create reports' },
    { resource: 'reports', action: 'read', description: 'Read reports' },
    { resource: 'reports', action: 'update', description: 'Update reports' },
    { resource: 'reports', action: 'delete', description: 'Delete reports' },
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
    { resource: 'dashboard', action: 'read', description: 'Read dashboard' },
    { resource: 'cart', action: 'create', description: 'Create cart items' },
    { resource: 'cart', action: 'read', description: 'Read cart items' },
    { resource: 'cart', action: 'update', description: 'Update cart items' },
    { resource: 'cart', action: 'delete', description: 'Delete cart items' },
    {
      resource: 'checkout',
      action: 'create',
      description: 'Create checkout resources',
    },
    {
      resource: 'checkout',
      action: 'read',
      description: 'Read checkout summary',
    },
    {
      resource: 'checkout',
      action: 'update',
      description: 'Update checkout resources',
    },
    {
      resource: 'checkout',
      action: 'delete',
      description: 'Delete checkout resources',
    },
    {
      resource: 'refund_requests',
      action: 'create',
      description: 'Create refund requests',
    },
    {
      resource: 'refund_requests',
      action: 'read',
      description: 'Read refund requests',
    },
    {
      resource: 'refund_requests',
      action: 'update',
      description: 'Update refund requests',
    },
    {
      resource: 'refund_requests',
      action: 'delete',
      description: 'Delete refund requests',
    },
    {
      resource: 'search_history',
      action: 'create',
      description: 'Create search history records',
    },
    {
      resource: 'search_history',
      action: 'read',
      description: 'Read search history records',
    },
    {
      resource: 'search_history',
      action: 'delete',
      description: 'Delete search history records',
    },
    {
      resource: 'refill_reminders',
      action: 'create',
      description: 'Create refill reminders',
    },
    {
      resource: 'refill_reminders',
      action: 'read',
      description: 'Read refill reminders',
    },
    {
      resource: 'refill_reminders',
      action: 'update',
      description: 'Update refill reminders',
    },
    {
      resource: 'refill_reminders',
      action: 'deactivate',
      description: 'Deactivate refill reminders',
    },
    {
      resource: 'refill_reminders',
      action: 'delete',
      description: 'Delete refill reminders',
    },
    { resource: 'orders', action: 'create', description: 'Create orders' },
    { resource: 'orders', action: 'read', description: 'Read orders' },
    { resource: 'orders', action: 'update', description: 'Update orders' },
    { resource: 'orders', action: 'delete', description: 'Delete orders' },
  ];

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
        permissions['read_order_processing'],
        permissions['update_order_processing'],
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
        permissions['read_profile'],
        permissions['update_profile'],
        permissions['submit_application'],
        permissions['check_application_status'],
        permissions['resubmit_application'],
        permissions['complete_profile'],
        permissions['read_appointments'],
        permissions['update_appointments'],
        permissions['create_appointments'],
        permissions['create_slots'],
        permissions['read_slots'],
        permissions['update_slots'],
        permissions['delete_slots'],
        permissions['create_prescriptions'],
        permissions['read_prescriptions'],
        permissions['update_prescriptions'],
        permissions['export_prescriptions'],
        permissions['read_consultations'],
        permissions['update_consultations'],
        permissions['export_consultation_history'],
        permissions['read_medical_history'],
        permissions['read_patients'],
        permissions['read_reviews'],
        permissions['read_customers'],
        permissions['read_reports'],
      ].filter(Boolean),
    },
    {
      name: 'customer',
      description: 'Customer - Browse, order, and book appointments',
      permissions: [
        permissions['read_customers'],
        permissions['update_customers'],
        permissions['read_profile'],
        permissions['update_profile'],
        permissions['read_inventory'],
        permissions['read_dashboard'],
        permissions['create_cart'],
        permissions['read_cart'],
        permissions['update_cart'],
        permissions['delete_cart'],
        permissions['create_checkout'],
        permissions['read_checkout'],
        permissions['update_checkout'],
        permissions['delete_checkout'],
        permissions['create_refund_requests'],
        permissions['read_refund_requests'],
        permissions['update_refund_requests'],
        permissions['delete_refund_requests'],
        permissions['create_search_history'],
        permissions['read_search_history'],
        permissions['delete_search_history'],
        permissions['create_refill_reminders'],
        permissions['read_refill_reminders'],
        permissions['update_refill_reminders'],
        permissions['deactivate_refill_reminders'],
        permissions['delete_refill_reminders'],
        permissions['create_orders'],
        permissions['read_orders'],
        permissions['update_orders'],
        permissions['delete_orders'],
        permissions['create_appointments'],
        permissions['read_appointments'],
        permissions['update_appointments'],
        permissions['read_prescriptions'],
        permissions['update_prescriptions'],
        permissions['read_reports'],
      ].filter(Boolean),
    },
  ];

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
    phone_number: '+92-300-9999999',
    category: 'super-admin',
    branches_managed: [],
    roleId: superAdminRole._id,
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

    const currencies = await Currency.insertMany([
      { code: 'PKR' },
      { code: 'USD' },
    ]);
    console.log('  ✓ Created 2 currencies');

    // ==================== 4. ADDRESSES (without person links yet) ====================
    console.log('\n📍 Seeding addresses...');
    const addressSeedData = [
      {
        street: '123 Main Street',
        town: 'Gulberg',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
        google_map_link: 'https://maps.app.goo.gl/5qCoKqEK7e3gAc1TA',
      },
      {
        street: 'Mochipura Morr',
        town: 'Mochipura',
        city: 'Lahore',
        country: 'Pakistan',
        province: 'Punjab',
        google_map_link: 'https://maps.app.goo.gl/5qCoKqEK7e3gAc1TA',
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
        street: 'PHILBOX Pharmacy & Medical Complex',
        town: 'Gulberg',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
        google_map_link: 'https://maps.app.goo.gl/xr5wQrbNpNTM9p618',
      },
      // Extra addresses for doctors and salespersons
      {
        street: '11 Doctor Lane',
        town: 'Model Town',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
      },
      {
        street: '22 Clinic Street',
        town: 'Clifton',
        city: 'Karachi',
        province: 'Sindh',
        country: 'Pakistan',
      },
      {
        street: '33 Sales Avenue',
        town: 'Johar Town',
        city: 'Lahore',
        province: 'Punjab',
        country: 'Pakistan',
      },
      {
        street: '44 Commerce Road',
        town: 'North Nazimabad',
        city: 'Karachi',
        province: 'Sindh',
        country: 'Pakistan',
      },
    ];

    for (const address of addressSeedData) {
      const coordinates = await resolveCoordinatesForAddress(address);
      if (coordinates) {
        address.latitude = coordinates.latitude;
        address.longitude = coordinates.longitude;
      }
    }

    const addresses = await Address.insertMany(addressSeedData);
    console.log(`  ✓ Created ${addresses.length} addresses`);

    // ==================== 5. USERS ====================
    console.log('\n👥 Seeding users...');

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Admins
    const admins = await Admin.insertMany([
      {
        name: 'Branch Admin Lahore',
        email: 'admin.lahore@philbox.com',
        password: hashedPassword,
        phone_number: '+92-42-1234567',
        category: 'branch-admin',
        branches_managed: [],
        addresses: [addresses[0]._id],
        status: 'active',
        roleId: branchAdminRole._id,
      },
      {
        name: 'Branch Admin Karachi',
        email: 'admin.karachi@philbox.com',
        password: hashedPassword,
        phone_number: '+92-21-9876543',
        category: 'branch-admin',
        branches_managed: [],
        addresses: [addresses[1]._id],
        status: 'active',
        roleId: branchAdminRole._id,
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
        gender: 'Male',
        dateOfBirth: new Date('1990-03-15'),
        contactNumber: '+92-300-5551111',
      },
      {
        fullName: 'Fatima Ali',
        email: 'fatima.ali@gmail.com',
        passwordHash: hashedPassword,
        address_id: addresses[1]._id,
        is_Verified: true,
        roleId: customerRole._id,
        gender: 'Female',
        dateOfBirth: new Date('1993-07-22'),
        contactNumber: '+92-300-5552222',
      },
      {
        fullName: 'Usman Khan',
        email: 'usman.khan@gmail.com',
        passwordHash: hashedPassword,
        address_id: addresses[2]._id,
        is_Verified: true,
        roleId: customerRole._id,
        gender: 'Male',
        dateOfBirth: new Date('1988-11-05'),
        contactNumber: '+92-300-5553333',
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
        oauth_provider: 'local',
        affiliated_hospital: 'Lahore General Hospital',
        onlineProfileURL: 'https://philbox.com/doctors/dr-sarah',
        digital_signature: 'https://example.com/signature/dr-sarah',
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
        oauth_provider: 'local',
        affiliated_hospital: 'Aga Khan Hospital',
        onlineProfileURL: 'https://philbox.com/doctors/dr-bilal',
        digital_signature: 'https://example.com/signature/dr-bilal',
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
        account_status: 'rejected',
        onboarding_status: 'rejected',
        roleId: doctorRole._id,
        is_Verified: true,
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
        address_id: addresses[7]._id,
        status: 'active',
        roleId: salespersonRole._id,
        gender: 'Male',
        dateOfBirth: new Date('1992-04-10'),
      },
      {
        fullName: 'Ayesha Khan',
        email: 'ayesha.khan@philbox.com',
        contactNumber: '+92-333-2222222',
        passwordHash: hashedPassword,
        branches_to_be_managed: [],
        address_id: addresses[8]._id,
        status: 'active',
        roleId: salespersonRole._id,
        gender: 'Female',
        dateOfBirth: new Date('1995-09-18'),
      },
    ]);
    console.log('  ✓ Created 2 salespersons');

    // ==================== 6. BRANCHES ====================
    console.log('\n🏢 Seeding branches...');
    const branches = await Branch.insertMany([
      {
        name: 'Philbox Lahore Main',
        code: 'LHR-001',
        phone: '+92-42-1234567',
        under_administration_of: [admins[0]._id],
        salespersons_assigned: [salespersons[0]._id, salespersons[1]._id],
        salesperson_assignment_cursor: 0,
        address_id: addresses[0]._id,
        status: 'Active',
      },
      {
        name: 'Philbox Lahore Mochipura',
        code: 'LHR-002',
        phone: '+92-21-9876543',
        under_administration_of: [admins[1]._id],
        salespersons_assigned: [salespersons[0]._id, salespersons[1]._id],
        salesperson_assignment_cursor: 0,
        address_id: addresses[4]._id,
        status: 'Active',
      },
    ]);
    console.log('  ✓ Created 2 branches');

    // Update relationships: admins → branches, salespersons → branches
    await Admin.findByIdAndUpdate(superAdmin._id, {
      branches_managed: branches.map(b => b._id),
    });
    await Admin.findByIdAndUpdate(admins[0]._id, {
      branches_managed: [branches[0]._id],
    });
    await Admin.findByIdAndUpdate(admins[1]._id, {
      branches_managed: [branches[1]._id],
    });
    await Salesperson.findByIdAndUpdate(salespersons[0]._id, {
      branches_to_be_managed: [branches[0]._id, branches[1]._id],
    });
    await Salesperson.findByIdAndUpdate(salespersons[1]._id, {
      branches_to_be_managed: [branches[0]._id, branches[1]._id],
    });

    // Update address_of_persons_id for all persons
    await Address.findByIdAndUpdate(addresses[0]._id, {
      address_of_persons_id: customers[0]._id,
    });
    await Address.findByIdAndUpdate(addresses[1]._id, {
      address_of_persons_id: customers[1]._id,
    });
    await Address.findByIdAndUpdate(addresses[2]._id, {
      address_of_persons_id: customers[2]._id,
    });
    await Address.findByIdAndUpdate(addresses[5]._id, {
      address_of_persons_id: doctors[0]._id,
    });
    await Address.findByIdAndUpdate(addresses[6]._id, {
      address_of_persons_id: doctors[1]._id,
    });
    await Address.findByIdAndUpdate(addresses[7]._id, {
      address_of_persons_id: salespersons[0]._id,
    });
    await Address.findByIdAndUpdate(addresses[8]._id, {
      address_of_persons_id: salespersons[1]._id,
    });

    // ==================== 7. INVENTORY ====================
    console.log('\n💊 Seeding inventory data...');

    const itemClasses = await ItemClass.insertMany([
      { name: 'Tablet' },
      { name: 'Capsule' },
      { name: 'Syrup' },
      { name: 'Injection' },
      { name: 'Ointment' },
    ]);
    console.log('  ✓ Created 5 item classes');

    // Create categories and manufacturers
    const categories = await MedicineCategory.insertMany([
      { name: 'Pain Relief' },
      { name: 'Antibiotics' },
      { name: 'Cardiology' },
    ]);
    console.log('  ✓ Created 3 medicine categories');

    const manufacturers = await Manufacturer.insertMany([
      { name: 'Panadol' },
      { name: 'GlaxoSmithKline' },
      { name: 'Abbott' },
      { name: 'Pfizer' },
    ]);
    console.log('  ✓ Created 4 manufacturers');

    const medicines = await Medicine.insertMany([
      {
        Name: 'Panadol 500mg',
        alias_name: 'Paracetamol 500mg',
        mgs: '500mg',
        dosage_form: 'Tablet',
        manufacturer: manufacturers[0].name,
        category: categories[0].name,
        class: itemClasses[0]._id,
        sale_price: 5.0,
        purchase_price: 3.0,
        unit_price: 5.0,
        pack_unit: 1,
        active: true,
        prescription_required: false,
        lowStockThreshold: 50,
        description: 'Pain relief tablet',
        img_urls: ['https://example.com/panadol.jpg'],
      },
      {
        Name: 'Augmentin 625mg',
        alias_name: 'Amoxicillin-Clavulanic Acid 625mg',
        mgs: '625mg',
        dosage_form: 'Tablet',
        manufacturer: manufacturers[1].name,
        category: categories[1].name,
        class: itemClasses[0]._id,
        sale_price: 280.0,
        purchase_price: 220.0,
        unit_price: 280.0,
        pack_unit: 1,
        active: true,
        prescription_required: true,
        lowStockThreshold: 30,
        description: 'Antibiotic tablet',
        img_urls: ['https://example.com/augmentin.jpg'],
      },
      {
        Name: 'Brufen 400mg',
        alias_name: 'Ibuprofen 400mg',
        mgs: '400mg',
        dosage_form: 'Tablet',
        manufacturer: manufacturers[2].name,
        category: categories[0].name,
        class: itemClasses[0]._id,
        sale_price: 8.0,
        purchase_price: 5.5,
        unit_price: 8.0,
        pack_unit: 1,
        active: true,
        prescription_required: false,
        lowStockThreshold: 40,
        description: 'Anti-inflammatory tablet',
        img_urls: ['https://example.com/brufen.jpg'],
      },
      {
        Name: 'Lipitor 20mg',
        alias_name: 'Atorvastatin 20mg',
        mgs: '20mg',
        dosage_form: 'Tablet',
        manufacturer: manufacturers[0].name,
        category: categories[2].name,
        class: itemClasses[0]._id,
        sale_price: 320.0,
        purchase_price: 270.0,
        unit_price: 320.0,
        pack_unit: 1,
        active: true,
        prescription_required: true,
        lowStockThreshold: 25,
        description: 'Cholesterol-lowering medication',
        img_urls: ['https://example.com/lipitor.jpg'],
      },
      {
        Name: 'Amoxil Syrup 125mg',
        alias_name: 'Amoxicillin Syrup 125mg',
        mgs: '125ml',
        dosage_form: 'Syrup',
        manufacturer: manufacturers[3].name,
        category: categories[1].name,
        class: itemClasses[2]._id,
        sale_price: 150.0,
        purchase_price: 110.0,
        unit_price: 150.0,
        pack_unit: 1,
        active: true,
        prescription_required: false,
        lowStockThreshold: 20,
        description: 'Antibiotic syrup for children',
        img_urls: ['https://example.com/amoxil-syrup.jpg'],
      },
    ]);
    console.log('  ✓ Created 5 medicines');

    const stockInHand = await StockInHand.insertMany([
      {
        medicine_id: medicines[0]._id,
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        quantity: 1000,
        stockValue: 5000,
        packQty: 100,
        alertResolved: false,
      },
      {
        medicine_id: medicines[1]._id,
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        quantity: 500,
        stockValue: 140000,
        packQty: 50,
        alertResolved: false,
      },
      {
        medicine_id: medicines[2]._id,
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        quantity: 750,
        stockValue: 6000,
        packQty: 75,
        alertResolved: false,
      },
      {
        medicine_id: medicines[3]._id,
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        quantity: 300,
        stockValue: 45000,
        packQty: 30,
        alertResolved: false,
      },
      {
        medicine_id: medicines[4]._id,
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        quantity: 200,
        stockValue: 64000,
        packQty: 20,
        alertResolved: false,
      },
    ]);
    console.log('  ✓ Created 5 stock records');

    // ==================== 8. PATIENTS ====================
    console.log('\n🏥 Seeding patients...');
    const patients = await Patient.insertMany([
      {
        customer_id: customers[0]._id,
        blood_group: 'O+',
        weight: 75,
        height: 175,
      },
      {
        customer_id: customers[1]._id,
        blood_group: 'A+',
        weight: 58,
        height: 162,
      },
      {
        customer_id: customers[2]._id,
        blood_group: 'B-',
        weight: 82,
        height: 180,
      },
    ]);
    console.log(
      `  ✓ Created ${patients.length} patients (linked to customers)`
    );

    // ==================== 9. APPOINTMENTS ====================
    console.log('\n📅 Seeding appointments...');

    // appointment_request: 'processing' requires consultation_reason
    // appointment_request: 'accepted' or 'cancelled' does not
    const appointments = await Appointment.insertMany([
      {
        doctor_id: doctors[0]._id,
        patient_id: customers[0]._id,
        status: 'completed',
        appointment_type: 'online',
        appointment_request: 'accepted',
        preferred_date: new Date('2026-01-10'),
        preferred_time: '10:00',
        notes: 'Follow-up for cardiac checkup',
      },
      {
        doctor_id: doctors[0]._id,
        patient_id: customers[1]._id,
        status: 'pending',
        appointment_type: 'in-person',
        appointment_request: 'processing',
        consultation_reason:
          'Experiencing recurring chest pain and shortness of breath',
        preferred_date: new Date('2026-02-15'),
        preferred_time: '14:00',
      },
      {
        doctor_id: doctors[1]._id,
        patient_id: customers[2]._id,
        status: 'completed',
        appointment_type: 'online',
        appointment_request: 'accepted',
        preferred_date: new Date('2026-01-20'),
        preferred_time: '11:30',
        notes: 'Skin rash consultation',
      },
      {
        doctor_id: doctors[0]._id,
        patient_id: customers[1]._id,
        status: 'pending',
        appointment_type: 'online',
        appointment_request: 'accepted',
        preferred_date: new Date('2026-05-20'),
        preferred_time: '15:00',
        notes: 'Future accepted consultation for live room testing',
      },
    ]);
    console.log('  ✓ Created 4 appointments');

    // ==================== 10. TRANSACTIONS ====================
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
    console.log('  ✓ Created 2 appointment transactions');

    // Update appointments with transaction refs
    await Appointment.findByIdAndUpdate(appointments[0]._id, {
      transaction_id: transactions[0]._id,
    });
    await Appointment.findByIdAndUpdate(appointments[2]._id, {
      transaction_id: transactions[1]._id,
    });

    // ==================== 11. PRESCRIPTIONS ====================
    console.log('\n📋 Seeding prescriptions...');

    // Prescriptions generated by doctor (for completed appointments)
    const prescriptionsByDoctor =
      await PrescriptionGeneratedByDoctor.insertMany([
        {
          diagnosis_reason: 'Hypertension and mild cardiac irregularity',
          special_instructions:
            'Avoid strenuous physical activity. Low-sodium diet recommended.',
          digital_verification_id: 'DV-2026-001-SARAH',
          file_url: 'https://cloudinary.com/prescriptions/rx_001.pdf',
          valid_till: new Date('2026-04-10'),
          doctor_id: doctors[0]._id,
          patient_id: customers[0]._id,
          appointment_id: appointments[0]._id,
        },
        {
          diagnosis_reason: 'Chronic eczema with secondary bacterial infection',
          special_instructions:
            'Apply ointment twice daily. Avoid scratching affected areas.',
          digital_verification_id: 'DV-2026-002-BILAL',
          file_url: 'https://cloudinary.com/prescriptions/rx_002.pdf',
          valid_till: new Date('2026-04-20'),
          doctor_id: doctors[1]._id,
          patient_id: customers[2]._id,
          appointment_id: appointments[2]._id,
        },
      ]);
    console.log('  ✓ Created 2 doctor-generated prescriptions');

    // Prescription Items for each prescription
    const prescriptionItems = await PrescriptionItem.insertMany([
      // Items for prescription 1 (Dr. Sarah → Ahmed)
      {
        medicine_id: medicines[0]._id, // Panadol
        form: 'tablet',
        frequency: 'twice a day',
        duration_days: 14,
        quantity_prescribed: 28,
        dosage: '500mg',
        prescription_id: prescriptionsByDoctor[0]._id,
      },
      {
        medicine_id: medicines[4]._id, // Lipitor
        form: 'tablet',
        frequency: 'once a day',
        duration_days: 30,
        quantity_prescribed: 30,
        dosage: '20mg',
        prescription_id: prescriptionsByDoctor[0]._id,
      },
      // Items for prescription 2 (Dr. Bilal → Usman)
      {
        medicine_id: medicines[2]._id, // Brufen
        form: 'tablet',
        frequency: 'thrice a day',
        duration_days: 7,
        quantity_prescribed: 21,
        dosage: '400mg',
        prescription_id: prescriptionsByDoctor[1]._id,
      },
      {
        medicine_id: medicines[1]._id, // Augmentin
        form: 'tablet',
        frequency: 'twice a day',
        duration_days: 10,
        quantity_prescribed: 20,
        dosage: '625mg',
        prescription_id: prescriptionsByDoctor[1]._id,
      },
    ]);
    console.log('  ✓ Created 4 prescription items');

    // Link prescription items back to their prescriptions
    await PrescriptionGeneratedByDoctor.findByIdAndUpdate(
      prescriptionsByDoctor[0]._id,
      {
        prescription_items_ids: [
          prescriptionItems[0]._id,
          prescriptionItems[1]._id,
        ],
      }
    );
    await PrescriptionGeneratedByDoctor.findByIdAndUpdate(
      prescriptionsByDoctor[1]._id,
      {
        prescription_items_ids: [
          prescriptionItems[2]._id,
          prescriptionItems[3]._id,
        ],
      }
    );

    // Link prescriptions back to completed appointments
    await Appointment.findByIdAndUpdate(appointments[0]._id, {
      prescription_generated: prescriptionsByDoctor[0]._id,
    });
    await Appointment.findByIdAndUpdate(appointments[2]._id, {
      prescription_generated: prescriptionsByDoctor[1]._id,
    });

    // Prescriptions uploaded by customers
    const prescriptionsByCustomer =
      await PrescriptionUploadedByCustomer.insertMany([
        {
          patient_id: customers[1]._id,
          prescription_url:
            'https://cloudinary.com/uploads/rx_fatima_general.jpg',
          prescription_type: 'general',
          notes: 'Old prescription for reference, please process accordingly.',
        },
        // Will be linked to order after orders are created
        {
          patient_id: customers[0]._id,
          prescription_url: 'https://cloudinary.com/uploads/rx_ahmed_order.jpg',
          prescription_type: 'for-order',
          notes: 'Prescription for Augmentin order.',
        },
      ]);
    console.log('  ✓ Created 2 customer-uploaded prescriptions');

    // ==================== 12. ORDERS ====================
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

    const orderItems = await OrderItem.insertMany([
      {
        order_id: orders[0]._id,
        medicine_id: medicines[1]._id,
        branch_id: branches[0]._id,
        price: medicines[1].sale_price,
        medicine_name: medicines[1].Name,
        quantity: 2,
        subtotal: 560.0,
      },
      {
        order_id: orders[1]._id,
        medicine_id: medicines[3]._id,
        branch_id: branches[1]._id,
        price: medicines[3].sale_price,
        medicine_name: medicines[3].Name,
        quantity: 1,
        subtotal: 150.0,
      },
      {
        order_id: orders[1]._id,
        medicine_id: medicines[4]._id,
        branch_id: branches[1]._id,
        price: medicines[4].sale_price,
        medicine_name: medicines[4].Name,
        quantity: 1,
        subtotal: 320.0,
      },
      {
        order_id: orders[2]._id,
        medicine_id: medicines[2]._id,
        branch_id: branches[0]._id,
        price: medicines[2].sale_price,
        medicine_name: medicines[2].Name,
        quantity: 3,
        subtotal: 24.0,
      },
    ]);
    console.log('  ✓ Created 4 order items');

    // Link order items back to orders
    await Order.findByIdAndUpdate(orders[0]._id, {
      order_items: [orderItems[0]._id],
    });
    await Order.findByIdAndUpdate(orders[1]._id, {
      order_items: [orderItems[1]._id, orderItems[2]._id],
    });
    await Order.findByIdAndUpdate(orders[2]._id, {
      order_items: [orderItems[3]._id],
    });

    // Link the customer-uploaded "for-order" prescription to the order
    await PrescriptionUploadedByCustomer.findByIdAndUpdate(
      prescriptionsByCustomer[1]._id,
      {
        order_id: orders[0]._id,
      }
    );

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

    // ==================== 13. FEEDBACK & REVIEWS ====================
    console.log('\n⭐ Seeding feedback and reviews...');

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
        appointment_id: appointments[1]._id,
        rating: 4,
        message: 'Fast delivery, medicines were well packaged.',
        sentiment: 'positive',
      },
    ]);
    console.log('  ✓ Created 3 reviews');

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

    const complaints = await Complaint.insertMany([
      {
        customer_id: customers[1]._id,
        customer_address_id: addresses[1]._id,
        branch_admin_id: [admins[1]._id],
        title: 'Expired Medicine Received',
        description:
          'I received medicine that was past its expiry date in my last order. This is very concerning for customer safety.',
        category: 'order_issue',
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

    // ==================== 14. ADDITIONAL FEATURES ====================
    console.log('\n🔔 Seeding additional features...');

    const refillReminders = await RefillReminder.insertMany([
      {
        medicines: [medicines[4]._id],
        patient_id: customers[0]._id,
        frequency: 'monthly',
        timeOfDay: '08:00',
        notificationMethod: 'email',
        isActive: true,
        nextNotificationDate: new Date('2026-04-01'),
      },
      {
        medicines: [medicines[0]._id, medicines[2]._id],
        patient_id: customers[2]._id,
        frequency: 'weekly',
        timeOfDay: '09:00',
        notificationMethod: 'push',
        isActive: true,
        nextNotificationDate: new Date('2026-03-08'),
      },
    ]);
    console.log('  ✓ Created 2 refill reminders');

    const searchHistory = await SearchHistory.insertMany([
      {
        customer_id: customers[0]._id,
        query: 'paracetamol',
        searched_at: new Date('2026-01-20'),
        filters: {
          category: 'Pain Relief',
          brand: 'Panadol',
          branch: 'Philbox Lahore Main',
          dosage: '500mg',
          prescriptionStatus: 'otc',
          sortBy: 'name',
        },
      },
      {
        customer_id: customers[1]._id,
        query: 'antibiotic',
        searched_at: new Date('2026-01-22'),
        filters: {
          category: 'Antibiotics',
          prescriptionStatus: 'prescription_required',
          sortBy: 'price_low_to_high',
        },
      },
      {
        customer_id: customers[2]._id,
        query: 'pain killer',
        searched_at: new Date('2026-01-23'),
        filters: {
          category: 'Pain Relief',
          sortBy: 'name',
        },
      },
    ]);
    console.log('  ✓ Created 3 search history records');

    const salespersonTasks = await SalespersonTask.insertMany([
      {
        assigned_by_admin_id: admins[0]._id,
        assigned_by_role: 'branch-admin',
        salesperson_id: salespersons[0]._id,
        branch_id: branches[0]._id,
        title: 'Update inventory for Panadol stock',
        description: 'Check and update the current stock levels for Panadol.',
        priority: 'high',
        deadline: new Date('2026-03-15'),
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
        deadline: new Date('2026-03-10'),
        status: 'in-progress',
        updates: [
          {
            updated_by: salespersons[1]._id,
            role: 'salesperson',
            message: 'Called 3 customers so far. 2 more remaining.',
            updated_at: new Date(),
          },
        ],
      },
    ]);
    console.log('  ✓ Created 2 salesperson tasks');

    const appointmentMessages = await AppointmentMessage.insertMany([
      {
        text: 'Hello Doctor, I am experiencing chest pain.',
        from: 'patient',
        to: 'doctor',
        appointment_id: appointments[0]._id,
      },
      {
        text: 'Please describe the pain in detail. Is it sharp or dull?',
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
      {
        text: 'I have reviewed your condition. Please follow the prescription I have issued.',
        from: 'doctor',
        to: 'patient',
        appointment_id: appointments[2]._id,
      },
    ]);
    console.log('  ✓ Created 4 appointment messages');

    // ==================== 15. ACTIVITY LOGS ====================
    console.log('\n📝 Seeding activity logs...');

    const adminActivityLogs = await AdminActivityLog.insertMany([
      {
        admin_id: admins[0]._id,
        action_type: 'create_branch',
        description: 'Created new branch in Lahore',
        target_collection: 'branches',
        target_id: branches[0]._id,
        ip_address: '192.168.1.1',
        created_at: new Date('2026-01-01'),
      },
      {
        admin_id: admins[1]._id,
        action_type: 'assign_salesperson',
        description: 'Assigned salesperson to Karachi branch',
        target_collection: 'salespersons',
        target_id: salespersons[1]._id,
        ip_address: '192.168.1.10',
        created_at: new Date('2026-01-05'),
      },
    ]);
    console.log('  ✓ Created 2 admin activity logs');

    const doctorActivityLogs = await DoctorActivityLog.insertMany([
      {
        doctor_id: doctors[0]._id,
        action_type: 'complete_appointment',
        description: 'Completed appointment with patient Ahmed Hassan',
        target_collection: 'appointments',
        target_id: appointments[0]._id,
        ip_address: '192.168.2.5',
      },
      {
        doctor_id: doctors[0]._id,
        action_type: 'generate_prescription',
        description: 'Generated prescription after consultation',
        target_collection: 'prescriptions',
        target_id: prescriptionsByDoctor[0]._id,
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
    console.log('  ✓ Created 3 doctor activity logs');

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
        description: 'Booked appointment with Dr. Sarah Ahmed',
        target_collection: 'appointments',
        target_id: appointments[1]._id,
        ip_address: '192.168.3.25',
      },
      {
        customer_id: customers[0]._id,
        action_type: 'upload_prescription',
        description: 'Uploaded prescription for order',
        target_collection: 'prescriptions_uploaded_by_customers',
        target_id: prescriptionsByCustomer[1]._id,
        ip_address: '192.168.3.20',
      },
    ]);
    console.log('  ✓ Created 3 customer activity logs');

    const salespersonActivityLogs = await SalespersonActivityLog.insertMany([
      {
        salesperson_id: salespersons[0]._id,
        branch_id: branches[0]._id,
        action_type: 'add_medicine',
        description: 'Added Panadol 500mg to inventory',
        target_collection: 'medicine_items',
        target_id: medicines[0]._id,
        ip_address: '192.168.4.15',
        created_at: new Date(),
      },
      {
        salesperson_id: salespersons[1]._id,
        branch_id: branches[1]._id,
        action_type: 'update_stock',
        description: 'Updated stock levels for Amoxil Syrup',
        target_collection: 'stock_in_hand',
        target_id: stockInHand[3]._id,
        ip_address: '192.168.4.20',
        created_at: new Date(),
      },
    ]);
    console.log('  ✓ Created 2 salesperson activity logs');

    // ==================== 16. ANALYTICS ====================
    console.log('\n📊 Seeding analytics data...');

    const dailyAppointmentsAnalytics =
      await DailyAppointmentsAnalytics.insertMany([
        {
          date: new Date('2026-01-15'),
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

    const appointmentsAnalyticsHistory =
      await AppointmentsAnalyticsHistory.insertMany([
        {
          date: new Date('2026-01-20'),
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
          top_doctor_by_appointments: doctors[1]._id,
          top_doctor_by_revenue: doctors[1]._id,
          total_revenue_today: 1500,
          average_charge_per_appointment: 1500,
          appointments_per_doctor: [
            { doctor_id: doctors[1]._id, total_appointments: 1 },
          ],
          revenue_per_doctor: [{ doctor_id: doctors[1]._id, revenue: 1500 }],
        },
      ]);
    console.log('  ✓ Created 1 appointments analytics history');

    const medicineSalesAnalytics = await MedicineSalesAnalytics.insertMany([
      {
        order_id: orderItems[0].order_id,
        medicine_id: orderItems[0].medicine_id,
        branch_id: branches[0]._id,
        date: new Date('2026-01-20'),
        quantity: 2,
        revenue_generated: 560.0,
        refunds_count: 0,
      },
      {
        order_id: orderItems[3].order_id,
        medicine_id: orderItems[3].medicine_id,
        branch_id: branches[0]._id,
        date: new Date('2026-01-22'),
        quantity: 3,
        revenue_generated: 24.0,
        refunds_count: 0,
      },
    ]);
    console.log('  ✓ Created 2 medicine sales analytics');

    const branchPerformanceSummary = await BranchPerformanceSummary.insertMany([
      {
        branch_id: branches[0]._id,
        date: new Date('2026-01-31'),
        total_orders: 2,
        completed_orders: 2,
        cancelled_orders: 0,
        revenue_from_orders: 584.0,
        refunded_orders: 0,
        refund_amount: 0,
        new_complaints: 0,
        resolved_complaints: 0,
        average_rating: 4.5,
        feedback_count: 1,
        new_customers: 1,
        active_admins: 1,
        active_salespersons: 1,
        total_revenue: 2584.0,
        net_revenue: 2584.0,
      },
      {
        branch_id: branches[1]._id,
        date: new Date('2026-01-31'),
        total_orders: 1,
        completed_orders: 0,
        cancelled_orders: 0,
        revenue_from_orders: 470.0,
        refunded_orders: 0,
        refund_amount: 0,
        new_complaints: 1,
        resolved_complaints: 0,
        average_rating: 5.0,
        feedback_count: 1,
        new_customers: 1,
        active_admins: 1,
        active_salespersons: 1,
        total_revenue: 1970.0,
        net_revenue: 1970.0,
      },
    ]);
    console.log('  ✓ Created 2 branch performance summaries');

    // ==================== 17. INVENTORY FILES ====================
    console.log('\n📁 Seeding inventory files data...');

    const uploadedInventoryFiles = await UploadedInventoryFile.insertMany([
      {
        branch_id: branches[0]._id,
        salesperson_id: salespersons[0]._id,
        file_type: 'batch_wise_file',
        file_url: 'https://cloudinary.com/files/batch_jan_2026.xlsx',
        status: 'synced',
      },
      {
        branch_id: branches[1]._id,
        salesperson_id: salespersons[1]._id,
        file_type: 'stock_in_hand',
        file_url: 'https://cloudinary.com/files/stock_jan_2026.xlsx',
        status: 'pending',
      },
    ]);
    console.log('  ✓ Created 2 uploaded inventory files');

    const inventoryFilesLog = await InventoryFilesLog.insertMany([
      {
        uploaded_inventory_file: uploadedInventoryFiles[0]._id,
        status: 'resolved',
        target_medicine: medicines[0]._id,
        stock: stockInHand[0]._id,
        issue: 'Batch expiry date mismatch',
        action: 'retry',
        retryCount: 1,
        last_attempt: new Date(),
      },
    ]);

    // Link log back to uploaded file
    await UploadedInventoryFile.findByIdAndUpdate(
      uploadedInventoryFiles[0]._id,
      {
        logs: [inventoryFilesLog[0]._id],
      }
    );
    console.log('  ✓ Created 1 inventory files log');

    // ==================== 18. DOCTOR DOCUMENTS & APPLICATIONS ====================
    console.log('\n📄 Seeding doctor documents...');

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

    const doctorApplications = await DoctorApplication.insertMany([
      {
        applications_documents_id: doctorDocuments[0]._id,
        doctor_id: doctors[0]._id,
        status: 'approved',
        reviewed_by_admin_id: admins[0]._id,
        admin_comment: 'All documents verified and approved.',
        reviewed_at: new Date('2026-01-05'),
      },
      {
        applications_documents_id: doctorDocuments[1]._id,
        doctor_id: doctors[1]._id,
        status: 'rejected',
        reviewed_by_admin_id: admins[0]._id,
        admin_comment:
          'Medical license verification failed. Please upload a valid PMC license.',
        reviewed_at: new Date('2026-01-06'),
      },
    ]);
    console.log('  ✓ Created 2 doctor applications (1 approved, 1 rejected)');

    // ==================== 19. DOCTOR SLOTS ====================
    console.log('\n📅 Seeding doctor slots...');

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

    // Dr. Sarah Ahmed slots
    const sarahSlots = [];

    sarahSlots.push(
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-10'),
        start_time: '09:00',
        end_time: '09:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: false,
        notes: 'Morning consultation - General checkups',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-10'),
        start_time: '14:00',
        end_time: '14:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: false,
        notes: 'Afternoon consultation - Extended sessions',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-11'),
        start_time: '10:00',
        end_time: '10:20',
        slot_duration: 20,
        status: 'booked',
        is_recurring: false,
        appointment_id: appointments[0]._id,
        notes: 'Booked for patient consultation',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-12'),
        start_time: '09:00',
        end_time: '09:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: false,
        notes: 'Quick consultations - Follow-ups',
      },
      {
        doctor_id: doctors[0]._id,
        date: new Date('2026-01-13'),
        start_time: '15:00',
        end_time: '15:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: false,
        notes: 'Unavailable - Personal appointment',
      }
    );

    const weeklyDates = generateDateRange(
      new Date('2026-01-15'),
      new Date('2026-03-15'),
      'weekly',
      [1, 3, 5]
    );
    weeklyDates.forEach(date => {
      sarahSlots.push({
        doctor_id: doctors[0]._id,
        date,
        start_time: '10:00',
        end_time: '10:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'weekly',
          days_of_week: [1, 3, 5],
          end_date: new Date('2026-03-15'),
        },
        notes: 'Regular weekly availability - Mon/Wed/Fri',
      });
    });

    const monthlyDates = generateDateRange(
      new Date('2026-01-15'),
      new Date('2026-06-15'),
      'monthly'
    );
    monthlyDates.forEach(date => {
      sarahSlots.push({
        doctor_id: doctors[0]._id,
        date,
        start_time: '14:00',
        end_time: '14:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'monthly',
          days_of_week: [],
          end_date: new Date('2026-06-15'),
        },
        notes: 'Monthly special consultation day',
      });
    });

    // Dr. Bilal slots
    const bilalSlots = [];

    const dailyDates = generateDateRange(
      new Date('2026-01-10'),
      new Date('2026-01-17'),
      'daily'
    );
    dailyDates.forEach(date => {
      bilalSlots.push({
        doctor_id: doctors[1]._id,
        date,
        start_time: '11:00',
        end_time: '11:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'daily',
          days_of_week: [],
          end_date: new Date('2026-01-17'),
        },
        notes: 'Daily availability - Dermatology consultations',
      });
    });

    const weekendDates = generateDateRange(
      new Date('2026-01-11'),
      new Date('2026-02-28'),
      'weekly',
      [0, 6]
    );
    weekendDates.forEach(date => {
      bilalSlots.push({
        doctor_id: doctors[1]._id,
        date,
        start_time: '09:00',
        end_time: '09:20',
        slot_duration: 20,
        status: 'unbooked',
        is_recurring: true,
        recurring_pattern: {
          frequency: 'weekly',
          days_of_week: [0, 6],
          end_date: new Date('2026-02-28'),
        },
        notes: 'Weekend availability - Extended sessions',
      });
    });

    const doctorSlots = await DoctorSlot.insertMany([
      ...sarahSlots,
      ...bilalSlots,
    ]);
    console.log(
      `  ✓ Created ${doctorSlots.length} doctor slots (${sarahSlots.length} for Dr. Sarah, ${bilalSlots.length} for Dr. Bilal)`
    );

    // ==================== 20. DELIVERY & DELIVERY FARE ====================
    console.log('\n🚚 Seeding delivery data...');

    const deliveryFares = await DeliveryFare.insertMany([
      {
        min_distance_km: 0,
        max_distance_km: 5,
        fare_amount: 100,
        is_active: true,
      },
      {
        min_distance_km: 5,
        max_distance_km: 15,
        fare_amount: 150,
        is_active: true,
      },
      {
        min_distance_km: 15,
        max_distance_km: 35,
        fare_amount: 180,
        is_active: true,
      },
      {
        min_distance_km: 35,
        max_distance_km: 60,
        fare_amount: 220,
        is_active: true,
      },
      {
        min_distance_km: 60,
        max_distance_km: null,
        fare_amount: 280,
        is_active: true,
      },
    ]);
    console.log('  ✓ Created 5 delivery fares');

    const deliveries = await Delivery.insertMany([
      {
        order_id: orders[0]._id,
        customer_id: customers[0]._id,
        google_address_link: 'https://maps.google.com/?q=123+Main+St+Lahore',
        calculated_fare: 150,
      },
      {
        order_id: orders[1]._id,
        customer_id: customers[1]._id,
        google_address_link: 'https://maps.google.com/?q=456+Park+Ave+Karachi',
        calculated_fare: 200,
      },
      {
        order_id: orders[2]._id,
        customer_id: customers[2]._id,
        google_address_link:
          'https://maps.google.com/?q=789+Garden+Rd+Islamabad',
        calculated_fare: 180,
      },
    ]);
    console.log('  ✓ Created 3 deliveries');

    // ==================== 21. CART & CART ITEMS ====================
    console.log('\n🛍️  Seeding cart data...');

    const carts = await Cart.insertMany([
      {
        customer_id: customers[0]._id,
        total: 0,
        items: [],
      },
      {
        customer_id: customers[1]._id,
        total: 0,
        items: [],
      },
    ]);
    console.log('  ✓ Created 2 carts (active shopping carts)');

    const cartItems = await CartItem.insertMany([
      {
        cart_id: carts[0]._id,
        medicine_id: medicines[3]._id,
        branch_id: branches[1]._id,
        quantity: 1,
        price: medicines[3].sale_price,
        subtotal: medicines[3].sale_price,
      },
      {
        cart_id: carts[0]._id,
        medicine_id: medicines[4]._id,
        branch_id: branches[1]._id,
        quantity: 1,
        price: medicines[4].sale_price,
        subtotal: medicines[4].sale_price,
      },
      {
        cart_id: carts[1]._id,
        medicine_id: medicines[0]._id,
        branch_id: branches[0]._id,
        quantity: 3,
        price: medicines[0].sale_price,
        subtotal: medicines[0].sale_price * 3,
      },
      {
        cart_id: carts[1]._id,
        medicine_id: medicines[2]._id,
        branch_id: branches[0]._id,
        quantity: 1,
        price: medicines[2].sale_price,
        subtotal: medicines[2].sale_price,
      },
    ]);
    console.log('  ✓ Created 4 cart items');

    // Update cart totals and linked items
    await Cart.findByIdAndUpdate(carts[0]._id, {
      total: cartItems[0].subtotal + cartItems[1].subtotal,
      items: [cartItems[0]._id, cartItems[1]._id],
    });
    await Cart.findByIdAndUpdate(carts[1]._id, {
      total: cartItems[2].subtotal + cartItems[3].subtotal,
      items: [cartItems[2]._id, cartItems[3]._id],
    });

    // ==================== 22. REFUND WORKFLOW ====================
    console.log('\n💰 Seeding refund workflow data...');

    const customerRefundRequests = await CustomerRefundRequest.insertMany([
      {
        customer_id: customers[0]._id,
        order_id: orders[0]._id,
        reason: 'Received wrong medicine batch',
        requested_items: [
          {
            order_item_id: orderItems[0]._id,
            quantity: 1,
            unit_price: medicines[1].sale_price,
            requested_refund_amount: medicines[1].sale_price,
            branch_id: branches[0]._id,
          },
        ],
        total_requested_refund_amount: medicines[1].sale_price,
        status: 'approved',
        super_admin_notes: 'Verification successful. Approved for refund.',
        reviewed_by: superAdmin._id,
        reviewed_at: new Date(),
      },
      {
        customer_id: customers[1]._id,
        order_id: orders[1]._id,
        reason: 'Quality issue with received medicine',
        requested_items: [
          {
            order_item_id: orderItems[2]._id,
            quantity: 1,
            unit_price: medicines[4].sale_price,
            requested_refund_amount: medicines[4].sale_price,
            branch_id: branches[1]._id,
          },
        ],
        total_requested_refund_amount: medicines[4].sale_price,
        status: 'super_admin_review',
        reviewed_by: null,
        reviewed_at: null,
      },
      {
        customer_id: customers[2]._id,
        order_id: orders[2]._id,
        reason: 'Changed my mind about the purchase',
        requested_items: [
          {
            order_item_id: orderItems[3]._id,
            quantity: 2,
            unit_price: medicines[2].sale_price,
            requested_refund_amount: medicines[2].sale_price * 2,
            branch_id: branches[0]._id,
          },
        ],
        total_requested_refund_amount: medicines[2].sale_price * 2,
        status: 'rejected',
        rejection_reason: 'Return window has expired',
        reviewed_by: superAdmin._id,
        reviewed_at: new Date(),
      },
    ]);
    console.log('  ✓ Created 3 customer refund requests');

    const branchRefundAllocations = await BranchRefundAllocation.insertMany([
      {
        refund_request_id: customerRefundRequests[0]._id,
        branch_id: branches[0]._id,
        order_id: orders[0]._id,
        customer_id: customers[0]._id,
        allocated_items: [
          {
            order_item_id: orderItems[0]._id,
            quantity: 1,
            unit_price: medicines[1].sale_price,
            refund_amount: medicines[1].sale_price,
          },
        ],
        total_allocation_amount: medicines[1].sale_price,
        status: 'completed',
        branch_admin_notes:
          'Processed and refund initiated to customer account.',
        allocated_by: admins[0]._id,
        allocated_at: new Date('2026-01-25'),
        accepted_by: admins[0]._id,
        accepted_at: new Date('2026-01-26'),
        completed_by: admins[0]._id,
        completed_at: new Date('2026-01-27'),
      },
      {
        refund_request_id: customerRefundRequests[1]._id,
        branch_id: branches[1]._id,
        order_id: orders[1]._id,
        customer_id: customers[1]._id,
        allocated_items: [
          {
            order_item_id: orderItems[2]._id,
            quantity: 1,
            unit_price: medicines[4].sale_price,
            refund_amount: medicines[4].sale_price,
          },
        ],
        total_allocation_amount: medicines[4].sale_price,
        status: 'processing',
        branch_admin_notes: 'Quality inspection passing. Preparing refund.',
        allocated_by: superAdmin._id,
        allocated_at: new Date('2026-01-28'),
        accepted_by: admins[1]._id,
        accepted_at: new Date('2026-01-29'),
      },
    ]);
    console.log('  ✓ Created 2 branch refund allocations');

    // ==================== 23. COUPONS ====================
    console.log('\n🎟️  Seeding coupons...');
    const coupons = await Coupon.insertMany([
      {
        cupon_code: 'WELCOME10',
        expiry_time: new Date('2026-12-31'),
        percent_off: 10,
        for: 'medicine',
        is_active: true,
        max_use_limit: 100,
        times_used: 5,
      },
      {
        cupon_code: 'HEALTH20',
        expiry_time: new Date('2026-06-30'),
        percent_off: 20,
        for: 'appointments',
        is_active: true,
        max_use_limit: 50,
        times_used: 10,
      },
      {
        cupon_code: 'SUMMER15',
        expiry_time: new Date('2026-05-31'),
        percent_off: 15,
        for: 'medicine',
        is_active: false,
        max_use_limit: 75,
        times_used: 25,
      },
    ]);
    console.log(`  ✓ Created ${coupons.length} coupons`);

    // ==================== 24. REPORTS, ANNOUNCEMENTS & NOTIFICATIONS ====================
    console.log('\n📢 Seeding reports, announcements, and notifications...');

    const reports = await Report.insertMany([
      {
        title: 'Sales Report - January 2026',
        report_type: 'sales',
        date_from: new Date('2026-01-01'),
        date_to: new Date('2026-01-31'),
        branch_id: branches[0]._id,
        frequency: 'monthly',
        summary: {
          total_orders: 2,
          gross_revenue: 584,
        },
        data: {
          top_medicines: [medicines[1].Name, medicines[2].Name],
        },
        total_records: 2,
        admin_id: admins[0]._id,
        status: 'generated',
        is_scheduled: false,
      },
      {
        title: 'Appointments Report - January 2026',
        report_type: 'appointments',
        date_from: new Date('2026-01-01'),
        date_to: new Date('2026-01-31'),
        frequency: 'monthly',
        summary: {
          total_appointments: 3,
          completed: 2,
        },
        data: {
          doctors: [doctors[0].fullName, doctors[1].fullName],
        },
        total_records: 3,
        admin_id: superAdmin._id,
        status: 'generated',
        is_scheduled: true,
        schedule_next_date: new Date('2026-02-28'),
        is_active_schedule: true,
      },
    ]);
    console.log(`  ✓ Created ${reports.length} reports`);

    const announcements = await Announcement.insertMany([
      {
        title: 'System Maintenance Notice',
        message:
          'Philbox services will undergo maintenance tonight from 11:00 PM to 11:30 PM.',
        target_audience: 'all',
        delivery_methods: ['email', 'push', 'in-app'],
        scheduled_at: new Date('2026-02-01T23:00:00.000Z'),
        status: 'scheduled',
        created_by: superAdmin._id,
        notes: 'Planned monthly maintenance window',
      },
      {
        title: 'New Doctor Onboarding Update',
        message:
          'Please welcome newly approved doctors to the consultation portal this week.',
        target_audience: 'doctors',
        delivery_methods: ['email', 'in-app'],
        scheduled_at: new Date('2026-02-03T10:00:00.000Z'),
        sent_at: new Date('2026-02-03T10:05:00.000Z'),
        status: 'sent',
        created_by: admins[0]._id,
        delivery_status: {
          total_recipients: 2,
          sent: 2,
          failed: 0,
          pending: 0,
          by_method: {
            email: { sent: 2, failed: 0, pending: 0 },
            'in-app': { sent: 2, failed: 0, pending: 0 },
          },
        },
      },
    ]);
    console.log(`  ✓ Created ${announcements.length} announcements`);

    const notificationPreferences = await NotificationPreference.insertMany([
      {
        user_id: customers[0]._id,
        user_type: 'customer',
        appointment_reminders: { enabled: true, minutes_before: 45 },
        order_status_changes: { enabled: true },
        notification_channels: {
          push: true,
          email: true,
          sms: false,
          in_app: true,
        },
      },
      {
        user_id: doctors[0]._id,
        user_type: 'doctor',
        appointment_reminders: { enabled: true, minutes_before: 30 },
        consultation_messages: { enabled: true },
        quiet_hours_enabled: true,
        quiet_hours_start: '23:00',
        quiet_hours_end: '07:00',
      },
      {
        user_id: salespersons[0]._id,
        user_type: 'salesperson',
        new_tasks: { enabled: true },
        low_stock_alerts: { enabled: true },
        notification_channels: {
          push: true,
          email: true,
          sms: false,
          in_app: true,
        },
      },
    ]);
    console.log(
      `  ✓ Created ${notificationPreferences.length} notification preferences`
    );

    const deviceTokens = await DeviceToken.insertMany([
      {
        user_id: customers[0]._id,
        user_type: 'customer',
        token: 'fcm_customer_ahmed_token_001',
        device_type: 'android',
        device_name: 'Ahmed Pixel 7',
        is_active: true,
        user_agent: 'PhilboxMobile/1.0 Android',
      },
      {
        user_id: doctors[0]._id,
        user_type: 'doctor',
        token: 'fcm_doctor_sarah_token_001',
        device_type: 'ios',
        device_name: 'Dr Sarah iPhone 14',
        is_active: true,
        user_agent: 'PhilboxDoctor/1.0 iOS',
      },
      {
        user_id: salespersons[0]._id,
        user_type: 'salesperson',
        token: 'fcm_sales_ali_token_001',
        device_type: 'web',
        device_name: 'Ali Workstation',
        is_active: true,
        user_agent: 'Mozilla/5.0 PhilboxWeb',
      },
    ]);
    console.log(`  ✓ Created ${deviceTokens.length} device tokens`);

    const notificationLogs = await NotificationLog.insertMany([
      {
        user_id: customers[0]._id,
        user_type: 'customer',
        notification_type: 'order_status_change',
        title: 'Your order is completed',
        message: 'Order has been completed and is ready for delivery.',
        data: {
          order_id: orders[0]._id,
          status: 'completed',
        },
        channels_sent: ['push', 'in-app'],
        status: 'sent',
      },
      {
        user_id: doctors[0]._id,
        user_type: 'doctor',
        notification_type: 'new_message',
        title: 'New patient message',
        message: 'You have received a new message in appointment chat.',
        data: {
          appointment_id: appointments[0]._id,
        },
        channels_sent: ['in-app', 'socket'],
        status: 'sent',
        read_at: new Date('2026-01-11T10:45:00.000Z'),
      },
      {
        user_id: salespersons[0]._id,
        user_type: 'salesperson',
        notification_type: 'low_stock_alert',
        title: 'Low stock warning',
        message: 'Panadol 500mg stock is below threshold in branch inventory.',
        data: {
          medicine_id: medicines[0]._id,
          branch_id: branches[0]._id,
        },
        channels_sent: ['email', 'in-app'],
        status: 'pending',
      },
    ]);
    console.log(`  ✓ Created ${notificationLogs.length} notification logs`);

    const dailyMedicineRecommendations =
      await DailyMedicineRecommendations.insertMany([
        {
          date: new Date('2026-01-21'),
          customer_id: customers[0]._id,
          recommendations: [
            {
              medicine_id: medicines[0]._id,
              reason: 'Frequently ordered by customer',
              score: 0.93,
            },
            {
              medicine_id: medicines[2]._id,
              reason: 'Common co-purchase for pain management',
              score: 0.86,
            },
          ],
          count: 2,
          generated_source: 'system',
        },
        {
          date: new Date('2026-01-21'),
          customer_id: customers[1]._id,
          recommendations: [
            {
              medicine_id: medicines[4]._id,
              reason: 'Past prescription profile match',
              score: 0.88,
            },
          ],
          count: 1,
          generated_source: 'system',
        },
      ]);
    console.log(
      `  ✓ Created ${dailyMedicineRecommendations.length} daily medicine recommendations`
    );

    await backfillMissingFieldsAcrossModels();

    // ==================== SUMMARY ====================
    console.log('\n✅ Data seeding completed successfully!\n');
    console.log('='.repeat(60));
    console.log('SUMMARY:');
    console.log('='.repeat(60));
    const permissionsCount = await Permission.countDocuments();
    console.log(`✓ Roles: ${roles.length}`);
    console.log(`✓ Permissions: ${permissionsCount}`);
    console.log(`✓ Currencies: ${currencies.length}`);
    console.log(`✓ Addresses: ${addresses.length}`);
    console.log(`✓ Admins: ${admins.length + 1} (including super admin)`);
    console.log(`✓ Customers: ${customers.length}`);
    console.log(`✓ Patients: ${patients.length} (linked to customers)`);
    console.log(`✓ Doctors: ${doctors.length}`);
    console.log(`✓ Salespersons: ${salespersons.length}`);
    console.log(`✓ Branches: ${branches.length}`);
    console.log(`✓ Item Classes: ${itemClasses.length}`);
    console.log(`✓ Medicine Categories: ${categories.length}`);
    console.log(`✓ Manufacturers: ${manufacturers.length}`);
    console.log(`✓ Medicines: ${medicines.length}`);
    console.log(`✓ Stock Records: ${stockInHand.length}`);
    console.log(`✓ Appointments: ${appointments.length}`);
    console.log(`✓ Prescriptions (by doctor): ${prescriptionsByDoctor.length}`);
    console.log(`✓ Prescription Items: ${prescriptionItems.length}`);
    console.log(
      `✓ Prescriptions (by customer): ${prescriptionsByCustomer.length}`
    );
    console.log(`✓ Orders: ${orders.length}`);
    console.log(`✓ Order Items: ${orderItems.length}`);
    console.log(`✓ Deliveries: ${deliveries.length}`);
    console.log(`✓ Delivery Fares: ${deliveryFares.length}`);
    console.log(`✓ Carts: ${carts.length}`);
    console.log(`✓ Cart Items: ${cartItems.length}`);
    console.log(`✓ Customer Refund Requests: ${customerRefundRequests.length}`);
    console.log(
      `✓ Branch Refund Allocations: ${branchRefundAllocations.length}`
    );
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
    console.log(`✓ Coupons: ${coupons.length}`);
    console.log(`✓ Reports: ${reports.length}`);
    console.log(`✓ Announcements: ${announcements.length}`);
    console.log(
      `✓ Notification Preferences: ${notificationPreferences.length}`
    );
    console.log(`✓ Device Tokens: ${deviceTokens.length}`);
    console.log(`✓ Notification Logs: ${notificationLogs.length}`);
    console.log(
      `✓ Daily Medicine Recommendations: ${dailyMedicineRecommendations.length}`
    );
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
