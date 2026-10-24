import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

router.get('/', orderController.getOrders.bind(orderController));

router.get('/:id', orderController.getOrderById.bind(orderController));

router.post('/override', authAdmin, orderController.manualOverride.bind(orderController));

router.post('/:id/retry', authAdmin, orderController.retryOrder.bind(orderController));

export default router;
