import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import connectDB from './config/db.config.js';
import { initializeSocket, getIO } from './config/socket.config.js';
import reminderScheduler from './utils/reminderScheduler.js';
import medicineRecommendationScheduler from './utils/medicineRecommendationScheduler.js';
import announcementScheduler, {
  setAnnouncementSchedulerIO,
} from './utils/announcementScheduler.js';
import activityLogCleanupScheduler from './utils/activityLogCleanupScheduler.js';
import reportScheduler from './utils/reportScheduler.js';

import adminAuthRoutes from './modules/admin/features/auth/routes/auth.routes.js';
import adminUserManagementRoutes from './modules/admin/features/user_management/routes/user.routes.js';
import adminBranchManagementRoutes from './modules/admin/features/branch_management/routes/branch.routes.js';
import permissionsManagementRoutes from './modules/admin/features/permissions_management/routes/permissions.routes.js';
import adminDoctorManagementRoutes from './modules/admin/features/doctor_management/routes/doctor.routes.js';
import adminCustomerManagementRoutes from './modules/admin/features/customer_management/routes/customer.routes.js';
import adminProfileRoutes from './modules/admin/features/profile_management/routes/profile.routes.js';
import couponManagementRoutes from './modules/admin/features/coupon_management/routes/coupon.routes.js';
import appointmentAnalyticsRoutes from './modules/admin/features/dashboard_management/appointment_analytics/routes/appointmentAnalytics.routes.js';
import revenueAnalyticsRoutes from './modules/admin/features/dashboard_management/revenue_analytics/routes/revenueAnalytics.routes.js';
import ordersAnalyticsRoutes from './modules/admin/features/dashboard_management/orders_analytics/routes/ordersAnalytics.routes.js';
import userEngagementAnalyticsRoutes from './modules/admin/features/dashboard_management/user_engagement_analytics/routes/userEngagementAnalytics.routes.js';
import feedbackComplaintsAnalyticsRoutes from './modules/admin/features/dashboard_management/feedback_complaints_analytics/routes/feedbackComplaintsAnalytics.routes.js';
import activityLogsAnalyticsRoutes from './modules/admin/features/dashboard_management/activity_logs_analytics/routes/activityLogsAnalytics.routes.js';
import salespersonTaskRoutes from './modules/admin/features/salesperson_task_management/routes/salespersonTask.routes.js';
import salespersonPerformanceRoutes from './modules/admin/features/dashboard_management/salesperson_performance/routes/salespersonPerformance.routes.js';
import adminMedicineRecommendationsRoutes from './modules/admin/features/dashboard_management/medicine_recommendations/routes/medicineRecommendations.routes.js';
import reportManagementRoutes from './modules/admin/features/report_management/routes/report.routes.js';
import dataExportRoutes from './modules/admin/features/data_export/routes/export.routes.js';

import doctorAuthRoutes from './modules/doctor/features/auth/routes/auth.routes.js';
import doctorOnboardingRoutes from './modules/doctor/features/onboarding/routes/onboarding.routes.js';
import doctorProfileRoutes from './modules/doctor/features/profile/routes/profile.routes.js';
import doctorSlotsRoutes from './modules/doctor/features/slots/routes/slots.routes.js';
import doctorAppointmentsRoutes from './modules/doctor/features/appointments/routes/appointments.routes.js';
import doctorReviewsRoutes from './modules/doctor/features/reviews/routes/reviews.routes.js';
import doctorConsultationsRoutes from './modules/doctor/features/consultations/routes/consultations.routes.js';
import doctorMedicalHistoryRoutes from './modules/doctor/features/medical_history/routes/medicalHistory.routes.js';
import doctorPrescriptionGeneratorRoutes from './modules/doctor/features/prescriptions/routes/prescription.routes.js';
import passport from './modules/doctor/features/auth/config/passport.config.js';

import customerAuthRoutes from './modules/customer/features/auth/routes/auth.routes.js';
import customerProfileRoutes from './modules/customer/features/profile/routes/profile.routes.js';
import customerDashboardRoutes from './modules/customer/features/dashboard/routes/dashboard.routes.js';
import customerSearchHistoryRoutes from './modules/customer/features/search_history/routes/searchHistory.routes.js';
import customerRefillReminderRoutes from './modules/customer/features/refill_reminder/routes/refillReminder.routes.js';
import customerAppointmentsRoutes from './modules/customer/features/appointments/routes/appointments.routes.js';
import customerDoctorCatalogRoutes from './modules/customer/features/doctor_catalog/routes/catalog.routes.js';
import customerPrescriptionRoutes from './modules/customer/features/prescriptions/routes/prescriptions.routes.js';
import customerMedicineCatalogRoutes from './modules/customer/features/medicine_catalog/routes/catalog.routes.js';
import customerCartRoutes from './modules/customer/features/cart/routes/cart.routes.js';
import customerRefundRequestRoutes from './modules/customer/features/customer_refund_request/routes/customerRefundRequest.routes.js';
import customerOrderManagementRoutes from './modules/customer/features/order_management/routes/orderManagement.routes.js';
import customerComplaintsRoutes from './modules/customer/features/complaints/routes/complaints.routes.js';

import salespersonAuthRoutes from './modules/salesperson/features/auth/routes/auth.routes.js';
import customerCheckoutRoutes from './modules/customer/features/checkout/routes/checkout.routes.js';

import salespersonTaskManagementRoutes from './modules/salesperson/features/task_management/routes/task.routes.js';
import lowStockAlertsRoutes from './modules/salesperson/features/low_stock_alerts/routes/lowStockAlerts.routes.js';
import salespersonDashboardRoutes from './modules/salesperson/features/dashboard/routes/dashboard.routes.js';
import inventoryUploadRoutes from './modules/salesperson/features/inventory_upload/routes/inventoryUpload.routes.js';
import salespersonInventoryRoutes from './modules/salesperson/features/inventory/routes/inventory.routes.js';
import salespersonOrderProcessingRoutes from './modules/salesperson/features/order_processing/routes/orderProcessing.routes.js';
import customerRefundManagementRoutes from './modules/admin/features/customer_refund_management/routes/customerRefundManagement.routes.js';
import adminRefundAllocationRoutes from './modules/admin/features/refund_allocation_management/routes/refundAllocation.routes.js';
import adminDeliveryFareRoutes from './modules/admin/features/delivery_fare_management/routes/deliveryFare.routes.js';
import adminComplaintManagementRoutes from './modules/admin/features/complaint_management/routes/complaintManagement.routes.js';
import announcementManagementRoutes from './modules/admin/features/announcement_management/routes/announcement.routes.js';

import healthRouter from './shared/routes/health.route.js';
import notificationsRoutes from './modules/shared/notifications/routes/notifications.routes.js';

import { ROUTES } from './constants/global.routes.constants.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Determine if running in secure environment (production or staging with HTTPS)
const isSecureEnvironment =
  process.env.NODE_ENV === 'production' ||
  process.env.USE_SECURE_COOKIES === 'true';

// Configure allowed origins for CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin =>
      origin.trim().replace(/\/$/, '')
    )
  : ['https://philbox-staging.up.railway.app', 'http://localhost:5173'];

const STORE = {
  mongoUrl: process.env.MONGO_URI,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
};

const COOKIE = {
  secure: isSecureEnvironment,
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: isSecureEnvironment ? 'none' : 'lax',
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
};

const SESSION = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create(STORE),
  cookie: COOKIE,
  name: 'philbox.sid',
};

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Normalize origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check if origin is in allowed list
      if (
        allowedOrigins.indexOf(normalizedOrigin) !== -1 ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin);
        console.warn('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie'],
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
app.use('/api/notifications', notificationsRoutes);
app.use(`/api/${ROUTES.ADMIN_AUTH}`, adminAuthRoutes);
app.use(`/api/${ROUTES.ADMIN}/users`, adminUserManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}`, adminBranchManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/permissions`, permissionsManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/doctors`, adminDoctorManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/customers`, adminCustomerManagementRoutes);
app.use(`/api/${ROUTES.ADMIN}/profile`, adminProfileRoutes);
app.use(`/api/${ROUTES.ADMIN}/coupons`, couponManagementRoutes);
app.use(
  `/api/${ROUTES.ADMIN}/appointment-analytics`,
  appointmentAnalyticsRoutes
);
app.use(`/api/${ROUTES.ADMIN}/revenue-analytics`, revenueAnalyticsRoutes);
app.use(`/api/${ROUTES.ADMIN}/orders-analytics`, ordersAnalyticsRoutes);
app.use(
  `/api/${ROUTES.ADMIN}/user-engagement-analytics`,
  userEngagementAnalyticsRoutes
);
app.use(
  `/api/${ROUTES.ADMIN}/feedback-complaints-analytics`,
  feedbackComplaintsAnalyticsRoutes
);
app.use(
  `/api/${ROUTES.ADMIN}/activity-logs-analytics`,
  activityLogsAnalyticsRoutes
);
app.use(`/api/${ROUTES.ADMIN}/salesperson-tasks`, salespersonTaskRoutes);
app.use(
  `/api/${ROUTES.ADMIN}/salesperson-performance`,
  salespersonPerformanceRoutes
);
app.use(
  `/api/${ROUTES.ADMIN}/medicine-recommendations`,
  adminMedicineRecommendationsRoutes
);

app.use(`/api/${ROUTES.DOCTOR_AUTH}`, doctorAuthRoutes);
app.use(`/api/doctor/onboarding`, doctorOnboardingRoutes);
app.use(`/api/doctor/profile`, doctorProfileRoutes);
app.use(`/api/doctor/slots`, doctorSlotsRoutes);
app.use(`/api/doctor/appointments`, doctorAppointmentsRoutes);
app.use(`/api/doctor/reviews`, doctorReviewsRoutes);
app.use(`/api/doctor/consultations`, doctorConsultationsRoutes);
app.use(`/api/doctor/prescriptions`, doctorPrescriptionGeneratorRoutes);
app.use(`/api/doctor/patients`, doctorMedicalHistoryRoutes);
app.use(`/api/${ROUTES.CUSTOMER_AUTH}`, customerAuthRoutes);
app.use(`/api/customer/profile`, customerProfileRoutes);
app.use(`/api/customer/dashboard`, customerDashboardRoutes);
app.use(`/api/customer/search-history`, customerSearchHistoryRoutes);
app.use(`/api/customer/refill-reminders`, customerRefillReminderRoutes);
app.use(`/api/customer/appointments`, customerAppointmentsRoutes);
app.use(`/api/customer/doctor-catalog`, customerDoctorCatalogRoutes);
app.use(`/api/customer/prescriptions`, customerPrescriptionRoutes);
app.use(`/api/customer/medicines`, customerMedicineCatalogRoutes);
app.use(`/api/customer/cart`, customerCartRoutes);
app.use(`/api/customer/refund-requests`, customerRefundRequestRoutes);
app.use(`/api/customer/order-management`, customerOrderManagementRoutes);
app.use(`/api/customer/complaints`, customerComplaintsRoutes);
app.use(`/api/${ROUTES.SALESPERSON_AUTH}`, salespersonAuthRoutes);
app.use(`/api/customer/checkout`, customerCheckoutRoutes);
app.use(`/api/salesperson/tasks`, salespersonTaskManagementRoutes);
app.use(`/api/salesperson/alerts`, lowStockAlertsRoutes);
app.use(`/api/salesperson/dashboard`, salespersonDashboardRoutes);
app.use(`/api/salesperson/inventory`, inventoryUploadRoutes);
app.use(`/api/salesperson/inventory`, salespersonInventoryRoutes);
app.use(`/api/salesperson/order-processing`, salespersonOrderProcessingRoutes);
app.use(`/api/admin/customer-refunds`, customerRefundManagementRoutes);
app.use(`/api/admin/refund-allocations`, adminRefundAllocationRoutes);
app.use(`/api/admin/delivery-fares`, adminDeliveryFareRoutes);
app.use(`/api/admin/complaints`, adminComplaintManagementRoutes);
app.use(`/api/admin/announcements`, announcementManagementRoutes);
app.use(`/api/admin/reports`, reportManagementRoutes);
app.use(`/api/admin/exports`, dataExportRoutes);

const start_server = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const port = process.env.PORT || 5000;

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);
    console.log('✅ Socket.IO initialized');

    // Get IO instance and pass to announcement scheduler
    const io = getIO();
    setAnnouncementSchedulerIO(io);

    // Start reminder scheduler
    reminderScheduler.start();
    medicineRecommendationScheduler.start();
    announcementScheduler.start();
    activityLogCleanupScheduler.start();
    reportScheduler.start();
    console.log('✅ Schedulers started');

    httpServer.listen(port, () =>
      console.log(`Server running on the port ${port}`)
    );
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
};

start_server();
