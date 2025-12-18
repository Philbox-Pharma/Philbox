import mongoose from 'mongoose';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import dotenv from 'dotenv';

dotenv.config();

const seedRolesAndPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    // await Role.deleteMany({});
    // await Permission.deleteMany({});

    // Define all permissions by resource and action
    const permissionsList = [
      // User Management Permissions
      { resource: 'users', action: 'create', description: 'Create users' },
      { resource: 'users', action: 'read', description: 'Read users' },
      { resource: 'users', action: 'update', description: 'Update users' },
      { resource: 'users', action: 'delete', description: 'Delete users' },

      // Branch Management Permissions
      {
        resource: 'branches',
        action: 'create',
        description: 'Create branches',
      },
      { resource: 'branches', action: 'read', description: 'Read branches' },
      {
        resource: 'branches',
        action: 'update',
        description: 'Update branches',
      },
      {
        resource: 'branches',
        action: 'delete',
        description: 'Delete branches',
      },

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
    ];

    // Upsert permissions
    const permissions = {};
    for (const permData of permissionsList) {
      const permissionName = `${permData.action}_${permData.resource}`;
      const permission = await Permission.findOneAndUpdate(
        { resource: permData.resource, action: permData.action },
        {
          name: permissionName,
          ...permData,
        },
        { upsert: true, new: true }
      );
      permissions[permissionName] = permission._id;
    }

    console.log(
      '✅ Permissions created/updated:',
      Object.keys(permissions).length
    );

    // Define roles with their permissions based on Philbox proposal
    // Reference: https://github.com/shah541-g/Philbox/blob/main/proposal.pdf
    const rolesConfig = [
      {
        name: 'super_admin',
        description:
          'Super Administrator - Full system access including branch management, user approval, and analytics',
        permissions: Object.values(permissions), // All permissions
      },
      {
        name: 'branch_admin',
        description:
          'Branch Administrator - Manage branch operations, staff, inventory, and customer data within assigned branches',
        permissions: [
          // Branch Management
          permissions['read_branches'],
          permissions['update_branches'],

          // User Management
          permissions['create_users'],
          permissions['read_users'],
          permissions['update_users'],

          // Doctor Management (view and update profile)
          permissions['read_doctors'],
          permissions['update_doctors'],

          // Customer Management (view and update within branch)
          permissions['read_customers'],
          permissions['update_customers'],

          // Salesperson Management (view and update)
          permissions['read_salespersons'],
          permissions['update_salespersons'],

          // Appointment Management (view)
          permissions['read_appointments'],
          permissions['update_appointments'],

          // Reports & Analytics
          permissions['read_reports'],
        ].filter(Boolean),
      },
      {
        name: 'salesperson',
        description:
          'Salesperson - Handle inventory updates, order processing, prescription verification, and low-stock management',
        permissions: [
          // Inventory Management - CRUD operations on medicines
          permissions['create_users'], // Create new inventory items
          permissions['read_users'], // View inventory
          permissions['update_users'], // Update stock quantities
          permissions['delete_users'], // Delete/disable medicines for expiry

          // Order Management - view and update status
          permissions['read_users'], // View orders
          permissions['update_users'], // Mark as packed/ready for delivery

          // Prescriptions - view for verification
          permissions['read_prescriptions'],
          permissions['update_prescriptions'], // Verify prescriptions

          // Customers - view details for order context
          permissions['read_customers'],

          // Appointments - view for consultation context
          permissions['read_appointments'],

          // Alerts & Reports - view dashboard and low-stock alerts
          permissions['read_reports'],
        ].filter(Boolean),
      },
      {
        name: 'doctor',
        description:
          'Doctor - Manage consultation schedules, appointments, prescriptions, and patient interactions',
        permissions: [
          // Appointments - full control over own appointments
          permissions['read_appointments'],
          permissions['update_appointments'], // Accept/reject requests
          permissions['create_appointments'], // Set availability

          // Prescriptions - create and manage own
          permissions['create_prescriptions'],
          permissions['read_prescriptions'],
          permissions['update_prescriptions'],

          // Customers - view for patient medical history context
          permissions['read_customers'],

          // Reports - view own performance analytics
          permissions['read_reports'],
        ].filter(Boolean),
      },
      {
        name: 'customer',
        description:
          'Customer - Browse medicines, place orders, book appointments, upload prescriptions, and manage own data',
        permissions: [
          // Medicines - browse and search catalog
          permissions['read_users'],

          // Orders - place, view history, and manage own orders
          permissions['create_users'], // Place orders
          permissions['read_users'], // View order history and status
          permissions['update_users'], // Reschedule/cancel orders

          // Appointments - book, view, and reschedule own appointments
          permissions['create_appointments'], // Request appointments
          permissions['read_appointments'], // View appointment history
          permissions['update_appointments'], // Reschedule appointments

          // Prescriptions - upload and view own
          permissions['read_prescriptions'],
          permissions['update_prescriptions'], // Upload prescriptions

          // Feedback - submit and view reviews
          permissions['create_users'], // Submit reviews/feedback
          permissions['read_users'], // View feedback on doctors/medicines

          // Reports - view own order receipts and invoices
          permissions['read_reports'],
        ].filter(Boolean),
      },
    ];

    // Upsert roles
    for (const roleConfig of rolesConfig) {
      const role = await Role.findOneAndUpdate(
        { name: roleConfig.name },
        roleConfig,
        { upsert: true, new: true }
      );
      console.log(
        `✅ Role '${role.name}' created/updated with ${role.permissions.length} permissions`
      );
    }

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedRolesAndPermissions();
