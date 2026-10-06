/**
 * Rate limiting driven by the dynamic settings service.
 *
 * Limits are read from AppSetting (falling back to .env) on every request, so
 * changing a value through `PUT /api/auth/settings` takes effect immediately —
 * no restart. The underlying express-rate-limit instance is rebuilt only when
 * its window changes.
 */
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
      // ipKeyGenerator keeps IPv6 clients bucketed by subnet (express-rate-limit v8 validation).
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

/**
 * Create (and memoize) a limiter whose `max` is re-read from settings on
 * every request and whose window is rebuilt when the setting changes.
 */
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
      // Rebuild whenever either window OR max changed at runtime, otherwise
      // a `max`-only settings update would never reach express-rate-limit.
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
      // If settings are unreachable, fail open rather than blocking the API.
      return next();
    }
  };
}

/** Global limiter for all /api traffic, keyed by IP. */
export const apiLimiter = dynamicLimiter('api', (s) => ({
  windowSec: s['rateLimit.api.windowSec'],
  max: s['rateLimit.api.max'],
}));

/** Login attempts, keyed by IP + email so one attacker can't burn everyone's quota. */
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

/** OTP verification attempts, keyed by IP + session subject. */
export const otpLimiter = dynamicLimiter(
  'otp',
  (s) => ({ windowSec: s['rateLimit.otp.windowSec'], max: s['rateLimit.otp.max'] }),
  { skipSuccessful: true }
);

/**
 * Password-changing endpoints (change password / reset 2FA). Shares the
 * login budget so repeated password guessing is throttled the same way.
 * Mounted after authAdmin, so the authenticated email is part of the key.
 */
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
