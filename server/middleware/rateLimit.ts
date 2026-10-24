import { Request, Response, NextFunction, RequestHandler } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { settingsService, AppSettings } from '../services/settings.service.js';

interface LimitConfig {
  windowSec: number;
  max: number;
}

interface LimiterCacheEntry {
  windowSec: number;
  max: number;
  limiter: RequestHandler;
}

const limiterCache = new Map<string, LimiterCacheEntry>();

function buildLimiter(name: string, config: LimitConfig, opts: { skipSuccessful: boolean; keySuffix?: (req: Request) => string }): RequestHandler {
  return rateLimit({
    windowMs: config.windowSec * 1000,
    limit: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: opts.skipSuccessful,
    keyGenerator: (req: Request) => {

      const ip = ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
      const suffix = opts.keySuffix ? opts.keySuffix(req) : '';
      return `${ip}${suffix}`;
    },
    handler: (_req: Request, res: Response) => {
      const minutes = Math.ceil(config.windowSec / 60);
      res.status(429).json({
        success: false,
        error: `Too many requests. Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      });
    },
  });
}

export function dynamicLimiter(
  name: string,
  pick: (settings: AppSettings) => LimitConfig,
  opts: { skipSuccessful?: boolean; keySuffix?: (req: Request) => string } = {}
): RequestHandler {
  const skipSuccessful = opts.skipSuccessful ?? false;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await settingsService.getAll();
      const config = pick(settings);

      let entry = limiterCache.get(name);

      if (!entry || entry.windowSec !== config.windowSec || entry.max !== config.max) {
        entry = {
          windowSec: config.windowSec,
          max: config.max,
          limiter: buildLimiter(name, config, { skipSuccessful, keySuffix: opts.keySuffix }),
        };
        limiterCache.set(name, entry);
      }

      return entry.limiter(req, res, next);
    } catch (error) {

      return next();
    }
  };
}

export const apiLimiter = dynamicLimiter('api', (s) => ({
  windowSec: s['rateLimit.api.windowSec'],
  max: s['rateLimit.api.max'],
}));

export const loginLimiter = dynamicLimiter(
  'login',
  (s) => ({ windowSec: s['rateLimit.login.windowSec'], max: s['rateLimit.login.max'] }),
  {
    skipSuccessful: true,
    keySuffix: (req) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
      return `|${email}`;
    },
  }
);

export const otpLimiter = dynamicLimiter(
  'otp',
  (s) => ({ windowSec: s['rateLimit.otp.windowSec'], max: s['rateLimit.otp.max'] }),
  { skipSuccessful: true }
);

export const passwordLimiter = dynamicLimiter(
  'password',
  (s) => ({ windowSec: s['rateLimit.login.windowSec'], max: s['rateLimit.login.max'] }),
  {
    skipSuccessful: true,
    keySuffix: (req) => {
      const bodyEmail = typeof req.body?.email === 'string' ? req.body.email : '';
      const userEmail =
        typeof (req as { user?: { email?: string } }).user?.email === 'string'
          ? (req as { user?: { email?: string } }).user!.email!
          : '';
      return `|${(bodyEmail || userEmail).toLowerCase()}`;
    },
  }
);
