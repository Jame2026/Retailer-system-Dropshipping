import { Router } from 'express';
import orderRoutes from './api/order.routes.js';
import catalogRoutes from './api/catalog.routes.js';
import sourcingRoutes from './api/sourcing.routes.js';
import authRoutes from './api/auth.routes.js';
import shopifyWebhookRoutes from './webhooks/shopify.routes.js';
import supplierWebhookRoutes from './webhooks/supplier.routes.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Dynamic global rate limit for all API traffic (webhooks excluded so
// Shopify/CJ deliveries are never throttled).
router.use('/api', apiLimiter);

// API REST routes
router.use('/api/auth', authRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/catalog', catalogRoutes);
router.use('/api/sourcing', sourcingRoutes);

// Webhooks
router.use('/webhooks/shopify', shopifyWebhookRoutes);
router.use('/webhooks/cj', supplierWebhookRoutes);

// System health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Retailer Dropshipping Backend',
  });
});

export default router;
