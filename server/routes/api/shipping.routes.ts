import { Router } from 'express';
import { shippingController } from '../../controllers/shipping.controller.js';

const router = Router();

router.post('/calculate', shippingController.calculateFreight.bind(shippingController));

export default router;
