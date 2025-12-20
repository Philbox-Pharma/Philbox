import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  getAppointmentTrends,
  getCompletionMissedRate,
  getTopDoctorsByAppointments,
  getTopDoctorsByRevenue,
  getAppointmentTypesDistribution,
  getAverageRevenue,
  getDashboardOverview,
  aggregateAppointmentData,
} from '../controller/appointmentAnalytics.controller.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  getAppointmentAnalyticsDTO,
  aggregateAppointmentsDTO,
} from '../../../../../dto/admin/appointmentAnalytics.dto.js';

const router = express.Router();

// 🔒 All routes require Admin Authentication
router.use(authenticate);

/**
 * ===== APPOINTMENT ANALYTICS ENDPOINTS =====
 */

// 📈 GET Appointment Trends (Daily/Weekly/Monthly - Line Chart)
router.get(
  '/trends',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getAppointmentTrends
);

// 📊 GET Completion vs Missed Rate (Pie Chart)
router.get(
  '/completion-rate',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getCompletionMissedRate
);

// 🏆 GET Top 5 Doctors by Appointments (Bar Chart)
router.get(
  '/top-doctors/appointments',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getTopDoctorsByAppointments
);

// 💰 GET Top 5 Doctors by Revenue (Bar Chart)
router.get(
  '/top-doctors/revenue',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getTopDoctorsByRevenue
);

// 🏥 GET Appointment Types Distribution (In-person vs Online - Pie Chart)
router.get(
  '/appointment-types',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getAppointmentTypesDistribution
);

// 💵 GET Average Appointment Revenue (KPI Card)
router.get(
  '/average-revenue',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getAverageRevenue
);

// 🎯 GET Dashboard Overview (All analytics in one call)
router.get(
  '/overview',
  validate(getAppointmentAnalyticsDTO, 'query'),
  getDashboardOverview
);

/**
 * ===== ADMIN UTILITY ENDPOINTS =====
 */

// 🔄 POST Aggregate Appointment Data (Manual trigger for aggregation)
router.post(
  '/aggregate',
  validate(aggregateAppointmentsDTO),
  aggregateAppointmentData
);

export default router;
