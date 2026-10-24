import { Router } from 'express';
import { reviewController } from '../../controllers/review.controller.js';

const router = Router();

router.get('/', reviewController.index.bind(reviewController));
router.get('/:id', reviewController.show.bind(reviewController));
router.post('/', reviewController.store.bind(reviewController));
router.put('/:id', reviewController.update.bind(reviewController));
router.delete('/:id', reviewController.destroy.bind(reviewController));

export default router;
