import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';
import { settingsService } from '../../services/settings.service.js';
import { updateSettingsSchema } from '../../validators/auth.validator.js';
import { AuthenticatedRequest } from '../../middleware/authAdmin.js';

export class SettingsController {

  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getAll();
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user!.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: 'Superadmin role required' });
      }

      const overrides = updateSettingsSchema.parse(req.body);
      if (Object.keys(overrides).length === 0) {
        return res.status(400).json({ success: false, error: 'No settings provided' });
      }

      const settings = await settingsService.update(overrides);
      logger.info({ by: req.user!.email, overrides }, 'Dynamic settings changed via API');
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return next(error);
    }
  }
}

export const settingsController = new SettingsController();
