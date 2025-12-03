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
import adminAdminManagementRoutes from './modules/admin/features/admin_management/routes/admin.routes.js';
import adminBranchManagementRoutes from './modules/admin/features/branch_management/routes/branch.routes.js';
import adminSalespersonManagementRoutes from './modules/admin/features/salesperson_management/routes/salesperson.routes.js';

import doctorAuthRoutes from './modules/doctor/auth/routes/auth.routes.js';

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
app.use(session(SESSION));

app.use((req, res, next) => {
  console.log('=== SESSION DEBUG ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  console.log('Cookie Header:', req.headers.cookie);
  console.log('===================\n');
  next();
});

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', healthRouter);
app.use(`/api/${ROUTES.ADMIN_AUTH}`, adminAuthRoutes);
app.use(`/api/${ROUTES.SUPER_ADMIN}`, adminAdminManagementRoutes);
app.use(`/api/${ROUTES.SUPER_ADMIN}`, adminBranchManagementRoutes);
app.use(`/api/${ROUTES.SUPER_ADMIN}`, adminSalespersonManagementRoutes);

app.use(`/api/${ROUTES.DOCTOR_AUTH}`, doctorAuthRoutes);

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
