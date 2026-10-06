import { Router } from 'express';
import {
  loginController,
  twoFactorController,
  accountController,
  settingsController,
} from '../../controllers/auth/index.js';
import { authAdmin } from '../../middleware/authAdmin.js';
import { loginLimiter, otpLimiter, passwordLimiter } from '../../middleware/rateLimit.js';

const router = Router();

// Dynamic configuration (public read; superadmin write)
router.get('/settings', settingsController.getSettings.bind(settingsController));
router.put('/settings', authAdmin, settingsController.updateSettings.bind(settingsController));

// Login flow
router.post('/login', loginLimiter, loginController.login.bind(loginController));
router.post('/verify-otp', otpLimiter, loginController.verifyOtp.bind(loginController));

// Two-factor enrolment / recovery
router.post('/2fa/setup', twoFactorController.setup2fa.bind(twoFactorController));
router.post('/2fa/enable', otpLimiter, twoFactorController.enable2fa.bind(twoFactorController));
router.post('/2fa/disable', authAdmin, otpLimiter, twoFactorController.disable2fa.bind(twoFactorController));
router.post('/2fa/reset', authAdmin, passwordLimiter, twoFactorController.reset2fa.bind(twoFactorController));

// Session & account management
router.get('/me', authAdmin, accountController.me.bind(accountController));
router.post(
  '/change-password',
  authAdmin,
  passwordLimiter,
  accountController.changePassword.bind(accountController)
);

export default router;
