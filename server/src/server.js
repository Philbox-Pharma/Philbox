import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import connectDB from './config/db.config.js';
import seedSuperAdmin from './modules/admin/features/auth/utils/seedSuperAdmin.js';

import adminAuthRoutes from './modules/admin/features/auth/routes/auth.routes.js';
import adminUserManagementRoutes from './modules/admin/features/user_management/routes/user.routes.js';
import adminBranchManagementRoutes from './modules/admin/features/branch_management/routes/branch.routes.js';
import permissionsManagementRoutes from './modules/admin/features/permissions_management/routes/permissions.routes.js';
import adminDoctorManagementRoutes from './modules/admin/features/doctor_management/routes/doctor.routes.js';
import adminCustomerManagementRoutes from './modules/admin/features/customer_management/routes/customer.routes.js';
import appointmentAnalyticsRoutes from './modules/admin/features/dashboard_management/appointment_analytics/routes/appointmentAnalytics.routes.js';
import revenueAnalyticsRoutes from './modules/admin/features/dashboard_management/revenue_analytics/routes/revenueAnalytics.routes.js';

import doctorAuthRoutes from './modules/doctor/features/auth/routes/auth.routes.js';
import passport from './modules/doctor/features/auth/config/passport.js';

import customerAuthRoutes from './modules/customer/features/auth/routes/auth.routes.js';

import salespersonAuthRoutes from './modules/salesperson/features/auth/routes/auth.routes.js';

import healthRouter from './shared/routes/health.route.js';

import { ROUTES } from './constants/global.routes.constants.js';

dotenv.config();

const app = express();

const STORE = {
  mongoUrl: process.env.MONGO_URI,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
};
const COOKIE = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: 'lax',
};

const SESSION = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create(STORE),
  cookie: COOKIE,
};

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session(SESSION));

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', healthRouter);
app.use(`/api/${ROUTES.ADMIN_AUTH}`, adminAuthRoutes);
app.use(`/api/${ROUTES.ADMIN}/users`, adminUserManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}`, adminBranchManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/permissions`, permissionsManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/doctors`, adminDoctorManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/customers`, adminCustomerManagementRoutes);
app.use(
  `/api/${ROUTES.ADMIN}/appointment-analytics`,
  appointmentAnalyticsRoutes
);
app.use(`/api/${ROUTES.ADMIN}/revenue-analytics`, revenueAnalyticsRoutes);

app.use(`/api/${ROUTES.DOCTOR_AUTH}`, doctorAuthRoutes);
app.use(`/api/${ROUTES.CUSTOMER_AUTH}`, customerAuthRoutes);
app.use(`/api/${ROUTES.SALESPERSON_AUTH}`, salespersonAuthRoutes);

const start_server = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await seedSuperAdmin();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on the port ${port}`));
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
};

start_server();
