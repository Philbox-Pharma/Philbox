import express from 'express';
import {
  authenticate,
  isSuperAdmin,
} from '../../../middleware/auth.middleware.js';
import { validate } from '../../../../../validator/joiValidate.middleware.js';
import {
  createDeliveryFareDTO,
  updateDeliveryFareDTO,
} from '../../../../../dto/admin/deliveryFare.dto.js';
import DeliveryFareController from '../controller/deliveryFare.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(isSuperAdmin);

router.post('/', validate(createDeliveryFareDTO), (req, res) =>
  DeliveryFareController.createFare(req, res)
);
router.get('/', (req, res) => DeliveryFareController.listFares(req, res));
router.patch('/:id', validate(updateDeliveryFareDTO), (req, res) =>
  DeliveryFareController.updateFare(req, res)
);
router.delete('/:id', (req, res) =>
  DeliveryFareController.deleteFare(req, res)
);

export default router;
