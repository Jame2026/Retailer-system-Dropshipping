import { Router } from 'express';
import { webhookController } from '../../controllers/webhook.controller.js';

const router = Router();

router.post('/', webhookController.handleSupplierWebhook.bind(webhookController));
router.post('/cj', webhookController.handleSupplierWebhook.bind(webhookController));

export default router;
