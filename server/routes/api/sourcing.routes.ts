import { Router } from 'express';
import { sourcingController } from '../../controllers/sourcing.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

router.post('/request', authAdmin, sourcingController.submitSourcingRequest.bind(sourcingController));

router.get('/cj/products', sourcingController.listCjProducts.bind(sourcingController));
router.get('/cj/categories', sourcingController.getCjCategories.bind(sourcingController));
router.get('/cj/warehouses', sourcingController.getCjWarehouses.bind(sourcingController));
router.get('/cj/product/:pid', sourcingController.getSupplierProductDetails.bind(sourcingController));

router.get('/search', sourcingController.searchSupplierCatalog.bind(sourcingController));

router.get('/product/:pid', sourcingController.getSupplierProductDetails.bind(sourcingController));

export default router;
