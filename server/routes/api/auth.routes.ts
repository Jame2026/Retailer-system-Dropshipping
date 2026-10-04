import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';

const router = Router();

// Public auth endpoints
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected admin auth endpoints
router.get('/me', authAdmin, AuthController.getMe);
router.get('/users', authAdmin, AuthController.listUsers);

export default router;
