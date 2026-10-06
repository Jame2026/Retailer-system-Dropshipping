import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { settingsService } from '../settings.service.js';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type TokenPurpose = 'otp' | '2fa-setup';

export interface PurposePayload {
  adminId: string;
  email: string;
  purpose: TokenPurpose;
}

/** Long-lived API token used by authAdmin (purpose must be access/absent). */
export function signAccessToken(profile: AdminProfile): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(
    { adminId: profile.id, email: profile.email, role: profile.role, purpose: 'access' },
    env.JWT_SECRET,
    options
  );
}

/**
 * Short-lived single-purpose token (OTP session or 2FA enrolment).
 * The TTL comes from the dynamic settings so it can be tuned at runtime.
 */
export async function signPurposeToken(
  user: { id: string; email: string },
  purpose: TokenPurpose
): Promise<string> {
  const settings = await settingsService.getAll();
  const ttlMinutes = purpose === 'otp' ? settings['auth.otpSessionTtlMinutes'] : 15;
  return jwt.sign({ adminId: user.id, email: user.email, purpose }, env.JWT_SECRET, {
    expiresIn: `${ttlMinutes}m`,
  });
}

/** Verify a short-lived single-purpose token; returns null when invalid. */
export function verifyPurposeToken(token: string, purpose: TokenPurpose): PurposePayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as PurposePayload;
    if (decoded.purpose !== purpose || !decoded.adminId) return null;
    return decoded;
  } catch {
    return null;
  }
}
