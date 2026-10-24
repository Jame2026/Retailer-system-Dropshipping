import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const boolFromEnv = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((v) =>
      v === undefined || v === '' ? defaultValue : !['false', '0', 'no', 'off'].includes(v.toLowerCase())
    );

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:4000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  SHOPIFY_SHOP_DOMAIN: z.string().min(1, 'SHOPIFY_SHOP_DOMAIN is required'),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().min(1, 'SHOPIFY_ADMIN_ACCESS_TOKEN is required'),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1, 'SHOPIFY_WEBHOOK_SECRET is required'),
  SHOPIFY_API_VERSION: z.string().default('2024-01'),

  CJ_API_EMAIL: z.string().email().optional().or(z.literal('')),
  CJ_API_KEY: z.string().min(1, 'CJ_API_KEY is required'),
  CJ_BASE_URL: z.string().url().default('https://developers.cjdropshipping.com/api2.0/v1'),

  ZENDROP_API_KEY: z.string().optional().or(z.literal('')),
  ZENDROP_BASE_URL: z.string().url().default('https://api.zendrop.com/v1'),

  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  HOLD_BUFFER_HOURS: z.coerce.number().default(6),
  DEFAULT_MARKUP_MULTIPLIER: z.coerce.number().default(2.5),
  DEFAULT_SHIPPING_BUFFER_USD: z.coerce.number().default(3.0),

  OTP_ISSUER: z.string().default('Retailer Dropshipping Admin'),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  OTP_STEP_SECONDS: z.coerce.number().int().min(15).max(120).default(30),
  OTP_WINDOW_STEPS: z.coerce.number().int().min(0).max(2).default(1),
  OTP_SESSION_TTL_MINUTES: z.coerce.number().int().min(1).max(30).default(5),
  AUTH_REQUIRE_OTP: boolFromEnv(true),

  RATE_LIMIT_API_WINDOW_SEC: z.coerce.number().int().default(900),
  RATE_LIMIT_API_MAX: z.coerce.number().int().default(600),
  RATE_LIMIT_LOGIN_WINDOW_SEC: z.coerce.number().int().default(900),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().default(8),
  RATE_LIMIT_OTP_WINDOW_SEC: z.coerce.number().int().default(900),
  RATE_LIMIT_OTP_MAX: z.coerce.number().int().default(6),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(parsedEnv.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsedEnv.data;
