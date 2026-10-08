import { Router } from 'express';
import { catalogController } from '../../controllers/catalog.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

// Public Dynamic Storefront Catalog Endpoints
router.get('/products', catalogController.getStorefrontProducts.bind(catalogController));
router.get('/products/:id', catalogController.getStorefrontProductById.bind(catalogController));
router.get('/categories', catalogController.getStorefrontMeta.bind(catalogController));

// Admin SKU mappings
router.get('/mappings', catalogController.getMappings.bind(catalogController));
router.post('/mappings', authAdmin, catalogController.saveMapping.bind(catalogController));
router.delete('/mappings/:id', authAdmin, catalogController.deleteMapping.bind(catalogController));

// Test Pricing Formula calculation
router.post('/pricing-preview', catalogController.calculatePricePreview.bind(catalogController));

export default router;
