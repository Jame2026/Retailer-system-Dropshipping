import { Router } from 'express';
import { couponController } from '../../controllers/coupon.controller.js';

const router = Router();

router.get('/', couponController.index.bind(couponController));
router.get('/:id', couponController.show.bind(couponController));
router.post('/', couponController.store.bind(couponController));
router.put('/:id', couponController.update.bind(couponController));
router.delete('/:id', couponController.destroy.bind(couponController));

export default router;
