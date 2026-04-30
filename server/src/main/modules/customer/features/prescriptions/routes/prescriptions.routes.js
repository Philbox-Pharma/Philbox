import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import {
  rbacMiddleware,
  roleMiddleware,
} from '../../../../../middlewares/rbac.middleware.js';
import { upload } from '../../../../../middlewares/multer.middleware.js';
import prescriptionsController from '../controllers/prescriptions.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(roleMiddleware(['customer']));

router.get(
  '/',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getMyPrescriptions.bind(prescriptionsController)
);

router.get(
  '/stats',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getPrescriptionStats.bind(prescriptionsController)
);

router.get(
  '/uploads',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getUploadedPrescriptions.bind(prescriptionsController)
);

router.post(
  '/upload',
  rbacMiddleware(['create_checkout', 'create_prescriptions']),
  upload.single('prescription'),
  prescriptionsController.uploadPrescription.bind(prescriptionsController)
);

router.get(
  '/:prescriptionId/pdf',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getPrescriptionPDF.bind(prescriptionsController)
);

router.get(
  '/:prescriptionId/print',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getPrescriptionPDF.bind(prescriptionsController)
);

router.get(
  '/:prescriptionId',
  rbacMiddleware(['read_checkout']),
  prescriptionsController.getPrescriptionDetails.bind(prescriptionsController)
);

router.post(
  '/:prescriptionId/order-medicines',
  rbacMiddleware(['create_cart', 'create_orders', 'read_checkout']),
  prescriptionsController.addPrescriptionMedicinesToCart.bind(
    prescriptionsController
  )
);

export default router;
