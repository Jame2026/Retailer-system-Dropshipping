import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/client.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../middleware/authAdmin.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Lookup admin user in Supabase PostgreSQL
      const user = await (prisma as any).adminUser.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. User not found in database.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'This account has been deactivated.',
        });
      }

      // Verify bcrypt password hash
      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password. Please check your credentials.',
        });
      }

      // Update last login timestamp in Supabase
      await (prisma as any).adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Sign JWT with system secret
      const token = jwt.sign(
        {
          adminId: user.id,
          email: user.email,
          role: user.role,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info({ email: user.email, role: user.role }, 'Admin successfully authenticated against database');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Error during admin login');
      return next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await (prisma as any).adminUser.findUnique({
        where: { id: req.user.adminId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({ success: false, error: 'Admin user not found' });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await (prisma as any).adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await (prisma as any).adminUser.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists in the database',
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = await (prisma as any).adminUser.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          role: role || 'operator',
          isActive: true,
        },
      });

      const token = jwt.sign(
        {
          adminId: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
