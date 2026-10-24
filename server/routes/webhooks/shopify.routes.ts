import { Router } from 'express';
import { webhookController } from '../../controllers/webhook.controller.js';
import { verifyShopifyHmac } from '../../middleware/verifyShopifyHmac.js';

const router = Router();

router.post('/orders-paid', verifyShopifyHmac, webhookController.handleShopifyOrder.bind(webhookController));

router.post('/orders-cancelled', verifyShopifyHmac, webhookController.handleShopifyCancelled.bind(webhookController));

export default router;
