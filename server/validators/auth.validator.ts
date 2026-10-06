import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Valid email is required').max(254),
  password: z.string().min(1, 'Password is required').max(200),
});

/** 4-8 digit code; exact length is enforced against the configured OTP length. */
const otpCodeSchema = z.string().regex(/^\d{4,8}$/, 'OTP must be a 4-8 digit code');

export const verifyOtpSchema = z.object({
  otpSession: z.string().min(1, 'OTP session is required'),
  otp: otpCodeSchema,
});

export const setup2faSchema = z.object({
  setupToken: z.string().min(1, 'Setup token is required'),
});

export const enable2faSchema = z.object({
  setupToken: z.string().min(1, 'Setup token is required'),
  otp: otpCodeSchema,
});

export const disable2faSchema = z.object({
  otp: otpCodeSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(200),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(200)
      .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), {
        message: 'New password must contain letters and numbers',
      }),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'New password must differ from the current password',
    path: ['newPassword'],
  });

/** Recovery path for a lost authenticator device — password re-verification. */
export const reset2faSchema = z.object({
  password: z.string().min(1, 'Password is required').max(200),
});

/** Whitelisted, typed dynamic settings that superadmins may change at runtime. */
export const updateSettingsSchema = z
  .object({
    'auth.otpLength': z.number().int().min(4).max(8),
    'auth.otpStepSeconds': z.number().int().min(15).max(120),
    'auth.otpWindowSteps': z.number().int().min(0).max(2),
    'auth.otpSessionTtlMinutes': z.number().int().min(1).max(30),
    'auth.requireOtp': z.boolean(),
    'rateLimit.api.windowSec': z.number().int().min(10).max(86400),
    'rateLimit.api.max': z.number().int().min(1).max(100000),
    'rateLimit.login.windowSec': z.number().int().min(10).max(86400),
    'rateLimit.login.max': z.number().int().min(1).max(100000),
    'rateLimit.otp.windowSec': z.number().int().min(10).max(86400),
    'rateLimit.otp.max': z.number().int().min(1).max(100000),
  })
  .strict()
  .partial();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
