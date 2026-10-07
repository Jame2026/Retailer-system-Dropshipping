import { Router } from 'express';
import { sourcingController } from '../../controllers/sourcing.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

// 1-Click product sourcing query submission
router.post('/request', authAdmin, sourcingController.submitSourcingRequest.bind(sourcingController));

// Live CJ Dropshipping API Endpoints
router.get('/cj/products', sourcingController.listCjProducts.bind(sourcingController));
router.get('/cj/categories', sourcingController.getCjCategories.bind(sourcingController));
router.get('/cj/warehouses', sourcingController.getCjWarehouses.bind(sourcingController));
router.get('/cj/product/:pid', sourcingController.getSupplierProductDetails.bind(sourcingController));

// Search supplier catalog for import
router.get('/search', sourcingController.searchSupplierCatalog.bind(sourcingController));

// Get supplier product details
router.get('/product/:pid', sourcingController.getSupplierProductDetails.bind(sourcingController));

export default router;
