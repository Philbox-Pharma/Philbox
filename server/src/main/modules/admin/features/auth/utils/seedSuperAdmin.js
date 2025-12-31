import Admin from '../../../../../models/Admin.js';
import Role from '../../../../../models/Role.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seedSuperAdmin() {
  const existing = await Admin.findOne({ category: 'super-admin' });
  if (existing) {
    console.log('Super-Admin already exists: ', existing.email);
    return;
  }

  const email = process.env.SUPERADMIN_EMAIL;
  const rawPassword = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  if (!email || !rawPassword) {
    console.warn(
      'SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set in .env — skipping super-admin seed '
    );
    return;
  }

  // Get super_admin role
  let superAdminRole = await Role.findOne({ name: 'super_admin' });
  if (!superAdminRole) {
    console.error(
      '❌ super_admin role not found. Please run "npm run seed:roles" first'
    );
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(rawPassword, salt);
  const ADMIN_DATA = {
    name,
    email,
    password: hashed,
    category: 'super-admin',
    roleId: superAdminRole._id, // 🔐 Assign super_admin role
  };
  const admin = new Admin(ADMIN_DATA);
  await admin.save();
  console.log('✅ Super-admin created:', email);
}

export default seedSuperAdmin;
