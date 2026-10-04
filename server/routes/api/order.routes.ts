import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

// Order listing & search
router.get('/', orderController.getOrders.bind(orderController));

// Order details inspection
router.get('/:id', orderController.getOrderById.bind(orderController));

// Admin manual overrides (requires auth in production)
router.post('/override', authAdmin, orderController.manualOverride.bind(orderController));

// Manual retry dispatch
router.post('/:id/retry', authAdmin, orderController.retryOrder.bind(orderController));

export default router;
