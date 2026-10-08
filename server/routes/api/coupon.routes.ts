import { Router } from 'express';
import { couponController } from '../../controllers/coupon.controller.js';

const router = Router();

// RESTful Resource Routes (like Route::resource in Laravel)
router.get('/', couponController.index.bind(couponController));
router.get('/:id', couponController.show.bind(couponController));
router.post('/', couponController.store.bind(couponController));
router.put('/:id', couponController.update.bind(couponController));
router.delete('/:id', couponController.destroy.bind(couponController));

export default router;
