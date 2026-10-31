import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database/client.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { settingsService } from '../../services/settings.service.js';
import { generateTotpSecret, otpauthUri } from '../../utils/totp.js';
import {
  setup2faSchema,
  enable2faSchema,
  disable2faSchema,
  reset2faSchema,
} from '../../validators/auth.validator.js';
import { AuthenticatedRequest } from '../../middleware/authAdmin.js';
import {
  toProfile,
  getActiveUser,
  verifyOtpCode,
  invalidateProfileCache,
} from '../../services/auth/admin.service.js';
import {
  signAccessToken,
  signPurposeToken,
  verifyPurposeToken,
} from '../../services/auth/token.service.js';

const ALREADY_ENABLED = 'Two-factor authentication is already enabled';
const INVALID_SETUP = 'Invalid or expired setup session';

export class TwoFactorController {

  async setup2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const { setupToken } = setup2faSchema.parse(req.body);
      const payload = verifyPurposeToken(setupToken, '2fa-setup');
      if (!payload) {
        return res.status(401).json({ success: false, error: INVALID_SETUP });
      }

      const user = await getActiveUser(payload.adminId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Account unavailable' });
      }
      if (user.totpEnabled) {
        return res.status(409).json({ success: false, error: ALREADY_ENABLED });
      }

      const settings = await settingsService.getAll();
      const secret = generateTotpSecret();
      await prisma.adminUser.update({ where: { id: user.id }, data: { totpSecret: secret } });

      return res.status(200).json({
        success: true,
        data: {
          secret,
          otpauthUri: otpauthUri({
            secret,
            account: user.email,
            issuer: env.OTP_ISSUER,
            step: settings['auth.otpStepSeconds'],
            digits: settings['auth.otpLength'],
          }),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async enable2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const { setupToken, otp } = enable2faSchema.parse(req.body);
      const payload = verifyPurposeToken(setupToken, '2fa-setup');
      if (!payload) {
        return res.status(401).json({ success: false, error: INVALID_SETUP });
      }

      const user = await getActiveUser(payload.adminId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Account unavailable' });
      }
      if (user.totpEnabled) {
        return res.status(409).json({ success: false, error: ALREADY_ENABLED });
      }

      if (!(await verifyOtpCode(user, otp))) {
        logger.warn({ email: user.email }, 'Failed 2FA enrolment code');
        return res
          .status(401)
          .json({ success: false, error: 'Invalid OTP code. Check your authenticator app and try again.' });
      }

      await prisma.adminUser.update({
        where: { id: user.id },
        data: { totpEnabled: true, lastLoginAt: new Date() },
      });
      invalidateProfileCache(user.id);

      const profile = toProfile(user);
      logger.info({ email: user.email }, 'Two-factor authentication enabled');
      return res.status(200).json({
        success: true,
        data: { token: signAccessToken(profile), user: profile },
      });
    } catch (error) {
      return next(error);
    }
  }

  async disable2fa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { otp } = disable2faSchema.parse(req.body);
      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      if (!(await verifyOtpCode(user, otp))) {
        return res.status(401).json({ success: false, error: 'Invalid OTP code' });
      }

      await prisma.adminUser.update({
        where: { id: user.id },
        data: { totpEnabled: false, totpSecret: null },
      });
      invalidateProfileCache(user.id);
      logger.info({ email: user.email }, 'Two-factor authentication disabled');
      return res.status(200).json({ success: true, message: 'Two-factor authentication disabled' });
    } catch (error) {
      return next(error);
    }
  }

  async reset2fa(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { password } = reset2faSchema.parse(req.body);

      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) return res.status(404).json({ success: false, error: 'Account not found' });

      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        logger.warn({ email: user.email }, '2FA reset attempt with wrong password');
        return res.status(401).json({ success: false, error: 'Password is incorrect' });
      }
      if (!user.totpEnabled && !user.totpSecret) {
        return res.status(400).json({ success: false, error: 'Two-factor authentication is not configured' });
      }
      await prisma.adminUser.update({ where: { id: user.id }, data: { totpEnabled: false, totpSecret: null } });
      invalidateProfileCache(user.id);
      logger.warn({ email: user.email }, 'Two-factor authentication reset via password');
      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication reset. Set it up again at your next login.',
      });
    } catch (error) {
      return next(error);
    }
  }

  async initiateSetup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }
      if (user.totpEnabled) {
        return res.status(409).json({ success: false, error: ALREADY_ENABLED });
      }
      const setupToken = await signPurposeToken(user, '2fa-setup');
      const settings = await settingsService.getAll();
      const secret = generateTotpSecret();
      await prisma.adminUser.update({ where: { id: user.id }, data: { totpSecret: secret } });
      return res.status(200).json({
        success: true,
        data: {
          setupToken,
          secret,
          otpauthUri: otpauthUri({
            secret,
            account: user.email,
            issuer: env.OTP_ISSUER,
            step: settings['auth.otpStepSeconds'],
            digits: settings['auth.otpLength'],
          }),
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const twoFactorController = new TwoFactorController();
