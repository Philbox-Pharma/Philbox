import express from 'express';
import DoctorCatalogController from '../controllers/catalog.controller.js';
import { authenticate as requireCustomerAuth } from '../../../middleware/auth.middleware.js';
import {
  roleMiddleware,
  rbacMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';

const router = express.Router();

router.use(requireCustomerAuth);
router.use(roleMiddleware(['customer']));

router.get(
  '/',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.browseDoctors.bind(DoctorCatalogController)
);
router.get(
  '/search',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.browseDoctors.bind(DoctorCatalogController)
);
router.get(
  '/specializations',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.getSpecializations.bind(DoctorCatalogController)
);
router.get(
  '/:doctorId/reviews',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.getDoctorReviews.bind(DoctorCatalogController)
);
router.get(
  '/:doctorId/availability-calendar',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.getDoctorAvailabilityCalendar.bind(
    DoctorCatalogController
  )
);
router.get(
  '/:doctorId',
  rbacMiddleware(['read_appointments']),
  DoctorCatalogController.getDoctorProfile.bind(DoctorCatalogController)
);

export default router;
