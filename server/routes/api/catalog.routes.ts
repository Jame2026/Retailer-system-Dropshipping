import { Router } from 'express';
import { catalogController } from '../../controllers/catalog.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

router.get('/products', catalogController.getStorefrontProducts.bind(catalogController));
router.get('/products/:id', catalogController.getStorefrontProductById.bind(catalogController));
router.get('/categories', catalogController.getStorefrontMeta.bind(catalogController));

router.get('/mappings', catalogController.getMappings.bind(catalogController));
router.post('/mappings', authAdmin, catalogController.saveMapping.bind(catalogController));
router.delete('/mappings/:id', authAdmin, catalogController.deleteMapping.bind(catalogController));

router.post('/pricing-preview', catalogController.calculatePricePreview.bind(catalogController));
router.get('/pricing-rules', catalogController.getPricingRules.bind(catalogController));
router.post('/pricing-rules', authAdmin, catalogController.savePricingRules.bind(catalogController));

export default router;
