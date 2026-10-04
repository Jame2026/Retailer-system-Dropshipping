import { Router } from 'express';
import { webhookController } from '../../controllers/webhook.controller.js';

const router = Router();

// /webhooks/cj (real-time package status and logistics callbacks)
router.post('/cj', webhookController.handleSupplierWebhook.bind(webhookController));

export default router;
