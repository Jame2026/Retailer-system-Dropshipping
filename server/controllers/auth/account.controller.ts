import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database/client.js';
import { logger } from '../../utils/logger.js';
import {
  changePasswordSchema,
  updateAvatarSchema,
  updateProfileSchema,
} from '../../validators/auth.validator.js';
import { AuthenticatedRequest } from '../../middleware/authAdmin.js';
import { getCachedProfile, invalidateProfileCache } from '../../services/auth/admin.service.js';

function publicProfile(profile: Awaited<ReturnType<typeof getCachedProfile>>) {
  if (!profile) return null;
  const { isActive: _isActive, ...data } = profile;
  return data;
}

export class AccountController {

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cached = await getCachedProfile(req.user!.adminId);
      if (!cached || !cached.isActive) {
        invalidateProfileCache(req.user!.adminId);
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      const { isActive: _isActive, ...data } = cached;
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!currentOk) {
        logger.warn({ email: user.email }, 'Change-password attempt with wrong current password');
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });
      invalidateProfileCache(user.id);
      logger.info({ email: user.email }, 'Admin password changed');

      return res.status(200).json({
        success: true,
        message: 'Password updated. Existing sessions stay valid until they expire.',
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { avatarUrl } = updateAvatarSchema.parse(req.body);

      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      await prisma.adminUser.update({ where: { id: user.id }, data: { avatarUrl } });
      invalidateProfileCache(user.id);
      logger.info({ email: user.email }, 'Profile avatar updated');

      const profile = publicProfile(await getCachedProfile(user.id));
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      if (!user.avatarUrl) {
        return res.status(400).json({ success: false, error: 'No profile picture to remove' });
      }

      await prisma.adminUser.update({ where: { id: user.id }, data: { avatarUrl: null } });
      invalidateProfileCache(user.id);
      logger.info({ email: user.email }, 'Profile avatar removed');

      const profile = publicProfile(await getCachedProfile(user.id));
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name } = updateProfileSchema.parse(req.body);

      const user = await prisma.adminUser.findUnique({ where: { id: req.user!.adminId } });
      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      await prisma.adminUser.update({ where: { id: user.id }, data: { name } });
      invalidateProfileCache(user.id);
      logger.info({ email: user.email, name }, 'Admin profile updated');

      const profile = publicProfile(await getCachedProfile(user.id));
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return next(error);
    }
  }
}

export const accountController = new AccountController();
