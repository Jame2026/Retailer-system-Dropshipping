import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface AdminAuthPayload {
  adminId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AdminAuthPayload;
}

export function authAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Bearer token missing.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminAuthPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    logger.warn({ error }, 'Admin token verification failed');
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token',
    });
  }
}
