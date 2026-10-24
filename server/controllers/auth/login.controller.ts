import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { prisma } from '../../database/client.js';
import { env } from '../../config/env.js';
import { generateTotpSecret, otpauthUri } from '../../utils/totp.js';
import { logger } from '../../utils/logger.js';
import { settingsService } from '../../services/settings.service.js';
import { verifyGoogleIdToken } from '../../services/auth/google.service.js';
import { loginSchema, verifyOtpSchema, googleLoginSchema } from '../../validators/auth.validator.js';
import {
  toProfile,
  findAdminUser,
  getActiveUser,
  verifyOtpCode,
  markLoggedIn,
} from '../../services/auth/admin.service.js';
import {
  signAccessToken,
  signPurposeToken,
  verifyPurposeToken,
} from '../../services/auth/token.service.js';

const GENERIC_LOGIN_ERROR = 'Invalid email or password';

export class LoginController {

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await findAdminUser(email);
      if (!user || !user.isActive) {
        logger.warn({ email }, 'Login attempt for unknown or inactive account');
        return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
      }

      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        logger.warn({ email }, 'Login attempt with wrong password');
        return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
      }

      const settings = await settingsService.getAll();
      const profile = toProfile(user);

      if (!settings['auth.requireOtp']) {
        await markLoggedIn(user.id);
        return res.status(200).json({
          success: true,
          data: { status: 'authenticated', token: signAccessToken(profile), user: profile },
        });
      }

      if (user.totpEnabled && user.totpSecret) {
        return res.status(200).json({
          success: true,
          data: {
            status: 'otp_required',
            otpSession: await signPurposeToken(user, 'otp'),
            user: profile,
          },
        });
      }

      let secret = user.totpSecret;
      if (!secret) {
        secret = generateTotpSecret();
        await prisma.adminUser.update({ where: { id: user.id }, data: { totpSecret: secret } });
      }

      return res.status(200).json({
        success: true,
        data: {
          status: '2fa_setup_required',
          setupToken: await signPurposeToken(user, '2fa-setup'),
          secret,
          otpauthUri: otpauthUri({
            secret,
            account: user.email,
            issuer: env.OTP_ISSUER,
            step: settings['auth.otpStepSeconds'],
            digits: settings['auth.otpLength'],
          }),
          user: profile,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { otpSession, otp } = verifyOtpSchema.parse(req.body);
      const payload = verifyPurposeToken(otpSession, 'otp');
      if (!payload) {
        return res
          .status(401)
          .json({ success: false, error: 'Invalid or expired OTP session. Please log in again.' });
      }

      const user = await getActiveUser(payload.adminId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Account unavailable' });
      }

      if (!(await verifyOtpCode(user, otp))) {
        logger.warn({ email: user.email }, 'Failed OTP verification');
        return res
          .status(401)
          .json({ success: false, error: 'Invalid OTP code. Check your authenticator app and try again.' });
      }

      await markLoggedIn(user.id);

      const profile = toProfile(user);
      return res.status(200).json({
        success: true,
        data: { token: signAccessToken(profile), user: profile },
      });
    } catch (error) {
      return next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = googleLoginSchema.parse(req.body);

      if (!env.GOOGLE_CLIENT_ID) {
        return res
          .status(503)
          .json({ success: false, error: 'Google sign-in is not configured on this server' });
      }

      const googleProfile = await verifyGoogleIdToken(credential);
      if (!googleProfile) {
        logger.warn('Google sign-in token rejected');
        return res
          .status(401)
          .json({ success: false, error: 'Google sign-in could not be verified' });
      }

      let user = await findAdminUser(googleProfile.email);
      if (user && !user.isActive) {
        return res.status(401).json({ success: false, error: GENERIC_LOGIN_ERROR });
      }

      if (!user) {
        user = await prisma.adminUser.create({
          data: {
            email: googleProfile.email,
            name: googleProfile.name,
            passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
            role: 'operator',
            avatarUrl: googleProfile.picture ?? null,
          },
        });
        logger.info({ email: googleProfile.email }, 'Provisioned account via Google sign-in');
      } else if (!user.avatarUrl && googleProfile.picture) {
        user = await prisma.adminUser.update({
          where: { id: user.id },
          data: { avatarUrl: googleProfile.picture },
        });
      }

      await markLoggedIn(user.id);
      const profile = toProfile(user);
      logger.info({ email: user.email }, 'Google sign-in succeeded');
      return res.status(200).json({
        success: true,
        data: { status: 'authenticated', token: signAccessToken(profile), user: profile },
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const loginController = new LoginController();
