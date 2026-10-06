/**
 * Dynamic runtime settings.
 *
 * Defaults come from .env (see config/env.ts) and any row in the `AppSetting`
 * table overrides them at runtime — no server restart required. Values are
 * cached in-process for a short TTL to keep hot paths off the database.
 *
 * Keys are stored as JSON strings, e.g. `{"rateLimit.login.max": 5}`.
 */
import { env } from '../config/env.js';
import { prisma } from '../database/client.js';
import { logger } from '../utils/logger.js';

export interface AppSettings {
  'auth.otpLength': number;
  'auth.otpStepSeconds': number;
  'auth.otpWindowSteps': number;
  'auth.otpSessionTtlMinutes': number;
  'auth.requireOtp': boolean;
  'rateLimit.api.windowSec': number;
  'rateLimit.api.max': number;
  'rateLimit.login.windowSec': number;
  'rateLimit.login.max': number;
  'rateLimit.otp.windowSec': number;
  'rateLimit.otp.max': number;
}

export type SettingKey = keyof AppSettings;
export type SettingValue = number | boolean;

/** Pure factory for the .env-derived defaults (unit-testable without a DB). */
export function buildDefaultSettings(): AppSettings {
  return {
    'auth.otpLength': env.OTP_LENGTH,
    'auth.otpStepSeconds': env.OTP_STEP_SECONDS,
    'auth.otpWindowSteps': env.OTP_WINDOW_STEPS,
    'auth.otpSessionTtlMinutes': env.OTP_SESSION_TTL_MINUTES,
    'auth.requireOtp': env.AUTH_REQUIRE_OTP,
    'rateLimit.api.windowSec': env.RATE_LIMIT_API_WINDOW_SEC,
    'rateLimit.api.max': env.RATE_LIMIT_API_MAX,
    'rateLimit.login.windowSec': env.RATE_LIMIT_LOGIN_WINDOW_SEC,
    'rateLimit.login.max': env.RATE_LIMIT_LOGIN_MAX,
    'rateLimit.otp.windowSec': env.RATE_LIMIT_OTP_WINDOW_SEC,
    'rateLimit.otp.max': env.RATE_LIMIT_OTP_MAX,
  };
}

/** Type/range validation for values coming from the API. */
export function validateSetting(key: string, value: unknown): SettingValue {
  const isBoolKey = key === 'auth.requireOtp';
  const isNumberKey = key in buildDefaultSettings() && !isBoolKey;

  if (isBoolKey) {
    if (typeof value !== 'boolean') throw new Error(`${key} must be a boolean`);
    return value;
  }
  if (!isNumberKey) {
    throw new Error(`Unknown setting: ${key}`);
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${key} must be a number`);
  }
  if (key === 'auth.otpLength' && (value < 4 || value > 8)) {
    throw new Error('auth.otpLength must be between 4 and 8');
  }
  if (key.endsWith('.max') && (value < 1 || value > 100000)) {
    throw new Error(`${key} must be between 1 and 100000`);
  }
  if (key.endsWith('.windowSec') && (value < 10 || value > 86400)) {
    throw new Error(`${key} must be between 10 and 86400 seconds`);
  }
  if (key === 'auth.otpStepSeconds' && (value < 15 || value > 120)) {
    throw new Error('auth.otpStepSeconds must be between 15 and 120');
  }
  return value;
}

const CACHE_TTL_MS = 10_000;

class SettingsService {
  private cache: { value: AppSettings; fetchedAt: number } | null = null;

  async getAll(): Promise<AppSettings> {
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache.value;
    }

    const defaults = buildDefaultSettings();
    let merged: AppSettings = { ...defaults };

    try {
      const rows = await prisma.appSetting.findMany();
      for (const row of rows) {
        if (!(row.key in defaults)) continue;
        try {
          const parsed = JSON.parse(row.value);
          (merged as unknown as Record<string, unknown>)[row.key] = validateSetting(row.key, parsed);
        } catch {
          logger.warn({ key: row.key }, 'Ignoring malformed AppSetting row');
        }
      }
    } catch (error: any) {
      // Never let settings loading take the API down — fall back to defaults.
      logger.error({ error: error.message }, 'Failed to load AppSetting overrides');
      merged = defaults;
    }

    this.cache = { value: merged, fetchedAt: Date.now() };
    return merged;
  }

  async get<K extends SettingKey>(key: K): Promise<AppSettings[K]> {
    const all = await this.getAll();
    return all[key];
  }

  /** Persist overrides (partial merge) and refresh the cache immediately. */
  async update(overrides: Partial<Record<string, unknown>>): Promise<AppSettings> {
    const valid: Record<string, SettingValue> = {};
    for (const [key, value] of Object.entries(overrides)) {
      valid[key] = validateSetting(key, value);
    }

    for (const [key, value] of Object.entries(valid)) {
      await prisma.appSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
    }

    this.invalidate();
    logger.info({ overrides: valid }, 'Dynamic settings updated');
    return this.getAll();
  }

  invalidate(): void {
    this.cache = null;
  }
}

export const settingsService = new SettingsService();
