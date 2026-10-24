import { Router } from 'express';
import {
  loginController,
  twoFactorController,
  accountController,
  settingsController,
} from '../../controllers/auth/index.js';
import { AuthController } from '../../controllers/auth.controller.js';
import { authAdmin } from '../../middleware/authAdmin.js';
import { loginLimiter, otpLimiter, passwordLimiter } from '../../middleware/rateLimit.js';

const router = Router();

router.get('/settings', settingsController.getSettings.bind(settingsController));
router.put('/settings', authAdmin, settingsController.updateSettings.bind(settingsController));

router.post('/login', loginLimiter, loginController.login.bind(loginController));
router.post('/google', loginLimiter, loginController.googleLogin.bind(loginController));
router.post('/verify-otp', otpLimiter, loginController.verifyOtp.bind(loginController));

router.post('/2fa/setup', twoFactorController.setup2fa.bind(twoFactorController));
router.post('/2fa/enable', otpLimiter, twoFactorController.enable2fa.bind(twoFactorController));
router.post('/2fa/disable', authAdmin, otpLimiter, twoFactorController.disable2fa.bind(twoFactorController));
router.post('/2fa/reset', authAdmin, passwordLimiter, twoFactorController.reset2fa.bind(twoFactorController));

router.get('/me', authAdmin, accountController.me.bind(accountController));
router.put('/avatar', authAdmin, accountController.updateAvatar.bind(accountController));
router.delete('/avatar', authAdmin, accountController.deleteAvatar.bind(accountController));
router.post(
  '/change-password',
  authAdmin,
  passwordLimiter,
  accountController.changePassword.bind(accountController)
);

router.post('/register', loginLimiter, AuthController.register);
router.get('/users', authAdmin, AuthController.listUsers);

export default router;
