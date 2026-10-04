import { Router } from 'express';
import { catalogController } from '../../controllers/catalog.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

// List SKU mappings
router.get('/mappings', catalogController.getMappings.bind(catalogController));

// Upsert SKU mapping
router.post('/mappings', authAdmin, catalogController.saveMapping.bind(catalogController));

// Delete SKU mapping
router.delete('/mappings/:id', authAdmin, catalogController.deleteMapping.bind(catalogController));

// Test Pricing Formula calculation
router.post('/pricing-preview', catalogController.calculatePricePreview.bind(catalogController));

export default router;
